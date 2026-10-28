# Marcadores con NFC: propuesta de integración

«NFS» se interpreta provisionalmente como NFC. Confirmar si el objetivo es abrir un marcador o sumar puntos.

## Abrir el marcador desde una etiqueta

1. Crear una Reta compartida en línea.
2. Usar su enlace público, disponible en Compartir, sin claves de organizador ni respaldos privados.
3. Grabar ese enlace como registro URL HTTPS NDEF en una etiqueta compatible mediante una aplicación de escritura NFC.
4. Acercar un teléfono compatible y abrir la notificación/enlace. El marcador se consulta desde RITMO; los permisos existentes siguen controlando quién lo puede editar.

El enlace actual de una Reta conectada contiene `match` y `api`; no contiene `hostKey`. Una invitación local con `inv` es una copia y no ofrece marcador sincronizado. Una etiqueta grabada para un partido seguirá apuntando a ese partido; una etiqueta permanente por cancha requiere una ruta estable que resuelva el partido actual, todavía no implementada.

## Sumar puntos por toque

Requiere un diseño adicional: identificar equipo A/B, seleccionar partido, validar permisos, impedir lecturas repetidas, permitir deshacer, registrar eventos únicos y resolver actualizaciones simultáneas en el servidor. No añadir puntos mediante una simple visita a un enlace: recargas y relecturas podrían duplicarlos.

Web NFC permite leer NDEF desde Chrome en Android compatible con permisos y una acción del usuario. No se debe prometer el mismo lector dentro de la PWA para iPhone. Para compatibilidad entre plataformas, comenzar con URL en etiqueta y controles de marcador en pantalla. Mantener un acceso por enlace o QR para equipos sin NFC.

Fuentes oficiales:

- https://developer.chrome.com/docs/capabilities/nfc
- https://developer.apple.com/documentation/corenfc/adding-support-for-background-tag-reading

Estado: análisis e integración por enlaces existentes; sin prueba física de NFC. No se ha implementado suma de puntos por toque ni ruta de cancha permanente.
