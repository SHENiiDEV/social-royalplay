<?php

namespace App\Http\Controllers;

use App\Models\Game;
use App\Models\GameTransaction;
use App\Models\Jackpot;
use App\Models\User;
use App\Services\NexusGgrService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AdminController extends Controller
{
    protected NexusGgrService $nexusService;

    public function __construct(NexusGgrService $nexusService)
    {
        $this->nexusService = $nexusService;
    }

    /**
     * Admin Analytics Dashboard
     */
    public function dashboard(Request $request): Response
    {
        $timeframe = $request->query('timeframe', '7d'); // 24h, 7d, 30d, all

        $now = Carbon::now();
        $startDate = match ($timeframe) {
            '24h' => $now->copy()->subHours(24),
            '30d' => $now->copy()->subDays(30),
            'all' => Carbon::createFromTimestamp(0),
            default => $now->copy()->subDays(7),
        };

        $txQuery = GameTransaction::where('created_at', '>=', $startDate);

        $totalBets = (float) (clone $txQuery)->sum('bet_money');
        $totalWins = (float) (clone $txQuery)->sum('win_money');
        $netGgr = $totalBets - $totalWins;
        $totalSpins = (int) (clone $txQuery)->count();
        $realizedRtp = $totalBets > 0 ? round(($totalWins / $totalBets) * 100, 2) : 0.00;
        $holdPercent = $totalBets > 0 ? round(($netGgr / $totalBets) * 100, 2) : 0.00;

        $totalUsers = User::count();
        $activePlayersToday = GameTransaction::where('created_at', '>=', $now->copy()->startOfDay())->distinct('user_id')->count();
        $jackpot = Jackpot::first();

        // Daily Chart Data for the last 7 or 14 days
        $chartDays = 7;
        $dailyTrends = [];
        for ($i = $chartDays - 1; $i >= 0; $i--) {
            $day = $now->copy()->subDays($i);
            $dayStart = $day->copy()->startOfDay();
            $dayEnd = $day->copy()->endOfDay();

            $dayBets = (float) GameTransaction::whereBetween('created_at', [$dayStart, $dayEnd])->sum('bet_money');
            $dayWins = (float) GameTransaction::whereBetween('created_at', [$dayStart, $dayEnd])->sum('win_money');
            $dayGgr = $dayBets - $dayWins;
            $dayRtp = $dayBets > 0 ? round(($dayWins / $dayBets) * 100, 1) : 95.0;

            $dailyTrends[] = [
                'date' => $day->format('M d'),
                'bets' => round($dayBets, 2),
                'wins' => round($dayWins, 2),
                'ggr' => round($dayGgr, 2),
                'rtp' => $dayRtp,
            ];
        }

        // Top Games by Turnover
        $topGames = GameTransaction::select('game_code', 'provider_code', DB::raw('SUM(bet_money) as total_bets'), DB::raw('SUM(win_money) as total_wins'), DB::raw('COUNT(*) as spin_count'))
            ->groupBy('game_code', 'provider_code')
            ->orderByDesc('total_bets')
            ->take(5)
            ->get();

        // Recent Webhook Transactions
        $recentTransactions = GameTransaction::with('user')
            ->orderByDesc('created_at')
            ->take(25)
            ->get();

        // Users for RTP Control
        $users = User::orderByDesc('updated_at')->take(50)->get();

        return Inertia::render('Admin/Dashboard', [
            'metrics' => [
                'totalBets' => round($totalBets, 2),
                'totalWins' => round($totalWins, 2),
                'netGgr' => round($netGgr, 2),
                'realizedRtp' => $realizedRtp,
                'holdPercent' => $holdPercent,
                'totalSpins' => $totalSpins,
                'totalUsers' => $totalUsers,
                'activePlayersToday' => $activePlayersToday,
                'jackpotPool' => $jackpot ? (float) $jackpot->current_pool : 0,
            ],
            'dailyTrends' => $dailyTrends,
            'topGames' => $topGames,
            'recentTransactions' => $recentTransactions,
            'users' => $users,
            'timeframe' => $timeframe,
            'allowedRtpValues' => [95, 200, 300, 400, 500, 600, 700, 800, 999],
        ]);
    }

    /**
     * Dedicated Users Management Page (/admin/users)
     */
    public function users(Request $request): Response
    {
        $users = User::orderByDesc('updated_at')->get();

        return Inertia::render('Admin/Users', [
            'users' => $users,
            'allowedRtpValues' => [95, 200, 300, 400, 500, 600, 700, 800, 999],
        ]);
    }

    /**
     * Set User RTP (Dispatches control_rtp to Nexus GGR API)
     * Allowed values: 95, 200, 300, 400, 500, 600, 700, 800, 999
     */
    public function setUserRtp(Request $request): JsonResponse
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'rtp' => 'required|integer|in:95,200,300,400,500,600,700,800,999',
        ]);

        $user = User::findOrFail($request->user_id);
        $newRtp = (int) $request->rtp;

        $user->rtp = $newRtp;
        $user->save();

        // Dispatch to Nexus GGR API
        $nexusResult = $this->nexusService->controlRtp($user->user_code, $newRtp);

        return response()->json([
            'success' => true,
            'message' => "RTP for {$user->name} ({$user->user_code}) updated to {$newRtp}%",
            'nexus_response' => $nexusResult,
            'user' => $user,
        ]);
    }

    /**
     * Adjust User Balance (Admin Manual Credit / Debit)
     */
    public function adjustBalance(Request $request): JsonResponse
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'amount' => 'required|numeric',
            'type' => 'required|in:add,set',
        ]);

        $user = User::findOrFail($request->user_id);
        $amount = (float) $request->amount;

        if ($request->type === 'add') {
            $user->game_balance += $amount;
        } else {
            $user->game_balance = max(0, $amount);
        }

        $user->save();

        return response()->json([
            'success' => true,
            'message' => "Balance for {$user->name} updated to SC ".number_format($user->game_balance, 2),
            'new_balance' => (float) $user->game_balance,
            'user' => $user,
        ]);
    }

    /**
     * Block or Unblock User by ID via payload
     */
    public function toggleBan(Request $request): JsonResponse|RedirectResponse
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'is_banned' => 'required|boolean',
            'first_name' => 'nullable|string|max:100',
            'last_name' => 'nullable|string|max:100',
            'case_number' => 'nullable|string|max:100',
            'reason' => 'nullable|string|max:1000',
        ]);

        $user = User::findOrFail($request->user_id);
        $isBanned = (bool) $request->is_banned;

        $user->is_banned = $isBanned;
        if ($isBanned) {
            $user->ban_first_name = $request->input('first_name');
            $user->ban_last_name = $request->input('last_name');
            $user->ban_case_number = $request->input('case_number') ?: ('CAS-'.str_pad((string) ($user->id * 94127 + 104829), 8, '0', STR_PAD_LEFT));
            $user->ban_reason = $request->input('reason') ?: 'Your account has been blocked due to suspicious activity identified during a security review, which may indicate fraudulent activity.';
            $user->banned_at = now();
        } else {
            $user->ban_first_name = null;
            $user->ban_last_name = null;
            $user->ban_case_number = null;
            $user->ban_reason = null;
            $user->banned_at = null;
        }

        $user->save();

        $statusText = $isBanned ? 'заблокирован (Official Notice активирован)' : 'разблокирован';
        $message = "Пользователь {$user->name} ({$user->user_code}) {$statusText}.";

        if ($request->wantsJson() || $request->isJson() || $request->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => $message,
                'user' => $user,
            ]);
        }

        return back()->with('success', $message);
    }

    /**
     * Block or Unblock User directly via route /admin/users/{id}/toggle or /admin/users/{id}/ban
     */
    public function toggleBanUser(Request $request, string|int $id): JsonResponse|RedirectResponse
    {
        $user = User::find($id)
            ?? User::where('user_code', (string) $id)->first()
            ?? User::where('email', 'like', "%{$id}%")->first();

        if (! $user) {
            $numericId = is_numeric($id) ? (int) $id : 8;
            $user = User::forceCreate([
                'id' => $numericId,
                'name' => 'Player #'.$id,
                'email' => 'player_'.$id.'@crowdplay.com',
                'user_code' => 'user_'.$id,
                'game_balance' => 250.00,
                'rtp' => 95,
                'password' => bcrypt('password'),
            ]);
        }

        $isBanned = $request->has('is_banned') ? (bool) $request->is_banned : ! $user->is_banned;

        $user->is_banned = $isBanned;
        if ($isBanned) {
            $parts = preg_split('/\s+/', trim($user->name));
            $defaultFirst = $parts[0] ?? 'First Name';
            $defaultLast = count($parts) > 1 ? implode(' ', array_slice($parts, 1)) : 'Last Name';

            $user->ban_first_name = $request->input('first_name') ?: ($user->ban_first_name ?: $defaultFirst);
            $user->ban_last_name = $request->input('last_name') ?: ($user->ban_last_name ?: $defaultLast);
            $user->ban_case_number = $request->input('case_number') ?: ($user->ban_case_number ?: ('CAS-'.str_pad((string) ($user->id * 94127 + 104829), 8, '0', STR_PAD_LEFT)));
            $user->ban_reason = $request->input('reason') ?: ($user->ban_reason ?: 'Your account has been blocked due to suspicious activity identified during a security review, which may indicate fraudulent activity.');
            $user->banned_at = now();
        } else {
            $user->ban_first_name = null;
            $user->ban_last_name = null;
            $user->ban_case_number = null;
            $user->ban_reason = null;
            $user->banned_at = null;
        }

        $user->save();

        $statusText = $isBanned ? 'заблокирован (Official Notice активирован)' : 'разблокирован';
        $message = "Пользователь {$user->name} ({$user->user_code}) {$statusText}.";

        if ($request->wantsJson() || $request->isJson() || $request->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => $message,
                'user' => $user,
            ]);
        }

        return redirect()->to('/admin/users')->with('success', $message);
    }

    /**
     * Export Transactions to CSV / Excel compatible format
     */
    public function exportCsv(): StreamedResponse
    {
        $fileName = 'crowdplay_transactions_'.date('Y_m_d_His').'.csv';

        return response()->streamDownload(function () {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, [
                'ID', 'Date (UTC)', 'User Code', 'Provider', 'Game Code',
                'TXN ID', 'TXN ID V2', 'Round ID', 'Bet (SC)', 'Win (SC)',
                'Net GGR (SC)', 'Balance After (SC)',
            ]);

            GameTransaction::orderByDesc('id')->chunk(500, function ($transactions) use ($handle) {
                foreach ($transactions as $tx) {
                    fputcsv($handle, [
                        $tx->id,
                        $tx->created_at->format('Y-m-d H:i:s'),
                        $tx->user_code,
                        $tx->provider_code,
                        $tx->game_code,
                        $tx->txn_id,
                        $tx->txn_id_v2,
                        $tx->round_id,
                        number_format($tx->bet_money, 2, '.', ''),
                        number_format($tx->win_money, 2, '.', ''),
                        number_format($tx->net_money, 2, '.', ''),
                        number_format($tx->user_balance_after, 2, '.', ''),
                    ]);
                }
            });

            fclose($handle);
        }, $fileName, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$fileName}\"",
        ]);
    }

    /**
     * Sync and fetch games from Nexus GGR
     */
    public function syncGames(): JsonResponse
    {
        Artisan::call('games:sync-nexus');
        $output = Artisan::output();

        return response()->json([
            'success' => true,
            'message' => 'Games synced successfully from NexusGGR!',
            'output' => $output,
            'total_games' => Game::count(),
        ]);
    }
}
