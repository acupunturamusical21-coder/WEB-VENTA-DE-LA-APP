// ═══════════════════════════════════════════════════════════════════
// Cliente de autenticación — ESSAM
// Flujo actual (temporal, sin pago): registro → código por correo →
// verificar → entrar. El acceso premium (`premiumActive`) se reconstruye
// como compra única en las iteraciones 2-3-8 (server: `unlocked`;
// front: pantalla de compra); por ahora siempre es false.
// ═══════════════════════════════════════════════════════════════════
window.essamAuth = { loggedIn: false, email: null, verified: false, premiumActive: false, unlockedAt: null };

// ¿Esta persona tiene acceso premium ACTIVO ahora mismo?
function essamIsPremium() {
  return !!(window.essamAuth && window.essamAuth.loggedIn && window.essamAuth.premiumActive);
}

// Bandera de feature-flags única para todo el front-end. Nunca se
// asigna a mano en otro lado — siempre se deriva de essamIsPremium().
// Secciones/():
//   'lite' -> Correspondencias, Escalas, 12 Órganos (sin protocolo
//             Tonificar/Dispersar), Buscador (resultados sin clic).
//   'full' -> además: El Libro, Oráculo, Tríadas Clínicas, 64 Hexagramas,
//             y clic completo en Buscador / 12 Órganos.
function essamUpdateTier() {
  window.ESSAM_TIER = essamIsPremium() ? 'full' : 'lite';
  return window.ESSAM_TIER;
}
essamUpdateTier();
// Pintar de inmediato con el valor por defecto (lite) — se corrige en
// cuanto essamCheckSession() resuelva la sesión real, vía essamRefreshGatedContent().
if (typeof essamDecorateLockedNav === 'function') essamDecorateLockedNav();

// Acción del botón "Desbloquear" en cualquier candado premium.
function essamGoPremium() {
  if (!window.essamAuth.loggedIn) {
    essamOpenAuthModal('register');
  } else if (!window.essamAuth.verified) {
    essamOpenAuthModal('verify', window.essamAuth.email);
  } else if (!window.essamAuth.premiumActive) {
    // TEMPORAL: la compra de la versión completa aún no está reconstruida
    // (llega en la iteración 8) — de momento solo se informa.
    essamOpenAuthModal('pay', window.essamAuth.email);
  } else {
    // Ya es premium pero algo quedó desactualizado en pantalla — refrescar.
    essamRefreshGatedContent();
  }
}

// Vuelve a construir/pintar todo lo que depende de si la cuenta es premium
// o no (se llama después de confirmar sesión, login, pago o logout).
function essamRefreshGatedContent() {
  essamUpdateTier();
  if (typeof buildCorrespondencias === 'function') buildCorrespondencias();
  if (typeof buildOrganos === 'function') buildOrganos();
  if (typeof buildEscalas === 'function') buildEscalas();
  if (typeof essamDecorateLockedNav === 'function') essamDecorateLockedNav();
  if (typeof essamApplySectionLock === 'function' && typeof _navCurrent !== 'undefined' && _navCurrent) {
    essamApplySectionLock(_navCurrent);
  }
  const searchInput = document.querySelector('#buscador input[placeholder*="insomnio"]');
  if (searchInput && searchInput.value && typeof performSearch === 'function') {
    performSearch(searchInput.value);
  }
}

// Identificador persistente de este dispositivo/navegador (no cambia entre
// visitas porque vive en localStorage). Esto es lo que el servidor usa
// para contar cuántos dispositivos distintos ha usado la cuenta.
function essamGetDeviceId() {
  let id = localStorage.getItem('essam_device_id');
  if (!id) {
    id = (crypto.randomUUID ? crypto.randomUUID() : 'dev-' + Date.now() + '-' + Math.random().toString(36).slice(2));
    localStorage.setItem('essam_device_id', id);
  }
  return id;
}

function essamGetDeviceLabel() {
  const ua = navigator.userAgent;
  if (/iPhone|iPad/.test(ua)) return 'iPhone/iPad';
  if (/Android/.test(ua)) return 'Android';
  if (/Macintosh/.test(ua)) return 'Mac';
  if (/Windows/.test(ua)) return 'Windows';
  return 'Navegador';
}

