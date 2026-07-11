// Auto-extraído del monolito index.html — módulo de funcionalidad
// (sin cambios de contenido; solo separado en archivo)

const NOTE_SEMI = {'Do':0,'Reb':1,'Re♭':1,'Re':2,'Mib':3,'Mi♭':3,'Mi':4,'Fa':5,'Fa#':6,'Fa♯':6,'Sol':7,'Sol♯':8,'Lab':8,'La♭':8,'La':9,'La♯':10,'Sib':10,'Si♭':10,'Si':11,'Do♯':1,'Re♯':3};

const SEMI_NOTE = ['Do','Re♭','Re','Mi♭','Mi','Fa','Fa♯','Sol','La♭','La','Si♭','Si'];

function buildScalesData() {
  const POS = [{semi:0,el:'Tierra'},{semi:2,el:'Metal'},{semi:4,el:'Madera'},{semi:7,el:'Fuego'},{semi:9,el:'Agua'}];
  const TONIF = {'Tierra':'Metal','Metal':'Agua','Madera':'Fuego','Fuego':'Tierra','Agua':'Madera'};
  const DISP  = {'Tierra':'Fuego','Metal':'Tierra','Madera':'Agua','Fuego':'Madera','Agua':'Metal'};
  const noteToCorr = {};
  CORRESPONDENCIAS.forEach((c,i) => { const s = NOTE_SEMI[c.nota]; if (s !== undefined) noteToCorr[s] = i; });
  const noteToOrgan = {};
  ORGANOS.forEach((o,i) => {
    o.nota.split('/').forEach(n => {
      const s = NOTE_SEMI[n.trim()];
      if (s !== undefined) noteToOrgan[s] = i;
    });
  });
  const scales = [];
  for (const rootName of QUINTAS_ORDER) {
    const root = NOTE_SEMI[rootName];
    const tonifica = [], dispersa = [];
    const notas = POS.map(p => SEMI_NOTE[(root + p.semi) % 12]);
    for (const p of POS) {
      const noteSemi = (root + p.semi) % 12;
      const organIdx = noteToOrgan[noteSemi];
      const corrIdx = noteToCorr[noteSemi];
      if (organIdx === undefined || corrIdx === undefined) continue;
      const o = ORGANOS[organIdx];
      const c = CORRESPONDENCIAS[corrIdx];
      if (o.elemento === TONIF[p.el]) tonifica.push({organIdx, o, color:c.color});
      if (o.elemento === DISP[p.el])  dispersa.push({organIdx, o, color:c.color});
    }
    const corrIdx = noteToCorr[root];
    const color = CORRESPONDENCIAS[corrIdx] ? CORRESPONDENCIAS[corrIdx].color : '#888';
    const isExtra = (rootName==='Fa'||rootName==='Fa♯'||rootName==='Re♭');
    scales.push({rootName, color, notas, tonifica, dispersa, isExtra});
  }
  return scales;
}

function buildEscalas() {
  const scales = buildScalesData();
  const ordinarias = scales.filter(s => !s.isExtra);
  const isEN_ext = window._lang === 'en';
  const isPremium = typeof essamIsPremium === 'function' && essamIsPremium();

  if (!isPremium) {
    // Demo: sin rueda de quintas (revela las 12 de un vistazo) y solo
    // 1 escala ordinaria de muestra, nada de extraordinarias.
    document.getElementById('quintasWrap').innerHTML = essamDemoBannerHtml(11, 'escalas');
    document.getElementById('scalesOrd').innerHTML = scaleCardHtml(ordinarias[0]);
    document.getElementById('scalesExt').innerHTML = essamDemoBannerHtml(3, 'escalas');
    return;
  }

  renderQuintasSvg(scales);
  document.getElementById('scalesOrd').innerHTML = ordinarias.map(s => scaleCardHtml(s)).join('');
  document.getElementById('scalesExt').innerHTML = EXTRA_SCALES.map((es,i) => {
    const c = CORRESPONDENCIAS.find(x => x.nota === es.nota);
    const color = c ? c.color : '#A89364';
    const rootDisplay = isEN_ext ? (LATIN_TO_ANGLO[es.nota] || es.nota) : es.nota;
    const esEN = EXTRA_SCALES_EN[i] || {};
    const notesHtml = es.notas.map(n => {
      const cc = CORRESPONDENCIAS.find(x => x.nota === n);
      const col = cc ? cc.color : '#A89364';
      const nDisp = isEN_ext ? (LATIN_TO_ANGLO[n]||n) : n;
      return `<span class="sc-note-pill" style="background:${col}" onclick="playNoteByName('${n}')" title="\u266a ${nDisp}">${nDisp}</span>`;
    }).join('');
    const puntosHtml = es.puntos.map(p => `<span class="punto-tag">${p}</span>`).join(' ');
    return `
      <div class="scale-card extra" style="--sc-color:${color}" data-testid="scale-extra-${es.nota}">
        <div class="sc-head">
          <div class="sc-name" style="--sc-color:${color}">${rootDisplay} ${isEN_ext?'Major':'Mayor'}</div>
          <div class="sc-sub">${isEN_ext?'Extraordinary · Chap. 17 BIS':'Extraordinaria · Cap. 17 BIS'}</div>
        </div>
        <div style="font-size:0.92rem;color:var(--gold3);font-family:'Cinzel',serif;letter-spacing:0.04em;margin-bottom:0.5rem">${isEN_ext?(esEN.titulo||es.titulo):es.titulo}</div>
        <div class="sc-notes">${notesHtml}</div>
        <div class="sc-extra-text">${isEN_ext?(esEN.texto||es.texto):es.texto}</div>
        <div class="sc-section">
          <div class="sc-label">${isEN_ext?'Module points':'Puntos del módulo'}</div>
          <div>${puntosHtml}</div>
        </div>
        <div class="sc-actions">
          <button class="sc-btn" id="extPlay-${i}" onclick="playExtraScale(${i})" data-testid="play-extra-${i}">${isEN_ext?'▶ Listen to progression':'▶ Escuchar progresión'}</button>
          <button class="sc-btn" onclick="goToChapterById('cap17')" data-testid="extra-chapter-${i}">📖 ${isEN_ext?'Chap.':'Cap.'} 17 BIS</button>
        </div>
      </div>`;
  }).join('');
}

