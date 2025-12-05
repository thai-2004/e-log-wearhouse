// Report Controller
const Inventory = require('../models/Inventory');
const Product = require('../models/Product');
const Inbound = require('../models/Inbound');
const Outbound = require('../models/Outbound');
const Warehouse = require('../models/Warehouse');
const StockMovement = require('../models/StockMovement');
const Category = require('../models/Category');
const PDFDocument = require('pdfkit');
const fs = require('fs');

// NOTE:
// Module Reports trên frontend mong đợi một tập các API RESTful cho việc quản lý
// "định nghĩa báo cáo" (report definitions/templates) bên cạnh các API báo cáo
// thống kê thực tế ở dưới. Hiện tại backend chưa có schema cho entity Report,
// nên ta cung cấp một lớp API tối thiểu dựa trên dữ liệu tĩnh để:
// - Tránh lỗi 404 cho các endpoint: /api/reports, /api/reports/templates, /api/reports/types
// - Giúp màn Báo cáo hiển thị được danh sách/report type cơ bản.
// Nếu sau này cần lưu cấu hình báo cáo thực, có thể thay các mock này bằng
// model MongoDB tương ứng.

// In-memory danh sách "định nghĩa báo cáo" (mock, không lưu DB)
const reportDefinitions = [
  {
    id: 'inventory-overview',
    name: 'Báo cáo tồn kho tổng quan',
    description: 'Theo dõi số lượng và giá trị tồn kho theo kho và danh mục.',
    type: 'inventory',
    status: 'active',
    isFavorite: true,
    runCount: 0,
    creator: {
      id: 'system',
      name: 'Hệ thống'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'revenue-summary',
    name: 'Báo cáo doanh thu',
    description: 'Tổng hợp doanh thu theo thời gian và khách hàng.',
    type: 'revenue',
    status: 'active',
    isFavorite: false,
    runCount: 0,
    creator: {
      id: 'system',
      name: 'Hệ thống'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Helper tạo ID đơn giản cho báo cáo mới
const generateReportId = () => `custom-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

// Lấy danh sách "định nghĩa báo cáo"
const getReportsList = async (req, res) => {
  try {
    const {
      search = '',
      type,
      status,
      creator,
      page = 1,
      limit = 12
    } = req.query;

    const normalizedSearch = String(search).toLowerCase();

    const filtered = reportDefinitions.filter((report) => {
      if (normalizedSearch &&
        !report.name.toLowerCase().includes(normalizedSearch) &&
        !report.description.toLowerCase().includes(normalizedSearch)
      ) {
        return false;
      }

      if (type && report.type !== type) return false;
      if (status && report.status !== status) return false;
      if (creator && report.creator?.id !== creator) return false;

      return true;
    });

    const pageNumber = Number(page) || 1;
    const limitNumber = Number(limit) || 12;
    const start = (pageNumber - 1) * limitNumber;
    const end = start + limitNumber;

    const paginated = filtered.slice(start, end);
    const totalItems = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / limitNumber));

    res.json({
      success: true,
      data: paginated,
      page: pageNumber,
      limit: limitNumber,
      totalItems,
      totalPages
    });
  } catch (error) {
    console.error('Get reports list error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Lấy thông tin báo cáo theo ID (mock)
const getReportById = async (req, res) => {
  try {
    const { id } = req.params;
    const report = reportDefinitions.find((r) => r.id === id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Get report by id error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Tạo báo cáo mới (mock)
const createReport = async (req, res) => {
  try {
    const body = req.body || {};

    if (!body.name || !body.type) {
      return res.status(400).json({
        success: false,
        message: 'Tên báo cáo và loại báo cáo là bắt buộc'
      });
    }

    const now = new Date();
    const newReport = {
      id: generateReportId(),
      name: body.name,
      description: body.description || '',
      type: body.type,
      status: body.status || 'draft',
      isFavorite: !!body.isFavorite,
      runCount: 0,
      creator: {
        id: req.user?.id || 'system',
        name: req.user?.fullName || req.user?.username || 'Hệ thống'
      },
      createdAt: now,
      updatedAt: now,
      // Lưu thêm cấu hình chi tiết nếu có
      config: body
    };

    reportDefinitions.push(newReport);

    res.status(201).json({
      success: true,
      data: newReport
    });
  } catch (error) {
    console.error('Create report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Cập nhật báo cáo (mock)
const updateReport = async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body || {};

    const index = reportDefinitions.findIndex((r) => r.id === id);
    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    const existing = reportDefinitions[index];
    const updated = {
      ...existing,
      ...body,
      id: existing.id,
      updatedAt: new Date()
    };

    reportDefinitions[index] = updated;

    res.json({
      success: true,
      data: updated
    });
  } catch (error) {
    console.error('Update report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Xóa báo cáo (mock)
const deleteReportDefinition = async (req, res) => {
  try {
    const { id } = req.params;
    const index = reportDefinitions.findIndex((r) => r.id === id);

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    reportDefinitions.splice(index, 1);

    res.json({
      success: true,
      message: 'Report deleted'
    });
  } catch (error) {
    console.error('Delete report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Danh sách template báo cáo (mock)
const getReportTemplates = async (_req, res) => {
  try {
    const templates = [
      {
        id: 'tpl-inventory-basic',
        name: 'Mẫu báo cáo tồn kho cơ bản',
        description: 'Liệt kê tồn kho theo kho và danh mục.',
        type: 'inventory',
        category: 'inventory'
      },
      {
        id: 'tpl-revenue-basic',
        name: 'Mẫu báo cáo doanh thu cơ bản',
        description: 'Tổng hợp doanh thu theo thời gian.',
        type: 'revenue',
        category: 'sales'
      }
    ];

    res.json({
      success: true,
      data: templates
    });
  } catch (error) {
    console.error('Get report templates error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Danh sách loại báo cáo (mock)
const getReportTypes = async (_req, res) => {
  try {
    const types = [
      { id: 'inventory', name: 'Báo cáo tồn kho' },
      { id: 'revenue', name: 'Báo cáo doanh thu' },
      { id: 'customer', name: 'Báo cáo khách hàng' },
      { id: 'warehouse', name: 'Báo cáo kho' },
      { id: 'movement', name: 'Báo cáo dịch chuyển tồn kho' },
      { id: 'summary', name: 'Báo cáo tổng hợp' }
    ];

    res.json(types);
  } catch (error) {
    console.error('Get report types error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

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

// Lấy dữ liệu báo cáo (mock - trả về dữ liệu mẫu dựa trên type)
const getReportData = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10, ...filters } = req.query;

    const report = reportDefinitions.find((r) => r.id === id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Mock data dựa trên type của report
    const mockData = [];
    const totalRecords = 50; // Mock total
    const pageNumber = Number(page) || 1;
    const limitNumber = Number(limit) || 10;

    // Tạo dữ liệu mẫu
    for (let i = 0; i < Math.min(limitNumber, totalRecords - (pageNumber - 1) * limitNumber); i++) {
      const index = (pageNumber - 1) * limitNumber + i;
      mockData.push({
        id: `item-${index}`,
        name: `Item ${index + 1}`,
        value: Math.floor(Math.random() * 1000),
        date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: ['active', 'inactive', 'pending'][Math.floor(Math.random() * 3)]
      });
    }

    res.json({
      success: true,
      data: mockData,
      page: pageNumber,
      limit: limitNumber,
      totalRecords,
      totalPages: Math.ceil(totalRecords / limitNumber),
      summary: {
        total: totalRecords,
        average: 500
      }
    });
  } catch (error) {
    console.error('Get report data error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Chạy báo cáo (mock - cập nhật runCount)
const runReport = async (req, res) => {
  try {
    const { id } = req.params;
    const index = reportDefinitions.findIndex((r) => r.id === id);

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    const report = reportDefinitions[index];
    report.runCount = (report.runCount || 0) + 1;
    report.lastRunAt = new Date();
    reportDefinitions[index] = report;

    res.json({
      success: true,
      data: report,
      message: 'Report executed successfully'
    });
  } catch (error) {
    console.error('Run report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Thêm vào yêu thích
const addToFavorites = async (req, res) => {
  try {
    const { id } = req.params;
    const index = reportDefinitions.findIndex((r) => r.id === id);

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    const report = reportDefinitions[index];
    report.isFavorite = true;
    reportDefinitions[index] = report;

    res.json({
      success: true,
      data: report,
      message: 'Added to favorites'
    });
  } catch (error) {
    console.error('Add to favorites error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Xóa khỏi yêu thích
const removeFromFavorites = async (req, res) => {
  try {
    const { id } = req.params;
    const index = reportDefinitions.findIndex((r) => r.id === id);

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    const report = reportDefinitions[index];
    report.isFavorite = false;
    reportDefinitions[index] = report;

    res.json({
      success: true,
      data: report,
      message: 'Removed from favorites'
    });
  } catch (error) {
    console.error('Remove from favorites error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Helper function để lấy dữ liệu report dựa trên type và filters
const fetchReportData = async (report) => {
  try {
    const filters = report.config?.filters || {};
    const columns = report.config?.columns || [];
    const reportType = report.type;

    let data = [];
    let summary = {};

    // Lấy dữ liệu dựa trên loại báo cáo
    if (reportType === 'inventory') {
      const matchQuery = {};
      
      if (filters.warehouses && filters.warehouses.length > 0) {
        matchQuery.warehouseId = { $in: filters.warehouses };
      }
      if (filters.products && filters.products.length > 0) {
        matchQuery.productId = { $in: filters.products };
      }
      if (filters.categories && filters.categories.length > 0) {
        matchQuery.categoryId = { $in: filters.categories };
      }

      const inventories = await Inventory.find(matchQuery)
        .populate('productId', 'sku name unit price')
        .populate('warehouseId', 'name code')
        .populate('categoryId', 'name')
        .limit(1000);

      data = inventories.map(inv => ({
        id: inv._id.toString(),
        product: inv.productId?.name || 'N/A',
        sku: inv.productId?.sku || 'N/A',
        warehouse: inv.warehouseId?.name || 'N/A',
        category: inv.categoryId?.name || 'N/A',
        quantity: inv.quantity || 0,
        reservedQuantity: inv.reservedQuantity || 0,
        availableQuantity: (inv.quantity || 0) - (inv.reservedQuantity || 0),
        unit: inv.productId?.unit || 'N/A',
        value: (inv.quantity || 0) * (inv.productId?.price || 0)
      }));

      summary = {
        totalItems: data.length,
        totalQuantity: data.reduce((sum, item) => sum + item.quantity, 0),
        totalValue: data.reduce((sum, item) => sum + item.value, 0)
      };
    } else if (reportType === 'revenue') {
      const matchQuery = { status: 'completed' };
      
      if (filters.dateRange?.startDate) {
        matchQuery.createdAt = { $gte: new Date(filters.dateRange.startDate) };
      }
      if (filters.dateRange?.endDate) {
        matchQuery.createdAt = {
          ...matchQuery.createdAt,
          $lte: new Date(filters.dateRange.endDate)
        };
      }
      if (filters.customers && filters.customers.length > 0) {
        matchQuery.customerId = { $in: filters.customers };
      }
      if (filters.warehouses && filters.warehouses.length > 0) {
        matchQuery.warehouseId = { $in: filters.warehouses };
      }

      const outbounds = await Outbound.find(matchQuery)
        .populate('customerId', 'name email')
        .populate('warehouseId', 'name')
        .sort({ createdAt: -1 })
        .limit(1000);

      data = outbounds.map(out => ({
        id: out._id.toString(),
        code: out.code || 'N/A',
        customer: out.customerId?.name || 'N/A',
        warehouse: out.warehouseId?.name || 'N/A',
        totalAmount: out.totalAmount || 0,
        status: out.status || 'N/A',
        createdAt: out.createdAt
      }));

      summary = {
        totalOrders: data.length,
        totalRevenue: data.reduce((sum, item) => sum + item.totalAmount, 0),
        averageOrder: data.length > 0 ? data.reduce((sum, item) => sum + item.totalAmount, 0) / data.length : 0
      };
    } else {
      // Default: trả về mock data
      data = [];
      for (let i = 0; i < 10; i++) {
        data.push({
          id: `item-${i}`,
          name: `Item ${i + 1}`,
          value: Math.floor(Math.random() * 1000),
          date: new Date().toISOString()
        });
      }
      summary = { total: data.length };
    }

    return { data, summary, columns };
  } catch (error) {
    console.error('Fetch report data error:', error);
    return { data: [], summary: {}, columns: [] };
  }
};

// Export "định nghĩa báo cáo" (mock) dưới dạng file để tránh 404 cho frontend
const exportReportDefinition = async (req, res) => {
  try {
    const { id } = req.params;
    const { format = 'pdf' } = req.query;

    const report = reportDefinitions.find((r) => r.id === id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Lấy dữ liệu báo cáo thực tế từ filters
    const reportDataResult = await fetchReportData(report);
    const { data: reportData, summary, columns } = reportDataResult;

    const exportData = {
      ...report,
      exportedAt: new Date().toISOString()
    };

    // Trả về JSON nếu cần
    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="report_${id}.json"`
      );
      return res.send(JSON.stringify(exportData, null, 2));
    }

    // Export Excel (CSV format)
    if (format === 'excel' || format === 'csv') {
      const csvLines = [
        'field,value',
        `id,${report.id}`,
        `name,"${report.name}"`,
        `description,"${(report.description || '').replace(/"/g, '""')}"`,
        `type,${report.type}`,
        `status,${report.status}`,
        `runCount,${report.runCount}`,
        `creator,${report.creator?.name || ''}`,
        `createdAt,${report.createdAt?.toISOString?.() || report.createdAt}`,
        `updatedAt,${report.updatedAt?.toISOString?.() || report.updatedAt}`
      ];

      const buffer = Buffer.from(csvLines.join('\n'), 'utf-8');

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="report_${id}.csv"`
      );

      return res.send(buffer);
    }

    // Export PDF - Tạo PDF thực sự bằng pdfkit với hỗ trợ Unicode
    const doc = new PDFDocument({
      margin: 50,
      size: 'A4',
      autoFirstPage: true
    });
    const buffers = [];

    // Thử register font từ hệ thống Windows (nếu có)
    // Trên Windows, có thể sử dụng font từ C:\Windows\Fonts
    let vietnameseFont = null;
    const fontPaths = [
      'C:/Windows/Fonts/arial.ttf',
      'C:/Windows/Fonts/arialuni.ttf',
      'C:/Windows/Fonts/times.ttf',
      'C:/Windows/Fonts/tahoma.ttf'
    ];

    for (const fontPath of fontPaths) {
      try {
        if (fs.existsSync(fontPath)) {
          vietnameseFont = fontPath;
          doc.registerFont('Vietnamese', fontPath);
          break;
        }
      } catch (e) {
        // Continue to next font
      }
    }

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(buffers);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="report_${id}.pdf"`
      );
      res.send(pdfBuffer);
    });

    // Sử dụng font đã register hoặc không set font (để dùng default hỗ trợ Unicode tốt hơn)
    const fontToUse = vietnameseFont ? 'Vietnamese' : null;

    // Header với đường kẻ
    doc.rect(50, 50, doc.page.width - 100, 60).stroke();
    if (fontToUse) {
      doc.fontSize(24).font(fontToUse).text('BÁO CÁO', { align: 'center', y: 70 });
    } else {
      doc.fontSize(24).text('BÁO CÁO', { align: 'center', y: 70 });
    }
    doc.moveDown();
    doc.fontSize(18).text(report.name || '', { align: 'center' });
    doc.moveDown(3);

    // Thông tin báo cáo trong box
    const startY = doc.y;
    doc.rect(50, startY, doc.page.width - 100, 200).stroke();
    if (fontToUse) {
      doc.fontSize(12).font(fontToUse).text('THÔNG TIN BÁO CÁO', 60, startY + 10);
    } else {
      doc.fontSize(12).text('THÔNG TIN BÁO CÁO', 60, startY + 10);
    }

    let currentY = startY + 35;
    doc.fontSize(11);

    // Giữ nguyên Unicode - font đã được register sẽ hỗ trợ
    const description = report.description || 'Không có mô tả';
    doc.text(`Mô tả: ${description}`, 60, currentY, { width: doc.page.width - 120 });
    currentY += 20;

    doc.text(`Loại báo cáo: ${report.type || 'N/A'}`, 60, currentY);
    currentY += 20;
    doc.text(`Trạng thái: ${report.status || 'N/A'}`, 60, currentY);
    currentY += 20;
    doc.text(`Số lần chạy: ${report.runCount || 0}`, 60, currentY);
    currentY += 20;
    doc.text(`Người tạo: ${report.creator?.name || 'N/A'}`, 60, currentY);
    currentY += 20;

    if (report.createdAt) {
      try {
        const createdDate = new Date(report.createdAt);
        if (!isNaN(createdDate.getTime())) {
          const dateStr = `${createdDate.getDate()}/${createdDate.getMonth() + 1}/${createdDate.getFullYear()}`;
          const timeStr = `${createdDate.getHours()}:${String(createdDate.getMinutes()).padStart(2, '0')}:${String(createdDate.getSeconds()).padStart(2, '0')}`;
          doc.text(`Ngày tạo: ${dateStr} ${timeStr}`, 60, currentY);
          currentY += 20;
        }
      } catch (e) {
        // Ignore date parsing errors
      }
    }

    if (report.updatedAt) {
      try {
        const updatedDate = new Date(report.updatedAt);
        if (!isNaN(updatedDate.getTime())) {
          const dateStr = `${updatedDate.getDate()}/${updatedDate.getMonth() + 1}/${updatedDate.getFullYear()}`;
          const timeStr = `${updatedDate.getHours()}:${String(updatedDate.getMinutes()).padStart(2, '0')}:${String(updatedDate.getSeconds()).padStart(2, '0')}`;
          doc.text(`Ngày cập nhật: ${dateStr} ${timeStr}`, 60, currentY);
          currentY += 20;
        }
      } catch (e) {
        // Ignore date parsing errors
      }
    }

    // Hiển thị dữ liệu báo cáo
    currentY += 30;
    
    // Summary box
    if (summary && Object.keys(summary).length > 0) {
      doc.rect(50, currentY, doc.page.width - 100, 60).stroke();
      if (fontToUse) {
        doc.fontSize(12).font(fontToUse).text('TỔNG HỢP', 60, currentY + 10);
      } else {
        doc.fontSize(12).text('TỔNG HỢP', 60, currentY + 10);
      }

      let summaryY = currentY + 30;
      doc.fontSize(10);
      Object.entries(summary).forEach(([key, value]) => {
        const label = key === 'totalItems' ? 'Tổng số mục' :
          key === 'totalQuantity' ? 'Tổng số lượng' :
            key === 'totalValue' ? 'Tổng giá trị' :
              key === 'totalOrders' ? 'Tổng đơn hàng' :
                key === 'totalRevenue' ? 'Tổng doanh thu' :
                  key === 'averageOrder' ? 'Giá trị trung bình' :
                    key;
        const displayValue = typeof value === 'number' ?
          (value % 1 === 0 ? value.toLocaleString('vi-VN') : value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')) :
          value;
        doc.text(`${label}: ${displayValue}`, 60, summaryY, { width: (doc.page.width - 120) / 2 });
        summaryY += 15;
      });
      currentY += 70;
    }

    // Data table
    if (reportData && reportData.length > 0) {
      currentY += 20;
      if (fontToUse) {
        doc.fontSize(12).font(fontToUse).text('DỮ LIỆU CHI TIẾT', 60, currentY);
      } else {
        doc.fontSize(12).text('DỮ LIỆU CHI TIẾT', 60, currentY);
      }
      currentY += 20;

      // Xác định columns để hiển thị
      const displayColumns = columns && columns.length > 0
        ? columns.filter(col => col.visible !== false).map(col => col.field || col.key)
        : Object.keys(reportData[0] || {});

      // Header row
      const headerY = currentY;
      const colWidth = (doc.page.width - 120) / Math.min(displayColumns.length, 4);
      let colX = 60;

      doc.fontSize(9);
      displayColumns.slice(0, 4).forEach((col) => {
        const label = col === 'product' ? 'Sản phẩm' :
          col === 'sku' ? 'Mã SKU' :
            col === 'warehouse' ? 'Kho' :
              col === 'category' ? 'Danh mục' :
                col === 'quantity' ? 'Số lượng' :
                  col === 'value' ? 'Giá trị' :
                    col === 'customer' ? 'Khách hàng' :
                      col === 'totalAmount' ? 'Tổng tiền' :
                        col === 'code' ? 'Mã' :
                          col === 'createdAt' ? 'Ngày tạo' :
                            col;
        if (fontToUse) {
          doc.font(fontToUse).text(label, colX, headerY, { width: colWidth - 5 });
        } else {
          doc.text(label, colX, headerY, { width: colWidth - 5 });
        }
        colX += colWidth;
      });

      currentY += 15;
      doc.moveTo(60, currentY).lineTo(doc.page.width - 60, currentY).stroke();
      currentY += 10;

      // Data rows
      doc.fontSize(8);
      reportData.slice(0, 30).forEach((row) => {
        if (currentY > doc.page.height - 100) {
          doc.addPage();
          currentY = 50;
        }

        colX = 60;
        displayColumns.slice(0, 4).forEach((col) => {
          let cellValue = row[col];
          if (cellValue === null || cellValue === undefined) cellValue = '';
          if (cellValue instanceof Date) {
            cellValue = `${cellValue.getDate()}/${cellValue.getMonth() + 1}/${cellValue.getFullYear()}`;
          } else if (typeof cellValue === 'number') {
            cellValue = cellValue % 1 === 0 ? cellValue.toString() : cellValue.toFixed(2);
          } else {
            cellValue = String(cellValue);
          }

          if (fontToUse) {
            doc.font(fontToUse).text(cellValue.substring(0, 20), colX, currentY, { width: colWidth - 5 });
          } else {
            doc.text(cellValue.substring(0, 20), colX, currentY, { width: colWidth - 5 });
          }
          colX += colWidth;
        });
        currentY += 15;
      });

      if (reportData.length > 30) {
        currentY += 10;
        doc.fontSize(9).text(`... và ${reportData.length - 30} mục khác`, 60, currentY);
      }
    } else {
      currentY += 20;
      doc.fontSize(10).text('Không có dữ liệu để hiển thị', 60, currentY);
    }

    // Ngày xuất ở góc phải
    const now = new Date();
    const exportDateStr = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;
    const exportTimeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    doc.fontSize(10).text(`Ngày xuất: ${exportDateStr} ${exportTimeStr}`, doc.page.width - 200, doc.page.height - 80, { align: 'right' });

    // Footer
    doc.fontSize(9)
      .text('E-Log Warehouse Management System', 50, doc.page.height - 50, { align: 'center' });

    doc.end();
  } catch (error) {
    console.error('Export report definition error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  // Định nghĩa báo cáo (mock, phục vụ UI)
  getReportsList,
  getReportTemplates,
  getReportTypes,
  getReportById,
  createReport,
  updateReport,
  deleteReportDefinition,
  getReportData,
  runReport,
  addToFavorites,
  removeFromFavorites,
  // Báo cáo thống kê hiện có
  getSalesReport,
  getInventoryReport,
  getInboundReport,
  getOutboundReport,
  getCustomerReport,
  getProductReport,
  getWarehouseReport,
  getSummaryReport,
  getStockMovementReport,
  getComprehensiveReport,
  exportReportDefinition
};