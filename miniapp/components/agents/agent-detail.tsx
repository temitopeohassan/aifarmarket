'use client';

import { Agent } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Settings, PauseCircle, PlayCircle } from 'lucide-react';

interface AgentDetailProps {
  agent: Agent | null;
  onBack: () => void;
}

export default function AgentDetail({ agent, onBack }: AgentDetailProps) {
  if (!agent) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack} className="text-muted-foreground">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Agents
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            {agent.status === 'active' ? (
              <>
                <PauseCircle className="w-4 h-4 mr-2" />
                Pause Agent
              </>
            ) : (
              <>
                <PlayCircle className="w-4 h-4 mr-2" />
                Resume Agent
              </>
            )}
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Edit Config
          </Button>
        </div>
      </div>

      {/* Agent Header */}
      <Card className="bg-gradient-to-r from-primary/20 to-accent/20 border-primary/50">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-3xl text-foreground mb-2">{agent.name}</CardTitle>
              <p className="text-muted-foreground max-w-lg">{agent.description}</p>
            </div>
            <Badge
              variant={agent.status === 'active' ? 'default' : 'secondary'}
              className={
                agent.status === 'active'
                  ? 'bg-green-600/20 text-green-300 text-base px-3 py-1'
                  : agent.status === 'paused'
                    ? 'bg-yellow-600/20 text-yellow-300 text-base px-3 py-1'
                    : 'bg-red-600/20 text-red-300 text-base px-3 py-1'
              }
            >
              {agent.status.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Win Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {(agent.performance.winRate * 100).toFixed(1)}%
            </div>
            <div className="w-full bg-secondary/20 rounded-full h-2 mt-2">
              <div
                className="bg-green-500 h-2 rounded-full"
                style={{ width: `${agent.performance.winRate * 100}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Sharpe Ratio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {agent.performance.sharpeRatio.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">Risk-adjusted returns</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Max Drawdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">
              {(agent.performance.maxDrawdown * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-2">Peak-to-trough decline</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total P&L</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${agent.performance.profitLoss >= 0 ? 'text-green-400' : 'text-destructive'}`}>
              ${agent.performance.profitLoss.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configuration */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Strategy Type</p>
              <p className="font-semibold text-foreground">{agent.configuration.strategyType}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Risk Level</p>
              <Badge variant="outline" className="capitalize">
                {agent.configuration.riskLevel}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Max Position Size</p>
              <p className="font-semibold text-foreground">
                ${agent.configuration.maxPositionSize.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Max Leverage</p>
              <p className="font-semibold text-foreground">{agent.configuration.maxLeverage}x</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Stop Loss</p>
              <p className="font-semibold text-foreground">{agent.configuration.stopLossPercentage}%</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Take Profit</p>
              <p className="font-semibold text-foreground">{agent.configuration.takeProfitPercentage}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trading Statistics */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Trading Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Total Trades</p>
              <p className="text-2xl font-bold text-foreground">{agent.performance.totalTrades}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">ROI</p>
              <p className="text-2xl font-bold text-green-400">
                {(agent.performance.roi * 100).toFixed(2)}%
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Winning Trades</p>
              <p className="text-2xl font-bold text-foreground">
                {Math.round(agent.performance.totalTrades * agent.performance.winRate)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Losing Trades</p>
              <p className="text-2xl font-bold text-destructive">
                {Math.round(agent.performance.totalTrades * (1 - agent.performance.winRate))}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
