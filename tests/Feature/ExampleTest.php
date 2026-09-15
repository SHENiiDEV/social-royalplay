<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    use RefreshDatabase;

    /**
     * A basic test example.
     */
    public function test_the_application_returns_a_successful_response(): void
    {
        $response = $this->get('/');

        $response->assertStatus(200);
    }

    public function test_legal_and_guide_routes_return_successful_response(): void
    {
        $routes = [
            '/terms',
            '/privacy',
            '/responsible-gaming',
            '/fair-play',
            '/kyc-aml',
            '/payment-security',
            '/cookies',
            '/sweepstakes-rules',
            '/guides/how-it-works',
            '/guides/rtp-volatility',
            '/guides/vip-rewards',
            '/guides/slots-strategy',
        ];

        foreach ($routes as $route) {
            $response = $this->get($route);
            $response->assertStatus(200);
        }
    }
}
