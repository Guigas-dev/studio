import DashboardLayout from "@/components/layout/DashboardLayout";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { EquityChart } from "@/components/dashboard/EquityChart";
import { AllocationChart } from "@/components/dashboard/AllocationChart";
import { mockSummary } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { PlusCircle, FileText, Share2 } from "lucide-react";
import { AssetTable } from "@/components/dashboard/AssetTable";
import { mockAssets } from "@/lib/mock-data";

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-headline font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Aqui está uma visão geral do seu desempenho.</p>
        </div>
        <div className="flex gap-3">
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

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-headline font-bold">Ativos em Destaque</h3>
          <Button variant="link" className="text-primary p-0">Ver todos os ativos</Button>
        </div>
        <AssetTable assets={mockAssets.slice(0, 5)} />
      </div>
    </DashboardLayout>
  );
}