const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const fs = require('fs');
const path = require('path');

// --- CONFIGURATION ---
const PORT = 3000;
const USERS_FILE = path.join(__dirname, 'users.json');
const ADMIN_USER = "salam";
const ADMIN_PASS = "864";

app.use(express.json());
app.use(express.static(path.join(__dirname)));

// --- DATA MANAGEMENT ---
function loadUsers() {
    if (!fs.existsSync(USERS_FILE)) return [];
    try { return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8')); } 
    catch (e) { return []; }
}

function saveUsers(users) {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

if (!fs.existsSync(USERS_FILE)) saveUsers([]);

// --- API ROUTES ---

// Login Route
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    
    // Check Admin
    if (username === ADMIN_USER && password === ADMIN_PASS) {
        return res.json({ success: true, role: 'admin', name: 'Administrator' });
    }

    // Check Regular Users
    const users = loadUsers();
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        return res.json({ success: true, role: 'user', name: user.name, username: user.username });
    }

    return res.json({ success: false, message: 'Invalid credentials or access denied.' });
});

// Add/Edit User Route (Admin Only)
app.post('/api/manage-user', (req, res) => {
    const { action, username, password, name, oldUsername } = req.body;
    let users = loadUsers();

    if (action === 'add') {
        if (users.find(u => u.username === username)) {
            return res.json({ success: false, message: 'Username already exists!' });
        }
        users.push({ username, password, name });
    } else if (action === 'edit') {
        const index = users.findIndex(u => u.username === oldUsername);
        if (index !== -1) {
            users[index] = { username, password, name };
        }
    } else if (action === 'delete') {
        users = users.filter(u => u.username !== username);
    }

    saveUsers(users);
    res.json({ success: true, message: `User ${action}ed successfully!` });
});

// Get Users List
app.get('/api/users', (req, res) => {
    res.json(loadUsers());
});

// Serve Frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// --- WEBRTC & SOCKET LOGIC ---
io.on('connection', (socket) => {
    console.log(`Socket Connected: ${socket.id}`);
    
    // Store current user info in socket object
    socket.userData = null;

    socket.on('register_user', (data) => {
        socket.userData = data; // { username, name }
        console.log(`User Registered: ${data.username} (${data.name})`);
    });

    // SPECIFIC CALLING LOGIC
    socket.on('call_offer', (data) => {
        const targetUsername = data.targetUsername; // e.g., "08640000001"
        
        // Find the specific socket of the receiver
        const receiverSocket = Array.from(io.sockets.sockets.values()).find(
            s => s.userData && s.userData.username === targetUsername
        );

        if (receiverSocket) {
            // Send call only to that specific user
            receiverSocket.emit('incoming_call', {
                callerName: data.callerName,
                callerUsername: data.callerUsername,
                offer: data.offer
            });
            console.log(`Call routed to: ${targetUsername}`);
        } else {
            // Notify caller if user is offline
            socket.emit('call_error', { message: `User ${targetUsername} is currently offline.` });
        }
    });

    socket.on('call_answer', (data) => {
        // Send answer back to the specific caller socket ID
        io.to(data.callerSocketId).emit('call_accepted', {
            answer: data.answer,
            callerSocketId: data.callerSocketId // Pass it back for safety
        });
    });

    socket.on('ice_candidate', (data) => {
        // Forward candidate to specific socket
        io.to(data.targetSocketId).emit('ice_candidate_received', { candidate: data.candidate });
    });

    socket.on('disconnect', () => { 
        console.log(`Socket Disconnected: ${socket.id}`); 
    });
});

http.listen(PORT, '0.0.0.0', () => {
    console.log(`====================================`);
    console.log(`  Salam IP Network Active on :${PORT}`);
    console.log(`  Admin: ${ADMIN_USER} / ${ADMIN_PASS}`);
    console.log(`====================================`);
});