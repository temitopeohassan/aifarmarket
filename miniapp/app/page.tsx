'use client';

import { AppProvider, useApp } from '@/lib/context';
import NavBar from '@/components/navbar';
import Dashboard from '@/components/pages/dashboard';
import Agents from '@/components/pages/agents';
import Markets from '@/components/pages/markets';
import Trading from '@/components/pages/trading';
import Portfolio from '@/components/pages/portfolio';

function AppContent() {
  const { activeTab, isLoading } = useApp();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'agents':
        return <Agents />;
      case 'markets':
        return <Markets />;
      case 'trading':
        return <Trading />;
      case 'portfolio':
        return <Portfolio />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <NavBar />
      <main className="max-w-7xl mx-auto px-4 py-8">
        {renderContent()}
      </main>
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
