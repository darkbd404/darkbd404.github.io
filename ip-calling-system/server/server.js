require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*", methods: ["GET", "POST"] } });

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/auth', require('./routes/authRoutes'));

// NEW: API to get all users for the dashboard
app.get('/api/users', async (req, res) => {
    try {
        const DB_PATH = path.join(__dirname, 'database/user.json');
        const data = await fs.readFile(DB_PATH, 'utf8');
        const users = JSON.parse(data);
        // Remove passwords before sending to frontend
        const safeUsers = users.map(({ password, ...u }) => u);
        res.json(safeUsers);
    } catch (e) {
        res.status(500).json({ message: "Failed to load users" });
    }
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// SOCKET.IO & WEBRTC SIGNALING
const userSocketMap = {}; 
const DB_PATH = path.join(__dirname, 'database/user.json');

async function updateUserStatus(userId, updates) {
    try {
        const data = await fs.readFile(DB_PATH, 'utf8');
        const users = JSON.parse(data);
        const idx = users.findIndex(u => u.id === userId);
        if (idx !== -1) {
            users[idx] = { ...users[idx], ...updates };
            await fs.writeFile(DB_PATH, JSON.stringify(users, null, 2));
        }
    } catch (e) { console.error("DB Update Error:", e); }
}

io.on('connection', (socket) => {
    socket.on('join', async ({ userId }) => {
        socket.userId = userId;
        userSocketMap[userId] = socket.id;
        await updateUserStatus(userId, { online: true, socketId: socket.id });
        io.emit('user-status', { userId, online: true });
    });

    socket.on('call-user', ({ targetUserId, offer, callerId }) => {
        const targetSocketId = userSocketMap[targetUserId];
        if (targetSocketId) io.to(targetSocketId).emit('incoming-call', { offer, callerId });
        else socket.emit('call-error', { message: "User is offline" });
    });

    socket.on('answer-call', ({ targetUserId, answer }) => {
        const targetSocketId = userSocketMap[targetUserId];
        if (targetSocketId) io.to(targetSocketId).emit('call-answered', { answer });
    });

    socket.on('ice-candidate', ({ targetUserId, candidate }) => {
        const targetSocketId = userSocketMap[targetUserId];
        if (targetSocketId) io.to(targetSocketId).emit('ice-candidate', { candidate });
    });

    socket.on('end-call', ({ targetUserId }) => {
        if (targetUserId) {
            const targetSocketId = userSocketMap[targetUserId];
            if (targetSocketId) io.to(targetSocketId).emit('call-ended');
        }
    });

    socket.on('disconnect', async () => {
        if (socket.userId) {
            delete userSocketMap[socket.userId];
            await updateUserStatus(socket.userId, { online: false, socketId: null });
            io.emit('user-status', { userId: socket.userId, online: false });
        }
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
