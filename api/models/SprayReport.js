const mongoose = require('mongoose');

const sprayReportSchema = new mongoose.Schema(
  {
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: [true, 'School is required'],
    },
    worker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Worker',
      required: [true, 'Worker is required'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    roomsSprayed: {
      type: Number,
      required: [true, 'Rooms sprayed count is required'],
    },
    photos: {
      type: [String], // Cloudinary URLs
      default: [],
    },
    notes: {
      type: String,
      default: '',
    },
    gpsCoords: {
      lat: { type: Number },
      lng: { type: Number },
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

module.exports = mongoose.model('SprayReport', sprayReportSchema);
