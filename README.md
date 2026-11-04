# PyME Manager

![CI](https://github.com/Josue-bp/pyme-manager/actions/workflows/ci.yml/badge.svg)

Plataforma web para que pequeñas empresas administren **inventario, compras, ventas, clientes y empleados**, con roles y permisos, auditoría de movimientos y una API REST documentada.

![Inventario](docs/capturas/inventario.png)

## Funcionalidades

- **Autenticación y roles:** inicio de sesión con tokens (Laravel Sanctum) y tres roles: administrador, vendedor y almacén.
- **Catálogo:** productos, categorías y almacenes.
- **Inventario con auditoría:** cada cambio de stock es un movimiento (entrada o salida) con usuario, fecha y motivo. El stock actual se calcula a partir de ellos.
- **Compras y proveedores:** al registrar una compra, el stock sube automáticamente.
- **Ventas y clientes:** al registrar una venta, el stock baja automáticamente, y se genera un **comprobante interno en PDF**.
- **Reportes:** resumen del inventario (productos, bajo mínimo, valor total), productos más consumidos y ventas por día.
- **RRHH:** empleados vinculados a los usuarios del sistema.
- **API REST** con documentación interactiva (OpenAPI).

## Capturas

| Inicio de sesión | Nueva venta |
| --- | --- |
| ![Login](docs/capturas/login.png) | ![Ventas](docs/capturas/ventas.png) |

| Reportes | Documentación de la API |
| --- | --- |
| ![Reportes](docs/capturas/reportes.png) | ![API](docs/capturas/api-docs.png) |

## Tecnologías

| Capa | Tecnología |
| --- | --- |
| Backend | Laravel 12 (PHP 8.3), Laravel Sanctum, DomPDF |
| Frontend | React + TypeScript (Vite), React Router, Recharts |
| Base de datos | MySQL 8 |
| Calidad | PHPUnit (pruebas de funcionalidad), GitHub Actions |
| Documentación | OpenAPI generado con Scramble |

## Requisitos

- PHP 8.2 o superior y Composer
- MySQL 8
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
cp .env.example .env        # en Windows (cmd): copy .env.example .env
php artisan key:generate
```

Crea la base de datos y revisa las credenciales en `.env` (por defecto: usuario `root`, sin contraseña):

```bash
mysql -u root -e "CREATE DATABASE pyme_manager CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

Crea las tablas y carga los datos de demostración, y arranca el servidor:

```bash
php artisan migrate --seed
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

## Usuarios de demostración

Todos con la contraseña `password`. Son datos de prueba: cámbialos antes de desplegar en un entorno real.

| Rol | Correo |
| --- | --- |
| Administrador | `admin@pyme.test` |
| Vendedor | `vendedor@pyme.test` |
| Almacén | `almacen@pyme.test` |

## Permisos por rol

| Funcionalidad | Administrador | Vendedor | Almacén |
| --- | :---: | :---: | :---: |
| Consultar inventario, productos, stock y movimientos | ✅ | ✅ | ✅ |
| Gestionar categorías, productos y movimientos | ✅ | — | ✅ |
| Proveedores y compras | ✅ | — | ✅ |
| Clientes (crear y editar) | ✅ | ✅ | — |
| Ventas y comprobantes | ✅ | ✅ | — |
| Reportes | ✅ | — | — |
| Usuarios, almacenes, RRHH y borrar clientes | ✅ | — | — |

## Documentación de la API

Con el backend en marcha, la documentación interactiva está en:

```
http://127.0.0.1:8000/docs/api
```

Para probar rutas protegidas, inicia sesión con `POST /api/login`, copia el `token` de la respuesta y pégalo en la sección *Bearer Auth*.

## Pruebas

Las pruebas usan una base de datos aparte, para no tocar la de desarrollo:

```bash
mysql -u root -e "CREATE DATABASE pyme_manager_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
cd backend
php artisan test
```

Cubren el inicio de sesión, los permisos por rol, las ventas, las compras y el control de stock. Se ejecutan automáticamente en GitHub Actions en cada `push`, junto con la compilación del frontend.

## Decisiones técnicas

- **El stock no se guarda: se calcula.** Cada entrada o salida es un registro en `movimientos_inventario` con usuario, fecha y motivo. El stock es la suma de entradas menos salidas, así que el historial es completo y auditable por diseño.
- **Ventas y compras son transaccionales.** Se guardan la cabecera, las líneas y los movimientos de inventario en una única transacción: si algo falla, no se guarda nada.
- **Control de concurrencia.** Al vender, los productos se bloquean (`lockForUpdate`) mientras se comprueba el stock, para que dos ventas simultáneas no dejen el stock en negativo.
- **El precio lo decide el servidor.** En una venta, el precio se toma de la base de datos y no de lo que envíe el cliente, y se guarda en cada línea para conservar el precio histórico.
- **Importes en centavos enteros** al calcular totales, para evitar errores de redondeo con decimales.
- **Permisos en la API.** Los roles se validan en el backend con un middleware, no solo ocultando botones en la interfaz.
- **Pruebas con protección.** La clase base de las pruebas se detiene si la base de datos configurada no termina en `_test`, para no borrar datos de desarrollo por error.

## Estructura

```
pyme-manager/
├── backend/            # API REST con Laravel
│   ├── app/            # Modelos, controladores, middleware y enums
│   ├── database/       # Migraciones y seeders
│   └── tests/          # Pruebas de funcionalidad
├── frontend/           # Interfaz con React + TypeScript
│   └── src/
├── docs/               # Capturas y documentación
└── .github/workflows/  # Integración continua
```

## Posibles mejoras

- Anulación de ventas y compras con reversión de stock.
- Permisos más granulares (por acción) en lugar de roles fijos.
- Autenticación con cookies `HttpOnly` en lugar de guardar el token en `localStorage`.
- Búsqueda en el servidor para los desplegables con muchos datos.
- Moneda configurable desde el servidor.
- Despliegue con Docker.

## Convención de commits

Se usan [Conventional Commits](https://www.conventionalcommits.org/) con la descripción en español: `feat`, `fix`, `docs`, `test`, `ci`, `chore`, `refactor`.
