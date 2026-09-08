<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Deposit Confirmation — RoyalPlay Social Casino</title>
    <style>
        body { margin: 0; padding: 0; background-color: #060911; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e2e8f0; }
        .wrapper { width: 100%; max-width: 600px; margin: 0 auto; background-color: #0d121f; border: 1px solid #1e293b; border-radius: 20px; overflow: hidden; }
        .header { background: linear-gradient(180deg, #182035 0%, #0d121f 100%); padding: 36px 24px; text-align: center; border-bottom: 1px solid #1e293b; }
        .logo { font-size: 26px; font-weight: 900; color: #fbbf24; text-transform: uppercase; letter-spacing: 2px; }
        .badge { display: inline-block; background-color: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.4); color: #34d399; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; padding: 4px 14px; border-radius: 20px; margin-top: 10px; }
        .content { padding: 32px 28px; }
        .greeting { font-size: 20px; font-weight: 800; color: #ffffff; margin-bottom: 8px; }
        .text { font-size: 14px; line-height: 1.6; color: #94a3b8; margin-bottom: 24px; }
        .receipt-card { background-color: #131b2e; border: 1px solid #1e293b; border-radius: 14px; padding: 20px; margin-bottom: 24px; }
        .receipt-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #1e293b; font-size: 13px; }
        .receipt-row:last-child { border-bottom: none; }
        .receipt-label { color: #64748b; }
        .receipt-value { color: #f8fafc; font-weight: 700; font-family: monospace; }
        .total-row { display: flex; justify-content: space-between; padding: 12px 0 4px 0; font-size: 15px; font-weight: 800; }
        .cta-btn { display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #000000 !important; font-weight: 900; font-size: 14px; text-transform: uppercase; letter-spacing: 1.5px; text-decoration: none; padding: 15px 36px; border-radius: 12px; box-shadow: 0 4px 20px rgba(245, 158, 11, 0.4); text-align: center; }
        .footer { background-color: #080c14; padding: 24px; text-align: center; border-top: 1px solid #1e293b; font-size: 11px; color: #64748b; line-height: 1.6; }
        .footer-links a { color: #94a3b8; text-decoration: none; margin: 0 8px; }
    </style>
</head>
<body style="padding: 24px 12px;">
    <div class="wrapper">
        <div class="header">
            <div class="logo">👑 ROYALPLAY</div>
            <div><span class="badge">Payment Confirmed</span></div>
        </div>
        
        <div class="content">
            <div class="greeting">Payment Receipt 💳</div>
            <div class="text">
                Hello {{ $user->name }}, your deposit has been processed successfully and the coins have been credited to your seamless wallet.
            </div>

            <div class="receipt-card">
                <div class="receipt-row">
                    <span class="receipt-label">Order Number:</span>
                    <span class="receipt-value" style="color: #fbbf24;">{{ $orderId ?? 'ORD-'.strtoupper(substr(md5(uniqid()), 0, 10)) }}</span>
                </div>
                <div class="receipt-row">
                    <span class="receipt-label">Amount Paid:</span>
                    <span class="receipt-value">{{ $currency ?? 'EUR' }} {{ number_format((float) ($amountPaid ?? $amountEur ?? 0), 2) }}</span>
                </div>
                <div class="receipt-row">
                    <span class="receipt-label">Standard Coins Credited:</span>
                    <span class="receipt-value" style="color: #38bdf8;">+SC {{ number_format((float) ($coinsCredited ?? $scAmount ?? 0), 2) }}</span>
                </div>
                @if(!empty($bonusCoins) && $bonusCoins > 0)
                <div class="receipt-row">
                    <span class="receipt-label">Progressive Bonus SC:</span>
                    <span class="receipt-value" style="color: #34d399;">+SC {{ number_format((float) $bonusCoins, 2) }}</span>
                </div>
                @endif
                @if(!empty($vipPointsEarned) && $vipPointsEarned > 0)
                <div class="receipt-row">
                    <span class="receipt-label">VIP Points Accrued:</span>
                    <span class="receipt-value" style="color: #a855f7;">+{{ number_format((int) $vipPointsEarned) }} PTS</span>
                </div>
                @endif
                <div class="total-row">
                    <span style="color: #cbd5e1;">Current Available Balance:</span>
                    <span style="color: #fbbf24; font-family: monospace;">SC {{ number_format((float) ($newBalance ?? $user->game_balance), 2) }}</span>
                </div>
            </div>

            <div style="text-align: center; margin-bottom: 20px;">
                <a href="{{ url('/') }}" class="cta-btn">PLAY NOW</a>
            </div>
        </div>

        <div class="footer">
            <div class="footer-links" style="margin-bottom: 12px;">
                <a href="{{ url('/terms') }}">Terms of Service</a> •
                <a href="{{ url('/privacy') }}">Privacy Policy</a> •
                <a href="{{ url('/responsible-gaming') }}">Responsible Gaming</a>
            </div>
            <div>
                © {{ date('Y') }} RoyalPlay Entertainment N.V.<br>
                For billing inquiries, please contact <a href="mailto:support@royalplay.io" style="color: #fbbf24;">support@royalplay.io</a>
            </div>
        </div>
    </div>
</body>
</html>
