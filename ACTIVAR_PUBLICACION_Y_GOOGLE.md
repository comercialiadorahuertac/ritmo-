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

## Google y perfiles: bloqueo verificado

El Worker público configurado en config.js responde `Ruta inexistente` tanto en GET /api/config como en GET /api/me. La app tiene la interfaz OAuth y de perfiles, pero el backend publicado no expone esos contratos. El ZIP no incluye el código del Worker ni migraciones D1.

Para terminar se requiere acceso al proyecto Supabase correcto y a la configuración/código del Worker existente. No se reemplazará el Worker ni se recreará D1 sin revisar sus datos y rutas.

La comprobación debe incluir:
1. Obtener del Worker la URL de Supabase y clave pública anon/publishable a través de /api/config. Nunca exponer service_role ni el Google Client Secret al navegador.
2. Confirmar proveedor Google habilitado en Supabase, con OAuth client ID/secret del proyecto propietario de Google Cloud.
3. Confirmar URI de callback que indique Supabase, y URLs de retorno permitidas para la dirección real de RITMO.
4. Verificar que /api/me crea/lee el perfil del usuario validando su JWT y que los datos se aíslan por su identidad; revisar también /api/players, /api/invitations y /api/stats/me que consume account.js.
5. Probar dos cuentas distintas: login, retorno, perfil propio, cierre de sesión y permisos de invitaciones/partidos.

Documentación oficial: https://supabase.com/docs/guides/auth/social-sign-in/auth-google

La configuración administrativa y las pruebas con dos identidades aún no están completadas.
