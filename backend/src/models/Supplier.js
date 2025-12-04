// Mongoose Supplier Model
const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
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
  contactPerson: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  taxCode: {
    type: String,
    trim: true
  },
  bankAccount: {
    type: String,
    trim: true
  },
  bankName: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    trim: true
  },
  website: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  isTopSupplier: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
supplierSchema.index({ name: 1 });

module.exports = mongoose.model('Supplier', supplierSchema);
