<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class WelcomeRegistrationMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $user,
        public ?string $gameUrl = null
    ) {
        $this->gameUrl = $this->gameUrl ?? url('/');
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '👑 Welcome to RoyalPlay Social Casino — Your Welcome Perks Await!',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.welcome_registration',
        );
    }
}
