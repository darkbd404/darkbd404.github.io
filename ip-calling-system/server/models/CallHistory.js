const mongoose = require('mongoose');

const CallHistorySchema = new mongoose.Schema({
  caller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['completed', 'missed', 'rejected', 'busy'],
    required: true
  },
  duration: {
    type: Number, // Duration in seconds
    default: 0
  },
  type: {
    type: String,
    enum: ['voice', 'video'],
    default: 'voice'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('CallHistory', CallHistorySchema);
