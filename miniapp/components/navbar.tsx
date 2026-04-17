'use client';

import { useApp } from '@/lib/context';
import { Button } from '@/components/ui/button';
import { Bell, Settings, Wallet, User } from 'lucide-react';

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'agents', label: 'Agents', icon: '🤖' },
  { id: 'markets', label: 'Markets', icon: '📈' },
  { id: 'trading', label: 'Trading', icon: '💼' },
  { id: 'portfolio', label: 'Portfolio', icon: '💰' },
];

export default function NavBar() {
  const { activeTab, setActiveTab, portfolio } = useApp();

  return (
    <header className="border-b border-border bg-card sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-6">
          {/* Logo/Brand */}
          <div className="flex items-center gap-3">
          <img class="h-auto w-[60px] rounded-lg" src="logo.png" alt="image description" />
            <h1 className="text-2xl font-bold text-foreground">AI Farmarket</h1>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-6 px-6 py-2 rounded-lg bg-secondary/20">
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Balance</span>
                <span className="font-semibold text-foreground">
                  ${portfolio?.wallet?.balance?.toLocaleString('en-US', { maximumFractionDigits: 0 }) || '0'}
                </span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Available</span>
                <span className="font-semibold text-foreground">
                  ${portfolio?.wallet?.available?.toLocaleString('en-US', { maximumFractionDigits: 0 }) || '0'}
                </span>
              </div>
            </div>

            <Button variant="ghost" size="icon">
              <Bell className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Wallet className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <User className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Tabs Navigation */}
        <nav className="flex gap-1 overflow-x-auto pb-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 rounded-t-lg font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
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
