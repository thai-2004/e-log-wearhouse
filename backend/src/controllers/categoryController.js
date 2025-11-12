// Category Controller - Business Logic
const Category = require('../models/Category');
const Product = require('../models/Product');
const { validationResult } = require('express-validator');
const { HTTP_STATUS } = require('../config/constants');
const { handleError, createErrorResponse, createSuccessResponse } = require('../utils/errorHandler');
const { checkUniqueField, validatePagination } = require('../utils/validation');

// Tạo category mới
const createCategory = async(req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const categoryData = req.body;

    // Kiểm tra parent category tồn tại (nếu có)
    if (categoryData.parentId) {
      const parentCategory = await Category.findById(categoryData.parentId);
      if (!parentCategory) {
        return res.status(400).json({
          success: false,
          message: 'Parent category not found'
        });
      }
    }

    const category = new Category(categoryData);
    await category.save();

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: { category }
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create category'
    });
  }
};

// Lấy danh sách categories
const getCategories = async(req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const isActive = req.query.isActive;
    const parentId = req.query.parentId;

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    if (parentId !== undefined) {
      if (parentId === 'null' || parentId === '') {
        query.parentId = null;
      } else {
        query.parentId = parentId;
      }
    }

    const categories = await Category.find(query)
      .populate('parentId', 'name code')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Category.countDocuments(query);

    res.json({
      success: true,
      data: {
        categories,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get categories'
    });
  }
};

// Lấy category theo ID
const getCategoryById = async(req, res) => {
  try {
    const categoryId = req.params.id;

    const category = await Category.findById(categoryId)
      .populate('parentId', 'name code');

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      data: { category }
    });
  } catch (error) {
    console.error('Get category by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get category'
    });
  }
};

// Cập nhật category
const updateCategory = async(req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const categoryId = req.params.id;
    const updateData = req.body;

    // Kiểm tra parent category tồn tại (nếu có)
    if (updateData.parentId) {
      const parentCategory = await Category.findById(updateData.parentId);
      if (!parentCategory) {
        return res.status(400).json({
          success: false,
          message: 'Parent category not found'
        });
      }

      // Kiểm tra không được set parent là chính nó
      if (updateData.parentId === categoryId) {
        return res.status(400).json({
          success: false,
          message: 'Category cannot be its own parent'
        });
      }
    }

    const category = await Category.findByIdAndUpdate(
      categoryId,
      updateData,
      { new: true, runValidators: true }
    ).populate('parentId', 'name code');

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: { category }
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update category'
    });
  }
};

// Xóa category
const deleteCategory = async(req, res) => {
  try {
    const categoryId = req.params.id;

    // Kiểm tra category có products không
    const productCount = await Product.countDocuments({ categoryId });
    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete category with existing products. Please deactivate instead.'
      });
    }

    // Kiểm tra category có subcategories không
    const subcategoryCount = await Category.countDocuments({ parentId: categoryId });
    if (subcategoryCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete category with subcategories. Please delete subcategories first.'
      });
    }

    const category = await Category.findByIdAndDelete(categoryId);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete category'
    });
  }
};

