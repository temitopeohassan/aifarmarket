'use client';

import { useState, useEffect } from 'react';
import { useFarcasterWallet } from '../farcaster-sdk-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { sdk } from "@farcaster/miniapp-sdk";
import { UserPlus, Wallet, ShieldCheck, ArrowRight } from 'lucide-react';

interface CreateAccountProps {
    onAccountCreatedAction: () => void;
}

export default function CreateAccount({ onAccountCreatedAction }: CreateAccountProps) {
    const { address, fcUsername } = useFarcasterWallet();
    const [username, setUsername] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 1. Automatically prefill the username field once the Farcaster context is loaded
    useEffect(() => {
        if (fcUsername && !username) {
            setUsername(fcUsername);
        }
    }, [fcUsername, username]);

    const handleCreate = async () => {
        if (!username || !address) return;

        setIsSubmitting(true);
        try {
            // 2. Call your backend API to register the new user
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
                // 3. Native haptic success feedback
                await sdk.haptics.notificationOccurred('success');
                
                // Prompt user to add the app (required for notifications)
                try {
                    await sdk.actions.addMiniApp();
                } catch (e) {
                    console.log("Add app cancelled or failed", e);
                }

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
        <div className="flex flex-col items-center justify-center min-h-[85vh] px-4 animate-in fade-in zoom-in-95 duration-500">
            <div className="w-full max-w-sm space-y-8">

                {/* Header Section */}
                <div className="flex flex-col items-center space-y-3 text-center">
                    <div className="p-4 rounded-full bg-primary/10 text-primary ring-4 ring-primary/5">
                        <UserPlus className="w-10 h-10" />
                    </div>
                    <div className="space-y-1">
                        <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
                            Welcome
                        </h2>
                        <p className="text-muted-foreground text-sm px-4">
                            Connect your Farcaster identity to start managing AI agents.
                        </p>
                    </div>
                </div>

                {/* Form Section */}
                <div className="space-y-6">

                    {/* Wallet Preview (Disabled/Read-only) */}
                    <div className="space-y-2">
                        <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2 ml-1">
                            <Wallet className="w-3 h-3" />
                            Sign-in Wallet
                        </label>
                        <div className="p-4 bg-secondary/20 border border-border/50 rounded-2xl text-[13px] font-mono text-muted-foreground/80 break-all leading-relaxed">
                            {address || 'Detecting wallet...'}
                        </div>
                    </div>

                    {/* Username Input */}
                    <div className="space-y-2">
                        <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2 ml-1">
                            <ShieldCheck className="w-3 h-3" />
                            Username
                        </label>
                        <div className="relative">
                            <Input
                                placeholder={fcUsername || "Enter username"}
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="h-14 bg-card rounded-2xl border-border/60 pl-4 pr-12 focus:ring-2 focus:ring-primary/20 text-base"
                                maxLength={20}
                            />
                            {fcUsername && username === fcUsername && (
                                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                    <div className="bg-primary/10 text-primary p-1 rounded-md">
                                        <ShieldCheck className="w-4 h-4" />
                                    </div>
                                </div>
                            )}
                        </div>
                        <p className="text-[11px] text-muted-foreground ml-1">
                            {fcUsername ? "Suggested from your Farcaster profile." : "Pick a name for the marketplace."}
                        </p>
                    </div>

                    {/* Submit Button */}
                    <Button
                        className="w-full h-14 text-lg font-bold rounded-2xl shadow-xl shadow-primary/20 transition-all hover:translate-y-[-2px] active:scale-[0.97] group"
                        size="lg"
                        onClick={handleCreate}
                        disabled={!username || isSubmitting || !address}
                    >
                        {isSubmitting ? (
                            <span className="flex items-center gap-3">
                                <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                Setting up...
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                Launch AI Farmarket
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </span>
                        )}
                    </Button>
                </div>

                {/* Footer/Privacy */}
                <p className="text-center text-[10px] text-muted-foreground/60 px-8 leading-normal">
                    By launching, you agree to link your Farcaster ID to this application.
                </p>
            </div>
        </div>
    );
}