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
 * @property int|null $account_id
 * @property int $contact_id
 * @property int|null $lead_id
 * @property int|null $assigned_to
 * @property string $status
 * @property int $unread_count
 * @property Carbon|null $last_message_at
 * @property string|null $last_message_preview
 * @property string|null $last_message_direction
 * @property bool $is_pinned
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read WhatsAppAccount|null $account
 * @property-read WhatsAppContact $contact
 * @property-read Lead|null $lead
 * @property-read User|null $assignee
 */
#[Fillable([
    'account_id',
    'contact_id',
    'lead_id',
    'assigned_to',
    'status',
    'unread_count',
    'last_message_at',
    'last_message_preview',
    'last_message_direction',
    'is_pinned',
])]
class WhatsAppConversation extends Model
{
    use HasFactory;

    protected $table = 'whatsapp_conversations';

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'unread_count' => 'integer',
            'is_pinned' => 'boolean',
            'last_message_at' => 'datetime',
        ];
    }

    public function account(): BelongsTo
    {
        return $this->belongsTo(WhatsAppAccount::class, 'account_id');
    }

    public function contact(): BelongsTo
    {
        return $this->belongsTo(WhatsAppContact::class, 'contact_id');
    }

    public function lead(): BelongsTo
    {
        return $this->belongsTo(Lead::class, 'lead_id');
    }

    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function messages(): HasMany
    {
        return $this->hasMany(WhatsAppMessage::class, 'conversation_id')->oldest('id');
    }

    public function latestMessage(): HasOne
    {
        return $this->hasOne(WhatsAppMessage::class, 'conversation_id')->latestOfMany();
    }

    public function markAsRead(): void
    {
        $this->update(['unread_count' => 0]);
        $this->messages()
            ->where('direction', 'incoming')
            ->where('status', '!=', 'read')
            ->update([
                'status' => 'read',
                'read_at' => now(),
            ]);
    }
}
