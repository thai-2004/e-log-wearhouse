// Mongoose StockTake Model
const mongoose = require('mongoose');

// Item sub-schema for stock take items
const stockTakeItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  locationId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  systemQuantity: {
    type: Number,
    required: true,
    min: 0
  },
  actualQuantity: {
    type: Number,
    min: 0
  },
  difference: {
    type: Number,
    default: 0
  },
  notes: {
    type: String,
    trim: true
  },
  countedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  countedAt: {
    type: Date
  }
}, { _id: true });

// Main stock take schema
const stockTakeSchema = new mongoose.Schema({
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
  takeDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'in_progress', 'completed', 'cancelled'],
    default: 'draft'
  },
  items: [stockTakeItemSchema],
  notes: {
    type: String,
    trim: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  completedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes
stockTakeSchema.index({ warehouseId: 1 });
stockTakeSchema.index({ status: 1 });

// Pre-save middleware to calculate differences
stockTakeSchema.pre('save', function(next) {
  if (this.items && this.items.length > 0) {
    this.items.forEach(item => {
      if (item.actualQuantity !== undefined) {
        item.difference = item.actualQuantity - item.systemQuantity;
      }
    });
  }
  next();
});

module.exports = mongoose.model('StockTake', stockTakeSchema);
