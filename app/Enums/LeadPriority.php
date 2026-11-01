<?php

namespace App\Enums;

enum LeadPriority: string
{
    case Low = 'low';
    case Medium = 'medium';
    case High = 'high';
    case Urgent = 'urgent';

    public function label(): string
    {
        return match ($this) {
            self::Low => 'Low',
            self::Medium => 'Medium',
            self::High => 'High',
            self::Urgent => 'Urgent',
        };
    }

    public function labelAr(): string
    {
        return match ($this) {
            self::Low => 'منخفضة',
            self::Medium => 'متوسطة',
            self::High => 'عالية',
            self::Urgent => 'عاجلة جداً',
        };
    }

    public function colorClass(): string
    {
        return match ($this) {
            self::Low => 'bg-slate-500/10 text-slate-600 border-slate-500/20',
            self::Medium => 'bg-blue-500/10 text-blue-600 border-blue-500/20',
            self::High => 'bg-amber-500/10 text-amber-600 border-amber-500/20',
            self::Urgent => 'bg-red-500/10 text-red-600 border-red-500/20',
        };
    }
}
