
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Asset } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";

interface AssetTableProps {
  assets: Asset[];
}

export function AssetTable({ assets }: AssetTableProps) {
  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="rounded-xl border border-border/50 bg-card/50 overflow-hidden">
      <Table>
        <TableHeader className="bg-secondary/30">
          <TableRow className="hover:bg-transparent border-border/50">
            <TableHead className="font-headline font-semibold">Ativo</TableHead>
            <TableHead className="font-headline font-semibold">Classe</TableHead>
            <TableHead className="font-headline font-semibold text-right">Qtd</TableHead>
            <TableHead className="font-headline font-semibold text-right">Preço Médio</TableHead>
            <TableHead className="font-headline font-semibold text-right">Cotação Atual</TableHead>
            <TableHead className="font-headline font-semibold text-right">Rentabilidade</TableHead>
            <TableHead className="font-headline font-semibold text-right">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assets.map((asset) => {
            const avg = asset.averagePrice || 0;
            const curr = asset.currentPrice || 0;
            const qty = asset.quantity || 0;
            
            const profitability = avg > 0 ? ((curr - avg) / avg) * 100 : 0;
            const isPositive = profitability >= 0;
            const total = qty * curr;

            return (
              <TableRow key={asset.id} className="hover:bg-secondary/20 border-border/50 transition-colors">
                <TableCell className="font-medium">
                  <div className="flex flex-col">
                    <span className="font-bold text-foreground">{asset.ticker}</span>
                    <span className="text-xs text-muted-foreground line-clamp-1">{asset.name || asset.ticker}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="bg-secondary text-[10px] uppercase font-bold tracking-wider">
                    {asset.type || 'Ativo'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">{qty}</TableCell>
                <TableCell className="text-right">{formatCurrency(avg)}</TableCell>
                <TableCell className="text-right font-semibold">{formatCurrency(curr)}</TableCell>
                <TableCell className="text-right">
                  <div className={`flex items-center justify-end gap-1 font-bold ${isPositive ? 'text-green-500' : 'text-destructive'}`}>
                    {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {profitability.toFixed(2)}%
                  </div>
                </TableCell>
                <TableCell className="text-right font-bold text-primary">
                  {formatCurrency(total)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
