<?php

test('unauthenticated root visit redirects to login', function () {
    $response = $this->get(route('home'));

    $response->assertRedirect(route('login'));
});
