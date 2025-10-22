# E-Logistics Management System

Hệ thống quản lý kho bãi và logistics với giao diện web hiện đại.

## 🚀 Tính năng chính

### 👥 Quản lý người dùng

- **Đăng ký/Đăng nhập** với JWT authentication
- **3 vai trò:** Admin, Manager, Employee
- **Phân quyền** theo vai trò
- **Quản lý profile** cá nhân

### 📦 Quản lý sản phẩm

- **CRUD sản phẩm** đầy đủ
- **Phân loại sản phẩm** theo category
- **Tìm kiếm và lọc** sản phẩm
- **Quản lý tồn kho** real-time

### 📋 Quản lý đơn hàng

- **Tạo đơn hàng** mới
- **Theo dõi trạng thái** đơn hàng
- **Quản lý chi tiết** đơn hàng
- **Lịch sử** đơn hàng

### 📊 Dashboard & Báo cáo

- **Thống kê tổng quan** hệ thống
- **Biểu đồ** trực quan
- **Báo cáo** xuất nhập kho
- **Audit log** hoạt động

## 🛠️ Công nghệ sử dụng

### Backend

- **Node.js** + **Express.js**
- **MongoDB** + **Mongoose**
- **JWT** Authentication
- **Bcrypt** Password hashing
- **Express Validator** Validation

### Frontend

- **React** + **Vite**
- **Zustand** State management
- **Axios** HTTP client
- **React Router** Navigation
- **Tailwind CSS** Styling

## 🚀 Cài đặt và chạy

### 1. Clone repository

```bash
git clone <repository-url>
cd e-log_cuoi-ky
```

### 2. Cài đặt dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3. Cấu hình environment

Tạo file `.env` trong thư mục `backend`:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/elog_warehouse
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_refresh_secret_key
```

### 4. Chạy ứng dụng

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## 📡 API Endpoints

### 🔐 Authentication

```bash
POST /api/auth/register     # Đăng ký
POST /api/auth/login        # Đăng nhập
POST /api/auth/logout       # Đăng xuất
POST /api/auth/refresh      # Refresh token
GET  /api/auth/profile      # Lấy thông tin profile
PUT  /api/auth/profile      # Cập nhật profile
PUT  /api/auth/change-password # Đổi mật khẩu
```

### 👥 Users

```bash
GET    /api/users           # Danh sách users
GET    /api/users/:id       # Chi tiết user
PUT    /api/users/:id       # Cập nhật user
DELETE /api/users/:id       # Xóa user
```

### 📦 Products

```bash
GET    /api/products        # Danh sách sản phẩm
POST   /api/products        # Tạo sản phẩm
GET    /api/products/:id    # Chi tiết sản phẩm
PUT    /api/products/:id    # Cập nhật sản phẩm
DELETE /api/products/:id    # Xóa sản phẩm
```

### 📋 Orders

```bash
GET    /api/orders          # Danh sách đơn hàng
POST   /api/orders          # Tạo đơn hàng
GET    /api/orders/:id      # Chi tiết đơn hàng
PUT    /api/orders/:id      # Cập nhật đơn hàng
DELETE /api/orders/:id      # Xóa đơn hàng
```

### 📊 Dashboard

```bash
GET /api/dashboard/stats    # Thống kê tổng quan
GET /api/dashboard/charts   # Dữ liệu biểu đồ
```

## 🔑 Tạo tài khoản mẫu

### Admin

```json
{
  "username": "admin",
  "email": "admin@company.com",
  "password": "Admin123",
  "role": "admin",
  "fullName": "Admin User"
}
```

### Manager

```json
{
  "username": "manager",
  "email": "manager@company.com",
  "password": "Manager123",
  "role": "manager",
  "fullName": "Manager User"
}
```

### Employee

```json
{
  "username": "staff",
  "email": "staff@company.com",
  "password": "Staff123",
  "role": "employee",
  "fullName": "Staff User"
}
```

## 🔒 Bảo mật

- **JWT Authentication** với access/refresh tokens
- **Rate Limiting** chống spam
- **Password Hashing** với bcrypt
- **Input Validation** đầy đủ
- **CORS** cấu hình an toàn

## 📱 Giao diện

- **Responsive Design** cho mọi thiết bị
- **Dark/Light Mode** tùy chọn
- **Modern UI** với Tailwind CSS
- **Real-time Updates** với state management

## 🚀 Demo

Truy cập: `http://localhost:3000`

**Tài khoản demo:**

- Admin: `admin` / `Admin123`
- Manager: `manager` / `Manager123`
- Staff: `staff` / `Staff123`

---

**Phát triển bởi:** E-Logistics Team  
**Phiên bản:** 1.0.0
