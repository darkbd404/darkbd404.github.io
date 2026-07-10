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

const GITHUB_TOKEN = "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";
const GITHUB_OWNER = "darkbd404";
const GITHUB_REPO = "darkbd404.github.io";
const GITHUB_PATH = "users.json";

function sendTelegram(msg) {
    const data = JSON.stringify({ chat_id: CHAT_ID, text: msg, parse_mode: "Markdown" });
    const options = {
        hostname: 'api.telegram.org', port: 443,
        path: `/bot${TELEGRAM_TOKEN}/sendMessage`, method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': data.length }
    };
    const req = https.request(options); req.write(data); req.end();
}

function readData() {
    if (!fs.existsSync(USERS_FILE)) { fs.writeFileSync(USERS_FILE, '{}'); return {}; }
    try { return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8')); } catch (e) { return {}; }
}

function writeData(data) { fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2)); }

function fetchUsersFromGitHub(callback) {
    const options = {
        hostname: 'api.github.com',
        path: `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_PATH}`,
        headers: { 'User-Agent': 'IP-Calling-Engine', 'Authorization': `token ${GITHUB_TOKEN}`, 'Accept': 'application/vnd.github.v3.raw' }
    };
    https.get(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
            try { callback(res.statusCode === 200 ? JSON.parse(body) : readData()); } 
            catch (e) { callback(readData()); }
        });
    }).on('error', () => callback(readData()));
}

function pushUsersToGitHub(updatedData, callback) {
    const fileContent = JSON.stringify(updatedData, null, 2);
    const getOptions = {
        hostname: 'api.github.com',
        path: `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_PATH}`,
        headers: { 'User-Agent': 'IP-Calling-Engine', 'Authorization': `token ${GITHUB_TOKEN}` }
    };
    https.get(getOptions, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
            let sha = "";
            try { sha = JSON.parse(body).sha; } catch(e) {}
            const putData = JSON.stringify({ message: "Sync Users", content: Buffer.from(fileContent).toString('base64'), sha: sha });
            const putOptions = {
                hostname: 'api.github.com', path: `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_PATH}`, method: 'PUT',
                headers: { 'User-Agent': 'IP-Calling-Engine', 'Authorization': `token ${GITHUB_TOKEN}`, 'Content-Type': 'application/json', 'Content-Length': putData.length }
            };
            const putReq = https.request(putOptions, (putRes) => { callback(putRes.statusCode === 200 || putRes.statusCode === 201); });
            putReq.write(putData); putReq.end();
        });
    }).on('error', () => callback(false));
}

// LOGIN API
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (username === "salam" && password === "864") {
        fetchUsersFromGitHub((users) => res.json({ success: true, role: "admin", users }));
        return;
    }
    fetchUsersFromGitHub((users) => {
        if (users[username] && users[username].password === password) {
            sendTelegram(`🟢 *Login:* ${users[username].name} (${username})`);
            return res.json({ success: true, role: "user", user: users[username] });
        }
        res.json({ success: false, message: "Invalid ID or Password!" });
    });
});

// 🔥 FIXED SAVE USER (Local Write First)
app.post('/api/admin/save-user', (req, res) => {
    const { adminUser, adminPass, targetUser, name, password, balance } = req.body;
    if (adminUser !== "salam" || adminPass !== "864") return res.json({ success: false });

    fetchUsersFromGitHub((currentUsers) => {
        let users = currentUsers || {};
        users[targetUser] = { 
            name: name || targetUser, password: password, 
            balance: parseFloat(balance || 0).toFixed(2), 
            logs: users[targetUser]?.logs || [], messages: users[targetUser]?.messages || [] 
        };
        
        // 1. IMMEDIATE LOCAL SAVE (Fixes Login Issue)
        writeData(users); 
        
        // 2. Background GitHub Sync
        pushUsersToGitHub(users, () => console.log("GitHub Synced"));
        
        // 3. Instant Response
        res.json({ success: true, users: users });
    });
});

// DELETE USER
app.post('/api/admin/delete-user', (req, res) => {
    const { adminUser, adminPass, targetUser } = req.body;
    if (adminUser !== "salam" || adminPass !== "864") return res.json({ success: false });
    fetchUsersFromGitHub((currentUsers) => {
        let users = currentUsers || {};
        if (users[targetUser]) {
            delete users[targetUser];
            writeData(users); // Local First
            pushUsersToGitHub(users, () => {});
            res.json({ success: true, users });
        } else res.json({ success: false, message: "Not found" });
    });
});

// NOTIFICATION
app.post('/api/admin/send-notification', (req, res) => {
    const { adminUser, adminPass, title, message } = req.body;
    if (adminUser !== "salam" || adminPass !== "864") return res.json({ success: false });
    sendTelegram(`📢 *Notification:* ${title}\n${message}`);
    io.emit('system-notification', { title, message });
    res.json({ success: true });
});

// REFILL REQUEST
app.post('/api/user/request-balance', (req, res) => {
    const { username, name, currentBalance, amount } = req.body;
    sendTelegram(`⚠️ *Refill:* ${name} (${username}) wants BDT ${amount}`);
    res.json({ success: true });
});

let activeNodes = {}, activeBillings = {};
io.on('connection', (socket) => {
    socket.on('register-node', (uid) => { socket.uid = uid; activeNodes[uid] = socket.id; });
    
    socket.on('call-node', (data) => {
        const targetId = activeNodes[data.target];
        fetchUsersFromGitHub((users) => {
            if ((parseFloat(users[data.from]?.balance) || 0) < 0.10) return socket.emit('call-error', { message: "insufficient" });
            if (targetId) io.to(targetId).emit('incoming-call', { from: data.from, offer: data.offer, callType: data.callType });
            else socket.emit('call-error', { message: "offline" });
        });
    });

    socket.on('call-accept', (data) => {
        const targetId = activeNodes[data.target];
        if (targetId) {
            io.to(targetId).emit('call-connected', { answer: data.answer });
            activeBillings[socket.id] = setInterval(() => {
                fetchUsersFromGitHub((users) => {
                    if (users[data.target] && parseFloat(users[data.target].balance) >= 0.10) {
                        users[data.target].balance = (parseFloat(users[data.target].balance) - 0.10).toFixed(2);
                        users[data.target].logs.unshift({ target: socket.uid, time: new Date().toLocaleString(), cost: "0.10" });
                        writeData(users); // Local billing update
                        pushUsersToGitHub(users, () => {});
                        io.to(targetId).emit('balance-sync', { balance: users[data.target].balance });
                    } else {
                        io.to(targetId).emit('force-hangup');
                        socket.emit('force-hangup');
                        clearInterval(activeBillings[socket.id]);
                    }
                });
            }, 60000);
        }
    });

    socket.on('send-msg', (data) => { if (activeNodes[data.to]) io.to(activeNodes[data.to]).emit('receive-msg', { from: data.from, text: data.text }); });
    socket.on('hangup-call', () => { if(activeBillings[socket.id]) clearInterval(activeBillings[socket.id]); });
    socket.on('disconnect', () => { if(activeBillings[socket.id]) clearInterval(activeBillings[socket.id]); if(socket.uid) delete activeNodes[socket.uid]; });
});

server.listen(process.env.PORT || 3000, () => console.log(`Server live on ${process.env.PORT || 3000}`));
