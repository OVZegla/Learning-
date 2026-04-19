# Learning+

E-learning platform with role-based access control. Admins and formateurs publish courses; apprenants see only the courses they've been granted access to.

## Stack

- **Backend**: NestJS (TypeScript), Prisma, PostgreSQL, JWT auth (access + refresh)
- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS
- **Infra**: Docker Compose (db + backend + frontend)

## Architecture

```
┌──────────────┐      HTTPS/JSON      ┌───────────────┐      SQL      ┌──────────────┐
│  Next.js UI  │ ───────────────────► │  NestJS API   │ ────────────► │  PostgreSQL  │
│  (frontend)  │ ◄─── JWT cookies ─── │  (backend)    │               │              │
└──────────────┘                      └───────────────┘               └──────────────┘
```

- The backend exposes a REST API under `/api`.
- Auth is JWT-based with short-lived access tokens and refresh tokens.
- Authorization is enforced by two layers:
  1. **Role guard**: `ADMIN`, `FORMATEUR`, `APPRENANT`.
  2. **Enrollment guard**: apprenants can only read courses they are enrolled in (directly or through a group).

## Domain model

- `User` — account with one role
- `Group` — optional cohort (e.g. company, classroom)
- `Course` → `Module` → `Lesson` (ordered, drag-and-droppable)
- `Lesson` has a `type` (VIDEO, TEXT, PDF, IMAGE, QUIZ) and content
- `Enrollment` — grants a user (or group) access to a course, optionally time-bounded
- `Progress` — per-user completion state per lesson
- `Quiz` / `Question` / `Answer` — assessments
- `Certificate` — issued when course conditions are met

The Prisma schema in `backend/prisma/schema.prisma` covers all of these so later features (progression, quizzes, certifications, notifications) can build on the same DB without migrations re-shuffling.

## Running locally

### With Docker (recommended)

```bash
docker compose up --build
```

- Frontend: http://localhost:3000
- API: http://localhost:4000
- Postgres: localhost:5432 (user `learning`, pw `learning`)

The container runs `prisma migrate deploy` on startup. To seed demo data:

```bash
docker compose exec backend npm run seed
```

Default admin: `admin@learning.local` / `admin123` (change immediately).

### Without Docker

```bash
# 1. Postgres running on localhost:5432
cd backend
cp .env.example .env
npm install
npx prisma migrate dev
npm run seed
npm run start:dev

# in another terminal
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

## Updating the logo

The logo ships at `frontend/public/logo.svg` and is rendered by `<Logo />` (`frontend/src/components/Logo.tsx`). Replace the file in place (any format — svg/png/webp) and, if the filename/extension changes, update the one `src="/logo.svg"` line in `Logo.tsx`. Nothing else to touch.

## What's implemented

- [x] Auth: register, login, refresh, me, logout
- [x] Roles: ADMIN / FORMATEUR / APPRENANT
- [x] Courses + modules + lessons CRUD (formateur/admin)
- [x] Enrollment management (admin): assign/revoke per user or group, with optional expiry
- [x] Access enforcement: apprenants can only access enrolled courses
- [x] Frontend: login, register, dashboard (my courses), course viewer, admin users/enrollments
- [x] Docker Compose for one-command boot

## What's stubbed or left for follow-up

The Prisma schema and module scaffolding are in place for these, but the business logic / UI is not built yet:

- Quizzes (schema exists, grading endpoint TODO)
- Progress tracking (model exists, automatic marking TODO)
- Certificates (PDF generation TODO)
- Notifications (email + in-app)
- Payments
- Multi-tenant organizations
- Video streaming / signed URLs
- Recommendations / badges / leaderboard
