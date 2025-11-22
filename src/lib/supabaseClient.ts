import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database tables
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string
          role: 'superadmin' | 'leader' | 'staff'
          company_name: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role?: 'superadmin' | 'leader' | 'staff'
          company_name?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          role?: 'superadmin' | 'leader' | 'staff'
          company_name?: string | null
          created_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          type: 'income' | 'expense'
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          type: 'income' | 'expense'
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: 'income' | 'expense'
          created_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          amount: number
          type: 'income' | 'expense'
          category_id: string
          description: string | null
          date: string
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          amount: number
          type: 'income' | 'expense'
          category_id: string
          description?: string | null
          date: string
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          amount?: number
          type?: 'income' | 'expense'
          category_id?: string
          description?: string | null
          date?: string
          user_id?: string
          created_at?: string
          updated_at?: string
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}