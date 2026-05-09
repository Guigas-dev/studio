"use client"

import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, BrainCircuit, RefreshCw, CheckCircle2, AlertTriangle, Lightbulb, Info } from "lucide-react";
import { useState } from "react";
import { aiPortfolioInsights, AIPortfolioInsightsOutput } from "@/ai/flows/ai-portfolio-insights-flow";
import { mockAssets, mockSummary } from "@/lib/mock-data";
import { Skeleton } from "@/components/ui/skeleton";

export default function InsightsPage() {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<AIPortfolioInsightsOutput | null>(null);

  const generateInsights = async () => {
    setLoading(true);
    try {
      const result = await aiPortfolioInsights({
        assets: mockAssets,
        totalPortfolioValue: mockSummary.totalEquity,
        totalProfitLoss: mockSummary.totalProfitLoss,
        userGoals: "Crescimento de longo prazo e geração de renda passiva com risco moderado.",
        currentMarketConditions: "Mercado volátil devido a incertezas fiscais no Brasil e taxas de juros americanas altas."
      });
      setInsights(result);
    } catch (error) {
      console.error("Failed to fetch insights:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-headline font-bold tracking-tight">IA Insights</h2>
          <p className="text-muted-foreground">Análise inteligente da sua carteira baseada em IA generativa.</p>
        </div>
        <Button 
          onClick={generateInsights} 
          disabled={loading}
          className="gap-2 premium-gradient border-none shadow-lg shadow-primary/20 px-6 h-12"
        >
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <BrainCircuit className="w-5 h-5" />}
          {insights ? "Atualizar Análise" : "Gerar Insights"}
        </Button>
      </div>

      {!insights && !loading && (
        <Card className="border-dashed border-2 border-border/50 bg-secondary/10 flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-headline mb-2">Descubra o potencial da sua carteira</CardTitle>
          <CardDescription className="max-w-md text-lg px-4">
            Nossa IA analisa cada detalhe dos seus ativos, diversificação e riscos para oferecer sugestões personalizadas de rebalanceamento.
          </CardDescription>
          <Button onClick={generateInsights} className="mt-8 gap-2 bg-secondary hover:bg-secondary/80 text-foreground px-8">
            Começar Análise Agora
          </Button>
        </Card>
      )}

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="border-border/50 bg-card/50">
              <CardHeader>
                <Skeleton className="h-6 w-1/3 mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {insights && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-bottom-4 duration-700">
          <Card className="border-border/50 bg-card/50 hover:border-primary/30 transition-all border-l-4 border-l-primary">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <PieChart className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg font-headline">Análise de Diversificação</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {insights.diversificationAnalysis}
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 hover:border-destructive/30 transition-all border-l-4 border-l-destructive">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="p-2 rounded-lg bg-destructive/10">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <CardTitle className="text-lg font-headline">Fatores de Risco</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {insights.riskFactors}
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 hover:border-accent/30 transition-all border-l-4 border-l-accent">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="p-2 rounded-lg bg-accent/10">
                <Lightbulb className="w-6 h-6 text-accent" />
              </div>
              <div>
                <CardTitle className="text-lg font-headline">Sugestões de Performance</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {insights.performanceSuggestions}
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 hover:border-purple-400/30 transition-all border-l-4 border-l-purple-400">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="p-2 rounded-lg bg-purple-400/10">
                <Info className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <CardTitle className="text-lg font-headline">Panorama do Mercado</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {insights.generalMarketOutlook}
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}