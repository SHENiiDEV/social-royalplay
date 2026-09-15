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

    public function payments(): Response
    {
        return Inertia::render('Legal', [
            'initialTab' => 'payments',
            'company' => $this->getCompanyDetails(),
        ]);
    }

    public function cookies(): Response
    {
        return Inertia::render('Legal', [
            'initialTab' => 'cookies',
            'company' => $this->getCompanyDetails(),
        ]);
    }

    public function sweepstakes(): Response
    {
        return Inertia::render('Legal', [
            'initialTab' => 'sweepstakes',
            'company' => $this->getCompanyDetails(),
        ]);
    }

    public function guideSocial(): Response
    {
        return Inertia::render('Legal', [
            'initialTab' => 'guide_social',
            'company' => $this->getCompanyDetails(),
        ]);
    }

    public function guideRtp(): Response
    {
        return Inertia::render('Legal', [
            'initialTab' => 'guide_rtp',
            'company' => $this->getCompanyDetails(),
        ]);
    }

    public function guideVip(): Response
    {
        return Inertia::render('Legal', [
            'initialTab' => 'guide_vip',
            'company' => $this->getCompanyDetails(),
        ]);
    }

    public function guideSlots(): Response
    {
        return Inertia::render('Legal', [
            'initialTab' => 'guide_slots',
            'company' => $this->getCompanyDetails(),
        ]);
    }

    public function show(string $tab): Response
    {
        return Inertia::render('Legal', [
            'initialTab' => $tab,
            'company' => $this->getCompanyDetails(),
        ]);
    }
}
