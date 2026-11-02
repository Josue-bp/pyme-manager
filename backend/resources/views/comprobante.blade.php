@php
    // Moneda y zona horaria del comprobante (cámbialas si hace falta)
    $moneda = 'S/';
    $fecha = $venta->created_at->timezone('America/Lima')->format('d/m/Y H:i');
@endphp
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <title>Comprobante {{ $venta->numero }}</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 12px; color: #111; }
        h1 { font-size: 20px; margin: 0; }
        .sub { color: #555; margin-bottom: 16px; }
        .datos td { border: none; padding: 2px 0; }
        table { width: 100%; border-collapse: collapse; margin-top: 12px; }
        th, td { padding: 6px 8px; border-bottom: 1px solid #ccc; text-align: left; }
        .n { text-align: right; }
        .total { margin-top: 16px; text-align: right; font-size: 16px; font-weight: bold; }
        .pie { margin-top: 32px; color: #777; font-size: 10px; }
    </style>
</head>
<body>
    <h1>PyME Manager</h1>
    <div class="sub">Comprobante interno de venta</div>

    <table class="datos">
        <tr><td><strong>N.º:</strong> {{ $venta->numero }}</td><td><strong>Fecha:</strong> {{ $fecha }}</td></tr>
        <tr><td><strong>Cliente:</strong> {{ $venta->cliente?->nombre ?? 'Cliente general' }}</td><td><strong>Documento:</strong> {{ $venta->cliente?->documento ?? '—' }}</td></tr>
        <tr><td><strong>Almacén:</strong> {{ $venta->almacen->nombre }}</td><td><strong>Vendedor:</strong> {{ $venta->usuario->name }}</td></tr>
    </table>

    <table>
        <thead>
            <tr>
                <th>Producto</th>
                <th>SKU</th>
                <th class="n">Cant.</th>
                <th class="n">P. unit.</th>
                <th class="n">Subtotal</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($venta->items as $item)
                <tr>
                    <td>{{ $item->producto->nombre }}</td>
                    <td>{{ $item->producto->sku }}</td>
                    <td class="n">{{ $item->cantidad }}</td>
                    <td class="n">{{ $moneda }} {{ number_format($item->precio_unitario, 2) }}</td>
                    <td class="n">{{ $moneda }} {{ number_format($item->subtotal, 2) }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <div class="total">Total: {{ $moneda }} {{ number_format($venta->total, 2) }}</div>

    <div class="pie">Documento interno sin valor tributario.</div>
</body>
</html>