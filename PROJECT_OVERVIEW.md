# 📋 Tổng quan dự án E-Logistics Management System

## 🎯 Giới thiệu

**E-Logistics Management System** là một hệ thống quản lý kho bãi và logistics toàn diện, được xây dựng với kiến trúc full-stack hiện đại. Hệ thống cung cấp các tính năng quản lý kho hàng, theo dõi tồn kho, quản lý nhập/xuất hàng, và báo cáo thống kê chi tiết.

## 🏗️ Kiến trúc hệ thống

### Cấu trúc dự án

```
e-log_cuoi-ky/
├── backend/          # Backend API Server
│   ├── src/
│   │   ├── config/      # Cấu hình hệ thống
│   │   ├── controllers/ # Business logic
│   │   ├── models/      # Database models
│   │   ├── routes/      # API routes
│   │   ├── middlewares/ # Middleware functions
│   │   ├── services/    # Service layer
│   │   ├── utils/       # Utility functions
│   │   └── validators/  # Input validation
│   └── logs/            # Application logs
│
└── frontend/        # Frontend React Application
    └── src/
        ├── api/         # API client
        ├── components/  # Reusable components
        ├── features/    # Feature modules
        ├── pages/       # Page components
        ├── store/       # State management
        └── utils/       # Utility functions
```

### Kiến trúc Backend

- **Framework**: Node.js + Express.js
- **Database**: MongoDB với Mongoose ODM
- **Authentication**: JWT (Access Token + Refresh Token)
- **Security**: Helmet, CORS, Rate Limiting, Input Sanitization
- **Logging**: Winston với file rotation
- **API Documentation**: Swagger/OpenAPI
- **Validation**: Express Validator + Joi

### Kiến trúc Frontend

- **Framework**: React 18 + Vite
- **State Management**: Zustand
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Form Handling**: React Hook Form
- **UI Components**: Custom components với Tailwind
- **Charts**: Recharts
- **Notifications**: React Hot Toast

## 📦 Các module chính

### 1. Authentication & Authorization (Xác thực & Phân quyền)

**Backend Models:**

- `User.js` - Quản lý người dùng
- `TokenBlacklist.js` - Quản lý token đã logout

**Tính năng:**

- Đăng ký/Đăng nhập với JWT
- Refresh token mechanism
- 3 vai trò: Admin, Manager, Employee
- Phân quyền theo vai trò (RBAC)
- Quản lý profile cá nhân
- Đổi mật khẩu
- Token blacklist cho logout

**API Endpoints:**

```
POST   /api/auth/register        # Đăng ký
POST   /api/auth/login           # Đăng nhập
POST   /api/auth/logout          # Đăng xuất
POST   /api/auth/refresh         # Refresh token
GET    /api/auth/profile         # Lấy thông tin profile
PUT    /api/auth/profile         # Cập nhật profile
PUT    /api/auth/change-password # Đổi mật khẩu
```

### 2. Product Management (Quản lý sản phẩm)

**Backend Models:**

- `Product.js` - Thông tin sản phẩm
- `Category.js` - Phân loại sản phẩm

**Tính năng:**

- CRUD sản phẩm đầy đủ
- Phân loại sản phẩm theo category (hierarchical)
- Tìm kiếm và lọc sản phẩm
- Quản lý thông tin chi tiết: SKU, tên, mô tả, giá, hình ảnh
- Quản lý tồn kho theo sản phẩm

**API Endpoints:**

```
GET    /api/products             # Danh sách sản phẩm
POST   /api/products             # Tạo sản phẩm
GET    /api/products/:id         # Chi tiết sản phẩm
PUT    /api/products/:id         # Cập nhật sản phẩm
DELETE /api/products/:id         # Xóa sản phẩm
GET    /api/categories            # Danh sách categories
POST   /api/categories            # Tạo category
```

### 3. Inventory Management (Quản lý tồn kho)

**Backend Models:**

- `Inventory.js` - Tồn kho hiện tại
- `StockMovement.js` - Lịch sử di chuyển hàng
- `StockAdjustment.js` - Điều chỉnh tồn kho
- `StockTake.js` - Kiểm kê kho

**Tính năng:**

- Theo dõi tồn kho real-time
- Lịch sử di chuyển hàng hóa
- Điều chỉnh tồn kho (tăng/giảm)
- Kiểm kê kho (Stock Take)
- Cảnh báo tồn kho thấp
- Theo dõi theo warehouse

**API Endpoints:**

