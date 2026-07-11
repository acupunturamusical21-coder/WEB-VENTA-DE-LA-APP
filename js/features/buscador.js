// Auto-extraído del monolito index.html — módulo de funcionalidad
// (sin cambios de contenido; solo separado en archivo)

// ─────────────────────────────────────────────
// Iteración 6 — bloqueo de resultados del buscador en 'lite'.
// La búsqueda corre igual para todos: mismo índice, mismos resultados
// de texto (nombre de síndrome, tríada, módulo — el título indexado).
// Lo único que cambia entre tiers es la interacción: en 'lite' el
// clic no navega al contenido completo (protocolo con puntos de
// acupuntura / detalle de tríada); solo abre el aviso de compra. En
// 'full' el clic navega de verdad. No hace falta ocultar datos del
// servidor porque lo que ya se muestra es solo el título, no el
// tratamiento en sí.
// ─────────────────────────────────────────────
function essamSearchLocked() {
  return !(typeof essamIsPremium === 'function' && essamIsPremium());
}

// Sustituye el onclick real de un resultado de búsqueda por el aviso
// de compra cuando la cuenta no es premium. `realCode` es el string
// de JS que se ejecutaría en 'full' (ej. "showTriadaInfo('...')").
function essamSearchOnclick(realCode) {
  return essamSearchLocked() ? 'essamGoPremium()' : realCode;
}

// Candado inline para insertar junto a un resultado bloqueado.
function essamSearchLockBadge(isEN) {
  return essamSearchLocked()
    ? `<span class="essam-search-lock-badge">🔒 ${isEN ? 'Unlock' : 'Desbloquear'}</span>`
    : '';
}

_SYNONYM_GROUPS.forEach(group => {
  const normGroup = group.map(normalizeText);
  normGroup.forEach(term => {
    if (!_SYNONYM_MAP[term]) _SYNONYM_MAP[term] = new Set();
    normGroup.forEach(s => _SYNONYM_MAP[term].add(s));
  });
});

function getSearchTerms(rawQuery) {
  const norm = normalizeText(rawQuery);
  // 1. Si hay sinónimos exactos, devuelve todo el grupo
  if (_SYNONYM_MAP[norm]) return Array.from(_SYNONYM_MAP[norm]);
  // 2. Sin sinónimos: agregar variantes de plural/singular
  const terms = new Set([norm]);
  if (norm.endsWith('es') && norm.length > 4) {
    const stem = norm.slice(0, -2);
    terms.add(stem);
    if (_SYNONYM_MAP[stem]) _SYNONYM_MAP[stem].forEach(s => terms.add(s));
  } else if (norm.endsWith('s') && norm.length > 3) {
    const stem = norm.slice(0, -1);
    terms.add(stem);
    if (_SYNONYM_MAP[stem]) _SYNONYM_MAP[stem].forEach(s => terms.add(s));
  }
  // 3. También probar si el término normalizado tiene sinónimos parciales (término está dentro de una clave)
  Object.keys(_SYNONYM_MAP).forEach(key => {
    if (key.includes(norm) || norm.includes(key)) {
      _SYNONYM_MAP[key].forEach(s => terms.add(s));
    }
  });
  return Array.from(terms);
}

function matchesSearchTerms(text, searchTerms) {
  const normText = normalizeText(text);
  return searchTerms.some(term => normText.includes(term));
}

let _ABTriadaIndex = null;

let _ABEscalaIndex = null;

function _buildABIndexes() {
  if (_ABTriadaIndex) return;
  _ABTriadaIndex = {};
  _ABEscalaIndex = {};

  // Mapa nombre-órgano → escalas (tonificar / dispersar)
  const organScaleMap = {};
  if (typeof ORGANOS !== 'undefined') {
    ORGANOS.forEach(org => {
      if (!org || !org.nombre) return;
      organScaleMap[org.nombre] = {
        tonificar: (org.tonificar && org.tonificar.escala) ? org.tonificar.escala : null,
        dispersar: (org.dispersar && org.dispersar.escala) ? org.dispersar.escala : null,
      };
    });
  }

  (APPENDIX_B || []).forEach(entry => {
    const triadas = entry.triadas || [];

    triadas.forEach(tri => {
      // Las tríadas clínicas tienen forma "Tríada N (Nota): Descripción"
      // Las escalas extraordinarias tienen forma "Escala Extraord. Fa mayor"
      if (/^Escala Extraord\./i.test(tri)) {
        // Indexar como escala
        const m = tri.match(/Escala Extraord\.\s+(.+)/i);
        if (m) {
          const eKey = normalizeNotaMusical(normalizeText(m[1]));
          if (!_ABEscalaIndex[eKey]) _ABEscalaIndex[eKey] = [];
          _ABEscalaIndex[eKey].push({ entry, escala: tri, modulo: null, esExtraord: true });
        }
      } else {
        // Tríada clínica normal
        const key = normalizeNotaMusical(normalizeText(tri));
        if (!_ABTriadaIndex[key]) _ABTriadaIndex[key] = [];
        _ABTriadaIndex[key].push({ entry, triada: tri });
      }
    });

    // Indexar escalas pentatónicas ordinarias desde los módulos
    (entry.modulos || []).forEach(mod => {
      const modNorm = normalizeText(mod);
      const isT = /^tonificar/i.test(modNorm);
      const isD = /^dispersar/i.test(modNorm);
      if (!isT && !isD) return;
      const organRaw = mod.replace(/^(Tonificar|Dispersar)\s+/i, '').trim();
      const scales = organScaleMap[organRaw];
      if (!scales) return;
      const escalaStr = isT ? scales.tonificar : scales.dispersar;
      if (!escalaStr) return;
      const eKey = normalizeNotaMusical(normalizeText(escalaStr));
      if (!_ABEscalaIndex[eKey]) _ABEscalaIndex[eKey] = [];
      _ABEscalaIndex[eKey].push({ entry, escala: escalaStr, modulo: mod, esExtraord: false });
    });
  });
}

