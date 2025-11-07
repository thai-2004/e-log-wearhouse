// Auth Middleware
const jwt = require('jsonwebtoken');
const { verifyToken } = require('../config/jwt');
const { HTTP_STATUS, USER_ROLES } = require('../config/constants');
const User = require('../models/User');

// Middleware xác thực JWT token
const authenticateToken = async(req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    // Log chi tiết cho inventory routes
    if (req.path?.includes('/inventory') && req.method === 'POST') {
      console.log('🔐 [Auth Middleware] Inventory CREATE request detected');
      console.log('🔐 [Auth Middleware] Authorization header:', authHeader ? 'Present' : 'Missing');
      console.log('🔐 [Auth Middleware] Token extracted:', token ? `${token.substring(0, 20)}...` : 'No token');
    }

    if (!token) {
      if (req.path?.includes('/inventory') && req.method === 'POST') {
        console.error('❌ [Auth Middleware] CREATE INVENTORY failed - No token provided');
      }
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Access token required'
      });
    }

    const decoded = await verifyToken(token);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      if (req.path?.includes('/inventory') && req.method === 'POST') {
        console.error('❌ [Auth Middleware] CREATE INVENTORY failed - User not found');
      }
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.isActive) {
      if (req.path?.includes('/inventory') && req.method === 'POST') {
        console.error('❌ [Auth Middleware] CREATE INVENTORY failed - Account deactivated');
      }
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    if (req.path?.includes('/inventory') && req.method === 'POST') {
      console.log('✅ [Auth Middleware] Token verified successfully');
      console.log('✅ [Auth Middleware] User authenticated:', `${user.username} (${user.role})`);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.message === 'Token has been revoked') {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Token has been revoked'
      });
    }

    if (error.message === 'Invalid or expired token') {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Token verification failed'
    });
  }
};

// Middleware phân quyền theo role
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

// Middleware kiểm tra quyền sở hữu hoặc admin
const authorizeOwnerOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: 'Authentication required'
    });
  }

  // Admin có thể truy cập tất cả
  if (req.user.role === USER_ROLES.ADMIN) {
    return next();
  }

  // Kiểm tra quyền sở hữu (có thể customize theo resource)
  const resourceUserId = req.params.userId || req.body.userId || req.user._id;

  if (req.user._id.toString() !== resourceUserId.toString()) {
    return res.status(HTTP_STATUS.FORBIDDEN).json({
      success: false,
      message: 'Access denied. You can only access your own resources'
    });
  }

  next();
};

// Middleware optional authentication (không bắt buộc đăng nhập)
const optionalAuth = async(req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');

      if (user && user.isActive) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // Ignore token errors for optional auth
    next();
  }
};

module.exports = {
  authenticateToken,
  authorize,
  authorizeOwnerOrAdmin,
  optionalAuth
};