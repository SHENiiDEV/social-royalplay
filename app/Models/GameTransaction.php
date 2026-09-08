<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GameTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'user_code',
        'agent_code',
        'provider_code',
        'game_code',
        'txn_id',
        'txn_id_v2',
        'round_id',
        'txn_type',
        'bet_money',
        'win_money',
        'net_money',
        'user_balance_before',
        'user_balance_after',
        'is_jackpot_win',
        'raw_payload',
    ];

    protected $casts = [
        'bet_money' => 'decimal:2',
        'win_money' => 'decimal:2',
        'net_money' => 'decimal:2',
        'user_balance_before' => 'decimal:2',
        'user_balance_after' => 'decimal:2',
        'is_jackpot_win' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function game()
    {
        return $this->belongsTo(Game::class, 'game_code', 'game_code');
    }
}
