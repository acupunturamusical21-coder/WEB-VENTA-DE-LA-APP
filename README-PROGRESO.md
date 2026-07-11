## Iteración 12 — Página/flujo de "Comprar y descargar"

Antes, tras un pago confirmado (`onApprove` en `auth-client.js`, iteración 8) la app simplemente recargaba la página (`essamReloadAfterAuthChange()`) y la persona quedaba viendo el contenido desbloqueado sin más. Esta iteración agrega la pantalla explícita que pedía el plan.

**`js/core/pwa.js` — 2 cosas nuevas:**
- Captura de `beforeinstallprompt` (Chrome/Edge desktop y Android): se guarda en `window.essamDeferredInstallPrompt` en vez de dejar que el navegador muestre su propio mini-banner, para poder dispararlo nosotros desde un botón en el momento que tiene sentido (justo después de pagar).
- `essamIsStandalone()` (¿ya se está usando la app instalada?), `essamIsIOS()` (Safari/iOS nunca dispara `beforeinstallprompt`, así que ahí se detecta aparte) y `essamPromptInstall()` (dispara el prompt guardado y devuelve `accepted`/`dismissed`/`unavailable`).

**`js/core/auth-client.js` — nuevo modo de modal `'download'`:**
- Se abre solo, una vez, justo después de que `essamCheckSession()` confirma `premiumActive:true` tras recargar por un pago recién hecho (flag `essam_show_download_screen` en `localStorage`, puesto en `onApprove` y limpiado al mostrarse — así no se vuelve a abrir en visitas futuras).
- También accesible en cualquier momento desde "Mi cuenta" → botón "📲 Instalar / descargar app", para quien cierre la pantalla sin instalar y quiera volver después.
- Contenido según el caso real del dispositivo/navegador:
  - **Ya instalada** (`essamIsStandalone()`): mensaje de confirmación, sin botón.
  - **Chrome/Edge con el evento disponible**: botón real "📲 Instalar app" que llama a `essamPromptInstall()`.
  - **iOS/Safari** (no existe el evento nativo ahí): 3 pasos escritos (Compartir → Añadir a pantalla de inicio → confirmar).
  - **Cualquier otro caso** (ej. Firefox desktop): instrucción genérica de buscar el ícono de instalar en la barra de direcciones o el menú del navegador.
- Nota fija: los instaladores nativos (.exe/.dmg/.apk, iteraciones 13-15) "llegarán pronto" y aparecerán en esta misma pantalla cuando existan — ya queda el gancho de texto para no tener que rediseñar nada cuando se agreguen.

**Verificación:** prueba `jsdom` (`test_download_screen.js`) simulando 4 escenarios — pago recién hecho en Chrome desktop (con `beforeinstallprompt` disponible), en iOS Safari, ya instalada, y sesión normal sin flag de compra reciente. En los 3 primeros el modal se abre solo en modo `download` con el contenido correcto para cada caso; en el cuarto el modal permanece cerrado (no se auto-abre en cada visita, solo justo tras pagar). `node --check` limpio en los 2 archivos tocados y en el resto de `js/` del cliente (nada se rompió).

**Pendiente de prueba manual** (no automatizable aquí): el `beforeinstallprompt` real solo lo dispara un navegador real cuando el sitio cumple los criterios de instalabilidad (manifest válido, SW registrado, servido por HTTPS) — jsdom no lo simula de verdad, solo confirma que el código lo maneja bien si llega. Falta abrir `acupunturamusical.com` en Chrome desktop y Android reales, completar un pago real, y confirmar que el botón "Instalar app" dispara el diálogo nativo del navegador (no solo el mock de la prueba).

---

# TRATADO_APP — Modularización — COMPLETA (Iteraciones 1-3)

## Resultado
El monolito `index.html` (3.89 MB, un solo archivo) quedó convertido en una app modular de 46 archivos:

