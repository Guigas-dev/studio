
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

/**
 * Limpa a chave de API removendo aspas e espaços acidentais.
 */
const cleanKey = (key: string | undefined) => {
  if (!key) return undefined;
  return key.trim().replace(/^["']|["']$/g, '');
};

export const ai = genkit({
  plugins: [
    googleAI({ 
      apiKey: cleanKey(process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY)
    })
  ],
  model: googleAI.model('gemini-2.5-flash'),
});
