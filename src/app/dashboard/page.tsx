import DashboardLayout from "@/components/layout/DashboardLayout";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { EquityChart } from "@/components/dashboard/EquityChart";
import { AllocationChart } from "@/components/dashboard/AllocationChart";
import { DividendsEvolutionChart } from "@/components/dashboard/DividendsEvolutionChart";
import { BenchmarkChart } from "@/components/dashboard/BenchmarkChart";
import { EfficiencyChart } from "@/components/dashboard/EfficiencyChart";
import { mockSummary } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { PlusCircle, FileText } from "lucide-react";
import { AssetTable } from "@/components/dashboard/AssetTable";
import { mockAssets } from "@/lib/mock-data";
import { B3ImportDialog } from "@/components/dashboard/B3ImportDialog";

export default function DashboardPage() {
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

      <SummaryCards summary={mockSummary} />

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
          <AssetTable assets={mockAssets.slice(0, 5)} />
        </div>
      </div>
    </DashboardLayout>
  );
}
