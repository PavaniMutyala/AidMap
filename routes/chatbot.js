const express = require('express');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Rule-based chatbot responses
const faqDatabase = {
  greetings: {
    patterns: ['hello', 'hi', 'hey', 'good morning', 'good evening', 'greetings'],
    response:
      "Hello! 👋 Welcome to AidMap. I'm here to help you navigate the platform. How can I assist you today?",
  },
  whatIsAidmap: {
    patterns: ['what is aidmap', 'about aidmap', 'tell me about', 'what does aidmap do'],
    response:
      'AidMap is a Smart Volunteer Allocation System that connects communities in need with nearby volunteers. Communities can post help requests, and our system automatically matches them with skilled volunteers based on location and expertise.',
  },
  howToRegister: {
    patterns: ['how to register', 'sign up', 'create account', 'registration'],
    response:
      'To register on AidMap:\n1. Click "Register" on the home page\n2. Fill in your name, email, phone, and password\n3. Select your role (Community, Volunteer, or Coordinator)\n4. If you\'re a volunteer, select your skills\n5. Submit the form and you\'re ready to go!',
  },
  howToSubmitRequest: {
    patterns: ['submit request', 'ask for help', 'create request', 'need help', 'how to request'],
    response:
      'To submit a help request:\n1. Log in to your Community dashboard\n2. Click "New Help Request"\n3. Fill in the title, description, and category\n4. Set the urgency level and location\n5. Submit — our system will automatically find matching volunteers!',
  },
  volunteerInfo: {
    patterns: ['become volunteer', 'volunteer', 'how to volunteer', 'help others'],
    response:
      'To become a volunteer:\n1. Register with the "Volunteer" role\n2. Select your skills (medical, teaching, cooking, etc.)\n3. Set your location for nearby matching\n4. You\'ll receive notifications when help is needed in your area\n5. Accept tasks and start making a difference!',
  },
  categories: {
    patterns: ['categories', 'types of help', 'what kind of help', 'help types'],
    response:
      'AidMap supports these help categories:\n🍚 Food - Food supply and distribution\n🏥 Medical - Health and medical assistance\n🏠 Shelter - Housing and shelter needs\n📚 Education - Teaching and training\n🚰 Sanitation - Clean water and hygiene\n🌪️ Disaster Relief - Emergency response\n👕 Clothing - Clothing distribution\n🧠 Mental Health - Counseling support',
  },
  coordinator: {
    patterns: ['coordinator', 'manage volunteers', 'assign volunteers'],
    response:
      'Coordinators can:\n• View all volunteers and their skills\n• Assign volunteers to help requests\n• Monitor task progress\n• View areas needing help on the map\n• Generate reports on resource allocation',
  },
  map: {
    patterns: ['map', 'heat map', 'location', 'where is help needed'],
    response:
      'The AidMap interactive map shows:\n🔴 Red zones - Areas with critical needs\n🟡 Yellow zones - Medium priority areas\n🟢 Green zones - Areas with adequate support\n📍 Pin markers show individual help requests\nYou can filter by category and urgency level.',
  },
  notifications: {
    patterns: ['notifications', 'alerts', 'updates'],
    response:
      'AidMap sends real-time notifications for:\n• New help requests matching your skills\n• Task assignments and updates\n• Request completion confirmations\n• System announcements\nCheck the bell icon in the top bar for your notifications.',
  },
  contact: {
    patterns: ['contact', 'support', 'help desk', 'customer service'],
    response:
      'For support, you can:\n📧 Email: support@aidmap.org\n📞 Phone: +91-1800-AID-MAP\n💬 Use this chatbot for quick answers\n🌐 Visit our Help Center in the app',
  },
  thanks: {
    patterns: ['thank', 'thanks', 'appreciate', 'helpful'],
    response:
      "You're welcome! 😊 I'm glad I could help. Is there anything else you'd like to know about AidMap?",
  },
  bye: {
    patterns: ['bye', 'goodbye', 'see you', 'quit', 'exit'],
    response:
      'Goodbye! 👋 Thank you for using AidMap. Together, we can make a difference in our communities!',
  },
};

const findBestMatch = (message) => {
  const lowerMessage = message.toLowerCase().trim();

  for (const [key, data] of Object.entries(faqDatabase)) {
    for (const pattern of data.patterns) {
      if (lowerMessage.includes(pattern)) {
        return data.response;
      }
    }
  }

  return "I'm not sure I understand that. Here are some things I can help with:\n\n• What is AidMap?\n• How to register\n• How to submit a help request\n• How to become a volunteer\n• Types of help available\n• How the map works\n• Notification system\n• Contact support\n\nTry asking about any of these topics!";
};

// Chat endpoint
router.post('/', protect, async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({ message: 'Message is required' });
    }

    const response = findBestMatch(message);

    res.json({
      userMessage: message,
      botResponse: response,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
