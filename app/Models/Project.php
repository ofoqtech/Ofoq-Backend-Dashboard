<?php

namespace App\Models;

use Database\Factories\ProjectFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

/**
 * @property int $id
 * @property string $slug
 * @property string $category
 * @property array{ar?: string, en?: string}|null $category_label
 * @property array{ar: string, en?: string} $title
 * @property array{ar?: string, en?: string}|null $tagline
 * @property array{ar?: string, en?: string}|null $description
 * @property array{ar?: string, en?: string}|null $problem
 * @property array{ar?: string, en?: string}|null $solution
 * @property string|null $image
 * @property array<string>|null $gallery
 * @property array<string>|null $technologies
 * @property array{ar?: array<array{label: string, val: string}>, en?: array<array{label: string, val: string}>}|null $metrics
 * @property array{ar?: array<string>, en?: array<string>}|null $features
 * @property string|null $client
 * @property string|null $live_url
 * @property bool $is_featured
 * @property int $order
 * @property int|null $created_by
 * @property int|null $updated_by
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read User|null $creator
 * @property-read User|null $updater
 * @property-read Collection<int, ProjectImage> $images
 * @property-read Collection<int, ProjectImage> $images
 */
#[Fillable([
    'slug',
    'category',
    'category_label',
    'title',
    'tagline',
    'description',
    'problem',
    'solution',
    'image',
    'gallery',
    'technologies',
    'metrics',
    'features',
    'client',
    'live_url',
    'is_featured',
    'order',
    'created_by',
    'updated_by',
])]
class Project extends Model
{
    /** @use HasFactory<ProjectFactory> */
    use HasFactory;

    /**
     * The accessors to append to the model's array form.
     *
     * @var list<string>
     */
    protected $appends = [
        'title_ar',
        'title_en',
        'category_label_ar',
        'category_label_en',
        'tagline_ar',
        'tagline_en',
        'description_ar',
        'description_en',
        'problem_ar',
        'problem_en',
        'solution_ar',
        'solution_en',
        'features_ar',
        'features_en',
        'metrics_ar',
        'metrics_en',
    ];

    /**
     * Get the route key for the model.
     */
    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'title' => 'array',
            'category_label' => 'array',
            'tagline' => 'array',
            'description' => 'array',
            'problem' => 'array',
            'solution' => 'array',
            'features' => 'array',
            'metrics' => 'array',
            'gallery' => 'array',
            'technologies' => 'array',
            'is_featured' => 'boolean',
            'order' => 'integer',
        ];
    }

    /**
     * Helper to get localized attribute value.
     */
    public function localized(string $field, ?string $locale = null): mixed
    {
        $locale = $locale ?? app()->getLocale();
        $val = $this->{$field};

        if (is_array($val)) {
            return $val[$locale] ?? $val['en'] ?? $val['ar'] ?? null;
        }

        return $val;
    }

    public function getTitleArAttribute(): ?string
    {
        return is_array($this->title) ? ($this->title['ar'] ?? null) : (is_string($this->title) ? $this->title : null);
    }

    public function getTitleEnAttribute(): ?string
    {
        return is_array($this->title) ? ($this->title['en'] ?? null) : null;
    }

    public function getCategoryLabelArAttribute(): ?string
    {
        return is_array($this->category_label) ? ($this->category_label['ar'] ?? null) : null;
    }

    public function getCategoryLabelEnAttribute(): ?string
    {
        return is_array($this->category_label) ? ($this->category_label['en'] ?? null) : (is_string($this->category_label) ? $this->category_label : null);
    }

    public function getTaglineArAttribute(): ?string
    {
        return is_array($this->tagline) ? ($this->tagline['ar'] ?? null) : null;
    }

    public function getTaglineEnAttribute(): ?string
    {
        return is_array($this->tagline) ? ($this->tagline['en'] ?? null) : (is_string($this->tagline) ? $this->tagline : null);
    }

    public function getDescriptionArAttribute(): ?string
    {
        return is_array($this->description) ? ($this->description['ar'] ?? null) : null;
    }

    public function getDescriptionEnAttribute(): ?string
    {
        return is_array($this->description) ? ($this->description['en'] ?? null) : (is_string($this->description) ? $this->description : null);
    }

    public function getProblemArAttribute(): ?string
    {
        return is_array($this->problem) ? ($this->problem['ar'] ?? null) : null;
    }

    public function getProblemEnAttribute(): ?string
    {
        return is_array($this->problem) ? ($this->problem['en'] ?? null) : (is_string($this->problem) ? $this->problem : null);
    }

    public function getSolutionArAttribute(): ?string
    {
        return is_array($this->solution) ? ($this->solution['ar'] ?? null) : null;
    }

    public function getSolutionEnAttribute(): ?string
    {
        return is_array($this->solution) ? ($this->solution['en'] ?? null) : (is_string($this->solution) ? $this->solution : null);
    }

    public function getFeaturesArAttribute(): array
    {
        return is_array($this->features) ? ($this->features['ar'] ?? []) : [];
    }

    public function getFeaturesEnAttribute(): array
    {
        return is_array($this->features) ? ($this->features['en'] ?? []) : [];
    }

    public function getMetricsArAttribute(): array
    {
        return is_array($this->metrics) ? ($this->metrics['ar'] ?? []) : [];
    }

    public function getMetricsEnAttribute(): array
    {
        return is_array($this->metrics) ? ($this->metrics['en'] ?? []) : [];
    }

    /**
     * Encode the given value as JSON with unescaped unicode and slashes.
     *
     * @param  mixed  $value
     * @param  int  $flags
     * @return string|false
     */
    protected function asJson($value, $flags = 0)
    {
        return json_encode($value, $flags | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }

    /**
     * Get the ordered gallery images for the project.
     *
     * @return HasMany<ProjectImage, $this>
     */
    public function images(): HasMany
    {
        return $this->hasMany(ProjectImage::class)->orderBy('display_order', 'asc')->orderBy('id', 'asc');
    }

    /**
     * Get the user who created the project.
     *
     * @return BelongsTo<User, $this>
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the user who last updated the project.
     *
     * @return BelongsTo<User, $this>
     */
    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Ensure slug is always URL-safe if not explicitly provided.
     */
    public static function generateUniqueSlug(string $title, ?int $ignoreId = null): string
    {
        $base = Str::slug($title);
        if ($base === '') {
            $base = 'project-'.Str::random(6);
        }

        $slug = $base;
        $counter = 1;

        while (static::query()
            ->where('slug', $slug)
            ->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))
            ->exists()) {
            $slug = "{$base}-{$counter}";
            $counter++;
        }

        return $slug;
    }
}