```
app/
├── index.html                          (8 KB — esqueleto: head, nav, secciones, tags <link>/<script>)
├── css/                                 (9 archivos, 320 KB)
│   ├── block_00_anon.css ... block_07_anon.css
│   └── block_09_anon.css
└── js/
    ├── data/                            (13 archivos, 3.1 MB — contenido puro, sin lógica)
    │   ├── chapters.es.js               (CHAPTERS_DATA — intacto, nunca tocado)
    │   ├── chapters.en.js               (CHAPTERS_DATA_EN)
    │   ├── triadas.es.js / triadas.en.js
    │   ├── hexagramas.es.js / hexagramas.en.js
    │   ├── appendix-b.js
    │   ├── correspondencias.js
    │   ├── mtc-patterns.js
    │   ├── music-theory.js
    │   ├── bazi-iching.js
    │   ├── i18n-data.js
    │   └── mtc-translation-i18n.js      (bloque de 60 KB que se había pasado por alto en iter.1 — ya incluido)
    ├── js/features/                     (20 archivos, ~300 KB — toda la lógica de UI)
    │   ├── mtc-motor.js, bazi.js, music-theory-runtime.js, oraculo.js, pdf-export.js
    │   ├── i18n-helpers.js, i18n-apply.js, mtc-translation-helpers.js
    │   ├── correspondencias.js, organos.js, escalas.js, dodecaedro.js
    │   ├── lector.js, triadas.js, buscador.js, audio.js, tts.js, hexagramas.js
    │   └── reproductor-oracular.js
    └── js/core/                         (4 archivos)
        ├── navigation.js, bootstrap.js, splash.js, pwa.js
```

## Cómo se garantizó que nada se rompiera
1. **Parseo real, no regex**: usé `acorn` (parser de JS) para encontrar los límites exactos de cada función/constante de nivel superior — 229 declaraciones en el bloque principal + 10 en un bloque de 60 KB que casi se pierde. Nada se adivinó por indentación.
2. **Scripts clásicos, no ES modules**: todos los archivos son `<script src="...">` normales (sin `type="module"`), cargados en el mismo `index.html`. Esto significa que comparten el mismo scope global que tenían en el archivo original — cero necesidad de escribir `import`/`export` a mano para ~250 referencias cruzadas, y cero riesgo de "olvidar" una dependencia.
3. **Verificación de colisiones de nombres**: con todos los archivos compartiendo scope global, corrí una verificación automática de las 244 declaraciones de nivel superior en los 46 archivos — **0 colisiones**.
4. **Validación de sintaxis**: los 46 archivos JS pasan `node --check` sin errores.
5. **Verificación de referencias**: las 45 rutas `href`/`src` en `index.html` apuntan a archivos que sí existen; 38 `<script>` abren y 38 cierran.
6. **Bug encontrado y corregido**: un bloque "CSS" de la iteración 1 (`block_08`) resultó ser en realidad el contenido de la función `_pdfStyles()` (CSS para exportar PDF) atrapado dentro de un `<script>` como texto — no un stylesheet real. Se descartó de `css/` porque ya está correctamente incluido como parte de `features/pdf-export.js`.
7. **Limpieza**: se eliminaron 15 tags `<script>` duplicados del beacon de analytics de Cloudflare (bug de guardado del archivo original), dejando solo 1.

## Qué falta para tenerlo 100% funcional
Esto es una **descomposición fiel**, no una reescritura — el comportamiento debería ser idéntico al original. Pero antes de subirlo a producción hace falta:
1. **Probar en un navegador real** sirviendo la carpeta (`python3 -m http.server` o similar) y recorrer las 8-10 funcionalidades (lector, buscador, tríadas, escalas, órganos, oráculo, hexagramas, TTS, PDF, dodecaedro, reproductor oracular) para confirmar que todo carga y funciona igual que el original.
2. Verificar visualmente que el CSS se ve idéntico (el archivo `block_01` de 288 KB es la hoja de estilos principal).

## Nota sobre "premium" (sin cambios respecto a iteración 1)
Esta modularización organiza el código en carpetas, pero no oculta nada por sí sola — todo archivo servido al navegador sigue siendo descargable. El bloqueo real de contenido premium va a requerir servir los módulos de `js/data/` desde un backend con verificación de sesión, cuando lleguemos a esa fase.


## Iteración 9 — Prueba de humo integral (ambos tiers)

Dos pruebas separadas, backend y frontend, cubriendo las 8-10 funcionalidades del plan en `lite` y `full`.

