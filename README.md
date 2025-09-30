# EDMS: Electronic Document Management System

A full-stack web application demonstrating modern software engineering practices, built with **Node.js**, **Express**, **MongoDB**, and **AWS S3**. This project showcases enterprise-grade document management capabilities with role-based access control, cloud storage integration, and comprehensive testing.

## 🚀 Live Demo

**[View Live Application](https://edms-blue.vercel.app/)** - Experience the full EDMS functionality

### **🧪 Test Credentials (Pre-configured for Demo)**

| Role | User ID | Password | Access Level |
|------|---------|----------|--------------|
| **Admin** | `admin_1` | `admin` | Full system access, user management |
| **Contributor** | `cont_1` | `cont` | Upload, download, delete own files |
| **Viewer** | `view_1` | `view` | View and download files only |

*Or create your own account using the registration form.*

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

## 🎯 **Recruiter Testing Guide**

### **How to Test This Application**

This section provides recruiters with a comprehensive testing guide to evaluate the technical capabilities demonstrated in this project.

#### **🔐 Role-Based Access Testing**

**1. Test Admin Functionality:**
- Login with `admin_1` / `admin`
- Navigate to "Admin Panel" in the header
- Test user management features:
  - View all users and their roles
  - Change user roles (Admin ↔ Contributor ↔ Viewer)
  - Delete users
  - Test real-time statistics updates
- Verify admin can access all files and delete any file

**2. Test Contributor Functionality:**
- Login with `cont_1` / `cont`
- Test file operations:
  - Upload files (various formats and sizes)
  - Download files
  - Delete only files you uploaded
  - Preview files (images, PDFs, text files)
- Verify contributor cannot access admin panel
- Test that you cannot delete other users' files

**3. Test Viewer Functionality:**
- Login with `view_1` / `view`
- Test read-only access:
  - View all files
  - Download files
  - Preview files
- Verify viewer cannot upload or delete files
- Test that upload form is not available

#### **📁 File Upload & Management Testing**

**Test File Types & Sizes:**
- **Small files** (< 1MB): Text files, small images
- **Medium files** (1-10MB): PDFs, documents, images
- **Large files** (10-100MB): Videos, archives, large documents
- **Edge case**: Try uploading a file > 100MB (should fail gracefully)

**Test Special Characters in Filenames:**
- Upload files with spaces: `My Document (Final Version).txt`
- Upload files with international characters: `Résumé - John Smith.pdf`
- Upload files with special symbols: `File@#$%^&*().txt`
- Upload files with unicode: `Unicode Test: αβγδε 中文 🚀.txt`

**Expected Results:**
- All files should upload successfully
- Download filenames should be sanitized but readable
- No HTTP header errors in browser console
- Email notifications should display properly

#### **🔍 Search & Filter Testing**

**Test Search Functionality:**
- Search by filename (partial matches)
- Search by uploader name
- Search by file tags
- Search with international characters
- Test case-insensitive search

**Test Filtering:**
- Filter by file categories (Documents, Images, etc.)
- Sort by date (newest/oldest first)
- Sort by file size
- Sort by uploader
- Test client-side filtering performance

#### **👁️ Preview Functionality Testing**

**Test File Previews:**
- **Images**: JPG, PNG files should display in modal
- **PDFs**: Should show "Download PDF" message with download link
- **Text files**: Should display content in modal
- **Other formats**: Should show appropriate preview or download option

**Test Preview Modal:**
- Modal should be centered on screen
- Close button should work
- Download button should work
- Modal should handle different screen sizes

#### **📧 Email Notification Testing**

**Test Email Features:**
- Upload a file and check for confirmation email
- Delete a file and check for deletion notification
- Register a new account and check for welcome email
- Verify email content displays special characters correctly

#### **🛡️ Security Testing**

**Test Authentication:**
- Try accessing protected routes without login
- Test session timeout
- Test JWT token functionality
- Test password hashing (check network requests)

**Test Authorization:**
- Try accessing admin features as non-admin
- Try deleting other users' files as contributor
- Test role-based UI elements

#### **⚡ Performance Testing**

**Test Upload Performance:**
- Upload multiple files simultaneously
- Test with slow internet connection
- Monitor upload progress indicators
- Test direct S3 upload functionality

**Test Client-Side Performance:**
- Test filtering with large number of files
- Test search responsiveness
- Test modal loading times
- Test page load performance

#### **🌐 Cross-Browser Testing**

**Test Browser Compatibility:**
- Chrome, Firefox, Safari, Edge
- Mobile browsers (iOS Safari, Chrome Mobile)
- Test responsive design on different screen sizes
- Test touch interactions on mobile devices

#### **🔧 Technical Evaluation Points**

**Backend Architecture:**
- RESTful API design
- Database schema and relationships
- File storage architecture (AWS S3)
- Authentication and authorization
- Error handling and logging

**Frontend Architecture:**
- Client-side JavaScript organization
- CSS architecture and responsive design
- User experience and interface design
- Performance optimization techniques

**DevOps & Deployment:**
- CI/CD pipeline implementation
- Environment configuration
- Production deployment
- Monitoring and error tracking

#### **📊 Success Criteria**

**✅ Technical Excellence Indicators:**
- All file types upload and download correctly
- No console errors or HTTP 500 errors
- Smooth user experience across all features
- Proper error handling and user feedback
- Responsive design works on all devices
- Email notifications work reliably

**✅ Code Quality Indicators:**
- Clean, readable code structure
- Proper error handling
- Security best practices
- Performance optimization
- Modern development practices

#### **🚨 Common Issues to Check**

**Potential Problems:**
- Files with special characters causing download errors
- Preview modal positioning issues
- Email notifications not working
- Search functionality not responding
- Mobile responsiveness issues
- Browser compatibility problems

**Debugging Tips:**
- Check browser console for JavaScript errors
- Check network tab for failed API requests
- Test with different file types and sizes
- Test with different user roles
- Test on different devices and browsers

#### **📁 Special Character Testing Files**

This project includes a comprehensive test suite with **50+ test files** containing various special characters to validate the sanitization functionality:

**Test File Categories:**
- **International Characters**: `Résumé - John Smith.pdf`, `日本語テストファイル.txt`, `中文测试文档.pdf`
- **Special Symbols**: `File@#$%^&*()_+-=[]{}|;:,.<>?.txt`
- **Spaces & Punctuation**: `My Document (Final Version).txt`, `Screenshot 2024-09-29 at 7.55.35 PM.png`
- **Unicode & Emoji**: `Unicode Test: αβγδε 中文 🚀.txt`
- **Control Characters**: Files with newlines, tabs, and mixed control characters
- **Edge Cases**: Very long filenames, multiple spaces, leading/trailing spaces

**How to Use Test Files:**
1. **Download test files** from the repository's `test-files/` directory
2. **Upload various file types** with special characters
3. **Test download functionality** - filenames should be sanitized but readable
4. **Test preview functionality** - should work with all file types
5. **Test email notifications** - should display special characters properly
6. **Verify no errors** in browser console or server logs

**Expected Sanitization Results:**
- **Before**: `"File with αβγδε and \"quotes\" and newlines.txt"`
- **After**: `"File with  and 'quotes' and newlines.txt"`
- **Before**: `"Résumé - John Smith.pdf"`
- **After**: `"Rsum - John Smith.pdf"`

This testing validates the robust filename sanitization system that handles any file type with special characters, ensuring enterprise-grade reliability.

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
