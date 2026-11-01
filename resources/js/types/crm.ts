import type { User } from './auth';

export type LeadStatusKey =
    | 'new'
    | 'contacted'
    | 'qualified'
    | 'proposal_sent'
    | 'negotiation'
    | 'won'
    | 'lost';

export type LeadPriorityKey = 'low' | 'medium' | 'high' | 'urgent';

export interface ServiceBudget {
    id: number;
    service_id: number;
    tier_key: string;
    type: { ar: string; en?: string } | string;
    range: string;
    description?: { ar?: string; en?: string } | string | null;
    type_en?: string | null;
    type_ar?: string | null;
    description_en?: string | null;
    description_ar?: string | null;
    order: number;
}

export interface Service {
    id: number;
    slug: string;
    name: { ar: string; en?: string } | string;
    description?: { ar?: string; en?: string } | string | null;
    name_en?: string | null;
    name_ar?: string | null;
    description_en?: string | null;
    description_ar?: string | null;
    icon?: string | null;
    order: number;
    is_active: boolean;
    budgets?: ServiceBudget[];
}

export interface LeadActivity {
    id: number;
    lead_id: number;
    user_id?: number | null;
    type:
        | 'created'
        | 'status_change'
        | 'priority_change'
        | 'assigned'
        | 'note'
        | 'call'
        | 'whatsapp'
        | 'email'
        | 'meeting'
        | 'proposal_sent';
    content: string;
    metadata?: Record<string, unknown> | null;
    created_at: string;
    user?: User | null;
}

export interface Lead {
    id: number;
    name: string;
    phone: string;
    email?: string | null;
    company?: string | null;
    service_id?: number | null;
    service_budget_id?: number | null;
    service_name_snapshot?: string | null;
    budget_range_snapshot?: string | null;
    status: LeadStatusKey;
    priority: LeadPriorityKey;
    assigned_to?: number | null;
    internal_notes?: string | null;
    lost_reason?: string | null;
    contacted_at?: string | null;
    next_follow_up_at?: string | null;
    source: string;
    ip_address?: string | null;
    created_at: string;
    updated_at: string;
    status_label: string;
    status_label_ar: string;
    status_color: string;
    priority_label: string;
    priority_label_ar: string;
    priority_color: string;
    whatsapp_url: string;
    service?: Service | null;
    service_budget?: ServiceBudget | null;
    assignee?: User | null;
    activities?: LeadActivity[];
}

export interface CrmAnalytics {
    total_leads: number;
    new_leads: number;
    in_progress: number;
    won: number;
    lost: number;
    conversion_rate: number;
}

export interface PipelineStage {
    status: LeadStatusKey;
    label: string;
    label_ar: string;
    color: string;
    leads: Lead[];
}

export interface StatusOption {
    value: LeadStatusKey;
    label: string;
    label_ar: string;
    color: string;
}

export interface PriorityOption {
    value: LeadPriorityKey;
    label: string;
    label_ar: string;
    color: string;
}
