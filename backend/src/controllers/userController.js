// User Controller - Business Logic
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const { HTTP_STATUS, USER_ROLES } = require('../config/constants');
const { handleError, createErrorResponse, createSuccessResponse } = require('../utils/errorHandler');
const { checkUniqueField, validatePagination } = require('../utils/validation');

// Tạo user mới
const createUser = async(req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const userData = req.body;

    // Kiểm tra username đã tồn tại
    const existingUsername = await checkUniqueField(User, 'username', userData.username);
    if (existingUsername) {
      return res.status(HTTP_STATUS.CONFLICT).json({
        success: false,
        message: 'Username already exists'
      });
    }

    // Kiểm tra email đã tồn tại
    const existingEmail = await checkUniqueField(User, 'email', userData.email);
    if (existingEmail) {
      return res.status(HTTP_STATUS.CONFLICT).json({
        success: false,
        message: 'Email already exists'
      });
    }

    // Tạo user mới
    const user = new User({
      username: userData.username,
      email: userData.email,
      passwordHash: userData.password,
      fullName: userData.fullName,
      phone: userData.phone,
      role: userData.role || USER_ROLES.STAFF,
      avatarUrl: userData.avatarUrl,
      isActive: userData.isActive !== undefined ? userData.isActive : true
    });

    await user.save();

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'User created successfully',
      data: { user }
    });
  } catch (error) {
    const errorResponse = createErrorResponse(error);
    res.status(errorResponse.status).json(errorResponse.data);
  }
};

// Lấy danh sách users
const getUsers = async(req, res) => {
  try {
    const { page, limit } = validatePagination(req.query.page, req.query.limit);
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const role = req.query.role;
    const isActive = req.query.isActive;

    const query = {};

    // Tìm kiếm
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { fullName: { $regex: search, $options: 'i' } }
      ];
    }

    // Lọc theo role
    if (role) {
      query.role = role;
    }

    // Lọc theo trạng thái
    // Nếu không có filter isActive, lấy tất cả users (cả active và inactive)
    // Nếu có filter, chỉ lấy users theo trạng thái được chỉ định
    if (isActive !== undefined && isActive !== null && isActive !== '') {
      // Chuyển đổi string 'true'/'false' thành boolean
      if (typeof isActive === 'string') {
        query.isActive = isActive === 'true';
      } else {
        query.isActive = Boolean(isActive);
      }
    }
    // Nếu không có filter isActive, không thêm điều kiện vào query
    // => lấy tất cả users (cả active và inactive)

    const users = await User.find(query)
      .select('-passwordHash -refreshToken')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    const errorResponse = createErrorResponse(error);
    res.status(errorResponse.status).json(errorResponse.data);
  }
};

// Lấy user theo ID
const getUserById = async(req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .select('-passwordHash -refreshToken');

    if (!user) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    const errorResponse = createErrorResponse(error);
    res.status(errorResponse.status).json(errorResponse.data);
  }
};

// Cập nhật user
const updateUser = async(req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { userId } = req.params;
    const updateData = req.body;

    // Kiểm tra username trùng lặp (trừ user hiện tại)
    if (updateData.username) {
      const existingUsername = await User.findOne({
        _id: { $ne: userId },
        username: updateData.username
      });
      if (existingUsername) {
        return res.status(HTTP_STATUS.CONFLICT).json({
          success: false,
          message: 'Username already exists'
        });
      }
    }

    // Kiểm tra email trùng lặp (trừ user hiện tại)
    if (updateData.email) {
      const existingEmail = await User.findOne({
        _id: { $ne: userId },
        email: updateData.email
      });
      if (existingEmail) {
        return res.status(HTTP_STATUS.CONFLICT).json({
          success: false,
          message: 'Email already exists'
        });
      }
    }

    // Hash password mới nếu có
    if (updateData.password) {
      const saltRounds = 12;
      updateData.passwordHash = await bcrypt.hash(updateData.password, saltRounds);
      delete updateData.password;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-passwordHash -refreshToken');

    if (!user) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      data: { user }
    });
  } catch (error) {
    const errorResponse = createErrorResponse(error);
    res.status(errorResponse.status).json(errorResponse.data);
  }
};

// Xóa user (soft delete)
const deleteUser = async(req, res) => {
  try {
    const { userId } = req.params;

    // Không cho phép xóa chính mình
    if (userId === req.user._id.toString()) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { isActive: false },
      { new: true }
    ).select('-passwordHash -refreshToken');

    if (!user) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User deactivated successfully',
      data: { user }
    });
  } catch (error) {
    const errorResponse = createErrorResponse(error);
    res.status(errorResponse.status).json(errorResponse.data);
  }
};

// Kích hoạt lại user
const activateUser = async(req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByIdAndUpdate(
      userId,
      { isActive: true },
      { new: true }
    ).select('-passwordHash -refreshToken');

    if (!user) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User activated successfully',
      data: { user }
    });
  } catch (error) {
    const errorResponse = createErrorResponse(error);
    res.status(errorResponse.status).json(errorResponse.data);
  }
};

// Đổi mật khẩu
const changePassword = async(req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { userId } = req.params;
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'User not found'
      });
    }

    // Kiểm tra mật khẩu hiện tại
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Gán mật khẩu mới để pre-save hook xử lý hash
    user.passwordHash = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    const errorResponse = createErrorResponse(error);
    res.status(errorResponse.status).json(errorResponse.data);
  }
};

