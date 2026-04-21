'use client';

import { useState } from 'react';
import { useFarcasterWallet } from '../farcaster-sdk-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { sdk } from "@farcaster/miniapp-sdk";
import { UserPlus, Wallet, ShieldCheck } from 'lucide-react';

interface CreateAccountProps {
    onAccountCreatedAction: () => void;
}

export default function CreateAccount({ onAccountCreatedAction }: CreateAccountProps) {
    const { address } = useFarcasterWallet();
    const [username, setUsername] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCreate = async () => {
        if (!username || !address) return;

        setIsSubmitting(true);
        try {
            // Logic for your backend API
            const response = await fetch('/api/create-user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    address,
                    username,
                    timestamp: new Date().toISOString()
                }),
            });

            if (response.ok) {
                // Trigger native Farcaster success haptics
                await sdk.haptics.notificationOccurred('success');
                onAccountCreatedAction();
            } else {
                throw new Error('Failed to create account');
            }
        } catch (error) {
            console.error("Error creating account:", error);
            await sdk.haptics.notificationOccurred('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 animate-in fade-in duration-500">
            <div className="w-full max-w-sm space-y-8">

                {/* Header Section */}
                <div className="flex flex-col items-center space-y-2 text-center">
                    <div className="p-3 rounded-2xl bg-primary/10 text-primary mb-2">
                        <UserPlus className="w-8 h-8" />
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">
                        Create Profile
                    </h2>
                    <p className="text-muted-foreground text-sm">
                        Join AI Farmarket with your Farcaster identity
                    </p>
                </div>

                {/* Form Section */}
                <div className="space-y-6">
                    {/* Read-only Wallet Display */}
                    <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                            <Wallet className="w-3 h-3" />
                            Connected Wallet
                        </label>
                        <div className="p-3 bg-secondary/30 border border-border rounded-xl text-[13px] font-mono text-muted-foreground break-all">
                            {address || 'No wallet connected'}
                        </div>
                    </div>

                    {/* Username Input */}
                    <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                            <ShieldCheck className="w-3 h-3" />
                            Username
                        </label>
                        <Input
                            placeholder="e.g. Satoshi_Agent"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="h-12 bg-card rounded-xl border-border focus:ring-primary"
                            maxLength={20}
                        />
                        <p className="text-[10px] text-muted-foreground">
                            This name will represent your agents in the marketplace.
                        </p>
                    </div>

                    {/* Action Button */}
                    <Button
                        className="w-full h-12 text-base font-bold rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
                        size="lg"
                        onClick={handleCreate}
                        disabled={!username || isSubmitting || !address}
                    >
                        {isSubmitting ? (
                            <span className="flex items-center gap-2">
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                Initializing...
                            </span>
                        ) : (
                            "Complete Setup"
                        )}
                    </Button>
                </div>

                {/* Security Note */}
                <p className="text-center text-[11px] text-muted-foreground px-6">
                    By continuing, you are linking your Farcaster wallet to your AI Farmarket account.
                </p>
            </div>
        </div>
    );
}