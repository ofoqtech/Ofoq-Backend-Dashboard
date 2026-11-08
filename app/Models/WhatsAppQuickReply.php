<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $shortcut
 * @property string $title
 * @property string $content
 * @property string|null $category
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'shortcut',
    'title',
    'content',
    'category',
])]
class WhatsAppQuickReply extends Model
{
    use HasFactory;

    protected $table = 'whatsapp_quick_replies';
}
