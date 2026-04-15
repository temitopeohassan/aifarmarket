'use client';

import { useApp } from '@/lib/context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';

export default function RecentActivity() {
  const { portfolio } = useApp();

  const recentTrades = portfolio.trades.slice(-5).reverse();

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-lg">Recent Trades</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recentTrades.length === 0 ? (
          <p className="text-muted-foreground text-sm">No trades yet</p>
        ) : (
          recentTrades.map((trade) => (
            <div key={trade.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary/20 transition-colors">
              <div className="flex items-center gap-3 flex-1">
                <div className="p-2 rounded-lg bg-secondary/30">
                  {trade.type === 'buy' ? (
                    <ArrowDownLeft className="w-4 h-4 text-blue-400" />
                  ) : (
                    <ArrowUpRight className="w-4 h-4 text-green-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground capitalize text-sm">{trade.type}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(trade.timestamp).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-foreground">${trade.total.toFixed(2)}</p>
                <Badge variant="outline" className="text-xs mt-1">
                  {trade.status}
                </Badge>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
