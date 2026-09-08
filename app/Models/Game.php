<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Game extends Model
{
    use HasFactory;

    protected $fillable = [
        'provider_code',
        'game_code',
        'name',
        'slug',
        'cover_image',
        'category',
        'is_featured',
        'is_active',
        'rtp_display',
        'volatility',
        'min_bet',
        'max_bet',
        'max_multiplier',
        'play_count',
        'tags',
    ];

    protected $casts = [
        'is_featured' => 'boolean',
        'is_active' => 'boolean',
        'min_bet' => 'decimal:2',
        'max_bet' => 'decimal:2',
        'max_multiplier' => 'integer',
        'play_count' => 'integer',
        'tags' => 'array',
    ];

    public function transactions()
    {
        return $this->hasMany(GameTransaction::class, 'game_code', 'game_code');
    }
}
