import { supabase } from "@/integrations/supabase/client";
import { AppError, ErrorType, handleError } from "@/lib/errors";

export interface CreateSolicitacaoDTO {
  objeto: string;
  organizacaoId: number;
  enderecoCompleto: string;
  contatoNome: string;
  contatoTelefone: string;
  contatoEmail?: string;
  diretoriaResponsavel: string;
  dataSolicitacao: Date;
  classificacaoUrgencia: string;
  justificativaUrgencia?: string;
  numeroReferenciaOpous?: string;
  tipoVistoria: string;
  documentoOrigemDados?: string;
}

export interface UploadAnexosDTO {
  solicitacaoId: number;
  files: File[];
  userId: string;
}

export class SolicitacoesService {
  /**
   * Cria uma nova solicitação com validações e lógica de negócio
   */
  static async create(
    data: CreateSolicitacaoDTO,
    documentoOrigemFile: File | null,
    anexosAdicionais: File[]
  ) {
    try {
      // Validação de endereço
      if (!data.enderecoCompleto?.trim()) {
        throw new AppError(
          "Endereço é obrigatório",
          ErrorType.VALIDATION,
          { userMessage: "Por favor, informe o endereço onde será realizada a vistoria" }
        );
      }

      // Obter usuário autenticado
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new AppError(
          "Usuário não autenticado",
          ErrorType.AUTH_REQUIRED,
          { userMessage: "Você precisa estar autenticado para criar uma solicitação" }
        );
      }

      // Upload do documento de origem
      let documentoOrigemUrl = "";
      if (documentoOrigemFile) {
        documentoOrigemUrl = await this.uploadDocumentoOrigem(
          documentoOrigemFile,
          user.id
        );
      }

      // Inserir solicitação
      const { data: solicitacao, error: solicitacaoError } = await supabase
        .from("solicitacoes")
        .insert({
          objeto: data.objeto,
          organizacao_id: data.organizacaoId,
          usuario_id: user.id,
          status: "pending",
          endereco_completo: data.enderecoCompleto,
          contato_nome: data.contatoNome,
          contato_telefone: data.contatoTelefone,
          contato_email: data.contatoEmail || null,
          diretoria_responsavel: data.diretoriaResponsavel,
          data_solicitacao: data.dataSolicitacao.toISOString(),
          classificacao_urgencia: data.classificacaoUrgencia,
          justificativa_urgencia: data.justificativaUrgencia || null,
          documento_origem_dados: data.documentoOrigemDados || null,
          documento_origem_anexo: documentoOrigemUrl || null,
          numero_referencia_opous: data.numeroReferenciaOpous || null,
          tipo_vistoria: data.tipoVistoria,
        })
        .select()
        .single();

      if (solicitacaoError) throw solicitacaoError;

      // Upload de anexos adicionais
      if (anexosAdicionais.length > 0) {
        await this.uploadAnexos({
          solicitacaoId: solicitacao.id,
          files: anexosAdicionais,
          userId: user.id,
        });
      }

      return solicitacao;
    } catch (error) {
      throw handleError(error, {
        context: "SolicitacoesService.create",
        rethrow: true,
      });
    }
  }

  /**
   * Upload de documento de origem
   */
  private static async uploadDocumentoOrigem(
    file: File,
    userId: string
  ): Promise<string> {
    try {
      const fileName = `${Date.now()}_${file.name}`;
      const filePath = `${userId}/documentos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("anexos")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("anexos")
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      throw new AppError(
        "Erro ao fazer upload do documento",
        ErrorType.STORAGE_UPLOAD,
        {
          userMessage: "Não foi possível fazer upload do documento de origem",
          context: { metadata: { fileName: file.name } },
        }
      );
    }
  }

  /**
   * Upload de anexos adicionais
   */
  private static async uploadAnexos(dto: UploadAnexosDTO): Promise<void> {
    try {
      for (const file of dto.files) {
        const fileName = `${Date.now()}_${file.name}`;
        const filePath = `${dto.userId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("anexos")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("anexos")
          .getPublicUrl(filePath);

        await supabase.from("anexos").insert({
          solicitacao_id: dto.solicitacaoId,
          url: publicUrl,
          tipo: file.type,
        });
      }
    } catch (error) {
      throw new AppError(
        "Erro ao fazer upload dos anexos",
        ErrorType.STORAGE_UPLOAD,
        { userMessage: "Alguns anexos não puderam ser enviados" }
      );
    }
  }

  /**
   * Atualizar solicitação
   */
  static async update(id: number, data: Partial<CreateSolicitacaoDTO>) {
    try {
      const { error } = await supabase
        .from("solicitacoes")
        .update(data as any)
        .eq("id", id);

      if (error) throw error;
    } catch (error) {
      throw handleError(error, {
        context: "SolicitacoesService.update",
        rethrow: true,
      });
    }
  }

  /**
   * Deletar solicitação
   */
  static async delete(id: number) {
    try {
      const { error } = await supabase
        .from("solicitacoes")
        .delete()
        .eq("id", id);

      if (error) throw error;
    } catch (error) {
      throw handleError(error, {
        context: "SolicitacoesService.delete",
        rethrow: true,
      });
    }
  }
}
