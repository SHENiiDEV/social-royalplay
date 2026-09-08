<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Jackpot extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'current_pool',
        'base_pool',
        'cut_percentage',
        'last_winner_user_id',
        'last_winner_name',
        'last_win_amount',
        'last_won_at',
    ];

    protected $casts = [
        'current_pool' => 'decimal:2',
        'base_pool' => 'decimal:2',
        'cut_percentage' => 'decimal:4',
        'last_win_amount' => 'decimal:2',
        'last_won_at' => 'datetime',
    ];

    public function lastWinner()
    {
        return $this->belongsTo(User::class, 'last_winner_user_id');
    }
}
