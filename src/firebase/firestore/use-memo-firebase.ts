'use client';

import { useMemo, useRef } from 'react';

/**
 * Hook para memoizar referências ou queries do Firebase.
 * Evita loops infinitos ao garantir que a referência só mude se as dependências mudarem.
 */
export function useMemoFirebase<T>(factory: () => T, deps: any[]): T {
  const ref = useRef<T>(null as any);
  const prevDeps = useRef<any[]>([]);

  const changed = deps.length !== prevDeps.current.length || deps.some((dep, i) => dep !== prevDeps.current[i]);

  if (changed) {
    ref.current = factory();
    prevDeps.current = deps;
  }

  return ref.current;
}
