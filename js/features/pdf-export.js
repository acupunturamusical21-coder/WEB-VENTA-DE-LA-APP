// Auto-extraído del monolito index.html — módulo de funcionalidad
// (sin cambios de contenido; solo separado en archivo)

function _pdfHexagramaInfoHTML(lowerEs, upperEs) {
  const found = findHexagramaByTrigramas(lowerEs, upperEs);
  if (!found) return '';
  const h = found.entry;
  const [num, cn, pin, nombre, /*lo*/, /*up*/, kw, dictamen, imagen] = h;
  return `
    <h2>Hexagrama N°${num} — ${nombre}</h2>
    <p style="text-align:center;font-size:1rem;margin:0.2em 0">
      <strong style="font-family:'Cinzel',Georgia,serif;color:#6a1818">${cn}</strong>
      &nbsp;·&nbsp; <em>${pin}</em>
    </p>
    <p style="text-align:center;font-size:0.85rem;color:#6b5b3a;margin:0.2em 0 0.6em">
      ${kw.map(k => `<span style="display:inline-block;background:#f4ead4;border:1px solid #d9c896;border-radius:10px;padding:1px 8px;margin:1px 3px;font-size:0.78rem">${k}</span>`).join('')}
    </p>
    <h3>El Dictamen</h3>
    <p>${dictamen}</p>
    <h3>La Imagen</h3>
    <p>${imagen}</p>
  `;
}

function _pdfStyles() {
  return `<style>
    @page { size: A4; margin: 18mm 14mm; }
    body { font-family: 'EB Garamond', Georgia, serif; color: #1a1208; line-height: 1.45; background:#fff; }
    h1, h2, h3 { font-family: 'Cinzel', Georgia, serif; color: #6a1818; margin: 0.7em 0 0.35em; }
    h1 { font-size: 1.55rem; letter-spacing: 0.05em; text-align: center; margin-bottom: 0.2em; }
    h2 { font-size: 1.05rem; border-bottom: 1px solid #c9a84c; padding-bottom: 0.2em; letter-spacing: 0.04em; }
    h3 { font-size: 0.92rem; color: #8b6a1a; letter-spacing: 0.03em; }
    p  { margin: 0.4em 0; }
    table { width: 100%; border-collapse: collapse; margin: 0.5em 0; font-size: 0.86rem; }
    th, td { border: 1px solid #d9c896; padding: 4px 8px; text-align: center; }
    th { background: #f4ead4; font-family: 'Cinzel', Georgia, serif; font-size: 0.72rem; letter-spacing: 0.04em; color:#6b5b3a; }
    .subtitle { text-align: center; color: #6b5b3a; font-size: 0.92rem; margin-bottom: 1.2em; }
    .meta { color: #6b5b3a; font-size: 0.85rem; }
    .progression { background: #f7eecc; border: 1px solid #c9a84c; padding: 0.7em; margin: 0.8em 0; text-align: center; font-family: 'EB Garamond', Georgia, serif; font-size: 1.15rem; color: #6a1818; letter-spacing: 0.05em; }
    .hex { display: table; margin: 0.9em auto; border-spacing: 0; }
    .hex-row { display: table-row; }
    .hex-row > * { display: table-cell; padding: 3px 6px; vertical-align: middle; font-size: 0.82rem; }
    .hex-label { text-align: right; color: #6b5b3a; white-space: nowrap; }
    .hex-bar-wrap { width: 150px; }
    .hex-bar-yang { width: 140px; height: 7px; background: #6a1818; }
    .hex-bar-yin  { width: 140px; height: 7px; background:
       linear-gradient(to right, #6a1818 0 60px, transparent 60px 80px, #6a1818 80px 140px); }
    .hex-pol { color: #6b5b3a; font-size: 0.8rem; white-space:nowrap; }
    .hex-divider-row { display: table-row; }
    .hex-divider-row > div { display: table-cell; }
    .hex-divider { height: 2px; background: #c9a84c; margin: 4px 0; width: 140px; }
    .pillar-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin: 0.5em 0 0.9em; }
    .pillar-card { border: 1px solid #d9c896; padding: 0.45em 0.35em; text-align: center; font-size: 0.78rem; border-radius: 3px; }
    .pillar-card.selected { border: 2px solid #6a1818; background: #fbf3e0; }
    .pillar-label { font-family: 'Cinzel', Georgia, serif; font-size: 0.62rem; color: #6b5b3a; letter-spacing: 0.04em; line-height:1.2 }
    .pillar-anim { font-size: 1.05rem; margin: 2px 0; }
    .pillar-name { font-family: 'Cinzel', Georgia, serif; color: #6a1818; font-size: 0.82rem; }
    .pillar-canal { color: #8b6a1a; font-family: 'Cinzel', Georgia, serif; font-size: 0.74rem; margin-top: 2px; }
    .trig-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin: 0.8em 0; }
    .trig-card { border: 1px solid #d9c896; padding: 0.6em; text-align: center; border-radius: 3px; background: #fbf6e6; }
    .trig-sym { font-size: 1.8rem; line-height: 1; margin: 0.15em 0; color: #1a1208; }
    .trig-name { font-family: 'Cinzel', Georgia, serif; color: #6a1818; font-size: 0.92rem; }
    .trig-meta { color: #6b5b3a; font-size: 0.74rem; }
    .footer { margin-top: 1.6em; font-size: 0.72rem; color: #6b5b3a; text-align: center; border-top: 1px solid #d9c896; padding-top: 0.5em; }
    .cad-box { border: 1px solid #d9c896; padding: 0.45em 0.6em; border-radius: 3px; background:#fbf6e6; font-size: 0.85rem; }
    .cad-box strong { color:#6a1818; font-family:'Cinzel',Georgia,serif; }
    .no-print { text-align:center; margin-top: 1.4em; }
    @media print { .no-print { display: none; } }
  </style>`;
}

