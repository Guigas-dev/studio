'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { firebaseConfig } from './config';

/**
 * Inicializa as instâncias do Firebase de forma segura para o cliente.
 * Se a configuração for inválida, retorna null para evitar quebras fatais.
 */
export function initializeFirebase() {
  const isConfigValid = !!firebaseConfig.apiKey && firebaseConfig.apiKey !== "";

  if (!isConfigValid) {
    if (typeof window !== 'undefined') {
      console.error(
        "ERRO: Configuração do Firebase ausente. " +
        "Certifique-se de preencher as variáveis NEXT_PUBLIC_FIREBASE_* no seu arquivo .env " +
        "ou diretamente em src/firebase/config.ts."
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
    console.error("Erro crítico ao inicializar Firebase:", error);
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
