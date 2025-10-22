# E-Log Frontend

Modern React frontend for E-Log Warehouse Management System built with Vite, React Router, and Tailwind CSS.

## 🚀 Features

- **Modern React 18** with hooks and functional components
- **Vite** for fast development and building
- **React Router v6** for client-side routing
- **Tailwind CSS** for utility-first styling
- **React Query** for server state management
- **Zustand** for client state management
- **React Hook Form** for form handling
- **React Hot Toast** for notifications
- **Framer Motion** for animations
- **Folder by Feature** architecture

## 📁 Project Structure

```
src/
├── features/           # Feature-based modules
│   ├── Auth/          # Authentication feature
│   │   ├── components/ # Auth-specific components
│   │   ├── api/        # Auth API services
│   │   ├── hooks/      # Auth custom hooks
│   │   └── index.js    # Feature exports
│   ├── Products/      # Product management
│   ├── Users/         # User management
│   ├── Categories/    # Category management
│   ├── Inventory/     # Inventory management
│   ├── Dashboard/     # Dashboard feature
│   └── ...           # Other features
├── components/        # Shared UI components
│   ├── ui/           # Basic UI components
│   ├── layout/       # Layout components
│   └── common/       # Common components
├── pages/            # Page components
├── hooks/            # Global custom hooks
├── services/         # Global services
├── store/            # Global state management
├── utils/            # Utility functions
├── config/           # Configuration files
└── assets/           # Static assets
```

## 🛠️ Development

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

### Environment Setup

1. Copy `.env.example` to `.env.local`
2. Configure your environment variables:

```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=E-Log Warehouse Management System
```

## 🎨 UI Components

The project includes a comprehensive set of reusable UI components:

- **Button** - Various button styles and sizes
- **Input** - Form input with validation
- **Modal** - Modal dialogs
- **Table** - Data tables with sorting and pagination
- **Layout** - Page layout components
- **Sidebar** - Navigation sidebar
- **Header** - Page header

## 🔐 Authentication

The app includes a complete authentication system:

- Login/Register forms
- JWT token management
- Protected routes
- Role-based access control
- Automatic token refresh

## 📱 Responsive Design

The application is fully responsive and works on:

- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Deploy to Netlify

```bash
# Build the project
npm run build

# Deploy dist folder to Netlify
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm test:watch

# Run tests with coverage
npm test:coverage
```

## 📚 API Integration

The frontend integrates with the backend API through:

- **Axios** for HTTP requests
- **React Query** for caching and synchronization
- **Automatic token refresh**
- **Error handling and retry logic**

## 🎯 Features Implemented

### ✅ Completed

- [x] Project structure setup
- [x] Authentication system
- [x] Basic UI components
- [x] Layout and navigation
- [x] Routing setup
- [x] State management
- [x] API integration setup

### 🚧 In Progress

- [ ] Product management
- [ ] Category management
- [ ] User management
- [ ] Inventory management
- [ ] Dashboard implementation
- [ ] Reports and analytics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
