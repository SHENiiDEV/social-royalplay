<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('games', function (Blueprint $table) {
            $table->string('provider_game_id', 191)->nullable()->index()->after('id');
            $table->string('title')->nullable()->after('name');
            $table->string('game_type', 32)->default('slot')->after('category');
            $table->text('banner')->nullable()->after('cover_image');
            $table->boolean('is_recommended')->default(false)->after('is_featured');
            $table->integer('sort_order')->default(0)->after('play_count');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('games', function (Blueprint $table) {
            $table->dropColumn([
                'provider_game_id',
                'title',
                'game_type',
                'banner',
                'is_recommended',
                'sort_order',
            ]);
        });
    }
};
