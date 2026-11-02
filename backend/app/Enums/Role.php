<?php

namespace App\Enums;

enum Role: string
{
    case Administrador = 'administrador';
    case Vendedor = 'vendedor';
    case Almacen = 'almacen';
}