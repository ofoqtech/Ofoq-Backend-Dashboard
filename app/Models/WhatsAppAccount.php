<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $name
 * @property string|null $phone_number_id
 * @property string|null $business_account_id
 * @property string|null $display_phone_number
 * @property string|null $access_token
 * @property string|null $app_secret
 * @property string|null $webhook_verify_token
 * @property string $graph_version
 * @property bool $is_active
 * @property bool $is_default
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'name',
    'phone_number_id',
    'business_account_id',
    'display_phone_number',
    'access_token',
    'app_secret',
    'webhook_verify_token',
    'graph_version',
    'is_active',
    'is_default',
])]
class WhatsAppAccount extends Model
{
    use HasFactory;

    protected $table = 'whatsapp_accounts';

    /**
     * @var list<string>
     */
    protected $hidden = [
        'access_token',
        'app_secret',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'is_default' => 'boolean',
            'access_token' => 'encrypted',
            'app_secret' => 'encrypted',
        ];
    }

    public function conversations(): HasMany
    {
        return $this->hasMany(WhatsAppConversation::class, 'account_id');
    }

    public function templates(): HasMany
    {
        return $this->hasMany(WhatsAppTemplate::class, 'account_id');
    }

    public static function getDefault(): ?self
    {
        return static::where('is_active', true)
            ->where('is_default', true)
            ->first() ?? static::where('is_active', true)->first();
    }
}
