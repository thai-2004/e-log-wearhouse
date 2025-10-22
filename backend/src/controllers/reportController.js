// Report Controller
const Inventory = require('../models/Inventory');
const Product = require('../models/Product');
const Inbound = require('../models/Inbound');
const Outbound = require('../models/Outbound');
const Warehouse = require('../models/Warehouse');
const StockMovement = require('../models/StockMovement');
const Category = require('../models/Category');

// Báo cáo tồn kho
const getInventoryReport = async(req, res) => {
  try {
    const { warehouseId, categoryId, lowStockOnly, zeroStock } = req.query;

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
      .populate('warehouseId', 'name code')
      .populate('categoryId', 'name');

    let filteredInventories = inventories;

    // Lọc theo điều kiện
    if (lowStockOnly === 'true') {
      filteredInventories = inventories.filter(inv => {
        const product = inv.productId;
        return inv.quantity <= (product.reorderPoint || 0);
      });
    }

    if (zeroStock === 'true') {
      filteredInventories = inventories.filter(inv => inv.quantity === 0);
    }

    // Tính toán thống kê
    const totalValue = filteredInventories.reduce((sum, inv) => {
      return sum + (inv.quantity * (inv.productId.sellingPrice || 0));
    }, 0);

    const totalQuantity = filteredInventories.reduce((sum, inv) => sum + inv.quantity, 0);
    const totalReserved = filteredInventories.reduce((sum, inv) => sum + inv.reservedQuantity, 0);

    // Thống kê theo category
    const categoryStats = filteredInventories.reduce((acc, inv) => {
      const categoryName = inv.productId.categoryId?.name || 'Uncategorized';
      if (!acc[categoryName]) {
        acc[categoryName] = { count: 0, totalQuantity: 0, totalValue: 0 };
      }
      acc[categoryName].count += 1;
      acc[categoryName].totalQuantity += inv.quantity;
      acc[categoryName].totalValue += inv.quantity * (inv.productId.sellingPrice || 0);
      return acc;
    }, {});

    // Thống kê theo warehouse
    const warehouseStats = filteredInventories.reduce((acc, inv) => {
      const warehouseName = inv.warehouseId.name;
      if (!acc[warehouseName]) {
        acc[warehouseName] = { count: 0, totalQuantity: 0, totalValue: 0 };
      }
      acc[warehouseName].count += 1;
      acc[warehouseName].totalQuantity += inv.quantity;
      acc[warehouseName].totalValue += inv.quantity * (inv.productId.sellingPrice || 0);
      return acc;
    }, {});

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
        },
        categoryStats,
        warehouseStats
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

// Báo cáo nhập kho
const getInboundReport = async(req, res) => {
  try {
    const { warehouseId, supplierId, startDate, endDate, status } = req.query;

    const matchQuery = {};

    if (warehouseId) matchQuery.warehouseId = warehouseId;
    if (supplierId) matchQuery.supplierId = supplierId;
    if (status) matchQuery.status = status;
    if (startDate || endDate) {
      matchQuery.inboundDate = {};
      if (startDate) matchQuery.inboundDate.$gte = new Date(startDate);
      if (endDate) matchQuery.inboundDate.$lte = new Date(endDate);
    }

    const inbounds = await Inbound.find(matchQuery)
      .populate('supplierId', 'name code')
      .populate('warehouseId', 'name code')
      .populate('userId', 'username fullName')
      .populate('approvedBy', 'username fullName')
      .populate('items.productId', 'sku name unit');

    // Thống kê tổng quan
    const totalAmount = inbounds.reduce((sum, inbound) => sum + inbound.finalAmount, 0);
    const totalItems = inbounds.reduce((sum, inbound) => sum + inbound.items.length, 0);

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

    // Thống kê theo tháng
    const monthlyStats = inbounds.reduce((acc, inbound) => {
      const month = inbound.inboundDate.toISOString().substring(0, 7); // YYYY-MM
      if (!acc[month]) {
        acc[month] = { count: 0, totalAmount: 0 };
      }
      acc[month].count += 1;
      acc[month].totalAmount += inbound.finalAmount;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        inbounds,
        summary: {
          totalInbounds: inbounds.length,
          totalAmount,
          totalItems,
          averageAmount: inbounds.length > 0 ? totalAmount / inbounds.length : 0
        },
        statusStats,
        supplierStats,
        warehouseStats,
        monthlyStats
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

// Báo cáo xuất kho
const getOutboundReport = async(req, res) => {
  try {
    const { warehouseId, customerId, startDate, endDate, status, type } = req.query;

    const matchQuery = {};

    if (warehouseId) matchQuery.warehouseId = warehouseId;
    if (customerId) matchQuery.customerId = customerId;
    if (status) matchQuery.status = status;
    if (type) matchQuery.type = type;
    if (startDate || endDate) {
      matchQuery.outboundDate = {};
      if (startDate) matchQuery.outboundDate.$gte = new Date(startDate);
      if (endDate) matchQuery.outboundDate.$lte = new Date(endDate);
    }

    const outbounds = await Outbound.find(matchQuery)
      .populate('customerId', 'name code')
      .populate('warehouseId', 'name code')
      .populate('userId', 'username fullName')
      .populate('approvedBy', 'username fullName')
      .populate('items.productId', 'sku name unit');

    // Thống kê tổng quan
    const totalAmount = outbounds.reduce((sum, outbound) => sum + outbound.finalAmount, 0);
    const totalItems = outbounds.reduce((sum, outbound) => sum + outbound.items.length, 0);

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

    // Thống kê theo tháng
    const monthlyStats = outbounds.reduce((acc, outbound) => {
      const month = outbound.outboundDate.toISOString().substring(0, 7); // YYYY-MM
      if (!acc[month]) {
        acc[month] = { count: 0, totalAmount: 0 };
      }
      acc[month].count += 1;
      acc[month].totalAmount += outbound.finalAmount;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        outbounds,
        summary: {
          totalOutbounds: outbounds.length,
          totalAmount,
          totalItems,
          averageAmount: outbounds.length > 0 ? totalAmount / outbounds.length : 0
        },
        statusStats,
        customerStats,
        warehouseStats,
        typeStats,
        monthlyStats
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

// Báo cáo stock movement
const getStockMovementReport = async(req, res) => {
  try {
    const {
      productId,
      warehouseId,
      type,
      referenceType,
      startDate,
      endDate,
      userId
    } = req.query;

    const matchQuery = {};

    if (productId) matchQuery.productId = productId;
    if (warehouseId) matchQuery.warehouseId = warehouseId;
    if (type) matchQuery.type = type;
    if (referenceType) matchQuery.referenceType = referenceType;
    if (userId) matchQuery.userId = userId;
    if (startDate || endDate) {
      matchQuery.createdAt = {};
      if (startDate) matchQuery.createdAt.$gte = new Date(startDate);
      if (endDate) matchQuery.createdAt.$lte = new Date(endDate);
    }

    const movements = await StockMovement.find(matchQuery)
      .populate('productId', 'sku name unit')
      .populate('warehouseId', 'name code')
      .populate('userId', 'username fullName')
      .sort({ createdAt: -1 });

    // Thống kê theo type
    const typeStats = movements.reduce((acc, movement) => {
      acc[movement.type] = (acc[movement.type] || 0) + 1;
      return acc;
    }, {});

    // Thống kê theo warehouse
    const warehouseStats = movements.reduce((acc, movement) => {
      const warehouseName = movement.warehouseId.name;
      if (!acc[warehouseName]) {
        acc[warehouseName] = { count: 0, totalQuantity: 0 };
      }
      acc[warehouseName].count += 1;
      acc[warehouseName].totalQuantity += Math.abs(movement.quantityChange);
      return acc;
    }, {});

    // Thống kê theo product
    const productStats = movements.reduce((acc, movement) => {
      const productSku = movement.productId.sku;
      if (!acc[productSku]) {
        acc[productSku] = {
          count: 0,
          totalQuantity: 0,
          productName: movement.productId.name
        };
      }
      acc[productSku].count += 1;
      acc[productSku].totalQuantity += Math.abs(movement.quantityChange);
      return acc;
    }, {});

    // Thống kê theo ngày
    const dailyStats = movements.reduce((acc, movement) => {
      const date = movement.createdAt.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { count: 0, totalQuantity: 0 };
      }
      acc[date].count += 1;
      acc[date].totalQuantity += Math.abs(movement.quantityChange);
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        movements,
        summary: {
          totalMovements: movements.length,
          totalQuantity: movements.reduce((sum, m) => sum + Math.abs(m.quantityChange), 0)
        },
        typeStats,
        warehouseStats,
        productStats,
        dailyStats
      }
    });
  } catch (error) {
    console.error('Get stock movement report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Báo cáo tổng hợp
const getComprehensiveReport = async(req, res) => {
  try {
    const { startDate, endDate, warehouseId } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    const inboundQuery = {
      inboundDate: { $gte: start, $lte: end },
      status: 'completed'
    };

    const outboundQuery = {
      outboundDate: { $gte: start, $lte: end },
      status: 'completed'
    };

    const movementQuery = {
      createdAt: { $gte: start, $lte: end }
    };

    if (warehouseId) {
      inboundQuery.warehouseId = warehouseId;
      outboundQuery.warehouseId = warehouseId;
      movementQuery.warehouseId = warehouseId;
    }

    const [
      inbounds,
      outbounds,
      movements,
      inventorySnapshot
    ] = await Promise.all([
      Inbound.find(inboundQuery)
        .populate('supplierId', 'name')
        .populate('warehouseId', 'name'),
      Outbound.find(outboundQuery)
        .populate('customerId', 'name')
        .populate('warehouseId', 'name'),
      StockMovement.find(movementQuery)
        .populate('productId', 'sku name')
        .populate('warehouseId', 'name'),
      Inventory.find(warehouseId ? { warehouseId } : {})
        .populate('productId', 'sku name sellingPrice')
        .populate('warehouseId', 'name')
    ]);

    // Tính toán các chỉ số
    const inboundAmount = inbounds.reduce((sum, inbound) => sum + inbound.finalAmount, 0);
    const outboundAmount = outbounds.reduce((sum, outbound) => sum + outbound.finalAmount, 0);
    const inventoryValue = inventorySnapshot.reduce((sum, inv) => {
      return sum + (inv.quantity * (inv.productId.sellingPrice || 0));
    }, 0);

    // Thống kê turnover
    const turnoverRate = inventoryValue > 0 ? (outboundAmount / inventoryValue) * 100 : 0;

    // Thống kê theo warehouse
    const warehouseStats = {};

    inbounds.forEach(inbound => {
      const warehouseName = inbound.warehouseId.name;
      if (!warehouseStats[warehouseName]) {
        warehouseStats[warehouseName] = {
          inboundCount: 0,
          inboundAmount: 0,
          outboundCount: 0,
          outboundAmount: 0,
          inventoryValue: 0
        };
      }
      warehouseStats[warehouseName].inboundCount += 1;
      warehouseStats[warehouseName].inboundAmount += inbound.finalAmount;
    });

    outbounds.forEach(outbound => {
      const warehouseName = outbound.warehouseId.name;
      if (!warehouseStats[warehouseName]) {
        warehouseStats[warehouseName] = {
          inboundCount: 0,
          inboundAmount: 0,
          outboundCount: 0,
          outboundAmount: 0,
          inventoryValue: 0
        };
      }
      warehouseStats[warehouseName].outboundCount += 1;
      warehouseStats[warehouseName].outboundAmount += outbound.finalAmount;
    });

    inventorySnapshot.forEach(inv => {
      const warehouseName = inv.warehouseId.name;
      if (!warehouseStats[warehouseName]) {
        warehouseStats[warehouseName] = {
          inboundCount: 0,
          inboundAmount: 0,
          outboundCount: 0,
          outboundAmount: 0,
          inventoryValue: 0
        };
      }
      warehouseStats[warehouseName].inventoryValue += inv.quantity * (inv.productId.sellingPrice || 0);
    });

    res.json({
      success: true,
      data: {
        period: { startDate, endDate },
        summary: {
          inboundAmount,
          outboundAmount,
          inventoryValue,
          turnoverRate,
          netFlow: inboundAmount - outboundAmount
        },
        warehouseStats,
        inventorySnapshot: inventorySnapshot.slice(0, 50) // Limit for performance
      }
    });
  } catch (error) {
    console.error('Get comprehensive report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Báo cáo bán hàng
const getSalesReport = async(req, res) => {
  try {
    const { startDate, endDate, format = 'json' } = req.query;

    // Lấy dữ liệu bán hàng từ outbound
    const salesData = await Outbound.find({
      status: 'completed',
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    })
    .populate('customerId', 'name email')
    .populate('warehouseId', 'name');

    const totalSales = salesData.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalOrders = salesData.length;

    const report = {
      period: { startDate, endDate },
      summary: {
        totalSales,
        totalOrders,
        averageOrderValue: totalOrders > 0 ? totalSales / totalOrders : 0
      },
      data: salesData
    };

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Get sales report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Báo cáo khách hàng
const getCustomerReport = async(req, res) => {
  try {
    const { startDate, endDate, format = 'json' } = req.query;

    // Lấy dữ liệu khách hàng
    const customers = await Customer.find({
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    });

    const totalCustomers = customers.length;
    const activeCustomers = customers.filter(c => c.isActive).length;

    const report = {
      period: { startDate, endDate },
      summary: {
        totalCustomers,
        activeCustomers,
        inactiveCustomers: totalCustomers - activeCustomers
      },
      data: customers
    };

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Get customer report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Báo cáo sản phẩm
const getProductReport = async(req, res) => {
  try {
    const { startDate, endDate, format = 'json' } = req.query;

    // Lấy dữ liệu sản phẩm
    const products = await Product.find({
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    })
    .populate('categoryId', 'name');

    const totalProducts = products.length;
    const activeProducts = products.filter(p => p.isActive).length;

    const report = {
      period: { startDate, endDate },
      summary: {
        totalProducts,
        activeProducts,
        inactiveProducts: totalProducts - activeProducts
      },
      data: products
    };

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Get product report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Báo cáo kho
const getWarehouseReport = async(req, res) => {
  try {
    const { startDate, endDate, format = 'json' } = req.query;

    // Lấy dữ liệu kho
    const warehouses = await Warehouse.find({
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    });

    const totalWarehouses = warehouses.length;
    const activeWarehouses = warehouses.filter(w => w.isActive).length;

    const report = {
      period: { startDate, endDate },
      summary: {
        totalWarehouses,
        activeWarehouses,
        inactiveWarehouses: totalWarehouses - activeWarehouses
      },
      data: warehouses
    };

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Get warehouse report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Báo cáo tổng hợp
const getSummaryReport = async(req, res) => {
  try {
    const { startDate, endDate, format = 'json' } = req.query;

    // Lấy dữ liệu tổng hợp
    const [
      totalProducts,
      totalCustomers,
      totalOrders,
      totalWarehouses
    ] = await Promise.all([
      Product.countDocuments({ isActive: true }),
      Customer.countDocuments({ isActive: true }),
      Outbound.countDocuments({ status: 'completed' }),
      Warehouse.countDocuments({ isActive: true })
    ]);

    const report = {
      period: { startDate, endDate },
      summary: {
        totalProducts,
        totalCustomers,
        totalOrders,
        totalWarehouses
      }
    };

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Get summary report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getSalesReport,
  getInventoryReport,
  getInboundReport,
  getOutboundReport,
  getCustomerReport,
  getProductReport,
  getWarehouseReport,
  getSummaryReport,
  getStockMovementReport,
  getComprehensiveReport
};