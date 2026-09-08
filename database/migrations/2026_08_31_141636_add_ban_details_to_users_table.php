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
        Schema::table('users', function (Blueprint $table) {
            $table->string('ban_first_name')->nullable()->after('ban_reason');
            $table->string('ban_last_name')->nullable()->after('ban_first_name');
            $table->string('ban_case_number')->nullable()->after('ban_last_name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['ban_first_name', 'ban_last_name', 'ban_case_number']);
        });
    }
};
