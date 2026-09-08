<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'surname',
        'email',
        'phone',
        'date_of_birth',
        'address_line',
        'street_address',
        'city',
        'country',
        'postal_code',
        'terms_accepted_at',
        'password',
        'user_code',
        'game_balance',
        'rtp',
        'avatar',
        'vip_level',
        'vip_points',
        'is_admin',
        'is_banned',
        'ban_reason',
        'ban_first_name',
        'ban_last_name',
        'ban_case_number',
        'banned_at',
        'last_daily_bonus_at',
        'last_wheel_spin_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'date_of_birth' => 'date',
            'terms_accepted_at' => 'datetime',
            'password' => 'hashed',
            'game_balance' => 'decimal:2',
            'rtp' => 'integer',
            'vip_level' => 'integer',
            'vip_points' => 'integer',
            'is_admin' => 'boolean',
            'is_banned' => 'boolean',
            'banned_at' => 'datetime',
            'last_daily_bonus_at' => 'datetime',
            'last_wheel_spin_at' => 'datetime',
        ];
    }

    /**
     * Generate a unique randomized user code (e.g. RP_7F93A0B)
     */
    public static function generateUniqueUserCode(string $prefix = 'RP'): string
    {
        do {
            $code = $prefix.'_'.strtoupper(substr(bin2hex(random_bytes(4)), 0, 7));
        } while (self::where('user_code', $code)->exists());

        return $code;
    }

    public function transactions()
    {
        return $this->hasMany(GameTransaction::class);
    }

    public function bonusClaims()
    {
        return $this->hasMany(BonusClaim::class);
    }

    public function canClaimDailyBonus(): bool
    {
        if (! $this->last_daily_bonus_at) {
            return true;
        }

        return $this->last_daily_bonus_at->addHours(24)->isPast();
    }

    public function dailyBonusSecondsRemaining(): int
    {
        if (! $this->last_daily_bonus_at) {
            return 0;
        }
        $availableAt = $this->last_daily_bonus_at->copy()->addHours(24);
        if ($availableAt->isPast()) {
            return 0;
        }

        return (int) now()->diffInSeconds($availableAt, false);
    }

    public function canSpinWheel(): bool
    {
        if (! $this->last_wheel_spin_at) {
            return true;
        }

        return $this->last_wheel_spin_at->addHours(24)->isPast();
    }

    public function wheelSpinSecondsRemaining(): int
    {
        if (! $this->last_wheel_spin_at) {
            return 0;
        }
        $availableAt = $this->last_wheel_spin_at->copy()->addHours(24);
        if ($availableAt->isPast()) {
            return 0;
        }

        return (int) now()->diffInSeconds($availableAt, false);
    }

    public function getBanFullName(): string
    {
        if ($this->ban_first_name || $this->ban_last_name) {
            return trim(($this->ban_first_name ?? '').' '.($this->ban_last_name ?? ''));
        }

        return $this->name;
    }

    public function getEffectiveCaseNumber(): string
    {
        if ($this->ban_case_number) {
            return $this->ban_case_number;
        }

        return 'CAS-'.str_pad((string) ($this->id * 94127 + 104829), 8, '0', STR_PAD_LEFT);
    }

    public function setStreetAddressAttribute($value): void
    {
        $this->attributes['address_line'] = $value;
    }

    public function getStreetAddressAttribute(): ?string
    {
        return $this->attributes['address_line'] ?? null;
    }
}
