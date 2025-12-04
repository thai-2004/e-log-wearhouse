// Inventory Controller
const Inventory = require('../models/Inventory');
const Product = require('../models/Product');
const StockMovement = require('../models/StockMovement');
const Warehouse = require('../models/Warehouse');
const { validationResult } = require('express-validator');

// Helper function để thêm location và tính giá trị tồn kho vào inventory
const enrichInventory = (inventory) => {
  const result = { ...inventory };

  // Transform productId và warehouseId thành product và warehouse để frontend dễ sử dụng
  if (inventory.productId) {
    result.product = inventory.productId;
    // Giữ lại productId để tương thích ngược
    result.productId = typeof inventory.productId === 'object' ? inventory.productId._id : inventory.productId;
  }

  if (inventory.warehouseId) {
    result.warehouse = inventory.warehouseId;
    // Giữ lại warehouseId để tương thích ngược
    result.warehouseId = typeof inventory.warehouseId === 'object' ? inventory.warehouseId._id : inventory.warehouseId;
  }

  // Tìm location từ warehouse nếu có locationId
  if (inventory.locationId && result.warehouse && result.warehouse.zones) {
    let foundLocation = null;
    for (const zone of result.warehouse.zones || []) {
      if (zone.locations && zone.locations.length > 0) {
        foundLocation = zone.locations.find(
          loc => loc._id && loc._id.toString() === inventory.locationId.toString()
        );
        if (foundLocation) break;
      }
    }
    result.location = foundLocation || null;
  } else {
    result.location = null;
  }

  // Tính toán giá trị tồn kho
  if (result.product && result.product.sellingPrice) {
    result.value = (inventory.quantity || 0) * result.product.sellingPrice;
  } else {
    result.value = 0;
  }

  return result;
};

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
      .populate({
        path: 'productId',
        select: 'sku name unit sellingPrice image minStock maxStock reorderPoint'
      })
      .populate({
        path: 'warehouseId',
        select: 'name code zones'
      })
      .sort({ lastUpdated: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Tìm location từ warehouse và tính giá trị cho mỗi inventory
    const inventoriesWithLocation = inventories.map(enrichInventory);

    const total = await Inventory.countDocuments(query);

    // Set cache headers để tránh cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

    res.json({
      success: true,
      data: {
        inventories: inventoriesWithLocation,
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
      message: 'Server error',
      error: error.message
    });
  }
};

// Lấy tồn kho theo sản phẩm
const getInventoryByProduct = async(req, res) => {
  try {
    const { productId } = req.params;

    const inventories = await Inventory.find({ productId })
      .populate({
        path: 'warehouseId',
        select: 'name code zones'
      })
      .populate({
        path: 'productId',
        select: 'sku name unit sellingPrice image minStock maxStock reorderPoint'
      })
      .lean();

    // Tìm location từ warehouse và tính giá trị cho mỗi inventory
    const inventoriesWithLocation = inventories.map(enrichInventory);

    // Tính tổng tồn kho
    const totalQuantity = inventoriesWithLocation.reduce((sum, inv) => sum + (inv.quantity || 0), 0);
    const totalReserved = inventoriesWithLocation.reduce((sum, inv) => sum + (inv.reservedQuantity || 0), 0);
    const totalAvailable = inventoriesWithLocation.reduce((sum, inv) => sum + (inv.availableQuantity || 0), 0);

    // Set cache headers để tránh cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

    res.json({
      success: true,
      data: {
        inventories: inventoriesWithLocation,
        summary: {
          totalQuantity,
          totalReserved,
          totalAvailable,
          warehouseCount: inventoriesWithLocation.length
        }
      }
    });
  } catch (error) {
    console.error('Get inventory by product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Lấy tồn kho tại location cụ thể
const getInventoryByLocation = async(req, res) => {
  try {
    const { warehouseId, locationId } = req.params;

    const inventories = await Inventory.find({ warehouseId, locationId })
      .populate({
        path: 'productId',
        select: 'sku name unit sellingPrice image minStock maxStock reorderPoint'
      })
      .populate({
        path: 'warehouseId',
        select: 'name code zones'
      })
      .sort({ lastUpdated: -1 })
      .lean();

    // Tìm location từ warehouse và tính giá trị cho mỗi inventory
    const inventoriesWithLocation = inventories.map(enrichInventory);

    // Set cache headers để tránh cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

    res.json({
      success: true,
      data: { inventories: inventoriesWithLocation }
    });
  } catch (error) {
    console.error('Get inventory by location error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
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
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const inventoryData = req.body;

    // Map locationCode -> locationId nếu client gửi locationCode hoặc gửi locationId nhưng là mã (không phải ObjectId)
    const { warehouseId, locationId, locationCode } = inventoryData;

    // Xử lý locationId: nếu là empty string hoặc chỉ có whitespace, set thành undefined
    let processedLocationId = locationId;
    if (typeof locationId === 'string' && locationId.trim() === '') {
      processedLocationId = undefined;
      inventoryData.locationId = undefined;
    }

    // Kiểm tra nếu cần map từ code sang locationId
    const needsCodeMapping = (!processedLocationId && locationCode) ||
                             (processedLocationId && typeof processedLocationId === 'string' && !processedLocationId.match(/^[0-9a-fA-F]{24}$/));

    if (needsCodeMapping) {
      const warehouseDoc = await Warehouse.findById(warehouseId).lean();
      if (!warehouseDoc) {
        return res.status(400).json({
          success: false,
          message: 'Warehouse không tồn tại',
          code: 'WAREHOUSE_NOT_FOUND'
        });
      }

      const codeToMatch = (locationCode || processedLocationId || '').trim();
      if (!codeToMatch) {
        // Nếu không có code để tìm, set locationId thành undefined và tiếp tục (location là optional)
        inventoryData.locationId = undefined;
      } else {
        let resolvedLocationId = null;
        const allLocationCodes = [];

        // Tìm location theo code (case-insensitive)
        for (const zone of warehouseDoc.zones || []) {
          if (!zone.locations || zone.locations.length === 0) continue;

          for (const loc of zone.locations) {
            allLocationCodes.push(loc.code);
            // So sánh case-insensitive và trim
            if (loc.code && loc.code.trim().toLowerCase() === codeToMatch.toLowerCase()) {
              resolvedLocationId = loc._id;
              break;
            }
          }
          if (resolvedLocationId) break;
        }

        if (!resolvedLocationId) {
          return res.status(400).json({
            success: false,
            message: `Không tìm thấy location với code "${codeToMatch}" trong warehouse. ${allLocationCodes.length > 0 ? `Các codes có sẵn: ${allLocationCodes.slice(0, 5).join(', ')}${allLocationCodes.length > 5 ? '...' : ''}` : 'Warehouse này chưa có location nào.'}`,
            code: 'LOCATION_CODE_NOT_FOUND',
            searchedCode: codeToMatch,
            availableCodes: allLocationCodes.slice(0, 10)
          });
        }

        inventoryData.locationId = resolvedLocationId;
      }
    } else if (processedLocationId && typeof processedLocationId === 'string' && processedLocationId.match(/^[0-9a-fA-F]{24}$/)) {
      // locationId là ObjectId hợp lệ, giữ nguyên
      inventoryData.locationId = processedLocationId;
    } else {
      // Không có locationId, set thành undefined
      inventoryData.locationId = undefined;
    }

    // Nếu có locationId, đảm bảo location thuộc về warehouse chỉ định
    const finalLocationId = inventoryData.locationId;
    if (finalLocationId) {
      const warehouse = await Warehouse.findOne({
        _id: warehouseId,
        'zones.locations._id': finalLocationId
      }).select('_id');
      if (!warehouse) {
        return res.status(400).json({
          success: false,
          message: 'Location không thuộc warehouse hoặc không tồn tại',
          code: 'LOCATION_NOT_IN_WAREHOUSE'
        });
      }
    }

    // Kiểm tra inventory đã tồn tại
    // Nếu locationId là null/undefined: chỉ kiểm tra productId + warehouseId
    // Nếu có locationId: kiểm tra productId + warehouseId + locationId
    const duplicateQuery = {
      productId: inventoryData.productId,
      warehouseId: inventoryData.warehouseId
    };

    // Chỉ thêm locationId vào query nếu nó có giá trị
    if (finalLocationId) {
      duplicateQuery.locationId = finalLocationId;
    } else {
      // Nếu không có locationId, kiểm tra các records có locationId là null hoặc undefined
      duplicateQuery.$or = [
        { locationId: null },
        { locationId: { $exists: false } }
      ];
    }

    const existingInventory = await Inventory.findOne(duplicateQuery);

    if (existingInventory) {
      const locationMsg = finalLocationId
        ? 'at this location'
        : 'without a specific location';
      return res.status(400).json({
        success: false,
        message: `Inventory already exists for this product ${locationMsg} in this warehouse`
      });
    }

    const inventory = new Inventory(inventoryData);
    await inventory.save();

    // Populate product và warehouse để trả về đầy đủ thông tin
    const populatedInventory = await Inventory.findById(inventory._id)
      .populate({
        path: 'productId',
        select: 'name sku unit sellingPrice image minStock maxStock reorderPoint'
      })
      .populate({
        path: 'warehouseId',
        select: 'name code zones'
      })
      .lean();

    // Enrich inventory với location và value
    const enrichedInventory = enrichInventory(populatedInventory);

    // Set cache headers để tránh cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

    res.status(201).json({
      success: true,
      message: 'Inventory created successfully',
      data: { inventory: enrichedInventory }
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
    const { page = 1, limit = 10, warehouseId, productId, lowStock, zeroStock, overstock } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    if (warehouseId) query.warehouseId = warehouseId;
    if (productId) query.productId = productId;
    if (zeroStock === 'true') query.quantity = 0;

    // Populate với đầy đủ thông tin product và warehouse (bao gồm zones và locations)
    const inventories = await Inventory.find(query)
      .populate({
        path: 'productId',
        select: 'name sku unit sellingPrice image minStock maxStock reorderPoint'
      })
      .populate({
        path: 'warehouseId',
        select: 'name code zones'
      })
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 })
      .lean();

    // Tìm location từ warehouse và tính giá trị cho mỗi inventory
    const inventoriesWithLocation = inventories.map(enrichInventory);

    // Lọc theo lowStock hoặc overstock nếu có
    let filteredInventories = inventoriesWithLocation;
    if (lowStock === 'true') {
      filteredInventories = inventoriesWithLocation.filter(inv => {
        const product = inv.product || inv.productId;
        const minStock = product?.reorderPoint || product?.minStock || 0;
        return inv.quantity > 0 && inv.quantity <= minStock;
      });
    }
    if (overstock === 'true') {
      filteredInventories = inventoriesWithLocation.filter(inv => {
        const product = inv.product || inv.productId;
        const maxStock = product?.maxStock;
        return maxStock && maxStock > 0 && inv.quantity > maxStock;
      });
    }

    // Đếm total sau khi filter
    let total;
    if (lowStock === 'true' || overstock === 'true') {
      // Nếu có filter, cần đếm lại
      const allInventories = await Inventory.find(query)
        .populate({
          path: 'productId',
          select: 'minStock maxStock reorderPoint'
        })
        .lean();

      if (lowStock === 'true') {
        total = allInventories.filter(inv => {
          const minStock = inv.productId?.reorderPoint || inv.productId?.minStock || 0;
          return inv.quantity > 0 && inv.quantity <= minStock;
        }).length;
      } else if (overstock === 'true') {
        total = allInventories.filter(inv => {
          const maxStock = inv.productId?.maxStock;
          return maxStock && maxStock > 0 && inv.quantity > maxStock;
        }).length;
      } else {
        total = allInventories.length;
      }
    } else {
      total = await Inventory.countDocuments(query);
    }

    // Set cache headers để tránh cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

    res.json({
      success: true,
      data: {
        inventories: filteredInventories,
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
      message: 'Server error',
      error: error.message
    });
  }
};

// Lấy inventory theo ID
const getInventoryById = async(req, res) => {
  try {
    const { id } = req.params;

    const inventory = await Inventory.findById(id)
      .populate({
        path: 'productId',
        select: 'name sku unit sellingPrice image minStock maxStock reorderPoint'
      })
      .populate({
        path: 'warehouseId',
        select: 'name code zones'
      })
      .lean();

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: 'Inventory not found'
      });
    }

    // Enrich inventory với location và value
    const enrichedInventory = enrichInventory(inventory);

    // Set cache headers để tránh cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

    res.json({
      success: true,
      data: { inventory: enrichedInventory }
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
        select: 'name sku reorderPoint minStock maxStock image',
        model: 'Product'
      })
      .populate({
        path: 'warehouseId',
        select: 'name code zones',
        model: 'Warehouse'
      })
      .lean();

    // Filter những items có quantity <= reorderPoint
    const lowStockInventories = allInventories.filter(inventory => {
      const product = inventory.productId;
      // Kiểm tra nếu product được populate và có reorderPoint
      if (!product || typeof product === 'string') {
        return false;
      }
      const minStock = product.reorderPoint || product.minStock || 0;
      return inventory.quantity > 0 && inventory.quantity <= minStock;
    }).map(enrichInventory);

    // Set cache headers để tránh cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
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
        select: 'name sku reorderPoint minStock maxStock image',
        model: 'Product'
      })
      .populate({
        path: 'warehouseId',
        select: 'name code zones',
        model: 'Warehouse'
      })
      .lean();

    const inventoriesWithLocation = inventories.map(enrichInventory);

    // Set cache headers để tránh cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

    res.json({
      success: true,
      data: {
        inventories: inventoriesWithLocation,
        total: inventoriesWithLocation.length
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
        select: 'name sku maxStock minStock reorderPoint image',
        model: 'Product'
      })
      .populate({
        path: 'warehouseId',
        select: 'name code zones',
        model: 'Warehouse'
      })
      .lean();

    // Filter những items có quantity > maxStock (và maxStock > 0)
    const overstockInventories = allInventories.filter(inventory => {
      const product = inventory.productId;
      // Kiểm tra nếu product được populate và có maxStock hợp lệ
      if (!product || typeof product === 'string' || !product.maxStock || product.maxStock <= 0) {
        return false;
      }
      return inventory.quantity > product.maxStock;
    }).map(enrichInventory);

    // Set cache headers để tránh cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
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

// Export inventory to Excel
const exportInventory = async(req, res) => {
  try {
    const { warehouseId, productId, lowStock, zeroStock, overstock } = req.query;

    const query = {};
    if (warehouseId) query.warehouseId = warehouseId;
    if (productId) query.productId = productId;
    if (zeroStock === 'true') query.quantity = 0;

    // Populate với đầy đủ thông tin product và warehouse
    const inventories = await Inventory.find(query)
      .populate({
        path: 'productId',
        select: 'name sku unit sellingPrice image minStock maxStock reorderPoint'
      })
      .populate({
        path: 'warehouseId',
        select: 'name code zones'
      })
      .sort({ createdAt: -1 })
      .lean();

    // Tìm location từ warehouse và tính giá trị cho mỗi inventory
    const inventoriesWithLocation = inventories.map(enrichInventory);

    // Lọc theo lowStock hoặc overstock nếu có
    let filteredInventories = inventoriesWithLocation;
    if (lowStock === 'true') {
      filteredInventories = inventoriesWithLocation.filter(inv => {
        const product = inv.product || inv.productId;
        const minStock = product?.reorderPoint || product?.minStock || 0;
        return inv.quantity > 0 && inv.quantity <= minStock;
      });
    }
    if (overstock === 'true') {
      filteredInventories = inventoriesWithLocation.filter(inv => {
        const product = inv.product || inv.productId;
        const maxStock = product?.maxStock;
        return maxStock && maxStock > 0 && inv.quantity > maxStock;
      });
    }

    // Tạo Excel file
    const ExcelJS = require('exceljs');
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Inventory');

    // Định nghĩa columns
    worksheet.columns = [
      { header: 'STT', key: 'index', width: 8 },
      { header: 'SKU', key: 'sku', width: 15 },
      { header: 'Tên sản phẩm', key: 'productName', width: 30 },
      { header: 'Kho', key: 'warehouse', width: 20 },
      { header: 'Vị trí', key: 'location', width: 20 },
      { header: 'Số lượng', key: 'quantity', width: 12 },
      { header: 'Đã đặt', key: 'reserved', width: 12 },
      { header: 'Có sẵn', key: 'available', width: 12 },
      { header: 'Giá trị', key: 'value', width: 15 },
      { header: 'Tồn tối thiểu', key: 'minStock', width: 15 },
      { header: 'Tồn tối đa', key: 'maxStock', width: 15 },
      { header: 'Cập nhật lần cuối', key: 'lastUpdated', width: 20 }
    ];

    // Style header
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    // Thêm dữ liệu
    filteredInventories.forEach((inventory, index) => {
      const product = inventory.product || inventory.productId || {};
      const warehouse = inventory.warehouse || inventory.warehouseId || {};
      const location = inventory.location || {};
      
      worksheet.addRow({
        index: index + 1,
        sku: product.sku || '',
        productName: product.name || '',
        warehouse: warehouse.name || '',
        location: location.code || location.name || '',
        quantity: inventory.quantity || 0,
        reserved: inventory.reservedQuantity || 0,
        available: (inventory.quantity || 0) - (inventory.reservedQuantity || 0),
        value: inventory.value || 0,
        minStock: product.reorderPoint || product.minStock || 0,
        maxStock: product.maxStock || '',
        lastUpdated: inventory.lastUpdated ? new Date(inventory.lastUpdated).toLocaleString('vi-VN') : ''
      });
    });

    // Format số
    worksheet.getColumn('quantity').numFmt = '#,##0';
    worksheet.getColumn('reserved').numFmt = '#,##0';
    worksheet.getColumn('available').numFmt = '#,##0';
    worksheet.getColumn('value').numFmt = '#,##0';
    worksheet.getColumn('minStock').numFmt = '#,##0';
    worksheet.getColumn('maxStock').numFmt = '#,##0';

    // Set response headers
    const filename = `inventory_export_${new Date().toISOString().split('T')[0]}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Write to response
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Export inventory error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while exporting inventory'
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
  adjustInventory,
  exportInventory
};