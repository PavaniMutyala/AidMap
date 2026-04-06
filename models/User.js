const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false,
    },
    phone: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ['community', 'volunteer', 'coordinator', 'admin'],
      default: 'community',
    },
    skills: [
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
    helpType: {
      type: String,
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
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
      address: String,
    },
    avatar: {
      type: String,
      default: '',
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    tasksCompleted: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 5,
      min: 1,
      max: 5,
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index({ 'location.coordinates': '2dsphere' });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
