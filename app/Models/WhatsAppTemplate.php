<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int|null $account_id
 * @property string $name
 * @property string $language
 * @property string $category
 * @property string $status
 * @property string $header_type
 * @property string|null $header_text
 * @property string $body_text
 * @property string|null $footer_text
 * @property array<mixed>|null $buttons
 * @property array<mixed>|null $example_parameters
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read WhatsAppAccount|null $account
 */
#[Fillable([
    'account_id',
    'name',
    'language',
    'category',
    'status',
    'header_type',
    'header_text',
    'body_text',
    'footer_text',
    'buttons',
    'example_parameters',
])]
class WhatsAppTemplate extends Model
{
    use HasFactory;

    protected $table = 'whatsapp_message_templates';

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'buttons' => 'array',
            'example_parameters' => 'array',
        ];
    }

    public function account(): BelongsTo
    {
        return $this->belongsTo(WhatsAppAccount::class, 'account_id');
    }

    public function isApproved(): bool
    {
        return strtoupper($this->status) === 'APPROVED';
    }
}
