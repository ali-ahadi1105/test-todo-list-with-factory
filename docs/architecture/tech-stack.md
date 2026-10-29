# Repository Assessment and Tech-Stack Decision

## Executive Summary

This document captures the repository assessment and technology stack decisions for the Todoist-inspired task management application. The repository is in a **greenfield state** with only a scaffold README.md on the main branch.

## Current Repository State

### Observed State (main branch)
- **Only tracked file**: `README.md` (103 bytes - scaffold description)
- **No existing framework, dependencies, services, or application code**
- **No package.json, configuration files, or CI/CD pipelines**
- **No database, authentication, or API infrastructure**

This is a clean slate - no migration needed, only fresh implementation.

## Technology Stack Decisions

Based on the requirements in Issue #1 (parent specification) and the Phase 1 acceptance criteria, the following technology choices have been made:

### Frontend: Next.js 14+ (App Router) with React 18+ and TypeScript 5+

**Rationale:**
- Native server components and streaming reduce client bundle size and improve initial load
- App Router provides built-in route groups, layouts, and server actions for cleaner data fetching
- First-class TypeScript support with strict type checking
- Excellent developer experience with hot module replacement, fast refresh, and Turbopack
- Built-in image optimization, font optimization, and middleware
- Vercel deployment with zero-config preview deployments
- Strong ecosystem and long-term support

### Backend: NestJS 10+ with TypeScript 5+

**Rationale:**
- Modular architecture with dependency injection matches the domain-driven structure of the app
- Built-in validation pipes, guards, interceptors, and exception filters reduce boilerplate
- First-class TypeScript support with decorators and metadata reflection
- Swagger/OpenAPI integration for automatic API documentation
- Testing utilities (TestModule, mock providers) simplify unit and integration tests
- Works well in a monorepo alongside Next.js
- Long-term support and active maintenance

### Database & ORM: PostgreSQL 15+ with Prisma ORM 5+

**Rationale:**
- PostgreSQL provides robust relational integrity, JSONB support, and advanced indexing
- Prisma offers type-safe database access with auto-generated TypeScript types from schema
- Migration system is declarative and version-controlled
- Prisma Client provides excellent autocomplete and compile-time query validation
- Supports connection pooling (PgBouncer) for serverless environments
- Strong ecosystem and community support

### Monorepo Tool: Turborepo 2+

**Rationale:**
- Fast, incremental builds with remote caching
- Simple `turbo.json` configuration
- Works natively with npm/yarn/pnpm workspaces
- Excellent CI integration (GitHub Actions, GitLab CI, etc.)
- Lightweight compared to Nx for this project's scope

### Authentication Strategy: JWT (Access + Refresh tokens) in httpOnly cookies with Argon2id password hashing

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

## Database Schema Design

Based on the functional requirements in Issue #1, the following domain models have been identified:

### Core Entities

1. **User** - Authentication and ownership
   - id, email (unique), passwordHash, name, avatarUrl, timestamps
   - Relations: projects, sections, tasks (assignee), labels, userSettings, subtasks

2. **Project** - Top-level task containers
   - id, name, description, color, icon, ownerId, timestamps
   - Relations: owner (User), sections, tasks
   - Cascade delete on owner deletion

3. **Section** - Organizational units within projects
   - id, name, position, projectId, timestamps
   - Relations: project, tasks
   - Indexed by projectId + position for ordering

4. **Task** - Core task entity
   - id, title, description, position, completed, dueDate, projectId, sectionId, assigneeId, timestamps
   - Relations: project, section, assignee (User), labels (via TaskLabel), subtasks
   - Indexed by projectId+sectionId+position and assigneeId

5. **Label** - Cross-project tagging
   - id, name, color, userId, timestamps
   - Unique constraint on (name, userId)
   - Relations: user, tasks (via TaskLabel)

6. **TaskLabel** - Many-to-many join table
   - id, taskId, labelId
   - Unique constraint on (taskId, labelId)

7. **Subtask** - Hierarchical task breakdown
   - id, title, completed, position, taskId, assigneeId, timestamps
   - Relations: parent task, assignee (User)
   - Indexed by taskId + position

8. **UserSettings** - User preferences
   - id, userId (unique), theme, notificationsEnabled, emailNotifications, timestamps
   - One-to-one with User

## Business Rules Summary

### Task Management
- Tasks require a non-empty title (server-side validated)
- Tasks belong to exactly one project
- Tasks may belong to one section within their project
- Tasks can have multiple labels
- Tasks can have subtasks (with reasonable nesting depth limit)
- Task completion is persistent and reflected across all views
- Tasks support P1-P4 priorities

### Project Management
- Projects belong to a single owner (User)
- Deleting a project cascades to its sections and tasks
- Archiving a project preserves tasks but hides from active views
- Projects can be reordered

### Inbox Rules
- Tasks without a project assignment are "Inbox tasks"
- Tasks assigned to a project are NOT Inbox tasks
- Inbox is a derived view, not a separate project entity

### Today View Rules
- Based on user's configured timezone
- Date-only due dates must appear on the correct local calendar date
- Must handle timezone conversion correctly (no day-shifting bugs)

