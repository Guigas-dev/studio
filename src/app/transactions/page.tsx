
"use client"

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileDown, PlusCircle, Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";

export default function TransactionsPage() {
  const [mounted, setMounted] = useState(false);
  const { user } = useUser();
  const firestore = useFirestore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const transactionsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'users', user.uid, 'transactions'),
      orderBy('date', 'desc')
    );
  }, [firestore, user?.uid]);

  const { data: transactions, loading } = useCollection(transactionsQuery);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const formatDate = (dateStr: string) => {
    if (!mounted) return "...";
    // Tenta formatar a data ISO YYYY-MM-DD
    try {
      const date = new Date(dateStr + 'T12:00:00');
      return date.toLocaleDateString('pt-BR');
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-headline font-bold tracking-tight">Movimentações</h2>
          <p className="text-muted-foreground">Histórico completo de compras e vendas salvas no seu banco de dados.</p>
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

      <div className="rounded-xl border border-border/50 bg-card/50 overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : !transactions || transactions.length === 0 ? (
          <div className="flex flex-col h-64 items-center justify-center text-muted-foreground gap-4">
            <p>Nenhuma movimentação encontrada.</p>
            <p className="text-xs">Use a importação da B3 no Dashboard para começar.</p>
          </div>
        ) : (
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
              {transactions.map((tx: any) => (
                <TableRow key={tx.id} className="border-border/50 hover:bg-secondary/20">
                  <TableCell>{formatDate(tx.date)}</TableCell>
                  <TableCell className="font-bold">{tx.ticker || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={tx.type === 'buy' 
                        ? "border-green-500/30 text-green-500" 
                        : tx.type === 'sell' ? "border-destructive/30 text-destructive" : "border-muted text-muted"
                      }
                    >
                      {tx.type === 'buy' ? 'COMPRA' : tx.type === 'sell' ? 'VENDA' : 'OUTRO'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{tx.quantity || '-'}</TableCell>
                  <TableCell className="text-right">{tx.price ? formatCurrency(tx.price) : '-'}</TableCell>
                  <TableCell className="text-right font-bold">
                    {formatCurrency(tx.amount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </DashboardLayout>
  );
}
