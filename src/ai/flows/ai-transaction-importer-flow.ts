
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
  prompt: `You are an expert financial data analyst. Your task is to extract investment transactions from the provided data.

Data Source:
{{#if rawStatement}}
Raw Text/CSV: 
"""
{{{rawStatement}}}
"""
{{/if}}
{{#if fileDataUri}}
Attached File (PDF/Image): {{media url=fileDataUri}}
{{/if}}

INSTRUCTIONS:
1. Identify individual 'buy', 'sell', and 'dividend' (proventos/rendimentos) transactions.
2. For CSV or tabular data, identify the columns for Date, Ticker, Quantity, Price, and Total Amount.
3. Handle Brazilian Portuguese terminology: 'Compra', 'Venda', 'Dividendos', 'JCP', 'Rendimento', 'Ativo', 'Ticker'.
4. Ensure the 'date' is in YYYY-MM-DD format.
5. 'amount', 'quantity', and 'price' MUST be numbers. Remove currency symbols (R$) and correct thousand/decimal separators.
6. If the ticker is missing but can be inferred from the description (e.g., "Petrobras PN" -> "PETR4"), include it.
7. Categorize assets correctly (e.g., PETR4 is 'Ações', HGLG11 is 'FIIs', IVVB11 is 'ETFs').

Ignore headers, footers, or non-transactional text. Extract everything as a structured JSON array.`
});

const aiTransactionImporterFlow = ai.defineFlow(
  {
    name: 'aiTransactionImporterFlow',
    inputSchema: AITransactionImporterInputSchema,
    outputSchema: AITransactionImporterOutputSchema,
  },
  async (input) => {
    const { output } = await transactionImporterPrompt(input);
    return output!;
  }
);
