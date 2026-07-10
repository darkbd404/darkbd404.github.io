const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } });

app.use(express.json());
app.use(express.static(path.join(__dirname, '/')));

const USERS_FILE = path.join(__dirname, 'users.json');

// Helper functions to read/write JSON database
function readUsers() {
    if (!fs.existsSync(USERS_FILE)) return {};
    try {
        return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
    } catch (e) {
        return {};
    }
}

function writeUsers(data) {
    fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2));
}

// Active Socket Connections
let activeConnections = {};

// HTTP API for Login / Registration
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    let users = readUsers();

    if (users[username]) {
        if (users[username].password === password) {
            return res.json({ success: true, balance: users[username].balance || "0.00" });
        } else {
            return res.json({ success: false, message: "Wrong password!" });
        }
    } else {
        // Automatically register if user doesn't exist (Simple Flow)
        users[username] = { password: password, balance: "10.00" };
        writeUsers(users);
        return res.json({ success: true, balance: "10.00", message: "Account created!" });
    }
});

// Socket.io WebRTC & Call Control Signaling
io.on('connection', (socket) => {
    console.log('Device connected:', socket.id);

    socket.on('register-active-user', (username) => {
        socket.username = username;
        activeConnections[username] = socket.id;
        io.emit('update-online-users', Object.keys(activeConnections));
    });

    // App-to-App Call Flow
    socket.on('call-request', (data) => {
        const targetSocket = activeConnections[data.target];
        if (targetSocket) {
            io.to(targetSocket).emit('incoming-call', {
                from: data.from,
                offer: data.offer
            });
        } else {
            socket.emit('call-error', { message: "Target offline. Routing to VoIP standard mobile network..." });
        }
    });

    socket.on('call-accept', (data) => {
        const targetSocket = activeConnections[data.target];
        if (targetSocket) {
            io.to(targetSocket).emit('call-connected', { answer: data.answer });
        }
    });

    socket.on('ice-candidate', (data) => {
        const targetSocket = activeConnections[data.target];
        if (targetSocket) {
            io.to(targetSocket).emit('ice-candidate', { candidate: data.candidate });
        }
    });

    socket.on('disconnect', () => {
        if (socket.username) {
            delete activeConnections[socket.username];
            io.emit('update-online-users', Object.keys(activeConnections));
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
