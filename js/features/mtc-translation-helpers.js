// Auto-extraído — funciones de traducción del motor MTC

function translateTerm(es) {
  if (!es) return es;
  const low = es.toLowerCase().trim();
  // 1. Exact match in dictionary
  for (const [k, v] of TERM_ES_EN_ARR) {
    if (low === k.toLowerCase()) return v;
  }
  // 2. Compound replacement (longest first)
  let result = low;
  for (const [k, v] of TERM_ES_EN_ARR) {
    const re = new RegExp('\\b' + k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'gi');
    result = result.replace(re, v);
  }
  // 3. Fallback word-level for remaining Spanish words
  const wordMap = {
    'dolor':'pain','dolorosa':'painful','doloroso':'painful',
    'fiebre':'fever','fiebre':'fever','baja':'low','alto':'high',
    'crisis':'crisis','sindrome':'syndrome','trastorno':'disorder',
    'enfermedad':'disease','insuficiencia':'insufficiency',
    'deficiencia':'deficiency','estancamiento':'stagnation',
    'estasis':'stasis','calor':'heat','fuego':'fire',
    'flema':'phlegm','humedad':'dampness','viento':'wind',
    'frio':'cold','toxina':'toxin','toxico':'toxic',
    'deficiente':'deficient','exceso':'excess',
    'ascenso':'rising','ascendencia':'ascending',
    'obstruccion':'obstruction','bloqueo':'blockage',
    'colapso':'collapse','hiper':'hyper',
    'perturbado':'disturbed','obstruye':'obstructs',
    'orificios':'orifices','retencion':'retention',
    'alimentos':'food','deficientes':'deficient',
    'sangre':'blood','estomago':'stomach',
    'corazon':'heart','pulmon':'lung',
    'bazo':'spleen','rinon':'kidney','riñon':'kidney',
    'higado':'liver','vesicula':'bladder','gallbladder':'gallbladder',
    'biliar':'biliary','intestino':'intestine',
    'grueso':'large','delgado':'small',
    'vejiga':'bladder','utero':'uterus',
    'jiao':'jiao','inferior':'lower','superior':'upper',
    'esencia':'essence','zheng':'zheng','wei':'wei',
    'shen':'shen','jing':'jing','qi':'qi','yin':'yin','yang':'yang',
    'de':'of','en':'in','con':'with','por':'from','que':'that',
    'los':'the','las':'the','del':'of the','y':'and',
    'e':'and','o':'or','se':'self',
    'sin':'without','muy':'very','no':'no',
  };
  result = result.replace(/\b([a-záéíóúñ]+)\b/gi, (w) => {
    const wl = w.toLowerCase();
    if (wordMap[wl]) return wordMap[wl];
    return w; // leave untranslated if unknown
  });
  return result;
}

function translateSindrome(es) {
  return SINDROME_ES_EN[es] || translateTerm(es);
}

function translatePatologias(arr) {
  return arr.map(p => translateTerm(p));
}

function translateSintomas(arr) {
  return arr.map(s => translateTerm(s));
}

function translateModulo(label) {
  if (!label) return label;
  return label
    .replace(/^Tonificar/i, 'Tonify')
    .replace(/^Dispersar/i, 'Disperse')
    .replace(/Pulmón/g, 'Lung')
    .replace(/Intestino Grueso/g, 'Large Intestine')
    .replace(/Estómago/g, 'Stomach')
    .replace(/Bazo(-Páncreas)?/g, 'Spleen')
    .replace(/Corazón/g, 'Heart')
    .replace(/Intestino Delgado/g, 'Small Intestine')
    .replace(/Vejiga/g, 'Bladder')
    .replace(/Riñón/g, 'Kidney')
    .replace(/Xin Bao \(M\. Corazón\)/g, 'Xin Bao (Pericardium)')
    .replace(/Xin Bao/g, 'Xin Bao')
    .replace(/San Jiao \(Triple Recalentador\)/g, 'San Jiao (Triple Warmer)')
    .replace(/San Jiao/g, 'San Jiao')
    .replace(/Vesícula Biliar/g, 'Gallbladder')
    .replace(/Hígado/g, 'Liver')
    .replace(/con moxa/g, 'with moxa')
    .replace(/Escala Extraord\./g, 'Extraord. Scale')
    .replace(/mayor/g, 'major');
}

function translateTriada(label) {
  if (!label) return label;
  // Keep "Tríada N (Note):" structure, translate the description part
  const m = label.match(/^(Tríada\s+\d+\s*\([^)]+\)):\s*(.+)$/i);
  if (!m) return label;
  return m[1] + ': ' + translateTerm(m[2]);
}

function getNombreOrganoEN(idx) {
  const names = ['Lung','Large Intestine','Stomach','Spleen-Pancreas','Heart','Small Intestine',
    'Bladder','Kidney','Xin Bao (Pericardium)','San Jiao (Triple Warmer)','Gallbladder','Liver'];
  return names[idx] || '';
}