**A) Backend real (servidor arrancado de verdad, con `PAYPAL_CLIENT_ID`/`SECRET` de prueba y sin SMTP real — el código de verificación se lee del log de consola, tal como está pensado para desarrollo):**
1. Registro → verificación con el código real generado por el servidor → login → cookie de sesión real.
2. `GET /api/auth/me` recién logueado: `premiumActive:false` — correcto, todavía no pagó.
3. `GET /api/data/chapters.es.js` y `/api/data/triadas.es.js` **sin pagar** → los dos devuelven `402` y el stub (`console.warn(...)`), **no el contenido real**. Esto es lo que más le preocupaba al plan original de esta iteración ("confirmar que nada del contenido premium se filtra") y quedó confirmado con una petición HTTP real, no solo leyendo el código.
4. Se simula lo que hace `activateUnlock()` justo después de que PayPal confirma un pago (mismo código que dispara `/api/paypal/capture-order`) → `GET /api/auth/me` ahora sí trae `premiumActive:true`.
5. Con la cuenta ya desbloqueada, `GET /api/data/chapters.es.js` y `/api/data/triadas.es.js` **sí** devuelven el contenido real.
6. Intento de path traversal (`/api/data/../server.js`) → Express normaliza la ruta antes de enrutar y cae en `404`, no en el archivo del servidor. Acceso directo a `/server/data-protected/...` → `403` (bloqueado antes de llegar al estático).

**B) Frontend con jsdom, cargando el `index.html` real y navegando por las secciones en ambos tiers:**
- Secciones 100% premium (Tríadas, Oráculo, Libro, 64 Hexagramas): overlay de candado presente en `lite`, ausente en `full` — en las 4, en ambos tiers.
- Secciones gratis (Correspondencias, Escalas, 12 Órganos, Buscador): sin candado de sección en ningún tier.
- 12 Órganos: los 24 recuadros Tonificar/Dispersar (12 órganos × 2) llevan candado inline en `lite`, ninguno en `full`.
- Buscador: sin navegación real en `lite` (reconfirmación de la iteración 6), con navegación real en `full`.
- Pestañas del menú + tarjetas de Inicio: los 8 elementos `data-essam-lock` con candado en `lite`, ninguno en `full` (reconfirmación de la iteración 7).
- Las funciones globales clave (`buildCorrespondencias`, `buildOrganos`, `buildEscalas`, `buildLector`, `buildTriadasIndex`, `performSearch`, `motorBusquedaMTC`, `applyI18n`) siguen existiendo e invocables sin excepciones — nada del refactor de iteraciones 5-8 rompió la modularización de la iteración 1-4.

**Resultado:** todos los checks anteriores en verde, en ambos tiers. `node --check` limpio en `server.js` y en los 46 archivos del cliente.

**Lo que esta prueba NO cubre** (ya señalado en la iteración 8, sigue pendiente de prueba manual): el flujo real de PayPal (crear/aprobar/capturar una orden de verdad con credenciales Sandbox o Live, en un navegador real) — no se puede automatizar aquí sin salida de red a paypal.com. Tampoco cubre lo que ya quedaba fuera desde la iteración 4: audio real, Three.js/WebGL, TTS real, exportación de PDF — esos siguen necesitando un navegador real.

## Iteración 8 — Pantalla de compra / upsell (botón real de PayPal)

El modal "pay" (se abre desde `essamGoPremium()` en cualquier candado, o desde el badge de la cuenta) tenía desde la iteración 5 un placeholder que solo mostraba el precio. Esta iteración lo reemplaza por el botón real de PayPal, usando la infraestructura de pago único que ya existía en el servidor desde la iteración 3 (`/api/paypal/capture-order`, que verifica el monto real cobrado contra `PRICE` antes de marcar `unlocked`).

**Servidor (`server.js`) — 2 cambios:**
- `/api/price` ahora también devuelve `clientId` (el Client ID de PayPal — es público por diseño, lo necesita el SDK del botón en el navegador; el secreto real, `PAYPAL_SECRET`, nunca sale del servidor).
- Nuevo `/api/paypal/create-order`: crea la orden en PayPal usando siempre el monto de `PRICE` (el navegador nunca lo manda), requiere sesión activa. Junto con el `capture-order` ya existente, completa el flujo estándar de los botones de PayPal (`createOrder` → `onApprove` → captura).

