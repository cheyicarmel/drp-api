# DrP API — Driven Projects

REST API for **Driven Projects**, a personal project management application and headless CMS for an external portfolio.

Built with **Node.js / Express / TypeScript / Prisma 7 / PostgreSQL**.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
  - [Auth](#auth)
  - [Projects](#projects)
  - [Tasks](#tasks)
  - [Subtasks](#subtasks)
  - [Stats](#stats)
  - [Upload](#upload)
  - [Public](#public)
- [Error Format](#error-format)

---

## Overview

DrP API serves two purposes:

1. **Private back-office** — Full CRUD for projects, tasks and subtasks, protected by JWT authentication.
2. **Public portfolio endpoint** — Exposes only published projects (`isPublic = true`) to be consumed by an external portfolio without authentication.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Language | TypeScript |
| ORM | Prisma 7 |
| Database | PostgreSQL |
| Auth | JWT + bcryptjs |
| File storage | Cloudinary |
| File upload | Multer (memory storage) |

---

## Getting Started

```bash
# Clone the repository
git clone https://github.com/your-username/drp-api.git
cd drp-api

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Fill in your values (see Environment Variables section)

# Run database migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# Start development server
npm run dev
```

Server runs on `http://localhost:5000` by default.

---

## Environment Variables

Create a `.env` file at the root of the project:

```env
DATABASE_URL=""
JWT_SECRET=""
PORT=5000

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

> `.env` is not committed to version control. Never expose these values publicly.

---

## API Reference

### Base URL

```
http://localhost:5000/api
```

### Authentication

All private routes require a Bearer token in the `Authorization` header:

```
Authorization: Bearer <jwt_token>
```

The token is obtained from `POST /api/auth/login`.

---

### Auth

#### `POST /api/auth/register`
Create the user account. Intended for one-time use.

**Body**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "yourpassword"
}
```

**Response `201`**
```json
{
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2025-01-01T00:00:00.000Z"
  },
  "token": "eyJ..."
}
```

---

#### `POST /api/auth/login`
Authenticate and retrieve a JWT token.

**Body**
```json
{
  "email": "john@example.com",
  "password": "yourpassword"
}
```

**Response `200`**
```json
{
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2025-01-01T00:00:00.000Z"
  },
  "token": "eyJ..."
}
```

---

#### `GET /api/auth/me`
🔒 **Protected** — Returns the authenticated user's information.

**Response `200`**
```json
{
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

---

### Projects

#### `GET /api/projects`
🔒 **Protected** — Returns a paginated list of projects.

**Query Parameters**

| Parameter | Type | Description |
|---|---|---|
| `status` | string | Filter by status: `IDEA`, `IN_PROGRESS`, `DONE`, `ON_HOLD` |
| `priority` | string | Filter by priority: `LOW`, `MEDIUM`, `HIGH` |
| `page` | number | Page number (default: `1`) |
| `limit` | number | Items per page (default: `10`, max: `50`) |

**Response `200`**
```json
{
  "projects": [...],
  "pagination": {
    "total": 24,
    "page": 1,
    "limit": 10,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

#### `GET /api/projects/:id`
🔒 **Protected** — Returns a single project with its tasks and subtasks.

**Response `200`**
```json
{
  "project": {
    "id": "uuid",
    "title": "My Project",
    "description": "...",
    "status": "IN_PROGRESS",
    "priority": "HIGH",
    "estimatedHours": 20,
    "isPublic": false,
    "githubUrl": "https://github.com/...",
    "demoUrl": "https://...",
    "techStack": "React, Node.js, PostgreSQL",
    "context": "...",
    "imageUrl": "https://res.cloudinary.com/...",
    "images": "https://res.cloudinary.com/...,https://res.cloudinary.com/...",
    "githubDisabled": false,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z",
    "tasks": [
      {
        "id": "uuid",
        "title": "Task title",
        "status": "TODO",
        "position": 0,
        "subtasks": [...]
      }
    ]
  }
}
```

---

#### `POST /api/projects`
🔒 **Protected** — Create a new project.

**Body**
```json
{
  "title": "My Project",
  "description": "Optional description",
  "status": "IDEA",
  "priority": "MEDIUM",
  "estimatedHours": 20,
  "techStack": "React, Node.js",
  "githubUrl": "https://github.com/...",
  "demoUrl": "https://...",
  "context": "...",
  "imageUrl": "https://res.cloudinary.com/...",
  "githubDisabled": false
}
```

> Only `title` is required. `status` defaults to `IDEA`, `priority` defaults to `MEDIUM`.

**Response `201`**
```json
{
  "project": { ... }
}
```

---

#### `PATCH /api/projects/:id`
🔒 **Protected** — Update a project. All fields are optional.

**Body** — same fields as `POST /api/projects`

**Response `200`**
```json
{
  "project": { ... }
}
```

---

#### `PATCH /api/projects/:id/publish`
🔒 **Protected** — Toggle `isPublic` between `true` and `false`.

**Business rules (publishing only):**
- Project `status` must be `IN_PROGRESS` or `DONE`
- `techStack` must be filled in

**Response `200`**
```json
{
  "project": { ... }
}
```

**Error `400`**
```json
{
  "error": "La stack technique est requise avant de publier",
  "code": "MISSING_PORTFOLIO_FIELDS"
}
```

---

#### `DELETE /api/projects/:id`
🔒 **Protected** — Delete a project and all its tasks and subtasks (cascade).

**Response `200`**
```json
{
  "message": "Projet supprimé avec succès"
}
```

---

### Tasks

Base path: `/api/projects/:projectId/tasks`

#### `GET /api/projects/:projectId/tasks`
🔒 **Protected** — Returns all tasks for a project, ordered by position.

**Response `200`**
```json
{
  "tasks": [
    {
      "id": "uuid",
      "title": "Task title",
      "description": "...",
      "status": "TODO",
      "position": 0,
      "subtasks": [...]
    }
  ]
}
```

---

#### `POST /api/projects/:projectId/tasks`
🔒 **Protected** — Create a new task.

**Body**
```json
{
  "title": "Task title",
  "description": "Optional"
}
```

**Response `201`**
```json
{
  "task": { ... }
}
```

---

#### `PATCH /api/projects/:projectId/tasks/:id`
🔒 **Protected** — Update a task.

**Body**
```json
{
  "title": "Updated title",
  "status": "IN_PROGRESS"
}
```

**Response `200`**
```json
{
  "task": { ... }
}
```

---

#### `PATCH /api/projects/:projectId/tasks/:id/reorder`
🔒 **Protected** — Update the position of a task.

**Body**
```json
{
  "position": 2
}
```

**Response `200`**
```json
{
  "task": { ... }
}
```

---

#### `DELETE /api/projects/:projectId/tasks/:id`
🔒 **Protected** — Delete a task and all its subtasks (cascade).

**Response `200`**
```json
{
  "message": "Tâche supprimée avec succès"
}
```

---

### Subtasks

Base path: `/api/tasks/:taskId/subtasks`

#### `GET /api/tasks/:taskId/subtasks`
🔒 **Protected** — Returns all subtasks for a task, ordered by position.

---

#### `POST /api/tasks/:taskId/subtasks`
🔒 **Protected** — Create a new subtask.

**Body**
```json
{
  "title": "Subtask title"
}
```

---

#### `PATCH /api/tasks/:taskId/subtasks/:id`
🔒 **Protected** — Update a subtask (title or completion status).

**Body**
```json
{
  "title": "Updated title",
  "isDone": true
}
```

---

#### `PATCH /api/tasks/:taskId/subtasks/:id/reorder`
🔒 **Protected** — Update the position of a subtask.

**Body**
```json
{
  "position": 1
}
```

---

#### `DELETE /api/tasks/:taskId/subtasks/:id`
🔒 **Protected** — Delete a subtask.

---

### Stats

#### `GET /api/stats`
🔒 **Protected** — Returns dashboard statistics.

**Response `200`**
```json
{
  "totalProjects": 12,
  "projectsByStatus": {
    "IDEA": 4,
    "IN_PROGRESS": 5,
    "DONE": 2,
    "ON_HOLD": 1
  },
  "totalTasks": 48,
  "tasksByStatus": {
    "TODO": 20,
    "IN_PROGRESS": 15,
    "DONE": 13
  },
  "recentProjects": [...]
}
```

---

### Upload

#### `POST /api/upload`
🔒 **Protected** — Upload an image to Cloudinary.

**Body** — `multipart/form-data`

| Field | Type | Description |
|---|---|---|
| `image` | file | JPG, PNG or WebP — max 5MB |

**Response `200`**
```json
{
  "url": "https://res.cloudinary.com/your-cloud/image/upload/..."
}
```

> Images are automatically transformed to WebP format at 1200×630px.

---

### Public

> This endpoint is **not protected**. It is designed to be consumed by an external portfolio without authentication.

#### `GET /api/public/projects`
Returns all published projects (`isPublic = true`).

**Response `200`**
```json
{
  "projects": [
    {
      "id": "uuid",
      "title": "My Project",
      "description": "...",
      "status": "IN_PROGRESS",
      "techStack": "React, Node.js, PostgreSQL",
      "context": "...",
      "githubUrl": "https://github.com/...",
      "demoUrl": "https://...",
      "githubDisabled": false,
      "imageUrl": "https://res.cloudinary.com/...",
      "images": "https://res.cloudinary.com/...,https://res.cloudinary.com/...",
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

---

## Error Format

All errors follow a consistent format:

```json
{
  "error": "Human-readable message",
  "code": "MACHINE_READABLE_CODE"
}
```

**Common error codes**

| Code | Status | Description |
|---|---|---|
| `MISSING_TOKEN` | 401 | No Authorization header |
| `INVALID_TOKEN` | 401 | Token expired or invalid |
| `PROJECT_NOT_FOUND` | 404 | Project does not exist or does not belong to the user |
| `MISSING_FIELDS` | 400 | Required fields are missing |
| `MISSING_PORTFOLIO_FIELDS` | 400 | techStack required before publishing |
| `INVALID_STATUS_FOR_PUBLISH` | 400 | Project status must be IN_PROGRESS or DONE |
| `SERVER_ERROR` | 500 | Internal server error |

---

## Health Check

```
GET /health
```

```json
{
  "status": "ok",
  "message": "DrP API is running"
}
```