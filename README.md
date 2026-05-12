# MaxSystemDigital - Proyecto Web

Proyecto web con:
- `frontend/` (landing publica)
- `backend/public/` (API en PHP)
- `backend/admin/` (panel administrativo)

## Stack
- PHP puro (router manual en `backend/public/index.php`)
- MySQL (PDO)
- HTML/CSS/JS en admin y frontend

## Estructura principal
- `frontend/index.html` - landing publica
- `frontend/script.js` - consumo de endpoints publicos
- `backend/public/index.php` - router API
- `backend/app/controllers/` - controladores
- `backend/app/Models/` - acceso a datos
- `backend/admin/*.html` - vistas admin
- `backend/admin/assets/js/` - scripts del panel

## Seguridad implementada
- Autenticacion por sesion para rutas privadas API.
- Autorizacion por rol admin (`401`/`403`).
- Rate limit de login (5 intentos -> bloqueo temporal 60s).
- Regeneracion de sesion en login y cierre seguro en logout.
- Headers anti-cache para rutas privadas.
- Bloqueo de uploads ejecutables y validacion MIME/ext/tamano.
- Hardening por `.htaccess` en backend/public/uploads.

## Flujo recomendado GitHub -> Hostinger
1. Subir cambios a GitHub (`main` estable).
2. Desplegar a Hostinger desde ese estado.
3. Configurar BD y credenciales de `Connection.php`.
4. Validar checklist funcional + seguridad.

Ver guia completa en:
- `DEPLOY_HOSTINGER.md`

## Notas de despliegue
- Usar PHP 8.2 recomendado.
- Mantener `backend/config/app.php` en produccion (`debug=false`).
- Dar permisos de escritura a `backend/public/uploads/*`.

## Pruebas rapidas post-deploy
- `/backend/admin/login.html` abre login.
- Sin sesion no se accede a endpoints admin.
- Contacto publico sigue funcionando.
- Logout redirige al frontend y corta administracion.
