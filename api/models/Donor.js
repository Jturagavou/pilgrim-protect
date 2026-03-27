const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const donorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
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
    stripeCustomerId: {
      type: String,
      default: '',
    },
    sponsoredSchools: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
      },
    ],
    totalDonated: {
      type: Number,
      default: 0,
    },
    receiveUpdates: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Hash password before save
donorSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
donorSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Donor', donorSchema);
