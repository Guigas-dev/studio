
/**
 * Configuração do Firebase utilizando variáveis de ambiente.
 * Limpeza robusta para remover aspas e espaços que podem vir do .env.
 */
const cleanEnvVar = (value: string | undefined): string => {
  if (!value) return "";
  // Remove espaços e aspas simples ou duplas em qualquer ponta da string
  return value.trim().replace(/^["']|["']$/g, '').trim();
};

export const firebaseConfig = {
  apiKey: cleanEnvVar(process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
  authDomain: cleanEnvVar(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN),
  projectId: cleanEnvVar(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
  storageBucket: cleanEnvVar(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: cleanEnvVar(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID),
  appId: cleanEnvVar(process.env.NEXT_PUBLIC_FIREBASE_APP_ID),
};

// Verifica se a chave de API parece minimamente válida (deve começar com AIza e ter tamanho razoável)
export const isConfigValid = !!firebaseConfig.apiKey && firebaseConfig.apiKey.startsWith('AIza') && firebaseConfig.apiKey.length > 20;

export const getMissingKeys = () => {
  const missing: string[] = [];
  const mapping: Record<string, string> = {
    apiKey: "NEXT_PUBLIC_FIREBASE_API_KEY",
    authDomain: "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
    projectId: "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
    storageBucket: "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
    messagingSenderId: "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
    appId: "NEXT_PUBLIC_FIREBASE_APP_ID"
  };

  Object.entries(firebaseConfig).forEach(([key, value]) => {
    if (!value || value === "") {
      missing.push(mapping[key]);
    }
  });

  return missing;
};
