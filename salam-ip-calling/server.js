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

// GitHub Configuration
const GITHUB_TOKEN = "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";
const GITHUB_OWNER = "darkbd404";
const GITHUB_REPO = "darkbd404.github.io";
const GITHUB_PATH = "users.json";

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

// GitHub API থেকে সরাসরি users.json রিড করার ফাংশন
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

// গিটহাবে অটোমেটিক ডাটা পুশ/রাইট (Write) করার কোর ফাংশন
function pushUsersToGitHub(updatedData, callback) {
    const fileContent = JSON.stringify(updatedData, null, 2);
    
    // প্রথমে গিটহাব থেকে ফাইলটির বর্তমান SHA কি (ID) জেনে নেওয়া হচ্ছে
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

            // গিটহাবে নতুন ডাটা ওভাররাইট করার রিকোয়েস্ট পেলোড
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
        res.json({ success: false, message: "Invalid ID or Password! GitHub Data Matching Failed." });
    });
});

// ADMIN: GET REGISTERED USERS FOR CONTACTS
app.get('/api/users-list', (req, res) => {
    fetchUsersFromGitHub((githubUsers) => {
        res.json(githubUsers);
    });
});

// ADMIN: SAVE / UPDATE USER (লোকাল রাইট + গিটহাবে অটোমেটিক পুশ)
app.post('/api/admin/save-user', (req, res) => {
    const { adminUser, adminPass, targetUser, name, password, balance } = req.body;
    if (adminUser !== "salam" || adminPass !== "864") return res.json({ success: false });

    fetchUsersFromGitHub((currentUsers) => {
        let users = currentUsers || {};
        users[targetUser] = { 
            name: name || targetUser,
            password: password, 
            balance: parseFloat(balance || 0).toFixed(2), 
            logs: users[targetUser] ? users[targetUser].logs : [], 
            messages: users[targetUser] ? users[targetUser].messages : [] 
        };
        
        pushUsersToGitHub(users, (isSuccess) => {
            writeData(users); // লোকাল ব্যাকআপ
            res.json({ success: true, users: users });
        });
    });
});

// ADMIN: DELETE USER (লোকাল ডিলিট + গিটহাবে অটোমেটিক পুশ)
app.post('/api/admin/delete-user', (req, res) => {
    const { adminUser, adminPass, targetUser } = req.body;
    if (adminUser !== "salam" || adminPass !== "864") return res.json({ success: false });

    fetchUsersFromGitHub((currentUsers) => {
        let users = currentUsers || {};
        if (users[targetUser]) {
            delete users[targetUser];
            
            pushUsersToGitHub(users, (isSuccess) => {
                writeData(users); // লোকাল ব্যাকআপ
                res.json({ success: true, users: users });
            });
        } else {
            res.json({ success: false, message: "User not found" });
        }
    });
});

// USER PANEL: TELEGRAM SIGNAL TRANSMITTER
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

            fetchUsersFromGitHub((users) => {
                if (users[data.target]) {
                    let cur = parseFloat(users[data.target].balance);
                    if (cur >= 0.10) {
                        users[data.target].balance = (cur - 0.10).toFixed(2);
                        users[data.target].logs.unshift({ target: socket.uid, time: new Date().toLocaleString(), cost: "0.10" });
                        
                        pushUsersToGitHub(users, () => {
                            writeData(users);
                            io.to(targetSocketId).emit('balance-sync', { balance: users[data.target].balance });
                        });
                    }
                }
            });

            // প্রতি ১ মিনিটে ব্যালেন্স কাটার লুপ ও গিটহাব সিঙ্ক
            activeBillings[socket.id] = setInterval(() => {
                fetchUsersFromGitHub((currentUsers) => {
                    if (currentUsers[data.target]) {
                        let cur = parseFloat(currentUsers[data.target].balance);
                        if (cur >= 0.10) {
                            currentUsers[data.target].balance = (cur - 0.10).toFixed(2);
                            currentUsers[data.target].logs.unshift({ target: socket.uid, time: new Date().toLocaleString(), cost: "0.10" });
                            
                            pushUsersToGitHub(currentUsers, () => {
                                writeData(currentUsers);
                                io.to(targetSocketId).emit('balance-sync', { balance: currentUsers[data.target].balance });
                            });
                        } else {
                            io.to(targetSocketId).emit('force-hangup');
                            socket.emit('force-hangup');
                            clearInterval(activeBillings[socket.id]);
                        }
                    }
                });
            }, 60000);
        }
    });

    // রিয়েল-টাইম টেক্সট মেসেজিং সকেট ইভেন্ট
    socket.on('send-msg', (data) => {
        const targetSocketId = activeNodes[data.to];
        if (targetSocketId) {
            io.to(targetSocketId).emit('receive-msg', { from: data.from, text: data.text });
        }
    });

    socket.on('ice-candidate', (data) => {
        const targetSocketId = activeNodes[data.target];
        if (targetSocketId) io.to(targetSocketId).emit('ice-candidate', { candidate: data.candidate });
    });

    socket.on('hangup-call', (data) => {
        const targetSocketId = activeNodes[data.target];
        if (targetSocketId) io.to(targetSocketId).emit('call-terminated');
        if(activeBillings[socket.id]) clearInterval(activeBillings[socket.id]);
    });

    document.on = function(){}; // ডামি হ্যান্ডলার
    socket.on('disconnect', () => {
        if(activeBillings[socket.id]) clearInterval(activeBillings[socket.id]);
        if(socket.uid) delete activeNodes[socket.uid];
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`3D Full Real-Time Sync Server live on ${PORT}`));
