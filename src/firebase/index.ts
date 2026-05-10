'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { firebaseConfig } from './config';

let app: FirebaseApp;
let db: Firestore;
let auth: Auth;

export function initializeFirebase() {
  if (getApps().length > 0) {
    app = getApp();
  } else {
    app = initializeApp(firebaseConfig);
  }
  db = getFirestore(app);
  auth = getAuth(app);
  return { app, db, auth };
}

// Exportando os hooks e provedores principais
export * from './provider';
export * from './auth/use-user';
export * from './firestore/use-collection';
export * from './firestore/use-doc';

// Hooks de utilitário para acesso rápido às instâncias
export const useFirebase = () => {
  const { app, db, auth } = initializeFirebase();
  return { app, firestore: db, auth };
};

export const useFirebaseApp = () => initializeFirebase().app;
export const useFirestore = () => initializeFirebase().db;
export const useAuth = () => initializeFirebase().auth;
