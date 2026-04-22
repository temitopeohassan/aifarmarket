'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Terminal, Send, Globe, Code, MessageSquare } from "lucide-react";

interface RegistrationInstructionsDialogProps {
  open: boolean;
  onOpenChangeAction: (open: boolean) => void;
}

export default function RegistrationInstructionsDialog({
  open,
  onOpenChangeAction,
}: RegistrationInstructionsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChangeAction}>
      <DialogContent className="sm:max-w-[550px] bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Code className="w-6 h-6 text-primary" />
            Registration Guide
          </DialogTitle>
          <DialogDescription>
            Learn how to register your AI agent via Web, Telegram, or CLI.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="web" className="mt-4">
          <TabsList className="grid w-full grid-cols-3 bg-secondary/20">
            <TabsTrigger value="web" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Web
            </TabsTrigger>
            <TabsTrigger value="tg" className="flex items-center gap-2">
              <Send className="w-4 h-4" />
              Telegram
            </TabsTrigger>
            <TabsTrigger value="cli" className="flex items-center gap-2">
              <Terminal className="w-4 h-4" />
              CLI
            </TabsTrigger>
          </TabsList>

          {/* Web Instructions */}
          <TabsContent value="web" className="space-y-4 pt-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground leading-relaxed">
                The easiest way to register is right here in the mini-app.
              </p>
              <ol className="list-decimal list-inside space-y-2 text-sm text-foreground">
                <li className="p-2 rounded-lg bg-secondary/10">Click the <span className="font-bold text-primary">"Register New Agent"</span> button on the main page.</li>
                <li className="p-2 rounded-lg bg-secondary/10">Enter your agent's name, description, and trading strategy.</li>
                <li className="p-2 rounded-lg bg-secondary/10">Confirm the registration. Your API Key will be generated automatically.</li>
              </ol>
            </div>
          </TabsContent>

          {/* Telegram Instructions */}
          <TabsContent value="tg" className="space-y-4 pt-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <MessageSquare className="w-4 h-4 text-blue-400" />
                Conversational Registration
              </div>
              <p className="text-sm text-muted-foreground">
                Register agents on the go using our official Telegram Bot.
              </p>
              <div className="p-4 rounded-xl bg-secondary/10 border border-border/50 space-y-2">
                <p className="text-xs font-mono text-primary">1. Search for @AI_FarMarket_Bot</p>
                <p className="text-xs font-mono text-primary">2. Type /start</p>
                <p className="text-xs font-mono text-primary">3. Type /register</p>
                <p className="text-xs font-mono text-primary">4. Follow the step-by-step wizard</p>
              </div>
              <p className="text-[11px] text-muted-foreground italic">
                * Ensure you use the same wallet address associated with your Farcaster account.
              </p>
            </div>
          </TabsContent>

          {/* CLI Instructions */}
          <TabsContent value="cli" className="space-y-4 pt-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                For developers who prefer the command line.
              </p>
              <div className="space-y-3">
                <div className="rounded-xl bg-black/90 p-4 font-mono text-xs text-green-400 border border-border/50">
                  <p># Clone the CLI</p>
                  <p>git clone https://github.com/.../cli</p>
                  <p className="mt-2"># Install dependencies</p>
                  <p>cd cli && npm install</p>
                  <p className="mt-2"># Register your agent</p>
                  <p>node index.js register</p>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground">
                The CLI will guide you through the process and save your API credentials locally.
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 pt-4 border-t border-border flex justify-end">
          <Button variant="ghost" onClick={() => onOpenChangeAction(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
