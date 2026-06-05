# School ERP SaaS Platform - Software Architecture

## Overview

Multi-tenant School ERP SaaS platform designed to scale to 1000+ schools, 100,000+ students, and millions of records. Each school is a tenant with isolated data via `schoolId` on every collection.

## Architecture Pattern

```
┌─────────────────────────────────────────────────────────────────┐
│                        CDN / Load Balancer                       │
└─────────────────────────────┬───────────────────────────────────┘
                              │
        ┌─────────────────────┴─────────────────────┐
        │                                           │
┌───────▼────────┐                         ┌────────▼───────┐
│  React SPA     │                         │  Express API   │
│  (Vite + TS)   │◄──── REST + JWT ───────►│  (Node + TS)   │
│  Zustand       │                         │  Domain DDD    │
└────────────────┘                         └────────┬───────┘
                                                    │
                              ┌─────────────────────┼─────────────────────┐
                              │                     │                     │
                       ┌──────▼──────┐      ┌───────▼──────┐     ┌───────▼──────┐
                       │   MongoDB   │      │    Redis     │     │  File Store  │
                       │  (Primary)  │      │   (Cache)    │     │   (Uploads)  │
                       └─────────────┘      └──────────────┘     └──────────────┘
```

## Multi-Tenancy Model

- **Shared Database, Shared Schema** with `schoolId` discriminator
- Every query scoped by `schoolId` from JWT claims
- Super Admin operates with `schoolId: null` for platform-level operations
- Compound indexes: `{ schoolId: 1, ... }` on all tenant collections

## Backend Domain Structure

```
backend/src/
├── config/           # Environment, database, cache
├── database/         # Connection, base schema, indexes
├── middlewares/      # Auth, RBAC, validation, rate limit
├── modules/          # Domain modules (DDD)
│   ├── auth/
│   ├── schools/
│   ├── students/
│   └── ...
├── shared/           # Base classes, types, constants
└── utils/            # Helpers, export generators
```

### Request Flow

```
HTTP Request → Helmet → Rate Limit → Auth Middleware → RBAC Guard
  → Validation (Zod) → Controller → Service → Repository → MongoDB
  → Response + Audit Log
```

## Frontend Architecture

```
frontend/src/
├── app/              # App shell, providers
├── layouts/          # Dashboard, Auth, Portal layouts
├── pages/            # Route-level pages
├── features/         # Feature-specific components
├── components/       # Reusable UI (DataTable, Modal, etc.)
├── stores/           # Zustand state
├── services/         # API clients
├── hooks/            # Custom hooks
├── routes/           # Route definitions
└── types/            # TypeScript interfaces
```

## Security Architecture

| Layer | Implementation |
|-------|----------------|
| Authentication | JWT (15min) + Refresh Token (7d) |
| Authorization | RBAC with permission matrix |
| Input | Zod validation + mongo-sanitize |
| Transport | Helmet, CORS, rate limiting |
| Audit | AuditLogs collection on mutations |
| Password | bcrypt (12 rounds) |

## Role Hierarchy

```
Super Admin → School Admin → Principal → Department Heads → Staff → Student/Parent
```

## Caching Strategy

- Redis-ready cache layer interface (in-memory fallback for dev)
- Cache keys: `school:{schoolId}:{resource}:{id}`
- TTL: 5min for lists, 15min for static config
- Invalidation on write operations

## Scalability Considerations

- Server-side pagination on all list endpoints
- Compound MongoDB indexes per tenant
- Code splitting and lazy loading on frontend
- Virtual scrolling for large tables (TanStack Table)
- Background job architecture ready for reports/exports

## API Versioning

Base path: `/api/v1`

## Deployment

- Backend: Node.js process behind reverse proxy
- Frontend: Static build served via CDN or same origin
- MongoDB: Replica set recommended for production
- Environment variables for all secrets
