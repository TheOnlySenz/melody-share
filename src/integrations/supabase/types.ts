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
      platform_settings: {
        Row: {
          description: string | null
          id: string
          setting_name: string
          setting_value: Json
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          description?: string | null
          id?: string
          setting_name: string
          setting_value: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          description?: string | null
          id?: string
          setting_name?: string
          setting_value?: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "platform_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "platform_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "song_analytics"
            referencedColumns: ["artist_id"]
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
          is_admin: boolean | null
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
          is_admin?: boolean | null
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
          is_admin?: boolean | null
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
      royalties: {
        Row: {
          amount: number
          artist_id: string
          calculation_date: string | null
          creator_id: string
          id: string
          payment_id: string | null
          song_id: string
          status: string | null
          usage_id: string
        }
        Insert: {
          amount: number
          artist_id: string
          calculation_date?: string | null
          creator_id: string
          id?: string
          payment_id?: string | null
          song_id: string
          status?: string | null
          usage_id: string
        }
        Update: {
          amount?: number
          artist_id?: string
          calculation_date?: string | null
          creator_id?: string
          id?: string
          payment_id?: string | null
          song_id?: string
          status?: string | null
          usage_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "royalties_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "royalties_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "song_analytics"
            referencedColumns: ["artist_id"]
          },
          {
            foreignKeyName: "royalties_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "royalties_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "song_analytics"
            referencedColumns: ["artist_id"]
          },
          {
            foreignKeyName: "royalties_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "royalties_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "song_analytics"
            referencedColumns: ["song_id"]
          },
          {
            foreignKeyName: "royalties_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "songs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "royalties_usage_id_fkey"
            columns: ["usage_id"]
            isOneToOne: false
            referencedRelation: "song_usages"
            referencedColumns: ["id"]
          },
        ]
      }
      song_usages: {
        Row: {
          creator_id: string
          id: string
          last_updated: string | null
          song_id: string
          usage_start_date: string | null
          verified: boolean | null
          video_id: string
          video_title: string | null
          views_count: number | null
        }
        Insert: {
          creator_id: string
          id?: string
          last_updated?: string | null
          song_id: string
          usage_start_date?: string | null
          verified?: boolean | null
          video_id: string
          video_title?: string | null
          views_count?: number | null
        }
        Update: {
          creator_id?: string
          id?: string
          last_updated?: string | null
          song_id?: string
          usage_start_date?: string | null
          verified?: boolean | null
          video_id?: string
          video_title?: string | null
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "song_usages_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "song_usages_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "song_analytics"
            referencedColumns: ["artist_id"]
          },
          {
            foreignKeyName: "song_usages_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "song_analytics"
            referencedColumns: ["song_id"]
          },
          {
            foreignKeyName: "song_usages_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "songs"
            referencedColumns: ["id"]
          },
        ]
      }
      songs: {
        Row: {
          artist_id: string
          cover_image_path: string | null
          file_path: string
          genre: string | null
          id: string
          license_terms: Json | null
          royalty_split: Json | null
          status: string | null
          title: string
          upload_date: string | null
        }
        Insert: {
          artist_id: string
          cover_image_path?: string | null
          file_path: string
          genre?: string | null
          id?: string
          license_terms?: Json | null
          royalty_split?: Json | null
          status?: string | null
          title: string
          upload_date?: string | null
        }
        Update: {
          artist_id?: string
          cover_image_path?: string | null
          file_path?: string
          genre?: string | null
          id?: string
          license_terms?: Json | null
          royalty_split?: Json | null
          status?: string | null
          title?: string
          upload_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "songs_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "songs_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "song_analytics"
            referencedColumns: ["artist_id"]
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
      song_analytics: {
        Row: {
          artist_id: string | null
          artist_name: string | null
          song_id: string | null
          song_title: string | null
          total_earnings: number | null
          total_usages: number | null
          total_views: number | null
          unique_creators: number | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["artist_id"]
            isOneToOne: true
            referencedRelation: "user_analytics"
            referencedColumns: ["user_id"]
          },
        ]
      }
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
