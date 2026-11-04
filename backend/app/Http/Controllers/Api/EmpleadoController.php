<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Empleado;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class EmpleadoController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $consulta = Empleado::with('usuario:id,name,email,role')->orderBy('nombre');

        if ($buscar = $request->query('buscar')) {
            $consulta->where(function ($q) use ($buscar) {
                $q->where('nombre', 'like', "%{$buscar}%")
                    ->orWhere('documento', 'like', "%{$buscar}%")
                    ->orWhere('cargo', 'like', "%{$buscar}%");
            });
        }

        return response()->json($consulta->paginate(10));
    }

    public function store(Request $request): JsonResponse
    {
        $empleado = Empleado::create($request->validate($this->reglas()));

        return response()->json(
            $empleado->refresh()->load('usuario:id,name,email,role'),
            201
        );
    }

    public function show(Empleado $empleado): JsonResponse
    {
        return response()->json($empleado->load('usuario:id,name,email,role'));
    }

    public function update(Request $request, Empleado $empleado): JsonResponse
    {
        $empleado->update($request->validate($this->reglas($empleado)));

        return response()->json($empleado->load('usuario:id,name,email,role'));
    }

    private function reglas(?Empleado $empleado = null): array
    {
        return [
            'nombre' => ['required', 'string', 'max:150'],
            'documento' => [
                'required', 'string', 'max:20',
                Rule::unique('empleados', 'documento')->ignore($empleado?->id),
            ],
            'cargo' => ['required', 'string', 'max:100'],
            'email' => ['nullable', 'email', 'max:255'],
            'telefono' => ['nullable', 'string', 'max:30'],
            'fecha_ingreso' => ['required', 'date'],
            'activo' => ['boolean'],
            'user_id' => [
                'nullable', 'exists:users,id',
                Rule::unique('empleados', 'user_id')->ignore($empleado?->id),
            ],
        ];
    }
}