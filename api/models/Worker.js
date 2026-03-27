const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const workerSchema = new mongoose.Schema(
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
    phone: {
      type: String,
      default: '',
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false,
    },
    assignedSchools: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
      },
    ],
    role: {
      type: String,
      enum: ['worker', 'supervisor', 'admin'],
      default: 'worker',
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Hash password before save
workerSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
workerSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Worker', workerSchema);
