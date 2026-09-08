<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LiveCommunityWin extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_code',
        'player_name',
        'avatar',
        'game_name',
        'game_code',
        'provider_code',
        'cover_image',
        'bet_amount',
        'win_amount',
        'multiplier',
        'tier',
        'is_simulated',
    ];

    protected $casts = [
        'bet_amount' => 'decimal:2',
        'win_amount' => 'decimal:2',
        'multiplier' => 'decimal:2',
        'is_simulated' => 'boolean',
    ];

    public static function determineTier(float $winAmount, float $multiplier): string
    {
        if ($winAmount >= 5000 || $multiplier >= 100) {
            return 'epic';
        }
        if ($winAmount >= 2000 || $multiplier >= 50) {
            return 'mega';
        }
        if ($winAmount >= 500 || $multiplier >= 25) {
            return 'big';
        }
        if ($winAmount >= 50 || $multiplier >= 10) {
            return 'win';
        }

        return 'standard';
    }

    /**
     * Generate a dynamic simulated live winner from real games in the catalog
     */
    public static function generateRealisticWin(): self
    {
        $names = [
            'Alex_K', 'Stefan_99', 'Emma_W', 'Viktor_77', 'Dmitri_V', 'Sophie_L',
            'Marco_R', 'Lucas_M', 'Elena_S', 'Max_Lucky', 'Nikita_D', 'Mateo_X',
            'Chloe_B', 'Oliver_H', 'Anna_P', 'Leo_Gold', 'David_K', 'Sarah_M',
            'Ivan_777', 'Marta_R', 'Felix_W', 'Artem_S', 'Katarina_Z', 'Erik_L',
        ];

        $randomName = $names[array_rand($names)];
        $avatar = 'https://api.dicebear.com/7.x/bottts/svg?seed='.urlencode($randomName);

        // Pick a real slot from games table
        $game = Game::where('is_active', true)->inRandomOrder()->first();
        $gameName = $game ? $game->name : 'Gates of Olympus';
        $gameCode = $game ? $game->game_code : 'vs20olympgate';
        $providerCode = $game ? strtoupper($game->provider_code) : 'PRAGMATIC';
        $coverImage = $game ? $game->cover_image : null;

        $betOptions = [0.20, 0.40, 0.60, 1.00, 2.00, 3.00, 5.00, 10.00, 20.00, 50.00];
        $betAmount = $betOptions[array_rand($betOptions)];

        // Weight multipliers towards exciting wins (12x - 450x, rare 1000x+)
        $roll = rand(1, 100);
        if ($roll <= 60) {
            // Standard nice win (12x - 45x)
            $multiplier = round(rand(120, 450) / 10, 2);
        } elseif ($roll <= 88) {
            // Big win (50x - 180x)
            $multiplier = round(rand(500, 1800) / 10, 2);
        } elseif ($roll <= 97) {
            // Mega win (200x - 600x)
            $multiplier = round(rand(2000, 6000) / 10, 2);
        } else {
            // Epic win (650x - 2500x)
            $multiplier = round(rand(6500, 25000) / 10, 2);
        }

        $winAmount = round($betAmount * $multiplier, 2);
        $tier = self::determineTier($winAmount, $multiplier);

        $win = self::create([
            'user_code' => 'sim_'.strtolower($randomName),
            'player_name' => $randomName,
            'avatar' => $avatar,
            'game_name' => $gameName,
            'game_code' => $gameCode,
            'provider_code' => $providerCode,
            'cover_image' => $coverImage,
            'bet_amount' => $betAmount,
            'win_amount' => $winAmount,
            'multiplier' => $multiplier,
            'tier' => $tier,
            'is_simulated' => true,
        ]);

        // Keep table trim and fast
        if (self::count() > 80) {
            self::orderBy('id', 'asc')->take(10)->delete();
        }

        return $win;
    }
}
