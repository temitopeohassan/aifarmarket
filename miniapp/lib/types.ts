// OracleX MCP Types
export interface Wallet {
  id: string;
  address: string;
  balance: number;
  available: number;
  reserved: number;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'stopped';
  owner: string;
  createdAt: string;
  updatedAt: string;
  configuration: AgentConfiguration;
  performance: AgentPerformance;
}

export interface AgentConfiguration {
  strategyType: string;
  riskLevel: 'low' | 'medium' | 'high';
  maxPositionSize: number;
  maxLeverage: number;
  stopLossPercentage: number;
  takeProfitPercentage: number;
  rebalanceFrequency: string;
}

export interface AgentPerformance {
  totalTrades: number;
  winRate: number;
  profitLoss: number;
  roi: number;
  sharpeRatio: number;
  maxDrawdown: number;
}

export interface Market {
  id: string;
  title: string;
  description: string;
  venue: 'Polymarket' | 'Metaculus' | 'Manifold' | 'Kalshi';
  category: string;
  liquidityPool: number;
  volume24h: number;
  impliedProbability: number;
  endDate: string;
  createdAt: string;
  status: 'open' | 'closed' | 'resolved';
  outcomes: MarketOutcome[];
}

export interface MarketOutcome {
  id: string;
  name: string;
  probability: number;
  oddsFractional: string;
  oddsDecimal: number;
}

export interface Position {
  id: string;
  marketId: string;
  agentId: string;
  outcomeId: string;
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  unrealizedPnL: number;
  percentage: number;
  createdAt: string;
  status: 'open' | 'closed';
}

export interface Trade {
  id: string;
  marketId: string;
  agentId: string;
  type: 'buy' | 'sell';
  price: number;
  quantity: number;
  total: number;
  fee: number;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
}

export interface Portfolio {
  totalValue: number;
  availableBalance: number;
  positions: Position[];
  trades: Trade[];
  agents: Agent[];
  wallet: Wallet;
}

export interface DashboardData {
  portfolio: Portfolio;
  recentTrades: Trade[];
  topPerformers: Agent[];
  marketAlerts: MarketAlert[];
}

export interface MarketAlert {
  id: string;
  marketId: string;
  type: 'liquidity' | 'movement' | 'resolved';
  message: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
