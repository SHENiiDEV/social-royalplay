# NexusGGR & Social Casino Platform - Technical Specification

## 1. System Architecture & Tech Stack

### Core Frameworks & Dependencies
- **Backend**: Laravel 12 / PHP 8.4
- **Frontend Architecture**: Inertia.js v2 (React 18 SPA)
- **Database Engine**: MySQL / SQLite (ACID compliant with row-level locking)
- **Styling**: Tailwind CSS (PostCSS / Vite 8.2)
- **Transport / Protocol**: HTTPS / JSON REST API / Webhooks
- **External Gaming Aggregator**: NexusGGR API (Gold API Seamless Protocol)

---

## 2. NexusGGR Credentials & Environment Setup

| Parameter | Configuration Key / Value | Description |
|---|---|---|
| API Server Base URL | `https://api.nexusggr.com` | NexusGGR core endpoint |
| Agent Code | `royalplay` | Registered operator agent identifier |
| Agent Token | `4ce1c45d75d90326811c4fb2cf3c3801` | Outgoing authorization token |
| Agent Secret | `0fbfd24390fac179e21e1ccee9d243ff` | Incoming webhook validation key |
| Webhook URL | `https://{DOMAIN}/gold_api` | Seamless balance & transaction listener |

---

## 3. NexusGGR Seamless Wallet Protocol (`/gold_api`)

The Seamless Wallet webhook endpoint is implemented in `app/Http/Controllers/GgrGoldApiController.php` and service layer `app/Services/NexusGgrService.php`.

### 3.1 Routing & CSRF Exclusion
NexusGGR sends direct JSON POST callbacks without CSRF cookies.
- **Route Definitions (`routes/web.php`)**:
  - `POST /gold_api`
  - `POST //gold_api` (handles double-slash fallback requests)
  - `POST /gold_api/{any}`
- **CSRF Exception (`bootstrap/app.php`)**:
  - `validateCsrfTokens(except: ['gold_api', 'gold_api/*', '*gold_api*'])`

### 3.2 Webhook Request Authentication
All incoming requests from NexusGGR are authenticated against `agent_secret`:
```php
$secret = $request->header('Agent-Secret') 
    ?? $request->input('agent_secret') 
    ?? $request->input('agentSecret');

if ($secret !== config('services.nexus.agent_secret', '0fbfd24390fac179e21e1ccee9d243ff')) {
    return response()->json(['status' => 0, 'msg' => 'INVALID_SECRET'], 401);
}
```

### 3.3 Method: `user_balance`
Triggered by NexusGGR to query player wallet balance before opening a game round or when refreshing in-game balance.

#### Request Payload:
```json
{
  "method": "user_balance",
  "agent_code": "royalplay",
  "agent_token": "4ce1c45d75d90326811c4fb2cf3c3801",
  "agent_secret": "0fbfd24390fac179e21e1ccee9d243ff",
  "user_code": "RP_08A319B",
  "game_code": "vs20olympgate"
}
```

#### Success Response:
```json
{
  "status": 1,
  "user_balance": 263.50,
  "msg": "SUCCESS"
}
```

#### Failure / Banned User Response:
```json
{
  "status": 0,
  "user_balance": 0.00,
  "msg": "USER_BLOCKED"
}
```

---

### 3.4 Method: `transaction`
Triggered when player bets, spins, wins, or cancels bets inside a slot.

#### Transaction Types (`txn_type`):
1. `debit`: Bet deduction from wallet.
2. `credit`: Win addition to wallet.
3. `debit_credit`: Atomic spin with combined bet and win in a single request.

#### Payload Structure (Supporting Nested Provider Objects):
NexusGGR sends bet and win amounts nested under game type objects (`slot`, `live`, `SB`, `MN`):
```json
{
  "method": "transaction",
  "agent_code": "royalplay",
  "agent_secret": "0fbfd24390fac179e21e1ccee9d243ff",
  "user_code": "RP_08A319B",
  "game_code": "vs20olympgate",
  "provider_code": "PRAGMATIC",
  "txn_type": "debit_credit",
  "txn_id": "TX_93810293",
  "txn_id_v2": "TXV2_83921038491",
  "round_id": "RND_4920194",
  "slot": {
    "bet_money": 2.00,
    "win_money": 15.50,
    "txn_id": "TX_93810293"
  }
}
```

#### Transaction Execution Logic:
1. **Idempotency Check**:
   Lookup `txn_id_v2` or `txn_id` in `game_transactions` table. If transaction already exists:
   ```php
   return response()->json([
       'status' => 1,
       'user_balance' => (float) $existingTx->after_balance,
       'msg' => 'DUPLICATE_TRANSACTION_SKIPPED'
   ], 200);
   ```
