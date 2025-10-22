// Mongoose Inbound Model
const mongoose = require('mongoose');

// Item sub-schema for inbound items
const inboundItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  locationId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  taxRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  discountRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  notes: {
    type: String,
    trim: true
  }
}, { _id: true });

// Main inbound schema
const inboundSchema = new mongoose.Schema({
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
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  inboundDate: {
    type: Date,
    required: true
  },
  invoiceNumber: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'approved', 'completed', 'cancelled'],
    default: 'draft'
  },
  items: [inboundItemSchema],
  totalAmount: {
    type: Number,
    default: 0
  },
  taxAmount: {
    type: Number,
    default: 0
  },
  discountAmount: {
    type: Number,
    default: 0
  },
  finalAmount: {
    type: Number,
    default: 0
  },
  notes: {
    type: String,
    trim: true
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
inboundSchema.index({ warehouseId: 1 });
inboundSchema.index({ supplierId: 1 });
inboundSchema.index({ status: 1 });
inboundSchema.index({ inboundDate: 1 });

// Pre-save middleware to calculate amounts
inboundSchema.pre('save', function(next) {
  if (this.items && this.items.length > 0) {
    this.totalAmount = this.items.reduce((sum, item) => sum + item.amount, 0);
    this.taxAmount = this.items.reduce((sum, item) => {
      return sum + (item.amount * item.taxRate / 100);
    }, 0);
    this.discountAmount = this.items.reduce((sum, item) => {
      return sum + (item.amount * item.discountRate / 100);
    }, 0);
    this.finalAmount = this.totalAmount + this.taxAmount - this.discountAmount;
  }
  next();
});

module.exports = mongoose.model('Inbound', inboundSchema);
