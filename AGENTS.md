# AGENTS.md - Project Conventions for AI Agents

## Project Overview

This is a Todoist-inspired task management application built as a monorepo with:
- **Frontend**: Next.js 14+ (App Router) with React 18+ and TypeScript 5+
- **Backend**: NestJS 10+ with TypeScript 5+
- **Database**: PostgreSQL 15+ with Prisma ORM 5+
- **Monorepo**: Turborepo 2+
- **Auth**: JWT in httpOnly cookies with Argon2id password hashing

## Repository Structure

```
test-todo-list-with-factory/
├── apps/
│   ├── web/          # Next.js frontend
│   └── api/          # NestJS backend
├── packages/
│   └── ui/           # Shared UI components
├── docs/
│   └── architecture/
│       └── tech-stack.md  # Technology decisions
├── turbo.json        # Turborepo configuration
├── package.json      # Root package.json with workspaces
├── docker-compose.yml
└── .env.example
```

## Development Commands

```bash
# Install dependencies
npm install

# Start development servers (both web and api)
npm run dev

# Build all packages
npm run build

# Run linting
npm run lint

# Run tests
npm run test

# Format code
npm run format

# Database commands (run from apps/api)
npm run db:generate   # Generate Prisma client
npm run db:push       # Push schema to database
npm run db:migrate    # Run migrations
npm run db:studio     # Open Prisma Studio
```

## Code Style Conventions

### TypeScript
- Use strict mode
- Prefer interfaces over types for object shapes
- Use `type` for unions, intersections, and utility types
- Avoid `any` - use `unknown` when type is truly unknown
- Use meaningful generic type parameters

### React/Next.js
- Use React Server Components by default
- Use `'use client'` directive only when needed (interactivity, hooks, browser APIs)
- Prefer server actions for mutations
- Use TanStack Query for client-side data fetching
- Component files: PascalCase (`TaskCard.tsx`)
- Utility files: camelCase (`dateUtils.ts`)

### NestJS
- Use modular architecture (feature modules)
- Controllers: thin, only HTTP concerns
- Services: business logic
- Use DTOs with class-validator for validation
- Use guards for authentication/authorization
- Use interceptors for response transformation
- Use pipes for validation/transformation

### Database (Prisma)
- Use singular model names (`User`, not `Users`)
- Use `@@map` for table names (snake_case)
- Use `@id @default(cuid())` for primary keys
- Use `@@unique` and `@@index` for constraints
- Relations: use explicit relation names when multiple relations to same model

### Naming Conventions
- Files: kebab-case for configs, PascalCase for components, camelCase for utilities
- Variables/functions: camelCase
- Classes/Interfaces/Types: PascalCase
- Constants: UPPER_SNAKE_CASE
- Database columns: snake_case (via `@@map`)

## API Design

### RESTful Endpoints
- Use plural nouns: `/api/projects`, `/api/tasks`
- Use HTTP verbs correctly: GET, POST, PATCH, DELETE
- Version in URL: `/api/v1/` (future-proofing)
- Nested resources: `/api/projects/:projectId/tasks`

### Response Format
```typescript
// Success
{ data: T, meta?: Meta }

// Error
{ error: { message: string, code: string, details?: any } }
```

### Validation
- Backend: class-validator + Zod schemas
- Frontend: Zod schemas shared with backend
- Both client and server validation required

## Authentication

### Token Strategy
- Access token: 15 minutes, in httpOnly cookie
- Refresh token: 7 days, in httpOnly cookie, rotated on use
- Both cookies: Secure, SameSite=Lax, HttpOnly

### Protected Routes
- All mutating endpoints require authentication
- All user-scoped data requires ownership verification
- Use guards: `JwtAuthGuard`, `RolesGuard` (if needed)

## Database Conventions

### Migrations
- Always use `prisma migrate dev` for local development
- Use `prisma migrate deploy` in CI/CD
- Review generated migrations before committing
- Never edit applied migrations

### Seeding
- Seed file: `prisma/seed.ts`
- Run with `npm run db:seed`
- Only seed development data

## Testing

### Unit Tests
- Test business logic in services
- Use Jest with `ts-jest`
- Mock external dependencies (Prisma, HTTP clients)
- Test file: `*.spec.ts` alongside source

### Integration Tests
- Test API endpoints with Supertest
- Use test database (separate from dev)
- Test file: `*.e2e-spec.ts` in `test/` directory

### Frontend Tests
- Use React Testing Library
- Test user interactions, not implementation
- Test file: `*.spec.tsx` alongside component

## Git Workflow

### Branches
- `main` - production ready
- `openhands/issue-{N}` - feature branches for issues
- `feature/*` - manual feature branches

### Commits
- Conventional commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`
- One logical change per commit
- Reference issue numbers: `feat: add task creation (#10)`

### Pull Requests
- Draft PR for work in progress
- Ready for review when all checks pass
- Require at least 1 approval
- Squash and merge

## Environment Variables

### Required (.env.example)
```
DATABASE_URL=postgresql://user:pass@localhost:5432/db
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
CORS_ORIGIN=http://localhost:3000
PORT=4000
```

### Frontend (apps/web/.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

## Common Patterns

### Error Handling
```typescript
// Backend - use built-in exception filters
throw new BadRequestException('Invalid input');
throw new NotFoundException('Task not found');
throw new ForbiddenException('Access denied');

// Frontend - handle in TanStack Query error boundaries
```

### Database Transactions
```typescript
await this.prisma.$transaction(async (tx) => {
  const task = await tx.task.create({ data });
  await tx.subtask.createMany({ data: subtasks.map(s => ({ ...s, taskId: task.id })) });
});
```

### Timezone Handling
- Store all dates as UTC in database
- Use `date-fns-tz` for user timezone conversions
- Today view: filter by user's local date
- Due dates: store as UTC midnight, display in user timezone

## Performance Guidelines

- Use Prisma `select`/`include` to avoid over-fetching
- Implement pagination (cursor or offset) for lists
- Use TanStack Query caching and deduplication
- Implement virtual scrolling for large lists
- Use React.memo for expensive components

## Security Checklist

- [ ] All user inputs validated on backend
- [ ] No secrets in code (use environment variables)
- [ ] Passwords hashed with Argon2id
- [ ] JWT tokens in httpOnly cookies
- [ ] CSRF protection on mutations
- [ ] Rate limiting on auth endpoints
- [ ] CORS configured properly
- [ ] SQL injection prevented (Prisma parameterized queries)
- [ ] XSS prevented (React auto-escaping, no dangerouslySetInnerHTML)

## Accessibility

- Semantic HTML elements
- Keyboard navigation for all interactive elements
- Visible focus indicators
- ARIA labels where needed
- Sufficient color contrast (WCAG AA)
- Screen reader friendly

## Documentation

- Update README.md with setup instructions
- Document API with Swagger (auto-generated)
- Document complex business logic in code comments
- Keep AGENTS.md current with conventions

---

*This file should be updated as the project evolves. Last updated: Issue #10 implementation*