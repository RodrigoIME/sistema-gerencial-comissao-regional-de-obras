import { supabase } from "@/integrations/supabase/client";
import { handleError } from "@/lib/errors";

export interface Organizacao {
  id: number;
  nome: string;
  sigla: string;
  diretoria: string;
  endereco?: string;
}

export class OrganizacoesService {
  /**
   * Listar todas as organizações
   */
  static async list(): Promise<Organizacao[]> {
    try {
      const { data, error } = await supabase
        .from("organizacoes")
        .select("*")
        .order('"Organização Militar"');

      if (error) throw error;

      return (data || []).map((org: any) => ({
        id: org.id,
        nome: org["Organização Militar"],
        sigla: org["Sigla da OM"],
        diretoria: org["Órgão Setorial Responsável"],
        endereco: org.endereco_completo,
      }));
    } catch (error) {
      throw handleError(error, {
        context: "OrganizacoesService.list",
        rethrow: true,
      });
    }
  }

  /**
   * Buscar organização por ID
   */
  static async getById(id: number): Promise<Organizacao | null> {
    try {
      const { data, error } = await supabase
        .from("organizacoes")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      return {
        id: data.id,
        nome: data["Organização Militar"],
        sigla: data["Sigla da OM"],
        diretoria: data["Órgão Setorial Responsável"],
        endereco: data.endereco_completo,
      };
    } catch (error) {
      throw handleError(error, {
        context: "OrganizacoesService.getById",
        rethrow: true,
      });
    }
  }
}
