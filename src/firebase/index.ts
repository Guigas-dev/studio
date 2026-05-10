'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { firebaseConfig } from './config';

/**
 * Inicializa as instâncias do Firebase de forma segura para o cliente.
 */
export function initializeFirebase() {
  // Verifica se as chaves mínimas existem para evitar erros de inicialização do SDK
  const isConfigValid = !!firebaseConfig.apiKey && !!firebaseConfig.projectId;

  if (!isConfigValid) {
    console.warn(
      "Configuração do Firebase incompleta. Verifique se as variáveis NEXT_PUBLIC_FIREBASE_* estão definidas no seu arquivo .env ou em src/firebase/config.ts"
    );
  }

  try {
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const auth = getAuth(app);
    return { app, db, auth };
  } catch (error) {
    console.error("Erro crítico ao inicializar Firebase:", error);
    // Retorna nulos em caso de erro fatal para evitar que o hook useMemo trave a renderização
    return { app: null as any, db: null as any, auth: null as any };
  }
}

// Re-exporta tudo do provedor e dos hooks específicos
export * from './provider';
export * from './auth/use-user';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './firestore/use-memo-firebase';
export * from './client-provider';
