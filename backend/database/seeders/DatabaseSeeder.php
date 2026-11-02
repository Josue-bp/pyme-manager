<?php

namespace Database\Seeders;

use App\Enums\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@pyme.test'],
            [
                'name' => 'Administrador',
                'password' => 'password',
                'role' => Role::Administrador,
            ],
        );
    }
}