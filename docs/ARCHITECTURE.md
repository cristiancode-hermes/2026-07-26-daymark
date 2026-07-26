# Daymark — Architecture

## Overview

Daymark is a daily reflection & mood journal application built with Angular 22 (frontend) and NestJS 11 (backend) in a monorepo structure.

## Stack

| Layer | Technology | Notes |
|-------|------------|-------|
| Frontend | Angular 22 | Standalone, zoneless, signals, CSS variables theming |
| Backend | NestJS 11 | Modular, TypeORM, Swagger |
| Database | SQLite (dev) / PostgreSQL (prod) | TypeORM ORM, Neon-ready |
| Auth | JWT + Passport + bcryptjs | Stateless, 7-day tokens |

## Project Structure

```
daymark/
├── apps/
│   ├── api/                     # NestJS backend
│   │   ├── src/
│   │   │   ├── main.ts          # Entry point, Swagger, CORS
│   │   │   ├── app.module.ts    # Root module
│   │   │   ├── auth/            # Auth module (JWT, Passport)
│   │   │   ├── users/           # User entity & service
│   │   │   ├── entries/         # Journal entries CRUD
│   │   │   ├── tags/            # Tag management
│   │   │   ├── prompts/         # Daily reflection prompts
│   │   │   ├── insights/        # Mood statistics
│   │   │   ├── goals/           # Writing goals
│   │   │   └── seed/            # Database seeder
│   │   ├── data/                # SQLite database files
│   │   ├── tsconfig.json
│   │   └── package.json
│   └── web/                     # Angular frontend
│       └── src/
│           ├── app/
│           │   ├── interfaces/  # TypeScript interfaces
│           │   ├── services/    # HTTP services
│           │   ├── interceptors/# HTTP interceptors
│           │   ├── guards/      # Route guards
│           │   ├── shared/      # Reusable components
│           │   ├── pages/       # Route pages
│           │   ├── app.config.ts
│           │   ├── app.routes.ts
│           │   └── app.component.ts
│           ├── styles.css       # Design system CSS vars
│           └── index.html
├── docs/                        # Documentation
├── package.json                 # Root workspace config
└── .gitignore
```

## Data Flow

1. User authenticates via JWT (stored in localStorage)
2. Frontend makes API calls with Bearer token via auth interceptor
3. Backend validates JWT via Passport strategy
4. TypeORM handles database operations
5. Dashboard loads 5 parallel API calls for instant overview

## Key Design Decisions

- **Signals over Subjects**: Component state uses signal() for better performance with zoneless change detection
- **Three-signal state triad**: Each page uses loading/error/data signals independently
- **CSS variables theming**: Dark/light mode controlled via `data-theme` attribute on `<html>`
- **Monthly calendar via API**: Calendar data fetched per-month with mood info
- **Streak via SQL**: PostgreSQL window functions or SQLite date arithmetic
