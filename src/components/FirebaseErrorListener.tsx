'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useToast } from '@/hooks/use-toast';

/**
 * Componente que escuta erros de permissão do Firebase e exibe alertas contextuais.
 * Essencial para depuração de Security Rules em tempo real.
 */
export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = errorEmitter.on('permission-error', (error: FirestorePermissionError) => {
      console.error('[Firebase Security Error]', error);
      
      toast({
        variant: "destructive",
        title: "Erro de Permissão",
        description: `Acesso negado ao caminho: ${error.context.path}. Verifique as regras de segurança para a operação '${error.context.operation}'.`,
      });
    });

    return () => unsubscribe();
  }, [toast]);

  return null;
}