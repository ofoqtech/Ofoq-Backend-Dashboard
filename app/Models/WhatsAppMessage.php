<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $conversation_id
 * @property int $contact_id
 * @property int|null $user_id
 * @property string|null $whatsapp_message_id
 * @property string $direction
 * @property string $type
 * @property string|null $body
 * @property string $status
 * @property string|null $error_code
 * @property string|null $error_message
 * @property array<string, mixed>|null $metadata
 * @property Carbon|null $sent_at
 * @property Carbon|null $delivered_at
 * @property Carbon|null $read_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read WhatsAppConversation $conversation
 * @property-read WhatsAppContact $contact
 * @property-read User|null $sender
 * @property-read WhatsAppMedia|null $media
 */
#[Fillable([
    'conversation_id',
    'contact_id',
    'user_id',
    'whatsapp_message_id',
    'direction',
    'type',
    'body',
    'status',
    'error_code',
    'error_message',
    'metadata',
    'sent_at',
    'delivered_at',
    'read_at',
])]
class WhatsAppMessage extends Model
{
    use HasFactory;

    protected $table = 'whatsapp_messages';

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'metadata' => 'array',
            'sent_at' => 'datetime',
            'delivered_at' => 'datetime',
            'read_at' => 'datetime',
        ];
    }

    public function conversation(): BelongsTo
    {
        return $this->belongsTo(WhatsAppConversation::class, 'conversation_id');
    }

    public function contact(): BelongsTo
    {
        return $this->belongsTo(WhatsAppContact::class, 'contact_id');
    }

    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function media(): HasOne
    {
        return $this->hasOne(WhatsAppMedia::class, 'message_id');
    }

    public function mediaList(): HasMany
    {
        return $this->hasMany(WhatsAppMedia::class, 'message_id');
    }

    public function isIncoming(): bool
    {
        return $this->direction === 'incoming';
    }

    public function isOutgoing(): bool
    {
        return $this->direction === 'outgoing';
    }
}
