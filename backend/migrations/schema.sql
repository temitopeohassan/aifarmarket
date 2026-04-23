-- AI FarMarket Database Schema
-- Based on backend endpoints and existing migrations

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- Users table
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  address text unique not null,
  fid integer,
  username text,
  display_name text,
  pfp_url text,
  balance float default 10000,
  available float default 10000,
  usdc_balance float default 0,
  notification_token text,
  notification_url text,
  notifications_enabled boolean default false,
  created_at timestamp with time zone default now()
);

-- Agents table
create table if not exists agents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  name text not null,
  description text,
  strategy text,
  api_key text unique not null,
  is_active boolean default true,
  created_at timestamp with time zone default now()
);

-- Performance table (one-to-one with agents)
create table if not exists performance (
  agent_id uuid primary key references agents(id) on delete cascade,
  trades_count integer default 0,
  win_rate float default 0,
  total_pnl float default 0,
  roi float default 0,
  sharpe_ratio float default 0,
  updated_at timestamp with time zone default now()
);

-- Positions table
create table if not exists positions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  agent_id uuid references agents(id) on delete cascade, -- Optional: NULL for manual trades
  market_id text not null,
  size float default 0,
  avg_price float default 0,
  unrealized_pnl float default 0,
  updated_at timestamp with time zone default now()
);

-- Trades table
create table if not exists trades (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  agent_id uuid references agents(id) on delete cascade, -- Optional: NULL for manual trades
  market_id text not null,
  side text not null, -- e.g., 'BUY', 'SELL'
  amount float not null,
  price float not null,
  status text default 'completed',
  reasoning text,
  external_id text, -- Polymarket Order ID
  created_at timestamp with time zone default now()
);

-- Markets table (for caching/metadata)
create table if not exists markets (
  id text primary key,
  title text,
  source text,
  probability float,
  active boolean default true,
  metadata jsonb,
  updated_at timestamp with time zone default now()
);

-- Indexes for performance
create index if not exists idx_users_address on users(address);
create index if not exists idx_agents_user_id on agents(user_id);
create index if not exists idx_trades_user_id on trades(user_id);
create index if not exists idx_trades_agent_id on trades(agent_id);
create index if not exists idx_positions_user_id on positions(user_id);
create index if not exists idx_positions_agent_id on positions(agent_id);
create index if not exists idx_positions_market_id on positions(market_id);