function scaleCardHtml(s) {
  const isEN = window._lang === 'en';
  const rootDisplay = isEN ? (LATIN_TO_ANGLO[s.rootName] || s.rootName) : s.rootName;
  const getNombre = (o) => (isEN ? (o.nombre_en || o.nombre) : o.nombre).replace(/ \(.*\)/,'');
  const notesHtml = s.notas.map(n => {
    const c = CORRESPONDENCIAS.find(x => x.nota === n);
    const col = c ? c.color : '#888';
    return `<span class="sc-note-pill" style="background:${col}">${isEN?(LATIN_TO_ANGLO[n]||n):n}</span>`;
  }).join('');
  const tonifHtml = s.tonifica.length
    ? s.tonifica.map(t => `<span class="sc-organ-chip" onclick="goToOrganModule(${t.organIdx},'tonificar')"><span class="dot" style="background:${t.color}"></span>${getNombre(t.o)}</span>`).join('')
    : '<span style="color:var(--muted);font-style:italic;font-size:0.85rem">—</span>';
  const dispHtml = s.dispersa.length
    ? s.dispersa.map(t => `<span class="sc-organ-chip" onclick="goToOrganModule(${t.organIdx},'dispersar')"><span class="dot" style="background:${t.color}"></span>${getNombre(t.o)}</span>`).join('')
    : '<span style="color:var(--muted);font-style:italic;font-size:0.85rem">—</span>';
  return `
    <div class="scale-card" style="--sc-color:${s.color}" data-testid="scale-${s.rootName}">
      <div class="sc-head">
        <div class="sc-name" style="--sc-color:${s.color}">${rootDisplay} ${isEN?'Major':'Mayor'}</div>
        <div class="sc-sub">${isEN?'Pentatonic':'Pentatónica'}</div>
      </div>
      <div class="sc-notes">${notesHtml}</div>
      <div class="sc-section">
        <div class="sc-label sc-tonif">▲ ${isEN?'TONIFIES':'TONIFICA'}</div>
        <div class="sc-organs">${tonifHtml}</div>
      </div>
      <div class="sc-section">
        <div class="sc-label sc-disp">▼ ${isEN?'DISPERSES':'DISPERSA'}</div>
        <div class="sc-organs">${dispHtml}</div>
      </div>
      <div class="sc-actions">
        <button class="sc-btn" onclick="playScaleProgression('${s.rootName}', this)" data-testid="play-scale-${s.rootName}">${isEN?'▶ Listen to progression':'▶ Escuchar progresión'}</button>
      </div>
    </div>`;
}

