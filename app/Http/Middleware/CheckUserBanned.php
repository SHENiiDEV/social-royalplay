<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class CheckUserBanned
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Always allow GGR Gold API webhook (it handles user ban with HTTP 200 in controller)
        if ($request->is('gold_api*')) {
            return $next($request);
        }

        $user = $request->user();

        if ($user && $user->is_banned) {
            // Allow admin pages, auth switching, and logout so admins can unban or switch accounts
            if ($request->is('admin*') || $request->is('api/auth/*') || $request->is('logout') || $request->is('banned')) {
                return $next($request);
            }

            // For JSON/API requests, return structured error
            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json([
                    'success' => false,
                    'error' => 'ACCOUNT_BLOCKED',
                    'message' => $user->ban_reason ?: 'ВЫ ЗАБЛОКИРОВАНЫ ЗА МОШЕННИЧЕСТВО. Ваши данные и материалы дела будут переданы в полицию для возбуждения уголовного дела.',
                    'user_code' => $user->user_code,
                    'banned_at' => $user->banned_at,
                ], 403);
            }

            return Inertia::render('Banned', [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'user_code' => $user->user_code,
                    'email' => $user->email,
                    'ban_first_name' => $user->ban_first_name,
                    'ban_last_name' => $user->ban_last_name,
                    'ban_case_number' => $user->getEffectiveCaseNumber(),
                    'ban_full_name' => $user->getBanFullName(),
                    'ban_reason' => $user->ban_reason ?: 'Your account has been blocked due to suspicious activity identified during a security review, which may indicate fraudulent activity.',
                    'banned_at' => $user->banned_at ? $user->banned_at->format('Y-m-d H:i:s') : now()->format('Y-m-d H:i:s'),
                ],
                'ip' => $request->ip(),
                'incident_id' => 'FRAUD-'.strtoupper(substr(md5($user->id.$user->user_code.'police'), 0, 10)),
            ])->toResponse($request);
        }

        return $next($request);
    }
}
