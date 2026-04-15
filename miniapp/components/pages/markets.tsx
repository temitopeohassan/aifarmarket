'use client';

import { useState } from 'react';
import { useApp } from '@/lib/context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, TrendingUp, TrendingDown, Zap } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function Markets() {
  const { markets, setActiveTab } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filteredMarkets = markets.filter((market) => {
    const matchesSearch = market.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || market.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(markets.map((m) => m.category)));

  const getTopOutcome = (market: any) => {
    if (!market.outcomes || market.outcomes.length === 0) {
      return { name: 'Unknown', probability: 0 };
    }
    return market.outcomes.reduce((max: any, outcome: any) =>
      (outcome?.probability || 0) > (max?.probability || 0) ? outcome : max
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Market Discovery</h1>
        <p className="text-muted-foreground">Explore and analyze prediction markets across multiple venues</p>
      </div>

      {/* Search and Filters */}
      <Card className="bg-card border-border">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search markets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-secondary/20 border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-48 bg-secondary/20 border-border text-foreground">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="all" className="text-foreground">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat || 'unknown'} value={cat || 'unknown'} className="text-foreground">
                    {cat || 'Unknown'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Markets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredMarkets.map((market, idx) => {
          const topOutcome = getTopOutcome(market);
          return (
            <Card key={market.id || idx} className="bg-card border-border hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg text-foreground mb-1 line-clamp-2">{market.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{market.description}</p>
                  </div>
                  <Badge variant="outline" className="whitespace-nowrap">
                    {market.venue}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Market Stats */}
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="p-2 rounded-lg bg-secondary/20">
                    <p className="text-muted-foreground text-xs mb-1">Liquidity</p>
                    <p className="font-semibold text-foreground">
                      ${((market.liquidityPool || 0) / 1000).toFixed(0)}k
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-secondary/20">
                    <p className="text-muted-foreground text-xs mb-1">24h Volume</p>
                    <p className="font-semibold text-foreground">
                      ${((market.volume24h || 0) / 1000).toFixed(0)}k
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-secondary/20">
                    <p className="text-muted-foreground text-xs mb-1">Category</p>
                    <p className="font-semibold text-foreground">{market.category || 'N/A'}</p>
                  </div>
                </div>

                {/* Top Outcome */}
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Leading Outcome</p>
                  <div className="p-3 rounded-lg bg-secondary/30 border border-primary/30">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-foreground">{topOutcome.name}</p>
                      <p className="text-lg font-bold text-primary">
                        {((topOutcome.probability || 0) * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div className="w-full bg-secondary/20 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${(topOutcome.probability || 0) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Outcomes */}
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">All Outcomes</p>
                  <div className="space-y-2">
                    {(market.outcomes || []).map((outcome: any, oIdx: number) => (
                      <div key={outcome.id || oIdx} className="flex items-center justify-between text-sm">
                        <span className="text-foreground">{outcome.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-muted-foreground">{(outcome.oddsDecimal || 0).toFixed(2)}</span>
                          <span className="text-foreground font-semibold">
                            {((outcome.probability || 0) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2 border-t border-border">
                  <Button
                    variant="outline"
                    className="flex-1 text-sm"
                    onClick={() => setActiveTab('trading')}
                  >
                    <Zap className="w-3 h-3 mr-1" />
                    Trade
                  </Button>
                  <Button variant="ghost" className="flex-1 text-sm text-muted-foreground">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Details
                  </Button>
                </div>

                {/* End Date */}
                <p className="text-xs text-muted-foreground">
                  Closes {market.endDate ? new Date(market.endDate).toLocaleDateString() : 'N/A'}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredMarkets.length === 0 && (
        <Card className="bg-card border-border">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No markets found matching your criteria</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
