
"use client"

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Wand2, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { aiTransactionImporter } from "@/ai/flows/ai-transaction-importer-flow";
import { useToast } from "@/hooks/use-toast";
import { useUser, useFirestore } from "@/firebase";
import { collection, addDoc, doc, setDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export function B3ImportDialog() {
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  async function handleImport() {
    if (!text.trim() || !user || !db) return;

    setIsLoading(true);
    try {
      const transactions = await aiTransactionImporter({ rawStatement: text });
      
      if (transactions && transactions.length > 0) {
        // Salva cada transação e atualiza o ativo correspondente
        for (const tx of transactions) {
          const txRef = collection(db, 'users', user.uid, 'transactions');
          
          addDoc(txRef, {
            ...tx,
            userId: user.uid,
            createdAt: serverTimestamp(),
          }).catch(async (err) => {
            errorEmitter.emit('permission-error', new FirestorePermissionError({
              path: `users/${user.uid}/transactions`,
              operation: 'create',
              requestResourceData: tx
            }));
          });

          // Lógica simplificada: se for compra/venda, tenta atualizar o saldo no 'assets'
          if (tx.ticker && (tx.type === 'buy' || tx.type === 'sell')) {
            const assetRef = doc(db, 'users', user.uid, 'assets', tx.ticker);
            // Aqui poderíamos buscar o asset atual e recalcular, mas para o MVP vamos apenas garantir que o asset existe
            setDoc(assetRef, {
              ticker: tx.ticker,
              type: tx.suggestedCategory || 'Ações',
              lastUpdate: serverTimestamp(),
            }, { merge: true }).catch(async (err) => {
               errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: `users/${user.uid}/assets/${tx.ticker}`,
                operation: 'update',
                requestResourceData: { ticker: tx.ticker }
              }));
            });
          }
        }

        toast({
          title: "Importação concluída!",
          description: `Identificamos e salvamos ${transactions.length} novas transações.`,
        });
        setIsOpen(false);
        setText("");
      } else {
        toast({
          variant: "destructive",
          title: "Nenhuma transação encontrada",
          description: "Não conseguimos identificar transações no texto fornecido.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro na importação",
        description: "Ocorreu um problema ao processar seu extrato.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 border-primary/30 hover:bg-primary/5 text-primary">
          <Wand2 className="w-4 h-4" />
          Importar da B3
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl font-headline font-bold">Importação Inteligente</DialogTitle>
          <DialogDescription>
            Cole abaixo o texto copiado do Portal do Investidor B3 ou do seu extrato bancário. Nossa IA irá identificar e salvar tudo no banco de dados.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <Textarea 
            placeholder="Ex: 15/01/2024 - COMPRA - PETR4 - 100 UN - R$ 38,20..."
            className="min-h-[250px] bg-secondary/30 border-border focus:border-primary/50 resize-none p-4"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="flex items-start gap-2 text-xs text-muted-foreground bg-secondary/20 p-3 rounded-lg">
            <AlertCircle className="w-4 h-4 shrink-0 text-primary" />
            <p>
              Dica: Você pode copiar toda a tabela de movimentações do portal da B3 e colar aqui. Os dados serão salvos permanentemente na sua conta.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setIsOpen(false)} disabled={isLoading}>
            Cancelar
          </Button>
          <Button 
            onClick={handleImport} 
            disabled={isLoading || !text.trim() || !user}
            className="premium-gradient border-none min-w-[140px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Processar e Salvar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
