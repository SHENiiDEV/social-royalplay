<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('games', function (Blueprint $table) {
            $table->id();
            $table->string('provider_code')->index(); // PRAGMATIC, PGSOFT, HACKSAW, AMUSNET, EVOPLAY, NETENT, NO_LIMIT, RELAX
            $table->string('game_code')->index();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('cover_image')->nullable();
            $table->string('category')->default('slots'); // slots, popular, buy_feature, megaways, live, jackpots, new
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_active')->default(true);
            $table->string('rtp_display')->default('96.50%');
            $table->string('volatility')->default('High');
            $table->decimal('min_bet', 10, 2)->default(0.20);
            $table->decimal('max_bet', 10, 2)->default(100.00);
            $table->integer('max_multiplier')->default(5000);
            $table->integer('play_count')->default(0);
            $table->json('tags')->nullable();
            $table->timestamps();
        });

        Schema::create('game_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('user_code')->index();
            $table->string('agent_code')->nullable();
            $table->string('provider_code')->nullable();
            $table->string('game_code')->nullable();
            $table->string('txn_id')->index();
            $table->string('txn_id_v2')->nullable()->index();
            $table->string('round_id')->nullable()->index();
            $table->string('txn_type')->default('debit_credit'); // debit_credit, debit, credit
            $table->decimal('bet_money', 14, 2)->default(0.00);
            $table->decimal('win_money', 14, 2)->default(0.00);
            $table->decimal('net_money', 14, 2)->default(0.00);
            $table->decimal('user_balance_before', 14, 2)->default(0.00);
            $table->decimal('user_balance_after', 14, 2)->default(0.00);
            $table->boolean('is_jackpot_win')->default(false);
            $table->longText('raw_payload')->nullable();
            $table->timestamps();
        });

        Schema::create('jackpots', function (Blueprint $table) {
            $table->id();
            $table->string('name')->default('Grand Progressive Jackpot');
            $table->decimal('current_pool', 14, 2)->default(38450.40);
            $table->decimal('base_pool', 14, 2)->default(10000.00);
            $table->decimal('cut_percentage', 6, 4)->default(0.0050); // 0.5%
            $table->foreignId('last_winner_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('last_winner_name')->nullable();
            $table->decimal('last_win_amount', 14, 2)->nullable();
            $table->timestamp('last_won_at')->nullable();
            $table->timestamps();
        });

        Schema::create('bonus_claims', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('type'); // daily_free, wheel_of_fortune, store_pack, promo_code
            $table->decimal('amount', 14, 2);
            $table->json('details')->nullable();
            $table->timestamps();
        });

        Schema::create('live_community_wins', function (Blueprint $table) {
            $table->id();
            $table->string('user_code')->nullable();
            $table->string('player_name');
            $table->string('avatar')->nullable();
            $table->string('game_name');
            $table->string('game_code');
            $table->string('provider_code');
            $table->string('cover_image')->nullable();
            $table->decimal('bet_amount', 14, 2)->default(1.00);
            $table->decimal('win_amount', 14, 2);
            $table->decimal('multiplier', 10, 2)->default(1.00);
            $table->string('tier'); // epic, mega, big, win, standard
            $table->boolean('is_simulated')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('live_community_wins');
        Schema::dropIfExists('bonus_claims');
        Schema::dropIfExists('jackpots');
        Schema::dropIfExists('game_transactions');
        Schema::dropIfExists('games');
    }
};
