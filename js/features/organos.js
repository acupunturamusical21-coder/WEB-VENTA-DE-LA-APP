// Auto-extraído del monolito index.html — módulo de funcionalidad
// (sin cambios de contenido; solo separado en archivo)

// Recuadro TONIFICAR/DISPERSAR: contenido completo si es premium,
// candado con teaser si no lo es (pero se ve que existe el módulo).
function essamModuloBoxHtml(o, i, accion, isEN) {
  const m = o[accion];
  const isTonif = accion === 'tonificar';
  const title = isTonif ? (isEN ? 'TONIFY' : 'TONIFICAR') : (isEN ? 'DISPERSE' : 'DISPERSAR');
  const arrow = isTonif ? '▲' : '▼';

  if (typeof essamIsPremium === 'function' && !essamIsPremium()) {
    return `
    <div class="modulo-box ${accion} essam-inline-lock" onclick="essamGoPremium()" title="${isEN?'Premium content':'Contenido premium'}">
      <div class="mb-title">${arrow} ${title}</div>
      <div class="essam-inline-lock-badge">🔒 ${isEN ? 'Unlock full protocol' : 'Desbloquear protocolo completo'}</div>
    </div>`;
  }

  return `
    <div class="modulo-box ${accion}" onclick="goToModuleChapter(${i},'${accion}')" style="cursor:pointer" title="Ver explicación en el Libro">
      <div class="mb-title">${arrow} ${title} <span style="font-size:0.7rem;opacity:0.7;float:right">📖 ${isEN?'see chapter':'ver capítulo'}</span></div>
      <div class="mb-escala">${isEN?'Scale:':'Escala:'} <button class="play-scale-inline" onclick="event.stopPropagation();playScaleProgression(rootFromEscala('${m.escala}'),this)" title="♪ Escuchar escala">▶</button>${isEN?escalaToEn(m.escala):m.escala}</div>
      <div class="mb-puntos">${isEN?'Shu Points:':'Puntos Shu:'}<br>${m.puntos.map(p=>`<span class="punto-tag">${p}</span>`).join(' ')}</div>
      ${m.orden ? `<div class="mb-orden" onclick="event.stopPropagation()" style="margin-top:0.55rem;padding-top:0.45rem;border-top:1px dashed rgba(255,255,255,0.12);font-size:0.78rem;color:var(--muted);line-height:1.9"><span style="font-size:0.72rem;letter-spacing:0.08em;opacity:0.65;display:block;margin-bottom:0.25rem">⇢ ${isEN?'Suggested needling order (Yang→Yin)':'Sugerencia de orden de puntura (Yang→Yin)'}</span>${m.orden.split(' → ').map(p=>`<span class="punto-tag" style="opacity:0.9">${p}</span>`).join(' <span style="color:var(--muted);font-size:0.8rem">→</span> ')}</div>` : ''}
    </div>`;
}

