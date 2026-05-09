import DashboardLayout from "@/components/layout/DashboardLayout";
import { AssetTable } from "@/components/dashboard/AssetTable";
import { mockAssets } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function PortfolioPage() {
  return (
    <DashboardLayout>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-headline font-bold tracking-tight">Minha Carteira</h2>
          <p className="text-muted-foreground">Gerencie seus ativos e acompanhe o preço médio.</p>
        </div>
        <Button className="gap-2 premium-gradient border-none shadow-lg shadow-primary/20 px-6">
          <PlusCircle className="w-4 h-4" />
          Adicionar Ativo
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar por ticker ou nome..." 
            className="pl-10 bg-card/50 border-border/50 focus:border-primary/50"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-border/50 gap-2">
            <Filter className="w-4 h-4" />
            Filtrar
          </Button>
          <Button variant="outline" className="border-border/50">
            Exportar CSV
          </Button>
        </div>
      </div>

      <AssetTable assets={mockAssets} />
    </DashboardLayout>
  );
}