// Lấy category tree (hierarchical structure)
const getCategoryTree = async(req, res) => {
  try {
    const [categories, productCounts] = await Promise.all([
      Category.find({ isActive: true })
      .populate('parentId', 'name code')
      .sort({ name: 1 }),
      Product.aggregate([
        {
          $group: {
            _id: '$categoryId',
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    const productCountMap = productCounts.reduce((acc, item) => {
      if (item?._id) {
        acc.set(item._id.toString(), item.count || 0);
      }
      return acc;
    }, new Map());

    // Xây dựng category tree
    const buildTree = (parentId = null) => {
      return categories
        .filter(cat => {
          if (parentId === null) return !cat.parentId;
          return cat.parentId && cat.parentId._id.toString() === parentId.toString();
        })
        .map(cat => ({
          ...cat.toObject(),
          productCount: productCountMap.get(cat._id.toString()) || 0,
          children: buildTree(cat._id)
        }));
    };

    const categoryTree = buildTree();

    res.json({
      success: true,
      data: {
        categories: categoryTree,
        total: categories.length
      }
    });
  } catch (error) {
    console.error('Get category tree error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get category tree'
    });
  }
};

// Lấy báo cáo category
const getCategoryReport = async(req, res) => {
  try {
    const categoryId = req.params.id;
    const { startDate, endDate } = req.query;

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Lấy tất cả products trong category (bao gồm subcategories)
    const getAllCategoryProducts = async(catId) => {
      const directProducts = await Product.find({ categoryId: catId }).select('_id');
      const subcategories = await Category.find({ parentId: catId }).select('_id');

      let allProducts = [...directProducts];

      for (const subcat of subcategories) {
        const subProducts = await getAllCategoryProducts(subcat._id);
        allProducts = [...allProducts, ...subProducts];
      }

      return allProducts;
    };

    const allProducts = await getAllCategoryProducts(categoryId);
    const productIds = allProducts.map(p => p._id);

    // Thống kê products
    const productStats = await Product.aggregate([
      { $match: { _id: { $in: productIds } } },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          activeProducts: {
            $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
          },
          inactiveProducts: {
            $sum: { $cond: [{ $eq: ['$isActive', false] }, 1, 0] }
          }
        }
      }
    ]);

    // Thống kê inventory
    const inventoryStats = await Product.aggregate([
      { $match: { _id: { $in: productIds } } },
      {
        $lookup: {
          from: 'inventories',
          localField: '_id',
          foreignField: 'productId',
          as: 'inventories'
        }
      },
      { $unwind: '$inventories' },
      {
        $group: {
          _id: null,
          totalQuantity: { $sum: '$inventories.quantity' },
          totalValue: { $sum: { $multiply: ['$inventories.quantity', '$inventories.unitPrice'] } }
        }
      }
    ]);

    // Thống kê theo subcategories
    const subcategoryStats = await Category.aggregate([
      { $match: { parentId: categoryId } },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: 'categoryId',
          as: 'products'
        }
      },
      {
        $project: {
          name: 1,
          code: 1,
          productCount: { $size: '$products' },
          activeProductCount: {
            $size: {
              $filter: {
                input: '$products',
                cond: { $eq: ['$$this.isActive', true] }
              }
            }
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        category,
        summary: {
          productStats: productStats[0] || { totalProducts: 0, activeProducts: 0, inactiveProducts: 0 },
          inventoryStats: inventoryStats[0] || { totalQuantity: 0, totalValue: 0 }
        },
        subcategoryStats
      }
    });
  } catch (error) {
    console.error('Get category report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get category report'
    });
  }
};

// Lấy categories theo parent
const getCategoriesByParent = async(req, res) => {
  try {
    const { parentId } = req.params;
    const { page = 1, limit = 10, status = 'active' } = req.query;

    const skip = (page - 1) * limit;
    const query = { parentId, isActive: true };
    
    if (status && status !== 'all') {
      query.status = status;
    }

    const categories = await Category.find(query)
      .populate('parentId', 'name')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Category.countDocuments(query);

    res.json({
      success: true,
      data: {
        categories,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get categories by parent error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Di chuyển category (thay đổi parent)
const moveCategory = async(req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const categoryId = req.params.id;
    const { newParentId } = req.body;

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Kiểm tra không được move vào chính nó hoặc con của nó
    if (newParentId) {
      if (newParentId === categoryId) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Category cannot be moved to itself'
        });
      }

      // Kiểm tra không được move vào con của nó
      const isDescendant = await checkIfDescendant(categoryId, newParentId);
      if (isDescendant) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Category cannot be moved to its descendant'
        });
      }

      // Kiểm tra parent category tồn tại
      const parentCategory = await Category.findById(newParentId);
      if (!parentCategory) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: 'Parent category not found'
        });
      }
    }

    category.parentId = newParentId || null;
    await category.save();

    res.json({
      success: true,
      message: 'Category moved successfully',
      data: { category }
    });
  } catch (error) {
    const errorResponse = createErrorResponse(error);
    res.status(errorResponse.status).json(errorResponse.data);
  }
};

// Helper function để kiểm tra descendant
const checkIfDescendant = async(categoryId, potentialParentId) => {
  const children = await Category.find({ parentId: categoryId });
  
  for (const child of children) {
    if (child._id.toString() === potentialParentId) {
      return true;
    }
    const isDescendant = await checkIfDescendant(child._id, potentialParentId);
    if (isDescendant) return true;
  }
  
  return false;
};

// Bulk update categories
const bulkUpdateCategories = async(req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { categoryIds, updateData } = req.body;

    if (!categoryIds || !Array.isArray(categoryIds) || categoryIds.length === 0) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Category IDs array is required'
      });
    }

    const result = await Category.updateMany(
      { _id: { $in: categoryIds } },
      updateData,
      { runValidators: true }
    );

    res.json({
      success: true,
      message: `Updated ${result.modifiedCount} categories`,
      data: {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount
      }
    });
  } catch (error) {
    const errorResponse = createErrorResponse(error);
    res.status(errorResponse.status).json(errorResponse.data);
  }
};

