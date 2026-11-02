<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\CategoriaController;
use App\Http\Controllers\Api\ProductoController;

Route::get('/ping', function () {
    return response()->json([
        'mensaje' => 'API de PyME Manager funcionando',
        'hora' => now()->toIso8601String(),
    ]);
});
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
});
Route::middleware(['auth:sanctum', 'rol:administrador'])->group(function () {
    Route::get('/usuarios', [UserController::class, 'index']);
    Route::post('/usuarios', [UserController::class, 'store']);
});
Route::middleware('auth:sanctum')->group(function () {
    // Cualquier usuario con sesión puede consultar
    Route::get('/categorias', [CategoriaController::class, 'index']);
    Route::get('/categorias/{categoria}', [CategoriaController::class, 'show']);

    // Solo administrador y almacén pueden modificar
    Route::middleware('rol:administrador,almacen')->group(function () {
        Route::post('/categorias', [CategoriaController::class, 'store']);
        Route::put('/categorias/{categoria}', [CategoriaController::class, 'update']);
        Route::delete('/categorias/{categoria}', [CategoriaController::class, 'destroy']);
    });
});
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/categorias', [CategoriaController::class, 'index']);
    Route::get('/categorias/{categoria}', [CategoriaController::class, 'show']);

    Route::get('/productos', [ProductoController::class, 'index']);
    Route::get('/productos/{producto}', [ProductoController::class, 'show']);

    Route::middleware('rol:administrador,almacen')->group(function () {
        Route::post('/categorias', [CategoriaController::class, 'store']);
        Route::put('/categorias/{categoria}', [CategoriaController::class, 'update']);
        Route::delete('/categorias/{categoria}', [CategoriaController::class, 'destroy']);

        Route::post('/productos', [ProductoController::class, 'store']);
        Route::put('/productos/{producto}', [ProductoController::class, 'update']);
        Route::delete('/productos/{producto}', [ProductoController::class, 'destroy']);
    });
});