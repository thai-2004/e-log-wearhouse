# E-Log Backend API

E-Log Warehouse Management System Backend API built with Node.js, Express, and MongoDB.

## 🚀 Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **Inventory Management**: Complete inventory tracking and management
- **Inbound/Outbound Operations**: Warehouse receiving and shipping operations
- **Customer & Supplier Management**: Customer and supplier data management
- **Reporting**: Comprehensive reporting and analytics
- **Dashboard**: Real-time dashboard with key metrics
- **API Documentation**: Swagger/OpenAPI documentation
- **Health Checks**: Comprehensive health monitoring
- **Logging**: Structured logging with Winston
- **Security**: Rate limiting, input sanitization, CORS protection

## 📋 Prerequisites

- Node.js >= 16.0.0
- npm >= 8.0.0
- MongoDB >= 4.4
- Redis (optional, for caching)

## 🛠️ Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd e-log_cuoi-ky/backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Configuration**

   ```bash
   cp env.example .env
   ```

   Update the `.env` file with your configuration:

   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/elog_warehouse
   JWT_SECRET=your_super_secret_jwt_key
   JWT_REFRESH_SECRET=your_super_secret_refresh_key
   FRONTEND_URL=http://localhost:3000
   ```

4. **Start the application**

   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

## 📚 API Documentation

Once the server is running, you can access the API documentation at:

- **Swagger UI**: http://localhost:5000/api-docs
- **Health Check**: http://localhost:5000/health

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🔧 Development Scripts

```bash
# Start development server
npm run dev

# Start production server
npm start

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# View logs
npm run logs

# View error logs
npm run logs:error
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   │   ├── constants.js # Application constants
│   │   ├── database.js  # Database configuration
│   │   ├── jwt.js       # JWT configuration
│   │   ├── logger.js    # Logging configuration
│   │   └── swagger.js   # API documentation
│   ├── controllers/     # Route controllers
│   ├── middlewares/     # Express middlewares
│   ├── models/          # Mongoose models
│   ├── routes/          # Express routes
│   ├── services/        # Business logic services
│   ├── utils/           # Utility functions
│   ├── validators/      # Input validation
│   └── tests/           # Test files
├── logs/                # Log files
├── server.js            # Application entry point
├── package.json         # Dependencies and scripts
└── .env                 # Environment variables
```

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### User Roles

- **admin**: Full system access
- **manager**: Management operations
- **user**: Standard user operations
- **viewer**: Read-only access

## 🛡️ Security Features

- **Rate Limiting**: Prevents abuse with configurable limits
- **Input Sanitization**: Protects against NoSQL injection
- **CORS Protection**: Configurable cross-origin resource sharing
- **Helmet**: Security headers for Express
- **JWT Security**: Secure token-based authentication

## 📊 Health Monitoring

The API provides comprehensive health monitoring:

- **Basic Health**: `/health` - Basic service status
- **Detailed Health**: `/health/detailed` - System and database health
- **Readiness**: `/health/ready` - Service readiness check
- **Liveness**: `/health/live` - Service liveness check

## 📝 Logging

The application uses structured logging with Winston:

- **Console**: Development environment
- **Files**: Production environment
- **Log Levels**: error, warn, info, debug
- **Log Files**:
  - `logs/error.log` - Error logs only
  - `logs/combined.log` - All logs
  - `logs/audit.log` - Audit trail
  - `logs/exceptions.log` - Uncaught exceptions
  - `logs/rejections.log` - Unhandled rejections

## 🔄 Error Handling

The API provides consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "code": "ERROR_CODE",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "errors": [
    {
      "field": "fieldName",
      "message": "Field-specific error"
    }
  ]
}
```

## 🚀 Deployment

### Environment Variables

Ensure all required environment variables are set:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://your-mongodb-uri
JWT_SECRET=your-production-jwt-secret
JWT_REFRESH_SECRET=your-production-refresh-secret
FRONTEND_URL=https://your-frontend-url
```

### Production Considerations

- Use a process manager like PM2
- Set up reverse proxy (nginx)
- Configure SSL/TLS
- Set up monitoring and alerting
- Regular database backups
- Log rotation and management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Contact the development team
- Check the API documentation at `/api-docs`

## 🔄 API Versioning

The API uses URL-based versioning:

- Current version: v1
- Base URL: `/api/v1/`

## 📈 Performance

- Database connection pooling
- Query optimization
- Response caching (optional)
- Rate limiting
- Request/response compression
