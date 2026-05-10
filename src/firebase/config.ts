/**
 * Configuração do Firebase utilizando variáveis de ambiente ou valores diretos.
 * 
 * DICA: Se o arquivo .env não estiver funcionando, você pode colar os valores
 * do Console do Firebase diretamente nas strings abaixo.
 */
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "", // Cole aqui se necessário
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
};

// Verifica se as chaves mínimas estão presentes
export const isConfigValid = !!firebaseConfig.apiKey && firebaseConfig.apiKey !== "";

export const getMissingKeys = () => {
  const keys = Object.entries(firebaseConfig)
    .filter(([_, value]) => !value || value === "")
    .map(([key]) => {
      const mapping: Record<string, string> = {
        apiKey: "NEXT_PUBLIC_FIREBASE_API_KEY",
        authDomain: "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
        projectId: "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
        storageBucket: "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
        messagingSenderId: "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
        appId: "NEXT_PUBLIC_FIREBASE_APP_ID"
      };
      return mapping[key];
    });
  return keys;
};
