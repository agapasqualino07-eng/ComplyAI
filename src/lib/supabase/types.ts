// Tipi minimi del DB - generabili in seguito con `supabase gen types`.
// Qui definiamo manualmente i tipi necessari per type-safety nelle query.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type PlanId = "free" | "solo" | "pro" | "business" | "enterprise";
export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "incomplete"
  | "incomplete_expired"
  | "unpaid"
  | "paused";

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
      sites: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          domain: string;
          public_id: string;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["sites"]["Row"]> & {
          organization_id: string;
          name: string;
          domain: string;
        };
        Update: Partial<Database["public"]["Tables"]["sites"]["Row"]>;
      };
      documents: {
        Row: {
          id: string;
          organization_id: string;
          site_id: string | null;
          type: "privacy" | "cookie" | "terms" | "eula";
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
          type: "privacy" | "cookie" | "terms" | "eula";
          title: string;
          slug: string;
          language: string;
        };
        Update: Partial<Database["public"]["Tables"]["documents"]["Row"]>;
      };
      cmp_configs: {
        Row: {
          id: string;
          organization_id: string;
          site_id: string;
          theme: "light" | "dark" | "auto";
          accent_color: string;
          position: "bottom" | "top" | "center";
          layout: "bar" | "box";
          consent_mode: "opt_in" | "opt_out" | "info";
          categories: Json;
          texts: Json;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["cmp_configs"]["Row"]> & {
          organization_id: string;
          site_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["cmp_configs"]["Row"]>;
      };
      consent_logs: {
        Row: {
          id: string;
          site_id: string;
          organization_id: string;
          subject_id: string;
          consent_string: string;
          categories: Json;
          user_agent: string | null;
          ip_hash: string | null;
          page_url: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["consent_logs"]["Row"]> & {
          site_id: string;
          organization_id: string;
          subject_id: string;
          consent_string: string;
          categories: Json;
        };
        Update: Partial<Database["public"]["Tables"]["consent_logs"]["Row"]>;
      };
      processing_records: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          purpose: string;
          legal_basis: string;
          data_categories: string[];
          data_subjects: string[];
          retention: string | null;
          recipients: string | null;
          transfers_outside_eu: boolean;
          security_measures: string | null;
          dpo_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["processing_records"]["Row"]> & {
          organization_id: string;
          name: string;
          purpose: string;
          legal_basis: string;
        };
        Update: Partial<Database["public"]["Tables"]["processing_records"]["Row"]>;
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
