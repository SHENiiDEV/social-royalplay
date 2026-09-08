<?php

namespace App\Http\Controllers;

use App\Mail\DepositSuccessfulMail;
use App\Models\BonusClaim;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class BonusController extends Controller
{
    /**
     * Claim Free Daily 1.00 €
     */
    public function claimDailyBonus(Request $request): JsonResponse
    {
        $user = Auth::user();
        if (! $user) {
            return response()->json(['success' => false, 'message' => 'Please sign in first'], 401);
        }

        if (! $user->canClaimDailyBonus()) {
            $seconds = $user->dailyBonusSecondsRemaining();
            $hours = floor($seconds / 3600);
            $minutes = floor(($seconds % 3600) / 60);

            return response()->json([
                'success' => false,
                'message' => "Daily bonus already claimed. Next claim available in {$hours}h {$minutes}m",
                'seconds_remaining' => $seconds,
            ], 422);
        }

        DB::transaction(function () use ($user) {
            $bonusAmount = 1.00;
            $user->game_balance += $bonusAmount;
            $user->last_daily_bonus_at = now();
            $user->save();

            BonusClaim::create([
                'user_id' => $user->id,
                'type' => 'daily_free',
                'amount' => $bonusAmount,
                'details' => ['pack' => 'pack_free', 'source' => 'store_daily_banner'],
            ]);
        });

        $user->refresh();

        return response()->json([
            'success' => true,
            'message' => '🎉 Free Daily 1.00 SC claimed successfully!',
            'bonus_amount' => 1.00,
            'new_balance' => (float) $user->game_balance,
            'user' => $user,
        ]);
    }

    /**
     * Daily Wheel of Fortune Spin
     * 8 sectors: 1€, 2€, 3€, 4€, 5€, 6€, 8€, 10€
     */
    public function spinWheel(Request $request): JsonResponse
    {
        $user = Auth::user();
        if (! $user) {
            return response()->json(['success' => false, 'message' => 'Please sign in first'], 401);
        }

        if (! $user->canSpinWheel()) {
            $seconds = $user->wheelSpinSecondsRemaining();
            $hours = floor($seconds / 3600);
            $minutes = floor(($seconds % 3600) / 60);

            return response()->json([
                'success' => false,
                'message' => "Wheel cooldown active. Come back in {$hours}h {$minutes}m",
                'seconds_remaining' => $seconds,
            ], 422);
        }

        // Sectors definitions (Index 0 to 7)
        $sectors = [
            ['index' => 0, 'amount' => 1.00, 'label' => '1.00 SC', 'color' => '#3b82f6', 'weight' => 30],
            ['index' => 1, 'amount' => 2.00, 'label' => '2.00 SC', 'color' => '#10b981', 'weight' => 25],
            ['index' => 2, 'amount' => 3.00, 'label' => '3.00 SC', 'color' => '#f59e0b', 'weight' => 18],
            ['index' => 3, 'amount' => 4.00, 'label' => '4.00 SC', 'color' => '#8b5cf6', 'weight' => 12],
            ['index' => 4, 'amount' => 5.00, 'label' => '5.00 SC', 'color' => '#ec4899', 'weight' => 8],
            ['index' => 5, 'amount' => 6.00, 'label' => '6.00 SC', 'color' => '#06b6d4', 'weight' => 4],
            ['index' => 6, 'amount' => 8.00, 'label' => '8.00 SC', 'color' => '#e11d48', 'weight' => 2],
            ['index' => 7, 'amount' => 10.00, 'label' => '10.00 SC', 'color' => '#eab308', 'weight' => 1],
        ];

        // Weighted random selection
        $totalWeight = array_sum(array_column($sectors, 'weight'));
        $rand = mt_rand(1, $totalWeight);
        $running = 0;
        $chosenSector = $sectors[0];

        foreach ($sectors as $sector) {
            $running += $sector['weight'];
            if ($rand <= $running) {
                $chosenSector = $sector;
                break;
            }
        }

        $prize = $chosenSector['amount'];

        DB::transaction(function () use ($user, $prize, $chosenSector) {
            $user->game_balance += $prize;
            $user->last_wheel_spin_at = now();
            $user->save();

            BonusClaim::create([
                'user_id' => $user->id,
                'type' => 'wheel_of_fortune',
                'amount' => $prize,
                'details' => $chosenSector,
            ]);
        });

        $user->refresh();

        return response()->json([
            'success' => true,
            'sector_index' => $chosenSector['index'],
            'prize_amount' => $prize,
            'prize_label' => $chosenSector['label'],
            'new_balance' => (float) $user->game_balance,
            'user' => $user,
        ]);
    }

    /**
     * Store Coin Packages purchase simulation
     */
    /**
     * Purchase store package or custom deposit
     */
    public function buyPackage(Request $request): JsonResponse
    {
        $user = Auth::user();
        if (! $user) {
            return response()->json(['success' => false, 'message' => 'Please sign in first'], 401);
        }

        $packId = $request->input('package_id');
        $customAmount = (float) $request->input('custom_amount', 0);

        // Custom deposit handling
        if ($customAmount > 0 || $packId === 'custom') {
            $amountEur = round(max(5.0, (float) ($customAmount ?: $request->input('amount', 5.0))), 2);

            // Progressive bonus percentage scale: max +30% for €1,000+
            if ($amountEur >= 1000) {
                $bonusPercent = 30;
            } elseif ($amountEur >= 500) {
                $bonusPercent = 25;
            } elseif ($amountEur >= 250) {
                $bonusPercent = 20;
            } elseif ($amountEur >= 100) {
                $bonusPercent = 15;
            } elseif ($amountEur >= 50) {
                $bonusPercent = 10;
            } elseif ($amountEur >= 10) {
                $bonusPercent = 5;
            } else {
                $bonusPercent = 0;
            }

            $baseCoins = $amountEur * 0.50;
            $bonusCoins = round($baseCoins * ($bonusPercent / 100), 2);
            $totalCoins = round($baseCoins + $bonusCoins, 2);
            $vipPoints = (int) ($amountEur * 100);

            DB::transaction(function () use ($user, $amountEur, $totalCoins, $vipPoints, $bonusPercent) {
                $user->game_balance += $totalCoins;
                $user->vip_points += $vipPoints;

                $pts = (int) $user->vip_points;
                if ($pts >= 25000) {
                    $calculatedLevel = 10;
                } elseif ($pts >= 10000) {
                    $calculatedLevel = 8;
                } elseif ($pts >= 5000) {
                    $calculatedLevel = 5;
                } elseif ($pts >= 2500) {
                    $calculatedLevel = 3;
                } elseif ($pts >= 1000) {
                    $calculatedLevel = 2;
                } else {
                    $calculatedLevel = 1;
                }

                if ($calculatedLevel > $user->vip_level) {
                    $user->vip_level = $calculatedLevel;
                }

                $user->save();

                BonusClaim::create([
                    'user_id' => $user->id,
                    'type' => 'store_pack',
                    'amount' => $totalCoins,
                    'details' => [
                        'package_id' => 'custom',
                        'cost' => $amountEur,
                        'bonus_percent' => $bonusPercent,
                        'vip_points' => $vipPoints,
                    ],
                ]);
            });

            $user->refresh();

            try {
                Mail::to($user->email)->send(new DepositSuccessfulMail(
                    user: $user,
                    amountPaid: (float) $amountEur,
                    coinsCredited: (float) $baseCoins,
                    bonusCoins: (float) $bonusCoins,
                    vipPointsEarned: (int) $vipPoints,
                    newBalance: (float) $user->game_balance,
                    currency: 'EUR'
                ));
            } catch (\Throwable $e) {
                Log::error('Failed to send deposit email: '.$e->getMessage());
            }

            return response()->json([
                'success' => true,
                'message' => "🔥 Successfully deposited €{$amountEur}! +SC {$totalCoins} added to your wallet (including +{$bonusPercent}% bonus).",
                'added_coins' => $totalCoins,
                'new_balance' => (float) $user->game_balance,
                'user' => $user,
            ]);
        }

        // Preset packages (Rate: 1 EUR = 0.50 SC)
        $packages = [
            'pack_free' => ['cost' => 0.00, 'coins' => 1.00, 'is_free' => true],
            'pack_starter' => ['cost' => 10.00, 'coins' => 5.25, 'vip_points' => 1000],
            'pack_popular' => ['cost' => 50.00, 'coins' => 27.50, 'vip_points' => 5000],
            'pack_value' => ['cost' => 100.00, 'coins' => 57.50, 'vip_points' => 10000],
            'pack_pro' => ['cost' => 250.00, 'coins' => 150.00, 'vip_points' => 25000],
            'pack_highroller' => ['cost' => 500.00, 'coins' => 312.50, 'vip_points' => 50000],
            'pack_vip_whale' => ['cost' => 1000.00, 'coins' => 650.00, 'vip_points' => 100000],
        ];

        if (! isset($packages[$packId])) {
            return response()->json(['success' => false, 'message' => 'Invalid package selected'], 400);
        }

        $pack = $packages[$packId];

        if (! empty($pack['is_free'])) {
            return $this->claimDailyBonus($request);
        }

        DB::transaction(function () use ($user, $pack, $packId) {
            $user->game_balance += $pack['coins'];
            if (isset($pack['vip_points'])) {
                $user->vip_points += (int) $pack['vip_points'];
                $pts = (int) $user->vip_points;
                if ($pts >= 25000) {
                    $calculatedLevel = 10;
                } elseif ($pts >= 10000) {
                    $calculatedLevel = 8;
                } elseif ($pts >= 5000) {
                    $calculatedLevel = 5;
                } elseif ($pts >= 2500) {
                    $calculatedLevel = 3;
                } elseif ($pts >= 1000) {
                    $calculatedLevel = 2;
                } else {
                    $calculatedLevel = 1;
                }

                if ($calculatedLevel > $user->vip_level) {
                    $user->vip_level = $calculatedLevel;
                }
            }
            $user->save();

            BonusClaim::create([
                'user_id' => $user->id,
                'type' => 'store_pack',
                'amount' => $pack['coins'],
                'details' => ['package_id' => $packId, 'cost' => $pack['cost']],
            ]);
        });

        $user->refresh();

        try {
            Mail::to($user->email)->send(new DepositSuccessfulMail(
                user: $user,
                amountPaid: (float) ($pack['cost'] ?? 0),
                coinsCredited: (float) ($pack['coins'] ?? 0),
                bonusCoins: 0.0,
                vipPointsEarned: (int) ($pack['vip_points'] ?? 0),
                newBalance: (float) $user->game_balance,
                currency: 'EUR'
            ));
        } catch (\Throwable $e) {
            Log::error('Failed to send preset deposit email: '.$e->getMessage());
        }

        return response()->json([
            'success' => true,
            'message' => "🔥 Successfully added +SC {$pack['coins']} to your wallet!",
            'added_coins' => $pack['coins'],
            'new_balance' => (float) $user->game_balance,
            'user' => $user,
        ]);
    }
}
