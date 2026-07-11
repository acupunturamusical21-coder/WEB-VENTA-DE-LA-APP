// Auto-extracted from monolithic index.html — data module
const BRANCHES = [
  {idx:0, sym:'子', pin:'Zǐ',   animal:'Rata',      emoji:'🐀', corrIdx:0},   // VB / Fa
  {idx:1, sym:'丑', pin:'Chǒu', animal:'Buey',      emoji:'🐂', corrIdx:1},   // Hígado / Fa♯
  {idx:2, sym:'寅', pin:'Yín',  animal:'Tigre',     emoji:'🐯', corrIdx:2},   // Pulmón / Sol
  {idx:3, sym:'卯', pin:'Mǎo',  animal:'Conejo',    emoji:'🐇', corrIdx:3},   // IG / La♭
  {idx:4, sym:'辰', pin:'Chén', animal:'Dragón',    emoji:'🐉', corrIdx:4},   // Estómago / La
  {idx:5, sym:'巳', pin:'Sì',   animal:'Serpiente', emoji:'🐍', corrIdx:5},   // Bazo / Si♭
  {idx:6, sym:'午', pin:'Wǔ',   animal:'Caballo',   emoji:'🐴', corrIdx:6},   // Corazón / Si
  {idx:7, sym:'未', pin:'Wèi',  animal:'Cabra',     emoji:'🐑', corrIdx:7},   // ID / Do
  {idx:8, sym:'申', pin:'Shēn', animal:'Mono',      emoji:'🐒', corrIdx:8},   // Vejiga / Re♭
  {idx:9, sym:'酉', pin:'Yǒu',  animal:'Gallo',     emoji:'🐓', corrIdx:9},   // Riñón / Re
  {idx:10,sym:'戌', pin:'Xū',   animal:'Perro',     emoji:'🐕', corrIdx:10},  // Xin Bao / Mi♭
  {idx:11,sym:'亥', pin:'Hài',  animal:'Cerdo',     emoji:'🐗', corrIdx:11},  // San Jiao / Mi
];

const JIEQI_C = [
  [5.4055, 5.9300],   // 0  Ene Xiǎohán  ~6 Ene
  [3.8724, 4.6295],   // 1  Feb Lìchūn   ~4 Feb  ← CLAVE para inicio año chino
  [5.6300, 6.3826],   // 2  Mar Jīngzhé  ~6 Mar
  [4.8120, 5.5220],   // 3  Abr Qīngmíng ~5 Abr
  [5.5100, 6.3780],   // 4  May Lìxià    ~6 May
  [5.6710, 6.5400],   // 5  Jun Mángzhòng~6 Jun
  [6.3790, 7.1900],   // 6  Jul Xiǎoshǔ  ~7 Jul
  [7.0660, 7.9400],   // 7  Ago Lìqiū    ~7 Ago
  [7.9440, 8.6650],   // 8  Sep Báilù    ~8 Sep
  [8.3170, 9.0980],   // 9  Oct Hánlù    ~8 Oct
  [7.2188, 7.9525],   // 10 Nov Lìdōng   ~7 Nov
  [6.9190, 7.9000],   // 11 Dic Dàxuě    ~7 Dic
];

const TRIGRAMAS = [
  {idx:0, sym:'☰', nombre:'Cielo', chino:'乾 Qián', lineas:[1,1,1], tonica:'Yang', sub:'Yang', dom:'Yang'},
  {idx:1, sym:'☱', nombre:'Lago', chino:'兑 Duì', lineas:[1,1,0], tonica:'Yang', sub:'Yang', dom:'Yin'},
  {idx:2, sym:'☲', nombre:'Fuego', chino:'离 Lí', lineas:[1,0,1], tonica:'Yang', sub:'Yin', dom:'Yang'},
  {idx:3, sym:'☳', nombre:'Trueno', chino:'震 Zhèn', lineas:[1,0,0], tonica:'Yang', sub:'Yin', dom:'Yin'},
  {idx:4, sym:'☴', nombre:'Viento', chino:'巽 Xùn', lineas:[0,1,1], tonica:'Yin', sub:'Yang', dom:'Yang'},
  {idx:5, sym:'☵', nombre:'Agua', chino:'坎 Kǎn', lineas:[0,1,0], tonica:'Yin', sub:'Yang', dom:'Yin'},
  {idx:6, sym:'☶', nombre:'Montaña', chino:'艮 Gèn', lineas:[0,0,1], tonica:'Yin', sub:'Yin', dom:'Yang'},
  {idx:7, sym:'☷', nombre:'Tierra', chino:'坤 Kūn', lineas:[0,0,0], tonica:'Yin', sub:'Yin', dom:'Yin'},
];

const TRIG_ES_TO_KEY = {
  'Cielo':'Qian','Tierra':'Kun','Trueno':'Zhen','Agua':'Kan',
  'Montaña':'Gen','Viento':'Xun','Fuego':'Li','Lago':'Dui'
};

const TRIGRAMAS_BIN = {
  'Qian':{sym:'\u2630',pin:'Qi\u00e1n',es:'Cielo',   lin:[1,1,1]},
  'Kun': {sym:'\u2637',pin:'K\u016bn',  es:'Tierra',  lin:[0,0,0]},
  'Zhen':{sym:'\u2633',pin:'Zh\u00e8n', es:'Trueno',  lin:[1,0,0]},
  'Kan': {sym:'\u2635',pin:'K\u01cen',  es:'Agua',    lin:[0,1,0]},
  'Gen': {sym:'\u2636',pin:'G\u00e8n',  es:'Monta\u00f1a',lin:[0,0,1]},
  'Xun': {sym:'\u2634',pin:'X\u00f9n',  es:'Viento',  lin:[0,1,1]},
  'Li':  {sym:'\u2632',pin:'L\u00ed',   es:'Fuego',   lin:[1,0,1]},
  'Dui': {sym:'\u2631',pin:'Du\u00ec',  es:'Lago',    lin:[1,1,0]},
};

