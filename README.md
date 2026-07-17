# Collaborative Analytics Dashboard

A full-stack collaborative analytics dashboard built with a Turborepo monorepo. The app combines a Next.js dashboard, Prisma/PostgreSQL data layer, role-based team access, editable dashboard widgets, anomaly alerts, and a WebSocket collaboration service for live presence and dashboard update broadcasts.

## Features

- Authentication with NextAuth credentials.
- Organization and team-scoped dashboard access.
- Role-based permissions for `ADMIN`, `EDITOR`, and `VIEWER`.
- Editable responsive widget grid powered by `react-grid-layout`.
- Metrics, KPI cards, chart widgets, and anomaly alert widgets.
- Prisma/PostgreSQL schema for users, organizations, teams, dashboards, widgets, metrics, KPI definitions, anomaly rules, and alerts.
- WebSocket room presence and dashboard layout update broadcasts.
- Dockerfile for deploying the WebSocket service independently.

## Tech Stack

- Monorepo: Turborepo, npm workspaces
- Web app: Next.js 16, React 19, Tailwind CSS
- Auth: NextAuth, JWT, bcrypt
- Database: PostgreSQL, Prisma 7
- Validation: Zod
- Realtime: `ws` WebSocket server
- Language: TypeScript

## Repository Structure

```text
apps/
  web/          Next.js dashboard app
  websocket/    WebSocket collaboration service
packages/
  db/           Prisma schema, client export, migrations, seed script
  validation/   Shared Zod schemas
  ui/           Shared UI package
  eslint-config/
  typescript-config/
```

## Prerequisites

- Node.js 18 or newer
- npm
- PostgreSQL database
- Docker, only if building the WebSocket container

## Environment Variables

Create environment files for local development. At minimum, the web app and database package need database and auth secrets, and the WebSocket app needs the same JWT secret.

Example root or app env values:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE
JWT_SECRET=replace-with-a-long-random-secret
NEXTAUTH_SECRET=replace-with-a-long-random-secret
NEXTAUTH_URL=http://localhost:3000
WEBSOCKET_URL=ws://localhost:8080
NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:8080
WEBSOCKET_PORT=8080
```

The frontend resolves the WebSocket URL in this order:

```text
WEBSOCKET_URL -> NEXT_PUBLIC_WEBSOCKET_URL -> ws://localhost:8080
```

For the WebSocket app, `apps/websocket/.env` is loaded directly by `apps/websocket/src/index.ts`.

## Install

```sh
npm install
```

## Database Setup

Generate the Prisma client:

```sh
npm run db:generate
```

Run migrations:

```sh
npm run db:migrate
```

Seed demo data:

```sh
npm run db:seed
```

Seeded users use this password:

```text
Password123!
```

Demo accounts:

```text
admin@buildable.test
editor@buildable.test
viewer@buildable.test
```

## Local Development

Run all apps and packages through Turborepo:

```sh
npm run dev
```

Or run apps individually:

```sh
npm run dev --workspace=@repo/web
npm run dev --workspace=@repo/websocket
```

Default local URLs:

```text
Web app:    http://localhost:3000
WebSocket:  ws://localhost:8080
```

## Build and Verify

Build the full repo:

```sh
npm run build
```

Run linting:

```sh
npm run lint
```

Run type checks:

```sh
npm run check-types
```

Package-specific checks:

```sh
npm run build --workspace=@repo/websocket
npm run check-types --workspace=@repo/websocket
```

## WebSocket Deployment

Build the WebSocket Docker image from the repository root:

```sh
docker build -f Dockerfile.websocket -t collaborative-dashboard-websocket .
```

Run the container:

```sh
docker run --rm -p 8080:8080 \
  -e JWT_SECRET=replace-with-your-secret \
  -e WEBSOCKET_PORT=8080 \
  collaborative-dashboard-websocket
```

Use the same `JWT_SECRET` for the web app and WebSocket service, otherwise authenticated socket connections will be rejected.

## Production Notes

- Set `NEXTAUTH_SECRET` and `JWT_SECRET` to strong production secrets.
- Point `DATABASE_URL` at the production PostgreSQL database.
- Set `WEBSOCKET_URL` or `NEXT_PUBLIC_WEBSOCKET_URL` to the deployed WebSocket endpoint, for example `wss://realtime.example.com`.
- Run Prisma migrations during deployment with:

```sh
npm run migrate:deploy --workspace=@repo/db
```

## Useful Scripts

```text
npm run dev             Run all dev tasks through Turbo
npm run build           Build all packages/apps
npm run lint            Lint all packages/apps
npm run check-types     Type-check all packages/apps
npm run db:generate     Generate Prisma client
npm run db:migrate      Run Prisma dev migrations
npm run db:seed         Seed demo data
```
