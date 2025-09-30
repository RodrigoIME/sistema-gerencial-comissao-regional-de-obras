import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import { Upload, FileText, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Organizacao {
  id: number;
  nome: string;
  diretoria: string;
}

const DIRETORIAS = [
  { value: "COLOG", label: "Comando Logístico - COLOG" },
  { value: "COTER", label: "Comando de Operações Terrestres - COTER" },
  { value: "DCT", label: "Departamento de Ciência e Tecnologia - DCT" },
  { value: "DEC", label: "Departamento de Engenharia e Construção - DEC" },
  { value: "DECEx", label: "Departamento de Educação e Cultura do Exército - DECEx" },
  { value: "DGP", label: "Departamento Geral do Pessoal - DGP" },
  { value: "SEF", label: "Secretaria de Economia e Finanças - SEF" },
];

const TIPOS_VISTORIA = [
  "Técnica Regular",
  "Preventiva",
  "De Rotina",
  "De Ordem Superior",
  "Corretiva/Emergencial",
  "Para Recebimento de Obra",
  "Administrativa/Patrimonial",
];

const NovaSolicitacao = () => {
  const [objeto, setObjeto] = useState("");
  const [organizacaoId, setOrganizacaoId] = useState("");
  const [enderecoCompleto, setEnderecoCompleto] = useState("");
  const [contatoNome, setContatoNome] = useState("");
  const [contatoTelefone, setContatoTelefone] = useState("");
  const [contatoEmail, setContatoEmail] = useState("");
  const [diretoriaResponsavel, setDiretoriaResponsavel] = useState("");
  const [dataSolicitacao, setDataSolicitacao] = useState(new Date());
  const [classificacaoUrgencia, setClassificacaoUrgencia] = useState("");
  const [documentoOrigemDados, setDocumentoOrigemDados] = useState("");
  const [documentoOrigemFile, setDocumentoOrigemFile] = useState<File | null>(null);
  const [numeroReferenciaOpous, setNumeroReferenciaOpous] = useState("");
  const [objetivoVistoria, setObjetivoVistoria] = useState("");
  const [tipoVistoria, setTipoVistoria] = useState("");
  const [organizacoes, setOrganizacoes] = useState<Organizacao[]>([]);
  const [files, setFiles] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Filtrar organizações baseado na diretoria selecionada
  const organizacoesFiltradas = diretoriaResponsavel
    ? organizacoes.filter((org) => org.diretoria === diretoriaResponsavel)
    : [];

  useEffect(() => {
    fetchOrganizacoes();
  }, []);

  const fetchOrganizacoes = async () => {
    const { data, error } = await supabase
      .from("organizacoes")
      .select("*")
      .order('"Organização Militar"');

    if (error) {
      toast.error("Erro ao carregar organizações");
      return;
    }

    // Mapear os dados do Supabase para a interface esperada
    const mappedData: Organizacao[] = (data || []).map((org: any) => ({
      id: org.id,
      nome: org["Organização Militar"],
      diretoria: org["Órgão Setorial Responsável"],
    }));

    setOrganizacoes(mappedData);
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

      // Upload do documento de origem se houver
      let documentoOrigemUrl = "";
      if (documentoOrigemFile) {
        const fileName = `${Date.now()}_${documentoOrigemFile.name}`;
        const filePath = `${user.id}/documentos/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("anexos")
          .upload(filePath, documentoOrigemFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("anexos")
          .getPublicUrl(filePath);

        documentoOrigemUrl = publicUrl;
      }

      const { data: solicitacao, error: solicitacaoError } = await supabase
        .from("solicitacoes")
        .insert({
          objeto,
          organizacao_id: parseInt(organizacaoId),
          usuario_id: user.id,
          status: "pending",
          endereco_completo: enderecoCompleto,
          contato_nome: contatoNome,
          contato_telefone: contatoTelefone,
          contato_email: contatoEmail,
          diretoria_responsavel: diretoriaResponsavel,
          data_solicitacao: dataSolicitacao.toISOString(),
          classificacao_urgencia: classificacaoUrgencia,
          documento_origem_dados: documentoOrigemDados,
          documento_origem_anexo: documentoOrigemUrl,
          numero_referencia_opous: numeroReferenciaOpous,
          objetivo_vistoria: objetivoVistoria,
          tipo_vistoria: tipoVistoria,
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
              <Label htmlFor="objeto">Objeto da Vistoria</Label>
              <Textarea
                id="objeto"
                placeholder="Descreva o objeto da vistoria..."
                value={objeto}
                onChange={(e) => setObjeto(e.target.value)}
                required
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="diretoria">Diretoria Responsável</Label>
              <Select 
                value={diretoriaResponsavel} 
                onValueChange={(value) => {
                  setDiretoriaResponsavel(value);
                  setOrganizacaoId(""); // Limpar organização ao mudar diretoria
                }} 
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a diretoria" />
                </SelectTrigger>
                <SelectContent>
                  {DIRETORIAS.map((dir) => (
                    <SelectItem key={dir.value} value={dir.value}>
                      {dir.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="organizacao">Organização Militar Apoiada</Label>
              <Select 
                value={organizacaoId} 
                onValueChange={setOrganizacaoId} 
                required
                disabled={!diretoriaResponsavel}
              >
                <SelectTrigger>
                  <SelectValue 
                    placeholder={
                      diretoriaResponsavel 
                        ? "Selecione uma organização" 
                        : "Selecione primeiro a diretoria"
                    } 
                  />
                </SelectTrigger>
                <SelectContent>
                  {organizacoesFiltradas.map((org) => (
                    <SelectItem key={org.id} value={org.id.toString()}>
                      {org.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="endereco">Endereço Completo de onde Será Realizada a Vistoria</Label>
              <Textarea
                id="endereco"
                placeholder="Endereço completo..."
                value={enderecoCompleto}
                onChange={(e) => setEnderecoCompleto(e.target.value)}
                required
                className="min-h-[80px]"
              />
            </div>

            <div className="space-y-4">
              <Label>Contato do Responsável na OM Apoiada</Label>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contatoNome">Nome</Label>
                  <Input
                    id="contatoNome"
                    placeholder="Nome completo do responsável"
                    value={contatoNome}
                    onChange={(e) => setContatoNome(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contatoTelefone">Telefone</Label>
                  <Input
                    id="contatoTelefone"
                    type="tel"
                    placeholder="(00) 00000-0000"
                    value={contatoTelefone}
                    onChange={(e) => setContatoTelefone(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contatoEmail">E-mail</Label>
                  <Input
                    id="contatoEmail"
                    type="email"
                    placeholder="email@exemplo.com"
                    value={contatoEmail}
                    onChange={(e) => setContatoEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dataSolicitacao">Data da Solicitação</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dataSolicitacao && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dataSolicitacao ? format(dataSolicitacao, "dd/MM/yyyy") : <span>Selecione uma data</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dataSolicitacao}
                    onSelect={(date) => date && setDataSolicitacao(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="classificacao">Classificação da Urgência</Label>
              <Select value={classificacaoUrgencia} onValueChange={setClassificacaoUrgencia} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a urgência" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Prioritário">Prioritário</SelectItem>
                  <SelectItem value="Não Prioritário">Não Prioritário</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="documentoDados">Documento que Originou a Solicitação (Dados)</Label>
              <Textarea
                id="documentoDados"
                placeholder="Descreva os dados do documento (número, tipo, data, etc.)"
                value={documentoOrigemDados}
                onChange={(e) => setDocumentoOrigemDados(e.target.value)}
                required
                className="min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="documentoAnexo">Anexar Documento de Origem</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors">
                <input
                  id="documentoAnexo"
                  type="file"
                  onChange={(e) => setDocumentoOrigemFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <label htmlFor="documentoAnexo" className="cursor-pointer">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Clique para anexar o documento
                  </p>
                  {documentoOrigemFile && (
                    <p className="text-sm text-primary mt-2 font-medium">
                      {documentoOrigemFile.name}
                    </p>
                  )}
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="opous">Número de Referência no Sistema OPOUS</Label>
              <Input
                id="opous"
                placeholder="Número de referência no OPOUS"
                value={numeroReferenciaOpous}
                onChange={(e) => setNumeroReferenciaOpous(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="objetivo">Objetivo da Vistoria</Label>
              <Textarea
                id="objetivo"
                placeholder="Descreva o objetivo da vistoria..."
                value={objetivoVistoria}
                onChange={(e) => setObjetivoVistoria(e.target.value)}
                required
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de Vistoria</Label>
              <Select value={tipoVistoria} onValueChange={setTipoVistoria} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de vistoria" />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_VISTORIA.map((tipo) => (
                    <SelectItem key={tipo} value={tipo}>
                      {tipo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="files">Anexos Adicionais (opcional)</Label>
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
                    Clique para selecionar arquivos adicionais
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
