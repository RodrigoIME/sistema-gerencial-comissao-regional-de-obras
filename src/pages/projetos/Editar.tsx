import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function EditarProjeto() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

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

      // Form initialization will be implemented in the next iteration
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

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(`/projetos/${id}`)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <h1 className="text-3xl font-bold">Editar Projeto</h1>
        <p className="text-muted-foreground">
          Atualize os dados do projeto
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Formulário de Edição</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <p>Formulário de edição em desenvolvimento...</p>
            <p className="text-sm mt-2">
              O formulário completo de edição será implementado na próxima etapa.
            </p>
            <Button
              className="mt-4"
              onClick={() => navigate(`/projetos/${id}`)}
              variant="outline"
            >
              Voltar aos Detalhes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
