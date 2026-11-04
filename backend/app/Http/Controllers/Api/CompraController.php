<?php

namespace App\Http\Controllers\Api;

use App\Enums\TipoMovimiento;
use App\Http\Controllers\Controller;
use App\Models\Compra;
use App\Models\MovimientoInventario;
use App\Models\Proveedor;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CompraController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(
            Compra::with(['proveedor:id,nombre', 'usuario:id,name', 'almacen:id,nombre'])
                ->latest('id')
                ->paginate(10)
        );
    }

    public function show(Compra $compra): JsonResponse
    {
        return response()->json($compra->load([
            'proveedor',
            'usuario:id,name',
            'almacen:id,nombre',
            'items.producto:id,sku,nombre',
        ]));
    }

    /**
     * Registrar una compra
     *
     * Aumenta el stock automáticamente con un movimiento de entrada por producto.
     */
    public function store(Request $request): JsonResponse
    {
        $datos = $request->validate([
            'proveedor_id' => ['required', 'exists:proveedores,id'],
            'almacen_id' => ['required', 'exists:almacenes,id'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.producto_id' => ['required', 'distinct', 'exists:productos,id'],
            'items.*.cantidad' => ['required', 'integer', 'min:1'],
            'items.*.costo_unitario' => ['required', 'numeric', 'min:0', 'decimal:0,2'],
        ]);

        $compra = DB::transaction(function () use ($datos, $request) {
            $proveedor = Proveedor::findOrFail($datos['proveedor_id']);

            if (! $proveedor->activo) {
                throw ValidationException::withMessages([
                    'proveedor_id' => ["El proveedor {$proveedor->nombre} está inactivo."],
                ]);
            }

            $compra = Compra::create([
                'proveedor_id' => $proveedor->id,
                'almacen_id' => $datos['almacen_id'],
                'user_id' => $request->user()->id,
            ]);

            $numero = 'C-'.str_pad((string) $compra->id, 6, '0', STR_PAD_LEFT);
            $compra->update(['numero' => $numero]);

            $totalCentavos = 0;

            foreach ($datos['items'] as $item) {
                // Importes en centavos enteros para evitar errores de redondeo
                $costoCentavos = (int) round(((float) $item['costo_unitario']) * 100);
                $subtotalCentavos = $costoCentavos * $item['cantidad'];
                $totalCentavos += $subtotalCentavos;

                $compra->items()->create([
                    'producto_id' => $item['producto_id'],
                    'cantidad' => $item['cantidad'],
                    'costo_unitario' => number_format($costoCentavos / 100, 2, '.', ''),
                    'subtotal' => number_format($subtotalCentavos / 100, 2, '.', ''),
                ]);

                MovimientoInventario::create([
                    'producto_id' => $item['producto_id'],
                    'almacen_id' => $datos['almacen_id'],
                    'user_id' => $request->user()->id,
                    'tipo' => TipoMovimiento::Entrada,
                    'cantidad' => $item['cantidad'],
                    'motivo' => "Compra {$numero}",
                ]);
            }

            $compra->update(['total' => number_format($totalCentavos / 100, 2, '.', '')]);

            return $compra;
        });

        return response()->json(
            $compra->load(['proveedor', 'usuario:id,name', 'almacen:id,nombre', 'items.producto:id,sku,nombre']),
            201
        );
    }
}