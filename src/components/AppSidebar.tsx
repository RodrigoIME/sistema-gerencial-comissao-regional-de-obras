import { 
  FolderKanban, 
  FileStack, 
  BarChart3, 
  FilePlus,
  ClipboardList,
  Briefcase,
  HardHat,
  Shield,
  ChevronDown
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function AppSidebar() {
  const [user, setUser] = useState<User | null>(null);
  const { isAdmin, hasModule, loading } = useUserRole(user);
  const location = useLocation();
  const currentPath = location.pathname;

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

  const isActive = (path: string) => currentPath === path;
  const isGroupActive = (paths: string[]) => paths.some(p => currentPath === p);

  if (loading) {
    return (
      <Sidebar collapsible="icon">
        <SidebarContent>
          <div className="p-4 text-sm text-muted-foreground">Carregando...</div>
        </SidebarContent>
      </Sidebar>
    );
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        {/* Cadastros - Acessível a todos */}
        <SidebarGroup>
          <SidebarGroupLabel>Geral</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive('/cadastros')}>
                  <NavLink to="/cadastros" end>
                    <FolderKanban className={cn(
                      "text-blue-500 transition-all",
                      isActive('/cadastros') && "drop-shadow-md"
                    )} />
                    <span>Cadastros</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* MÓDULO VISTORIAS */}
        {hasModule('vistorias') && (
          <Collapsible defaultOpen={isGroupActive(['/', '/solicitacoes', '/nova-solicitacao'])} className="group/collapsible">
            <SidebarGroup>
              <SidebarGroupLabel asChild>
                <CollapsibleTrigger className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <ClipboardList className="h-4 w-4 text-purple-500" />
                    <span>Vistorias</span>
                  </div>
                  <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuSub>
                      {/* Dashboard */}
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild isActive={isActive('/')}>
                          <NavLink to="/" end>
                            <BarChart3 className={cn(
                              "text-emerald-500 transition-all",
                              isActive('/') && "drop-shadow-md"
                            )} />
                            <span>Dashboard</span>
                          </NavLink>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>

                      {/* Vistorias Cadastradas */}
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild isActive={isActive('/solicitacoes')}>
                          <NavLink to="/solicitacoes" end>
                            <FileStack className={cn(
                              "text-purple-500 transition-all",
                              isActive('/solicitacoes') && "drop-shadow-md"
                            )} />
                            <span>Vistorias Cadastradas</span>
                          </NavLink>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>

                      {/* Nova Solicitação */}
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild isActive={isActive('/nova-solicitacao')}>
                          <NavLink to="/nova-solicitacao" end>
                            <FilePlus className={cn(
                              "text-orange-500 transition-all",
                              isActive('/nova-solicitacao') && "drop-shadow-md"
                            )} />
                            <span>Nova Solicitação</span>
                          </NavLink>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        )}

        {/* MÓDULO PROJETOS (Placeholder) */}
        {hasModule('projetos') && (
          <SidebarGroup>
            <SidebarGroupLabel>
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-blue-500" />
                <span>Projetos</span>
                <Badge variant="secondary" className="text-xs">Em Breve</Badge>
              </div>
            </SidebarGroupLabel>
          </SidebarGroup>
        )}

        {/* MÓDULO FISCALIZAÇÃO (Placeholder) */}
        {hasModule('fiscalizacao') && (
          <SidebarGroup>
            <SidebarGroupLabel>
              <div className="flex items-center gap-2">
                <HardHat className="h-4 w-4 text-amber-500" />
                <span>Fiscalização de Obras</span>
                <Badge variant="secondary" className="text-xs">Em Breve</Badge>
              </div>
            </SidebarGroupLabel>
          </SidebarGroup>
        )}

        {/* ADMIN */}
        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Administração</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive('/admin')}>
                    <NavLink to="/admin" end>
                      <Shield className={cn(
                        "text-red-500 transition-all",
                        isActive('/admin') && "drop-shadow-md"
                      )} />
                      <span>Painel Admin</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
