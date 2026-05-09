import { Asset, Transaction, Dividend, PortfolioSummary } from './types';

export const mockAssets: Asset[] = [
  { id: '1', name: 'Petróleo Brasileiro S.A.', ticker: 'PETR4', type: 'Ações', quantity: 100, averagePrice: 30.50, currentPrice: 38.20, segment: 'Petróleo e Gás', sector: 'Energia' },
  { id: '2', name: 'iShares IVVB11', ticker: 'IVVB11', type: 'ETFs', quantity: 50, averagePrice: 220.00, currentPrice: 285.50, segment: 'S&P 500', sector: 'Estrangeiro' },
  { id: '3', name: 'HGLG11 - Logística', ticker: 'HGLG11', type: 'FIIs', quantity: 20, averagePrice: 155.00, currentPrice: 162.30, segment: 'Logística', sector: 'Imobiliário' },
  { id: '4', name: 'Apple Inc.', ticker: 'AAPL', type: 'Stocks Internacionais', quantity: 10, averagePrice: 150.00, currentPrice: 189.40, segment: 'Tecnologia', sector: 'Tech' },
  { id: '5', name: 'Bitcoin', ticker: 'BTC', type: 'Criptomoedas', quantity: 0.05, averagePrice: 150000.00, currentPrice: 320000.00, segment: 'Moeda Digital', sector: 'Cripto' },
];

export const mockSummary: PortfolioSummary = {
  totalEquity: 84520.45,
  totalProfitLoss: 12450.30,
  totalProfitLossPercentage: 17.2,
  monthlyIncome: 850.40,
  totalDividends: 5230.15,
};

export const mockTransactions: Transaction[] = [
  { id: 't1', assetId: '1', ticker: 'PETR4', type: 'buy', date: '2023-10-15', quantity: 50, price: 29.50, amount: 1475.00 },
  { id: 't2', assetId: '1', ticker: 'PETR4', type: 'buy', date: '2023-11-20', quantity: 50, price: 31.50, amount: 1575.00 },
  { id: 't3', assetId: '2', ticker: 'IVVB11', type: 'buy', date: '2023-08-10', quantity: 50, price: 220.00, amount: 11000.00 },
];

export const mockDividends: Dividend[] = [
  { id: 'd1', assetId: '1', ticker: 'PETR4', amount: 120.50, date: '2024-01-20', type: 'dividend' },
  { id: 'd2', assetId: '3', ticker: 'HGLG11', amount: 22.00, date: '2024-01-15', type: 'rendimento' },
  { id: 'd3', assetId: '1', ticker: 'PETR4', amount: 85.20, date: '2023-12-15', type: 'jcp' },
];