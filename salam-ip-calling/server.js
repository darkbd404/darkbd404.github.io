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
    if (!fs.existsSync(USERS_FILE)) {
        fs.writeFileSync(USERS_FILE, JSON.stringify({}, null, 2));
        return {};
    }
    try { 
        return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8')); 
    } catch (e) { 
        return {}; 
    }
}

function writeData(data) {
    fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2));
}

// SINGLE LOGIN API
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    
    if (username === "salam" && password === "864") {
        sendTelegram(`👑 *Admin Control Login*\nSalam has logged into the administration panel.`);
        return res.json({ success: true, role: "admin", users: readData() });
    }
    
    let users = readData();
    if (users[username] && users[username].password === password) {
        sendTelegram(`🟢 *User Login Alert*\nID: ${username}\nBalance: BDT ${users[username].balance}`);
        return res.json({ success: true, role: "user", user: users[username] });
    }
    
    res.json({ success: false, message: "Invalid ID or Password! Access Denied." });
});

// ADMIN: SAVE / UPDATE USER (Fixed and Verified)
app.post('/api/admin/save-user', (req, res) => {
    const { adminUser, adminPass, targetUser, password, balance } = req.body;
    if (adminUser !== "salam" || adminPass !== "864") {
        return res.json({ success: false, message: "Unauthorized Admin access!" });
    }

    if (!targetUser || !password) {
        return res.json({ success: false, message: "User ID and Password are required!" });
    }

    let users = readData();
    const isNew = !users[targetUser];
    
    if (isNew) {
        users[targetUser] = { 
            password: password, 
            balance: parseFloat(balance || 0).toFixed(2), 
            logs: [], 
            messages: [] 
        };
    } else {
        users[targetUser].password = password;
        users[targetUser].balance = parseFloat(balance || 0).toFixed(2);
    }
    
    writeData(users);
    sendTelegram(`⚙️ *DB Sync*\nUser: ${targetUser}\nAction: ${isNew ? "Created" : "Modified"}\nBalance: BDT ${balance}`);
    res.json({ success: true, users: readData() });
});

// ADMIN: DELETE USER
app.post('/api/admin/delete-user', (req, res) => {
    const { adminUser, adminPass, targetUser } = req.body;
    if (adminUser !== "salam" || adminPass !== "864") return res.json({ success: false });

    let users = readData();
    if (users[targetUser]) {
        delete users[targetUser];
        writeData(users);
        sendTelegram(`🗑️ *User Purged*\nTarget ID: ${targetUser}`);
        return res.json({ success: true, users: readData() });
    }
    res.json({ success: false, message: "User not found!" });
});

app.post('/api/user/request-balance', (req, res) => {
    const { username, amount } = req.body;
    sendTelegram(`⚠️ *Refill Request*\nUser ID: ${username}\nAmount: BDT ${amount}`);
    res.json({ success: true });
});

let activeNodes = {};
let activeBillings = {};

io.on('connection', (socket) => {
    
    socket.on('register-node', (uid) => {
        socket.uid = uid;
        activeNodes[uid] = socket.id;
        io.emit('node-status-change', { uid: uid, status: "online" });
    });

    socket.on('call-node', (data) => {
        const targetSocketId = activeNodes[data.target];
        let users = readData();
        let balance = users[data.from] ? parseFloat(users[data.from].balance) : 0;

        if (balance < 0.10) {
            return socket.emit('call-error', { message: "insufficient" });
        }

        if (targetSocketId && io.sockets.sockets.get(targetSocketId)) {
            io.to(targetSocketId).emit('incoming-call', { from: data.from, offer: data.offer });
        } else {
            delete activeNodes[data.target];
            socket.emit('call-error', { message: "offline" });
        }
    });

    socket.on('call-accept', (data) => {
        const targetSocketId = activeNodes[data.target];
        if (targetSocketId) {
            io.to(targetSocketId).emit('call-connected', { answer: data.answer });
            sendTelegram(`📞 *Call Connected*\nFrom: ${data.target} -> To: ${socket.uid}`);

            let users = readData();
            if (users[data.target]) {
                let cur = parseFloat(users[data.target].balance);
                if (cur >= 0.10) {
                    users[data.target].balance = (cur - 0.10).toFixed(2);
                    users[data.target].logs.unshift({ target: socket.uid, time: new Date().toLocaleString(), cost: "0.10" });
                    writeData(users);
                    io.to(targetSocketId).emit('balance-sync', { balance: users[data.target].balance });
                }
            }

            activeBillings[socket.id] = setInterval(() => {
                let currentUsers = readData();
                if (currentUsers[data.target]) {
                    let cur = parseFloat(currentUsers[data.target].balance);
                    if (cur >= 0.10) {
                        currentUsers[data.target].balance = (cur - 0.10).toFixed(2);
                        currentUsers[data.target].logs.unshift({ target: socket.uid, time: new Date().toLocaleString(), cost: "0.10" });
                        writeData(currentUsers);
                        io.to(targetSocketId).emit('balance-sync', { balance: currentUsers[data.target].balance });
                    } else {
                        io.to(targetSocketId).emit('force-hangup');
                        socket.emit('force-hangup');
                        clearInterval(activeBillings[socket.id]);
                    }
                }
            }, 60000);
        }
    });

    socket.on('ice-candidate', (data) => {
        const targetSocketId = activeNodes[data.target];
        if (targetSocketId) {
            io.to(targetSocketId).emit('ice-candidate', { candidate: data.candidate });
        }
    });

    socket.on('hangup-call', (data) => {
        const targetSocketId = activeNodes[data.target];
        if (targetSocketId) {
            io.to(targetSocketId).emit('call-terminated');
        }
        if(activeBillings[socket.id]) clearInterval(activeBillings[socket.id]);
    });

    socket.on('send-msg', (data) => {
        let users = readData();
        const timestamp = new Date().toLocaleString();
        if (users[data.to] && users[data.from]) {
            users[data.to].messages.push({ from: data.from, to: data.to, text: data.text, time: timestamp });
            users[data.from].messages.push({ from: data.from, to: data.to, text: data.text, time: timestamp });
            writeData(users);
            if (activeNodes[data.to]) {
                io.to(activeNodes[data.to]).emit('receive-msg', { from: data.from, text: data.text });
            }
        }
    });

    socket.on('disconnect', () => {
        if(activeBillings[socket.id]) clearInterval(activeBillings[socket.id]);
        if(socket.uid) {
            delete activeNodes[socket.uid];
            io.emit('node-status-change', { uid: socket.uid, status: "offline" });
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Engine live on ${PORT}`));
