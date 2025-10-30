// Mongoose Product Model
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  sku: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  },
  barcode: {
    type: String,
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
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: false
  },
  unit: {
    type: String,
    required: true,
    trim: true
  },
  weight: {
    type: Number,
    default: 0 // kg
  },
  dimensions: {
    type: String,
    trim: true // DxRxC cm
  },
  costPrice: {
    type: Number,
    default: 0
  },
  sellingPrice: {
    type: Number,
    default: 0
  },
  minStock: {
    type: Number,
    default: 0
  },
  maxStock: {
    type: Number,
    default: 0
  },
  reorderPoint: {
    type: Number,
    default: 0
  },
  imageUrl: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
productSchema.index({ sku: 1 }, { unique: true });
productSchema.index({ barcode: 1 }, { unique: true, sparse: true });
productSchema.index({ categoryId: 1 });
productSchema.index({ name: 'text', description: 'text' }); // Full-text search

module.exports = mongoose.model('Product', productSchema);
