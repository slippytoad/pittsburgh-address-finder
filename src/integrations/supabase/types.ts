export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
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
          sms_report_phone: string | null
          sms_reports_enabled: boolean | null
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
          sms_report_phone?: string | null
          sms_reports_enabled?: boolean | null
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
          sms_report_phone?: string | null
          sms_reports_enabled?: boolean | null
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
      push_settings: {
        Row: {
          apns_environment: string | null
          app_version: string | null
          created_at: string | null
          device_model: string | null
          device_token: string
          id: number
          os_version: string | null
          permission_granted: boolean | null
          platform: string
          updated_at: string | null
        }
        Insert: {
          apns_environment?: string | null
          app_version?: string | null
          created_at?: string | null
          device_model?: string | null
          device_token: string
          id?: number
          os_version?: string | null
          permission_granted?: boolean | null
          platform: string
          updated_at?: string | null
        }
        Update: {
          apns_environment?: string | null
          app_version?: string | null
          created_at?: string | null
          device_model?: string | null
          device_token?: string
          id?: number
          os_version?: string | null
          permission_granted?: boolean | null
          platform?: string
          updated_at?: string | null
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
      add_first_admin_user: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
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
      app_role: ["admin", "user"],
    },
  },
} as const
