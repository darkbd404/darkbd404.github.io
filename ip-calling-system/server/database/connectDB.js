const mongoose = require('mongoose');
const logger = require('../config/logger'); // ✅ পাথ ঠিক করা হয়েছে (config ফোল্ডার থেকে নেওয়ার জন্য)

const connectDatabase = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    logger.info(`MongoDB Connected Successfully: ${conn.connection.host}`);
  } catch (error) {
    logger.error(`Database connection error: ${error.message}`);
    process.exit(1); 
  }
};

module.exports = connectDatabase;
