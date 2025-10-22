// Mongoose StockMovement Model
const mongoose = require('mongoose');

const stockMovementSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  warehouseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Warehouse',
    required: true
  },
  locationId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  type: {
    type: String,
    enum: ['inbound', 'outbound', 'transfer', 'adjustment', 'return'],
    required: true
  },
  referenceType: {
    type: String,
    enum: ['inbound', 'outbound', 'adjustment', 'stock_take'],
    required: true
  },
  referenceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  quantityBefore: {
    type: Number,
    required: true,
    min: 0
  },
  quantityChange: {
    type: Number,
    required: true
  },
  quantityAfter: {
    type: Number,
    required: true,
    min: 0
  },
  unitPrice: {
    type: Number,
    default: 0,
    min: 0
  },
  notes: {
    type: String,
    trim: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes
stockMovementSchema.index({ productId: 1 });
stockMovementSchema.index({ warehouseId: 1 });
stockMovementSchema.index({ type: 1 });
stockMovementSchema.index({ createdAt: -1 });
stockMovementSchema.index({ referenceType: 1, referenceId: 1 });

module.exports = mongoose.model('StockMovement', stockMovementSchema);
