<?php

namespace App\Models;

use App\Enums\LeadPriority;
use App\Enums\LeadStatus;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $name
 * @property string $phone
 * @property string|null $email
 * @property string|null $company
 * @property int|null $service_id
 * @property int|null $service_budget_id
 * @property string|null $service_name_snapshot
 * @property string|null $budget_range_snapshot
 * @property LeadStatus $status
 * @property LeadPriority $priority
 * @property int|null $assigned_to
 * @property string|null $internal_notes
 * @property string|null $lost_reason
 * @property Carbon|null $contacted_at
 * @property Carbon|null $next_follow_up_at
 * @property string $source
 * @property string|null $utm_source
 * @property string|null $utm_medium
 * @property string|null $utm_campaign
 * @property string|null $utm_content
 * @property string|null $form_name
 * @property string|null $landing_page
 * @property string|null $referrer
 * @property string|null $ip_address
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Service|null $service
 * @property-read ServiceBudget|null $serviceBudget
 * @property-read User|null $assignee
 */
#[Fillable([
    'name',
    'phone',
    'email',
    'company',
    'service_id',
    'service_budget_id',
    'service_name_snapshot',
    'budget_range_snapshot',
    'status',
    'priority',
    'assigned_to',
    'internal_notes',
    'lost_reason',
    'contacted_at',
    'next_follow_up_at',
    'source',
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_content',
    'form_name',
    'landing_page',
    'referrer',
    'ip_address',
])]
class Lead extends Model
{
    use HasFactory;

    /**
     * The accessors to append to the model's array form.
     *
     * @var list<string>
     */
    protected $appends = [
        'status_label',
        'status_label_ar',
        'status_color',
        'priority_label',
        'priority_label_ar',
        'priority_color',
        'whatsapp_url',
        'channel',
        'channel_label',
        'channel_label_ar',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => LeadStatus::class,
            'priority' => LeadPriority::class,
            'contacted_at' => 'datetime',
            'next_follow_up_at' => 'datetime',
        ];
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    public function serviceBudget(): BelongsTo
    {
        return $this->belongsTo(ServiceBudget::class);
    }

    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function activities(): HasMany
    {
        return $this->hasMany(LeadActivity::class)->latest('id');
    }

    public function getStatusLabelAttribute(): string
    {
        return $this->status->label();
    }

    public function getStatusLabelArAttribute(): string
    {
        return $this->status->labelAr();
    }

    public function getStatusColorAttribute(): string
    {
        return $this->status->colorClass();
    }

    public function getPriorityLabelAttribute(): string
    {
        return $this->priority->label();
    }

    public function getPriorityLabelArAttribute(): string
    {
        return $this->priority->labelAr();
    }

    public function getPriorityColorAttribute(): string
    {
        return $this->priority->colorClass();
    }

    /**
     * Normalized acquisition channel key:
     * 1. meta (Facebook, Messenger, Instagram)
     * 2. tiktok
     * 3. snapchat (snapshot)
     * 4. linkedin
     * 5. google (Google Ads)
     */
    public function getChannelAttribute(): string
    {
        $source = strtolower((string) ($this->utm_source ?: ''));
        $ref = strtolower((string) ($this->referrer ?: ''));
        $leadSource = strtolower((string) ($this->source ?: ''));

        // 1. High Priority: Explicit UTM Source
        if (! empty($source)) {
            if (
                str_contains($source, 'meta') ||
                str_contains($source, 'facebook') ||
                str_contains($source, 'instagram') ||
                str_contains($source, 'messenger') ||
                str_contains($source, 'fb') ||
                str_contains($source, 'ig')
            ) {
                return 'meta';
            }

            if (str_contains($source, 'tiktok') || str_contains($source, 'tt')) {
                return 'tiktok';
            }

            if (str_contains($source, 'snapchat') || str_contains($source, 'snapshot') || str_contains($source, 'snap')) {
                return 'snapchat';
            }

            if (str_contains($source, 'linkedin') || str_contains($source, 'lnkd')) {
                return 'linkedin';
            }

            if (str_contains($source, 'google') || str_contains($source, 'adwords') || str_contains($source, 'gads')) {
                return 'google';
            }

            if (str_contains($source, 'whatsapp')) {
                return 'whatsapp';
            }
        }

        // 2. Medium Priority: HTTP Referer Fallback
        if (! empty($ref)) {
            if (
                str_contains($ref, 'facebook.com') ||
                str_contains($ref, 'instagram.com') ||
                str_contains($ref, 'messenger.com') ||
                str_contains($ref, 'meta.com')
            ) {
                return 'meta';
            }

            if (str_contains($ref, 'tiktok.com')) {
                return 'tiktok';
            }

            if (str_contains($ref, 'snapchat.com')) {
                return 'snapchat';
            }

            if (str_contains($ref, 'linkedin.com') || str_contains($ref, 'lnkd.in')) {
                return 'linkedin';
            }

            if (str_contains($ref, 'google.')) {
                return 'google';
            }
        }

        // 3. Fallback: Lead Source / Offline Entry
        if (in_array($leadSource, ['meta', 'facebook', 'instagram', 'messenger'], true)) {
            return 'meta';
        }

        if ($leadSource === 'tiktok') {
            return 'tiktok';
        }

        if (in_array($leadSource, ['snapchat', 'snapshot'], true)) {
            return 'snapchat';
        }

        if ($leadSource === 'linkedin') {
            return 'linkedin';
        }

        if (in_array($leadSource, ['google', 'google_ads'], true)) {
            return 'google';
        }

        if ($leadSource === 'whatsapp_direct' || str_contains($leadSource, 'whatsapp')) {
            return 'whatsapp';
        }

        if ($leadSource === 'direct_call' || $leadSource === 'call') {
            return 'call';
        }

        if ($leadSource === 'walk_in') {
            return 'walk_in';
        }

        if ($leadSource === 'referral') {
            return 'referral';
        }

        return $source ?: ($leadSource ?: 'website');
    }

