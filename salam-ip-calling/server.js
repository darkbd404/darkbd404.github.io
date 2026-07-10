const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const fs = require('fs');
const path = require('path');

// Render ক্লাউডের পোর্ট ডিটেকশন এবং লোকাল পোর্ট ৩০০০
const PORT = process.env.PORT || 3000; 
const USERS_FILE = path.join(__dirname, 'users.json');

// অ্যাডমিন লগইন ক্রেডেনশিয়ালস
const ADMIN_USER = "salam";
const ADMIN_PASS = "864";

app.use(express.json());
app.use(express.static(path.join(__dirname)));

// ডেটাবেস (JSON File) লোড ফাংশন
function loadUsers() {
    if (!fs.existsSync(USERS_FILE)) return [];
    try { return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8')); } 
    catch (e) { return []; }
}

// ডেটাবেস সেভ ফাংশন
function saveUsers(users) {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

if (!fs.existsSync(USERS_FILE)) saveUsers([]);

// --- API ROUTES ---

// লগইন রুট
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    
    // চেক অ্যাডমিন
    if (username === ADMIN_USER && password === ADMIN_PASS) {
        return res.json({ success: true, role: 'admin', name: 'Administrator' });
    }

    // চেক রেগুলার ইউজার
    const users = loadUsers();
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        return res.json({ success: true, role: 'user', name: user.name, username: user.username });
    }

    return res.json({ success: false, message: 'Invalid credentials or access denied.' });
});

// ইউজার ম্যানেজমেন্ট রুট (শুধু অ্যাডমিন পারবে)
app.post('/api/manage-user', (req, res) => {
    const { action, username, password, name, oldUsername } = req.body;
    let users = loadUsers();

    if (action === 'add') {
        if (users.find(u => u.username === username)) {
            return res.json({ success: false, message: 'Username already exists!' });
        }
        users.push({ username, password, name, created: new Date().toISOString() });
    } else if (action === 'edit') {
        const index = users.findIndex(u => u.username === oldUsername);
        if (index !== -1) {
            users[index] = { username, password, name, created: users[index].created || new Date().toISOString() };
        }
    } else if (action === 'delete') {
        users = users.filter(u => u.username !== username);
    }

    saveUsers(users);
    res.json({ success: true, message: `User ${action}ed successfully!` });
});

// ইউজার লিস্ট পাওয়ার রুট
app.get('/api/users', (req, res) => {
    res.json(loadUsers());
});

// ফ্রন্টএন্ড পেজ সার্ভ করা
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// --- WEBRTC SIGNALING & SOCKET LOGIC ---
io.on('connection', (socket) => {
    console.log(`Socket Connected: ${socket.id}`);
    socket.userData = null;

    // অনলাইন হওয়া ইউজার রেজিস্ট্রেশন ট্র্যাকিং
    socket.on('register_user', (data) => {
        socket.userData = data; 
        console.log(`User Online: ${data.username} (${data.name})`);
    });

    // কল অফার রাউটিং লজিক (স্পেসিফিক ইউজারকে কল পাঠানো)
    socket.on('call_offer', (data) => {
        const targetUsername = data.targetUsername;
        const receiverSocket = Array.from(io.sockets.sockets.values()).find(
            s => s.userData && s.userData.username === targetUsername
        );

        if (receiverSocket) {
            receiverSocket.emit('incoming_call', {
                callerName: data.callerName,
                callerUsername: data.callerUsername,
                callerSocketId: socket.id, 
                offer: data.offer
            });
            console.log(`Call routed from ${socket.id} to ${targetUsername}`);
        } else {
            socket.emit('call_error', { message: `User ${targetUsername} is offline.` });
        }
    });

    // কল অ্যানসার পাঠানো
    socket.on('call_answer', (data) => {
        io.to(data.callerSocketId).emit('call_accepted', {
            answer: data.answer
        });
    });

    // ICE Candidate ট্রান্সফার (কানেকশন এস্টাব্লিশ করার জন্য)
    socket.on('ice_candidate', (data) => {
        const targetSocket = Array.from(io.sockets.sockets.values()).find(
            s => s.userData && s.userData.username === data.targetUsername
        );
        if (targetSocket) {
            targetSocket.emit('ice_candidate_received', { candidate: data.candidate });
        }
    });

    // কল কেটে দিলে বা হ্যাংআপ করলে
    socket.on('hangup', () => {
        socket.broadcast.emit('call_disconnected');
    });

    socket.on('disconnect', () => { 
        console.log(`Socket Disconnected: ${socket.id}`); 
    });
});

http.listen(PORT, '0.0.0.0', () => {
    console.log(`====================================`);
    console.log(`  Salam IP Network Active on Port: ${PORT}`);
    console.log(`====================================`);
});
            
