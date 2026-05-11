// Tipi DB lato client. Per type-safety completa: `supabase gen types`.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type PlanId = "free" | "pro" | "enterprise";
export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "incomplete"
  | "incomplete_expired"
  | "unpaid"
  | "paused";

export type DocumentType =
  | "ai_use_policy"
  | "ai_employee_notice"
  | "ai_disclosure"
  | "ai_registry_export";

export type ComplianceStatus = "bozza" | "in_corso" | "completato" | "scaduto";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & { id: string; email: string };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
      };
      organizations: {
        Row: {
          id: string;
          name: string;
          legal_name: string | null;
          vat_number: string | null;
          tax_code: string | null;
          country: string;
          address: string | null;
          city: string | null;
          postal_code: string | null;
          email: string | null;
          owner_id: string;
          sector: string | null;
          employees: string | null;
          compliance_score: number;
          compliance_status: ComplianceStatus;
          questionnaire_data: Json | null;
          partner_id: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["organizations"]["Row"]> & { name: string; owner_id: string };
        Update: Partial<Database["public"]["Tables"]["organizations"]["Row"]>;
      };
      org_members: {
        Row: {
          id: string;
          organization_id: string;
          user_id: string;
          role: "owner" | "admin" | "editor" | "viewer";
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["org_members"]["Row"]> & {
          organization_id: string;
          user_id: string;
          role: "owner" | "admin" | "editor" | "viewer";
        };
        Update: Partial<Database["public"]["Tables"]["org_members"]["Row"]>;
      };
      partners: {
        Row: {
          id: string;
          user_id: string;
          studio_name: string;
          contact_name: string | null;
          contact_email: string | null;
          vat_number: string | null;
          client_slots: number;
          clients_used: number;
          logo_url: string | null;
          brand_color: string | null;
          footer_text: string | null;
          welcome_message: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["partners"]["Row"]> & {
          user_id: string;
          studio_name: string;
        };
        Update: Partial<Database["public"]["Tables"]["partners"]["Row"]>;
      };
      subscriptions: {
        Row: {
          id: string;
          organization_id: string;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          stripe_price_id: string | null;
          plan: PlanId;
          cadence: "monthly" | "yearly" | null;
          status: SubscriptionStatus;
          trial_end: string | null;
          current_period_end: string | null;
          cancel_at_period_end: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["subscriptions"]["Row"]> & {
          organization_id: string;
          plan: PlanId;
          status: SubscriptionStatus;
        };
        Update: Partial<Database["public"]["Tables"]["subscriptions"]["Row"]>;
      };
      ai_systems: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          vendor: string | null;
          vendor_url: string | null;
          vendor_key: string | null;
          description: string | null;
          purpose: string | null;
          org_role: "provider" | "deployer" | "distributor" | "importer";
          risk_class: "prohibited" | "high" | "limited" | "minimal" | "gpai" | null;
          category: string | null;
          obligation: string | null;
          status: "in_use" | "in_evaluation" | "decommissioned";
          is_gpai: boolean;
          uses_personal_data: boolean;
          affects_individuals: boolean;
          domains: string[];
          questionnaire: Json;
          human_oversight: string | null;
          data_sources: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["ai_systems"]["Row"]> & {
          organization_id: string;
          name: string;
        };
        Update: Partial<Database["public"]["Tables"]["ai_systems"]["Row"]>;
      };
      documents: {
        Row: {
          id: string;
          organization_id: string;
          site_id: string | null;
          type: DocumentType;
          title: string;
          slug: string;
          language: string;
          version: number;
          questionnaire: Json;
          rendered_html: string;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["documents"]["Row"]> & {
          organization_id: string;
          type: DocumentType;
          title: string;
          slug: string;
          language: string;
        };
        Update: Partial<Database["public"]["Tables"]["documents"]["Row"]>;
      };
      training_records: {
        Row: {
          id: string;
          organization_id: string;
          employee_name: string;
          employee_email: string | null;
          topic: string;
          module_id: string | null;
          duration_hours: number;
          completed_at: string;
          notes: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["training_records"]["Row"]> & {
          organization_id: string;
          employee_name: string;
          topic: string;
        };
        Update: Partial<Database["public"]["Tables"]["training_records"]["Row"]>;
      };
      alerts: {
        Row: {
          id: string;
          title: string;
          content: string;
          severity: "info" | "warning" | "critical";
          impact: string | null;
          source: string | null;
          published_at: string;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["alerts"]["Row"]> & {
          title: string;
          content: string;
        };
        Update: Partial<Database["public"]["Tables"]["alerts"]["Row"]>;
      };
      quiz_completions: {
        Row: {
          id: string;
          sector: string | null;
          employees: string | null;
          score: number | null;
          systems_count: number | null;
          risk_summary: Json;
          answers: Json;
          email: string | null;
          clicked_pro: boolean;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["quiz_completions"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["quiz_completions"]["Row"]>;
      };
      audit_logs: {
        Row: {
          id: string;
          organization_id: string;
          actor_id: string | null;
          action: string;
          target_type: string | null;
          target_id: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["audit_logs"]["Row"]> & {
          organization_id: string;
          action: string;
        };
        Update: Partial<Database["public"]["Tables"]["audit_logs"]["Row"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