    public function getChannelLabelAttribute(): string
    {
        $raw = strtolower((string) ($this->utm_source ?: $this->source ?: $this->referrer ?: ''));

        return match ($this->channel) {
            'meta' => match (true) {
                str_contains($raw, 'instagram') || str_contains($raw, 'ig') => 'Meta · Instagram',
                str_contains($raw, 'messenger') => 'Meta · Messenger',
                str_contains($raw, 'facebook') || str_contains($raw, 'fb') => 'Meta · Facebook',
                default => 'Meta (Facebook, Instagram, Messenger)',
            },
            'tiktok' => 'TikTok Ads / Content',
            'snapchat' => 'Snapchat Ads',
            'linkedin' => 'LinkedIn Ads',
            'google' => 'Google Ads / Search',
            'whatsapp' => 'WhatsApp Direct',
            'call' => 'Direct Phone Call',
            'walk_in' => 'Office Walk-In',
            'referral' => 'Client Referral',
            default => 'Website / Organic',
        };
    }

    public function getChannelLabelArAttribute(): string
    {
        $raw = strtolower((string) ($this->utm_source ?: $this->source ?: $this->referrer ?: ''));

        return match ($this->channel) {
            'meta' => match (true) {
                str_contains($raw, 'instagram') || str_contains($raw, 'ig') => 'ميتا · انستغرام',
                str_contains($raw, 'messenger') => 'ميتا · ماسنجر',
                str_contains($raw, 'facebook') || str_contains($raw, 'fb') => 'ميتا · فيسبوك',
                default => 'ميتا (فيسبوك، انستغرام، ماسنجر)',
            },
            'tiktok' => 'تيك توك',
            'snapchat' => 'سناب شات',
            'linkedin' => 'لينكد إن',
            'google' => 'إعلانات جوجل',
            'whatsapp' => 'واتساب مباشر',
            'call' => 'اتصال هاتفي مباشر',
            'walk_in' => 'زيارة للمقر',
            'referral' => 'توصية / ترشيح عميل',
            default => 'الموقع الإلكتروني / مباشر',
        };
    }

    /**
     * Clean phone digits and generate WhatsApp chat direct link.
     */
    public function getWhatsappUrlAttribute(): string
    {
        $raw = (string) $this->phone;
        $digits = preg_replace('/\D/', '', $raw);

        // Normalize leading 0 for Egyptian numbers (+20)
        if (str_starts_with($digits, '0')) {
            $digits = '20'.substr($digits, 1);
        }

        $greeting = urlencode("Hello {$this->name}, this is Ofoq Technology following up regarding your project request.");

        return "https://wa.me/{$digits}?text={$greeting}";
    }

    /**
     * Helper to log an activity on this lead.
     */
    public function logActivity(string $type, string $content, ?int $userId = null): LeadActivity
    {
        return $this->activities()->create([
            'user_id' => $userId ?? auth()->id(),
            'type' => $type,
            'content' => $content,
        ]);
    }
}
