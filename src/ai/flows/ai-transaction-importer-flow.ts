
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
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format.').describe('The date of the transaction in YYYY-MM-DD format.'),
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
  prompt: `You are an expert financial data analyst specializing in the Brazilian stock market (B3). Your task is to extract investment transactions from the provided raw data.

Data Source:
{{#if rawStatement}}
Raw Data (Text/CSV): 
"""
{{{rawStatement}}}
"""
{{/if}}
{{#if fileDataUri}}
Attached File (PDF/Image): {{media url=fileDataUri}}
{{/if}}

INSTRUCTIONS:
1. **Analyze with Flexibility**: Identify rows that represent financial movements. The columns might not have standard names (e.g., 'Ativo', 'Papel', 'Símbolo' are all 'ticker').
2. **Transaction Types**: 
   - 'buy' (Compra, C, Aquisição)
   - 'sell' (Venda, V, Alienação)
   - 'dividend' (Proventos, Dividendos, JCP, Rendimento, Rendimentos, Juros s/ Capital Próprio)
3. **Data Cleaning**:
   - Dates: Convert to YYYY-MM-DD. Handle formats like DD/MM/YYYY or DD/MM/YY.
   - Numbers: Convert to pure numbers. Brazilian data often uses ',' for decimals (e.g., '10,50' -> 10.5). Remove 'R$', dots used as thousand separators, and whitespace.
   - Tickers: Clean them (e.g., 'PETR4 - PETROBRAS' -> 'PETR4'). If missing but the name is clear, infer the B3 ticker.
4. **Output Requirements**: 
   - Return a VALID JSON array of objects.
   - If a row is clearly NOT a transaction (header, footer, total sum), ignore it.
   - For 'dividend' types, quantity and price can be null, but 'amount' is mandatory.

5. **Categorization**: 
   - If the ticker ends in 3, 4, 5, 6 -> 'Ações'
   - If ends in 11 and is property/logistics -> 'FIIs'
   - If ends in 11 and is index tracker -> 'ETFs'
   - If ends in 31, 32, 33, 34, 35 -> 'BDRs'

Be precise and exhaustive. Extract all transactions found.`
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
