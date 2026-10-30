<?php

namespace App\Models;

use Database\Factories\CategoryFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

/**
 * @property int $id
 * @property string $slug
 * @property array{ar: string, en?: string} $name
 * @property array{ar?: string, en?: string}|null $description
 * @property int $order
 * @property bool $is_active
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'slug',
    'name',
    'description',
    'order',
    'is_active',
])]
class Category extends Model
{
    /** @use HasFactory<CategoryFactory> */
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
        'projects_count',
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
     * Projects belonging to this category via the category slug.
     *
     * @return HasMany<Project, $this>
     */
    public function projects(): HasMany
    {
        return $this->hasMany(Project::class, 'category', 'slug');
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

    public function getProjectsCountAttribute(): int
    {
        if ($this->relationLoaded('projects')) {
            return $this->projects->count();
        }

        return $this->attributes['projects_count'] ?? $this->projects()->count();
    }

    /**
     * Generate unique slug from category title.
     */
    public static function generateUniqueSlug(string $name, ?int $ignoreId = null): string
    {
        $base = Str::slug($name);
        if ($base === '') {
            $base = 'category-'.Str::random(6);
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
