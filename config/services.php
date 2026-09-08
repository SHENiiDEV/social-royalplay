<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Resend, Postmark, AWS, and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'nexus_ggr' => [
        'server' => env('GGR_API_SERVER', 'https://api.nexusggr.dev'),
        'agent_code' => env('GGR_AGENT_CODE', 'crowdplay'),
        'agent_token' => env('GGR_AGENT_TOKEN', 'c9540f990614ec0e60efa22d4c5fe5fe'),
        'agent_secret' => env('GGR_AGENT_SECRET', '7e49159d19c1db28e7f70966b1242606'),
        'mock_mode' => env('GGR_MOCK_MODE', false),
    ],

];
