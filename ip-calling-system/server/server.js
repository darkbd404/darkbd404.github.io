require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const path = require('path');

// Internal Modules
// const connectDatabase = require('./database/connectDB'); // ⚠️ আপাতত কমেন্ট আউট রাখুন
const logger = require('./config/logger');
const errorHandler = require('./middleware/errorHandler');

// Initialize Express App & HTTP Server
const app = express();
app.set('trust proxy', true); 
const server = http.createServer(app);

// Allowed Origins
const allowedOrigins = process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',') : ['*'];

// Socket.IO Setup
const io = new Server(server, { cors: { origin: allowedOrigins, methods: ['GET', 'POST'] } });

// Security Middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize());
app.use(xss());

// Rate Limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use('/api/', limiter);

// Static Files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database Connection (Commented out for testing)
// connectDatabase(); 

// Test Route
app.get('/', (req, res) => {
    res.json({ message: 'Server is running perfectly!', status: 'ok' });
});

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/calls', require('./routes/callRoutes'));
app.use('/api/contacts', require('./routes/contactRoutes'));

// Socket Handler
require('./socket/socketHandler')(io);

// Global Error Handler
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});