// Lấy category statistics
const getCategoryStatistics = async(req, res) => {
  try {
    const stats = await Category.aggregate([
      {
        $group: {
          _id: null,
          totalCategories: { $sum: 1 },
          activeCategories: {
            $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
          },
          inactiveCategories: {
            $sum: { $cond: [{ $eq: ['$isActive', false] }, 1, 0] }
          },
          rootCategories: {
            $sum: { $cond: [{ $eq: ['$parentId', null] }, 1, 0] }
          },
          subCategories: {
            $sum: { $cond: [{ $ne: ['$parentId', null] }, 1, 0] }
          }
        }
      }
    ]);

    // Thống kê theo level
    const levelStats = await Category.aggregate([
      {
        $lookup: {
          from: 'categories',
          localField: 'parentId',
          foreignField: '_id',
          as: 'parent'
        }
      },
      {
        $addFields: {
          level: {
            $cond: [
              { $eq: ['$parentId', null] },
              1,
              {
                $add: [
                  { $size: '$parent' },
                  1
                ]
              }
            ]
          }
        }
      },
      {
        $group: {
          _id: '$level',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Top categories by product count
    const topCategoriesByProducts = await Category.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: 'categoryId',
          as: 'products'
        }
      },
      {
        $project: {
          name: 1,
          productCount: { $size: '$products' },
          activeProductCount: {
            $size: {
              $filter: {
                input: '$products',
                cond: { $eq: ['$$this.isActive', true] }
              }
            }
          }
        }
      },
      { $sort: { productCount: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: {
        summary: stats[0] || {
          totalCategories: 0,
          activeCategories: 0,
          inactiveCategories: 0,
          rootCategories: 0,
          subCategories: 0
        },
        levelStats,
        topCategoriesByProducts
      }
    });
  } catch (error) {
    const errorResponse = createErrorResponse(error);
    res.status(errorResponse.status).json(errorResponse.data);
  }
};

// Tìm kiếm categories nâng cao
const searchCategories = async(req, res) => {
  try {
    const { 
      query: searchQuery, 
      parentId, 
      isActive, 
      hasProducts,
      minProductCount,
      maxProductCount,
      page = 1, 
      limit = 10 
    } = req.query;

    const { page: validatedPage, limit: validatedLimit } = validatePagination(page, limit);
    const skip = (validatedPage - 1) * validatedLimit;

    const matchQuery = {};

    // Tìm kiếm text
    if (searchQuery) {
      matchQuery.$or = [
        { name: { $regex: searchQuery, $options: 'i' } },
        { description: { $regex: searchQuery, $options: 'i' } }
      ];
    }

    // Lọc theo parent
    if (parentId !== undefined) {
      if (parentId === 'null' || parentId === '') {
        matchQuery.parentId = null;
      } else {
        matchQuery.parentId = parentId;
      }
    }

    // Lọc theo trạng thái
    if (isActive !== undefined) {
      matchQuery.isActive = isActive === 'true';
    }

    // Lọc theo số lượng products
    if (hasProducts === 'true' || minProductCount || maxProductCount) {
      const productMatch = {};
      if (minProductCount) productMatch.$gte = parseInt(minProductCount);
      if (maxProductCount) productMatch.$lte = parseInt(maxProductCount);
      
      matchQuery.productCount = productMatch;
    }

    const pipeline = [
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: 'categoryId',
          as: 'products'
        }
      },
      {
        $addFields: {
          productCount: { $size: '$products' },
          activeProductCount: {
            $size: {
              $filter: {
                input: '$products',
                cond: { $eq: ['$$this.isActive', true] }
              }
            }
          }
        }
      },
      { $match: matchQuery },
      {
        $lookup: {
          from: 'categories',
          localField: 'parentId',
          foreignField: '_id',
          as: 'parent'
        }
      },
      {
        $addFields: {
          parent: { $arrayElemAt: ['$parent', 0] }
        }
      },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: validatedLimit }
    ];

    const categories = await Category.aggregate(pipeline);

    // Count total
    const countPipeline = [
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: 'categoryId',
          as: 'products'
        }
      },
      {
        $addFields: {
          productCount: { $size: '$products' }
        }
      },
      { $match: matchQuery },
      { $count: 'total' }
    ];

    const countResult = await Category.aggregate(countPipeline);
    const total = countResult[0]?.total || 0;

    res.json({
      success: true,
      data: {
        categories,
        pagination: {
          page: validatedPage,
          limit: validatedLimit,
          total,
          pages: Math.ceil(total / validatedLimit)
        }
      }
    });
  } catch (error) {
    const errorResponse = createErrorResponse(error);
    res.status(errorResponse.status).json(errorResponse.data);
  }
};

// Export categories
const exportCategories = async(req, res) => {
  try {
    const { format = 'json' } = req.query;

    const categories = await Category.find({ isActive: true })
      .populate('parentId', 'name')
      .sort({ name: 1 });

    if (format === 'csv') {
      // Convert to CSV format
      const csvData = categories.map(cat => ({
        name: cat.name,
        description: cat.description || '',
        parent: cat.parentId?.name || '',
        createdAt: cat.createdAt.toISOString()
      }));

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=categories.csv');
      
      // Simple CSV conversion
      const csv = 'Name,Description,Parent,Created At\n' +
        csvData.map(row => 
          `"${row.name}","${row.description}","${row.parent}","${row.createdAt}"`
        ).join('\n');
      
      res.send(csv);
    } else {
      res.json({
        success: true,
        data: { categories }
      });
    }
  } catch (error) {
    const errorResponse = createErrorResponse(error);
    res.status(errorResponse.status).json(errorResponse.data);
  }
};

module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  getCategoryTree,
  getCategoryReport,
  getCategoriesByParent,
  moveCategory,
  bulkUpdateCategories,
  getCategoryStatistics,
  searchCategories,
  exportCategories
};