// Cập nhật role
const updateUserRole = async(req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { userId } = req.params;
    const { role } = req.body;

    // Kiểm tra role hợp lệ
    if (!Object.values(USER_ROLES).includes(role)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Invalid role'
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select('-passwordHash -refreshToken');

    if (!user) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User role updated successfully',
      data: { user }
    });
  } catch (error) {
    const errorResponse = createErrorResponse(error);
    res.status(errorResponse.status).json(errorResponse.data);
  }
};

// Lấy thống kê users
const getUserStats = async(req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          activeUsers: {
            $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
          },
          inactiveUsers: {
            $sum: { $cond: [{ $eq: ['$isActive', false] }, 1, 0] }
          },
          adminUsers: {
            $sum: { $cond: [{ $eq: ['$role', USER_ROLES.ADMIN] }, 1, 0] }
          },
          managerUsers: {
            $sum: { $cond: [{ $eq: ['$role', USER_ROLES.MANAGER] }, 1, 0] }
          },
          staffUsers: {
            $sum: { $cond: [{ $eq: ['$role', USER_ROLES.STAFF] }, 1, 0] }
          },
          viewerUsers: {
            $sum: { $cond: [{ $eq: ['$role', USER_ROLES.VIEWER] }, 1, 0] }
          }
        }
      }
    ]);

    // Thống kê theo tháng (6 tháng gần nhất)
    const monthlyStats = await User.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(new Date().setMonth(new Date().getMonth() - 6))
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      success: true,
      data: {
        summary: stats[0] || {
          totalUsers: 0,
          activeUsers: 0,
          inactiveUsers: 0,
          adminUsers: 0,
          managerUsers: 0,
          staffUsers: 0,
          viewerUsers: 0
        },
        monthlyStats
      }
    });
  } catch (error) {
    const errorResponse = createErrorResponse(error);
    res.status(errorResponse.status).json(errorResponse.data);
  }
};

// Lấy users theo role
const getUsersByRole = async(req, res) => {
  try {
    const { role } = req.params;
    const { page, limit } = validatePagination(req.query.page, req.query.limit);
    const skip = (page - 1) * limit;

    // Kiểm tra role hợp lệ
    if (!Object.values(USER_ROLES).includes(role)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Invalid role'
      });
    }

    const users = await User.find({ role, isActive: true })
      .select('-passwordHash -refreshToken')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments({ role, isActive: true });

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    const errorResponse = createErrorResponse(error);
    res.status(errorResponse.status).json(errorResponse.data);
  }
};

// Reset password (admin only)
const resetPassword = async(req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { userId } = req.params;
    const { newPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'User not found'
      });
    }

    // Gán mật khẩu mới để pre-save hook xử lý hash
    user.passwordHash = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    const errorResponse = createErrorResponse(error);
    res.status(errorResponse.status).json(errorResponse.data);
  }
};

// Export users to Excel
const exportUsers = async(req, res) => {
  try {
    const search = req.query.search || '';
    const role = req.query.role;
    const isActive = req.query.isActive;

    const query = {};

    // Tìm kiếm
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { fullName: { $regex: search, $options: 'i' } }
      ];
    }

    // Lọc theo role
    if (role) {
      query.role = role;
    }

    // Lọc theo trạng thái
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    // Lấy tất cả users phù hợp (không phân trang)
    const users = await User.find(query)
      .select('-passwordHash -refreshToken')
      .sort({ createdAt: -1 })
      .lean();

    // Tạo Excel file
    const ExcelJS = require('exceljs');
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Users');

    // Định nghĩa columns
    worksheet.columns = [
      { header: 'STT', key: 'index', width: 8 },
      { header: 'Username', key: 'username', width: 20 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Họ và tên', key: 'fullName', width: 30 },
      { header: 'Số điện thoại', key: 'phone', width: 15 },
      { header: 'Vai trò', key: 'role', width: 15 },
      { header: 'Trạng thái', key: 'status', width: 15 },
      { header: 'Địa chỉ', key: 'address', width: 40 },
      { header: 'Đăng nhập lần cuối', key: 'lastLogin', width: 20 },
      { header: 'Ngày tạo', key: 'createdAt', width: 20 }
    ];

    // Style header
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    // Map role names
    const roleNames = {
      admin: 'Quản trị viên',
      manager: 'Quản lý',
      staff: 'Nhân viên',
      viewer: 'Người xem',
      employee: 'Nhân viên'
    };

    // Thêm dữ liệu
    users.forEach((user, index) => {
      worksheet.addRow({
        index: index + 1,
        username: user.username || '',
        email: user.email || '',
        fullName: user.fullName || '',
        phone: user.phone || '',
        role: roleNames[user.role] || user.role || '',
        status: user.isActive ? 'Hoạt động' : 'Ngừng hoạt động',
        address: user.address || '',
        lastLogin: user.lastLogin ? new Date(user.lastLogin).toLocaleString('vi-VN') : 'Chưa đăng nhập',
        createdAt: user.createdAt ? new Date(user.createdAt).toLocaleString('vi-VN') : ''
      });
    });

    // Set response headers
    const filename = `users_export_${new Date().toISOString().split('T')[0]}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Write to response
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Export users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while exporting users'
    });
  }
};

module.exports = {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  activateUser,
  changePassword,
  updateUserRole,
  getUserStats,
  getUsersByRole,
  resetPassword,
  exportUsers
};