/**
 * Configuração do Firebase utilizando variáveis de ambiente.
 * 
 * Se o .env não estiver funcionando, você pode colar os valores diretamente
 * nas strings abaixo para testar.
 */
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
};

// Helper para verificar o que está faltando
export const getMissingKeys = () => {
  const keys = Object.entries(firebaseConfig)
    .filter(([_, value]) => !value || value === "")
    .map(([key]) => `NEXT_PUBLIC_FIREBASE_${key.replace(/[A-Z]/g, letter => `_${letter.toUpperCase()}`).toUpperCase()}`);
  return keys;
};
