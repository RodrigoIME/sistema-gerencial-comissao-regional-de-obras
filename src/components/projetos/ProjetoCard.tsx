import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./StatusBadge";
import { Eye, Edit, Building2, Calendar, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

interface ProjetoCardProps {
  projeto: {
    id: string;
    numero_opus: string;
    objeto: string;
    status: "Em Andamento" | "Em Pausa" | "Concluído" | "Cancelado";
    valor_estimado_dfd: number;
    organizacao?: {
      "Sigla da OM": string;
    };
    diretoria_responsavel: string;
    prioridade: "Alta" | "Média" | "Baixa";
    created_at: string;
  };
}

export const ProjetoCard = ({ projeto }: ProjetoCardProps) => {
  const navigate = useNavigate();

  const prioridadeColor = {
    Alta: "text-red-600 dark:text-red-400",
    Média: "text-yellow-600 dark:text-yellow-400",
    Baixa: "text-green-600 dark:text-green-400",
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base flex items-center gap-2">
              <span className="font-mono text-sm text-muted-foreground">
                {projeto.numero_opus}
              </span>
            </CardTitle>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {projeto.objeto}
            </p>
          </div>
          <StatusBadge status={projeto.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span className="truncate" title={projeto.organizacao?.["Sigla da OM"]}>
              {projeto.organizacao?.["Sigla da OM"] || "N/A"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span>
              {projeto.valor_estimado_dfd.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
                minimumFractionDigits: 0,
              })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs">
              {format(new Date(projeto.created_at), "dd/MM/yyyy", { locale: ptBR })}
            </span>
          </div>
          <div className={`text-xs font-medium ${prioridadeColor[projeto.prioridade]}`}>
            {projeto.prioridade} Prioridade
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={() => navigate(`/projetos/${projeto.id}`)}
          >
            <Eye className="h-4 w-4 mr-1" />
            Visualizar
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={() => navigate(`/projetos/${projeto.id}/editar`)}
          >
            <Edit className="h-4 w-4 mr-1" />
            Editar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
