
"use client"

import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Wand2, Loader2, CheckCircle2, FileUp, FileSpreadsheet, X, FileText, FileSearch } from "lucide-react";
import { aiTransactionImporter } from "@/ai/flows/ai-transaction-importer-flow";
import { useToast } from "@/hooks/use-toast";
import { useUser, useFirestore } from "@/firebase";
import { collection, addDoc, doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export function B3ImportDialog() {
  const [text, setText] = useState("");
  const [fileData, setFileData] = useState<{ name: string; uri?: string; isSpreadsheet?: boolean } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Caso seja planilha ou CSV
    if (file.name.match(/\.(xlsx|xls|csv)$/i)) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const XLSX = await import('xlsx');
          const data = new Uint8Array(event.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const csvContent = XLSX.utils.sheet_to_csv(worksheet);
          
          setText(csvContent);
          setFileData({ name: file.name, isSpreadsheet: true });
          
          toast({
            title: "Planilha processada",
            description: "Dados extraídos com sucesso. Você pode revisá-los na caixa de texto.",
          });
        } catch (err) {
          console.error("Erro XLSX:", err);
          toast({
            variant: "destructive",
            title: "Erro ao ler planilha",
            description: "Certifique-se que o arquivo não está protegido por senha.",
          });
        }
      };
      reader.readAsArrayBuffer(file);
      return;
    }

    // Caso seja PDF ou Imagem
    if (file.size > 3.5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "Arquivo muito grande",
        description: "O limite para documentos é 3.5MB.",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFileData({
        name: file.name,
        uri: reader.result as string,
        isSpreadsheet: false
      });
      toast({
        title: "Documento anexado",
        description: `${file.name} pronto para análise visual da IA.`,
      });
    };
    reader.readAsDataURL(file);
  };

  const removeFile = () => {
    setFileData(null);
    setText("");
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
          const safeAmount = Number(tx.amount) || 0;
          
          if (tx.type === 'dividend') {
            const divRef = collection(db, 'users', user.uid, 'dividends');
            addDoc(divRef, {
              ticker: tx.ticker || "OUTROS",
              amount: safeAmount,
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
            // Registro da transação
            const txRef = collection(db, 'users', user.uid, 'transactions');
            addDoc(txRef, {
              ...tx,
              amount: safeAmount,
              quantity: Number(tx.quantity) || 0,
              price: Number(tx.price) || 0,
              createdAt: serverTimestamp(),
            }).catch(async () => {
              errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: `users/${user.uid}/transactions`,
                operation: 'create',
                requestResourceData: tx
              }));
            });

            // Atualização do Ativo
            if (tx.ticker && (tx.type === 'buy' || tx.type === 'sell')) {
              const assetRef = doc(db, 'users', user.uid, 'assets', tx.ticker);
              const assetSnap = await getDoc(assetRef);
              
              let currentQty = 0;
              let currentAvgPrice = 0;

              if (assetSnap.exists()) {
                const data = assetSnap.data();
                currentQty = Number(data.quantity) || 0;
                currentAvgPrice = Number(data.averagePrice) || 0;
              }

              const txQty = Number(tx.quantity) || 0;
              const txPrice = Number(tx.price) || (txQty > 0 ? (safeAmount / txQty) : 0);
              
              let newQty = currentQty;
              let newAvgPrice = currentAvgPrice;

              if (tx.type === 'buy') {
                newQty = currentQty + txQty;
                if (newQty > 0) {
                  newAvgPrice = ((currentQty * currentAvgPrice) + (txQty * txPrice)) / newQty;
                }
              } else {
                newQty = Math.max(0, currentQty - txQty);
              }

              setDoc(assetRef, {
                ticker: tx.ticker,
                type: tx.suggestedCategory || 'Ações',
                quantity: newQty,
                averagePrice: newAvgPrice,
                currentPrice: txPrice || currentAvgPrice,
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
          description: `Processamos ${transactions.length} registros com sucesso.`,
        });
        setIsOpen(false);
        setText("");
        setFileData(null);
      } else {
        toast({
          variant: "destructive",
          title: "Nenhum dado extraído",
          description: "A IA não identificou transações claras. Tente um trecho menor ou outro arquivo.",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro no processamento",
        description: "Não conseguimos analisar os dados agora. Verifique sua conexão.",
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
          <DialogTitle className="text-2xl font-headline font-bold">Importação com IA</DialogTitle>
          <DialogDescription>
            Envie sua **planilha de ativos, PDF da corretora ou apenas cole o texto** abaixo.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Texto Extraído / Bruto:</label>
              {text && (
                <Button variant="ghost" size="sm" onClick={() => setText("")} className="h-6 text-[10px] text-destructive">Limpar Texto</Button>
              )}
            </div>
            <Textarea 
              placeholder="Cole aqui o texto do seu extrato ou arraste um arquivo..."
              className="min-h-[150px] bg-secondary/30 border-border focus:border-primary/50 resize-none p-4 text-[11px] font-mono leading-relaxed"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-3">
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
                className="w-full border-dashed border-2 h-20 flex flex-col gap-1 hover:bg-secondary/50 border-primary/20 transition-all"
                onClick={() => fileInputRef.current?.click()}
              >
                <FileUp className="w-5 h-5 text-primary mb-1" />
                <span className="text-xs font-medium">Anexar Excel, PDF ou Foto</span>
                <span className="text-[9px] text-muted-foreground">Analise automática de movimentações</span>
              </Button>
            ) : (
              <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10 border border-primary/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/20 rounded-md">
                    {fileData.isSpreadsheet ? <FileSpreadsheet className="w-5 h-5 text-primary" /> : <FileText className="w-5 h-5 text-primary" />}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold truncate max-w-[250px]">{fileData.name}</span>
                    <span className="text-[10px] text-primary/80 font-bold tracking-tight uppercase">
                      {fileData.isSpreadsheet ? "Dados de Planilha Carregados" : "Documento Pronto"}
                    </span>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={removeFile} className="h-8 w-8 hover:bg-destructive/10 text-destructive">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" onClick={() => setIsOpen(false)} disabled={isLoading} className="text-xs">
            Cancelar
          </Button>
          <Button 
            onClick={handleImport} 
            disabled={isLoading || (!text.trim() && !fileData) || !user}
            className="premium-gradient border-none min-w-[160px] shadow-lg shadow-primary/20"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                IA Analisando...
              </>
            ) : (
              <>
                <FileSearch className="w-4 h-4 mr-2" />
                Iniciar Análise
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
