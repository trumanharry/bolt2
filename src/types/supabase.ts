export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      accounts: {
        Row: {
          id: string
          created_at: string
          created_by: string
          name: string
          [key: string]: any
        }
        Insert: {
          id?: string
          created_at?: string
          created_by: string
          name: string
          [key: string]: any
        }
        Update: {
          id?: string
          created_at?: string
          created_by?: string
          name?: string
          [key: string]: any
        }
      }
      entity_definitions: {
        Row: {
          id: string
          name: string
          label: string
          description: string | null
          is_system: boolean
          icon: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          label: string
          description?: string | null
          is_system?: boolean
          icon?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          label?: string
          description?: string | null
          is_system?: boolean
          icon?: string | null
          created_at?: string
        }
      }
      field_definitions: {
        Row: {
          id: string
          entity_id: string
          name: string
          label: string
          type: string
          is_required: boolean
          is_unique: boolean
          default_value: Json | null
          options: Json | null
          display_order: number
          created_at: string
        }
        Insert: {
          id?: string
          entity_id: string
          name: string
          label: string
          type: string
          is_required?: boolean
          is_unique?: boolean
          default_value?: Json | null
          options?: Json | null
          display_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          entity_id?: string
          name?: string
          label?: string
          type?: string
          is_required?: boolean
          is_unique?: boolean
          default_value?: Json | null
          options?: Json | null
          display_order?: number
          created_at?: string
        }
      }
      layout_definitions: {
        Row: {
          id: string
          entity_id: string
          name: string
          type: string
          definition: Json
          is_default: boolean
          created_at: string
          created_by: string
        }
        Insert: {
          id?: string
          entity_id: string
          name: string
          type: string
          definition: Json
          is_default?: boolean
          created_at?: string
          created_by: string
        }
        Update: {
          id?: string
          entity_id?: string
          name?: string
          type?: string
          definition?: Json
          is_default?: boolean
          created_at?: string
          created_by?: string
        }
      }
      users: {
        Row: {
          id: string
          created_at: string
          email: string
          full_name: string | null
          [key: string]: any
        }
        Insert: {
          id: string
          created_at?: string
          email: string
          full_name?: string | null
          [key: string]: any
        }
        Update: {
          id?: string
          created_at?: string
          email?: string
          full_name?: string | null
          [key: string]: any
        }
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
  }
}