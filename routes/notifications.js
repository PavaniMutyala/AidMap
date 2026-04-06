const express = require('express');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Get user's notifications
router.get('/', protect, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const total = await Notification.countDocuments({ recipient: req.user._id });
    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      read: false,
    });

    const notifications = await Notification.find({ recipient: req.user._id })
      .populate('sender', 'name')
      .populate('relatedRequest', 'title status category')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ notifications, total, unreadCount, page: parseInt(page) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark notification as read
router.patch('/:id/read', protect, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { read: true },
      { new: true }
    );

    res.json({ notification });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark all as read
router.patch('/read-all', protect, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, read: false },
      { read: true }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
