import { supabase } from "@/integrations/supabase/client";
import { AppError, ErrorType, handleError } from "@/lib/errors";

export interface CreateProjetoDTO {
  numero_opus: string;
  objeto: string;
  natureza_objeto: string;
  organizacao_id: number;
  om_executora: string;
  diretoria_responsavel: string;
  acao_orcamentaria: string;
  plano_orcamentario: string;
  valor_estimado_dfd: number;
  recursos_previstos_2025: number;
  esta_no_pca_2025: boolean;
  esta_no_dfd: boolean;
  foi_lancado_opus: boolean;
  data_lancamento_opus?: Date | null;
  prazo_inicial?: Date | null;
  prazo_previsto?: Date | null;
  pro?: string;
  arquiteto?: string;
  engenheiro_civil?: string;
  engenheiro_eletricista?: string;
  engenheiro_mecanico?: string;
  prioridade?: string;
  observacoes_iniciais?: string;
}

export class ProjetosService {
  /**
   * Criar novo projeto
   */
  static async create(data: CreateProjetoDTO) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new AppError(
          "Usuário não autenticado",
          ErrorType.AUTH_REQUIRED,
          { userMessage: "Você precisa estar autenticado para criar um projeto" }
        );
      }

      const projetoData = {
        ...data,
        usuario_responsavel_id: user.id,
        status: "Em Andamento" as const,
        data_lancamento_opus: data.data_lancamento_opus?.toISOString() || null,
        prazo_inicial: data.prazo_inicial?.toISOString() || null,
        prazo_previsto: data.prazo_previsto?.toISOString() || null,
      };

      const { data: projeto, error } = await supabase
        .from("projetos")
        .insert(projetoData as any)
        .select()
        .single();

      if (error) throw error;

      // Registrar no histórico
      await this.registrarHistorico(projeto.id, user.id, "Projeto criado");

      return projeto;
    } catch (error) {
      throw handleError(error, {
        context: "ProjetosService.create",
        rethrow: true,
      });
    }
  }

  /**
   * Atualizar projeto
   */
  static async update(id: string, data: Partial<CreateProjetoDTO>) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new AppError("Não autenticado", ErrorType.AUTH_REQUIRED);

      const updateData = {
        ...data,
        data_lancamento_opus: data.data_lancamento_opus?.toISOString() || null,
        prazo_inicial: data.prazo_inicial?.toISOString() || null,
        prazo_previsto: data.prazo_previsto?.toISOString() || null,
      };

      const { error } = await supabase
        .from("projetos")
        .update(updateData as any)
        .eq("id", id);

      if (error) throw error;

      // Registrar alterações no histórico
      await this.registrarHistorico(id, user.id, "Projeto atualizado");
    } catch (error) {
      throw handleError(error, {
        context: "ProjetosService.update",
        rethrow: true,
      });
    }
  }

  /**
   * Alterar status do projeto
   */
  static async changeStatus(
    id: string,
    status: "Em Andamento" | "Em Pausa" | "Concluído" | "Cancelado",
    motivo?: string
  ) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new AppError("Não autenticado", ErrorType.AUTH_REQUIRED);

      const updateData: any = { status };

      if (status === "Em Pausa" && motivo) {
        updateData.motivo_pausa = motivo;
      } else if (status === "Cancelado" && motivo) {
        updateData.motivo_cancelamento = motivo;
      } else if (status === "Concluído") {
        updateData.data_conclusao = new Date().toISOString();
      }

      const { error } = await supabase
        .from("projetos")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;

      await this.registrarHistorico(
        id,
        user.id,
        `Status alterado para ${status}`,
        status,
        motivo
      );
    } catch (error) {
      throw handleError(error, {
        context: "ProjetosService.changeStatus",
        rethrow: true,
      });
    }
  }

  /**
   * Registrar histórico
   */
  private static async registrarHistorico(
    projetoId: string,
    usuarioId: string,
    acao: string,
    valorNovo?: string,
    valorAnterior?: string
  ) {
    try {
      await supabase.from("projetos_historico").insert({
        projeto_id: projetoId,
        usuario_id: usuarioId,
        acao,
        valor_novo: valorNovo || null,
        valor_anterior: valorAnterior || null,
      });
    } catch (error) {
      // Não falhar a operação principal se o log falhar
      console.error("Erro ao registrar histórico:", error);
    }
  }

  /**
   * Deletar projeto
   */
  static async delete(id: string) {
    try {
      const { error } = await supabase
        .from("projetos")
        .delete()
        .eq("id", id);

      if (error) throw error;
    } catch (error) {
      throw handleError(error, {
        context: "ProjetosService.delete",
        rethrow: true,
      });
    }
  }
}