**Cliente (`auth-client.js`) — 2 funciones nuevas:**
- `essamLoadPaypalSdk(clientId, currency)`: inserta el `<script>` del SDK de PayPal una sola vez (cacheado en una promesa, no se duplica si el modal se abre varias veces).
- `essamRenderPaypalButtons()`: dibuja `paypal.Buttons(...)` dentro del modal — `createOrder` llama a `/api/paypal/create-order`, `onApprove` llama a `/api/paypal/capture-order` con el `orderID`; si todo sale bien cierra el modal y recarga (mismo patrón que login/logout: `essamReloadAfterAuthChange()`), para que `essamCheckSession()` lea el `premiumActive` real ya actualizado y todo el candado (secciones, buscador, tabs — iteraciones 5-7) se refresque solo.
- Si el servidor todavía no tiene `PAYPAL_CLIENT_ID` configurado (ej. entorno de desarrollo), se avisa en vez de fallar en silencio.

**Verificación:** servidor arrancado localmente con credenciales de PayPal falsas (`PAYPAL_CLIENT_ID`/`PAYPAL_SECRET` de prueba) — `GET /api/price` devuelve el `clientId`; `POST /api/paypal/create-order` y `POST /api/paypal/capture-order` sin sesión responden `401` (nunca se intenta hablar con PayPal si no hay sesión). `node --check` OK en `server.js` y `auth-client.js`. (La llamada real a la API de PayPal — crear/capturar una orden de verdad — necesita credenciales Sandbox/Live reales y no se puede probar en este entorno sin acceso a paypal.com; con credenciales reales el flujo end-to-end habría que probarlo en un navegador.)

## Iteración 7 — Ocultar/bloquear secciones premium

Las 4 secciones 100% premium (`triadas`, `oraculo`, `libro`, `iching`) ya tenían dos cosas resueltas desde la iteración 5:
1. El candado real al entrar a la sección (`essamApplySectionLock` en `navigation.js`, overlay de pantalla completa).
2. El atributo `data-essam-lock="<id>"` ya puesto en el HTML, tanto en los botones del menú (`nav-btn`) como en las tarjetas de "Inicio" (`feature-card`) — pero nada lo leía todavía.

Esta iteración cierra ese hueco con **candado visible antes de entrar** (definida la preferencia: se deja visible, no se oculta, para que el mismo build sirva ambas versiones y para que la sección funcione como upsell):

- `essamDecorateLockedNav()` (nueva, en `navigation.js`): recorre todo `[data-essam-lock]` y, si la cuenta no es premium, agrega la clase `essam-nav-locked` + un candado 🔒 (`.essam-nav-lock-badge`); si es premium, los quita. Es idempotente — no duplica candados si se llama varias veces.
- Se conecta desde el único punto que ya centralizaba refrescos por tier: `essamRefreshGatedContent()` (auth-client.js), y también se pinta una vez de inmediato al cargar el script (con el valor por defecto `lite`) para que no haya parpadeo mientras se resuelve la sesión real.
- `css/premium-lock.css`: `.essam-nav-locked` (opacidad reducida) + `.essam-nav-lock-badge` con dos variantes — candadito inline junto al texto en `nav-btn`, insignia circular flotante en la esquina en `feature-card`.

**Verificación:** con la misma prueba `jsdom`, se contaron los 8 elementos `[data-essam-lock]` (4 en el menú + 4 en las tarjetas de Inicio, para `triadas`/`oraculo`/`libro`/`iching`) — en `lite`: los 8 quedan con clase y candado; en `full`: 0. Prueba adicional de alternancia (`lite→full→lite→full`) confirma que no se acumulan candados duplicados en ningún ciclo.

## Iteración 6 — Buscador con resultados bloqueados

El motor de búsqueda (`js/features/buscador.js`, `js/features/mtc-motor.js`) corre **idéntico** en `lite` y `full`: mismo índice, mismos resultados de texto (síndrome, tríada, módulo). Lo único que cambia es la interacción, controlada por 3 funciones nuevas en `buscador.js`:

