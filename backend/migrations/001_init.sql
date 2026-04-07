create table agents (
  id uuid primary key default gen_random_uuid(),
  name text,
  api_key text unique,
  strategy text,
  created_at timestamp default now()
);

create table markets (
  id text primary key,
  title text,
  source text,
  probability float,
  active boolean default true,
  metadata jsonb,
  updated_at timestamp default now()
);

create table trades (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid references agents(id),
  market_id text,
  side text,
  amount float,
  price float,
  status text,
  reasoning text,
  created_at timestamp default now()
);

create table positions (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid,
  market_id text,
  size float,
  avg_price float
);

create table performance (
  agent_id uuid primary key,
  pnl float default 0,
  sharpe float default 0,
  win_rate float default 0
);