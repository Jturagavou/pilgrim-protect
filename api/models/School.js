const mongoose = require('mongoose');

const schoolSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'School name is required'],
      trim: true,
    },
    district: {
      type: String,
      required: [true, 'District is required'],
      trim: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    totalRooms: {
      type: Number,
      default: 0,
    },
    studentCount: {
      type: Number,
      default: 0,
    },
    photos: {
      type: [String], // Cloudinary URLs
      default: [],
    },
    sponsor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donor',
      default: null,
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'completed'],
      default: 'pending',
    },
    lastSprayDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// GeoJSON index for map queries
schoolSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('School', schoolSchema);
