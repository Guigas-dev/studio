"use client"

import DashboardLayout from "@/components/layout/DashboardLayout";
import { BenchmarkChart } from "@/components/dashboard/BenchmarkChart";
import { EfficiencyChart } from "@/components/dashboard/EfficiencyChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Award, Target } from "lucide-react";

export default function BenchmarksPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-headline font-bold tracking-tight">Benchmarks</h2>
        <p className="text-muted-foreground">Compare sua rentabilidade com os principais índices do mercado.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <BenchmarkChart />
        </div>
        <div className="space-y-6">
          <Card className="border-border/50 bg-card/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Award className="w-4 h-4 text-primary" />
                Alpha da Carteira
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-headline font-bold">+13.6%</p>
              <p className="text-xs text-green-500 mt-1">Acima do CDI no período</p>
            </CardContent>
          </Card>
          
          <Card className="border-border/50 bg-card/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Target className="w-4 h-4 text-accent" />
                Índice de Sharpe
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-headline font-bold">1.82</p>
              <p className="text-xs text-muted-foreground mt-1">Excelente relação risco/retorno</p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-400" />
                Volatility (12m)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-headline font-bold">14.2%</p>
              <p className="text-xs text-muted-foreground mt-1">Risco moderado para o perfil</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EfficiencyChart />
        <Card className="border-border/50 bg-card/50 flex flex-col justify-center p-8">
          <div className="space-y-4">
            <h3 className="text-xl font-headline font-bold">Análise de Performance</h3>
            <p className="text-muted-foreground">
              Sua carteira tem demonstrado uma resiliência notável contra o CDI. O destaque fica para a alocação em ETFs Internacionais (IVVB11) que serviu como hedge durante as oscilações do Ibovespa.
            </p>
            <div className="pt-4 border-t border-border/50">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm">Consistência (Mensal)</span>
                <span className="text-sm font-bold">82%</span>
              </div>
              <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: '82%' }}></div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
