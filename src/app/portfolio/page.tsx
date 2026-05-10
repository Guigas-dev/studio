'use client';

import { useMemo, useState } from 'react';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { AssetTable } from "@/components/dashboard/AssetTable";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search, Filter, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useUser, useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { Asset } from "@/lib/types";

export default function PortfolioPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [searchTerm, setSearchTerm] = useState("");

  const assetsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'users', user.uid, 'assets'),
      orderBy('ticker', 'asc')
    );
  }, [firestore, user?.uid]);

  const { data: assets, loading } = useCollection<Asset>(assetsQuery);

  const filteredAssets = useMemo(() => {
    if (!assets) return [];
    return assets.filter(asset => 
      asset.ticker.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [assets, searchTerm]);

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-headline font-bold tracking-tight">Minha Carteira</h2>
          <p className="text-muted-foreground">Gerencie seus ativos e acompanhe o preço médio real.</p>
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
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Carregando seus ativos...</p>
        </div>
      ) : filteredAssets.length > 0 ? (
        <AssetTable assets={filteredAssets} />
      ) : (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-border rounded-xl bg-secondary/10">
          <p className="text-muted-foreground mb-4">Nenhum ativo encontrado na sua carteira.</p>
          <Button variant="outline" className="border-primary/30 text-primary">
            Importar dados da B3 no Dashboard
          </Button>
        </div>
      )}
    </DashboardLayout>
  );
}
