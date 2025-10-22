# E-Log Backend Routes - Hoàn Thiện API

## 📋 **Tổng Quan**

Hệ thống routes đã được hoàn thiện với:

- ✅ Authentication & Authorization middleware
- ✅ Comprehensive validation
- ✅ RESTful API design
- ✅ Error handling chuẩn hóa
- ✅ Role-based access control

## 🚀 **Routes Structure**

```
/api
├── /auth          - Authentication endpoints
├── /products      - Product management
├── /categories    - Category management
├── /customers     - Customer management
├── /dashboard     - Dashboard & analytics
├── /inventory     - Inventory management
├── /inbound       - Inbound operations
├── /outbound      - Outbound operations
├── /reports       - Reporting & analytics
└── /health        - Health check
```

## 🔐 **Authentication Routes** (`/auth`)

### **Public Endpoints:**

- `POST /auth/register` - Đăng ký user mới
- `POST /auth/login` - Đăng nhập
- `POST /auth/refresh` - Refresh token

### **Protected Endpoints:**

- `POST /auth/logout` - Đăng xuất
- `PUT /auth/change-password` - Đổi mật khẩu
- `GET /auth/profile` - Lấy thông tin profile
- `PUT /auth/profile` - Cập nhật profile

### **Validation:**

```javascript
// Register validation
{
  "username": "string (3-20 chars, alphanumeric + underscore)",
  "email": "valid email",
  "password": "min 6 chars, uppercase + lowercase + number",
  "role": "optional (admin|manager|employee)"
}

// Login validation
{
  "email": "valid email",
  "password": "required"
}
```

**Messages tiếng Việt:**

- "Tên đăng nhập phải có từ 3 đến 20 ký tự"
- "Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới"
- "Vui lòng cung cấp email hợp lệ"
- "Mật khẩu phải có ít nhất 6 ký tự"
- "Mật khẩu phải chứa ít nhất một chữ thường, một chữ hoa và một số"

## 📦 **Product Routes** (`/products`)

### **Endpoints:**

- `POST /products` - Tạo sản phẩm mới (Admin/Manager)
- `GET /products` - Lấy danh sách sản phẩm
- `GET /products/:id` - Lấy sản phẩm theo ID
- `PUT /products/:id` - Cập nhật sản phẩm (Admin/Manager)
- `DELETE /products/:id` - Xóa sản phẩm (Admin)
- `GET /products/sku/:sku` - Lấy sản phẩm theo SKU
- `GET /products/barcode/:barcode` - Lấy sản phẩm theo barcode
- `GET /products/category/:categoryId` - Lấy sản phẩm theo category

### **Query Parameters:**

```javascript
GET /products?page=1&limit=20&search=keyword&categoryId=xxx&isActive=true
```

### **Validation:**

```javascript
// Create product
{
  "name": "string (1-100 chars)",
  "sku": "string (uppercase letters, numbers, hyphens)",
  "barcode": "optional (numbers only)",
  "categoryId": "MongoDB ObjectId",
  "description": "optional (max 500 chars)",
  "price": "positive number",
  "cost": "optional positive number",
  "weight": "optional positive number",
  "dimensions": "optional object",
  "isActive": "optional boolean"
}
```

## 🏷️ **Category Routes** (`/categories`)

### **Endpoints:**

- `POST /categories` - Tạo category mới (Admin/Manager)
- `GET /categories` - Lấy danh sách categories
- `GET /categories/tree` - Lấy category tree
- `GET /categories/:id` - Lấy category theo ID
- `PUT /categories/:id` - Cập nhật category (Admin/Manager)
- `DELETE /categories/:id` - Xóa category (Admin)
- `GET /categories/:id/report` - Báo cáo category
- `GET /categories/parent/:parentId` - Lấy categories theo parent

### **Validation:**

```javascript
// Create category
{
  "name": "string (1-50 chars)",
  "description": "optional (max 200 chars)",
  "parentId": "optional MongoDB ObjectId",
  "isActive": "optional boolean"
}
```

## 👥 **Customer Routes** (`/customers`)

### **Endpoints:**

- `POST /customers` - Tạo khách hàng mới (Admin/Manager)
- `GET /customers` - Lấy danh sách khách hàng
- `GET /customers/:id` - Lấy khách hàng theo ID
- `PUT /customers/:id` - Cập nhật khách hàng (Admin/Manager)
- `DELETE /customers/:id` - Xóa khách hàng (Admin)
- `GET /customers/email/:email` - Lấy khách hàng theo email
- `GET /customers/type/:customerType` - Lấy khách hàng theo loại

### **Validation:**

```javascript
// Create customer
{
  "name": "string (1-100 chars)",
  "email": "valid email",
  "phone": "optional mobile phone",
  "address": "optional object",
  "customerType": "individual|business",
  "taxId": "optional (10-15 chars)",
  "isActive": "optional boolean"
}
```

## 📊 **Dashboard Routes** (`/dashboard`)

### **Endpoints:**

