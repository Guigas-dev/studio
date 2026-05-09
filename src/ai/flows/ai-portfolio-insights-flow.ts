'use server';
/**
 * @fileOverview An AI assistant that analyzes a user's investment portfolio and provides high-level insights.
 *
 * - aiPortfolioInsights - A function that handles the portfolio analysis process.
 * - AIPortfolioInsightsInput - The input type for the aiPortfolioInsights function.
 * - AIPortfolioInsightsOutput - The return type for the aiPortfolioInsights function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AssetSchema = z.object({
  name: z.string().describe('The name or ticker of the asset (e.g., PETR4, IVVB11).'),
  type: z.string().describe('The type of asset (e.g., Ação, FII, ETF, Criptomoeda, Renda Fixa).'),
  quantity: z.number().positive().describe('The quantity of the asset held.'),
  averagePrice: z.number().positive().describe('The average purchase price per unit of the asset.'),
  currentPrice: z.number().positive().describe('The current market price per unit of the asset.'),
  segment: z.string().optional().describe('The specific segment of the asset (e.g., Petróleo e Gás, Fundos Imobiliários de Tijolo).'),
  sector: z.string().optional().describe('The broader sector of the asset (e.g., Financeiro, Varejo, Tecnologia).'),
});

const AIPortfolioInsightsInputSchema = z.object({
  assets: z.array(AssetSchema).describe('A list of assets currently held in the portfolio.'),
  totalPortfolioValue: z.number().positive().describe('The total current market value of the portfolio.'),
  totalProfitLoss: z.number().describe('The total absolute profit or loss of the portfolio.'),
  userGoals: z.string().optional().describe('Optional: User-defined investment goals (e.g., long-term growth, income generation, risk aversion).'),
  currentMarketConditions: z.string().optional().describe('Optional: A brief overview of current general market conditions to consider.'),
});
export type AIPortfolioInsightsInput = z.infer<typeof AIPortfolioInsightsInputSchema>;

const AIPortfolioInsightsOutputSchema = z.object({
  diversificationAnalysis: z.string().describe('An analysis of the portfolio\'s diversification across asset types, sectors, and segments.'),
  riskFactors: z.string().describe('Identified potential risk factors in the portfolio, such as concentration risk, market volatility exposure, etc.'),
  performanceSuggestions: z.string().describe('Suggestions for improving portfolio performance, rebalancing, or adjusting based on user goals and market conditions.'),
  generalMarketOutlook: z.string().describe('A brief high-level outlook on current market sentiment and its potential impact on the portfolio.'),
});
export type AIPortfolioInsightsOutput = z.infer<typeof AIPortfolioInsightsOutputSchema>;

export async function aiPortfolioInsights(input: AIPortfolioInsightsInput): Promise<AIPortfolioInsightsOutput> {
  return aiPortfolioInsightsFlow(input);
}

const aiPortfolioInsightsPrompt = ai.definePrompt({
  name: 'aiPortfolioInsightsPrompt',
  input: { schema: AIPortfolioInsightsInputSchema },
  output: { schema: AIPortfolioInsightsOutputSchema },
  prompt: `You are an expert financial advisor and AI assistant specializing in investment portfolios.
Your task is to analyze a user's investment portfolio and provide high-level, actionable insights.

Analyze the provided portfolio data, focusing on diversification, potential risk factors, and performance improvement suggestions based on general market conditions and user goals.

Portfolio Data:
Total Portfolio Value: R$ {{{totalPortfolioValue}}}
Total Profit/Loss: R$ {{{totalProfitLoss}}}

Assets:
{{#each assets}}
- Name: {{{name}}}, Type: {{{type}}}, Quantity: {{{quantity}}}, Avg Price: R$ {{{averagePrice}}}, Current Price: R$ {{{currentPrice}}}, Segment: {{{segment}}}, Sector: {{{sector}}}
{{/each}}

{{#if userGoals}}
User Investment Goals: {{{userGoals}}}
{{/if}}

{{#if currentMarketConditions}}
Current Market Conditions: {{{currentMarketConditions}}}
{{/if}}

Based on the above information, provide a comprehensive analysis structured as follows:

1.  **Diversification Analysis**: Evaluate the portfolio\'s diversification across asset types, sectors, and segments. Identify any areas of over-concentration or lack of exposure.
2.  **Risk Factors**: Highlight specific risks inherent in the current portfolio composition (e.g., concentration risk, exposure to volatile sectors, currency risk).
3.  **Performance Suggestions**: Offer strategic suggestions for optimizing the portfolio\'s performance, such as rebalancing recommendations, potential asset additions/reductions, or alignment with user goals.
4.  **General Market Outlook**: Provide a concise high-level overview of the current market sentiment and its potential implications for the portfolio.

Ensure your response is clear, concise, and professional. The output should be directly parsable into the specified JSON structure.`,
});

const aiPortfolioInsightsFlow = ai.defineFlow(
  {
    name: 'aiPortfolioInsightsFlow',
    inputSchema: AIPortfolioInsightsInputSchema,
    outputSchema: AIPortfolioInsightsOutputSchema,
  },
  async (input) => {
    const { output } = await aiPortfolioInsightsPrompt(input);
    return output!;
  },
);
