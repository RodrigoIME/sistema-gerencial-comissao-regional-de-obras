import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Building2 } from "lucide-react";

const NovaOrganizacao = () => {
  const [nome, setNome] = useState("");
  const [sigla, setSigla] = useState("");
  const [diretoria, setDiretoria] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from("organizacoes")
        .insert({
          "Organização Militar": nome,
          "Órgão Setorial Responsável": diretoria,
          "Sigla da OM": sigla,
        });

      if (error) throw error;

      toast.success("Organização cadastrada com sucesso!");
      navigate("/nova-solicitacao");
    } catch (error: any) {
      toast.error("Erro ao cadastrar organização");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-2">Nova Organização Militar</h2>
        <p className="text-muted-foreground">
          Cadastre uma nova Organização Militar no sistema
        </p>
      </div>

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Dados da Organização</CardTitle>
          <CardDescription>
            Todos os campos são obrigatórios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome da Organização Militar</Label>
              <Input
                id="nome"
                placeholder="Ex: 1º Batalhão de Infantaria"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sigla">Sigla da OM</Label>
              <Input
                id="sigla"
                placeholder="Ex: 1º BI"
                value={sigla}
                onChange={(e) => setSigla(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="diretoria">Órgão Setorial Responsável</Label>
              <Input
                id="diretoria"
                placeholder="Ex: Comando Militar do Sul"
                value={diretoria}
                onChange={(e) => setDiretoria(e.target.value)}
                required
              />
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/nova-solicitacao")}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 gap-2"
              >
                <Building2 className="w-4 h-4" />
                {loading ? "Cadastrando..." : "Cadastrar Organização"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default NovaOrganizacao;
