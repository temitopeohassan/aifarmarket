'use client';

import React, { createContext, useContext, useState } from 'react';
import useSWR from 'swr';
import { useFarcasterWallet } from '@/components/farcaster-sdk-provider';
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
  fundWallet: (amount: number) => Promise<void>;
  mutatePortfolio: () => Promise<any>;
  isLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { address } = useFarcasterWallet();
  const { data: marketsData, error: marketsError } = useSWR(`/api/markets`, fetcher);
  const { data: agentsData, error: agentsError } = useSWR(address ? `/api/agents?address=${address}` : null, fetcher);
  const { data: portfolioData, error: portfolioError, mutate: mutatePortfolio } = useSWR(address ? `/api/portfolio?address=${address}` : null, fetcher);

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
          side: tradeData.type === 'buy' ? 'BUY' : 'SELL',
          amount: tradeData.total || 10,
          address: address,
          agent_id: tradeData.agentId === 'manual' ? null : tradeData.agentId,
          price: tradeData.price,
          outcome: tradeData.type === 'buy' ? 'YES' : 'NO'
        })
      });
      if (res.ok) {
        mutatePortfolio();
      }
    } catch (err) {
      console.error('Trade failed', err);
    }
  };
  
  const fundWallet = async (amount: number) => {
    console.log('Funding wallet', amount);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    mutatePortfolio();
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
        fundWallet,
        mutatePortfolio,
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
