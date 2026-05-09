"use client"

import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Bell, Shield, Wallet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: "Configurações salvas",
      description: "Suas alterações foram aplicadas com sucesso.",
    });
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-headline font-bold tracking-tight">Configurações</h2>
        <p className="text-muted-foreground">Gerencie sua conta e preferências da plataforma.</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-secondary/50 border border-border/50 p-1">
          <TabsTrigger value="profile" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
            <User className="w-4 h-4" />
            Perfil
          </TabsTrigger>
          <TabsTrigger value="portfolio" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
            <Wallet className="w-4 h-4" />
            Carteira
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
            <Bell className="w-4 h-4" />
            Notificações
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
            <Shield className="w-4 h-4" />
            Segurança
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Card className="border-border/50 bg-card/50">
            <CardHeader>
              <CardTitle className="font-headline">Informações Pessoais</CardTitle>
              <CardDescription>Atualize seus dados de contato e foto de perfil.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input id="name" defaultValue="Investidor Premium" className="bg-secondary/20 border-border/50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" defaultValue="investidor@deltawealth.com" className="bg-secondary/20 border-border/50" />
                </div>
              </div>
              <Button onClick={handleSave} className="premium-gradient border-none px-8">Salvar Alterações</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="portfolio" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Card className="border-border/50 bg-card/50">
            <CardHeader>
              <CardTitle className="font-headline">Preferências da Carteira</CardTitle>
              <CardDescription>Configure como seus dados de investimento são exibidos.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Moeda Principal</Label>
                  <Select defaultValue="brl">
                    <SelectTrigger className="bg-secondary/20 border-border/50">
                      <SelectValue placeholder="Selecione a moeda" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="brl">Real (BRL)</SelectItem>
                      <SelectItem value="usd">Dólar (USD)</SelectItem>
                      <SelectItem value="eur">Euro (EUR)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Benchmark Padrão</Label>
                  <Select defaultValue="cdi">
                    <SelectTrigger className="bg-secondary/20 border-border/50">
                      <SelectValue placeholder="Selecione o benchmark" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cdi">CDI</SelectItem>
                      <SelectItem value="ibov">Ibovespa</SelectItem>
                      <SelectItem value="ipca">IPCA + 6%</SelectItem>
                      <SelectItem value="sp500">S&P 500</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-xl border-border/50 bg-secondary/10">
                <div className="space-y-0.5">
                  <Label className="text-base">Exibir Preço Médio</Label>
                  <p className="text-sm text-muted-foreground">Mostrar o preço médio de compra nas tabelas de ativos.</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Button onClick={handleSave} className="premium-gradient border-none px-8">Salvar Preferências</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Card className="border-border/50 bg-card/50">
            <CardHeader>
              <CardTitle className="font-headline">Alertas e Notificações</CardTitle>
              <CardDescription>Escolha como deseja ser avisado sobre sua carteira.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-xl border-border/50 bg-secondary/10">
                  <div className="space-y-0.5">
                    <Label className="text-base">Dividendos Recebidos</Label>
                    <p className="text-sm text-muted-foreground">Notificar via e-mail quando um novo provento for creditado.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-xl border-border/50 bg-secondary/10">
                  <div className="space-y-0.5">
                    <Label className="text-base">Relatório Mensal</Label>
                    <p className="text-sm text-muted-foreground">Receber um PDF com o resumo da performance todo dia 1º.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
              <Button onClick={handleSave} className="premium-gradient border-none px-8">Salvar Notificações</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Card className="border-border/50 bg-card/50">
            <CardHeader>
              <CardTitle className="font-headline">Segurança da Conta</CardTitle>
              <CardDescription>Proteja sua conta com senhas fortes.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Senha Atual</Label>
                  <Input id="current-password" type="password" className="bg-secondary/20 border-border/50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">Nova Senha</Label>
                  <Input id="new-password" type="password" className="bg-secondary/20 border-border/50" />
                </div>
              </div>
              <Button onClick={handleSave} className="premium-gradient border-none px-8">Alterar Senha</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
