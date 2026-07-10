const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const fs = require('fs');
const https = require('https');
const webpush = require('web-push'); // npm install web-push

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } });

app.use(express.json());
app.use(express.static(path.join(__dirname, '/')));

const USERS_FILE = path.join(__dirname, 'users.json');
const TELEGRAM_TOKEN = "7632027646:AAGUSVQjeyPSpBJE2PvzspwCLK1bCPbmLYE";
const CHAT_ID = "5916486983";

// GitHub Configuration
const GITHUB_TOKEN = "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";
const GITHUB_OWNER = "darkbd404";
const GITHUB_REPO = "darkbd404.github.io";
const GITHUB_PATH = "users.json";

// VAPID Keys for Push Notifications (Generate your own using web-push library if needed)
const vapidKeys = {
    publicKey: 'BNxw7ZmzFqHqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJq......', // Replace with real public key
    privateKey: '......' // Replace with real private key
};

// webpush.setVapidDetails('mailto:salam@example.com', vapidKeys.publicKey, vapidKeys.privateKey);

let pushSubscriptions = [];

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
    try { return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8')); } catch (e) { return {}; }
}

function writeData(data) {
    fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2));
}

function fetchUsersFromGitHub(callback) {
    const options = {
        hostname: 'api.github.com',
        path: `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_PATH}`,
        headers: {
            'User-Agent': 'IP-Calling-Engine',
            'Authorization': `token ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3.raw'
        }
    };
    https.get(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
            try {
                if (res.statusCode === 200) {
                    const users = JSON.parse(body);
                    callback(users);
                } else {
                    callback(readData());
                }
            } catch (e) {
                callback(readData());
            }
        });
    }).on('error', () => callback(readData()));
}

function pushUsersToGitHub(updatedData, callback) {
    const fileContent = JSON.stringify(updatedData, null, 2);
    const getOptions = {
        hostname: 'api.github.com',
        path: `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_PATH}`,
        headers: {
            'User-Agent': 'IP-Calling-Engine',
            'Authorization': `token ${GITHUB_TOKEN}`
        }
    };
    https.get(getOptions, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
            let sha = "";
            try {
                const resData = JSON.parse(body);
                sha = resData.sha;
            } catch(e) {}
            
            const putData = JSON.stringify({
                message: "Admin updated users.json via 3D Dashboard Engine",
                content: Buffer.from(fileContent).toString('base64'),
                sha: sha
            });
            
            const putOptions = {
                hostname: 'api.github.com',
                path: `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_PATH}`,
                method: 'PUT',
                headers: {
                    'User-Agent': 'IP-Calling-Engine',
                    'Authorization': `token ${GITHUB_TOKEN}`,
                    'Content-Type': 'application/json',
                    'Content-Length': putData.length
                }
            };
            
            const putReq = https.request(putOptions, (putRes) => {
                callback(putRes.statusCode === 200 || putRes.statusCode === 201);
            });
            putReq.write(putData);
            putReq.end();
        });
    }).on('error', () => callback(false));
}

// SINGLE LOGIN API
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    
    if (username === "salam" && password === "864") {
        fetchUsersFromGitHub((githubUsers) => {
            return res.json({ success: true, role: "admin", users: githubUsers });
        });
        return;
    }
    
    fetchUsersFromGitHub((githubUsers) => {
        if (githubUsers[username] && githubUsers[username].password === password) {
            sendTelegram(`🟢 *User Login Alert*\n👤 *Name:* ${githubUsers[username].name || 'N/A'}\n🆔 *Node ID:* ${username}\n💰 *Balance:* BDT ${githubUsers[username].balance}`);
            return res.json({ success: true, role: "user", user: githubUsers[username] });
        }
        res.json({ success: false, message: "Invalid ID or Password!" });
    });
});

// ADMIN: SAVE / UPDATE USER (FIXED)
app.post('/api/admin/save-user', (req, res) => {
    const { adminUser, adminPass, targetUser, name, password, balance } = req.body;
    
    if (adminUser !== "salam" || adminPass !== "864") {
        return res.json({ success: false, message: "Unauthorized" });
    }
    
    fetchUsersFromGitHub((currentUsers) => {
        let users = currentUsers || {};
        
        users[targetUser] = { 
            name: name || targetUser,
            password: password, 
            balance: parseFloat(balance || 0).toFixed(2), 
            logs: users[targetUser] ? users[targetUser].logs : [], 
            messages: users[targetUser] ? users[targetUser].messages : [] 
        };
        
        // 1. Write to Local File Immediately
        writeData(users); 
        
        // 2. Push to GitHub in Background
        pushUsersToGitHub(users, (isSuccess) => {
            console.log(isSuccess ? "GitHub Synced" : "GitHub Sync Failed");
        });
        
        // 3. Send Response Immediately
        res.json({ success: true, users: users });
    });
});

// ADMIN: DELETE USER
app.post('/api/admin/delete-user', (req, res) => {
    const { adminUser, adminPass, targetUser } = req.body;
    if (adminUser !== "salam" || adminPass !== "864") return res.json({ success: false });
    
    fetchUsersFromGitHub((currentUsers) => {
        let users = currentUsers || {};
        if (users[targetUser]) {
            delete users[targetUser];
            writeData(users); // Local Delete
            pushUsersToGitHub(users, () => {}); // GitHub Delete
            res.json({ success: true, users: users });
        } else {
            res.json({ success: false, message: "User not found" });
        }
    });
});

// ADMIN: SEND NOTIFICATION TO ALL
app.post('/api/admin/send-notification', (req, res) => {
    const { adminUser, adminPass, title, message } = req.body;
    
    if (adminUser !== "salam" || adminPass !== "864") {
        return res.json({ success: false });
    }
    
    // Send to Telegram
    sendTelegram(`📢 *System Notification*\n📌 *Title:* ${title}\n💬 *Message:* ${message}`);
    
    // Broadcast to all connected clients via Socket.IO
    io.emit('system-notification', { title, message });
    
    // Send Push Notification to subscribed devices
    const payload = JSON.stringify({ title, message });
    pushSubscriptions.forEach(subscription => {
        webpush.sendNotification(subscription, payload).catch(console.error);
    });
    
    res.json({ success: true });
});

// Register Push Subscription
app.post('/api/register-push', (req, res) => {
    const subscription = req.body;
    pushSubscriptions.push(subscription);
    res.status(201).json({});
});

// USER PANEL: REFILL REQUEST
app.post('/api/user/request-balance', (req, res) => {
    const { username, name, currentBalance, amount } = req.body;
    sendTelegram(`⚠️ *Refill Request Packet*\n👤 *Customer Name:* ${name}\n🆔 *IP / Username:* ${username}\n💰 *Current Balance:* BDT ${currentBalance}\n💵 *Requested Amount:* BDT ${amount}`);
    res.json({ success: true });
});

let activeNodes = {};
let activeBillings = {};

io.on('connection', (socket) => {
    socket.on('register-node', (uid) => {
        socket.uid = uid;
        activeNodes[uid] = socket.id;
    });

    socket.on('call-node', (data) => {
        const targetSocketId = activeNodes[data.target];
        fetchUsersFromGitHub((users) => {
            let balance = users[data.from] ? parseFloat(users[data.from].balance) : 0;
            if (balance < 0.10) {
                return socket.emit('call-error', { message: "insufficient" });
            }
            if (targetSocketId) {
                io.to(targetSocketId).emit('incoming-call', { from: data.from, offer: data.offer, callType: data.callType });
            } else {
                socket.emit('call-error', { message: "offline" });
            }
        });
    });

    socket.on('call-accept', (data) => {
        const targetSocketId = activeNodes[data.target];
        if (targetSocketId) {
            io.to(targetSocketId).emit('call-connected', { answer: data.answer });
            // Billing Logic...
        }
    });

    socket.on('send-msg', (data) => {
        const targetSocketId = activeNodes[data.to];
        if (targetSocketId) {
            io.to(targetSocketId).emit('receive-msg', { from: data.from, text: data.text });
        }
    });

    socket.on('disconnect', () => {
        if(socket.uid) delete activeNodes[socket.uid];
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`3D Full Real-Time Sync Server live on ${PORT}`));
