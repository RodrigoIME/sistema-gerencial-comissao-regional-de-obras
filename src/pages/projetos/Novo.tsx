import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ArrowRight, Save } from "lucide-react";
import { projetoSchema, type ProjetoFormData } from "@/lib/projectValidation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

// Placeholder - implementação completa do formulário multi-step virá na próxima etapa
export default function NovoProjeto() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const form = useForm<ProjetoFormData>({
    resolver: zodResolver(projetoSchema),
    defaultValues: {
      prioridade: "Média",
      esta_no_pca_2025: false,
      esta_no_dfd: false,
      foi_lancado_opus: false,
    },
  });

  const onSubmit = async (data: ProjetoFormData) => {
    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      const projetoData = {
        ...data,
        usuario_responsavel_id: user.id,
        status: "Em Andamento" as const,
      };

      const { data: projeto, error } = await supabase
        .from("projetos")
        .insert(projetoData as any)
        .select()
        .single();

      if (error) throw error;

      // Registrar no histórico
      await supabase.from("projetos_historico").insert({
        projeto_id: projeto.id,
        usuario_id: user.id,
        acao: "Projeto criado",
      });

      toast({
        title: "Projeto criado com sucesso!",
        description: `OPUS: ${data.numero_opus}`,
      });

      navigate(`/projetos/${projeto.id}`);
    } catch (error: any) {
      console.error("Erro ao criar projeto:", error);
      toast({
        title: "Erro ao criar projeto",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/projetos")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <h1 className="text-3xl font-bold">Novo Projeto</h1>
        <p className="text-muted-foreground">
          Preencha os dados para cadastrar um novo projeto
        </p>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">
            Etapa {currentStep} de {totalSteps}
          </span>
          <span className="text-sm text-muted-foreground">{progress.toFixed(0)}%</span>
        </div>
        <Progress value={progress} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {currentStep === 1 && "Informações Básicas"}
            {currentStep === 2 && "Dados Orçamentários"}
            {currentStep === 3 && "Equipe Técnica e Observações"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <p>Formulário completo em desenvolvimento...</p>
            <p className="text-sm mt-2">
              Esta é uma versão placeholder. O formulário multi-step completo será
              implementado na próxima etapa.
            </p>
            <Button
              className="mt-4"
              onClick={() => navigate("/projetos")}
              variant="outline"
            >
              Voltar ao Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Navegação entre etapas */}
      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Anterior
        </Button>
        {currentStep < totalSteps ? (
          <Button onClick={() => setCurrentStep(Math.min(totalSteps, currentStep + 1))}>
            Próximo
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={form.handleSubmit(onSubmit)} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? "Salvando..." : "Salvar Projeto"}
          </Button>
        )}
      </div>
    </div>
  );
}
