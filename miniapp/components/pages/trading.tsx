'use client';

import { useState } from 'react';
import { useApp } from '@/lib/context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, TrendingUp } from 'lucide-react';

export default function Trading() {
  const { markets, agents, executeSimulatedTrade, portfolio } = useApp();
  const [selectedMarket, setSelectedMarket] = useState<string>('');
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [quantity, setQuantity] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [tradeStatus, setTradeStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');

  const selectedMarketData = markets.find((m) => m.id === selectedMarket);
  const selectedAgentData = agents.find((a) => a.id === selectedAgent);

  const totalCost = parseFloat(quantity || '0') * parseFloat(price || '0');
  const estimatedFee = totalCost * 0.01;
  const totalWithFee = totalCost + estimatedFee;

  const canExecute =
    selectedMarket &&
    selectedAgent &&
    quantity &&
    price &&
    totalWithFee <= portfolio.wallet.available;

  const handleExecuteTrade = async () => {
    if (!canExecute) return;

    setTradeStatus('processing');
    setTimeout(() => {
      executeSimulatedTrade({
        marketId: selectedMarket,
        agentId: selectedAgent,
        type: tradeType,
        price: parseFloat(price),
        quantity: parseFloat(quantity),
        total: totalCost,
      });
      setTradeStatus('success');
      setQuantity('');
      setPrice('');
      setTimeout(() => setTradeStatus('idle'), 3000);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Trading Interface</h1>
        <p className="text-muted-foreground">Execute trades and simulate trading strategies</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trading Form */}
        <Card className="lg:col-span-2 bg-card border-border">
          <CardHeader>
            <CardTitle>Execute Trade</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Trade Type Selector */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setTradeType('buy')}
                className={`p-3 rounded-lg font-semibold transition-colors ${
                  tradeType === 'buy'
                    ? 'bg-green-600/20 text-green-300 border border-green-600/50'
                    : 'bg-secondary/20 text-muted-foreground border border-border'
                }`}
              >
                BUY
              </button>
              <button
                onClick={() => setTradeType('sell')}
                className={`p-3 rounded-lg font-semibold transition-colors ${
                  tradeType === 'sell'
                    ? 'bg-red-600/20 text-red-300 border border-red-600/50'
                    : 'bg-secondary/20 text-muted-foreground border border-border'
                }`}
              >
                SELL
              </button>
            </div>

            {/* Market Selection */}
            <div className="space-y-2">
              <Label className="text-foreground">Select Market</Label>
              <Select value={selectedMarket} onValueChange={setSelectedMarket}>
                <SelectTrigger className="bg-secondary/20 border-border text-foreground">
                  <SelectValue placeholder="Choose a market..." />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {markets.map((market) => (
                    <SelectItem key={market.id} value={market.id} className="text-foreground">
                      {market.title.substring(0, 50)}...
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Market Info */}
            {selectedMarketData && (
              <div className="p-3 rounded-lg bg-secondary/20 border border-primary/30">
                <p className="text-sm text-muted-foreground mb-2">Market Info</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">Venue</p>
                    <p className="font-semibold text-foreground">{selectedMarketData.venue}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Probability</p>
                    <p className="font-semibold text-foreground">
                      {(selectedMarketData.impliedProbability * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Agent Selection */}
            <div className="space-y-2">
              <Label className="text-foreground">Select Agent</Label>
              <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                <SelectTrigger className="bg-secondary/20 border-border text-foreground">
                  <SelectValue placeholder="Choose an agent..." />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {agents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id} className="text-foreground">
                      {agent.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Quantity & Price */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground">Quantity</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="bg-secondary/20 border-border text-foreground placeholder:text-muted-foreground"
                  min="0"
                  step="0.1"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Price per Share</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="bg-secondary/20 border-border text-foreground placeholder:text-muted-foreground"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            {/* Order Summary */}
            <div className="space-y-2 p-4 rounded-lg bg-secondary/20 border border-border">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold text-foreground">${totalCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Fee (1%)</span>
                <span className="font-semibold text-foreground">${estimatedFee.toFixed(2)}</span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between">
                <span className="font-semibold text-foreground">Total</span>
                <span className="text-lg font-bold text-primary">${totalWithFee.toFixed(2)}</span>
              </div>
            </div>

            {/* Error Message */}
            {totalWithFee > portfolio.wallet.available && totalWithFee > 0 && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/50 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">Insufficient balance. Available: ${portfolio.wallet.available.toFixed(2)}</p>
              </div>
            )}

            {/* Execute Button */}
            <Button
              onClick={handleExecuteTrade}
              disabled={!canExecute || tradeStatus === 'processing'}
              className={`w-full font-semibold py-6 text-lg ${
                tradeType === 'buy'
                  ? 'bg-green-600 hover:bg-green-700 disabled:bg-green-600/50'
                  : 'bg-red-600 hover:bg-red-700 disabled:bg-red-600/50'
              }`}
            >
              {tradeStatus === 'processing' ? (
                'Processing...'
              ) : (
                `${tradeType.toUpperCase()} ${quantity || '0'} @ $${price || '0.00'}`
              )}
            </Button>

            {/* Success Message */}
            {tradeStatus === 'success' && (
              <div className="p-3 rounded-lg bg-green-600/10 border border-green-600/50 flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-green-400">Trade executed successfully!</p>
                  <p className="text-xs text-green-300 mt-1">Your simulated trade has been recorded.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Market Depth & Info */}
        <div className="space-y-6">
          {/* Available Balance */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Account Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground mb-2">
                ${portfolio.wallet.available.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground">Available balance</p>
            </CardContent>
          </Card>

          {/* Order Slippage */}
          {totalCost > 0 && (
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Estimated Fees</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-foreground mb-2">
                  ${estimatedFee.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">1% trading fee</p>
              </CardContent>
            </Card>
          )}

          {/* Quick Stats */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Your Portfolio</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Open Positions</span>
                <span className="font-semibold text-foreground">{portfolio.positions.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Trades</span>
                <span className="font-semibold text-foreground">{portfolio.trades.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Active Agents</span>
                <span className="font-semibold text-foreground">
                  {agents.filter((a) => a.status === 'active').length}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
