# 🚀 Full-Stack DevOps Dashboard

![Deploy](https://img.shields.io/badge/deploy-render.com-46E3B7?style=flat&logo=render&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat&logo=nestjs&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=flat&logo=githubactions&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)

**Live Demo → [nestjsreactdocker-project.onrender.com](https://nestjsreactdocker-project.onrender.com)**

A production-grade DevOps monitoring dashboard built to showcase full-stack engineering, containerization, CI/CD pipelines, and real-time data — all in one project.

---

## 📸 Screenshots

> Dashboard overview showing CI/CD pipelines, Docker container health, server metrics, and active alerts in real time.

![Dashboard](https://github.com/BrydeRov/nestJSReactDocker_Project/raw/master/docs/dashboard.png)

---

## 🧠 What This Project Demonstrates

| Area | What's shown |
|---|---|
| **Backend** | NestJS REST API + WebSocket gateway, JWT auth, TypeORM, PostgreSQL |
| **Frontend** | React + Vite, shadcn/ui, real-time WebSocket hooks, responsive design |
| **DevOps** | Docker Compose multi-service setup, GitHub Actions CI/CD, Render deployment |
| **Monitoring** | GitHub Actions pipeline status, Docker container health, server metrics, live log streaming |
| **Architecture** | Clean separation of concerns, modular NestJS structure, environment-aware config |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Client Browser                    │
│              React + Vite (shadcn/ui)                │
└───────────────────┬─────────────────────────────────┘
                    │ HTTP + WebSocket (Socket.io)
┌───────────────────▼─────────────────────────────────┐
│               NestJS Backend (Docker)                │
│  ┌──────────┐ ┌──────────┐ ┌───────────────────┐   │
│  │ REST API │ │ WS Gway  │ │  Cron / Scheduler │   │
│  └──────────┘ └──────────┘ └───────────────────┘   │
│  ┌──────────┐ ┌──────────┐ ┌───────────────────┐   │
│  │   Auth   │ │Inventory │ │  Docker / GitHub  │   │
│  │  (JWT)   │ │  Module  │ │     Services      │   │
│  └──────────┘ └──────────┘ └───────────────────┘   │
└───────────────────┬─────────────────────────────────┘
                    │ TypeORM
┌───────────────────▼─────────────────────────────────┐
│            PostgreSQL 16 (Docker)                    │
└─────────────────────────────────────────────────────┘

CI/CD:  GitHub Actions → Build → Test → Deploy → Render
```

---

## ✨ Features

### 📊 Dashboard
- **CI/CD Pipeline monitor** — live GitHub Actions workflow runs with status, commit SHA, branch, and duration
- **Docker Container health** — container state, uptime, and image info pulled from Docker daemon
- **Server metrics** — CPU, Memory, Disk usage with color-coded indicators
- **Active alerts** — severity-based alerts (memory threshold, deploy failures, new deploys)
- **Docker Log Viewer** — tabbed terminal-style viewer per container with **Polling** and **Live streaming** modes

### 📦 Inventory Management (Full CRUD)
- Products with image upload, price, stock tracking
- Categories and Suppliers management
- Stock movements (IN/OUT) with history and timestamps

### 🔐 Authentication
- JWT-based auth with HTTP-only cookies
- Protected routes on frontend and backend guards

### ⚡ Real-Time
- WebSocket gateway with Socket.io
- Instant data push on connect (no waiting for first poll cycle)
- Live log streaming using Docker's `follow: true` API — line-by-line, like `docker logs -f`

---

## 🛠️ Tech Stack

**Backend**
- [NestJS](https://nestjs.com/) — modular Node.js framework
- [TypeORM](https://typeorm.io/) — ORM with PostgreSQL
- [Socket.io](https://socket.io/) — WebSocket real-time gateway
- [Dockerode](https://github.com/apocas/dockerode) — Docker Engine API client
- [Octokit](https://github.com/octokit/octokit.js) — GitHub Actions API
- [Passport + JWT](https://docs.nestjs.com/security/authentication) — authentication

**Frontend**
- [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- [shadcn/ui](https://ui.shadcn.com/) — component library
- [Tailwind CSS](https://tailwindcss.com/)
- [Socket.io-client](https://socket.io/docs/v4/client-api/) — real-time hooks

**Infrastructure**
- [Docker](https://www.docker.com/) + Docker Compose — multi-service local dev
- [GitHub Actions](https://github.com/features/actions) — CI/CD pipeline
- [Render.com](https://render.com/) — cloud deployment (Backend as Docker service, Frontend as Static site)
- PostgreSQL 16 (Alpine)

---

## 🚀 Getting Started

### Prerequisites
- Docker + Docker Compose
- Node.js 20+
- A GitHub Personal Access Token (for pipeline data)

### Clone & Run

```bash
git clone https://github.com/BrydeRov/nestJSReactDocker_Project.git
cd nestJSReactDocker_Project
```

### Environment Variables

Create `backend/.env`:

```env
# Database
DB_HOST=postgres
DB_PORT=5432
DB_USER=user
DB_PASSWORD=pswd
DB_NAME=nestdb

# Auth
JWT_SECRET=your_jwt_secret

# GitHub (for pipeline data)
GITHUB_TOKEN=your_github_pat
GITHUB_OWNER=BrydeRov
GITHUB_REPO=nestJSReactDocker_Project

# Docker socket
SOCKET_PATH=/var/run/docker.sock
```

Create `frontend/.env`:

```env
VITE_BACKEND_URL=http://localhost:3000
```

### Start with Docker Compose

```bash
docker compose up -d
```

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3000 |
| PostgreSQL | localhost:5432 |

### Seed the Database

```bash
docker exec nestjsreactdocker_project-backend-1 npm run seed
```

---

## 📁 Project Structure

```
nestJSReactDocker_Project/
├── backend/                  # NestJS API
│   ├── src/
│   │   ├── auth/             # JWT authentication
│   │   ├── dashboard/        # WebSocket gateways + Docker/GitHub services
│   │   ├── inventory/        # Products, Categories, Suppliers, Movements
│   │   ├── users/
│   │   └── seeds/            # Database seed script
│   ├── Dockerfile
│   └── Dockerfile.prod
├── frontend/                 # React + Vite
│   ├── src/
│   │   ├── components/
│   │   │   ├── dashboard/    # Dashboard widgets
│   │   │   └── ui/           # shadcn components
│   │   └── hooks/            # WebSocket hooks
│   └── Dockerfile
├── docker-compose.yml
└── .github/
    └── workflows/            # CI/CD pipeline
```

---

## ⚙️ CI/CD Pipeline

On every push to `main`:

```
Push to main
    │
    ▼
GitHub Actions
    ├── Install dependencies
    ├── Build backend
    ├── Build frontend
    └── Trigger Render deploy
            │
            ▼
        Render.com
        ├── Backend  → Docker service (Oregon)
        └── Frontend → Static site (Global CDN)
```

---

## 🌐 Production Notes

The live demo runs on Render's free tier:
- **Docker metrics** show mock data in production since Render doesn't expose the host Docker socket. Locally with Docker Compose, all container data is live and real.
- **Backend** may take ~30s to wake up on first visit (free tier cold start).
- **GitHub Actions** pipeline data is always live via the GitHub API.

---

## 👨‍💻 Author

**Javier Camacho** — Systems Engineer | Full-Stack + DevOps  
[GitHub @BrydeRov](https://github.com/BrydeRov)

---

## 📄 License

MIT