function _entryToResultado(entry, matchTriada, matchEscala, matchModuloLabel) {
  // Derivar módulos desde entry.modulos (strings como "Tonificar Pulmón")
  const modulos = (entry.modulos || []).map((mod, i) => {
    const accion = /^tonificar/i.test(mod) ? 'tonificar' : 'dispersar';
    const nombreOrgano = mod.replace(/^(Tonificar|Dispersar)\s+/i, '').trim();
    // Buscar idx en ORGANOS
    let idx = -1;
    if (typeof ORGANOS !== 'undefined') {
      idx = ORGANOS.findIndex(o => o && o.nombre === nombreOrgano);
    }
    return { idx, accion, label: mod };
  }).filter(m => m.idx >= 0);

  // Derivar tríadas clínicas (excluir las de escala extraord)
  const triadasClin = (entry.triadas || []).filter(t => !/^Escala Extraord\./i.test(t));
  const escalasExtraord = (entry.triadas || []).filter(t => /^Escala Extraord\./i.test(t));

  // Determinar patrón
  const tieneT = (entry.modulos || []).some(m => /^tonificar/i.test(m));
  const tieneD = (entry.modulos || []).some(m => /^dispersar/i.test(m));
  const patron = tieneT && tieneD ? 'mixto' : (tieneD ? 'dispersar' : 'tonificar');

  let matchModulo = null;
  if (matchModuloLabel) {
    matchModulo = modulos.find(m => normalizeText(m.label) === normalizeText(matchModuloLabel)) || null;
  }

  const trat = {
    sindrome: entry.name,
    patron,
    modulos,
    triadas: triadasClin,
    escalasExtraord,
  };

  return {
    sindrome: entry.name,
    trat,
    matchTriada: matchTriada || null,
    matchEscala: matchEscala || null,
    matchModulo: matchModulo || null,
    score: (matchTriada ? 3 : 0) + (matchEscala ? 2 : 0) + (matchModulo ? 2 : 0),
  };
}

