// Inbound Controller
const Inbound = require('../models/Inbound');
const Product = require('../models/Product');
const Supplier = require('../models/Supplier');
const Warehouse = require('../models/Warehouse');
const Inventory = require('../models/Inventory');
const StockMovement = require('../models/StockMovement');
const { INBOUND_STATUS } = require('../config/constants');
const { validationResult } = require('express-validator');

// Tạo inbound mới
const createInbound = async(req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const inboundData = {
      ...req.body,
      userId: req.user._id,
      status: INBOUND_STATUS.DRAFT
    };

    // Kiểm tra code đã tồn tại
    const existingInbound = await Inbound.findOne({ code: inboundData.code });
    if (existingInbound) {
      return res.status(400).json({
        success: false,
        message: 'Inbound with this code already exists'
      });
    }

    // Kiểm tra supplier tồn tại
    const supplier = await Supplier.findById(inboundData.supplierId);
    if (!supplier) {
      return res.status(400).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    // Kiểm tra warehouse tồn tại
    const warehouse = await Warehouse.findById(inboundData.warehouseId);
    if (!warehouse) {
      return res.status(400).json({
        success: false,
        message: 'Warehouse not found'
      });
    }

    // Validate products và locations
    for (const item of inboundData.items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product not found: ${item.productId}`
        });
      }

      // Kiểm tra location tồn tại trong warehouse
      const locationExists = warehouse.zones.some(zone =>
        zone.locations.some(loc => loc._id.toString() === item.locationId.toString())
      );

      if (!locationExists) {
        return res.status(400).json({
          success: false,
          message: `Location not found in warehouse: ${item.locationId}`
        });
      }
    }

    const inbound = new Inbound(inboundData);
    await inbound.save();

    res.status(201).json({
      success: true,
      message: 'Inbound created successfully',
      data: { inbound }
    });
  } catch (error) {
    console.error('Create inbound error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Lấy danh sách inbound
const getInbounds = async(req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status;
    const warehouseId = req.query.warehouseId;
    const supplierId = req.query.supplierId;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;

    const query = {};

    if (status) query.status = status;
    if (warehouseId) query.warehouseId = warehouseId;
    if (supplierId) query.supplierId = supplierId;

    if (startDate || endDate) {
      query.inboundDate = {};
      if (startDate) query.inboundDate.$gte = new Date(startDate);
      if (endDate) query.inboundDate.$lte = new Date(endDate);
    }

    const inbounds = await Inbound.find(query)
      .populate('warehouseId', 'name code')
      .populate('supplierId', 'name code')
      .populate('userId', 'username fullName')
      .populate('approvedBy', 'username fullName')
      .populate('items.productId', 'sku name unit')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Inbound.countDocuments(query);

    res.json({
      success: true,
      data: {
        inbounds,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get inbounds error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Lấy inbound theo ID
const getInboundById = async(req, res) => {
  try {
    const { id: inboundId } = req.params;

    const inbound = await Inbound.findById(inboundId)
      .populate('warehouseId', 'name code address')
      .populate('supplierId', 'name code contactPerson email phone')
      .populate('userId', 'username fullName')
      .populate('approvedBy', 'username fullName')
      .populate('items.productId', 'sku name unit weight dimensions');

    if (!inbound) {
      return res.status(404).json({
        success: false,
        message: 'Inbound not found'
      });
    }

    res.json({
      success: true,
      data: { inbound }
    });
  } catch (error) {
    console.error('Get inbound by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Cập nhật inbound
const updateInbound = async(req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { id: inboundId } = req.params;
    const updateData = req.body;

    const inbound = await Inbound.findById(inboundId);
    if (!inbound) {
      return res.status(404).json({
        success: false,
        message: 'Inbound not found'
      });
    }

    // Chỉ cho phép cập nhật khi ở trạng thái draft
    if (inbound.status !== INBOUND_STATUS.DRAFT) {
      return res.status(400).json({
        success: false,
        message: 'Can only update inbound in draft status'
      });
    }

    // Kiểm tra code trùng lặp (trừ inbound hiện tại)
    if (updateData.code && updateData.code !== inbound.code) {
      const existingInbound = await Inbound.findOne({
        _id: { $ne: inboundId },
        code: updateData.code
      });

      if (existingInbound) {
        return res.status(400).json({
          success: false,
          message: 'Inbound with this code already exists'
        });
      }
    }

    // Validate products và locations nếu có thay đổi items
    if (updateData.items) {
      const warehouse = await Warehouse.findById(inbound.warehouseId);

      for (const item of updateData.items) {
        const product = await Product.findById(item.productId);
        if (!product) {
          return res.status(400).json({
            success: false,
            message: `Product not found: ${item.productId}`
          });
        }

        const locationExists = warehouse.zones.some(zone =>
          zone.locations.some(loc => loc._id.toString() === item.locationId.toString())
        );

        if (!locationExists) {
          return res.status(400).json({
            success: false,
            message: `Location not found in warehouse: ${item.locationId}`
          });
        }
      }
    }

    const updatedInbound = await Inbound.findByIdAndUpdate(
      inboundId,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('warehouseId', 'name code')
      .populate('supplierId', 'name code')
      .populate('userId', 'username fullName')
      .populate('items.productId', 'sku name unit');

    res.json({
      success: true,
      message: 'Inbound updated successfully',
      data: { inbound: updatedInbound }
    });
  } catch (error) {
    console.error('Update inbound error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Submit inbound để approval
const submitInbound = async(req, res) => {
  try {
    const { id: inboundId } = req.params;

    const inbound = await Inbound.findById(inboundId);
    if (!inbound) {
      return res.status(404).json({
        success: false,
        message: 'Inbound not found'
      });
    }

    if (inbound.status !== INBOUND_STATUS.DRAFT) {
      return res.status(400).json({
        success: false,
        message: 'Can only submit inbound in draft status'
      });
    }

    inbound.status = INBOUND_STATUS.PENDING;
    await inbound.save();

    res.json({
      success: true,
      message: 'Inbound submitted for approval',
      data: { inbound }
    });
  } catch (error) {
    console.error('Submit inbound error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Approve inbound
const approveInbound = async(req, res) => {
  try {
    const { id: inboundId } = req.params;

    const inbound = await Inbound.findById(inboundId)
      .populate('items.productId', 'sku name')
      .populate('warehouseId', 'name');

    if (!inbound) {
      return res.status(404).json({
        success: false,
        message: 'Inbound not found'
      });
    }

    if (inbound.status !== INBOUND_STATUS.PENDING) {
      return res.status(400).json({
        success: false,
        message: 'Can only approve inbound in pending status'
      });
    }

    // Cập nhật status
    inbound.status = INBOUND_STATUS.APPROVED;
    inbound.approvedBy = req.user._id;
    inbound.approvedAt = new Date();
    await inbound.save();

    res.json({
      success: true,
      message: 'Inbound approved successfully',
      data: { inbound }
    });
  } catch (error) {
    console.error('Approve inbound error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Complete inbound (nhập kho)
const completeInbound = async(req, res) => {
  try {
    const { id: inboundId } = req.params;

    const inbound = await Inbound.findById(inboundId)
      .populate('items.productId', 'sku name')
      .populate('warehouseId', 'name');

    if (!inbound) {
      return res.status(404).json({
        success: false,
        message: 'Inbound not found'
      });
    }

    if (inbound.status !== INBOUND_STATUS.APPROVED) {
      return res.status(400).json({
        success: false,
        message: 'Can only complete approved inbound'
      });
    }

    // Cập nhật inventory cho từng item
    const stockMovements = [];

    for (const item of inbound.items) {
      // Tìm hoặc tạo inventory record
      let inventory = await Inventory.findOne({
        productId: item.productId,
        warehouseId: inbound.warehouseId,
        locationId: item.locationId
      });

      if (!inventory) {
        inventory = new Inventory({
          productId: item.productId,
          warehouseId: inbound.warehouseId,
          locationId: item.locationId,
          quantity: 0,
          reservedQuantity: 0,
          availableQuantity: 0
        });
      }

      const oldQuantity = inventory.quantity;
      inventory.quantity += item.quantity;
      await inventory.save();

      // Tạo stock movement record
      const stockMovement = new StockMovement({
        productId: item.productId,
        warehouseId: inbound.warehouseId,
        locationId: item.locationId,
        type: 'inbound',
        referenceType: 'inbound',
        referenceId: inbound._id,
        quantityBefore: oldQuantity,
        quantityChange: item.quantity,
        quantityAfter: inventory.quantity,
        unitPrice: item.unitPrice,
        notes: `Inbound ${inbound.code}`,
        userId: req.user._id
      });

      stockMovements.push(stockMovement);
    }

    // Lưu tất cả stock movements
    await StockMovement.insertMany(stockMovements);

    // Cập nhật inbound status
    inbound.status = INBOUND_STATUS.COMPLETED;
    await inbound.save();

    res.json({
      success: true,
      message: 'Inbound completed successfully',
      data: { inbound }
    });
  } catch (error) {
    console.error('Complete inbound error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Cancel inbound
const cancelInbound = async(req, res) => {
  try {
    const { id: inboundId } = req.params;
    const { reason } = req.body;

    const inbound = await Inbound.findById(inboundId);
    if (!inbound) {
      return res.status(404).json({
        success: false,
        message: 'Inbound not found'
      });
    }

    if (inbound.status === INBOUND_STATUS.COMPLETED) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel completed inbound'
      });
    }

    inbound.status = INBOUND_STATUS.CANCELLED;
    if (reason) {
      inbound.notes = inbound.notes ? `${inbound.notes}\nCancelled: ${reason}` : `Cancelled: ${reason}`;
    }
    await inbound.save();

    res.json({
      success: true,
      message: 'Inbound cancelled successfully',
      data: { inbound }
    });
  } catch (error) {
    console.error('Cancel inbound error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Xóa inbound
const deleteInbound = async(req, res) => {
  try {
    const { id: inboundId } = req.params;

    const inbound = await Inbound.findById(inboundId);
    if (!inbound) {
      return res.status(404).json({
        success: false,
        message: 'Inbound not found'
      });
    }

    if (inbound.status !== INBOUND_STATUS.DRAFT) {
      return res.status(400).json({
        success: false,
        message: 'Can only delete inbound in draft status'
      });
    }

    await Inbound.findByIdAndDelete(inboundId);

    res.json({
      success: true,
      message: 'Inbound deleted successfully'
    });
  } catch (error) {
    console.error('Delete inbound error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Lấy báo cáo inbound
const getInboundReport = async(req, res) => {
  try {
    const { warehouseId, supplierId, startDate, endDate } = req.query;

    const matchQuery = {};

    if (warehouseId) matchQuery.warehouseId = warehouseId;
    if (supplierId) matchQuery.supplierId = supplierId;
    if (startDate || endDate) {
      matchQuery.inboundDate = {};
      if (startDate) matchQuery.inboundDate.$gte = new Date(startDate);
      if (endDate) matchQuery.inboundDate.$lte = new Date(endDate);
    }

    const inbounds = await Inbound.find(matchQuery)
      .populate('supplierId', 'name')
      .populate('warehouseId', 'name');

    // Thống kê theo status
    const statusStats = inbounds.reduce((acc, inbound) => {
      acc[inbound.status] = (acc[inbound.status] || 0) + 1;
      return acc;
    }, {});

    // Thống kê theo supplier
    const supplierStats = inbounds.reduce((acc, inbound) => {
      const supplierName = inbound.supplierId.name;
      if (!acc[supplierName]) {
        acc[supplierName] = { count: 0, totalAmount: 0 };
      }
      acc[supplierName].count += 1;
      acc[supplierName].totalAmount += inbound.finalAmount;
      return acc;
    }, {});

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

    const totalAmount = inbounds.reduce((sum, inbound) => sum + inbound.finalAmount, 0);
    const totalItems = inbounds.reduce((sum, inbound) => sum + inbound.items.length, 0);

    res.json({
      success: true,
      data: {
        summary: {
          totalInbounds: inbounds.length,
          totalAmount,
          totalItems,
          averageAmount: inbounds.length > 0 ? totalAmount / inbounds.length : 0
        },
        statusStats,
        supplierStats,
        warehouseStats
      }
    });
  } catch (error) {
    console.error('Get inbound report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Nhận hàng inbound
const receiveInbound = async(req, res) => {
  try {
    const { id } = req.params;
    const { receivedItems } = req.body;

    const inbound = await Inbound.findById(id);
    if (!inbound) {
      return res.status(404).json({
        success: false,
        message: 'Inbound not found'
      });
    }

    if (inbound.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Inbound must be approved before receiving'
      });
    }

    // Cập nhật trạng thái
    inbound.status = 'in_progress';
    inbound.receivedAt = new Date();
    inbound.receivedBy = req.user._id;
    inbound.receivedItems = receivedItems;

    await inbound.save();

    res.json({
      success: true,
      message: 'Inbound received successfully',
      data: { inbound }
    });
  } catch (error) {
    console.error('Receive inbound error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Lấy inbounds theo supplier
const getInboundsBySupplier = async(req, res) => {
  try {
    const { supplierId } = req.params;
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    const query = { supplierId };
    if (status) query.status = status;

    const inbounds = await Inbound.find(query)
      .populate('supplierId', 'name')
      .populate('warehouseId', 'name')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Inbound.countDocuments(query);

    res.json({
      success: true,
      data: {
        inbounds,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get inbounds by supplier error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Lấy inbounds theo warehouse
const getInboundsByWarehouse = async(req, res) => {
  try {
    const { warehouseId } = req.params;
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    const query = { warehouseId };
    if (status) query.status = status;

    const inbounds = await Inbound.find(query)
      .populate('supplierId', 'name')
      .populate('warehouseId', 'name')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Inbound.countDocuments(query);

    res.json({
      success: true,
      data: {
        inbounds,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get inbounds by warehouse error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  createInbound,
  getInbounds,
  getInboundById,
  updateInbound,
  submitInbound,
  approveInbound,
  completeInbound,
  cancelInbound,
  deleteInbound,
  receiveInbound,
  getInboundsBySupplier,
  getInboundsByWarehouse
};