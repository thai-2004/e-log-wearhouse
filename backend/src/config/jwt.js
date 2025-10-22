// Cấu hình JWT
require('dotenv').config();
const jwt = require('jsonwebtoken');
const TokenBlacklist = require('../models/TokenBlacklist');

// Validate JWT secrets
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

// Tạo access token
const generateAccessToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'e-logistics-api',
    audience: 'e-logistics-client'
  });
};

// Tạo refresh token
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
    issuer: 'e-logistics-api',
    audience: 'e-logistics-client'
  });
};

// Verify token với blacklist check
const verifyToken = async (token, secret = JWT_SECRET) => {
  try {
    // Kiểm tra token có trong blacklist không
    const blacklistedToken = await TokenBlacklist.findOne({ token });
    if (blacklistedToken) {
      throw new Error('Token has been revoked');
    }
    
    return jwt.verify(token, secret);
  } catch (error) {
    if (error.message === 'Token has been revoked') {
      throw error;
    }
    throw new Error('Invalid or expired token');
  }
};

// Decode token without verification (for debugging)
const decodeToken = (token) => {
  return jwt.decode(token);
};

// Thêm token vào blacklist
const blacklistToken = async (token, userId, reason = 'logout') => {
  try {
    const decoded = jwt.decode(token);
    const expiresAt = new Date(decoded.exp * 1000);
    
    await TokenBlacklist.create({
      token,
      userId,
      expiresAt,
      reason
    });
  } catch (error) {
    console.error('Error blacklisting token:', error);
  }
};

module.exports = {
  JWT_SECRET,
  JWT_REFRESH_SECRET,
  JWT_EXPIRES_IN,
  JWT_REFRESH_EXPIRES_IN,
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  decodeToken,
  blacklistToken
};