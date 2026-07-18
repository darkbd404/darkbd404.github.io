const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs').promises;

const DB_PATH = path.join(__dirname, '../database/user.json');

async function readDB() {
    try {
        const data = await fs.readFile(DB_PATH, 'utf8');
        return JSON.parse(data);
    } catch (e) { return []; }
}

async function writeDB(data) {
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));
}

// REGISTER
router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: "Username and password required" });

    const users = await readDB();
    if (users.find(u => u.username === username)) {
        return res.status(409).json({ message: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
        id: uuidv4(),
        username,
        password: hashedPassword,
        profile: { displayName: username, avatar: null },
        online: false,
        socketId: null,
        friends: [],
        recentCalls: [],
        createdAt: new Date().toISOString()
    };

    users.push(newUser);
    await writeDB(users);
    
    const { password: _, ...safeUser } = newUser;
    res.status(201).json(safeUser);
});

// LOGIN
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const users = await readDB();
    const user = users.find(u => u.username === username);

    if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    const { password: _, ...safeUser } = user;
    res.json(safeUser);
});

module.exports = router;
