// Auto-extraído del monolito index.html — módulo de funcionalidad
// (sin cambios de contenido; solo separado en archivo)

let _navHistory = [], _navFuture = [], _navCurrent = null;

// ─────────────────────────────────────────────
// Candado de secciones 100% premium.
// Estas secciones son exclusivas de la versión completa (pago único).
// "Escalas", "Correspondencias" y "12 Órganos" NO están aquí: son
// gratuitas (versión lite) — dentro de "12 Órganos" el detalle clínico
// (protocolo Tonificar/Dispersar con puntos) sigue protegido de forma
// más fina en organos.js (essamModuloBoxHtml), no a nivel de sección.
// ─────────────────────────────────────────────
const ESSAM_FULL_LOCK_SECTIONS = {
  libro:   { es: 'El Libro (los 28 capítulos del Tratado)', en: 'The Book (the 28 chapters of the Treatise)' },
  oraculo: { es: 'El Oráculo', en: 'The Oracle' },
  triadas: { es: 'Las Tríadas Clínicas', en: 'The Clinical Triads' },
  iching:  { es: 'Los 64 Hexagramas', en: 'The 64 Hexagrams' },
};

function essamApplySectionLock(id) {
  // Quitar cualquier candado que hubiera quedado de antes.
  Object.keys(ESSAM_FULL_LOCK_SECTIONS).forEach(sid => {
    const existing = document.getElementById('lock-' + sid);
    if (existing) existing.remove();
  });

  const labels = ESSAM_FULL_LOCK_SECTIONS[id];
  if (!labels) return;
  if (typeof essamIsPremium === 'function' && essamIsPremium()) return;

  const sec = document.getElementById(id);
  if (!sec) return;
  sec.style.position = 'relative';

  const isEN = window._lang === 'en';
  const label = isEN ? labels.en : labels.es;

  const overlay = document.createElement('div');
  overlay.id = 'lock-' + id;
  overlay.className = 'essam-lock-overlay';
  overlay.innerHTML = `
    <div class="essam-lock-box">
      <div class="essam-lock-icon">🔒</div>
      <h3>${isEN ? 'Premium Content' : 'Contenido Premium'}</h3>
      <p>${isEN
        ? `${label} is part of Musical Acupuncture's premium content. Subscribe to get full access.`
        : `${label} es parte del contenido premium de Acupuntura Musical. Suscríbete para acceder por completo.`}</p>
      <button class="essam-lock-btn" onclick="essamGoPremium()">${isEN ? 'Unlock Premium' : 'Desbloquear Premium'}</button>
    </div>`;
  sec.appendChild(overlay);
}

// Vuelve a pintar el candado de la sección visible ahora mismo, con el
// idioma correcto. Se llama cada vez que se cambia de idioma (ver
// toggleLanguage en i18n-apply.js) para que el overlay no se quede
// congelado en el idioma con el que se abrió la sección la primera vez.
function essamRefreshCurrentLock() {
  if (_navCurrent) essamApplySectionLock(_navCurrent);
}

// ─────────────────────────────────────────────
// Iteración 7 — candado visible en las pestañas del menú y en las
// tarjetas de "Inicio" para las secciones 100% premium. Usa el mismo
// mapa ESSAM_FULL_LOCK_SECTIONS (arriba) a través del atributo
// data-essam-lock="<id>" que ya trae el HTML en cada nav-btn y
// feature-card correspondiente.
//
// A propósito NO se ocultan del DOM ni se quitan del menú: se dejan
// visibles con un candado (mismo build sirve 'lite' y 'full' sin dos
// copias de HTML, y la persona ve que la sección existe → upsell). El
// candado real de contenido sigue siendo essamApplySectionLock() al
// entrar a la sección — esto es solo la señal previa, en la pestaña.
// ─────────────────────────────────────────────
function essamDecorateLockedNav() {
  const locked = !(typeof essamIsPremium === 'function' && essamIsPremium());
  document.querySelectorAll('[data-essam-lock]').forEach(el => {
    el.classList.toggle('essam-nav-locked', locked);
    let badge = el.querySelector('.essam-nav-lock-badge');
    if (locked) {
      if (!badge) {
        badge = document.createElement('span');
        badge.className = 'essam-nav-lock-badge';
        badge.textContent = '🔒';
        el.appendChild(badge);
      }
    } else if (badge) {
      badge.remove();
    }
  });
}

function _navUpdateBtns() {
  const bk = document.getElementById('navBackBtn');
  const fw = document.getElementById('navFwdBtn');
  if (bk) bk.style.opacity = _navHistory.length ? '1' : '0.3';
  if (fw) fw.style.opacity = _navFuture.length ? '1' : '0.3';
}

function navBack() {
  if (!_navHistory.length) return;
  if (_navCurrent) _navFuture.unshift(_navCurrent);
  _navCurrent = _navHistory.pop();
  _showSectionInternal(_navCurrent);
  _navUpdateBtns();
}

function navForward() {
  if (!_navFuture.length) return;
  if (_navCurrent) _navHistory.push(_navCurrent);
  _navCurrent = _navFuture.shift();
  _showSectionInternal(_navCurrent);
  _navUpdateBtns();
}

function showSection(id) {

  if (_navCurrent && _navCurrent !== id) {
    _navHistory.push(_navCurrent);
    _navFuture = [];
  }

  _navCurrent = id;
  _navUpdateBtns();
  _showSectionInternal(id);
}

;

function _showSectionInternal(id) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  const btns = document.querySelectorAll('.nav-btn');
  btns.forEach(b => {if (b.onclick && b.onclick.toString().includes("'"+id+"'")) b.classList.add('active')});
  window.scrollTo(0,0);
  essamApplySectionLock(id);
  // Mostrar/ocultar barra TTS fija
  const ttsBar = document.getElementById('ttsPlayerBar');
  if (ttsBar) ttsBar.style.display = (id === 'libro') ? 'block' : 'none';
  if (id !== 'libro') ttsStop();
  // Dodecaedro: inicializar la primera vez que se abre la sección (con
  // el contenedor ya visible y con dimensiones reales), o redimensionar.
  if (id === 'organos') {
    setTimeout(() => {
      if (!dodecaState.group) {
        initDodecahedron();
      } else {
        // Ya existe — disparar resize para que se adapte al contenedor
        window.dispatchEvent(new Event('resize'));
      }
    }, 60);
  }
}