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
