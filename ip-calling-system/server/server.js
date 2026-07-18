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

// GET ALL USERS FOR CONTACTS & DIALING
app.get('/api/users', async (req, res) => {
    try {
        const DB_PATH = path.join(__dirname, 'database/user.json');
        const data = await fs.readFile(DB_PATH, 'utf8');
        const users = JSON.parse(data);
        const safeUsers = users.map(({ password, ...u }) => u);
        res.json(safeUsers);
    } catch (e) { res.status(500).json({ message: "Error loading users" }); }
});

app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

// SOCKET.IO LOGIC
const userSocketMap = {}; 
const ipToUserIdMap = {}; // Map IP Number to UserID
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
    } catch (e) { console.error("DB Error:", e); }
}

io.on('connection', (socket) => {
    socket.on('join', async ({ userId, ipNumber }) => {
        socket.userId = userId;
        userSocketMap[userId] = socket.id;
        ipToUserIdMap[ipNumber] = userId; // Store IP mapping
        
        await updateUserStatus(userId, { online: true, socketId: socket.id });
        io.emit('user-status', { userId, online: true });
    });

    // CALL BY IP NUMBER
    socket.on('call-ip', ({ targetIp, offer, callerId, callerName }) => {
        const targetUserId = ipToUserIdMap[targetIp];
        if (targetUserId && userSocketMap[targetUserId]) {
            io.to(userSocketMap[targetUserId]).emit('incoming-call', { 
                offer, callerId, callerName, callerIp: targetIp 
            });
        } else {
            socket.emit('call-error', { message: "User offline or invalid IP" });
        }
    });

    socket.on('answer-call', ({ targetUserId, answer }) => {
        if (userSocketMap[targetUserId]) io.to(userSocketMap[targetUserId]).emit('call-answered', { answer });
    });

    socket.on('ice-candidate', ({ targetUserId, candidate }) => {
        if (userSocketMap[targetUserId]) io.to(userSocketMap[targetUserId]).emit('ice-candidate', { candidate });
    });

    socket.on('end-call', ({ targetUserId }) => {
        if (targetUserId && userSocketMap[targetUserId]) io.to(userSocketMap[targetUserId]).emit('call-ended');
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
