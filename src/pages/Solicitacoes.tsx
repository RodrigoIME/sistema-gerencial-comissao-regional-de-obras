import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, Search, Upload } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Solicitacao {
  id: number;
  objeto: string;
  status: string;
  data_solicitacao: string;
  organizacao_id: number;
  organizacoes?: {
    nome: string;
    diretoria: string;
  };
}

const Solicitacoes = () => {
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [filteredSolicitacoes, setFilteredSolicitacoes] = useState<Solicitacao[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSolicitacoes();
  }, []);

  useEffect(() => {
    let filtered = solicitacoes;

    if (searchTerm) {
      filtered = filtered.filter(
        (s) =>
          s.objeto.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.organizacoes?.nome.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((s) => s.status === statusFilter);
    }

    setFilteredSolicitacoes(filtered);
  }, [searchTerm, statusFilter, solicitacoes]);

  const fetchSolicitacoes = async () => {
    try {
      const { data, error } = await supabase
        .from("solicitacoes")
        .select(`
          *,
          organizacoes ("Organização Militar", "Órgão Setorial Responsável")
        `)
        .order("data_solicitacao", { ascending: false });

      if (error) throw error;
      
      // Mapear os dados para a interface esperada
      const mappedData = (data || []).map((sol: any) => ({
        ...sol,
        organizacoes: sol.organizacoes ? {
          nome: sol.organizacoes["Organização Militar"],
          diretoria: sol.organizacoes["Órgão Setorial Responsável"],
        } : undefined,
      }));
      
      setSolicitacoes(mappedData);
      setFilteredSolicitacoes(mappedData);
    } catch (error: any) {
      toast.error("Erro ao carregar solicitações");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      pending: { label: "Pendente", className: "bg-accent/20 text-accent hover:bg-accent/30" },
      in_progress: { label: "Em Andamento", className: "bg-primary/20 text-primary hover:bg-primary/30" },
      completed: { label: "Concluída", className: "bg-secondary/20 text-secondary hover:bg-secondary/30" },
    };

    const variant = variants[status] || variants.pending;
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-2">Solicitações</h2>
          <p className="text-muted-foreground">
            Gerencie todas as solicitações de inspeção
          </p>
        </div>
        <Button
          onClick={() => navigate("/importar-vistorias")}
          className="gap-2"
        >
          <Upload className="h-4 w-4" />
          Importar Vistorias
        </Button>
      </div>

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por objeto ou organização..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="in_progress">Em Andamento</SelectItem>
                <SelectItem value="completed">Concluída</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {filteredSolicitacoes.length === 0 ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                Nenhuma solicitação encontrada
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredSolicitacoes.map((solicitacao) => (
            <Card
              key={solicitacao.id}
              className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">{solicitacao.objeto}</h3>
                      {getStatusBadge(solicitacao.status)}
                    </div>
                    {solicitacao.organizacoes && (
                      <div className="text-sm text-muted-foreground">
                        <p className="font-medium">{solicitacao.organizacoes.nome}</p>
                        <p>{solicitacao.organizacoes.diretoria}</p>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Criada em{" "}
                      {format(new Date(solicitacao.data_solicitacao), "dd 'de' MMMM 'de' yyyy", {
                        locale: ptBR,
                      })}
                    </p>
                  </div>
                  <Button
                    onClick={() => navigate(`/solicitacao/${solicitacao.id}`)}
                    size="sm"
                    className="gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Ver Detalhes
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Solicitacoes;
