const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

const USER_DB_PATH = path.join(__dirname, '../database/user.json');

function getUsers() {
    try {
        const data = fs.readFileSync(USER_DB_PATH, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        return [];
    }
}

// LOGIN ROUTE
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    const users = getUsers();
    
    // Email এবং Password ম্যাচ করা
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        res.json({ 
            success: true, 
            message: "Login successful",
            data: { id: user.id, name: user.name, email: user.email, number: user.number }
        });
    } else {
        res.status(401).json({ success: false, message: "Invalid email or password" });
    }
});

module.exports = router;
