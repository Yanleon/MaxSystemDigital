# Deploy en Hostinger (MaxSystemDigital)

## 0) Recomendacion de flujo
1. Subir primero a GitHub (rama estable `main`).
2. Desplegar desde ese estado a Hostinger.
3. Validar en vivo con el checklist de seguridad y funcionalidad.

## 1) Subir archivos a hosting
- Sube el proyecto completo a `public_html` (o a `public_html/maxsystemdigital`).
- Estructura esperada:
  - `frontend/`
  - `backend/`
  - `DEPLOY_HOSTINGER.md`

## 2) Base de datos
- Crear base MySQL y usuario en Hostinger.
- Importar tu SQL base.
- Si usas script de upgrade, ejecutarlo despues de importar base:
  - `backend/app/database/landing_upgrade.sql`

## 3) Configurar conexion de BD
Editar `backend/app/database/Connection.php`:
- Host
- Nombre BD
- Usuario
- Password

## 4) Configuracion de produccion
Verificar en `backend/config/app.php`:
- `environment` => `production`
- `debug` => `false`

## 5) Permisos de escritura
Dar permisos de escritura a:
- `backend/public/uploads/`
- `backend/public/uploads/services/`
- `backend/public/uploads/about/`
- `backend/public/uploads/hero/`
- `backend/public/uploads/logos/`
- `backend/public/uploads/portfolio/`
- `backend/storage/logs/` (si existe)

## 6) Seguridad activa en servidor
Este proyecto ya incluye hardening:
- `backend/.htaccess` bloquea acceso a `app/`, `config/`, `storage/` y archivos sensibles.
- `backend/public/.htaccess` agrega headers de seguridad.
- `backend/public/uploads/.htaccess` evita ejecucion de scripts en uploads.

## 7) Crear usuario admin (si no existe)
Usa una contrasena hasheada con `password_hash`.

Ejemplo de hash desde PHP local:
```php
<?php echo password_hash('TuClaveSegura123*', PASSWORD_DEFAULT); ?>
```

Insert SQL:
```sql
INSERT INTO users (name, email, password, role)
VALUES ('Administrador', 'admin@tudominio.com', '$2y$10$...', 'admin');
```

## 8) URLs de prueba
Si esta en raiz:
- `https://TU-DOMINIO/backend/public/`
- `https://TU-DOMINIO/backend/public/hero`
- `https://TU-DOMINIO/backend/admin/login.html`
- `https://TU-DOMINIO/frontend/index.html`

Si esta en subcarpeta `/maxsystemdigital`:
- `https://TU-DOMINIO/maxsystemdigital/backend/public/`
- `https://TU-DOMINIO/maxsystemdigital/backend/admin/login.html`
- `https://TU-DOMINIO/maxsystemdigital/frontend/index.html`

## 9) Checklist funcional
- Login admin funciona.
- Logout redirige al frontend.
- Contact form publico guarda en BD.
- Hero/Services/Plans/Testimonials cargan en frontend.
- Upload de imagenes funciona.

## 10) Checklist de seguridad
- Abrir `backend/admin/dashboard.html` sin login -> redirige a login.
- GET privado sin sesion (ej: `/backend/public/contacts`) -> `401`.
- Usuario sin rol admin en endpoint admin -> `403`.
- 5 intentos fallidos de login -> bloqueo temporal (`429`).
- Tras logout, no se puede seguir administrando al volver atras.

## 11) Si algo falla
- Revisar logs PHP/Apache del hosting.
- Confirmar version de PHP (ideal 8.2).
- Verificar que `mod_rewrite` este activo.
- Verificar permisos de carpetas de uploads y logs.