```
GET    /api/inventory            # Danh sách tồn kho
GET    /api/inventory/:id        # Chi tiết tồn kho
GET    /api/inventory/movements  # Lịch sử di chuyển
POST   /api/inventory/adjust     # Điều chỉnh tồn kho
POST   /api/inventory/stocktake  # Kiểm kê kho
```

### 4. Warehouse Management (Quản lý kho bãi)

**Backend Models:**

- `Warehouse.js` - Thông tin kho bãi

**Tính năng:**

- Quản lý nhiều kho bãi
- Thông tin chi tiết: địa chỉ, diện tích, công suất
- Phân quyền truy cập theo kho
- Thống kê theo kho

**API Endpoints:**

```
GET    /api/warehouses            # Danh sách kho
POST   /api/warehouses            # Tạo kho mới
GET    /api/warehouses/:id        # Chi tiết kho
PUT    /api/warehouses/:id        # Cập nhật kho
DELETE /api/warehouses/:id        # Xóa kho
```

### 5. Inbound Management (Quản lý nhập kho)

**Backend Models:**

- `Inbound.js` - Phiếu nhập kho
- `Supplier.js` - Nhà cung cấp

**Tính năng:**

- Tạo phiếu nhập kho
- Quản lý nhà cung cấp
- Theo dõi trạng thái nhập kho
- Tự động cập nhật tồn kho khi nhập
- Lịch sử nhập kho

**API Endpoints:**

```
GET    /api/inbound               # Danh sách phiếu nhập
POST   /api/inbound               # Tạo phiếu nhập
GET    /api/inbound/:id           # Chi tiết phiếu nhập
PUT    /api/inbound/:id           # Cập nhật phiếu nhập
GET    /api/suppliers              # Danh sách nhà cung cấp
POST   /api/suppliers              # Tạo nhà cung cấp
```

### 6. Outbound Management (Quản lý xuất kho)

**Backend Models:**

- `Outbound.js` - Phiếu xuất kho
- `Customer.js` - Khách hàng

**Tính năng:**

- Tạo phiếu xuất kho
- Quản lý khách hàng
- Theo dõi trạng thái xuất kho
- Tự động cập nhật tồn kho khi xuất
- Kiểm tra tồn kho trước khi xuất
- Lịch sử xuất kho

**API Endpoints:**

```
GET    /api/outbound              # Danh sách phiếu xuất
POST   /api/outbound              # Tạo phiếu xuất
GET    /api/outbound/:id          # Chi tiết phiếu xuất
PUT    /api/outbound/:id          # Cập nhật phiếu xuất
GET    /api/customers              # Danh sách khách hàng
POST   /api/customers              # Tạo khách hàng
```

### 7. Dashboard & Reports (Bảng điều khiển & Báo cáo)

**Tính năng:**

- Thống kê tổng quan hệ thống
- Biểu đồ trực quan (Recharts)
- Báo cáo xuất nhập kho
- Báo cáo tồn kho
- Báo cáo theo thời gian
- Export báo cáo (Excel)
- Dashboard tùy chỉnh theo vai trò

**API Endpoints:**

```
GET    /api/dashboard/stats       # Thống kê tổng quan
GET    /api/dashboard/charts      # Dữ liệu biểu đồ
GET    /api/reports                # Danh sách báo cáo
POST   /api/reports/generate      # Tạo báo cáo
GET    /api/reports/:id            # Chi tiết báo cáo
```

### 8. User Management (Quản lý người dùng)

**Tính năng:**

- Quản lý danh sách người dùng
- Phân quyền theo vai trò
- Cập nhật thông tin người dùng
- Vô hiệu hóa/kích hoạt tài khoản
- Audit log hoạt động

**API Endpoints:**

```
GET    /api/users                  # Danh sách users
GET    /api/users/:id              # Chi tiết user
PUT    /api/users/:id              # Cập nhật user
DELETE /api/users/:id              # Xóa user
```

### 9. Audit & Logging (Kiểm toán & Ghi log)

**Backend Models:**

- `AuditLog.js` - Nhật ký kiểm toán
- `Notification.js` - Thông báo hệ thống

**Tính năng:**

- Ghi log tất cả hoạt động quan trọng
- Audit trail cho thay đổi dữ liệu
- Hệ thống thông báo real-time
- Logging với Winston (file rotation)
- Phân loại log: info, error, audit

## 🔐 Bảo mật

### Các biện pháp bảo mật đã triển khai:

1. **Authentication & Authorization**

   - JWT với access token (15 phút) và refresh token (7 ngày)
   - Token blacklist cho logout
   - Password hashing với bcrypt (12 rounds)

