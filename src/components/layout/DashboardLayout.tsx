'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { Sidebar } from "./Sidebar";
import { UserNav } from "./UserNav";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 border-b border-border/50 flex items-center justify-between px-8 bg-background/50 backdrop-blur-md sticky top-0 z-30">
          <div className="flex flex-col">
            <h1 className="text-sm font-medium text-muted-foreground">Olá, bem-vindo de volta!</h1>
            <p className="text-lg font-headline font-bold">{user.displayName || user.email?.split('@')[0] || 'Investidor'}</p>
          </div>
          <UserNav />
        </header>
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
