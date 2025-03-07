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
      earnings: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          id: string
          source: string
          status: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          description?: string | null
          id?: string
          source: string
          status?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          id?: string
          source?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "earnings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_analytics"
            referencedColumns: ["user_id"]
          },
        ]
      }
      invite_codes: {
        Row: {
          code: string
          created_at: string | null
          created_by: string | null
          expires_at: string | null
          id: string
          is_admin_generated: boolean | null
          is_used: boolean | null
          used_by: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_admin_generated?: boolean | null
          is_used?: boolean | null
          used_by?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_admin_generated?: boolean | null
          is_used?: boolean | null
          used_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invite_codes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_analytics"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "invite_codes_used_by_fkey"
            columns: ["used_by"]
            isOneToOne: false
            referencedRelation: "user_analytics"
            referencedColumns: ["user_id"]
          },
        ]
      }
      payment_methods: {
        Row: {
          created_at: string | null
          details: Json
          id: string
          is_default: boolean | null
          method_type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          details: Json
          id?: string
          is_default?: boolean | null
          method_type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          details?: Json
          id?: string
          is_default?: boolean | null
          method_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_methods_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_analytics"
            referencedColumns: ["user_id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          has_dual_role: boolean | null
          id: string
          invite_code: string | null
          invited_by: string | null
          invites_available: number | null
          role: string
          secondary_role: string | null
          updated_at: string | null
          username: string | null
          youtube_channel_id: string | null
          youtube_channel_name: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          has_dual_role?: boolean | null
          id: string
          invite_code?: string | null
          invited_by?: string | null
          invites_available?: number | null
          role?: string
          secondary_role?: string | null
          updated_at?: string | null
          username?: string | null
          youtube_channel_id?: string | null
          youtube_channel_name?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          has_dual_role?: boolean | null
          id?: string
          invite_code?: string | null
          invited_by?: string | null
          invites_available?: number | null
          role?: string
          secondary_role?: string | null
          updated_at?: string | null
          username?: string | null
          youtube_channel_id?: string | null
          youtube_channel_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "user_analytics"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "profiles_invite_code_fkey"
            columns: ["invite_code"]
            isOneToOne: false
            referencedRelation: "invite_codes"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "profiles_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "user_analytics"
            referencedColumns: ["user_id"]
          },
        ]
      }
      referrals: {
        Row: {
          commission_amount: number | null
          created_at: string | null
          id: string
          referred_id: string
          referrer_id: string
          status: string
        }
        Insert: {
          commission_amount?: number | null
          created_at?: string | null
          id?: string
          referred_id: string
          referrer_id: string
          status?: string
        }
        Update: {
          commission_amount?: number | null
          created_at?: string | null
          id?: string
          referred_id?: string
          referrer_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referred_id_fkey"
            columns: ["referred_id"]
            isOneToOne: true
            referencedRelation: "user_analytics"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "user_analytics"
            referencedColumns: ["user_id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          completed_date: string | null
          id: string
          payment_details: Json
          payment_method: string
          status: string
          transaction_date: string | null
          user_id: string
        }
        Insert: {
          amount: number
          completed_date?: string | null
          id?: string
          payment_details: Json
          payment_method: string
          status?: string
          transaction_date?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          completed_date?: string | null
          id?: string
          payment_details?: Json
          payment_method?: string
          status?: string
          transaction_date?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_analytics"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Views: {
      user_analytics: {
        Row: {
          total_approved_earnings: number | null
          total_paid_earnings: number | null
          total_pending_earnings: number | null
          total_referral_earnings: number | null
          total_referrals: number | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      use_invite_code: {
        Args: {
          code_to_use: string
          user_id: string
        }
        Returns: boolean
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
