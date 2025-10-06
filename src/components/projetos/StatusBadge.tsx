import { Badge } from "@/components/ui/badge";
import { CirclePause, CheckCircle2, XCircle, Clock } from "lucide-react";

interface StatusBadgeProps {
  status: "Em Andamento" | "Em Pausa" | "Concluído" | "Cancelado";
  className?: string;
}

export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const config = {
    "Em Andamento": {
      icon: Clock,
      className: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
    },
    "Em Pausa": {
      icon: CirclePause,
      className: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
    },
    "Concluído": {
      icon: CheckCircle2,
      className: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    },
    "Cancelado": {
      icon: XCircle,
      className: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
    },
  };

  const { icon: Icon, className: statusClass } = config[status];

  return (
    <Badge variant="outline" className={`${statusClass} ${className} gap-1.5`}>
      <Icon className="h-3.5 w-3.5" />
      {status}
    </Badge>
  );
};
