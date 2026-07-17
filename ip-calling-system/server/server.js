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
const connectDatabase = require('./database/connectDB');
const logger = require('./config/logger');
const errorHandler = require('./middleware/errorHandler');

// Initialize Express App & HTTP Server
const app = express();

// ⚠️ এই লাইনটি যোগ করুন (Render-এর জন্য জরুরি)
app.set('trust proxy', true); 

const server = http.createServer(app);

// ... বাকি কোড আগের মতোই থাকবে
