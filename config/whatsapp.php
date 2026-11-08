<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Meta WhatsApp Business Cloud API Configuration
    |--------------------------------------------------------------------------
    |
    | Official direct integration credentials for Meta WhatsApp Cloud API.
    | These can be populated from your Meta Developer App / WhatsApp Business Account.
    |
    */

    'phone_number_id' => env('WHATSAPP_PHONE_NUMBER_ID', ''),
    'business_account_id' => env('WHATSAPP_BUSINESS_ACCOUNT_ID', ''),
    'access_token' => env('WHATSAPP_ACCESS_TOKEN', ''),
    'app_secret' => env('WHATSAPP_APP_SECRET', ''),
    'webhook_verify_token' => env('WHATSAPP_WEBHOOK_VERIFY_TOKEN', ''),
    'graph_version' => env('WHATSAPP_GRAPH_VERSION', 'v22.0'),
    'display_phone_number' => env('WHATSAPP_DISPLAY_PHONE_NUMBER', ''),

    'api_url' => env('WHATSAPP_API_URL', 'https://graph.facebook.com'),

    'media_disk' => env('WHATSAPP_MEDIA_DISK', 'public'),
    'media_path' => env('WHATSAPP_MEDIA_PATH', 'whatsapp_media'),

    'timeout' => (int) env('WHATSAPP_TIMEOUT', 30),
    'max_retries' => (int) env('WHATSAPP_MAX_RETRIES', 3),

];

