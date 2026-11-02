<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Producto;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\Rule;

class ProductoController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $consulta = Producto::with('categoria')->orderBy('nombre');

        if ($buscar = $request->query('buscar')) {
            $consulta->where(function ($q) use ($buscar) {
                $q->where('nombre', 'like', "%{$buscar}%")
                    ->orWhere('sku', 'like', "%{$buscar}%");
            });
        }

        return response()->json($consulta->paginate(10));
    }

    public function store(Request $request): JsonResponse
    {
        $producto = Producto::create($request->validate($this->reglas()));

        return response()->json($producto->load('categoria'), 201);
    }

    public function show(Producto $producto): JsonResponse
    {
        return response()->json($producto->load('categoria'));
    }

    public function update(Request $request, Producto $producto): JsonResponse
    {
        $producto->update($request->validate($this->reglas($producto)));

        return response()->json($producto->load('categoria'));
    }

    public function destroy(Producto $producto): Response
    {
        $producto->delete();

        return response()->noContent();
    }

    private function reglas(?Producto $producto = null): array
    {
        return [
            'sku' => [
                'required', 'string', 'max:50',
                Rule::unique('productos', 'sku')->ignore($producto?->id),
            ],
            'nombre' => ['required', 'string', 'max:150'],
            'descripcion' => ['nullable', 'string', 'max:1000'],
            'precio' => ['required', 'numeric', 'min:0'],
            'stock_minimo' => ['required', 'integer', 'min:0'],
            'activo' => ['boolean'],
            'categoria_id' => ['nullable', 'exists:categorias,id'],
        ];
    }
}