- `GET /dashboard` - Tổng quan dashboard
- `GET /dashboard/stats` - Thống kê dashboard
- `GET /dashboard/alerts` - Cảnh báo
- `GET /dashboard/top-products` - Sản phẩm bán chạy
- `GET /dashboard/recent-activities` - Hoạt động gần đây

### **Query Parameters:**

```javascript
GET /dashboard?timeRange=month&startDate=2024-01-01&endDate=2024-01-31&warehouseId=xxx
```

## 📦 **Inventory Routes** (`/inventory`)

### **Endpoints:**

- `POST /inventory` - Tạo inventory mới (Admin/Manager)
- `GET /inventory` - Lấy danh sách inventory
- `GET /inventory/:id` - Lấy inventory theo ID
- `PUT /inventory/:id` - Cập nhật inventory (Admin/Manager)
- `DELETE /inventory/:id` - Xóa inventory (Admin)
- `GET /inventory/product/:productId` - Lấy inventory theo sản phẩm
- `GET /inventory/warehouse/:warehouseId` - Lấy inventory theo kho
- `GET /inventory/low-stock` - Lấy sản phẩm sắp hết hàng
- `POST /inventory/adjust` - Điều chỉnh inventory (Admin/Manager)

### **Validation:**

```javascript
// Create inventory
{
  "productId": "MongoDB ObjectId",
  "warehouseId": "MongoDB ObjectId",
  "quantity": "non-negative integer",
  "reservedQuantity": "optional non-negative integer",
  "minStockLevel": "optional non-negative integer",
  "maxStockLevel": "optional non-negative integer"
}
```

## 📥 **Inbound Routes** (`/inbound`)

### **Endpoints:**

- `POST /inbound` - Tạo inbound mới (Admin/Manager)
- `GET /inbound` - Lấy danh sách inbound
- `GET /inbound/:id` - Lấy inbound theo ID
- `PUT /inbound/:id` - Cập nhật inbound (Admin/Manager)
- `DELETE /inbound/:id` - Xóa inbound (Admin)
- `POST /inbound/:id/receive` - Nhận hàng (Admin/Manager)
- `POST /inbound/:id/cancel` - Hủy inbound (Admin/Manager)
- `GET /inbound/supplier/:supplierId` - Lấy inbound theo nhà cung cấp
- `GET /inbound/warehouse/:warehouseId` - Lấy inbound theo kho

### **Validation:**

```javascript
// Create inbound
{
  "supplierId": "MongoDB ObjectId",
  "warehouseId": "MongoDB ObjectId",
  "expectedDate": "ISO 8601 date",
  "items": [
    {
      "productId": "MongoDB ObjectId",
      "quantity": "positive integer",
      "unitCost": "optional positive number"
    }
  ],
  "notes": "optional (max 500 chars)"
}
```

## 📤 **Outbound Routes** (`/outbound`)

### **Endpoints:**

- `POST /outbound` - Tạo outbound mới (Admin/Manager)
- `GET /outbound` - Lấy danh sách outbound
- `GET /outbound/:id` - Lấy outbound theo ID
- `PUT /outbound/:id` - Cập nhật outbound (Admin/Manager)
- `DELETE /outbound/:id` - Xóa outbound (Admin)
- `POST /outbound/:id/ship` - Giao hàng (Admin/Manager)
- `POST /outbound/:id/deliver` - Xác nhận giao hàng (Admin/Manager)
- `POST /outbound/:id/cancel` - Hủy outbound (Admin/Manager)
- `GET /outbound/customer/:customerId` - Lấy outbound theo khách hàng
- `GET /outbound/warehouse/:warehouseId` - Lấy outbound theo kho

### **Validation:**

```javascript
// Create outbound
{
  "customerId": "MongoDB ObjectId",
  "warehouseId": "MongoDB ObjectId",
  "expectedDate": "ISO 8601 date",
  "items": [
    {
      "productId": "MongoDB ObjectId",
      "quantity": "positive integer",
      "unitPrice": "optional positive number"
    }
  ],
  "shippingAddress": "object",
  "notes": "optional (max 500 chars)"
}
```

## 📈 **Report Routes** (`/reports`)

### **Endpoints:**

- `GET /reports/sales` - Báo cáo bán hàng (Admin/Manager)
- `GET /reports/inventory` - Báo cáo tồn kho (Admin/Manager)
- `GET /reports/inbound` - Báo cáo nhập kho (Admin/Manager)
- `GET /reports/outbound` - Báo cáo xuất kho (Admin/Manager)
- `GET /reports/customer` - Báo cáo khách hàng (Admin/Manager)
- `GET /reports/product` - Báo cáo sản phẩm (Admin/Manager)
- `GET /reports/warehouse` - Báo cáo kho (Admin/Manager)
- `GET /reports/summary` - Báo cáo tổng hợp (Admin/Manager)

### **Query Parameters:**

```javascript
GET /reports/sales?startDate=2024-01-01&endDate=2024-01-31&warehouseId=xxx&format=json
```

## 🛡️ **Authentication & Authorization**

### **Middleware:**

- `authenticateToken` - Xác thực JWT token
- `authorize(...roles)` - Phân quyền theo role
- `authorizeOwnerOrAdmin` - Kiểm tra quyền sở hữu hoặc admin
- `optionalAuth` - Xác thực không bắt buộc

