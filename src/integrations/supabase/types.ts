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
      admin_logs: {
        Row: {
          action: string
          admin_id: string
          created_at: string | null
          details: Json | null
          id: string
          target_user_id: string | null
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string | null
          details?: Json | null
          id?: string
          target_user_id?: string | null
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          target_user_id?: string | null
        }
        Relationships: []
      }
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
          endereco_completo: string | null
          id: number
          "Organização Militar": string
          "Órgão Setorial Responsável": string
          "Sigla da OM": string
        }
        Insert: {
          endereco_completo?: string | null
          id?: number
          "Organização Militar": string
          "Órgão Setorial Responsável": string
          "Sigla da OM": string
        }
        Update: {
          endereco_completo?: string | null
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
      projetos: {
        Row: {
          acao_orcamentaria: string
          arquiteto: string | null
          created_at: string | null
          data_conclusao: string | null
          data_lancamento_opus: string | null
          diretoria_responsavel: string
          engenheiro_civil: string | null
          engenheiro_eletricista: string | null
          engenheiro_mecanico: string | null
          esta_no_dfd: boolean | null
          esta_no_pca_2025: boolean | null
          foi_lancado_opus: boolean | null
          id: string
          motivo_cancelamento: string | null
          motivo_pausa: string | null
          natureza_objeto: string
          numero_opus: string
          objeto: string
          observacoes_iniciais: string | null
          om_executora: string
          organizacao_id: number | null
          plano_orcamentario: string
          prazo_inicial: string | null
          prazo_previsto: string | null
          prazo_real_conclusao: string | null
          prioridade: string | null
          pro: string | null
          recursos_previstos_2025: number
          status: string | null
          updated_at: string | null
          usuario_responsavel_id: string | null
          valor_estimado_dfd: number
        }
        Insert: {
          acao_orcamentaria: string
          arquiteto?: string | null
          created_at?: string | null
          data_conclusao?: string | null
          data_lancamento_opus?: string | null
          diretoria_responsavel: string
          engenheiro_civil?: string | null
          engenheiro_eletricista?: string | null
          engenheiro_mecanico?: string | null
          esta_no_dfd?: boolean | null
          esta_no_pca_2025?: boolean | null
          foi_lancado_opus?: boolean | null
          id?: string
          motivo_cancelamento?: string | null
          motivo_pausa?: string | null
          natureza_objeto: string
          numero_opus: string
          objeto: string
          observacoes_iniciais?: string | null
          om_executora: string
          organizacao_id?: number | null
          plano_orcamentario: string
          prazo_inicial?: string | null
          prazo_previsto?: string | null
          prazo_real_conclusao?: string | null
          prioridade?: string | null
          pro?: string | null
          recursos_previstos_2025: number
          status?: string | null
          updated_at?: string | null
          usuario_responsavel_id?: string | null
          valor_estimado_dfd: number
        }
        Update: {
          acao_orcamentaria?: string
          arquiteto?: string | null
          created_at?: string | null
          data_conclusao?: string | null
          data_lancamento_opus?: string | null
          diretoria_responsavel?: string
          engenheiro_civil?: string | null
          engenheiro_eletricista?: string | null
          engenheiro_mecanico?: string | null
          esta_no_dfd?: boolean | null
          esta_no_pca_2025?: boolean | null
          foi_lancado_opus?: boolean | null
          id?: string
          motivo_cancelamento?: string | null
          motivo_pausa?: string | null
          natureza_objeto?: string
          numero_opus?: string
          objeto?: string
          observacoes_iniciais?: string | null
          om_executora?: string
          organizacao_id?: number | null
          plano_orcamentario?: string
          prazo_inicial?: string | null
          prazo_previsto?: string | null
          prazo_real_conclusao?: string | null
          prioridade?: string | null
          pro?: string | null
          recursos_previstos_2025?: number
          status?: string | null
          updated_at?: string | null
          usuario_responsavel_id?: string | null
          valor_estimado_dfd?: number
        }
        Relationships: [
          {
            foreignKeyName: "projetos_organizacao_id_fkey"
            columns: ["organizacao_id"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      projetos_anexos: {
        Row: {
          id: string
          nome_arquivo: string
          projeto_id: string
          tamanho: number | null
          tipo: string | null
          uploaded_at: string | null
          uploaded_by: string | null
          url: string
        }
        Insert: {
          id?: string
          nome_arquivo: string
          projeto_id: string
          tamanho?: number | null
          tipo?: string | null
          uploaded_at?: string | null
          uploaded_by?: string | null
          url: string
        }
        Update: {
          id?: string
          nome_arquivo?: string
          projeto_id?: string
          tamanho?: number | null
          tipo?: string | null
          uploaded_at?: string | null
          uploaded_by?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "projetos_anexos_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
        ]
      }
      projetos_historico: {
        Row: {
          acao: string
          campo_alterado: string | null
          created_at: string | null
          id: string
          projeto_id: string
          usuario_id: string | null
          valor_anterior: string | null
          valor_novo: string | null
        }
        Insert: {
          acao: string
          campo_alterado?: string | null
          created_at?: string | null
          id?: string
          projeto_id: string
          usuario_id?: string | null
          valor_anterior?: string | null
          valor_novo?: string | null
        }
        Update: {
          acao?: string
          campo_alterado?: string | null
          created_at?: string | null
          id?: string
          projeto_id?: string
          usuario_id?: string | null
          valor_anterior?: string | null
          valor_novo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projetos_historico_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
        ]
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
          justificativa_urgencia: string | null
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
          justificativa_urgencia?: string | null
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
          justificativa_urgencia?: string | null
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
      user_modules: {
        Row: {
          granted_at: string | null
          granted_by: string | null
          id: string
          module: Database["public"]["Enums"]["app_module"]
          user_id: string
        }
        Insert: {
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          module: Database["public"]["Enums"]["app_module"]
          user_id: string
        }
        Update: {
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          module?: Database["public"]["Enums"]["app_module"]
          user_id?: string
        }
        Relationships: []
      }
      user_registration_requests: {
        Row: {
          email: string
          id: string
          name: string
          rejection_reason: string | null
          requested_at: string | null
          requested_modules: Database["public"]["Enums"]["app_module"][]
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["approval_status"] | null
        }
        Insert: {
          email: string
          id?: string
          name: string
          rejection_reason?: string | null
          requested_at?: string | null
          requested_modules: Database["public"]["Enums"]["app_module"][]
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["approval_status"] | null
        }
        Update: {
          email?: string
          id?: string
          name?: string
          rejection_reason?: string | null
          requested_at?: string | null
          requested_modules?: Database["public"]["Enums"]["app_module"][]
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["approval_status"] | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      usuarios: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          id: string
          nome: string | null
          nome_guerra: string | null
          organizacao_militar_id: number | null
          posto_graduacao: string | null
          telefone: string | null
          telefone_alternativo: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          id?: string
          nome?: string | null
          nome_guerra?: string | null
          organizacao_militar_id?: number | null
          posto_graduacao?: string | null
          telefone?: string | null
          telefone_alternativo?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          id?: string
          nome?: string | null
          nome_guerra?: string | null
          organizacao_militar_id?: number | null
          posto_graduacao?: string | null
          telefone?: string | null
          telefone_alternativo?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "usuarios_organizacao_militar_id_fkey"
            columns: ["organizacao_militar_id"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
        ]
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
      has_module_access: {
        Args: {
          _module: Database["public"]["Enums"]["app_module"]
          _user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_module: "vistorias" | "projetos" | "fiscalizacao"
      app_role: "admin" | "user"
      approval_status: "pending" | "approved" | "rejected"
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
    Enums: {
      app_module: ["vistorias", "projetos", "fiscalizacao"],
      app_role: ["admin", "user"],
      approval_status: ["pending", "approved", "rejected"],
    },
  },
} as const
