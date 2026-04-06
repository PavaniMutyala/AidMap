const express = require('express');
const HelpRequest = require('../models/HelpRequest');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Dashboard analytics
router.get('/dashboard', protect, authorize('admin', 'coordinator'), async (req, res) => {
  try {
    const totalRequests = await HelpRequest.countDocuments();
    const pendingRequests = await HelpRequest.countDocuments({ status: 'pending' });
    const activeRequests = await HelpRequest.countDocuments({
      status: { $in: ['assigned', 'in-progress'] },
    });
    const completedRequests = await HelpRequest.countDocuments({ status: 'completed' });
    const totalVolunteers = await User.countDocuments({ role: 'volunteer' });
    const activeVolunteers = await User.countDocuments({
      role: 'volunteer',
      isAvailable: true,
    });
    const totalCommunityUsers = await User.countDocuments({ role: 'community' });

    // Requests by category
    const categoryStats = await HelpRequest.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Requests by urgency
    const urgencyStats = await HelpRequest.aggregate([
      { $group: { _id: '$urgency', count: { $sum: 1 } } },
    ]);

    // Requests by status
    const statusStats = await HelpRequest.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // Weekly trends (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const weeklyTrend = await HelpRequest.aggregate([
      { $match: { createdAt: { $gte: weekAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Top volunteers
    const topVolunteers = await User.find({ role: 'volunteer' })
      .select('name tasksCompleted rating skills')
      .sort({ tasksCompleted: -1 })
      .limit(5);

    // People affected
    const totalPeopleHelped = await HelpRequest.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$numberOfPeopleAffected' } } },
    ]);

    res.json({
      overview: {
        totalRequests,
        pendingRequests,
        activeRequests,
        completedRequests,
        totalVolunteers,
        activeVolunteers,
        totalCommunityUsers,
        totalPeopleHelped: totalPeopleHelped[0]?.total || 0,
      },
      categoryStats,
      urgencyStats,
      statusStats,
      weeklyTrend,
      topVolunteers,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Weekly report
router.get('/weekly-report', protect, authorize('admin', 'coordinator'), async (req, res) => {
  try {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const newRequests = await HelpRequest.countDocuments({
      createdAt: { $gte: weekAgo },
    });
    const completedThisWeek = await HelpRequest.countDocuments({
      completedAt: { $gte: weekAgo },
    });
    const newVolunteers = await User.countDocuments({
      role: 'volunteer',
      createdAt: { $gte: weekAgo },
    });

    const categoryBreakdown = await HelpRequest.aggregate([
      { $match: { createdAt: { $gte: weekAgo } } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json({
      period: { from: weekAgo, to: new Date() },
      newRequests,
      completedThisWeek,
      newVolunteers,
      categoryBreakdown,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
