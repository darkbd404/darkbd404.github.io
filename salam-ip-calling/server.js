const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, { cors: { origin: "*" }, maxHttpBufferSize: 1e7 }); // ১০ মেগাবাইট পর্যন্ত ইমেজ আপলোড সাপোর্ট
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const USERS_FILE = path.join(__dirname, 'users.json');

const ADMIN_USER = "salam";
const ADMIN_PASS = "864";

app.use(express.json());
app.use(express.static(__dirname));

function loadUsersFromFile() {
    if (!fs.existsSync(USERS_FILE)) return [];
    try { return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8')); } catch (e) { return []; }
}

function saveUsersToFile(users) {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// লগইন এপিআই
app.post('/api/login', (req, res) => {
    const username = String(req.body.username).trim();
    const password = String(req.body.password).trim();

    if (username === ADMIN_USER && password === ADMIN_PASS) {
        return res.json({ success: true, role: 'admin', name: 'Administrator', username: ADMIN_USER });
    }

    const users = loadUsersFromFile();
    const matchedUser = users.find(u => String(u.username).trim() === username && String(u.password).trim() === password);
    
    if (matchedUser) {
        return res.json({ 
            success: true, 
            role: 'user', 
            name: matchedUser.name, 
            username: matchedUser.username,
            ipNumber: matchedUser.ipNumber || `IP-${matchedUser.username}`,
            callNumber: matchedUser.callNumber || matchedUser.username
        });
    }
    return res.json({ success: false, message: 'Invalid Username or Password' });
});

// ইউজার ম্যানেজমেন্ট এপিআই (শুধু অ্যাডমিনের জন্য)
app.post('/api/manage-user', (req, res) => {
    const { action, username, password, name, oldUsername, ipNumber, callNumber } = req.body;
    let users = loadUsersFromFile();

    if (action === 'add') {
        if (users.find(u => u.username === username)) return res.json({ success: false, message: 'User already exists!' });
        users.push({ username, password, name, ipNumber, callNumber });
    } 
    else if (action === 'edit') {
        const index = users.findIndex(u => u.username === oldUsername);
        if (index !== -1) users[index] = { username, password, name, ipNumber, callNumber };
    } 
    else if (action === 'delete') {
        users = users.filter(u => u.username !== username);
    }

    saveUsersToFile(users);
    res.json({ success: true });
});

app.get('/api/users', (req, res) => res.json(loadUsersFromFile()));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

// সকেট ইঞ্জিন (কল, চ্যাট ও রিঅ্যাকশন)
io.on('connection', (socket) => {
    socket.on('register_user', (data) => {
        socket.userData = data;
        socket.join(data.username);
        console.log(`User Registered: ${data.username}`);
    });

    // ১-টু-১ টেক্সট ও ইমেজ চ্যাট ইঞ্জিন
    socket.on('send_msg', (data) => {
        // ডেটা ফরম্যাট: { target, sender, text, image, timestamp }
        io.to(data.target).emit('receive_msg', data);
        io.to(data.sender).emit('receive_msg', data); 
    });

    // চ্যাট মেসেজ রিঅ্যাকশন ইঞ্জিন
    socket.on('send_reaction', (data) => {
        // ডেта ফরম্যাট: { msgId, reaction, target, sender }
        io.to(data.target).emit('receive_reaction', data);
        io.to(data.sender).emit('receive_reaction', data);
    });

    // কলিং ইঞ্জিন সিগন্যালিং
    socket.on('call_offer', (data) => {
        socket.to(data.targetUsername).emit('incoming_call', {
            callerName: data.callerName,
            callerUsername: data.callerUsername,
            callerCallNumber: data.callerCallNumber,
            callerSocketId: socket.id, 
            offer: data.offer,
            isVideo: data.isVideo
        });
    });

    socket.on('call_answer', (data) => {
        io.to(data.callerSocketId).emit('call_accepted', { answer: data.answer });
    });

    socket.on('ice_candidate', (data) => {
        socket.to(data.targetUsername).emit('ice_candidate_received', { candidate: data.candidate });
    });

    socket.on('hangup', (data) => {
        if (data && data.targetUsername) {
            io.to(data.targetUsername).emit('call_disconnected');
        }
        socket.broadcast.emit('call_disconnected');
    });

    socket.on('disconnect', () => {});
});

http.listen(PORT, '0.0.0.0', () => console.log(`Server setup on port ${PORT}`));
