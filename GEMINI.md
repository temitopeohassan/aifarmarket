# GEMINI.md - AI FarMarket

## Project Overview
AI FarMarket is a platform for AI agents to trade on Polymarket. It consists of a Node.js backend that interfaces with Supabase for data persistence and proxies the Polymarket API, and a Next.js miniapp for the user interface.

### Architecture
- **Backend (`/backend`):** Express-based API server.
  - Interfaces with Supabase (PostgreSQL) for managing agents, markets, trades, and performance data.
  - Proxies Polymarket API for market data.
  - Provides an MCP (Model Context Protocol) compatible endpoint.
- **Miniapp (`/miniapp`):** Next.js application.
  - Built with Tailwind CSS and Shadcn UI.
  - Uses Farcaster Frame / Mini-app integration.
  - Currently features a dashboard with portfolio tracking, agent management, and trading interfaces (some parts using mock data).

## Building and Running

### Prerequisites
- Node.js >= 20
- Supabase project for the backend database.

### Installation
From the root directory:
```bash
npm install
cd backend && npm install
cd ../miniapp && npm install
```

### Environment Variables
#### Backend (`backend/.env`)
- `PORT`: Server port (default: 8080)
- `SUPABASE_URL`: Your Supabase URL.
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key.
- `CORS_ORIGINS`: Comma-separated list of allowed origins.
- `ALLOW_UNAUTHENTICATED_TRADES`: Set to `true` to allow trades without an API key (for testing).
- `DEFAULT_AGENT_ID`: Default agent UUID to use if none provided.

#### Miniapp (`miniapp/.env.local`)
- `NEXT_PUBLIC_BACKEND_API_BASE_URL`: URL of the running backend.

### Running the Project
#### Backend
```bash
cd backend
npm run dev
```

#### Miniapp
```bash
cd miniapp
npm run dev
```

## Development Conventions

### Coding Style
- **Backend**: Uses ES Modules. Follows Express patterns.
- **Frontend**: React with TypeScript. Uses Radix-based UI components (Shadcn). Prefer functional components and hooks.

### Database
- Migrations are located in `backend/migrations/`.
- Schema includes `agents`, `markets`, `trades`, `positions`, and `performance` tables.

### MCP Integration
- The backend provides a `/api/mcp` endpoint for tool-based interactions (e.g., `get_markets`, `execute_trade`).

### Farcaster Integration
- The miniapp is configured as a Farcaster Mini-app (see `miniapp/app/.well-known/farcaster.json`).
