import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { CalendarIcon, Building2, Info, Loader2, User } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { novaSolicitacaoSchema, NovaSolicitacaoFormData, validarArquivo } from "@/lib/formValidation";
import { formatarTelefone } from "@/lib/phoneFormatter";
import { buscarEnderecoPorCEP, formatarCEP } from "@/lib/cepService";
import { TEMPLATES_OBJETIVO } from "@/lib/vistoriaTemplates";
import { salvarRascunho, carregarRascunho, limparRascunho, temRascunho } from "@/lib/draftStorage";
import { RequiredLabel } from "@/components/forms/RequiredLabel";
import { FileUploadZone } from "@/components/forms/FileUploadZone";

interface Organizacao {
  id: number;
  nome: string;
  sigla: string;
  diretoria: string;
  endereco?: string;
}

const TIPOS_VISTORIA = [
  "Técnica Regular",
  "Preventiva",
  "De Rotina",
  "De Ordem Superior",
  "Corretiva/Emergencial",
  "Para Recebimento de Obra",
  "Administrativa/Patrimonial",
];

const ESPECIALIDADES = [
  "Arquitetura",
  "Engenharia Civil",
  "Engenharia Elétrica",
  "Engenharia Mecânica",
  "Especialidade Indisponível"
];

const TIPOS_DOCUMENTO = [
  { value: "DIEx", label: "DIEx" },
  { value: "Mensagem de Texto", label: "Mensagem de Texto" },
  { value: "Outros", label: "Outros" }
];

