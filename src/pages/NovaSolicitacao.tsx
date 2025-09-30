import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Upload, FileText } from "lucide-react";

interface Organizacao {
  id: number;
  nome: string;
  diretoria: string;
}

const NovaSolicitacao = () => {
  const [objeto, setObjeto] = useState("");
  const [organizacaoId, setOrganizacaoId] = useState("");
  const [organizacoes, setOrganizacoes] = useState<Organizacao[]>([]);
  const [files, setFiles] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrganizacoes();
  }, []);

  const fetchOrganizacoes = async () => {
    const { data, error } = await supabase
      .from("organizacoes")
      .select("*")
      .order("nome");

    if (error) {
      toast.error("Erro ao carregar organizações");
      return;
    }

    setOrganizacoes(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Usuário não autenticado");
        return;
      }

      const { data: solicitacao, error: solicitacaoError } = await supabase
        .from("solicitacoes")
        .insert({
          objeto,
          organizacao_id: parseInt(organizacaoId),
          usuario_id: user.id,
          status: "pending",
        })
        .select()
        .single();

      if (solicitacaoError) throw solicitacaoError;

      if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const fileName = `${Date.now()}_${file.name}`;
          const filePath = `${user.id}/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from("anexos")
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from("anexos")
            .getPublicUrl(filePath);

          await supabase.from("anexos").insert({
            solicitacao_id: solicitacao.id,
            url: publicUrl,
            tipo: file.type,
          });
        }
      }

      toast.success("Solicitação criada com sucesso!");
      navigate("/solicitacoes");
    } catch (error: any) {
      toast.error("Erro ao criar solicitação");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-2">Nova Solicitação</h2>
        <p className="text-muted-foreground">
          Preencha os dados para criar uma nova solicitação de inspeção
        </p>
      </div>

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Dados da Solicitação</CardTitle>
          <CardDescription>
            Todos os campos são obrigatórios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="objeto">Objeto da Solicitação</Label>
              <Textarea
                id="objeto"
                placeholder="Descreva o objeto da solicitação..."
                value={objeto}
                onChange={(e) => setObjeto(e.target.value)}
                required
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="organizacao">Organização Militar</Label>
              <Select value={organizacaoId} onValueChange={setOrganizacaoId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma organização" />
                </SelectTrigger>
                <SelectContent>
                  {organizacoes.map((org) => (
                    <SelectItem key={org.id} value={org.id.toString()}>
                      {org.nome} - {org.diretoria}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="files">Anexos (opcional)</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors">
                <input
                  id="files"
                  type="file"
                  multiple
                  onChange={(e) => setFiles(e.target.files)}
                  className="hidden"
                />
                <label htmlFor="files" className="cursor-pointer">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Clique para selecionar arquivos
                  </p>
                  {files && files.length > 0 && (
                    <p className="text-sm text-primary mt-2 font-medium">
                      {files.length} arquivo(s) selecionado(s)
                    </p>
                  )}
                </label>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/solicitacoes")}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 gap-2"
              >
                <FileText className="w-4 h-4" />
                {loading ? "Criando..." : "Criar Solicitação"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default NovaSolicitacao;
