const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// @desc    Add contact
// @route   POST /api/contacts/add
// @access  Private
router.post('/add', protect, async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(req.user.id);
    
    if (!user.contacts.includes(userId)) {
      user.contacts.push(userId);
      await user.save();
    }
    
    res.status(200).json({ success: true, message: 'Contact added' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @desc    Get contacts
// @route   GET /api/contacts
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('contacts', 'name displayName profilePhoto isOnline lastSeen');
    res.status(200).json({ success: true, data: user.contacts });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

module.exports = router;
