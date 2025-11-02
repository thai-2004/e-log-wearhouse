// Customer Controller
const Customer = require('../models/Customer');
const Outbound = require('../models/Outbound');
const { validationResult } = require('express-validator');
const { HTTP_STATUS, CUSTOMER_TYPES } = require('../config/constants');
const { handleError, createErrorResponse, createSuccessResponse } = require('../utils/errorHandler');
const { checkUniqueField, validatePagination } = require('../utils/validation');

// Tạo customer mới
const createCustomer = async(req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const customerData = req.body;

    // Kiểm tra code đã tồn tại
    const existingCustomer = await checkUniqueField(Customer, 'code', customerData.code);
    if (existingCustomer) {
      return res.status(HTTP_STATUS.CONFLICT).json({
        success: false,
        message: 'Customer with this code already exists'
      });
    }

    const customer = new Customer(customerData);
    await customer.save();

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Customer created successfully',
      data: { customer }
    });
  } catch (error) {
    const errorResponse = createErrorResponse(error);
    res.status(errorResponse.status).json(errorResponse.data);
  }
};

// Lấy danh sách customers
const getCustomers = async(req, res) => {
  try {
    const { page, limit } = validatePagination(req.query.page, req.query.limit);
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const isActive = req.query.isActive;
    const type = req.query.type;

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { contactPerson: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    if (type && Object.values(CUSTOMER_TYPES).includes(type)) {
      query.type = type;
    }

    const customers = await Customer.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Customer.countDocuments(query);

    res.json({
      success: true,
      data: {
        customers,
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

// Lấy customer theo ID
const getCustomerById = async(req, res) => {
  try {
    const { id: customerId } = req.params;

    const customer = await Customer.findById(customerId);

    if (!customer) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.json({
      success: true,
      data: { customer }
    });
  } catch (error) {
    const errorResponse = createErrorResponse(error);
    res.status(errorResponse.status).json(errorResponse.data);
  }
};

// Cập nhật customer
const updateCustomer = async(req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { id: customerId } = req.params;
    const updateData = req.body;

    // Kiểm tra code trùng lặp (trừ customer hiện tại)
    if (updateData.code) {
      const existingCustomer = await checkUniqueField(Customer, 'code', updateData.code, customerId);
      if (existingCustomer) {
        return res.status(HTTP_STATUS.CONFLICT).json({
          success: false,
          message: 'Customer with this code already exists'
        });
      }
    }

    const customer = await Customer.findByIdAndUpdate(
      customerId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!customer) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.json({
      success: true,
      message: 'Customer updated successfully',
      data: { customer }
    });
  } catch (error) {
    const errorResponse = createErrorResponse(error);
    res.status(errorResponse.status).json(errorResponse.data);
  }
};

// Xóa customer
const deleteCustomer = async(req, res) => {
  try {
    const { id: customerId } = req.params;

    // Kiểm tra customer có outbound không
    const outboundCount = await Outbound.countDocuments({ customerId });
    if (outboundCount > 0) {
      return res.status(HTTP_STATUS.CONFLICT).json({
        success: false,
        message: 'Cannot delete customer with existing outbound records. Please deactivate instead.'
      });
    }

    const customer = await Customer.findByIdAndDelete(customerId);

    if (!customer) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.json({
      success: true,
      message: 'Customer deleted successfully'
    });
  } catch (error) {
    const errorResponse = createErrorResponse(error);
    res.status(errorResponse.status).json(errorResponse.data);
  }
};

// Lấy báo cáo customer
const getCustomerReport = async(req, res) => {
  try {
    const { customerId } = req.params;
    const { startDate, endDate } = req.query;

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Customer not found'
      });
    }

    const matchQuery = { customerId };
    if (startDate || endDate) {
      matchQuery.outboundDate = {};
      if (startDate) matchQuery.outboundDate.$gte = new Date(startDate);
      if (endDate) matchQuery.outboundDate.$lte = new Date(endDate);
    }

    const outbounds = await Outbound.find(matchQuery)
      .populate('warehouseId', 'name')
      .populate('userId', 'username fullName');

    const totalAmount = outbounds.reduce((sum, outbound) => sum + outbound.finalAmount, 0);
    const totalItems = outbounds.reduce((sum, outbound) => sum + outbound.items.length, 0);

    // Thống kê theo warehouse
    const warehouseStats = outbounds.reduce((acc, outbound) => {
      const warehouseName = outbound.warehouseId.name;
      if (!acc[warehouseName]) {
        acc[warehouseName] = { count: 0, totalAmount: 0 };
      }
      acc[warehouseName].count += 1;
      acc[warehouseName].totalAmount += outbound.finalAmount;
      return acc;
    }, {});

    // Thống kê theo type
    const typeStats = outbounds.reduce((acc, outbound) => {
      acc[outbound.type] = (acc[outbound.type] || 0) + 1;
      return acc;
    }, {});

    // Thống kê theo status
    const statusStats = outbounds.reduce((acc, outbound) => {
      acc[outbound.status] = (acc[outbound.status] || 0) + 1;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        customer,
        summary: {
          totalOutbounds: outbounds.length,
          totalAmount,
          totalItems,
          averageAmount: outbounds.length > 0 ? totalAmount / outbounds.length : 0
        },
        warehouseStats,
        typeStats,
        statusStats
      }
    });
  } catch (error) {
    const errorResponse = createErrorResponse(error);
    res.status(errorResponse.status).json(errorResponse.data);
  }
};

// Lấy customer theo email
const getCustomerByEmail = async(req, res) => {
  try {
    const { email } = req.params;

    const customer = await Customer.findOne({ email })
      .populate('orders', 'orderNumber status totalAmount');

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.json({
      success: true,
      data: { customer }
    });
  } catch (error) {
    console.error('Get customer by email error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Lấy customers theo type
const getCustomersByType = async(req, res) => {
  try {
    const { customerType } = req.params;
    const { page = 1, limit = 10, status = 'active' } = req.query;

    const skip = (page - 1) * limit;
    const query = { customerType, isActive: true };
    if (status && status !== 'all') {
      query.status = status;
    }

    const customers = await Customer.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Customer.countDocuments(query);

    res.json({
      success: true,
      data: {
        customers,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get customers by type error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  getCustomerReport,
  getCustomerByEmail,
  getCustomersByType
};