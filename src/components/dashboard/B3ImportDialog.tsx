"use client"

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Wand2, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { aiTransactionImporter } from "@/ai/flows/ai-transaction-importer-flow";
import { useToast } from "@/hooks/use-toast";

export function B3ImportDialog() {
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  async function handleImport() {
    if (!text.trim()) return;

    setIsLoading(true);
    try {
      const result = await aiTransactionImporter({ rawStatement: text });
      
      if (result && result.length > 0) {
        toast({
          title: "Importação concluída!",
          description: `Identificamos ${result.length} novas transações com sucesso.`,
        });
        setIsOpen(false);
        setText("");
      } else {
        toast({
          variant: "destructive",
          title: "Nenhuma transação encontrada",
          description: "Não conseguimos identificar transações no texto fornecido. Verifique se o formato está correto.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro na importação",
        description: "Ocorreu um problema ao processar seu extrato. Tente novamente mais tarde.",
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
            Cole abaixo o texto copiado do Portal do Investidor B3 ou do seu extrato bancário. Nossa IA irá identificar os ativos, datas e valores automaticamente.
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
              Dica: Você pode copiar toda a tabela de movimentações do portal da B3 e colar aqui. O processamento é seguro e local para sua sessão.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setIsOpen(false)} disabled={isLoading}>
            Cancelar
          </Button>
          <Button 
            onClick={handleImport} 
            disabled={isLoading || !text.trim()}
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
                Processar Texto
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
