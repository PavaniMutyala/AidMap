const express = require('express');
const HelpRequest = require('../models/HelpRequest');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// AI-based volunteer matching
const matchVolunteers = async (helpRequest) => {
  const skillMap = {
    food: ['cooking', 'driving', 'logistics'],
    medical: ['medical', 'first-aid', 'counseling'],
    shelter: ['construction', 'logistics', 'driving'],
    education: ['teaching', 'counseling', 'translation'],
    sanitation: ['sanitation', 'construction', 'logistics'],
    'disaster-relief': ['disaster-relief', 'first-aid', 'logistics', 'driving'],
    clothing: ['logistics', 'driving', 'fundraising'],
    'mental-health': ['counseling', 'medical'],
    other: [],
  };

  const relevantSkills = [
    ...(helpRequest.requiredSkills || []),
    ...(skillMap[helpRequest.category] || []),
  ];

  const uniqueSkills = [...new Set(relevantSkills)];

  let query = {
    role: 'volunteer',
    isAvailable: true,
  };

  if (uniqueSkills.length > 0) {
    query.skills = { $in: uniqueSkills };
  }

  // Find nearby volunteers (within 50km)
  if (helpRequest.location && helpRequest.location.coordinates[0] !== 0) {
    query['location.coordinates'] = {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: helpRequest.location.coordinates,
        },
        $maxDistance: 50000, // 50km
      },
    };
  }

  try {
    let volunteers = await User.find(query).limit(10).sort({ rating: -1, tasksCompleted: -1 });

    // If no nearby volunteers with matching skills, broaden search
    if (volunteers.length === 0) {
      volunteers = await User.find({
        role: 'volunteer',
        isAvailable: true,
      })
        .limit(10)
        .sort({ rating: -1 });
    }

    return volunteers;
  } catch (err) {
    // Fallback without geospatial query
    return await User.find({
      role: 'volunteer',
      isAvailable: true,
      skills: { $in: uniqueSkills },
    })
      .limit(10)
      .sort({ rating: -1 });
  }
};