2. **API Security**

   - Helmet.js cho HTTP headers security
   - CORS configuration
   - Rate limiting (100 requests/15 phút)
   - Input sanitization (express-mongo-sanitize)
   - Input validation (Express Validator + Joi)

3. **Data Protection**
   - MongoDB injection prevention
   - XSS protection
   - CSRF protection
   - Secure session management

## 🛠️ Công nghệ sử dụng

### Backend Stack

| Công nghệ          | Phiên bản | Mục đích            |
| ------------------ | --------- | ------------------- |
| Node.js            | >=16.0.0  | Runtime environment |
| Express.js         | ^4.18.2   | Web framework       |
| MongoDB            | -         | Database            |
| Mongoose           | ^8.0.0    | ODM                 |
| JWT                | ^9.0.2    | Authentication      |
| Bcryptjs           | ^2.4.3    | Password hashing    |
| Winston            | ^3.11.0   | Logging             |
| Swagger            | ^6.2.8    | API documentation   |
| Helmet             | ^7.1.0    | Security headers    |
| Express Rate Limit | ^7.1.5    | Rate limiting       |

### Frontend Stack

| Công nghệ       | Phiên bản | Mục đích         |
| --------------- | --------- | ---------------- |
| React           | ^18.2.0   | UI framework     |
| Vite            | ^5.0.0    | Build tool       |
| Zustand         | ^4.4.7    | State management |
| React Router    | ^6.20.1   | Routing          |
| Axios           | ^1.6.2    | HTTP client      |
| Tailwind CSS    | ^3.3.6    | Styling          |
| Recharts        | ^2.15.4   | Charts           |
| React Hook Form | ^7.48.2   | Form handling    |
| React Hot Toast | ^2.4.1    | Notifications    |

## 📁 Cấu trúc chi tiết

### Backend Structure

```
backend/
├── src/
│   ├── config/              # Cấu hình
│   │   ├── constants.js     # Hằng số
│   │   ├── database.js      # Kết nối MongoDB
│   │   ├── index.js         # Config chính
│   │   ├── jwt.js           # JWT config
│   │   ├── logger.js        # Winston logger
│   │   └── swagger.js       # Swagger config
│   │
│   ├── controllers/         # Business logic
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── inventoryController.js
│   │   ├── inboundController.js
│   │   ├── outboundController.js
│   │   ├── dashboardController.js
│   │   └── ...
│   │
│   ├── models/              # Database models
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Inventory.js
│   │   ├── Inbound.js
│   │   ├── Outbound.js
│   │   └── ...
│   │
│   ├── routes/              # API routes
│   │   ├── index.js         # Route aggregator
│   │   ├── auth.js
│   │   ├── products.js
│   │   ├── inventory.js
│   │   └── ...
│   │
│   ├── middlewares/         # Middleware
│   │   ├── auth.js          # JWT authentication
│   │   ├── authorize.js     # Role-based authorization
│   │   ├── errorHandler.js  # Error handling
│   │   ├── logger.js        # Request logging
│   │   └── validate.js      # Input validation
│   │
│   ├── services/            # Service layer
│   │   ├── inventoryService.js
│   │   ├── notificationService.js
│   │   ├── reportService.js
│   │   └── stockService.js
│   │
│   ├── utils/               # Utilities
│   │   ├── errorHandler.js
│   │   ├── excel.js         # Excel export
│   │   ├── generateCode.js  # Code generation
│   │   ├── pagination.js    # Pagination helper
│   │   ├── response.js      # Response formatter
│   │   └── validation.js
│   │
│   └── validators/          # Validators
│       ├── authValidator.js
│       ├── inboundValidator.js
│       ├── productValidator.js
│       └── validation.js
│
├── logs/                    # Application logs
│   ├── audit.log
│   ├── combined.log
│   ├── error.log
│   ├── exceptions.log
│   └── rejections.log
│
├── scripts/                 # Utility scripts
│   ├── createAdmin.js
│   └── resetAdminPassword.js
│
└── server.js                # Entry point
```

### Frontend Structure

