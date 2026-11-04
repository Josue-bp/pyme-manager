<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Proveedor;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ProveedorController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $consulta = Proveedor::orderBy('nombre');

        if ($buscar = $request->query('buscar')) {
            $consulta->where(function ($q) use ($buscar) {
                $q->where('nombre', 'like', "%{$buscar}%")
                    ->orWhere('documento', 'like', "%{$buscar}%");
            });
        }

        // Lista completa de proveedores activos (para desplegables)
        if ($request->boolean('todos')) {
            return response()->json($consulta->where('activo', true)->get());
        }

        return response()->json($consulta->paginate(10));
    }

    public function store(Request $request): JsonResponse
    {
        $proveedor = Proveedor::create($request->validate($this->reglas()));

        return response()->json($proveedor->refresh(), 201);
    }

    public function show(Proveedor $proveedor): JsonResponse
    {
        return response()->json($proveedor);
    }

    public function update(Request $request, Proveedor $proveedor): JsonResponse
    {
        $proveedor->update($request->validate($this->reglas($proveedor)));

        return response()->json($proveedor);
    }

    private function reglas(?Proveedor $proveedor = null): array
    {
        return [
            'nombre' => ['required', 'string', 'max:150'],
            'documento' => [
                'nullable', 'string', 'max:20',
                Rule::unique('proveedores', 'documento')->ignore($proveedor?->id),
            ],
            'contacto' => ['nullable', 'string', 'max:150'],
            'email' => ['nullable', 'email', 'max:255'],
            'telefono' => ['nullable', 'string', 'max:30'],
            'direccion' => ['nullable', 'string', 'max:255'],
            'activo' => ['boolean'],
        ];
    }
}