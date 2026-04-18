'use client';

import { useApp } from '@/lib/context';
import { sdk } from "@farcaster/miniapp-sdk";
import { LayoutDashboard, Bot, LineChart, Briefcase, Wallet } from 'lucide-react';

const tabs = [
    { id: 'dashboard', label: 'Home', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'agents', label: 'Agents', icon: <Bot className="w-5 h-5" /> },
    { id: 'markets', label: 'Markets', icon: <LineChart className="w-5 h-5" /> },
    { id: 'trading', label: 'Trade', icon: <Briefcase className="w-5 h-5" /> },
    { id: 'portfolio', label: 'Assets', icon: <Wallet className="w-5 h-5" /> },
];

export default function Footer() {
    const { activeTab, setActiveTab } = useApp();

    const handleNavigation = (tabId: string) => {
        setActiveTab(tabId);
        // Native haptic feedback
        sdk.haptics.selectionChanged();
    };

    return (
        <footer className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border pb-safe">
            <nav className="flex items-center justify-around max-w-7xl mx-auto h-16">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => handleNavigation(tab.id)}
                        className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors ${activeTab === tab.id
                                ? 'text-primary'
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        {tab.icon}
                        <span className="text-[10px] font-medium uppercase tracking-wider">
                            {tab.label}
                        </span>
                        {activeTab === tab.id && (
                            <span className="absolute bottom-1 w-1 h-1 rounded-full bg-primary" />
                        )}
                    </button>
                ))}
            </nav>
        </footer>
    );
}