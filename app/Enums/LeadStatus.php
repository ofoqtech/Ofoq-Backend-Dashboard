<?php

namespace App\Enums;

enum LeadStatus: string
{
    case New = 'new';
    case Contacted = 'contacted';
    case Qualified = 'qualified';
    case ProposalSent = 'proposal_sent';
    case Negotiation = 'negotiation';
    case Won = 'won';
    case Lost = 'lost';

    public function label(): string
    {
        return match ($this) {
            self::New => 'New Inquiry',
            self::Contacted => 'Contacted',
            self::Qualified => 'Qualified',
            self::ProposalSent => 'Proposal Sent',
            self::Negotiation => 'In Negotiation',
            self::Won => 'Won / Closed',
            self::Lost => 'Lost',
        };
    }

    public function labelAr(): string
    {
        return match ($this) {
            self::New => 'طلب جديد',
            self::Contacted => 'تم التواصل',
            self::Qualified => 'مؤهل فنياً',
            self::ProposalSent => 'تم إرسال العرض',
            self::Negotiation => 'قيد التفاوض',
            self::Won => 'تم التعاقد',
            self::Lost => 'فرصة ملغاة',
        };
    }

    public function badgeVariant(): string
    {
        return match ($this) {
            self::New => 'default',
            self::Contacted => 'secondary',
            self::Qualified => 'outline',
            self::ProposalSent => 'secondary',
            self::Negotiation => 'secondary',
            self::Won => 'default',
            self::Lost => 'destructive',
        };
    }

    public function colorClass(): string
    {
        return match ($this) {
            self::New => 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20 dark:text-cyan-400',
            self::Contacted => 'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400',
            self::Qualified => 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20 dark:text-indigo-400',
            self::ProposalSent => 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400',
            self::Negotiation => 'bg-purple-500/10 text-purple-600 border-purple-500/20 dark:text-purple-400',
            self::Won => 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400',
            self::Lost => 'bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-400',
        };
    }
}

