<?php

test('swagger ui interface is accessible at api/documentation', function () {
    $response = $this->get('/api/documentation');

    $response->assertOk()
        ->assertSee('swagger-ui');
});

test('swagger api-docs json is available and contains valid openapi specification', function () {
    $response = $this->get('/docs');

    $response->assertOk()
        ->assertJsonPath('openapi', '3.0.0')
        ->assertJsonPath('info.title', 'Ofoq Technology CRM & WhatsApp API');
});

test('convenience redirect /swagger redirects to /api/documentation', function () {
    $this->get('/swagger')->assertRedirect('/api/documentation');
});
