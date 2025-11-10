// Warehouse Controller
const Warehouse = require('../models/Warehouse');
const User = require('../models/User');
const Inventory = require('../models/Inventory');
const { validationResult } = require('express-validator');

// Tạo warehouse mới
const createWarehouse = async(req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const warehouseData = req.body;

    // Kiểm tra code đã tồn tại
    const existingWarehouse = await Warehouse.findOne({ code: warehouseData.code });
    if (existingWarehouse) {
      return res.status(400).json({
        success: false,
        message: 'Warehouse with this code already exists'
      });
    }

    // Kiểm tra manager tồn tại
    if (warehouseData.managerId) {
      const manager = await User.findById(warehouseData.managerId);
      if (!manager) {
        return res.status(400).json({
          success: false,
          message: 'Manager not found'
        });
      }
    }

    const warehouse = new Warehouse(warehouseData);
    await warehouse.save();

    res.status(201).json({
      success: true,
      message: 'Warehouse created successfully',
      data: { warehouse }
    });
  } catch (error) {
    console.error('Create warehouse error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Lấy danh sách warehouse
const getWarehouses = async(req, res) => {
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
        { address: { $regex: search, $options: 'i' } }
      ];
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    // Lấy danh sách kho (lean để tối ưu) và đếm tổng
    const [warehousesRaw, total] = await Promise.all([
      Warehouse.find(query)
        .populate('managerId', 'username fullName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Warehouse.countDocuments(query)
    ]);

    // Gom nhóm từ Inventory để lấy tổng số sản phẩm khác nhau theo warehouse
    const warehouseIds = warehousesRaw.map(w => w._id);
    const productCounts = await Inventory.aggregate([
      { $match: { warehouseId: { $in: warehouseIds } } },
      { $group: { _id: { warehouseId: '$warehouseId', productId: '$productId' } } },
      { $group: { _id: '$_id.warehouseId', totalProducts: { $sum: 1 } } }
    ]);
    const warehouseIdToProductCount = productCounts.reduce((acc, cur) => {
      acc[cur._id.toString()] = cur.totalProducts;
      return acc;
    }, {});

    // Chuẩn hóa dữ liệu trả về theo frontend: thêm status, type, totalProducts
    const warehouses = warehousesRaw.map(w => ({
      ...w,
      status: w.isActive ? 'active' : 'inactive',
      type: w.type || 'standard',
      totalProducts: warehouseIdToProductCount[w._id.toString()] || 0
    }));

    res.json({
      success: true,
      data: {
        warehouses,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get warehouses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Lấy warehouse theo ID
const getWarehouseById = async(req, res) => {
  try {
    const { id: warehouseId } = req.params;

    const raw = await Warehouse.findById(warehouseId)
      .populate('managerId', 'username fullName email phone')
      .lean();

    if (!raw) {
      return res.status(404).json({
        success: false,
        message: 'Warehouse not found'
      });
    }

    // Tính tổng số sản phẩm
    const productCountAgg = await Inventory.aggregate([
      { $match: { warehouseId: raw._id } },
      { $group: { _id: '$productId' } },
      { $count: 'totalProducts' }
    ]);
    const totalProducts = productCountAgg[0]?.totalProducts || 0;

    const warehouse = {
      ...raw,
      status: raw.isActive ? 'active' : 'inactive',
      type: raw.type || 'standard',
      totalProducts
    };

    res.json({
      success: true,
      data: { warehouse }
    });
  } catch (error) {
    console.error('Get warehouse by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Cập nhật warehouse
const updateWarehouse = async(req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { id: warehouseId } = req.params;
    const updateData = req.body;

    // Kiểm tra code trùng lặp (trừ warehouse hiện tại)
    if (updateData.code) {
      const existingWarehouse = await Warehouse.findOne({
        _id: { $ne: warehouseId },
        code: updateData.code
      });

      if (existingWarehouse) {
        return res.status(400).json({
          success: false,
          message: 'Warehouse with this code already exists'
        });
      }
    }

    // Kiểm tra manager nếu có thay đổi
    if (updateData.managerId) {
      const manager = await User.findById(updateData.managerId);
      if (!manager) {
        return res.status(400).json({
          success: false,
          message: 'Manager not found'
        });
      }
    }

    const warehouse = await Warehouse.findByIdAndUpdate(
      warehouseId,
      updateData,
      { new: true, runValidators: true }
    ).populate('managerId', 'username fullName email');

    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: 'Warehouse not found'
      });
    }

    res.json({
      success: true,
      message: 'Warehouse updated successfully',
      data: { warehouse }
    });
  } catch (error) {
    console.error('Update warehouse error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Xóa warehouse
const deleteWarehouse = async(req, res) => {
  try {
    const { id: warehouseId } = req.params;

    // Kiểm tra warehouse có inventory không
    const inventoryCount = await Inventory.countDocuments({ warehouseId });
    if (inventoryCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete warehouse with existing inventory. Please deactivate instead.'
      });
    }

    const warehouse = await Warehouse.findByIdAndDelete(warehouseId);

    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: 'Warehouse not found'
      });
    }

    res.json({
      success: true,
      message: 'Warehouse deleted successfully'
    });
  } catch (error) {
    console.error('Delete warehouse error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Cập nhật trạng thái warehouse (active | inactive | maintenance)
const updateWarehouseStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['active', 'inactive', 'maintenance'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }
    // Hiện tại schema chưa có field status, map tạm: maintenance => inactive (và trả status theo yêu cầu UI)
    const isActive = status === 'active';
    const updated = await Warehouse.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    ).lean();
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Warehouse not found'
      });
    }
    res.json({
      success: true,
      message: 'Status updated successfully',
      data: {
        warehouse: {
          ...updated,
          status,
          type: updated.type || 'standard'
        }
      }
    });
  } catch (error) {
    console.error('Update warehouse status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Thêm zone vào warehouse
const addZone = async(req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { warehouseId } = req.params;
    const zoneData = req.body;

    const warehouse = await Warehouse.findById(warehouseId);
    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: 'Warehouse not found'
      });
    }

    // Kiểm tra zone code trùng lặp trong warehouse
    const existingZone = warehouse.zones.find(zone => zone.code === zoneData.code);
    if (existingZone) {
      return res.status(400).json({
        success: false,
        message: 'Zone with this code already exists in this warehouse'
      });
    }

    warehouse.zones.push(zoneData);
    await warehouse.save();

    res.json({
      success: true,
      message: 'Zone added successfully',
      data: { warehouse }
    });
  } catch (error) {
    console.error('Add zone error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Cập nhật zone
const updateZone = async(req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { warehouseId, zoneId } = req.params;
    const updateData = req.body;

    const warehouse = await Warehouse.findById(warehouseId);
    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: 'Warehouse not found'
      });
    }

    const zone = warehouse.zones.id(zoneId);
    if (!zone) {
      return res.status(404).json({
        success: false,
        message: 'Zone not found'
      });
    }

    // Kiểm tra code trùng lặp (trừ zone hiện tại)
    if (updateData.code && updateData.code !== zone.code) {
      const existingZone = warehouse.zones.find(z => z.code === updateData.code && z._id.toString() !== zoneId);
      if (existingZone) {
        return res.status(400).json({
          success: false,
          message: 'Zone with this code already exists in this warehouse'
        });
      }
    }

    Object.assign(zone, updateData);
    await warehouse.save();

    res.json({
      success: true,
      message: 'Zone updated successfully',
      data: { warehouse }
    });
  } catch (error) {
    console.error('Update zone error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Xóa zone
const deleteZone = async(req, res) => {
  try {
    const { warehouseId, zoneId } = req.params;

    const warehouse = await Warehouse.findById(warehouseId);
    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: 'Warehouse not found'
      });
    }

    const zone = warehouse.zones.id(zoneId);
    if (!zone) {
      return res.status(404).json({
        success: false,
        message: 'Zone not found'
      });
    }

    // Kiểm tra zone có inventory không
    const inventoryCount = await Inventory.countDocuments({
      warehouseId,
      locationId: { $in: zone.locations.map(loc => loc._id) }
    });

    if (inventoryCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete zone with existing inventory. Please deactivate instead.'
      });
    }

    zone.remove();
    await warehouse.save();

    res.json({
      success: true,
      message: 'Zone deleted successfully',
      data: { warehouse }
    });
  } catch (error) {
    console.error('Delete zone error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Thêm location vào zone
const addLocation = async(req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { warehouseId, zoneId } = req.params;
    const locationData = req.body;

    const warehouse = await Warehouse.findById(warehouseId);
    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: 'Warehouse not found'
      });
    }

    const zone = warehouse.zones.id(zoneId);
    if (!zone) {
      return res.status(404).json({
        success: false,
        message: 'Zone not found'
      });
    }

    // Kiểm tra location code trùng lặp trong zone
    const existingLocation = zone.locations.find(loc => loc.code === locationData.code);
    if (existingLocation) {
      return res.status(400).json({
        success: false,
        message: 'Location with this code already exists in this zone'
      });
    }

    zone.locations.push(locationData);
    await warehouse.save();

    res.json({
      success: true,
      message: 'Location added successfully',
      data: { warehouse }
    });
  } catch (error) {
    console.error('Add location error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Cập nhật location
const updateLocation = async(req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { warehouseId, zoneId, locationId } = req.params;
    const updateData = req.body;

    const warehouse = await Warehouse.findById(warehouseId);
    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: 'Warehouse not found'
      });
    }

    const zone = warehouse.zones.id(zoneId);
    if (!zone) {
      return res.status(404).json({
        success: false,
        message: 'Zone not found'
      });
    }

    const location = zone.locations.id(locationId);
    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Location not found'
      });
    }

    // Kiểm tra code trùng lặp (trừ location hiện tại)
    if (updateData.code && updateData.code !== location.code) {
      const existingLocation = zone.locations.find(loc => loc.code === updateData.code && loc._id.toString() !== locationId);
      if (existingLocation) {
        return res.status(400).json({
          success: false,
          message: 'Location with this code already exists in this zone'
        });
      }
    }

    Object.assign(location, updateData);
    await warehouse.save();

    res.json({
      success: true,
      message: 'Location updated successfully',
      data: { warehouse }
    });
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Xóa location
const deleteLocation = async(req, res) => {
  try {
    const { warehouseId, zoneId, locationId } = req.params;

    const warehouse = await Warehouse.findById(warehouseId);
    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: 'Warehouse not found'
      });
    }

    const zone = warehouse.zones.id(zoneId);
    if (!zone) {
      return res.status(404).json({
        success: false,
        message: 'Zone not found'
      });
    }

    const location = zone.locations.id(locationId);
    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Location not found'
      });
    }

    // Kiểm tra location có inventory không
    const inventoryCount = await Inventory.countDocuments({
      warehouseId,
      locationId
    });

    if (inventoryCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete location with existing inventory. Please deactivate instead.'
      });
    }

    location.remove();
    await warehouse.save();

    res.json({
      success: true,
      message: 'Location deleted successfully',
      data: { warehouse }
    });
  } catch (error) {
    console.error('Delete location error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Lấy báo cáo warehouse
const getWarehouseReport = async(req, res) => {
  try {
    const { warehouseId } = req.params;

    const warehouse = await Warehouse.findById(warehouseId)
      .populate('managerId', 'username fullName email');

    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: 'Warehouse not found'
      });
    }

    // Thống kê inventory
    const inventories = await Inventory.find({ warehouseId })
      .populate('productId', 'sku name sellingPrice');

    const totalValue = inventories.reduce((sum, inv) => {
      return sum + (inv.quantity * (inv.productId.sellingPrice || 0));
    }, 0);

    const totalQuantity = inventories.reduce((sum, inv) => sum + inv.quantity, 0);
    const totalReserved = inventories.reduce((sum, inv) => sum + inv.reservedQuantity, 0);

    // Thống kê zones và locations
    const totalZones = warehouse.zones.length;
    const totalLocations = warehouse.zones.reduce((sum, zone) => sum + zone.locations.length, 0);
    const activeZones = warehouse.zones.filter(zone => zone.isActive).length;
    const activeLocations = warehouse.zones.reduce((sum, zone) => {
      return sum + zone.locations.filter(loc => loc.isActive).length;
    }, 0);

    res.json({
      success: true,
      data: {
        warehouse,
        inventory: {
          totalItems: inventories.length,
          totalQuantity,
          totalReserved,
          totalAvailable: totalQuantity - totalReserved,
          totalValue,
          averageValue: inventories.length > 0 ? totalValue / inventories.length : 0
        },
        structure: {
          totalZones,
          totalLocations,
          activeZones,
          activeLocations,
          utilizationRate: totalLocations > 0 ? (activeLocations / totalLocations) * 100 : 0
        }
      }
    });
  } catch (error) {
    console.error('Get warehouse report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Tổng quan kho (overview)
const getWarehousesOverview = async (req, res) => {
  try {
    const [totalWarehouses, activeWarehouses, inactiveWarehouses, recent] = await Promise.all([
      Warehouse.countDocuments({}),
      Warehouse.countDocuments({ isActive: true }),
      Warehouse.countDocuments({ isActive: false }),
      Warehouse.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name code isActive createdAt')
        .lean()
    ]);
    // Hiện chưa có trạng thái maintenance riêng => 0
    const maintenanceWarehouses = 0;

    res.json({
      success: true,
      data: {
        totalWarehouses,
        activeWarehouses,
        inactiveWarehouses,
        maintenanceWarehouses,
        recent: recent.map(r => ({
          ...r,
          status: r.isActive ? 'active' : 'inactive'
        }))
      }
    });
  } catch (error) {
    console.error('Get warehouses overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  createWarehouse,
  getWarehouses,
  getWarehouseById,
  updateWarehouse,
  deleteWarehouse,
  updateWarehouseStatus,
  addZone,
  updateZone,
  deleteZone,
  addLocation,
  updateLocation,
  deleteLocation,
  getWarehouseReport,
  getWarehousesOverview
};