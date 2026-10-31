# Todoist-Inspired Task Management Application

A modern, production-oriented task management application inspired by Todoist, built as a Turborepo monorepo with Next.js, NestJS, and PostgreSQL.

## Architecture Overview

```
test-todo-list-with-factory/
├── apps/
│   ├── web/          # Next.js 14+ Frontend (App Router, React 18+, TypeScript 5+)
│   └── api/          # NestJS 10+ Backend (TypeScript 5+)
├── packages/
│   └── ui/           # Shared UI Components
├── docs/
│   └── architecture/
│       └── tech-stack.md  # Technology decisions and rationale
├── turbo.json        # Turborepo configuration
├── package.json      # Root package.json with workspaces
├── docker-compose.yml
└── .env.example
```

## Technology Stack

### Frontend
- **Next.js 14+** with App Router and React Server Components
- **React 18+** with TypeScript 5+
- **TanStack Query v5** for server state management
- **Tailwind CSS v3** + CSS Variables for styling
- **Radix UI** for accessible headless primitives
- **React Hook Form** + Zod for form validation

### Backend
- **NestJS 10+** with modular architecture
- **TypeScript 5+** with strict mode
- **Prisma ORM 5+** for type-safe database access
- **class-validator** + **Zod** for validation
- **Swagger/OpenAPI** for API documentation
- **JWT** in httpOnly cookies with Argon2id password hashing

### Database
- **PostgreSQL 15+** with Prisma ORM

### Tooling
- **Turborepo 2+** for monorepo management
- **ESLint** + **Prettier** + **Husky** + **lint-staged**
- **Jest** + **React Testing Library** + **Supertest** + **Playwright**
- **Docker** + **docker-compose** for local development

## Quick Start

### Prerequisites
- Node.js 20+
- npm 10+
- Docker (for PostgreSQL)

### Installation

```bash
# Clone the repository
git clone https://github.com/ali-ahadi1105/test-todo-list-with-factory.git
cd test-todo-list-with-factory

# Install dependencies
npm install

# Start PostgreSQL database
docker-compose up -d

# Copy environment variables
cp .env.example .env
# Edit .env with your configuration

# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Start development servers (both web and api)
npm run dev
```

### Development Commands

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
npm run db:seed       # Seed development data
```

## Environment Variables

### Backend (Root `.env`)

```bash
# Application
NODE_ENV=development
PORT=4000

# Database
DATABASE_URL="postgresql://todo_user:todo_password@localhost:5432/todo_db?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key-min-32-chars-long"
JWT_EXPIRES_IN="7d"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-min-32-chars-long"
JWT_REFRESH_EXPIRES_IN="30d"

# CORS
CORS_ORIGIN="http://localhost:3000"

# Security
BCRYPT_SALT_ROUNDS=12
```

### Frontend (`apps/web/.env.local`)

```bash
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

## API Documentation

Once the development server is running, access the Swagger UI at:
- **API**: http://localhost:4000/api/docs
- **Web**: http://localhost:3000

## Database Schema

The application uses the following core entities:

- **User** - Authentication and ownership
- **Project** - Top-level task containers
- **Section** - Organizational units within projects
- **Task** - Core task entity with priorities (P1-P4), due dates, subtasks
- **Label** - Cross-project tagging
- **Subtask** - Hierarchical task breakdown
- **UserSettings** - User preferences (theme, timezone, etc.)

## Features Implemented

### Core Task Management
- ✅ Task creation, editing, completion, reopening, deletion
- ✅ Priority levels (P1-P4) with accessible indicators
- ✅ Due dates with timezone-aware handling
- ✅ Task lists with pagination

### Organization
- ✅ Projects with colors and descriptions
- ✅ Sections within projects
- ✅ Labels for cross-project organization
- ✅ Subtasks with nesting limits (max 3 levels)

### Productivity Views
- ✅ Inbox (unassigned tasks)
- ✅ Today view (timezone-aware)
- ✅ Upcoming view (chronological)
- ✅ Completed tasks view
- ✅ Search, filtering, sorting, grouping

