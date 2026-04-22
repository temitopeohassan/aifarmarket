'use client';

import { useState } from 'react';
import { useApp } from '@/lib/context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Settings, PlayCircle, PauseCircle, StopCircle } from 'lucide-react';
import AgentDetail from '@/components/agents/agent-detail';
import RegisterAgentDialog from '@/components/agents/register-agent-dialog';
import RegistrationInstructionsDialog from '@/components/agents/registration-instructions-dialog';
import { HelpCircle } from 'lucide-react';

export default function Agents() {
  const { agents, selectedAgent, setSelectedAgent } = useApp();
  const [showDetail, setShowDetail] = useState(false);
  const [showRegisterDialog, setShowRegisterDialog] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  const activeAgents = agents.filter((a) => a.status === 'active').length;
  const totalProfit = agents.reduce((sum, a) => sum + a.performance.profitLoss, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Agent Management</h1>
          <p className="text-muted-foreground">Create, manage, and monitor your AI trading agents</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowInstructions(true)}
            className="rounded-full border-border hover:bg-secondary/20"
            title="Registration Instructions"
          >
            <HelpCircle className="w-5 h-5 text-muted-foreground" />
          </Button>
          <Button
            onClick={() => setShowRegisterDialog(true)}
            className="bg-primary hover:bg-primary/90 font-bold"
          >
            <Plus className="w-4 h-4 mr-2" />
            Register New Agent
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Agents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{agents.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-400">{activeAgents}</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Combined P&L</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${totalProfit >= 0 ? 'text-green-400' : 'text-destructive'}`}>
              ${Math.abs(totalProfit).toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agents List */}
      {!showDetail ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {agents.map((agent) => (
            <Card
              key={agent.id}
              className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => {
                setSelectedAgent(agent);
                setShowDetail(true);
              }}
            >
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <CardTitle className="text-lg text-foreground">{agent.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{agent.description}</p>
                  </div>
                  <Badge
                    variant={agent.status === 'active' ? 'default' : 'secondary'}
                    className={
                      agent.status === 'active'
                        ? 'bg-green-600/20 text-green-300'
                        : agent.status === 'paused'
                          ? 'bg-yellow-600/20 text-yellow-300'
                          : 'bg-red-600/20 text-red-300'
                    }
                  >
                    {agent.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Win Rate</p>
                    <p className="text-xl font-semibold text-foreground">
                      {(agent.performance.winRate * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">ROI</p>
                    <p className="text-xl font-semibold text-foreground">
                      {(agent.performance.roi * 100).toFixed(2)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Sharpe Ratio</p>
                    <p className="text-xl font-semibold text-foreground">
                      {agent.performance.sharpeRatio.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Trades</p>
                    <p className="text-xl font-semibold text-foreground">
                      {agent.performance.totalTrades}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-2">Unrealized P&L</p>
                  <p className={`text-lg font-bold ${agent.performance.profitLoss >= 0 ? 'text-green-400' : 'text-destructive'}`}>
                    ${agent.performance.profitLoss.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </p>
                </div>

                <div className="flex gap-2 pt-2 border-t border-border">
                  <Button variant="outline" size="sm" className="flex-1 text-xs">
                    {agent.status === 'active' ? (
                      <>
                        <PauseCircle className="w-3 h-3 mr-1" />
                        Pause
                      </>
                    ) : (
                      <>
                        <PlayCircle className="w-3 h-3 mr-1" />
                        Resume
                      </>
                    )}
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 text-xs">
                    <Settings className="w-3 h-3 mr-1" />
                    Config
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <AgentDetail agent={selectedAgent} onBack={() => setShowDetail(false)} />
      )}

      {/* Register Dialog */}
      <RegisterAgentDialog open={showRegisterDialog} onOpenChange={setShowRegisterDialog} />
      
      {/* Instructions Dialog */}
      <RegistrationInstructionsDialog open={showInstructions} onOpenChangeAction={setShowInstructions} />
    </div>
  );
}
