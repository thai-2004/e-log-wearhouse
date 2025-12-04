// Supplier Controller
const Supplier = require('../models/Supplier');
const Inbound = require('../models/Inbound');
const Product = require('../models/Product');
const { validationResult } = require('express-validator');

// Tạo supplier mới
const createSupplier = async(req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const supplierData = req.body;

    // Kiểm tra code đã tồn tại
    const existingSupplier = await Supplier.findOne({ code: supplierData.code });
    if (existingSupplier) {
      return res.status(400).json({
        success: false,
        message: 'Supplier with this code already exists'
      });
    }

    const supplier = new Supplier(supplierData);
    await supplier.save();

    // Chuyển đổi supplier object để thêm field status cho frontend
    const supplierResponse = supplier.toObject();
    supplierResponse.status = supplier.isActive ? 'active' : 'inactive';

    res.status(201).json({
      success: true,
      message: 'Supplier created successfully',
      data: { supplier: supplierResponse }
    });
  } catch (error) {
    console.error('Create supplier error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Lấy danh sách suppliers
const getSuppliers = async(req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const isActive = req.query.isActive;

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

    const suppliers = await Supplier.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Thêm field status cho frontend
    const suppliersWithStatus = suppliers.map(supplier => ({
      ...supplier,
      status: supplier.isActive ? 'active' : 'inactive'
    }));

    const total = await Supplier.countDocuments(query);

    res.json({
      success: true,
      data: {
        suppliers: suppliersWithStatus,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get suppliers error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Lấy supplier theo ID
const getSupplierById = async(req, res) => {
  try {
    const { id: supplierId } = req.params;

    const supplier = await Supplier.findById(supplierId).lean();

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    // Thêm field status cho frontend
    const supplierWithStatus = {
      ...supplier,
      status: supplier.isActive ? 'active' : 'inactive'
    };

    res.json({
      success: true,
      data: { supplier: supplierWithStatus }
    });
  } catch (error) {
    console.error('Get supplier by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Cập nhật supplier
const updateSupplier = async(req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { id: supplierId } = req.params;
    const updateData = req.body;

    // Kiểm tra code trùng lặp (trừ supplier hiện tại)
    if (updateData.code) {
      const existingSupplier = await Supplier.findOne({
        _id: { $ne: supplierId },
        code: updateData.code
      });

      if (existingSupplier) {
        return res.status(400).json({
          success: false,
          message: 'Supplier with this code already exists'
        });
      }
    }

    const supplier = await Supplier.findByIdAndUpdate(
      supplierId,
      updateData,
      { new: true, runValidators: true }
    ).lean();

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    // Thêm field status cho frontend
    const supplierWithStatus = {
      ...supplier,
      status: supplier.isActive ? 'active' : 'inactive'
    };

    res.json({
      success: true,
      message: 'Supplier updated successfully',
      data: { supplier: supplierWithStatus }
    });
  } catch (error) {
    console.error('Update supplier error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Xóa supplier
const deleteSupplier = async(req, res) => {
  try {
    const { id: supplierId } = req.params;

    // Kiểm tra supplier có inbound không
    const inboundCount = await Inbound.countDocuments({ supplierId });
    if (inboundCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete supplier with existing inbound records. Please deactivate instead.'
      });
    }

    const supplier = await Supplier.findByIdAndDelete(supplierId);

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    res.json({
      success: true,
      message: 'Supplier deleted successfully'
    });
  } catch (error) {
    console.error('Delete supplier error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Lấy báo cáo supplier
const getSupplierReport = async(req, res) => {
  try {
    const { id: supplierId } = req.params;
    const { startDate, endDate } = req.query;

    const supplier = await Supplier.findById(supplierId);
    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    const matchQuery = { supplierId };
    if (startDate || endDate) {
      matchQuery.inboundDate = {};
      if (startDate) matchQuery.inboundDate.$gte = new Date(startDate);
      if (endDate) matchQuery.inboundDate.$lte = new Date(endDate);
    }

    const inbounds = await Inbound.find(matchQuery)
      .populate('warehouseId', 'name')
      .populate('userId', 'username fullName');

    const totalAmount = inbounds.reduce((sum, inbound) => sum + inbound.finalAmount, 0);
    const totalItems = inbounds.reduce((sum, inbound) => sum + inbound.items.length, 0);

    // Thống kê theo warehouse
    const warehouseStats = inbounds.reduce((acc, inbound) => {
      const warehouseName = inbound.warehouseId.name;
      if (!acc[warehouseName]) {
        acc[warehouseName] = { count: 0, totalAmount: 0 };
      }
      acc[warehouseName].count += 1;
      acc[warehouseName].totalAmount += inbound.finalAmount;
      return acc;
    }, {});

    // Thống kê theo status
    const statusStats = inbounds.reduce((acc, inbound) => {
      acc[inbound.status] = (acc[inbound.status] || 0) + 1;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        supplier,
        summary: {
          totalInbounds: inbounds.length,
          totalAmount,
          totalItems,
          averageAmount: inbounds.length > 0 ? totalAmount / inbounds.length : 0
        },
        warehouseStats,
        statusStats
      }
    });
  } catch (error) {
    console.error('Get supplier report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Cập nhật trạng thái hoạt động của supplier (active/inactive)
const updateSupplierStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (typeof status === 'undefined') {
      return res.status(400).json({
        success: false,
        message: 'Missing status in request body'
      });
    }

    // Map accepted status formats to boolean isActive
    let isActive;
    if (typeof status === 'boolean') {
      isActive = status;
    } else if (typeof status === 'string') {
      const normalized = status.toLowerCase();
      if (normalized === 'active' || normalized === 'true' || normalized === '1') {
        isActive = true;
      } else if (normalized === 'inactive' || normalized === 'false' || normalized === '0') {
        isActive = false;
      } else {
        return res.status(400).json({
          success: false,
          message: 'Invalid status value. Use active/inactive or boolean.'
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid status type'
      });
    }

    const supplier = await Supplier.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    );

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    // Chuyển đổi supplier object để thêm field status cho frontend
    const supplierResponse = supplier.toObject();
    supplierResponse.status = supplier.isActive ? 'active' : 'inactive';

    res.json({
      success: true,
      message: 'Supplier status updated successfully',
      data: { supplier: supplierResponse }
    });
  } catch (error) {
    console.error('Update supplier status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Lấy tổng quan suppliers
const getSuppliersOverview = async (req, res) => {
  try {
    // Tổng số suppliers
    const totalSuppliers = await Supplier.countDocuments();

    // Số suppliers đang hoạt động
    const activeSuppliers = await Supplier.countDocuments({ isActive: true });

    // Top suppliers (suppliers có nhiều products nhất, giới hạn top 5)
    const suppliersWithProductCount = await Product.aggregate([
      { $match: { supplierId: { $ne: null } } },
      { $group: { _id: '$supplierId', productCount: { $sum: 1 } } },
      { $sort: { productCount: -1 } },
      { $limit: 5 }
    ]);

    const topSuppliersCount = suppliersWithProductCount.length;

    // Tổng số products có supplier
    const totalProducts = await Product.countDocuments({ supplierId: { $ne: null } });

    res.json({
      success: true,
      data: {
        totalSuppliers,
        activeSuppliers,
        topSuppliers: topSuppliersCount,
        totalProducts
      }
    });
  } catch (error) {
    console.error('Get suppliers overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  createSupplier,
  getSuppliers,
  getSupplierById,
  updateSupplier,
  deleteSupplier,
  getSupplierReport,
  updateSupplierStatus,
  getSuppliersOverview
};