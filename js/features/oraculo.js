// Auto-extraído del monolito index.html — módulo de funcionalidad
// (sin cambios de contenido; solo separado en archivo)

function findHexagramaByTrigramas(lowerEs, upperEs) {
  const lo = TRIG_ES_TO_KEY[lowerEs];
  const up = TRIG_ES_TO_KEY[upperEs];
  if (!lo || !up) return null;
  for (let i = 0; i < HEXAGRAMAS_64.length; i++) {
    const h = HEXAGRAMAS_64[i];
    if (h[4] === lo && h[5] === up) return {idx: i, entry: h};
  }
  return null;
}

function showHexagramInfoByTrigramas(lowerEs, upperEs) {
  const found = findHexagramaByTrigramas(lowerEs, upperEs);
  if (!found) { alert(window._lang==='en'?('Hexagram not found for '+lowerEs+' over '+upperEs):('No se encontró el hexagrama para '+lowerEs+' sobre '+upperEs)); return; }
  if (typeof showHexModal === 'function') {
    showHexModal(found.idx);
  } else {
    alert('Hexagrama N°' + found.entry[0] + ' · ' + found.entry[3]);
  }
}

function showHexagramInfoFromMomentoVital() {
  if (!_lastMomentoVital) { alert(window._lang==='en'?'Please calculate the Vital Moment first.':'Primero calcula el Momento Vital.'); return; }
  // En Momento Vital: trigrama inferior = TIERRA (current), superior = CIELO (birth)
  showHexagramInfoByTrigramas(
    _lastMomentoVital.currentTrigrama.nombre,
    _lastMomentoVital.birthTrigrama.nombre
  );
}

function showHexagramInfoFromAzar() {
  if (!oracleState || !oracleState.lines || oracleState.lines.length < 6) {
    alert('Primero completa el oráculo al azar.'); return;
  }
  const lowerLines = oracleState.lines.slice(0,3);
  const upperLines = oracleState.lines.slice(3,6);
  const findTrig = (ls) => TRIGRAMAS.find(t =>
    t.lineas[0] === (ls[2].yang?1:0) && t.lineas[1] === (ls[1].yang?1:0) && t.lineas[2] === (ls[0].yang?1:0)
  ) || TRIGRAMAS[0];
  showHexagramInfoByTrigramas(findTrig(lowerLines).nombre, findTrig(upperLines).nombre);
}

let oracleState = {
  step: 0, // 0-5: hexagram lines, 6: tonality, 7: done
  lines: [],
  tonality: null,
  tonalityCoin: null,
  tonalityDie: null,
};

function initOraculo() {
  updateStepDots();
}

function resetOracle() {
  const isEN = window._lang === 'en';
  oracleState = {step:0, lines:[], tonality:null, tonalityCoin:null, tonalityDie:null};
  document.getElementById('hexDisplay').innerHTML = `<p style="color:var(--muted);font-style:italic;font-size:0.9rem">${isEN?'The hexagram will appear here...':'El hexagrama aparecerá aquí...'}</p>`;
  document.getElementById('oracleResult').classList.remove('visible');
  document.getElementById('coinDisplay').innerHTML = `<span style="font-size:2rem">🪙</span><span style="font-size:2rem">🪙</span><span style="font-size:2rem">🪙</span>`;
  document.getElementById('stepLabel').textContent = isEN ? 'Step 1 of 8 — Throw 1/6 for the hexagram' : 'Paso 1 de 8 — Lanzamiento 1/6 para el hexagrama';
  document.getElementById('throwBtn').textContent = isEN ? '⚄ Throw Coins' : '⚄ Lanzar Monedas';
  document.getElementById('throwBtn').disabled = false;
  updateStepDots();
}

function updateStepDots() {
  const dots = document.getElementById('stepDots');
  dots.innerHTML = Array.from({length:8}, (_,i) => {
    let cls = 'step-dot';
    if (i < oracleState.step) cls += ' done';
    else if (i === oracleState.step) cls += ' current';
    return `<div class="${cls}"></div>`;
  }).join('');
}

