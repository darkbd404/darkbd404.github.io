const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000; 
const USERS_FILE = path.join(__dirname, 'users.json');

const ADMIN_USER = "salam";
const ADMIN_PASS = "864";

app.use(express.json());
app.use(express.static(path.join(__dirname)));

function loadUsers() {
    if (!fs.existsSync(USERS_FILE)) return [];
    try { return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8')); } 
    catch (e) { return []; }
}

function saveUsers(users) {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

if (!fs.existsSync(USERS_FILE)) saveUsers([]);

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (username === ADMIN_USER && password === ADMIN_PASS) {
        return res.json({ success: true, role: 'admin', name: 'Administrator' });
    }
    const users = loadUsers();
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        return res.json({ success: true, role: 'user', name: user.name, username: user.username });
    }
    return res.json({ success: false, message: 'Invalid credentials' });
});

app.post('/api/manage-user', (req, res) => {
    const { action, username, password, name, oldUsername } = req.body;
    let users = loadUsers();

    if (action === 'add') {
        if (users.find(u => u.username === username)) return res.json({ success: false, message: 'Exists!' });
        users.push({ username, password, name, created: new Date().toISOString() });
    } else if (action === 'edit') {
        const index = users.findIndex(u => u.username === oldUsername);
        if (index !== -1) users[index] = { username, password, name, created: users[index].created || new Date().toISOString() };
    } else if (action === 'delete') {
        users = users.filter(u => u.username !== username);
    }
    saveUsers(users);
    res.json({ success: true });
});

app.get('/api/users', (req, res) => res.json(loadUsers()));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

// --- WEBRTC GLOABAL SIGNALING LAYER ---
io.on('connection', (socket) => {
    socket.on('register_user', (data) => {
        socket.userData = data;
    });

    socket.on('call_offer', (data) => {
        const receiver = Array.from(io.sockets.sockets.values()).find(s => s.userData && s.userData.username === data.targetUsername);
        if (receiver) {
            receiver.emit('incoming_call', {
                callerName: data.callerName,
                callerUsername: data.callerUsername,
                callerSocketId: socket.id, 
                offer: data.offer
            });
        } else {
            socket.emit('call_error', { message: `Extension ${data.targetUsername} is offline.` });
        }
    });

    socket.on('call_answer', (data) => {
        io.to(data.callerSocketId).emit('call_accepted', { answer: data.answer, responderUi: socket.id });
    });

    socket.on('ice_candidate', (data) => {
        const target = Array.from(io.sockets.sockets.values()).find(s => s.userData && s.userData.username === data.targetUsername);
        if (target) {
            target.emit('ice_candidate_received', { candidate: data.candidate });
        }
    });

    // ফিচার টগল সিগন্যাল (ভিডিও অন/অফ, মিউট সিঙ্ক)
    socket.on('feature_toggle', (data) => {
        const target = Array.from(io.sockets.sockets.values()).find(s => s.userData && s.userData.username === data.targetUsername);
        if (target) target.emit('feature_updated', data);
    });

    socket.on('hangup', (data) => {
        if(data && data.targetUsername) {
            const target = Array.from(io.sockets.sockets.values()).find(s => s.userData && s.userData.username === data.targetUsername);
            if(target) target.emit('call_disconnected');
        }
        socket.broadcast.emit('call_disconnected');
    });

    socket.on('disconnect', () => {});
});

http.listen(PORT, '0.0.0.0', () => console.log(`Server live on ${PORT}`));
