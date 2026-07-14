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
      events: {
        Row: {
          id: string
          name: string
          description: string | null
          event_date: string
          location: string
          registration_open_at: string
          registration_close_at: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          event_date: string
          location: string
          registration_open_at: string
          registration_close_at: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          event_date?: string
          location?: string
          registration_open_at?: string
          registration_close_at?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      event_categories: {
        Row: {
          id: string
          event_id: string
          name: string
          distance_km: number
          price: number
          quota: number
          reserved_count: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          event_id: string
          name: string
          distance_km: number
          price: number
          quota: number
          reserved_count?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          name?: string
          distance_km?: number
          price?: number
          quota?: number
          reserved_count?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_categories_event_id_fkey"
            columns: ["event_id"]
            referencedRelation: "events"
            referencedColumns: ["id"]
          }
        ]
      }
      registrations: {
        Row: {
          id: string
          registration_number: string
          event_id: string
          event_category_id: string
          full_name: string
          email: string
          phone: string
          nik: string
          gender: string
          birth_place: string
          birth_date: string
          nationality: string
          address: string
          blood_type: string | null
          medical_history: string | null
          jersey_size: string
          emergency_contact_name: string
          emergency_contact_phone: string
          registration_status: 'pending_payment' | 'paid' | 'cancelled' | 'expired'
          qr_code_token: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          registration_number: string
          event_id: string
          event_category_id: string
          full_name: string
          email: string
          phone: string
          nik: string
          gender: string
          birth_place: string
          birth_date: string
          nationality?: string
          address: string
          blood_type?: string | null
          medical_history?: string | null
          jersey_size: string
          emergency_contact_name: string
          emergency_contact_phone: string
          registration_status?: 'pending_payment' | 'paid' | 'cancelled' | 'expired'
          qr_code_token?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          registration_number?: string
          event_id?: string
          event_category_id?: string
          full_name?: string
          email?: string
          phone?: string
          nik?: string
          gender?: string
          birth_place?: string
          birth_date?: string
          nationality?: string
          address?: string
          blood_type?: string | null
          medical_history?: string | null
          jersey_size?: string
          emergency_contact_name?: string
          emergency_contact_phone?: string
          registration_status?: 'pending_payment' | 'paid' | 'cancelled' | 'expired'
          qr_code_token?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "registrations_event_id_fkey"
            columns: ["event_id"]
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registrations_event_category_id_fkey"
            columns: ["event_category_id"]
            referencedRelation: "event_categories"
            referencedColumns: ["id"]
          }
        ]
      }
      transactions: {
        Row: {
          id: string
          registration_id: string
          order_id: string
          amount: number
          payment_type: string | null
          transaction_status: 'pending' | 'settlement' | 'expire' | 'cancel' | 'deny'
          midtrans_transaction_id: string | null
          snap_token: string | null
          snap_redirect_url: string | null
          paid_at: string | null
          expired_at: string | null
          raw_notification: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          registration_id: string
          order_id: string
          amount: number
          payment_type?: string | null
          transaction_status?: 'pending' | 'settlement' | 'expire' | 'cancel' | 'deny'
          midtrans_transaction_id?: string | null
          snap_token?: string | null
          snap_redirect_url?: string | null
          paid_at?: string | null
          expired_at?: string | null
          raw_notification?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          registration_id?: string
          order_id?: string
          amount?: number
          payment_type?: string | null
          transaction_status?: 'pending' | 'settlement' | 'expire' | 'cancel' | 'deny'
          midtrans_transaction_id?: string | null
          snap_token?: string | null
          snap_redirect_url?: string | null
          paid_at?: string | null
          expired_at?: string | null
          raw_notification?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_registration_id_fkey"
            columns: ["registration_id"]
            referencedRelation: "registrations"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          id: string
          full_name: string
          role: 'admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name: string
          role?: 'admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          role?: 'admin'
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
  }
}
