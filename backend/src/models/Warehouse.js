// Mongoose Warehouse Model
const mongoose = require('mongoose');

// Location sub-schema
const locationSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  rowNumber: {
    type: String,
    trim: true
  },
  shelfNumber: {
    type: String,
    trim: true
  },
  levelNumber: {
    type: String,
    trim: true
  },
  capacity: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { _id: true });

// Zone sub-schema
const zoneSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  locations: [locationSchema],
  isActive: {
    type: Boolean,
    default: true
  }
}, { _id: true });

// Main warehouse schema
const warehouseSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  area: {
    type: Number,
    default: 0 // m2
  },
  capacity: {
    type: Number,
    default: 0 // tons or m3
  },
  managerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  phone: {
    type: String,
    trim: true
  },
  zones: [zoneSchema],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
warehouseSchema.index({ managerId: 1 });

module.exports = mongoose.model('Warehouse', warehouseSchema);
