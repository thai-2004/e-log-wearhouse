// Authentication Controller - Business Logic
const User = require('../models/User');
const { generateAccessToken, verifyToken, generateRefreshToken, blacklistToken } = require('../config/jwt');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

// Đăng ký user mới
const register = async(req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { username, email, password, fullName, role = 'user' } = req.body;

    // Kiểm tra username đã tồn tại
    const existingUser = await User.findOne({
      $or: [{ username }, { email }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Username or email already exists'
      });
    }

    // Tạo user mới (password sẽ được hash tự động trong User model)
    const user = new User({
      username,
      email,
      passwordHash: password, // Pass raw password, model will hash it
      fullName,
      role,
      isActive: true
    });

    await user.save();

    // Tạo tokens
    const accessToken = generateAccessToken({ userId: user._id, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user._id });

    // Lưu refresh token vào database với expiry
    const refreshTokenExpiry = new Date();
    refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 7); // 7 ngày

    user.refreshToken = refreshToken;
    user.refreshTokenExpiry = refreshTokenExpiry;
    await user.save();

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt
        },
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed'
    });
  }
};

// Đăng nhập
const login = async(req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { username, password } = req.body;

    const identifier = typeof username === 'string' ? username.trim() : '';
    if (!identifier) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    const normalizedIdentifier = identifier.toLowerCase();

    // Tìm user theo username hoặc email (không phân biệt hoa thường)
    const user = await User.findOne({
      $or: [{ username: normalizedIdentifier }, { email: normalizedIdentifier }]
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Kiểm tra password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Kiểm tra user có active không
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Tạo tokens
    const accessToken = generateAccessToken({ userId: user._id, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user._id });

    // Cập nhật refresh token và lastLogin với expiry
    const refreshTokenExpiry = new Date();
    refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 7); // 7 ngày

    user.refreshToken = refreshToken;
    user.refreshTokenExpiry = refreshTokenExpiry;
    user.lastLogin = new Date();
    await user.save();

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          isActive: user.isActive,
          lastLogin: user.lastLogin
        },
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
};

// Refresh token
const refreshToken = async(req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token required'
      });
    }

    // Verify refresh token từ database
    const decoded = await verifyToken(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    // Kiểm tra refresh token có hết hạn không
    if (user.refreshTokenExpiry && user.refreshTokenExpiry < new Date()) {
      // Xóa refresh token hết hạn
      user.refreshToken = null;
      user.refreshTokenExpiry = null;
      await user.save();

      return res.status(401).json({
        success: false,
        message: 'Refresh token expired'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Tạo access token mới
    const newAccessToken = generateAccessToken({ userId: user._id, role: user.role });

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken: newAccessToken
      }
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
};

// Đăng xuất
const logout = async(req, res) => {
  try {
    const userId = req.user._id;
    const authHeader = req.headers['authorization'];
    const accessToken = authHeader && authHeader.split(' ')[1];

    // Xóa refresh token khỏi database
    await User.findByIdAndUpdate(userId, {
      refreshToken: null,
      refreshTokenExpiry: null
    });

    // Thêm access token vào blacklist
    if (accessToken) {
      await blacklistToken(accessToken, userId, 'logout');
    }

    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
};

// Đổi mật khẩu
const changePassword = async(req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Kiểm tra mật khẩu hiện tại
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash mật khẩu mới
    const saltRounds = 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Cập nhật mật khẩu và xóa tất cả tokens
    user.passwordHash = newPasswordHash;
    user.refreshToken = null;
    user.refreshTokenExpiry = null;
    await user.save();

    // Thêm access token hiện tại vào blacklist
    const authHeader = req.headers['authorization'];
    const accessToken = authHeader && authHeader.split(' ')[1];
    if (accessToken) {
      await blacklistToken(accessToken, userId, 'password_change');
    }

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Password change failed'
    });
  }
};

// Lấy thông tin profile
const getProfile = async(req, res) => {
  try {
    const user = req.user;

    res.json({
      success: true,
      data: {
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin
        }
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile'
    });
  }
};

// Cập nhật profile
const updateProfile = async(req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { fullName, email } = req.body;
    const userId = req.user._id;

    // Kiểm tra email đã tồn tại (trừ user hiện tại)
    if (email) {
      const existingUser = await User.findOne({
        _id: { $ne: userId },
        email
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }
    }

    const updateData = {};
    if (fullName) updateData.fullName = fullName;
    if (email) updateData.email = email;

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, select: '-passwordHash -refreshToken' }
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Profile update failed'
    });
  }
};

// Development only - Reset rate limit
const resetRateLimit = async(req, res) => {
  try {
    // This is a development-only endpoint
    // In production, this should be removed or properly secured

    // Clear rate limit for the current IP
    // Note: This is a simple implementation. In production, you'd want to use Redis
    // or another proper rate limiting store

    res.json({
      success: true,
      message: 'Rate limit reset successfully for development'
    });
  } catch (error) {
    console.error('Rate limit reset error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset rate limit'
    });
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  changePassword,
  getProfile,
  updateProfile,
  resetRateLimit
};