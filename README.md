# RoyalPlay Social Casino (social-royalplay)

Next-generation social casino platform built with Laravel 12, Inertia.js (React 18), Tailwind CSS, and NexusGGR Seamless Gold API wallet integration.

---

## 🚀 Technical Highlights

- **Backend**: Laravel 12 / PHP 8.4
- **Frontend Architecture**: Inertia.js v2 (React 18 SPA)
- **Database Engine**: MySQL / SQLite (ACID compliant with row-level locking)
- **Styling**: Tailwind CSS (PostCSS / Vite 8.2)
- **Aggregator / Engine**: NexusGGR Gold API Seamless Wallet (`/gold_api`)
- **Email Notifications**: Namecheap PrivateEmail SMTP support (SSL 465 / TLS 587)
- **Security & KYC**: SHA-256 password reset tokens (60 min expiry), 176-country validation with restricted territory exclusion, 18+ enforcement.

---

## 📧 Email & Notification System

1. **Namecheap PrivateEmail SMTP**:
   - Outgoing transport: `mail.privateemail.com` on port `465` (SSL) or `587` (TLS).
2. **Registration Welcome Email (`welcome_registration.blade.php`)**:
   - Sent automatically on user signup via `AuthController::register`.
   - Includes Player ID (`user_code`), registered email, balance, VIP tier, and game launch link.
3. **Deposit Receipt Email (`deposit_successful.blade.php`)**:
   - Sent automatically on store deposit (`BonusController::buyPackage`) and payment webhook (`CashierController::webhook`).
   - Includes Order ID, amount paid in $, Standard Coins credited, progressive bonus SC, and updated balance.
4. **Password Reset Email (`reset_password.blade.php` / `reset_password_plain.blade.php`)**:
   - 64-character token with SHA-256 hash stored in `password_reset_tokens`.
   - 60-minute expiration window with dedicated UI reset flow (`/reset-password/{token}`).

---

## 📦 Production Deployment & Build

The compiled production bundle (`public/build`) is tracked in Git. Deploying to a VPS only requires pulling the repository without needing Node.js or `npm run build` on the server:

```bash
git pull origin main
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

---

## 🛠 Local Development Setup

```bash
# Clone the repository
git clone https://github.com/SHENiiDEV/social-royalplay.git
cd social-royalplay

# Install PHP and Node dependencies
composer install
npm install

# Setup environment
cp .env.example .env
php artisan key:generate
php artisan migrate --seed

# Build assets
npm run build

# Start local development server
php artisan serve
```

---

## ⚖️ Legal & Compliance

- Terms of Service: `/terms`
- Privacy & Cookie Policy: `/privacy`
- Responsible Social Gaming: `/responsible-gaming`
- Fair Play & Certified RNG: `/fair-play`
- KYC & Anti-Fraud: `/kyc-aml`

© RoyalPlay Entertainment N.V. • All rights reserved.
