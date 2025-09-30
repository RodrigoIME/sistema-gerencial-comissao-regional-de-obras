import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Paperclip, ClipboardCheck } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface SolicitacaoDetalhes {
  id: number;
  objeto: string;
  status: string;
  data_solicitacao: string;
  organizacoes?: {
    nome: string;
    diretoria: string;
  };
}

interface Vistoria {
  id: number;
  descricao: string;
  data_vistoria: string;
  relatorio: string;
}

interface Anexo {
  id: number;
  url: string;
  tipo: string;
  uploaded_at: string;
}

const SolicitacaoDetalhes = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [solicitacao, setSolicitacao] = useState<SolicitacaoDetalhes | null>(null);
  const [vistorias, setVistorias] = useState<Vistoria[]>([]);
  const [anexos, setAnexos] = useState<Anexo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    if (!id) return;
    
    try {
      const solicitacaoId = parseInt(id);
      
      const [solicitacaoRes, vistoriasRes, anexosRes] = await Promise.all([
        supabase
          .from("solicitacoes")
          .select(`*, organizacoes (nome, diretoria)`)
          .eq("id", solicitacaoId)
          .single(),
        supabase
          .from("vistorias")
          .select("*")
          .eq("solicitacao_id", solicitacaoId)
          .order("data_vistoria", { ascending: false }),
        supabase
          .from("anexos")
          .select("*")
          .eq("solicitacao_id", solicitacaoId)
          .order("uploaded_at", { ascending: false }),
      ]);

      if (solicitacaoRes.error) throw solicitacaoRes.error;

      setSolicitacao(solicitacaoRes.data);
      setVistorias(vistoriasRes.data || []);
      setAnexos(anexosRes.data || []);
    } catch (error: any) {
      toast.error("Erro ao carregar detalhes");
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

  if (!solicitacao) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-muted-foreground">Solicitação não encontrada</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate("/solicitacoes")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Detalhes da Solicitação</h2>
        </div>
      </div>

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-2xl">{solicitacao.objeto}</CardTitle>
              {solicitacao.organizacoes && (
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium">{solicitacao.organizacoes.nome}</p>
                  <p>{solicitacao.organizacoes.diretoria}</p>
                </div>
              )}
            </div>
            {getStatusBadge(solicitacao.status)}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Criada em{" "}
            {format(new Date(solicitacao.data_solicitacao), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", {
              locale: ptBR,
            })}
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-secondary" />
              <CardTitle>Vistorias</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {vistorias.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nenhuma vistoria registrada
              </p>
            ) : (
              <div className="space-y-4">
                {vistorias.map((vistoria) => (
                  <div
                    key={vistoria.id}
                    className="p-4 rounded-lg bg-secondary/5 border border-secondary/20"
                  >
                    <p className="font-medium mb-1">{vistoria.descricao}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(vistoria.data_vistoria), "dd/MM/yyyy", {
                        locale: ptBR,
                      })}
                    </p>
                    {vistoria.relatorio && (
                      <p className="text-sm mt-2">{vistoria.relatorio}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Paperclip className="w-5 h-5 text-primary" />
              <CardTitle>Anexos</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {anexos.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nenhum anexo disponível
              </p>
            ) : (
              <div className="space-y-2">
                {anexos.map((anexo) => (
                  <a
                    key={anexo.id}
                    href={anexo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary/5 border border-primary/20 transition-colors"
                  >
                    <FileText className="w-5 h-5 text-primary" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        Anexo {anexo.id}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(anexo.uploaded_at), "dd/MM/yyyy", {
                          locale: ptBR,
                        })}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SolicitacaoDetalhes;
