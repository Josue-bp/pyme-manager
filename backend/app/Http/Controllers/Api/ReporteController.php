<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MovimientoInventario;
use App\Models\Venta;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReporteController extends Controller
{
    // Los 5 productos con más unidades salidas en el período
    public function consumo(Request $request): JsonResponse
    {
        $filas = MovimientoInventario::query()
            ->join('productos', 'productos.id', '=', 'movimientos_inventario.producto_id')
            ->where('movimientos_inventario.tipo', 'salida')
            ->where('movimientos_inventario.created_at', '>=', now()->subDays($this->dias($request)))
            ->groupBy('productos.id', 'productos.nombre')
            ->selectRaw('productos.nombre as producto, SUM(movimientos_inventario.cantidad) as cantidad')
            ->orderByDesc('cantidad')
            ->limit(5)
            ->get()
            ->map(fn ($fila) => [
                'producto' => $fila->producto,
                'cantidad' => (int) $fila->cantidad,
            ]);

        return response()->json($filas);
    }

    // Total vendido por día en el período
    public function ventasPorDia(Request $request): JsonResponse
    {
        $filas = Venta::query()
            ->where('created_at', '>=', now()->subDays($this->dias($request))->startOfDay())
            ->selectRaw('DATE(created_at) as dia, SUM(total) as total')
            ->groupBy('dia')
            ->orderBy('dia')
            ->get()
            ->map(fn ($fila) => [
                'dia' => $fila->dia,
                'total' => (float) $fila->total,
            ]);

        return response()->json($filas);
    }

    private function dias(Request $request): int
    {
        $dias = (int) $request->query('dias', 30);

        return in_array($dias, [7, 30, 90], true) ? $dias : 30;
    }
}