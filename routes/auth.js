const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, role, skills, helpType, location } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: role || 'community',
      skills: skills || [],
      helpType,
      location: location || { type: 'Point', coordinates: [0, 0] },
    });

    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        skills: user.skills,
        helpType: user.helpType,
        location: user.location,
        tasksCompleted: user.tasksCompleted,
        rating: user.rating,
        isAvailable: user.isAvailable,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    user.lastActive = Date.now();
    await user.save();

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        skills: user.skills,
        helpType: user.helpType,
        location: user.location,
        tasksCompleted: user.tasksCompleted,
        rating: user.rating,
        isAvailable: user.isAvailable,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get current user
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, phone, skills, helpType, location, isAvailable } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (skills) user.skills = skills;
    if (helpType) user.helpType = helpType;
    if (location) user.location = location;
    if (typeof isAvailable === 'boolean') user.isAvailable = isAvailable;

    await user.save();
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
