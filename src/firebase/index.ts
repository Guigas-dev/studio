'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { firebaseConfig } from './config';

/**
 * Inicializa as instâncias do Firebase de forma segura para o cliente.
 */
export function initializeFirebase() {
  const isConfigValid = !!firebaseConfig.apiKey && firebaseConfig.apiKey !== "";

  if (!isConfigValid) {
    // Usamos console.warn em vez de error para não disparar o overlay de erro do Next.js
    if (typeof window !== 'undefined') {
      console.warn(
        "DeltaWealth: Configuração do Firebase não detectada. " +
        "Lembre-se de configurar as chaves no arquivo .env ou em src/firebase/config.ts para habilitar a autenticação."
      );
    }
    return { app: null, db: null, auth: null };
  }

  try {
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const auth = getAuth(app);
    return { app, db, auth };
  } catch (error) {
    console.warn("Erro ao inicializar Firebase:", error);
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
