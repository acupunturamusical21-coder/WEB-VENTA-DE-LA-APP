// Auto-extraído del monolito index.html — módulo de funcionalidad
// (sin cambios de contenido; solo separado en archivo)

function toAnglo(nota) {
  // Handle compound notes like "Fa♯/Sol♭" → take first
  const first = nota.split('/')[0].trim();
  return LATIN_TO_ANGLO[first] || first;
}

function polarityForLevel(trigrama, level) {
  // trigrama.lineas[0]=arriba(dom), [1]=medio(sub), [2]=abajo(tónica)
  const map = {tonica:2, sub:1, dom:0};
  return trigrama.lineas[map[level]] === 1 ? 'Yang' : 'Yin';
}

function getCadencias(trigrama) {
  const tonicPol = polarityForLevel(trigrama,'tonica');
  const subPol   = polarityForLevel(trigrama,'sub');
  const domPol   = polarityForLevel(trigrama,'dom');
  const tonicPool = (tonicPol==='Yang'?CHORDS_YANG:CHORDS_YIN).tonica;
  const subPool   = (subPol==='Yang'?CHORDS_YANG:CHORDS_YIN).sub;
  const domPool   = (domPol==='Yang'?CHORDS_YANG:CHORDS_YIN).dom;
  const out = [];
  let n = 1;
  for (let t = 0; t < tonicPool.length; t++) {
    for (let s = 0; s < subPool.length; s++) {
      for (let d = 0; d < domPool.length; d++) {
        out.push({
          idx: n++,
          tonica: tonicPool[t], sub: subPool[s], dom: domPool[d],
          tonicPol, subPol, domPol
        });
      }
    }
  }
  return out; // 48 elementos
}

let cadenciaCieloIdx  = 0;

let cadenciaTierraIdx = 0;

let _lastBirthTrigramaIdx   = -1;

let _lastCurrentTrigramaIdx = -1;

let _lastMomentoVital = null;

function onCadenciaChange(which, value) {
  const v = parseInt(value, 10) || 0;
  if (which === 'cielo') cadenciaCieloIdx = v;
  else                   cadenciaTierraIdx = v;
  calcMomentoVital();
}

function keyIndex(key) {
  // Normalize
  const k = key.replace('♯','#').replace('♭','b');
  const map = {'Do':0,'Reb':1,'Re':2,'Mib':3,'Mi':4,'Fa':5,'Fa#':6,'Sol':7,'Lab':8,'La':9,'Sib':10,'Si':11,
               'C':0,'Db':1,'D':2,'Eb':3,'E':4,'F':5,'F#':6,'G':7,'Ab':8,'A':9,'Bb':10,'B':11,
               'Do#':1,'Re#':3,'Sol#':8,'La#':10};
  return map[k] !== undefined ? map[k] : 0;
}

function romanToNote(roman, key, isMinor) {
  // Extract the scale degree from the roman numeral chord symbol
  const degreeMap = {
    'Imaj7':'I','IIIm7':'III','VIm7':'VI','♯IVø7':'♯IV',
    'IVmaj7':'IV','IIm7':'II','VIIø7':'VII',
    'V7':'V','III7(♭9)':'III','♯V°7':'V', // ♯V not clean, use V
    'im':'i','♭IIImaj7':'♭III','vm7':'v','♭VIø7':'♭VI',
    'ivm7':'iv','♭VImaj7':'♭VI','iiø7':'ii',
    'V7(♭9)':'V','vii°7':'VII','♭VII7':'♭VII',
  };
  
  const suffix = {
    'Imaj7':'maj7','IIIm7':'m7','VIm7':'m7','♯IVø7':'ø7',
    'IVmaj7':'maj7','IIm7':'m7','VIIø7':'ø7',
    'V7':'7','III7(♭9)':'7(♭9)','♯V°7':'°7',
    'im':'m','♭IIImaj7':'maj7','vm7':'m7','♭VIø7':'ø7',
    'ivm7':'m7','♭VImaj7':'maj7','iiø7':'ø7',
    'V7(♭9)':'7(♭9)','vii°7':'°7','♭VII7':'7',
  };
  
  const degree = degreeMap[roman] || 'I';
  const suf = suffix[roman] || '';
  
  // Get interval
  let interval = 0;
  if (degree.startsWith('♭')) {
    interval = (ROMAN_INTERVALS[degree.slice(1)] - 1 + 12) % 12;
  } else if (degree.startsWith('♯')) {
    interval = (ROMAN_INTERVALS[degree.slice(1)] + 1) % 12;
  } else {
    interval = ROMAN_INTERVALS[degree] || 0;
    // If minor context, adjust III, VI, VII
    if (isMinor) {
      if (degree === 'III') interval = 3;
      else if (degree === 'VI') interval = 8;
      else if (degree === 'VII') interval = 10;
    }
  }
  
  const root = CHROMATIC[(keyIndex(key) + interval) % 12];
  return root + suf;
}

function getChordForLine(polar, func, index, key, isMinor) {
  const pool = polar === 'Yang' ? CHORDS_YANG[func] : CHORDS_YIN[func];
  const chord = pool[index % pool.length];
  const noteName = romanToNote(chord, key, isMinor);
  return {roman: chord, note: noteName, yang: polar === 'Yang'};
}