const TRIGRAMAS_EN = {
  'Qian': 'Heaven',
  'Kun': 'Earth',
  'Zhen': 'Thunder',
  'Kan': 'Water',
  'Gen': 'Mountain',
  'Xun': 'Wind',
  'Li': 'Fire',
  'Dui': 'Lake'
};

const AJEDREZ_SUBS = [
  "“El Verbo Creador”",
  "“La Obediencia”",
  "“La Redención Inevitable”",
  "“La Inocencia Reveladora”",
  "“Lo Imprescindible”",
  "“La Irremediable Resolución”",
  "“La Fuerza de la Evidencia”",
  "“La Comunión”",
  "“La Gracia del Detalle”",
  "“La Inutilidad del Tiempo”",
  "“La Sintonía de los Opuestos”",
  "“La Grandeza de lo Inexplicable”",
  "“El Compromiso”",
  "“La Entrega Indefensa”",
  "“La Aceptación Complaciente”",
  "“La Esperanza Perseverante”",
  "“La Dócil Continuidad”",
  "“El Hacer Irremediable”",
  "“La Fusión Progresiva”",
  "“La Aceptación de la Totalidad”",
  "“El Vórtice de la Carne”",
  "“La Fe Viva”",
  "“El Duelo”",
  "“La Resurrección”",
  "“Hacer sin querer, Debiendo”",
  "“La Obediencia de Vida”",
  "“Lo Imprescindible en el Tiempo Adecuado”",
  "“La Fidelidad de la Providencia”",
  "“El Abandono a el No-Hacer”",
  "“El Sonido del Color”",
  "“La Llamada de la Virtud”",
  "“La Transmutación del Espíritu”",
  "“La Estrategia del No Combatir”",
  "“El Servicio al Superior”",
  "“La Trascendencia del Instante”",
  "“El que sabe aguardar lo Prometido”",
  "“La Conjunción entre lo Individual y el Clan-Destino”",
  "“El Hombre Estelar”",
  "“El Camino hacia la Dignidad con la Palabra Suficiente”",
  "“La Transfiguración”",
  "“La Adaptación Alegre”",
  "“La Trascendencia de lo Formado”",
  "“La Decisión Firme”",
  "“La Alienación de la Posesión”",
  "“La Agresión de la Avaricia”",
  "“El Camino de Purificación”",
  "“La Liberación a través de lo Prohibido”",
  "“El Rescate de lo Auténtico”",
  "“La Revolución Espiritual”",
  "“La Alquimia del Agua”",
  "“La Permanencia del Principio”",
  "“La Meditación”",
  "“La Escucha Obediente”",
  "“La Oración”",
  "“El Valor de lo Culminante”",
  "“El Mendigo”",
  "“La Complicidad de lo Femenino”",
  "“La Acogida Complaciente del que Busca”",
  "“El Valor de lo Fundido”",
  "“Lo Justo y lo Necesario”",
  "“La Fidelidad a lo Revelado”",
  "“La Belleza está en lo Sencillo”",
  "“El Orgasmo Mantenido”",
  "“El Orgasmo Sostenido”"
];

const AJEDREZ_SUBS_EN = [
  "The Creative Word",
  "Obedience",
  "Inevitable Redemption",
  "Revealing Innocence",
  "The Indispensable",
  "Irremediable Resolution",
  "The Force of Evidence",
  "Communion",
  "The Grace of Detail",
  "The Futility of Time",
  "The Harmony of Opposites",
  "The Greatness of the Inexplicable",
  "The Commitment",
  "Defenseless Surrender",
  "Willing Acceptance",
  "Persevering Hope",
  "Docile Continuity",
  "Irremediable Action",
  "Progressive Fusion",
  "Acceptance of Totality",
  "The Vortex of the Flesh",
  "Living Faith",
  "The Duel",
  "Resurrection",
  "Acting Without Willing, Yet Obliged",
  "Life's Obedience",
  "The Indispensable at the Right Time",
  "The Fidelity of Providence",
  "Abandonment to Non-Action",
  "The Sound of Color",
  "The Call of Virtue",
  "Transmutation of Spirit",
  "The Strategy of Non-Combat",
  "Service to the Superior",
  "The Transcendence of the Instant",
  "One Who Knows How to Await the Promised",
  "The Conjunction Between Individual and Clan-Destiny",
  "The Stellar Man",
  "The Path to Dignity with the Right Word",
  "Transfiguration",
  "Joyful Adaptation",
  "Transcendence of Form",
  "Firm Decision",
  "Alienation of Possession",
  "The Aggression of Greed",
  "The Path of Purification",
  "Liberation Through the Forbidden",
  "Rescue of the Authentic",
  "Spiritual Revolution",
  "The Alchemy of Water",
  "The Permanence of Principle",
  "Meditation",
  "Obedient Listening",
  "Prayer",
  "The Value of the Culminating",
  "The Beggar",
  "The Complicity of the Feminine",
  "The Welcoming of the Seeker",
  "The Value of the Molten",
  "The Just and the Necessary",
  "Fidelity to the Revealed",
  "Beauty Is in Simplicity",
  "Sustained Ecstasy",
  "Perpetual Ecstasy"
];
