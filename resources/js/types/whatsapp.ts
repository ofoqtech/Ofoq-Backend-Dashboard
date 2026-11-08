import type { User } from './auth';
import type { Lead } from './crm';

export type WhatsAppMessageDirection = 'incoming' | 'outgoing';

export type WhatsAppMessageType =
    | 'text'
    | 'image'
    | 'video'
    | 'audio'
    | 'document'
    | 'location'
    | 'interactive'
    | 'template'
    | 'unsupported';

export type WhatsAppMessageStatus =
    | 'pending'
    | 'sent'
    | 'delivered'
    | 'read'
    | 'failed';

export type WhatsAppConversationStatus = 'open' | 'closed' | 'pending' | 'archived';

export interface WhatsAppMedia {
    id: number;
    message_id: number;
    meta_media_id?: string | null;
    disk: string;
    file_path: string;
    file_name: string;
    mime_type: string;
    file_size?: number | null;
    caption?: string | null;
    url: string;
    created_at: string;
}

export interface WhatsAppMessage {
    id: number;
    conversation_id: number;
    contact_id: number;
    user_id?: number | null;
    whatsapp_message_id?: string | null;
    direction: WhatsAppMessageDirection;
    type: WhatsAppMessageType;
    body?: string | null;
    status: WhatsAppMessageStatus;
    error_code?: string | null;
    error_message?: string | null;
    metadata?: Record<string, unknown> | null;
    sent_at?: string | null;
    delivered_at?: string | null;
    read_at?: string | null;
    created_at: string;
    media?: WhatsAppMedia | null;
    sender?: User | null;
}

export interface WhatsAppContact {
    id: number;
    lead_id?: number | null;
    wa_id: string;
    profile_name?: string | null;
    phone_number?: string | null;
    avatar_url?: string | null;
    lead?: Lead | null;
    created_at: string;
}

export interface WhatsAppConversation {
    id: number;
    account_id?: number | null;
    contact_id: number;
    lead_id?: number | null;
    assigned_to?: number | null;
    status: WhatsAppConversationStatus;
    unread_count: number;
    last_message_at?: string | null;
    last_message_preview?: string | null;
    last_message_direction?: WhatsAppMessageDirection | null;
    is_pinned: boolean;
    contact: WhatsAppContact;
    lead?: Lead | null;
    assignee?: User | null;
    latest_message?: WhatsAppMessage | null;
    created_at: string;
    updated_at: string;
}

export interface WhatsAppTemplate {
    id: number;
    account_id?: number | null;
    name: string;
    language: string;
    category: string;
    status: string;
    header_type: string;
    header_text?: string | null;
    body_text: string;
    footer_text?: string | null;
    buttons?: unknown[] | null;
    example_parameters?: string[] | null;
}

export interface WhatsAppQuickReply {
    id: number;
    shortcut: string;
    title: string;
    content: string;
    category?: string | null;
}

export interface WhatsAppAccountInfo {
    id: number;
    name: string;
    phone_number_id?: string | null;
    display_phone_number?: string | null;
    is_active: boolean;
}

