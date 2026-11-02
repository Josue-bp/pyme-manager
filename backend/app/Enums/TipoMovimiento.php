<?php

namespace App\Enums;

enum TipoMovimiento: string
{
    case Entrada = 'entrada';
    case Salida = 'salida';
}