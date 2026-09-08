<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password — RoyalPlay</title>
    <style>
        body { margin: 0; padding: 0; background-color: #060911; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e2e8f0; }
        .wrapper { width: 100%; max-width: 600px; margin: 0 auto; background-color: #0d121f; border: 1px solid #1e293b; border-radius: 20px; overflow: hidden; }
        .header { background: linear-gradient(180deg, #182035 0%, #0d121f 100%); padding: 36px 24px; text-align: center; border-bottom: 1px solid #1e293b; }
        .logo { font-size: 26px; font-weight: 900; color: #fbbf24; text-transform: uppercase; letter-spacing: 2px; }
        .content { padding: 32px 28px; }
        .greeting { font-size: 20px; font-weight: 800; color: #ffffff; margin-bottom: 12px; }
        .text { font-size: 14px; line-height: 1.6; color: #94a3b8; margin-bottom: 24px; }
        .warning-box { background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 12px; padding: 14px 18px; margin-bottom: 24px; font-size: 12px; color: #fca5a5; line-height: 1.5; }
        .cta-btn { display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #000000 !important; font-weight: 900; font-size: 14px; text-transform: uppercase; letter-spacing: 1.5px; text-decoration: none; padding: 15px 36px; border-radius: 12px; box-shadow: 0 4px 20px rgba(245, 158, 11, 0.4); text-align: center; }
        .url-box { background-color: #131b2e; border: 1px solid #1e293b; border-radius: 10px; padding: 12px; font-family: monospace; font-size: 11px; word-break: break-all; color: #94a3b8; margin-top: 16px; }
        .footer { background-color: #080c14; padding: 24px; text-align: center; border-top: 1px solid #1e293b; font-size: 11px; color: #64748b; line-height: 1.6; }
    </style>
</head>
<body style="padding: 24px 12px;">
    <div class="wrapper">
        <div class="header">
            <div class="logo">👑 ROYALPLAY</div>
            <div style="font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 2px; margin-top: 4px;">Security & Account Recovery</div>
        </div>
        
        <div class="content">
            <div class="greeting">Password Reset Request 🔑</div>
            <div class="text">
                Hello {{ $user->name }}, we received a request to reset the password for your RoyalPlay account (<strong>{{ $user->email }}</strong>).
            </div>

            <div class="warning-box">
                ⏱️ <strong>Security Notice:</strong> This password reset link is valid for <strong>60 minutes</strong>. If you did not request a password reset, you can safely ignore this email — your account remains secure.
            </div>

            <div style="text-align: center; margin: 32px 0;">
                <a href="{{ $resetUrl }}" class="cta-btn">RESET MY PASSWORD</a>
            </div>

            <div class="text" style="font-size: 12px; color: #64748b;">
                If the button above does not work, copy and paste the following URL into your browser:
                <div class="url-box">{{ $resetUrl }}</div>
            </div>
        </div>

        <div class="footer">
            © {{ date('Y') }} RoyalPlay Entertainment N.V. • Heelsumstraat 51, Willemstad, Curaçao<br>
            If you need assistance, contact us at <a href="mailto:support@royalplay.io" style="color: #fbbf24;">support@royalplay.io</a>
        </div>
    </div>
</body>
</html>
