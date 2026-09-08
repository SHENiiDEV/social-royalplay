<?php

namespace App\Console\Commands;

use App\Models\Game;
use App\Services\GgrApiService;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

class GgrSyncGames extends Command
{
    /**
     * Сигнатура команды с поддержкой флагов:
     * --fresh          : Полная очистка таблицы games перед синхронизацией
     * --force-catalog  : Принудительное использование встроенного реестра 150+ топ-игр
     */
    protected $signature = 'ggr:sync-games {--fresh : Truncate existing games table before syncing} {--force-catalog : Use built-in 150+ verified games catalog}';

    protected $description = 'Sync game providers, banners, and categories from GGR Gold API into MySQL database';

    public function handle(GgrApiService $ggrApi): int
    {
        $this->info('🚀 Starting GGR Gold API games catalog sync...');

        // 1. Если передан флаг --fresh, очищаем таблицу игр
        if ($this->option('fresh')) {
            $this->warn('Truncating existing games table...');
            Game::query()->delete();
        }

        $providers = [];

        // 2. Получение списка провайдеров
        if (! $this->option('force-catalog')) {
            $providersRes = $ggrApi->getProviders();

            if (($providersRes['status'] ?? 0) !== 1 && empty($providersRes['providers'])) {
                $errorMsg = $providersRes['msg'] ?? ($providersRes['message'] ?? 'UNKNOWN_ERROR');
                $this->warn("⚠️ API Warning: {$errorMsg}");
                if (str_contains($errorMsg, 'whitelist') || str_contains($errorMsg, 'INVALID_IP')) {
                    $this->error('🔒 Notice: Add your VPS server IP to the whitelist in your Nexus GGR panel / bot.');
                }
                $this->info('⚡ Using built-in verified provider catalog...');
                $providers = $ggrApi->getDefaultProviders();
            } else {
                $providers = $providersRes['providers'] ?? $providersRes['provider_list'] ?? $ggrApi->getDefaultProviders();
            }
        } else {
            $providers = $ggrApi->getDefaultProviders();
        }

        $this->info('Found '.count($providers).' providers to sync.');

        $totalSynced = 0;
        $categoryCounts = [];

        // Fallback-обложки высокого качества
        $fallbackCovers = [
            'Slots' => 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=60',
            'Baccarat' => 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=800&auto=format&fit=crop&q=60',
            'Roulette' => 'https://images.unsplash.com/photo-1511193311914-0346f16efe90?w=800&auto=format&fit=crop&q=60',
            'Blackjack' => 'https://images.unsplash.com/photo-1606167668584-78701c57f13d?w=800&auto=format&fit=crop&q=60',
            'Live Casino' => 'https://images.unsplash.com/photo-1511193311914-0346f16efe90?w=800&auto=format&fit=crop&q=60',
            'Mini Games' => 'https://images.unsplash.com/photo-1508873696983-2df515122519?w=800&auto=format&fit=crop&q=60',
            'Sportsbook' => 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&auto=format&fit=crop&q=60',
        ];

        // 3. Выгрузка игр по каждому провайдеру
        foreach ($providers as $provider) {
            $providerCode = strtoupper($provider['code'] ?? 'PRAGMATIC');
            $providerName = $provider['name'] ?? $providerCode;

            $this->line("Fetching games for provider: {$providerName} ({$providerCode})...");

            $gamesList = [];

            if (! $this->option('force-catalog')) {
                // Rate-limit задержка между запросами
                usleep(600000);
                $gamesRes = $ggrApi->getGames($providerCode);

                if (($gamesRes['status'] ?? 0) === 1 && ! empty($gamesRes['games'])) {
                    $gamesList = $gamesRes['games'];
                } elseif (! empty($gamesRes['game_list'])) {
                    $gamesList = $gamesRes['game_list'];
                } elseif (! empty($gamesRes['data'])) {
                    $gamesList = $gamesRes['data'];
                } else {
                    $gamesList = $ggrApi->getDefaultGamesForProvider($providerCode);
                }
            } else {
                $gamesList = $ggrApi->getDefaultGamesForProvider($providerCode);
            }

            foreach ($gamesList as $g) {
                $gameCode = $g['game_code'] ?? ($g['code'] ?? null);
                $gameName = $g['game_name'] ?? ($g['name'] ?? ($g['title'] ?? $gameCode));
                $banner = $g['banner'] ?? ($g['image'] ?? ($g['cover_image'] ?? null));
                $status = $g['status'] ?? 1;

                if (! $gameCode) {
                    continue;
                }

                // 4. Определение категории и типа игры
                $titleLower = strtolower($gameName);
                if ($providerCode === 'SPRIBE' || str_contains($titleLower, 'aviator') || str_contains($titleLower, 'plinko') || str_contains($titleLower, 'mines') || str_contains($titleLower, 'dice') || str_contains($titleLower, 'hilo')) {
                    $category = 'Mini Games';
                    $gameType = 'MN';
                } elseif ($providerCode === 'SPORTSBOOK' || str_contains($titleLower, 'league') || str_contains($titleLower, 'football') || str_contains($titleLower, 'basketball')) {
                    $category = 'Sportsbook';
                    $gameType = 'SB';
                } elseif (str_contains($titleLower, 'baccarat')) {
                    $category = 'Baccarat';
                    $gameType = in_array($providerCode, ['EVOLUTION', 'PP_LIVE_PRO', 'PRAGMATICLIVE', 'EZUGI']) ? 'live' : 'slot';
                } elseif (str_contains($titleLower, 'roulette')) {
                    $category = 'Roulette';
                    $gameType = in_array($providerCode, ['EVOLUTION', 'PP_LIVE_PRO', 'PRAGMATICLIVE', 'EZUGI']) ? 'live' : 'slot';
                } elseif (str_contains($titleLower, 'blackjack')) {
                    $category = 'Blackjack';
                    $gameType = in_array($providerCode, ['EVOLUTION', 'PP_LIVE_PRO', 'PRAGMATICLIVE', 'EZUGI']) ? 'live' : 'slot';
                } elseif (in_array($providerCode, ['EVOLUTION', 'PP_LIVE_PRO', 'PRAGMATICLIVE', 'EZUGI'])) {
                    $category = 'Live Casino';
                    $gameType = 'live';
                } else {
                    $category = 'Slots';
                    $gameType = 'slot';
                }

                $providerGameId = "ggr_{$providerCode}_{$gameCode}";
                $slug = Str::slug("{$providerName} {$gameName} {$gameCode}");

                // Рекомендованные мировые хиты
                $isRecommended = in_array($gameCode, [
                    'vs20olympus', 'vs20olympx', 'vs20sweetbonanza', 'vs20sugarrush', 'vs20doghouse',
                    'vswaysdogs', 'vs10bbbonanza', 'vs10splash', 'mahjong-ways-2', 'fortune-tiger',
                    'fortune-rabbit', '1067', '1309', 'minigame_aviator', 'nxpkul2hgclallno', 'crazytime00000001',
                ]);

                $cover = $banner ?: ($fallbackCovers[$category] ?? $fallbackCovers['Slots']);

                // 5. Запись игры в базу данных
                Game::updateOrCreate(
                    ['provider_game_id' => $providerGameId],
                    [
                        'provider_code' => $providerCode,
                        'game_code' => $gameCode,
                        'title' => $gameName,
                        'slug' => $slug,
                        'category' => $category,
                        'game_type' => $gameType,
                        'cover_image' => $cover,
                        'banner' => $banner,
                        'is_active' => $status == 1,
                        'is_recommended' => $isRecommended,
                        'sort_order' => $totalSynced + 1,
                    ]
                );

                $totalSynced++;
                $categoryCounts[$category] = ($categoryCounts[$category] ?? 0) + 1;
            }
        }

        // 6. Итоговый отчет в консоль
        $this->info("✨ Successfully synced {$totalSynced} GGR games into database!");
        $this->table(['Category', 'Count'], collect($categoryCounts)->map(fn ($count, $cat) => ['Category' => $cat, 'Count' => $count]));

        return Command::SUCCESS;
    }
}
