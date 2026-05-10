
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  AuthError
} from 'firebase/auth';
import { useAuth, useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { TrendingUp, Loader2, AlertCircle, ShieldCheck, RefreshCw, Key, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { isConfigValid, getMissingKeys } from '@/firebase/config';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, loading: authLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && user) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  const missingKeys = getMissingKeys();

  if (!isConfigValid && !authLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 relative">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
        
        <div className="mb-8 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl premium-gradient flex items-center justify-center shadow-lg shadow-primary/20">
            <TrendingUp className="text-white w-7 h-7" />
          </div>
          <span className="text-3xl font-headline font-bold text-gradient">DeltaWealth</span>
        </div>

        <Card className="w-full max-w-md border-primary/20 bg-card/50 backdrop-blur-xl animate-in fade-in zoom-in duration-500">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Key className="w-8 h-8 text-primary animate-pulse" />
            </div>
            <CardTitle className="font-headline text-2xl">Configuração Necessária</CardTitle>
            <CardDescription>
              Conecte sua conta do Firebase para começar.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="bg-primary/5 border-primary/20 text-primary">
              <ShieldCheck className="h-4 w-4" />
              <AlertTitle>Como resolver?</AlertTitle>
              <AlertDescription className="text-xs space-y-2">
                <p>Vá ao Console do Firebase, em <b>Configurações do Projeto</b> e copie o objeto de configuração Web.</p>
                <p>Cole as chaves no arquivo <b>.env</b> ou diretamente em <b>src/firebase/config.ts</b>.</p>
              </AlertDescription>
            </Alert>
            
            <div className="bg-secondary/30 p-4 rounded-lg space-y-3 border border-border/50">
               <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Chaves não detectadas:</p>
               <div className="font-mono text-[10px] text-destructive space-y-1">
                  {missingKeys.map(key => (
                    <p key={key}>• {key}</p>
                  ))}
               </div>
            </div>

            <Button variant="link" className="w-full text-xs gap-1" asChild>
              <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer">
                Ir para o Console do Firebase <ExternalLink className="w-3 h-3" />
              </a>
            </Button>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button 
              className="w-full premium-gradient border-none h-11 shadow-lg shadow-primary/20" 
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Já configurei, recarregar
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const handleEmailAuth = async (type: 'login' | 'signup') => {
    if (!auth) {
        setError("O Firebase não foi inicializado corretamente. Verifique suas chaves.");
        return;
    }
    if (!email || !password) {
        setError("Preencha e-mail e senha.");
        return;
    }
    setIsLoading(true);
    setError(null);
    try {
      if (type === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      router.push('/dashboard');
    } catch (err: any) {
      const authError = err as AuthError;
      console.error("Firebase Auth Error:", authError.code, authError.message);
      
      let message = `Erro (${authError.code}): ${authError.message}`;
      
      if (authError.code === 'auth/invalid-credential') message = "E-mail ou senha incorretos.";
      if (authError.code === 'auth/email-already-in-use') message = "Este e-mail já está em uso.";
      if (authError.code === 'auth/weak-password') message = "A senha deve ter pelo menos 6 caracteres.";
      if (authError.code === 'auth/invalid-email') message = "E-mail inválido.";
      if (authError.code === 'auth/operation-not-allowed') message = "O login por e-mail/senha não está ativado no Console do Firebase.";

      setError(message);
      toast({
        variant: "destructive",
        title: "Erro na autenticação",
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!auth) {
        setError("O Firebase não foi inicializado corretamente.");
        return;
    }
    setIsLoading(true);
    setError(null);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push('/dashboard');
    } catch (err: any) {
      const authError = err as AuthError;
      console.error("Google Auth Error:", authError.code, authError.message);
      
      if (authError.code !== 'auth/popup-closed-by-user') {
        let message = `Erro Google (${authError.code}): ${authError.message}`;
        if (authError.code === 'auth/operation-not-allowed') {
            message = "O login do Google não está ativado no Console do Firebase.";
        }
        setError(message);
        toast({
          variant: "destructive",
          title: "Erro com Google",
          description: message,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[120px]" />

      <div className="mb-8 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="w-12 h-12 rounded-xl premium-gradient flex items-center justify-center shadow-lg shadow-primary/20">
          <TrendingUp className="text-white w-7 h-7" />
        </div>
        <span className="text-3xl font-headline font-bold text-gradient">DeltaWealth</span>
      </div>

      <Card className="w-full max-w-md border-border/50 bg-card/50 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-700">
        <Tabs defaultValue="login" className="w-full">
          <CardHeader>
            <TabsList className="grid w-full grid-cols-2 bg-secondary/50 p-1">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="signup">Criar Conta</TabsTrigger>
            </TabsList>
          </CardHeader>
          
          <TabsContent value="login">
            <CardContent className="space-y-4 pt-4">
              {error && (
                <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Erro</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="seu@email.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-secondary/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input 
                  id="password" 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-secondary/20"
                />
              </div>
              <Button 
                className="w-full premium-gradient border-none h-11" 
                onClick={() => handleEmailAuth('login')}
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Acessar Plataforma"}
              </Button>
            </CardContent>
          </TabsContent>

          <TabsContent value="signup">
            <CardContent className="space-y-4 pt-4">
              {error && (
                <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Erro</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="new-email">E-mail</Label>
                <Input 
                  id="new-email" 
                  type="email" 
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-secondary/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">Senha</Label>
                <Input 
                  id="new-password" 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-secondary/20"
                />
              </div>
              <Button 
                className="w-full premium-gradient border-none h-11" 
                onClick={() => handleEmailAuth('signup')}
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Criar Minha Conta"}
              </Button>
            </CardContent>
          </TabsContent>

          <div className="px-6 pb-6">
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Ou continue com</span>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="w-full h-11 border-border/50 hover:bg-secondary/50" 
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </Button>
          </div>
        </Tabs>
      </Card>
      
      <p className="mt-8 text-xs text-muted-foreground">
        DeltaWealth Premium Portfolio Management
      </p>
    </div>
  );
}
