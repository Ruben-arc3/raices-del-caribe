# Raíces del Caribe

## Propósito

Raíces del Caribe es una plataforma pensada para acercar a compradores y artesanas y artesanos de la costa Caribe colombiana. Reúne productos hechos a mano y muestra quién los crea, de dónde vienen y qué saberes acompañan su elaboración.

El proyecto también busca compartir y poner en valor la diversidad cultural de la región. Sus secciones educativas presentan historias sobre los pueblos, territorios y oficios vinculados a las piezas, para que cada visita sea una oportunidad de conocer mejor sus contextos y tradiciones.

La tienda permite explorar el catálogo, buscar y filtrar productos, consultar sus detalles y guardar favoritos o artículos en la canasta después de iniciar sesión. La intención es apoyar el trabajo artesanal y promover una relación más consciente con los objetos y las historias que representan.

## Funcionalidades

- Catálogo de artesanías con búsqueda, categorías y páginas de detalle.
- Información sobre el origen, el oficio y las personas creadoras de cada pieza.
- Sección para explorar relatos y contenidos culturales del Caribe colombiano.
- Registro e inicio de sesión; favoritos y canasta asociados a cada cuenta.
- API para productos, cultura, comentarios y valoraciones.

## Stack

- Frontend: React, TypeScript y Vite.
- API: Express y TypeScript.
- Base de datos: PostgreSQL (`pg`).

## Preparar PostgreSQL

1. Crea una base de datos PostgreSQL llamada `artesanias_caribe` (por ejemplo, desde pgAdmin).
2. Copia `.env.example` como `.env` y define `DATABASE_URL` con usuario, contraseña y base de datos, además de un `JWT_SECRET` aleatorio largo.
3. Instala dependencias con `npm install` y ejecuta `npm run db:migrate` para crear las tablas y datos iniciales.
4. Arranca cliente y API con `npm run dev`.

La interfaz queda en `http://localhost:5173`; la API en `http://localhost:3001`. El estado de PostgreSQL se puede consultar en `GET /api/health`.

## API disponible

- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- `GET /api/products`, `GET /api/products/:id`, `GET /api/culture`
- Carrito autenticado: `GET/POST /api/users/me/cart`, `PATCH/DELETE /api/users/me/cart/:productId`
- Favoritos autenticados: `GET /api/users/me/favorites`, `PUT/DELETE /api/users/me/favorites/:productId`
- Comentarios: `POST /api/products/:id/comments`, `PATCH/DELETE /api/comments/:id`
- Valoraciones: `PUT /api/products/:id/rating`

Las rutas autenticadas esperan `Authorization: Bearer <token>`. Las contraseñas se guardan con hash bcrypt y nunca en texto plano. La migración puede ejecutarse de nuevo para aplicar cambios de esquema y actualizar las historias de los productos de ejemplo.
