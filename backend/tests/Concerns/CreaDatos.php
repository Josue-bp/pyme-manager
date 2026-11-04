<?php

namespace Tests\Concerns;

use App\Enums\Role;
use App\Enums\TipoMovimiento;
use App\Models\Almacen;
use App\Models\MovimientoInventario;
use App\Models\Producto;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

trait CreaDatos
{
    protected function iniciarSesionComo(Role $rol): User
    {
        $usuario = User::factory()->create(['role' => $rol]);
        Sanctum::actingAs($usuario);

        return $usuario;
    }

    protected function crearAlmacen(string $nombre = 'Almacén Principal'): Almacen
    {
        return Almacen::create(['nombre' => $nombre]);
    }

    protected function crearProducto(array $atributos = []): Producto
    {
        return Producto::create(array_merge([
            'sku' => 'SKU-'.uniqid(),
            'nombre' => 'Producto de prueba',
            'precio' => 10,
            'stock_minimo' => 5,
        ], $atributos));
    }

    protected function ingresarStock(Producto $producto, Almacen $almacen, int $cantidad, User $usuario): void
    {
        MovimientoInventario::create([
            'producto_id' => $producto->id,
            'almacen_id' => $almacen->id,
            'user_id' => $usuario->id,
            'tipo' => TipoMovimiento::Entrada,
            'cantidad' => $cantidad,
            'motivo' => 'Stock inicial',
        ]);
    }
}