### Upcoming View
- Chronological list grouped by date
- Distinguishes overdue, upcoming, and completed tasks
- Calendar-style presentation is a nice-to-have

### Subtasks
- Max nesting depth: 3 levels (configurable)
- Circular parent-child relationships prevented
- Deleting parent task: cascade delete subtasks (or reassign to project - TBD)

### Labels
- User-scoped (users cannot access other users' labels)
- Deleting a label removes only associations, not tasks

### Authentication & Authorization
- All user-owned resources scoped to authenticated user
- Server-side authorization on every mutation
- No client-only security checks

## Implementation Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Timezone handling bugs in Today/Upcoming views | High | High | Use date-fns-tz exclusively; store due dates as UTC midnight; test with multiple timezones |
| Circular subtask references | Medium | Medium | Validate on create/update; enforce max depth in service layer |
| Race conditions in task reordering | Medium | Medium | Use Prisma transactions; optimistic locking with version field |
| N+1 queries in task lists with labels/subtasks | High | Medium | Use Prisma include/select strategically; implement DataLoader pattern if needed |
| CSRF on cookie-based auth | Medium | High | SameSite=Lax + double-submit cookie for mutations; secure flags in production |
| Refresh token theft | Low | High | Rotation with reuse detection; short access token lifetime |
| Database migration conflicts in team env | Medium | Medium | Use Prisma migrate dev locally; migrate deploy in CI; review migrations in PR |

## Implementation Plan (Phased)

### Phase 1: Repository Assessment and Planning ✓ (This Issue)
- [x] Inspect repository
- [x] Identify existing stack (none - greenfield)
- [x] Define technology choices
- [x] Define database schema and business rules
- [x] Identify implementation risks
- [x] Create implementation plan

### Phase 2: Application Foundation (Issue #3)
- [ ] Establish project structure (Turborepo monorepo)
- [ ] Configure development tooling (ESLint, Prettier, Husky, TypeScript)
- [ ] Set up database connectivity and Prisma migrations
- [ ] Configure environment variables (.env.example)
- [ ] Implement shared UI foundation (Tailwind, Radix UI, design tokens)
- [ ] Establish API error handling and validation (Zod, class-validator)
- [ ] Set up automated testing (Jest, React Testing Library, Supertest)

### Phase 3: Core Task Management (Issue #4)
- [ ] Task CRUD API endpoints
- [ ] Task completion/reopening
- [ ] Priority assignment (P1-P4)
- [ ] Due dates with timezone handling
- [ ] Task list views with pagination
- [ ] Frontend task components and state management

### Phase 4: Organization (Issue #5)
- [ ] Projects CRUD
- [ ] Sections within projects
- [ ] Labels management
- [ ] Subtasks with nesting limits
- [ ] Task reassignment between projects/sections
- [ ] Manual ordering (drag-drop or position-based)

### Phase 5: Productivity Views (Issue #6)
- [ ] Inbox view (unassigned tasks)
- [ ] Today view (timezone-aware)
- [ ] Upcoming view (chronological)
- [ ] Completed tasks view
- [ ] Search functionality
- [ ] Filtering (status, priority, project, section, label, due date)
- [ ] Sorting (due date, priority, creation date, alphabetical, manual)
- [ ] Grouping (due date, priority, project, section)

### Phase 6: Authentication and Settings (Issue #7)
- [ ] User registration/login/logout
- [ ] JWT in httpOnly cookies with refresh rotation
- [ ] Argon2id password hashing
- [ ] Protected routes (frontend + backend)
- [ ] User settings (theme, timezone, start of week, default priority)
- [ ] Server-side authorization on all mutations

### Phase 7: Quality and Polish (Issue #8)
- [ ] Responsive design (mobile, tablet, laptop, desktop)
- [ ] Loading, empty, and error states
- [ ] Accessibility (semantic HTML, keyboard nav, focus indicators, contrast)
- [ ] Meaningful automated tests (unit, integration, E2E)
- [ ] Performance optimization
- [ ] Security audit

### Phase 8: Final Verification and Documentation (Issue #8)
- [ ] Run complete application
- [ ] Verify critical workflows
- [ ] Fix implementation errors
- [ ] Confirm documented commands work
- [ ] Update README with architecture, setup, commands
- [ ] Summarize completed features and limitations

## Acceptance Criteria for This Phase

- [x] Technology stack documented with rationale
- [x] Database schema defined with all required entities
- [x] Business rules captured
- [x] Implementation risks identified with mitigations
- [x] Phased implementation plan created
- [x] Ready to proceed to Phase 2 implementation

## Next Steps

1. **Proceed to Phase 2** - Set up the monorepo structure, tooling, and database
2. **Create AGENTS.md** - Document project conventions for future AI agents
3. **Initialize Turborepo** - Create package.json workspaces, turbo.json
4. **Set up Next.js and NestJS apps** - With TypeScript, ESLint, Prettier
5. **Configure Prisma** - With the schema defined above
6. **Set up Docker Compose** - For local PostgreSQL development

---

*This assessment was created as part of Issue #10 - Repository Assessment and Tech-Stack Decision*
