
"use client"

import { useState, useEffect, useMemo } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, TrendingUp, PiggyBank, Loader2 } from "lucide-react";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";

export default function DividendsPage() {
  const [mounted, setMounted] = useState(false);
  const { user } = useUser();
  const firestore = useFirestore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const dividendsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'users', user.uid, 'dividends'),
      orderBy('date', 'desc')
    );
  }, [firestore, user?.uid]);

  const { data: dividends, loading } = useCollection(dividendsQuery);

  const totalDividends = useMemo(() => {
    if (!dividends) return 0;
    return dividends.reduce((acc, curr: any) => acc + curr.amount, 0);
  }, [dividends]);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const formatDate = (dateStr: string) => {
    if (!mounted) return "...";
    try {
      const date = new Date(dateStr + 'T12:00:00');
      return date.toLocaleDateString('pt-BR');
    } catch (e) {
      return dateStr;
    }
  };

  // Prepara dados para o gráfico baseado nos dividendos reais (agrupados por mês simplificado)
  const chartData = useMemo(() => {
    if (!dividends || dividends.length === 0) return [];
    // Apenas uma representação visual simples para os últimos lançamentos
    return dividends.slice(0, 6).reverse().map((d: any) => ({
      name: d.ticker,
      value: d.amount
    }));
  }, [dividends]);

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-headline font-bold tracking-tight">Dividendos</h2>
          <p className="text-muted-foreground">Acompanhe sua renda passiva real vinda das suas importações.</p>
        </div>
        <div className="flex items-center gap-4 bg-primary/10 border border-primary/20 rounded-xl px-6 py-3">
          <CalendarDays className="w-5 h-5 text-primary" />
          <div>
            <p className="text-xs text-muted-foreground">Total Acumulado</p>
            <p className="text-lg font-headline font-bold text-primary">{formatCurrency(totalDividends)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 lg:col-span-2 border-border/50 bg-card/50">
          <CardHeader>
            <CardTitle className="text-lg font-headline">Últimos Lançamentos</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {loading ? (
              <div className="flex h-full items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#8a8a8a' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8a8a8a' }} tickFormatter={(val) => `R$ ${val}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F1824', border: 'none', borderRadius: '8px' }}
                    cursor={{ fill: 'rgba(134, 51, 230, 0.1)' }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} fill="#8633E6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                Sem dados para o gráfico.
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-border/50 bg-card/50 premium-gradient text-white border-none shadow-xl shadow-primary/20">
            <CardHeader>
              <CardTitle className="text-lg font-headline flex items-center gap-2">
                <PiggyBank className="w-5 h-5" />
                Renda Passiva
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold font-headline">{formatCurrency(totalDividends)}</p>
              <p className="text-white/70 text-sm mt-1">Total identificado em seus extratos importados.</p>
            </CardContent>
          </Card>
          
          <Card className="border-border/50 bg-card/50 border-l-4 border-l-accent">
            <CardHeader>
              <CardTitle className="text-lg font-headline flex items-center gap-2 text-accent">
                <TrendingUp className="w-5 h-5" />
                Frequência
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold font-headline">{dividends?.length || 0}</p>
              <p className="text-muted-foreground text-sm mt-1">Pagamentos registrados na base.</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-headline font-bold">Lançamentos Recentes</h3>
        <div className="rounded-xl border border-border/50 bg-card/50 overflow-hidden min-h-[200px]">
          {loading ? (
             <div className="flex h-32 items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
             </div>
          ) : !dividends || dividends.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-muted-foreground">
              Nenhum dividendo registrado.
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-secondary/30">
                <TableRow className="border-border/50">
                  <TableHead className="font-headline">Data</TableHead>
                  <TableHead className="font-headline">Ativo</TableHead>
                  <TableHead className="font-headline">Descrição</TableHead>
                  <TableHead className="font-headline text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dividends.map((div: any) => (
                  <TableRow key={div.id} className="border-border/50 hover:bg-secondary/20">
                    <TableCell>{formatDate(div.date)}</TableCell>
                    <TableCell className="font-bold">{div.ticker}</TableCell>
                    <TableCell className="text-xs text-muted-foreground truncate max-w-[200px]">
                      {div.description}
                    </TableCell>
                    <TableCell className="text-right font-bold text-green-500">
                      {formatCurrency(div.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