### Authentication & Settings
- ✅ User registration, login, logout
- ✅ JWT in httpOnly cookies with refresh token rotation
- ✅ Argon2id password hashing
- ✅ Protected routes (frontend + backend)
- ✅ User settings (theme, timezone, start of week, default priority)

### Quality & Polish
- ✅ Responsive design (mobile, tablet, laptop, desktop)
- ✅ Loading, empty, and error states
- ✅ Accessibility (semantic HTML, keyboard nav, focus indicators, WCAG AA contrast)
- ✅ Automated tests (unit, integration)
- ✅ ESLint + Prettier code formatting

## Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Building for Production

```bash
# Build all packages
npm run build
```

## Docker Deployment

```bash
# Build and start all services
docker-compose up --build -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Project Structure Details

### Frontend (`apps/web`)
```
apps/web/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── dashboard/          # Dashboard pages (protected)
│   │   ├── globals.css         # Global styles with Tailwind
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Landing page
│   │   └── providers.tsx       # Context providers
│   ├── components/             # React components
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Utilities and configurations
│   ├── test-setup.ts           # Jest test setup
│   └── types/                  # TypeScript types
├── package.json
├── tsconfig.json
├── next.config.js
└── tailwind.config.js
```

### Backend (`apps/api`)
```
apps/api/
├── src/
│   ├── app.module.ts           # Root module
│   ├── main.ts                 # Application entry point
│   ├── common/                 # Shared utilities
│   │   ├── decorators/         # Custom decorators
│   │   ├── filters/            # Exception filters
│   │   ├── guards/             # Auth guards
│   │   ├── interceptors/       # Response interceptors
│   │   └── pipes/              # Validation pipes
│   ├── config/                 # Configuration modules
│   ├── modules/                # Feature modules
│   │   ├── auth/               # Authentication
│   │   ├── labels/             # Labels management
│   │   ├── projects/           # Projects management
│   │   ├── sections/           # Sections management
│   │   ├── tasks/              # Tasks management
│   │   └── users/              # Users management
│   └── prisma/                 # Prisma service
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── seed.ts                 # Database seeding
├── test/                       # Integration tests
├── package.json
└── tsconfig.json
```

## Git Workflow

### Branches
- `main` - Production ready
- `openhands/issue-{N}` - Feature branches for issues
- `feature/*` - Manual feature branches

### Commits
- Conventional commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`
- One logical change per commit
- Reference issue numbers: `feat: add task creation (#10)`

### Pull Requests
- Draft PR for work in progress
- Ready for review when all checks pass
- Require at least 1 approval
- Squash and merge

## Known Limitations

1. **Natural Language Date Parsing** - Quick add supports basic shortcuts ("today", "tomorrow", "next monday") but full natural language parsing is not implemented
2. **Calendar View** - Upcoming view uses a chronological list; calendar-style presentation is not implemented
3. **Notifications/Reminders** - Data model and service boundaries defined, but delivery infrastructure not implemented
4. **Real-time Updates** - WebSocket/SSE for real-time collaboration not implemented
5. **File Attachments** - Task file attachments not supported

## Security Measures

- ✅ All user inputs validated on backend (class-validator + Zod)
- ✅ No secrets in code (environment variables only)
- ✅ Passwords hashed with Argon2id (memory-hard, GPU-resistant)
- ✅ JWT tokens in httpOnly, Secure, SameSite=Lax cookies
- ✅ CSRF protection via double-submit cookie pattern
- ✅ Rate limiting on auth endpoints
- ✅ CORS configured properly
- ✅ SQL injection prevented (Prisma parameterized queries)
- ✅ XSS prevented (React auto-escaping, no dangerouslySetInnerHTML)
- ✅ Server-side authorization on all mutations

## Accessibility

- ✅ Semantic HTML elements
- ✅ Keyboard navigation for all interactive elements
- ✅ Visible focus indicators
- ✅ ARIA labels where needed
- ✅ Sufficient color contrast (WCAG AA)
- ✅ Screen reader friendly controls
- ✅ Non-color indicators for task priority and completion

## License

This project is part of the OpenHands Software Factory end-to-end test.
