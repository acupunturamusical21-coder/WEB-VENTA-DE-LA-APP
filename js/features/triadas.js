// Auto-extraído del monolito index.html — módulo de funcionalidad
// (sin cambios de contenido; solo separado en archivo)

let openResult = null;

let _triadasIndexOpen = true;

function toggleTriadasIndex() {
  _triadasIndexOpen = !_triadasIndexOpen;
  const body = document.getElementById('triadasIndexBody');
  const arrow = document.getElementById('triadasIndexArrow');
  if (body) body.style.display = _triadasIndexOpen ? '' : 'none';
  if (arrow) arrow.textContent = _triadasIndexOpen ? '▼' : '▶';
}

function buildTriadasMenu() {
  const body = document.getElementById('triadasIndexBody');
  if (!body || !TRIADAS_INDEX) return;

  // Group by tríada number
  const groups = {};
  Object.values(TRIADAS_INDEX).forEach(function(t) {
    const n = t.numero || 0;
    if (!groups[n]) groups[n] = [];
    groups[n].push(t);
  });

  // Sort groups by number; within each sort by CORRESPONDENCIAS note order
  const noteOrder = CORRESPONDENCIAS.map(function(c) { return c.nota; });
  const sortedNums = Object.keys(groups).map(Number).sort(function(a, b) { return a - b; });

  const parts = sortedNums.map(function(num) {
    const entries = groups[num].slice().sort(function(a, b) {
      const ia = noteOrder.indexOf(a.tonalidad);
      const ib = noteOrder.indexOf(b.tonalidad);
      return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
    });

    const isEN = window._lang === 'en';
    const chips = entries.map(function(t) {
      const cObj = CORRESPONDENCIAS.find(function(x) { return x.nota === t.tonalidad; });
      const color = cObj ? cObj.color : '#A89364';
      const safeSig = t.signature.replace(/'/g, "\\'");
      const firstDesc = Array.from(t.descripciones)[0] || '';
      const notaDisplay = isEN ? (LATIN_TO_ANGLO[t.tonalidad] || t.tonalidad) : t.tonalidad;
      const sigDisplay = isEN
        ? ('Triad ' + (t.numero||'') + ' (' + (LATIN_TO_ANGLO[t.tonalidad]||t.tonalidad) + ')')
        : t.signature;
      const statsLabel = isEN
        ? (t.patologias.length + 'p·' + t.organos.length + 'o')
        : (t.patologias.length + 'p·' + t.organos.length + 'ó');
      const tip = (sigDisplay + (firstDesc ? ': ' + firstDesc : '') +
        ' · ' + t.patologias.length + (isEN?' pathology(s)':' patología(s)') +
        ' · ' + t.organos.length + (isEN?' organ(s)':' órgano(s)')).replace(/"/g, '&quot;');
      return '<button class="triada-chip"' +
        ' style="background:' + color + '18;color:' + color + ';border-color:' + color + '44;--chip-glow:' + color + '55"' +
        ' onclick="showTriadaInfo(\'' + safeSig + '\')"' +
        ' title="' + tip + '">' +
        '<span class="chip-dot" style="background:' + color + '"></span>' +
        notaDisplay +
        '<span class="chip-stats">' + statsLabel + '</span>' +
        '</button>';
    }).join('');

    const label = (window._lang==='en'?'Triad ':'Tríada ') + num;
    return '<div class="triadas-group"><div class="triadas-group-label">' + label +
           '</div><div class="triadas-chips">' + chips + '</div></div>';
  });

  body.innerHTML = parts.join('');

  // También llenar el panel del índice en la sección /triadas
  const menuBody = document.getElementById('triadasMenuBody');
  if (menuBody) menuBody.innerHTML = parts.join('');
}

let _triadasMenuOpen = true;

function toggleTriadasMenuPanel() {
  _triadasMenuOpen = !_triadasMenuOpen;
  const body = document.getElementById('triadasMenuBody');
  const arrow = document.getElementById('triadasMenuArrow');
  if (body) body.style.display = _triadasMenuOpen ? '' : 'none';
  if (arrow) arrow.textContent = _triadasMenuOpen ? '▼' : '▶';
}

function getContrastTextColor(hexColor) {
  // Convert hex to RGB
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  // Calculate perceived brightness (YIQ formula)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  // Return dark color for bright backgrounds, white for dark backgrounds
  return brightness > 150 ? '#1a1a1a' : '#ffffff';
}

function buildTriadasGrid() {
  const grid = document.getElementById('triadasGrid');
  if (!grid || !TRIADAS_INDEX) return;
  const isEN = window._lang === 'en';
  const noteOrder = CORRESPONDENCIAS.map(c => c.nota);

  // Agrupar tríadas por escala
  const byScale = {};
  Object.values(TRIADAS_INDEX).forEach(t => {
    if (!t.tonalidad) return;
    if (!byScale[t.tonalidad]) byScale[t.tonalidad] = [];
    byScale[t.tonalidad].push(t);
  });

  // Ordenar escalas según CORRESPONDENCIAS
  const scales = Object.keys(byScale).sort((a, b) =>
    noteOrder.indexOf(a) - noteOrder.indexOf(b)
  );

  grid.innerHTML = scales.map(nota => {
    const cObj = CORRESPONDENCIAS.find(x => x.nota === nota);
    const color = cObj ? cObj.color : '#A89364';
    const textColor = getContrastTextColor(color);
    const notaDisplay = isEN ? (LATIN_TO_ANGLO[nota] || nota) : nota;
    // Buscar emoji del órgano correspondiente
    const organ = ORGANOS.find(o => o.nota === nota || o.nota.startsWith(nota + '/') || o.nota.endsWith('/' + nota));
    const emoji = organ ? organ.emoji : '☯';

    // Ordenar tríadas por número dentro de la escala
    const triadas = byScale[nota].slice().sort((a, b) => (a.numero||0) - (b.numero||0));

    const rows = triadas.map(t => {
      const detail = TRIADAS_DETALLE[t.signature] || {};
      const nombreTec = detail.nombreTecnico
        ? (isEN ? (NOMBRETECH_EN[detail.nombreTecnico] || detail.nombreTecnico) : detail.nombreTecnico)
        : (Array.from(t.descripciones)[0] || t.signature);
      const subtitulo = detail.subtitulo || '';
      const safeSig = t.signature.replace(/'/g, "\'");
      return `<div class="td-row" onclick="showTriadaInfo('${safeSig}')" onmouseover="this.classList.add('td-row-hover')" onmouseout="this.classList.remove('td-row-hover')">
        <span class="td-num">${t.numero}</span>
        <span class="td-desc">☯ ${nombreTec}${subtitulo ? ` <em style="font-weight:normal;font-size:0.9em;opacity:0.65"> · ${subtitulo}</em>` : ''}</span>
        <span class="td-arrow">▸</span>
      </div>`;
    }).join('');

    return `<div class="td-card" style="--td-color:${color}">
      <div class="td-card-header" onclick="playScaleProgression('${nota}', this)" style="color:${textColor}">
        <span class="td-card-emoji">${emoji}</span>
        <span class="td-card-nota">${notaDisplay}</span>
        <span class="td-card-play" style="color:${textColor}" title="${isEN?'Listen':'Escuchar'} ${notaDisplay}">▶</span>
      </div>
      <div class="td-card-body">${rows}</div>
    </div>`;
  }).join('');
}

function _normalizaNotaParaTriada(nota) {
  return nota.toUpperCase()
    .replace('♭', 'B')   // Si♭ -> SIB, La♭ -> LAB, etc.
    .replace('♯', '♯');  // FA♯ se queda igual
}

function showTriadasDeNota(nota) {
  showSection('triadas');
  setTimeout(function() {
    const isEN = window._lang === 'en';
    const notaDisplay = isEN ? (LATIN_TO_ANGLO[nota] || nota) : nota;

    // Manejar notas compuestas (ej: "Sol♯/La♭")
    const notasBuscar = nota.split('/').map(n => _normalizaNotaParaTriada(n.trim()));
    
    const matchingSigs = [];
    if (typeof TRIADAS_DETALLE !== 'undefined') {
      Object.entries(TRIADAS_DETALLE).forEach(function(entry) {
        var sig = entry[0], detail = entry[1];
        // IMPORTANTE: Solo procesar entradas que tengan el campo 'notas'
        // Esto evita duplicados de traducciones que no tienen notas
        if (!detail || !detail.notas) return;
        
        var notasArr = detail.notas.split(/\s*[–-]\s*/);
        var found = notasArr.some(function(n) {
          const nNorm = n.trim().toUpperCase().replace('♭','B');
          return notasBuscar.includes(nNorm);
        });
        if (found) matchingSigs.push(sig);
      });
    }

    // Eliminar mensaje anterior si existe
    var existingMsg = document.getElementById('triadasFilterMsg');
    if (existingMsg) existingMsg.remove();

    var grid = document.getElementById('triadasGrid');
    if (!grid) return;

    // Construir panel de resultados
    var panel = document.createElement('div');
    panel.id = 'triadasFilterMsg';
    panel.style.cssText = 'margin-bottom:1.2rem;';

    if (matchingSigs.length === 0) {
      panel.innerHTML = '<div style="padding:0.75rem 1rem;background:rgba(184,146,10,0.08);border:1px solid rgba(184,146,10,0.25);border-radius:6px;font-size:0.85rem;display:flex;align-items:center;justify-content:space-between;gap:1rem">' +
        '<span style="color:var(--gold2);font-family:\'Cinzel\',serif;font-size:0.8rem">\u262F ' +
        (isEN ? 'No triads found containing note ' : 'No se encontraron tr\u00edadas con la nota ') +
        '<strong>' + notaDisplay + '</strong></span>' +
        '<button onclick="clearTriadasFilter()" style="background:none;border:1px solid var(--border);border-radius:4px;padding:0.2rem 0.6rem;font-size:0.78rem;cursor:pointer;color:var(--muted)">' +
        (isEN ? 'Show all' : 'Ver todas') + '</button></div>';
    } else {
      var orgObj = (typeof ORGANOS !== 'undefined') ? ORGANOS.find(function(o){ return o.nota === nota; }) : null;
      var organName = orgObj ? (isEN ? (orgObj.nombreEN || orgObj.nombre) : orgObj.nombre) : nota;
      var color = orgObj ? orgObj.color : 'var(--gold)';

      var rows = matchingSigs.map(function(sig) {
        var detail = TRIADAS_DETALLE[sig] || {};
        var m = sig.match(/Tr\u00edada\s+(\d+)\s*\(([^)]+)\)/i);
        var num = m ? m[1] : '?';
        var nombreTec = detail.nombreTecnico || sig;
        if (isEN && typeof NOMBRETECH_EN !== 'undefined' && NOMBRETECH_EN[nombreTec]) nombreTec = NOMBRETECH_EN[nombreTec];
        var subtitulo = detail.subtitulo || '';
        var safeSig = sig.replace(/'/g, "\\'");
        // Resaltar la nota del órgano en el campo notas
        var notasHtml = (detail.notas || '').replace(/–/g, '\u2013').split(/\s*\u2013\s*/).map(function(n) {
          var nNorm = n.trim().toUpperCase().replace('♭','B').replace('♯','#');
          var searchNorm = notasBuscar.map(x => x.replace('♯','#'));
          if (searchNorm.includes(nNorm)) {
            return '<strong style="color:' + color + '">' + n.trim() + '</strong>';
          }
          return n.trim();
        }).join(' \u2013 ');

        return '<div class="td-row" onclick="showTriadaInfo(\'' + safeSig + '\')" style="cursor:pointer;padding:0.5rem 0.75rem;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:0.75rem" onmouseover="this.style.background=\'rgba(184,146,10,0.07)\'" onmouseout="this.style.background=\'\'"> ' +
          '<span style="font-family:\'Cinzel\',serif;font-size:0.75rem;color:var(--muted);min-width:1.5rem">' + num + '</span>' +
          '<span style="flex:1;font-size:0.85rem">\u262F ' + nombreTec + (subtitulo ? ' <em style="opacity:0.6;font-size:0.82em"> \u00b7 ' + subtitulo + '</em>' : '') +
          '<br><span style="font-size:0.75rem;color:var(--muted);font-family:\'Cinzel\',serif">' + notasHtml + '</span></span>' +
          '<span style="color:var(--muted);font-size:0.85rem">\u25b8</span></div>';
      }).join('');

      panel.innerHTML =
        '<div style="padding:0.5rem 1rem 0.75rem;background:rgba(184,146,10,0.08);border:1px solid rgba(184,146,10,0.25);border-radius:6px 6px 0 0;display:flex;align-items:center;justify-content:space-between;gap:1rem">' +
          '<span style="color:var(--gold2);font-family:\'Cinzel\',serif;font-size:0.8rem;letter-spacing:0.05em">\u262F ' +
          (isEN ? 'Triads containing ' : 'Tr\u00edadas que contienen ') +
          '<strong style="color:' + color + '">' + notaDisplay + '</strong>' +
          ' \u00b7 ' + organName +
          ' <span style="opacity:0.6;font-weight:normal">(' + matchingSigs.length + ')</span></span>' +
          '<button onclick="clearTriadasFilter()" style="background:none;border:1px solid var(--border);border-radius:4px;padding:0.2rem 0.6rem;font-size:0.78rem;cursor:pointer;color:var(--muted)">' +
          (isEN ? 'Show all' : 'Ver todas') + '</button>' +
        '</div>' +
        '<div style="border:1px solid rgba(184,146,10,0.25);border-top:none;border-radius:0 0 6px 6px;overflow:hidden">' + rows + '</div>';
    }

    // Ocultar el grid normal y mostrar el panel de resultados
    grid.style.display = 'none';
    grid.parentNode.insertBefore(panel, grid);
  }, 120);
}

function clearTriadasFilter() {
  var grid = document.getElementById('triadasGrid');
  if (grid) grid.style.display = '';
  var msg = document.getElementById('triadasFilterMsg');
  if (msg) msg.remove();
}

let TRIADAS_INDEX = {};

function buildTriadasIndex() {
  TRIADAS_INDEX = {};
  const addEntry = (sig, desc) => {
    if (!sig) return null;
    if (!TRIADAS_INDEX[sig]) {
      const m = sig.match(/Tríada\s+(\d+)\s*\(([^)]+)\)/i);
      TRIADAS_INDEX[sig] = {
        signature: sig,
        numero: m ? parseInt(m[1]) : null,
        tonalidad: m ? m[2].trim() : null,
        descripciones: new Set(),
        patologias: [],   // APPENDIX_B indices
        organos: []       // ORGANOS indices
      };
    }
    if (desc) TRIADAS_INDEX[sig].descripciones.add(desc);
    return TRIADAS_INDEX[sig];
  };
  // Parse from APPENDIX_B
  APPENDIX_B.forEach((item, idx) => {
    item.triadas.forEach(t => {
      const m = t.match(/^(Tríada\s+\d+\s*\([^)]+\))\s*:?\s*(.*)$/i);
      if (m) {
        const e = addEntry(m[1], m[2]);
        if (e && !e.patologias.includes(idx)) e.patologias.push(idx);
      }
    });
  });
  // Parse from ORGANOS triadasClin
  ORGANOS.forEach((o, idx) => {
    (o.triadasClin || []).forEach(t => {
      const m = t.match(/^(Tríada\s+\d+\s*\([^)]+\))\s*:?\s*(.*)$/i);
      if (m) {
        const e = addEntry(m[1], m[2]);
        if (e && !e.organos.includes(idx)) e.organos.push(idx);
      }
    });
  });
  // Enriquecer con las descripciones clínicas largas de TRIADAS_DETALLE
  // Esto hace que términos como "sobrepeso", "infección", "obesidad" sean buscables
  try {
    if (typeof TRIADAS_DETALLE !== 'undefined' && TRIADAS_DETALLE) {
      Object.entries(TRIADAS_DETALLE).forEach(([sig, detail]) => {
        if (!sig || !detail) return;
        const e = addEntry(sig, null);
        if (!e) return;
        if (detail.nombreTecnico) e.descripciones.add(detail.nombreTecnico);
        if (Array.isArray(detail.patologias)) detail.patologias.forEach(p => { if (p) e.descripciones.add(p); });
        if (detail.accion) {
          e.descripciones.add((detail.accion || '').slice(0, 300));
        }
      });
    }
  } catch(err) {
    // Enriquecimiento opcional — si falla no interrumpe el resto del sistema
  }
}

