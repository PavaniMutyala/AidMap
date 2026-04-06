const express = require('express');
const User = require('../models/User');
const HelpRequest = require('../models/HelpRequest');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all volunteers
router.get('/', protect, authorize('coordinator', 'admin'), async (req, res) => {
  try {
    const { skill, available, page = 1, limit = 20 } = req.query;
    const query = { role: 'volunteer' };

    if (skill) query.skills = skill;
    if (available !== undefined) query.isAvailable = available === 'true';

    const total = await User.countDocuments(query);
    const volunteers = await User.find(query)
      .select('-password')
      .sort({ rating: -1, tasksCompleted: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      volunteers,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get volunteer stats
router.get('/stats', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const totalTasks = await HelpRequest.countDocuments({
      assignedVolunteer: userId,
    });
    const completedTasks = await HelpRequest.countDocuments({
      assignedVolunteer: userId,
      status: 'completed',
    });
    const activeTasks = await HelpRequest.countDocuments({
      assignedVolunteer: userId,
      status: { $in: ['assigned', 'in-progress'] },
    });

    // Category breakdown
    const categoryBreakdown = await HelpRequest.aggregate([
      { $match: { assignedVolunteer: userId, status: 'completed' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    res.json({
      totalTasks,
      completedTasks,
      activeTasks,
      categoryBreakdown,
      rating: req.user.rating,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get volunteer's assigned tasks
router.get('/my-tasks', protect, authorize('volunteer'), async (req, res) => {
  try {
    const { status } = req.query;
    const query = { assignedVolunteer: req.user._id };
    if (status) query.status = status;

    const tasks = await HelpRequest.find(query)
      .populate('requester', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({ tasks });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Toggle availability
router.patch('/availability', protect, authorize('volunteer'), async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.isAvailable = !user.isAvailable;
    await user.save();

    res.json({ isAvailable: user.isAvailable });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single volunteer details
router.get('/:id', protect, authorize('coordinator', 'admin'), async (req, res) => {
  try {
    const volunteer = await User.findById(req.params.id).select('-password');
    if (!volunteer || volunteer.role !== 'volunteer') {
      return res.status(404).json({ message: 'Volunteer not found' });
    }

    const tasks = await HelpRequest.find({ assignedVolunteer: volunteer._id })
      .populate('requester', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({ volunteer, recentTasks: tasks });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
