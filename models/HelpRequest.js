const mongoose = require('mongoose');

const helpRequestSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: 2000,
    },
    category: {
      type: String,
      required: true,
      enum: [
        'food',
        'medical',
        'shelter',
        'education',
        'sanitation',
        'disaster-relief',
        'clothing',
        'mental-health',
        'other',
      ],
    },
    urgency: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['pending', 'assigned', 'in-progress', 'completed', 'cancelled'],
      default: 'pending',
    },
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedVolunteer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        required: true,
      },
      address: {
        type: String,
        required: true,
      },
    },
    requiredSkills: [
      {
        type: String,
        enum: [
          'medical',
          'teaching',
          'cooking',
          'driving',
          'counseling',
          'construction',
          'first-aid',
          'logistics',
          'tech-support',
          'translation',
          'childcare',
          'elderly-care',
          'disaster-relief',
          'sanitation',
          'fundraising',
        ],
      },
    ],
    numberOfPeopleAffected: {
      type: Number,
      default: 1,
    },
    completedAt: Date,
    notes: [
      {
        text: String,
        author: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

helpRequestSchema.index({ 'location.coordinates': '2dsphere' });
helpRequestSchema.index({ status: 1, category: 1 });
helpRequestSchema.index({ requester: 1 });
helpRequestSchema.index({ assignedVolunteer: 1 });

module.exports = mongoose.model('HelpRequest', helpRequestSchema);
