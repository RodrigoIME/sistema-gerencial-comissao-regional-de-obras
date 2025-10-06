import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/projetos/StatusBadge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Edit, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ProjetoDetalhes() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [projeto, setProjeto] = useState<any>(null);

  useEffect(() => {
    if (id) {
      fetchProjeto();
    }
  }, [id]);

  const fetchProjeto = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("projetos")
        .select(`
          *,
          organizacao:organizacoes(*)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;

      setProjeto(data);
    } catch (error: any) {
      console.error("Erro ao carregar projeto:", error);
      toast({
        title: "Erro ao carregar projeto",
        description: error.message,
        variant: "destructive",
      });
      navigate("/projetos");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!projeto) {
    return null;
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-6">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          onClick={() => navigate("/projetos/lista")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">OPUS {projeto.numero_opus}</h1>
              <StatusBadge status={projeto.status} />
            </div>
            <p className="text-muted-foreground">{projeto.objeto}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Exportar PDF
            </Button>
            <Button onClick={() => navigate(`/projetos/${id}/editar`)}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="dados" className="space-y-4">
        <TabsList>
          <TabsTrigger value="dados">Dados Cadastrais</TabsTrigger>
          <TabsTrigger value="indicadores">Indicadores</TabsTrigger>
          <TabsTrigger value="anexos">Anexos</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="dados" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div>
                <span className="text-sm font-medium text-muted-foreground">
                  Número OPUS
                </span>
                <p className="font-mono">{projeto.numero_opus}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">
                  OM Apoiada
                </span>
                <p>{projeto.organizacao?.["Organização Militar"] || "N/A"}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">
                  Diretoria Responsável
                </span>
                <p>{projeto.diretoria_responsavel}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">
                  OM Executora
                </span>
                <p>{projeto.om_executora}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">
                  Natureza do Objeto
                </span>
                <p>{projeto.natureza_objeto}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">
                  Prioridade
                </span>
                <p>{projeto.prioridade}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dados Orçamentários</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div>
                <span className="text-sm font-medium text-muted-foreground">
                  Valor Estimado (DFD)
                </span>
                <p className="text-lg font-semibold">
                  {Number(projeto.valor_estimado_dfd).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">
                  Recursos Previstos 2025
                </span>
                <p className="text-lg font-semibold">
                  {Number(projeto.recursos_previstos_2025).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">
                  Plano Orçamentário
                </span>
                <p>{projeto.plano_orcamentario}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">
                  Ação Orçamentária
                </span>
                <p>{projeto.acao_orcamentaria}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="indicadores">
          <Card>
            <CardHeader>
              <CardTitle>Indicadores de Controle</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Em desenvolvimento...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="anexos">
          <Card>
            <CardHeader>
              <CardTitle>Anexos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Em desenvolvimento...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="historico">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Alterações</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Em desenvolvimento...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