function _getTriadaEN(signature) {
  return TRIADAS_DETALLE_EN[signature] || null;
}

function _buildTriadaOverlay(signature, det, translatedDet) {
  const t = TRIADAS_INDEX[signature];
  const c = CORRESPONDENCIAS.find(x => x.nota === t.tonalidad);
  const color = c ? c.color : '#A89364';
  const isEN = window._lang === 'en';

  // Signature and tonal centre
  const sigDisplay = isEN
    ? 'Triad ' + t.numero + ' (' + (LATIN_TO_ANGLO[t.tonalidad] || t.tonalidad) + ')'
    : t.signature;
  const tonoLabel  = isEN ? 'Tonal center' : 'Centro tonal';
  const tonoDisplay = isEN ? (LATIN_TO_ANGLO[t.tonalidad] || t.tonalidad) : t.tonalidad;

  // Clinical block
  let clinicaHtml = '';
  if (det.nombreTecnico) {
    const ntDisplay = isEN ? (NOMBRETECH_EN[det.nombreTecnico] || det.nombreTecnico) : det.nombreTecnico;
    clinicaHtml += `<div style="font-family:'Cinzel',serif;font-size:0.82rem;letter-spacing:0.08em;color:${color};margin-bottom:0.3rem;text-transform:uppercase;font-weight:700">${ntDisplay}</div>`;
  }
  const subtituloText = isEN ? (translatedDet.subtitulo || det.subtitulo) : det.subtitulo;
  if (subtituloText) {
    clinicaHtml += `<div style="font-style:italic;font-size:0.82rem;color:var(--muted);margin-bottom:0.6rem">"${subtituloText}"</div>`;
  }
  if (det.notas) {
    clinicaHtml += `<div style="font-size:0.82rem;color:var(--muted);margin-bottom:0.2rem">🎵 <strong style="color:${color}">${isEN ? notasToEn(det.notas) : det.notas}</strong></div>`;
  }
  if (det.canales) {
    clinicaHtml += `<div style="font-size:0.78rem;color:var(--muted);margin-bottom:0.8rem">⚡ ${canalesText(det.canales, isEN)}</div>`;
  }
  const accionText = isEN ? (translatedDet.accion || det.accion) : det.accion;
  if (accionText) {
    const accionLabel = isEN ? 'Combined module action' : 'Acción conjunta del módulo';
    clinicaHtml += `<div class="trd-section" style="margin-bottom:0.8rem"><h4>${accionLabel}</h4><p style="font-size:0.82rem;line-height:1.6;color:var(--text)">${accionText}</p></div>`;
  }

  // Pathologies from the book
  const patologiasArr = isEN
    ? (translatedDet.patologias && translatedDet.patologias.length ? translatedDet.patologias : (det.patologias || []))
    : (det.patologias || []);
  let patosFromBook = '';
  if (patologiasArr.length > 0) {
    patosFromBook = patologiasArr.map(p => `<li style="margin-bottom:0.35rem;font-size:0.82rem">${p}</li>`).join('');
  }
  const clinicLabel   = isEN ? 'Clinical indications — Ch. 18' : 'Indicaciones clínicas del libro (Cap. 18)';
  const appendLabel   = isEN ? `Linked pathologies — Appendix B (${t.patologias.length})` : `Patologías vinculadas — Apéndice B (${t.patologias.length})`;
  const orgLabel      = isEN ? `Organs (${t.organos.length})` : `Órganos donde aparece (${t.organos.length})`;
  const listenLabel   = isEN ? '▶ Listen arpeggio' : '▶ Escuchar arpegio';
  const chapterLabel  = isEN ? '📖 Ch. 18 — Triads' : '📖 Cap. 18 — Tríadas';

  const patosLinked = t.patologias.map(i => {
    const p = APPENDIX_B[i];
    const nameDisplay = isEN ? (APPENDIX_B_NAMES_EN[i] || p.name) : p.name;
    const safeName = p.name.replace(/'/g, "\\'");
    return `<li onclick="closeTriadaModal();searchAndShow('${safeName}')" class="trd-link">${nameDisplay} <span class="rc-tag ${p.cat}">${p.cat}</span></li>`;
  }).join('') || '';
  const orgsHtml = t.organos.map(i => {
    const o = ORGANOS[i];
    const orgName = isEN ? (CONTENT_TRANSLATIONS.en[o.nombre] || o.nombre) : o.nombre;
    return `<li onclick="closeTriadaModal();showSection('organos');selectOrgano(${i})" class="trd-link"><span class="dot" style="background:${o.color}"></span>${orgName}</li>`;
  }).join('') || '<li class="trd-empty">—</li>';

  return `
    <div class="trd-modal" onclick="event.stopPropagation()" style="--trd-color:${color}">
      <button class="trd-close" onclick="closeTriadaModal()" data-testid="close-triada">×</button>
      <div class="trd-head">
        <div class="trd-sig" style="color:${color}">${sigDisplay}</div>
        <div class="trd-tono">${tonoLabel}: <strong style="color:${color}">${tonoDisplay}</strong></div>
      </div>
      ${clinicaHtml}
      ${patosFromBook ? `<div class="trd-section"><h4>${clinicLabel}</h4><ul>${patosFromBook}</ul></div>` : ''}
      <div class="trd-cols">
        ${patosLinked ? `<div class="trd-section"><h4>${appendLabel}</h4><ul>${patosLinked}</ul></div>` : ''}
        <div class="trd-section"><h4>${orgLabel}</h4><ul>${orgsHtml}</ul></div>
      </div>
      <div class="trd-actions">
        <button onclick="playTriadaArpeggio('${det.notas || t.tonalidad}', this)" class="sc-btn" data-testid="play-triada-tono" data-orig-text="${listenLabel}">${listenLabel}</button>
        <button onclick="closeTriadaModal();goToChapterById('cap18')" class="sc-btn" data-testid="triada-chapter">${chapterLabel}</button>
      </div>
    </div>`;
}

function showTriadaInfo(signature) {
  if (typeof essamIsPremium === 'function' && !essamIsPremium()) {
    essamGoPremium();
    return;
  }
  const t = TRIADAS_INDEX[signature];
  if (!t) return;
  const det = TRIADAS_DETALLE[signature] || {};
  const isEN = window._lang === 'en';

  // Build overlay: use static EN translations if language is English
  const enContent = isEN ? (_getTriadaEN(signature) || {}) : {};
  const overlay = document.createElement('div');
  overlay.id = 'triadaOverlay';
  overlay.className = 'trd-overlay';
  overlay.innerHTML = _buildTriadaOverlay(signature, det, enContent);
  overlay.onclick = () => closeTriadaModal();
  document.body.appendChild(overlay);
  setTimeout(() => overlay.classList.add('open'), 10);

  // Auto-play arpeggio
  if (det.notas) {
    setTimeout(() => {
      const btn = overlay.querySelector('[data-testid="play-triada-tono"]');
      playTriadaArpeggio(det.notas, btn);
    }, 320);
  }

  // No async translation needed — content already embedded in TRIADAS_DETALLE_EN
}

function closeTriadaModal() {
  const o = document.getElementById('triadaOverlay');
  if (o) { o.classList.remove('open'); setTimeout(() => o.remove(), 200); }
}

function searchAndShow(name) {
  showSection('buscador');
  setTimeout(() => {
    const inp = document.querySelector('#buscador input[placeholder*="insomnio"]');
    if (inp) { inp.value = name; performSearch(name); }
  }, 100);
}

function normalizeText(str) {
  return (str || '').toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[''´`]/g, "'");
}

function buildAccentRegex(rawQuery) {
  const charMap = {
    a:'[aáàäâãAÁÀÄÂÃ]', e:'[eéèëêEÉÈËÊ]', i:'[iíìïîIÍÌÏÎ]',
    o:'[oóòöôõOÓÒÖÔÕ]', u:'[uúùüûUÚÙÜÛ]', n:'[nñNÑ]'
  };
  const src = Array.from(rawQuery.trim().toLowerCase())
    .map(c => charMap[c] || c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('');
  try { return new RegExp(src, 'gi'); } catch(e) { return null; }
}