2. **Atomic Balance Lock (`DB::transaction`)**:
   - `User::where('user_code', $userCode)->lockForUpdate()->first()`
   - Balance verification: Check if `game_balance >= $betMoney`. If insufficient, return `status: 0, msg: "INSUFFICIENT_FUNDS"`.
   - Calculate `$newBalance = round($currentBalance - $betMoney + $winMoney, 2)`.
   - Update user record: `$user->game_balance = $newBalance; $user->save();`.
3. **Transaction Audit Ledger**:
   Create record in `game_transactions`:
   - `user_id`, `game_id`, `user_code`, `txn_id`, `txn_id_v2`, `txn_type`, `round_id`, `bet_amount`, `win_amount`, `before_balance`, `after_balance`, `raw_payload`.
4. **Community Win Broadcaster**:
   If `$winMoney >= 20.00`, insert record into `live_community_wins` table for public live stream ticker.
5. **Success Response**:
   ```json
   {
     "status": 1,
     "user_balance": 277.00,
     "msg": "SUCCESS"
   }
   ```

---

## 4. Game Launch Handshake Engine

Initiated when a player opens `/game/{slug}` (`app/Http/Controllers/GameController.php` -> `show`).

### Outgoing Request to NexusGGR:
```http
POST https://api.nexusggr.com/game_launch
Content-Type: application/json

{
  "agent_code": "royalplay",
  "agent_token": "4ce1c45d75d90326811c4fb2cf3c3801",
  "user_code": "RP_08A319B",
  "game_code": "vs20olympgate",
  "lang": "en",
  "device": "desktop"
}
```

### Response Processing:
NexusGGR returns `{ "status": 1, "launch_url": "https://..." }`.
- Controller renders `resources/js/Pages/GamePlayer.jsx` passing `launchUrl`.
- **Frontend Preloader (`GameLoadingScreen.jsx`)**: Renders RoyalPlay branded animated loading screen while `iframe` loads in background. On `iframe.onLoad` + balance verification, preloader smoothly fades out.

---

## 5. User Authentication & ID Randomizer

### Unique User Code Specification
To eliminate sequential IDs (`user_1`, `user_2`), user codes are generated via `User::generateUniqueUserCode()`:
- Format: `RP_` + 7 uppercase hex characters (e.g. `RP_08A319B`, `RP_F63C46F`) or `GUEST_` + 7 chars for temporary sessions.
- Collision resistance: Do-while existence check against `users.user_code`.

### Live Wallet Polling (`/api/user/balance`)
- In `GamePlayer.jsx` and `Header.jsx`, balance polls every 2-3 seconds with window focus event triggers.
- Prevents desynchronization during fast slot auto-spins.

---

## 6. Administration & Governance Suite (`/admin`)

Located in `app/Http/Controllers/AdminController.php` and `resources/js/Pages/Admin/`.

### 6.1 Access Gate
Protected by middleware verifying `Auth::user()->is_admin === true`.

### 6.2 Admin Modules:
1. **Financial Adjustment**:
   - Endpoint: `POST /admin/balance`
   - Adjusts user `game_balance` with structured audit trail (`admin_adjustment` bonus claim).
2. **RTP Override Engine**:
   - Endpoint: `POST /admin/rtp`
   - Configures individual user RTP percentage (70% - 99%) or platform-wide default.
3. **User Ban & Enforcement**:
   - Endpoint: `POST /admin/users/{id}/toggle` or `POST /admin/ban`
   - Sets `is_banned: true`, records `ban_reason`, `ban_case_number`, and timestamp.
   - Instantly rejects subsequent `/gold_api` requests (`USER_BLOCKED`) and triggers full-screen ban alert in frontend.
4. **Nexus Game Catalog Sync**:
   - Endpoint: `POST /admin/sync-games`
   - Fetches provider game lists from NexusGGR API and upserts local `games` table.

---

## 7. Economy & Store Engine

### Currency & Exchange Rate
- Standard Coins (`SC`) is the platform virtual currency.
- Base Exchange Rate: **1 EUR = 0.50 SC**.

### Deposit Bonus Tier Matrix:
| Deposit Amount (EUR) | Bonus Percentage | Base SC | Bonus SC | Total SC Received | VIP Points Gained |
|---|---|---|---|---|---|
| €10.00 | +5% | 5.00 SC | +0.25 SC | 5.25 SC | 1,000 |
| €50.00 | +10% | 25.00 SC | +2.50 SC | 27.50 SC | 5,000 |
| €100.00 | +15% | 50.00 SC | +7.50 SC | 57.50 SC | 10,000 |
| €250.00 | +20% | 125.00 SC | +25.00 SC | 150.00 SC | 25,000 |
| €500.00 | +25% | 250.00 SC | +62.50 SC | 312.50 SC | 50,000 |
| **€1,000.00+** | **+30% (MAX)** | 500.00 SC | +150.00 SC | **650.00 SC** | 100,000 |

