<?php

namespace Tests\Feature;

use App\Models\GameTransaction;
use App\Models\Jackpot;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SeamlessWalletGoldApiTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected Jackpot $jackpot;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::create([
            'name' => 'Tester John',
            'email' => 'tester@crowdplay.com',
            'user_code' => 'user_100',
            'game_balance' => 1000.00,
            'rtp' => 95,
            'password' => bcrypt('secret'),
        ]);

        $this->jackpot = Jackpot::create([
            'name' => 'Grand Progressive Jackpot',
            'current_pool' => 50000.00,
            'base_pool' => 10000.00,
            'cut_percentage' => 0.0050,
        ]);
    }

    public function test_webhook_always_returns_http_200_on_user_balance(): void
    {
        $response = $this->postJson('/gold_api', [
            'method' => 'user_balance',
            'agent_code' => 'crowdplay',
            'agent_token' => 'c9540f990614ec0e60efa22d4c5fe5fe',
            'user_code' => 'user_100',
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'status' => 1,
            'msg' => 'SUCCESS',
            'user_balance' => 1000.00,
            'balance' => 1000.00,
        ]);
    }

    public function test_webhook_returns_http_200_even_when_user_not_found(): void
    {
        $response = $this->postJson('/gold_api', [
            'method' => 'user_balance',
            'agent_code' => 'crowdplay',
            'agent_token' => 'c9540f990614ec0e60efa22d4c5fe5fe',
            'user_code' => 'non_existent_code',
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'status' => 0,
            'msg' => 'USER_NOT_FOUND',
        ]);
    }

    public function test_webhook_processes_spin_transaction_atomically(): void
    {
        $response = $this->postJson('/gold_api', [
            'method' => 'transaction',
            'agent_code' => 'crowdplay',
            'agent_token' => 'c9540f990614ec0e60efa22d4c5fe5fe',
            'user_code' => 'user_100',
            'game_code' => 'vs20olympgate',
            'provider_code' => 'PRAGMATIC',
            'bet_money' => 10.00,
            'win_money' => 25.50,
            'txn_id' => 'txn_test_1',
            'txn_id_v2' => 'txn_test_1_v2',
            'round_id' => 'rnd_test_1',
            'txn_type' => 'debit_credit',
        ]);

        $response->assertStatus(200);
        // 1000 - 10 + 25.50 = 1015.50
        $response->assertJson([
            'status' => 1,
            'msg' => 'SUCCESS',
            'user_balance' => 1015.50,
            'balance' => 1015.50,
        ]);

        $this->user->refresh();
        $this->assertEquals(1015.50, (float) $this->user->game_balance);

        // Verify Progressive Jackpot increased by 0.5% of €10.00 (= €0.05)
        $this->jackpot->refresh();
        $this->assertEquals(50000.05, (float) $this->jackpot->current_pool);

        // Verify transaction record exists
        $this->assertDatabaseHas('game_transactions', [
            'txn_id' => 'txn_test_1',
            'user_code' => 'user_100',
            'bet_money' => 10.00,
            'win_money' => 25.50,
        ]);
    }

    public function test_webhook_idempotency_prevents_duplicate_charge(): void
    {
        // First spin call
        $this->postJson('/gold_api', [
            'method' => 'transaction',
            'agent_code' => 'crowdplay',
            'agent_token' => 'c9540f990614ec0e60efa22d4c5fe5fe',
            'user_code' => 'user_100',
            'game_code' => 'vs20olympgate',
            'bet_money' => 50.00,
            'win_money' => 0.00,
            'txn_id' => 'txn_duplicate_test',
            'txn_id_v2' => 'txn_duplicate_test_v2',
            'round_id' => 'rnd_dup_1',
        ]);

        $this->user->refresh();
        $this->assertEquals(950.00, (float) $this->user->game_balance);

        // Duplicate second spin call with identical txn_id
        $duplicateResponse = $this->postJson('/gold_api', [
            'method' => 'transaction',
            'agent_code' => 'crowdplay',
            'agent_token' => 'c9540f990614ec0e60efa22d4c5fe5fe',
            'user_code' => 'user_100',
            'game_code' => 'vs20olympgate',
            'bet_money' => 50.00,
            'win_money' => 0.00,
            'txn_id' => 'txn_duplicate_test',
            'txn_id_v2' => 'txn_duplicate_test_v2',
            'round_id' => 'rnd_dup_1',
        ]);

        $duplicateResponse->assertStatus(200);
        $duplicateResponse->assertJson([
            'status' => 1,
            'msg' => 'SUCCESS',
            'user_balance' => 950.00,
        ]);

        // Balance should NOT be deducted a second time
        $this->user->refresh();
        $this->assertEquals(950.00, (float) $this->user->game_balance);
        $this->assertEquals(1, GameTransaction::where('txn_id', 'txn_duplicate_test')->count());
    }

    public function test_webhook_returns_insufficient_funds_with_http_200(): void
    {
        $response = $this->postJson('/gold_api', [
            'method' => 'transaction',
            'agent_code' => 'crowdplay',
            'agent_token' => 'c9540f990614ec0e60efa22d4c5fe5fe',
            'user_code' => 'user_100',
            'bet_money' => 5000.00, // User only has 1000.00
            'win_money' => 0.00,
            'txn_id' => 'txn_insufficient',
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'status' => 0,
            'msg' => 'INSUFFICIENT_USER_FUNDS',
            'user_balance' => 1000.00,
        ]);

        $this->user->refresh();
        $this->assertEquals(1000.00, (float) $this->user->game_balance);
    }
}
