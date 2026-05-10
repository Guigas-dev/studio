/**
 * Configuração do Firebase utilizando variáveis de ambiente.
 * IMPORTANTE: No Next.js, variáveis usadas no cliente devem começar com NEXT_PUBLIC_.
 * 
 * Se você não quiser usar .env, você pode colar os valores diretamente abaixo 
 * entre as aspas, mas lembre-se de não subir chaves sensíveis para repositórios públicos.
 */
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
};
