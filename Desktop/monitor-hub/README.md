# MonitorHub

Infrastructure monitoring platform built with Node.js, React, and PostgreSQL.

![MonitorHub Dashboard](https://via.placeholder.com/800x400?text=MonitorHub+Dashboard)

## Features

- **HTTP/TCP Monitoring** — Check endpoints every 5 minutes automatically
- **Real-time Dashboard** — Live status updates with response time tracking
- **Email Alerts** — Get notified instantly when a monitor goes down or recovers
- **Incident History** — Track all downtime incidents in one place
- **Dark/Light Mode** — Full theme support
- **API Key Management** — Secure API key with show/hide toggle

## Tech Stack

### Backend
- Node.js + Express + TypeScript
- PostgreSQL + TypeORM
- Redis + Bull (job scheduler)
- JWT Authentication + bcrypt
- Resend (email alerts)

### Frontend
- React 18 + TypeScript
- Zustand (state management)
- Tailwind CSS
- Axios

### DevOps
- Docker + Docker Compose
- GitHub Actions ready

## Getting Started

### Prerequisites
- Node.js 18+
- Docker Desktop

### Installation
```bash
# Clone the repository
git clone https://github.com/loaded7/monitor-hub.git
cd monitor-hub

# Start the database and Redis
docker-compose up -d

# Install and start the backend
cd backend
npm install
npm run dev

# Install and start the frontend (new terminal)
cd ../client
npm install
npm start
```

### Environment Variables

Create a `.env` file in the `backend` folder:
```env
PORT=3001
NODE_ENV=development

DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=monitorhub
DATABASE_USER=postgres
DATABASE_PASSWORD=password

REDIS_HOST=localhost
REDIS_PORT=6379

JWT_SECRET=your_secret_key_here
RESEND_API_KEY=your_resend_api_key
ALERT_FROM_EMAIL=onboarding@resend.dev
```

## Project Structure
```
monitor-hub/
├── backend/
│   ├── src/
│   │   ├── config/        # Database configuration
│   │   ├── models/        # TypeORM entities (User, Check, CheckHistory)
│   │   ├── routes/        # API routes (auth, checks, user, stats)
│   │   └── services/      # Business logic (CheckService, SchedulerService, EmailService)
│   └── package.json
├── client/
│   ├── src/
│   │   ├── pages/         # React pages (Dashboard, Login, Signup)
│   │   ├── components/    # Shared components
│   │   ├── store/         # Zustand state management
│   │   └── services/      # API client
│   └── package.json
└── docker-compose.yml
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and get JWT token |
| GET | `/api/checks` | List all monitors |
| POST | `/api/checks` | Create a new monitor |
| DELETE | `/api/checks/:id` | Delete a monitor |
| POST | `/api/checks/:id/test` | Run a manual check |
| GET | `/api/checks/:id/history` | Get check history |
| PUT | `/api/user/alert-email` | Save alert email |
| POST | `/api/user/test-alert` | Send test alert email |

## Screenshots

### Login
Clean dark login page with feature highlights.

### Dashboard
Real-time monitoring dashboard with stats, response times, and incident tracking.

### Email Alerts
Automatic email notifications when monitors go down or recover.

## License

MIT