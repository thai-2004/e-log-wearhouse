// Product Controller
const Product = require('../models/Product');
const Category = require('../models/Category');
const Inventory = require('../models/Inventory');
const { validationResult } = require('express-validator');
const { HTTP_STATUS, PRODUCT_STATUS } = require('../config/constants');
const { handleError, createErrorResponse, createSuccessResponse } = require('../utils/errorHandler');
const { checkUniqueField, validatePagination, isValidSKU, isValidBarcode } = require('../utils/validation');

// Tạo sản phẩm mới
const createProduct = async(req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const productData = req.body;

    // Validate SKU format
    if (!isValidSKU(productData.sku)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Invalid SKU format'
      });
    }

    // Validate barcode format if provided
    if (productData.barcode && !isValidBarcode(productData.barcode)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Invalid barcode format'
      });
    }

    // Kiểm tra SKU đã tồn tại
    const existingProduct = await Product.findOne({
      $or: [
        { sku: productData.sku },
        ...(productData.barcode ? [{ barcode: productData.barcode }] : [])
      ]
    });

    if (existingProduct) {
      return res.status(HTTP_STATUS.CONFLICT).json({
        success: false,
        message: 'Product with this SKU or barcode already exists'
      });
    }

    // Kiểm tra category tồn tại
    const category = await Category.findById(productData.categoryId);
    if (!category) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Validate minStock và maxStock
    if (productData.minStock !== undefined && productData.maxStock !== undefined) {
      const minStock = Number(productData.minStock);
      const maxStock = Number(productData.maxStock);

      if (minStock > maxStock && !(minStock === 0 && maxStock === 0)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Tồn kho tối thiểu không được lớn hơn tồn kho tối đa'
        });
      }
    }

    const product = new Product(productData);
    await product.save();

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Product created successfully',
      data: { product }
    });
  } catch (error) {
    const errorResponse = createErrorResponse(error);
    res.status(errorResponse.status).json(errorResponse.data);
  }
};

