# School ERP SaaS Platform

Enterprise-grade multi-tenant School Management System built with React, Node.js, and MongoDB.

## Features

- Multi-tenant SaaS architecture (1000+ schools)
- Complete RBAC with 12+ user roles
- 20+ modules: Students, Teachers, Fees, Exams, Library, Transport, Hostel, Payroll, and more
- JWT + Refresh Token authentication
- PDF/Excel/CSV report exports
- Premium SaaS UI with light/dark/system themes

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React, Vite, TypeScript, Tailwind CSS, Zustand, TanStack Table, Recharts |
| Backend | Node.js, Express, TypeScript, Zod, Multer, PDFKit, ExcelJS |
| Database | MongoDB, Mongoose |

## Quick Start

### Prerequisites

- Node.js 20+
- MongoDB 6+

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

### Seed Super Admin

```bash
cd backend
npm run seed
```

Default credentials: `superadmin@schoolerp.com` / `SuperAdmin@123`

## Environment Variables

### Backend (.env)

```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/schoolerp
JWT_SECRET=your-jwt-secret-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-min-32-chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

### Frontend (.env)

```
VITE_API_URL=http://localhost:5000/api/v1
```

## Project Structure

```
SchoolMgm/
├── backend/          # Express API (Domain-Driven Design)
├── frontend/         # React SPA
└── docs/             # Architecture & database docs
```

## API Documentation

Base URL: `http://localhost:5000/api/v1`

Key endpoints:
- `POST /auth/login` - Authentication
- `POST /auth/refresh` - Token refresh
- `GET /schools` - School management (Super Admin)
- `GET /students` - Student management
- `GET /dashboard/stats` - Dashboard analytics

## License

Proprietary - All rights reserved.
