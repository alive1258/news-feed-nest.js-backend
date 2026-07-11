<p align="center">
  <a href="https://nestjs.com/" target="_blank">
    <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="NestJS Logo" />
  </a>
</p>

<h1 align="center">NexFeed Backend API</h1>

<p align="center">
  A scalable, secure, and production-ready REST API for the NexFeed social platform built with
  <a href="https://nestjs.com/" target="_blank">NestJS</a>.
</p>

<p align="center">
  🔗 <b>Live API:</b>
  https://nex-feed-nestjs-backend.onrender.com/api/v1
</p>

<p align="center">
  📘 <b>Swagger API Docs:</b>
 https://nex-feed-nestjs-backend.onrender.com/api/v1/swagger
</p>

<p align="center">
  ⚡ Built with NestJS + PostgreSQL + TypeORM
</p>

---

# 🚀 Overview

NexFeed Backend is a production-ready REST API built using NestJS following clean architecture and scalable backend engineering practices.

The system supports:

- JWT Authentication
- Social Feed System
- Public & Private Posts
- Comments & Replies
- Like/Unlike System
- Image Upload
- Secure Authorization
- Scalable Backend Architecture

The backend is designed with security, performance, maintainability, and scalability as top priorities.

---

# ✨ Features

# 🔐 Authentication & Authorization

The authentication system is built using modern security standards and production-ready authentication architecture.

## Authentication Features

- User Registration
- User Login
- JWT-based Authentication
- Access Token & Refresh Token Strategy
- Protected Routes using JWT Guards
- Password Hashing using bcrypt
- Secure Authorization Flow
- Role-ready Authorization Architecture
- Token Verification & Validation
- Email Verification System
- Secure Logout Mechanism
- Authentication Middleware & Guards
- Request Validation using DTOs
- Secure Cookie Support (production-ready)

---

# 👤 User Registration

Users can register using:

- First Name
- Last Name
- Email
- Password

---

# 📧 Email Verification

To ensure secure and real-user authentication, the system includes email verification.

## Verification Flow

1. User registers with email and password
2. Verification token is generated
3. Verification email is sent
4. User clicks verification link
5. Account becomes verified and activated

---

# 🔑 Login System

Users can securely log in using:

- Email
- Password

---

## Login Security Features

- bcrypt password comparison
- JWT token generation
- Invalid credential handling
- Unauthorized access protection
- Verified-user-only login
- Refresh token support
- Token expiration validation

---

# 🛡️ JWT Authentication Flow

The backend uses secure JWT authentication.

## Access Token

- Short-lived secure token
- Used for authenticated API requests
- Sent through Authorization header

---

## Refresh Token

- Long-lived token
- Used to regenerate access tokens
- Improves security and user experience

---

# 🔒 Protected Routes

Protected APIs are secured using NestJS JWT Guards.

## Protected Features

- Feed APIs
- Post Creation
- Comments
- Replies
- Like/Unlike Actions
- User Profile APIs

Unauthorized users cannot access protected resources.

---

# 📰 Feed System

## Post Features

- Create Post
- Upload Image with Post
- Public Post
- Private Post
- Latest Posts First
- Edit Own Post
- Delete Own Post

---

# 💬 Comments & Replies

## Comment Features

- Add Comment
- Delete Comment
- Like / Unlike Comment
- View Comment Likes

## Reply Features

- Reply to Comments
- Delete Reply
- Like / Unlike Reply
- Nested Reply Support

---

# ❤️ Like System

Users can:

- Like / Unlike Posts
- Like / Unlike Comments
- Like / Unlike Replies
- View users who liked content

---

# 🧱 Technology Stack

# Backend Framework

- NestJS
- TypeScript

---

# Database

- PostgreSQL

---

# ORM

- TypeORM

---

# Authentication

- JWT
- Passport.js
- bcrypt

---

# File Upload

- Multer

---

# Validation

- class-validator
- class-transformer

---

# 📌 Why NestJS?

NestJS provides:

- Enterprise-grade architecture
- Dependency Injection
- Modular structure
- High scalability
- Clean code organization
- Excellent TypeScript support

