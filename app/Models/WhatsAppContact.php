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
 * @property int|null $lead_id
 * @property string $wa_id
 * @property string|null $profile_name
 * @property string|null $phone_number
 * @property string|null $avatar_url
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Lead|null $lead
 * @property-read WhatsAppConversation|null $conversation
 */
#[Fillable([
    'lead_id',
    'wa_id',
    'profile_name',
    'phone_number',
    'avatar_url',
])]
class WhatsAppContact extends Model
{
    use HasFactory;

    protected $table = 'whatsapp_contacts';

    public function lead(): BelongsTo
    {
        return $this->belongsTo(Lead::class);
    }

    public function conversations(): HasMany
    {
        return $this->hasMany(WhatsAppConversation::class, 'contact_id');
    }

    public function conversation(): HasOne
    {
        return $this->hasOne(WhatsAppConversation::class, 'contact_id')->latestOfMany();
    }

    public function messages(): HasMany
    {
        return $this->hasMany(WhatsAppMessage::class, 'contact_id');
    }

    /**
     * Clean and normalize any phone string to digits only (E.164 without leading plus).
     */
    public static function normalizePhoneNumber(string $phone): string
    {
        $digits = preg_replace('/\D/', '', $phone) ?? '';

        // Handle Egyptian local numbers starting with 01
        if (str_starts_with($digits, '01')) {
            $digits = '20'.substr($digits, 1);
        }

        // Handle leading 00 (e.g. 00201...)
        if (str_starts_with($digits, '00')) {
            $digits = substr($digits, 2);
        }

        return $digits;
    }
}
