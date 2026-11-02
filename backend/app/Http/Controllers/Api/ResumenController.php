<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MovimientoInventario;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class ResumenController extends Controller
{
    public function __invoke(): JsonResponse
    {
        // Stock total de cada producto (entradas - salidas)
        $stock = MovimientoInventario::query()
            ->select('producto_id')
            ->selectRaw("SUM(CASE WHEN tipo = 'entrada' THEN cantidad ELSE 0 END)
                - SUM(CASE WHEN tipo = 'salida' THEN cantidad ELSE 0 END) as stock")
            ->groupBy('producto_id');

        $fila = DB::table('productos')
            ->leftJoinSub($stock, 's', 's.producto_id', '=', 'productos.id')
            ->where('productos.activo', true)
            ->selectRaw('COUNT(*) as total,
                SUM(CASE WHEN COALESCE(s.stock, 0) < productos.stock_minimo THEN 1 ELSE 0 END) as bajo,
                COALESCE(SUM(COALESCE(s.stock, 0) * productos.precio), 0) as valor')
            ->first();

        return response()->json([
            'total_productos' => (int) $fila->total,
            'bajo_minimo' => (int) $fila->bajo,
            'valor_inventario' => number_format((float) $fila->valor, 2, '.', ''),
        ]);
    }
}