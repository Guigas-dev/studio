
'use client';

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { firebaseConfig } from './config';

/**
 * Inicializa as instâncias do Firebase de forma segura para o cliente.
 */
export function initializeFirebase() {
  // Verificação básica: se a apiKey existe, tentamos inicializar.
  const hasApiKey = !!firebaseConfig.apiKey && firebaseConfig.apiKey !== "";

  if (!hasApiKey) {
    if (typeof window !== 'undefined') {
      console.warn("DeltaWealth: Configuração do Firebase não detectada no ambiente.");
    }
    return { app: null, db: null, auth: null };
  }

  try {
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const auth = getAuth(app);
    
    if (typeof window !== 'undefined') {
      console.log("DeltaWealth: Firebase inicializado com sucesso.");
    }
    
    return { app, db, auth };
  } catch (error) {
    console.error("Erro ao inicializar Firebase:", error);
    return { app: null, db: null, auth: null };
  }
}

// Re-exporta tudo do provedor e dos hooks específicos
export * from './provider';
export * from './auth/use-user';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './firestore/use-memo-firebase';
export * from './client-provider';