function throw3Coins() {
  const state = oracleState;
  const isEN = window._lang === 'en';
  
  if (state.step < 6) {
    // Throw for hexagram line
    const coins = [Math.random()<0.5?2:3, Math.random()<0.5?2:3, Math.random()<0.5?2:3];
    const sum = coins.reduce((a,b)=>a+b,0);
    const isYang = sum === 7 || sum === 9;
    
    const coinEmojis = coins.map(c => c===2 ? '🌕' : '🌑');
    document.getElementById('coinDisplay').innerHTML = coinEmojis.map(e=>`<span class="spinning" style="font-size:2rem">${e}</span>`).join('');
    
    state.lines.push({yang: isYang, sum});
    
    const lineNum = state.step + 1;
    const stepLabel = isEN
      ? `Line ${lineNum}/6 → Sum: ${sum} → ${isYang ? 'YANG ─────' : 'YIN ── ──'}`
      : `Línea ${lineNum}/6 → Suma: ${sum} → ${isYang ? 'YANG ─────' : 'YIN ── ──'}`;
    document.getElementById('stepLabel').textContent = stepLabel;
    
    // Render hexagram so far
    renderPartialHexagram(state.lines);
    
    state.step++;
    updateStepDots();
    
    if (state.step === 6) {
      document.getElementById('throwBtn').textContent = isEN ? '⚄ Throw Coin + Die (Tonality)' : '⚄ Lanzar Moneda + Dado (Tonalidad)';
      document.getElementById('stepLabel').textContent = isEN ? 'Step 7 of 8 — Calculate tonality (1 coin + 1 die)' : 'Paso 7 de 8 — Calcular tonalidad (1 moneda + 1 dado)';
    }
    
  } else if (state.step === 6) {
    // Throw for tonality
    const coin = Math.random() < 0.5 ? 'cara' : 'cruz';
    const die = Math.floor(Math.random() * 6) + 1;
    const tonality = TONALITY_TABLE[coin][die-1];
    
    state.tonality = tonality;
    state.tonalityCoin = coin;
    state.tonalityDie = die;
    
    const coinLabel = isEN ? (coin==='cara'?'heads':'tails') : coin;
    document.getElementById('coinDisplay').innerHTML = `
      <span style="font-size:2rem" class="spinning">${coin==='cara'?'🌕':'🌑'}</span>
      <span style="font-size:2.5rem" class="spinning">🎲</span>
      <span style="font-size:1.2rem;font-family:'Cinzel',serif;color:var(--gold2)">${die}</span>
    `;
    document.getElementById('stepLabel').textContent = isEN
      ? `Coin: ${coinLabel} · Die: ${die} → Tonality: ${tonality}`
      : `Moneda: ${coin} · Dado: ${die} → Tonalidad: ${tonality}`;
    
    state.step++;
    updateStepDots();
    document.getElementById('throwBtn').textContent = isEN ? '✦ Generate Progression' : '✦ Generar Progresión';
    
  } else if (state.step === 7) {
    // Generate the full oracle result
    generateOracleResult();
    document.getElementById('throwBtn').disabled = true;
  }
}

function renderPartialHexagram(lines) {
  const display = document.getElementById('hexDisplay');
  const linesFromBottom = [...lines]; // index 0 = line 1 (bottom)
  
  let html = '';
  for (let i = linesFromBottom.length - 1; i >= 0; i--) {
    const line = linesFromBottom[i];
    const lineNum = i + 1;
    const isLower = lineNum <= 3;
    const posLabel = ['Tierra inf.','Humano inf.','Cielo inf.','Tierra sup.','Humano sup.','Cielo sup.'][i] || '';
    
    if (lineNum === 3) {
      html += `<div class="trigram-divider"></div>`;
    }
    
    html += `<div class="hex-line">
      <span class="hex-line-label">${lineNum}. ${posLabel}</span>
      ${line.yang 
        ? `<div class="yang-line"></div>` 
        : `<div class="yin-line-left"></div><div class="yin-gap"></div><div class="yin-line-right"></div>`}
      <span class="hex-line-num">${line.yang?'Yang':'Yin'}</span>
    </div>`;
  }
  
  display.innerHTML = html || `<p style="color:var(--muted);font-style:italic;font-size:0.9rem">${window._lang==="en"?"The hexagram will appear here...":"El hexagrama aparecerá aquí..."}</p>`;
}

