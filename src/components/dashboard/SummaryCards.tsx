import { Card, CardContent } from "@/components/ui/card";
import { PortfolioSummary } from "@/lib/types";
import { TrendingUp, Wallet, DollarSign, PieChart, ArrowUpRight } from "lucide-react";

interface SummaryCardsProps {
  summary: PortfolioSummary;
}

export function SummaryCards({ summary }: SummaryCardsProps) {
  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const cards = [
    {
      title: "Patrimônio Total",
      value: formatCurrency(summary.totalEquity),
      icon: Wallet,
      trend: "+2.4%",
      color: "text-primary",
    },
    {
      title: "Rentabilidade Total",
      value: `${summary.totalProfitLossPercentage}%`,
      subValue: formatCurrency(summary.totalProfitLoss),
      icon: TrendingUp,
      trend: "+15.2%",
      color: "text-green-500",
    },
    {
      title: "Rendimento Mensal",
      value: formatCurrency(summary.monthlyIncome),
      icon: DollarSign,
      trend: "+5.1%",
      color: "text-accent",
    },
    {
      title: "Dividendos Totais",
      value: formatCurrency(summary.totalDividends),
      icon: PieChart,
      trend: "+12.8%",
      color: "text-purple-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <Card key={i} className="border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-lg bg-secondary ${card.color}`}>
                <card.icon className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-1 text-xs font-medium text-green-500 bg-green-500/10 px-2 py-1 rounded-full">
                <ArrowUpRight className="w-3 h-3" />
                {card.trend}
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
              <h3 className="text-2xl font-bold font-headline">{card.value}</h3>
              {card.subValue && (
                <p className="text-xs text-muted-foreground">{card.subValue}</p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}