// Mongoose Inventory Model
const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
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
    required: false
  },
  quantity: {
    type: Number,
    default: 0,
    min: 0
  },
  reservedQuantity: {
    type: Number,
    default: 0,
    min: 0
  },
  availableQuantity: {
    type: Number,
    default: 0,
    min: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
// Duy nhất theo bộ 3 khi có locationId
inventorySchema.index(
  { productId: 1, warehouseId: 1, locationId: 1 },
  {
    unique: true,
    partialFilterExpression: { locationId: { $type: 'objectId' } }
  }
);
// Duy nhất theo bộ 2 khi KHÔNG có locationId (inventory không gắn vị trí)
inventorySchema.index(
  { productId: 1, warehouseId: 1 },
  {
    unique: true,
    partialFilterExpression: { locationId: { $exists: false } }
  }
);
inventorySchema.index({ productId: 1 });
inventorySchema.index({ warehouseId: 1 });

// Pre-save middleware to calculate available quantity
inventorySchema.pre('save', function(next) {
  // Đảm bảo reservedQuantity không vượt quá quantity
  if (this.reservedQuantity > this.quantity) {
    this.reservedQuantity = this.quantity;
  }

  // Tính availableQuantity
  this.availableQuantity = Math.max(0, this.quantity - this.reservedQuantity);
  this.lastUpdated = new Date();
  next();
});

// Virtual để validate
inventorySchema.pre('validate', function(next) {
  // Đảm bảo reservedQuantity không âm
  if (this.reservedQuantity < 0) {
    this.reservedQuantity = 0;
  }

  // Đảm bảo quantity không âm
  if (this.quantity < 0) {
    this.quantity = 0;
  }

  next();
});

module.exports = mongoose.model('Inventory', inventorySchema);
