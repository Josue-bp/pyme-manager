<?php

namespace App\Http\Controllers\Api;

use App\Enums\Role;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(
            User::orderBy('id')->get(['id', 'name', 'email', 'role'])
        );
    }

    public function store(Request $request): JsonResponse
    {
        $datos = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'role' => ['required', Rule::enum(Role::class)],
        ]);

        $usuario = User::create($datos);

        return response()->json(
            $usuario->only(['id', 'name', 'email', 'role']),
            201
        );
    }
}