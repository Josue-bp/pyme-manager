<?php

namespace Tests\Feature;

use App\Enums\Role;
use App\Models\MovimientoInventario;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\CreaDatos;
use Tests\TestCase;

class VentaTest extends TestCase
{
    use CreaDatos;
    use RefreshDatabase;

    public function test_una_venta_descuenta_el_stock_y_registra_el_movimiento(): void
    {
        $vendedor = $this->iniciarSesionComo(Role::Vendedor);
        $almacen = $this->crearAlmacen();
        $producto = $this->crearProducto(['precio' => 25.50]);
        $this->ingresarStock($producto, $almacen, 10, $vendedor);

        $respuesta = $this->postJson('/api/ventas', [
            'almacen_id' => $almacen->id,
            'items' => [['producto_id' => $producto->id, 'cantidad' => 3]],
        ]);

        $numero = 'V-'.str_pad((string) $respuesta->json('id'), 6, '0', STR_PAD_LEFT);

        $respuesta->assertCreated()
            ->assertJsonPath('total', '76.50')
            ->assertJsonPath('numero', $numero);

        $this->assertSame(7, MovimientoInventario::stockDe($producto->id, $almacen->id));

        $this->assertDatabaseHas('movimientos_inventario', [
            'producto_id' => $producto->id,
            'tipo' => 'salida',
            'cantidad' => 3,
            'motivo' => "Venta {$numero}",
        ]);
    }

    public function test_no_permite_vender_mas_del_stock_disponible(): void
    {
        $vendedor = $this->iniciarSesionComo(Role::Vendedor);
        $almacen = $this->crearAlmacen();
        $producto = $this->crearProducto();
        $this->ingresarStock($producto, $almacen, 2, $vendedor);

        $this->postJson('/api/ventas', [
            'almacen_id' => $almacen->id,
            'items' => [['producto_id' => $producto->id, 'cantidad' => 5]],
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('items.0.cantidad');

        // No se guardó nada y el stock sigue igual
        $this->assertDatabaseCount('ventas', 0);
        $this->assertSame(2, MovimientoInventario::stockDe($producto->id, $almacen->id));
    }

    public function test_el_precio_lo_toma_la_base_de_datos_y_no_el_cliente(): void
    {
        $vendedor = $this->iniciarSesionComo(Role::Vendedor);
        $almacen = $this->crearAlmacen();
        $producto = $this->crearProducto(['precio' => 20]);
        $this->ingresarStock($producto, $almacen, 10, $vendedor);

        $this->postJson('/api/ventas', [
            'almacen_id' => $almacen->id,
            'items' => [[
                'producto_id' => $producto->id,
                'cantidad' => 2,
                'precio' => 0.01, // un cliente malintencionado intenta cambiar el precio
            ]],
        ])
            ->assertCreated()
            ->assertJsonPath('total', '40.00');
    }
}