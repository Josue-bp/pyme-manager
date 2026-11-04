<?php

namespace Tests\Feature;

use App\Enums\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_con_credenciales_correctas_devuelve_un_token(): void
    {
        User::factory()->create([
            'email' => 'admin@pyme.test',
            'role' => Role::Administrador,
        ]);

        $this->postJson('/api/login', [
            'email' => 'admin@pyme.test',
            'password' => 'password',
        ])
            ->assertOk()
            ->assertJsonStructure(['token', 'usuario' => ['id', 'name', 'email', 'role']])
            ->assertJsonPath('usuario.role', 'administrador');
    }

    public function test_login_con_contrasena_incorrecta_falla(): void
    {
        User::factory()->create(['email' => 'admin@pyme.test']);

        $this->postJson('/api/login', [
            'email' => 'admin@pyme.test',
            'password' => 'incorrecta',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('email');
    }

    public function test_una_ruta_protegida_sin_token_devuelve_401(): void
    {
        $this->getJson('/api/me')->assertUnauthorized();
    }
}