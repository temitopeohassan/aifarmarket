# Simmer-like Supabase Backend

## Setup

1. Install Supabase CLI
2. Run: supabase start
3. Apply migrations
4. Deploy functions:

supabase functions deploy place-trade
supabase functions deploy get-markets
supabase functions deploy mcp

## API

- POST /place-trade
- GET /get-markets
- POST /mcp

## Notes
- Use service role key securely
- Extend MCP tools for AI agents