# EDMS: Electronic Document Management System

A full-stack web application demonstrating modern software engineering practices, built with **Node.js**, **Express**, **MongoDB**, and **AWS S3**. This project showcases enterprise-grade document management capabilities with role-based access control, cloud storage integration, and comprehensive testing.

## 🚀 Live Demo

**[View Live Application](https://your-vercel-app.vercel.app)** - Experience the full EDMS functionality

## ✨ Key Features

### **Authentication & Security**
- 🔐 **JWT + Session-based authentication** with bcrypt password hashing
- 👥 **Role-based access control** (Admin, Contributor, Viewer)
- 🛡️ **Secure file uploads** with direct S3 integration
- 📧 **Email notifications** for all user actions

### **Document Management**
- 📁 **Cloud storage** with AWS S3 integration
- 🔍 **Advanced search & filtering** (client-side performance optimization)
- 🏷️ **File tagging & categorization** system
- 👁️ **File preview** for images and documents
- 📊 **Admin dashboard** with user management

### **Technical Excellence**
- ⚡ **Direct S3 uploads** (bypasses server limitations)
- 📱 **Responsive design** with mobile-first approach
- 🧪 **Comprehensive testing suite** (Jest, Supertest)
- 🔄 **CI/CD pipeline** with GitHub Actions
- 🚀 **Production deployment** on Vercel

## 🛠️ Tech Stack

### **Backend**
- **Node.js** with Express.js framework
- **MongoDB Atlas** for data persistence
- **AWS S3** for cloud file storage
- **JWT** for secure authentication
- **Nodemailer** for email services

### **Frontend**
- **EJS templating** for server-side rendering
- **Vanilla JavaScript** with modern ES6+ features
- **CSS3** with responsive design principles
- **Client-side filtering** for optimal performance

### **DevOps & Testing**
- **Jest** testing framework with comprehensive coverage
- **GitHub Actions** for CI/CD automation
- **Vercel** for production deployment
- **Environment-based configuration**

## 🚀 Quick Start

### **Prerequisites**
- Node.js 22.x or higher
- MongoDB Atlas account
- AWS S3 bucket
- Gmail account (for email notifications)

### **Local Development**

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/edms.git
cd edms

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Edit .env with your credentials

# 4. Start the development server
npm start

# Application available at: http://localhost:3000
```

### **Environment Configuration**

```env
# Database
MONGO_CONNECTION_STRING=mongodb+srv://...
MONGO_DB_NAME=edms
MONGO_FILECOLLECTION=files
MONGO_USERCOLLECTION=users

# AWS S3
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name

# Email (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Security
SECRET_KEY=your-secret-key
```

## 📁 Project Architecture

```
edms/
├── server.js                 # Express server with authentication & file handling
├── views/                    # EJS templates (dashboard, admin, auth)
├── public/js/               # Client-side JavaScript (upload, preview, filtering)
├── styles/                  # CSS with responsive design & component styling
├── tests/                   # Comprehensive test suite
│   ├── unit/               # Unit tests for server logic
│   ├── integration/        # Integration tests for AWS S3
│   ├── security/           # Security & authentication tests
│   └── performance/        # Load testing & performance benchmarks
├── .github/workflows/       # CI/CD automation
└── vercel.json             # Production deployment configuration
```

## 🧪 Testing & Quality Assurance

### **Test Coverage**
- **Unit Tests**: Server logic, authentication, file handling
- **Integration Tests**: AWS S3 operations, database interactions
- **Security Tests**: Authentication bypass, input validation
- **Performance Tests**: Load testing, file upload limits
- **CI/CD Tests**: Automated testing on every commit

### **Quality Metrics**
```bash
# Run comprehensive test suite
npm run test:all

# Run specific test categories
npm run test:unit          # Unit tests
npm run test:integration   # Integration tests
npm run test:security      # Security tests
npm run test:performance   # Performance tests
```

## 🔮 Upcoming Features

### **Phase 1: Security & API Enhancement**
- 🔒 **Rate limiting** and advanced security measures
- 📚 **RESTful API** with comprehensive documentation
- 🛡️ **Input validation** and sanitization
- 🔐 **CORS configuration** for cross-origin security

### **Phase 2: Monitoring & Observability**
- 📊 **Winston logging** for production monitoring
- 📈 **Performance metrics** and error tracking
- 🔍 **Audit logging** for compliance
- 📱 **Real-time notifications** via WebSocket

### **Phase 3: Advanced Features**
- 📁 **File versioning** and history tracking
- 🔄 **Real-time collaboration** features
- 🐳 **Docker containerization** for deployment
- 📋 **Advanced admin analytics** and reporting

## 🏗️ Development Practices

### **Code Quality**
- **ESLint** configuration for code consistency
- **Prettier** for code formatting
- **Git hooks** for pre-commit validation
- **Clean architecture** with separation of concerns

### **Security Best Practices**
- Environment variables for sensitive data
- JWT token expiration and refresh
- Password hashing with bcrypt
- Input validation and sanitization
- Secure file upload handling

### **Performance Optimization**
- Client-side filtering for large datasets
- Direct S3 uploads to reduce server load
- Database indexing for fast queries
- Responsive design for all devices

## 🎯 Technical Highlights

This project demonstrates proficiency in:

- **Full-Stack Development**: End-to-end application development from database design to user interface
- **Cloud Integration**: AWS S3 for scalable file storage and MongoDB Atlas for data persistence
- **Modern Authentication**: JWT tokens with session management and role-based access control
- **Performance Engineering**: Client-side optimization and direct cloud uploads
- **Testing & Quality**: Comprehensive test coverage with unit, integration, and security testing
- **DevOps & Deployment**: CI/CD pipelines, environment configuration, and production deployment
- **Security Awareness**: Password hashing, input validation, and secure file handling
- **User Experience**: Responsive design, real-time feedback, and intuitive interfaces

## 📞 Contact & Links

- **Live Demo**: [View Application](https://edms-blue.vercel.app/)
- **GitHub Repository**: [Source Code](https://github.com/bennytobby/edms)
<!-- - **Portfolio**: [Personal Website](https://your-portfolio.com) -->

---

*This project showcases modern web development practices and enterprise-grade application architecture suitable for professional software engineering roles.*
