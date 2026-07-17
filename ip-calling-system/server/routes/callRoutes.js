const express = require('express');
const router = express.Router();
const CallHistory = require('../models/CallHistory');
const { protect } = require('../middleware/authMiddleware');

// @desc    Save call history
// @route   POST /api/calls/history
// @access  Private
router.post('/history', protect, async (req, res) => {
  try {
    const { receiverId, status, duration, type } = req.body;
    
    const callRecord = await CallHistory.create({
      caller: req.user.id,
      receiver: receiverId,
      status,
      duration,
      type
    });

    res.status(201).json({ success: true, data: callRecord });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @desc    Get call history
// @route   GET /api/calls/history
// @access  Private
router.get('/history', protect, async (req, res) => {
  try {
    const history = await CallHistory.find({
      $or: [{ caller: req.user.id }, { receiver: req.user.id }]
    })
    .populate('caller', 'name displayName profilePhoto')
    .populate('receiver', 'name displayName profilePhoto')
    .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: history });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

module.exports = router;
