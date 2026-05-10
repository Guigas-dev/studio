
"use client"

import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Wand2, Loader2, CheckCircle2, AlertCircle, FileUp, FileSpreadsheet, X, FileText } from "lucide-react";
import { aiTransactionImporter } from "@/ai/flows/ai-transaction-importer-flow";
import { useToast } from "@/hooks/use-toast";
import { useUser, useFirestore } from "@/firebase";
import { collection, addDoc, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import * as XLSX from 'xlsx';

export function B3ImportDialog() {
  const [text, setText] = useState("");
  const [fileData, setFileData] = useState<{ name: string; uri?: string; isSpreadsheet?: boolean } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Lógica para Planilhas Excel
    if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = event.target?.result;
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          // Converte para CSV para que a IA consiga ler como texto estruturado
          const csvContent = XLSX.utils.sheet_to_csv(worksheet);
          
          setText(csvContent);
          setFileData({ name: file.name, isSpreadsheet: true });
          
          toast({
            title: "Planilha carregada",
            description: "Os dados foram extraídos e estão prontos para análise.",
          });
        } catch (err) {
          toast({
            variant: "destructive",
            title: "Erro ao ler planilha",
            description: "Certifique-se de que o arquivo não está protegido por senha.",
          });
        }
      };
      reader.readAsArrayBuffer(file);
      return;
    }

    // Lógica para PDF e Imagens (Multimodal)
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
        isSpreadsheet: false
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
    if (fileData?.isSpreadsheet) setText("");
  };

  async function handleImport() {
    if ((!text.trim() && !fileData) || !user || !db) return;

    setIsLoading(true);
    try {
      const transactions = await aiTransactionImporter({ 
        rawStatement: text,
        fileDataUri: fileData?.uri // Apenas PDFs/Imagens têm URI
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
          description: `Identificamos e salvamos ${transactions.length} novos registros.`,
        });
        setIsOpen(false);
        setText("");
        setFileData(null);
      } else {
        toast({
          variant: "destructive",
          title: "Nenhuma transação encontrada",
          description: "A IA não conseguiu identificar transações no conteúdo fornecido.",
        });
      }
    } catch (error: any) {
      console.error("Erro na importação IA:", error);
      toast({
        variant: "destructive",
        title: "Erro na importação",
        description: "Não foi possível processar os dados. Tente colar apenas o texto relevante.",
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
            Suporte para **PDF, Imagens e Planilhas (XLSX)**. A IA analisará automaticamente as movimentações.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Textarea 
              placeholder="Os dados da planilha aparecerão aqui após o upload..."
              className="min-h-[120px] bg-secondary/30 border-border focus:border-primary/50 resize-none p-4 text-xs font-mono"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Anexar Documento ou Planilha:</p>
            <input 
              type="file" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,image/*,.xlsx,.xls,.csv"
            />
            
            {!fileData ? (
              <Button 
                variant="outline" 
                className="w-full border-dashed border-2 h-24 flex flex-col gap-1 hover:bg-secondary/50 border-primary/20"
                onClick={() => fileInputRef.current?.click()}
              >
                <FileUp className="w-6 h-6 text-primary mb-1" />
                <span className="text-sm font-medium">Subir PDF, Foto ou Excel</span>
                <span className="text-[10px] text-muted-foreground">Máximo 3.5MB para arquivos binários</span>
              </Button>
            ) : (
              <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10 border border-primary/20 animate-in fade-in slide-in-from-top-1">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/20 rounded-md">
                    {fileData.isSpreadsheet ? <FileSpreadsheet className="w-5 h-5 text-primary" /> : <FileText className="w-5 h-5 text-primary" />}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold truncate max-w-[200px]">{fileData.name}</span>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">
                      {fileData.isSpreadsheet ? "Planilha Processada" : "Documento Pronto"}
                    </span>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={removeFile} className="h-8 w-8 hover:bg-destructive/10 text-destructive">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          <div className="flex items-start gap-2 text-xs text-muted-foreground bg-secondary/20 p-3 rounded-lg border border-border/50">
            <AlertCircle className="w-4 h-4 shrink-0 text-primary" />
            <p>
              **Dica**: Se a planilha for muito grande, a IA pode demorar. O formato CSV gerado internamente ajuda na precisão da extração.
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
            className="premium-gradient border-none min-w-[140px] shadow-lg shadow-primary/20"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Analisar com IA
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
