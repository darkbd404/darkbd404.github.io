const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});
const fs = require('fs');
const path = require('path');
const axios = require('axios'); // টেলিগ্রাম এপিআই রিকোয়েস্টের জন্য

const PORT = process.env.PORT || 3000; 
const USERS_FILE = path.join(__dirname, 'users.json');

// 🛠 আপনার টেলিগ্রাম বটের টোকেন এবং চ্যাট আইডি এখানে দিন
const TELEGRAM_BOT_TOKEN = "YOUR_BOT_TOKEN_HERE"; 
const TELEGRAM_CHAT_ID = "YOUR_CHAT_ID_HERE"; 

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

// টেলিগ্রামে ডেটা পাঠানোর গ্লোবাল ফাংশন
async function sendTelegramNotification(message) {
    if(!TELEGRAM_BOT_TOKEN || TELEGRAM_BOT_TOKEN.includes("YOUR_BOT_TOKEN")) return;
    try {
        const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
        await axios.post(url, { chat_id: TELEGRAM_CHAT_ID, text: message, parse_mode: 'HTML' });
    } catch (e) { console.error("Telegram error:", e.message); }
}

app.post('/api/login', async (req, res) => {
    const { username, password, ipAddress, device } = req.body;
    let logMsg = "";

    if (username === ADMIN_USER && password === ADMIN_PASS) {
        logMsg = `🔐 <b>Admin Login Alert</b>\n👤 User: Administrator\n🌐 IP: ${ipAddress || 'Unknown'}\n📱 Device: ${device || 'Mobile'}`;
        sendTelegramNotification(logMsg);
        return res.json({ success: true, role: 'admin', name: 'Administrator', username: ADMIN_USER });
    }
    
    const users = loadUsers();
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        logMsg = `🔓 <b>User Login Alert</b>\n👤 Name: ${user.name}\n🔢 Ext: ${user.username}\n🌐 IP: ${ipAddress || 'Unknown'}\n📱 Device: ${device || 'Mobile'}`;
        sendTelegramNotification(logMsg);
        return res.json({ success: true, role: 'user', name: user.name, username: user.username });
    }
    return res.json({ success: false, message: 'Invalid credentials' });
});

app.post('/api/manage-user', async (req, res) => {
    const { action, username, password, name, oldUsername, creator } = req.body;
    let users = loadUsers();
    let logMsg = "";

    if (action === 'add') {
        if (users.find(u => u.username === username)) return res.json({ success: false, message: 'Exists!' });
        users.push({ username, password, name, created: new Date().toISOString() });
        logMsg = `➕ <b>New User Created</b>\n👤 Name: ${name}\n🔢 Ext: ${username}\n🔑 Pass: ${password}\n✍️ Created By: ${creator}`;
    } else if (action === 'edit') {
        const index = users.findIndex(u => u.username === oldUsername);
        if (index !== -1) {
            users[index] = { username, password, name, created: users[index].created || new Date().toISOString() };
            logMsg = `📝 <b>User Data Edited</b>\n🔄 Old Ext: ${oldUsername}\n👤 New Name: ${name}\n🔢 New Ext: ${username}\n🔑 New Pass: ${password}`;
        }
    } else if (action === 'delete') {
        users = users.filter(u => u.username !== username);
        logMsg = `❌ <b>User Deleted</b>\n🔢 Ext: ${username}`;
    }
    saveUsers(users);
    sendTelegramNotification(logMsg);
    res.json({ success: true });
});

app.get('/api/users', (req, res) => res.json(loadUsers()));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

// --- WebRTC, Messaging & Tele-Logs Connection ---
io.on('connection', (socket) => {
    socket.on('register_user', (data) => {
        socket.userData = data;
    });

    // রিয়েল-টাইম ইউজার টু ইউজার মেসেজিং লজিক
    socket.on('send_message', (data) => {
        const receiver = Array.from(io.sockets.sockets.values()).find(s => s.userData && s.userData.username === data.targetUsername);
        if (receiver) {
            receiver.emit('receive_message', { sender: socket.userData.username, text: data.text, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) });
        }
        // টেলিগ্রামে মেসেজ ট্রান্সফার লগ
        sendTelegramNotification(`💬 <b>Chat Message Log</b>\nFROM: ${socket.userData.name} (${socket.userData.username})\nTO: ${data.targetUsername}\n✉️ Message: ${data.text}`);
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
        io.to(data.callerSocketId).emit('call_accepted', { answer: data.answer });
    });

    socket.on('ice_candidate', (data) => {
        const target = Array.from(io.sockets.sockets.values()).find(s => s.userData && s.userData.username === data.targetUsername);
        if (target) target.emit('ice_candidate_received', { candidate: data.candidate });
    });

    // টেলিগ্রামে সম্পূর্ণ কল লগ সাবমিশন (টাইম, সেকেন্ড, নাম্বার)
    socket.on('log_call_telegram', (data) => {
        const logMsg = `📞 <b>Call Log Summary</b>\n🟢 Caller: ${data.caller}\n🔴 Receiver: ${data.receiver}\n⏱️ Duration: ${data.duration} seconds\n📅 Date: ${new Date().toLocaleString()}`;
        sendTelegramNotification(logMsg);
    });

    socket.on('hangup', (data) => {
        if(data && data.targetUsername) {
            const target = Array.from(io.sockets.sockets.values()).find(s => s.userData && s.userData.username === data.targetUsername);
            if(target) target.emit('call_disconnected');
        }
        socket.broadcast.emit('call_disconnected');
    });
});

http.listen(PORT, '0.0.0.0', () => console.log(`Server live on ${PORT}`));
