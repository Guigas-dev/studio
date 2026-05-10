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
  rawStatement: z.string().optional().describe('Raw financial statement text, which can be a CSV snippet or unstructured text.'),
  fileDataUri: z.string().optional().describe('A data URI of the financial statement (PDF, Excel, or Image). Expected format: "data:<mimetype>;base64,<encoded_data>".'),
});
export type AITransactionImporterInput = z.infer<typeof AITransactionImporterInputSchema>;

const TransactionTypeSchema = z.enum(['buy', 'sell', 'dividend', 'other']).describe('The type of financial transaction identified.');

const AITransactionSchema = z.object({
  type: TransactionTypeSchema,
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format.').describe('The date of the transaction in YYYY-MM-DD format.'),
  ticker: z.string().optional().nullable().describe('The ticker symbol of the asset involved in the transaction (e.g., "PETR4", "IVVB11"). Use null if not inferable.'),
  description: z.string().describe('A brief description of the transaction as it appeared in the raw statement or file.'),
  quantity: z.number().optional().nullable().describe('The quantity of the asset involved for buy/sell transactions. Use null if not applicable.'),
  price: z.number().optional().nullable().describe('The price per unit of the asset for buy/sell transactions. Use null if not applicable.'),
  amount: z.number().describe('The total financial amount of the transaction (e.g., total cost for buy, total proceeds for sell, dividend value).'),
  suggestedCategory: z.string().optional().nullable().describe('A suggested category for the asset, such as "Ações", "FIIs", "ETFs", "BDRs", "Renda Fixa", "Criptomoedas", "Stocks Internacionais", or "Outros". Use null if no clear category can be determined.'),
  originalLine: z.string().describe('The exact line or reference from the raw data that corresponds to this transaction.'),
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
  prompt: `You are an expert financial data parser for an investment management application. Your primary task is to meticulously analyze the provided raw financial statement data.

Data Source:
{{#if rawStatement}}
Raw Text: {{{rawStatement}}}
{{/if}}
{{#if fileDataUri}}
Attached File: {{media url=fileDataUri}}
{{/if}}

Your goal is to identify individual investment transactions and extract their details. Focus specifically on 'buy', 'sell', and 'dividend' transactions. If a transaction cannot be clearly classified into one of these, you may use 'other' as the type.

For each identified transaction, you must accurately extract the following details:
- 'type': The transaction type. Choose from 'buy', 'sell', 'dividend', or 'other'.
- 'date': The date of the transaction. Format this strictly as "YYYY-MM-DD".
- 'ticker': The official ticker symbol of the asset (e.g., "PETR4", "IVVB11"). If not explicitly present, try to infer it. If still not inferable, use null.
- 'description': A concise description of the transaction.
- 'quantity': The number of units or shares involved. Use null if not applicable.
- 'price': The price per unit or share. Use null if not applicable.
- 'amount': The total financial value of the transaction.
- 'suggestedCategory': A high-level category (Ações, FIIs, ETFs, etc.).
- 'originalLine': The exact line or snippet that corresponds to this particular transaction.

The output MUST be a JSON array of objects. Ensure high accuracy. Ignore headers, footers, or summaries. Extract monetary values as numbers.`
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