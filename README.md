# EDMS: Electronic Document Management System

A production-ready document management platform built with **Node.js**, **Express**, **MongoDB**, and **AWS S3**. Demonstrates enterprise-grade software engineering practices with comprehensive testing, security, and monitoring.

## 🚀 Live Demo

**[View Live Application](https://edms-blue.vercel.app/)** | **[API Documentation](https://edms-blue.vercel.app/api-docs)**

### Quick Test Access
| Role | Username | Password | Capabilities |
|------|----------|----------|-------------|
| **Admin** | `admin` | `admin` | Full system access, user management |
| **Contributor** | `cont` | `cont` | Upload, download, manage own files |
| **Viewer** | `view` | `view` | View and download files only |

## ✨ Key Features

- **🔐 Secure Authentication** - JSON Web Tokens + session-based auth with bcrypt hashing
- **👥 Role-Based Access Control** - Admin, Contributor, Viewer permissions
- **☁️ Cloud Storage** - Direct AWS S3 integration with 100MB file support
- **🔍 Smart Search** - Client-side filtering and real-time search
- **📊 Admin Dashboard** - User management with role assignment
- **📱 Responsive Design** - Mobile-first approach with modern UI
- **👁️ File Preview** - Image and document preview capabilities

## 🛠️ Tech Stack

**Backend:** Node.js, Express.js, MongoDB, AWS S3, JWT, bcrypt
**Frontend:** EJS templating, vanilla JavaScript, CSS3
**DevOps:** Vercel deployment, GitHub Actions CI/CD
**Testing:** Jest, Supertest (40+ tests)
**Monitoring:** Vercel Analytics, performance tracking
**Documentation:** Swagger/OpenAPI with interactive docs

## 🚀 Quick Start

```bash
# Clone and install
git clone <repository-url>
cd edms
npm install

# Environment setup
cp .env.example .env
# Configure MongoDB, AWS S3, and email credentials

# Run locally
npm start
# Visit http://localhost:3000
```

## 📊 Technical Highlights

- **Performance:** Direct S3 uploads bypass server limitations
- **Security:** Input sanitization, XSS protection, SQL injection prevention
- **Testing:** 40+ comprehensive tests covering unit, integration, security, and performance
- **Monitoring:** Real-time analytics and performance tracking
- **Documentation:** Interactive API docs with Swagger/OpenAPI
- **CI/CD:** Automated testing and deployment pipeline

## 🎯 Future Roadmap

**Phase 1: Security & API**
- [ ] Rate limiting and DDoS protection
- [ ] Advanced audit logging
- [ ] API rate limiting

**Phase 2: Monitoring & Observability**
- [ ] Application performance monitoring
- [ ] Error tracking and alerting
- [ ] User behavior analytics

**Phase 3: Advanced Features**
- [ ] Real-time collaboration
- [ ] Advanced file processing
- [ ] Machine learning integration

## 📈 Project Metrics

- **Test Coverage:** 40+ tests across unit, integration, security, and performance
- **Performance:** <1s response times, handles 100MB+ files
- **Security:** Protected against XSS, SQL injection, and file upload attacks
- **Scalability:** Cloud-native architecture with AWS S3 integration

## 🔗 Links

- **Live Demo:** [edms-blue.vercel.app](https://edms-blue.vercel.app)
- **API Docs:** [edms-blue.vercel.app/api-docs](https://edms-blue.vercel.app/api-docs)
- **GitHub Profile:** [github.com/bennytobby](https://github.com/bennytobby)
- **LinkedIn:** [linkedin.com/in/pmachre](https://www.linkedin.com/in/pmachre)
- **Portfolio:** [devcorpwebsite.vercel.app](https://devcorpwebsite.vercel.app)

---

*Built with modern software engineering practices, demonstrating proficiency in full-stack development, cloud architecture, and enterprise-grade application design.*
