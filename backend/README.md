# AI Farmarket Backend (Node.js + Express + Supabase)

This backend is a deployable Node.js Express API for the miniapp and uses Supabase as the data layer.

## What it serves

- `GET /health` - health check
- `GET /api/markets` - normalized market list for miniapp
- `POST /api/trade` - creates a trade record in Supabase
- `POST /api/mcp` - simple MCP-style tool gateway

## Setup

1. Copy `.env.example` to `.env`
2. Fill required values (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`)
3. Install deps and start:
   - `npm install`
   - `npm run dev`

## Trade auth behavior

- Preferred: send `x-api-key` header and match against `agents.api_key`.
- Optional dev mode:
  - Set `ALLOW_UNAUTHENTICATED_TRADES=true`
  - Set `DEFAULT_AGENT_ID=<agent uuid>`
  - Then `/api/trade` works without API key.

## Deploy options

### Generic Node host (Railway/Render/Fly/etc)

- Build command: `npm install`
- Start command: `npm start`
- Set env vars from `.env.example`
- Expose `PORT` (platform usually injects it automatically)

### Docker

From `backend`:

- `docker build -t aifarmarket-backend .`
- `docker run --env-file .env -p 8080:8080 aifarmarket-backend`

## Database

The database schema is defined in:
- `migrations/001_init.sql` (Initial structure)
- `migrations/schema.sql` (Comprehensive schema based on current API endpoints)

Apply these to your Supabase SQL Editor.