---

# 🏗️ Backend Architecture

The project follows a modular architecture for scalability and maintainability.

```bash
src/
├── auth/
├── users/
├── posts/
├── comments/
├── replies/
├── likes/
├── common/
│   ├── decorators/
│   ├── guards/
│   ├── filters/
│   ├── interceptors/
│   ├── middleware/
│   ├── pipes/
│   └── utils/
├── config/
├── database/
└── main.ts
```

---

# 🔐 Security Best Practices

The backend follows modern security standards.

## Authentication Security

- JWT Access Tokens
- Refresh Tokens
- bcrypt Password Hashing
- Protected Routes
- Authentication Guards
- Email Verification
- Token Validation

---

## API Security

- DTO Validation
- Request Validation Pipes
- Secure File Upload Validation
- Input Sanitization
- Exception Filters

---

## Database Security

- ORM-based queries
- SQL Injection Prevention
- Proper relational mapping

---

# ⚡ Performance Optimization

The backend is designed for scalability and high-volume traffic.

## Optimization Strategies

- Database Indexing
- Pagination Support
- Optimized Query Relations
- Efficient Response Serialization
- Lazy Loading Relations
- Modular Services

---

# 🌐 API Endpoints

# Authentication

```bash
POST /auth/register
POST /auth/verify-email
POST /auth/login
POST /auth/refresh
POST /auth/logout
GET  /auth/profile
```

---

# Posts

```bash
POST   /posts
GET    /posts
GET    /posts/:id
PATCH  /posts/:id
DELETE /posts/:id
```

---

# Comments

```bash
POST   /comments
DELETE /comments/:id
```

---

# Replies

```bash
POST   /replies
DELETE /replies/:id
```

---

# Likes

```bash
POST /likes/toggle
GET  /likes/:type/:id
```

---

# 📸 File Upload

Image uploads are handled securely using Multer.

## Features

- Image Validation
- File Size Limiting
- Secure File Naming
- Upload Path Management

---

# ⚙️ Environment Variables

Create a `.env` file in the root directory.

```env
NODE_ENV=development
PORT=5000

DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=nexfeed

JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret

JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

UPLOAD_PATH=uploads
MAX_FILE_SIZE=5242880
```

---

# 📦 Installation

## Clone Repository

```bash
git clone https://github.com/yourusername/nexfeed-backend.git
```

---

## Navigate to Project

```bash
cd nexfeed-backend
```

---

## Install Dependencies

```bash
npm install
```

---

# ▶️ Running the Project

# Development Mode

```bash
npm run start:dev
```

---

# Production Build

```bash
npm run build
```

---

# Production Start

```bash
npm run start:prod
```

---

# 🧪 Testing

# Unit Tests

```bash
npm run test
```

---

# E2E Tests

```bash
npm run test:e2e
```

---

# Coverage

```bash
npm run test:cov
```

---

# 📘 API Documentation

Swagger documentation available at:

```bash
http://localhost:5000/api/docs
```

---

# 🐳 Docker Support

## Run using Docker

```bash
docker-compose up --build
```

---

# ☁️ Deployment

Recommended deployment platforms:

## Backend Hosting

- Railway
- Render
- DigitalOcean
- AWS EC2

---

## Database Hosting

- PostgreSQL
- Neon
- Supabase

---

# 📈 Scalability Considerations

The backend is designed assuming:

- Millions of reads
- High concurrent traffic
- Large feed generation
- High interaction volume

---

# 📜 Best Practices Followed

- Clean Architecture
- SOLID Principles
- DTO Validation
- RESTful API Design
- Modular Structure
- Proper Error Handling
- Secure Authentication
- Reusable Services
- Environment-based Config
- Scalable Backend Design

---

# 👨‍💻 Author

## Zamirul Kabir Sajib

Backend Developer

### Technologies

- NestJS
- PostgreSQL
- TypeScript
- TypeORM
- JWT Authentication

---

# 📄 License

MIT License

---

# ⭐ Support

If you like this project, consider giving it a ⭐ on GitHub.
