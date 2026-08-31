# Backend

Minimal standalone backend for UKIZ (Aurelia Scent House).

> `server/` is the real backend (Express + tRPC + Drizzle + MySQL). `backend/` is a clean wrapper - 3 files + config.

## Structure
```
backend/
├── src/
│   ├── index.ts   # server + registers OAuth / storage / payment callbacks
│   ├── app.ts     # Express + /api/health + /api/trpc
│   └── config.ts  # ENV + getDb()
├── .env.example
├── package.json
└── tsconfig.json
```

## Run
```bash
cp backend/.env.example backend/.env   # set DATABASE_URL, JWT_SECRET
pnpm dev                               # monorepo (frontend + backend)
# or standalone:
cd backend && npm install && npm run dev  # http://localhost:3000/api/health
```

## API
- `GET /api/health` - health check
- `POST /api/trpc/*` - tRPC (see `server/routers.ts` for all procedures)
- Payment callbacks + OAuth are registered via `server/_core/*` in `src/index.ts`

To make backend fully independent, copy `server/routers.ts`, `server/db.ts`, `drizzle/schema.ts` into `backend/src/`.
