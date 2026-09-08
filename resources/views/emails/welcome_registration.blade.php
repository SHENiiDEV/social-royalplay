<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to RoyalPlay Social Casino</title>
    <style>
        body { margin: 0; padding: 0; background-color: #060911; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e2e8f0; }
        .wrapper { width: 100%; max-width: 600px; margin: 0 auto; background-color: #0d121f; border: 1px solid #1e293b; border-radius: 20px; overflow: hidden; }
        .header { background: linear-gradient(180deg, #182035 0%, #0d121f 100%); padding: 36px 24px; text-align: center; border-bottom: 1px solid #1e293b; }
        .logo { font-size: 26px; font-weight: 900; color: #fbbf24; text-transform: uppercase; letter-spacing: 2px; }
        .tagline { font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 3px; margin-top: 4px; }
        .content { padding: 32px 28px; }
        .greeting { font-size: 20px; font-weight: 800; color: #ffffff; margin-bottom: 12px; }
        .text { font-size: 14px; line-height: 1.6; color: #94a3b8; margin-bottom: 24px; }
        .card { background-color: #131b2e; border: 1px solid #1e293b; border-radius: 14px; padding: 18px 20px; margin-bottom: 24px; }
        .card-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 13px; }
        .card-row:last-child { margin-bottom: 0; }
        .card-label { color: #64748b; }
        .card-value { color: #f8fafc; font-weight: 700; font-family: monospace; }
        .highlight-box { background: linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.05) 100%); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 14px; padding: 18px; margin-bottom: 28px; text-align: center; }
        .highlight-title { font-size: 14px; font-weight: 800; color: #fbbf24; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; }
        .highlight-desc { font-size: 13px; color: #cbd5e1; }
        .cta-btn { display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #000000 !important; font-weight: 900; font-size: 14px; text-transform: uppercase; letter-spacing: 1.5px; text-decoration: none; padding: 15px 36px; border-radius: 12px; box-shadow: 0 4px 20px rgba(245, 158, 11, 0.4); text-align: center; }
        .footer { background-color: #080c14; padding: 24px; text-align: center; border-top: 1px solid #1e293b; font-size: 11px; color: #64748b; line-height: 1.6; }
        .footer-links a { color: #94a3b8; text-decoration: none; margin: 0 8px; }
        .footer-links a:hover { color: #fbbf24; }
    </style>
</head>
<body style="padding: 24px 12px;">
    <div class="wrapper">
        <div class="header">
            <div class="logo">👑 ROYALPLAY</div>
            <div class="tagline">Next-Gen Social Casino</div>
        </div>
        
        <div class="content">
            <div class="greeting">Welcome aboard, {{ $user->name }}! 🎰</div>
            <div class="text">
                Your RoyalPlay account has been successfully created. You now have access to our entire catalog of 1,800+ certified slots, instant seamless wallet synchronization, and daily royalty bonuses.
            </div>

            <div class="card">
                <div class="card-row">
                    <span class="card-label">Player ID:</span>
                    <span class="card-value" style="color: #fbbf24;">{{ $user->user_code }}</span>
                </div>
                <div class="card-row">
                    <span class="card-label">Email Address:</span>
                    <span class="card-value">{{ $user->email }}</span>
                </div>
                <div class="card-row">
                    <span class="card-label">Current Balance:</span>
                    <span class="card-value" style="color: #38bdf8;">SC {{ number_format((float) $user->game_balance, 2) }}</span>
                </div>
                <div class="card-row">
                    <span class="card-label">VIP Tier:</span>
                    <span class="card-value" style="color: #a855f7;">Tier {{ $user->vip_level ?? 1 }}</span>
                </div>
            </div>

            <div class="highlight-box">
                <div class="highlight-title">🎁 Your Welcome Perks are Ready</div>
                <div class="highlight-desc">
                    Claim your <strong>Daily Free Coins</strong> and spin the <strong>Wheel of Fortune</strong> every 24 hours to win multipliers up to 10,000x!
                </div>
            </div>

            <div style="text-align: center; margin-bottom: 20px;">
                <a href="{{ $gameUrl ?? url('/') }}" class="cta-btn">ENTER CASINO LOBBY</a>
            </div>
        </div>

        <div class="footer">
            <div class="footer-links" style="margin-bottom: 12px;">
                <a href="{{ url('/terms') }}">Terms of Service</a> •
                <a href="{{ url('/privacy') }}">Privacy Policy</a> •
                <a href="{{ url('/responsible-gaming') }}">Responsible Gaming</a>
            </div>
            <div>
                © {{ date('Y') }} RoyalPlay Entertainment N.V. All rights reserved.<br>
                18+ Only • Certified RNG Social Casino Platform.
            </div>
        </div>
    </div>
</body>
</html>
