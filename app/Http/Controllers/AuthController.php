<?php

namespace App\Http\Controllers;

use App\Mail\ResetPasswordMail;
use App\Mail\WelcomeRegistrationMail;
use App\Models\User;
use App\Services\CountryList;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class AuthController extends Controller
{
    /**
     * Quick Switch / Switch User Profile (for testing & demo players)
     */
    public function switchUser(Request $request): JsonResponse
    {
        $userId = $request->input('user_id');
        $user = User::find($userId);

        if (! $user) {
            return response()->json(['success' => false, 'message' => 'User not found'], 404);
        }

        Auth::login($user);

        return response()->json([
            'success' => true,
            'message' => "Switched to {$user->name}",
            'user' => $user,
        ]);
    }

    /**
     * Create or Login new guest player
     */
    public function registerGuest(Request $request): JsonResponse
    {
        $name = $request->input('name', 'Player '.rand(100, 999));
        $userCode = User::generateUniqueUserCode('GUEST');

        $user = User::create([
            'name' => $name,
            'email' => Str::slug($name, '').'_'.rand(1000, 9999).'@royalplay.io',
            'user_code' => $userCode,
            'game_balance' => 0.00,
            'rtp' => 95,
            'password' => Hash::make('secret123'),
        ]);

        Auth::login($user);

        return response()->json([
            'success' => true,
            'message' => 'Guest account created successfully.',
            'user' => $user,
        ]);
    }

    /**
     * Standard User Registration
     */
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:60',
            'surname' => 'nullable|string|max:60',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:6',
            'phone' => 'nullable|string|max:30',
            'date_of_birth' => 'nullable|date|before_or_equal:'.now()->subYears(18)->format('Y-m-d'),
            'address_line' => 'nullable|string|max:255',
            'street_address' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:30',
            'terms' => 'accepted',
        ], [
            'date_of_birth.before_or_equal' => 'You must be at least 18 years old to register.',
            'terms.accepted' => 'You must agree to the Terms & Conditions and Privacy Policy.',
        ]);

        if (! empty($validated['country']) && ! CountryList::isAllowed($validated['country'])) {
            return response()->json([
                'success' => false,
                'message' => 'Registration is restricted in the selected country/region.',
            ], 422);
        }

        $userCode = User::generateUniqueUserCode('RP');

        $user = User::create([
            'name' => trim($validated['name']),
            'surname' => isset($validated['surname']) ? trim($validated['surname']) : null,
            'email' => strtolower(trim($validated['email'])),
            'phone' => $validated['phone'] ?? null,
            'date_of_birth' => $validated['date_of_birth'] ?? null,
            'address_line' => $validated['street_address'] ?? $validated['address_line'] ?? null,
            'city' => $validated['city'] ?? null,
            'country' => $validated['country'] ?? null,
            'postal_code' => $validated['postal_code'] ?? null,
            'terms_accepted_at' => now(),
            'password' => Hash::make($validated['password']),
            'user_code' => $userCode,
            'game_balance' => 0.00,
            'rtp' => 95,
            'avatar' => 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
            'vip_level' => 1,
            'vip_points' => 0,
        ]);

        Auth::login($user);

        try {
            Mail::to($user->email)->send(new WelcomeRegistrationMail($user));
        } catch (\Throwable $e) {
            Log::error('Failed to send welcome email: '.$e->getMessage());
        }

        return response()->json([
            'success' => true,
            'message' => 'Registration successful! Welcome to RoyalPlay.',
            'user' => $user,
        ]);
    }

    /**
     * Standard User Login
     */
    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'login' => 'required|string',
            'password' => 'required|string',
        ]);

        $loginInput = trim($credentials['login']);
        $password = $credentials['password'];

        $user = User::where('email', strtolower($loginInput))
            ->orWhere('user_code', $loginInput)
            ->orWhere('name', $loginInput)
            ->first();

        if (! $user || ! Hash::check($password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid email/username or password. Please try again.',
            ], 422);
        }

        Auth::login($user, (bool) $request->boolean('remember', true));

        return response()->json([
            'success' => true,
            'message' => "Welcome back, {$user->name}!",
            'user' => $user,
        ]);
    }

    /**
     * Direct one-click login by email, user_code, or ID
     */
    public function loginAs(string $user)
    {
        $targetUser = User::where('email', $user)
            ->orWhere('user_code', $user)
            ->orWhere('id', is_numeric($user) ? (int) $user : 0)
            ->first();

        if ($targetUser) {
            Auth::login($targetUser);
        }

        return redirect('/');
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        if ($request->wantsJson()) {
            return response()->json(['success' => true]);
        }

        return redirect('/');
    }

    /**
     * Request Password Reset Link via Email
     */
    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $email = strtolower(trim($request->input('email')));
        $user = User::where('email', $email)->first();

        if (! $user) {
            // Return identical message for security (prevent email enumeration)
            return response()->json([
                'success' => true,
                'message' => 'If this email address is registered, a password reset link has been sent.',
            ]);
        }

        // Generate 64-character token and store SHA-256 hash in password_reset_tokens
        $plainToken = Str::random(64);
        $hashedToken = hash('sha256', $plainToken);

        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $user->email],
            [
                'token' => $hashedToken,
                'created_at' => now(),
            ]
        );

        $resetUrl = url("/reset-password/{$plainToken}?email=".urlencode($user->email));

        try {
            Mail::to($user->email)->send(new ResetPasswordMail($user, $resetUrl));
        } catch (\Throwable $e) {
            Log::error('Failed to send password reset email: '.$e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Unable to send email at this time. Please try again later.',
            ], 500);
        }

        return response()->json([
            'success' => true,
            'message' => 'Password reset link has been sent to your email address (valid for 60 minutes).',
        ]);
    }

    /**
     * Show Reset Password Page
     */
    public function showResetPasswordForm(Request $request, string $token): InertiaResponse
    {
        return Inertia::render('ResetPassword', [
            'token' => $token,
            'email' => $request->query('email', ''),
        ]);
    }

    /**
     * Process Password Reset with Token Verification
     */
    public function resetPassword(Request $request): JsonResponse|RedirectResponse
    {
        $validated = $request->validate([
            'token' => 'required|string',
            'email' => 'required|email',
            'password' => 'required|string|min:6|confirmed',
        ]);

        $email = strtolower(trim($validated['email']));
        $plainToken = $validated['token'];

        $record = DB::table('password_reset_tokens')->where('email', $email)->first();

        if (! $record) {
            $msg = 'Invalid or expired password reset token. Please request a new link.';
            if ($request->wantsJson()) {
                return response()->json(['success' => false, 'message' => $msg], 422);
            }

            return back()->withErrors(['email' => $msg]);
        }

        // Check if token expired (60 minutes)
        if (Carbon::parse($record->created_at)->addMinutes(60)->isPast()) {
            DB::table('password_reset_tokens')->where('email', $email)->delete();
            $msg = 'Password reset token has expired. Please request a new one.';
            if ($request->wantsJson()) {
                return response()->json(['success' => false, 'message' => $msg], 422);
            }

            return back()->withErrors(['email' => $msg]);
        }

        // Compare SHA-256 hash
        $expectedHash = hash('sha256', $plainToken);
        if (! hash_equals($record->token, $expectedHash)) {
            $msg = 'Invalid password reset token.';
            if ($request->wantsJson()) {
                return response()->json(['success' => false, 'message' => $msg], 422);
            }

            return back()->withErrors(['token' => $msg]);
        }

        $user = User::where('email', $email)->first();
        if (! $user) {
            $msg = 'User not found.';
            if ($request->wantsJson()) {
                return response()->json(['success' => false, 'message' => $msg], 404);
            }

            return back()->withErrors(['email' => $msg]);
        }

        $user->password = Hash::make($validated['password']);
        $user->save();

        // Delete used token
        DB::table('password_reset_tokens')->where('email', $email)->delete();

        // Auto login user
        Auth::login($user);

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Your password has been successfully reset! Welcome back.',
                'user' => $user,
            ]);
        }

        return redirect('/')->with('success', 'Your password has been successfully reset!');
    }

    /**
     * Get real-time fresh balance of currently authenticated user
     */
    public function balance(Request $request): JsonResponse
    {
        $user = Auth::user();
        if (! $user) {
            return response()->json([
                'success' => false,
                'balance' => 0.00,
                'game_balance' => 0.00,
            ]);
        }

        $user->refresh();

        return response()->json([
            'success' => true,
            'user_code' => $user->user_code,
            'balance' => (float) round((float) $user->game_balance, 2),
            'game_balance' => (float) round((float) $user->game_balance, 2),
            'vip_points' => $user->vip_points,
            'vip_level' => $user->vip_level,
        ]);
    }
}