function normalizeNotaMusical(nota) {
  if (!nota) return nota;
  
  let result = nota.toLowerCase().trim();
  
  // Convertir "sostenido" y "bemol" a símbolos
  result = result.replace(/\s*sostenido\b/gi, '#');
  result = result.replace(/\s*bemol\b/gi, 'b');
  
  // Convertir # a ♯
  result = result.replace(/#/g, '♯');
  
  // Convertir ♭ a b (para normalizar)
  result = result.replace(/♭/g, 'b');
  
  // Notas en español con bemoles
  result = result.replace(/dob/gi, 'dob');
  result = result.replace(/reb/gi, 'reb');
  result = result.replace(/mib/gi, 'mib');
  result = result.replace(/fab/gi, 'fab');
  result = result.replace(/solb/gi, 'solb');
  result = result.replace(/lab/gi, 'lab');
  result = result.replace(/sib/gi, 'sib');
  
  // Notas en español con sostenidos
  result = result.replace(/do♯/gi, 'do#');
  result = result.replace(/re♯/gi, 're#');
  result = result.replace(/mi♯/gi, 'mi#');
  result = result.replace(/fa♯/gi, 'fa#');
  result = result.replace(/sol♯/gi, 'sol#');
  result = result.replace(/la♯/gi, 'la#');
  result = result.replace(/si♯/gi, 'si#');
  
  // Notas en inglés con bemoles
  result = result.replace(/cb/gi, 'cb');
  result = result.replace(/db/gi, 'db');
  result = result.replace(/eb/gi, 'eb');
  result = result.replace(/fb/gi, 'fb');
  result = result.replace(/gb/gi, 'gb');
  result = result.replace(/ab/gi, 'ab');
  result = result.replace(/bb/gi, 'bb');
  
  // Notas en inglés con sostenidos
  result = result.replace(/c♯/gi, 'c#');
  result = result.replace(/d♯/gi, 'd#');
  result = result.replace(/e♯/gi, 'e#');
  result = result.replace(/f♯/gi, 'f#');
  result = result.replace(/g♯/gi, 'g#');
  result = result.replace(/a♯/gi, 'a#');
  result = result.replace(/b♯/gi, 'b#');
  
  // Quitar espacios
  result = result.replace(/\s+/g, '');
  
  return result;
}

function busquedaInversa(query) {
  // Asegurar que TRIADAS_INDEX está construido
  if (typeof TRIADAS_INDEX !== 'undefined' && Object.keys(TRIADAS_INDEX).length === 0) {
    buildTriadasIndex();
  }
  _buildABIndexes();

  const isEN = window._lang === 'en';
  const qn = normalizeText(query);
  const resultados = [];
  const seen = new Set();

  // ── A) ¿Busca una tríada clínica? ──
  // Formas aceptadas: "triada 4 fa", "triada 4 de fa", "triad 4 of fa", "tríada 3 (la)", "triada 3 la", "3 la"
  // También con sostenidos/bemoles: "triada 4 fa#", "triada 4 fa♯", "triada 4 sib", "triada 4 mib", "triada 3 re#"
  const triadaRe = /(?:tri[aá]da|triad\s*)?(\d)\s*(?:de\s+|of\s+|[\s\-\(])?\s*((?:do|re|mi|fa|sol|la|si|c|d|e|f|g|a|b)[♯♭#b]*)/i;
  const triadaMatch = qn.match(triadaRe);
  const triadaNum = triadaMatch ? triadaMatch[1] : null;
  const triadaNotaRaw = triadaMatch && triadaMatch[2] ? triadaMatch[2].trim() : null;
  const triadaNota = triadaNotaRaw ? normalizeNotaMusical(triadaNotaRaw) : null;
  const isTriada = triadaNum !== null && /(?:tri[aá]da|triad|\d)/i.test(qn);

  // ── B) ¿Busca módulo? ──
  const moduloRe = /^(tonificar|dispersar|tonify|disperse)\s+(.+)$/i;
  const moduloMatch = qn.match(moduloRe);
  const isModulo = moduloMatch !== null;

  // ── C) ¿Busca una escala? ──
  const escalaRe = /^((?:do|re|mi|fa|sol|la|si|c|d|e|f|g|a|b)[♯♭#b]*)\s+(mayor|major)$/i;
  const escalaRawMatch = query.trim().match(escalaRe);
  const isEscala = escalaRawMatch !== null;
  let escalaBuscada = '';
  if (isEscala) {
    escalaBuscada = normalizeNotaMusical(normalizeText(escalaRawMatch[1]));
  }

  if (!isTriada && !isModulo && !isEscala) return null;

  // ── Búsqueda por TRÍADA ──
  if (isTriada) {
    // DEBUG: Log para verificar la búsqueda
    console.log('Buscando tríada:', { triadaNum, triadaNota, triadaNotaRaw });
    
    // Buscar en TRIADAS_INDEX (fuente principal: tiene las 60 tríadas)
    if (typeof TRIADAS_INDEX !== 'undefined') {
      Object.values(TRIADAS_INDEX).forEach(triadaEntry => {
        if (!triadaEntry || !triadaEntry.signature) return;
        
        // Extraer número y nota de la signature
        const sigMatch = triadaEntry.signature.match(/Tríada\s+(\d+)\s*\(([^)]+)\)/i);
        if (!sigMatch) return;
        
        const sigNum = sigMatch[1];
        const sigNotaRaw = sigMatch[2].trim();
        const sigNota = normalizeNotaMusical(normalizeText(sigNotaRaw));
        
        // DEBUG: Log para verificar la comparación
        if (sigNum === triadaNum) {
          console.log('Comparando:', { sigNum, sigNotaRaw, sigNota, triadaNota, match: sigNota.includes(triadaNota) });
        }
        
        // Verificar número
        if (sigNum !== triadaNum) return;
        
        // Verificar nota si se especificó
        if (triadaNota && !sigNota.includes(triadaNota)) return;
        
        // Buscar en APPENDIX_B qué patologías usan esta tríada
        const triadaSig = triadaEntry.signature;
        const abEntries = (APPENDIX_B || []).filter(e => 
          (e.triadas || []).some(t => t.startsWith(triadaSig))
        );
        
        if (abEntries.length > 0) {
          abEntries.forEach(entry => {
            if (seen.has(entry.name)) return;
            seen.add(entry.name);
            const triadaStr = entry.triadas.find(t => t.startsWith(triadaSig));
            resultados.push(_entryToResultado(entry, triadaStr, null, null));
          });
        } else {
          // Tríada existe en TRIADAS_DETALLE pero no se usa en APPENDIX_B
          // Crear resultado sintético mostrando info de la tríada
          const syntheticSindrome = triadaEntry.signature;
          if (seen.has(syntheticSindrome)) return;
          seen.add(syntheticSindrome);
          
          const trat = {
            sindrome: syntheticSindrome,
            patron: 'mixto',
            modulos: [],
            triadas: [triadaEntry.signature],
            escalasExtraord: [],
          };
          
          resultados.push({
            sindrome: syntheticSindrome,
            trat,
            matchTriada: triadaEntry.signature,
            matchEscala: null,
            matchModulo: null,
            score: 3,
          });
        }
      });
    }

    // Fallback: PATRONES_MTC (buscar síndromes que usen esta tríada)
    Object.entries(PATRONES_MTC).forEach(([sindrome]) => {
      if (seen.has(sindrome)) return;
      const trat = inferirTratamiento(sindrome);
      let matchTriada = null;
      for (const tri of trat.triadas) {
        const triMatch = tri.match(/Tríada\s+(\d+)\s*\(([^)]+)\)/i);
        if (!triMatch) continue;
        const triNum = triMatch[1];
        const triNota = normalizeNotaMusical(normalizeText(triMatch[2].trim()));
        
        if (triNum !== triadaNum) continue;
        if (triadaNota && !triNota.includes(triadaNota)) continue;
        
        matchTriada = tri;
        break;
      }
      if (!matchTriada) return;
      seen.add(sindrome);
      resultados.push({ sindrome, trat, matchTriada, matchEscala: null, matchModulo: null, score: 3 });
    });
  }

  // ── Búsqueda por ESCALA (pentatónica o extraordinaria) ──
  if (isEscala) {
    // Buscar en el índice por la clave normalizada
    // Intentar match parcial o exacto
    Object.entries(_ABEscalaIndex).forEach(([key, hits]) => {
      const keyClean = key.replace(/\s+mayor$/,'').trim();
      const queryClean = escalaBuscada.replace(/\s+mayor$/,'').trim();
      if (!keyClean.includes(queryClean) && !queryClean.includes(keyClean)) return;
      hits.forEach(({ entry, escala, modulo }) => {
        if (seen.has(entry.name + '|escala')) return;
        seen.add(entry.name + '|escala');
        // Si ya está como tríada, añadir la escala al resultado existente
        const existing = resultados.find(r => r.sindrome === entry.name);
        if (existing) {
          existing.matchEscala = escala;
          existing.score += 2;
        } else {
          resultados.push(_entryToResultado(entry, null, escala, modulo));
        }
      });
    });
  }

  // ── Búsqueda por MÓDULO ──
  if (isModulo) {
    const accionBuscada = normalizeText(moduloMatch[1]);
    const organoBuscado = normalizeText(moduloMatch[2]);
    (APPENDIX_B || []).forEach(entry => {
      if (seen.has(entry.name + '|mod')) return;
      const matchMod = (entry.modulos || []).find(mod => {
        const mn = normalizeText(mod);
        return mn.includes(accionBuscada) && mn.includes(organoBuscado);
      });
      if (!matchMod) return;
      seen.add(entry.name + '|mod');
      const existing = resultados.find(r => r.sindrome === entry.name);
      if (existing) {
        if (!existing.matchModulo) {
          const idx = (typeof ORGANOS !== 'undefined')
            ? ORGANOS.findIndex(o => o && o.nombre === matchMod.replace(/^(Tonificar|Dispersar)\s+/i,'').trim())
            : -1;
          existing.matchModulo = { idx, accion: /^tonificar/i.test(matchMod) ? 'tonificar' : 'dispersar', label: matchMod };
          existing.score += 2;
        }
      } else {
        resultados.push(_entryToResultado(entry, null, null, matchMod));
      }
    });

    // Fallback PATRONES_MTC para módulos
    Object.entries(PATRONES_MTC).forEach(([sindrome]) => {
      if (seen.has(sindrome + '|mod')) return;
      const trat = inferirTratamiento(sindrome);
      const matchModulo = trat.modulos.find(m => {
        const mn = normalizeText(m.label);
        return mn.includes(accionBuscada) && mn.includes(organoBuscado);
      });
      if (!matchModulo) return;
      seen.add(sindrome + '|mod');
      const existing = resultados.find(r => r.sindrome === sindrome);
      if (existing) {
        if (!existing.matchModulo) { existing.matchModulo = matchModulo; existing.score += 2; }
      } else {
        resultados.push({ sindrome, trat, matchTriada: null, matchEscala: null, matchModulo, score: 2 });
      }
    });
  }

  resultados.sort((a, b) => b.score - a.score);
  return resultados.length ? resultados : null;
}

function renderBusquedaInversa(resultados, query) {
  if (!resultados || !resultados.length) return '';
  const isEN = window._lang === 'en';
  const titulo = isEN
    ? `Syndromes that use: <em>${query}</em>`
    : `Síndromes que usan: <em>${query}</em>`;

  const L = isEN ? {
    patronTon: 'Deficiency → Tonify',
    patronDisp: 'Excess → Disperse',
    patronMix: 'Mixed Pattern',
    patologias: 'PATHOLOGIES: ',
    sindromeMTC: 'TCM SYNDROME',
    parametro: 'SEARCHED PARAMETER',
    triadasClin: 'CLINICAL TRIADS OF SYNDROME',
    modulos: 'PENTATONIC MODULES',
    verDetalle: '▸ view detail',
    verEnOrgano: '▸ view in organ',
    sinTriada: 'No specific triad',
    sinModulo: 'No direct module',
    escalaExtra: '(extraordinary scale)',
    tr: 'Triad',
    esc: 'Scale',
    mod: 'Module',
  } : {
    patronTon: 'Deficiencia → Tonificar',
    patronDisp: 'Exceso → Dispersar',
    patronMix: 'Patrón Mixto',
    patologias: 'PATOLOGÍAS: ',
    sindromeMTC: 'SÍNDROME MTC',
    parametro: 'PARÁMETRO BUSCADO',
    triadasClin: 'TRÍADAS CLÍNICAS DEL SÍNDROME',
    modulos: 'MÓDULOS PENTATÓNICOS',
    verDetalle: '▸ ver detalle',
    verEnOrgano: '▸ ver en órgano',
    sinTriada: 'Sin tríada específica',
    sinModulo: 'Sin módulo directo',
    escalaExtra: '(escala extraordinaria)',
    tr: 'Tríada',
    esc: 'Escala',
    mod: 'Módulo',
  };

  const items = resultados.slice(0, 20).map((r, i) => {
    const id = `inv-res-${i}`;
    const t = r.trat;
    const patronLabel = t.patron === 'tonificar' ? L.patronTon :
                        t.patron === 'dispersar'  ? L.patronDisp    : L.patronMix;
    const patronClass = t.patron;

    // Traducir contenido si es EN
    const sindromeDisplay = isEN ? translateSindrome(r.sindrome) : r.sindrome;
    const modulosDisplay = isEN ? t.modulos.map(m => ({...m, label: translateModulo(m.label)})) : t.modulos;
    const escalasDisplay = isEN ? t.escalasExtraord.map(e => translateModulo(e)) : t.escalasExtraord;
    const triadasDisplay = isEN ? t.triadas.map(tri => translateTriada(tri)) : t.triadas;

    // Construir badge de lo que coincidió
    let badgeHTML = '';
    if (r.matchTriada)  badgeHTML += `<span class="rc-tag tonificar" style="font-size:0.62rem;background:var(--vio2,#9b59b6)20;color:var(--vio3,#8e44ad);border-color:var(--vio3,#8e44ad)20">☯ ${isEN ? translateTriada(r.matchTriada) : r.matchTriada}</span>`;
    if (r.matchEscala)  badgeHTML += `<span class="rc-tag dispersar"  style="font-size:0.62rem;margin-left:0.3rem">♪ ${isEN ? translateModulo(r.matchEscala) : r.matchEscala}</span>`;
    if (r.matchModulo)  badgeHTML += `<span class="rc-tag" style="font-size:0.62rem;margin-left:0.3rem">◆ ${isEN ? translateModulo(r.matchModulo.label) : r.matchModulo.label}</span>`;

    // Obtener patologías
    let patologiasHTML = '';
    const ab = (APPENDIX_B||[]).find(e=>e.name===r.sindrome);
    if (ab && ab.sindromes) {
      patologiasHTML = isEN ? translatePatologias(ab.sindromes).slice(0,4).join(' · ') : ab.sindromes.slice(0,4).join(' · ');
    } else {
      const pm = window.PATRONES_MTC && window.PATRONES_MTC[r.sindrome];
      if (pm) {
        patologiasHTML = isEN ? translatePatologias(pm.patologias || []).slice(0,4).join(' · ') : (pm.patologias || []).slice(0,4).join(' · ');
      }
    }

    return `
      <div class="result-card" onclick="toggleResult('${id}',${i})">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:0.5rem">
          <div class="rc-name">${sindromeDisplay}</div>
          <span class="rc-tag ${patronClass}" style="font-size:0.65rem">${patronLabel}</span>
        </div>
        <div style="margin-top:0.35rem;display:flex;flex-wrap:wrap;gap:0.25rem">${badgeHTML}</div>
        <div class="rc-sindromes" style="margin-top:0.3rem">
          <strong style="font-size:0.75rem;font-family:'Cinzel',serif;letter-spacing:0.04em;color:var(--muted)">${L.patologias}</strong>
          ${patologiasHTML}
        </div>
        <div class="rc-modulos" style="margin-top:0.4rem">
          ${modulosDisplay.map(m => `<span class="rc-mod-clickable${essamSearchLocked() ? ' essam-search-locked' : ''}" onclick="event.stopPropagation();${essamSearchOnclick(`goToOrganModule(${m.idx},'${m.accion}')`)}" title="${essamSearchLocked() ? (isEN?'Unlock full version':'Desbloquea la versión completa') : L.verEnOrgano + ' ' + m.accion + ' ' + getNombreOrgano(m.idx)}">${m.label} <span style="opacity:0.55;font-size:0.7rem">${essamSearchLocked() ? '🔒' : '↗'}</span></span>`).join('')}
          ${escalasDisplay.map(e => `<span class="nota-clickable escala-extraord">${e}</span>`).join('')}
        </div>
      </div>
      <div class="result-detail" id="${id}">
        <div class="rd-section">
          <h4>${L.sindromeMTC}</h4>
          <p><strong>${sindromeDisplay}</strong> — <em>${patronLabel}</em></p>
        </div>
        <div class="rd-section">
          <h4>${L.parametro}</h4>
          ${r.matchTriada  ? `<p>☯ ${L.tr}: <strong>${isEN ? translateTriada(r.matchTriada) : r.matchTriada}</strong></p>` : ''}
          ${r.matchEscala  ? `<p>♪ ${L.esc}: <strong>${isEN ? translateModulo(r.matchEscala) : r.matchEscala}</strong></p>` : ''}
          ${r.matchModulo  ? `<p>◆ ${L.mod}: <strong>${isEN ? translateModulo(r.matchModulo.label) : r.matchModulo.label}</strong></p>` : ''}
        </div>
        <div class="rd-section">
          <h4>${L.triadasClin}</h4>
          ${triadasDisplay.length ? triadasDisplay.map(tri => {
            const m = tri.match(/^(Tríada\s+\d+\s*\([^)]+\))/i);
            const sig = m ? m[1] : null;
            const locked = essamSearchLocked();
            const label = locked ? (isEN ? 'Unlock' : 'Desbloquear') : L.verDetalle;
            return sig ? `<p class="rd-triada-clickable${locked ? ' essam-search-locked' : ''}" onclick="event.stopPropagation();${essamSearchOnclick(`showTriadaInfo('${sig.replace(/'/g,"\\'")}')`)}">☯ ${tri} <span style="color:var(--vio3);font-size:0.78rem;margin-left:0.4rem">${locked ? '🔒 ' : ''}${label}</span></p>` : `<p>☯ ${tri}</p>`;
          }).join('') : `<p><em>${L.sinTriada}</em></p>`}
        </div>
        <div class="rd-section">
          <h4>${L.modulos}</h4>
          ${modulosDisplay.length ? modulosDisplay.map(m => {
            const locked = essamSearchLocked();
            const label = locked ? (isEN ? 'Unlock' : 'Desbloquear') : L.verEnOrgano;
            return `<p class="rd-mod-clickable${locked ? ' essam-search-locked' : ''}" onclick="event.stopPropagation();${essamSearchOnclick(`goToOrganModule(${m.idx},'${m.accion}')`)}">◆ ${m.label} <span style="color:var(--vio3);font-size:0.78rem;margin-left:0.4rem">${locked ? '🔒 ' : ''}${label}</span></p>`;
          }).join('') : `<p><em>${L.sinModulo}</em></p>`}
          ${escalasDisplay.map(e => `<p>◆ ${e} <span style="color:var(--grn3);font-size:0.78rem;margin-left:0.4rem">${L.escalaExtra}</span></p>`).join('')}
        </div>
      </div>`;
  }).join('');

  return `
    <div class="triadas-matches" style="margin-bottom:0.75rem">
      <div class="tm-label">🔍 ${titulo} — ${resultados.length} ${isEN?'syndrome(s)':'síndrome(s)'}</div>
    </div>
    ${items}`;
}

function performSearch(query) {
  const q = query.trim();
  const results = document.getElementById('searchResults');
  const isEN = window._lang === 'en';

  if (q.length < 2) { results.innerHTML = ''; return; }

  const searchTerms = getSearchTerms(q);

  // ── 0. BÚSQUEDA INVERSA (tríada / escala / módulo) ──
  // Si la query tiene pinta de ser una tríada, escala o módulo, va directo aquí
  const inversaResultados = busquedaInversa(q);
  if (inversaResultados) {
    results.innerHTML = renderBusquedaInversa(inversaResultados, q);
    document.querySelectorAll("#searchResults .rc-modulos .nota-clickable").forEach(function(el){
      var t = el.textContent;
      if(t.indexOf("Extraord.") !== -1) el.classList.add("escala-extraord");
      else if(/Tonificar|Tonify/i.test(t)) el.classList.add("escala-tonificar");
      else if(/Dispersar|Disperse/i.test(t)) el.classList.add("escala-dispersar");
    });
    return;
  }

  // ── 0.5 BÚSQUEDA DIRECTA POR NOTA MUSICAL ──
  // Si el usuario escribe solo una nota (ej: "mib", "fa#", "re♭"), buscar en tríadas
  const notaMatch = q.match(/^((?:do|re|mi|fa|sol|la|si|c|d|e|f|g|a|b)[♯♭#b]*)$/i);
  if (notaMatch) {
    const notaBuscada = normalizeNotaMusical(q);
    const matchingTriadas = Object.values(TRIADAS_INDEX).filter(t => {
      if (!t.tonalidad) return false;
      const notaTriada = normalizeNotaMusical(normalizeText(t.tonalidad));
      return notaTriada === notaBuscada;
    });
    
    if (matchingTriadas.length) {
      const color = CORRESPONDENCIAS.find(x => normalizeNotaMusical(normalizeText(x.nota)) === notaBuscada)?.color || '#A89364';
      results.innerHTML = `
        <div class="triadas-matches">
          <div class="tm-label">✦ ${isEN?'Triads in':'Tríadas en'} ${q} (${matchingTriadas.length}) — ${essamSearchLocked() ? (isEN?'unlock full version to view detail':'desbloquea la versión completa para ver detalle') : (isEN?'click to view detail':'click para ver detalle')}</div>
          <div class="tm-grid">
            ${matchingTriadas.map(t => {
              const safeSig = t.signature.replace(/'/g, "\\'");
              return `<div class="tm-card${essamSearchLocked() ? ' essam-search-locked' : ''}" style="--tm-color:${color}" onclick="${essamSearchOnclick(`showTriadaInfo('${safeSig}')`)}" data-testid="triada-card">
                <div class="tm-sig" style="background:${color};color:${getContrastTextColor(color)};padding:0.3rem 0.6rem;border-radius:4px;margin:-0.2rem -0.3rem 0.3rem -0.3rem">${t.signature}</div>
                <div class="tm-stats">${t.patologias.length} ${isEN?'pathology(ies)':'patología(s)'} · ${t.organos.length} ${isEN?'organ(s)':'órgano(s)'}</div>
                ${essamSearchLockBadge(isEN)}
              </div>`;
            }).join('')}
          </div>
        </div>`;
      return;
    }
  }

  // ── 1. MOTOR DE INFERENCIA (PATRONES_MTC) ──
  const resultadosMTC = motorBusquedaMTC(q);

  // ── 1.5 BÚSQUEDA DIRECTA EN APPENDIX_B (nombre, glosario, síndromes) ──────
  const resultadosAB = (typeof APPENDIX_B !== 'undefined') ? APPENDIX_B.filter(entry => {
    if (matchesSearchTerms(entry.name, searchTerms)) return true;
    const kws = APPENDIX_B_KEYWORDS[entry.name];
    if (kws && kws.some(kw => matchesSearchTerms(kw, searchTerms))) return true;
    if (entry.sindromes && entry.sindromes.some(s => matchesSearchTerms(s, searchTerms))) return true;
    return false;
  }) : [];

  let abHTML = '';
  if (resultadosAB.length) {
    const abLabel = isEN ? 'Clinical Pathologies' : 'Patologías clínicas';
    const catColors = {
      onco:    {bg:'rgba(180,60,60,0.15)',  border:'rgba(180,60,60,0.5)',  label:isEN?'Oncology':'Oncología'},
      neuro:   {bg:'rgba(90,60,180,0.15)', border:'rgba(90,60,180,0.5)', label:isEN?'Neurology':'Neurología'},
      general: {bg:'rgba(60,100,180,0.12)',border:'rgba(60,100,180,0.4)', label:isEN?'General':'General'},
    };
    abHTML = `<div style="margin-bottom:1.5rem">
      <div class="tm-label" style="margin-bottom:0.75rem">🔬 ${abLabel} (${resultadosAB.length})</div>
      ${resultadosAB.map(entry => {
        const cc = catColors[entry.cat] || catColors.general;
        const sinList = (entry.sindromes||[]).map(s=>`<li style="font-size:0.78rem;margin-bottom:0.2rem;color:var(--muted)">${s}</li>`).join('');
        const modText = (entry.modulos||[]).join(' · ');
        const trHTML  = (entry.triadas||[]).map(t=>{
          const s2 = t.replace(/'/g,"\\'");
          const locked = essamSearchLocked();
          return `<span class="nota-clickable rc-modulos${locked ? ' essam-search-locked' : ''}" onclick="${essamSearchOnclick(`showTriadaInfo('${s2}')`)}" style="cursor:pointer;font-size:0.72rem">${locked ? '🔒 ' : ''}${t}</span>`;
        }).join(' ');
        return `<div class="result-card" style="background:${cc.bg};border:1px solid ${cc.border};margin-bottom:0.75rem">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:0.5rem;margin-bottom:0.5rem">
            <div class="rc-name" style="font-size:0.97rem">${entry.name}</div>
            <span style="background:${cc.border};color:#fff;border-radius:4px;font-size:0.62rem;padding:0.15rem 0.45rem;white-space:nowrap">${cc.label}</span>
          </div>
          ${sinList?`<ul style="margin:0 0 0.4rem 1rem;padding:0">${sinList}</ul>`:''}
          ${modText?`<div style="font-size:0.78rem;color:var(--muted);margin-bottom:0.4rem"><strong style="color:var(--fg);font-size:0.72rem">${isEN?'MODULES':'MÓDULOS'}:</strong> ${modText}</div>`:''}
          ${trHTML?`<div class="rc-modulos" style="display:flex;flex-wrap:wrap;gap:0.3rem;margin-top:0.3rem">${trHTML}</div>`:''}
        </div>`;
      }).join('')}
    </div>`;
  }

  // ── 2. BÚSQUEDA LEGACY EN APPENDIX_B (fallback + tríadas) ──
  let triadasPanel = '';
  if (typeof TRIADAS_INDEX !== 'undefined' && Object.keys(TRIADAS_INDEX).length) {
    const matching = Object.values(TRIADAS_INDEX).filter(t => {
      if (matchesSearchTerms(t.signature, searchTerms)) return true;
      if (t.tonalidad && normalizeText(t.tonalidad) === normalizeText(q)) return true;
      for (const d of t.descripciones) if (matchesSearchTerms(d, searchTerms)) return true;
      return false;
    });
    if (matching.length) {
      triadasPanel = `
        <div class="triadas-matches">
          <div class="tm-label">✦ ${isEN?'Related Triads':'Tríadas clínicas relacionadas'} (${matching.length}) — ${essamSearchLocked() ? (isEN?'unlock full version to view detail':'desbloquea la versión completa para ver detalle') : (isEN?'click to view detail':'click para ver detalle')}</div>
          <div class="tm-grid">
            ${matching.map(t => {
              const c = typeof CORRESPONDENCIAS !== 'undefined' ? CORRESPONDENCIAS.find(x => x.nota === t.tonalidad) : null;
              const color = c ? c.color : '#A89364';
              const safeSig = t.signature.replace(/'/g, "\\'");
              return `<div class="tm-card${essamSearchLocked() ? ' essam-search-locked' : ''}" style="--tm-color:${color}" onclick="${essamSearchOnclick(`showTriadaInfo('${safeSig}')`)}" data-testid="triada-card">
                <div class="tm-sig" style="background:${color};color:${getContrastTextColor(color)};padding:0.3rem 0.6rem;border-radius:4px;margin:-0.2rem -0.3rem 0.3rem -0.3rem">${t.signature}</div>
                <div class="tm-stats">${t.patologias.length} ${isEN?'pathology(ies)':'patología(s)'} · ${t.organos.length} ${isEN?'organ(s)':'órgano(s)'}</div>
                ${essamSearchLockBadge(isEN)}
              </div>`;
            }).join('')}
          </div>
        </div>`;
    }
  }

  // ── 3. RENDER COMBINADO ──
  if (!resultadosMTC.length && !triadasPanel && !resultadosAB.length) {
    results.innerHTML = `<div class="no-results">${isEN?'No results for "':'No se encontraron resultados para "'}${query}"</div>`;
    return;
  }

  const mtcHTML = renderResultadosMTC(resultadosMTC, q);
  results.innerHTML = abHTML + triadasPanel + mtcHTML;

  // Colorear escalas
  document.querySelectorAll("#searchResults .rc-modulos .nota-clickable").forEach(function(el){
    var t = el.textContent;
    if(t.indexOf("Extraord.") !== -1) el.classList.add("escala-extraord");
    else if(/Tonificar|Tonify/i.test(t)) el.classList.add("escala-tonificar");
    else if(/Dispersar|Disperse/i.test(t)) el.classList.add("escala-dispersar");
  });
}

function moduloToOrgan(label) {
  if (!label) return null;
  const m = label.match(/^(Tonificar|Dispersar|Tonify|Disperse)\s+(.+?)(?:\s+\(.+\))?$/i);
  if (!m) return null;
  const accionRaw = m[1].toLowerCase();
  const accion = (accionRaw === 'tonify') ? 'tonificar' : (accionRaw === 'disperse') ? 'dispersar' : accionRaw;
  let target = m[2].trim()
    .replace(/\s+con moxa.*/i,'')
    .replace(/\s+with moxa.*/i,'')
    .replace(/\s+\(.*\)$/,'')
    .replace(/\s+—.*$/,'');
  // Special name normalization (ES + EN)
  const aliases = {
    // Spanish
    'VB':'Vesícula Biliar', 'IG':'Intestino Grueso', 'ID':'Intestino Delgado',
    'XB':'Xin Bao', 'SJ':'San Jiao', 'Pulmon':'Pulmón', 'Estomago':'Estómago',
    'Higado':'Hígado','Corazon':'Corazón','Rinon':'Riñón',
    // English
    'Lung':'Pulmón', 'Large Intestine':'Intestino Grueso', 'Stomach':'Estómago',
    'Spleen':'Bazo-Páncreas', 'Spleen-Pancreas':'Bazo-Páncreas', 'Heart':'Corazón',
    'Small Intestine':'Intestino Delgado', 'Bladder':'Vejiga', 'Kidney':'Riñón',
    'Xin Bao':'Xin Bao (Maestro de Corazón)', 'Pericardium':'Xin Bao (Maestro de Corazón)',
    'San Jiao':'San Jiao (Triple Recalentador)', 'Triple Warmer':'San Jiao (Triple Recalentador)',
    'Gallbladder':'Vesícula Biliar', 'Liver':'Hígado',
  };
  if (aliases[target]) target = aliases[target];
  const idx = ORGANOS.findIndex(o => o.nombre === target || o.nombre.startsWith(target+' '));
  if (idx < 0) return null;
  return {idx, accion};
}

function goToOrganModule(idx, accion) {
  showSection('organos');
  setTimeout(() => {
    selectOrgano(idx);
    setTimeout(() => {
      const panel = document.getElementById('organ-'+idx);
      if (!panel) return;
      const box = panel.querySelector('.modulo-box.'+accion);
      if (box) {
        box.scrollIntoView({behavior:'smooth', block:'center'});
        box.style.transition = 'box-shadow 0.4s, transform 0.4s';
        box.style.boxShadow = '0 0 0 3px var(--gold2), 0 0 30px var(--gold2)';
        box.style.transform = 'scale(1.02)';
        setTimeout(() => { box.style.boxShadow = ''; box.style.transform = ''; }, 2200);
      }
    }, 150);
  }, 100);
}

function toggleResult(id, idx) {
  const el = document.getElementById(id);
  const wasOpen = el.classList.contains('open');
  document.querySelectorAll('.result-detail').forEach(d => d.classList.remove('open'));
  if (!wasOpen) el.classList.add('open');
}