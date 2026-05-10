/**
 * Configuração do Firebase utilizando variáveis de ambiente.
 * Adicionada limpeza de espaços (trim) para evitar erros comuns de cópia e cola no .env.
 */
export const firebaseConfig = {
  apiKey: (process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "").trim(),
  authDomain: (process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "").trim(),
  projectId: (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "").trim(),
  storageBucket: (process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "").trim(),
  messagingSenderId: (process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "").trim(),
  appId: (process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "").trim(),
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
