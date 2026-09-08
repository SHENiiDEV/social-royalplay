<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class LegalController extends Controller
{
    protected function getCompanyDetails(): array
    {
        return [
            'name' => 'RoyalPlay Entertainment N.V.',
            'license' => 'OGL/2026/184/0129',
            'reg_number' => '164829',
            'address' => 'Heelsumstraat 51, E-Commerce Park, Willemstad, Curaçao',
            'support_email' => 'support@royalplay.io',
            'legal_email' => 'legal@royalplay.io',
            'dpo_email' => 'dpo@royalplay.io',
        ];
    }

    public function terms(): Response
    {
        return Inertia::render('Legal', [
            'initialTab' => 'terms',
            'company' => $this->getCompanyDetails(),
        ]);
    }

    public function privacy(): Response
    {
        return Inertia::render('Legal', [
            'initialTab' => 'privacy',
            'company' => $this->getCompanyDetails(),
        ]);
    }

    public function responsible(): Response
    {
        return Inertia::render('Legal', [
            'initialTab' => 'responsible',
            'company' => $this->getCompanyDetails(),
        ]);
    }

    public function fairplay(): Response
    {
        return Inertia::render('Legal', [
            'initialTab' => 'fairplay',
            'company' => $this->getCompanyDetails(),
        ]);
    }

    public function kyc(): Response
    {
        return Inertia::render('Legal', [
            'initialTab' => 'kyc',
            'company' => $this->getCompanyDetails(),
        ]);
    }
}