function _pdfHexagramHTML(linesBottomUp, opts) {
  // linesBottomUp: [{yang:bool, level:str, polLabel?:str}] index 0 = línea 1 (abajo)
  // Render visualmente de arriba (línea 6) hacia abajo (línea 1)
  // El separador entre trigramas va entre línea 4 y línea 3.
  const isENHex = window._lang === 'en';
  const labels = isENHex
    ? ['Earth (lower)','Human (lower)','Heaven (lower)','Earth (upper)','Human (upper)','Heaven (upper)']
    : ['Tierra inf.','Humano inf.','Cielo inf.','Tierra sup.','Humano sup.','Cielo sup.'];
  let html = '<div class="hex">';
  for (let i = 5; i >= 0; i--) {
    const ln = linesBottomUp[i];
    if (!ln) continue;
    const polLabel = ln.polLabel || (ln.yang?'Yang':'Yin');
    html += `<div class="hex-row">
      <span class="hex-label">${i+1}. ${ln.level || labels[i]}</span>
      <span class="hex-bar-wrap"><div class="${ln.yang?'hex-bar-yang':'hex-bar-yin'}"></div></span>
      <span class="hex-pol">${polLabel}</span>
    </div>`;
    if (i === 3) { // después de la línea 4, antes de la 3
      html += `<div class="hex-divider-row"><div></div><div><div class="hex-divider"></div></div><div></div></div>`;
    }
  }
  html += '</div>';
  return html;
}

function _pdfOpen(title, bodyHtml) {
  const w = window.open('', '_blank', 'width=920,height=1100');
  if (!w) { alert('Habilita las ventanas emergentes (pop-ups) para exportar a PDF.'); return; }
  w.document.write(`<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><title>${title}</title>
    <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600&family=EB+Garamond:wght@400;500;600&display=swap" rel="stylesheet">
    ${_pdfStyles()}</head><body>
    ${bodyHtml}
    <div class="footer">${window._lang==='en'?'Generated by Musical Acupuncture':'Generado por Acupuntura Musical'} · ${new Date().toLocaleString(window._lang==='en'?'en-US':'es-ES')}</div>
    <div class="no-print">
      <button onclick="window.print()" style="padding:8px 18px;font-size:14px;cursor:pointer;background:#6a1818;color:#fff;border:none;border-radius:3px;font-family:'Cinzel',Georgia,serif;letter-spacing:0.05em">
        🖨  Imprimir / Guardar como PDF
      </button>
    </div>
    <script>window.addEventListener('load', () => setTimeout(() => window.print(), 700));<\/script>
  </body></html>`);
  w.document.close();
}

