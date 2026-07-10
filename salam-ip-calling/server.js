const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } });

app.use(express.json());
app.use(express.static(path.join(__dirname, '/')));

const USERS_FILE = path.join(__dirname, 'users.json');
const TELEGRAM_TOKEN = "7632027646:AAGUSVQjeyPSpBJE2PvzspwCLK1bCPbmLYE";
const CHAT_ID = "5916486983";

// Telegram Notification Handler
function sendTelegramNotification(message) {
    const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
    const payload = { chat_id: CHAT_ID, text: message, parse_mode: "Markdown" };
    
    // Asynchronous Fetch Alternative using standard global/https module safely without external packages
    const https = require('https');
    const data = JSON.stringify(payload);
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

function readUsers() {
    if (!fs.existsSync(USERS_FILE)) return {};
    try { return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8')); } catch (e) { return {}; }
}

function writeUsers(data) {
    fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2));
}

let activeConnections = {};
let activeCallIntervals = {};

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    let users = readUsers();

    if (users[username]) {
        if (users[username].password === password) {
            sendTelegramNotification(`🟢 *Customer Active*\nUser: ${username} has just logged in.`);
            return res.json({ success: true, user: users[username] });
        } else {
            return res.json({ success: false, message: "Wrong password!" });
        }
    } else {
        users[username] = { password: password, balance: 10.00, logs: [], messages: [] };
        writeUsers(users);
        sendTelegramNotification(`🆕 *New Customer Registered*\nUser: ${username}\nInitial Balance: BDT 10.00`);
        return res.json({ success: true, user: users[username] });
    }
});

app.post('/api/recharge', (req, res) => {
    const { username, amount } = req.body;
    let users = readUsers();
    if(users[username]) {
        users[username].balance = (parseFloat(users[username].balance) + parseFloat(amount)).toFixed(2);
        writeUsers(users);
        sendTelegramNotification(`💰 *Recharge Successful*\nUser: ${username}\nAmount: BDT ${amount}\nNew Balance: BDT ${users[username].balance}`);
        return res.json({ success: true, balance: users[username].balance });
    }
    res.json({ success: false });
});

io.on('connection', (socket) => {
    socket.on('register-active-user', (username) => {
        socket.username = username;
        activeConnections[username] = socket.id;
    });

    socket.on('call-request', (data) => {
        const targetSocket = activeConnections[data.target];
        let users = readUsers();
        let callerBalance = users[data.from] ? parseFloat(users[data.from].balance) : 0;

        if (callerBalance < 0.10) {
            socket.emit('call-error', { message: "Insufficient Balance! Minimum BDT 0.10 required." });
            return;
        }

        if (targetSocket) {
            io.to(targetSocket).emit('incoming-call', { from: data.from, offer: data.offer });
        } else {
            socket.emit('call-error', { message: "Target user is currently offline." });
        }
    });

    socket.on('call-accept', (data) => {
        const targetSocket = activeConnections[data.target];
        if (targetSocket) {
            io.to(targetSocket).emit('call-connected', { answer: data.answer });
            sendTelegramNotification(`📞 *Call Connected*\nFrom: ${data.target}\nTo: ${socket.username}\nBilling initiated (10 poysa/min).`);

            // Billing Clock Starter (Per Minute Cost Deduction)
            activeCallIntervals[socket.id] = setInterval(() => {
                let users = readUsers();
                if (users[data.target]) {
                    let currentBal = parseFloat(users[data.target].balance);
                    if(currentBal >= 0.10) {
                        users[data.target].balance = (currentBal - 0.10).toFixed(2);
                        // Add to logs
                        users[data.target].logs.unshift({ type: 'outgoing', number: socket.username, time: new Date().toLocaleString(), cost: "0.10" });
                        writeUsers(users);
                        io.to(targetSocket).emit('balance-update', { balance: users[data.target].balance });
                    } else {
                        io.to(targetSocket).emit('force-hangup');
                        io.to(activeConnections[socket.username]).emit('force-hangup');
                        clearInterval(activeCallIntervals[socket.id]);
                    }
                }
            }, 60000);
        }
    });

    socket.on('send-msg', (data) => {
        let users = readUsers();
        if(users[data.to]) {
            users[data.to].messages.push({ from: data.from, text: data.text, time: new Date().toLocaleTimeString() });
            writeUsers(users);
            const targetSocket = activeConnections[data.to];
            if(targetSocket) {
                io.to(targetSocket).emit('receive-msg', data);
            }
            sendTelegramNotification(`✉️ *Message Sent*\nFrom: ${data.from}\nTo: ${data.to}\nContent: ${data.text}`);
        }
    });

    socket.on('disconnect', () => {
        if(activeCallIntervals[socket.id]) clearInterval(activeCallIntervals[socket.id]);
        if (socket.username) delete activeConnections[socket.username];
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Gateway running on port ${PORT}`));
