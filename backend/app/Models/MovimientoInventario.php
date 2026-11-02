<?php

namespace App\Models;

use App\Enums\TipoMovimiento;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MovimientoInventario extends Model
{
    // Stock = entradas - salidas
    public const STOCK_SQL = "SUM(CASE WHEN movimientos_inventario.tipo = 'entrada' THEN movimientos_inventario.cantidad ELSE 0 END)
        - SUM(CASE WHEN movimientos_inventario.tipo = 'salida' THEN movimientos_inventario.cantidad ELSE 0 END)";

    protected $table = 'movimientos_inventario';

    protected $fillable = [
        'producto_id',
        'almacen_id',
        'user_id',
        'tipo',
        'cantidad',
        'motivo',
    ];

    protected function casts(): array
    {
        return ['tipo' => TipoMovimiento::class];
    }

    public static function stockDe(int|string $productoId, int|string $almacenId): int
    {
        $fila = static::where('producto_id', $productoId)
            ->where('almacen_id', $almacenId)
            ->selectRaw('COALESCE('.self::STOCK_SQL.', 0) as stock')
            ->first();

        return (int) $fila->stock;
    }

    public function producto(): BelongsTo
    {
        return $this->belongsTo(Producto::class);
    }

    public function almacen(): BelongsTo
    {
        return $this->belongsTo(Almacen::class);
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}