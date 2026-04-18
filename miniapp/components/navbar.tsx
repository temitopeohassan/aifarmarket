'use client';

import { useFarcasterWallet } from './farcaster-sdk-provider';
import { Button } from '@/components/ui/button';
import { Bell, Settings, User, Wallet } from 'lucide-react';

export default function NavBar() {
  const { address } = useFarcasterWallet();

  const formatAddress = (addr: string | null) => {
    if (!addr) return 'Connecting...';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <header className="border-b border-border bg-card sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <img className="h-8 w-8 rounded-md" src="logo.png" alt="Logo" />
            <h1 className="text-lg font-bold text-foreground">AI Farmarket</h1>
          </div>

          {/* Wallet & Actions */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/50 border border-border">
              <Wallet className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs font-mono font-medium truncate max-w-[100px]">
                {formatAddress(address)}
              </span>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}