# Task Management App

A full-stack Task Management application built with **Node.js + Express + PostgreSQL** on the backend and **React (Vite)** on the frontend. Users can register, log in, and manage their own tasks (create, edit, delete, and toggle status), with all data scoped per-user via JWT authentication.

---

## Tech Stack

**Backend**
- Node.js + Express
- PostgreSQL (raw `pg` driver, no ORM — parameterized queries throughout)
- JWT authentication (`jsonwebtoken`)
- Password hashing with `bcrypt`

**Frontend**
- React + Vite (plain JavaScript)
- React Router for client-side routing
- Axios for API requests
- Plain CSS (no framework)

**Infrastructure**
- Docker & Docker Compose (3 services: `postgres`, `backend`, `frontend`)

---

## Project Structure

```
Task-Management/
├── backend/
│   ├── src/
│   │   ├── config/        # PostgreSQL connection pool
│   │   ├── controllers/   # Auth & task business logic
│   │   ├── db/migrations/ # SQL schema
│   │   ├── middleware/    # JWT auth guard, centralized error handler
│   │   └── routes/        # Express route definitions
│   ├── Dockerfile
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api/           # Axios instance + endpoint functions
│   │   ├── components/    # TaskForm, ConfirmModal
│   │   ├── context/       # AuthContext (JWT/user state)
│   │   ├── pages/         # Login, Register, Dashboard
│   │   └── routes/        # ProtectedRoute
│   └── Dockerfile
└── docker-compose.yml
```

---

## Running the Project

There are two ways to run this project: with Docker (recommended, no local setup needed) or running each service manually.

### Option A — Docker (recommended)

**Prerequisites:** Docker Desktop installed and running.

From the project root:

```bash
docker compose up --build
```

This starts all three services:

| Service    | URL                          |
|------------|-------------------------------|
| Frontend   | http://localhost:5173         |
| Backend    | http://localhost:4000         |
| PostgreSQL | localhost:5433 (host-mapped)  |

The database schema is created automatically on first run — no manual migration step needed.

Once the containers are up, open **http://localhost:5173** in your browser.

To stop the app:
```bash
docker compose down
```
(This keeps your data. Add `-v` only if you want to wipe the database as well.)

If you change a dependency in either `package.json`, rebuild that service without cache to avoid stale dependency issues:
```bash
docker compose build --no-cache backend   # or frontend
```

### Option B — Running manually (without Docker)

**Prerequisites:** Node.js 20+, a running local PostgreSQL instance.

**1. Backend**

```bash
cd backend
npm install
```

Create a `.env` file in `backend/` (see `.env.example`):
```
PORT=4000
DATABASE_URL=postgresql://<user>:<password>@localhost:5432/task_management
JWT_SECRET=<a long random string>
```

Create the database and run the schema manually:
```bash
psql -U postgres -c "CREATE DATABASE task_management;"
psql -U postgres -d task_management -f src/db/migrations/001_init.sql
```

Start the server:
```bash
npm run dev
```
Backend runs on **http://localhost:4000**.

**2. Frontend**

In a separate terminal:
```bash
cd frontend
npm install
```

Create a `.env` file in `frontend/`:
```
VITE_API_URL=http://localhost:4000/api
```

Start the dev server:
```bash
npm run dev
```
Frontend runs on **http://localhost:5173**.

---

## How to Log In

This app has no pre-seeded accounts — you create your own:

1. Open **http://localhost:5173** (redirects to `/login`).
2. Click **Register**, and create an account with a username and a password (minimum 6 characters).
3. You'll be redirected to the login page — log in with the credentials you just created.
4. You'll land on the Dashboard, where you can add, edit, delete, and toggle the status of your own tasks.

Each user only ever sees their own tasks — this is enforced on the backend by scoping every task query to the `user_id` decoded from your JWT, not by anything the frontend sends.

---

## API Endpoints

Base URL: `http://localhost:4000/api`

| Method | Endpoint          | Auth required | Body                                  | Notes                                                  |
|--------|-------------------|:--:|----------------------------------------|---------------------------------------------------------|
| GET    | `/health`         | No | —                                      | Returns `{ status: "ok" }`                              |
| POST   | `/auth/register`  | No | `{ username, password }`               | Password must be ≥ 6 characters. `409` if username taken. |
| POST   | `/auth/login`     | No | `{ username, password }`               | Returns `{ token, user }`. `401` on bad credentials.     |
| GET    | `/tasks`          | Yes | —                                      | Returns `{ tasks: [...] }` for the logged-in user, newest first. |
| POST   | `/tasks`          | Yes | `{ title, description?, status? }`     | `status` defaults to `TODO`. Returns `{ task: {...} }`. |
| PUT    | `/tasks/:id`      | Yes | `{ title?, description?, status? }`    | Partial update. Returns `{ task: {...} }`. `404` if not found/not yours. |
| DELETE | `/tasks/:id`      | Yes | —                                      | Returns `{ message: "..." }`. `404` if not found/not yours. |

**Authenticated requests** must include:
```
Authorization: Bearer <jwt_token>
```

**Error responses** are shaped as `{ error: "<message>" }`.

---

## Notes on Implementation Choices

- **No ORM** — raw `pg` with parameterized queries was used deliberately for transparency and to avoid SQL-injection risk without relying on an abstraction layer.
- **Ownership enforcement happens at the SQL level** (`WHERE user_id = $1` using the ID from the verified JWT), not just in application logic.
- **Search and pagination** (bonus features) are implemented client-side in the frontend, filtering/paginating the already-fetched task list — a reasonable trade-off for the expected scale of this app, though a production version would move both to the backend as query parameters.

---

## Bonus Features Implemented

- Search (client-side task filtering)
- Pagination (client-side, 5 tasks per page)
- ESLint + Prettier (frontend)
- Responsive layout
- Custom dark-theme styling across all pages
