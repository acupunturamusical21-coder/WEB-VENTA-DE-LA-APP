// Auto-extracted from monolithic index.html — data module
const TONALITY_TABLE = {
  cara: ['F','C','G','D','A','E'],
  cruz: ['B','F#','Db','Ab','Eb','Bb']
};

const LATIN_TO_ANGLO = {
  'Do':'C','Do♯':'C#','Re♭':'Db','Re':'D','Re♯':'D#','Mi♭':'Eb','Mi':'E',
  'Fa':'F','Fa♯':'F#','Sol♭':'Gb','Sol':'G','Sol♯':'G#','La♭':'Ab',
  'La':'A','La♯':'A#','Si♭':'Bb','Si':'B'
};

const CHORDS_YANG = {
  tonica: ['Imaj7','IIIm7','VIm7','♯IVø7'],
  sub:    ['IVmaj7','IIm7','VIIø7'],
  dom:    ['V7','VIIø7','III7(♭9)','♯V°7']
};

const CHORDS_YIN = {
  tonica: ['im','♭IIImaj7','vm7','♭VIø7'],
  sub:    ['ivm7','♭VImaj7','iiø7'],
  dom:    ['V7(♭9)','vii°7','♭VII7','iiø7']
};

const CHROMATIC = ['C','Db','D','Eb','E','F','F#','G','Ab','A','Bb','B'];

const CHROMATIC_EN = ['C','Db','D','Eb','E','F','F#','G','Ab','A','Bb','B'];

const ROMAN_INTERVALS = {
  'I':0,'II':2,'III':4,'IV':5,'V':7,'VI':9,'VII':11,
  '♭II':1,'♭III':3,'♭VI':8,'♭VII':10,'♯IV':6,
  'i':0,'ii':2,'iii':4,'iv':5,'v':7,'vi':9,'vii':11
};

const NOTE_FREQ_MAP = {
  'C':261.63,'C#':277.18,'Db':277.18,'D':293.66,'D#':311.13,'Eb':311.13,
  'E':329.63,'F':349.23,'F#':369.99,'Gb':369.99,'G':392.00,'G#':415.30,
  'Ab':415.30,'A':440.00,'A#':466.16,'Bb':466.16,'B':493.88,
  'Do':261.63,'Re':293.66,'Mi':329.63,'Fa':349.23,'Sol':392.00,'La':440.00,'Si':493.88
};

const CHORD_INTERVALS = {
  'maj':[0,4,7],'maj7':[0,4,7,11],'maj6':[0,4,7,9],'maj9':[0,4,7,11,14],
  'm':[0,3,7],'m7':[0,3,7,10],'m6':[0,3,7,9],'m9':[0,3,7,10,14],
  '7':[0,4,7,10],'9':[0,4,7,10,14],'6':[0,4,7,9],
  'sus2':[0,2,7],'sus4':[0,5,7],'7sus4':[0,5,7,10],
  'dim':[0,3,6],'dim7':[0,3,6,9],
  'half-dim':[0,3,6,10],'m7b5':[0,3,6,10],
  'aug':[0,4,8],'add9':[0,4,7,14],
  'dom7b9':[0,4,7,10,13],
  '6no5':[0,4,9],'sus6':[0,5,9]
};

const QUINTAS_ORDER = ['Do','Sol','Re','La','Mi','Si','Fa♯','Re♭','La♭','Mi♭','Si♭','Fa'];

