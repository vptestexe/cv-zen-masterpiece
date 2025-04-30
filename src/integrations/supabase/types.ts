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
      ad_placements: {
        Row: {
          ad_code: string | null
          created_at: string
          end_date: string | null
          id: string
          image_url: string | null
          is_active: boolean
          network: string
          position: string
          size: string
          start_date: string
          updated_at: string
        }
        Insert: {
          ad_code?: string | null
          created_at?: string
          end_date?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          network: string
          position: string
          size: string
          start_date?: string
          updated_at?: string
        }
        Update: {
          ad_code?: string | null
          created_at?: string
          end_date?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          network?: string
          position?: string
          size?: string
          start_date?: string
          updated_at?: string
        }
        Relationships: []
      }
      ad_stats: {
        Row: {
          clicks: number
          created_at: string
          date: string
          id: string
          impressions: number
          placement_id: string | null
        }
        Insert: {
          clicks?: number
          created_at?: string
          date?: string
          id?: string
          impressions?: number
          placement_id?: string | null
        }
        Update: {
          clicks?: number
          created_at?: string
          date?: string
          id?: string
          impressions?: number
          placement_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ad_stats_placement_id_fkey"
            columns: ["placement_id"]
            isOneToOne: false
            referencedRelation: "ad_placements"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_activity_logs: {
        Row: {
          action: string
          admin_id: string
          created_at: string
          details: Json | null
          entity_id: string
          entity_type: string
          id: string
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string
          details?: Json | null
          entity_id: string
          entity_type: string
          id?: string
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string
          details?: Json | null
          entity_id?: string
          entity_type?: string
          id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          cv_id: string
          downloads_added: number
          id: string
          paiementpro_reference: string | null
          paiementpro_status: string | null
          paiementpro_token: string | null
          payment_method: string
          payment_provider: string | null
          status: string
          transaction_id: string | null
          user_id: string
          verification_attempts: number | null
        }
        Insert: {
          amount: number
          created_at?: string
          cv_id: string
          downloads_added: number
          id?: string
          paiementpro_reference?: string | null
          paiementpro_status?: string | null
          paiementpro_token?: string | null
          payment_method: string
          payment_provider?: string | null
          status: string
          transaction_id?: string | null
          user_id: string
          verification_attempts?: number | null
        }
        Update: {
          amount?: number
          created_at?: string
          cv_id?: string
          downloads_added?: number
          id?: string
          paiementpro_reference?: string | null
          paiementpro_status?: string | null
          paiementpro_token?: string | null
          payment_method?: string
          payment_provider?: string | null
          status?: string
          transaction_id?: string | null
          user_id?: string
          verification_attempts?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_duplicate_payment: {
        Args: { p_reference: string; p_amount: number }
        Returns: boolean
      }
      create_storage_policy: {
        Args: {
          bucket_name: string
          policy_name: string
          definition: string
          operation: string
        }
        Returns: undefined
      }
      get_ad_stats: {
        Args: Record<PropertyKey, never> | { days?: number }
        Returns: {
          id: string
          placement_id: string
          impressions: number
          clicks: number
          date: string
        }[]
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      verify_payment: {
        Args:
          | Record<PropertyKey, never>
          | {
              p_user_id: string
              p_cv_id: string
              p_amount: number
              p_transaction_id?: string
            }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
