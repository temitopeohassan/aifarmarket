'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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

interface RegisterAgentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function RegisterAgentDialog({ open, onOpenChange }: RegisterAgentDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    strategyType: '',
    riskLevel: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle agent registration
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Register New Agent</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Create a new AI agent to manage your trading strategy
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-foreground">
              Agent Name
            </Label>
            <Input
              id="name"
              placeholder="My Strategy Agent"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-secondary/20 border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-foreground">
              Description
            </Label>
            <Input
              id="description"
              placeholder="Describe your trading strategy"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-secondary/20 border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="strategy" className="text-foreground">
              Strategy Type
            </Label>
            <Select value={formData.strategyType} onValueChange={(value) => setFormData({ ...formData, strategyType: value })}>
              <SelectTrigger className="bg-secondary/20 border-border text-foreground">
                <SelectValue placeholder="Select strategy" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="long-bias" className="text-foreground">Long Bias</SelectItem>
                <SelectItem value="market-neutral" className="text-foreground">Market Neutral</SelectItem>
                <SelectItem value="event-driven" className="text-foreground">Event-Driven</SelectItem>
                <SelectItem value="arbitrage" className="text-foreground">Arbitrage</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="risk" className="text-foreground">
              Risk Level
            </Label>
            <Select value={formData.riskLevel} onValueChange={(value) => setFormData({ ...formData, riskLevel: value })}>
              <SelectTrigger className="bg-secondary/20 border-border text-foreground">
                <SelectValue placeholder="Select risk level" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="low" className="text-foreground">Low</SelectItem>
                <SelectItem value="medium" className="text-foreground">Medium</SelectItem>
                <SelectItem value="high" className="text-foreground">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90">
              Register Agent
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
