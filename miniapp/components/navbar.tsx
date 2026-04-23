'use client';

import { useFarcasterWallet } from './farcaster-sdk-provider';
import { useApp } from '@/lib/context';
import { Button } from '@/components/ui/button';
import { Bell, Settings, User, Wallet, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function NavBar() {
  const { address } = useFarcasterWallet();
  const { portfolio } = useApp();

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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border cursor-pointer hover:bg-secondary/80 transition-colors">
                  <Wallet className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs font-mono font-medium truncate max-w-[100px]">
                    {formatAddress(address)}
                  </span>
                  <ChevronDown className="w-3 h-3 text-muted-foreground" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-card border-border">
                <DropdownMenuLabel>Connected Wallet</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="px-2 py-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Base Chain Balance</span>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-foreground">
                        ${(portfolio?.wallet.usdc_balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold">
                        USDC
                      </span>
                    </div>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer text-destructive">
                  <span>Disconnect</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}