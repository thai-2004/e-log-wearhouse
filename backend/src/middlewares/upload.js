// Upload Middleware
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const config = require('../config');

// Đảm bảo thư mục uploads tồn tại
const uploadDir = path.join(__dirname, '../../', config.upload.uploadPath);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Cấu hình storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Tạo tên file unique: timestamp-random-originalname
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `product-${uniqueSuffix}${ext}`);
  }
});

// Filter để chỉ cho phép hình ảnh
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ cho phép upload file hình ảnh (JPEG, PNG, GIF, WebP)'), false);
  }
};

// Cấu hình multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: config.upload.maxFileSize, // 10MB
    files: 5 // Tối đa 5 file
  }
});

// Middleware cho upload một hình ảnh
const uploadSingleImage = upload.single('image');

// Middleware cho upload nhiều hình ảnh
const uploadMultipleImages = upload.array('images', 5);

module.exports = {
  uploadSingleImage,
  uploadMultipleImages,
  upload
};