const NovaSolicitacao = () => {
  const navigate = useNavigate();
  const [organizacoes, setOrganizacoes] = useState<Organizacao[]>([]);
  const [documentoOrigemFile, setDocumentoOrigemFile] = useState<File | null>(null);
  const [documentoFileError, setDocumentoFileError] = useState<string>("");
  const [files, setFiles] = useState<File[]>([]);
  const [filesError, setFilesError] = useState<string>("");
  const [vistoriaNoEnderecoOM, setVistoriaNoEnderecoOM] = useState(true);
  const [enderecoOMOriginal, setEnderecoOMOriginal] = useState("");
  const [searchOM, setSearchOM] = useState("");
  const [cep, setCep] = useState("");
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [siglaDaOM, setSiglaDaOM] = useState("");
  const [diretoriaResponsavel, setDiretoriaResponsavel] = useState("");
  
  // Novos estados para os novos campos
  const [numeroVistoria, setNumeroVistoria] = useState("");
  const [especialidades, setEspecialidades] = useState<string[]>([]);
  const [tipoDocumentoOrigem, setTipoDocumentoOrigem] = useState("");
  const [diexNumero, setDiexNumero] = useState("");
  const [diexAssunto, setDiexAssunto] = useState("");
  const [diexData, setDiexData] = useState<Date | undefined>(undefined);
  const [diexOrganizacaoMilitar, setDiexOrganizacaoMilitar] = useState("");
  const [mensagemTelefone, setMensagemTelefone] = useState("");
  const [mensagemResponsavel, setMensagemResponsavel] = useState("");
  const [userProfile, setUserProfile] = useState<any>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<NovaSolicitacaoFormData>({
    resolver: zodResolver(novaSolicitacaoSchema),
    defaultValues: {
      dataSolicitacao: new Date(),
      classificacaoUrgencia: "Não Prioritário",
    }
  });

  const watchedFields = watch();
  const classificacaoUrgencia = watch("classificacaoUrgencia");
  const tipoVistoria = watch("tipoVistoria");
  const organizacaoId = watch("organizacaoId");

  // Filtrar organizações por busca
  const organizacoesFiltradas = organizacoes.filter((org) =>
    org.nome.toLowerCase().includes(searchOM.toLowerCase()) ||
    org.sigla.toLowerCase().includes(searchOM.toLowerCase())
  );

  useEffect(() => {
    fetchOrganizacoes();
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const { data: profile } = await supabase
      .from("usuarios")
      .select("*")
      .eq("id", user.id)
      .single();
    
    setUserProfile(profile);
  };

  const preencherContatoUsuarioLogado = () => {
    if (userProfile) {
      setValue("contatoNome", userProfile.nome || "");
      setValue("contatoTelefone", userProfile.telefone || "");
      setValue("contatoEmail", userProfile.email || "");
      toast.info("Dados de contato preenchidos automaticamente");
    }
  };

  // Carregar rascunho ao montar
  useEffect(() => {
    if (temRascunho()) {
      const rascunho = carregarRascunho();
      if (rascunho) {
        Object.keys(rascunho.data).forEach((key) => {
          if (key === 'dataSolicitacao') {
            setValue(key as any, new Date(rascunho.data[key]));
          } else {
            setValue(key as any, rascunho.data[key]);
          }
        });
        toast.info("Rascunho recuperado automaticamente");
      }
    }
  }, [setValue]);

  // Salvamento automático de rascunho
  useEffect(() => {
    const timer = setTimeout(() => {
      if (Object.keys(watchedFields).length > 0) {
        salvarRascunho(watchedFields);
      }
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [watchedFields]);

  // Removido: Template de objetivo (campo objetivoVistoria foi removido)

  const fetchOrganizacoes = async () => {
    const { data, error } = await supabase
      .from("organizacoes")
      .select("*")
      .order('"Organização Militar"');

    if (error) {
      toast.error("Erro ao carregar organizações");
      return;
    }

    const mappedData: Organizacao[] = (data || []).map((org: any) => ({
      id: org.id,
      nome: org["Organização Militar"],
      sigla: org["Sigla da OM"],
      diretoria: org["Órgão Setorial Responsável"],
      endereco: org.endereco_completo,
    }));

    setOrganizacoes(mappedData);
  };

  const handleOrganizacaoChange = (orgId: string) => {
    setValue("organizacaoId", orgId);
    const orgSelecionada = organizacoes.find((org) => org.id.toString() === orgId);
    
    if (orgSelecionada) {
      setSiglaDaOM(orgSelecionada.sigla);
      setDiretoriaResponsavel(orgSelecionada.diretoria);
      
      if (orgSelecionada.endereco) {
        setEnderecoOMOriginal(orgSelecionada.endereco);
        setValue("enderecoCompleto", orgSelecionada.endereco);
        setVistoriaNoEnderecoOM(true);
      } else {
        setEnderecoOMOriginal("");
        setValue("enderecoCompleto", "");
        setVistoriaNoEnderecoOM(true);
      }
    }
  };

  const handleCepChange = (value: string) => {
    const formatted = formatarCEP(value);
    setCep(formatted);
  };

  const handleCepBlur = async () => {
    if (cep.replace(/\D/g, '').length === 8) {
      setBuscandoCep(true);
      try {
        const endereco = await buscarEnderecoPorCEP(cep);
        if (endereco) {
          const enderecoCompleto = `${endereco.logradouro}, ${endereco.bairro}, ${endereco.localidade} - ${endereco.uf}`;
          setValue("enderecoCompleto", enderecoCompleto);
          toast.success("Endereço encontrado!");
        }
      } catch (error: any) {
        toast.error(error.message || "Erro ao buscar CEP");
      } finally {
        setBuscandoCep(false);
      }
    }
  };

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatarTelefone(e.target.value);
    setValue("contatoTelefone", formatted);
  };

  const handleDocumentoFileChange = (file: File | null) => {
    if (file) {
      const validation = validarArquivo(file);
      if (validation.valid) {
        setDocumentoOrigemFile(file);
        setDocumentoFileError("");
      } else {
        setDocumentoOrigemFile(null);
        setDocumentoFileError(validation.error || "");
        toast.error(validation.error);
      }
    } else {
      setDocumentoOrigemFile(null);
      setDocumentoFileError("");
    }
  };

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const validFiles: File[] = [];
    let hasError = false;

    for (const file of selectedFiles) {
      const validation = validarArquivo(file);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        hasError = true;
        toast.error(`${file.name}: ${validation.error}`);
      }
    }

    if (hasError) {
      setFilesError("Alguns arquivos foram rejeitados");
    } else {
      setFilesError("");
    }

    setFiles(validFiles);
  };

  const onSubmit = async (data: NovaSolicitacaoFormData) => {
    // Validar endereço
    if (!data.enderecoCompleto || data.enderecoCompleto.trim() === "") {
      toast.error("Por favor, informe o endereço onde será realizada a vistoria");
      return;
    }

    setShowConfirmDialog(true);
  };

  const confirmarEnvio = async () => {
    const data = watchedFields;
    
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

      // Determinar status baseado nas especialidades
      let status = "pending";
      if (data.especialidadesEnvolvidas.includes("Especialidade Indisponível")) {
        status = "rejected";
        toast.warning("Solicitação marcada como 'Especialidade não correspondente'");
      }

      const { data: solicitacao, error: solicitacaoError } = await supabase
        .from("solicitacoes")
        .insert({
          numero_vistoria: data.numeroVistoria,
          objeto: data.objeto,
          organizacao_id: parseInt(data.organizacaoId),
          usuario_id: user.id,
          status: status,
          endereco_completo: data.enderecoCompleto,
          contato_nome: data.contatoNome,
          contato_telefone: data.contatoTelefone,
          contato_email: data.contatoEmail || null,
          diretoria_responsavel: diretoriaResponsavel,
          data_solicitacao: data.dataSolicitacao.toISOString(),
          classificacao_urgencia: data.classificacaoUrgencia,
          justificativa_urgencia: data.justificativaUrgencia || null,
          especialidades_envolvidas: data.especialidadesEnvolvidas,
          tipo_documento_origem: data.tipoDocumentoOrigem,
          diex_numero: data.diexNumero || null,
          diex_assunto: data.diexAssunto || null,
          diex_data: data.diexData || null,
          diex_organizacao_militar: data.diexOrganizacaoMilitar || null,
          mensagem_telefone: data.mensagemTelefone || null,
          mensagem_responsavel: data.mensagemResponsavel || null,
          documento_origem_dados: data.documentoOrigemDados || null,
          documento_origem_anexo: documentoOrigemUrl,
          numero_referencia_opous: data.numeroReferenciaOpous || null,
          tipo_vistoria: data.tipoVistoria,
        })
        .select()
        .single();

      if (solicitacaoError) throw solicitacaoError;

      // Upload de anexos adicionais
      if (files.length > 0) {
        for (const file of files) {
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

      limparRascunho();
      toast.success("Solicitação criada com sucesso!");
      navigate("/solicitacoes");
    } catch (error: any) {
      toast.error("Erro ao criar solicitação");
      console.error(error);
    } finally {
      setShowConfirmDialog(false);
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
            Campos marcados com <span className="text-destructive">*</span> são obrigatórios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* 1. NÚMERO DA VISTORIA - NOVO CAMPO PRIMEIRO */}
            <div className="space-y-2">
              <RequiredLabel htmlFor="numeroVistoria">Número da Vistoria</RequiredLabel>
              <Input
                id="numeroVistoria"
                placeholder="Ex: VT-2025-001"
                {...register("numeroVistoria")}
                className={cn(errors.numeroVistoria && "border-destructive")}
              />
              {errors.numeroVistoria && (
                <p className="text-sm text-destructive">{errors.numeroVistoria.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <RequiredLabel htmlFor="objeto">Objeto da Vistoria</RequiredLabel>
              <Textarea
                id="objeto"
                placeholder="Descreva o objeto da vistoria..."
                {...register("objeto")}
                className={cn(
                  "min-h-[100px]",
                  errors.objeto && "border-destructive focus-visible:ring-destructive"
                )}
              />
              {errors.objeto && (
                <p className="text-sm text-destructive">{errors.objeto.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <RequiredLabel htmlFor="organizacao">Organização Militar Apoiada</RequiredLabel>
              <Select 
                value={organizacaoId} 
                onValueChange={handleOrganizacaoChange}
              >
                <SelectTrigger className={cn(errors.organizacaoId && "border-destructive")}>
                  <SelectValue placeholder="Selecione uma organização" />
                </SelectTrigger>
                <SelectContent>
                  <div className="p-2">
                    <Input 
                      placeholder="Buscar organização..."
                      value={searchOM}
                      onChange={(e) => setSearchOM(e.target.value)}
                      className="h-8"
                    />
                  </div>
                  {organizacoesFiltradas.length === 0 ? (
                    <SelectItem value="empty" disabled>
                      Nenhuma organização encontrada
                    </SelectItem>
                  ) : (
                    organizacoesFiltradas.map((org) => (
                      <SelectItem key={org.id} value={org.id.toString()}>
                        <div className="flex items-center justify-between gap-3 w-full">
                          <span className="font-medium truncate flex-1">{org.nome}</span>
                          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded font-mono shrink-0">
                            {org.sigla}
                          </span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.organizacaoId && (
                <p className="text-sm text-destructive">{errors.organizacaoId.message}</p>
              )}
            </div>

            {organizacaoId && (
              <>
                <div className="space-y-2">
                  <Label>Sigla da Organização Militar</Label>
                  <div className="bg-muted p-3 rounded-lg border border-border flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium font-mono">
                      {siglaDaOM}
                    </span>
                    <span className="text-xs text-muted-foreground ml-auto">
                      ✓ Preenchido automaticamente
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Órgão Setorial Responsável</Label>
                  <div className="bg-muted p-3 rounded-lg border border-border flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {diretoriaResponsavel}
                    </span>
                    <span className="text-xs text-muted-foreground ml-auto">
                      ✓ Preenchido automaticamente
                    </span>
                  </div>
                </div>
              </>
            )}

            <div className="space-y-3">
              <Label>A vistoria será realizada no endereço da OM?</Label>
              <RadioGroup
                value={vistoriaNoEnderecoOM ? "sim" : "nao"}
                onValueChange={(value) => {
                  const novoValor = value === "sim";
                  setVistoriaNoEnderecoOM(novoValor);
                  
                  if (novoValor) {
                    setValue("enderecoCompleto", enderecoOMOriginal);
                  } else {
                    setValue("enderecoCompleto", "");
                  }
                }}
                disabled={!organizacaoId}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sim" id="endereco-sim" />
                  <Label htmlFor="endereco-sim" className="font-normal cursor-pointer">
                    Sim, no endereço cadastrado da OM
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="nao" id="endereco-nao" />
                  <Label htmlFor="endereco-nao" className="font-normal cursor-pointer">
                    Não, em outro local
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {vistoriaNoEnderecoOM && organizacaoId && (
              <div className="space-y-2">
                <RequiredLabel htmlFor="endereco">Endereço da Vistoria</RequiredLabel>
                <div className="bg-muted p-4 rounded-lg border border-border">
                  <p className="text-sm font-medium text-foreground">
                    {enderecoOMOriginal || "Endereço não cadastrado"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    📍 Endereço cadastrado da Organização Militar
                  </p>
                </div>
              </div>
            )}

            {!vistoriaNoEnderecoOM && organizacaoId && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="cep">CEP (opcional - para preenchimento automático)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="cep"
                      placeholder="00000-000"
                      value={cep}
                      onChange={(e) => handleCepChange(e.target.value)}
                      onBlur={handleCepBlur}
                      maxLength={9}
                      className="flex-1"
                    />
                    {buscandoCep && <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />}
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    Digite o CEP para buscar o endereço automaticamente
                  </p>
                </div>

                <div className="space-y-2">
                  <RequiredLabel htmlFor="endereco-alternativo">
                    Endereço Completo onde Será Realizada a Vistoria
                  </RequiredLabel>
                  <Textarea
                    id="endereco-alternativo"
                    placeholder="Digite o endereço completo onde será realizada a vistoria..."
                    {...register("enderecoCompleto")}
                    className={cn(
                      "min-h-[80px]",
                      errors.enderecoCompleto && "border-destructive focus-visible:ring-destructive"
                    )}
                  />
                  {errors.enderecoCompleto && (
                    <p className="text-sm text-destructive">{errors.enderecoCompleto.message}</p>
                  )}
                  <div className="flex items-start gap-2 text-xs text-muted-foreground">
                    <span className="text-amber-500">⚠️</span>
                    <p>
                      Atenção: A vistoria será realizada em endereço diferente do cadastrado na OM
                    </p>
                  </div>
                </div>
              </>
            )}

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Contato do Responsável na OM Apoiada</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={preencherContatoUsuarioLogado}
                  className="gap-2"
                >
                  <User className="w-4 h-4" />
                  Usar meus dados
                </Button>
              </div>
              
              <div className="space-y-2">
                <RequiredLabel htmlFor="contatoNome">Nome</RequiredLabel>
                <Input
                  id="contatoNome"
                  placeholder="Nome completo do responsável"
                  {...register("contatoNome")}
                  className={cn(errors.contatoNome && "border-destructive")}
                />
                {errors.contatoNome && (
                  <p className="text-sm text-destructive">{errors.contatoNome.message}</p>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <RequiredLabel htmlFor="contatoTelefone">Telefone</RequiredLabel>
                  <Input
                    id="contatoTelefone"
                    type="tel"
                    placeholder="(00) 00000-0000"
                    {...register("contatoTelefone")}
                    onChange={handleTelefoneChange}
                    maxLength={15}
                    className={cn(errors.contatoTelefone && "border-destructive")}
                  />
                  {errors.contatoTelefone && (
                    <p className="text-sm text-destructive">{errors.contatoTelefone.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contatoEmail">E-mail (opcional)</Label>
                  <Input
                    id="contatoEmail"
                    type="email"
                    placeholder="email@exemplo.com"
                    {...register("contatoEmail")}
                    className={cn(errors.contatoEmail && "border-destructive")}
                  />
                  {errors.contatoEmail && (
                    <p className="text-sm text-destructive">{errors.contatoEmail.message}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <RequiredLabel htmlFor="dataSolicitacao">Data da Solicitação</RequiredLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !watch("dataSolicitacao") && "text-muted-foreground",
                      errors.dataSolicitacao && "border-destructive"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {watch("dataSolicitacao") ? format(watch("dataSolicitacao"), "dd/MM/yyyy") : <span>Selecione uma data</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={watch("dataSolicitacao")}
                    onSelect={(date) => date && setValue("dataSolicitacao", date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.dataSolicitacao && (
                <p className="text-sm text-destructive">{errors.dataSolicitacao.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <RequiredLabel htmlFor="classificacao">Classificação da Urgência</RequiredLabel>
              <Select value={classificacaoUrgencia} onValueChange={(value) => setValue("classificacaoUrgencia", value as any)}>
                <SelectTrigger className={cn(errors.classificacaoUrgencia && "border-destructive")}>
                  <SelectValue placeholder="Selecione a urgência" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Prioritário">Prioritário</SelectItem>
                  <SelectItem value="Não Prioritário">Não Prioritário</SelectItem>
                </SelectContent>
              </Select>
              {errors.classificacaoUrgencia && (
                <p className="text-sm text-destructive">{errors.classificacaoUrgencia.message}</p>
              )}
            </div>

            {classificacaoUrgencia === "Prioritário" && (
              <div className="space-y-2 border-l-4 border-destructive pl-4 py-2 bg-destructive/5 rounded">
                <RequiredLabel htmlFor="justificativaUrgencia">
                  Justificativa para Classificação como Prioritário
                </RequiredLabel>
                <Textarea
                  id="justificativaUrgencia"
                  placeholder="Explique detalhadamente por que esta solicitação é prioritária (mínimo 20 caracteres)..."
                  {...register("justificativaUrgencia")}
                  className={cn(
                    "min-h-[80px]",
                    errors.justificativaUrgencia && "border-destructive focus-visible:ring-destructive"
                  )}
                />
                {errors.justificativaUrgencia && (
                  <p className="text-sm text-destructive">{errors.justificativaUrgencia.message}</p>
                )}
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  Justificativa obrigatória para solicitações prioritárias
                </p>
              </div>
            )}

            <div className="space-y-2">
              <RequiredLabel htmlFor="documentoDados">Documento que Originou a Solicitação (Dados)</RequiredLabel>
              <Textarea
                id="documentoDados"
                placeholder="Descreva os dados do documento (número, tipo, data, etc.)"
                {...register("documentoOrigemDados")}
                className={cn(
                  "min-h-[80px]",
                  errors.documentoOrigemDados && "border-destructive focus-visible:ring-destructive"
                )}
              />
              {errors.documentoOrigemDados && (
                <p className="text-sm text-destructive">{errors.documentoOrigemDados.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="documentoAnexo">Anexar Documento de Origem</Label>
              <FileUploadZone
                id="documentoAnexo"
                file={documentoOrigemFile}
                onFileChange={handleDocumentoFileChange}
                label="Clique para anexar o documento de origem"
                error={documentoFileError}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="opous">Número de Referência no Sistema OPOUS</Label>
              <Input
                id="opous"
                placeholder="Número de referência no OPOUS (opcional)"
                {...register("numeroReferenciaOpous")}
              />
            </div>

            <div className="space-y-2">
              <RequiredLabel htmlFor="tipo">Tipo de Vistoria</RequiredLabel>
              <Select value={tipoVistoria} onValueChange={(value) => setValue("tipoVistoria", value)}>
                <SelectTrigger className={cn(errors.tipoVistoria && "border-destructive")}>
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
              {errors.tipoVistoria && (
                <p className="text-sm text-destructive">{errors.tipoVistoria.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="files">Anexos Adicionais (opcional)</Label>
              <div className={cn(
                "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
                filesError ? "border-destructive" : "hover:border-primary",
                files.length > 0 && "bg-secondary/50"
              )}>
                <input
                  id="files"
                  type="file"
                  multiple
                  onChange={handleFilesChange}
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                />
                <label htmlFor="files" className="cursor-pointer block">
                  {files.length === 0 ? (
                    <>
                      <div className="w-8 h-8 mx-auto mb-2 text-muted-foreground">📎</div>
                      <p className="text-sm text-muted-foreground">
                        Clique para selecionar arquivos adicionais
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Máximo 10MB por arquivo
                      </p>
                    </>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-primary">
                        {files.length} arquivo(s) selecionado(s)
                      </p>
                      <div className="text-xs text-muted-foreground space-y-1">
                        {files.map((file, i) => (
                          <div key={i}>{file.name}</div>
                        ))}
                      </div>
                    </div>
                  )}
                </label>
              </div>
              {filesError && (
                <p className="text-sm text-destructive">{filesError}</p>
              )}
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
                disabled={isSubmitting}
                className="flex-1 gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    📄 Criar Solicitação
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Modal de Confirmação */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Nova Solicitação</AlertDialogTitle>
            <AlertDialogDescription>
              Revise os dados antes de enviar a solicitação
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <p className="font-semibold text-sm mb-1">Organização Militar:</p>
              <p className="text-sm text-muted-foreground">
                {organizacoes.find(o => o.id.toString() === watchedFields.organizacaoId)?.nome}
              </p>
            </div>
            
            <div>
              <p className="font-semibold text-sm mb-1">Objeto:</p>
              <p className="text-sm text-muted-foreground">{watchedFields.objeto}</p>
            </div>
            
            <div>
              <p className="font-semibold text-sm mb-1">Endereço da Vistoria:</p>
              <p className="text-sm text-muted-foreground">{watchedFields.enderecoCompleto}</p>
            </div>
            
            <div>
              <p className="font-semibold text-sm mb-1">Tipo de Vistoria:</p>
              <p className="text-sm text-muted-foreground">{watchedFields.tipoVistoria}</p>
            </div>
            
            <div>
              <p className="font-semibold text-sm mb-1">Classificação:</p>
              <p className={cn(
                "text-sm font-medium",
                watchedFields.classificacaoUrgencia === "Prioritário" ? "text-destructive" : "text-muted-foreground"
              )}>
                {watchedFields.classificacaoUrgencia}
              </p>
            </div>

            {watchedFields.classificacaoUrgencia === "Prioritário" && watchedFields.justificativaUrgencia && (
              <div>
                <p className="font-semibold text-sm mb-1">Justificativa de Urgência:</p>
                <p className="text-sm text-muted-foreground">{watchedFields.justificativaUrgencia}</p>
              </div>
            )}
            
            <div>
              <p className="font-semibold text-sm mb-1">Contato:</p>
              <p className="text-sm text-muted-foreground">
                {watchedFields.contatoNome} - {watchedFields.contatoTelefone} - {watchedFields.contatoEmail}
              </p>
            </div>

            {documentoOrigemFile && (
              <div>
                <p className="font-semibold text-sm mb-1">Documento de Origem:</p>
                <p className="text-sm text-muted-foreground">{documentoOrigemFile.name}</p>
              </div>
            )}

            {files.length > 0 && (
              <div>
                <p className="font-semibold text-sm mb-1">Anexos Adicionais:</p>
                <p className="text-sm text-muted-foreground">{files.length} arquivo(s)</p>
              </div>
            )}
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel>Revisar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmarEnvio}>
              Confirmar Envio
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default NovaSolicitacao;
