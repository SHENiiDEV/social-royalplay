<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BonusController;
use App\Http\Controllers\CashierController;
use App\Http\Controllers\GameController;
use App\Http\Controllers\GgrGoldApiController;
use App\Http\Controllers\LegalController;
use Illuminate\Support\Facades\Route;

// Casino Lobby & Game Routes
Route::get('/', [GameController::class, 'index'])->name('home');
Route::get('/game/{slug}', [GameController::class, 'show'])->name('game.play');
Route::get('/mock-frame/{slug}', [GameController::class, 'mockFrame'])->name('game.mock-frame');

// Legal & Compliance Suite
Route::get('/terms', [LegalController::class, 'terms'])->name('legal.terms');
Route::get('/legal/terms', [LegalController::class, 'terms']);
Route::get('/privacy', [LegalController::class, 'privacy'])->name('legal.privacy');
Route::get('/legal/privacy', [LegalController::class, 'privacy']);
Route::get('/responsible-gaming', [LegalController::class, 'responsible'])->name('legal.responsible');
Route::get('/legal/responsible-gaming', [LegalController::class, 'responsible']);
Route::get('/fair-play', [LegalController::class, 'fairplay'])->name('legal.fairplay');
Route::get('/legal/fair-play', [LegalController::class, 'fairplay']);
Route::get('/kyc-aml', [LegalController::class, 'kyc'])->name('legal.kyc');
Route::get('/legal/kyc-aml', [LegalController::class, 'kyc']);

// CRITICAL: Nexus GGR Gold API Seamless Wallet Webhook
Route::match(['get', 'post'], '/gold_api', [GgrGoldApiController::class, 'handle'])->name('gold_api.webhook');
Route::match(['get', 'post'], '//gold_api', [GgrGoldApiController::class, 'handle']);
Route::match(['get', 'post'], '/gold_api/{any}', [GgrGoldApiController::class, 'handle'])->where('any', '.*');
Route::match(['get', 'post'], '//gold_api/{any}', [GgrGoldApiController::class, 'handle'])->where('any', '.*');

// Cashier Webhook
Route::post('/api/cashier/webhook', [CashierController::class, 'webhook'])->name('cashier.webhook');
Route::post('/cashier/webhook', [CashierController::class, 'webhook']);

// Live Public APIs
Route::get('/api/live-wins', [GameController::class, 'liveWinsApi'])->name('api.live-wins');
Route::get('/api/jackpot', [GameController::class, 'jackpotApi'])->name('api.jackpot');
Route::get('/api/favorites', [GameController::class, 'getFavorites'])->name('api.favorites.index');
Route::post('/api/favorites/toggle', [GameController::class, 'toggleFavorite'])->name('api.favorites.toggle');

// Bonuses & Store
Route::post('/api/bonus/daily', [BonusController::class, 'claimDailyBonus'])->name('bonus.daily');
Route::post('/api/bonus/wheel', [BonusController::class, 'spinWheel'])->name('bonus.wheel');
Route::post('/api/store/buy', [BonusController::class, 'buyPackage'])->name('store.buy');
Route::get('/api/user/balance', [AuthController::class, 'balance'])->name('api.user.balance');

// Auth & Registration Suite
Route::post('/api/auth/register', [AuthController::class, 'register'])->name('auth.register');
Route::post('/register', [AuthController::class, 'register']);
Route::post('/api/auth/login', [AuthController::class, 'login'])->name('auth.login');
Route::post('/login', [AuthController::class, 'login']);
Route::get('/auth/as/{user}', [AuthController::class, 'loginAs'])->name('auth.as');
Route::get('/login/{user}', [AuthController::class, 'loginAs']);
Route::post('/api/auth/switch', [AuthController::class, 'switchUser'])->name('auth.switch');
Route::post('/api/auth/guest', [AuthController::class, 'registerGuest'])->name('auth.guest');
Route::match(['get', 'post'], '/logout', [AuthController::class, 'logout'])->name('logout');

// Password Reset Routes
Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])->name('password.email');
Route::post('/api/auth/forgot-password', [AuthController::class, 'forgotPassword']);
Route::get('/reset-password/{token}', [AuthController::class, 'showResetPasswordForm'])->name('password.reset');
Route::post('/reset-password', [AuthController::class, 'resetPassword'])->name('password.update');
Route::post('/api/auth/reset-password', [AuthController::class, 'resetPassword']);

// Casino Administration Suite
Route::prefix('admin')->name('admin.')->group(function () {
    Route::get('/', [AdminController::class, 'dashboard'])->name('dashboard');
    Route::get('/users', [AdminController::class, 'users'])->name('users');
    Route::match(['get', 'post'], '/users/{id}/toggle', [AdminController::class, 'toggleBanUser'])->name('users.toggle');
    Route::match(['get', 'post'], '/users/{id}/ban', [AdminController::class, 'toggleBanUser'])->name('users.ban');
    Route::post('/rtp', [AdminController::class, 'setUserRtp'])->name('rtp');
    Route::post('/balance', [AdminController::class, 'adjustBalance'])->name('balance');
    Route::match(['get', 'post'], '/ban', [AdminController::class, 'toggleBan'])->name('ban');
    Route::post('/sync-games', [AdminController::class, 'syncGames'])->name('sync-games');
    Route::get('/export-csv', [AdminController::class, 'exportCsv'])->name('export');
});
