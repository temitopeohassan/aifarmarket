'use client';

import { useState } from 'react';
import { useApp } from '@/lib/context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowUpRight, ArrowDownLeft, TrendingUp } from 'lucide-react';

export default function Portfolio() {
  const { portfolio } = useApp();
  const [activeTab, setActiveTab] = useState('positions');

  const totalUnrealizedPnL = portfolio.positions.reduce((sum, pos) => sum + pos.unrealizedPnL, 0);
  const totalBuyPrice = portfolio.positions.reduce((sum, pos) => sum + pos.quantity * pos.entryPrice, 0);
  const totalCurrentPrice = portfolio.positions.reduce((sum, pos) => sum + pos.quantity * pos.currentPrice, 0);

  const winningTrades = portfolio.trades.filter((t) => {
    if (t.type === 'buy') {
      const pos = portfolio.positions.find((p) => p.id.includes(t.marketId));
      return pos && pos.currentPrice > t.price;
    }
    return true;
  });

  const winRate = portfolio.trades.length > 0 ? (winningTrades.length / portfolio.trades.length) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Portfolio & History</h1>
        <p className="text-muted-foreground">Track your positions, trades, and performance metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              ${portfolio.wallet.balance.toLocaleString('en-US', { maximumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Unrealized P&L</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalUnrealizedPnL >= 0 ? 'text-green-400' : 'text-destructive'}`}>
              ${Math.abs(totalUnrealizedPnL).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalUnrealizedPnL >= 0 ? '+' : ''}{((totalUnrealizedPnL / totalBuyPrice) * 100).toFixed(2)}%
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Win Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{winRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {winningTrades.length}/{portfolio.trades.length} trades
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Positions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{portfolio.positions.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Open markets</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-secondary/20 border border-border">
          <TabsTrigger value="positions" className="text-foreground data-[state=active]:bg-primary">
            Open Positions
          </TabsTrigger>
          <TabsTrigger value="trades" className="text-foreground data-[state=active]:bg-primary">
            Trade History
          </TabsTrigger>
        </TabsList>

        {/* Open Positions */}
        <TabsContent value="positions" className="space-y-4">
          {portfolio.positions.length === 0 ? (
            <Card className="bg-card border-border">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No open positions yet</p>
              </CardContent>
            </Card>
          ) : (
            portfolio.positions.map((position) => (
              <Card key={position.id} className="bg-card border-border">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Market</p>
                      <p className="font-semibold text-foreground">Market #{position.marketId.split('-')[1]}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Quantity</p>
                      <p className="font-semibold text-foreground">{position.quantity}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Entry Price</p>
                      <p className="font-semibold text-foreground">${position.entryPrice.toFixed(4)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Current Price</p>
                      <p className="font-semibold text-foreground">${position.currentPrice.toFixed(4)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Unrealized P&L</p>
                      <p className={`font-semibold ${position.unrealizedPnL >= 0 ? 'text-green-400' : 'text-destructive'}`}>
                        ${position.unrealizedPnL.toFixed(2)} ({position.percentage.toFixed(2)}%)
                      </p>
                    </div>
                    <div className="text-right">
                      <Button variant="outline" size="sm" className="text-xs">
                        Close
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Trade History */}
        <TabsContent value="trades" className="space-y-4">
          {portfolio.trades.length === 0 ? (
            <Card className="bg-card border-border">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No trades yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              <div className="hidden md:grid grid-cols-7 gap-4 px-4 py-2 text-xs font-semibold text-muted-foreground border-b border-border">
                <div>Date</div>
                <div>Type</div>
                <div>Market</div>
                <div>Quantity</div>
                <div>Price</div>
                <div>Total</div>
                <div>Status</div>
              </div>
              {portfolio.trades.map((trade) => (
                <Card key={trade.id} className="bg-card border-border">
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-2 md:grid-cols-7 gap-4 items-center text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground md:hidden">Date</p>
                        <p className="font-semibold text-foreground">
                          {new Date(trade.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground md:hidden">Type</p>
                        <div className="flex items-center gap-2">
                          {trade.type === 'buy' ? (
                            <ArrowDownLeft className="w-4 h-4 text-blue-400" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4 text-green-400" />
                          )}
                          <span className="font-semibold text-foreground capitalize">{trade.type}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground md:hidden">Market</p>
                        <p className="font-semibold text-foreground">Market #{trade.marketId.split('-')[1]}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground md:hidden">Quantity</p>
                        <p className="text-foreground">{trade.quantity}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground md:hidden">Price</p>
                        <p className="text-foreground">${trade.price.toFixed(4)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground md:hidden">Total</p>
                        <p className="font-semibold text-foreground">${trade.total.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground md:hidden">Status</p>
                        <Badge variant="outline" className="capitalize">
                          {trade.status}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
