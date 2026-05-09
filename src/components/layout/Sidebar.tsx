"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Wallet, 
  ArrowLeftRight, 
  PieChart, 
  TrendingUp, 
  Settings, 
  LogOut,
  Sparkles,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { name: "Minha Carteira", icon: Wallet, href: "/portfolio" },
  { name: "Movimentações", icon: ArrowLeftRight, href: "/transactions" },
  { name: "Dividendos", icon: PieChart, href: "/dividends" },
  { name: "Benchmarks", icon: TrendingUp, href: "/benchmarks" },
  { name: "IA Insights", icon: Sparkles, href: "/insights" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-border h-screen sticky top-0 bg-sidebar flex flex-col">
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl premium-gradient flex items-center justify-center shadow-lg shadow-primary/20">
            <TrendingUp className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-headline font-bold text-gradient">DeltaWealth</span>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1 py-4">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.name} href={item.href}>
              <div className={cn(
                "flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 group",
                isActive 
                  ? "bg-primary/10 text-primary border-r-4 border-primary" 
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}>
                <div className="flex items-center gap-3">
                  <item.icon className={cn("w-5 h-5", isActive ? "text-primary" : "group-hover:text-primary")} />
                  <span className="font-medium text-sm">{item.name}</span>
                </div>
                {isActive && <ChevronRight className="w-4 h-4" />}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border mt-auto space-y-2">
        <Link href="/settings">
          <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground h-11">
            <Settings className="w-5 h-5" />
            <span>Configurações</span>
          </Button>
        </Link>
        <Button variant="ghost" className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10 h-11">
          <LogOut className="w-5 h-5" />
          <span>Sair</span>
        </Button>
      </div>
    </aside>
  );
}