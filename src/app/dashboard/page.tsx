
'use client';

import { useMemo } from 'react';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { EquityChart } from "@/components/dashboard/EquityChart";
import { AllocationChart } from "@/components/dashboard/AllocationChart";
import { DividendsEvolutionChart } from "@/components/dashboard/DividendsEvolutionChart";
import { BenchmarkChart } from "@/components/dashboard/BenchmarkChart";
import { EfficiencyChart } from "@/components/dashboard/EfficiencyChart";
import { Button } from "@/components/ui/button";
import { PlusCircle, FileText, Loader2, TrendingUp, Sparkles } from "lucide-react";
import { AssetTable } from "@/components/dashboard/AssetTable";
import { B3ImportDialog } from "@/components/dashboard/B3ImportDialog";
import { useUser, useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, limit } from "firebase/firestore";
import { Asset, PortfolioSummary } from "@/lib/types";

export default function DashboardPage() {
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();

  const assetsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'users', user.uid, 'assets'), limit(10));
  }, [firestore, user?.uid]);

  const { data: assets, loading: assetsLoading } = useCollection<Asset>(assetsQuery);

  const summary: PortfolioSummary = useMemo(() => {
    if (!assets || assets.length === 0) {
      return {
        totalEquity: 0,
        totalProfitLoss: 0,
        totalProfitLossPercentage: 0,
        monthlyIncome: 0,
        totalDividends: 0,
      };
    }

    const totalEquity = assets.reduce((acc, asset) => acc + (asset.quantity * (asset.currentPrice || 0)), 0);
    const totalCost = assets.reduce((acc, asset) => acc + (asset.quantity * (asset.averagePrice || 0)), 0);
    const totalProfitLoss = totalEquity - totalCost;
    const totalProfitLossPercentage = totalCost > 0 ? (totalProfitLoss / totalCost) * 100 : 0;

    return {
      totalEquity,
      totalProfitLoss,
      totalProfitLossPercentage: parseFloat(totalProfitLossPercentage.toFixed(2)),
      monthlyIncome: 0,
      totalDividends: 0,
    };
  }, [assets]);

  if (userLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  const hasAssets = assets && assets.length > 0;

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-headline font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Olá, <span className="text-primary font-medium">{user?.displayName || user?.email?.split('@')[0]}</span>. Aqui está sua visão geral.
          </p>
        </div>
        <div className="flex gap-3">
          <B3ImportDialog />
          <Button variant="outline" className="gap-2 border-border/50">
            <FileText className="w-4 h-4" />
            Relatórios
          </Button>
          <Button className="gap-2 premium-gradient border-none shadow-lg shadow-primary/20">
            <PlusCircle className="w-4 h-4" />
            Novo Ativo
          </Button>
        </div>
      </div>

      {!hasAssets && !assetsLoading ? (
        <div className="relative overflow-hidden flex flex-col items-center justify-center py-20 px-4 text-center border border-dashed border-primary/30 rounded-3xl bg-primary/5 space-y-6 animate-in fade-in zoom-in duration-700">
          <div className="absolute top-[-20%] left-[-10%] w-[40%] h-[60%] bg-primary/10 rounded-full blur-[100px]" />
          
          <div className="w-24 h-24 rounded-2xl premium-gradient flex items-center justify-center shadow-2xl shadow-primary/30 rotate-3 relative z-10">
            <Sparkles className="text-white w-12 h-12 animate-pulse" />
          </div>
          
          <div className="max-w-md space-y-3 relative z-10">
            <h3 className="text-3xl font-headline font-bold">Pronto para começar?</h3>
            <p className="text-muted-foreground text-lg">
              Sua carteira está conectada ao Firebase, mas ainda não tem ativos. Use nossa importação de IA para carregar seus dados da B3 instantaneamente.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 relative z-10">
            <B3ImportDialog />
            <Button variant="ghost" className="text-muted-foreground hover:text-primary">
              Como funciona?
            </Button>
          </div>
        </div>
      ) : (
        <>
          <SummaryCards summary={summary} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <EquityChart />
            <AllocationChart />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <BenchmarkChart />
            <EfficiencyChart />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <DividendsEvolutionChart />
            </div>
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-headline font-bold">Meus Ativos</h3>
                <Button variant="link" className="text-primary p-0">Ver todos os ativos</Button>
              </div>
              {assetsLoading ? (
                 <div className="flex justify-center p-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                 </div>
              ) : (
                <AssetTable assets={assets || []} />
              )}
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
