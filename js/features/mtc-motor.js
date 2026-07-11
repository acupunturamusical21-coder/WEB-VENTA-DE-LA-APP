// Auto-extraído del monolito index.html — módulo de funcionalidad
// (sin cambios de contenido; solo separado en archivo)

function clasificarPatron(sindrome) {
  const s = (sindrome || '').toLowerCase();
  if (/deficiencia|deficiente|insuficiencia|agotamiento|debilidad|deficiency|exhaustion|weakness|insufficiency/.test(s)) return 'tonificar';
  if (/estancamiento|estasis|calor|fuego|flema|humedad|viento|fr[ií]o|toxina|ascenso|exceso|obstrucci|bloqueo|hiper|colapso|stagnation|stasis|heat|fire|phlegm|damp|wind|cold|toxin|rising|excess|obstruct|block|hyper|collapse/.test(s)) return 'dispersar';
  return 'tonificar';
}

function extraerOrganosSindrome(sindrome) {
  const s = (sindrome || '').toLowerCase();
  const organos = [];
  const patterns = [
    { key:'bazo', re:/bazo|pancreas|spleen|pancrea/ },
    { key:'estomago', re:/estomago|gastr|stomach/ },
    { key:'pulmon', re:/pulmon|respir|lung/ },
    { key:'corazon', re:/corazon|cardi|heart/ },
    { key:'rinon', re:/ri[nñ]on|renal|kidney/ },
    { key:'higado', re:/h[ií]gado|hepat|liver/ },
    { key:'vesicula', re:/ves[ií]cula|vb|gallbladder/ },
    { key:'intestino grueso', re:/intestino grueso|colon|large intestine/ },
    { key:'intestino delgado', re:/intestino delgado|small intestine/ },
    { key:'vejiga', re:/vejiga|vesical|bladder/ },
    { key:'xin bao', re:/xin\s*bao|maestro\s*corazon|pericard/ },
    { key:'san jiao', re:/san\s*jiao|triple\s*calentador|triple\s*warmer/ },
  ];
  patterns.forEach(p => { if (p.re.test(s)) organos.push(p.key); });
  return organos;
}

function inferirTratamiento(sindromeNombre) {
  const sNorm = normalizeText(sindromeNombre);
  const patron = clasificarPatron(sindromeNombre);

  // Capa 2 (iter-3: ahora primaria/autoritativa): buscar en SINDROME_MODULO_MAP
  // Cubre los 55 síndromes con mapeo explícito de órganos primarios + secundarios
  let modulos = [];
  const mapKeys = Object.keys(SINDROME_MODULO_MAP).sort((a, b) => b.length - a.length);
  for (const key of mapKeys) {
    if (sNorm.includes(normalizeText(key))) {
      modulos = SINDROME_MODULO_MAP[key].map(m => ({
        idx: m.idx,
        accion: m.accion,
        label: `${m.accion === 'tonificar' ? 'Tonificar' : 'Dispersar'} ${getNombreOrgano(m.idx)}`
      }));
      break;
    }
  }

  // Capa 1 (fallback): extraer órganos del nombre si no está en SINDROME_MODULO_MAP
  if (modulos.length === 0) {
    const organosKeys = extraerOrganosSindrome(sindromeNombre);
    const accion = patron;
    modulos = organosKeys.map(key => {
      const idx = SINDROME_ORGANO_MAP[key];
      if (idx === undefined) return null;
      return { idx, accion, label: `${accion === 'tonificar' ? 'Tonificar' : 'Dispersar'} ${getNombreOrgano(idx)}` };
    }).filter(Boolean);
  }
  
  // Tríadas
  const triadas = new Set();
  const triKeys = Object.keys(TRIADAS_BY_PATTERN).sort((a, b) => b.length - a.length);
  for (const key of triKeys) {
    if (sNorm.includes(normalizeText(key))) {
      TRIADAS_BY_PATTERN[key].forEach(t => triadas.add(t));
      if (triadas.size >= 3) break;
    }
  }
  if (triadas.size === 0) {
    if (/deficiencia/.test(sNorm)) triadas.add('Tríada 1 (Si♭): Deficiencia triple raíz');
    if (/estancamiento|estasis/.test(sNorm)) triadas.add('Tríada 3 (Re♭): Eje estrés crónico');
    if (/calor|fuego/.test(sNorm)) triadas.add('Tríada 3 (Mi♭): Calor con múltiples salidas');
    if (/flema|humedad/.test(sNorm)) triadas.add('Tríada 5 (Re♭): Humedad por sobrecarga mental');
    if (/viento/.test(sNorm)) triadas.add('Tríada 4 (Re♭): Dolor muscular generalizado');
  }
  
  // Escalas extraordinarias
  const escalas = new Set();
  const escKeys = Object.keys(ESCALAS_EXTRAORD_BY_PATTERN).sort((a, b) => b.length - a.length);
  for (const key of escKeys) {
    if (sNorm.includes(normalizeText(key))) {
      ESCALAS_EXTRAORD_BY_PATTERN[key].forEach(e => escalas.add(e));
      if (escalas.size >= 2) break;
    }
  }
  
  return { sindrome: sindromeNombre, patron, modulos, triadas: Array.from(triadas).slice(0,4), escalasExtraord: Array.from(escalas).slice(0,2) };
}