- `essamSearchLocked()` — `true` si la cuenta no es premium (usa `essamIsPremium()` de la iteración 5).
- `essamSearchOnclick(realCode)` — devuelve el `onclick` real (`showTriadaInfo(...)`, `goToOrganModule(...)`) en `full`, o `essamGoPremium()` en `lite`.
- `essamSearchLockBadge(isEN)` — candado 🔒 inline para insertar junto al resultado bloqueado.

Se aplicó en los **7 puntos** donde el buscador genera un resultado clicable (tarjetas de tríada por nota musical, panel de "Patologías clínicas", panel legacy de tríadas relacionadas, y las 4 variantes de tarjeta/detalle en `renderResultadosMTC` y `renderBusquedaInversa`, tanto para tríadas como para módulos de órgano). En `lite`, esos elementos quedan con clase `.essam-search-locked` (estilo nuevo en `css/premium-lock.css`: opacidad reducida + candado) y el texto de ayuda ("ver detalle" / "ver en órgano") cambia a "Desbloquear". En `full` se ven y funcionan exactamente igual que antes.

**Nota de diseño:** el bloqueo real de contenido (el protocolo con puntos de acupuntura, el detalle de la tríada) ya vivía aguas abajo desde la iteración 5, en `essamModuloBoxHtml` (organos.js) y `showTriadaInfo` (triadas.js) — ambos ya llamaban a `essamGoPremium()` si la cuenta no era premium. Esta iteración es defensa en profundidad + mejor UX: en vez de navegar y toparse con otro candado, el buscador avisa de una vez, sin salir de los resultados.

**Verificación:** prueba con `jsdom` cargando `index.html` completo y ejecutando `performSearch('hashimoto')` en ambos tiers — en `lite`: 0 `onclick` con `goToOrganModule`/`showTriadaInfo` reales, 28 candados (`essamGoPremium()` + clase `essam-search-locked`); en `full`: ambos onclick reales presentes, 0 candados. Todos los `.js` del cliente pasan `node --check`.

## Iteración 4 — Prueba automatizada de humo (smoke test)

No hay navegador disponible en este entorno, pero corrí una prueba automatizada equivalente con `jsdom` (motor de DOM headless) sirviendo la carpeta `app/` por HTTP real:

- Los 44 archivos locales (CSS + JS) cargaron sin error 404.
- **0 errores de JavaScript reales.** El único error capturado (`navigator.serviceWorker.register`) es un falso positivo — jsdom no implementa Service Workers, pero el código ya valida `if ('serviceWorker' in navigator)` antes de llamar, que es correcto para navegadores reales.
- El `window.onload` (bootstrap) ejecutó las 12 funciones `build*`/`performSearch`/`initOraculo` sin excepciones.
- Verifiqué que el DOM quedó realmente poblado con contenido real (no solo "no truena"):
  - `#corrGrid` (Correspondencias): 12 hijos, 7 KB de HTML
  - `#organPanels` (12 Órganos): 12 hijos, 117 KB de HTML
  - `#organTabs`: 12 hijos
  - `#bookSidebar` (El Libro): 2 hijos, 8 KB de HTML
  - `#triadasGrid` (Tríadas Clínicas): 12 hijos, 30 KB de HTML
- Confirmé que las 12 funciones clave (`buildCorrespondencias`, `buildOrganos`, `buildEscalas`, `buildLector`, `buildTriadasIndex`, `buildHexagramas`, `performSearch`, `motorBusquedaMTC`, `calcMomentoVital`, `applyI18n`, `ttsStart`, `initDodecahedron`) existen en el scope global y son invocables.

**Lo que esta prueba NO cubre** (requiere navegador real, no jsdom): Web Audio real (sonido de tríadas/escalas/oráculo), Three.js/WebGL (dodecaedro 3D), Text-to-Speech real, exportación de PDF (usa `window.open` para imprimir), y verificación visual del CSS. Para esas partes sigue haciendo falta que lo abras tú en un navegador — pero ya no hay riesgo de que algo esté "roto" a nivel de código: la estructura, las 244 variables/funciones globales y el flujo de carga están verificados.
