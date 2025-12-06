// Dashboard Controller
const Inventory = require('../models/Inventory');
const Product = require('../models/Product');
const Inbound = require('../models/Inbound');
const Outbound = require('../models/Outbound');
const Warehouse = require('../models/Warehouse');
const User = require('../models/User');
const StockMovement = require('../models/StockMovement');
const Customer = require('../models/Customer');
const Supplier = require('../models/Supplier');

// Lấy dashboard overview
const getDashboardOverview = async(req, res) => {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    // const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));

    // Thống kê tổng quan
    const [
      totalProducts,
      totalWarehouses,
      totalUsers,
      totalSuppliers,
      totalCustomers,
      totalInventory,
      monthlyInbounds,
      monthlyOutbounds,
      lowStockProducts,
      recentMovements
    ] = await Promise.all([
      Product.countDocuments({ isActive: true }),
      Warehouse.countDocuments({ isActive: true }),
      User.countDocuments({ isActive: true }),
      Supplier.countDocuments({ isActive: true }),
      Customer.countDocuments({ isActive: true }),
      Inventory.aggregate([
        { $group: { _id: null, totalQuantity: { $sum: '$quantity' }, totalValue: { $sum: { $multiply: ['$quantity', '$unitPrice'] } } } }
      ]),
      Inbound.countDocuments({
        inboundDate: { $gte: startOfMonth },
        status: 'completed'
      }),
      Outbound.countDocuments({
        outboundDate: { $gte: startOfMonth },
        status: 'completed'
      }),
      Product.find({
        isActive: true,
        $expr: { $lte: ['$reorderPoint', '$minStock'] }
      }).limit(5),
      StockMovement.find()
        .populate('productId', 'sku name')
        .populate('warehouseId', 'name')
        .populate('userId', 'username')
        .sort({ createdAt: -1 })
        .limit(10)
    ]);

    // Tính tổng giá trị inventory
    const inventoryValue = totalInventory.length > 0 ? totalInventory[0].totalValue : 0;
    const totalQuantity = totalInventory.length > 0 ? totalInventory[0].totalQuantity : 0;

    // Tính doanh thu tháng từ outbound orders đã hoàn thành
    const monthlyRevenue = await Outbound.aggregate([
      {
        $match: {
          outboundDate: { $gte: startOfMonth },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$finalAmount' }
        }
      }
    ]);
    const revenue = monthlyRevenue.length > 0 ? monthlyRevenue[0].totalRevenue : 0;

    // Thống kê theo warehouse
    const warehouseStats = await Inventory.aggregate([
      {
        $group: {
          _id: '$warehouseId',
          totalQuantity: { $sum: '$quantity' },
          totalValue: { $sum: { $multiply: ['$quantity', '$unitPrice'] } }
        }
      },
      {
        $lookup: {
          from: 'warehouses',
          localField: '_id',
          foreignField: '_id',
          as: 'warehouse'
        }
      },
      { $unwind: '$warehouse' },
      {
        $project: {
          warehouseName: '$warehouse.name',
          totalQuantity: 1,
          totalValue: 1
        }
      }
    ]);

    // Thống kê inbound/outbound theo ngày (7 ngày gần nhất)
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      last7Days.push(date.toISOString().split('T')[0]);
    }

    const dailyStats = await Promise.all(
      last7Days.map(async(date) => {
        const startOfDay = new Date(date);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const [inboundCount, outboundCount] = await Promise.all([
          Inbound.countDocuments({
            inboundDate: { $gte: startOfDay, $lte: endOfDay },
            status: 'completed'
          }),
          Outbound.countDocuments({
            outboundDate: { $gte: startOfDay, $lte: endOfDay },
            status: 'completed'
          })
        ]);

        return {
          date,
          inboundCount,
          outboundCount
        };
      })
    );

    res.json({
      success: true,
      data: {
        overview: {
          totalProducts,
          totalWarehouses,
          totalUsers,
          totalSuppliers,
          totalCustomers,
          totalInventoryQuantity: totalQuantity,
          totalInventoryValue: inventoryValue,
          monthlyInbounds,
          monthlyOutbounds,
          monthlyRevenue: revenue
        },
        warehouseStats,
        lowStockProducts,
        recentMovements,
        dailyStats
      }
    });
  } catch (error) {
    console.error('Get dashboard overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Lấy thống kê theo khoảng thời gian
const getTimeRangeStats = async(req, res) => {
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

    if (warehouseId) {
      inboundQuery.warehouseId = warehouseId;
      outboundQuery.warehouseId = warehouseId;
    }

    const [
      inbounds,
      outbounds,
      inboundStats,
      outboundStats
    ] = await Promise.all([
      Inbound.find(inboundQuery)
        .populate('supplierId', 'name')
        .populate('warehouseId', 'name'),
      Outbound.find(outboundQuery)
        .populate('customerId', 'name')
        .populate('warehouseId', 'name'),
      Inbound.aggregate([
        { $match: inboundQuery },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: '$finalAmount' },
            totalItems: { $sum: { $size: '$items' } },
            count: { $sum: 1 }
          }
        }
      ]),
      Outbound.aggregate([
        { $match: outboundQuery },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: '$finalAmount' },
            totalItems: { $sum: { $size: '$items' } },
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    // Thống kê theo supplier (inbound)
    const supplierStats = inbounds.reduce((acc, inbound) => {
      const supplierName = inbound.supplierId.name;
      if (!acc[supplierName]) {
        acc[supplierName] = { count: 0, totalAmount: 0 };
      }
      acc[supplierName].count += 1;
      acc[supplierName].totalAmount += inbound.finalAmount;
      return acc;
    }, {});

    // Thống kê theo customer (outbound)
    const customerStats = outbounds.reduce((acc, outbound) => {
      const customerName = outbound.customerId.name;
      if (!acc[customerName]) {
        acc[customerName] = { count: 0, totalAmount: 0 };
      }
      acc[customerName].count += 1;
      acc[customerName].totalAmount += outbound.finalAmount;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        period: { startDate, endDate },
        inbound: {
          summary: inboundStats[0] || { totalAmount: 0, totalItems: 0, count: 0 },
          supplierStats,
          records: inbounds
        },
        outbound: {
          summary: outboundStats[0] || { totalAmount: 0, totalItems: 0, count: 0 },
          customerStats,
          records: outbounds
        }
      }
    });
  } catch (error) {
    console.error('Get time range stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Lấy top products
const getTopProducts = async(req, res) => {
  try {
    const { limit = 10, type = 'movement' } = req.query;

    let pipeline = [];

    if (type === 'movement') {
      // Top products theo số lượng movement
      pipeline = [
        {
          $group: {
            _id: '$productId',
            totalMovements: { $sum: 1 },
            totalQuantity: { $sum: { $abs: '$quantityChange' } }
          }
        },
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: '_id',
            as: 'product'
          }
        },
        { $unwind: '$product' },
        {
          $project: {
            productName: '$product.name',
            productSku: '$product.sku',
            totalMovements: 1,
            totalQuantity: 1
          }
        },
        { $sort: { totalMovements: -1 } },
        { $limit: parseInt(limit) }
      ];
    } else if (type === 'value') {
      // Top products theo giá trị
      pipeline = [
        {
          $group: {
            _id: '$productId',
            totalValue: { $sum: { $multiply: ['$quantityChange', '$unitPrice'] } },
            totalQuantity: { $sum: '$quantityChange' }
          }
        },
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: '_id',
            as: 'product'
          }
        },
        { $unwind: '$product' },
        {
          $project: {
            productName: '$product.name',
            productSku: '$product.sku',
            totalValue: 1,
            totalQuantity: 1
          }
        },
        { $sort: { totalValue: -1 } },
        { $limit: parseInt(limit) }
      ];
    }

    const topProducts = await StockMovement.aggregate(pipeline);

    res.json({
      success: true,
      data: {
        topProducts,
        type,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get top products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Lấy alerts và notifications
const getAlerts = async(req, res) => {
  try {
    const alerts = [];

    // Low stock alerts
    const lowStockProducts = await Product.find({
      isActive: true,
      $expr: { $lte: ['$reorderPoint', '$minStock'] }
    }).limit(10);

    lowStockProducts.forEach(product => {
      alerts.push({
        type: 'warning',
        title: 'Low Stock Alert',
        message: `Product ${product.sku} - ${product.name} is running low`,
        referenceType: 'product',
        referenceId: product._id,
        createdAt: new Date()
      });
    });

    // Pending approvals
    const pendingInbounds = await Inbound.countDocuments({ status: 'pending' });
    const pendingOutbounds = await Outbound.countDocuments({ status: 'pending' });

    if (pendingInbounds > 0) {
      alerts.push({
        type: 'info',
        title: 'Pending Approvals',
        message: `${pendingInbounds} inbound orders waiting for approval`,
        referenceType: 'inbound',
        createdAt: new Date()
      });
    }

    if (pendingOutbounds > 0) {
      alerts.push({
        type: 'info',
        title: 'Pending Approvals',
        message: `${pendingOutbounds} outbound orders waiting for approval`,
        referenceType: 'outbound',
        createdAt: new Date()
      });
    }

    // Recent errors (if any)
    const recentErrors = await StockMovement.find({
      quantityAfter: { $lt: 0 }
    }).limit(5);

    recentErrors.forEach(movement => {
      alerts.push({
        type: 'error',
        title: 'Negative Stock Detected',
        message: `Negative stock detected for product ${movement.productId}`,
        referenceType: 'inventory',
        referenceId: movement.productId,
        createdAt: movement.createdAt
      });
    });

    res.json({
      success: true,
      data: {
        alerts,
        total: alerts.length
      }
    });
  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Lấy dashboard stats
const getDashboardStats = async(req, res) => {
  try {
    const { timeRange = '7d' } = req.query;

    // Tính toán thời gian
    const now = new Date();
    let startDate;
    switch (timeRange) {
      case '1d':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // Lấy stats cơ bản
    const [
      totalProducts,
      totalCustomers,
      totalOrders,
      lowStockProducts
    ] = await Promise.all([
      Product.countDocuments({ isActive: true }),
      Customer.countDocuments({ isActive: true }),
      Outbound.countDocuments({ createdAt: { $gte: startDate } }),
      Product.countDocuments({
        isActive: true,
        $expr: { $lte: ['$currentStock', '$reorderPoint'] }
      })
    ]);

    res.json({
      success: true,
      data: {
        timeRange,
        stats: {
          totalProducts,
          totalCustomers,
          totalOrders,
          lowStockProducts
        }
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Lấy recent activities
const getRecentActivities = async(req, res) => {
  try {
    const { limit = 10 } = req.query;

    // Lấy các hoạt động gần đây từ các collection khác nhau
    const [
      recentProducts,
      recentCustomers,
      recentOutbounds
    ] = await Promise.all([
      Product.find({ isActive: true })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name sku createdAt'),
      Customer.find({ isActive: true })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name email createdAt'),
      Outbound.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('code status finalAmount createdAt')
    ]);

    // Kết hợp và sắp xếp theo thời gian
    const activities = [
      ...recentProducts.map(p => ({
        type: 'product',
        action: 'created',
        description: `Product "${p.name}" was created`,
        timestamp: p.createdAt,
        data: { name: p.name, sku: p.sku }
      })),
      ...recentCustomers.map(c => ({
        type: 'customer',
        action: 'created',
        description: `Customer "${c.name}" was created`,
        timestamp: c.createdAt,
        data: { name: c.name, email: c.email }
      })),
      ...recentOutbounds.map(o => ({
        type: 'outbound',
        action: 'created',
        description: `Outbound "${o.code}" was created`,
        timestamp: o.createdAt,
        data: { code: o.code, status: o.status, finalAmount: o.finalAmount }
      }))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, parseInt(limit));

    res.json({
      success: true,
      data: { activities }
    });
  } catch (error) {
    console.error('Get recent activities error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getDashboardOverview,
  getDashboardStats,
  getTimeRangeStats,
  getTopProducts,
  getAlerts,
  getRecentActivities
};