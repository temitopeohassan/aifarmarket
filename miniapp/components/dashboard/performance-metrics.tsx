'use client';

import { useApp } from '@/lib/context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PerformanceMetrics() {
  const { agents } = useApp();

  const avgWinRate = agents.reduce((sum, a) => sum + a.performance.winRate, 0) / agents.length;
  const avgSharpeRatio = agents.reduce((sum, a) => sum + a.performance.sharpeRatio, 0) / agents.length;
  const maxDrawdown = Math.max(...agents.map((a) => a.performance.maxDrawdown));

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-lg">Key Metrics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Average Win Rate</p>
          <div className="flex items-center justify-between">
            <div className="w-full bg-secondary/20 rounded-full h-2 mr-3">
              <div
                className="bg-gradient-to-r from-primary to-accent h-2 rounded-full"
                style={{ width: `${avgWinRate * 100}%` }}
              ></div>
            </div>
            <span className="font-semibold text-foreground text-sm">{(avgWinRate * 100).toFixed(1)}%</span>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Avg Sharpe Ratio</p>
          <p className="text-2xl font-bold text-foreground">{avgSharpeRatio.toFixed(2)}</p>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Max Drawdown</p>
          <p className="text-2xl font-bold text-destructive">{(maxDrawdown * 100).toFixed(1)}%</p>
        </div>

        <div className="pt-2 border-t border-border grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Total Trades</p>
            <p className="text-lg font-semibold text-foreground">
              {agents.reduce((sum, a) => sum + a.performance.totalTrades, 0)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Avg ROI</p>
            <p className="text-lg font-semibold text-foreground">
              {(agents.reduce((sum, a) => sum + a.performance.roi, 0) / agents.length * 100).toFixed(2)}%
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
