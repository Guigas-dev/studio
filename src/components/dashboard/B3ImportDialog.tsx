
"use client"

import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Wand2, Loader2, CheckCircle2, AlertCircle, FileUp, FileJson, X } from "lucide-react";
import { aiTransactionImporter } from "@/ai/flows/ai-transaction-importer-flow";
import { useToast } from "@/hooks/use-toast";
import { useUser, useFirestore } from "@/firebase";
import { collection, addDoc, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export function B3ImportDialog() {
  const [text, setText] = useState("");
  const [fileData, setFileData] = useState<{ name: string; uri: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Limite manual de 3.5MB para evitar chegar no limite de 4MB do servidor (devido ao overhead do base64)
    if (file.size > 3.5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "Arquivo muito grande",
        description: "O tamanho máximo permitido é 3.5MB.",
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFileData({
        name: file.name,
        uri: reader.result as string,
      });
      toast({
        title: "Arquivo selecionado",
        description: `${file.name} pronto para processamento.`,
      });
    };
    reader.readAsDataURL(file);
  };

  const removeFile = () => {
    setFileData(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  async function handleImport() {
    if ((!text.trim() && !fileData) || !user || !db) return;

    setIsLoading(true);
    try {
      const transactions = await aiTransactionImporter({ 
        rawStatement: text,
        fileDataUri: fileData?.uri 
      });
      
      if (transactions && transactions.length > 0) {
        for (const tx of transactions) {
          if (tx.type === 'dividend') {
            const divRef = collection(db, 'users', user.uid, 'dividends');
            addDoc(divRef, {
              ticker: tx.ticker || "OUTROS",
              amount: tx.amount,
              date: tx.date,
              type: 'dividend',
              description: tx.description,
              createdAt: serverTimestamp(),
            }).catch(async () => {
              errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: `users/${user.uid}/dividends`,
                operation: 'create',
                requestResourceData: tx
              }));
            });
          } else {
            const txRef = collection(db, 'users', user.uid, 'transactions');
            addDoc(txRef, {
              ...tx,
              createdAt: serverTimestamp(),
            }).catch(async () => {
              errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: `users/${user.uid}/transactions`,
                operation: 'create',
                requestResourceData: tx
              }));
            });

            if (tx.ticker && (tx.type === 'buy' || tx.type === 'sell')) {
              const assetRef = doc(db, 'users', user.uid, 'assets', tx.ticker);
              setDoc(assetRef, {
                ticker: tx.ticker,
                type: tx.suggestedCategory || 'Ações',
                lastUpdate: serverTimestamp(),
              }, { merge: true }).catch(async () => {
                 errorEmitter.emit('permission-error', new FirestorePermissionError({
                  path: `users/${user.uid}/assets/${tx.ticker}`,
                  operation: 'update',
                  requestResourceData: { ticker: tx.ticker }
                }));
              });
            }
          }
        }

        toast({
          title: "Importação concluída!",
          description: `Identificamos e salvamos ${transactions.length} novos registros no seu histórico.`,
        });
        setIsOpen(false);
        setText("");
        setFileData(null);
      } else {
        toast({
          variant: "destructive",
          title: "Nenhuma transação encontrada",
          description: "Não conseguimos identificar transações no conteúdo fornecido.",
        });
      }
    } catch (error: any) {
      console.error("Erro na importação IA:", error);
      
      let errorMessage = "Ocorreu um problema ao processar seu extrato com IA.";
      if (error.message?.includes("Unsupported MIME type")) {
        errorMessage = "Este formato de arquivo não é suportado diretamente. Por favor, use PDF, Imagens ou cole o texto da planilha.";
      }

      toast({
        variant: "destructive",
        title: "Erro na importação",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 border-primary/30 hover:bg-primary/5 text-primary">
          < Wand2 className="w-4 h-4" />
          Importação Inteligente
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl font-headline font-bold">Extração por IA</DialogTitle>
          <DialogDescription>
            Cole o texto do seu extrato ou suba um arquivo (PDF ou Imagem). Para planilhas, copie e cole os dados na caixa de texto.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Textarea 
              placeholder="Cole aqui o texto do extrato, linhas de uma planilha ou descreva suas operações..."
              className="min-h-[150px] bg-secondary/30 border-border focus:border-primary/50 resize-none p-4"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Ou anexe um documento (PDF ou Foto):</p>
            <input 
              type="file" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,image/*"
            />
            
            {!fileData ? (
              <Button 
                variant="outline" 
                className="w-full border-dashed border-2 h-20 flex flex-col gap-1 hover:bg-secondary/50"
                onClick={() => fileInputRef.current?.click()}
              >
                <FileUp className="w-6 h-6 text-primary" />
                <span className="text-xs">Clique para selecionar PDF ou Imagem</span>
              </Button>
            ) : (
              <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10 border border-primary/20 animate-in fade-in slide-in-from-top-1">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/20 rounded-md">
                    <FileJson className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold truncate max-w-[200px]">{fileData.name}</span>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Arquivo Pronto</span>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={removeFile} className="h-8 w-8 hover:bg-destructive/10 text-destructive">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          <div className="flex items-start gap-2 text-xs text-muted-foreground bg-secondary/20 p-3 rounded-lg">
            <AlertCircle className="w-4 h-4 shrink-0 text-primary" />
            <p>
              Dica: Se você tem um Excel, selecione as linhas relevantes, copie (Ctrl+C) e cole (Ctrl+V) na caixa de texto acima. A IA identificará os dados perfeitamente.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setIsOpen(false)} disabled={isLoading}>
            Cancelar
          </Button>
          <Button 
            onClick={handleImport} 
            disabled={isLoading || (!text.trim() && !fileData) || !user}
            className="premium-gradient border-none min-w-[140px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analisando...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Processar com IA
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
