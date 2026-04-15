'use client';

import React, { createContext, useContext, useState } from 'react';
import useSWR from 'swr';
import {
  Agent,
  Market,
  Position,
  Trade,
  DashboardData,
  Portfolio,
} from './types';

const fetcher = (url: string) => fetch(url).then(res => res.json());

interface AppContextType {
  dashboardData: DashboardData | null;
  agents: Agent[];
  markets: Market[];
  portfolio: Portfolio | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  updateAgent: (agent: Agent) => void;
  executeSimulatedTrade: (trade: Partial<Trade>) => void;
  selectedAgent: Agent | null;
  setSelectedAgent: (agent: Agent | null) => void;
  isLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { data: marketsData, error: marketsError } = useSWR(`/api/markets`, fetcher);
  const { data: agentsData, error: agentsError } = useSWR(`/api/agents`, fetcher);
  const { data: portfolioData, error: portfolioError, mutate: mutatePortfolio } = useSWR(`/api/portfolio`, fetcher);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  const agents = agentsData?.agents || [];
  const markets = marketsData?.markets || [];
  const portfolio = portfolioData || {
    wallet: { balance: 0, available: 0 },
    positions: [],
    trades: [],
    performance: []
  };

  const isLoading = (!marketsData && !marketsError) || 
                    (!agentsData && !agentsError) || 
                    (!portfolioData && !portfolioError);

  const updateAgent = async (updatedAgent: Agent) => {
    console.log('Update agent', updatedAgent);
  };

  const executeSimulatedTrade = async (tradeData: Partial<Trade>) => {
    try {
      const res = await fetch(`/api/trade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          market_id: tradeData.marketId,
          side: tradeData.type === 'buy' ? 'YES' : 'NO',
          amount: tradeData.total || 10
        })
      });
      if (res.ok) {
        mutatePortfolio();
      }
    } catch (err) {
      console.error('Trade failed', err);
    }
  };

  return (
    <AppContext.Provider
      value={{
        dashboardData: null,
        agents,
        markets,
        portfolio,
        activeTab,
        setActiveTab,
        updateAgent,
        executeSimulatedTrade,
        selectedAgent,
        setSelectedAgent,
        isLoading
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