function exportMomentoVitalPDF() {
  if (!_lastMomentoVital) { alert(window._lang==='en'?'Please calculate the Vital Moment first.':'Primero calcula el Momento Vital.'); return; }
  const S = _lastMomentoVital;
  const isEN = window._lang === 'en';
  const trigNameEN3 = {Cielo:'Heaven',Tierra:'Earth',Trueno:'Thunder',Agua:'Water',Montaña:'Mountain',Viento:'Wind',Fuego:'Fire',Lago:'Lake'};
  const _tn3 = (t) => isEN ? (trigNameEN3[t.nombre] || t.nombre) : t.nombre;
  const pillarNames    = {anio:'del Año',   mes:'del Mes',   dia:'del Día',  hora:'de la Hora'};
  const pillarNamesEN3 = {anio:'Year',       mes:'Month',     dia:'Day',      hora:'Hour'};
  const pillarSphere   = {anio:'Imagen / Familia ext.', mes:'Trabajo / Vocación', dia:'Vida íntima / Alma', hora:'Hijos / Pacientes'};
  const pillarSphereEN = {anio:'Image / Ext. Family',   mes:'Work / Vocation',    dia:'Inner Life / Soul',  hora:'Children / Patients'};
  const _pn = isEN ? pillarNamesEN3 : pillarNames;
  const _ps = isEN ? pillarSphereEN : pillarSphere;
  const fmtDate = s => { try { return new Date(s+'T12:00:00').toLocaleDateString(isEN?'en-US':'es-ES',{year:'numeric',month:'long',day:'numeric'}); } catch(e){ return s; } };

  // Pilares
  let pillarsHtml = '<div class="pillar-grid">';
  ['anio','mes','dia','hora'].forEach(k => {
    const b = S.pillars[k];
    const c = CORRESPONDENCIAS[b.corrIdx];
    const sel = (k === S.selectedPillar);
    const pLabel = isEN ? `${_pn[k].toUpperCase()} PILLAR<br><small>${_ps[k]}</small>` : `PILAR ${_pn[k].toUpperCase()}<br><small>${_ps[k]}</small>`;
    const canalLbl = isEN ? (CONTENT_TRANSLATIONS.en[c.canal] || c.canal) : c.canal;
    const notaLbl  = isEN ? toAnglo(c.nota) : c.nota;
    const animLbl  = isEN ? (CONTENT_TRANSLATIONS.en[b.animal] || b.animal) : b.animal;
    pillarsHtml += `<div class="pillar-card ${sel?'selected':''}">
      <div class="pillar-label">${pLabel}</div>
      <div class="pillar-anim">${b.emoji}</div>
      <div class="pillar-name">${b.sym} · ${animLbl}</div>
      <div class="meta" style="font-size:0.72rem">${b.pin}</div>
      <div class="pillar-canal">${canalLbl} · ${notaLbl}</div>
    </div>`;
  });
  pillarsHtml += '</div>';

  // Trigramas
  const trigHtml = `<div class="trig-grid">
    <div class="trig-card">
      <div class="meta">${isEN?'HEAVEN TRIGRAM (immutable)':'TRIGRAMA DEL CIELO (inmutable)'}</div>
      <div class="trig-sym">${S.birthTrigrama.sym}</div>
      <div class="trig-name">${_tn3(S.birthTrigrama)}</div>
      <div class="trig-meta">${S.birthTrigrama.chino}</div>
    </div>
    <div class="trig-card">
      <div class="meta">${isEN?'EARTH TRIGRAM (current)':'TRIGRAMA DE LA TIERRA (actual)'}</div>
      <div class="trig-sym">${S.currentTrigrama.sym}</div>
      <div class="trig-name">${_tn3(S.currentTrigrama)}</div>
      <div class="trig-meta">${S.currentTrigrama.chino} · ${S.ageYears} ${isEN?'years':'años'} · ${isEN?'Cycle':'Ciclo'} ${S.cycles+1} (${isEN?'every':'cada'} ${S.cycleDuration} ${isEN?'years':'años'})</div>
    </div>
    <div class="trig-card">
      <div class="meta">${isEN?'BASE TONALITY':'TONALIDAD BASE'}</div>
      <div class="trig-sym" style="font-family:'Cinzel',Georgia,serif;font-size:1.6rem">${S.tonality}</div>
      <div class="trig-name">${isEN?(CONTENT_TRANSLATIONS.en[S.corrData.canal]||S.corrData.canal):S.corrData.canal}</div>
      <div class="trig-meta">${isEN?'Pillar':'Pilar'} ${_pn[S.selectedPillar]}: ${S.selBranch.sym} ${isEN?(CONTENT_TRANSLATIONS.en[S.selBranch.animal]||S.selBranch.animal):S.selBranch.animal}</div>
    </div>
  </div>`;

  // Hexagrama dibujo
  const hexLevelEN4 = {'Tierra inf.':'Earth (lower)','Humano inf.':'Human (lower)','Cielo inf.':'Heaven (lower)','Tierra sup.':'Earth (upper)','Humano sup.':'Human (upper)','Cielo sup.':'Heaven (upper)'};
  const hexagramaLineas = S.hexLines.map((l, i) => ({
    yang: l.yang, level: isEN ? (hexLevelEN4[l.level]||l.level) : l.level,
    polLabel: (l.yang ? 'Yang' : 'Yin') + ' (' + (isEN?(l.yang?'Major':'Minor'):(l.yang?'Mayor':'Menor')) + ')'
  }));
  const hexImg = _pdfHexagramHTML(hexagramaLineas, {});

  // Tabla del hexagrama
  const funcLabel = isEN ? {tonica:'Tonic', sub:'Subdominant', dom:'Dominant'} : {tonica:'Tónica', sub:'Subdominante', dom:'Dominante'};
  let tableRows = '';
  for (let i = 5; i >= 0; i--) {
    const c = S.chords[i];
    const l = S.hexLines[i];
    tableRows += `<tr>
      <td>${c.lineNum}</td>
      <td>${isEN?(hexLevelEN4[l.level]||l.level):l.level}</td>
      <td>${funcLabel[l.func]}</td>
      <td><strong>${c.roman}</strong></td>
      <td><strong>${c.note}</strong></td>
      <td>${isEN?(l.yang?'Yang (Major)':'Yin (Minor)'):(l.yang?'Yang (Mayor)':'Yin (Menor)')}</td>
    </tr>`;
  }
  const tblHdrs = isEN ? ['LINE','LEVEL','FUNCTION','ROMAN','CHORD','UNIVERSE'] : ['LÍNEA','NIVEL','FUNCIÓN','ROMANO','ACORDE','UNIVERSO'];
  const hexTable = `<table>
    <thead><tr>${tblHdrs.map(h=>`<th>${h}</th>`).join('')}</tr></thead>
    <tbody>${tableRows}</tbody></table>`;

  // Cadencias
  const _cad  = isEN ? 'Cadence' : 'Cadencia';
  const _pol  = isEN ? 'Polarities:' : 'Polaridades:';
  const _ton  = isEN ? 'tonic'   : 'tónica';
  const _sub2 = isEN ? 'subdom.' : 'subdom.';
  const _dom2 = isEN ? 'dom.'    : 'dom.';
  const cadHtml = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:0.6em 0">
      <div class="cad-box">
        <strong>${_cad} · ${isEN?'Heaven':'Cielo'} ${S.birthTrigrama.sym} ${_tn3(S.birthTrigrama)}</strong><br>
        N°${S.cadCielo.idx} · ${S.cadCielo.tonica}-${S.cadCielo.sub}-${S.cadCielo.dom}
        <div class="meta">${_pol} ${_ton} ${S.cadCielo.tonicPol} · ${_sub2} ${S.cadCielo.subPol} · ${_dom2} ${S.cadCielo.domPol}</div>
      </div>
      <div class="cad-box">
        <strong>${_cad} · ${isEN?'Earth':'Tierra'} ${S.currentTrigrama.sym} ${_tn3(S.currentTrigrama)}</strong><br>
        N°${S.cadTierra.idx} · ${S.cadTierra.tonica}-${S.cadTierra.sub}-${S.cadTierra.dom}
        <div class="meta">${_pol} ${_ton} ${S.cadTierra.tonicPol} · ${_sub2} ${S.cadTierra.subPol} · ${_dom2} ${S.cadTierra.domPol}</div>
      </div>
    </div>`;

  // Progresión
  const progStr = '//:  ' + S.chords.map(c=>c.note).join(' | ') + '  ://';

  // Información del hexagrama (Capítulo I Ching)
  const hexInfo = _pdfHexagramaInfoHTML(S.currentTrigrama.nombre, S.birthTrigrama.nombre);

  const _inf = isEN ? '(lower)' : '(inf.)';
  const _sup = isEN ? '(upper)' : '(sup.)';
  const body = `
    <h1>${isEN?'☯ Vital Moment of Being':'☯ Momento Vital del Ser'}</h1>
    <div class="subtitle">${isEN?'Musical Acupuncture — Therapeutic Session':'Acupuntura Musical — Sesión terapéutica'}</div>

    <h2>${isEN?'Patient Data':'Datos del Paciente'}</h2>
    <table>
      <tbody>
        <tr><th>${isEN?'Date of Birth':'Fecha de Nacimiento'}</th><td>${fmtDate(S.birthStr)}</td>
            <th>${isEN?'Session Date':'Fecha de la Sesión'}</th><td>${fmtDate(S.currStr)}</td></tr>
        <tr><th>${isEN?'Gender':'Género'}</th><td>${S.gender==='m'?(isEN?'Male (8-year cycles)':'Masculino (ciclos 8 años)'):(isEN?'Female (7-year cycles)':'Femenino (ciclos 7 años)')}</td>
            <th>${isEN?'Birth Hour':'Hora de nacimiento'}</th><td>${S.birthHour}:00</td></tr>
        <tr><th>${isEN?'Age':'Edad'}</th><td>${S.ageYears} ${isEN?'years':'años'}</td>
            <th>${isEN?'Current Cycle':'Ciclo actual'}</th><td>${S.cycles+1} (${isEN?'of':'de'} ${S.cycleDuration} ${isEN?'years':'años'})</td></tr>
      </tbody>
    </table>

    <h2>${isEN?'The Four Pillars of Destiny':'Los Cuatro Pilares del Destino'}</h2>
    ${pillarsHtml}
    <p class="meta" style="text-align:center;font-style:italic">${isEN?'Selected sphere:':'Esfera seleccionada:'} <strong>${isEN?'Pillar':'Pilar'} ${_pn[S.selectedPillar]}</strong> — ${_ps[S.selectedPillar]}</p>

    <h2>${isEN?'Trigrams and Tonality':'Trigramas y Tonalidad'}</h2>
    ${trigHtml}

    <h2>${isEN?'Hexagram':'Hexagrama'}</h2>
    ${hexImg}
    <p class="meta" style="text-align:center">${S.currentTrigrama.sym}${S.birthTrigrama.sym} · ${_tn3(S.currentTrigrama)} ${_inf} ${isEN?'over':'sobre'} ${_tn3(S.birthTrigrama)} ${_sup}</p>

    <h2>${isEN?'Chosen Cadences (Ch. 30.8 — Section A)':'Cadencias Elegidas (Cap. 30.8 — Sección A)'}</h2>
    ${cadHtml}

    <h2>${isEN?'Hexagram Table and Progression':'Tabla del Hexagrama y Progresión'}</h2>
    ${hexTable}
    <div class="progression">${progStr}</div>
    <p class="meta" style="font-style:italic;text-align:center">${isEN?'The hexagram is a map of the vital moment, not a verdict.':'El hexagrama es un mapa del momento vital, no una sentencia.'}</p>

    ${hexInfo}
  `;
  _pdfOpen(isEN?'Vital Moment — Session':'Momento Vital — Sesión', body);
}

function exportAzarPDF() {
  if (!oracleState || !oracleState.lines || oracleState.lines.length < 6 || !oracleState.tonality) {
    alert(window._lang==='en'?'Please complete the random oracle first (6 lines + tonality).':'Primero completa el oráculo al azar (6 líneas + tonalidad).'); return;
  }
  const S = oracleState;
  // Reconstruir trigramas y acordes desde el estado (mismo cálculo que generateOracleResult)
  const lowerLines = S.lines.slice(0,3);
  const upperLines = S.lines.slice(3,6);
  const findTrigrama = (ls) => TRIGRAMAS.find(t =>
    t.lineas[0] === (ls[2].yang?1:0) && t.lineas[1] === (ls[1].yang?1:0) && t.lineas[2] === (ls[0].yang?1:0)
  ) || TRIGRAMAS[0];
  const lowerTrig = findTrigrama(lowerLines);
  const upperTrig = findTrigrama(upperLines);
  const yangCount = S.lines.filter(l=>l.yang).length;
  const isMinor = yangCount < 3;
  const keyDisplay = isMinor ? `${S.tonality} minor` : `${S.tonality} Major`;

  // Tomar los acordes ya renderizados desde el DOM (manteniendo lo que ya está mostrado)
  const chordCells = document.querySelectorAll('#chordGrid .chord-cell');
  const chordNames = window._oracleChords || Array.from(chordCells).map(c => {
    const n = c.querySelector('.chord-name'); return n ? n.textContent.trim().split(' ')[0] : '';
  });
  const chordRomans = Array.from(chordCells).map(c => {
    const r = c.querySelector('div:nth-child(3)');
    return r ? r.textContent.trim() : '';
  });
  const funcLabels = ['Tónica','Subdominante','Dominante'];
  const funcLabelsEN2 = ['Tonic','Subdominant','Dominant'];
  const isENAzar = window._lang === 'en';
  const _flAzar = isENAzar ? funcLabelsEN2 : funcLabels;
  const hexLevelAzar = isENAzar
    ? ['Earth (lower)','Human (lower)','Heaven (lower)','Earth (upper)','Human (upper)','Heaven (upper)']
    : ['Tierra inf.','Humano inf.','Cielo inf.','Tierra sup.','Humano sup.','Cielo sup.'];
  const hexLevelAzarES = ['Tierra inf.','Humano inf.','Cielo inf.','Tierra sup.','Humano sup.','Cielo sup.'];
  const trigNameEN5 = {Cielo:'Heaven',Tierra:'Earth',Trueno:'Thunder',Agua:'Water',Montaña:'Mountain',Viento:'Wind',Fuego:'Fire',Lago:'Lake'};
  const _tn5 = (t) => isENAzar ? (trigNameEN5[t.nombre] || t.nombre) : t.nombre;

  // Líneas para dibujo del hexagrama
  const hexLinesDraw = S.lines.map((l, i) => ({
    yang: l.yang,
    level: hexLevelAzar[i],
    polLabel: (l.yang?'Yang':'Yin') + (isENAzar ? ' (sum ' : ' (suma ') + l.sum + ')'
  }));
  const hexImg = _pdfHexagramHTML(hexLinesDraw, {});

  // Tabla
  let rows = '';
  for (let i = 5; i >= 0; i--) {
    const funcIdx = i % 3;
    rows += `<tr>
      <td>${i+1}</td>
      <td>${hexLevelAzar[i]}</td>
      <td>${_flAzar[funcIdx]}</td>
      <td><strong>${chordRomans[i]||''}</strong></td>
      <td><strong>${chordNames[i]||''}</strong></td>
      <td>${S.lines[i].yang?(isENAzar?'Yang (Major)':'Yang (Mayor)'):(isENAzar?'Yin (Minor)':'Yin (Menor)')} · ${isENAzar?'sum':'suma'} ${S.lines[i].sum}</td>
    </tr>`;
  }
  const tblHdrsAzar = isENAzar ? ['LINE','LEVEL','FUNCTION','ROMAN','CHORD','UNIVERSE'] : ['LÍNEA','NIVEL','FUNCIÓN','ROMANO','ACORDE','UNIVERSO'];
  const hexTable = `<table>
    <thead><tr>${tblHdrsAzar.map(h=>`<th>${h}</th>`).join('')}</tr></thead>
    <tbody>${rows}</tbody></table>`;

  const coinLabelAzar = isENAzar ? (S.tonalityCoin==='cara'?'heads':'tails') : S.tonalityCoin;
  const trigHtml = `<div class="trig-grid">
    <div class="trig-card">
      <div class="meta">${isENAzar?'LOWER TRIGRAM':'TRIGRAMA INFERIOR'}</div>
      <div class="trig-sym">${lowerTrig.sym}</div>
      <div class="trig-name">${_tn5(lowerTrig)}</div>
      <div class="trig-meta">${lowerTrig.chino}</div>
    </div>
    <div class="trig-card">
      <div class="meta">${isENAzar?'UPPER TRIGRAM':'TRIGRAMA SUPERIOR'}</div>
      <div class="trig-sym">${upperTrig.sym}</div>
      <div class="trig-name">${_tn5(upperTrig)}</div>
      <div class="trig-meta">${upperTrig.chino}</div>
    </div>
    <div class="trig-card">
      <div class="meta">${isENAzar?'TONALITY':'TONALIDAD'}</div>
      <div class="trig-sym" style="font-family:'Cinzel',Georgia,serif;font-size:1.6rem">${keyDisplay}</div>
      <div class="trig-meta">${isENAzar?'Coin:':'Moneda:'} ${coinLabelAzar} · ${isENAzar?'Die:':'Dado:'} ${S.tonalityDie}</div>
      <div class="trig-meta">${yangCount} ${isENAzar?'Yang lines out of 6 →':'líneas Yang de 6 →'} ${isMinor?(isENAzar?'minor':'menor'):(isENAzar?'major':'mayor')}</div>
    </div>
  </div>`;

  const progStr = '//:  ' + (chordNames.join(' | ')) + '  ://';

  // Información del hexagrama (Capítulo I Ching)
  const hexInfo = _pdfHexagramaInfoHTML(lowerTrig.nombre, upperTrig.nombre);

  const _inf2 = isENAzar ? '(lower)' : '(inf.)';
  const _sup2 = isENAzar ? '(upper)' : '(sup.)';
  const body = `
    <h1>🪙 ${isENAzar?'Random Oracle':'Oráculo al Azar'}</h1>
    <div class="subtitle">${isENAzar?'Musical Acupuncture — Oracular Composition with I Ching':'Acupuntura Musical — Composición oracular con I Ching'}</div>

    <h2>${isENAzar?'Trigrams and Tonality':'Trigramas y Tonalidad'}</h2>
    ${trigHtml}

    <h2>${isENAzar?'Hexagram':'Hexagrama'}</h2>
    ${hexImg}
    <p class="meta" style="text-align:center">${lowerTrig.sym}${upperTrig.sym} · ${_tn5(lowerTrig)} ${_inf2} ${isENAzar?'over':'sobre'} ${_tn5(upperTrig)} ${_sup2}</p>

    <h2>${isENAzar?'Lines and Throws':'Líneas y Tiradas'}</h2>
    ${hexTable}
    <div class="progression">${progStr}</div>
    <p class="meta" style="font-style:italic;text-align:center">${isENAzar?'This progression serves as a starting point for improvising, composing or exploring new musical ideas.':'Esta progresión sirve como punto de partida para improvisar, componer o explorar nuevas ideas musicales.'}</p>

    ${hexInfo}
  `;
  _pdfOpen(isENAzar?'Random Oracle — Session':'Oráculo al Azar — Sesión', body);
}