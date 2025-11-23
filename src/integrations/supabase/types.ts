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
      activity_logs: { Row: { id: string; admin_id: string | null; action: string; entity_type: string; entity_id: string | null; details: Json | null; created_at: string; }; Insert: { id?: string; admin_id?: string | null; action: string; entity_type: string; entity_id?: string | null; details?: Json | null; created_at?: string; }; Update: { id?: string; admin_id?: string | null; action?: string; entity_type?: string; entity_id?: string | null; details?: Json | null; created_at?: string; }; },
      equipment: { Row: { id: string; name: string; category: string; description: string | null; quantity: number; availability_status: 'available' | 'in_use' | 'maintenance' | 'unavailable'; image_url: string | null; specifications: Json | null; created_at: string; updated_at: string; }; Insert: { id?: string; name: string; category: string; description?: string | null; quantity?: number; availability_status?: 'available' | 'in_use' | 'maintenance' | 'unavailable'; image_url?: string | null; specifications?: Json | null; created_at?: string; updated_at?: string; }; Update: { id?: string; name?: string; category?: string; description?: string | null; quantity?: number; availability_status?: 'available' | 'in_use' | 'maintenance' | 'unavailable'; image_url?: string | null; specifications?: Json | null; created_at?: string; updated_at?: string; }; },
      profiles: { Row: { id: string; email: string; full_name: string | null; role: 'super_admin' | 'admin' | 'faculty' | 'view_only'; permissions: { can_approve?: boolean; can_edit?: boolean; can_delete?: boolean; can_manage_users?: boolean; [key: string]: boolean | undefined }; notification_preferences: { email_on_new_project?: boolean; email_on_status_change?: boolean; email_digest?: 'never' | 'weekly' | 'daily' | 'monthly'; [key: string]: boolean | string | undefined }; created_at: string; updated_at: string; }; Insert: { id: string; email: string; full_name?: string | null; role?: 'super_admin' | 'admin' | 'faculty' | 'view_only'; permissions?: Json; notification_preferences?: Json; created_at?: string; updated_at?: string; }; Update: { id?: string; email?: string; full_name?: string | null; role?: 'super_admin' | 'admin' | 'faculty' | 'view_only'; permissions?: Json; notification_preferences?: Json; created_at?: string; updated_at?: string; }; },
      notifications: { Row: { id: string; user_id: string; type: 'project_submitted'|'project_approved'|'project_rejected'|'project_under_review'|'comment_added'|'system'; title: string; message: string; link: string | null; read: boolean; data: Json | null; created_at: string; }; Insert: { id?: string; user_id: string; type: 'project_submitted'|'project_approved'|'project_rejected'|'project_under_review'|'comment_added'|'system'; title: string; message: string; link?: string | null; read?: boolean; data?: Json | null; created_at?: string; }; Update: { id?: string; user_id?: string; type?: 'project_submitted'|'project_approved'|'project_rejected'|'project_under_review'|'comment_added'|'system'; title?: string; message?: string; link?: string | null; read?: boolean; data?: Json | null; created_at?: string; }; },
      email_queue: { Row: { id: string; to_email: string; to_name: string | null; subject: string; body_html: string; body_text: string | null; template_name: string | null; template_data: Json | null; status: 'pending'|'sending'|'sent'|'failed'; attempts: number; max_attempts: number; error_message: string | null; scheduled_for: string; sent_at: string | null; created_at: string; updated_at: string; }; Insert: { id?: string; to_email: string; to_name?: string | null; subject: string; body_html: string; body_text?: string | null; template_name?: string | null; template_data?: Json | null; status?: 'pending'|'sending'|'sent'|'failed'; attempts?: number; max_attempts?: number; error_message?: string | null; scheduled_for?: string; sent_at?: string | null; created_at?: string; updated_at?: string; }; Update: { id?: string; to_email?: string; to_name?: string | null; subject?: string; body_html?: string; body_text?: string | null; template_name?: string | null; template_data?: Json | null; status?: 'pending'|'sending'|'sent'|'failed'; attempts?: number; max_attempts?: number; error_message?: string | null; scheduled_for?: string; sent_at?: string | null; created_at?: string; updated_at?: string; }; },
      project_equipment: { Row: any; Insert: any; Update: any },
      projects: { Row: any; Insert: any; Update: any }
    },
    Views: { [_ in never]: never },
    Functions: { [_ in never]: never },
    Enums: { [_ in never]: never },
    CompositeTypes: { [_ in never]: never }
  }
}
