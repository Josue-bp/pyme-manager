<?php

namespace Tests\Feature;

use App\Enums\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\CreaDatos;
use Tests\TestCase;

class RolesTest extends TestCase
{
    use CreaDatos;
    use RefreshDatabase;

    private function datosProducto(): array
    {
        return [
            'sku' => 'PAP-A4',
            'nombre' => 'Papel Bond',
            'precio' => 25.5,
            'stock_minimo' => 10,
        ];
    }

    public function test_el_vendedor_no_puede_listar_usuarios(): void
    {
        $this->iniciarSesionComo(Role::Vendedor);

        $this->getJson('/api/usuarios')->assertForbidden();
    }

    public function test_el_administrador_puede_listar_usuarios(): void
    {
        $this->iniciarSesionComo(Role::Administrador);

        $this->getJson('/api/usuarios')->assertOk();
    }

    public function test_el_vendedor_no_puede_crear_productos(): void
    {
        $this->iniciarSesionComo(Role::Vendedor);

        $this->postJson('/api/productos', $this->datosProducto())->assertForbidden();
    }

    public function test_el_almacen_puede_crear_productos(): void
    {
        $this->iniciarSesionComo(Role::Almacen);

        $this->postJson('/api/productos', $this->datosProducto())->assertCreated();
    }

    public function test_el_vendedor_puede_crear_clientes(): void
    {
        $this->iniciarSesionComo(Role::Vendedor);

        $this->postJson('/api/clientes', ['nombre' => 'Juan Pérez'])->assertCreated();
    }

    public function test_el_almacen_no_puede_registrar_ventas(): void
    {
        $this->iniciarSesionComo(Role::Almacen);

        $this->postJson('/api/ventas', [])->assertForbidden();
    }
}