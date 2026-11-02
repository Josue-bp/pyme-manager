<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;

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
