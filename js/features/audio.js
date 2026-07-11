// Auto-extraído del monolito index.html — módulo de funcionalidad
// (sin cambios de contenido; solo separado en archivo)

function playChordPiano(chordName) {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const parsed = parseChordName(chordName);
  if (!parsed) return;
  const rootFreq = NOTE_FREQ_MAP[parsed.root];
  if (!rootFreq) return;
  const intervals = CHORD_INTERVALS[parsed.type] || CHORD_INTERVALS['maj'];
  const dur = 2.8;
  const _doPlayPiano = () => {
    const now = audioCtx.currentTime;
    intervals.forEach((semitones, idx) => {
      const t = now + idx * 0.055;
      const freq = rootFreq * Math.pow(2, semitones / 12);
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain); gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.value = freq;
      const vol = idx === 0 ? 0.17 : 0.11;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(vol, t + 0.006);
      gain.gain.exponentialRampToValueAtTime(vol * 0.45, t + 0.18);
      gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
      osc.start(t);
      osc.stop(t + dur + 0.05);
    });
  };
  if (audioCtx.state === 'suspended') audioCtx.resume().then(_doPlayPiano);
  else _doPlayPiano();
}

function playOracleProgression() {
  const chords = window._oracleChords;
  if (!chords || !chords.length) return;
  const dur = 2.0;      // seconds each chord rings
  const gap = 2.4;      // seconds between chord starts
  const btn = document.getElementById('playProgressionBtn');
  const cells = document.querySelectorAll('#chordGrid .chord-cell');

  if (btn) { btn.disabled = true; btn.textContent = '⏸ Reproduciendo…'; }

  // Create/resume AudioContext immediately inside the user-gesture handler
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const _startProgression = () => {
    chords.forEach((note, i) => {
      setTimeout(() => {
        playChord(note, dur);
        cells.forEach((c, j) => c.classList.toggle('playing', j === i));
      }, i * gap * 1000);
    });
    const total = (chords.length - 1) * gap * 1000 + dur * 1000 + 200;
    setTimeout(() => {
      cells.forEach(c => c.classList.remove('playing'));
      if (btn) { btn.disabled = false; btn.textContent = window._lang==='en' ? '▶ Listen to full progression' : '▶ Escuchar progresión completa'; }
    }, total);
  };
  if (audioCtx.state === 'suspended') audioCtx.resume().then(_startProgression);
  else _startProgression();
}

function playMomentoVitalProgression() {
  if (!_lastMomentoVital || !_lastMomentoVital.chords) {
    alert(window._lang==='en'?'Please calculate the Vital Moment first.':'Primero calcula el Momento Vital.'); return;
  }
  window._oracleChords = _lastMomentoVital.chords.map(c => c.note);
  if (typeof opLoadChords === 'function') opLoadChords(window._oracleChords);
  playOracleProgression();
}

