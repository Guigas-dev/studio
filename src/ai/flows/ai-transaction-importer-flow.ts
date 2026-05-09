'use server';
/**
 * @fileOverview A Genkit flow for parsing raw financial statements to identify and categorize investment transactions.
 *
 * - aiTransactionImporter - A function that handles the AI-powered transaction import process.
 * - AITransactionImporterInput - The input type for the aiTransactionImporter function.
 * - AITransactionImporterOutput - The return type for the aiTransactionImporter function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AITransactionImporterInputSchema = z.object({
  rawStatement: z.string().describe('Raw financial statement text, which can be a CSV snippet, a PDF content extraction, or unstructured text from a brokerage statement. The AI will parse this text to identify transactions.'),
});
export type AITransactionImporterInput = z.infer<typeof AITransactionImporterInputSchema>;

const TransactionTypeSchema = z.enum(['buy', 'sell', 'dividend', 'other']).describe('The type of financial transaction identified.');

const AITransactionSchema = z.object({
  type: TransactionTypeSchema,
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format.').describe('The date of the transaction in YYYY-MM-DD format.'),
  ticker: z.string().optional().nullable().describe('The ticker symbol of the asset involved in the transaction (e.g., "PETR4", "IVVB11"). Use null if not inferable.'),
  description: z.string().describe('A brief description of the transaction as it appeared in the raw statement.'),
  quantity: z.number().optional().nullable().describe('The quantity of the asset involved for buy/sell transactions. Use null if not applicable.'),
  price: z.number().optional().nullable().describe('The price per unit of the asset for buy/sell transactions. Use null if not applicable.'),
  amount: z.number().describe('The total financial amount of the transaction (e.g., total cost for buy, total proceeds for sell, dividend value).'),
  suggestedCategory: z.string().optional().nullable().describe('A suggested category for the asset, such as "Ações", "FIIs", "ETFs", "BDRs", "Renda Fixa", "Criptomoedas", "Stocks Internacionais", or "Outros". Use null if no clear category can be determined.'),
  originalLine: z.string().describe('The exact line or snippet from the raw statement that corresponds to this transaction.'),
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
  prompt: `You are an expert financial data parser for an investment management application. Your primary task is to meticulously analyze the provided raw financial statement text, which can be from a brokerage, B3, or other financial institution.\n\nYour goal is to identify individual investment transactions and extract their details. Focus specifically on 'buy', 'sell', and 'dividend' transactions. If a transaction cannot be clearly classified into one of these, you may use 'other' as the type.\n\nFor each identified transaction, you must accurately extract the following details:\n- 'type': The transaction type. Choose from 'buy', 'sell', 'dividend', or 'other'.\n- 'date': The date of the transaction. Format this strictly as "YYYY-MM-DD".\n- 'ticker': The official ticker symbol of the asset (e.g., "PETR4", "IVVB11", "MGLU3"). If not explicitly present, try to infer it from the company name or asset description. If still not inferable, use null.\n- 'description': A concise description of the transaction, ideally reflecting the original text from the statement.\n- 'quantity': The number of units or shares involved for 'buy' or 'sell' transactions. Use null if the transaction type is 'dividend' or if quantity is not applicable/available.\n- 'price': The price per unit or share for 'buy' or 'sell' transactions. Use null if the transaction type is 'dividend' or if price is not applicable/available.\n- 'amount': The total financial value of the transaction. This is a critical field and should always be present.\n- 'suggestedCategory': A high-level category for the asset involved. Choose from: 'Ações', 'FIIs', 'ETFs', 'BDRs', 'Renda Fixa', 'Criptomoedas', 'Stocks Internacionais', or 'Outros'. This helps in portfolio organization. Use null if no clear category can be determined.\n- 'originalLine': The exact line or a short text snippet from the raw statement that corresponds to this particular transaction. This is crucial for auditability and user reference.\n\nThe output MUST be a JSON array of objects, strictly conforming to the provided TypeScript interface/Zod schema.\nEnsure high accuracy in data extraction and categorization. If a field's value cannot be determined, use null as per the schema, but try to be exhaustive in your extraction. Ignore any header, footer, or summary information; focus exclusively on the transactional lines. Extract monetary values as numbers, not strings with currency symbols.\n\nRaw Financial Statement to Parse:\n{{{rawStatement}}}`
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