async function essamCheckSession() {
  try {
    const r = await fetch('/api/auth/me', { credentials: 'include' });
    const data = await r.json();
    window.essamAuth = data.loggedIn
      ? {
          loggedIn: true, email: data.email, verified: data.verified,
          premiumActive: !!data.premiumActive, unlockedAt: data.unlockedAt || null,
        }
      : { loggedIn: false, email: null, verified: false, premiumActive: false, unlockedAt: null };
  } catch (e) {
    console.warn('[ESSAM] No se pudo verificar la sesión (¿backend corriendo?):', e.message);
  }
  essamUpdateAuthUI();
  essamRefreshGatedContent();

  // Iteración 12: si venimos de completar un pago (flag puesto en
  // onApprove), y la sesión recargada ya confirma premiumActive:true,
  // se abre la pantalla de "Comprar y descargar" una sola vez.
  if (window.essamAuth.premiumActive && localStorage.getItem('essam_show_download_screen') === '1') {
    localStorage.removeItem('essam_show_download_screen');
    essamOpenAuthModal('download', window.essamAuth.email);
  }
}

function essamUpdateAuthUI() {
  const badge = document.getElementById('essamAuthBadge');
  if (!badge) return;
  const isEN = window._lang === 'en';
  const { loggedIn, email, verified, premiumActive } = window.essamAuth;
  if (!loggedIn) {
    badge.textContent = isEN ? 'Log in' : 'Iniciar sesión';
    badge.onclick = () => essamOpenAuthModal('login');
  } else if (!verified) {
    badge.textContent = `${email} — ${isEN ? 'Verify account' : 'Verificar cuenta'}`;
    badge.onclick = () => essamOpenAuthModal('verify');
  } else if (!premiumActive) {
    badge.textContent = `${email} — ${isEN ? 'Unlock full version' : 'Desbloquear versión completa'}`;
    badge.onclick = () => essamOpenAuthModal('pay', email);
  } else {
    badge.textContent = `${email} ✓`;
    badge.onclick = () => essamOpenAuthModal('account');
  }
}

function essamReloadAfterAuthChange() {
  window.location.reload();
}

// ─────────────────────────────────────────────
// Iteración 8 — botón real de PayPal (pago único).
// ─────────────────────────────────────────────

