<?php

namespace Database\Seeders;

use App\Enums\Role;
use App\Enums\TipoMovimiento;
use App\Models\Almacen;
use App\Models\Categoria;
use App\Models\Cliente;
use App\Models\Empleado;
use App\Models\MovimientoInventario;
use App\Models\Producto;
use App\Models\User;
use Illuminate\Database\Seeder;
use App\Models\Proveedor;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Usuarios de demostración (contraseña: "password")
        $admin = $this->usuario('admin@pyme.test', 'Administrador', Role::Administrador);
        $vendedor = $this->usuario('vendedor@pyme.test', 'Carlos Vendedor', Role::Vendedor);
        $almacenero = $this->usuario('almacen@pyme.test', 'Lucía Almacén', Role::Almacen);

        $principal = Almacen::firstOrCreate(
            ['nombre' => 'Almacén Principal'],
            ['direccion' => 'Av. Principal 123']
        );
        $norte = Almacen::firstOrCreate(
            ['nombre' => 'Almacén Norte'],
            ['direccion' => 'Calle Norte 456']
        );

        $papeleria = Categoria::firstOrCreate(
            ['nombre' => 'Papelería'],
            ['descripcion' => 'Papel, carpetas y útiles']
        );
        $tecnologia = Categoria::firstOrCreate(
            ['nombre' => 'Tecnología'],
            ['descripcion' => 'Equipos y periféricos']
        );
        $impresion = Categoria::firstOrCreate(
            ['nombre' => 'Impresión'],
            ['descripcion' => 'Impresoras y consumibles']
        );

        // [sku, nombre, categoría, precio, stock mínimo, almacén, stock inicial]
        $productos = [
            ['PAP-A4-75', 'Papel Bond A4 75g', $papeleria, 25.50, 200, $principal, 120],
            ['MOU-WL-001', 'Mouse Inalámbrico', $tecnologia, 45.00, 50, $principal, 35],
            ['TEC-USB-001', 'Teclado USB', $tecnologia, 38.00, 50, $norte, 80],
            ['MON-24-001', 'Monitor 24"', $tecnologia, 520.00, 20, $principal, 18],
            ['IMP-LAS-HP', 'Impresora Láser HP', $impresion, 890.00, 10, $norte, 7],
            ['TIN-664-BK', 'Tinta Negra 664', $impresion, 32.00, 100, $norte, 150],
            ['CAR-ARCH-001', 'Carpeta Archivadora', $papeleria, 6.50, 150, $norte, 300],
            ['CIN-2-001', 'Cinta Adhesiva 2"', $papeleria, 3.20, 30, $principal, 22],
        ];

        foreach ($productos as [$sku, $nombre, $categoria, $precio, $minimo, $almacen, $stock]) {
            $producto = Producto::updateOrCreate(['sku' => $sku], [
                'nombre' => $nombre,
                'categoria_id' => $categoria->id,
                'precio' => $precio,
                'stock_minimo' => $minimo,
                'activo' => true,
            ]);

            // Solo se carga el stock inicial una vez
            if (! MovimientoInventario::where('producto_id', $producto->id)->exists()) {
                MovimientoInventario::create([
                    'producto_id' => $producto->id,
                    'almacen_id' => $almacen->id,
                    'user_id' => $admin->id,
                    'tipo' => TipoMovimiento::Entrada,
                    'cantidad' => $stock,
                    'motivo' => 'Stock inicial',
                ]);
            }
        }

        $clientes = [
            ['Juan Pérez', '12345678', '999111222'],
            ['Comercial Andina S.A.C.', '20123456789', '014445566'],
            ['María Gómez', '87654321', null],
        ];
        $proveedores = [
            ['Distribuidora Papelera S.A.', '20111222333', 'Rosa Díaz', '014001122'],
            ['TecnoImport E.I.R.L.', '20444555666', 'Luis Ramos', '016003344'],
        ];

        foreach ($proveedores as [$nombre, $documento, $contacto, $telefono]) {
            Proveedor::updateOrCreate(['documento' => $documento], [
                'nombre' => $nombre,
                'contacto' => $contacto,
                'telefono' => $telefono,
                'activo' => true,
            ]);
        }
        foreach ($clientes as [$nombre, $documento, $telefono]) {
            Cliente::updateOrCreate(['documento' => $documento], [
                'nombre' => $nombre,
                'telefono' => $telefono,
            ]);
        }

        Empleado::updateOrCreate(['documento' => '70112233'], [
            'nombre' => 'Carlos Vendedor',
            'cargo' => 'Vendedor',
            'fecha_ingreso' => '2025-03-01',
            'activo' => true,
            'user_id' => $vendedor->id,
        ]);

        Empleado::updateOrCreate(['documento' => '70445566'], [
            'nombre' => 'Lucía Almacén',
            'cargo' => 'Encargada de almacén',
            'fecha_ingreso' => '2025-06-15',
            'activo' => true,
            'user_id' => $almacenero->id,
        ]);
    }

    private function usuario(string $email, string $nombre, Role $rol): User
    {
        return User::updateOrCreate(['email' => $email], [
            'name' => $nombre,
            'password' => 'password',
            'role' => $rol,
        ]);
    }
}