<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cliente;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\Rule;

class ClienteController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $consulta = Cliente::orderBy('nombre');

        if ($buscar = $request->query('buscar')) {
            $consulta->where(function ($q) use ($buscar) {
                $q->where('nombre', 'like', "%{$buscar}%")
                    ->orWhere('documento', 'like', "%{$buscar}%");
            });
        }
        if ($request->boolean('todos')) {
            return response()->json($consulta->get());
        }
        return response()->json($consulta->paginate(10));
    }

    public function store(Request $request): JsonResponse
    {
        $cliente = Cliente::create($request->validate($this->reglas()));

        return response()->json($cliente->refresh(), 201);
    }

    public function show(Cliente $cliente): JsonResponse
    {
        return response()->json($cliente);
    }

    public function update(Request $request, Cliente $cliente): JsonResponse
    {
        $cliente->update($request->validate($this->reglas($cliente)));

        return response()->json($cliente);
    }

    public function destroy(Cliente $cliente): Response
    {
        $cliente->delete();

        return response()->noContent();
    }

    private function reglas(?Cliente $cliente = null): array
    {
        return [
            'nombre' => ['required', 'string', 'max:150'],
            'documento' => [
                'nullable', 'string', 'max:20',
                Rule::unique('clientes', 'documento')->ignore($cliente?->id),
            ],
            'email' => ['nullable', 'email', 'max:255'],
            'telefono' => ['nullable', 'string', 'max:30'],
            'direccion' => ['nullable', 'string', 'max:255'],
        ];
    }
}