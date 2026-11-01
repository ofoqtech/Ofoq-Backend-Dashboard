<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $service_id
 * @property string $tier_key
 * @property array{ar: string, en?: string} $type
 * @property string $range
 * @property array{ar?: string, en?: string}|null $description
 * @property int $order
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Service $service
 */
#[Fillable([
    'service_id',
    'tier_key',
    'type',
    'range',
    'description',
    'order',
])]
class ServiceBudget extends Model
{
    use HasFactory;

    /**
     * The accessors to append to the model's array form.
     *
     * @var list<string>
     */
    protected $appends = [
        'type_en',
        'type_ar',
        'description_en',
        'description_ar',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'type' => 'array',
            'description' => 'array',
            'order' => 'integer',
        ];
    }

    protected function asJson($value, $flags = 0)
    {
        return json_encode($value, $flags | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    public function getTypeEnAttribute(): ?string
    {
        return is_array($this->type) ? ($this->type['en'] ?? null) : (is_string($this->type) ? $this->type : null);
    }

    public function getTypeArAttribute(): ?string
    {
        return is_array($this->type) ? ($this->type['ar'] ?? null) : null;
    }

    public function getDescriptionEnAttribute(): ?string
    {
        return is_array($this->description) ? ($this->description['en'] ?? null) : (is_string($this->description) ? $this->description : null);
    }

    public function getDescriptionArAttribute(): ?string
    {
        return is_array($this->description) ? ($this->description['ar'] ?? null) : null;
    }

    /**
     * Shape expected by ofoq-frontend ContactFormSection.jsx
     * Needs: b.id, b.tier.type, b.tier.range, b.description
     */
    public function toFrontendApiFormat(string $locale = 'en'): array
    {
        $localizedType = is_array($this->type)
            ? ($this->type[$locale] ?? $this->type['en'] ?? $this->type['ar'] ?? '')
            : (string) $this->type;

        $localizedDesc = is_array($this->description)
            ? ($this->description[$locale] ?? $this->description['en'] ?? $this->description['ar'] ?? '')
            : (string) ($this->description ?? '');

        return [
            'id' => $this->id,
            'tier_key' => $this->tier_key,
            'tier' => [
                'type' => $localizedType,
                'range' => $this->range,
            ],
            'description' => $localizedDesc,
            'range' => $this->range,
        ];
    }
}
