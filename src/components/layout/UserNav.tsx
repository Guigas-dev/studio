"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Bell, Search, User, CreditCard, LogOut } from "lucide-react";

export function UserNav() {
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center bg-secondary/50 rounded-full px-4 py-2 border border-border mr-4 group hover:border-primary/30 transition-all">
        <Search className="w-4 h-4 text-muted-foreground mr-2" />
        <input 
          type="text" 
          placeholder="Buscar ativos..." 
          className="bg-transparent border-none outline-none text-sm w-48 placeholder:text-muted-foreground"
        />
      </div>

      <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-primary">
        <Bell className="w-5 h-5" />
        <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-background"></span>
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full border border-border p-0 overflow-hidden hover:border-primary/30 transition-all">
            <Avatar className="h-full w-full">
              <AvatarImage src="https://picsum.photos/seed/user/100/100" alt="Avatar" />
              <AvatarFallback>UN</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 mt-2 border-border bg-card" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">Investidor Premium</p>
              <p className="text-xs leading-none text-muted-foreground">investidor@deltawealth.com</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem className="gap-2 cursor-pointer">
              <User className="w-4 h-4" />
              <span>Perfil</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 cursor-pointer">
              <CreditCard className="w-4 h-4" />
              <span>Assinatura</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="gap-2 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10">
            <LogOut className="w-4 h-4" />
            <span>Sair</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}