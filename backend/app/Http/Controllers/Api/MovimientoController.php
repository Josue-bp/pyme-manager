<?php

namespace App\Http\Controllers\Api;

use App\Enums\TipoMovimiento;
use App\Http\Controllers\Controller;
use App\Models\MovimientoInventario;
use App\Models\Producto;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class MovimientoController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $consulta = MovimientoInventario::with([
            'producto:id,sku,nombre',
            'almacen:id,nombre',
            'usuario:id,name',
        ])->latest('id');

        if ($request->filled('producto_id')) {
            $consulta->where('producto_id', $request->query('producto_id'));
        }

        if ($request->filled('almacen_id')) {
            $consulta->where('almacen_id', $request->query('almacen_id'));
        }

        return response()->json($consulta->paginate(15));
    }

    public function store(Request $request): JsonResponse
    {
        $datos = $request->validate([
            'producto_id' => ['required', 'exists:productos,id'],
            'almacen_id' => ['required', 'exists:almacenes,id'],
            'tipo' => ['required', Rule::enum(TipoMovimiento::class)],
            'cantidad' => ['required', 'integer', 'min:1'],
            'motivo' => ['nullable', 'string', 'max:255'],
        ]);

        $movimiento = DB::transaction(function () use ($datos, $request) {
            // Bloquea el producto: dos salidas simultáneas se ejecutan una detrás de otra
            Producto::whereKey($datos['producto_id'])->lockForUpdate()->first();

            if ($datos['tipo'] === TipoMovimiento::Salida->value) {
                $disponible = MovimientoInventario::stockDe($datos['producto_id'], $datos['almacen_id']);

                if ($datos['cantidad'] > $disponible) {
                    throw ValidationException::withMessages([
                        'cantidad' => ["Stock insuficiente. Disponible: {$disponible}."],
                    ]);
                }
            }

            return MovimientoInventario::create([
                ...$datos,
                'user_id' => $request->user()->id,
            ]);
        });

        return response()->json(
            $movimiento->load(['producto:id,sku,nombre', 'almacen:id,nombre', 'usuario:id,name']),
            201
        );
    }

    public function stock(): JsonResponse
    {
        $filas = MovimientoInventario::query()
            ->join('productos', 'productos.id', '=', 'movimientos_inventario.producto_id')
            ->join('almacenes', 'almacenes.id', '=', 'movimientos_inventario.almacen_id')
            ->groupBy(
                'productos.id', 'productos.sku', 'productos.nombre', 'productos.stock_minimo',
                'almacenes.id', 'almacenes.nombre'
            )
            ->selectRaw(
                'productos.id as producto_id, productos.sku, productos.nombre as producto,
                productos.stock_minimo, almacenes.id as almacen_id, almacenes.nombre as almacen,
                ('.MovimientoInventario::STOCK_SQL.') as stock'
            )
            ->orderBy('productos.nombre')
            ->get()
            ->map(function ($fila) {
                $stock = (int) $fila->stock;

                return [
                    'producto_id' => $fila->producto_id,
                    'sku' => $fila->sku,
                    'producto' => $fila->producto,
                    'almacen_id' => $fila->almacen_id,
                    'almacen' => $fila->almacen,
                    'stock' => $stock,
                    'stock_minimo' => $fila->stock_minimo,
                    'estado' => $stock < $fila->stock_minimo ? 'bajo_minimo' : 'ok',
                ];
            });

        return response()->json($filas);
    }
}