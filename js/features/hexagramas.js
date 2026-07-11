// Auto-extraído del monolito index.html — módulo de funcionalidad
// (sin cambios de contenido; solo separado en archivo)

function getHexLines(lower, upper) {
  const l = TRIGRAMAS_BIN[lower].lin;
  const u = TRIGRAMAS_BIN[upper].lin;
  return [l[0],l[1],l[2],u[0],u[1],u[2]];
}

function hexLinesMini(lines) {
  let html = '';
  // Render top-to-bottom visually: line 6 first
  for (let i=5; i>=0; i--) {
    if (lines[i]===1) {
      html += '<div class="hex64-line"><div class="hex64-yang"></div></div>';
    } else {
      html += '<div class="hex64-line"><div class="hex64-yin-l"></div><div style="width:8px"></div><div class="hex64-yin-r"></div></div>';
    }
    if (i===3) html += '<div style="height:3px"></div>';
  }
  return html;
}

function hexLinesBigHtml(lines) {
  let html = '';
  for (let i=5; i>=0; i--) {
    if (lines[i]===1) {
      html += '<div class="hm-yang"></div>';
    } else {
      html += '<div style="display:flex;gap:14px"><div class="hm-yin-l"></div><div class="hm-yin-r"></div></div>';
    }
    if (i===3) html += '<div class="hm-divider-line"></div>';
  }
  return html;
}

let _hexFilter = 'all';

let _hexQ = '';

function buildHexagramas() { renderHexagramas(); }

function filterHexagramas(q) {
  _hexQ = q.toLowerCase();
  renderHexagramas();
}

