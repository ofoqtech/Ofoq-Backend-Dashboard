<?php

namespace App\Models;

use App\Enums\Role;
use Database\Factories\UserFactory;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;
use Laravel\Fortify\Contracts\PasskeyUser;
use Laravel\Fortify\PasskeyAuthenticatable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Laravel\Sanctum\HasApiTokens;

/**
 * @property int $id
 * @property string $name
 * @property string $email
 * @property Role $role
 * @property array{ar?: string, en?: string}|string|null $title
 * @property string|null $phone
 * @property string $status
 * @property string|null $avatar
 * @property Carbon|null $email_verified_at
 * @property string $password
 * @property string|null $two_factor_secret
 * @property string|null $two_factor_recovery_codes
 * @property Carbon|null $two_factor_confirmed_at
 * @property string|null $remember_token
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['name', 'email', 'password', 'role', 'title', 'phone', 'status', 'avatar'])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token'])]
class User extends Authenticatable implements MustVerifyEmail, PasskeyUser
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable, PasskeyAuthenticatable, TwoFactorAuthenticatable;

    /**
     * The accessors to append to the model's array form.
     *
     * @var list<string>
     */
    protected $appends = [
        'role_label',
        'display_title',
        'title_en',
        'title_ar',
        'is_admin',
        'is_employee',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'role' => Role::class,
            'title' => 'array',
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
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

    public function isAdmin(): bool
    {
        return $this->role === Role::Admin;
    }

    public function isEmployee(): bool
    {
        return $this->role === Role::Employee;
    }

    public function getRoleLabelAttribute(): string
    {
        return $this->role->label();
    }

    public function getIsAdminAttribute(): bool
    {
        return $this->isAdmin();
    }

    public function getIsEmployeeAttribute(): bool
    {
        return $this->isEmployee();
    }

    public function getTitleEnAttribute(): ?string
    {
        return is_array($this->title) ? ($this->title['en'] ?? null) : (is_string($this->title) ? $this->title : null);
    }

    public function getTitleArAttribute(): ?string
    {
        return is_array($this->title) ? ($this->title['ar'] ?? null) : null;
    }

    public function getDisplayTitleAttribute(): string
    {
        if (is_array($this->title)) {
            return $this->title['en'] ?? $this->title['ar'] ?? '';
        }

        return (string) ($this->title ?? '');
    }

    public function getAvatarAttribute(?string $value): ?string
    {
        if (! $value) {
            return null;
        }

        if (str_starts_with($value, '/storage/')) {
            return $value;
        }

        if (preg_match('#^https?://[^/]+(/storage/.+)$#i', $value, $matches)) {
            return $matches[1];
        }

        if (str_starts_with($value, 'http://') || str_starts_with($value, 'https://')) {
            return $value;
        }

        return Storage::url($value);
    }

    public function deleteAvatarFile(): void
    {
        $rawAvatar = $this->getRawOriginal('avatar');
        if ($rawAvatar) {
            $relativePath = str_starts_with($rawAvatar, '/storage/')
                ? substr($rawAvatar, 9)
                : $rawAvatar;

            Storage::disk('public')->delete($relativePath);
        }
    }
}
