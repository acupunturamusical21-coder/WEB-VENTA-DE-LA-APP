// Auto-extraído del monolito index.html — módulo de funcionalidad
// (sin cambios de contenido; solo separado en archivo)

function applyI18n(lang) {
  const t = I18N[lang];
  if (!t) return;
  // Static data-i18n elements
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (t[key] !== undefined) el.innerHTML = t[key];
  });
  // data-i18n-title attributes (tooltips)
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.getAttribute('data-i18n-title');
    if (t[key] !== undefined) el.title = t[key];
  });
}

function applyContentTranslations(lang) {
  if (lang === 'es') {
    // restore — reload not needed, we track originals
    document.querySelectorAll('[data-orig-text]').forEach(el => {
      el.textContent = el.getAttribute('data-orig-text');
    });
    document.querySelectorAll('[data-orig-html]').forEach(el => {
      el.innerHTML = el.getAttribute('data-orig-html');
    });    // placeholder
    const inp = document.getElementById('searchInput');
    if (inp) inp.placeholder = 'ej: insomnio, depresión, ansiedad, fibromialgia…';
    // Birth hour placeholder
    const bhES = document.getElementById('mvBirthHour');
    if (bhES) bhES.placeholder = '12 = mediodía';
    // Restore gender and pillar selects to ES
    const mvGenderES = document.getElementById('mvGender');
    if (mvGenderES) {
      const opts = mvGenderES.querySelectorAll('option');
      if (opts[0]) opts[0].textContent = 'Masculino (ciclos de 8 años)';
      if (opts[1]) opts[1].textContent = 'Femenino (ciclos de 7 años)';
    }
    const pqsES = document.getElementById('pillarQuickSelect');
    if (pqsES) {
      const oops = pqsES.querySelectorAll('option');
      if (oops[0]) oops[0].textContent = 'Pilar del Año — Imagen / Familia ext.';
      if (oops[1]) oops[1].textContent = 'Pilar del Mes — Trabajo / Vocación';
      if (oops[2]) oops[2].textContent = 'Pilar del Día — Vida íntima / Alma';
      if (oops[3]) oops[3].textContent = 'Pilar de la Hora — Hijos / Pacientes';
    }
    return;
  }
  const map = CONTENT_TRANSLATIONS[lang] || {};
  // Walk text nodes
  function translateNode(node) {
    if (node.nodeType === 3) { // TEXT NODE
      const orig = node.textContent.trim();
      if (orig && map[orig]) {
        if (!node.parentElement.hasAttribute('data-orig-text')) {
          node.parentElement.setAttribute('data-orig-text', node.textContent);
        }
        node.textContent = map[orig];
      }
    } else if (node.nodeType === 1) {
      // Skip script, style, ideogram-only spans
      const tag = node.tagName;
      if (tag === 'SCRIPT' || tag === 'STYLE') return;
      // Skip if purely CJK characters (ideograms)
      if (node.childNodes.length === 1 && node.childNodes[0].nodeType === 3) {
        const text = node.textContent.trim();
        if (/^[一-鿿㐀-䶿·\s·]+$/.test(text)) return;
      }
      node.childNodes.forEach(child => translateNode(child));
    }
  }
  // Translate specific known containers
  const selectors = [
    '.cn', '.cn2', '.fc-desc', '.fc-title', '.page-subtitle',
    '.search-hint', '.oracle-tab', '.throw-btn', '.btn-gold',
    '.play-progression-btn', '.acerca-tag', '.acerca-title',
    '.acerca-label', '.acerca-lead', '.acerca-value', '.acerca-features li',
    '.acerca-card > p', '.hm-section p', '.trd-section h4',
    '#indexToggleLabel',
    '.sc-btn', '.hero-desc', 'blockquote', '.card p',
    // Sesión 5: Oracle
    '.mv-form h3', '.mv-form label', '.op-title',
    '.op-section-label', '.op-mixer-title', '.op-fader-label',
    '.op-style-btn', '.op-instr-btn',
    '#mvGender option', '#pillarQuickSelect option',
  ];
  selectors.forEach(sel => {
    document.querySelectorAll(sel).forEach(el => {
      const text = el.textContent.trim();
      if (map[text]) {
        if (!el.hasAttribute('data-orig-text')) el.setAttribute('data-orig-text', el.textContent);
        el.textContent = map[text];
      } else if (map[el.innerHTML.trim()]) {
        if (!el.hasAttribute('data-orig-html')) el.setAttribute('data-orig-html', el.innerHTML);
        el.innerHTML = map[el.innerHTML.trim()];
      } else {
        // walk children
        el.childNodes.forEach(n => translateNode(n));
      }
    });
  });

  // Oracle Momento Vital description (rich HTML)
  const mvDesc = document.getElementById('mv-desc');
  if (mvDesc && lang === 'en') {
    if (!mvDesc.hasAttribute('data-orig-html')) mvDesc.setAttribute('data-orig-html', mvDesc.innerHTML);
    mvDesc.innerHTML = 'The <strong>Heaven Trigram</strong> (upper) is determined by the birth date and remains immutable. The <strong>Earth Trigram</strong> (lower) is calculated according to current age, following the Fu Xi cycle. The tonality is chosen according to the life sphere generating the imbalance (the Four Pillars of Destiny).';
  }
  // Birth hour placeholder
  const bh = document.getElementById('mvBirthHour');
  if (bh) bh.placeholder = lang === 'en' ? '12 = noon' : '12 = mediodía';

  // Placeholder
  const inp = document.getElementById('searchInput');
  if (inp) inp.placeholder = map[inp.placeholder] || inp.placeholder;

  // TTS speed options
  document.querySelectorAll('#ttsSpeed option').forEach(opt => {
    if (map[opt.textContent.trim()]) opt.textContent = map[opt.textContent.trim()];
  });

  // updTTSBtn label uses data-i18n dynamically — patch labels
  const ttsTxt = document.getElementById('ttsBtnTxt');
  if (ttsTxt && map[ttsTxt.textContent.trim()]) ttsTxt.textContent = map[ttsTxt.textContent.trim()];

  // Book toggle label
  const bookLabel = document.getElementById('indexToggleLabel');
  if (bookLabel && map[bookLabel.textContent.trim()]) bookLabel.textContent = map[bookLabel.textContent.trim()];

  // Sesión 5: Oracle form labels and selects
  document.querySelectorAll('.mv-form label[data-orig-text],.mv-form h3[data-orig-text]').forEach(el => {
    const orig = el.getAttribute('data-orig-text');
    if (map[orig]) {
      if (!el.hasAttribute('data-translated')) el.setAttribute('data-translated','1');
      el.textContent = map[orig];
    }
  });
  const mvGender = document.getElementById('mvGender');
  if (mvGender) {
    mvGender.querySelectorAll('option').forEach(opt => {
      if (map[opt.textContent.trim()]) opt.textContent = map[opt.textContent.trim()];
    });
  }
  const pqs = document.getElementById('pillarQuickSelect');
  if (pqs) {
    pqs.querySelectorAll('option').forEach(opt => {
      if (map[opt.textContent.trim()]) opt.textContent = map[opt.textContent.trim()];
    });
  }
  const calcBtn = document.querySelector('.throw-btn[data-orig-text="☯ Calcular Momento Vital"]');
  if (calcBtn && map['☯ Calcular Momento Vital']) calcBtn.textContent = map['☯ Calcular Momento Vital'];
  const mvPNote = document.querySelector('.mv-form p[data-orig-text]');
  if (mvPNote && map[mvPNote.getAttribute('data-orig-text')]) mvPNote.textContent = map[mvPNote.getAttribute('data-orig-text')];
  // Generic: translate remaining data-orig-text elements via map (skip already-processed ones)
  document.querySelectorAll('[data-orig-text]').forEach(el => {
    if (el.id === 'indexToggleLabel') return;
    const orig = el.getAttribute('data-orig-text').replace(/\s+/g,' ').trim();
    if (orig && map[orig]) el.textContent = map[orig];
  });
  // Generic: translate data-orig-html elements via map (only exact key matches)
  document.querySelectorAll('[data-orig-html]').forEach(el => {
    if (el.id === 'mv-desc') return; // handled above with whitespace normalization
    const orig = el.getAttribute('data-orig-html').replace(/\s+/g,' ').trim();
    if (orig && map[orig]) el.innerHTML = map[orig];
  });
}

