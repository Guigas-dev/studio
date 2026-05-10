
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
import { PlusCircle, FileText, Loader2, Wand2, TrendingUp } from "lucide-react";
import { AssetTable } from "@/components/dashboard/AssetTable";
import { B3ImportDialog } from "@/components/dashboard/B3ImportDialog";
import { useUser, useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, limit } from "firebase/firestore";
import { Asset, PortfolioSummary } from "@/lib/types";
import Image from "next/image";

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

    const totalEquity = assets.reduce((acc, asset) => acc + (asset.quantity * asset.currentPrice), 0);
    const totalCost = assets.reduce((acc, asset) => acc + (asset.quantity * (asset.averagePrice || 0)), 0);
    const totalProfitLoss = totalEquity - totalCost;
    const totalProfitLossPercentage = totalCost > 0 ? (totalProfitLoss / totalCost) * 100 : 0;

    return {
      totalEquity,
      totalProfitLoss,
      totalProfitLossPercentage: parseFloat(totalProfitLossPercentage.toFixed(2)),
      monthlyIncome: 0, // No mock data anymore, will be calculated from dividends if implemented
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
        <div>
          <h2 className="text-3xl font-headline font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Bem-vindo, {user?.displayName || 'Investidor'}. Aqui está sua visão geral.</p>
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
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center border border-dashed border-primary/20 rounded-3xl bg-primary/5 space-y-6 animate-in fade-in zoom-in duration-700">
          <div className="w-20 h-20 rounded-2xl premium-gradient flex items-center justify-center shadow-2xl shadow-primary/30 rotate-3">
            <TrendingUp className="text-white w-10 h-10" />
          </div>
          <div className="max-w-md space-y-2">
            <h3 className="text-2xl font-headline font-bold">Sua jornada começa aqui</h3>
            <p className="text-muted-foreground">
              Sua carteira ainda está vazia. Use a nossa importação inteligente para carregar seus dados da B3 em segundos.
            </p>
          </div>
          <B3ImportDialog />
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
