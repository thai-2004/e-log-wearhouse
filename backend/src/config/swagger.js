// Swagger API Documentation Configuration
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'E-Log Warehouse Management System API',
      version: '1.0.0',
      description: `
        ## E-Log Backend API Documentation
        
        This is the backend API for the E-Log Warehouse Management System.
        
        ### Features:
        - **Authentication & Authorization**: JWT-based authentication with role-based access control
        - **Inventory Management**: Complete inventory tracking and management
        - **Inbound/Outbound Operations**: Warehouse receiving and shipping operations
        - **Customer & Supplier Management**: Customer and supplier data management
        - **Reporting**: Comprehensive reporting and analytics
        - **Dashboard**: Real-time dashboard with key metrics
        
        ### Authentication:
        Most endpoints require authentication. Include the JWT token in the Authorization header:
        \`Authorization: Bearer <your-jwt-token>\`
        
        ### Rate Limiting:
        - General API: 100 requests per 15 minutes
        - Authentication endpoints: 5 requests per 15 minutes
        
        ### Error Handling:
        All errors follow a consistent format with appropriate HTTP status codes.
      `,
      contact: {
        name: 'E-Log Development Team',
        email: 'dev@elog.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:5000/api',
        description: 'Development server'
      },
      {
        url: 'https://api.elog.com/api',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token obtained from login endpoint'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'User ID'
            },
            username: {
              type: 'string',
              description: 'Username'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email'
            },
            fullName: {
              type: 'string',
              description: 'Full name'
            },
            role: {
              type: 'string',
              enum: ['admin', 'manager', 'user', 'viewer'],
              description: 'User role'
            },
            isActive: {
              type: 'boolean',
              description: 'Account status'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp'
            },
            lastLogin: {
              type: 'string',
              format: 'date-time',
              description: 'Last login timestamp'
            }
          }
        },
        Product: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Product ID'
            },
            name: {
              type: 'string',
              description: 'Product name'
            },
            sku: {
              type: 'string',
              description: 'Product SKU'
            },
            description: {
              type: 'string',
              description: 'Product description'
            },
            category: {
              type: 'string',
              description: 'Category ID'
            },
            unitPrice: {
              type: 'number',
              description: 'Unit price'
            },
            status: {
              type: 'string',
              enum: ['active', 'inactive', 'discontinued'],
              description: 'Product status'
            }
          }
        },
        Inventory: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Inventory ID'
            },
            product: {
              type: 'string',
              description: 'Product ID'
            },
            warehouse: {
              type: 'string',
              description: 'Warehouse ID'
            },
            quantity: {
              type: 'number',
              description: 'Current quantity'
            },
            reservedQuantity: {
              type: 'number',
              description: 'Reserved quantity'
            },
            minStock: {
              type: 'number',
              description: 'Minimum stock level'
            },
            maxStock: {
              type: 'number',
              description: 'Maximum stock level'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              description: 'Error message'
            },
            code: {
              type: 'string',
              description: 'Error code'
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Error timestamp'
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: {
                    type: 'string'
                  },
                  message: {
                    type: 'string'
                  }
                }
              }
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              description: 'Success message'
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Response timestamp'
            },
            data: {
              type: 'object',
              description: 'Response data'
            }
          }
        },
        Pagination: {
          type: 'object',
          properties: {
            page: {
              type: 'integer',
              description: 'Current page number'
            },
            limit: {
              type: 'integer',
              description: 'Items per page'
            },
            total: {
              type: 'integer',
              description: 'Total number of items'
            },
            pages: {
              type: 'integer',
              description: 'Total number of pages'
            },
            hasNext: {
              type: 'boolean',
              description: 'Has next page'
            },
            hasPrev: {
              type: 'boolean',
              description: 'Has previous page'
            }
          }
        }
      },
      responses: {
        UnauthorizedError: {
          description: 'Authentication information is missing or invalid',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                message: 'Access token required',
                code: 'UNAUTHORIZED',
                timestamp: '2024-01-01T00:00:00.000Z'
              }
            }
          }
        },
        ForbiddenError: {
          description: 'Insufficient permissions',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                message: 'Insufficient permissions',
                code: 'FORBIDDEN',
                timestamp: '2024-01-01T00:00:00.000Z'
              }
            }
          }
        },
        NotFoundError: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                message: 'Resource not found',
                code: 'NOT_FOUND',
                timestamp: '2024-01-01T00:00:00.000Z'
              }
            }
          }
        },
        ValidationError: {
          description: 'Validation error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                message: 'Validation failed',
                code: 'VALIDATION_ERROR',
                timestamp: '2024-01-01T00:00:00.000Z',
                errors: [
                  {
                    field: 'email',
                    message: 'Invalid email format'
                  }
                ]
              }
            }
          }
        },
        ServerError: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                message: 'Internal server error',
                code: 'INTERNAL_ERROR',
                timestamp: '2024-01-01T00:00:00.000Z'
              }
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and authorization endpoints'
      },
      {
        name: 'Users',
        description: 'User management endpoints'
      },
      {
        name: 'Products',
        description: 'Product management endpoints'
      },
      {
        name: 'Categories',
        description: 'Category management endpoints'
      },
      {
        name: 'Inventory',
        description: 'Inventory management endpoints'
      },
      {
        name: 'Inbound',
        description: 'Inbound operations endpoints'
      },
      {
        name: 'Outbound',
        description: 'Outbound operations endpoints'
      },
      {
        name: 'Customers',
        description: 'Customer management endpoints'
      },
      {
        name: 'Suppliers',
        description: 'Supplier management endpoints'
      },
      {
        name: 'Reports',
        description: 'Reporting and analytics endpoints'
      },
      {
        name: 'Dashboard',
        description: 'Dashboard data endpoints'
      },
      {
        name: 'Health',
        description: 'Health check and system status endpoints'
      }
    ]
  },
  apis: [
    './src/routes/*.js',
    './src/controllers/*.js'
  ]
};

const specs = swaggerJsdoc(options);

// Custom CSS for Swagger UI
const customCss = `
  .swagger-ui .topbar { display: none }
  .swagger-ui .info .title { color: #3b82f6 }
  .swagger-ui .scheme-container { background: #f8fafc; padding: 20px; border-radius: 8px }
`;

module.exports = { swaggerUi, specs, customCss };