// Create help request
router.post('/', protect, async (req, res) => {
  try {
    const { title, description, category, urgency, location, requiredSkills, numberOfPeopleAffected } = req.body;

    const helpRequest = await HelpRequest.create({
      title,
      description,
      category,
      urgency,
      location,
      requiredSkills,
      numberOfPeopleAffected,
      requester: req.user._id,
    });

    const populated = await HelpRequest.findById(helpRequest._id).populate('requester', 'name email phone');

    // Find matching volunteers and notify them
    const matchedVolunteers = await matchVolunteers(helpRequest);

    for (const volunteer of matchedVolunteers) {
      const notification = await Notification.create({
        recipient: volunteer._id,
        sender: req.user._id,
        type: 'volunteer-matched',
        title: 'New Help Request Nearby',
        message: `A new ${category} help request "${title}" needs your skills. Urgency: ${urgency}`,
        relatedRequest: helpRequest._id,
      });

      const io = req.app.get('io');
      io.to(volunteer._id.toString()).emit('notification', notification);
    }

    // Notify coordinators
    const coordinators = await User.find({ role: { $in: ['coordinator', 'admin'] } });
    for (const coord of coordinators) {
      const notification = await Notification.create({
        recipient: coord._id,
        sender: req.user._id,
        type: 'help-request-created',
        title: 'New Help Request',
        message: `New ${urgency} priority ${category} request: "${title}"`,
        relatedRequest: helpRequest._id,
      });

      const io = req.app.get('io');
      io.to(coord._id.toString()).emit('notification', notification);
    }

    res.status(201).json({
      helpRequest: populated,
      matchedVolunteers: matchedVolunteers.map((v) => ({
        _id: v._id,
        name: v.name,
        skills: v.skills,
        rating: v.rating,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all help requests
router.get('/', protect, async (req, res) => {
  try {
    const { status, category, urgency, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status) query.status = status;
    if (category) query.category = category;
    if (urgency) query.urgency = urgency;

    // Community users only see their own requests
    if (req.user.role === 'community') {
      query.requester = req.user._id;
    }

    const total = await HelpRequest.countDocuments(query);
    const helpRequests = await HelpRequest.find(query)
      .populate('requester', 'name email phone')
      .populate('assignedVolunteer', 'name email phone skills')
      .populate('assignedBy', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      helpRequests,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single help request
router.get('/:id', protect, async (req, res) => {
  try {
    const helpRequest = await HelpRequest.findById(req.params.id)
      .populate('requester', 'name email phone')
      .populate('assignedVolunteer', 'name email phone skills')
      .populate('assignedBy', 'name')
      .populate('notes.author', 'name');

    if (!helpRequest) {
      return res.status(404).json({ message: 'Help request not found' });
    }

    // Get matched volunteers
    const matchedVolunteers = await matchVolunteers(helpRequest);

    res.json({
      helpRequest,
      matchedVolunteers: matchedVolunteers.map((v) => ({
        _id: v._id,
        name: v.name,
        skills: v.skills,
        rating: v.rating,
        tasksCompleted: v.tasksCompleted,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Assign volunteer to request
router.patch('/:id/assign', protect, authorize('coordinator', 'admin'), async (req, res) => {
  try {
    const { volunteerId } = req.body;
    const helpRequest = await HelpRequest.findById(req.params.id);

    if (!helpRequest) {
      return res.status(404).json({ message: 'Help request not found' });
    }

    helpRequest.assignedVolunteer = volunteerId;
    helpRequest.assignedBy = req.user._id;
    helpRequest.status = 'assigned';
    await helpRequest.save();

    const populated = await HelpRequest.findById(helpRequest._id)
      .populate('requester', 'name email phone')
      .populate('assignedVolunteer', 'name email phone skills')
      .populate('assignedBy', 'name');

    // Notify volunteer
    const notification = await Notification.create({
      recipient: volunteerId,
      sender: req.user._id,
      type: 'help-request-assigned',
      title: 'Task Assigned to You',
      message: `You have been assigned to: "${helpRequest.title}"`,
      relatedRequest: helpRequest._id,
    });

    const io = req.app.get('io');
    io.to(volunteerId.toString()).emit('notification', notification);

    // Notify requester
    const reqNotification = await Notification.create({
      recipient: helpRequest.requester,
      type: 'help-request-assigned',
      title: 'Volunteer Assigned',
      message: `A volunteer has been assigned to your request: "${helpRequest.title}"`,
      relatedRequest: helpRequest._id,
    });
    io.to(helpRequest.requester.toString()).emit('notification', reqNotification);

    res.json({ helpRequest: populated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Accept a task (volunteer)
router.patch('/:id/accept', protect, authorize('volunteer'), async (req, res) => {
  try {
    const helpRequest = await HelpRequest.findById(req.params.id);
    if (!helpRequest) {
      return res.status(404).json({ message: 'Help request not found' });
    }

    helpRequest.assignedVolunteer = req.user._id;
    helpRequest.status = 'in-progress';
    await helpRequest.save();

    const populated = await HelpRequest.findById(helpRequest._id)
      .populate('requester', 'name email phone')
      .populate('assignedVolunteer', 'name email phone skills');

    // Notify requester
    const notification = await Notification.create({
      recipient: helpRequest.requester,
      sender: req.user._id,
      type: 'task-accepted',
      title: 'Volunteer Accepted Your Request',
      message: `${req.user.name} has accepted your help request: "${helpRequest.title}"`,
      relatedRequest: helpRequest._id,
    });

    const io = req.app.get('io');
    io.to(helpRequest.requester.toString()).emit('notification', notification);

    res.json({ helpRequest: populated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Complete a task
router.patch('/:id/complete', protect, async (req, res) => {
  try {
    const helpRequest = await HelpRequest.findById(req.params.id);
    if (!helpRequest) {
      return res.status(404).json({ message: 'Help request not found' });
    }

    helpRequest.status = 'completed';
    helpRequest.completedAt = new Date();
    await helpRequest.save();

    // Update volunteer stats
    if (helpRequest.assignedVolunteer) {
      await User.findByIdAndUpdate(helpRequest.assignedVolunteer, {
        $inc: { tasksCompleted: 1 },
      });
    }

    // Notify requester
    const notification = await Notification.create({
      recipient: helpRequest.requester,
      type: 'help-request-completed',
      title: 'Request Completed',
      message: `Your help request "${helpRequest.title}" has been completed!`,
      relatedRequest: helpRequest._id,
    });

    const io = req.app.get('io');
    io.to(helpRequest.requester.toString()).emit('notification', notification);

    const populated = await HelpRequest.findById(helpRequest._id)
      .populate('requester', 'name email phone')
      .populate('assignedVolunteer', 'name email phone skills');

    res.json({ helpRequest: populated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update status
router.patch('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const helpRequest = await HelpRequest.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
      .populate('requester', 'name email phone')
      .populate('assignedVolunteer', 'name email phone skills');

    res.json({ helpRequest });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get map data (all active requests for map visualization)
router.get('/map/data', protect, async (req, res) => {
  try {
    const helpRequests = await HelpRequest.find({
      status: { $in: ['pending', 'assigned', 'in-progress'] },
    })
      .populate('requester', 'name')
      .select('title category urgency status location numberOfPeopleAffected createdAt');

    res.json({ helpRequests });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
