const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema(
  {
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donor',
      required: [true, 'Donor is required'],
    },
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      default: null, // null = general fund
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'], // in cents
    },
    currency: {
      type: String,
      default: 'usd',
    },
    stripePaymentId: {
      type: String,
      default: '',
    },
    recurring: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

module.exports = mongoose.model('Donation', donationSchema);
