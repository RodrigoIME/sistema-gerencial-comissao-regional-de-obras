export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      anexos: {
        Row: {
          id: number
          solicitacao_id: number | null
          tipo: string | null
          uploaded_at: string | null
          url: string
        }
        Insert: {
          id?: number
          solicitacao_id?: number | null
          tipo?: string | null
          uploaded_at?: string | null
          url: string
        }
        Update: {
          id?: number
          solicitacao_id?: number | null
          tipo?: string | null
          uploaded_at?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "anexos_solicitacao_id_fkey"
            columns: ["solicitacao_id"]
            isOneToOne: false
            referencedRelation: "solicitacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      Organizacao_Militar: {
        Row: {
          id: number
          Nome_da_Organizacao_Militar_Apoiada: string
          Sigla_da_OM: string
          Sigla_Orgao_de_Direcao_Setorial: number
        }
        Insert: {
          id?: number
          Nome_da_Organizacao_Militar_Apoiada: string
          Sigla_da_OM: string
          Sigla_Orgao_de_Direcao_Setorial: number
        }
        Update: {
          id?: number
          Nome_da_Organizacao_Militar_Apoiada?: string
          Sigla_da_OM?: string
          Sigla_Orgao_de_Direcao_Setorial?: number
        }
        Relationships: [
          {
            foreignKeyName: "Organizacao_Militar_Sigla_Orgao_de_Direcao_Setorial_fkey"
            columns: ["Sigla_Orgao_de_Direcao_Setorial"]
            isOneToOne: false
            referencedRelation: "Orgao_de_Direcao_Setorial"
            referencedColumns: ["id"]
          },
        ]
      }
      organizacoes: {
        Row: {
          id: number
          "Organização Militar": string
          "Órgão Setorial Responsável": string
          "Sigla da OM": string
        }
        Insert: {
          id?: number
          "Organização Militar": string
          "Órgão Setorial Responsável": string
          "Sigla da OM": string
        }
        Update: {
          id?: number
          "Organização Militar"?: string
          "Órgão Setorial Responsável"?: string
          "Sigla da OM"?: string
        }
        Relationships: []
      }
      Orgao_de_Direcao_Setorial: {
        Row: {
          id: number
          Nome_do_Orgao_de_Direcao_Setorial: string
          Sigla_do_Orgao_de_Direcao_Setorial: string
        }
        Insert: {
          id?: number
          Nome_do_Orgao_de_Direcao_Setorial: string
          Sigla_do_Orgao_de_Direcao_Setorial: string
        }
        Update: {
          id?: number
          Nome_do_Orgao_de_Direcao_Setorial?: string
          Sigla_do_Orgao_de_Direcao_Setorial?: string
        }
        Relationships: []
      }
      solicitacoes: {
        Row: {
          classificacao_urgencia: string | null
          contato_email: string | null
          contato_nome: string | null
          contato_telefone: string | null
          data_solicitacao: string | null
          diretoria_responsavel: string | null
          documento_origem_anexo: string | null
          documento_origem_dados: string | null
          endereco_completo: string | null
          id: number
          numero_referencia_opous: string | null
          objetivo_vistoria: string | null
          objeto: string
          organizacao_id: number | null
          status: string | null
          tipo_vistoria: string | null
          usuario_id: string | null
        }
        Insert: {
          classificacao_urgencia?: string | null
          contato_email?: string | null
          contato_nome?: string | null
          contato_telefone?: string | null
          data_solicitacao?: string | null
          diretoria_responsavel?: string | null
          documento_origem_anexo?: string | null
          documento_origem_dados?: string | null
          endereco_completo?: string | null
          id?: number
          numero_referencia_opous?: string | null
          objetivo_vistoria?: string | null
          objeto: string
          organizacao_id?: number | null
          status?: string | null
          tipo_vistoria?: string | null
          usuario_id?: string | null
        }
        Update: {
          classificacao_urgencia?: string | null
          contato_email?: string | null
          contato_nome?: string | null
          contato_telefone?: string | null
          data_solicitacao?: string | null
          diretoria_responsavel?: string | null
          documento_origem_anexo?: string | null
          documento_origem_dados?: string | null
          endereco_completo?: string | null
          id?: number
          numero_referencia_opous?: string | null
          objetivo_vistoria?: string | null
          objeto?: string
          organizacao_id?: number | null
          status?: string | null
          tipo_vistoria?: string | null
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "solicitacoes_organizacao_id_fkey"
            columns: ["organizacao_id"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "solicitacoes_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      usuarios: {
        Row: {
          created_at: string | null
          email: string
          id: string
          nome: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          nome?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          nome?: string | null
        }
        Relationships: []
      }
      vistorias: {
        Row: {
          data_vistoria: string | null
          descricao: string | null
          id: number
          relatorio: string | null
          solicitacao_id: number | null
        }
        Insert: {
          data_vistoria?: string | null
          descricao?: string | null
          id?: number
          relatorio?: string | null
          solicitacao_id?: number | null
        }
        Update: {
          data_vistoria?: string | null
          descricao?: string | null
          id?: number
          relatorio?: string | null
          solicitacao_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vistorias_solicitacao_id_fkey"
            columns: ["solicitacao_id"]
            isOneToOne: false
            referencedRelation: "solicitacoes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
