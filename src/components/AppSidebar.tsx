import { 
  FolderKanban, 
  FileStack, 
  BarChart3, 
  FilePlus,
  ClipboardList,
  Briefcase,
  HardHat,
  Shield
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { logger } from '@/lib/logger/init';
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
  useSidebar,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function AppSidebar() {
  const [user, setUser] = useState<User | null>(null);
  const { isAdmin, hasModule, loading } = useUserRole(user);
  const location = useLocation();
  const currentPath = location.pathname;
  const { state } = useSidebar();
  const isCollapsedSidebar = state === "collapsed";

  useEffect(() => {
    // Buscar usuário atual
    supabase.auth.getUser().then(({ data: { user } }) => {
      console.log('[AppSidebar] Usuário carregado:', user?.email, user?.id);
      setUser(user);
    });

    // Listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('[AppSidebar] Auth state changed:', _event, session?.user?.email);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Log do estado atual
  useEffect(() => {
    console.log('[AppSidebar] Estado atual - isAdmin:', isAdmin, 'hasModule vistorias:', hasModule('vistorias'), 'loading:', loading);
  }, [isAdmin, hasModule, loading]);

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
          <>
            {/* QUANDO COLAPSADA: Mostrar apenas ícone principal */}
            {isCollapsedSidebar ? (
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton 
                        asChild 
                        isActive={isGroupActive(['/', '/solicitacoes', '/nova-solicitacao'])}
                        tooltip="Vistorias"
                      >
                        <NavLink to="/">
                          <ClipboardList className={cn(
                            "text-purple-500 transition-all",
                            isGroupActive(['/', '/solicitacoes', '/nova-solicitacao']) && "drop-shadow-md"
                          )} />
                          <span>Vistorias</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ) : (
              /* QUANDO EXPANDIDA: Mostrar subitens sempre visíveis */
              <SidebarGroup>
                <SidebarGroupLabel>Vistorias</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {/* Dashboard */}
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={isActive('/')}>
                        <NavLink to="/" end>
                          <BarChart3 className={cn(
                            "text-emerald-500 transition-all",
                            isActive('/') && "drop-shadow-md"
                          )} />
                          <span>Dashboard</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>

                    {/* Vistorias Cadastradas */}
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={isActive('/solicitacoes')}>
                        <NavLink to="/solicitacoes" end>
                          <FileStack className={cn(
                            "text-purple-500 transition-all",
                            isActive('/solicitacoes') && "drop-shadow-md"
                          )} />
                          <span>Vistorias Cadastradas</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>

                    {/* Nova Solicitação */}
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={isActive('/nova-solicitacao')}>
                        <NavLink to="/nova-solicitacao" end>
                          <FilePlus className={cn(
                            "text-orange-500 transition-all",
                            isActive('/nova-solicitacao') && "drop-shadow-md"
                          )} />
                          <span>Nova Solicitação</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}
          </>
        )}

        {/* MÓDULO PROJETOS */}
        {hasModule('projetos') && (
          <>
            {isCollapsedSidebar ? (
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton 
                        asChild 
                        isActive={isGroupActive(['/projetos', '/projetos/lista', '/projetos/novo'])}
                        tooltip="Projetos"
                      >
                        <NavLink to="/projetos">
                          <Briefcase className={cn(
                            "text-blue-500 transition-all",
                            isGroupActive(['/projetos', '/projetos/lista', '/projetos/novo']) && "drop-shadow-md"
                          )} />
                          <span>Projetos</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ) : (
              <SidebarGroup>
                <SidebarGroupLabel>Projetos</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={isActive('/projetos')}>
                        <NavLink to="/projetos" end>
                          <Briefcase className={cn(
                            "text-blue-500 transition-all",
                            isActive('/projetos') && "drop-shadow-md"
                          )} />
                          <span>Dashboard</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={isActive('/projetos/lista')}>
                        <NavLink to="/projetos/lista" end>
                          <FileStack className={cn(
                            "text-indigo-500 transition-all",
                            isActive('/projetos/lista') && "drop-shadow-md"
                          )} />
                          <span>Projetos Cadastrados</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={isActive('/projetos/novo')}>
                        <NavLink to="/projetos/novo" end>
                          <FilePlus className={cn(
                            "text-cyan-500 transition-all",
                            isActive('/projetos/novo') && "drop-shadow-md"
                          )} />
                          <span>Novo Projeto</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}
          </>
        )}

        {/* MÓDULO FISCALIZAÇÃO (Placeholder) */}
        {hasModule('fiscalizacao') && (
          <SidebarGroup>
            <SidebarGroupLabel>Fiscalização</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton disabled>
                    <HardHat className="text-amber-500" />
                    <span>Fiscalização de Obras</span>
                    {!isCollapsedSidebar && (
                      <Badge variant="secondary" className="text-xs ml-auto">Em Breve</Badge>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
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