function toggleLanguage() {
  window._lang = (window._lang === 'es') ? 'en' : 'es';
  ttsVoice = null; // Reset cached voice so it reloads for the new language
  const isEN = window._lang === 'en';
  document.getElementById('langFlagCurrent').textContent = isEN ? '🇬🇧' : '🇪🇸';
  document.getElementById('langLabel').textContent = isEN ? 'ES' : 'EN';
  document.documentElement.lang = window._lang;
  applyI18n(window._lang);
  applyContentTranslations(window._lang);
  // Rebuild all dynamic sections
  buildCorrespondencias();
  buildOrganos();
  buildEscalas();
  buildTriadasMenu();
  buildTriadasGrid();
  // Update dodecahedron face labels (note names + organ names)
  if (dodecaState.labels.length > 0) updateDodecaLabels();
  // Re-select current organ
  const activeOrgan = document.querySelector('.otab.active');
  if (activeOrgan) {
    const idx = [...document.querySelectorAll('.otab')].indexOf(activeOrgan);
    if (idx >= 0) selectOrgano(idx);
  }
  document.getElementById('corrDetail').classList.remove('visible');
  selectedCorr = null;
  // Repintar el candado premium de la sección actual en el nuevo idioma
  if (typeof essamRefreshCurrentLock === 'function') essamRefreshCurrentLock();
  // Update search placeholder and re-run if active
  const si = document.getElementById('searchInput');
  if (si) {
    si.placeholder = isEN ? 'e.g.: insomnia, depression, anxiety, fibromyalgia…' : 'ej: insomnio, depresión, ansiedad, fibromialgia…';
    performSearch(si.value || '');
    if (si.value.trim().length >= 2) performSearch(si.value);
    else performSearch('');
  }
  // Oracle: reset step label and throw btn to current lang; recalc if Vital Moment is active
  const stepLbl = document.getElementById('stepLabel');
  if (stepLbl && oracleState && oracleState.step === 0) {
    stepLbl.textContent = isEN ? 'Step 1 of 8 — Throw 1/6 for the hexagram' : 'Paso 1 de 8 — Lanzamiento 1/6 para el hexagrama';
  }
  const throwBtn = document.getElementById('throwBtn');
  if (throwBtn && oracleState && oracleState.step === 0) {
    throwBtn.textContent = isEN ? '⚄ Throw Coins' : '⚄ Lanzar Monedas';
  }
  const hexDisp = document.getElementById('hexDisplay');
  if (hexDisp && oracleState && oracleState.step === 0) {
    hexDisp.innerHTML = `<p style="color:var(--muted);font-style:italic;font-size:0.9rem">${isEN?'The hexagram will appear here...':'El hexagrama aparecerá aquí...'}</p>`;
  }
  if (_lastMomentoVital) { calcMomentoVital(); }
  // Rebuild hexagrams grid with new language
  const hexGrid = document.getElementById('hexGrid64');
  if (hexGrid) renderHexagramas();
  // Rebuild book index and re-render current chapter with new language
  const libroSection = document.getElementById('libro');
  if (libroSection && !libroSection.classList.contains('hidden')) {
    buildLector();
  }
  // Store preference
  try { localStorage.setItem('amLang', window._lang); } catch(e) {}
}

document.addEventListener('DOMContentLoaded', () => {
  try {
    const saved = localStorage.getItem('amLang');
    if (saved && saved !== 'es') {
      window._lang = saved;
      document.getElementById('langFlagCurrent').textContent = '🇬🇧';
      document.getElementById('langLabel').textContent = 'ES';
      // Sync splash lang button if present
      const slf = document.getElementById('splashLangFlag');
      const sll = document.getElementById('splashLangLabel');
      if (slf) slf.textContent = '🇬🇧';
      if (sll) sll.textContent = 'ES';
      applyI18n('en');
      applyContentTranslations('en');
    }
  } catch(e) {}
});