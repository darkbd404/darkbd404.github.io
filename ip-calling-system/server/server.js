require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

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

// Database
connectDatabase();

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/calls', require('./routes/callRoutes'));
app.use('/api/contacts', require('./routes/contactRoutes'));

// Socket Handler
const io = new Server(server, { cors: { origin: '*' } });
require('./socket/socketHandler')(io);

// ⚠️ STATIC FILES SERVE (FRONTEND)
app.use(express.static(path.join(__dirname, 'public')));

// Catch-all route for SPA
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error Handler
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
});
