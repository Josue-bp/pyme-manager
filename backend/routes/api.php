<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/ping', function () {
    return response()->json([
        'mensaje' => 'API de PyME Manager funcionando',
        'hora' => now()->toIso8601String(),
    ]);
});