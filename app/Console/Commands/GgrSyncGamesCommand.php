<?php

namespace App\Console\Commands;

use App\Models\Game;
use App\Services\GgrApiService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class GgrSyncGamesCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'ggr:sync-games 
                            {--fresh : Truncate existing games table before sync}
                            {--force-catalog : Use verified local catalog without external API requests}
                            {--provider= : Sync games only for a specific provider code}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync games catalog from Nexus GGR Gold API into database';

    /**
     * Execute the console command.
     */
    public function handle(GgrApiService $ggrService): int
    {
        $this->line('🚀 Starting GGR Gold API games catalog sync...');

        $isFresh = (bool) $this->option('fresh');
        $forceCatalog = (bool) $this->option('force-catalog');
        $selectedProvider = $this->option('provider');

        // Stage 1: Preparation & Truncate if --fresh
        if ($isFresh) {
            $this->warn('Truncating existing games table...');
            DB::transaction(function () {
                Game::query()->delete();
            });
            Cache::flush();
        }

        // Stage 2: Fetch Providers List
        $allProviders = $ggrService->getProviders();

        if ($selectedProvider) {
            $selectedUpper = strtoupper(trim($selectedProvider));
            $providers = array_values(array_filter($allProviders, fn ($p) => strtoupper($p['code'] ?? '') === $selectedUpper));
            if (empty($providers)) {
                $providers = [['code' => $selectedUpper, 'name' => $selectedUpper]];
            }
        } else {
            $providers = $allProviders;
        }

        $this->info('Found '.count($providers).' providers to sync.');

        $totalSynced = 0;
        $categoryStats = [
            'Slots' => 0,
            'Live Casino' => 0,
            'Roulette' => 0,
            'Blackjack' => 0,
            'Baccarat' => 0,
            'Mini Games' => 0,
            'Sportsbook' => 0,
        ];

        // Stage 3 & 4: Fetch & Upsert Games per Provider
        foreach ($providers as $provider) {
            $code = strtoupper(trim($provider['code'] ?? ''));
            $name = $provider['name'] ?? $code;

            $this->line("Fetching games for provider: {$name} ({$code})...");

            $games = $ggrService->getGamesForProvider($code, $forceCatalog);

            foreach ($games as $gameData) {
                try {
                    $game = Game::updateOrCreate(
                        [
                            'provider_code' => $gameData['provider_code'],
                            'game_code' => $gameData['game_code'],
                        ],
                        [
                            'provider_game_id' => $gameData['provider_game_id'],
                            'name' => $gameData['name'],
                            'title' => $gameData['title'],
                            'slug' => $gameData['slug'],
                            'category' => $gameData['category'],
                            'game_type' => $gameData['game_type'],
                            'cover_image' => $gameData['cover_image'],
                            'banner' => $gameData['banner'],
                            'is_active' => $gameData['is_active'],
                            'is_featured' => $gameData['is_featured'],
                            'is_recommended' => $gameData['is_recommended'],
                            'rtp_display' => $gameData['rtp_display'],
                            'volatility' => $gameData['volatility'],
                            'min_bet' => $gameData['min_bet'],
                            'max_bet' => $gameData['max_bet'],
                            'max_multiplier' => $gameData['max_multiplier'],
                            'sort_order' => $gameData['sort_order'],
                        ]
                    );

                    $cat = $game->category ?? 'Slots';
                    if (! isset($categoryStats[$cat])) {
                        $categoryStats[$cat] = 0;
                    }
                    $categoryStats[$cat]++;
                    $totalSynced++;
                } catch (\Throwable $e) {
                    $this->error("Failed to sync game [{$gameData['game_code']}]: ".$e->getMessage());
                }
            }

            // Rate limiting pause (300-500 ms)
            usleep(350000);
        }

        // Stage 5: Output Summary
        $this->info("✨ Successfully synced {$totalSynced} GGR games into database!");

        $tableRows = [];
        foreach ($categoryStats as $category => $count) {
            if ($count > 0 || ! $selectedProvider) {
                $tableRows[] = [$category, (string) $count];
            }
        }

        $this->table(['Category', 'Count'], $tableRows);

        return Command::SUCCESS;
    }
}
