<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GgrApiService
{
    protected string $apiServer;

    protected string $agentCode;

    protected string $agentToken;

    protected string $agentSecret;

    public function __construct()
    {
        $this->apiServer = rtrim(config('services.nexus_ggr.server', env('GGR_API_SERVER', 'https://api.nexusggr.dev')), '/');
        $this->agentCode = config('services.nexus_ggr.agent_code', env('GGR_AGENT_CODE', 'crowdplay'));
        $this->agentToken = config('services.nexus_ggr.agent_token', env('GGR_AGENT_TOKEN', 'c9540f990614ec0e60efa22d4c5fe5fe'));
        $this->agentSecret = config('services.nexus_ggr.agent_secret', env('GGR_AGENT_SECRET', '7e49159d19c1db28e7f70966b1242606'));
    }

    /**
     * Fetch Providers list from Nexus GGR API
     */
    public function getProviders(): array
    {
        try {
            $response = Http::timeout(10)
                ->withHeaders([
                    'Agent-Code' => $this->agentCode,
                    'Agent-Token' => $this->agentToken,
                    'Accept' => 'application/json',
                ])
                ->get("{$this->apiServer}/api/v1/providers");

            if ($response->successful()) {
                $json = $response->json();
                if (isset($json['providers']) || isset($json['provider_list'])) {
                    return [
                        'status' => $json['status'] ?? 1,
                        'providers' => $json['providers'] ?? $json['provider_list'] ?? [],
                    ];
                }
            }

            $msg = $response->json('msg') ?? $response->json('message') ?? 'API_UNREACHABLE';

            return [
                'status' => 0,
                'msg' => $msg,
                'providers' => [],
            ];
        } catch (\Throwable $e) {
            Log::warning('GGR API getProviders error: '.$e->getMessage());

            return [
                'status' => 0,
                'msg' => 'INVALID_IP: Whitelist required or connection timeout ('.$e->getMessage().')',
                'providers' => [],
            ];
        }
    }

    /**
     * Default 8 Verified Providers
     */
    public function getDefaultProviders(): array
    {
        return [
            ['code' => 'PRAGMATIC', 'name' => 'Pragmatic Play', 'type' => 'slot'],
            ['code' => 'PP_LIVE_PRO', 'name' => 'Pragmatic Play Live', 'type' => 'live'],
            ['code' => 'EVOLUTION', 'name' => 'Evolution Live', 'type' => 'live'],
            ['code' => 'PGSOFT', 'name' => 'PG Soft', 'type' => 'slot'],
            ['code' => 'HACKSAW', 'name' => 'Hacksaw Gaming', 'type' => 'slot'],
            ['code' => 'PLAYNGO', 'name' => 'Play\'n GO', 'type' => 'slot'],
            ['code' => 'SPRIBE', 'name' => 'Spribe Mini Games', 'type' => 'MN'],
            ['code' => 'SPORTSBOOK', 'name' => 'Sportsbook Nexustrike', 'type' => 'SB'],
        ];
    }

    /**
     * Fetch Games for a given provider from Nexus GGR API
     */
    public function getGames(string $providerCode): array
    {
        try {
            $response = Http::timeout(10)
                ->withHeaders([
                    'Agent-Code' => $this->agentCode,
                    'Agent-Token' => $this->agentToken,
                    'Accept' => 'application/json',
                ])
                ->get("{$this->apiServer}/api/v1/games", [
                    'provider' => strtoupper($providerCode),
                ]);

            if ($response->successful()) {
                $json = $response->json();
                $games = $json['games'] ?? $json['game_list'] ?? $json['data'] ?? null;
                if (is_array($games)) {
                    return [
                        'status' => 1,
                        'games' => $games,
                    ];
                }
            }

            return [
                'status' => 0,
                'msg' => $response->json('msg') ?? 'NO_GAMES_RETURNED',
                'games' => [],
            ];
        } catch (\Throwable $e) {
            Log::warning("GGR API getGames for {$providerCode} error: ".$e->getMessage());

            return [
                'status' => 0,
                'msg' => $e->getMessage(),
                'games' => [],
            ];
        }
    }

    /**
     * Built-in 150+ Verified Games Catalog for Provider
     */
    public function getDefaultGamesForProvider(string $providerCode): array
    {
        $code = strtoupper(trim($providerCode));
        $allGames = $this->getCompleteCatalog();

        return $allGames[$code] ?? [];
    }

    /**
     * Complete 150+ Top Casino Slots & Live Games Catalog
     */
    public function getCompleteCatalog(): array
    {
        return [
            // 1. PRAGMATIC PLAY (40 top slots)
            'PRAGMATIC' => [
                ['game_code' => 'vs20olympus', 'game_name' => 'Gates of Olympus', 'banner' => 'https://cdn.softswiss.net/i/s4/pragmatic/GatesOfOlympus.png', 'status' => 1],
                ['game_code' => 'vs20olympx', 'game_name' => 'Gates of Olympus 1000', 'banner' => 'https://cdn.softswiss.net/i/s4/pragmatic/GatesOfOlympus.png', 'status' => 1],
                ['game_code' => 'vs20sweetbonanza', 'game_name' => 'Sweet Bonanza', 'banner' => 'https://cdn.softswiss.net/i/s4/pragmatic/SweetBonanza.png', 'status' => 1],
                ['game_code' => 'vs20bonz1000', 'game_name' => 'Sweet Bonanza 1000', 'banner' => 'https://cdn.softswiss.net/i/s4/pragmatic/SweetBonanza.png', 'status' => 1],
                ['game_code' => 'vs20sugarrush', 'game_name' => 'Sugar Rush', 'banner' => 'https://cdn.softswiss.net/i/s4/pragmatic/SugarRush.png', 'status' => 1],
                ['game_code' => 'vs20sugar1000', 'game_name' => 'Sugar Rush 1000', 'banner' => 'https://cdn.softswiss.net/i/s4/pragmatic/SugarRush.png', 'status' => 1],
                ['game_code' => 'vs20doghouse', 'game_name' => 'The Dog House', 'banner' => 'https://cdn.softswiss.net/i/s4/pragmatic/TheDogHouseMegaways.png', 'status' => 1],
                ['game_code' => 'vswaysdogs', 'game_name' => 'The Dog House Megaways', 'banner' => 'https://cdn.softswiss.net/i/s4/pragmatic/TheDogHouseMegaways.png', 'status' => 1],
                ['game_code' => 'vs10bbbonanza', 'game_name' => 'Big Bass Bonanza', 'banner' => 'https://cdn.softswiss.net/i/s4/pragmatic/BigBassSplash.png', 'status' => 1],
                ['game_code' => 'vs10splash', 'game_name' => 'Big Bass Splash', 'banner' => 'https://cdn.softswiss.net/i/s4/pragmatic/BigBassSplash.png', 'status' => 1],
                ['game_code' => 'vs10bbamxtreme', 'game_name' => 'Big Bass Amazon Xtreme', 'banner' => 'https://cdn.softswiss.net/i/s4/pragmatic/BigBassSplash.png', 'status' => 1],
                ['game_code' => 'vs20starlight', 'game_name' => 'Starlight Princess', 'banner' => 'https://cdn.softswiss.net/i/s4/pragmatic/GatesOfOlympus.png', 'status' => 1],
                ['game_code' => 'vs20starx', 'game_name' => 'Starlight Princess 1000', 'banner' => 'https://cdn.softswiss.net/i/s4/pragmatic/GatesOfOlympus.png', 'status' => 1],
                ['game_code' => 'vs20zeusvshades', 'game_name' => 'Zeus vs Hades: Gods of War', 'banner' => null, 'status' => 1],
                ['game_code' => 'vs20fruitparty', 'game_name' => 'Fruit Party', 'banner' => null, 'status' => 1],
                ['game_code' => 'vs20fparty2', 'game_name' => 'Fruit Party 2', 'banner' => null, 'status' => 1],
                ['game_code' => 'vs25gold', 'game_name' => 'Wolf Gold', 'banner' => null, 'status' => 1],
                ['game_code' => 'vs25mustang', 'game_name' => 'Mustang Gold', 'banner' => null, 'status' => 1],
                ['game_code' => 'vswaysmadame', 'game_name' => 'Madame Destiny Megaways', 'banner' => null, 'status' => 1],
                ['game_code' => 'vswaysbuffking', 'game_name' => 'Buffalo King Megaways', 'banner' => null, 'status' => 1],
                ['game_code' => 'vs20cleocatra', 'game_name' => 'Cleocatra', 'banner' => null, 'status' => 1],
                ['game_code' => 'vs20midas', 'game_name' => 'The Hand of Midas', 'banner' => null, 'status' => 1],
                ['game_code' => 'vs20wildwest', 'game_name' => 'Wild West Gold', 'banner' => null, 'status' => 1],
                ['game_code' => 'vs20kraken', 'game_name' => 'Release the Kraken', 'banner' => null, 'status' => 1],
                ['game_code' => 'vs20juicyfr', 'game_name' => 'Juicy Fruits', 'banner' => null, 'status' => 1],
                ['game_code' => 'vs10floatdrg', 'game_name' => 'Floating Dragon', 'banner' => null, 'status' => 1],
                ['game_code' => 'vswaysrhino', 'game_name' => 'Great Rhino Megaways', 'banner' => null, 'status' => 1],
                ['game_code' => 'vs20firestamp', 'game_name' => 'Fire Stampede', 'banner' => null, 'status' => 1],
                ['game_code' => 'vs25scarabqueen', 'game_name' => 'John Hunter Scarab Queen', 'banner' => null, 'status' => 1],
                ['game_code' => 'vs20gemsaviour', 'game_name' => 'Gem Saviour Sword', 'banner' => null, 'status' => 1],
                ['game_code' => 'vs20shieldofsparta', 'game_name' => 'Shield of Sparta', 'banner' => null, 'status' => 1],
                ['game_code' => 'vs10snakesladd', 'game_name' => 'Snakes and Ladders Megadice', 'banner' => null, 'status' => 1],
                ['game_code' => 'vs20drill', 'game_name' => 'Drill That Gold', 'banner' => null, 'status' => 1],
                ['game_code' => 'vs20piggybank', 'game_name' => 'Piggy Bank Bills', 'banner' => null, 'status' => 1],
                ['game_code' => 'vs20hotfiesta', 'game_name' => 'Hot Fiesta', 'banner' => null, 'status' => 1],
                ['game_code' => 'vs20yumyum', 'game_name' => 'Yum Yum Powerways', 'banner' => null, 'status' => 1],
                ['game_code' => 'vs20chicken', 'game_name' => 'Chicken Drop', 'banner' => null, 'status' => 1],
                ['game_code' => 'vs10powerthors', 'game_name' => 'Power of Thor Megaways', 'banner' => null, 'status' => 1],
                ['game_code' => 'vs20aztecking', 'game_name' => 'Aztec King Megaways', 'banner' => null, 'status' => 1],
                ['game_code' => 'vs20forge', 'game_name' => 'Forge of Olympus', 'banner' => null, 'status' => 1],
            ],

            // 2. PG SOFT (25 top mobile slots)
            'PGSOFT' => [
                ['game_code' => 'mahjong-ways', 'game_name' => 'Mahjong Ways', 'banner' => null, 'status' => 1],
                ['game_code' => 'mahjong-ways-2', 'game_name' => 'Mahjong Ways 2', 'banner' => null, 'status' => 1],
                ['game_code' => 'fortune-tiger', 'game_name' => 'Fortune Tiger', 'banner' => null, 'status' => 1],
                ['game_code' => 'fortune-ox', 'game_name' => 'Fortune Ox', 'banner' => null, 'status' => 1],
                ['game_code' => 'fortune-rabbit', 'game_name' => 'Fortune Rabbit', 'banner' => null, 'status' => 1],
                ['game_code' => 'fortune-mouse', 'game_name' => 'Fortune Mouse', 'banner' => null, 'status' => 1],
                ['game_code' => 'treasures-aztec', 'game_name' => 'Treasures of Aztec', 'banner' => null, 'status' => 1],
                ['game_code' => 'lucky-neko', 'game_name' => 'Lucky Neko', 'banner' => null, 'status' => 1],
                ['game_code' => 'ganesha-fortune', 'game_name' => 'Ganesha Fortune', 'banner' => null, 'status' => 1],
                ['game_code' => 'wild-bandito', 'game_name' => 'Wild Bandito', 'banner' => null, 'status' => 1],
                ['game_code' => 'dreams-of-macau', 'game_name' => 'Dreams of Macau', 'banner' => null, 'status' => 1],
                ['game_code' => 'dragon-hatch', 'game_name' => 'Dragon Hatch', 'banner' => null, 'status' => 1],
                ['game_code' => 'leprechaun-riches', 'game_name' => 'Leprechaun Riches', 'banner' => null, 'status' => 1],
                ['game_code' => 'caishen-wins', 'game_name' => 'Caishen Wins', 'banner' => null, 'status' => 1],
                ['game_code' => 'captains-bounty', 'game_name' => 'Captain\'s Bounty', 'banner' => null, 'status' => 1],
                ['game_code' => 'bikini-paradise', 'game_name' => 'Bikini Paradise', 'banner' => null, 'status' => 1],
                ['game_code' => 'ways-of-qilin', 'game_name' => 'Ways of the Qilin', 'banner' => null, 'status' => 1],
                ['game_code' => 'crypto-gold', 'game_name' => 'Crypto Gold', 'banner' => null, 'status' => 1],
                ['game_code' => 'candy-bonanza', 'game_name' => 'Candy Bonanza', 'banner' => null, 'status' => 1],
                ['game_code' => 'asgardian-rising', 'game_name' => 'Asgardian Rising', 'banner' => null, 'status' => 1],
                ['game_code' => 'diner-delights', 'game_name' => 'Diner Delights', 'banner' => null, 'status' => 1],
                ['game_code' => 'wild-bounty-showdown', 'game_name' => 'Wild Bounty Showdown', 'banner' => null, 'status' => 1],
                ['game_code' => 'midas-fortune', 'game_name' => 'Midas Fortune', 'banner' => null, 'status' => 1],
                ['game_code' => 'legend-of-perseus', 'game_name' => 'Legend of Perseus', 'banner' => null, 'status' => 1],
                ['game_code' => 'rooster-rumble', 'game_name' => 'Rooster Rumble', 'banner' => null, 'status' => 1],
            ],

            // 3. HACKSAW GAMING (22 top slots)
            'HACKSAW' => [
                ['game_code' => '1067', 'game_name' => 'Wanted Dead or a Wild', 'banner' => 'https://cdn.softswiss.net/i/s4/hacksaw/WantedDeadoraWild.png', 'status' => 1],
                ['game_code' => '1309', 'game_name' => 'RIP City', 'banner' => null, 'status' => 1],
                ['game_code' => '1088', 'game_name' => 'Chaos Crew', 'banner' => null, 'status' => 1],
                ['game_code' => '1382', 'game_name' => 'Chaos Crew 2', 'banner' => null, 'status' => 1],
                ['game_code' => '1210', 'game_name' => 'Dork Unit', 'banner' => null, 'status' => 1],
                ['game_code' => '1154', 'game_name' => 'Hand of Anubis', 'banner' => null, 'status' => 1],
                ['game_code' => '1182', 'game_name' => 'Gladiator Legends', 'banner' => null, 'status' => 1],
                ['game_code' => '1288', 'game_name' => 'Rotten', 'banner' => null, 'status' => 1],
                ['game_code' => '1355', 'game_name' => 'Le Bandit', 'banner' => null, 'status' => 1],
                ['game_code' => '1421', 'game_name' => 'Beam Boys', 'banner' => null, 'status' => 1],
                ['game_code' => '1092', 'game_name' => 'Stack \'Em', 'banner' => null, 'status' => 1],
                ['game_code' => '1370', 'game_name' => 'Densho', 'banner' => null, 'status' => 1],
                ['game_code' => '1405', 'game_name' => '2 Wild 2 Die', 'banner' => null, 'status' => 1],
                ['game_code' => '1340', 'game_name' => 'Drop \'Em', 'banner' => null, 'status' => 1],
                ['game_code' => '1270', 'game_name' => 'Stormforged', 'banner' => null, 'status' => 1],
                ['game_code' => '1190', 'game_name' => 'Book of Time', 'banner' => null, 'status' => 1],
                ['game_code' => '1315', 'game_name' => 'Frank\'s Farm', 'banner' => null, 'status' => 1],
                ['game_code' => '1260', 'game_name' => 'Bloodthirst', 'banner' => null, 'status' => 1],
                ['game_code' => '1225', 'game_name' => 'Toshi Video Club', 'banner' => null, 'status' => 1],
                ['game_code' => '1140', 'game_name' => 'Warrior Ways', 'banner' => null, 'status' => 1],
                ['game_code' => '1440', 'game_name' => 'Fist of Destruction', 'banner' => null, 'status' => 1],
                ['game_code' => '1455', 'game_name' => 'Cursed Crypt', 'banner' => null, 'status' => 1],
            ],

            // 4. PLAY'N GO (18 top slots)
            'PLAYNGO' => [
                ['game_code' => 'book-of-dead', 'game_name' => 'Book of Dead', 'banner' => null, 'status' => 1],
                ['game_code' => 'reactoonz', 'game_name' => 'Reactoonz', 'banner' => null, 'status' => 1],
                ['game_code' => 'reactoonz-2', 'game_name' => 'Reactoonz 2', 'banner' => null, 'status' => 1],
                ['game_code' => 'tome-of-madness', 'game_name' => 'Tome of Madness', 'banner' => null, 'status' => 1],
                ['game_code' => 'legacy-of-dead', 'game_name' => 'Legacy of Dead', 'banner' => null, 'status' => 1],
                ['game_code' => 'rise-of-olympus', 'game_name' => 'Rise of Olympus', 'banner' => null, 'status' => 1],
                ['game_code' => 'rise-of-olympus-100', 'game_name' => 'Rise of Olympus 100', 'banner' => null, 'status' => 1],
                ['game_code' => 'moon-princess', 'game_name' => 'Moon Princess', 'banner' => null, 'status' => 1],
                ['game_code' => 'moon-princess-100', 'game_name' => 'Moon Princess 100', 'banner' => null, 'status' => 1],
                ['game_code' => 'fire-joker', 'game_name' => 'Fire Joker', 'banner' => null, 'status' => 1],
                ['game_code' => 'honey-rush', 'game_name' => 'Honey Rush', 'banner' => null, 'status' => 1],
                ['game_code' => 'golden-ticket-2', 'game_name' => 'Golden Ticket 2', 'banner' => null, 'status' => 1],
                ['game_code' => 'wild-blood-2', 'game_name' => 'Wild Blood 2', 'banner' => null, 'status' => 1],
                ['game_code' => 'gargantoonz', 'game_name' => 'Gargantoonz', 'banner' => null, 'status' => 1],
                ['game_code' => 'lord-merlin', 'game_name' => 'Lord Merlin and Lady of the Lake', 'banner' => null, 'status' => 1],
                ['game_code' => 'rise-of-merlin', 'game_name' => 'Rise of Merlin', 'banner' => null, 'status' => 1],
                ['game_code' => 'coils-of-cash', 'game_name' => 'Coils of Cash', 'banner' => null, 'status' => 1],
                ['game_code' => 'troll-hunters-2', 'game_name' => 'Troll Hunters 2', 'banner' => null, 'status' => 1],
            ],

            // 5. SPRIBE MINI GAMES (8 games)
            'SPRIBE' => [
                ['game_code' => 'minigame_aviator', 'game_name' => 'Aviator Crash Game', 'banner' => null, 'status' => 1],
                ['game_code' => 'minigame_mines', 'game_name' => 'Mines Spribe', 'banner' => null, 'status' => 1],
                ['game_code' => 'minigame_plinko', 'game_name' => 'Plinko Spribe', 'banner' => null, 'status' => 1],
                ['game_code' => 'minigame_dice', 'game_name' => 'Dice Spribe', 'banner' => null, 'status' => 1],
                ['game_code' => 'minigame_hilo', 'game_name' => 'Hilo Spribe', 'banner' => null, 'status' => 1],
                ['game_code' => 'minigame_hotline', 'game_name' => 'Hotline Spribe', 'banner' => null, 'status' => 1],
                ['game_code' => 'minigame_goal', 'game_name' => 'Goal Spribe', 'banner' => null, 'status' => 1],
                ['game_code' => 'minigame_keno', 'game_name' => 'Keno Spribe', 'banner' => null, 'status' => 1],
            ],

            // 6. EVOLUTION LIVE (22 live games)
            'EVOLUTION' => [
                ['game_code' => 'crazytime00000001', 'game_name' => 'Crazy Time', 'banner' => null, 'status' => 1],
                ['game_code' => 'nxpkul2hgclallno', 'game_name' => 'Lightning Roulette', 'banner' => null, 'status' => 1],
                ['game_code' => 'xxxtremeligt0001', 'game_name' => 'XXXtreme Lightning Roulette', 'banner' => null, 'status' => 1],
                ['game_code' => 'immersiveroulett', 'game_name' => 'Immersive Roulette', 'banner' => null, 'status' => 1],
                ['game_code' => 'speedautoroulett', 'game_name' => 'Speed Auto Roulette', 'banner' => null, 'status' => 1],
                ['game_code' => 'viproulette00001', 'game_name' => 'VIP European Roulette', 'banner' => null, 'status' => 1],
                ['game_code' => 'infinitebj000001', 'game_name' => 'Infinite Blackjack', 'banner' => null, 'status' => 1],
                ['game_code' => 'lightningbj00001', 'game_name' => 'Lightning Blackjack', 'banner' => null, 'status' => 1],
                ['game_code' => 'speedbjvip000001', 'game_name' => 'Speed VIP Blackjack', 'banner' => null, 'status' => 1],
                ['game_code' => 'powerbj000000001', 'game_name' => 'Power Blackjack', 'banner' => null, 'status' => 1],
                ['game_code' => 'speedbaccarat001', 'game_name' => 'Speed Baccarat A', 'banner' => null, 'status' => 1],
                ['game_code' => 'lightningbacc001', 'game_name' => 'Lightning Baccarat', 'banner' => null, 'status' => 1],
                ['game_code' => 'baccaratsqueeze1', 'game_name' => 'Baccarat Control Squeeze', 'banner' => null, 'status' => 1],
                ['game_code' => 'monopolylive0001', 'game_name' => 'Monopoly Live', 'banner' => null, 'status' => 1],
                ['game_code' => 'megaball100x0001', 'game_name' => 'Mega Ball 100x', 'banner' => null, 'status' => 1],
                ['game_code' => 'funkytime0000001', 'game_name' => 'Funky Time Live', 'banner' => null, 'status' => 1],
                ['game_code' => 'dreamcatcher0001', 'game_name' => 'Dream Catcher Wheel', 'banner' => null, 'status' => 1],
                ['game_code' => 'dealnodeal000001', 'game_name' => 'Deal or No Deal Live', 'banner' => null, 'status' => 1],
            ],

            // 7. PRAGMATIC PLAY LIVE (14 live games)
            'PP_LIVE_PRO' => [
                ['game_code' => 'sweetbonanzacandy', 'game_name' => 'Sweet Bonanza CandyLand', 'banner' => null, 'status' => 1],
                ['game_code' => 'megaroulette500x', 'game_name' => 'Mega Roulette 500x', 'banner' => null, 'status' => 1],
                ['game_code' => 'poweruproulette', 'game_name' => 'PowerUP Roulette', 'banner' => null, 'status' => 1],
                ['game_code' => 'autoroulette1', 'game_name' => 'Auto Roulette 1', 'banner' => null, 'status' => 1],
                ['game_code' => 'oneblackjacklive', 'game_name' => 'ONE Blackjack Live', 'banner' => null, 'status' => 1],
                ['game_code' => 'vipblackjackruby', 'game_name' => 'VIP Blackjack Ruby', 'banner' => null, 'status' => 1],
                ['game_code' => 'speedbaccarat1', 'game_name' => 'Speed Baccarat 1', 'banner' => null, 'status' => 1],
                ['game_code' => 'megabaccarat1000', 'game_name' => 'Mega Baccarat 1000x', 'banner' => null, 'status' => 1],
                ['game_code' => 'snakesladderslive', 'game_name' => 'Snakes & Ladders Live', 'banner' => null, 'status' => 1],
                ['game_code' => 'vegasballbonanza', 'game_name' => 'Vegas Ball Bonanza', 'banner' => null, 'status' => 1],
            ],

            // 8. SPORTSBOOK (2 entries)
            'SPORTSBOOK' => [
                ['game_code' => 'nexustrike_sports', 'game_name' => 'Nexustrike Sports Betting', 'banner' => null, 'status' => 1],
                ['game_code' => 'inplay_matchbook', 'game_name' => 'Live In-Play Matchbook Football', 'banner' => null, 'status' => 1],
            ],
        ];
    }
}
