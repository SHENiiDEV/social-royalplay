<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Game extends Model
{
    use HasFactory;

    protected $fillable = [
        'provider_game_id',
        'provider_code',
        'game_code',
        'name',
        'title',
        'slug',
        'cover_image',
        'banner',
        'category',
        'game_type',
        'is_featured',
        'is_recommended',
        'is_active',
        'rtp_display',
        'volatility',
        'min_bet',
        'max_bet',
        'max_multiplier',
        'play_count',
        'sort_order',
        'tags',
    ];

    protected $casts = [
        'is_featured' => 'boolean',
        'is_recommended' => 'boolean',
        'is_active' => 'boolean',
        'min_bet' => 'decimal:2',
        'max_bet' => 'decimal:2',
        'max_multiplier' => 'integer',
        'play_count' => 'integer',
        'sort_order' => 'integer',
        'tags' => 'array',
    ];

    public function setTitleAttribute($value): void
    {
        $this->attributes['title'] = $value;
        if (empty($this->attributes['name'])) {
            $this->attributes['name'] = $value;
        }
    }

    public function setNameAttribute($value): void
    {
        $this->attributes['name'] = $value;
        if (empty($this->attributes['title'])) {
            $this->attributes['title'] = $value;
        }
    }

    public function setIsRecommendedAttribute($value): void
    {
        $this->attributes['is_recommended'] = (bool) $value;
        $this->attributes['is_featured'] = (bool) $value;
    }

    public function setIsFeaturedAttribute($value): void
    {
        $this->attributes['is_featured'] = (bool) $value;
        $this->attributes['is_recommended'] = (bool) $value;
    }

    public function transactions()
    {
        return $this->hasMany(GameTransaction::class, 'game_code', 'game_code');
    }
}
