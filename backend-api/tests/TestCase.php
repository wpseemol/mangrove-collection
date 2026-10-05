<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    /** Marks the next requests as coming from the storefront, so Sanctum starts a session. */
    protected function fromStorefront(): static
    {
        return $this->withHeader('Origin', 'http://localhost:3000');
    }
}
