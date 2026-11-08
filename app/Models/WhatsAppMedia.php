<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;

/**
 * @property int $id
 * @property int $message_id
 * @property string|null $meta_media_id
 * @property string $disk
 * @property string $file_path
 * @property string $file_name
 * @property string $mime_type
 * @property int|null $file_size
 * @property string|null $sha256
 * @property string|null $caption
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read WhatsAppMessage $message
 * @property-read string $url
 */
#[Fillable([
    'message_id',
    'meta_media_id',
    'disk',
    'file_path',
    'file_name',
    'mime_type',
    'file_size',
    'sha256',
    'caption',
])]
class WhatsAppMedia extends Model
{
    use HasFactory;

    protected $table = 'whatsapp_media';

    protected $appends = ['url'];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'file_size' => 'integer',
        ];
    }

    public function message(): BelongsTo
    {
        return $this->belongsTo(WhatsAppMessage::class, 'message_id');
    }

    public function getUrlAttribute(): string
    {
        if (str_starts_with($this->file_path, 'http://') || str_starts_with($this->file_path, 'https://')) {
            return $this->file_path;
        }

        return Storage::disk($this->disk)->url($this->file_path);
    }
}
