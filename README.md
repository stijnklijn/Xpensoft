# Xpensoft

Xpensoft is a personal finance / expense-tracking application. It lets you record transactions, organize them into categories, and analyze your spending over time.

## Tech stack

- **Frontend**: Angular 21 (standalone components, signals), Angular Material
- **Backend**: ASP.NET Core (.NET 10) Web API, Entity Framework Core
- **Database**: PostgreSQL
- **Deployment**: Docker Compose

## Project structure

- `backend/` — .NET solution (`Xpensoft.Api.slnx`) with the API and unit/integration tests
- `frontend/` — Angular application
- `docker-compose.yml` — Postgres only, for local development
- `docker-compose.prod.yml` — full stack (Postgres, backend, frontend) for production

## Getting started

### Prerequisites

- .NET 10 SDK
- Node.js 24+ and npm
- Docker (for the local database)

### Database

Create a `.env` file in the repository root with:

```
POSTGRES_USER=...
POSTGRES_PASSWORD=...
POSTGRES_DB=...
```

Then start Postgres:

```
docker compose up -d
```

### Backend

```
cd backend
dotnet restore Xpensoft.Api.slnx
dotnet run --project Xpensoft.Api
```

The API is served at `http://localhost:5200` and applies pending EF Core migrations automatically on startup.

### Frontend

```
cd frontend
npm ci
npm start
```

The app is served at `http://localhost:4200` and expects the API at `http://localhost:5200`.

## Testing

```
# Backend
dotnet test backend/Xpensoft.Api.slnx

# Frontend
cd frontend
npm test
```

## Deployment

Pushes to `main` are built, tested, and published as Docker images to GHCR, then deployed to production via `docker-compose.prod.yml` (see `.github/workflows/test-publish-deploy.yml`).
