export type AssetType = 'Ações' | 'FIIs' | 'ETFs' | 'BDRs' | 'Renda Fixa' | 'Criptomoedas' | 'Stocks Internacionais' | 'Outros';

export interface Asset {
  id: string;
  name: string;
  ticker: string;
  type: AssetType;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  segment?: string;
  sector?: string;
}

export interface Transaction {
  id: string;
  assetId: string;
  ticker: string;
  type: 'buy' | 'sell';
  date: string;
  quantity: number;
  price: number;
  amount: number;
  fees?: number;
}

export interface Dividend {
  id: string;
  assetId: string;
  ticker: string;
  amount: number;
  date: string;
  type: 'dividend' | 'jcp' | 'rendimento';
}

export interface PortfolioSummary {
  totalEquity: number;
  totalProfitLoss: number;
  totalProfitLossPercentage: number;
  monthlyIncome: number;
  totalDividends: number;
}