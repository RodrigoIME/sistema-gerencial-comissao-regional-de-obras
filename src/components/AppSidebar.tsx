import { FolderKanban, FileStack, BarChart3, FilePlus } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const items = [
  { title: "Cadastros", url: "/cadastros", icon: FolderKanban, color: "text-blue-500" },
  { title: "Solicitações", url: "/solicitacoes", icon: FileStack, color: "text-purple-500" },
  { title: "Dashboard", url: "/", icon: BarChart3, color: "text-emerald-500" },
  { title: "Nova Solicitação", url: "/nova-solicitacao", icon: FilePlus, color: "text-orange-500" },
];

export function AppSidebar() {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink to={item.url} end>
                      <item.icon className={cn(
                        item.color,
                        "transition-all",
                        isActive(item.url) && "drop-shadow-md"
                      )} />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
