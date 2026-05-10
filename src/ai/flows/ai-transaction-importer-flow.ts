'use server';
/**
 * @fileOverview A Genkit flow for parsing raw financial statements or files to identify and categorize investment transactions.
 *
 * - aiTransactionImporter - A function that handles the AI-powered transaction import process.
 * - AITransactionImporterInput - The input type for the aiTransactionImporter function.
 * - AITransactionImporterOutput - The return type for the aiTransactionImporter function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AITransactionImporterInputSchema = z.object({
  rawStatement: z.string().optional().describe('Raw financial statement text, which can be a CSV snippet, tabular data from a spreadsheet, or unstructured text.'),
  fileDataUri: z.string().optional().describe('A data URI of the financial statement (PDF, Image). Expected format: "data:<mimetype>;base64,<encoded_data>".'),
});
export type AITransactionImporterInput = z.infer<typeof AITransactionImporterInputSchema>;

const TransactionTypeSchema = z.enum(['buy', 'sell', 'dividend', 'other']).describe('The type of financial transaction identified.');

const AITransactionSchema = z.object({
  type: TransactionTypeSchema,
  date: z.string().describe('The date of the transaction in YYYY-MM-DD format.'),
  ticker: z.string().optional().nullable().describe('The ticker symbol of the asset involved in the transaction (e.g., "PETR4", "IVVB11"). Use null if not inferable.'),
  description: z.string().describe('A brief description of the transaction.'),
  quantity: z.number().optional().nullable().describe('The quantity of the asset involved for buy/sell transactions.'),
  price: z.number().optional().nullable().describe('The price per unit of the asset for buy/sell transactions.'),
  amount: z.number().describe('The total financial amount of the transaction.'),
  suggestedCategory: z.string().optional().nullable().describe('A suggested category for the asset (Ações, FIIs, ETFs, BDRs, Renda Fixa, Cripto, etc.).'),
  originalLine: z.string().describe('The exact line or reference from the raw data.'),
});

const AITransactionImporterOutputSchema = z.array(AITransactionSchema).describe('An array of identified and categorized financial transactions.');
export type AITransactionImporterOutput = z.infer<typeof AITransactionImporterOutputSchema>;

export async function aiTransactionImporter(input: AITransactionImporterInput): Promise<AITransactionImporterOutput> {
  return aiTransactionImporterFlow(input);
}

const transactionImporterPrompt = ai.definePrompt({
  name: 'aiTransactionImporterPrompt',
  input: { schema: AITransactionImporterInputSchema },
  output: { schema: AITransactionImporterOutputSchema },
  prompt: `Você é um analista de dados financeiros experiente no mercado brasileiro (B3). Sua missão é encontrar transações de investimento nos dados fornecidos.

FONTE DE DADOS:
{{#if rawStatement}}
Dados brutos (Texto/CSV): 
"""
{{{rawStatement}}}
"""
{{/if}}
{{#if fileDataUri}}
Arquivo Anexo (PDF/Imagem): {{media url=fileDataUri}}
{{/if}}

INSTRUÇÕES DE EXTRAÇÃO:
1. **Analise cada linha**: Identifique movimentações de COMPRA, VENDA ou PROVENTOS (Dividendos, JCP, Rendimentos).
2. **Mapeamento de Tickers**: 
   - Identifique tickers como PETR4, VALE3, HGLG11, IVVB11, BTC, ETH.
   - Se o ticker não estiver explícito, mas o nome da empresa for claro (ex: "ITAU UNIBANCO"), infira o ticker (ITUB4).
3. **Limpeza e Conversão**:
   - Datas: Converta formatos como 15/05/2024 ou 15/05/24 para 2024-05-15 (YYYY-MM-DD).
   - Números: Remova "R$", pontos de milhar e use ponto para decimais (ex: "1.250,50" vira 1250.50).
4. **Tratamento de Proventos**:
   - Se o tipo for 'dividend', a quantidade e preço podem ser nulos, mas o 'amount' é o valor recebido.

EXEMPLO DE IDENTIFICAÇÃO:
- "10/05/2024;Compra;PETR4;100;35,00;3500,00" -> { type: 'buy', ticker: 'PETR4', quantity: 100, price: 35.0, amount: 3500.0 }
- "12/05/2024;Rendimento;HGLG11;0,78;78,00" -> { type: 'dividend', ticker: 'HGLG11', amount: 78.0 }

Seja exaustivo. Extraia TODAS as transações que encontrar. Se a linha for apenas um cabeçalho ou saldo, ignore-a.`
});

const aiTransactionImporterFlow = ai.defineFlow(
  {
    name: 'aiTransactionImporterFlow',
    inputSchema: AITransactionImporterInputSchema,
    outputSchema: AITransactionImporterOutputSchema,
  },
  async (input) => {
    const { output } = await transactionImporterPrompt(input);
    return output || [];
  }
);
