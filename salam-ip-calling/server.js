const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const USERS_FILE = path.join(__dirname, 'users.json');

const ADMIN_USER = "salam";
const ADMIN_PASS = "864";

app.use(express.json());
app.use(express.static(__dirname));

// 📂 users.json ফাইল হ্যান্ডলিং
function loadUsersFromFile() {
    if (!fs.existsSync(USERS_FILE)) return [];
    try {
        return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
    } catch (e) {
        return [];
    }
}

function saveUsersToFile(users) {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// ১. লগইন রুট (Admin ও User পুরোপুরি আলাদা এবং টাইপ-সেফ ফিক্স)
app.post('/api/login', (req, res) => {
    const username = String(req.body.username).trim();
    const password = String(req.body.password).trim();

    // অ্যাডমিন লগইন চেক
    if (username === ADMIN_USER && password === ADMIN_PASS) {
        return res.json({ success: true, role: 'admin', name: 'Administrator', username: ADMIN_USER });
    }

    // ইউজার লগইন চেক (users.json থেকে)
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

// ২. ইউজার ক্রিয়েট, এডিট, ডিলিট এপিআই
app.post('/api/manage-user', (req, res) => {
    const { action, username, password, name, oldUsername, ipNumber, callNumber } = req.body;
    let users = loadUsersFromFile();

    if (action === 'add') {
        if (users.find(u => u.username === username)) {
            return res.json({ success: false, message: 'User already exists!' });
        }
        users.push({ 
            username, 
            password, 
            name, 
            ipNumber: ipNumber || `IP-${username}`, 
            callNumber: callNumber || username 
        });
    } 
    else if (action === 'edit') {
        const index = users.findIndex(u => u.username === oldUsername);
        if (index !== -1) {
            users[index] = { 
                username, 
                password, 
                name, 
                ipNumber: ipNumber || `IP-${username}`, 
                callNumber: callNumber || username 
            };
        }
    } 
    else if (action === 'delete') {
        users = users.filter(u => u.username !== username);
    }

    saveUsersToFile(users);
    res.json({ success: true });
});

app.get('/api/users', (req, res) => {
    res.json(loadUsersFromFile());
});

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

// ৩. সকেট সিগন্যালিং ইঞ্জিন
io.on('connection', (socket) => {
    socket.on('register_user', (data) => {
        socket.userData = data; 
        console.log(`Registered User: ${data.username}`);
    });

    socket.on('call_offer', (data) => {
        const targetSocket = Array.from(io.sockets.sockets.values()).find(
            s => s.userData && s.userData.username === data.targetUsername
        );
        if (targetSocket) {
            targetSocket.emit('incoming_call', {
                callerName: data.callerName,
                callerUsername: data.callerUsername,
                callerSocketId: socket.id, 
                offer: data.offer
            });
        } else {
            socket.emit('call_error', { message: `Line ${data.targetUsername} is offline.` });
        }
    });

    socket.on('call_answer', (data) => {
        io.to(data.callerSocketId).emit('call_accepted', { answer: data.answer });
    });

    socket.on('ice_candidate', (data) => {
        const targetSocket = Array.from(io.sockets.sockets.values()).find(
            s => s.userData && s.userData.username === data.targetUsername
        );
        if (targetSocket) {
            targetSocket.emit('ice_candidate_received', { candidate: data.candidate });
        }
    });

    socket.on('hangup', (data) => {
        if (data && data.targetUsername) {
            const targetSocket = Array.from(io.sockets.sockets.values()).find(
                s => s.userData && s.userData.username === data.targetUsername
            );
            if (targetSocket) targetSocket.emit('call_disconnected');
        }
        socket.broadcast.emit('call_disconnected');
    });

    socket.on('disconnect', () => {});
});

http.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
