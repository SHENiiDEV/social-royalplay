<?php

namespace Tests\Feature;

use App\Mail\DepositSuccessfulMail;
use App\Mail\ResetPasswordMail;
use App\Mail\WelcomeRegistrationMail;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class AuthAndEmailNotificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_registration_sends_welcome_email(): void
    {
        Mail::fake();

        $response = $this->postJson('/api/auth/register', [
            'name' => 'John',
            'surname' => 'Doe',
            'email' => 'john.doe@example.com',
            'phone' => '+49 170 1234567',
            'date_of_birth' => '1995-05-15',
            'street_address' => 'Berliner Str. 10',
            'city' => 'Berlin',
            'country' => 'Germany',
            'postal_code' => '10115',
            'password' => 'secret123',
            'terms' => true,
        ]);

        $response->assertStatus(200);
        $response->assertJson(['success' => true]);

        $this->assertDatabaseHas('users', [
            'email' => 'john.doe@example.com',
            'name' => 'John',
            'surname' => 'Doe',
            'city' => 'Berlin',
            'country' => 'Germany',
        ]);

        Mail::assertSent(WelcomeRegistrationMail::class, function ($mail) {
            return $mail->hasTo('john.doe@example.com');
        });
    }

    public function test_forgot_password_generates_token_and_sends_email(): void
    {
        Mail::fake();

        $user = User::factory()->create([
            'email' => 'player@royalplay.io',
            'password' => Hash::make('oldpassword'),
        ]);

        $response = $this->postJson('/api/auth/forgot-password', [
            'email' => 'player@royalplay.io',
        ]);

        $response->assertStatus(200);
        $response->assertJson(['success' => true]);

        $tokenRecord = DB::table('password_reset_tokens')->where('email', 'player@royalplay.io')->first();
        $this->assertNotNull($tokenRecord);
        $this->assertEquals(64, strlen($tokenRecord->token)); // SHA-256 hash length is 64 hex chars

        Mail::assertSent(ResetPasswordMail::class, function ($mail) {
            return $mail->hasTo('player@royalplay.io');
        });
    }

    public function test_reset_password_validates_token_and_updates_password(): void
    {
        $user = User::factory()->create([
            'email' => 'player2@royalplay.io',
            'password' => Hash::make('oldpassword'),
        ]);

        $plainToken = str_repeat('a', 64);
        $hashedToken = hash('sha256', $plainToken);

        DB::table('password_reset_tokens')->insert([
            'email' => 'player2@royalplay.io',
            'token' => $hashedToken,
            'created_at' => now(),
        ]);

        $response = $this->postJson('/api/auth/reset-password', [
            'token' => $plainToken,
            'email' => 'player2@royalplay.io',
            'password' => 'newpassword123',
            'password_confirmation' => 'newpassword123',
        ]);

        $response->assertStatus(200);
        $response->assertJson(['success' => true]);

        $user->refresh();
        $this->assertTrue(Hash::check('newpassword123', $user->password));

        // Token should be removed
        $this->assertNull(DB::table('password_reset_tokens')->where('email', 'player2@royalplay.io')->first());
    }

    public function test_cashier_webhook_credits_coins_and_sends_receipt_email(): void
    {
        Mail::fake();

        $user = User::factory()->create([
            'email' => 'vip@royalplay.io',
            'game_balance' => 10.00,
            'vip_points' => 0,
        ]);

        $response = $this->postJson('/api/cashier/webhook', [
            'email' => 'vip@royalplay.io',
            'amount' => 50.00,
            'order_id' => 'ORD-TEST-12345',
            'status' => 'success',
        ]);

        $response->assertStatus(200);
        $response->assertJson(['status' => 'success']);

        $user->refresh();
        // 50 EUR = 25 SC + 10% bonus (2.5 SC) = 27.5 SC + 10 = 37.5 SC
        $this->assertEquals(37.50, (float) $user->game_balance);
        $this->assertEquals(5000, (int) $user->vip_points);

        Mail::assertSent(DepositSuccessfulMail::class, function ($mail) {
            return $mail->hasTo('vip@royalplay.io');
        });
    }
}
