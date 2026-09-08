<?php

namespace App\Http\Controllers;

use App\Models\GameTransaction;
use App\Models\Jackpot;
use App\Models\LiveCommunityWin;
use App\Models\User;
use App\Services\NexusGgrService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class GgrGoldApiController extends Controller
{
    protected NexusGgrService $ggrService;

    public function __construct(NexusGgrService $ggrService)
    {
        $this->ggrService = $ggrService;
    }

    /**
     * Entrypoint for all Nexus GGR Gold API webhook requests (POST /gold_api)
     * CRITICAL: ALWAYS RETURN HTTP 200
     */
    public function handle(Request $request): JsonResponse
    {
        $payload = $request->all();
        $rawContent = $request->getContent();

        // If payload is empty, try json_decode raw content
        if (empty($payload) && ! empty($rawContent)) {
            $payload = json_decode($rawContent, true) ?? [];
        }

        Log::info('>>> GGR GOLD API WEBHOOK INBOUND >>>', [
            'ip' => $request->ip(),
            'payload' => $payload,
        ]);

        try {
            // Validate Agent Credentials
            if (! $this->ggrService->validateWebhookAuth($payload)) {
                Log::warning('GGR Gold API: Unauthorized agent credentials', $payload);

                return response()->json([
                    'status' => 0,
                    'msg' => 'INVALID_AGENT_CREDENTIALS',
                ], 200);
            }

            $method = $payload['method'] ?? $payload['action'] ?? null;

            switch ($method) {
                case 'user_balance':
                case 'balance':
                case 'get_balance':
                    return $this->handleUserBalance($payload);

                case 'transaction':
                case 'spin':
                case 'debit_credit':
                    return $this->handleTransaction($payload);

                default:
                    Log::warning('GGR Gold API: Unknown method received: '.($method ?? 'NULL'), $payload);

                    return response()->json([
                        'status' => 0,
                        'msg' => 'UNKNOWN_METHOD',
                    ], 200);
            }
        } catch (\Throwable $e) {
            Log::error('GGR Gold API Webhook Exception: '.$e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'payload' => $payload,
            ]);

            return response()->json([
                'status' => 0,
                'msg' => 'INTERNAL_ERROR',
            ], 200);
        }
    }

    /**
     * Helper to find user accurately by user_code, email or numeric id
     */
    protected function findUserByCode(?string $userCode, bool $lockForUpdate = false): ?User
    {
        if (empty($userCode)) {
            return null;
        }

        $query = User::query();
        if ($lockForUpdate) {
            $query->lockForUpdate();
        }

        // 1. Exact user_code match (e.g. "user_1", "RP_F63C46F", "admin_1")
        $user = (clone $query)->where('user_code', $userCode)->first();
        if ($user) {
            return $user;
        }

        // 2. Email match
        $user = (clone $query)->where('email', $userCode)->first();
        if ($user) {
            return $user;
        }

        // 3. Exact numeric ID match (only if purely digits, e.g. "2")
        if (ctype_digit((string) $userCode)) {
            $user = (clone $query)->find((int) $userCode);
            if ($user) {
                return $user;
            }
        }

        return null;
    }

    /**
     * Handle user_balance method
     */
    protected function handleUserBalance(array $payload): JsonResponse
    {
        $userCode = $payload['user_code'] ?? null;

        if (! $userCode) {
            return response()->json([
                'status' => 0,
                'user_balance' => 0.00,
                'msg' => 'USER_CODE_REQUIRED',
            ], 200);
        }

        $user = $this->findUserByCode($userCode);

        if (! $user) {
            Log::warning("GGR Gold API: User not found with user_code: {$userCode}");

            return response()->json([
                'status' => 0,
                'user_balance' => 0.00,
                'msg' => 'USER_NOT_FOUND',
            ], 200);
        }

        if ($user->is_banned) {
            Log::warning("GGR Gold API: Blocked user attempted balance check: {$userCode}");

            return response()->json([
                'status' => 0,
                'user_balance' => 0.00,
                'msg' => 'USER_BLOCKED',
            ], 200);
        }

        $balance = (float) $user->game_balance;

        Log::info("GGR Gold API: user_balance success for {$userCode}: SC {$balance}");

        return response()->json([
            'status' => 1,
            'user_balance' => (float) round($balance, 2),
            'balance' => (float) round($balance, 2),
            'msg' => 'SUCCESS',
            'user_code' => $user->user_code,
            'data' => [
                'user_code' => $user->user_code,
                'user_balance' => (float) round($balance, 2),
                'balance' => (float) round($balance, 2),
            ],
        ], 200);
    }

    /**
     * Handle transaction method (Atomic, Idempotent, lockForUpdate)
     * Matches NexusGGR slot / live / SB / MN nested transaction spec
     */
    protected function handleTransaction(array $payload): JsonResponse
    {
        $userCode = $payload['user_code'] ?? null;
        $agentCode = $payload['agent_code'] ?? 'royalplay';
        $gameType = $payload['game_type'] ?? 'slot';

        // Extract nested game object (slot / live / SB / MN / FT)
        $gameDetail = $payload[$gameType] ?? $payload['slot'] ?? $payload['live'] ?? $payload['SB'] ?? $payload['MN'] ?? $payload['FT'] ?? [];

        $txnId = (string) ($gameDetail['txn_id'] ?? $payload['txn_id'] ?? $payload['transaction_id'] ?? '');
        $txnIdV2 = (string) ($gameDetail['txn_id_v2'] ?? $payload['txn_id_v2'] ?? '');
        $txnType = (string) ($gameDetail['txn_type'] ?? $payload['txn_type'] ?? 'debit_credit');
        $betMoney = (float) ($gameDetail['bet_money'] ?? $payload['bet_money'] ?? $payload['bet'] ?? 0.00);
        $winMoney = (float) ($gameDetail['win_money'] ?? $payload['win_money'] ?? $payload['win'] ?? 0.00);
        $roundId = $gameDetail['round_id'] ?? $payload['round_id'] ?? null;
        $gameCode = $gameDetail['game_code'] ?? $payload['game_code'] ?? null;
        $providerCode = $gameDetail['provider_code'] ?? $payload['provider_code'] ?? null;

        if (! $userCode || (! $txnId && ! $txnIdV2)) {
            return response()->json([
                'status' => 0,
                'msg' => 'INVALID_TRANSACTION_PARAMETERS',
            ], 200);
        }

        // Idempotency: Deduplicate on txn_id_v2 (per official spec)
        if (! empty($txnIdV2)) {
            $existingTxn = GameTransaction::where('txn_id_v2', $txnIdV2)->first();
            if ($existingTxn) {
                Log::info("GGR Gold API: Duplicate transaction received (txn_id_v2): {$txnIdV2}");
                $user = User::where('user_code', $userCode)->first();
                $currentBalance = $user ? (float) $user->game_balance : (float) $existingTxn->user_balance_after;

                return response()->json([
                    'status' => 1,
                    'user_balance' => (float) round($currentBalance, 2),
                    'balance' => (float) round($currentBalance, 2),
                    'msg' => 'SUCCESS',
                ], 200);
            }
        } elseif (! empty($txnId)) {
            $existingTxn = GameTransaction::where('txn_id', $txnId)->first();
            if ($existingTxn) {
                Log::info("GGR Gold API: Duplicate transaction received (txn_id): {$txnId}");
                $user = User::where('user_code', $userCode)->first();
                $currentBalance = $user ? (float) $user->game_balance : (float) $existingTxn->user_balance_after;

                return response()->json([
                    'status' => 1,
                    'user_balance' => (float) round($currentBalance, 2),
                    'balance' => (float) round($currentBalance, 2),
                    'msg' => 'SUCCESS',
                ], 200);
            }
        }

        // Atomic Transaction Execution
        return DB::transaction(function () use (
            $userCode, $txnId, $txnIdV2, $txnType, $betMoney, $winMoney,
            $roundId, $gameCode, $providerCode, $agentCode, $payload
        ) {
            $user = $this->findUserByCode($userCode, true);

            if (! $user) {
                Log::warning("GGR Gold API: User not found for transaction: {$userCode}");

                return response()->json([
                    'status' => 0,
                    'msg' => 'USER_NOT_FOUND',
                ], 200);
            }

            if ($user->is_banned) {
                Log::warning("GGR Gold API: Blocked user attempted transaction: {$userCode}");

                return response()->json([
                    'status' => 0,
                    'msg' => 'USER_BLOCKED',
                    'user_balance' => 0.00,
                ], 200);
            }

            $currentBalance = (float) $user->game_balance;

            // Check sufficient funds on debit
            if ($betMoney > 0 && $currentBalance < $betMoney) {
                Log::warning("GGR Gold API: Insufficient funds for {$userCode}. Balance: {$currentBalance}, Bet: {$betMoney}");

                return response()->json([
                    'status' => 0,
                    'msg' => 'INSUFFICIENT_USER_FUNDS',
                    'user_balance' => (float) round($currentBalance, 2),
                ], 200);
            }

            // Calculate new balance based on txn_type
            if ($txnType === 'debit') {
                $newBalance = $currentBalance - $betMoney;
            } elseif ($txnType === 'credit') {
                $newBalance = $currentBalance + $winMoney;
            } else { // debit_credit
                $newBalance = $currentBalance - $betMoney + $winMoney;
            }

            if ($newBalance < 0) {
                $newBalance = 0;
            }

            // Update user balance and VIP points
            $user->game_balance = $newBalance;
            if ($betMoney > 0) {
                $user->vip_points += (int) ($betMoney * 10);
                $calculatedLevel = 1 + (int) floor($user->vip_points / 1000);
                if ($calculatedLevel > $user->vip_level) {
                    $user->vip_level = min($calculatedLevel, 10);
                }
            }
            $user->save();

            // Progressive Jackpot Allocation (0.5% of bet)
            if ($betMoney > 0) {
                $jackpot = Jackpot::first();
                if ($jackpot) {
                    $jackpotContribution = round($betMoney * (float) $jackpot->cut_percentage, 4);
                    $jackpot->current_pool += $jackpotContribution;
                    $jackpot->save();
                }
            }

            $netMoney = $winMoney - $betMoney;

            // Record transaction
            GameTransaction::create([
                'user_id' => $user->id,
                'user_code' => $user->user_code,
                'agent_code' => $agentCode,
                'provider_code' => $providerCode,
                'game_code' => $gameCode,
                'txn_id' => $txnId ?: ($txnIdV2 ?: 'txn_'.uniqid()),
                'txn_id_v2' => $txnIdV2 ?: $txnId,
                'round_id' => (string) ($roundId ?? $txnId),
                'txn_type' => $txnType,
                'bet_money' => $betMoney,
                'win_money' => $winMoney,
                'net_money' => $netMoney,
                'user_balance_before' => $currentBalance,
                'user_balance_after' => $newBalance,
                'is_jackpot_win' => false,
                'raw_payload' => json_encode($payload),
            ]);

            // If win is substantial or multiplier is high, publish to Live Community Winners
            if ($winMoney > 0) {
                $multiplier = $betMoney > 0 ? round($winMoney / $betMoney, 2) : round($winMoney, 2);
                $tier = LiveCommunityWin::determineTier($winMoney, $multiplier);

                LiveCommunityWin::create([
                    'user_code' => $user->user_code,
                    'player_name' => $user->name,
                    'avatar' => $user->avatar,
                    'game_name' => $gameCode ?? 'Slot Game',
                    'game_code' => $gameCode ?? 'slot',
                    'provider_code' => $providerCode ?? 'PRAGMATIC',
                    'bet_amount' => $betMoney > 0 ? $betMoney : 1.00,
                    'win_amount' => $winMoney,
                    'multiplier' => $multiplier,
                    'tier' => $tier,
                    'is_simulated' => false,
                ]);
            }

            Log::info("GGR Gold API: Transaction processed successfully. TxnID: {$txnId} (v2: {$txnIdV2}), Bet: €{$betMoney}, Win: €{$winMoney}, OldBal: €{$currentBalance}, NewBal: €{$newBalance}");

            return response()->json([
                'status' => 1,
                'user_balance' => (float) round($newBalance, 2),
                'balance' => (float) round($newBalance, 2),
                'msg' => 'SUCCESS',
            ], 200);
        });
    }
}
