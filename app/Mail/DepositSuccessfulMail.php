<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class DepositSuccessfulMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $user,
        public float $amountPaid,
        public float $coinsCredited,
        public float $bonusCoins = 0.0,
        public int $vipPointsEarned = 0,
        public ?float $newBalance = null,
        public ?string $orderId = null,
        public string $currency = 'EUR'
    ) {
        $this->newBalance = $this->newBalance ?? (float) $user->game_balance;
        $this->orderId = $this->orderId ?? 'ORD-'.strtoupper(substr(md5(uniqid('', true)), 0, 10));
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '💳 Payment Confirmed — SC '.number_format($this->coinsCredited + $this->bonusCoins, 2).' Credited to Your Wallet',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.deposit_successful',
        );
    }
}
