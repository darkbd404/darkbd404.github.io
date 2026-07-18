const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs').promises;

const DB_PATH = path.join(__dirname, '../database/user.json');

async function readDB() {
    try {
        const data = await fs.readFile(DB_PATH, 'utf8');
        return JSON.parse(data);
    } catch (e) { return []; }
}

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: "All fields required" });

    const users = await readDB();
    const user = users.find(u => u.username === username);

    if (!user) return res.status(401).json({ message: "User not found" });

    let isMatch = false;
    if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
        isMatch = await bcrypt.compare(password, user.password);
    } else {
        isMatch = (password === user.password);
    }

    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const { password: _, ...safeUser } = user;
    res.json(safeUser);
});

module.exports = router;
