# Schedly - College Event Management System

![Status](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-ISC-blue.svg)
![Node](https://img.shields.io/badge/node-v18+-green.svg)
![MongoDB](https://img.shields.io/badge/mongodb-atlas-brightgreen.svg)

A comprehensive MERN stack application for managing college events with **AI-powered recommendations**, **role-based access control**, and **automated approval workflows**.

## ✨ Features

### 🔐 **Role-Based Access Control (RBAC)**
- 5 distinct user roles with specific permissions
- JWT-based secure authentication
- Protected routes and API endpoints

### 🤖 **AI-Powered Recommendations**
- Content-based filtering using Jaccard similarity
- Personalized event suggestions based on student interests
- Behavior tracking for improved recommendations

### 🔄 **7-Stage Event Lifecycle**
Draft → Submitted → Faculty Review → Admin Approval → Published → Completed → Archived

### 📊 **Analytics & Reporting**
- Real-time dashboard statistics
- Department-wise event breakdown
- Participation trends
- Event behavior analytics

### 🎨 **Modern UI/UX**
- Glassmorphism design
- Responsive layout (mobile, tablet, desktop)
- Vibrant gradients and smooth animations
- Professional event cards with images

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- MongoDB Atlas account
- npm or yarn

### Installation

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/schedly.git
cd schedly

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Set up environment variables
# Copy .env.example to .env and fill in values

# Seed database with test data
cd backend
npm run seed

# Start development servers
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

Access the app at `http://localhost:5173`

## 📖 Documentation

- **[Deployment Guide](./DEPLOYMENT.md)** - Deploy to Render & Vercel
- **[Test Credentials](./TEST_CREDENTIALS.md)** - Login details for all roles
- **[Progress Tracker](./PROGRESS.md)** - Development status
- **[API Documentation](./API.md)** - API endpoints (coming soon)

## 🎯 User Roles

| Role | Description |
|------|-------------|
| **Super Admin** | Full system control, user management |
| **College Admin** | Final event approval, analytics, publishing |
| **Faculty Mentor** | Review and approve student events |
| **Event Organizer** | Create and manage events, registrations |
| **Student** | Browse events, register, get recommendations |

## 🛠️ Technology Stack

### Backend
- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication
- bcryptjs for password hashing

### Frontend
- React + Vite
- React Router
- Axios
- CSS3 with modern design

## 📊 Project Status

- ✅ **Backend**: 100% Complete
- ✅ **Frontend**: 90% Complete
- ✅ **Core Features**: Fully Functional
- 🚧 **Remaining**: Email notifications, Charts, Super Admin UI

## 🔑 Test Accounts

After running `npm run seed`:

```
Student: student1@schedly.com / student123
Organizer: organizer1@schedly.com / organizer123
Faculty: faculty1@schedly.com / faculty123
Admin: admin@schedly.com / admin123
Super Admin: superadmin@schedly.com / admin123
```

## 📝 License

ISC License - see LICENSE file for details

## 👥 Contributors

Built with ❤️ for college event management

---

**Live Demo**: [Coming Soon after deployment]

**Documentation**: [Full docs available in `/docs` folder]