function rootFromEscala(s) {
  if (!s) return null;
  // Match note names with accidentals first (longest match)
  const m = s.match(/^(Fa[♯#]|Re[♭b]|Sol[♯#]|La[♭b]|Si[♭b]|Do[♯#]|Mi[♭b]|Re[♯#]|Fa|Sol|La|Si|Do|Re|Mi)/u);
  return m ? m[1].replace('#','♯').replace('b','♭') : s.split(' ')[0];
}

let audioCtx = null;

function playNote(freq) {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const _doNote = () => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.frequency.value = freq;
    osc.type = 'sine';
    const now = audioCtx.currentTime;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.3, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 2);
    osc.start(now);
    osc.stop(now + 2);
  };
  if (audioCtx.state === 'suspended') audioCtx.resume().then(_doNote);
  else _doNote();
}

function parseChordName(name) {
  if (!name) return null;
  const n = name.trim().replace(/♯/g,'#').replace(/♭/g,'b');
  const rootMatch = n.match(/^([A-G][#b]?)/);
  if (!rootMatch) return null;
  const root = rootMatch[1];
  const suf = n.slice(root.length).trim();
  const typeMap = {
    '':'maj','M':'maj','maj':'maj','Maj':'maj','Major':'maj',
    'm':'m','min':'m','minor':'m','-':'m',
    'maj7':'maj7','M7':'maj7','\u03947':'maj7','\u0394':'maj7',
    'm7':'m7','min7':'m7','-7':'m7',
    '7':'7','dom':'7','dom7':'7',
    'sus4':'sus4','sus':'sus4','7sus4':'7sus4','sus2':'sus2',
    'dim':'dim','dim7':'dim7','\u00b0':'dim','\u00b07':'dim7',
    '\u00f87':'half-dim','\u00f8':'half-dim','m7b5':'m7b5','m7\u266d5':'m7b5',
    'aug':'aug','+':'aug','6':'6','maj6':'maj6','m6':'m6',
    '7(\u266d9)':'dom7b9','7b9':'dom7b9','9':'9','m9':'m9','add9':'add9',
    '6no5':'6no5','6(no5)':'6no5','sus6':'sus6','6sus4':'sus6'
  };
  const type = typeMap[suf] || typeMap[suf.toLowerCase()] || 'maj';
  return {root, type};
}

function playChord(chordName, dur) {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const duration = dur || 2.2;
  const parsed = parseChordName(chordName);
  if (!parsed) return;
  const rootFreq = NOTE_FREQ_MAP[parsed.root];
  if (!rootFreq) return;
  const intervals = CHORD_INTERVALS[parsed.type] || CHORD_INTERVALS['maj'];
  const _doPlayChord = () => {
    const now = audioCtx.currentTime;
    intervals.forEach((semitones, idx) => {
      const freq = rootFreq * Math.pow(2, semitones/12) * 0.5;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain); gain.connect(audioCtx.destination);
      osc.type = idx === 0 ? 'triangle' : 'sine';
      osc.frequency.value = freq;
      const vol = idx === 0 ? 0.18 : 0.10;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(vol, now + 0.06 + idx * 0.04);
      gain.gain.setValueAtTime(vol * 0.85, now + duration * 0.55);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
      osc.start(now);
      osc.stop(now + duration);
    });
  };
  if (audioCtx.state === 'suspended') audioCtx.resume().then(_doPlayChord);
  else _doPlayChord();
}

function playNoteByName(noteName) {
  const c = CORRESPONDENCIAS.find(x => x.nota === noteName);
  if (c) { playNote(c.freq); return; }
  const f = NOTE_FREQ_MAP[noteName] || NOTE_FREQ_MAP[noteName.replace(/♯/g,'#').replace(/♭/g,'b')];
  if (f) {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.type = 'triangle'; osc.frequency.value = f;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.22, now + 0.04);
    gain.gain.setValueAtTime(0.22, now + 0.35);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.75);
    osc.start(now); osc.stop(now + 0.75);
  }
}

function parseTriadaNotaNames(notasStr) {
  // 'RE – SOL – DO' → ['Re', 'Sol', 'Do']
  const rawMap = {
    'DO':'Do','RE':'Re','MI':'Mi','FA':'Fa','SOL':'Sol','LA':'La','SI':'Si',
    'DOB':'Do♭','REB':'Re♭','MIB':'Mi♭','FAB':'Fa♭','SOLB':'Sol♭','LAB':'La♭','SIB':'Si♭',
    'DO♯':'Do♯','RE♯':'Re♯','MI♯':'Mi♯','FA♯':'Fa♯','SOL♯':'Sol♯','LA♯':'La♯','SI♯':'Si♯',
    'DO♭':'Do♭','RE♭':'Re♭','MI♭':'Mi♭','FA♭':'Fa♭','SOL♭':'Sol♭','LA♭':'La♭','SI♭':'Si♭'
  };
  return notasStr.split(/\s*[–-]\s*/).map(function(n) {
    var k = n.trim().toUpperCase();
    return rawMap[k] || n.trim();
  });
}

function getTriadaFreqs(noteNames) {
  // Mapa enarmónico: convierte sostenidos españoles a bemoles equivalentes
  // que sí están en CORRESPONDENCIAS (Sol♯=La♭, Do♯=Re♭, Re♯=Mi♭, La♯=Si♭, Mi♯=Fa, Si♯=Do)
  var enarmonicos = {
    'Sol♯':'La♭','Do♯':'Re♭','Re♯':'Mi♭',
    'La♯':'Si♭','Mi♯':'Fa','Si♯':'Do','Fa♭':'Mi'
  };
  return noteNames.map(function(name) {
    var resolved = enarmonicos[name] || name;
    var c = CORRESPONDENCIAS.find(function(x) { return x.nota === resolved; });
    if (c) return c.freq;
    // Fallback: intentar también el nombre original
    c = CORRESPONDENCIAS.find(function(x) { return x.nota === name; });
    if (c) return c.freq;
    var f = NOTE_FREQ_MAP[resolved] || NOTE_FREQ_MAP[resolved.replace(/♯/g,'#').replace(/♭/g,'b')];
    if (f) return f;
    f = NOTE_FREQ_MAP[name] || NOTE_FREQ_MAP[name.replace(/♯/g,'#').replace(/♭/g,'b')];
    return f || null;
  }).filter(Boolean);
}

function playTriadaArpeggio(notasStr, btn) {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  var names = parseTriadaNotaNames(notasStr);
  var freqs = getTriadaFreqs(names);
  if (freqs.length < 2) return;

  // ── Normalización de octavas ──────────────────────────────────────
  // Regla: todas las notas deben estar a partir de Do índice 4 (~261 Hz)
  // y ordenadas de grave a agudo sin saltos raros de octava.
  var DO4 = 261.6;
  function subirHasta(freq, piso) {
    while (freq < piso) freq *= 2;
    return freq;
  }
  // n1: >= Do4
  var n1 = subirHasta(freqs[0], DO4);
  // n2: >= n1 (si quedó por debajo, sube una octava)
  var n2 = subirHasta(freqs[1], n1);
  // n3: >= n2
  var n3 = subirHasta(freqs.length > 2 ? freqs[2] : freqs[1], n2);
  // n1_cima: n1 transpuesto hasta quedar por encima de n3
  var n1_cima = n1;
  while (n1_cima <= n3) n1_cima *= 2;

  // Secuencia: grave→agudo→grave  (n1 n2 n3 n1_cima n3 n2 n1)
  var seqFreqs = [n1, n2, n3, n1_cima, n3, n2, n1];
  var noteDur = 0.38, gap = 0.04;

  var origText = btn ? btn.textContent : '';
  if (btn) { btn.classList.add('playing'); btn.textContent = '♪ tocando…'; }

  var doPlay = function() {
    var t = audioCtx.currentTime;
    // Arpeggio (ascending + descending)
    seqFreqs.forEach(function(f) {
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.connect(gain); gain.connect(audioCtx.destination);
      osc.frequency.value = f;
      osc.type = 'triangle';
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.20, t + 0.04);
      gain.gain.setValueAtTime(0.20, t + noteDur * 0.65);
      gain.gain.exponentialRampToValueAtTime(0.001, t + noteDur);
      osc.start(t); osc.stop(t + noteDur);
      t += noteDur + gap;
    });

    // Final chord — all 3 notes simultaneously
    var chordStart = t + 0.08;
    var chordDur = 2.0;
    [n1, n2, n3].forEach(function(f, idx) {
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.connect(gain); gain.connect(audioCtx.destination);
      osc.type = idx === 0 ? 'triangle' : 'sine';
      osc.frequency.value = f;
      var vol = idx === 0 ? 0.18 : 0.12;
      gain.gain.setValueAtTime(0, chordStart);
      gain.gain.linearRampToValueAtTime(vol, chordStart + 0.06 + idx * 0.03);
      gain.gain.setValueAtTime(vol * 0.85, chordStart + chordDur * 0.55);
      gain.gain.exponentialRampToValueAtTime(0.001, chordStart + chordDur);
      osc.start(chordStart); osc.stop(chordStart + chordDur);
    });

    var totalMs = (seqFreqs.length * (noteDur + gap) + 0.08 + chordDur) * 1000;
    if (btn) setTimeout(function() {
      btn.classList.remove('playing');
      btn.textContent = origText;
    }, totalMs);
  };

  if (audioCtx.state === 'suspended') audioCtx.resume().then(doPlay);
  else doPlay();
}