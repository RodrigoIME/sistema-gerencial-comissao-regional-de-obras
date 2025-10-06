import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/projetos/StatusBadge";
import { StatusChangeDialog } from "@/components/projetos/StatusChangeDialog";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Edit, FileText, RefreshCw, History } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AnexosManager } from "@/components/projetos/AnexosManager";
import { exportProjetoToPDF } from "@/lib/projetoExportUtils";

export default function ProjetoDetalhes() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [projeto, setProjeto] = useState<any>(null);
  const [historico, setHistorico] = useState<any[]>([]);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProjeto();
      fetchHistorico();
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

  const fetchHistorico = async () => {
    try {
      const { data, error } = await supabase
        .from("projetos_historico")
        .select(`
          *,
          usuario:usuarios(nome, nome_guerra)
        `)
        .eq("projeto_id", id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setHistorico(data || []);
    } catch (error: any) {
      console.error("Erro ao carregar histórico:", error);
    }
  };

  const handleStatusChanged = () => {
    fetchProjeto();
    fetchHistorico();
  };

  const calcularDiasAtraso = () => {
    if (!projeto?.prazo_previsto || projeto.status === "Concluído") return 0;

    const prazo = new Date(projeto.prazo_previsto);
    const hoje = new Date();
    const diff = hoje.getTime() - prazo.getTime();
    const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    return dias > 0 ? dias : 0;
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
            <Button
              variant="outline"
              onClick={() => setStatusDialogOpen(true)}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Mudar Status
            </Button>
            <Button variant="outline" onClick={() => exportProjetoToPDF(projeto)}>
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

        <TabsContent value="indicadores" className="space-y-4">
          {/* Indicadores de Controle */}
          <Card>
            <CardHeader>
              <CardTitle>Indicadores de Controle</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <span className="font-medium">Está no PCA 2025?</span>
                <Badge variant={projeto.esta_no_pca_2025 ? "default" : "secondary"}>
                  {projeto.esta_no_pca_2025 ? "Sim" : "Não"}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <span className="font-medium">Está no DFD?</span>
                <Badge variant={projeto.esta_no_dfd ? "default" : "secondary"}>
                  {projeto.esta_no_dfd ? "Sim" : "Não"}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <span className="font-medium">Foi lançado no OPUS?</span>
                <Badge variant={projeto.foi_lancado_opus ? "default" : "secondary"}>
                  {projeto.foi_lancado_opus ? "Sim" : "Não"}
                </Badge>
              </div>
              {projeto.foi_lancado_opus && projeto.data_lancamento_opus && (
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <span className="font-medium">Data Lançamento OPUS</span>
                  <span>
                    {format(new Date(projeto.data_lancamento_opus), "dd/MM/yyyy", {
                      locale: ptBR,
                    })}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Prazos e Atrasos */}
          <Card>
            <CardHeader>
              <CardTitle>Prazos</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              {projeto.prazo_inicial && (
                <div>
                  <span className="text-sm font-medium text-muted-foreground">
                    Prazo Inicial
                  </span>
                  <p className="text-lg">
                    {format(new Date(projeto.prazo_inicial), "dd/MM/yyyy", {
                      locale: ptBR,
                    })}
                  </p>
                </div>
              )}
              {projeto.prazo_previsto && (
                <div>
                  <span className="text-sm font-medium text-muted-foreground">
                    Prazo Previsto
                  </span>
                  <p className="text-lg">
                    {format(new Date(projeto.prazo_previsto), "dd/MM/yyyy", {
                      locale: ptBR,
                    })}
                  </p>
                </div>
              )}
              {projeto.status === "Concluído" && projeto.prazo_real_conclusao && (
                <div>
                  <span className="text-sm font-medium text-muted-foreground">
                    Prazo Real de Conclusão
                  </span>
                  <p className="text-lg">
                    {format(new Date(projeto.prazo_real_conclusao), "dd/MM/yyyy", {
                      locale: ptBR,
                    })}
                  </p>
                </div>
              )}
              {calcularDiasAtraso() > 0 && (
                <div>
                  <span className="text-sm font-medium text-muted-foreground">
                    Dias de Atraso
                  </span>
                  <p className="text-lg font-semibold text-red-600">
                    {calcularDiasAtraso()} dias
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Motivos de Pausa/Cancelamento */}
          {(projeto.motivo_pausa || projeto.motivo_cancelamento) && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {projeto.status === "Em Pausa" ? "Motivo da Pausa" : "Motivo do Cancelamento"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">
                  {projeto.motivo_pausa || projeto.motivo_cancelamento}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="anexos">
          <Card>
            <CardHeader>
              <CardTitle>Anexos</CardTitle>
            </CardHeader>
            <CardContent>
              {id && <AnexosManager projetoId={id} mode="view" />}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="historico">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Histórico de Alterações
              </CardTitle>
            </CardHeader>
            <CardContent>
              {historico.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhuma alteração registrada ainda
                </p>
              ) : (
                <div className="space-y-4">
                  {historico.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-4 pb-4 border-b last:border-b-0"
                    >
                      <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-primary" />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-medium">{item.acao}</p>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {format(new Date(item.created_at), "dd/MM/yyyy 'às' HH:mm", {
                              locale: ptBR,
                            })}
                          </span>
                        </div>
                        {item.usuario && (
                          <p className="text-sm text-muted-foreground">
                            Por: {item.usuario.nome_guerra || item.usuario.nome || "Usuário"}
                          </p>
                        )}
                        {item.campo_alterado && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Campo:</span>{" "}
                            <span className="font-medium">{item.campo_alterado}</span>
                            {item.valor_anterior && item.valor_novo && (
                              <>
                                <br />
                                <span className="text-red-600">
                                  De: {item.valor_anterior}
                                </span>
                                {" → "}
                                <span className="text-green-600">
                                  Para: {item.valor_novo}
                                </span>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog de Mudança de Status */}
      <StatusChangeDialog
        open={statusDialogOpen}
        onOpenChange={setStatusDialogOpen}
        currentStatus={projeto?.status}
        projetoId={id!}
        onStatusChanged={handleStatusChanged}
      />
    </div>
  );
}
