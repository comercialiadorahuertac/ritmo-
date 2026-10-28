# RITMO CLUB · rama de desarrollo

El frontend de la versión 3.6 suministrada por el usuario está en `RITMO_3_5_FIRST_SERVE_FONDO_VIVO_PAGES/`. Se conserva ese nombre para evitar cambiar la ruta existente del proyecto. El ZIP 3.5 antiguo de la raíz es histórico, no contiene estas correcciones.

## Probar localmente

Sirve esa carpeta con un servidor HTTP. Por ejemplo:

```sh
python -m http.server 8080 --directory RITMO_3_5_FIRST_SERVE_FONDO_VIVO_PAGES
```

Abre `http://localhost:8080/` o `http://localhost:8080/fuerza.html`.

```sh
npm ci
npm test
npx playwright install chromium
npm run test:browser
```

Las pruebas de navegador levantan su propio servidor, usan perfiles desechables y no llaman al backend real. Se ejecutan en Chromium con escritorio 1440 × 1000 y móvil emulado 390 × 844. Para un binario ya instalado: `RITMO_TEST_CHROMIUM=/ruta/a/chromium npm run test:browser`.

## Alcance

- Fuerza: programas A/B/C adaptados al equipo, sin banco; 3 minutos de preparación, 24 de intervalos y 3 de cierre. Cada bloque de trabajo dura 45 s con 15 s de descanso. Las variantes unilaterales indican alternar lado a mitad del bloque.
- Demostraciones: 26 ejercicios, 52 fotografías humanas locales de dos posiciones. No son videos continuos. Se sustituyeron variantes sin una correspondencia fotográfica exacta por variantes nombradas explícitamente.
- La primera demostración aparece en la preparación; las demás se despliegan en cada ejercicio. Durante el entrenamiento se muestra el ejercicio actual o el próximo durante el descanso.
- Recuperación tras recarga y reloj por tiempo real. El contador continúa en segundo plano; al recuperar una página recargada queda en pausa para revisión.
- Historial con ID de sesión, duración y tiempo omitido. Una sesión con bloques omitidos no marca una rutina completa. El registro de progreso conserva comidas y deportes.
- Focus: 50 guías animadas de trayectorias e instrucciones particulares; los bloques de activación usan fotografías. Las guías no representan videos de una persona ejecutando la técnica.
- Alimentos: decimales, fracciones, kg/g y l/ml; solicita unidades explícitas para alimentos por masa o volumen. No inventa densidades de tazas ni sobrescribe los valores con cálculos parciales no reconocidos.
- Retas y Agenda comparten una entrada por ID de partido; convertir una actividad existente conserva su duración e identidad. Los cambios de estado vinculados se gestionan desde Retas.
- Gráficas: separación temporal real entre mediciones, valores planos sin división por cero y tabla accesible; mejora del contraste de texto secundario y selección de nivel.

## Integraciones y despliegue

`account.js` y `config.js` conectan Google y perfiles directamente al proyecto Supabase existente, usando únicamente su clave pública y las políticas de propietario existentes. Se conserva PKCE y el Worker/D1 de Retas. Las invitaciones entre cuentas y estadísticas remotas no están activadas. El ZIP suministra el frontend; no incluye código del Worker ni migraciones D1.

No se ha desplegado ni fusionado esta rama. La validación autenticada de Google/Supabase y el backend Worker/D1 queda pendiente en un entorno de prueba autorizado. La emulación móvil no sustituye una prueba en un teléfono físico con Safari/iOS.

## Actualización de navegación y fondos

El menú Fuerza y todos los accesos rápidos abren fuerza.html directamente. Las tarjetas A/B/C se compactan en móvil y los nombres de ejercicios conservan espacio suficiente.

Cada sección tiene una escena cinética: cancha en Inicio, carriles en Agenda, rally en Retas, órbitas cálidas en Comidas, pulso de concentración en Focus y ascenso en Progreso. Fuerza reduce la intensidad visual durante la sesión. El control «Fondo» permite pausar el movimiento; la preferencia persiste y respeta movimiento reducido y pestaña en segundo plano. No se descargan videos pesados.

Se preparó publicación automática de vistas previas mediante GitHub Actions, desactivada hasta configurar Cloudflare. Ver ACTIVAR_PUBLICACION_Y_GOOGLE.md. Google ya estaba habilitado en Supabase. La nueva configuración obtiene y actualiza el perfil directamente en la tabla existente profiles; las invitaciones entre cuentas y estadísticas siguen pendientes de completar en el backend.
