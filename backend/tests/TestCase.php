<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use RuntimeException;

abstract class TestCase extends BaseTestCase
{
    protected function setUpTraits()
    {
        $this->asegurarBaseDePruebas();

        return parent::setUpTraits();
    }

    // Detiene las pruebas si no usan una base de datos de prueba
    private function asegurarBaseDePruebas(): void
    {
        $conexion = config('database.default');
        $base = (string) config("database.connections.{$conexion}.database");

        if ($base !== ':memory:' && ! str_ends_with($base, '_test')) {
            throw new RuntimeException(
                "Las pruebas deben usar una base de datos que termine en _test. Base actual: {$base}"
            );
        }
    }
}