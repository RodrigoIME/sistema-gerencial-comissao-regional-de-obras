import { Badge } from "@/components/ui/badge";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type StatusVariant = {
  label: string;
  icon?: LucideIcon;
  className: string;
};

export type StatusConfig = Record<string, StatusVariant>;

interface StatusBadgeProps {
  status: string;
  config: StatusConfig;
  className?: string;
  showIcon?: boolean;
}

/**
 * Componente genérico de badge de status
 * Aceita configuração customizada para diferentes tipos de status
 */
export const StatusBadge = ({ 
  status, 
  config, 
  className,
  showIcon = true 
}: StatusBadgeProps) => {
  const variant = config[status];

  if (!variant) {
    return (
      <Badge variant="outline" className={className}>
        {status}
      </Badge>
    );
  }

  const Icon = variant.icon;

  return (
    <Badge 
      variant="outline" 
      className={cn(variant.className, className, showIcon && Icon && "gap-1.5")}
    >
      {showIcon && Icon && <Icon className="h-3.5 w-3.5" />}
      {variant.label}
    </Badge>
  );
};

// Configurações pré-definidas para reutilização

export const VISTORIA_STATUS_CONFIG: StatusConfig = {
  pending: {
    label: "Pendente",
    className: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
  },
  in_progress: {
    label: "Em Andamento",
    className: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  },
  completed: {
    label: "Concluída",
    className: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
  },
  rejected: {
    label: "Especialidade não correspondente",
    className: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
  },
};

export const URGENCIA_CONFIG: StatusConfig = {
  "Urgente": {
    label: "Urgente",
    className: "bg-destructive/20 text-destructive hover:bg-destructive/30",
  },
  "Urgentíssimo": {
    label: "Urgentíssimo",
    className: "bg-destructive/20 text-destructive hover:bg-destructive/30",
  },
  "Prioritário": {
    label: "Prioritário",
    className: "bg-primary/20 text-primary hover:bg-primary/30",
  },
  "Não Prioritário": {
    label: "Não Prioritário",
    className: "border-muted-foreground/30",
  },
  "Normal": {
    label: "Normal",
    className: "border-muted-foreground/30",
  },
};