function getNombreOrgano(idx) {
  const isEN = window._lang === 'en';
  if (isEN) return getNombreOrganoEN(idx);
  if (typeof ORGANOS !== 'undefined' && ORGANOS[idx]) return ORGANOS[idx].nombre;
  const n = {0:'Pulmón',1:'Intestino Grueso',2:'Estómago',3:'Bazo-Páncreas',4:'Corazón',5:'Intestino Delgado',6:'Vejiga',7:'Riñón',8:'Xin Bao',9:'San Jiao',10:'Vesícula Biliar',11:'Hígado'};
  return n[idx] || '';
}

function motorBusquedaMTC(query) {
  if (!query || query.trim().length < 2 || typeof PATRONES_MTC === 'undefined') return [];
  const isEN = window._lang === 'en';
  const resultados = [];
  const searchTerms = getSearchTerms(query);

  // Build reverse lookup: EN term -> ES syndrome key
  const enToEsSindrome = {};
  Object.entries(SINDROME_ES_EN).forEach(([es, en]) => {
    enToEsSindrome[en.toLowerCase()] = es;
  });

  Object.entries(PATRONES_MTC).forEach(([sindrome, data]) => {
    let score = 0, matchedSintomas = [], matchedPatologias = [];

    data.sintomas.forEach(s => {
      if (matchesSearchTerms(s, searchTerms)) { score += 2; matchedSintomas.push(s); }
      // Also try matching translated symptom against query
      if (isEN && !matchedSintomas.includes(s)) {
        const sEn = translateTerm(s);
        if (matchesSearchTerms(sEn, searchTerms)) { score += 2; matchedSintomas.push(s); }
      }
    });
    data.patologias.forEach(p => {
      if (matchesSearchTerms(p, searchTerms)) { score += 3; matchedPatologias.push(p); }
      if (isEN && !matchedPatologias.includes(p)) {
        const pEn = translateTerm(p);
        if (matchesSearchTerms(pEn, searchTerms)) { score += 3; matchedPatologias.push(p); }
      }
    });
    // Match syndrome name (ES or EN)
    if (matchesSearchTerms(sindrome, searchTerms)) score += 5;
    if (isEN) {
      const sindromeEn = translateSindrome(sindrome);
      if (matchesSearchTerms(sindromeEn, searchTerms)) score += 5;
    }

    if (score > 0) {
      resultados.push({
        sindrome, score,
        patologias: matchedPatologias.length ? matchedPatologias : data.patologias.slice(0,5),
        sintomas: matchedSintomas.length ? matchedSintomas : data.sintomas.slice(0,5),
        tratamiento: inferirTratamiento(sindrome),
      });
    }
  });

  resultados.sort((a, b) => b.score - a.score);
  return resultados.slice(0, 25);
}