const EXTRA_SCALES = [
  { nota:'Fa', titulo:'Los Tres Yang — La gran muralla del organismo',
    puntos:['34VB','8P','43E','5ID','10R'],
    notas:['Fa','Sol','La','Do','Re'],
    texto:'Contiene los <strong>tres Yang</strong> (Shao Yang 34VB, Tai Yang 5ID, Yang Ming 43E). Regula el sistema defensivo completo: desde la raíz en Riñón (10R), pasando por la producción en Pulmón (8P), hasta los tendones (34VB, Hui de tendones). <strong>Clínica:</strong> patologías externas agudas, autoinmunes, procesos crónicos con Wei Qi deprimido.' },
  { nota:'Fa♯', titulo:'El Gran Desbloqueador — cuando el Qi no puede moverse',
    puntos:['3H','1IG','1B','60V','3XB'],
    notas:['Fa♯','Sol♯','La♯','Do♯','Re♯'],
    texto:'Única escala con <strong>dos Jing-Pozo</strong> (1IG y 1B). 3H mueve lo arraigado, 60V libera el dolor crónico, 3XB protege el Fuego del exceso de Madera. <strong>Clínica:</strong> bloqueos severos del Qi, dolor crónico, congelaciones emocionales, agudos profundos.' },
  { nota:'Re♭', titulo:'Dai Mai — la horizontal de la vida',
    puntos:['40V','5XB','41VB','5IG','9B'],
    notas:['Re♭','Mi♭','Fa','La♭','Si♭'],
    texto:'41VB abre el <strong>Dai Mai</strong> (único vaso extraordinario horizontal). 40V comanda los Shu dorsales. 5XB y 5IG regulan el eje Fuego-Metal. <strong>Clínica:</strong> contención y distribución estructural: lumbar, pelvis, reproducción, eje urogenital, autoinmunes con pérdida de límites.' }
];

const EXTRA_SCALES_EN = [
  {titulo:'The Three Yang — The Great Wall of the organism',
   texto:'Contains the <strong>three Yang</strong> (Shao Yang 34VB, Tai Yang 5ID, Yang Ming 43E). Regulates the complete defensive system. <strong>Clinic:</strong> acute external pathologies, autoimmune conditions, chronic processes with depressed Wei Qi.'},
  {titulo:'The Great Unblocker — when Qi cannot move',
   texto:'The only scale with <strong>two Jing-Well</strong> points (1IG and 1B). 3H moves what is deeply rooted, 60V releases chronic pain. <strong>Clinic:</strong> severe Qi blockages, chronic pain, emotional freezing.'},
  {titulo:'Dai Mai — the horizontal axis of life',
   texto:'41VB opens the <strong>Dai Mai</strong> (the only horizontal extraordinary vessel). 40V commands the dorsal Shu points. <strong>Clinic:</strong> lumbar, pelvis, reproduction, urogenital axis, autoimmune with loss of boundaries.'}
];

const DODECA_ORGAN_ORDER_BY_NOTE = ['Do','Sol','Re','La','Mi','Si','Fa♯','Re♭','La♭','Mi♭','Si♭','Fa'];

const DODECA_ORGAN_ORDER_BY_NOTE_EN = ['C','G','D','A','E','B','F#','Db','Ab','Eb','Bb','F'];

const ORGAN_CAP17_KEYWORD = {
  'Pulmón': 'PULMÓN',
  'Intestino Grueso': 'INTESTINO GRUESO',
  'Estómago': 'ESTÓMAGO',
  'Bazo-Páncreas': 'BAZO',
  'Corazón': 'CORAZÓN',
  'Intestino Delgado': 'INTESTINO DELGADO',
  'Vejiga': 'VEJIGA',
  'Riñón': 'RIÑÓN',
  'Xin Bao (Maestro de Corazón)': 'XIN BAO',
  'San Jiao (Triple Recalentador)': 'SAN JIAO',
  'Vesícula Biliar': 'VESÍCULA BILIAR',
  'Hígado': 'HÍGADO'
};

const ORGAN_CAP17_KEYWORD_EN = {
  'Pulmón': 'LUNG',
  'Intestino Grueso': 'LARGE INTESTINE',
  'Estómago': 'STOMACH',
  'Bazo-Páncreas': 'SPLEEN',
  'Corazón': 'HEART',
  'Intestino Delgado': 'SMALL INTESTINE',
  'Vejiga': 'BLADDER',
  'Riñón': 'KIDNEY',
  'Xin Bao (Maestro de Corazón)': 'XIN BAO',
  'San Jiao (Triple Recalentador)': 'SAN JIAO',
  'Vesícula Biliar': 'GALLBLADDER',
  'Hígado': 'LIVER'
};
