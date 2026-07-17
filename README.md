# Spotify Stats

Spotify Stats is a responsive web application for viewing personal Spotify listening statistics.

Users will be able to sign in with their Spotify account and explore their favorite artists, favorite tracks, recently played songs, currently playing track, and music preferences across different time ranges.

The application uses the official Spotify Web API.

## Project Goals

The main goals of the project are:

* provide a clean and convenient interface for Spotify statistics;
* keep Spotify credentials and tokens secure on the backend;
* use a clear and maintainable project architecture;
* build a small but fully functional MVP;
* support future deployment with Docker;
* allow future expansion to a mobile application.

## Technology Stack

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* React Router
* TanStack Query
* Recharts
* Fetch API or Axios

### Backend

* Python
* FastAPI
* Pydantic
* SQLAlchemy
* Alembic
* HTTPX
* Uvicorn

### Database

* SQLite for local development
* PostgreSQL for production

### Infrastructure

* Git and GitHub
* Docker
* Docker Compose

## Application Architecture

```text
User
  ↓
React Frontend
  ↓
FastAPI Backend
  ↓
Spotify Web API
  ↓
SQLite / PostgreSQL
```

The frontend does not communicate with Spotify directly.

All Spotify API requests, authentication logic, token handling, data transformation, and error handling are managed by the FastAPI backend.

## Project Structure

```text
spotify-stats/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── features/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── models/
│   │   ├── repositories/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── __init__.py
│   │   └── main.py
│   ├── tests/
│   └── requirements.txt
│
├── .gitignore
├── docker-compose.yml
└── README.md
```

Some directories will be added gradually as the application grows.

## MVP Features

The first version of the application will include:

* Spotify account authentication;
* user profile information;
* top artists;
* top tracks;
* statistics for multiple time ranges;
* recently played tracks;
* currently playing track;
* logout functionality;
* loading, error, and empty states;
* responsive desktop and mobile layouts.

## Spotify Statistics Time Ranges

Spotify provides top artists and tracks for three time ranges:

* `short_term` — approximately the last 4 weeks;
* `medium_term` — approximately the last 6 months;
* `long_term` — approximately the last year.

These results represent Spotify's calculated user preferences. They are not exact play counts.

## Planned Backend API

```text
GET  /api/health
GET  /api/auth/login
GET  /api/auth/callback
POST /api/auth/logout
GET  /api/auth/session
GET  /api/me
GET  /api/stats/top-artists
GET  /api/stats/top-tracks
GET  /api/history/recent
GET  /api/player/current
```

## Local Development

### Requirements

Install the following tools before running the project:

* Node.js
* npm
* Python 3
* Git

## Running the Frontend

Open a terminal in the project root and move to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the Vite development server:

```bash
npm run dev
```

The frontend will usually be available at:

```text
http://localhost:5173
```

Run the linter:

```bash
npm run lint
```

Create a production build:

```bash
npm run build
```

## Running the Backend

Open a terminal in the project root and move to the backend directory:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv .venv
```

Activate it in PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

Install backend dependencies:

```bash
python -m pip install -r requirements.txt
```

Start the FastAPI development server:

```bash
python -m uvicorn app.main:app --reload
```

The backend will be available at:

```text
http://localhost:8000
```

Interactive API documentation:

```text
http://localhost:8000/docs
```

Alternative API documentation:

```text
http://localhost:8000/redoc
```

## Environment Variables

Local configuration and secrets will be stored in environment files.

Real `.env` files must never be committed to Git.

Example environment files will be provided using:

```text
.env.example
```

Spotify credentials such as the client secret must only be stored on the backend.

## Security Principles

* Never expose the Spotify client secret in the frontend.
* Never send refresh tokens to React.
* Never commit real secrets to Git.
* Use the backend for all Spotify API requests.
* Store authentication data securely.
* Request only the Spotify permissions required by the application.
* Use secure session cookies in production.
* Use HTTPS in production.

## Development Status

Current progress:

* [x] Git repository created
* [x] React, Vite, and TypeScript frontend created
* [x] FastAPI backend created
* [x] Environment variables configured
* [x] CORS configured
* [x] Health endpoint added
* [x] Frontend connected to backend
* [x] Spotify Developer application configured
* [x] Spotify authentication implemented
* [x] User profile implemented
* [x] Top artists implemented
* [x] Top tracks implemented
* [ ] Recently played tracks implemented
* [ ] Currently playing track implemented
* [ ] Docker configuration added
* [ ] Production deployment completed

## Development Rules

* Keep every development stage functional.
* Add complexity only when it solves a real problem.
* Keep business logic out of React components.
* Keep Spotify integration in dedicated backend services.
* Transform Spotify responses into application-specific schemas.
* Handle errors without exposing raw technical messages to users.
* Reuse components and utility functions where appropriate.
* Do not start advanced analytics before authentication and core Spotify data are working.

## Future Improvements

After completing the MVP, the project may be extended with:

* persistent listening history;
* listening activity charts;
* monthly and yearly comparisons;
* estimated listening time;
* ranking position changes;
* Spotify Extended Streaming History import;
* shareable statistics images;
* personalized yearly summaries;
* Progressive Web App support;
* React Native mobile application.

## License

A license has not been selected yet.
