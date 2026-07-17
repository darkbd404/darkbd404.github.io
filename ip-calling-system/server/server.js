require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');

// Internal Modules
const connectDatabase = require('./database/connectDB');
const logger = require('./config/logger');
const errorHandler = require('./middleware/errorHandler');

const app = express();
app.set('trust proxy', true);
const server = http.createServer(app);

// CORS & Security
app.use(cors({ origin: '*', credentials: true }));
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database Connection
connectDatabase();

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/calls', require('./routes/callRoutes'));
app.use('/api/contacts', require('./routes/contactRoutes'));

// Socket Handler
const io = new Server(server, { cors: { origin: '*' } });
require('./socket/socketHandler')(io);

// ⚠️ STATIC FILES SERVE (Safe Check)
const publicPath = path.join(__dirname, 'public');
if (fs.existsSync(publicPath)) {
    app.use(express.static(publicPath));
    
    // Catch-all route for SPA
    app.get('*', (req, res) => {
        res.sendFile(path.join(publicPath, 'index.html'));
    });
} else {
    logger.warn("Public folder not found! Frontend will not load.");
    app.get('/', (req, res) => {
        res.json({ message: "Backend is running. Public folder missing." });
    });
}

// Error Handler
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
});
