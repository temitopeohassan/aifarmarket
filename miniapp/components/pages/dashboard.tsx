'use client';

import { useApp } from '@/lib/context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Activity, AlertCircle } from 'lucide-react';
import PortfolioChart from '@/components/charts/portfolio-chart';
import PerformanceMetrics from '@/components/dashboard/performance-metrics';
import RecentActivity from '@/components/dashboard/recent-activity';

export default function Dashboard() {
  const { portfolio, agents } = useApp();

  // Calculate portfolio metrics
  const totalPnL = agents.reduce((sum, agent) => sum + agent.performance.profitLoss, 0);
  const totalROI = agents.reduce((sum, agent) => sum + agent.performance.roi, 0) / agents.length;
  const activeAgents = agents.filter((a) => a.status === 'active').length;

  return (
    <div className="space-y-6">
      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              ${portfolio.wallet.balance.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              ${portfolio.wallet.available.toLocaleString('en-US', { maximumFractionDigits: 0 })} available
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total P&L</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold flex items-center gap-2 ${totalPnL >= 0 ? 'text-green-400' : 'text-destructive'}`}>
              ${Math.abs(totalPnL).toLocaleString('en-US', { maximumFractionDigits: 0 })}
              {totalPnL >= 0 ? (
                <TrendingUp className="w-5 h-5" />
              ) : (
                <TrendingDown className="w-5 h-5" />
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalROI > 0 ? '+' : ''}{(totalROI * 100).toFixed(2)}% ROI
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Agents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{activeAgents}</div>
            <p className="text-xs text-muted-foreground mt-1">{agents.length} total agents</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Open Positions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{portfolio.positions.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Unrealized P&L: ${portfolio.positions.reduce((sum, pos) => sum + pos.unrealizedPnL, 0).toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Portfolio Chart */}
        <Card className="lg:col-span-2 bg-card border-border">
          <CardHeader>
            <CardTitle>Portfolio Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <PortfolioChart />
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <PerformanceMetrics />
      </div>

      {/* Top Performers & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Agents */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Top Performers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {agents.slice(0, 3).map((agent) => (
              <div key={agent.id} className="p-3 rounded-lg bg-secondary/20 border border-border/50">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-foreground">{agent.name}</p>
                    <p className="text-xs text-muted-foreground">{agent.configuration.strategyType}</p>
                  </div>
                  <Badge
                    variant={agent.status === 'active' ? 'default' : 'secondary'}
                    className={agent.status === 'active' ? 'bg-green-600/20 text-green-300' : ''}
                  >
                    {agent.status}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-muted-foreground">Win Rate</p>
                    <p className="font-semibold text-foreground">{(agent.performance.winRate * 100).toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Sharpe Ratio</p>
                    <p className="font-semibold text-foreground">{agent.performance.sharpeRatio.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <RecentActivity />
      </div>

      {/* Alerts */}
      {portfolio.positions.some((p) => p.unrealizedPnL < 0) && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-destructive" />
              <CardTitle className="text-destructive">Risk Alert</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            You have {portfolio.positions.filter((p) => p.unrealizedPnL < 0).length} positions with unrealized losses.
            Consider reviewing your risk management strategy.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
