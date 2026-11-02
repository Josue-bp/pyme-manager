<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Almacen;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\Rule;

class AlmacenController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Almacen::orderBy('nombre')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $almacen = Almacen::create($request->validate($this->reglas()));

        return response()->json($almacen->refresh(), 201);
    }

    public function show(Almacen $almacen): JsonResponse
    {
        return response()->json($almacen);
    }

    public function update(Request $request, Almacen $almacen): JsonResponse
    {
        $almacen->update($request->validate($this->reglas($almacen)));

        return response()->json($almacen);
    }

    public function destroy(Almacen $almacen): Response
    {
        $almacen->delete();

        return response()->noContent();
    }

    private function reglas(?Almacen $almacen = null): array
    {
        return [
            'nombre' => [
                'required', 'string', 'max:100',
                Rule::unique('almacenes', 'nombre')->ignore($almacen?->id),
            ],
            'direccion' => ['nullable', 'string', 'max:255'],
            'activo' => ['boolean'],
        ];
    }
}