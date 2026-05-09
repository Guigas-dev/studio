import DashboardLayout from "@/components/layout/DashboardLayout";
import { mockDividends } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, TrendingUp, PiggyBank } from "lucide-react";

const monthlyData = [
  { month: 'Jul', value: 450 },
  { month: 'Ago', value: 520 },
  { month: 'Set', value: 380 },
  { month: 'Out', value: 610 },
  { month: 'Nov', value: 850 },
  { month: 'Dez', value: 740 },
];

export default function DividendsPage() {
  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-headline font-bold tracking-tight">Dividendos</h2>
          <p className="text-muted-foreground">Acompanhe sua renda passiva e projeções.</p>
        </div>
        <div className="flex items-center gap-4 bg-primary/10 border border-primary/20 rounded-xl px-6 py-3">
          <CalendarDays className="w-5 h-5 text-primary" />
          <div>
            <p className="text-xs text-muted-foreground">Média Mensal (12m)</p>
            <p className="text-lg font-headline font-bold text-primary">{formatCurrency(590.25)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 lg:col-span-2 border-border/50 bg-card/50">
          <CardHeader>
            <CardTitle className="text-lg font-headline">Histórico de Recebimentos</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#8a8a8a' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8a8a8a' }} tickFormatter={(val) => `R$ ${val}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F1824', border: 'none', borderRadius: '8px' }}
                  cursor={{ fill: 'rgba(134, 51, 230, 0.1)' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {monthlyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === monthlyData.length - 2 ? '#8633E6' : '#8633E640'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-border/50 bg-card/50 premium-gradient text-white border-none shadow-xl shadow-primary/20">
            <CardHeader>
              <CardTitle className="text-lg font-headline flex items-center gap-2">
                <PiggyBank className="w-5 h-5" />
                Yield on Cost (YOC)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold font-headline">8.42%</p>
              <p className="text-white/70 text-sm mt-1">Sua rentabilidade real sobre o capital investido.</p>
            </CardContent>
          </Card>
          
          <Card className="border-border/50 bg-card/50 border-l-4 border-l-accent">
            <CardHeader>
              <CardTitle className="text-lg font-headline flex items-center gap-2 text-accent">
                <TrendingUp className="w-5 h-5" />
                Crescimento Dividendos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold font-headline">+12.4%</p>
              <p className="text-muted-foreground text-sm mt-1">Comparado ao mesmo período do ano passado.</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-headline font-bold">Lançamentos Recentes</h3>
        <div className="rounded-xl border border-border/50 bg-card/50 overflow-hidden">
          <Table>
            <TableHeader className="bg-secondary/30">
              <TableRow className="border-border/50">
                <TableHead className="font-headline">Data</TableHead>
                <TableHead className="font-headline">Ativo</TableHead>
                <TableHead className="font-headline">Tipo</TableHead>
                <TableHead className="font-headline text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockDividends.map((div) => (
                <TableRow key={div.id} className="border-border/50 hover:bg-secondary/20">
                  <TableCell>{new Date(div.date).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell className="font-bold">{div.ticker}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-primary/30 text-primary uppercase text-[10px]">
                      {div.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-bold text-green-500">
                    {formatCurrency(div.amount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  );
}