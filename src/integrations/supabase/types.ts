export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      atividades_sistema: {
        Row: {
          acao: string
          created_at: string | null
          detalhes: Json | null
          id: string
          recurso: string
          recurso_id: string | null
          user_id: string | null
        }
        Insert: {
          acao: string
          created_at?: string | null
          detalhes?: Json | null
          id?: string
          recurso: string
          recurso_id?: string | null
          user_id?: string | null
        }
        Update: {
          acao?: string
          created_at?: string | null
          detalhes?: Json | null
          id?: string
          recurso?: string
          recurso_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "atividades_sistema_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          details: Json | null
          id: string
          ip_address: unknown | null
          resource: string
          resource_id: string | null
          timestamp: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          resource: string
          resource_id?: string | null
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          resource?: string
          resource_id?: string | null
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      beneficiarios: {
        Row: {
          cpf: string
          created_at: string | null
          created_by: string | null
          created_by_name: string | null
          data_nascimento: string | null
          email: string | null
          endereco: string | null
          id: string
          limite_mensal_real: number | null
          limite_usado_atual: number | null
          nome: string
          numero_dependentes: number | null
          status: string | null
          telefone: string | null
          updated_at: string | null
        }
        Insert: {
          cpf: string
          created_at?: string | null
          created_by?: string | null
          created_by_name?: string | null
          data_nascimento?: string | null
          email?: string | null
          endereco?: string | null
          id?: string
          limite_mensal_real?: number | null
          limite_usado_atual?: number | null
          nome: string
          numero_dependentes?: number | null
          status?: string | null
          telefone?: string | null
          updated_at?: string | null
        }
        Update: {
          cpf?: string
          created_at?: string | null
          created_by?: string | null
          created_by_name?: string | null
          data_nascimento?: string | null
          email?: string | null
          endereco?: string | null
          id?: string
          limite_mensal_real?: number | null
          limite_usado_atual?: number | null
          nome?: string
          numero_dependentes?: number | null
          status?: string | null
          telefone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "beneficiarios_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      categorias_produtos: {
        Row: {
          created_at: string | null
          descricao: string | null
          id: string
          nome: string
        }
        Insert: {
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome: string
        }
        Update: {
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome?: string
        }
        Relationships: []
      }
      configuracoes_sistema: {
        Row: {
          categoria: string | null
          chave: string
          created_at: string | null
          created_by: string | null
          descricao: string | null
          id: string
          tipo: string | null
          updated_at: string | null
          updated_by_name: string | null
          valor: string
        }
        Insert: {
          categoria?: string | null
          chave: string
          created_at?: string | null
          created_by?: string | null
          descricao?: string | null
          id?: string
          tipo?: string | null
          updated_at?: string | null
          updated_by_name?: string | null
          valor: string
        }
        Update: {
          categoria?: string | null
          chave?: string
          created_at?: string | null
          created_by?: string | null
          descricao?: string | null
          id?: string
          tipo?: string | null
          updated_at?: string | null
          updated_by_name?: string | null
          valor?: string
        }
        Relationships: [
          {
            foreignKeyName: "configuracoes_sistema_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      dependentes: {
        Row: {
          beneficiario_id: string | null
          created_at: string | null
          data_nascimento: string | null
          id: string
          nome: string
          parentesco: string | null
        }
        Insert: {
          beneficiario_id?: string | null
          created_at?: string | null
          data_nascimento?: string | null
          id?: string
          nome: string
          parentesco?: string | null
        }
        Update: {
          beneficiario_id?: string | null
          created_at?: string | null
          data_nascimento?: string | null
          id?: string
          nome?: string
          parentesco?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dependentes_beneficiario_id_fkey"
            columns: ["beneficiario_id"]
            isOneToOne: false
            referencedRelation: "beneficiarios"
            referencedColumns: ["id"]
          },
        ]
      }
      distribuicoes: {
        Row: {
          beneficiario_id: string | null
          created_at: string | null
          created_by: string | null
          created_by_name: string | null
          data_distribuicao: string
          id: string
          observacoes: string | null
          status: string | null
          updated_at: string | null
          valor_total: number | null
        }
        Insert: {
          beneficiario_id?: string | null
          created_at?: string | null
          created_by?: string | null
          created_by_name?: string | null
          data_distribuicao: string
          id?: string
          observacoes?: string | null
          status?: string | null
          updated_at?: string | null
          valor_total?: number | null
        }
        Update: {
          beneficiario_id?: string | null
          created_at?: string | null
          created_by?: string | null
          created_by_name?: string | null
          data_distribuicao?: string
          id?: string
          observacoes?: string | null
          status?: string | null
          updated_at?: string | null
          valor_total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "distribuicoes_beneficiario_id_fkey"
            columns: ["beneficiario_id"]
            isOneToOne: false
            referencedRelation: "beneficiarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "distribuicoes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      doacoes: {
        Row: {
          created_at: string | null
          created_by: string | null
          created_by_name: string | null
          data_doacao: string
          doador_id: string | null
          id: string
          observacoes: string | null
          status: string | null
          tipo_doacao: string | null
          updated_at: string | null
          valor_total: number | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          created_by_name?: string | null
          data_doacao: string
          doador_id?: string | null
          id?: string
          observacoes?: string | null
          status?: string | null
          tipo_doacao?: string | null
          updated_at?: string | null
          valor_total?: number | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          created_by_name?: string | null
          data_doacao?: string
          doador_id?: string | null
          id?: string
          observacoes?: string | null
          status?: string | null
          tipo_doacao?: string | null
          updated_at?: string | null
          valor_total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "doacoes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doacoes_doador_id_fkey"
            columns: ["doador_id"]
            isOneToOne: false
            referencedRelation: "doadores"
            referencedColumns: ["id"]
          },
        ]
      }
      doadores: {
        Row: {
          cpf_cnpj: string | null
          created_at: string | null
          email: string | null
          endereco: string | null
          id: string
          nome: string
          telefone: string | null
          tipo: string | null
          updated_at: string | null
        }
        Insert: {
          cpf_cnpj?: string | null
          created_at?: string | null
          email?: string | null
          endereco?: string | null
          id?: string
          nome: string
          telefone?: string | null
          tipo?: string | null
          updated_at?: string | null
        }
        Update: {
          cpf_cnpj?: string | null
          created_at?: string | null
          email?: string | null
          endereco?: string | null
          id?: string
          nome?: string
          telefone?: string | null
          tipo?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      itens_distribuicao: {
        Row: {
          created_at: string | null
          distribuicao_id: string | null
          id: string
          produto_id: string | null
          quantidade: number
          valor_unitario: number | null
        }
        Insert: {
          created_at?: string | null
          distribuicao_id?: string | null
          id?: string
          produto_id?: string | null
          quantidade: number
          valor_unitario?: number | null
        }
        Update: {
          created_at?: string | null
          distribuicao_id?: string | null
          id?: string
          produto_id?: string | null
          quantidade?: number
          valor_unitario?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "itens_distribuicao_distribuicao_id_fkey"
            columns: ["distribuicao_id"]
            isOneToOne: false
            referencedRelation: "distribuicoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itens_distribuicao_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      itens_doacao: {
        Row: {
          created_at: string | null
          doacao_id: string | null
          id: string
          observacoes: string | null
          produto_id: string | null
          quantidade: number
          valor_unitario: number | null
        }
        Insert: {
          created_at?: string | null
          doacao_id?: string | null
          id?: string
          observacoes?: string | null
          produto_id?: string | null
          quantidade: number
          valor_unitario?: number | null
        }
        Update: {
          created_at?: string | null
          doacao_id?: string | null
          id?: string
          observacoes?: string | null
          produto_id?: string | null
          quantidade?: number
          valor_unitario?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "itens_doacao_doacao_id_fkey"
            columns: ["doacao_id"]
            isOneToOne: false
            referencedRelation: "doacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itens_doacao_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      movimentacoes_estoque: {
        Row: {
          created_at: string | null
          created_by: string | null
          created_by_name: string | null
          id: string
          motivo: string | null
          produto_id: string | null
          quantidade: number
          quantidade_anterior: number | null
          quantidade_nova: number | null
          referencia_id: string | null
          referencia_tipo: string | null
          tipo_movimentacao: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          created_by_name?: string | null
          id?: string
          motivo?: string | null
          produto_id?: string | null
          quantidade: number
          quantidade_anterior?: number | null
          quantidade_nova?: number | null
          referencia_id?: string | null
          referencia_tipo?: string | null
          tipo_movimentacao?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          created_by_name?: string | null
          id?: string
          motivo?: string | null
          produto_id?: string | null
          quantidade?: number
          quantidade_anterior?: number | null
          quantidade_nova?: number | null
          referencia_id?: string | null
          referencia_tipo?: string | null
          tipo_movimentacao?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "movimentacoes_estoque_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimentacoes_estoque_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      notificacoes: {
        Row: {
          created_at: string | null
          id: string
          lida: boolean | null
          mensagem: string
          tipo: string | null
          titulo: string
          url_acao: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          lida?: boolean | null
          mensagem: string
          tipo?: string | null
          titulo: string
          url_acao?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          lida?: boolean | null
          mensagem?: string
          tipo?: string | null
          titulo?: string
          url_acao?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notificacoes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      periodos_mensais: {
        Row: {
          ano: number
          created_at: string | null
          id: string
          limite_global_default: number | null
          mes: number
          status: string | null
          updated_at: string | null
        }
        Insert: {
          ano: number
          created_at?: string | null
          id?: string
          limite_global_default?: number | null
          mes: number
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          ano?: number
          created_at?: string | null
          id?: string
          limite_global_default?: number | null
          mes?: number
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      produtos: {
        Row: {
          categoria_id: string | null
          condicao: string | null
          cor: string | null
          created_at: string | null
          descricao: string | null
          id: string
          nome: string
          quantidade_estoque: number | null
          quantidade_minima: number | null
          tamanho: string | null
          updated_at: string | null
          valor_estimado: number | null
        }
        Insert: {
          categoria_id?: string | null
          condicao?: string | null
          cor?: string | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome: string
          quantidade_estoque?: number | null
          quantidade_minima?: number | null
          tamanho?: string | null
          updated_at?: string | null
          valor_estimado?: number | null
        }
        Update: {
          categoria_id?: string | null
          condicao?: string | null
          cor?: string | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome?: string
          quantidade_estoque?: number | null
          quantidade_minima?: number | null
          tamanho?: string | null
          updated_at?: string | null
          valor_estimado?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "produtos_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias_produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          email: string
          id: string
          last_login: string | null
          name: string
          password_hash: string
          role: Database["public"]["Enums"]["user_role_enum"]
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          last_login?: string | null
          name: string
          password_hash: string
          role?: Database["public"]["Enums"]["user_role_enum"]
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          last_login?: string | null
          name?: string
          password_hash?: string
          role?: Database["public"]["Enums"]["user_role_enum"]
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_user_dependencies: {
        Args: { user_id: string }
        Returns: Json
      }
      log_audit_event: {
        Args: {
          p_user_id: string
          p_action: string
          p_resource: string
          p_resource_id?: string
          p_ip_address?: unknown
          p_user_agent?: string
          p_details?: Json
        }
        Returns: string
      }
      log_user_deletion: {
        Args: {
          deleted_user_id: string
          deleted_user_name: string
          deleted_user_email: string
          deleted_user_role: string
          performed_by_user_id?: string
        }
        Returns: string
      }
      safe_delete_user: {
        Args: { target_user_id: string }
        Returns: Json
      }
    }
    Enums: {
      user_role_enum: "superadmin" | "admin" | "voluntario"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      user_role_enum: ["superadmin", "admin", "voluntario"],
    },
  },
} as const
