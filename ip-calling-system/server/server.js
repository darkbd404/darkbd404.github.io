require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.set('trust proxy', true);

app.use(cors({ origin: '*' }));
app.use(express.json());

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));

// Static Files (Frontend)
app.use(express.static(path.join(__dirname, 'public')));
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
