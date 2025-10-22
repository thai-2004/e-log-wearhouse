// Mongoose Token Blacklist Model
const mongoose = require('mongoose');

const tokenBlacklistSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 } // Tự động xóa khi hết hạn
  },
  reason: {
    type: String,
    enum: ['logout', 'security_revoke', 'password_change'],
    default: 'logout'
  }
}, {
  timestamps: true
});

// Index để tối ưu hóa tìm kiếm
// token: 1 đã được tạo tự động bởi unique: true
tokenBlacklistSchema.index({ userId: 1 });

module.exports = mongoose.model('TokenBlacklist', tokenBlacklistSchema);