function renderResultadosMTC(resultados, query) {
  if (!resultados.length) return '';
  const isEN = window._lang === 'en';
  const accentRx = query.length >= 2 ? buildAccentRegex(query) : null;
  const hl = (text) => { if (!accentRx) return text; accentRx.lastIndex = 0; return text.replace(accentRx, m => `<mark>${m}</mark>`); };
  
  // Bilingual labels
  const L = isEN ? {
    patronTon: 'Deficiency → Tonify',
    patronDisp: 'Excess → Disperse',
    patronMix: 'Mixed Pattern',
    patologias: 'PATHOLOGIES: ',
    sintomas: 'SYMPTOMS: ',
    sindromeMTC: 'TCM SYNDROME',
    patologiasAsoc: 'ASSOCIATED PATHOLOGIES',
    sintomasClin: 'CLINICAL SYMPTOMS',
    modulosTrat: 'PENTATONIC TREATMENT MODULES',
    triadasRec: 'RECOMMENDED CLINICAL TRIADS',
    verEnOrgano: '▸ view in organ',
    sinModulo: 'No direct module — use extraordinary scale',
    sinTriada: 'No specific triad — navigate by module',
    escalaExtra: '(extraordinary scale)',
    verDetalle: '▸ view detail',
    irA: 'Go to',
  } : {
    patronTon: 'Deficiencia → Tonificar',
    patronDisp: 'Exceso → Dispersar',
    patronMix: 'Patrón Mixto',
    patologias: 'PATOLOGÍAS: ',
    sintomas: 'SÍNTOMAS: ',
    sindromeMTC: 'SÍNDROME MTC',
    patologiasAsoc: 'PATOLOGÍAS ASOCIADAS',
    sintomasClin: 'SÍNTOMAS CLÍNICOS',
    modulosTrat: 'MÓDULOS PENTATÓNICOS DE TRATAMIENTO',
    triadasRec: 'TRÍADAS CLÍNICAS RECOMENDADAS',
    verEnOrgano: '▸ ver en órgano',
    sinModulo: 'Sin módulo directo — usar escala extraordinaria',
    sinTriada: 'Sin tríada específica — navegar por módulo',
    escalaExtra: '(escala extraordinaria)',
    verDetalle: '▸ ver detalle',
    irA: 'Ir a',
  };

  return resultados.map((r, i) => {
    const id = `mtc-res-${i}`;
    const t = r.tratamiento;
    const patronLabel = t.patron === 'tonificar' ? L.patronTon :
                        t.patron === 'dispersar' ? L.patronDisp : L.patronMix;
    const patronClass = t.patron;
    
    // Translate display content when EN
    const sindromeDisplay = isEN ? translateSindrome(r.sindrome) : r.sindrome;
    const patologiasDisplay = isEN ? translatePatologias(r.patologias) : r.patologias;
    const sintomasDisplay = isEN ? translateSintomas(r.sintomas) : r.sintomas;
    const modulosDisplay = isEN ? t.modulos.map(m => ({...m, label: translateModulo(m.label)})) : t.modulos;
    const escalasDisplay = isEN ? t.escalasExtraord.map(e => translateModulo(e)) : t.escalasExtraord;
    const triadasDisplay = isEN ? t.triadas.map(tri => translateTriada(tri)) : t.triadas;
    
    return `
      <div class="result-card" onclick="toggleResult('${id}', ${i})">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:0.5rem">
          <div class="rc-name">${hl(sindromeDisplay)}</div>
          <span class="rc-tag ${patronClass}" style="font-size:0.65rem">${patronLabel}</span>
        </div>
        <div class="rc-sindromes">
          <strong style="font-size:0.75rem;font-family:'Cinzel',serif;letter-spacing:0.04em;color:var(--muted)">${L.patologias}</strong>
          ${hl(patologiasDisplay.slice(0,4).join(' · '))}
        </div>
        <div class="rc-sindromes" style="margin-top:0.2rem">
          <strong style="font-size:0.75rem;font-family:'Cinzel',serif;letter-spacing:0.04em;color:var(--muted)">${L.sintomas}</strong>
          ${hl(sintomasDisplay.slice(0,6).join(' · '))}
        </div>
        <div class="rc-modulos" style="margin-top:0.4rem">
          ${modulosDisplay.map(m => `<span class="rc-mod-clickable${essamSearchLocked() ? ' essam-search-locked' : ''}" onclick="event.stopPropagation();${essamSearchOnclick(`goToOrganModule(${m.idx},'${m.accion}')`)}" title="${essamSearchLocked() ? (isEN?'Unlock full version':'Desbloquea la versión completa') : L.irA + ' ' + m.accion + ' ' + getNombreOrgano(m.idx)}">${hl(m.label)} <span style="opacity:0.55;font-size:0.7rem">${essamSearchLocked() ? '🔒' : '↗'}</span></span>`).join('')}
          ${escalasDisplay.map(e => `<span class="nota-clickable escala-extraord">${hl(e)}</span>`).join('')}
        </div>
      </div>
      <div class="result-detail" id="${id}">
        <div class="rd-section">
          <h4>${L.sindromeMTC}</h4>
          <p><strong>${sindromeDisplay}</strong> — <em>${patronLabel}</em></p>
        </div>
        <div class="rd-section">
          <h4>${L.patologiasAsoc}</h4>
          ${patologiasDisplay.map(p => `<p>• ${hl(p)}</p>`).join('')}
        </div>
        <div class="rd-section">
          <h4>${L.sintomasClin}</h4>
          ${sintomasDisplay.map(s => `<p>• ${hl(s)}</p>`).join('')}
        </div>
        <div class="rd-section">
          <h4>${L.modulosTrat}</h4>
          ${modulosDisplay.length ? modulosDisplay.map(m => {
            const locked = essamSearchLocked();
            const label = locked ? (isEN ? 'Unlock' : 'Desbloquear') : L.verEnOrgano;
            return `<p class="rd-mod-clickable${locked ? ' essam-search-locked' : ''}" onclick="event.stopPropagation();${essamSearchOnclick(`goToOrganModule(${m.idx},'${m.accion}')`)}">◆ ${m.label} <span style="color:var(--vio3);font-size:0.78rem;margin-left:0.4rem">${locked ? '🔒 ' : ''}${label}</span></p>`;
          }).join('') : `<p><em>${L.sinModulo}</em></p>`}
          ${escalasDisplay.map(e => `<p>◆ ${e} <span style="color:var(--grn3);font-size:0.78rem;margin-left:0.4rem">${L.escalaExtra}</span></p>`).join('')}
        </div>
        <div class="rd-section">
          <h4>${L.triadasRec}</h4>
          ${triadasDisplay.length ? triadasDisplay.map(tri => {
            const m = tri.match(/^(Tríada\s+\d+\s*\([^)]+\))/i);
            const sig = m ? m[1] : null;
            const locked = essamSearchLocked();
            const label = locked ? (isEN ? 'Unlock' : 'Desbloquear') : L.verDetalle;
            return sig ? `<p class="rd-triada-clickable${locked ? ' essam-search-locked' : ''}" onclick="event.stopPropagation();${essamSearchOnclick(`showTriadaInfo('${sig.replace(/'/g, "\\'")}')`)}">☯ ${tri} <span style="color:var(--vio3);font-size:0.78rem;margin-left:0.4rem">${locked ? '🔒 ' : ''}${label}</span></p>` : `<p>☯ ${tri}</p>`;
          }).join('') : `<p><em>${L.sinTriada}</em></p>`}
        </div>
      </div>
    `;
  }).join('');
}