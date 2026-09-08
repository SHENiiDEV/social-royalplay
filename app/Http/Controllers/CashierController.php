<?php

namespace App\Http\Controllers;

use App\Mail\DepositSuccessfulMail;
use App\Models\BonusClaim;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class CashierController extends Controller
{
    /**
     * Webhook for external payment gateways / cashier notification
     */
    public function webhook(Request $request): JsonResponse
    {
        $payload = $request->all();
        Log::info('Cashier payment webhook received', $payload);

        $orderId = $request->input('order_id') ?? $request->input('transaction_id') ?? 'ORD-'.strtoupper(substr(md5(uniqid('', true)), 0, 10));
        $userCode = $request->input('user_code');
        $email = $request->input('email');
        $userId = $request->input('user_id');
        $amountPaid = (float) ($request->input('amount') ?? $request->input('amount_eur') ?? $request->input('price') ?? 0);
        $status = strtolower($request->input('status', 'success'));

        if ($status !== 'success' && $status !== 'completed' && $status !== 'paid') {
            return response()->json(['status' => 'ignored', 'message' => 'Transaction status is not successful'], 200);
        }

        $user = null;
        if ($userId) {
            $user = User::find($userId);
        } elseif ($userCode) {
            $user = User::where('user_code', $userCode)->first();
        } elseif ($email) {
            $user = User::where('email', strtolower($email))->first();
        }

        if (! $user) {
            return response()->json(['status' => 'error', 'message' => 'User not found'], 404);
        }

        // 1 EUR = 0.50 SC base rate
        $baseCoins = round($amountPaid * 0.50, 2);

        // Progressive bonus percentage
        if ($amountPaid >= 1000) {
            $bonusPercent = 30;
        } elseif ($amountPaid >= 500) {
            $bonusPercent = 25;
        } elseif ($amountPaid >= 250) {
            $bonusPercent = 20;
        } elseif ($amountPaid >= 100) {
            $bonusPercent = 15;
        } elseif ($amountPaid >= 50) {
            $bonusPercent = 10;
        } elseif ($amountPaid >= 10) {
            $bonusPercent = 5;
        } else {
            $bonusPercent = 0;
        }

        $bonusCoins = round(($baseCoins * $bonusPercent) / 100, 2);
        $totalCoins = round($baseCoins + $bonusCoins, 2);
        $vipPoints = (int) ($amountPaid * 100);

        DB::transaction(function () use ($user, $totalCoins, $vipPoints, $orderId, $amountPaid, $bonusPercent) {
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
                'type' => 'cashier_deposit',
                'amount' => $totalCoins,
                'details' => [
                    'order_id' => $orderId,
                    'cost' => $amountPaid,
                    'bonus_percent' => $bonusPercent,
                    'vip_points' => $vipPoints,
                ],
            ]);
        });

        $user->refresh();

        try {
            Mail::to($user->email)->send(new DepositSuccessfulMail(
                user: $user,
                amountPaid: $amountPaid,
                coinsCredited: $baseCoins,
                bonusCoins: $bonusCoins,
                vipPointsEarned: $vipPoints,
                newBalance: (float) $user->game_balance,
                orderId: $orderId,
                currency: 'EUR'
            ));
        } catch (\Throwable $e) {
            Log::error('Failed to send cashier deposit email: '.$e->getMessage());
        }

        return response()->json([
            'status' => 'success',
            'order_id' => $orderId,
            'user_id' => $user->id,
            'added_coins' => $totalCoins,
            'new_balance' => (float) $user->game_balance,
        ]);
    }
}
