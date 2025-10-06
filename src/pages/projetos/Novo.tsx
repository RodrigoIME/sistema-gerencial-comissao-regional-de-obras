import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ArrowRight, Save } from "lucide-react";
import { projetoSchema, type ProjetoFormData } from "@/lib/projectValidation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Form } from "@/components/ui/form";
import { Step1Basico } from "@/components/projetos/forms/Step1Basico";
import { Step2Orcamento } from "@/components/projetos/forms/Step2Orcamento";
import { Step3Equipe } from "@/components/projetos/forms/Step3Equipe";
import { 
  salvarRascunhoProjeto, 
  carregarRascunhoProjeto, 
  limparRascunhoProjeto, 
  temRascunhoProjeto 
} from "@/lib/draftStorage";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";

export default function NovoProjeto() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showDraftDialog, setShowDraftDialog] = useState(false);
  const [draftData, setDraftData] = useState<any>(null);

  const form = useForm<ProjetoFormData>({
    resolver: zodResolver(projetoSchema),
    defaultValues: {
      prioridade: "Média",
      esta_no_pca_2025: false,
      esta_no_dfd: false,
      foi_lancado_opus: false,
    },
    mode: "onChange",
  });

  // Auto-save com debounce
  const watchedData = useWatch({ control: form.control });

  useEffect(() => {
    // Verificar se há rascunho ao montar
    if (temRascunhoProjeto()) {
      const rascunho = carregarRascunhoProjeto();
      if (rascunho) {
        setDraftData(rascunho);
        setShowDraftDialog(true);
      }
    }
  }, []);

  useEffect(() => {
    // Auto-save com debounce de 3 segundos
    const timeoutId = setTimeout(() => {
      if (watchedData && Object.keys(watchedData).length > 0) {
        salvarRascunhoProjeto(watchedData);
      }
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, [watchedData]);

  const handleRestoreDraft = () => {
    if (draftData?.data) {
      form.reset(draftData.data);
      toast({
        title: "Rascunho restaurado",
        description: "Continue de onde você parou",
      });
    }
    setShowDraftDialog(false);
  };

  const handleDiscardDraft = () => {
    limparRascunhoProjeto();
    setShowDraftDialog(false);
    toast({
      title: "Rascunho descartado",
      description: "Começando do zero",
    });
  };

  const validateStep = async (step: number): Promise<boolean> => {
    const fieldsToValidate: Record<number, (keyof ProjetoFormData)[]> = {
      1: ["numero_opus", "objeto", "organizacao_id", "diretoria_responsavel", "om_executora", "natureza_objeto"],
      2: ["valor_estimado_dfd", "plano_orcamentario", "acao_orcamentaria", "recursos_previstos_2025"],
      3: [], // Step 3 tem apenas campos opcionais
    };

    const fields = fieldsToValidate[step];
    const result = await form.trigger(fields);
    return result;
  };

  const handleNext = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid) {
      setCurrentStep(Math.min(totalSteps, currentStep + 1));
    }
  };

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

      // Limpar rascunho após sucesso
      limparRascunhoProjeto();

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

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>
                {currentStep === 1 && "Informações Básicas"}
                {currentStep === 2 && "Dados Orçamentários"}
                {currentStep === 3 && "Equipe Técnica e Observações"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentStep === 1 && <Step1Basico form={form} />}
              {currentStep === 2 && <Step2Orcamento form={form} />}
              {currentStep === 3 && <Step3Equipe form={form} />}
            </CardContent>
          </Card>

          {/* Navegação entre etapas */}
          <div className="flex justify-between mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1 || loading}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Anterior
            </Button>
            {currentStep < totalSteps ? (
              <Button type="button" onClick={handleNext} disabled={loading}>
                Próximo
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button type="submit" disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Salvando..." : "Criar Projeto"}
              </Button>
            )}
          </div>
        </form>
      </Form>

      <AlertDialog open={showDraftDialog} onOpenChange={setShowDraftDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rascunho encontrado</AlertDialogTitle>
            <AlertDialogDescription>
              Encontramos um rascunho salvo em{" "}
              {draftData?.timestamp && format(new Date(draftData.timestamp), "dd/MM/yyyy 'às' HH:mm")}.
              Deseja continuar de onde parou?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDiscardDraft}>
              Descartar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleRestoreDraft}>
              Restaurar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