### VIP Tier Calculation:
VIP points accrue strictly on deposits:
- Level 1: 0 - 999 pts
- Level 2: 1,000+ pts
- Level 3 (Silver): 2,500+ pts
- Level 5 (Gold): 5,000+ pts
- Level 8 (Platinum): 10,000+ pts
- Level 10 (Diamond Whale): 25,000+ pts

---

## 8. Database Schema Overview

```
users
├── id (BIGINT PK)
├── name (VARCHAR)
├── email (VARCHAR UNIQUE)
├── user_code (VARCHAR UNIQUE) -> Indexed for Gold API lookups
├── game_balance (DECIMAL 12,2)
├── rtp (INT DEFAULT 95)
├── vip_level (INT DEFAULT 1)
├── vip_points (BIGINT DEFAULT 0)
├── is_admin (BOOLEAN DEFAULT 0)
├── is_banned (BOOLEAN DEFAULT 0)
└── timestamps

games
├── id (BIGINT PK)
├── name (VARCHAR)
├── slug (VARCHAR UNIQUE)
├── game_code (VARCHAR INDEX)
├── provider_code (VARCHAR INDEX)
├── category (VARCHAR INDEX) -> 'slots', 'buy_feature', 'megaways', 'jackpots'
├── cover_image (VARCHAR)
├── min_bet (DECIMAL 8,2)
├── max_bet (DECIMAL 8,2)
├── is_featured (BOOLEAN DEFAULT 0)
├── is_active (BOOLEAN DEFAULT 1)
└── play_count (BIGINT DEFAULT 0)

game_transactions
├── id (BIGINT PK)
├── user_id (BIGINT FK)
├── game_id (BIGINT FK NULL)
├── user_code (VARCHAR INDEX)
├── txn_id (VARCHAR INDEX)
├── txn_id_v2 (VARCHAR UNIQUE) -> Strict deduplication key
├── txn_type (VARCHAR) -> 'debit', 'credit', 'debit_credit'
├── round_id (VARCHAR INDEX)
├── bet_amount (DECIMAL 12,2)
├── win_amount (DECIMAL 12,2)
├── before_balance (DECIMAL 12,2)
├── after_balance (DECIMAL 12,2)
├── raw_payload (JSON)
└── created_at (TIMESTAMP)

user_favorites
├── id (BIGINT PK)
├── user_id (BIGINT FK)
├── game_id (BIGINT FK)
├── UNIQUE (user_id, game_id)
└── timestamps

bonus_claims
├── id (BIGINT PK)
├── user_id (BIGINT FK)
├── type (VARCHAR) -> 'daily_bonus', 'wheel_spin', 'store_pack', 'admin_adjustment'
├── amount (DECIMAL 12,2)
├── details (JSON)
└── created_at (TIMESTAMP)
```

---

## 9. API Endpoint Directory

| Method | URI | Description | Auth Required |
|---|---|---|---|
| `GET` | `/` | Casino Lobby with Paginated Catalog | No |
| `GET` | `/game/{slug}` | Game Launcher with Seamless Iframe | No / Optional |
| `POST` | `/gold_api` | NexusGGR Webhook Callback Listener | Webhook Secret |
| `GET` | `/api/user/balance` | Real-time Player Wallet Balance | Yes |
| `POST` | `/api/favorites/toggle` | Toggle Game in Favorites | Optional (DB + Local) |
| `GET` | `/api/favorites` | Fetch User Favorited Game IDs | Yes |
| `POST` | `/api/store/buy` | Purchase Package / Custom Deposit | Yes |
| `POST` | `/api/bonus/daily` | Claim 24-Hour Free Daily SC | Yes |
| `POST` | `/api/bonus/wheel` | Spin Daily Wheel of Fortune | Yes |
| `POST` | `/api/auth/register` | Player Registration | No |
| `POST` | `/api/auth/login` | Player Login | No |
| `POST` | `/api/auth/guest` | Instant Guest Account Generation | No |
| `GET` | `/terms` | Terms of Service Document | No |
| `GET` | `/privacy` | Privacy & GDPR Document | No |
| `GET` | `/responsible-gaming` | Responsible Gaming Document | No |
| `GET` | `/fair-play` | Fair Play & RNG Certification | No |
| `GET` | `/kyc-aml` | KYC & Anti-Money Laundering Document | No |
| `GET` | `/admin` | Administration Dashboard | Admin Only |
| `POST` | `/admin/balance` | Admin Balance Adjustment | Admin Only |
| `POST` | `/admin/rtp` | Admin RTP Override | Admin Only |
| `POST` | `/admin/ban` | Admin Ban / Unban Toggle | Admin Only |
