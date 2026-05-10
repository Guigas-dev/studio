
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
import { PlusCircle, FileText, Loader2 } from "lucide-react";
import { AssetTable } from "@/components/dashboard/AssetTable";
import { B3ImportDialog } from "@/components/dashboard/B3ImportDialog";
import { useUser, useCollection, useFirestore } from "@/firebase";
import { collection, query, limit } from "firebase/firestore";
import { Asset, PortfolioSummary } from "@/lib/types";

export default function DashboardPage() {
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();

  const assetsQuery = useMemo(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'users', user.uid, 'assets'), limit(10));
  }, [firestore, user]);

  const { data: assets, loading: assetsLoading } = useCollection<Asset>(assetsQuery);

  // Calcula o resumo em tempo real baseado nos ativos (em um app real isso seria mais complexo)
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
    const totalCost = assets.reduce((acc, asset) => acc + (asset.quantity * asset.averagePrice), 0);
    const totalProfitLoss = totalEquity - totalCost;
    const totalProfitLossPercentage = totalCost > 0 ? (totalProfitLoss / totalCost) * 100 : 0;

    return {
      totalEquity,
      totalProfitLoss,
      totalProfitLossPercentage: parseFloat(totalProfitLossPercentage.toFixed(2)),
      monthlyIncome: 590.25, // Mock por enquanto até termos a lógica de dividendos mensais
      totalDividends: 5230.15, // Mock por enquanto
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

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-headline font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Aqui está uma visão geral do seu desempenho.</p>
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
            <h3 className="text-xl font-headline font-bold">Ativos em Destaque</h3>
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
    </DashboardLayout>
  );
}
