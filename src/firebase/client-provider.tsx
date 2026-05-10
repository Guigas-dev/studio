'use client';

import React, { useMemo } from 'react';
import { initializeFirebase } from './index';
import { FirebaseProvider } from './provider';

/**
 * Provedor que garante a inicialização única do Firebase no lado do cliente.
 */
export function FirebaseClientProvider({ children }: { children: React.ReactNode }) {
  // Inicializa o Firebase apenas uma vez no mount do componente
  const { app, db, auth } = useMemo(() => initializeFirebase(), []);

  return (
    <FirebaseProvider app={app} firestore={db} auth={auth}>
      {children}
    </FirebaseProvider>
  );
}
