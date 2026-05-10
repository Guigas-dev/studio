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
  ticker: z.string().optional().nullable().describe('The ticker symbol of the asset (e.g., "PETR4", "IVVB11"). Use null if not inferable.'),
  description: z.string().describe('A brief description of the transaction as seen in the document.'),
  quantity: z.number().optional().nullable().describe('The unit quantity involved.'),
  price: z.number().optional().nullable().describe('The unit price of the asset.'),
  amount: z.number().describe('The total financial amount (Net amount) of the transaction, including fees if applicable.'),
  fees: z.number().optional().default(0).describe('Trading fees or taxes identified.'),
  suggestedCategory: z.string().optional().nullable().describe('Suggested category (Ações, FIIs, ETFs, BDRs, Renda Fixa, Cripto).'),
  originalLine: z.string().describe('The exact text reference from the source data.'),
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
  prompt: `Você é um especialista em Notas de Corretagem e Extratos da B3. Sua tarefa é extrair com precisão cirúrgica as transações financeiras.

DADOS FONTE:
{{#if rawStatement}}
Texto/CSV: """{{{rawStatement}}}"""
{{/if}}
{{#if fileDataUri}}
Documento (PDF/Imagem): {{media url=fileDataUri}}
{{/if}}

REGRAS DE OURO PARA VALORES:
1. **Valor Líquido (Amount)**: Extraia o valor total que saiu ou entrou na conta. Se houver taxas separadas, o 'amount' para COMPRA deve ser (Quantidade * Preço + Taxas). Para VENDA deve ser (Quantidade * Preço - Taxas).
2. **Precisão Numérica**: Ignore símbolos como "R$", "." (como separador de milhar). O resultado final deve ser um número decimal puro (ex: 1250.50).
3. **Identificação de Tickers**: Se o documento disser "ITAUUNIBANCO PN", você deve retornar ITUB4. Use seu conhecimento de mercado para mapear nomes de empresas para tickers da B3.
4. **Datas**: Sempre converta para YYYY-MM-DD.

EXEMPLO DE NOTA DE CORRETAGEM:
- "Compra; PETR4; 100; 35,00; Taxa: 2,50; Total: 3502,50" -> { type: 'buy', ticker: 'PETR4', quantity: 100, price: 35.0, amount: 3502.50, fees: 2.50 }

Seja exaustivo e não ignore nenhuma linha que represente movimentação de ativos ou proventos.`
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
