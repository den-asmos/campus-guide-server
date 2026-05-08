# Campus Guide — Server

Express 5 REST API for the university Campus Guide. Handles authentication, classroom data, indoor navigation (Dijkstra pathfinding), and timetable parsing from VSU spreadsheets.

## Tech Stack

| Category          | Library                                              |
| ----------------- | ---------------------------------------------------- |
| Runtime           | Node.js + TypeScript                                 |
| Framework         | Express 5                                            |
| ORM               | Sequelize 6 + PostgreSQL (`pg`)                      |
| Authentication    | Passport.js (local + JWT strategies)                 |
| Validation        | Joi (request schemas) + Zod (internal graph schemas) |
| Email             | Nodemailer                                           |
| Image storage     | Cloudinary + Multer                                  |
| Timetable parsing | SheetJS (xlsx)                                       |
| Logging           | Winston                                              |
| Rate limiting     | express-rate-limit                                   |
| Password hashing  | bcryptjs                                             |

## Project Structure

```
src/
├── controllers/     # Thin Express handlers — call services, return responses
├── errors/          # AppError class
├── middlewares/     # auth, validate, role, error, rate-limiter, image-upload
├── models/          # Sequelize models: User, Classroom, PasswordReset
├── repositories/    # Data access: BaseRepository + domain-specific extensions
├── routes/          # Route definitions wiring controllers to middlewares
├── schemas/         # Joi request validation schemas
├── services/        # Business logic (injected via constructors)
└── utils/
    ├── direction/   # Dijkstra pathfinder with MinHeap; graph cache
    └── timetable/   # Scheduler, downloader, parser, filter, cache

graph/
├── floors/          # Per-floor connector node JSON files
└── locationLinks.json  # Edges linking classroom names to connector nodes

data/
└── classroom.csv    # Seed data for the Classroom table

downloads/           # Cached timetable XLSX files (runtime, gitignored)
```

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL instance

### Install

```bash
npm install
```

### Environment

Create `server/.env`:

```env
PORT=7070

DB_NAME=navigator
DB_USER=postgres
DB_PASSWORD=secret

JWT_SECRET=your_secret
JWT_ISSUER=navigator

SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=user@example.com
SMTP_PASSWORD=smtp_password

CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret

TIMETABLE_URL=https://vsu.by/...

LOG_LEVEL=info
```

### Run

```bash
npm run dev        # tsx watch — hot reload
npm run build      # tsc → dist/
npm run typecheck  # tsc --noEmit
npm start          # node dist/index.js (MODE=production)
```

On startup the server syncs Sequelize models and runs `ClassroomSeeder`, which seeds from `data/classroom.csv` only if the `classrooms` table is empty.

## Architecture

The server follows a layered pattern: **Routes → Controllers → Services → Repositories → Models**.

Dependencies are injected via constructors — services receive their repositories at instantiation time, keeping layers decoupled.

### Authentication

Two Passport strategies:

- **local** — validates email/password and issues a signed JWT
- **jwt** — verifies the Bearer token on protected routes

### Indoor Navigation

`DirectionService` builds a weighted in-memory graph from floor connector JSON files and `locationLinks.json`, then runs Dijkstra's algorithm (custom `MinHeap`) to find the shortest path between two locations. The result is segmented into per-floor polylines by `groupByFloor`. Floor-change penalties are applied in `utils/direction/penalties.ts`. The graph is cached and invalidated via `invalidateCache()`.

### Timetable

`TimetableScheduler` periodically downloads XLSX files from `TIMETABLE_URL`. `TimetableParser` extracts lesson rows; `TimetableFilter` narrows them by group, lecturer, or classroom. All results are held in `TimetableCache` — no database table is used.

## API Overview

| Prefix                | Description                         |
| --------------------- | ----------------------------------- |
| `POST /api/auth/...`  | Register, login, password reset     |
| `GET /api/classrooms` | List / search classrooms            |
| `GET /api/direction`  | Shortest path between two locations |
| `GET /api/timetable`  | Filter timetable entries            |
| `GET /api/users/me`   | Current user profile                |
| `PATCH /api/users/me` | Update profile / avatar             |
