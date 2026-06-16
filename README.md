# 🛡️ SecurePariksha

**Secure Online Examination & AI Proctoring Platform**

SecurePariksha is a production-ready, enterprise-grade online examination platform fortified with an in-browser WebRTC AI proctoring system. It tracks face-presence, gaze directions, tab switching, and clipboard actions to guarantee academic integrity in remote examinations.

---

## 🌟 Core Features

### 👤 Role-Based Portals (RBAC)
- **Super Admin**: Configure roles, manage administrators and students, review aggregated statistics, and terminate accounts.
- **Exam Admin**: Maintain question banks, edit exam parameters, publish tests, review proctor logs, and view results.
- **Student**: View active test rosters, undergo automated camera authorization, attempt exams with real-time timers, review detailed scorecards, and download score report PDFs.

### 🤖 AI-Powered Proctoring Engine
- **Presence Validation**: Alerts if the candidate moves out of the webcam view.
- **Look-Away detection**: Estimates nose tip coordinates against facial edges to calculate if the user is looking away.
- **Co-Presence Detector**: Highlights alerts if multiple faces are captured.
- **Connection hearts**: Streams base64 webcam frames to the admin dashboard.

### 🖥️ Browser Integrity Shield
- **Fullscreen Lock**: Prevents exiting fullscreen mode during active examinations.
- **Focus Monitor**: Flags visibility triggers and window blurs if the user attempts tab-switching.
- **Clipboard Locks**: Blocks copying, cutting, or pasting actions on test questions.
- **DevTools Blocker**: Traps key combinations (F12, Ctrl+Shift+I, View Source) and blocks right-clicks.

### 📊 Real-Time Admin Dashboards
- **Live Proctor Grid**: Displays active students, live webcam snapshots, and warning notifications.
- **Analytical Metrics**: Visualizes growth rates, pass-to-fail margins, category performances, and violation volume trends using Chart.js.

---

## 🛠️ Technology Stack

| Component | Technology | Description |
|---|---|---|
| **Frontend** | React, TypeScript, Vite, Tailwind CSS, Zustand | Sleek, glassmorphic dark-theme UI |
| **Backend** | Node.js, Express.js, TypeScript, Socket.io | HTTP API & WebSocket broadcast engine |
| **Database** | PostgreSQL, Prisma ORM | Relational schema and queries |
| **AI Proctor** | face-api.js (TensorFlow.js) | Client-side facial classification |
| **PDF Engine** | jsPDF, jsPDF-AutoTable | Scorecard certificate generator |

---

## 📂 Project Directory Structure

```text
securepariksha/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma   # PostgreSQL models schema
│   │   └── seed.ts         # Pre-seeds 20 MCQs, 2 Exams, 10 Student attempts
│   ├── src/
│   │   ├── controllers/    # Express endpoint handlers
│   │   ├── routes/         # Express endpoint routers
│   │   ├── middlewares/    # JWT RBAC verification & global error catchers
│   │   ├── services/       # Core business workflows
│   │   ├── socket/         # Socket.io WebSocket servers
│   │   └── index.ts        # Main server entrypoint
│   └── Dockerfile
├── frontend/
│   ├── public/models/      # Downloaded face-api weights (SSD/Landmarks)
│   ├── scripts/            # Model downloader postinstall scripts
│   ├── src/
│   │   ├── app/            # Pages & Routes (Login, Attempt Test, Dashboards)
│   │   ├── components/     # WebcamMonitor, Timer, Charts, Navbar, Sidebar
│   │   ├── services/       # Axios API handlers
│   │   ├── store/          # Zustand auth status store
│   │   └── types/          # Strict TypeScript interfaces
│   └── Dockerfile
├── docker-compose.yml      # Orchestrates full container setups
└── README.md
```

---

## 🔑 Demo Seed Accounts

Use these credentials to test role-specific dashboards:

| Role | Username | Password |
|---|---|---|
| **Super Admin** | `superadmin@securepariksha.com` | `Admin@123` |
| **Exam Admin** | `admin@securepariksha.com` | `Admin@123` |
| **Student** | `student@securepariksha.com` | `Student@123` |

---

## 🚀 Installation & Local Development

### 1. Prerequisite Installations
- Ensure you have [Node.js (v18+)](https://nodejs.org/) and [Docker Desktop](https://www.docker.com/) installed.

### 2. Configure Environment Configurations
Create a `.env` file in the `backend/` directory:
```env
PORT=5000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/securepariksha?schema=public"
JWT_SECRET="super_secret_key_12345"
JWT_REFRESH_SECRET="super_secret_refresh_key_12345"
```

### 3. Spin Up Local Docker Services (Recommended)
You can run the entire platform, including database, API, and Web, with a single command from the project root:
```bash
docker-compose up --build
```
Access the application at:
- **Frontend Panel**: `http://localhost:3000`
- **Backend API Engine**: `http://localhost:5000`

---

## 🔧 Manual Setup & Database Seeding

If running services individually:

### 1. Initialize Backend
```bash
cd backend
npm install
npx prisma generate
```
Deploy the database migrations and seed mockup data:
```bash
npx prisma migrate dev --name init
npm run prisma:seed
```
Start the backend development server:
```bash
npm run dev
```

### 2. Initialize Frontend
Navigate to the frontend folder, install dependencies, and start:
```bash
cd ../frontend
npm install
npm run dev
```
Access the web panel at `http://localhost:3000`.

---

## 📡 Core API Documentation

### 🔐 Authentication
- `POST /api/auth/register` - Registers a student.
- `POST /api/auth/login` - Authenticates user & returns JWT tokens.
- `POST /api/auth/logout` - Discards credentials.
- `GET /api/auth/me` - Resolves currently logged-in profile.

### 📝 Exams & Attempts
- `GET /api/exams` - Lists active/published exams.
- `POST /api/exams` - Creates a new exam (Admin only).
- `POST /api/exams/start` - Starts exam attempt and locks questions list.
- `POST /api/exams/submit` - Submits final answers and triggers evaluation.

### 🛡️ AI Proctoring
- `POST /api/proctor/violation` - Logs environmental/WebRTC cheating flags.
- `GET /api/proctor/logs` - Retrieves proctor logs.
- `GET /api/proctor/live` - Streams actively monitored exam sessions.

---

## 🌐 Production Deployment Guide

### Database (Neon PostgreSQL)
1. Register on [Neon](https://neon.tech/) and provision a PostgreSQL instance.
2. Retrieve the pooled connection string and set it as `DATABASE_URL`.

### Backend Engine (Render)
1. Deploy a Web Service linked to your backend repository.
2. Select **Node** runtime and configure Environment Variables (`DATABASE_URL`, `JWT_SECRET`, etc.).
3. Build command: `cd backend && npm install && npx prisma generate && npm run build`
4. Start command: `cd backend && npm start`

### Frontend Hosting (Vercel)
1. Deploy a project pointing to the `frontend` directory.
2. Add the environment variable `VITE_API_URL` pointing to your deployed Render API backend URL.
3. Build command: `npm run build`
4. Output directory: `dist`