```
frontend/
├── src/
│   ├── api/                 # API client
│   │   └── client.js        # Axios instance
│   │
│   ├── components/          # Reusable components
│   │   ├── common/          # Common components
│   │   │   └── ProtectedRoute.jsx
│   │   ├── layout/          # Layout components
│   │   │   ├── Layout.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── AuthLayout.jsx
│   │   └── ui/              # UI components
│   │       ├── Button.jsx
│   │       ├── Input.jsx
│   │       ├── Modal.jsx
│   │       ├── Table.jsx
│   │       └── ...
│   │
│   ├── features/            # Feature modules
│   │   ├── Auth/            # Authentication
│   │   │   ├── api/
│   │   │   ├── components/
│   │   │   └── hooks/
│   │   ├── Products/        # Product management
│   │   ├── Inventory/      # Inventory management
│   │   ├── Inbound/         # Inbound management
│   │   ├── Outbound/        # Outbound management
│   │   ├── Dashboard/       # Dashboard
│   │   └── ...
│   │
│   ├── pages/               # Page components
│   │   ├── LoginPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── ProductsPage.jsx
│   │   └── ...
│   │
│   ├── store/               # State management
│   │   └── authStore.js     # Auth state (Zustand)
│   │
│   ├── utils/               # Utilities
│   │   └── rateLimitUtils.js
│   │
│   ├── config/              # Configuration
│   │   └── index.js
│   │
│   └── App.jsx              # Root component
│
└── index.html               # HTML template
```

## 🚀 Cài đặt và chạy

### Yêu cầu hệ thống

- Node.js >= 16.0.0
- npm >= 8.0.0
- MongoDB (local hoặc cloud)

### Cài đặt

1. **Clone repository**

```bash
git clone <repository-url>
cd e-log_cuoi-ky
```

2. **Cài đặt dependencies**

```bash
# Cài đặt tất cả (root, backend, frontend)
npm run install:all

# Hoặc cài đặt riêng
cd backend && npm install
cd ../frontend && npm install
```

3. **Cấu hình environment**

Tạo file `.env` trong thư mục `backend`:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/elog_warehouse
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_REFRESH_SECRET=your_refresh_secret_key_change_this_in_production
FRONTEND_URL=http://localhost:3000
```

4. **Chạy ứng dụng**

**Development mode:**

```bash
# Chạy cả backend và frontend
npm run dev

# Hoặc chạy riêng
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

**Production mode:**

```bash
# Build frontend
npm run build

# Start production
npm start
```

### Tạo tài khoản admin

```bash
cd backend
node scripts/createAdmin.js
```

Hoặc sử dụng script có sẵn:

```bash
node create-admin.js
```

## 📡 API Documentation

API documentation có sẵn tại:

- **Swagger UI**: `http://localhost:5000/api-docs`
- **Health Check**: `http://localhost:5000/health`

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Test với coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

## 📊 Database Models

### Core Models

1. **User** - Người dùng hệ thống

   - username, email, password
   - role (admin, manager, employee)
   - fullName, phone, address
   - isActive, lastLogin

2. **Product** - Sản phẩm

   - name, SKU, description
   - category, price
   - images, specifications

3. **Category** - Phân loại

   - name, description
   - parent (hierarchical)
   - isActive

4. **Inventory** - Tồn kho

   - product, warehouse
   - quantity, reservedQuantity
   - minStock, maxStock
   - lastUpdated

5. **Warehouse** - Kho bãi

   - name, code
   - address, capacity
   - manager, isActive

6. **Inbound** - Phiếu nhập

   - code, warehouse
   - supplier, products
   - status, date
   - createdBy

7. **Outbound** - Phiếu xuất

   - code, warehouse
   - customer, products
   - status, date
   - createdBy

8. **StockMovement** - Di chuyển hàng

   - product, warehouse
   - type (in/out/adjust)
   - quantity, reference
   - timestamp

9. **Supplier** - Nhà cung cấp

   - name, code
   - contact, address
   - isActive

10. **Customer** - Khách hàng

    - name, code
    - contact, address
    - isActive

11. **AuditLog** - Nhật ký kiểm toán

    - user, action
    - entity, entityId
    - changes, timestamp

12. **Notification** - Thông báo
    - user, type
    - title, message
    - isRead, createdAt

## 🔄 Workflow chính

### 1. Quy trình nhập kho (Inbound)

```
1. Tạo phiếu nhập kho
   ↓
2. Chọn nhà cung cấp và kho
   ↓
3. Thêm sản phẩm và số lượng
   ↓
4. Xác nhận phiếu nhập
   ↓
5. Tự động cập nhật tồn kho
   ↓
6. Ghi log StockMovement
   ↓
7. Tạo thông báo
```

### 2. Quy trình xuất kho (Outbound)

```
1. Tạo phiếu xuất kho
   ↓
2. Chọn khách hàng và kho
   ↓
3. Thêm sản phẩm và số lượng
   ↓
4. Kiểm tra tồn kho
   ↓
5. Xác nhận phiếu xuất
   ↓
6. Tự động cập nhật tồn kho
   ↓
7. Ghi log StockMovement
   ↓
8. Tạo thông báo
```

