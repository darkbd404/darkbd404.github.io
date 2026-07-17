const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @desc    Search users
// @route   GET /api/users/search?q=name
// @access  Private
router.get('/search', protect, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ success: false, message: 'Search query required' });

    const users = await User.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { displayName: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ]
    }).select('name displayName profilePhoto isOnline lastSeen');

    res.status(200).json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

module.exports = router;
