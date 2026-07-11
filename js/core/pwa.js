// Auto-extraído — registro de Service Worker (PWA)

// ── PWA SERVICE WORKER (inline, auto-instala) ──────────────────────
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(() => console.log('[PWA] Service Worker registrado'))
    .catch(e => console.warn('[PWA] SW error:', e));
}

// ═══════════════════════════════════════════════════════════════════
// Iteración 12 — captura del evento de instalación nativo.
// Chrome/Edge (desktop y Android) disparan `beforeinstallprompt` en vez
// de mostrar su propio prompt automáticamente; lo guardamos para poder
// dispararlo nosotros desde un botón ("Instalar app") en el momento que
// tenga sentido (ej. la pantalla de "Comprar y descargar" post-pago).
// Safari/iOS nunca dispara este evento — ahí solo existe "Compartir >
// Añadir a pantalla de inicio", así que se detecta aparte (essamIsIOS).
// ═══════════════════════════════════════════════════════════════════
window.essamDeferredInstallPrompt = null;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  window.essamDeferredInstallPrompt = e;
  document.dispatchEvent(new CustomEvent('essam-install-available'));
});

window.addEventListener('appinstalled', () => {
  window.essamDeferredInstallPrompt = null;
  document.dispatchEvent(new CustomEvent('essam-installed'));
  console.log('[PWA] App instalada');
});

// ¿Ya se está ejecutando como app instalada (no en una pestaña normal)?
function essamIsStandalone() {
  return (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches)
    || window.navigator.standalone === true; // Safari/iOS viejo
}

function essamIsIOS() {
  return /iPhone|iPad|iPod/.test(navigator.userAgent) && !window.MSStream;
}

// ─────────────────────────────────────────────────────────────
// Detecta la plataforma del dispositivo actual, para la pantalla
// "Descargar la app" (iteración 12b): qué tarjeta (Windows/macOS/
// Android/iOS) resaltar como "tu dispositivo" entre las 4 opciones.
// ─────────────────────────────────────────────────────────────
function essamDetectPlatform() {
  const ua = navigator.userAgent;
  if (essamIsIOS()) return 'ios';
  if (/Android/.test(ua)) return 'android';
  if (/Macintosh|Mac OS X/.test(ua)) return 'mac';
  if (/Windows/.test(ua)) return 'windows';
  return 'other';
}

// Dispara el prompt nativo guardado (Chrome/Edge). Devuelve
// { outcome: 'accepted' | 'dismissed' | 'unavailable' }.
async function essamPromptInstall() {
  const promptEvent = window.essamDeferredInstallPrompt;
  if (!promptEvent) return { outcome: 'unavailable' };
  promptEvent.prompt();
  const choice = await promptEvent.userChoice;
  window.essamDeferredInstallPrompt = null;
  return choice;
}
