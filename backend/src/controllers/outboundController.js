// Outbound Controller
const Outbound = require('../models/Outbound');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const Warehouse = require('../models/Warehouse');
const Inventory = require('../models/Inventory');
const StockMovement = require('../models/StockMovement');
const { OUTBOUND_STATUS } = require('../config/constants');
const { validationResult } = require('express-validator');

// Tạo outbound mới
const createOutbound = async(req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const outboundData = {
      ...req.body,
      userId: req.user._id,
      status: OUTBOUND_STATUS.DRAFT
    };

    // Kiểm tra code đã tồn tại
    const existingOutbound = await Outbound.findOne({ code: outboundData.code });
    if (existingOutbound) {
      return res.status(400).json({
        success: false,
        message: 'Outbound with this code already exists'
      });
    }

    // Kiểm tra customer tồn tại
    const customer = await Customer.findById(outboundData.customerId);
    if (!customer) {
      return res.status(400).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Kiểm tra warehouse tồn tại
    const warehouse = await Warehouse.findById(outboundData.warehouseId);
    if (!warehouse) {
      return res.status(400).json({
        success: false,
        message: 'Warehouse not found'
      });
    }

    // Validate products, locations và stock availability
    for (const item of outboundData.items) {
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

      // Kiểm tra stock availability
      const inventory = await Inventory.findOne({
        productId: item.productId,
        warehouseId: outboundData.warehouseId,
        locationId: item.locationId
      });

      if (!inventory || inventory.availableQuantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product ${product.sku} at location ${item.locationId}`,
          data: {
            requested: item.quantity,
            available: inventory ? inventory.availableQuantity : 0
          }
        });
      }
    }

    const outbound = new Outbound(outboundData);
    await outbound.save();

    res.status(201).json({
      success: true,
      message: 'Outbound created successfully',
      data: { outbound }
    });
  } catch (error) {
    console.error('Create outbound error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Lấy danh sách outbound
const getOutbounds = async(req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status;
    const warehouseId = req.query.warehouseId;
    const customerId = req.query.customerId;
    const type = req.query.type;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;

    const query = {};

    if (status) query.status = status;
    if (warehouseId) query.warehouseId = warehouseId;
    if (customerId) query.customerId = customerId;
    if (type) query.type = type;

    if (startDate || endDate) {
      query.outboundDate = {};
      if (startDate) query.outboundDate.$gte = new Date(startDate);
      if (endDate) query.outboundDate.$lte = new Date(endDate);
    }

    const outbounds = await Outbound.find(query)
      .populate('warehouseId', 'name code')
      .populate('customerId', 'name code')
      .populate('userId', 'username fullName')
      .populate('approvedBy', 'username fullName')
      .populate('items.productId', 'sku name unit')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Outbound.countDocuments(query);

    res.json({
      success: true,
      data: {
        outbounds,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get outbounds error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Lấy outbound theo ID
const getOutboundById = async(req, res) => {
  try {
    const { outboundId } = req.params;

    const outbound = await Outbound.findById(outboundId)
      .populate('warehouseId', 'name code address')
      .populate('customerId', 'name code contactPerson email phone address')
      .populate('userId', 'username fullName')
      .populate('approvedBy', 'username fullName')
      .populate('items.productId', 'sku name unit weight dimensions');

    if (!outbound) {
      return res.status(404).json({
        success: false,
        message: 'Outbound not found'
      });
    }

    res.json({
      success: true,
      data: { outbound }
    });
  } catch (error) {
    console.error('Get outbound by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Cập nhật outbound
const updateOutbound = async(req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { outboundId } = req.params;
    const updateData = req.body;

    const outbound = await Outbound.findById(outboundId);
    if (!outbound) {
      return res.status(404).json({
        success: false,
        message: 'Outbound not found'
      });
    }

    // Chỉ cho phép cập nhật khi ở trạng thái draft
    if (outbound.status !== OUTBOUND_STATUS.DRAFT) {
      return res.status(400).json({
        success: false,
        message: 'Can only update outbound in draft status'
      });
    }

    // Kiểm tra code trùng lặp (trừ outbound hiện tại)
    if (updateData.code && updateData.code !== outbound.code) {
      const existingOutbound = await Outbound.findOne({
        _id: { $ne: outboundId },
        code: updateData.code
      });

      if (existingOutbound) {
        return res.status(400).json({
          success: false,
          message: 'Outbound with this code already exists'
        });
      }
    }

    // Validate products, locations và stock availability nếu có thay đổi items
    if (updateData.items) {
      const warehouse = await Warehouse.findById(outbound.warehouseId);

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

        // Kiểm tra stock availability
        const inventory = await Inventory.findOne({
          productId: item.productId,
          warehouseId: outbound.warehouseId,
          locationId: item.locationId
        });

        if (!inventory || inventory.availableQuantity < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for product ${product.sku} at location ${item.locationId}`,
            data: {
              requested: item.quantity,
              available: inventory ? inventory.availableQuantity : 0
            }
          });
        }
      }
    }

    const updatedOutbound = await Outbound.findByIdAndUpdate(
      outboundId,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('warehouseId', 'name code')
      .populate('customerId', 'name code')
      .populate('userId', 'username fullName')
      .populate('items.productId', 'sku name unit');

    res.json({
      success: true,
      message: 'Outbound updated successfully',
      data: { outbound: updatedOutbound }
    });
  } catch (error) {
    console.error('Update outbound error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Submit outbound để approval
const submitOutbound = async(req, res) => {
  try {
    const { outboundId } = req.params;

    const outbound = await Outbound.findById(outboundId);
    if (!outbound) {
      return res.status(404).json({
        success: false,
        message: 'Outbound not found'
      });
    }

    if (outbound.status !== OUTBOUND_STATUS.DRAFT) {
      return res.status(400).json({
        success: false,
        message: 'Can only submit outbound in draft status'
      });
    }

    outbound.status = OUTBOUND_STATUS.PENDING;
    await outbound.save();

    res.json({
      success: true,
      message: 'Outbound submitted for approval',
      data: { outbound }
    });
  } catch (error) {
    console.error('Submit outbound error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Approve outbound
const approveOutbound = async(req, res) => {
  try {
    const { outboundId } = req.params;

    const outbound = await Outbound.findById(outboundId)
      .populate('items.productId', 'sku name')
      .populate('warehouseId', 'name');

    if (!outbound) {
      return res.status(404).json({
        success: false,
        message: 'Outbound not found'
      });
    }

    if (outbound.status !== OUTBOUND_STATUS.PENDING) {
      return res.status(400).json({
        success: false,
        message: 'Can only approve outbound in pending status'
      });
    }

    // Cập nhật status
    outbound.status = OUTBOUND_STATUS.APPROVED;
    outbound.approvedBy = req.user._id;
    outbound.approvedAt = new Date();
    await outbound.save();

    res.json({
      success: true,
      message: 'Outbound approved successfully',
      data: { outbound }
    });
  } catch (error) {
    console.error('Approve outbound error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Complete outbound (xuất kho)
const completeOutbound = async(req, res) => {
  try {
    const { outboundId } = req.params;

    const outbound = await Outbound.findById(outboundId)
      .populate('items.productId', 'sku name')
      .populate('warehouseId', 'name');

    if (!outbound) {
      return res.status(404).json({
        success: false,
        message: 'Outbound not found'
      });
    }

    if (outbound.status !== OUTBOUND_STATUS.APPROVED) {
      return res.status(400).json({
        success: false,
        message: 'Can only complete approved outbound'
      });
    }

    // Cập nhật inventory cho từng item
    const stockMovements = [];

    for (const item of outbound.items) {
      // Tìm inventory record
      const inventory = await Inventory.findOne({
        productId: item.productId,
        warehouseId: outbound.warehouseId,
        locationId: item.locationId
      });

      if (!inventory) {
        return res.status(400).json({
          success: false,
          message: `Inventory not found for product ${item.productId.sku} at location ${item.locationId}`
        });
      }

      if (inventory.availableQuantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product ${item.productId.sku}`,
          data: {
            requested: item.quantity,
            available: inventory.availableQuantity
          }
        });
      }

      const oldQuantity = inventory.quantity;
      inventory.quantity -= item.quantity;
      await inventory.save();

      // Tạo stock movement record
      const stockMovement = new StockMovement({
        productId: item.productId,
        warehouseId: outbound.warehouseId,
        locationId: item.locationId,
        type: 'outbound',
        referenceType: 'outbound',
        referenceId: outbound._id,
        quantityBefore: oldQuantity,
        quantityChange: -item.quantity,
        quantityAfter: inventory.quantity,
        unitPrice: item.unitPrice,
        notes: `Outbound ${outbound.code}`,
        userId: req.user._id
      });

      stockMovements.push(stockMovement);
    }

    // Lưu tất cả stock movements
    await StockMovement.insertMany(stockMovements);

    // Cập nhật outbound status
    outbound.status = OUTBOUND_STATUS.COMPLETED;
    outbound.deliveryDate = new Date();
    await outbound.save();

    res.json({
      success: true,
      message: 'Outbound completed successfully',
      data: { outbound }
    });
  } catch (error) {
    console.error('Complete outbound error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Cancel outbound
const cancelOutbound = async(req, res) => {
  try {
    const { outboundId } = req.params;
    const { reason } = req.body;

    const outbound = await Outbound.findById(outboundId);
    if (!outbound) {
      return res.status(404).json({
        success: false,
        message: 'Outbound not found'
      });
    }

    if (outbound.status === OUTBOUND_STATUS.COMPLETED) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel completed outbound'
      });
    }

    outbound.status = OUTBOUND_STATUS.CANCELLED;
    if (reason) {
      outbound.notes = outbound.notes ? `${outbound.notes}\nCancelled: ${reason}` : `Cancelled: ${reason}`;
    }
    await outbound.save();

    res.json({
      success: true,
      message: 'Outbound cancelled successfully',
      data: { outbound }
    });
  } catch (error) {
    console.error('Cancel outbound error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Xóa outbound
const deleteOutbound = async(req, res) => {
  try {
    const { outboundId } = req.params;

    const outbound = await Outbound.findById(outboundId);
    if (!outbound) {
      return res.status(404).json({
        success: false,
        message: 'Outbound not found'
      });
    }

    if (outbound.status !== OUTBOUND_STATUS.DRAFT) {
      return res.status(400).json({
        success: false,
        message: 'Can only delete outbound in draft status'
      });
    }

    await Outbound.findByIdAndDelete(outboundId);

    res.json({
      success: true,
      message: 'Outbound deleted successfully'
    });
  } catch (error) {
    console.error('Delete outbound error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Lấy báo cáo outbound
const getOutboundReport = async(req, res) => {
  try {
    const { warehouseId, customerId, type, startDate, endDate } = req.query;

    const matchQuery = {};

    if (warehouseId) matchQuery.warehouseId = warehouseId;
    if (customerId) matchQuery.customerId = customerId;
    if (type) matchQuery.type = type;
    if (startDate || endDate) {
      matchQuery.outboundDate = {};
      if (startDate) matchQuery.outboundDate.$gte = new Date(startDate);
      if (endDate) matchQuery.outboundDate.$lte = new Date(endDate);
    }

    const outbounds = await Outbound.find(matchQuery)
      .populate('customerId', 'name')
      .populate('warehouseId', 'name');

    // Thống kê theo status
    const statusStats = outbounds.reduce((acc, outbound) => {
      acc[outbound.status] = (acc[outbound.status] || 0) + 1;
      return acc;
    }, {});

    // Thống kê theo customer
    const customerStats = outbounds.reduce((acc, outbound) => {
      const customerName = outbound.customerId.name;
      if (!acc[customerName]) {
        acc[customerName] = { count: 0, totalAmount: 0 };
      }
      acc[customerName].count += 1;
      acc[customerName].totalAmount += outbound.finalAmount;
      return acc;
    }, {});

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

    const totalAmount = outbounds.reduce((sum, outbound) => sum + outbound.finalAmount, 0);
    const totalItems = outbounds.reduce((sum, outbound) => sum + outbound.items.length, 0);

    res.json({
      success: true,
      data: {
        summary: {
          totalOutbounds: outbounds.length,
          totalAmount,
          totalItems,
          averageAmount: outbounds.length > 0 ? totalAmount / outbounds.length : 0
        },
        statusStats,
        customerStats,
        warehouseStats,
        typeStats
      }
    });
  } catch (error) {
    console.error('Get outbound report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Giao hàng outbound
const shipOutbound = async(req, res) => {
  try {
    const { id } = req.params;
    const { trackingNumber, carrier } = req.body;

    const outbound = await Outbound.findById(id);
    if (!outbound) {
      return res.status(404).json({
        success: false,
        message: 'Outbound not found'
      });
    }

    if (outbound.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Outbound must be approved before shipping'
      });
    }

    // Cập nhật trạng thái
    outbound.status = 'shipped';
    outbound.shippedAt = new Date();
    outbound.shippedBy = req.user._id;
    outbound.trackingNumber = trackingNumber;
    outbound.carrier = carrier;

    await outbound.save();

    res.json({
      success: true,
      message: 'Outbound shipped successfully',
      data: { outbound }
    });
  } catch (error) {
    console.error('Ship outbound error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Giao hàng thành công
const deliverOutbound = async(req, res) => {
  try {
    const { id } = req.params;
    const { deliveryNotes } = req.body;

    const outbound = await Outbound.findById(id);
    if (!outbound) {
      return res.status(404).json({
        success: false,
        message: 'Outbound not found'
      });
    }

    if (outbound.status !== 'shipped') {
      return res.status(400).json({
        success: false,
        message: 'Outbound must be shipped before delivery'
      });
    }

    // Cập nhật trạng thái
    outbound.status = 'delivered';
    outbound.deliveredAt = new Date();
    outbound.deliveredBy = req.user._id;
    outbound.deliveryNotes = deliveryNotes;

    await outbound.save();

    res.json({
      success: true,
      message: 'Outbound delivered successfully',
      data: { outbound }
    });
  } catch (error) {
    console.error('Deliver outbound error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Lấy outbounds theo customer
const getOutboundsByCustomer = async(req, res) => {
  try {
    const { customerId } = req.params;
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    const query = { customerId };
    if (status) query.status = status;

    const outbounds = await Outbound.find(query)
      .populate('customerId', 'name email')
      .populate('warehouseId', 'name')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Outbound.countDocuments(query);

    res.json({
      success: true,
      data: {
        outbounds,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get outbounds by customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Lấy outbounds theo warehouse
const getOutboundsByWarehouse = async(req, res) => {
  try {
    const { warehouseId } = req.params;
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    const query = { warehouseId };
    if (status) query.status = status;

    const outbounds = await Outbound.find(query)
      .populate('customerId', 'name email')
      .populate('warehouseId', 'name')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Outbound.countDocuments(query);

    res.json({
      success: true,
      data: {
        outbounds,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get outbounds by warehouse error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  createOutbound,
  getOutbounds,
  getOutboundById,
  updateOutbound,
  submitOutbound,
  approveOutbound,
  completeOutbound,
  cancelOutbound,
  deleteOutbound,
  shipOutbound,
  deliverOutbound,
  getOutboundsByCustomer,
  getOutboundsByWarehouse
};