function generateOracleResult() {
  const {lines, tonality} = oracleState;
  
  // Determine trigramas
  const lowerLines = lines.slice(0,3); // lines 1-3
  const upperLines = lines.slice(3,6); // lines 4-6
  
  const findTrigrama = (ls) => TRIGRAMAS.find(t => 
    t.lineas[0] === (ls[2].yang?1:0) && t.lineas[1] === (ls[1].yang?1:0) && t.lineas[2] === (ls[0].yang?1:0)
  ) || TRIGRAMAS[0];
  
  const lowerTrig = findTrigrama(lowerLines);
  const upperTrig = findTrigrama(upperLines);
  
  // Determine if key is major or minor based on yang count
  const yangCount = lines.filter(l=>l.yang).length;
  const isMinor = yangCount < 3;
  const keyDisplay = isMinor ? `${tonality} minor` : `${tonality} Major`;
  
  // Generate chords (6 lines, each gets a chord)
  // Line 1: Tónica (lower trig line 1)
  // Line 2: Subdominante (lower trig line 2)
  // Line 3: Dominante (lower trig line 3)
  // Line 4: Tónica (upper trig line 1)
  // Line 5: Subdominante (upper trig line 2)
  // Line 6: Dominante (upper trig line 3)
  
  const funcs = ['tonica','sub','dom'];
  const funcLabels = ['Tónica','Subdominante','Dominante'];
  const funcLabelsEN = ['Tonic','Subdominant','Dominant'];
  const isEN = window._lang === 'en';
  const trigNameEN2 = {Cielo:'Heaven',Tierra:'Earth',Trueno:'Thunder',Agua:'Water',Montaña:'Mountain',Viento:'Wind',Fuego:'Fire',Lago:'Lake'};
  const _tn = (t) => isEN ? (trigNameEN2[t.nombre] || t.nombre) : t.nombre;
  const _fl = isEN ? funcLabelsEN : funcLabels;
  
  const chords = lines.map((line, i) => {
    const trig = i < 3 ? lowerTrig : upperTrig;
    const funcIdx = i % 3; // 0=tonica, 1=sub, 2=dom
    const funcKey = ['tonica','sub','dom'][funcIdx];
    const trigPolar = funcIdx === 0 ? trig.tonica : funcIdx === 1 ? trig.sub : trig.dom;
    const linePolar = line.yang ? 'Yang' : 'Yin';
    
    // Combine trigram function and line polarity
    // The trigram assigns the FUNCTION polarity type, line yang/yin refines the chord choice
    const polar = trigPolar; // Use trigram's assignment for function
    const pool = polar === 'Yang' ? CHORDS_YANG[funcKey] : CHORDS_YIN[funcKey];
    const chordIdx = Math.floor(Math.random() * pool.length);
    const roman = pool[chordIdx];
    const note = romanToNote(roman, tonality, isMinor);
    
    return {roman, note, yang: line.yang, polar, funcLabel: _fl[funcIdx]};
  });
  
  // Display result
  const result = document.getElementById('oracleResult');
  result.classList.add('visible');
  
  const trig1 = lowerTrig;
  const trig2 = upperTrig;
  
  document.getElementById('orTitle').innerHTML = isEN
    ? `${trig1.sym} ${_tn(trig1)} over ${trig2.sym} ${_tn(trig2)}`
    : `${trig1.sym} ${trig1.nombre} sobre ${trig2.sym} ${trig2.nombre}`;
  const coinLabelDisp = isEN ? (oracleState.tonalityCoin==='cara'?'heads':'tails') : oracleState.tonalityCoin;
  document.getElementById('orTonality').innerHTML = isEN
    ? `Tonality: <strong>${keyDisplay}</strong> · Coin: ${coinLabelDisp} · Die: ${oracleState.tonalityDie}<br><small>${trig1.sym} ${trig1.chino} (lower) · ${trig2.sym} ${trig2.chino} (upper)</small>`
    : `Tonalidad: <strong>${keyDisplay}</strong> · Moneda: ${oracleState.tonalityCoin} · Dado: ${oracleState.tonalityDie}<br><small>${trig1.sym} ${trig1.chino} (inferior) · ${trig2.sym} ${trig2.chino} (superior)</small>`;
  
  // Display from line 1 to 6 (left to right)
  document.getElementById('chordGrid').innerHTML = chords.map((ch, i) => `
    <div class="chord-cell ${ch.yang?'chord-yang':'chord-yin'}" onclick="playChord('${ch.note}')" title="\u266a ${ch.note}">
      <div class="chord-name">${ch.note} <span style="font-size:0.6rem;opacity:0.4">&#9834;</span></div>
      <div class="chord-func">${ch.funcLabel}</div>
      <div style="font-size:0.65rem;color:var(--muted)">${ch.roman}</div>
    </div>
  `).join('');
  
  // Progression: lines from 1 to 6
  const prog = chords.map(c => c.note).join(' | ');
  document.getElementById('progressionDisplay').innerHTML = `//:&nbsp; ${prog} &nbsp;://`;
  window._oracleChords = chords.map(c => c.note);
  if (typeof opLoadChords === 'function') opLoadChords(window._oracleChords);
  const _pb = document.getElementById('playProgressionBtn');
  if (_pb) { _pb.style.display = ''; _pb.disabled = false; _pb.textContent = isEN ? '▶ Listen to full progression' : '▶ Escuchar progresión completa'; }
  
  result.scrollIntoView({behavior:'smooth', block:'center'});
}

