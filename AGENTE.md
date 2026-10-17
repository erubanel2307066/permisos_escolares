# Permisos Escolares — Guía del proyecto

## Propósito

Aplicación web para que madres, padres o tutores preparen una solicitud de permiso escolar para un estudiante. El MVP funciona completamente en el navegador: no usa base de datos, no requiere cuenta y no envía la información a un servidor.

## Stack tecnológico

- **React 19** para la interfaz y el estado del formulario.
- **Vite 8** como servidor de desarrollo y herramienta de compilación.
- **JavaScript con módulos ES** (el proyecto no usa TypeScript).
- **CSS** en `src/index.css` y `src/App.css` para estilos adaptables y presentación de impresión.
- **localStorage** del navegador para conservar el borrador.
- **Diálogo de impresión del navegador** para imprimir o guardar la solicitud como PDF. No se utiliza una biblioteca PDF ni un servicio externo.
- **qrcode** para generar localmente el QR con los datos de la solicitud; no se envía el contenido a un servicio QR externo.

Comandos disponibles:

```bash
npm run dev      # inicia el servidor local de desarrollo
npm run build    # genera la compilación de producción en dist/
npm run preview  # sirve localmente la compilación de producción
npm run lint     # revisa el código con ESLint
```

## Flujo de usuario

1. El usuario abre el portal y captura los datos del estudiante:
   - Nombre completo.
   - Grado de estudio.
   - Grupo.
   - CURP.
2. Captura los datos de la madre, padre o tutor:
   - Nombre completo.
   - Teléfono celular.
   - Correo electrónico.
3. Completa los detalles del permiso:
   - Tipo: permiso por tiempo, ausencia u otro motivo.
   - Fecha; para ausencias se solicita también fecha de término.
   - Hora de salida y, opcionalmente, hora de regreso cuando no es ausencia.
   - Motivo y comentarios opcionales.
4. Revisa los datos institucionales precargados, que aparecen en el portal y se incluyen en el documento:
   - ESC. SEC. GRAL. MIGUEL HIDALGO Y COSTILLA.
   - C.C.Y. 12DES0238F.
   - CALLE GABRIEL BERNAL S/N COL. LIBERTAD.
   - CRUZ GRANDE, GRO.
5. Revisa la solicitud en una pantalla de resumen. Puede volver a editar cada sección antes de continuar.
6. Selecciona **Crear mi permiso**. La aplicación prepara un folio y un código QR que contiene los datos institucionales y todos los datos del permiso, incluidos CURP y datos de contacto. Después abre la vista de impresión; desde el diálogo del navegador se puede imprimir o elegir “Guardar como PDF”. El documento usa tamaño carta, incluye el logotipo escolar, una marca de agua diagonal y espacios diferenciados para la firma del tutor y la autorización escolar. Los comentarios se limitan a 300 caracteres para ayudar a mantener el documento en una hoja.

Los pasos se completan en orden. Se puede regresar a pasos anteriores para corregir la información. El botón para continuar solo avanza cuando los campos obligatorios de la sección actual son válidos.

## Lógica y persistencia

- El componente principal está en `src/App.jsx`.
- El borrador y los datos de la escuela se guardan bajo la clave `permisos-escolares-borrador-v1` en `localStorage`.
- Al iniciar, se intenta recuperar esa clave; si no existe o no se puede interpretar, el formulario empieza vacío.
- Cada cambio en el formulario actualiza el borrador automáticamente. Los datos institucionales están configurados en la aplicación y no los captura el usuario.
- **Borrar borrador** elimina la clave local y reinicia los datos y el paso actual. La aplicación solicita confirmación antes de borrarlo.
- La exportación se implementa con `window.print()` y reglas `@media print` en `src/App.css`. El formulario de pantalla se oculta y se presenta una hoja de solicitud tamaño carta, con logotipo, secciones de datos y firmas optimizadas para impresión en una página.
- El QR se crea localmente con `qrcode` y contiene JSON con folio, fecha de emisión, datos de la escuela, estudiante, tutor y permiso. Es una copia legible de los datos: no es una firma digital, no valida una autorización y se puede copiar junto con el documento.
- La marca de agua impresa identifica el documento como solicitud que requiere autorización; es un elemento visual disuasorio, no un mecanismo criptográfico contra edición o clonación.
- La información permanece en el perfil del navegador y dispositivo donde se capturó. No se sincroniza entre navegadores o dispositivos; borrar los datos del navegador puede eliminar el borrador.

## Requisitos funcionales

- Presentar un formulario sencillo, en español, dividido en cuatro pasos: estudiante, tutor, permiso y revisión.
- Validar la estructura de la CURP (18 caracteres), el formato del correo electrónico y que el teléfono celular tenga 10 dígitos.
- Normalizar la CURP a mayúsculas y el teléfono a dígitos al capturarlos.
- Permitir revisar los datos antes de generar el documento y regresar a una sección desde el resumen para editarla.
- Permitir volver a pasos anteriores para editar datos.
- Mostrar los datos fijos de la escuela e incluirlos en la solicitud.
- Guardar los cambios automáticamente en el navegador, sin backend ni base de datos.
- Recuperar el borrador al volver a abrir o recargar la aplicación en el mismo navegador.
- Generar un documento imprimible que el usuario pueda guardar como PDF.
- Permitir borrar el borrador local mediante una acción confirmada.
- Adaptar la interfaz a pantallas móviles y de escritorio.

## Requisitos de privacidad y operación

- No transmitir datos personales a servicios externos.
- No incluir credenciales, analítica ni integraciones con terceros en el flujo del MVP.
- Considerar que CURP, datos de contacto y datos escolares son información personal: el uso compartido del dispositivo puede exponer el borrador a otras personas con acceso al mismo perfil de navegador.
- Para probar el flujo, iniciar `npm run dev` y abrir la URL local que indique Vite. Para obtener el PDF, usar el diálogo de impresión del navegador.

## Alcance actual y extensiones posibles

El MVP prepara la solicitud, pero no la envía a la escuela, no administra aprobaciones, no crea cuentas, no sincroniza datos y no conserva un historial de varios permisos. Esas funciones requerirían definir un mecanismo adicional de almacenamiento y operación antes de implementarse.

Posibles mejoras posteriores:

- Configurar datos institucionales distintos para cada escuela.
- Añadir firma digital o adjuntos.
- Gestionar y consultar varias solicitudes.
- Añadir envío a la escuela y estados de aprobación si se incorpora un backend.

## Estructura relevante

```text
src/
  App.jsx       Interfaz, pasos del formulario, validación, persistencia y vista imprimible.
  App.css       Estilos del portal, adaptación móvil y estilos de impresión/PDF.
  index.css     Estilos globales.
  main.jsx      Punto de entrada de React.
index.html      Documento HTML base y metadatos.
```
