<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Categoria;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\Rule;

class CategoriaController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Categoria::orderBy('nombre')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $datos = $request->validate([
            'nombre' => ['required', 'string', 'max:100', 'unique:categorias,nombre'],
            'descripcion' => ['nullable', 'string', 'max:500'],
        ]);

        return response()->json(Categoria::create($datos), 201);
    }

    public function show(Categoria $categoria): JsonResponse
    {
        return response()->json($categoria);
    }

    public function update(Request $request, Categoria $categoria): JsonResponse
    {
        $datos = $request->validate([
            'nombre' => [
                'required', 'string', 'max:100',
                Rule::unique('categorias', 'nombre')->ignore($categoria->id),
            ],
            'descripcion' => ['nullable', 'string', 'max:500'],
        ]);

        $categoria->update($datos);

        return response()->json($categoria);
    }

    public function destroy(Categoria $categoria): Response
    {
        $categoria->delete();

        return response()->noContent();
    }
}