### **Roles:**

- `admin` - Toàn quyền
- `manager` - Quản lý (không thể xóa)
- `employee` - Nhân viên (chỉ xem)

### **Usage:**

```javascript
// Protected route
router.get("/protected", authenticateToken, controller.method);

// Role-based access
router.post(
  "/admin-only",
  authenticateToken,
  authorize("admin"),
  controller.method
);

// Multiple roles
router.put(
  "/manage",
  authenticateToken,
  authorize("admin", "manager"),
  controller.method
);
```

## 📝 **Validation**

### **Express Validator:**

- `body()` - Validate request body
- `param()` - Validate URL parameters
- `query()` - Validate query parameters

### **Common Validations:**

- `isMongoId()` - MongoDB ObjectId
- `isEmail()` - Email format
- `isMobilePhone()` - Phone number
- `isISO8601()` - Date format
- `isInt()` - Integer
- `isFloat()` - Float number
- `isBoolean()` - Boolean
- `isArray()` - Array
- `isObject()` - Object
- `isLength()` - String length
- `matches()` - Regex pattern
- `isIn()` - Enum values

## 🔧 **Error Handling**

### **Validation Errors:**

```javascript
{
  "success": false,
  "message": "Validation errors",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email"
    }
  ]
}
```

### **Authentication Errors:**

```javascript
{
  "success": false,
  "message": "Access token required"
}
```

### **Authorization Errors:**

```javascript
{
  "success": false,
  "message": "Insufficient permissions"
}
```

## 🚀 **Usage Examples**

### **1. Authentication:**

```javascript
// Register
POST /api/auth/register
{
  "username": "admin",
  "email": "admin@example.com",
  "password": "Admin123",
  "role": "admin"
}

// Login
POST /api/auth/login
{
  "email": "admin@example.com",
  "password": "Admin123"
}
```

### **2. Create Product:**

```javascript
POST / api / products;
Authorization: Bearer <
  token >
  {
    name: "iPhone 15",
    sku: "IPH15-128-BLK",
    barcode: "1234567890123",
    categoryId: "64a1b2c3d4e5f6789012345",
    price: 999.99,
    description: "Latest iPhone model",
  };
```

### **3. Get Products with Filters:**

```javascript
GET /api/products?page=1&limit=20&search=iPhone&categoryId=64a1b2c3d4e5f6789012345&isActive=true
```

### **4. Create Inbound:**

```javascript
POST / api / inbound;
Authorization: Bearer <
  token >
  {
    supplierId: "64a1b2c3d4e5f6789012346",
    warehouseId: "64a1b2c3d4e5f6789012347",
    expectedDate: "2024-01-15T10:00:00Z",
    items: [
      {
        productId: "64a1b2c3d4e5f6789012345",
        quantity: 100,
        unitCost: 800.0,
      },
    ],
    notes: "Bulk order from supplier",
  };
```

## 📋 **Health Check**

### **Endpoint:**

```javascript
GET / api / health;
```

### **Response:**

```javascript
{
  "success": true,
  "message": "E-Log API is running",
  "timestamp": "2024-01-15T10:00:00.000Z",
  "version": "1.0.0"
}
```

## 🎉 **Kết Luận**

Hệ thống routes đã được hoàn thiện với:

- ✅ **11 route modules** hoàn chỉnh
- ✅ **Authentication middleware** mạnh mẽ
- ✅ **Comprehensive validation** cho tất cả endpoints
- ✅ **Role-based access control**
- ✅ **RESTful API design**
- ✅ **Error handling chuẩn hóa**
- ✅ **Documentation đầy đủ**
- ✅ **Messages tiếng Việt** cho tất cả validation

**Tổng cộng: 50+ endpoints** sẵn sàng cho production! 🚀

## 🇻🇳 **Tiếng Việt Hóa**

Tất cả validation messages đã được chuyển đổi sang tiếng Việt để phù hợp với người dùng Việt Nam:

### **Ví dụ Messages:**

- **Auth:** "Tên đăng nhập phải có từ 3 đến 20 ký tự"
- **Products:** "Tên sản phẩm là bắt buộc", "SKU chỉ được chứa chữ hoa, số và dấu gạch ngang"
- **Categories:** "Tên danh mục phải có từ 1 đến 50 ký tự"
- **Customers:** "Tên khách hàng là bắt buộc", "Loại khách hàng phải là cá nhân hoặc doanh nghiệp"
- **Inventory:** "Số lượng phải là số nguyên không âm"
- **Inbound/Outbound:** "Cần ít nhất một sản phẩm", "Ngày dự kiến phải là định dạng ISO 8601 hợp lệ"
- **Reports:** "Định dạng phải là một trong: json, csv, pdf"

### **Lợi ích:**

- ✅ **User-friendly** - Người dùng Việt Nam dễ hiểu
- ✅ **Professional** - Thông báo lỗi chuyên nghiệp
- ✅ **Consistent** - Nhất quán trong toàn bộ hệ thống
- ✅ **Maintainable** - Dễ bảo trì và cập nhật
