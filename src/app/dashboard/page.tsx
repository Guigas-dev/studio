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
import { PlusCircle, FileText, Loader2, Sparkles } from "lucide-react";
import { AssetTable } from "@/components/dashboard/AssetTable";
import { B3ImportDialog } from "@/components/dashboard/B3ImportDialog";
import { useUser, useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, limit } from "firebase/firestore";
import { Asset, PortfolioSummary, Dividend } from "@/lib/types";

export default function DashboardPage() {
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();

  const assetsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'users', user.uid, 'assets'), limit(50));
  }, [firestore, user?.uid]);

  const dividendsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'users', user.uid, 'dividends'));
  }, [firestore, user?.uid]);

  const { data: assets, loading: assetsLoading } = useCollection<Asset>(assetsQuery);
  const { data: dividends } = useCollection<Dividend>(dividendsQuery);

  const summary: PortfolioSummary = useMemo(() => {
    const defaultSummary = {
      totalEquity: 0,
      totalProfitLoss: 0,
      totalProfitLossPercentage: 0,
      monthlyIncome: 0,
      totalDividends: 0,
    };

    if (!assets) return defaultSummary;

    const totalEquity = assets.reduce((acc, asset) => {
      const val = (Number(asset.quantity) || 0) * (Number(asset.currentPrice) || 0);
      return acc + (isNaN(val) ? 0 : val);
    }, 0);

    const totalCost = assets.reduce((acc, asset) => {
      const val = (Number(asset.quantity) || 0) * (Number(asset.averagePrice) || 0);
      return acc + (isNaN(val) ? 0 : val);
    }, 0);

    const totalProfitLoss = totalEquity - totalCost;
    const totalProfitLossPercentage = totalCost > 0 ? (totalProfitLoss / totalCost) * 100 : 0;
    const totalDividends = dividends?.reduce((acc, div) => acc + (Number(div.amount) || 0), 0) || 0;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const monthlyIncome = dividends?.reduce((acc, div) => {
      if (!div.date) return acc;
      const divDate = new Date(div.date + 'T12:00:00');
      if (divDate.getMonth() === currentMonth && divDate.getFullYear() === currentYear) {
        return acc + (Number(div.amount) || 0);
      }
      return acc;
    }, 0) || 0;

    return {
      totalEquity: isNaN(totalEquity) ? 0 : totalEquity,
      totalProfitLoss: isNaN(totalProfitLoss) ? 0 : totalProfitLoss,
      totalProfitLossPercentage: isNaN(totalProfitLossPercentage) ? 0 : parseFloat(totalProfitLossPercentage.toFixed(2)),
      monthlyIncome: isNaN(monthlyIncome) ? 0 : monthlyIncome, 
      totalDividends: isNaN(totalDividends) ? 0 : totalDividends,
    };
  }, [assets, dividends]);

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
            Olá, <span className="text-primary font-medium">{user?.displayName || user?.email?.split('@')[0]}</span>.
          </p>
        </div>
        <div className="flex gap-3">
          <B3ImportDialog />
          <Button variant="outline" className="gap-2 border-border/50">
            <FileText className="w-4 h-4" /> Relatórios
          </Button>
          <Button className="gap-2 premium-gradient border-none shadow-lg shadow-primary/20">
            <PlusCircle className="w-4 h-4" /> Novo Ativo
          </Button>
        </div>
      </div>

      {!hasAssets && !assetsLoading ? (
        <div className="relative overflow-hidden flex flex-col items-center justify-center py-20 px-4 text-center border border-dashed border-primary/30 rounded-3xl bg-primary/5 space-y-6">
          <div className="max-w-md space-y-3 relative z-10">
            <h3 className="text-3xl font-headline font-bold">Importe seus dados</h3>
            <p className="text-muted-foreground text-lg">Use a IA para ler seus PDFs e planilhas instantaneamente.</p>
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
            <div className="lg:col-span-1"><DividendsEvolutionChart /></div>
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-xl font-headline font-bold">Meus Ativos</h3>
              {assetsLoading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : <AssetTable assets={assets || []} />}
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
