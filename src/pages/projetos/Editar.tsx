import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { projetoSchema, type ProjetoFormData } from "@/lib/projectValidation";
import { Step1Basico } from "@/components/projetos/forms/Step1Basico";
import { Step2Orcamento } from "@/components/projetos/forms/Step2Orcamento";
import { Step3Equipe } from "@/components/projetos/forms/Step3Equipe";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnexosManager } from "@/components/projetos/AnexosManager";

export default function EditarProjeto() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const form = useForm<ProjetoFormData>({
    resolver: zodResolver(projetoSchema),
    mode: "onChange",
  });

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
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      // Preencher formulário com dados existentes
      form.reset({
        numero_opus: data.numero_opus,
        objeto: data.objeto,
        organizacao_id: data.organizacao_id,
        diretoria_responsavel: data.diretoria_responsavel as any,
        om_executora: data.om_executora as any,
        natureza_objeto: data.natureza_objeto as any,
        prioridade: data.prioridade as any,
        valor_estimado_dfd: Number(data.valor_estimado_dfd),
        recursos_previstos_2025: Number(data.recursos_previstos_2025),
        plano_orcamentario: data.plano_orcamentario,
        acao_orcamentaria: data.acao_orcamentaria,
        pro: data.pro || undefined,
        esta_no_pca_2025: data.esta_no_pca_2025,
        esta_no_dfd: data.esta_no_dfd,
        foi_lancado_opus: data.foi_lancado_opus,
        data_lancamento_opus: data.data_lancamento_opus ? new Date(data.data_lancamento_opus) : undefined,
        prazo_inicial: data.prazo_inicial ? new Date(data.prazo_inicial) : undefined,
        prazo_previsto: data.prazo_previsto ? new Date(data.prazo_previsto) : undefined,
        arquiteto: data.arquiteto || undefined,
        engenheiro_civil: data.engenheiro_civil || undefined,
        engenheiro_eletricista: data.engenheiro_eletricista || undefined,
        engenheiro_mecanico: data.engenheiro_mecanico || undefined,
        observacoes_iniciais: data.observacoes_iniciais || undefined,
      });
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

  const onSubmit = async (data: ProjetoFormData) => {
    try {
      setSaving(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      // Atualizar projeto
      const { error: updateError } = await supabase
        .from("projetos")
        .update(data as any)
        .eq("id", id);

      if (updateError) throw updateError;

      // Registrar no histórico
      await supabase.from("projetos_historico").insert({
        projeto_id: id,
        usuario_id: user.id,
        acao: "Projeto editado",
      });

      toast({
        title: "Projeto atualizado!",
        description: "As alterações foram salvas com sucesso.",
      });

      navigate(`/projetos/${id}`);
    } catch (error: any) {
      console.error("Erro ao atualizar projeto:", error);
      toast({
        title: "Erro ao atualizar projeto",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(`/projetos/${id}`)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Editar Projeto</h1>
            <p className="text-muted-foreground">
              Atualize os dados do projeto
            </p>
          </div>
          <Button
            onClick={form.handleSubmit(onSubmit)}
            disabled={saving || loading}
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Tabs defaultValue="basico" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basico">Informações Básicas</TabsTrigger>
              <TabsTrigger value="orcamento">Dados Orçamentários</TabsTrigger>
              <TabsTrigger value="equipe">Equipe Técnica</TabsTrigger>
              <TabsTrigger value="anexos">Anexos</TabsTrigger>
            </TabsList>

            <TabsContent value="basico">
              <Card>
                <CardHeader>
                  <CardTitle>Informações Básicas</CardTitle>
                </CardHeader>
                <CardContent>
                  <Step1Basico form={form} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="orcamento">
              <Card>
                <CardHeader>
                  <CardTitle>Dados Orçamentários</CardTitle>
                </CardHeader>
                <CardContent>
                  <Step2Orcamento form={form} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="equipe">
              <Card>
                <CardHeader>
                  <CardTitle>Equipe Técnica e Observações</CardTitle>
                </CardHeader>
                <CardContent>
                  <Step3Equipe form={form} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="anexos">
              <Card>
                <CardHeader>
                  <CardTitle>Anexos do Projeto</CardTitle>
                </CardHeader>
                <CardContent>
                  {id && <AnexosManager projetoId={id} mode="edit" />}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </form>
      </Form>
    </div>
  );
}
