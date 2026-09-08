<?php

namespace App\Http\Middleware;

use App\Models\Jackpot;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $user = $request->user();
        if ($user) {
            $user->refresh();
        }

        $jackpot = Jackpot::first();

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'user_code' => $user->user_code,
                    'game_balance' => (float) $user->game_balance,
                    'rtp' => (int) $user->rtp,
                    'vip_level' => (int) $user->vip_level,
                    'vip_points' => (int) $user->vip_points,
                    'is_admin' => (bool) $user->is_admin,
                    'is_banned' => (bool) $user->is_banned,
                    'ban_reason' => $user->ban_reason,
                    'ban_first_name' => $user->ban_first_name,
                    'ban_last_name' => $user->ban_last_name,
                    'ban_case_number' => $user->getEffectiveCaseNumber(),
                    'ban_full_name' => $user->getBanFullName(),
                    'banned_at' => $user->banned_at ? $user->banned_at->toIso8601String() : null,
                    'can_claim_daily_bonus' => $user->canClaimDailyBonus(),
                    'daily_bonus_seconds' => $user->dailyBonusSecondsRemaining(),
                    'can_spin_wheel' => $user->canSpinWheel(),
                    'wheel_spin_seconds' => $user->wheelSpinSecondsRemaining(),
                ] : null,
                'available_demo_users' => User::select('id', 'name', 'user_code', 'game_balance', 'rtp', 'is_admin', 'is_banned', 'ban_first_name', 'ban_last_name', 'ban_case_number', 'ban_reason')->take(15)->get(),
            ],
            'jackpot' => $jackpot ? [
                'name' => $jackpot->name,
                'current_pool' => (float) $jackpot->current_pool,
                'last_winner_name' => $jackpot->last_winner_name,
                'last_win_amount' => (float) $jackpot->last_win_amount,
            ] : null,
            'company' => [
                'name' => env('FRONT_COMPANY_NAME', 'RoyalPlay Entertainment N.V.'),
                'phone' => env('FRONT_COMPANY_PHONE', '+357 22 123 456'),
                'email' => env('FRONT_COMPANY_EMAIL', 'support@royalplaycasino.com'),
                'address' => env('FRONT_COMPANY_ADDR', 'Heelsumstraat 51, E-Commerce Park, Willemstad, Curaçao'),
                'reg_number' => env('FRONT_COMPANY_REG_NUMBER', '164829'),
                'license' => env('FRONT_COMPANY_LICENSE', 'OGL/2026/184/0129'),
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
        ];
    }
}