### 3. Quy trình điều chỉnh tồn kho

```
1. Chọn sản phẩm và kho
   ↓
2. Nhập số lượng điều chỉnh
   ↓
3. Nhập lý do
   ↓
4. Xác nhận điều chỉnh
   ↓
5. Cập nhật tồn kho
   ↓
6. Ghi log StockAdjustment và StockMovement
```

## 👥 Vai trò và quyền hạn

### Admin

- Toàn quyền quản lý hệ thống
- Quản lý người dùng
- Xem tất cả báo cáo
- Cấu hình hệ thống

### Manager

- Quản lý sản phẩm, kho, nhập/xuất
- Xem báo cáo
- Quản lý nhân viên (hạn chế)
- Không thể xóa dữ liệu quan trọng

### Employee

- Xem sản phẩm, tồn kho
- Tạo phiếu nhập/xuất (cần phê duyệt)
- Cập nhật thông tin cá nhân
- Không thể xem báo cáo chi tiết

## 📈 Tính năng nổi bật

1. **Real-time Inventory Tracking**

   - Cập nhật tồn kho tự động
   - Cảnh báo tồn kho thấp
   - Lịch sử di chuyển hàng đầy đủ

2. **Multi-warehouse Support**

   - Quản lý nhiều kho bãi
   - Tồn kho theo từng kho
   - Chuyển kho giữa các kho

3. **Comprehensive Reporting**

   - Báo cáo xuất nhập kho
   - Báo cáo tồn kho
   - Export Excel
   - Biểu đồ trực quan

4. **Audit Trail**

   - Ghi log tất cả thay đổi
   - Theo dõi người thực hiện
   - Lịch sử đầy đủ

5. **Security First**
   - JWT authentication
   - Role-based access control
   - Rate limiting
   - Input validation

## 🐛 Debugging & Logging

### Log Files

Logs được lưu trong `backend/logs/`:

- `combined.log` - Tất cả logs
- `error.log` - Chỉ errors
- `audit.log` - Audit logs
- `exceptions.log` - Uncaught exceptions
- `rejections.log` - Unhandled rejections

### Xem logs

```bash
# Xem tất cả logs
cd backend
npm run logs

# Xem error logs
npm run logs:error
```

## 🔧 Scripts hữu ích

### Backend Scripts

```bash
# Development
npm run dev              # Chạy với nodemon

# Production
npm start                # Chạy production

# Testing
npm test                 # Chạy tests
npm run test:watch       # Watch mode
npm run test:coverage    # Với coverage

# Linting
npm run lint             # Check linting
npm run lint:fix         # Fix linting errors

# Logs
npm run logs             # Xem combined logs
npm run logs:error       # Xem error logs
```

### Frontend Scripts

```bash
# Development
npm run dev              # Chạy dev server

# Build
npm run build            # Build production

# Preview
npm run preview          # Preview production build

# Linting
npm run lint             # Check linting
npm run lint:fix         # Fix linting errors
```

### Root Scripts

```bash
# Install all
npm run install:all      # Cài đặt tất cả dependencies

# Development
npm run dev              # Chạy cả backend và frontend

# Production
npm start                # Start production
npm run build            # Build frontend
```

## 📝 Best Practices

### Code Organization

- Feature-based structure
- Separation of concerns
- Reusable components
- Service layer pattern

### Security

- Always validate input
- Use parameterized queries
- Sanitize user input
- Implement rate limiting
- Use HTTPS in production

### Performance

- Database indexing
- Pagination for large datasets
- Lazy loading
- Code splitting (frontend)
- Caching strategies

### Error Handling

- Centralized error handling
- Meaningful error messages
- Proper HTTP status codes
- Error logging

## 🚧 Roadmap & Future Enhancements

### Planned Features

- [ ] Barcode/QR code scanning
- [ ] Mobile app (React Native)
- [ ] Email notifications
- [ ] SMS notifications
- [ ] Advanced analytics
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Real-time collaboration
- [ ] API versioning
- [ ] GraphQL API

### Improvements

- [ ] Performance optimization
- [ ] Enhanced caching
- [ ] Better error messages
- [ ] More comprehensive tests
- [ ] CI/CD pipeline
- [ ] Docker containerization
- [ ] Kubernetes deployment

## 📄 License

MIT License

## 👨‍💻 Development Team

E-Logistics Team

## 📞 Support

Để được hỗ trợ, vui lòng tạo issue trên repository hoặc liên hệ team phát triển.

---

**Phiên bản:** 1.0.0  
**Cập nhật lần cuối:** 2024
