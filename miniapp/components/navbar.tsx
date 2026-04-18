'use client';

import { useApp } from '@/lib/context';
import { useFarcasterWallet } from './farcaster-sdk-provider'; // Adjust path as needed
import { Button } from '@/components/ui/button';
import { Bell, Settings, Wallet, User } from 'lucide-react';
import { sdk } from "@farcaster/miniapp-sdk";

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'agents', label: 'Agents', icon: '🤖' },
  { id: 'markets', label: 'Markets', icon: '📈' },
  { id: 'trading', label: 'Trading', icon: '💼' },
  { id: 'portfolio', label: 'Portfolio', icon: '💰' },
];

export default function NavBar() {
  const { activeTab, setActiveTab, portfolio } = useApp();
  const { address } = useFarcasterWallet();

  // Helper to truncate address: 0x1234...abcd
  const formatAddress = (addr) => {
    if (!addr) return 'Connecting...';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    // Adding Haptic feedback for a native feel
    sdk.haptics.selectionChanged();
  };

  return (
    <header className="border-b border-border bg-card sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <img className="h-auto w-[60px] rounded-lg" src="logo.png" alt="AI Farmarket" />
            <h1 className="text-2xl font-bold text-foreground">AI Farmarket</h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Display Wallet Address */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
              <Wallet className="w-4 h-4 text-primary" />
              <span className="text-xs font-mono font-medium text-primary">
                {formatAddress(address)}
              </span>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <Button variant="ghost" size="icon"><Bell className="w-5 h-5" /></Button>
              <Button variant="ghost" size="icon"><Settings className="w-5 h-5" /></Button>
              <Button variant="ghost" size="icon"><User className="w-5 h-5" /></Button>
            </div>
          </div>
        </div>

        <nav className="flex gap-1 overflow-x-auto pb-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`px-4 py-3 rounded-t-lg font-medium transition-colors whitespace-nowrap ${activeTab === tab.id
                  ? 'bg-primary text-primary-foreground border-b-2 border-accent'
                  : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}