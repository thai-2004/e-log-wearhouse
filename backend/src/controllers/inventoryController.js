// Inventory Controller
const Inventory = require('../models/Inventory');
const Product = require('../models/Product');
const StockMovement = require('../models/StockMovement');
const { validationResult } = require('express-validator');

// Lấy tồn kho theo warehouse
const getInventoryByWarehouse = async(req, res) => {
  try {
    const { warehouseId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';

    const query = { warehouseId };

    // Tìm kiếm theo tên sản phẩm
    if (search) {
      const products = await Product.find({
        $text: { $search: search }
      }).select('_id');

      query.productId = { $in: products.map(p => p._id) };
    }

    const inventories = await Inventory.find(query)
      .populate('productId', 'sku name unit sellingPrice')
      .sort({ lastUpdated: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Inventory.countDocuments(query);

    res.json({
      success: true,
      data: {
        inventories,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get inventory by warehouse error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Lấy tồn kho theo sản phẩm
const getInventoryByProduct = async(req, res) => {
  try {
    const { productId } = req.params;

    const inventories = await Inventory.find({ productId })
      .populate('warehouseId', 'name code')
      .populate('productId', 'sku name unit');

    // Tính tổng tồn kho
    const totalQuantity = inventories.reduce((sum, inv) => sum + inv.quantity, 0);
    const totalReserved = inventories.reduce((sum, inv) => sum + inv.reservedQuantity, 0);
    const totalAvailable = inventories.reduce((sum, inv) => sum + inv.availableQuantity, 0);

    res.json({
      success: true,
      data: {
        inventories,
        summary: {
          totalQuantity,
          totalReserved,
          totalAvailable,
          warehouseCount: inventories.length
        }
      }
    });
  } catch (error) {
    console.error('Get inventory by product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Lấy tồn kho tại location cụ thể
const getInventoryByLocation = async(req, res) => {
  try {
    const { warehouseId, locationId } = req.params;

    const inventories = await Inventory.find({ warehouseId, locationId })
      .populate('productId', 'sku name unit sellingPrice')
      .sort({ lastUpdated: -1 });

    res.json({
      success: true,
      data: { inventories }
    });
  } catch (error) {
    console.error('Get inventory by location error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Cập nhật tồn kho (chỉ dành cho admin/manager)
const updateInventory = async(req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { id: inventoryId } = req.params;
    const { quantity, reservedQuantity, notes } = req.body;

    const inventory = await Inventory.findById(inventoryId)
      .populate('productId', 'sku name')
      .populate('warehouseId', 'name');

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: 'Inventory record not found'
      });
    }

    const oldQuantity = inventory.quantity;

    // Cập nhật inventory
    inventory.quantity = quantity;
    inventory.reservedQuantity = reservedQuantity;
    await inventory.save();

    // Tạo stock movement record
    const stockMovement = new StockMovement({
      productId: inventory.productId._id,
      warehouseId: inventory.warehouseId._id,
      locationId: inventory.locationId,
      type: 'adjustment',
      referenceType: 'adjustment',
      referenceId: inventory._id,
      quantityBefore: oldQuantity,
      quantityChange: quantity - oldQuantity,
      quantityAfter: quantity,
      notes: notes || 'Manual inventory update',
      userId: req.user._id
    });

    await stockMovement.save();

    res.json({
      success: true,
      message: 'Inventory updated successfully',
      data: { inventory }
    });
  } catch (error) {
    console.error('Update inventory error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Reserve inventory (đặt trước hàng)
const reserveInventory = async(req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { productId, warehouseId, locationId, quantity, notes } = req.body;

    const inventory = await Inventory.findOne({
      productId,
      warehouseId,
      locationId
    });

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: 'Inventory record not found'
      });
    }

    if (inventory.availableQuantity < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient available quantity',
        data: {
          requested: quantity,
          available: inventory.availableQuantity
        }
      });
    }

    inventory.reservedQuantity += quantity;
    await inventory.save();

    // Tạo stock movement record
    const stockMovement = new StockMovement({
      productId,
      warehouseId,
      locationId,
      type: 'adjustment',
      referenceType: 'adjustment',
      referenceId: inventory._id,
      quantityBefore: inventory.quantity,
      quantityChange: 0, // Chỉ thay đổi reserved, không thay đổi quantity
      quantityAfter: inventory.quantity,
      notes: notes || 'Inventory reserved',
      userId: req.user._id
    });

    await stockMovement.save();

    res.json({
      success: true,
      message: 'Inventory reserved successfully',
      data: { inventory }
    });
  } catch (error) {
    console.error('Reserve inventory error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Release reserved inventory
const releaseReservedInventory = async(req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { productId, warehouseId, locationId, quantity } = req.body;

    const inventory = await Inventory.findOne({
      productId,
      warehouseId,
      locationId
    });

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: 'Inventory record not found'
      });
    }

    if (inventory.reservedQuantity < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Cannot release more than reserved quantity',
        data: {
          requested: quantity,
          reserved: inventory.reservedQuantity
        }
      });
    }

    inventory.reservedQuantity -= quantity;
    await inventory.save();

    res.json({
      success: true,
      message: 'Reserved inventory released successfully',
      data: { inventory }
    });
  } catch (error) {
    console.error('Release reserved inventory error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Transfer inventory giữa các location
const transferInventory = async(req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const {
      productId,
      warehouseId,
      fromLocationId,
      toLocationId,
      quantity,
      notes
    } = req.body;

    // Kiểm tra inventory nguồn
    const fromInventory = await Inventory.findOne({
      productId,
      warehouseId,
      locationId: fromLocationId
    });

    if (!fromInventory) {
      return res.status(404).json({
        success: false,
        message: 'Source inventory not found'
      });
    }

    if (fromInventory.availableQuantity < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient available quantity for transfer',
        data: {
          requested: quantity,
          available: fromInventory.availableQuantity
        }
      });
    }

    // Tìm hoặc tạo inventory đích
    let toInventory = await Inventory.findOne({
      productId,
      warehouseId,
      locationId: toLocationId
    });

    if (!toInventory) {
      toInventory = new Inventory({
        productId,
        warehouseId,
        locationId: toLocationId,
        quantity: 0,
        reservedQuantity: 0,
        availableQuantity: 0
      });
    }

    // Thực hiện transfer
    fromInventory.quantity -= quantity;
    toInventory.quantity += quantity;

    await fromInventory.save();
    await toInventory.save();

    // Tạo stock movement records
    const fromMovement = new StockMovement({
      productId,
      warehouseId,
      locationId: fromLocationId,
      type: 'transfer',
      referenceType: 'transfer',
      referenceId: fromInventory._id,
      quantityBefore: fromInventory.quantity + quantity,
      quantityChange: -quantity,
      quantityAfter: fromInventory.quantity,
      notes: `Transfer to location ${toLocationId}: ${notes || ''}`,
      userId: req.user._id
    });

    const toMovement = new StockMovement({
      productId,
      warehouseId,
      locationId: toLocationId,
      type: 'transfer',
      referenceType: 'transfer',
      referenceId: toInventory._id,
      quantityBefore: toInventory.quantity - quantity,
      quantityChange: quantity,
      quantityAfter: toInventory.quantity,
      notes: `Transfer from location ${fromLocationId}: ${notes || ''}`,
      userId: req.user._id
    });

    await Promise.all([fromMovement.save(), toMovement.save()]);

    res.json({
      success: true,
      message: 'Inventory transferred successfully',
      data: {
        fromInventory,
        toInventory
      }
    });
  } catch (error) {
    console.error('Transfer inventory error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Lấy báo cáo tồn kho
const getInventoryReport = async(req, res) => {
  try {
    const { warehouseId, categoryId, lowStockOnly } = req.query;

    const matchQuery = {};

    if (warehouseId) {
      matchQuery.warehouseId = warehouseId;
    }

    if (categoryId) {
      const products = await Product.find({ categoryId }).select('_id');
      matchQuery.productId = { $in: products.map(p => p._id) };
    }

    const inventories = await Inventory.find(matchQuery)
      .populate('productId', 'sku name unit sellingPrice categoryId')
      .populate('warehouseId', 'name code');

    // Tính toán thống kê
    const totalValue = inventories.reduce((sum, inv) => {
      return sum + (inv.quantity * (inv.productId.sellingPrice || 0));
    }, 0);

    const totalQuantity = inventories.reduce((sum, inv) => sum + inv.quantity, 0);
    const totalReserved = inventories.reduce((sum, inv) => sum + inv.reservedQuantity, 0);

    // Lọc sản phẩm sắp hết hàng nếu cần
    let filteredInventories = inventories;
    if (lowStockOnly === 'true') {
      filteredInventories = inventories.filter(inv => {
        const product = inv.productId;
        return inv.quantity <= (product.reorderPoint || 0);
      });
    }

    res.json({
      success: true,
      data: {
        inventories: filteredInventories,
        summary: {
          totalItems: filteredInventories.length,
          totalQuantity,
          totalReserved,
          totalAvailable: totalQuantity - totalReserved,
          totalValue,
          averageValue: filteredInventories.length > 0 ? totalValue / filteredInventories.length : 0
        }
      }
    });
  } catch (error) {
    console.error('Get inventory report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Lấy lịch sử stock movement
const getStockMovements = async(req, res) => {
  try {
    const { productId, warehouseId, type, referenceType } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = {};

    if (productId) query.productId = productId;
    if (warehouseId) query.warehouseId = warehouseId;
    if (type) query.type = type;
    if (referenceType) query.referenceType = referenceType;

    const movements = await StockMovement.find(query)
      .populate('productId', 'sku name')
      .populate('warehouseId', 'name code')
      .populate('userId', 'username fullName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await StockMovement.countDocuments(query);

    res.json({
      success: true,
      data: {
        movements,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get stock movements error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Tạo inventory mới
const createInventory = async(req, res) => {
  try {
    // Log thông tin token và user
    console.log('📥 [InventoryController] createInventory called');
    console.log('✅ [InventoryController] Token received:', req.headers.authorization ? 'Yes (Bearer token)' : 'No');
    console.log('✅ [InventoryController] User authenticated:', req.user ? `${req.user.username} (${req.user.role})` : 'No user');
    console.log('✅ [InventoryController] Request body:', req.body);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ [InventoryController] Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const inventoryData = req.body;

    // Kiểm tra inventory đã tồn tại (theo unique constraint: productId + warehouseId + locationId)
    const existingInventory = await Inventory.findOne({
      productId: inventoryData.productId,
      warehouseId: inventoryData.warehouseId,
      locationId: inventoryData.locationId
    });

    if (existingInventory) {
      return res.status(400).json({
        success: false,
        message: 'Inventory already exists for this product at this location in this warehouse'
      });
    }

    const inventory = new Inventory(inventoryData);
    await inventory.save();

    console.log('✅ [InventoryController] Inventory created successfully:', inventory._id);

    res.status(201).json({
      success: true,
      message: 'Inventory created successfully',
      data: { inventory }
    });
  } catch (error) {
    console.error('Create inventory error:', error);

    // Handle MongoDB duplicate key error (E11000)
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0];
      return res.status(400).json({
        success: false,
        message: `Inventory already exists for this ${field || 'combination'}`,
        code: 'DUPLICATE_INVENTORY'
      });
    }

    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors,
        code: 'VALIDATION_ERROR'
      });
    }

    // Handle CastError (invalid ObjectId)
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: `Invalid ${error.path}: ${error.value}`,
        code: 'INVALID_ID'
      });
    }

    // Generic error
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
      code: 'SERVER_ERROR'
    });
  }
};

// Lấy danh sách inventory
const getInventory = async(req, res) => {
  try {
    const { page = 1, limit = 10, warehouseId, productId } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    if (warehouseId) query.warehouseId = warehouseId;
    if (productId) query.productId = productId;

    const inventories = await Inventory.find(query)
      .populate('productId', 'name sku')
      .populate('warehouseId', 'name')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Inventory.countDocuments(query);

    res.json({
      success: true,
      data: {
        inventories,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get inventory error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Lấy inventory theo ID
const getInventoryById = async(req, res) => {
  try {
    const { id } = req.params;

    const inventory = await Inventory.findById(id)
      .populate('productId', 'name sku')
      .populate('warehouseId', 'name');

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: 'Inventory not found'
      });
    }

    res.json({
      success: true,
      data: { inventory }
    });
  } catch (error) {
    console.error('Get inventory by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Xóa inventory
const deleteInventory = async(req, res) => {
  try {
    const { id } = req.params;

    const inventory = await Inventory.findById(id);
    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: 'Inventory not found'
      });
    }

    await Inventory.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Inventory deleted successfully'
    });
  } catch (error) {
    console.error('Delete inventory error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Lấy items sắp hết hàng
const getLowStockItems = async(req, res) => {
  try {
    // Lấy tất cả inventory và populate product để lấy reorderPoint
    const allInventories = await Inventory.find({})
      .populate({
        path: 'productId',
        select: 'name sku reorderPoint',
        model: 'Product'
      })
      .populate({
        path: 'warehouseId',
        select: 'name code',
        model: 'Warehouse'
      });

    // Filter những items có quantity <= reorderPoint
    const lowStockInventories = allInventories.filter(inventory => {
      const product = inventory.productId;
      // Kiểm tra nếu product được populate và có reorderPoint
      if (!product || typeof product === 'string' || !product.reorderPoint) {
        return false;
      }
      return inventory.quantity <= product.reorderPoint;
    });

    res.json({
      success: true,
      data: {
        inventories: lowStockInventories,
        total: lowStockInventories.length
      }
    });
  } catch (error) {
    console.error('Get low stock items error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Lấy items hết hàng (quantity = 0)
const getZeroStockItems = async(req, res) => {
  try {
    const inventories = await Inventory.find({
      quantity: 0
    })
      .populate({
        path: 'productId',
        select: 'name sku reorderPoint',
        model: 'Product'
      })
      .populate({
        path: 'warehouseId',
        select: 'name code',
        model: 'Warehouse'
      });

    res.json({
      success: true,
      data: {
        inventories,
        total: inventories.length
      }
    });
  } catch (error) {
    console.error('Get zero stock items error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Lấy items tồn kho cao (quantity > maxStock)
const getOverstockItems = async(req, res) => {
  try {
    // Lấy tất cả inventory và populate product để lấy maxStock
    const allInventories = await Inventory.find({})
      .populate({
        path: 'productId',
        select: 'name sku maxStock',
        model: 'Product'
      })
      .populate({
        path: 'warehouseId',
        select: 'name code',
        model: 'Warehouse'
      });

    // Filter những items có quantity > maxStock (và maxStock > 0)
    const overstockInventories = allInventories.filter(inventory => {
      const product = inventory.productId;
      // Kiểm tra nếu product được populate và có maxStock hợp lệ
      if (!product || typeof product === 'string' || !product.maxStock || product.maxStock <= 0) {
        return false;
      }
      return inventory.quantity > product.maxStock;
    });

    res.json({
      success: true,
      data: {
        inventories: overstockInventories,
        total: overstockInventories.length
      }
    });
  } catch (error) {
    console.error('Get overstock items error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Điều chỉnh inventory
const adjustInventory = async(req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { inventoryId, adjustment, notes } = req.body;

    const inventory = await Inventory.findById(inventoryId)
      .populate('productId', 'sku name')
      .populate('warehouseId', 'name');

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: 'Inventory not found'
      });
    }

    const oldQuantity = inventory.quantity;
    const newQuantity = oldQuantity + adjustment;

    // Kiểm tra nếu quantity sau khi điều chỉnh < 0
    if (newQuantity < 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot adjust inventory below zero',
        data: {
          currentQuantity: oldQuantity,
          adjustment,
          wouldResultIn: newQuantity
        }
      });
    }

    // Cập nhật quantity
    inventory.quantity = newQuantity;

    // Nếu quantity mới < reservedQuantity, cần điều chỉnh reservedQuantity
    if (inventory.quantity < inventory.reservedQuantity) {
      inventory.reservedQuantity = inventory.quantity;
    }

    await inventory.save();

    // Tạo stock movement record
    const stockMovement = new StockMovement({
      productId: inventory.productId._id,
      warehouseId: inventory.warehouseId._id,
      locationId: inventory.locationId,
      type: 'adjustment',
      referenceType: 'adjustment',
      referenceId: inventory._id,
      quantityBefore: oldQuantity,
      quantityChange: adjustment,
      quantityAfter: inventory.quantity,
      notes: notes || 'Manual inventory adjustment',
      userId: req.user._id
    });
    await stockMovement.save();

    res.json({
      success: true,
      message: 'Inventory adjusted successfully',
      data: {
        inventory,
        adjustment: {
          oldQuantity,
          newQuantity: inventory.quantity,
          adjustment
        }
      }
    });
  } catch (error) {
    console.error('Adjust inventory error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  createInventory,
  getInventory,
  getInventoryById,
  updateInventory,
  deleteInventory,
  getInventoryByWarehouse,
  getInventoryByProduct,
  getInventoryByLocation,
  getLowStockItems,
  getZeroStockItems,
  getOverstockItems,
  reserveInventory,
  releaseReservedInventory,
  transferInventory,
  getInventoryReport,
  getStockMovements,
  adjustInventory
};