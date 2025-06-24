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
      addresses: {
        Row: {
          address: string
          created_at: string | null
          id: number
          parcel_id: string | null
        }
        Insert: {
          address: string
          created_at?: string | null
          id?: number
          parcel_id?: string | null
        }
        Update: {
          address?: string
          created_at?: string | null
          id?: number
          parcel_id?: string | null
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          created_at: string | null
          email_report_address: string | null
          email_reports_enabled: boolean | null
          id: number
          last_api_check_time: string | null
          last_api_new_records_count: number | null
          next_violation_check_time: string | null
          updated_at: string | null
          violation_checks_enabled: boolean | null
        }
        Insert: {
          created_at?: string | null
          email_report_address?: string | null
          email_reports_enabled?: boolean | null
          id?: number
          last_api_check_time?: string | null
          last_api_new_records_count?: number | null
          next_violation_check_time?: string | null
          updated_at?: string | null
          violation_checks_enabled?: boolean | null
        }
        Update: {
          created_at?: string | null
          email_report_address?: string | null
          email_reports_enabled?: boolean | null
          id?: number
          last_api_check_time?: string | null
          last_api_new_records_count?: number | null
          next_violation_check_time?: string | null
          updated_at?: string | null
          violation_checks_enabled?: boolean | null
        }
        Relationships: []
      }
      email_notifications: {
        Row: {
          email_address: string
          id: string
          new_records_count: number
          sent_at: string
          status: string
        }
        Insert: {
          email_address: string
          id?: string
          new_records_count: number
          sent_at?: string
          status?: string
        }
        Update: {
          email_address?: string
          id?: string
          new_records_count?: number
          sent_at?: string
          status?: string
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
          role?: Database["public"]["Enums"]["app_role"]
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
      violations: {
        Row: {
          _id: number
          address: string | null
          casefile_number: string | null
          investigation_date: string | null
          investigation_findings: string | null
          investigation_outcome: string | null
          parcel_id: string | null
          status: string | null
          violation_code_section: string | null
          violation_description: string | null
          violation_spec_instructions: string | null
        }
        Insert: {
          _id: number
          address?: string | null
          casefile_number?: string | null
          investigation_date?: string | null
          investigation_findings?: string | null
          investigation_outcome?: string | null
          parcel_id?: string | null
          status?: string | null
          violation_code_section?: string | null
          violation_description?: string | null
          violation_spec_instructions?: string | null
        }
        Update: {
          _id?: number
          address?: string | null
          casefile_number?: string | null
          investigation_date?: string | null
          investigation_findings?: string | null
          investigation_outcome?: string | null
          parcel_id?: string | null
          status?: string | null
          violation_code_section?: string | null
          violation_description?: string | null
          violation_spec_instructions?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_all_violations: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
