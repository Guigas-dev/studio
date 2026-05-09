"use client"

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { mockTransactions } from "@/lib/mock-data";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileDown, PlusCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function TransactionsPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const formatDate = (dateStr: string) => {
    if (!mounted) return "...";
    const date = new Date(dateStr + 'T12:00:00');
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-headline font-bold tracking-tight">Movimentações</h2>
          <p className="text-muted-foreground">Histórico completo de compras, vendas e proventos.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2 border-border/50">
            <FileDown className="w-4 h-4" />
            Exportar
          </Button>
          <Button className="gap-2 premium-gradient border-none shadow-lg shadow-primary/20">
            <PlusCircle className="w-4 h-4" />
            Nova Operação
          </Button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input 
          placeholder="Filtrar por ticker ou data..." 
          className="pl-10 bg-card/50 border-border/50 focus:border-primary/50"
        />
      </div>

      <div className="rounded-xl border border-border/50 bg-card/50 overflow-hidden">
        <Table>
          <TableHeader className="bg-secondary/30">
            <TableRow className="border-border/50">
              <TableHead className="font-headline">Data</TableHead>
              <TableHead className="font-headline">Ativo</TableHead>
              <TableHead className="font-headline">Tipo</TableHead>
              <TableHead className="font-headline text-right">Qtd</TableHead>
              <TableHead className="font-headline text-right">Preço</TableHead>
              <TableHead className="font-headline text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockTransactions.map((tx) => (
              <TableRow key={tx.id} className="border-border/50 hover:bg-secondary/20">
                <TableCell>{formatDate(tx.date)}</TableCell>
                <TableCell className="font-bold">{tx.ticker}</TableCell>
                <TableCell>
                  <Badge 
                    variant="outline" 
                    className={tx.type === 'buy' 
                      ? "border-green-500/30 text-green-500" 
                      : "border-destructive/30 text-destructive"
                    }
                  >
                    {tx.type === 'buy' ? 'COMPRA' : 'VENDA'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">{tx.quantity}</TableCell>
                <TableCell className="text-right">{formatCurrency(tx.price)}</TableCell>
                <TableCell className="text-right font-bold">
                  {formatCurrency(tx.amount)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </DashboardLayout>
  );
}