// Carga el SDK de PayPal una sola vez (cacheado en _essamPaypalSdkPromise
// para no insertar el <script> dos veces si el modal se abre de nuevo).
let _essamPaypalSdkPromise = null;
function essamLoadPaypalSdk(clientId, currency) {
  if (window.paypal) return Promise.resolve();
  if (_essamPaypalSdkPromise) return _essamPaypalSdkPromise;
  _essamPaypalSdkPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&currency=${encodeURIComponent(currency || 'USD')}&intent=capture`;
    s.onload = () => resolve();
    s.onerror = () => { _essamPaypalSdkPromise = null; reject(new Error('No se pudo cargar el SDK de PayPal')); };
    document.head.appendChild(s);
  });
  return _essamPaypalSdkPromise;
}

// Dibuja el botón de PayPal dentro del modal de compra. createOrder y
// capture SIEMPRE pasan por el servidor (nunca se manda el monto desde
// el navegador) — ver /api/paypal/create-order y /api/paypal/capture-order.
function essamRenderPaypalButtons() {
  const container = document.getElementById('essamPaypalButtons');
  if (!container || !window.paypal) return;
  container.innerHTML = '';
  const isEN = window._lang === 'en';

  window.paypal.Buttons({
    style: { layout: 'vertical', color: 'gold', shape: 'pill', label: 'pay' },

    createOrder: async () => {
      const errEl = document.getElementById('essamPayError');
      if (errEl) errEl.textContent = '';
      const r = await fetch('/api/paypal/create-order', { method: 'POST', credentials: 'include' });
      const data = await r.json();
      if (!r.ok || !data.id) throw new Error(data.error || (isEN ? 'Could not start the payment' : 'No se pudo iniciar el pago'));
      return data.id;
    },

    onApprove: async (data) => {
      const errEl = document.getElementById('essamPayError');
      try {
        const r = await fetch('/api/paypal/capture-order', {
          method: 'POST', credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderID: data.orderID }),
        });
        const result = await r.json();
        if (!r.ok || !result.ok) throw new Error(result.error || (isEN ? 'The payment could not be confirmed' : 'El pago no se pudo confirmar'));
        // Iteración 12: en vez de recargar directo a la app, se marca para
        // abrir la pantalla de "Comprar y descargar" en cuanto la sesión
        // recargada confirme premiumActive:true (ver essamCheckSession).
        localStorage.setItem('essam_show_download_screen', '1');
        essamCloseAuthModal();
        essamReloadAfterAuthChange();
      } catch (e) {
        if (errEl) errEl.textContent = e.message;
      }
    },

    onError: (err) => {
      console.error('[ESSAM] Error de PayPal:', err);
      const errEl = document.getElementById('essamPayError');
      if (errEl) errEl.textContent = isEN ? 'Payment error. Please try again.' : 'Error en el pago. Intenta de nuevo.';
    },
  }).render('#essamPaypalButtons');
}

function essamOpenAuthModal(mode, prefillEmail) {
  const modal = document.getElementById('essamAuthModal');
  if (!modal) return;
  modal.dataset.mode = mode;
  if (prefillEmail) modal.dataset.email = prefillEmail;
  modal.style.display = 'flex';
  essamRenderAuthModal();
}

function essamCloseAuthModal() {
  const modal = document.getElementById('essamAuthModal');
  if (modal) modal.style.display = 'none';
}

function essamRenderAuthModal() {
  const modal = document.getElementById('essamAuthModal');
  const body = document.getElementById('essamAuthModalBody');
  const mode = modal.dataset.mode;
  const prefillEmail = modal.dataset.email || '';

  if (mode === 'login' || mode === 'register') {
    body.innerHTML = `
      <h3>${mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}</h3>
      <input id="essamEmailInput" type="email" placeholder="Correo" value="${prefillEmail}" style="display:block;width:100%;margin:8px 0;padding:8px;">
      <input id="essamPasswordInput" type="password" placeholder="Contraseña (mín. 8 caracteres)" style="display:block;width:100%;margin:8px 0;padding:8px;">
      <div id="essamAuthError" style="color:#a33;min-height:1.2em;"></div>
      <button id="essamAuthSubmit">${mode === 'login' ? 'Entrar' : 'Registrarme'}</button>
      <p style="margin-top:10px;font-size:0.9em;">
        ${mode === 'login'
          ? `¿No tienes cuenta? <a href="#" id="essamSwitchToRegister">Regístrate</a>`
          : `¿Ya tienes cuenta? <a href="#" id="essamSwitchToLogin">Inicia sesión</a>`}
      </p>
    `;
    document.getElementById('essamAuthSubmit').onclick = async () => {
      const email = document.getElementById('essamEmailInput').value.trim();
      const password = document.getElementById('essamPasswordInput').value;
      const errEl = document.getElementById('essamAuthError');
      try {
        if (mode === 'login') {
          const r = await fetch('/api/auth/login', {
            method: 'POST', credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, deviceId: essamGetDeviceId(), deviceLabel: essamGetDeviceLabel() }),
          });
          const data = await r.json();
          if (!r.ok) {
            if (data.next === 'verify') {
              modal.dataset.email = email;
              essamOpenAuthModal('verify', email);
              return;
            }
            throw new Error(data.error || 'Error al iniciar sesión');
          }
          essamCloseAuthModal();
          essamReloadAfterAuthChange();
        } else {
          const r = await fetch('/api/auth/register', {
            method: 'POST', credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });
          const data = await r.json();
          if (!r.ok) throw new Error(data.error || 'Error al registrar');
          essamOpenAuthModal('verify', email);
        }
      } catch (e) {
        const isEN = window._lang === 'en';
        // 'Failed to fetch' / 'NetworkError' es el navegador diciendo que no
        // encontró ningún servidor en esa dirección — no es un error de la
        // cuenta, es que server.js no está corriendo / no es accesible.
        errEl.textContent = /Failed to fetch|NetworkError|Load failed/i.test(e.message)
          ? (isEN ? 'Could not reach the server. Is it running?' : 'No se pudo contactar al servidor. ¿Está corriendo?')
          : e.message;
      }
    };
    const switchLink = document.getElementById('essamSwitchToRegister') || document.getElementById('essamSwitchToLogin');
    if (switchLink) switchLink.onclick = (e) => {
      e.preventDefault();
      modal.dataset.mode = mode === 'login' ? 'register' : 'login';
      essamRenderAuthModal();
    };

  } else if (mode === 'pay') {
    // Iteración 8: botón real de PayPal (pago único). El SDK se carga
    // dinámicamente con el Client ID que devuelve /api/price (público).
    // El flujo real (crear orden → aprobar → capturar y verificar monto)
    // ya vive en el servidor desde la iteración 3/8; aquí solo se dispara.
    const isEN = window._lang === 'en';
    body.innerHTML = `
      <h3>${isEN ? 'Full version' : 'Versión completa'}</h3>
      <p>${isEN
        ? 'One-time purchase to unlock the full Treatise of Healing Sounds and Musical Acupuncture: the 28 chapters, the 60 clinical triads, the 64 hexagrams, and Appendix B.'
        : 'Compra única para desbloquear el Tratado completo de Sonidos Sanantes y Acupuntura Musical: los 28 capítulos, las 60 tríadas clínicas, los 64 hexagramas y el Apéndice B.'}</p>
      <p id="essamPriceDisplay">${isEN ? 'Loading price…' : 'Cargando precio…'}</p>
      <div id="essamPaypalButtons" style="margin-top:0.75rem;min-height:45px"></div>
      <div id="essamPayError" style="color:#a33;min-height:1.2em;margin-top:0.4rem;font-size:0.88em"></div>
    `;
    fetch('/api/price').then(r => r.json()).then(async p => {
      const priceEl = document.getElementById('essamPriceDisplay');
      if (priceEl) priceEl.innerHTML = `<b>$${parseFloat(p.amount).toFixed(0)} ${p.currency}</b> — ${p.label}`;
      const btnBox = document.getElementById('essamPaypalButtons');
      if (!p.clientId) {
        // Servidor sin PAYPAL_CLIENT_ID configurado todavía (ej. entorno
        // de desarrollo) — se avisa en vez de fallar en silencio.
        if (btnBox) btnBox.innerHTML = `<p style="font-size:0.85em;color:#a33">${isEN ? 'Payments are not configured yet on this server.' : 'Los pagos aún no están configurados en este servidor.'}</p>`;
        return;
      }
      try {
        await essamLoadPaypalSdk(p.clientId, p.currency);
        essamRenderPaypalButtons();
      } catch (e) {
        if (btnBox) btnBox.innerHTML = `<p style="font-size:0.85em;color:#a33">${isEN ? 'Could not load the payment button.' : 'No se pudo cargar el botón de pago.'}</p>`;
      }
    }).catch(() => {
      // El backend (server.js) no respondió — ej. no está corriendo, o
      // estás abriendo index.html directo en vez de vía el servidor.
      // Antes esto dejaba "Cargando precio…" pegado sin ninguna pista.
      const priceEl2 = document.getElementById('essamPriceDisplay');
      if (priceEl2) priceEl2.innerHTML = `<span style="color:#a33">${isEN
        ? 'Could not reach the server. The payment backend is not running or not reachable from here.'
        : 'No se pudo contactar al servidor. El backend de pagos no está corriendo o no es accesible desde aquí.'}</span>`;
    });

  } else if (mode === 'download' || mode === 'platforms') {
    // Iteración 12b — pantalla pública "Descargar la app" con las 4
    // plataformas (Windows .exe, macOS .dmg, Android .apk, iOS) más el
    // flujo original de la iteración 12 (se abre sola justo después de
    // un pago confirmado). Todavía no existen instaladores nativos
    // compilados (llegan en las iteraciones 13-15) — mientras tanto,
    // cada tarjeta ofrece instalar la PWA ya funcional en ese
    // dispositivo, y deja el gancho de texto para no rediseñar nada
    // cuando el .exe/.dmg/.apk reales estén listos.
    const isEN = window._lang === 'en';
    const justPurchased = mode === 'download';
    const detected = typeof essamDetectPlatform === 'function' ? essamDetectPlatform() : 'other';
    const isPremium = typeof essamIsPremium === 'function' && essamIsPremium();

    const PLATFORMS = [
      { id: 'windows', icon: '🪟', name: 'Windows', ext: '.exe' },
      { id: 'mac',     icon: '🍎', name: 'macOS',   ext: '.dmg' },
      { id: 'android', icon: '🤖', name: 'Android',  ext: '.apk' },
      { id: 'ios',     icon: '📱', name: 'iPhone / iPad', ext: '' },
    ];

    body.innerHTML = `
      <h3>${justPurchased ? '🎉 ' + (isEN ? 'Full version unlocked' : 'Versión completa desbloqueada') : '📲 ' + (isEN ? 'Download the app' : 'Descarga la app')}</h3>
      <p>${isEN
        ? 'Choose your device. The app works the same on all of them and your unlock stays with your account.'
        : 'Elige tu dispositivo. La app funciona igual en todos y tu desbloqueo queda ligado a tu cuenta.'}</p>
      <div id="essamPlatformGrid" style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:14px 0;"></div>
      <p style="font-size:0.8em;color:#666;">${isEN
        ? 'Native installers (Windows .exe, macOS .dmg, Android .apk) are on the way. Meanwhile, every device gets the app installed like this one, working offline once opened.'
        : 'Los instaladores nativos (.exe de Windows, .dmg de macOS, .apk de Android) están en camino. Mientras tanto, en todos los dispositivos se instala así, y funciona sin conexión una vez abierta.'}</p>
      <button id="essamDownloadContinueBtn" style="margin-top:8px">${isEN ? 'Continue to the app' : 'Continuar a la app'}</button>
    `;
    document.getElementById('essamDownloadContinueBtn').onclick = () => essamCloseAuthModal();

    const grid = document.getElementById('essamPlatformGrid');
    grid.innerHTML = PLATFORMS.map(p => {
      const isMine = p.id === detected;
      return `
        <div class="essam-platform-card" data-platform="${p.id}" style="border:1px solid ${isMine ? '#7c3aed' : '#ddd'};border-radius:10px;padding:12px 10px;text-align:center;position:relative;">
          ${isMine ? `<div style="position:absolute;top:-9px;left:50%;transform:translateX(-50%);background:#7c3aed;color:#fff;font-size:0.65em;padding:1px 8px;border-radius:10px;white-space:nowrap;">${isEN ? 'your device' : 'tu dispositivo'}</div>` : ''}
          <div style="font-size:1.8em;">${p.icon}</div>
          <div style="font-weight:600;font-size:0.9em;margin-top:2px;">${p.name}</div>
          <div style="font-size:0.72em;color:#888;margin-bottom:8px;">${p.ext ? p.ext : (isEN ? 'Add to Home Screen' : 'Añadir a pantalla')}</div>
          <div class="essam-platform-action" data-platform-action="${p.id}"></div>
        </div>`;
    }).join('');

    PLATFORMS.forEach(p => {
      const actionEl = grid.querySelector(`[data-platform-action="${p.id}"]`);
      if (!isPremium) {
        actionEl.innerHTML = `<button style="font-size:0.78em;padding:6px 10px;">🔒 ${isEN ? 'Unlock' : 'Comprar'}</button>`;
        actionEl.querySelector('button').onclick = () => essamOpenAuthModal('pay', window.essamAuth.email);
        return;
      }
      const isMine = p.id === detected;
      if (!isMine) {
        actionEl.innerHTML = `<span style="font-size:0.72em;color:#888;">${isEN ? 'Open this page on that device' : 'Abre esta página en ese dispositivo'}</span>`;
        return;
      }
      if (typeof essamIsStandalone === 'function' && essamIsStandalone()) {
        actionEl.innerHTML = `<span style="font-size:0.78em;color:#2a7a4a;">✓ ${isEN ? 'Installed' : 'Instalada'}</span>`;
      } else if (p.id === 'ios') {
        actionEl.innerHTML = `<span style="font-size:0.7em;">${isEN ? 'Share ▸ Add to Home Screen' : 'Compartir ▸ Añadir a pantalla'}</span>`;
      } else if (window.essamDeferredInstallPrompt) {
        actionEl.innerHTML = `<button style="font-size:0.78em;padding:6px 10px;">📲 ${isEN ? 'Install' : 'Instalar'}</button>`;
        actionEl.querySelector('button').onclick = async () => {
          const choice = await essamPromptInstall();
          actionEl.innerHTML = choice.outcome === 'accepted'
            ? `<span style="font-size:0.78em;color:#2a7a4a;">✓ ${isEN ? 'Installed!' : '¡Instalada!'}</span>`
            : `<span style="font-size:0.7em;color:#888;">${isEN ? 'You can install it later from the browser menu.' : 'Puedes instalarla luego desde el menú del navegador.'}</span>`;
        };
      } else {
        actionEl.innerHTML = `<span style="font-size:0.68em;color:#888;">${isEN ? 'Use the browser menu ▸ Install app' : 'Usa el menú del navegador ▸ Instalar app'}</span>`;
      }
    });

  } else if (mode === 'verify') {
    body.innerHTML = `
      <h3>Verifica tu cuenta</h3>
      <p>Te mandamos un código de 6 dígitos a <b>${prefillEmail}</b> (desde atencion@acupunturamusical.com).</p>
      <input id="essamCodeInput" type="text" inputmode="numeric" maxlength="6" placeholder="000000" style="display:block;width:100%;margin:8px 0;padding:8px;font-size:1.4rem;text-align:center;letter-spacing:0.3em;">
      <div id="essamAuthError" style="color:#a33;min-height:1.2em;"></div>
      <button id="essamVerifySubmit">Verificar</button>
      <p style="margin-top:10px;font-size:0.85em;"><a href="#" id="essamResendCode">Reenviar código</a></p>
    `;
    document.getElementById('essamVerifySubmit').onclick = async () => {
      const code = document.getElementById('essamCodeInput').value.trim();
      const errEl = document.getElementById('essamAuthError');
      try {
        const r = await fetch('/api/auth/verify', {
          method: 'POST', credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: prefillEmail, code }),
        });
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || 'Código incorrecto');
        essamOpenAuthModal('login', prefillEmail);
      } catch (e) {
        errEl.textContent = e.message;
      }
    };
    document.getElementById('essamResendCode').onclick = async (e) => {
      e.preventDefault();
      await fetch('/api/auth/resend-code', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: prefillEmail }),
      });
      alert('Código reenviado — revisa tu correo.');
    };

  } else if (mode === 'account') {
    body.innerHTML = `<h3>Mi cuenta</h3><p>${window.essamAuth.email} — activa ✓</p><div id="essamDevicesList">Cargando dispositivos...</div><button id="essamOpenDownloadBtn" style="margin-right:8px">📲 Instalar / descargar app</button><button id="essamLogoutBtn">Cerrar sesión (este dispositivo)</button>`;
    document.getElementById('essamOpenDownloadBtn').onclick = () => essamOpenAuthModal('download', window.essamAuth.email);
    document.getElementById('essamLogoutBtn').onclick = async () => {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
      essamCloseAuthModal();
      essamReloadAfterAuthChange();
    };
    fetch('/api/auth/devices', { credentials: 'include' }).then(r => r.json()).then(data => {
      const list = document.getElementById('essamDevicesList');
      if (!data.devices) return;
      list.innerHTML = '<p style="font-size:0.9em;color:#666;">Dispositivos autorizados (máx. 2):</p>' +
        data.devices.map(d => `
          <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid #eee;">
            <span>${d.label}${d.id === data.thisDevice ? ' (este)' : ''}</span>
            <button data-device="${d.id}" class="essamRemoveDeviceBtn" style="font-size:0.8em;">Quitar</button>
          </div>
        `).join('');
      list.querySelectorAll('.essamRemoveDeviceBtn').forEach(btn => {
        btn.onclick = async () => {
          await fetch('/api/auth/devices/remove', {
            method: 'POST', credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ deviceId: btn.dataset.device }),
          });
          essamRenderAuthModal();
        };
      });
    });
  }
}

document.addEventListener('DOMContentLoaded', essamCheckSession);
