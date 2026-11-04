<?php

namespace Tests\Feature;

use App\Enums\Role;
use App\Models\MovimientoInventario;
use App\Models\Proveedor;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\CreaDatos;
use Tests\TestCase;

class CompraTest extends TestCase
{
    use CreaDatos;
    use RefreshDatabase;

    public function test_una_compra_aumenta_el_stock_y_registra_el_movimiento(): void
    {
        $this->iniciarSesionComo(Role::Almacen);
        $almacen = $this->crearAlmacen();
        $producto = $this->crearProducto();
        $proveedor = Proveedor::create(['nombre' => 'Proveedor de prueba']);

        $respuesta = $this->postJson('/api/compras', [
            'proveedor_id' => $proveedor->id,
            'almacen_id' => $almacen->id,
            'items' => [['producto_id' => $producto->id, 'cantidad' => 10, 'costo_unitario' => 4.50]],
        ]);

        $numero = 'C-'.str_pad((string) $respuesta->json('id'), 6, '0', STR_PAD_LEFT);

        $respuesta->assertCreated()
            ->assertJsonPath('total', '45.00')
            ->assertJsonPath('numero', $numero);

        $this->assertSame(10, MovimientoInventario::stockDe($producto->id, $almacen->id));

        $this->assertDatabaseHas('movimientos_inventario', [
            'producto_id' => $producto->id,
            'tipo' => 'entrada',
            'cantidad' => 10,
            'motivo' => "Compra {$numero}",
        ]);
    }

    public function test_el_vendedor_no_puede_registrar_compras(): void
    {
        $this->iniciarSesionComo(Role::Vendedor);

        $this->postJson('/api/compras', [])->assertForbidden();
    }

    public function test_no_permite_comprar_a_un_proveedor_inactivo(): void
    {
        $this->iniciarSesionComo(Role::Administrador);
        $almacen = $this->crearAlmacen();
        $producto = $this->crearProducto();
        $proveedor = Proveedor::create(['nombre' => 'Proveedor inactivo', 'activo' => false]);

        $this->postJson('/api/compras', [
            'proveedor_id' => $proveedor->id,
            'almacen_id' => $almacen->id,
            'items' => [['producto_id' => $producto->id, 'cantidad' => 1, 'costo_unitario' => 1]],
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('proveedor_id');

        $this->assertDatabaseCount('compras', 0);
    }
}