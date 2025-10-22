// Mongoose StockAdjustment Model
const mongoose = require('mongoose');

// Item sub-schema for adjustment items
const adjustmentItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  locationId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  quantityBefore: {
    type: Number,
    required: true,
    min: 0
  },
  quantityAfter: {
    type: Number,
    required: true,
    min: 0
  },
  quantityChange: {
    type: Number,
    required: true
  },
  notes: {
    type: String,
    trim: true
  }
}, { _id: true });

// Main stock adjustment schema
const stockAdjustmentSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  warehouseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Warehouse',
    required: true
  },
  type: {
    type: String,
    enum: ['increase', 'decrease', 'damaged', 'lost', 'found'],
    required: true
  },
  reason: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['draft', 'approved', 'cancelled'],
    default: 'draft'
  },
  items: [adjustmentItemSchema],
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes
stockAdjustmentSchema.index({ warehouseId: 1 });
stockAdjustmentSchema.index({ status: 1 });

// Pre-save middleware to calculate quantity changes
stockAdjustmentSchema.pre('save', function(next) {
  if (this.items && this.items.length > 0) {
    this.items.forEach(item => {
      item.quantityChange = item.quantityAfter - item.quantityBefore;
    });
  }
  next();
});

module.exports = mongoose.model('StockAdjustment', stockAdjustmentSchema);
