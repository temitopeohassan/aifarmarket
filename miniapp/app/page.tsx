'use client';

import { useState, useEffect } from 'react';
import { AppProvider, useApp } from '@/lib/context';
import { useFarcasterWallet } from '@/components/farcaster-sdk-provider';
import NavBar from '@/components/navbar';
import Footer from '@/components/footer';
import CreateAccount from '@/components/pages/create-account';
import Dashboard from '@/components/pages/dashboard';
import Agents from '@/components/pages/agents';
import Markets from '@/components/pages/markets';
import Trading from '@/components/pages/trading';
import Portfolio from '@/components/pages/portfolio';

function AppContent() {
  const { activeTab, isLoading } = useApp();
  const { address } = useFarcasterWallet();

  const [checkingAccount, setCheckingAccount] = useState(true);
  const [hasAccount, setHasAccount] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      if (!address) return;

      try {
        // Query your database for this address
        const res = await fetch(`/api/user-exists?address=${address}`);
        const data = await res.json();

        setHasAccount(data.exists);
      } catch (e) {
        console.error("Check user failed", e);
      } finally {
        setCheckingAccount(false);
      }
    };

    checkUser();
  }, [address]);

  // Loading state for both SDK and Database check
  if (isLoading || (address && checkingAccount)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If user is connected but not in DB, show CreateAccount
  if (address && !hasAccount) {
    return (
      <div className="min-h-screen bg-background flex flex-col p-6">
        {/* Update the prop name here to match the new component definition */}
        <CreateAccount onAccountCreatedAction={() => setHasAccount(true)} />
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'agents': return <Agents />;
      case 'markets': return <Markets />;
      case 'trading': return <Trading />;
      case 'portfolio': return <Portfolio />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <NavBar />

      {/* Added pb-20 to ensure content isn't covered by the fixed footer */}
      <main className="flex-1 max-w-7xl mx-auto px-4 py-6 pb-20 w-full">
        {renderContent()}
      </main>

      <Footer />
    </div>
  );
}

export default function Home() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}