const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// user.json ফাইলের পাথ
const USER_DB_PATH = path.join(__dirname, '../database/user.json');

// Helper function to read JSON file
function getUsers() {
    try {
        const data = fs.readFileSync(USER_DB_PATH, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error("Error reading user.json:", err);
        return [];
    }
}

// Login Route
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    const users = getUsers();
    
    // Email এবং Password ম্যাচ করা
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        // সফল লগিন (Token ছাড়া সরাসরি ইউজার ডাটা পাঠানো হচ্ছে)
        res.json({ 
            success: true, 
            message: "Login successful",
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                number: user.number
            }
        });
    } else {
        res.status(401).json({ 
            success: false, 
            message: "Invalid email or password" 
        });
    }
});

// Register Route (Optional: নতুন ইউজার যোগ করার জন্য)
router.post('/register', (req, res) => {
    const { name, email, number, password } = req.body;
    const users = getUsers();
    
    // চেক করুন ইউজার আগে থেকে আছে কিনা
    const exists = users.find(u => u.email === email);
    if (exists) {
        return res.status(400).json({ success: false, message: "User already exists" });
    }
    
    // নতুন ইউজার যোগ করা
    const newUser = {
        id: users.length + 1,
        name,
        email,
        number,
        password
    };
    
    users.push(newUser);
    
    // ফাইলে সেভ করা
    try {
        fs.writeFileSync(USER_DB_PATH, JSON.stringify(users, null, 2));
        res.status(201).json({ 
            success: true, 
            message: "User registered successfully",
            data: newUser
        });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to save user" });
    }
});

module.exports = router;