let selectedPillar = 'anio';

function selectPillar(btn) {
  document.querySelectorAll('.pillar-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  selectedPillar = btn.dataset.pillar;
}

function switchOracleTab(mode) {
  document.querySelectorAll('.oracle-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.oracle-panel').forEach(p => p.classList.remove('active'));
  event.target.classList.add('active');
  document.getElementById('panel-'+mode).classList.add('active');
}

function linesToTrigrama(l1yang, l2yang, l3yang) {
  return TRIGRAMAS.find(t => 
    t.lineas[0] === (l3yang?1:0) && t.lineas[1] === (l2yang?1:0) && t.lineas[2] === (l1yang?1:0)
  ) || TRIGRAMAS[0];
}

function calcMomentoVital() {
  const birthStr = document.getElementById('mvBirthDate').value;
  const currStr  = document.getElementById('mvCurrentDate').value;
  const gender   = document.getElementById('mvGender').value;
  const birthHour= parseInt(document.getElementById('mvBirthHour').value) || 12;

  if (!birthStr || !currStr) { alert(window._lang==='en' ? 'Please complete the dates.' : 'Por favor completa las fechas.'); return; }

  const birth = new Date(birthStr + 'T12:00:00');
  const curr  = new Date(currStr  + 'T12:00:00');
  const day   = birth.getDate();
  const month = birth.getMonth() + 1;
  const year  = birth.getFullYear();

  // ── 1. Trigrama del Cielo (nacimiento) ────────────────────────────
  // Reducción numérica del año hasta 1 dígito (excepto 10 u 11)
  let yearSum = String(year).split('').reduce((a,d)=>a+parseInt(d),0);
  while (yearSum > 11 || (yearSum > 9 && yearSum !== 10 && yearSum !== 11))
    yearSum = String(yearSum).split('').reduce((a,d)=>a+parseInt(d),0);

  const l1Yang = (yearSum % 2 !== 0);  // Tierra (año)
  const l2Yang = (month   % 2 !== 0);  // Humano (mes)
  const l3Yang = (day     % 2 !== 0);  // Cielo  (día)
  const birthTrigrama  = linesToTrigrama(l1Yang, l2Yang, l3Yang);

  // ── 2. Trigrama de la Tierra (edad actual) ─────────────────────────
  const ageMs    = curr - birth;
  const ageYears = Math.floor(ageMs / (365.25 * 24 * 3600 * 1000));
  const cycleDuration = gender === 'm' ? 8 : 7;
  const cycles   = Math.floor(ageYears / cycleDuration);
  const currentTrigrama = TRIGRAMAS[(birthTrigrama.idx + cycles) % 8];

  // ── 3. Los Cuatro Pilares — cálculo CORRECTO ───────────────────────
  const yearBranchIdx  = getYearBranchIdx(year, month, day);
  const monthBranchIdx = getMonthBranchIdx(year, month, day);
  const dayBranchIdx   = getDayBranchIdx(year, month, day);
  const hourBranchIdx  = getHourBranchIdx(birthHour);

  const pillars = {
    anio: BRANCHES[yearBranchIdx],
    mes:  BRANCHES[monthBranchIdx],
    dia:  BRANCHES[dayBranchIdx],
    hora: BRANCHES[hourBranchIdx],
  };

  // Tonalidad según el pilar seleccionado
  const selBranch = pillars[selectedPillar];
  const corrData  = CORRESPONDENCIAS[selBranch.corrIdx];
  const tonality  = toAnglo(corrData.nota);

  // ── 4. Hexagrama y progresión de acordes ──────────────────────────
  // Reset de cadencias si los trigramas cambian (nuevo cálculo con datos distintos)
  if (birthTrigrama.idx !== _lastBirthTrigramaIdx || currentTrigrama.idx !== _lastCurrentTrigramaIdx) {
    cadenciaCieloIdx = 0;
    cadenciaTierraIdx = 0;
    _lastBirthTrigramaIdx   = birthTrigrama.idx;
    _lastCurrentTrigramaIdx = currentTrigrama.idx;
  }
  const cadenciasCielo  = getCadencias(birthTrigrama);
  const cadenciasTierra = getCadencias(currentTrigrama);
  const cadCielo  = cadenciasCielo [Math.min(cadenciaCieloIdx,  cadenciasCielo.length-1)];
  const cadTierra = cadenciasTierra[Math.min(cadenciaTierraIdx, cadenciasTierra.length-1)];

  const hexLines = [
    {yang: currentTrigrama.lineas[2]===1, level:'Tierra inf.', func:'tonica', tmpl: cadTierra.tonica},
    {yang: currentTrigrama.lineas[1]===1, level:'Humano inf.', func:'sub',    tmpl: cadTierra.sub},
    {yang: currentTrigrama.lineas[0]===1, level:'Cielo inf.',  func:'dom',    tmpl: cadTierra.dom},
    {yang: birthTrigrama.lineas[2]===1,   level:'Tierra sup.', func:'tonica', tmpl: cadCielo.tonica},
    {yang: birthTrigrama.lineas[1]===1,   level:'Humano sup.', func:'sub',    tmpl: cadCielo.sub},
    {yang: birthTrigrama.lineas[0]===1,   level:'Cielo sup.',  func:'dom',    tmpl: cadCielo.dom},
  ];

  const chords = hexLines.map((l,i) => {
    return {roman:l.tmpl, note:romanToNote(l.tmpl, tonality, !l.yang),
            yang:l.yang, level:l.level, func:l.func, lineNum:i+1};
  });

  // Cache para exportar a PDF
  _lastMomentoVital = {
    birthStr, currStr, gender, birthHour,
    ageYears, cycles, cycleDuration,
    birthTrigrama, currentTrigrama,
    pillars, selectedPillar, selBranch, corrData, tonality,
    cadCielo, cadTierra, cadenciaCieloIdx, cadenciaTierraIdx,
    hexLines, chords
  };

  // ── 5. Render ──────────────────────────────────────────────────────
  const result = document.getElementById('mvResult');
  result.classList.add('visible');

  const pillarNames = {anio:'del Año',mes:'del Mes',dia:'del Día',hora:'de la Hora'};
  const pillarNamesEN = {anio:'Year',mes:'Month',dia:'Day',hora:'Hour'};
  const funcLabel   = ['Tónica','Subdominante','Dominante'];
  const funcLabelEN = ['Tonic','Subdominant','Dominant'];
  const funcKeys    = ['tonica','sub','dom'];
  const isEN = window._lang === 'en';

  const _pillarNames = isEN ? pillarNamesEN : pillarNames;
  const _funcLabel   = isEN ? funcLabelEN   : funcLabel;

  const pillarCard = (key, labelES, labelEN) => {
    const b = pillars[key];
    const c = CORRESPONDENCIAS[b.corrIdx];
    const sel = key === selectedPillar;
    const nota = isEN ? (I18N.en['note_'+b.corrIdx] || toAnglo(c.nota)) : c.nota;
    const canal = isEN ? (CONTENT_TRANSLATIONS.en[c.canal] || c.canal) : c.canal;
    const label = isEN ? labelEN : labelES;
    return `
      <div style="border:${sel?'1px solid var(--vio3)':'1px solid var(--border)'};
        border-radius:4px;padding:0.75rem;background:${sel?'rgba(139,26,26,0.06)':'var(--bg)'};
        cursor:pointer;transition:all 0.2s" onclick="selectPillarAndRecalc('${key}')">
        <div style="font-size:0.7rem;color:var(--muted);font-family:'Cinzel',serif;
          letter-spacing:0.06em;margin-bottom:0.3rem">${label}</div>
        <div style="font-size:1.5rem">${b.emoji}</div>
        <div style="font-family:'Cinzel',serif;font-size:0.9rem;color:${sel?'var(--vio4)':'var(--text)'}">
          ${b.sym} · ${isEN ? CONTENT_TRANSLATIONS.en[b.animal] || b.animal : b.animal}
        </div>
        <div style="font-size:0.78rem;color:var(--muted);margin-top:0.15rem">${b.pin}</div>
        <div style="font-size:0.82rem;color:${sel?'var(--vio4)':'var(--gold2)'};font-family:'Cinzel',serif;margin-top:0.3rem">
          ${canal} · ${isEN ? toAnglo(c.nota) : c.nota}
        </div>
      </div>`;
  };

  const trigNameEN = {Cielo:'Heaven',Tierra:'Earth',Trueno:'Thunder',Agua:'Water',Montaña:'Mountain',Viento:'Wind',Fuego:'Fire',Lago:'Lake'};
  const _trigName = (t) => isEN ? (trigNameEN[t.nombre] || t.nombre) : t.nombre;
  const _pillarLabel = isEN
    ? { anio:'YEAR PILLAR<br><small>Image / Ext. Family</small>',
        mes: 'MONTH PILLAR<br><small>Work / Vocation</small>',
        dia: 'DAY PILLAR<br><small>Inner Life / Soul</small>',
        hora:'HOUR PILLAR<br><small>Children / Patients</small>' }
    : { anio:'PILAR DEL AÑO<br><small>Imagen / Familia ext.</small>',
        mes: 'PILAR DEL MES<br><small>Trabajo / Vocación</small>',
        dia: 'PILAR DEL DÍA<br><small>Vida íntima / Alma</small>',
        hora:'PILAR DE LA HORA<br><small>Hijos / Pacientes</small>' };

  const _cuatroPilares = isEN
    ? 'THE FOUR PILLARS OF DESTINY — click to change the working sphere:'
    : 'LOS CUATRO PILARES DEL DESTINO — haz clic para cambiar la esfera de trabajo:';
  const _trigramaCielo  = isEN ? 'HEAVEN TRIGRAM (immutable)' : 'TRIGRAMA DEL CIELO (inmutable)';
  const _trigramaTierra = isEN ? 'EARTH TRIGRAM (current)'    : 'TRIGRAMA DE LA TIERRA (actual)';
  const _tonalBase      = isEN ? 'BASE TONALITY'              : 'TONALIDAD BASE';
  const _ageWord        = isEN ? 'years'                      : 'años';
  const _cycleWord      = isEN ? 'Cycle'                      : 'Ciclo';
  const _pillarOf       = isEN ? 'Pillar'                     : 'Pilar';
  const _cadCielo       = isEN ? `CADENCE · HEAVEN TRIGRAM ${birthTrigrama.sym} ${_trigName(birthTrigrama)}`
                               : `CADENCIA · TRIGRAMA DEL CIELO ${birthTrigrama.sym} ${birthTrigrama.nombre}`;
  const _cadTierra      = isEN ? `CADENCE · EARTH TRIGRAM ${currentTrigrama.sym} ${_trigName(currentTrigrama)}`
                               : `CADENCIA · TRIGRAMA DE LA TIERRA ${currentTrigrama.sym} ${currentTrigrama.nombre}`;
  const _polaridades    = isEN ? 'Polarities:' : 'Polaridades:';
  const _tonicaWord     = isEN ? 'tonic'        : 'tónica';
  const _subdomWord     = isEN ? 'subdom.'      : 'subdom.';
  const _domWord        = isEN ? 'dom.'         : 'dom.';
  const _tblHeaders     = isEN ? ['LINE','LEVEL','FUNCTION','CHORD','UNIVERSE'] : ['LÍNEA','NIVEL','FUNCIÓN','ACORDE','UNIVERSO'];
  const _hexGram        = isEN ? 'Hexagram:'   : 'Hexagrama:';
  const _sequenceNote   = isEN
    ? 'This sequence is worked session by session. The hexagram is a map of the vital moment, not a verdict.'
    : 'Esta secuencia se trabaja sesión a sesión. El hexagrama es un mapa del momento vital, no una sentencia.';
  const _playProg       = isEN ? '▶ Listen to full progression' : '▶ Escuchar progresión completa';
  const _hexInfo        = isEN ? '📖 Hexagram information'      : '📖 Información del hexagrama';
  const _exportPDF      = isEN ? '📄 Export PDF'                : '📄 Exportar PDF';
  const _momentoVital   = isEN ? '☯ Vital Moment of Being'      : '☯ Momento Vital del Ser';

  const hexLevelEN = {
    'Tierra inf.':'Earth (lower)','Humano inf.':'Human (lower)','Cielo inf.':'Heaven (lower)',
    'Tierra sup.':'Earth (upper)','Humano sup.':'Human (upper)','Cielo sup.':'Heaven (upper)'
  };
  const _lvl = (l) => isEN ? (hexLevelEN[l] || l) : l;
  const _yang = (y) => isEN ? (y ? 'Yang (Major)' : 'Yin (Minor)') : (y ? 'Yang (Mayor)' : 'Yin (Menor)');
  const _corrCanal = (c) => isEN ? (CONTENT_TRANSLATIONS.en[c.canal] || c.canal) : c.canal;

  result.innerHTML = `
    <h3 style="font-family:'Cinzel',serif;color:var(--vio4);margin-bottom:1rem;font-size:1.1rem">
      ${_momentoVital}
    </h3>

    <!-- Cuatro Pilares -->
    <p style="font-size:0.78rem;color:var(--muted);margin-bottom:0.6rem;font-family:'Cinzel',serif;letter-spacing:0.05em">
      ${_cuatroPilares}
    </p>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:0.5rem;margin-bottom:1.5rem">
      ${pillarCard('anio','PILAR DEL AÑO<br><small>Imagen / Familia ext.</small>',_pillarLabel.anio)}
      ${pillarCard('mes', 'PILAR DEL MES<br><small>Trabajo / Vocación</small>',_pillarLabel.mes)}
      ${pillarCard('dia', 'PILAR DEL DÍA<br><small>Vida íntima / Alma</small>',_pillarLabel.dia)}
      ${pillarCard('hora','PILAR DE LA HORA<br><small>Hijos / Pacientes</small>',_pillarLabel.hora)}
    </div>

    <!-- Trigramas -->
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:0.75rem;margin-bottom:1.25rem">
      <div class="card" style="margin:0;text-align:center">
        <div style="font-size:0.72rem;color:var(--muted);font-family:'Cinzel',serif;letter-spacing:0.05em">${_trigramaCielo}</div>
        <div style="font-size:2.5rem;margin:0.25rem 0">${birthTrigrama.sym}</div>
        <div style="font-size:0.95rem;color:var(--vio4);font-family:'Cinzel',serif">${_trigName(birthTrigrama)}</div>
        <div style="font-size:0.78rem;color:var(--muted)">${birthTrigrama.chino}</div>
      </div>
      <div class="card" style="margin:0;text-align:center">
        <div style="font-size:0.72rem;color:var(--muted);font-family:'Cinzel',serif;letter-spacing:0.05em">${_trigramaTierra}</div>
        <div style="font-size:2.5rem;margin:0.25rem 0">${currentTrigrama.sym}</div>
        <div style="font-size:0.95rem;color:var(--vio4);font-family:'Cinzel',serif">${_trigName(currentTrigrama)}</div>
        <div style="font-size:0.78rem;color:var(--muted)">${currentTrigrama.chino} · ${ageYears} ${_ageWord} · ${_cycleWord} ${cycles+1}</div>
      </div>
      <div class="card" style="margin:0;text-align:center">
        <div style="font-size:0.72rem;color:var(--muted);font-family:'Cinzel',serif;letter-spacing:0.05em">${_tonalBase}</div>
        <div style="font-size:2rem;font-family:'Cinzel',serif;color:var(--vio4);margin:0.25rem 0">${tonality}</div>
        <div style="font-size:0.82rem;color:var(--text)">${_corrCanal(corrData)}</div>
        <div style="font-size:0.75rem;color:var(--muted);margin-top:0.2rem">${_pillarOf} ${_pillarNames[selectedPillar]}: ${selBranch.sym} ${isEN ? (CONTENT_TRANSLATIONS.en[selBranch.animal] || selBranch.animal) : selBranch.animal}</div>
      </div>
    </div>

    <!-- Selector de cadencias por trigrama (48 combinaciones c/u — Cap. 30.8) -->
    ${(() => {
      const noteFor = (c, level) => {
        const pol = level==='tonica' ? c.tonicPol : (level==='sub' ? c.subPol : c.domPol);
        const r   = c[level];
        return romanToNote(r, tonality, pol==='Yin');
      };
      const buildOpts = (cads, selIdx) => cads.map((c,i)=>{
        const romans = `${c.tonica}-${c.sub}-${c.dom}`;
        const notes  = `${noteFor(c,'tonica')}-${noteFor(c,'sub')}-${noteFor(c,'dom')}`;
        return `<option value="${i}" ${i===selIdx?'selected':''}>N°${c.idx} · ${romans} (${notes})</option>`;
      }).join('');
      return `
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:0.75rem;margin-bottom:1rem">
        <div style="border:1px solid var(--border);border-radius:4px;padding:0.65rem 0.75rem;background:var(--bg)">
          <label style="display:block;font-size:0.7rem;color:var(--muted);font-family:'Cinzel',serif;letter-spacing:0.05em;margin-bottom:0.35rem">
            ${_cadCielo}
          </label>
          <select id="mvCadCielo" onchange="onCadenciaChange('cielo', this.value)"
            style="width:100%;background:var(--bg);color:var(--text);border:1px solid var(--border);
            border-radius:3px;padding:0.4rem 0.5rem;font-family:'EB Garamond',Georgia,serif;font-size:0.9rem">
            ${buildOpts(cadenciasCielo, cadenciaCieloIdx)}
          </select>
          <div style="font-size:0.7rem;color:var(--muted);margin-top:0.3rem;font-style:italic">
            ${_polaridades} ${_tonicaWord} ${cadenciasCielo[0].tonicPol} · ${_subdomWord} ${cadenciasCielo[0].subPol} · ${_domWord} ${cadenciasCielo[0].domPol}
          </div>
        </div>
        <div style="border:1px solid var(--border);border-radius:4px;padding:0.65rem 0.75rem;background:var(--bg)">
          <label style="display:block;font-size:0.7rem;color:var(--muted);font-family:'Cinzel',serif;letter-spacing:0.05em;margin-bottom:0.35rem">
            ${_cadTierra}
          </label>
          <select id="mvCadTierra" onchange="onCadenciaChange('tierra', this.value)"
            style="width:100%;background:var(--bg);color:var(--text);border:1px solid var(--border);
            border-radius:3px;padding:0.4rem 0.5rem;font-family:'EB Garamond',Georgia,serif;font-size:0.9rem">
            ${buildOpts(cadenciasTierra, cadenciaTierraIdx)}
          </select>
          <div style="font-size:0.7rem;color:var(--muted);margin-top:0.3rem;font-style:italic">
            ${_polaridades} ${_tonicaWord} ${cadenciasTierra[0].tonicPol} · ${_subdomWord} ${cadenciasTierra[0].subPol} · ${_domWord} ${cadenciasTierra[0].domPol}
          </div>
        </div>
      </div>`;
    })()}

    <!-- Tabla hexagrama -->
    <div style="background:var(--bg);border:1px solid var(--border);border-radius:3px;padding:1rem;margin-bottom:1rem;overflow-x:auto">
      <table style="width:100%;font-size:0.84rem;border-collapse:collapse;min-width:420px">
        <thead>
          <tr style="border-bottom:1px solid var(--border)">
            ${_tblHeaders.map(h=>`
              <th style="text-align:center;padding:0.3rem 0.5rem;font-family:'Cinzel',serif;
                font-size:0.7rem;color:var(--muted);letter-spacing:0.04em">${h}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${[...hexLines].reverse().map((l,i)=>{
            const chord = chords[hexLines.length-1-i];
            return `<tr style="border-bottom:1px solid rgba(201,168,76,0.15)">
              <td style="padding:0.4rem 0.5rem;text-align:center;font-family:'Cinzel',serif;font-size:0.75rem;color:var(--muted)">${chord.lineNum}</td>
              <td style="padding:0.4rem 0.5rem;text-align:center;font-size:0.82rem">${_lvl(l.level)}</td>
              <td style="padding:0.4rem 0.5rem;text-align:center;color:var(--muted);font-size:0.82rem">${_funcLabel[funcKeys.indexOf(l.func)]}</td>
              <td style="padding:0.4rem 0.5rem;text-align:center;font-family:'EB Garamond',Georgia,serif;font-weight:600;font-size:1rem;color:var(--vio4);cursor:pointer" onclick="playChord('${chord.note}')" title="\u266a ${chord.note}">${chord.note} <span style="font-size:0.65rem;opacity:0.45">&#9834;</span></td>
              <td style="padding:0.4rem 0.5rem;text-align:center">
                <span style="font-size:0.72rem;padding:0.1rem 0.4rem;border-radius:2px;
                  ${l.yang?'background:rgba(139,26,26,0.1);color:var(--vio4)':'background:rgba(184,146,10,0.1);color:var(--gold2)'}">
                  ${_yang(l.yang)}
                </span>
              </td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>

    <div class="progression-display" style="cursor:pointer" onclick="playMomentoVitalProgression()" title="♪ ${isEN?'Listen to progression':'Escuchar progresión'}">//:&nbsp; ${chords.map(c=>c.note).join(' | ')} &nbsp;://</div>
    <div style="text-align:center;margin-top:0.5rem">
      <button class="play-progression-btn" onclick="playMomentoVitalProgression()">${_playProg}</button>
      <button class="play-progression-btn" onclick="showHexagramInfoFromMomentoVital()" style="margin-left:0.5rem;background:transparent;border:1px solid var(--vio3);color:var(--vio4)">${_hexInfo}</button>
      <button class="play-progression-btn" onclick="exportMomentoVitalPDF()" style="margin-left:0.5rem;background:transparent;border:1px solid var(--vio3);color:var(--vio4)">${_exportPDF}</button>
    </div>

    <p style="font-size:0.8rem;color:var(--muted);margin-top:0.75rem;font-style:italic;text-align:center">
      ${_hexGram} ${currentTrigrama.sym}${birthTrigrama.sym} · 
      ${_sequenceNote}
    </p>
  `;

  result.scrollIntoView({behavior:'smooth', block:'center'});
}

function selectPillarAndRecalc(key) {
  selectedPillar = key;
  document.querySelectorAll('.pillar-btn').forEach(b => b.classList.toggle('active', b.dataset.pillar === key));
  calcMomentoVital();
}