# Auditoría inicial de RITMO CLUB

Fecha local: 27 de octubre de 2026.
Base auditada: main, commit 8ed313397d0e25153968f6d8d23455b165d150aa.
Rama de trabajo: dev/auditoria-fuerza.

## Bloqueo de versión

El árbol completo de GitHub contiene un ZIP y la carpeta RITMO_3_5_FIRST_SERVE_FONDO_VIVO_PAGES. No contiene fuerza.html, archivos del backend, esquema D1, configuración de despliegue ni pruebas. La única rama existente al iniciar era main.

La aplicación https://1.ritmolh.pages.dev/ sí sirve una página independiente fuerza.html con programas A/B/C, selector de equipo y reproductor de 50 pasos. Por tanto la versión publicada difiere de la fuente disponible. No se debe sustituir esa versión por el paquete antiguo ni atribuir sus errores al código del paquete.

## Prueba real en navegador de escritorio

Se creó un perfil de prueba en la sesión aislada del navegador, sin iniciar sesión en Google.
1. Inicio > ENTRENAR > ABRIR FUERZA.
2. Se observaron programas A/B/C y opciones mancuernas + ligas, solo mancuernas, solo ligas y sin equipo.
3. Programa A: vista previa enumera ocho ejercicios, pero no presenta demostraciones visibles de cada uno.
4. Iniciar sesión muestra preparación 01/50, total 30:00 y bloque 03:00.
5. CONTINUAR inicia el reloj: se observaron 29:51 y 02:51.
6. PAUSAR mostró 29:50 y 02:50 y volvió a ofrecer CONTINUAR.
7. SIGUIENTE cambió a Sentadilla goblet, trabajo 02/50, total 27:00 y bloque 00:45.
8. La demostración declara expresamente «Guía esquemática de postura, no video anatómico» e «ILUSTRACIÓN DE ORIENTACIÓN». No cumple el requisito de demostración real.

No se verificaron 30 minutos completos, cambio automático, persistencia final, recuperación tras recarga, sincronización autenticada, reproducción de videos reales ni navegador móvil. No se considera terminada ninguna corrección.

## Hallazgos en el código disponible (no equivalen a la versión publicada)

- extras.js, parseFoods: se separa por coma antes de interpretar números decimales; «0,5 kg de pollo» se divide y puede interpretarse como 5 kg. Las unidades incompatibles no se rechazan.
- extras.js, complete: toda sesión incrementa sessions y actualiza lastFocus incluso cuando es fuerza. El registro de fuerza se escribe directamente en localStorage sin actualizar el estado en memoria de app.js.
- extras.js, reproductor: sesión, elapsed y run se mantienen solo en memoria; una recarga pierde la sesión.
- extras.js, salto al final: puede completar y registrar aunque se hayan saltado los ejercicios. Se necesita distinguir duración ejercitada de pasos omitidos.
- extras.js, Focus: focusArt devuelve un símbolo de punto y los bloques Focus no tienen demostración específica.
- extras.js, medios: dependen de descargar un catálogo externo completo; el fallo devuelve una lista vacía. Se requieren recursos exactos, verificados y un estado de error claro.
- retas.js: alude a backend/worker.js, ausente del árbol.
- account.js: obtiene configuración pública del Worker y usa PKCE de Supabase; no debe cambiarse este contrato sin la fuente correspondiente.
- config.js: conserva URL del Worker; campos Supabase vacíos pueden ser intencionales porque account.js consulta /api/config.

## Siguiente paso necesario

Incorporar en esta rama los archivos exactos de la versión actualmente desplegada (incluidos fuerza.html, sus JS/CSS, servicio PWA y backend Worker/D1 correspondiente), o identificar el repositorio/commit que la genera. No incluir secretos ni credenciales.

Después implementar, por prioridad:
1. Fuerza: catálogo exacto de demostraciones reales; vista previa y reproductor; 1800 segundos; transiciones por tiempo real; A/B/C adaptados a equipo; persistencia idempotente y recuperación.
2. Focus: demostraciones específicas y temporizadores verificables.
3. Alimentos, duplicados, Retas/Agenda, gráficas y contraste.
4. Pruebas de navegador móvil y escritorio, incluidos errores de medios, pausa, segundo plano, recarga, finalización y ausencia de doble registro.

No se modificó main, producción, Supabase, OAuth, Worker, D1 ni PWA. Esta rama contiene únicamente documentación de la auditoría.

## Actualización tras recibir el ZIP 3.6

Se incorporó el frontend exacto del ZIP como commit separado de referencia y después se implementaron las correcciones descritas en README.md. El bloqueo de fuente de Fuerza quedó resuelto. El ZIP no incluye Worker ni migraciones D1; no se han modificado esas integraciones.

Verificación: cinco pruebas de lógica aprobadas y pruebas Chromium aprobadas en escritorio y móvil emulado: 12 combinaciones de equipo/programa, 52 fotografías locales, transiciones automáticas, pausa, recarga, finalización idempotente, omisión sin falso completado, 50 guías Focus, temporizador Focus, cancelación de modal, error de fotografía, cuota de almacenamiento y reintento, conversión real de formulario local de Retas a Agenda, estado finalizado, gráfica de valores planos con fechas desiguales y funcionamiento PWA sin conexión.

Los intervalos de 30 minutos se probaron con reloj virtual del navegador; no se afirma haber realizado una sesión física de 30 minutos. No se ha probado inicio de sesión real ni operaciones en backend remoto, ni Safari/iOS físico. No se ha fusionado a main ni publicado en producción.