function renderQuintasSvg(scales) {
  const isEN = window._lang === 'en';
  const wrap = document.getElementById('quintasWrap');
  if (!wrap) return;
  const cx=190, cy=190, r=160, ir=78;
  const segs = QUINTAS_ORDER.map((note, i) => {
    const s = scales.find(x => x.rootName === note);
    const a1 = (i*30 - 90 - 15) * Math.PI/180;
    const a2 = (i*30 - 90 + 15) * Math.PI/180;
    const x1 = cx + r*Math.cos(a1), y1 = cy + r*Math.sin(a1);
    const x2 = cx + r*Math.cos(a2), y2 = cy + r*Math.sin(a2);
    const x3 = cx + ir*Math.cos(a2), y3 = cy + ir*Math.sin(a2);
    const x4 = cx + ir*Math.cos(a1), y4 = cy + ir*Math.sin(a1);
    const tx = cx + (r-25)*Math.cos((a1+a2)/2);
    const ty = cy + (r-25)*Math.sin((a1+a2)/2) + 5;
    const path = `M${x1} ${y1} A${r} ${r} 0 0 1 ${x2} ${y2} L${x3} ${y3} A${ir} ${ir} 0 0 0 ${x4} ${y4} Z`;
    return `
      <g class="seg" onclick="scrollToScale('${note}')">
        <path d="${path}" fill="${s.color}" stroke="#0a0a0a" stroke-width="2"/>
        <text x="${tx}" y="${ty}" text-anchor="middle" font-size="15">${isEN?(LATIN_TO_ANGLO[note]||note):note}</text>
      </g>`;
  }).join('');
  wrap.innerHTML = `
    <svg class="quintas-svg" viewBox="0 0 380 380" data-testid="quintas-svg">
      ${segs}
      <circle cx="${cx}" cy="${cy}" r="${ir-2}" fill="#05050F" stroke="#3730A3" stroke-width="1"/>
      <text x="${cx}" y="${cy-6}" text-anchor="middle" fill="#C4B5FD" font-size="12" font-family="Cinzel,serif" letter-spacing="2">${isEN?'CIRCLE':'CÍRCULO'}</text>
      <text x="${cx}" y="${cy+12}" text-anchor="middle" fill="#C4B5FD" font-size="12" font-family="Cinzel,serif" letter-spacing="2">${isEN?'OF FIFTHS':'DE QUINTAS'}</text>
    </svg>`;
}

function scrollToScale(note) {
  const target = document.querySelector(`[data-testid="scale-${note}"]`)
              || document.querySelector(`[data-testid="scale-extra-${note}"]`);
  if (target) {
    target.scrollIntoView({behavior:'smooth', block:'center'});
    target.style.transition = 'box-shadow 0.4s';
    target.style.boxShadow = '0 0 0 3px var(--gold2), 0 10px 30px rgba(252,211,77,0.4)';
    setTimeout(() => { target.style.boxShadow = ''; }, 2200);
  }
}

function playScaleProgression(rootName, btn) {
  const c = CORRESPONDENCIAS.find(x => x.nota === rootName);
  if (!c) return;
  // Build ascending+descending sequence in semitone offsets from the root
  // Pentatónica mayor: 0-2-4-7-9-12 (raíz grave → octava aguda) y vuelta 9-7-4-2-0
  const offsets = [0, 2, 4, 7, 9, 12, 9, 7, 4, 2, 0];
  const rootFreq = c.freq;
  const freqs = offsets.map(s => rootFreq * Math.pow(2, s/12));
  playSequence(freqs, btn);
}

function playTriada(sig, btn) {
  const detail = TRIADAS_DETALLE && TRIADAS_DETALLE[sig];
  if (!detail || !detail.notas) return;
  playTriadaArpeggio(detail.notas, btn);
}

function playExtraScale(idx) {
  const es = EXTRA_SCALES[idx];
  // Find root frequency from CORRESPONDENCIAS by the root note name
  const root = CORRESPONDENCIAS.find(x => x.nota === es.nota);
  if (!root) return;
  // All 3 extraordinary scales are major pentatonic (offsets 0,2,4,7,9)
  const offsets = [0, 2, 4, 7, 9, 12, 9, 7, 4, 2, 0];
  const rootFreq = root.freq;
  const freqs = offsets.map(s => rootFreq * Math.pow(2, s/12));
  playSequence(freqs, document.getElementById('extPlay-'+idx));
}

function playSequence(freqs, btn) {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const noteDuration = 0.42, gap = 0.04;
  if (btn) { btn.classList.add('playing'); btn.textContent = window._lang==='en' ? '♪ playing…' : '♪ tocando…'; }
  let t = audioCtx.currentTime;
  freqs.forEach(f => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.frequency.value = f;
    osc.type = 'triangle';
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.22, t + 0.04);
    gain.gain.setValueAtTime(0.22, t + noteDuration*0.6);
    gain.gain.exponentialRampToValueAtTime(0.001, t + noteDuration);
    osc.start(t);
    osc.stop(t + noteDuration);
    t += noteDuration + gap;
  });
  const totalMs = (freqs.length * (noteDuration + gap)) * 1000;
  if (btn) setTimeout(() => { btn.classList.remove('playing'); btn.textContent = window._lang==='en' ? '▶ Listen to progression' : '▶ Escuchar progresión'; }, totalMs);
}