// Lấy danh sách sản phẩm
const getProducts = async(req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const categoryId = req.query.categoryId;
    const isActive = req.query.isActive;

    const query = {};

    // Tìm kiếm theo text
    if (search) {
      query.$text = { $search: search };
    }

    // Lọc theo category
    if (categoryId) {
      query.categoryId = categoryId;
    }

    // Lọc theo trạng thái
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const products = await Product.find(query)
      .populate('categoryId', 'name')
      .sort(search ? { score: { $meta: 'textScore' } } : { createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Product.countDocuments(query);

    // Lấy thông tin tồn kho từ Inventory cho mỗi sản phẩm
    const productIds = products.map(p => p._id);
    const inventories = await Inventory.find({ productId: { $in: productIds } });
    
    // Tính tổng tồn kho cho mỗi sản phẩm (tổng từ tất cả các kho)
    const stockMap = {};
    inventories.forEach(inv => {
      const productId = inv.productId.toString();
      if (!stockMap[productId]) {
        stockMap[productId] = 0;
      }
      stockMap[productId] += (inv.quantity || 0);
    });

    // Thêm field stock vào mỗi product
    const productsWithStock = products.map(product => ({
      ...product,
      stock: stockMap[product._id.toString()] || 0
    }));

    res.json({
      success: true,
      data: {
        products: productsWithStock,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Lấy sản phẩm theo ID
const getProductById = async(req, res) => {
  try {
    const { id: productId } = req.params;

    const product = await Product.findById(productId)
      .populate('categoryId', 'name description')
      .lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Lấy thông tin tồn kho từ Inventory
    const inventories = await Inventory.find({ productId });
    const totalStock = inventories.reduce((sum, inv) => sum + (inv.quantity || 0), 0);

    // Thêm field stock vào product
    const productWithStock = {
      ...product,
      stock: totalStock
    };

    res.json({
      success: true,
      data: { product: productWithStock }
    });
  } catch (error) {
    console.error('Get product by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Cập nhật tồn kho tối thiểu và tối đa
const updateProductStockLimits = async(req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { id: productId } = req.params;
    const { minStock, maxStock } = req.body;

    // Kiểm tra sản phẩm tồn tại
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Lấy giá trị hiện tại nếu không được cung cấp
    const newMinStock = minStock !== undefined ? Number(minStock) : product.minStock;
    const newMaxStock = maxStock !== undefined ? Number(maxStock) : product.maxStock;

    // Validate: minStock và maxStock phải >= 0
    if (newMinStock < 0 || newMaxStock < 0) {
      return res.status(400).json({
        success: false,
        message: 'Tồn kho tối thiểu và tối đa phải lớn hơn hoặc bằng 0'
      });
    }

    // Validate: minStock không được lớn hơn maxStock (trừ khi cả hai đều là 0)
    if (newMinStock > newMaxStock && !(newMinStock === 0 && newMaxStock === 0)) {
      return res.status(400).json({
        success: false,
        message: 'Tồn kho tối thiểu không được lớn hơn tồn kho tối đa'
      });
    }

    // Cập nhật chỉ minStock và maxStock
    const updateData = {};
    if (minStock !== undefined) {
      updateData.minStock = newMinStock;
    }
    if (maxStock !== undefined) {
      updateData.maxStock = newMaxStock;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      updateData,
      { new: true, runValidators: true }
    ).populate('categoryId', 'name');

    res.json({
      success: true,
      message: 'Cập nhật tồn kho tối thiểu và tối đa thành công',
      data: {
        product: updatedProduct,
        stockLimits: {
          minStock: updatedProduct.minStock,
          maxStock: updatedProduct.maxStock
        }
      }
    });
  } catch (error) {
    console.error('Update product stock limits error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Cập nhật sản phẩm
const updateProduct = async(req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { id: productId } = req.params;
    const updateData = req.body;

    // Kiểm tra SKU/barcode trùng lặp (trừ sản phẩm hiện tại)
    if (updateData.sku || updateData.barcode) {
      const existingProduct = await Product.findOne({
        _id: { $ne: productId },
        $or: [
          ...(updateData.sku ? [{ sku: updateData.sku }] : []),
          ...(updateData.barcode ? [{ barcode: updateData.barcode }] : [])
        ]
      });

      if (existingProduct) {
        return res.status(400).json({
          success: false,
          message: 'Product with this SKU or barcode already exists'
        });
      }
    }

    // Kiểm tra category nếu có thay đổi
    if (updateData.categoryId) {
      const category = await Category.findById(updateData.categoryId);
      if (!category) {
        return res.status(400).json({
          success: false,
          message: 'Category not found'
        });
      }
    }

    // Validate minStock và maxStock
    // Lấy product hiện tại để so sánh nếu chỉ update một trong hai giá trị
    const currentProduct = await Product.findById(productId);
    if (!currentProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const minStock = updateData.minStock !== undefined
      ? Number(updateData.minStock)
      : currentProduct.minStock;
    const maxStock = updateData.maxStock !== undefined
      ? Number(updateData.maxStock)
      : currentProduct.maxStock;

    if (minStock > maxStock && !(minStock === 0 && maxStock === 0)) {
      return res.status(400).json({
        success: false,
        message: 'Tồn kho tối thiểu không được lớn hơn tồn kho tối đa'
      });
    }

    const product = await Product.findByIdAndUpdate(
      productId,
      updateData,
      { new: true, runValidators: true }
    ).populate('categoryId', 'name');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: { product }
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Xóa sản phẩm
const deleteProduct = async(req, res) => {
  try {
    const { id } = req.params;

    // Kiểm tra sản phẩm có trong inventory không
    const inventoryCount = await Inventory.countDocuments({ productId: id });
    if (inventoryCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete product with existing inventory. Please deactivate instead.'
      });
    }

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Tìm kiếm sản phẩm nâng cao
const searchProducts = async(req, res) => {
  try {
    const {
      search,
      categoryId,
      minPrice,
      maxPrice,
      minStock,
      maxStock,
      isActive,
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;

    const query = {};

    // Tìm kiếm text
    if (search) {
      query.$text = { $search: search };
    }

    // Lọc theo category
    if (categoryId) {
      query.categoryId = categoryId;
    }

    // Lọc theo giá
    if (minPrice || maxPrice) {
      query.sellingPrice = {};
      if (minPrice) query.sellingPrice.$gte = parseFloat(minPrice);
      if (maxPrice) query.sellingPrice.$lte = parseFloat(maxPrice);
    }

    // Lọc theo trạng thái
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    // Sắp xếp
    const sortOptions = {};
    if (search) {
      sortOptions.score = { $meta: 'textScore' };
    } else {
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    }

    const products = await Product.find(query)
      .populate('categoryId', 'name')
      .sort(sortOptions)
      .limit(50);

    // Lọc theo stock nếu có
    let filteredProducts = products;
    if (minStock !== undefined || maxStock !== undefined) {
      const productIds = products.map(p => p._id);
      const inventoryQuery = { productId: { $in: productIds } };

      if (minStock !== undefined) inventoryQuery.quantity = { $gte: parseInt(minStock) };
      if (maxStock !== undefined) {
        inventoryQuery.quantity = { ...inventoryQuery.quantity, $lte: parseInt(maxStock) };
      }

      const inventories = await Inventory.find(inventoryQuery);
      const validProductIds = inventories.map(inv => inv.productId);
      filteredProducts = products.filter(p => validProductIds.includes(p._id));
    }

    res.json({
      success: true,
      data: {
        products: filteredProducts,
        total: filteredProducts.length
      }
    });
  } catch (error) {
    console.error('Search products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Lấy sản phẩm theo barcode
const getProductByBarcode = async(req, res) => {
  try {
    const { barcode } = req.params;

    const product = await Product.findOne({ barcode })
      .populate('categoryId', 'name');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: { product }
    });
  } catch (error) {
    console.error('Get product by barcode error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Cập nhật giá sản phẩm
const updateProductPrice = async(req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { productId } = req.params;
    const { costPrice, sellingPrice } = req.body;

    const product = await Product.findByIdAndUpdate(
      productId,
      { costPrice, sellingPrice },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product price updated successfully',
      data: { product }
    });
  } catch (error) {
    console.error('Update product price error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Lấy sản phẩm sắp hết hàng
const getLowStockProducts = async(req, res) => {
  try {
    const products = await Product.find({
      isActive: true,
      $expr: {
        $lte: [
          { $ifNull: ['$reorderPoint', 0] },
          { $ifNull: ['$minStock', 0] }
        ]
      }
    }).populate('categoryId', 'name');

    // Lấy thông tin inventory thực tế
    const productIds = products.map(p => p._id);
    const inventories = await Inventory.find({ productId: { $in: productIds } });

    const lowStockProducts = products.map(product => {
      const inventory = inventories.find(inv => inv.productId.equals(product._id));
      const currentStock = inventory ? inventory.quantity : 0;

      return {
        ...product.toObject(),
        currentStock,
        isLowStock: currentStock <= product.reorderPoint
      };
    }).filter(p => p.isLowStock);

    res.json({
      success: true,
      data: {
        products: lowStockProducts,
        total: lowStockProducts.length
      }
    });
  } catch (error) {
    console.error('Get low stock products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Lấy sản phẩm theo SKU
const getProductBySKU = async(req, res) => {
  try {
    const { sku } = req.params;

    const product = await Product.findOne({ sku })
      .populate('categoryId', 'name')
      .populate('supplierId', 'name');

    if (!product) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: { product }
    });
  } catch (error) {
    console.error('Get product by SKU error:', error);
    res.status(HTTP_STATUS.SERVER_ERROR).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Lấy sản phẩm theo category
const getProductsByCategory = async(req, res) => {
  try {
    const { categoryId } = req.params;
    const { page = 1, limit = 10, status = 'active' } = req.query;

    const skip = (page - 1) * limit;
    const query = { categoryId, isActive: true };
    
    if (status && status !== 'all') {
      query.status = status;
    }

    const products = await Product.find(query)
      .populate('categoryId', 'name')
      .populate('supplierId', 'name')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get products by category error:', error);
    res.status(HTTP_STATUS.SERVER_ERROR).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Export products to Excel
const exportProducts = async(req, res) => {
  try {
    const search = req.query.search || '';
    const categoryId = req.query.categoryId;
    const isActive = req.query.isActive;
    const priceRange = req.query.priceRange || {};
    const stockRange = req.query.stockRange || {};

    const query = {};

    // Tìm kiếm theo text
    if (search) {
      query.$text = { $search: search };
    }

    // Lọc theo category
    if (categoryId) {
      query.categoryId = categoryId;
    }

    // Lọc theo trạng thái
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    // Lọc theo giá
    if (priceRange.min || priceRange.max) {
      query.price = {};
      if (priceRange.min) query.price.$gte = parseFloat(priceRange.min);
      if (priceRange.max) query.price.$lte = parseFloat(priceRange.max);
    }

    // Lấy tất cả sản phẩm phù hợp (không phân trang)
    const products = await Product.find(query)
      .populate('categoryId', 'name')
      .sort({ createdAt: -1 });

    // Lấy thông tin inventory cho mỗi sản phẩm
    const productIds = products.map(p => p._id);
    const inventories = await Inventory.find({ productId: { $in: productIds } });
    const inventoryMap = {};
    inventories.forEach(inv => {
      inventoryMap[inv.productId.toString()] = inv.quantity;
    });

    // Lọc theo stock nếu có
    let filteredProducts = products;
    if (stockRange.min !== undefined || stockRange.max !== undefined) {
      filteredProducts = products.filter(product => {
        const stock = inventoryMap[product._id.toString()] || 0;
        if (stockRange.min !== undefined && stock < parseFloat(stockRange.min)) return false;
        if (stockRange.max !== undefined && stock > parseFloat(stockRange.max)) return false;
        return true;
      });
    }

    // Tạo Excel file
    const ExcelJS = require('exceljs');
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Products');

    // Định nghĩa columns
    worksheet.columns = [
      { header: 'STT', key: 'index', width: 8 },
      { header: 'SKU', key: 'sku', width: 15 },
      { header: 'Tên sản phẩm', key: 'name', width: 30 },
      { header: 'Danh mục', key: 'category', width: 20 },
      { header: 'Mã vạch', key: 'barcode', width: 15 },
      { header: 'Giá', key: 'price', width: 15 },
      { header: 'Tồn kho', key: 'stock', width: 12 },
      { header: 'Mô tả', key: 'description', width: 40 },
      { header: 'Trạng thái', key: 'status', width: 12 }
    ];

    // Style header
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    // Thêm dữ liệu
    filteredProducts.forEach((product, index) => {
      const stock = inventoryMap[product._id.toString()] || 0;
      worksheet.addRow({
        index: index + 1,
        sku: product.sku || '',
        name: product.name || '',
        category: product.categoryId?.name || '',
        barcode: product.barcode || '',
        price: product.price || 0,
        stock: stock,
        description: product.description || '',
        status: product.isActive ? 'Hoạt động' : 'Ngừng hoạt động'
      });
    });

    // Format số tiền
    worksheet.getColumn('price').numFmt = '#,##0';
    worksheet.getColumn('stock').numFmt = '#,##0';

    // Set response headers
    const filename = `products_export_${new Date().toISOString().split('T')[0]}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Write to response
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Export products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while exporting products'
    });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  updateProductStockLimits,
  deleteProduct,
  searchProducts,
  getProductBySKU,
  getProductByBarcode,
  getProductsByCategory,
  updateProductPrice,
  getLowStockProducts,
  exportProducts
};