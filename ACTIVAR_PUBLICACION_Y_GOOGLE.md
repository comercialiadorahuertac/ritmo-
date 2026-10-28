# Activación de RITMO

## Publicación automática conservando el proyecto actual

El workflow `.github/workflows/pages-preview.yml` queda preparado, pero inactivo hasta que el propietario configure las credenciales. Ejecuta pruebas de lógica y navegador antes de subir exclusivamente la vista previa. No contiene despliegue automático de producción.

En GitHub → repositorio → Settings → Secrets and variables → Actions:

Secrets:
- CLOUDFLARE_ACCOUNT_ID: ID de la cuenta propietaria del proyecto.
- CLOUDFLARE_API_TOKEN: token limitado a esa cuenta y permiso Account → Cloudflare Pages → Edit. Nunca poner el token en el código ni en un mensaje de chat.

Variables:
- CLOUDFLARE_PAGES_PROJECT: `ritmolh`, después de confirmar el nombre en Cloudflare.
- CLOUDFLARE_PREVIEW_BRANCH: `1`, después de confirmar que es una rama de vista previa y no la rama de producción.
- RITMO_PREVIEW_ENABLED: `true`, únicamente después de verificar los dos puntos anteriores.

Cada modificación de `dev/auditoria-fuerza` disparará las pruebas y la publicación de esa vista previa. Mantener RITMO_PREVIEW_ENABLED desactivada hasta confirmar el destino; no configurar una rama de producción como preview.

Una alternativa es crear un proyecto Pages nuevo conectado a GitHub con output directory `RITMO_3_5_FIRST_SERVE_FONDO_VIVO_PAGES`, sin framework ni compilación. El proyecto anterior y su dirección se conservarían mientras se prueba el nuevo. Un proyecto creado por Direct Upload no puede convertirse directamente a la integración Git nativa.

Documentación oficial: https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/

## Google y perfil directo en Supabase

Se encontró y verificó el proyecto `ritmo-club` (`efykismzljctzmrlwluo`). Su proveedor Google está habilitado y /auth/v1/authorize abre la pantalla de Google. Se configuraron URL y clave publishable públicas en config.js.

La app ya no necesita /api/config ni /api/me del Worker para iniciar sesión y gestionar perfiles: account.js usa la tabla existente profiles con JWT del usuario y RLS, sin service_role. SELECT/INSERT/UPDATE para authenticated están habilitados; INSERT y UPDATE limitan id a auth.uid(), y UPDATE también tiene WITH CHECK. No se cambiaron tablas ni políticas.

Los partidos de Retas siguen en el Worker/D1 actual. Las invitaciones entre cuentas y estadísticas no se anuncian como activas: los usuarios pueden compartir los enlaces actuales. Estas funciones necesitan aún enlazar los dos sistemas con el código/configuración del Worker.

Pruebas adicionales: cuatro pruebas de perfiles (dos identidades separadas, creación inicial, edición por usuario autenticado y opciones de Google) aprobadas. Nueve pruebas de lógica totales y batería de navegador aprobadas. Pendiente publicar este frontend y completar un login real con retorno para verificar la lista de URLs permitidas; no se afirma haber iniciado sesión con dos cuentas de Google reales.