function filterHexTrigram(trig, btn) {
  _hexFilter = trig;
  document.querySelectorAll('.hex-filter-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderHexagramas();
}

function renderHexagramas() {
  const isEN = (window._lang === 'en');
  const grid = document.getElementById('hexGrid64');
  if (!grid) return;
  const filtered = HEXAGRAMAS_64.filter((h, idx) => {
    const en_h = HEXAGRAMAS_EN ? HEXAGRAMAS_EN[idx] : null;
    if (_hexFilter !== 'all' && h[4] !== _hexFilter && h[5] !== _hexFilter) return false;
    if (_hexQ.length >= 1) {
      const kw = isEN && en_h ? en_h[2].join(' ') : h[6].join(' ');
      const title = isEN && en_h ? en_h[1] : h[3];
      const txt = (h[0]+' '+h[1]+' '+h[2]+' '+title+' '+kw+' '+h[7]+' '+h[8]).toLowerCase();
      if (!txt.includes(_hexQ)) return false;
    }
    return true;
  });
  grid.innerHTML = filtered.map((h, fi) => {
    const idx = HEXAGRAMAS_64.indexOf(h);
    const en_h = HEXAGRAMAS_EN ? HEXAGRAMAS_EN[idx] : null;
    const [num, cn, pin, en_es, lower, upper, kw] = h;
    const title_show = (isEN && en_h) ? en_h[1] : en_es;
    const kw_show = (isEN && en_h) ? en_h[2] : kw;
    const lines = getHexLines(lower, upper);
    const lt = TRIGRAMAS_BIN[lower];
    const ut = TRIGRAMAS_BIN[upper];
    return `<div class="hex64-card" onclick="showHexModal(${num-1})" data-hex="${num}">
      <div class="hex64-num">\u2116 ${num} \u00b7 ${ut.sym}${lt.sym}</div>
      <div class="hex64-lines">${hexLinesMini(lines)}</div>
      <div class="hex64-cn">${cn}</div>
      <div class="hex64-pin">${pin}</div>
      <div class="hex64-kw">${kw_show.slice(0,3).join(' \u00b7 ')}</div>
    </div>`;
  }).join('');
}

function showHexModal(idx) {
  const isEN = (window._lang === 'en');
  const h = HEXAGRAMAS_64[idx];
  const en_h = (isEN && HEXAGRAMAS_EN) ? HEXAGRAMAS_EN[idx] : null;
  const [num, cn, pin, en_es, lower, upper, kw_es, dict_es, img_es] = h;
  const title_show = en_h ? en_h[1] : en_es;
  const kw_show   = en_h ? en_h[2] : kw_es;
  const dict_show = en_h ? en_h[3] : dict_es;
  const img_show  = en_h ? en_h[4] : img_es;
  const sub_show  = isEN ? AJEDREZ_SUBS_EN[idx] : AJEDREZ_SUBS[idx];
  const lines = getHexLines(lower, upper);
  const lt = TRIGRAMAS_BIN[lower];
  const ut = TRIGRAMAS_BIN[upper];
  const trig_lower_name = isEN ? (TRIGRAMAS_EN[lower]||lt.es) : lt.es;
  const trig_upper_name = isEN ? (TRIGRAMAS_EN[upper]||ut.es) : ut.es;
  const lbl_hex = isEN ? 'HEXAGRAM' : 'HEXAGRAMA';
  const lbl_judge = isEN ? 'THE JUDGMENT' : 'EL DICTAMEN';
  const lbl_image = isEN ? 'THE IMAGE' : 'LA IMAGEN';
  const lbl_sup = isEN ? 'above' : 'superior';
  const lbl_inf = isEN ? 'below' : 'inferior';
  const lbl_prev = isEN ? '&#9664; Prev.' : '&#9664; Ant.';
  const lbl_next = isEN ? 'Next &#9654;' : 'Sig. &#9654;';
  const lbl_oracle = isEN ? '\u2638 Use in Oracle' : '\u2638 Usar en Or\u00e1culo';
  const overlay = document.createElement('div');
  overlay.id = 'hexModalOverlay';
  overlay.className = 'hex-modal-overlay';
  overlay.innerHTML = `
    <div class="hex-modal" onclick="event.stopPropagation()">
      <button class="hm-close" onclick="closeHexModal()">\u00d7</button>
      <div class="hm-header">
        <div class="hm-lines-big">${hexLinesBigHtml(lines)}</div>
        <div class="hm-meta">
          <div class="hm-num">${lbl_hex} \u2116 ${num}</div>
          <div class="hm-title">${title_show}</div>
          <div class="hm-sub">${sub_show}</div>
          <div class="hm-cn">${cn}</div>
          <div class="hm-pin">${pin}</div>
          <div class="hm-trigs">${ut.sym} ${trig_upper_name} (${lbl_sup}) ${isEN?'over':'sobre'} ${lt.sym} ${trig_lower_name} (${lbl_inf})</div>
        </div>
      </div>
      <div class="hm-kw-row">${kw_show.map(k=>`<span class="hm-kw">${k}</span>`).join('')}</div>
      <div class="hm-section"><h4>${lbl_judge}</h4><p>${dict_show}</p></div>
      <div class="hm-section"><h4>${lbl_image}</h4><p>${img_show}</p></div>
      <div style="display:flex;gap:0.6rem;margin-top:1.2rem;flex-wrap:wrap">
        ${idx > 0 ? `<button onclick="closeHexModal();showHexModal(${idx-1})" class="sc-btn">${lbl_prev}</button>` : ''}
        ${idx < 63 ? `<button onclick="closeHexModal();showHexModal(${idx+1})" class="sc-btn">${lbl_next}</button>` : ''}
        <button onclick="showSection('oraculo');closeHexModal()" class="sc-btn" style="flex:1">${lbl_oracle}</button>
      </div>
    </div>`;
  overlay.onclick = () => closeHexModal();
  document.body.appendChild(overlay);
  setTimeout(() => overlay.classList.add('open'), 10);
}

function closeHexModal() {
  const o = document.getElementById('hexModalOverlay');
  if (o) { o.classList.remove('open'); setTimeout(() => o.remove(), 200); }
}