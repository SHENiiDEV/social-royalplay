<?php

namespace Tests\Feature;

use App\Models\Game;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class CasinoBonusAndAdminTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::create([
            'name' => 'Bonus Tester',
            'email' => 'bonus@crowdplay.com',
            'user_code' => 'user_200',
            'game_balance' => 50.00,
            'rtp' => 95,
            'is_admin' => false,
            'password' => bcrypt('secret'),
        ]);

        $this->admin = User::create([
            'name' => 'Admin Tester',
            'email' => 'admin@crowdplay.com',
            'user_code' => 'admin_1',
            'game_balance' => 10000.00,
            'rtp' => 95,
            'is_admin' => true,
            'password' => bcrypt('secret'),
        ]);
    }

    public function test_user_can_claim_free_daily_bonus(): void
    {
        $response = $this->actingAs($this->user)->postJson('/api/bonus/daily');

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'bonus_amount' => 1.00,
            'new_balance' => 51.00,
        ]);

        $this->user->refresh();
        $this->assertEquals(51.00, (float) $this->user->game_balance);
        $this->assertNotNull($this->user->last_daily_bonus_at);

        // Attempting to claim again immediately should fail with 422 cooldown error
        $secondAttempt = $this->actingAs($this->user)->postJson('/api/bonus/daily');
        $secondAttempt->assertStatus(422);
        $secondAttempt->assertJson([
            'success' => false,
        ]);
    }

    public function test_user_can_spin_wheel_of_fortune(): void
    {
        $response = $this->actingAs($this->user)->postJson('/api/bonus/wheel');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'success',
            'sector_index',
            'prize_amount',
            'prize_label',
            'new_balance',
        ]);

        $this->user->refresh();
        $this->assertGreaterThan(50.00, (float) $this->user->game_balance);
        $this->assertNotNull($this->user->last_wheel_spin_at);

        // Second spin within 24h should fail
        $secondSpin = $this->actingAs($this->user)->postJson('/api/bonus/wheel');
        $secondSpin->assertStatus(422);
    }

    public function test_admin_can_update_user_rtp(): void
    {
        $response = $this->actingAs($this->admin)->postJson('/admin/rtp', [
            'user_id' => $this->user->id,
            'rtp' => 500, // Streamer Mega Win 500%
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
        ]);

        $this->user->refresh();
        $this->assertEquals(500, $this->user->rtp);
    }

    public function test_admin_cannot_set_invalid_rtp(): void
    {
        $response = $this->actingAs($this->admin)->postJson('/admin/rtp', [
            'user_id' => $this->user->id,
            'rtp' => 1234, // Not in allowed list
        ]);

        $response->assertStatus(422);
    }

    public function test_admin_can_block_and_unblock_user(): void
    {
        // 1. Block user
        $response = $this->actingAs($this->admin)->postJson('/admin/ban', [
            'user_id' => $this->user->id,
            'is_banned' => true,
            'reason' => 'Вы были заблокированы, и ваши данные будут отправлены в полицию для проведения процессуальной проверки.',
        ]);

        if ($response->status() !== 200) {
            dump($response->json());
        }

        $response->assertStatus(200);
        $response->assertJson(['success' => true]);

        $this->user->refresh();
        $this->assertTrue((bool) $this->user->is_banned);
        $this->assertStringContainsString('полицию', $this->user->ban_reason);

        // 2. Banned user receives 403 / banned error on API calls
        $apiResponse = $this->actingAs($this->user)->postJson('/api/bonus/daily');
        $apiResponse->assertStatus(403);
        $apiResponse->assertJson([
            'error' => 'ACCOUNT_BLOCKED',
        ]);

        // 3. Webhook for banned user returns HTTP 200 with status 0 USER_BLOCKED
        $webhookResponse = $this->postJson('/gold_api', [
            'method' => 'user_balance',
            'agent_code' => 'crowdplay',
            'agent_token' => 'c9540f990614ec0e60efa22d4c5fe5fe',
            'user_code' => $this->user->user_code,
        ]);
        $webhookResponse->assertStatus(200);
        $webhookResponse->assertJson([
            'status' => 0,
            'msg' => 'USER_BLOCKED',
        ]);

        // 4. Unblock user
        $unblockResponse = $this->actingAs($this->admin)->postJson('/admin/ban', [
            'user_id' => $this->user->id,
            'is_banned' => false,
        ]);

        if ($unblockResponse->status() !== 200) {
            dump('UNBLOCK ERROR:', $unblockResponse->json());
        }

        $unblockResponse->assertStatus(200);
        $this->user->refresh();
        $this->assertFalse((bool) $this->user->is_banned);
    }

    public function test_admin_can_block_user_with_official_notice_details(): void
    {
        $response = $this->actingAs($this->admin)->postJson('/admin/ban', [
            'user_id' => $this->user->id,
            'is_banned' => true,
            'first_name' => 'Alexander',
            'last_name' => 'Vance',
            'case_number' => 'CR-89410294',
            'reason' => 'Your account has been blocked due to suspicious activity identified during a security review, which may indicate fraudulent activity.',
        ]);

        $response->assertStatus(200);
        $response->assertJson(['success' => true]);

        $this->user->refresh();
        $this->assertTrue((bool) $this->user->is_banned);
        $this->assertEquals('Alexander', $this->user->ban_first_name);
        $this->assertEquals('Vance', $this->user->ban_last_name);
        $this->assertEquals('CR-89410294', $this->user->ban_case_number);
        $this->assertEquals('Alexander Vance', $this->user->getBanFullName());
        $this->assertEquals('CR-89410294', $this->user->getEffectiveCaseNumber());
        $this->assertStringContainsString('fraudulent activity', $this->user->ban_reason);
    }

    public function test_admin_can_toggle_user_ban_via_route_parameter(): void
    {
        $response = $this->actingAs($this->admin)->post("/admin/users/{$this->user->id}/toggle", [
            'first_name' => 'Michael',
            'last_name' => 'Scott',
            'case_number' => 'CAS-99887766',
        ]);

        $response->assertStatus(302);
        $this->user->refresh();
        $this->assertTrue((bool) $this->user->is_banned);
        $this->assertEquals('Michael', $this->user->ban_first_name);
        $this->assertEquals('Scott', $this->user->ban_last_name);
        $this->assertEquals('CAS-99887766', $this->user->ban_case_number);

        // Toggle back to unban
        $unbanResponse = $this->actingAs($this->admin)->post("/admin/users/{$this->user->id}/toggle");
        $unbanResponse->assertStatus(302);
        $this->user->refresh();
        $this->assertFalse((bool) $this->user->is_banned);

        // Toggle user 8 specifically
        $toggle8 = $this->actingAs($this->admin)->post('/admin/users/8/toggle', [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'case_number' => 'CR-888888',
        ]);
        $toggle8->assertStatus(302);
        $user8 = User::find(8);
        $this->assertNotNull($user8);
        $this->assertTrue((bool) $user8->is_banned);
        $this->assertEquals('CR-888888', $user8->ban_case_number);
    }

    public function test_banned_user_visiting_home_page_renders_banned_notice(): void
    {
        $this->user->update([
            'is_banned' => true,
            'ban_first_name' => 'Mihail',
            'ban_last_name' => 'Segins',
            'ban_case_number' => 'CR-2026-98421049',
            'ban_reason' => 'Your account has been blocked due to suspicious activity identified during a security review, which may indicate fraudulent activity.',
        ]);

        $response = $this->actingAs($this->user)->get('/');
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Banned')
            ->has('user')
            ->where('user.ban_first_name', 'Mihail')
            ->where('user.ban_last_name', 'Segins')
            ->where('user.ban_case_number', 'CR-2026-98421049')
        );
    }

    public function test_user_can_register_with_email_and_password(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'Casino',
            'surname' => 'Tester',
            'email' => 'tester'.uniqid().'@royalplay.com',
            'password' => 'secret1234',
            'phone' => '+491701234567',
            'date_of_birth' => '1995-06-15',
            'address_line' => 'Alexanderplatz 1',
            'city' => 'Berlin',
            'country' => 'Germany',
            'postal_code' => '10178',
            'terms' => true,
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
        ]);

        $this->assertAuthenticated();
        $user = Auth::user();
        $this->assertEquals(0.00, (float) $user->game_balance);
        $this->assertEquals('Tester', $user->surname);
        $this->assertEquals('Germany', $user->country);
        $this->assertNotNull($user->user_code);
    }

    public function test_registration_blocks_restricted_countries(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'Restricted',
            'surname' => 'User',
            'email' => 'restricted'.uniqid().'@domain.com',
            'password' => 'secret1234',
            'country' => 'Russia',
            'terms' => true,
        ]);

        $response->assertStatus(422);
        $response->assertJson([
            'success' => false,
            'message' => 'Registration is restricted in the selected country/region.',
        ]);
    }

    public function test_user_can_login_with_credentials(): void
    {
        $email = 'logintest'.uniqid().'@royalplay.com';
        $user = User::create([
            'name' => 'Login Tester',
            'email' => $email,
            'password' => Hash::make('password123'),
            'user_code' => 'user_test_'.rand(1000, 9999),
            'game_balance' => 300.00,
        ]);

        $response = $this->postJson('/api/auth/login', [
            'login' => $email,
            'password' => 'password123',
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
        ]);
        $this->assertAuthenticatedAs($user);
    }

    public function test_games_can_be_synced_from_nexus(): void
    {
        $this->artisan('games:sync-nexus')
            ->assertSuccessful();

        $this->assertGreaterThan(0, Game::count());
        $this->assertDatabaseHas('games', [
            'provider_code' => 'pragmatic',
            'game_code' => 'vs20olympgate',
        ]);
    }
}
