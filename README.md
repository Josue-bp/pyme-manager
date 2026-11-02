# PyME Manager

Plataforma web para que pequeñas empresas administren **ventas, inventario, clientes y empleados**.

> Proyecto en desarrollo.

## Funcionalidades previstas

- Registro e inicio de sesión con roles y permisos
- Gestión de productos, inventario y proveedores
- Registro de ventas y comprobantes internos
- Panel de estadísticas con gráficos y reportes
- Historial de movimientos y auditoría
- API REST para conectar aplicaciones externas

## Tecnologías

| Capa | Tecnología |
| --- | --- |
| Backend | Laravel (PHP 8.3) |
| Frontend | React + TypeScript (Vite) |
| Base de datos | MySQL 8.4 |

## Requisitos

- PHP 8.2 o superior y Composer
- MySQL
- Node.js 20.19 o superior
- Git

En Windows, [Laragon](https://laragon.org/) incluye todo lo anterior.

## Instalación

```bash
git clone https://github.com/Josue-bp/pyme-manager.git
cd pyme-manager
```

### Backend

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
```

Crea la base de datos `pyme_manager` en MySQL, revisa las credenciales en `.env` y ejecuta:

```bash
php artisan migrate
php artisan serve
```

La API queda en `http://127.0.0.1:8000`.

### Frontend

En otra terminal:

```bash
cd frontend
npm install
npm run dev
```

La aplicación queda en `http://localhost:5173`. Vite redirige las llamadas a `/api` hacia Laravel.

## Estructura

```
pyme-manager/
├── backend/    # API REST con Laravel
├── frontend/   # Interfaz con React
└── README.md
```

## Hoja de ruta

- [x] Configuración inicial: repositorio, backend, frontend y conexión entre ambos
- [ ] Autenticación, roles y permisos
- [ ] Catálogo: productos, categorías, proveedores y almacenes
- [ ] Inventario, movimientos y auditoría
- [ ] Clientes, ventas y comprobantes
- [ ] Panel de estadísticas y reportes
- [ ] Empleados (RRHH)
- [ ] Documentación de la API, pruebas automatizadas y despliegue

## Convención de commits

Se usan [Conventional Commits](https://www.conventionalcommits.org/) con la descripción en español: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`.