function buildOrganos() {
  const tabs = document.getElementById('organTabs');
  const panels = document.getElementById('organPanels');
  const isEN = window._lang === 'en';
  const isPremium = typeof essamIsPremium === 'function' && essamIsPremium();
  // Demo (no premium): solo 1 órgano de muestra, no los 12.
  const organosAMostrar = isPremium ? ORGANOS : ORGANOS.slice(0, 1);

  const elementColor = {
    'Madera':'var(--madera)','Fuego':'var(--fuego)',
    'Tierra':'var(--tierra)','Metal':'var(--metal)','Agua':'var(--agua)'
  };

  function darkForParchment(hex) {
    const r=parseInt(hex.slice(1,3),16), g=parseInt(hex.slice(3,5),16), b=parseInt(hex.slice(5,7),16);
    const lum=(0.299*r+0.587*g+0.114*b)/255;
    if(lum<0.45) return hex;
    const f=0.45/lum;
    return '#'+[r,g,b].map(c=>Math.round(c*f).toString(16).padStart(2,'0')).join('');
  }

  tabs.innerHTML = organosAMostrar.map((o, i) => {
    const nombre = isEN ? (o.nombre_en || o.nombre) : o.nombre;
    return `
    <button class="otab ${i===0?'active':''}" onclick="selectOrgano(${i})" style="--org-color:${o.color};border-color:${o.color}66"><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${o.color};margin-right:0.4rem;vertical-align:middle;box-shadow:0 0 8px ${o.color}88"></span>${nombre}</button>
  `}).join('') + (isPremium ? '' : `<button class="otab" onclick="essamGoPremium()" style="opacity:0.7">🔒 +11 ${isEN?'more':'más'}</button>`);
  
  panels.innerHTML = organosAMostrar.map((o, i) => {
    const elColor = elementColor[o.elemento] || 'var(--vio3)';
    return `
    <div class="organ-content ${i===0?'active':''}" id="organ-${i}">
      <div class="organ-header">
        <div class="organ-icon-box" style="background:linear-gradient(135deg,${o.color},${o.color}88);box-shadow:0 0 30px ${o.color}66">${o.emoji}</div>
        <div style="flex:1">
          <div class="organ-title" style="color:${darkForParchment(o.color)};text-shadow:1px 1px 0 rgba(255,240,200,0.5)">${isEN?(o.nombre_en||o.nombre):o.nombre}</div>
          <div style="font-size:1.5rem;color:var(--gold2);margin-bottom:0.1rem;font-family:'Noto Serif SC',serif">${o.chineseName} <span style="font-size:0.9rem;color:var(--muted);font-family:'EB Garamond',serif;font-style:italic">${o.pinyin}</span></div>
          <div class="organ-note">
            ${isEN?'Note:':'Nota:'} <strong class="nota-clickable" style="color:${darkForParchment(o.color)}" onclick="playNoteByName('${o.nota.split('/')[0].trim()}')" title="♪ ${isEN?noteDisplayEn(o.nota):o.nota}">♪ ${isEN?noteDisplayEn(o.nota):o.nota}</strong>
            · ${isEN?'Channel:':'Canal:'} <strong>${o.channelCode}</strong>
            · ${isEN?'Tonal center:':'Tono central:'} <strong class="nota-clickable" style="color:var(--grn3)" onclick="playNoteByName('${o.centerTone}')" title="♪ ${o.centerTone}">♪ ${o.centerTone}</strong>
          </div>
          <div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-top:0.4rem;align-items:center">
            <span style="display:inline-block;padding:0.15rem 0.6rem;border-radius:12px;font-size:0.72rem;font-family:'Cinzel',serif;letter-spacing:0.05em;background:rgba(255,248,220,0.7);border:1px solid ${elColor};color:${elColor}">${isEN?elementoEn(o.elemento):o.elemento}</span>
            <span style="display:inline-block;padding:0.15rem 0.6rem;border-radius:12px;font-size:0.72rem;font-family:'Cinzel',serif;letter-spacing:0.05em;background:rgba(217,119,6,0.1);border:1px solid var(--gold2);color:var(--gold2)">⏱ ${o.circTime}</span>
          </div>
        </div>
      </div>

      <div style="margin-bottom:1rem">
        <p style="font-size:0.85rem;font-family:'Cinzel',serif;letter-spacing:0.06em;color:var(--vio3);margin-bottom:0.3rem">${isEN?'MAIN FUNCTION':'FUNCIÓN PRINCIPAL'}</p>
        <p style="font-size:0.95rem;color:var(--text);line-height:1.7;font-style:italic">${isEN?(o.funcion_en||o.funcion):o.funcion}</p>
      </div>

      <div style="margin-bottom:1rem">
        <p style="font-size:0.85rem;font-family:'Cinzel',serif;letter-spacing:0.06em;color:var(--vio3);margin-bottom:0.3rem">${isEN?'DESCRIPTION':'DESCRIPCIÓN'}</p>
        <p style="font-size:0.9rem;color:var(--muted);line-height:1.7">${isEN?(o.descripcion_en||o.descripcion):o.descripcion}</p>
      </div>

      <div style="margin-bottom:1rem">
        <button onclick="goToOrganInCap17('${o.nombre}')" style="display:inline-flex;align-items:center;gap:0.45rem;background:color-mix(in srgb,${o.color} 10%,var(--bg2));border:1px solid color-mix(in srgb,${o.color} 30%,transparent);border-radius:7px;padding:0.45rem 1rem;font-family:'Cinzel',serif;font-size:0.78rem;color:${darkForParchment(o.color)};cursor:pointer;letter-spacing:0.06em;transition:background 0.18s" onmouseover="this.style.background='color-mix(in srgb,${o.color} 22%,var(--bg2))'" onmouseout="this.style.background='color-mix(in srgb,${o.color} 10%,var(--bg2))'">📖 ${isEN?'Organ Functions (Ch. 17)':'Funciones del órgano (Cap. 17)'}</button>
      </div>

      <div class="emo-grid">
        <div class="emo-box emo-sana">
          <div class="emo-title">${isEN?'☯ HEALTHY EMOTION (balanced Shen)':'☯ EMOCIÓN SANA (Shen equilibrado)'}</div>
          <div class="emo-text">${isEN?(o.emotionalSana_en||o.emotionalSana):o.emotionalSana}</div>
        </div>
        <div class="emo-box emo-patho">
          <div class="emo-title">${isEN?'⚠ PATHOLOGICAL EMOTION (imbalance)':'⚠ EMOCIÓN PATOLÓGICA (desequilibrio)'}</div>
          <div class="emo-text">${isEN?(o.emotionalPatologica_en||o.emotionalPatologica):o.emotionalPatologica}</div>
        </div>
      </div>

      <div style="margin-bottom:1.25rem">
        <p style="font-size:0.8rem;color:var(--muted);font-family:'Cinzel',serif;letter-spacing:0.05em;margin-bottom:0.4rem">${isEN?'ANCIENT SHU POINTS':'PUNTOS SHU ANTIGUOS'}</p>
        <div>${o.pointsShuAncient.map(p=>`<span class="punto-tag" style="border-color:var(--gold2);color:var(--gold3)">${p}</span>`).join(' ')}</div>
      </div>
      
      <div class="modulo-grid">
        ${essamModuloBoxHtml(o, i, 'tonificar', isEN)}
        ${essamModuloBoxHtml(o, i, 'dispersar', isEN)}
      </div>

      <div style="margin-top:1rem;margin-bottom:0.75rem">
        <p style="font-size:0.8rem;color:var(--muted);font-family:'Cinzel',serif;letter-spacing:0.05em;margin-bottom:0.4rem">${isEN?'HARMONIC TRIADS':'TRÍADAS ARMÓNICAS'}</p>
        <div style="display:flex;gap:0.5rem;flex-wrap:wrap">
          ${o.triadas.map(t=>`<span class="nota-clickable" style="display:inline-block;background:rgba(90,90,80,0.12);border:1px solid rgba(110,110,100,0.3);border-radius:4px;padding:0.25rem 0.65rem;font-size:0.82rem;font-family:'Cinzel',serif;color:var(--grn3)" onclick="playChordPiano('${t}')" title="♪ Escuchar acorde ${t}">♩ ${t}</span>`).join('')}
        </div>
      </div>
      
      <div style="margin-top:0.75rem">
        <button onclick="showTriadasDeNota('${o.nota}')" style="background:color-mix(in srgb,${o.color} 12%,var(--bg2));border:1px solid color-mix(in srgb,${o.color} 35%,transparent);border-radius:6px;padding:0.45rem 1rem;font-family:'Cinzel',serif;font-size:0.8rem;color:${o.color};cursor:pointer;letter-spacing:0.06em;width:100%;text-align:left;transition:background 0.18s" onmouseover="this.style.background='color-mix(in srgb,${o.color} 22%,var(--bg2))'" onmouseout="this.style.background='color-mix(in srgb,${o.color} 12%,var(--bg2))'">☯ ${isEN?'See Clinical Triads for':'Ver Tríadas Clínicas de'} ${isEN?noteDisplayEn(o.nota):o.nota} ▸</button>
      </div>
    </div>
  `}).join('') + (isPremium ? '' : essamDemoBannerHtml(11, 'organos'));
}

function selectOrgano(i) {
  document.querySelectorAll('.otab').forEach((t,j)=>t.classList.toggle('active',j===i));
  document.querySelectorAll('.organ-content').forEach((p,j)=>p.classList.toggle('active',j===i));
}