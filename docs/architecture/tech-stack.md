# Tech Stack Decisions

## Repository State (Observed)

The repository is in a **greenfield state**. On the `main` branch, the only tracked file is `README.md` (103 bytes, scaffold description). There is **no existing framework, dependency, service, or application code** to preserve or migrate. This phase documents the stack rather than migrating one.

---

## Technology Choices

### Frontend
**Choice:** Next.js 14+ (App Router) with React 18+ and TypeScript 5+

**Rationale:**
- Native server components and streaming reduce client bundle size and improve initial load
- App Router provides built-in route groups, layouts, and server actions for cleaner data fetching
- First-class TypeScript support with strict type checking
- Excellent developer experience with hot module replacement, fast refresh, and Turbopack
- Built-in image optimization, font optimization, and middleware
- Vercel deployment with zero-config preview deployments
- Strong ecosystem and long-term support

### Backend
**Choice:** NestJS 10+ with TypeScript 5+

**Rationale:**
- Modular architecture with dependency injection matches the domain-driven structure of the app
- Built-in validation pipes, guards, interceptors, and exception filters reduce boilerplate
- First-class TypeScript support with decorators and metadata reflection
- Swagger/OpenAPI integration for automatic API documentation
- Testing utilities (TestModule, mock providers) simplify unit and integration tests
- Works well in a monorepo alongside Next.js
- Long-term support and active maintenance

### Database & ORM
**Choice:** PostgreSQL 15+ with Prisma ORM 5+

**Rationale:**
- PostgreSQL provides robust relational integrity, JSONB support, and advanced indexing
- Prisma offers type-safe database access with auto-generated TypeScript types from schema
- Migration system is declarative and version-controlled
- Prisma Client provides excellent autocomplete and compile-time query validation
- Supports connection pooling (PgBouncer) for serverless environments
- Strong ecosystem and community support

### Monorepo Tool
**Choice:** Turborepo 2+

**Rationale:**
- Fast, incremental builds with remote caching
- Simple `turbo.json` configuration
- Works natively with npm/yarn/pnpm workspaces
- Excellent CI integration (GitHub Actions, GitLab CI, etc.)
- Lightweight compared to Nx for this project's scope

### Authentication Strategy
**Choice:** JWT (Access + Refresh tokens) in httpOnly cookies with Argon2id password hashing

**Rationale:**
- httpOnly cookies prevent XSS token theft (unlike localStorage)
- Short-lived access tokens (15 min) + long-lived refresh tokens (7 days) with rotation
- Argon2id is the recommended password hashing algorithm (OWASP, 2023) — memory-hard, resistant to GPU attacks
- Stateless auth scales horizontally; no server-side session store needed
- Refresh token rotation with reuse detection mitigates token theft
- CSRF protection via SameSite=Lax cookies + double-submit cookie pattern for mutations

### Additional Tooling
| Layer | Tool | Purpose |
|-------|------|---------|
| API Client | TanStack Query (React Query) v5 | Server state management, caching, deduplication |
| Validation | Zod + class-validator | Runtime validation (frontend + backend) |
| Styling | Tailwind CSS v3 + CSS Variables | Utility-first, design tokens, dark mode |
| UI Primitives | Radix UI (headless) + custom components | Accessible, unstyled primitives |
| Forms | React Hook Form + Zod resolvers | Performant forms with schema validation |
| Date/Time | date-fns-tz | Timezone-aware date handling |
| Testing | Jest + React Testing Library + Supertest + Playwright | Unit, integration, E2E |
| Linting | ESLint + Prettier + Husky + lint-staged | Code quality gates |
| Containerization | Docker + docker-compose | Local PostgreSQL, consistent environments |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        turborepo (monorepo)                      │
├──────────────────────────────┬──────────────────────────────────┤
│        apps/web (Next.js)     │        apps/api (NestJS)         │
│  - App Router (RSC)           │  - Modular (Auth, Tasks, etc.)   │
│  - React Server Components    │  - Guards, Pipes, Interceptors   │
│  - TanStack Query             │  - Prisma Client                 │
│  - Tailwind + Radix UI        │  - Swagger/OpenAPI               │
└──────────────────────────────┴──────────────────────────────────┘
                              │
                              ▼
                    ┌───────────────────────┐
                    │   PostgreSQL (Prisma) │
                    └───────────────────────┘
```

---

## Non-Goals for This Phase
- No code implementation
- No Docker/infra setup beyond documenting the stack
- No dependency manifests or lockfiles
- No framework or tool configuration