<?php

namespace App\Http\Controllers;

use App\Models\Game;
use App\Models\Jackpot;
use App\Models\LiveCommunityWin;
use App\Models\User;
use App\Services\NexusGgrService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class GameController extends Controller
{
    protected NexusGgrService $nexusService;

    public function __construct(NexusGgrService $nexusService)
    {
        $this->nexusService = $nexusService;
    }

    /**
     * Casino Lobby Page
     */
    public function index(Request $request): Response
    {
        $category = $request->query('category', 'all');
        $provider = $request->query('provider', 'all');
        $search = $request->query('search', '');

        $query = Game::where('is_active', true);

        if ($category && $category !== 'all') {
            if ($category === 'favorites') {
                if (Auth::check()) {
                    $favIds = DB::table('user_favorites')
                        ->where('user_id', Auth::id())
                        ->pluck('game_id')
                        ->toArray();
                    $query->whereIn('id', $favIds);
                } else {
                    $clientFavIds = explode(',', $request->query('fav_ids', ''));
                    $favIds = array_filter(array_map('intval', $clientFavIds));
                    if (! empty($favIds)) {
                        $query->whereIn('id', $favIds);
                    } else {
                        $query->whereRaw('1 = 0');
                    }
                }
            } elseif ($category === 'popular') {
                $query->where(function ($q) {
                    $q->where('is_featured', true)
                        ->orWhere('is_recommended', true)
                        ->orWhere('play_count', '>=', 500);
                });
            } elseif ($category === 'slots' || $category === 'Slots') {
                $query->where(function ($q) {
                    $q->where('category', 'Slots')
                        ->orWhere('category', 'slots')
                        ->orWhere('game_type', 'slot');
                });
            } elseif (in_array($category, ['buy_feature', 'bonus_buy'], true)) {
                $query->where(function ($q) {
                    $q->whereIn('category', ['buy_feature', 'bonus_buy'])
                        ->orWhere('name', 'like', '%1000%')
                        ->orWhere('name', 'like', '%Megaways%')
                        ->orWhere('name', 'like', '%Gates of Olympus%')
                        ->orWhere('name', 'like', '%Sweet Bonanza%')
                        ->orWhere('name', 'like', '%Sugar Rush%')
                        ->orWhere('name', 'like', '%Wanted Dead%');
                });
            } elseif (in_array($category, ['megaways', 'mega_ways'], true)) {
                $query->where(function ($q) {
                    $q->whereIn('category', ['megaways', 'mega_ways'])
                        ->orWhere('name', 'like', '%Megaways%')
                        ->orWhere('game_code', 'like', '%ways%');
                });
            } elseif (in_array($category, ['jackpots', 'jackpot'], true)) {
                $query->where(function ($q) {
                    $q->whereIn('category', ['jackpots', 'jackpot'])
                        ->orWhere('name', 'like', '%Jackpot%')
                        ->orWhere('name', 'like', '%Crown%')
                        ->orWhere('name', 'like', '%Hot%')
                        ->orWhere('max_multiplier', '>=', 10000);
                });
            } else {
                $query->where(function ($q) use ($category) {
                    $q->where('category', $category)
                        ->orWhere('category', ucfirst(strtolower($category)))
                        ->orWhere('game_type', strtolower($category));
                });
            }
        }

        if ($provider && strtolower($provider) !== 'all') {
            $provLower = strtolower($provider);
            $query->where(function ($q) use ($provLower) {
                $q->where('provider_code', $provLower)
                    ->orWhere('provider_code', strtoupper($provLower));
            });
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('title', 'like', "%{$search}%")
                    ->orWhere('game_code', 'like', "%{$search}%")
                    ->orWhere('provider_code', 'like', "%{$search}%");
            });
        }

        $perPage = (int) $request->query('per_page', 24);
        if ($perPage <= 0 || $perPage > 100) {
            $perPage = 24;
        }

        $games = $query->orderByDesc('is_recommended')
            ->orderByDesc('is_featured')
            ->orderBy('sort_order')
            ->paginate($perPage)
            ->withQueryString();

        $featuredGames = Game::where('is_active', true)->where('is_recommended', true)->take(8)->get();
        if ($featuredGames->isEmpty()) {
            $featuredGames = Game::where('is_active', true)->take(8)->get();
        }

        $jackpot = Jackpot::first();
        $liveWins = LiveCommunityWin::orderByDesc('id')->take(15)->get();

        $providerNameMap = [
            'pragmatic' => 'Pragmatic Play',
            'pp_live_pro' => 'Pragmatic Live',
            'pgsoft' => 'PG Soft',
            'hacksaw' => 'Hacksaw Gaming',
            'playngo' => 'Play\'n GO',
            'spribe' => 'Spribe Mini Games',
            'evolution' => 'Evolution Live',
            'sportsbook' => 'Sportsbook',
            'amusnet' => 'Amusnet',
            'no_limit' => 'NoLimit City',
            'nolimit' => 'NoLimit City',
            'reelkingdom' => 'Reel Kingdom',
            'amatic' => 'Amatic',
            'egt' => 'EGT Interactive',
            'habanero' => 'Habanero',
            'playson' => 'Playson',
            'booongo' => 'Booongo / 3 Oaks',
            'jokergaming' => 'Joker Gaming',
            'spadegaming' => 'Spadegaming',
            'fachai' => 'Fa Chai',
        ];

        $providersRaw = Game::select('provider_code', DB::raw('count(*) as count'))
            ->where('is_active', true)
            ->whereNotNull('provider_code')
            ->groupBy('provider_code')
            ->orderByDesc('count')
            ->get();

        $providers = $providersRaw->map(function ($p) use ($providerNameMap) {
            $code = strtolower($p->provider_code);

            return [
                'code' => $code,
                'name' => $providerNameMap[$code] ?? strtoupper($code),
                'count' => (int) $p->count,
            ];
        })->values()->toArray();

        $userFavorites = Auth::check()
            ? DB::table('user_favorites')->where('user_id', Auth::id())->pluck('game_id')->toArray()
            : [];

        return Inertia::render('Lobby', [
            'games' => $games,
            'featuredGames' => $featuredGames,
            'jackpot' => $jackpot,
            'liveWins' => $liveWins,
            'providers' => $providers,
            'userFavorites' => $userFavorites,
            'filters' => [
                'category' => $category,
                'provider' => $provider,
                'search' => $search,
                'page' => (int) $request->query('page', 1),
            ],
        ]);
    }

    /**
     * Get user favorites API
     */
    public function getFavorites(Request $request): JsonResponse
    {
        if (Auth::check()) {
            $ids = DB::table('user_favorites')
                ->where('user_id', Auth::id())
                ->pluck('game_id')
                ->toArray();

            return response()->json(['success' => true, 'favorites' => $ids]);
        }

        return response()->json(['success' => true, 'favorites' => []]);
    }

    /**
     * Toggle game favorite status API
     */
    public function toggleFavorite(Request $request): JsonResponse
    {
        $gameId = (int) $request->input('game_id');
        $game = Game::find($gameId);

        if (! $game) {
            return response()->json(['success' => false, 'message' => 'Game not found'], 404);
        }

        if (Auth::check()) {
            $userId = Auth::id();
            $exists = DB::table('user_favorites')
                ->where('user_id', $userId)
                ->where('game_id', $gameId)
                ->exists();

            if ($exists) {
                DB::table('user_favorites')
                    ->where('user_id', $userId)
                    ->where('game_id', $gameId)
                    ->delete();
                $isFavorite = false;
                $msg = 'Removed from Favorites';
            } else {
                DB::table('user_favorites')->insert([
                    'user_id' => $userId,
                    'game_id' => $gameId,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                $isFavorite = true;
                $msg = 'Added to Favorites';
            }

            return response()->json([
                'success' => true,
                'is_favorite' => $isFavorite,
                'message' => $msg,
            ]);
        }

        return response()->json([
            'success' => true,
            'is_favorite' => true,
            'message' => 'Favorite updated',
        ]);
    }

    /**
     * Game Play & Launch Page
     */
    public function show(string $slug): Response|RedirectResponse
    {
        $game = Game::where('slug', $slug)->firstOrFail();
        $game->increment('play_count');

        $user = Auth::user();
        if (! $user) {
            return redirect()->route('home', ['auth' => 'login', 'redirect' => "/game/{$slug}"]);
        }

        // Request launch URL from Nexus GGR API
        $launchData = $this->nexusService->launchGame($user, $game, app()->getLocale());

        $relatedGames = Game::where('is_active', true)
            ->where('id', '!=', $game->id)
            ->where(function ($q) use ($game) {
                $q->where('provider_code', $game->provider_code)
                    ->orWhere('category', $game->category);
            })
            ->take(6)
            ->get();

        $recentWinsOnGame = LiveCommunityWin::where('game_code', $game->game_code)
            ->orWhere('provider_code', $game->provider_code)
            ->orderByDesc('created_at')
            ->take(5)
            ->get();

        return Inertia::render('GamePlayer', [
            'game' => $game,
            'launchUrl' => $launchData['launch_url'],
            'isMock' => $launchData['is_mock'] ?? false,
            'relatedGames' => $relatedGames,
            'recentWins' => $recentWinsOnGame,
        ]);
    }

    /**
     * Mock HTML5 Game Frame for offline/instant play
     */
    public function mockFrame(string $slug)
    {
        $game = Game::where('slug', $slug)->firstOrFail();
        $user = Auth::user() ?? User::first();

        return view('mock-slot-frame', [
            'game' => $game,
            'user' => $user,
        ]);
    }

    /**
     * Real-time Live Community Wins API
     */
    public function liveWinsApi(): JsonResponse
    {
        // Dynamically add a realistic win periodically so the stream stays super active
        $latestWin = LiveCommunityWin::latest()->first();
        if (! $latestWin || $latestWin->created_at->diffInSeconds(now()) > 10 || rand(1, 10) <= 6) {
            LiveCommunityWin::generateRealisticWin();
        }

        $wins = LiveCommunityWin::orderByDesc('id')->take(20)->get();

        return response()->json($wins);
    }

    /**
     * Real-time Jackpot API
     */
    public function jackpotApi(): JsonResponse
    {
        $jackpot = Jackpot::first();

        return response()->json($jackpot);
    }
}
