const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const fs = require('fs');
const https = require('https');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } });

app.use(express.json());
app.use(express.static(path.join(__dirname, '/')));

const USERS_FILE = path.join(__dirname, 'users.json');
const TELEGRAM_TOKEN = "7632027646:AAGUSVQjeyPSpBJE2PvzspwCLK1bCPbmLYE";
const CHAT_ID = "5916486983";

// Telegram Bot Alert Sender
function sendTelegram(msg) {
    const data = JSON.stringify({ chat_id: CHAT_ID, text: msg, parse_mode: "Markdown" });
    const options = {
        hostname: 'api.telegram.org',
        port: 443,
        path: `/bot${TELEGRAM_TOKEN}/sendMessage`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': data.length }
    };
    const req = https.request(options);
    req.write(data);
    req.end();
}

function readData() {
    if (!fs.existsSync(USERS_FILE)) return {};
    try { return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8')); } catch (e) { return {}; }
}

function writeData(data) {
    fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2));
}

// 1. ADMIN LOGIN API
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    if (username === "salam" && password === "864") {
        sendTelegram(`👑 *Admin Logged In*\nAdmin has accessed the control panel.`);
        return res.json({ success: true, users: readData() });
    }
    res.json({ success: false, message: "Invalid Admin Credentials!" });
});

// 2. ADMIN: SAVE OR UPDATE USER
app.post('/api/admin/save-user', (req, res) => {
    const { adminUser, adminPass, targetUser, password, balance } = req.body;
    if (adminUser !== "salam" || adminPass !== "864") return res.json({ success: false });

    let users = readData();
    const isNew = !users[targetUser];
    
    if (isNew) {
        users[targetUser] = { password, balance: parseFloat(balance).toFixed(2), logs: [], messages: [] };
    } else {
        users[targetUser].password = password;
        users[targetUser].balance = parseFloat(balance).toFixed(2);
    }
    writeData(users);
    
    sendTelegram(`⚙️ *Admin Database Update*\nUser: ${targetUser}\nAction: ${isNew ? "Created" : "Modified"}\nSet Balance: BDT ${balance}`);
    res.json({ success: true, users });
});

// 3. USER LOGIN API (Strictly checking Admin entries)
app.post('/api/user/login', (req, res) => {
    const { username, password } = req.body;
    let users = readData();

    if (users[username] && users[username].password === password) {
        sendTelegram(`🟢 *User Connected*\nID: ${username}\nCurrent Balance: BDT ${users[username].balance}`);
        return res.json({ success: true, user: users[username] });
    }
    res.json({ success: false, message: "Access Denied! Ask Admin to create account." });
});

// 4. USER: BALANCE REQUEST ALERT
app.post('/api/user/request-balance', (req, res) => {
    const { username, amount } = req.body;
    sendTelegram(`⚠️ *Refill Request Alert*\nUser ID: ${username}\nRequested Amount: BDT ${amount}\n_Please update balance via Admin Login._`);
    res.json({ success: true });
});

// Realtime Call & Messaging Router
let activeNodes = {};
let activeBillings = {};

io.on('connection', (socket) => {
    socket.on('register-node', (uid) => {
        socket.uid = uid;
        activeNodes[uid] = socket.id;
    });

    // Targeted Call Routing (123 calls 123 only)
    socket.on('call-node', (data) => {
        const targetSocket = activeNodes[data.target];
        let users = readData();
        let balance = users[data.from] ? parseFloat(users[data.from].balance) : 0;

        if (balance < 0.10) {
            return socket.emit('call-error', { message: "Insufficient Balance!" });
        }

        if (targetSocket) {
            io.to(targetSocket).emit('incoming-call', { from: data.from, offer: data.offer });
        } else {
            socket.emit('call-error', { message: "User is offline / unavailable." });
        }
    });

    socket.on('call-accept', (data) => {
        const targetSocket = activeNodes[data.target];
        if (targetSocket) {
            io.to(targetSocket).emit('call-connected', { answer: data.answer });
            sendTelegram(`📞 *Active Call Activity*\nFrom: ${data.target}\nTo: ${socket.uid}\nDuration: Billing Started.`);

            // 10 Poysa per min deduction loop
            activeBillings[socket.id] = setInterval(() => {
                let users = readData();
                if (users[data.target]) {
                    let cur = parseFloat(users[data.target].balance);
                    if (cur >= 0.10) {
                        users[data.target].balance = (cur - 0.10).toFixed(2);
                        users[data.target].logs.unshift({ target: socket.uid, time: new Date().toLocaleTimeString(), cost: "0.10" });
                        writeData(users);
                        io.to(targetSocket).emit('balance-sync', { balance: users[data.target].balance });
                    } else {
                        io.to(targetSocket).emit('force-hangup');
                        io.to(activeNodes[socket.uid]).emit('force-hangup');
                        clearInterval(activeBillings[socket.id]);
                    }
                }
            }, 60000);
        }
    });

    socket.on('send-msg', (data) => {
        let users = readData();
        if (users[data.to]) {
            users[data.to].messages.push({ from: data.from, text: data.text, time: new Date().toLocaleTimeString() });
            writeData(users);
            if (activeNodes[data.to]) {
                io.to(activeNodes[data.to]).emit('receive-msg', data);
            }
            sendTelegram(`✉️ *Message Log*\nFrom: ${data.from}\nTo: ${data.to}\nMessage: ${data.text}`);
        }
    });

    socket.on('disconnect', () => {
        if(activeBillings[socket.id]) clearInterval(activeBillings[socket.id]);
        if(socket.uid) delete activeNodes[socket.uid];
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
