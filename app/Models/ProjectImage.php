<?php

namespace App\Models;

use Database\Factories\ProjectImageFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $project_id
 * @property string $path
 * @property array{ar?: string, en?: string}|null $caption
 * @property int $display_order
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read string $url
 * @property-read string|null $caption_ar
 * @property-read string|null $caption_en
 * @property-read Project $project
 */
#[Fillable([
    'project_id',
    'path',
    'caption',
    'display_order',
])]
class ProjectImage extends Model
{
    /** @use HasFactory<ProjectImageFactory> */
    use HasFactory;

    /**
     * The accessors to append to the model's array form.
     *
     * @var list<string>
     */
    protected $appends = [
        'url',
        'caption_ar',
        'caption_en',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'caption' => 'array',
            'display_order' => 'integer',
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
     * Get the parent project.
     *
     * @return BelongsTo<Project, $this>
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * Get public URL for the image.
     */
    public function getUrlAttribute(): string
    {
        return $this->path;
    }

    public function getCaptionArAttribute(): ?string
    {
        return is_array($this->caption) ? ($this->caption['ar'] ?? null) : null;
    }

    public function getCaptionEnAttribute(): ?string
    {
        return is_array($this->caption) ? ($this->caption['en'] ?? null) : null;
    }
}
