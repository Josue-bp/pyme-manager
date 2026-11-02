<?php

namespace App\Http\Controllers\Api;

use App\Enums\TipoMovimiento;
use App\Http\Controllers\Controller;
use App\Models\MovimientoInventario;
use App\Models\Producto;
use App\Models\Venta;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class VentaController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(
            Venta::with(['cliente:id,nombre', 'usuario:id,name', 'almacen:id,nombre'])
                ->latest('id')
                ->paginate(10)
        );
    }

    public function show(Venta $venta): JsonResponse
    {
        return response()->json($venta->load([
            'cliente',
            'usuario:id,name',
            'almacen:id,nombre',
            'items.producto:id,sku,nombre',
        ]));
    }

    public function store(Request $request): JsonResponse
    {
        $datos = $request->validate([
            'cliente_id' => ['nullable', 'exists:clientes,id'],
            'almacen_id' => ['required', 'exists:almacenes,id'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.producto_id' => ['required', 'distinct', 'exists:productos,id'],
            'items.*.cantidad' => ['required', 'integer', 'min:1'],
        ]);

        $venta = DB::transaction(function () use ($datos, $request) {
            $ids = collect($datos['items'])->pluck('producto_id');

            // Bloquea los productos (en orden, para evitar bloqueos cruzados)
            $productos = Producto::whereIn('id', $ids)
                ->orderBy('id')
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            $venta = Venta::create([
                'cliente_id' => $datos['cliente_id'] ?? null,
                'almacen_id' => $datos['almacen_id'],
                'user_id' => $request->user()->id,
            ]);

            $numero = 'V-'.str_pad((string) $venta->id, 6, '0', STR_PAD_LEFT);
            $venta->update(['numero' => $numero]);

            $totalCentavos = 0;

            foreach (array_values($datos['items']) as $i => $item) {
                $producto = $productos[$item['producto_id']];

                if (! $producto->activo) {
                    throw ValidationException::withMessages([
                        "items.{$i}.producto_id" => ["El producto {$producto->nombre} está inactivo."],
                    ]);
                }

                $disponible = MovimientoInventario::stockDe($producto->id, $datos['almacen_id']);

                if ($item['cantidad'] > $disponible) {
                    throw ValidationException::withMessages([
                        "items.{$i}.cantidad" => [
                            "Stock insuficiente de {$producto->nombre}. Disponible: {$disponible}.",
                        ],
                    ]);
                }

                // El precio sale de la base de datos, nunca del cliente
                $precioCentavos = (int) round(((float) $producto->precio) * 100);
                $subtotalCentavos = $precioCentavos * $item['cantidad'];
                $totalCentavos += $subtotalCentavos;

                $venta->items()->create([
                    'producto_id' => $producto->id,
                    'cantidad' => $item['cantidad'],
                    'precio_unitario' => number_format($precioCentavos / 100, 2, '.', ''),
                    'subtotal' => number_format($subtotalCentavos / 100, 2, '.', ''),
                ]);

                MovimientoInventario::create([
                    'producto_id' => $producto->id,
                    'almacen_id' => $datos['almacen_id'],
                    'user_id' => $request->user()->id,
                    'tipo' => TipoMovimiento::Salida,
                    'cantidad' => $item['cantidad'],
                    'motivo' => "Venta {$numero}",
                ]);
            }

            $venta->update(['total' => number_format($totalCentavos / 100, 2, '.', '')]);

            return $venta;
        });

        return response()->json(
            $venta->load(['cliente', 'usuario:id,name', 'almacen:id,nombre', 'items.producto:id,sku,nombre']),
            201
        );
    }
}