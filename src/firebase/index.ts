'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { firebaseConfig } from './config';

/**
 * Inicializa as instâncias do Firebase de forma segura para o cliente.
 * Retorna as instâncias ou null se a configuração for inválida.
 */
export function initializeFirebase() {
  try {
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const auth = getAuth(app);
    return { app, db, auth };
  } catch (error) {
    console.error("Erro ao inicializar Firebase. Verifique suas chaves no .env", error);
    // Retorna instâncias mockadas ou nulas para evitar crash no SSR se as chaves faltarem
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
