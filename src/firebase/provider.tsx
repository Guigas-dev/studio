'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';
import { Auth } from 'firebase/auth';

interface FirebaseContextType {
  app: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export function FirebaseProvider({
  children,
  app,
  firestore,
  auth,
}: {
  children: ReactNode;
  app: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
}) {
  return (
    <FirebaseContext.Provider value={{ app, firestore, auth }}>
      {children}
    </FirebaseContext.Provider>
  );
}

export function useFirebaseContext() {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebaseContext must be used within a FirebaseProvider');
  }
  return context;
}

export const useFirebaseApp = () => useFirebaseContext().app;
export const useFirestore = () => useFirebaseContext().firestore;
export const useAuth = () => useFirebaseContext().auth;

// Hook utilitário para verificar se o Firebase está pronto
export function useFirebaseReady() {
  const { app, auth, firestore } = useFirebaseContext();
  return !!app && !!auth && !!firestore;
}
