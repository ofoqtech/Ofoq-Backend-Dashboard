<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $slug
 * @property array{ar: string, en?: string} $name
 * @property array{ar?: string, en?: string}|null $description
 * @property string|null $icon
 * @property int $order
 * @property bool $is_active
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'slug',
    'name',
    'description',
    'icon',
    'order',
    'is_active',
])]
class Service extends Model
{
    use HasFactory;

    /**
     * The accessors to append to the model's array form.
     *
     * @var list<string>
     */
    protected $appends = [
        'name_en',
        'name_ar',
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
            'name' => 'array',
            'description' => 'array',
            'order' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    protected function asJson($value, $flags = 0)
    {
        return json_encode($value, $flags | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }

    public function budgets(): HasMany
    {
        return $this->hasMany(ServiceBudget::class)->orderBy('order', 'asc');
    }

    public function leads(): HasMany
    {
        return $this->hasMany(Lead::class);
    }

    public function getNameEnAttribute(): ?string
    {
        return is_array($this->name) ? ($this->name['en'] ?? null) : (is_string($this->name) ? $this->name : null);
    }

    public function getNameArAttribute(): ?string
    {
        return is_array($this->name) ? ($this->name['ar'] ?? null) : null;
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
     * Format for ofoq-frontend ContactFormSection API consumption.
     */
    public function toFrontendApiFormat(string $locale = 'en'): array
    {
        $localizedName = is_array($this->name)
            ? ($this->name[$locale] ?? $this->name['en'] ?? $this->name['ar'] ?? '')
            : (string) $this->name;

        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'name' => $localizedName,
            'name_en' => $this->name_en,
            'name_ar' => $this->name_ar,
            'budget_options' => $this->budgets->map(fn (ServiceBudget $b) => $b->toFrontendApiFormat($locale))->toArray(),
        ];
    }
}

