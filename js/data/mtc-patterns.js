// Auto-extracted from monolithic index.html — data module
const SINDROME_ORGANO_MAP = {
  'bazo': 3, 'estomago': 2, 'pulmon': 0, 'corazon': 4,
  'rinon': 7, 'higado': 11, 'vesicula': 10, 'intestino grueso': 1,
  'intestino delgado': 5, 'vejiga': 6, 'xin bao': 8, 'san jiao': 9
};

const TRIADAS_BY_PATTERN = {
  'deficiencia': ['Tríada 1 (Si♭): Deficiencia triple raíz', 'Tríada 5 (Do): Restauración sistémica'],
  'deficiencia de qi de bazo': ['Tríada 1 (Si♭): Deficiencia triple raíz', 'Tríada 5 (Re♭): Humedad por sobrecarga mental'],
  'deficiencia de qi de pulmon': ['Tríada 1 (Sol): Deficiencia de descenso', 'Tríada 1 (Si♭): Deficiencia triple raíz'],
  'deficiencia de qi de corazon': ['Tríada 4 (Sol): Desconexión Corazón-Riñón', 'Tríada 1 (Si♭): Deficiencia triple raíz'],
  'deficiencia de yang de rinon': ['Tríada 1 (Si♭): Deficiencia triple raíz', 'Tríada 1 (Re): Eje Agua-Madera-Fuego'],
  'deficiencia de yin de rinon': ['Tríada 4 (Sol): Desconexión Corazón-Riñón', 'Tríada 2 (Do): Deficiencia de Yin con calor vacío'],
  'deficiencia de yin de corazon': ['Tríada 4 (Sol): Desconexión Corazón-Riñón', 'Tríada 4 (Si): Fuego emocional intenso'],
  'deficiencia de yin de estomago': ['Tríada 5 (Sol): Sequedad por deficiencia', 'Tríada 2 (Sol): Deficiencia con calor vacío'],
  'deficiencia de yin de pulmon': ['Tríada 5 (Sol): Sequedad por deficiencia', 'Tríada 1 (Sol): Deficiencia de descenso'],
  'deficiencia de sangre': ['Tríada 1 (La): Deficiencia de sangre del Hígado', 'Tríada 1 (Si♭): Deficiencia triple raíz'],
  'deficiencia de sangre de higado': ['Tríada 1 (La): Deficiencia de sangre del Hígado', 'Tríada 1 (Fa♯): Eje Hígado-Bazo-Xin Bao'],
  'deficiencia de sangre de corazon': ['Tríada 4 (Sol): Desconexión Corazón-Riñón', 'Tríada 1 (Si♭): Deficiencia triple raíz'],
  'deficiencia de esencia jing': ['Tríada 1 (Si♭): Deficiencia triple raíz', 'Tríada 1 (Re): Eje Agua-Madera-Fuego'],
  'deficiencia de zheng qi': ['Tríada 1 (Si♭): Deficiencia triple raíz', 'Tríada 5 (Do): Restauración sistémica'],
  'deficiencia de wei qi': ['Tríada 1 (Sol): Deficiencia de descenso', 'Tríada 1 (Si♭): Deficiencia triple raíz'],
  'estancamiento de qi de higado': ['Tríada 3 (Re♭): Eje estrés crónico', 'Tríada 5 (La♭): Estancamiento Hígado-Bazo', 'Tríada 1 (Fa♯): Eje Hígado-Bazo-Xin Bao'],
  'estancamiento': ['Tríada 3 (Re♭): Eje estrés crónico', 'Tríada 4 (La): Estancamiento del San Jiao'],
  'estasis de sangre': ['Tríada 4 (Re♭): Dolor muscular generalizado', 'Tríada 1 (Fa♯): Eje Hígado-Bazo-Xin Bao'],
  'estasis de sangre en corazon': ['Tríada 4 (Si): Fuego emocional intenso', 'Tríada 4 (Sol): Desconexión Corazón-Riñón'],
  'calor en estomago': ['Tríada 2 (La♭): Estómago por estrés', 'Tríada 5 (Sol): Sequedad por deficiencia'],
  'calor en intestino grueso': ['Tríada 3 (Mi♭): Calor con múltiples salidas', 'Tríada 1 (La♭): Calor en tres Yang'],
  'calor en sangre': ['Tríada 3 (Mi♭): Calor con múltiples salidas', 'Tríada 1 (La♭): Calor en tres Yang'],
  'calor toxico en sangre': ['Tríada 3 (Mi♭): Calor con múltiples salidas', 'Tríada 4 (La♭): Fuego en Xin Bao'],
  'calor': ['Tríada 3 (Mi♭): Calor con múltiples salidas', 'Tríada 1 (La♭): Calor en tres Yang'],
  'fuego de corazon': ['Tríada 1 (Si): Fuego excesivo en Corazón', 'Tríada 4 (Si): Fuego emocional intenso'],
  'fuego de higado': ['Tríada 3 (Re): Fuego Hígado-Corazón', 'Tríada 5 (La): Hígado enciende Corazón'],
  'fuego toxico': ['Tríada 3 (Mi♭): Calor con múltiples salidas', 'Tríada 4 (La♭): Fuego en Xin Bao'],
  'flema': ['Tríada 5 (Re♭): Humedad por sobrecarga mental', 'Tríada 3 (La♭): Hígado invade Estómago'],
  'flema-calor': ['Tríada 3 (Mi♭): Calor con múltiples salidas', 'Tríada 1 (La♭): Calor en tres Yang'],
  'flema-humedad': ['Tríada 5 (Re♭): Humedad por sobrecarga mental', 'Tríada 5 (Do): Restauración sistémica'],
  'flema que obstruye': ['Tríada 5 (Re♭): Humedad por sobrecarga mental', 'Tríada 4 (La♭): Fuego en Xin Bao'],
  'humedad-calor': ['Tríada 3 (Mi♭): Calor con múltiples salidas', 'Tríada 5 (Re♭): Humedad por sobrecarga mental'],
  'humedad-calor en higado': ['Tríada 5 (La♭): Estancamiento Hígado-Bazo', 'Tríada 3 (Mi♭): Calor con múltiples salidas'],
  'humedad-calor en jiao': ['Tríada 3 (Mi♭): Calor con múltiples salidas', 'Tríada 5 (Re♭): Humedad por sobrecarga mental'],
  'humedad-calor en vejiga': ['Tríada 3 (Mi♭): Calor con múltiples salidas', 'Tríada 1 (Re): Eje Agua-Madera-Fuego'],
  'humedad': ['Tríada 5 (Re♭): Humedad por sobrecarga mental', 'Tríada 3 (La♭): Hígado invade Estómago'],
  'viento-calor': ['Tríada 3 (Mi♭): Calor con múltiples salidas', 'Tríada 1 (La♭): Calor en tres Yang'],
  'viento-frio': ['Tríada 1 (Sol): Deficiencia de descenso', 'Tríada 5 (Re♭): Humedad por sobrecarga mental'],
  'viento-humedad': ['Tríada 4 (Re♭): Dolor muscular generalizado', 'Tríada 1 (Fa♯): Eje Hígado-Bazo-Xin Bao'],
  'viento-humedad-calor': ['Tríada 4 (Re♭): Dolor muscular generalizado', 'Tríada 3 (Mi♭): Calor con múltiples salidas'],
  'viento-humedad-frio': ['Tríada 4 (Re♭): Dolor muscular generalizado', 'Tríada 1 (Re): Eje Agua-Madera-Fuego'],
  'viento interno': ['Tríada 3 (La): Ascenso de Yang del Hígado', 'Tríada 5 (La): Hígado enciende Corazón'],
  'viento': ['Tríada 3 (La): Ascenso de Yang del Hígado', 'Tríada 4 (Re♭): Dolor muscular generalizado'],
  'ascenso de yang': ['Tríada 3 (La): Ascenso de Yang del Hígado', 'Tríada 4 (Re): Deficiencia Tierra-Hígado'],
  'frio en utero': ['Tríada 1 (Re): Eje Agua-Madera-Fuego', 'Tríada 5 (Do): Restauración sistémica'],
  'shen perturbado': ['Tríada 4 (Si): Fuego emocional intenso', 'Tríada 1 (Si): Fuego excesivo en Corazón'],
  'toxina-calor': ['Tríada 3 (Mi♭): Calor con múltiples salidas', 'Tríada 4 (La♭): Fuego en Xin Bao'],
  'retencion de alimentos': ['Tríada 2 (La♭): Estómago por estrés', 'Tríada 3 (La♭): Hígado invade Estómago'],
  // ── Entradas añadidas iter-1: 12 síndromes sin mapeo específico ──
  'deficiencia de bazo': ['Tríada 1 (Si♭): Deficiencia triple raíz', 'Tríada 5 (Re♭): Humedad por sobrecarga mental', 'Tríada 3 (Fa♯): Deficiencia de Bazo con ansiedad'],
  'deficiencia de jing': ['Tríada 1 (Re): Eje Agua-Madera-Fuego', 'Tríada 1 (Si♭): Deficiencia triple raíz', 'Tríada 3 (Si♭): Deficiencia Riñón-Pulmón'],
  'deficiencia de qi de bazo y corazon': ['Tríada 1 (Si♭): Deficiencia triple raíz', 'Tríada 4 (Sol): Desconexión Corazón-Riñón', 'Tríada 4 (Mi♭): Deficiencia Tierra-Fuego-Metal'],
  'deficiencia de qi de rinon': ['Tríada 1 (Re): Eje Agua-Madera-Fuego', 'Tríada 1 (Si♭): Deficiencia triple raíz', 'Tríada 3 (Si♭): Deficiencia Riñón-Pulmón'],
  'deficiencia de qi y sangre': ['Tríada 1 (Si♭): Deficiencia triple raíz', 'Tríada 1 (La): Deficiencia de sangre del Hígado', 'Tríada 4 (Re): Deficiencia Tierra-Hígado'],
  'deficiencia de rinon': ['Tríada 1 (Re): Eje Agua-Madera-Fuego', 'Tríada 3 (Si♭): Deficiencia Riñón-Pulmón', 'Tríada 1 (Si♭): Deficiencia triple raíz'],
  'deficiencia de yang de bazo': ['Tríada 1 (Si♭): Deficiencia triple raíz', 'Tríada 5 (Re♭): Humedad por sobrecarga mental', 'Tríada 4 (Mi♭): Deficiencia Tierra-Fuego-Metal'],
  'deficiencia de yang de corazon': ['Tríada 1 (Si♭): Deficiencia triple raíz', 'Tríada 4 (Sol): Desconexión Corazón-Riñón', 'Tríada 4 (Mi♭): Deficiencia Tierra-Fuego-Metal'],
  'deficiencia de yin': ['Tríada 2 (Do): Deficiencia de Yin con calor vacío', 'Tríada 5 (Sol): Sequedad por deficiencia', 'Tríada 2 (Sol): Deficiencia con calor vacío'],
  'humedad en bazo': ['Tríada 5 (Re♭): Humedad por sobrecarga mental', 'Tríada 3 (La♭): Hígado invade Estómago', 'Tríada 3 (Do): Bloqueo metabólico triple'],
  'rinon e higado yin deficientes': ['Tríada 2 (Do): Deficiencia de Yin con calor vacío', 'Tríada 4 (Sol): Desconexión Corazón-Riñón', 'Tríada 1 (Re): Eje Agua-Madera-Fuego'],
  'viento interno de higado': ['Tríada 3 (La): Ascenso de Yang del Hígado', 'Tríada 5 (La): Hígado enciende Corazón', 'Tríada 1 (Fa♯): Eje Hígado-Bazo-Xin Bao'],
};

const ESCALAS_EXTRAORD_BY_PATTERN = {
  'deficiencia': ['Escala Extraord. Fa mayor'],
  'deficiencia de yang': ['Escala Extraord. Fa mayor'],
  'deficiencia de yin': ['Escala Extraord. Re♭ mayor'],
  'deficiencia de sangre': ['Escala Extraord. Re♭ mayor'],
  'deficiencia de qi': ['Escala Extraord. Fa mayor'],
  'deficiencia de esencia jing': ['Escala Extraord. Fa mayor'],
  'estancamiento': ['Escala Extraord. Fa♯ mayor'],
  'estasis': ['Escala Extraord. Fa♯ mayor'],
  'calor': ['Escala Extraord. Fa mayor'],
  'fuego': ['Escala Extraord. Fa♯ mayor'],
  'flema': ['Escala Extraord. Re♭ mayor'],
  'humedad': ['Escala Extraord. Re♭ mayor'],
  'humedad-calor': ['Escala Extraord. Fa mayor'],
  'viento-humedad-calor': ['Escala Extraord. Fa♯ mayor'],
  'viento-humedad': ['Escala Extraord. Fa♯ mayor'],
  'viento interno': ['Escala Extraord. Fa♯ mayor'],
  'ascenso de yang': ['Escala Extraord. Fa♯ mayor'],
  'toxina': ['Escala Extraord. Fa mayor'],
  // ── Escalas añadidas iter-1 ──
  'deficiencia de bazo': ['Escala Extraord. Fa mayor'],
  'deficiencia de jing': ['Escala Extraord. Fa mayor'],
  'deficiencia de qi y sangre': ['Escala Extraord. Fa mayor'],
  'deficiencia de yang de bazo': ['Escala Extraord. Fa mayor'],
  'deficiencia de yang de corazon': ['Escala Extraord. Fa mayor'],
  'deficiencia de yin': ['Escala Extraord. Re♭ mayor'],
  'deficiencia de rinon': ['Escala Extraord. Fa mayor'],
  'humedad en bazo': ['Escala Extraord. Re♭ mayor'],
  'rinon e higado yin deficientes': ['Escala Extraord. Re♭ mayor'],
  'viento interno de higado': ['Escala Extraord. Fa♯ mayor'],
  // ── Escalas añadidas iter-3: 3 faltantes ──
  'frio en utero':          ['Escala Extraord. Fa mayor'],      // tonificar Yang → Fa mayor
  'retencion de alimentos': ['Escala Extraord. Fa♯ mayor'],     // estancamiento/bloqueo → Fa♯
  'viento-frio':            ['Escala Extraord. Fa♯ mayor'],     // viento externo → Fa♯
};

const SINDROME_MODULO_MAP = {
  // ── Patrones de Sangre ──
  'calor en sangre':             [{ idx:11, accion:'dispersar' }, { idx:8,  accion:'dispersar' }],
  'calor toxico en sangre':      [{ idx:11, accion:'dispersar' }, { idx:8,  accion:'dispersar' }, { idx:4, accion:'dispersar' }],
  'estasis de sangre':           [{ idx:11, accion:'dispersar' }, { idx:8,  accion:'dispersar' }],
  'estasis de sangre en corazon':[{ idx:4,  accion:'dispersar' }, { idx:11, accion:'dispersar' }],
  'deficiencia de sangre':       [{ idx:11, accion:'tonificar' }, { idx:3,  accion:'tonificar' }],
  'deficiencia de qi y sangre':  [{ idx:3,  accion:'tonificar' }, { idx:11, accion:'tonificar' }, { idx:4, accion:'tonificar' }],
  // ── Deficiencias sin órgano explícito ──
  'deficiencia de esencia jing': [{ idx:7,  accion:'tonificar' }, { idx:3,  accion:'tonificar' }],
  'deficiencia de jing':         [{ idx:7,  accion:'tonificar' }],
  'deficiencia de wei qi':       [{ idx:0,  accion:'tonificar' }, { idx:3,  accion:'tonificar' }],
  'deficiencia de yin':          [{ idx:7,  accion:'tonificar' }, { idx:4,  accion:'tonificar' }],
  'deficiencia de zheng qi':     [{ idx:3,  accion:'tonificar' }, { idx:7,  accion:'tonificar' }],
  // ── Flema y Humedad ──
  'flema':                       [{ idx:3,  accion:'dispersar' }, { idx:0,  accion:'dispersar' }],
  'flema que obstruye':          [{ idx:4,  accion:'dispersar' }, { idx:11, accion:'dispersar' }],
  'flema-calor':                 [{ idx:0,  accion:'dispersar' }, { idx:2,  accion:'dispersar' }],
  'flema-humedad':               [{ idx:3,  accion:'dispersar' }, { idx:0,  accion:'dispersar' }],
  'humedad-calor':               [{ idx:3,  accion:'dispersar' }, { idx:11, accion:'dispersar' }],
  'humedad-calor en jiao':       [{ idx:6,  accion:'dispersar' }, { idx:7,  accion:'dispersar' }],
  'humedad en bazo':             [{ idx:3,  accion:'dispersar' }, { idx:2,  accion:'dispersar' }],
  // ── Viento ──
  'viento interno':              [{ idx:11, accion:'dispersar' }],
  'viento-calor':                [{ idx:0,  accion:'dispersar' }, { idx:11, accion:'dispersar' }],
  'viento-frio':                 [{ idx:0,  accion:'dispersar' }],
  'viento-humedad':              [{ idx:11, accion:'dispersar' }, { idx:3,  accion:'dispersar' }],
  'viento-humedad-calor':        [{ idx:11, accion:'dispersar' }, { idx:3,  accion:'dispersar' }, { idx:6, accion:'dispersar' }],
  'viento-humedad-frio':         [{ idx:11, accion:'dispersar' }, { idx:7,  accion:'dispersar' }],
  // ── Fuego y Toxinas ──
  'fuego toxico':                [{ idx:11, accion:'dispersar' }, { idx:4,  accion:'dispersar' }],
  'toxina-calor':                [{ idx:11, accion:'dispersar' }, { idx:8,  accion:'dispersar' }],
  'shen perturbado':             [{ idx:4,  accion:'dispersar' }, { idx:11, accion:'dispersar' }],
  // ── Utero / Jiao Inferior ──
  'frio en utero':               [{ idx:7,  accion:'tonificar' }, { idx:3,  accion:'tonificar' }],
  'retencion de alimentos':      [{ idx:2,  accion:'dispersar' }, { idx:3,  accion:'dispersar' }],
  // ── Iter-3: síndromes con órgano explícito — Capa 2 autoritativa (órgano primario + secundarios) ──
  // Hígado/VB
  'ascenso de yang de higado':              [{ idx:11, accion:'dispersar' }, { idx:7,  accion:'tonificar' }, { idx:10, accion:'dispersar' }],
  'estancamiento de qi de higado':          [{ idx:11, accion:'dispersar' }, { idx:10, accion:'dispersar' }, { idx:3,  accion:'tonificar' }],
  'fuego de higado':                        [{ idx:11, accion:'dispersar' }, { idx:4,  accion:'dispersar' }, { idx:10, accion:'dispersar' }],
  'viento interno de higado':               [{ idx:11, accion:'dispersar' }, { idx:7,  accion:'tonificar' }, { idx:10, accion:'dispersar' }],
  'deficiencia de sangre de higado':        [{ idx:11, accion:'tonificar' }, { idx:3,  accion:'tonificar' }, { idx:7,  accion:'tonificar' }],
  'humedad-calor en higado y vesicula biliar': [{ idx:11, accion:'dispersar' }, { idx:10, accion:'dispersar' }, { idx:3,  accion:'dispersar' }],
  'rinon e higado yin deficientes':         [{ idx:7,  accion:'tonificar' }, { idx:11, accion:'tonificar' }, { idx:4,  accion:'tonificar' }],
  // Corazón
  'fuego de corazon':                       [{ idx:4,  accion:'dispersar' }, { idx:11, accion:'dispersar' }, { idx:7,  accion:'tonificar' }],
  'deficiencia de sangre de corazon':       [{ idx:4,  accion:'tonificar' }, { idx:11, accion:'tonificar' }, { idx:3,  accion:'tonificar' }],
  'deficiencia de yang de corazon':         [{ idx:4,  accion:'tonificar' }, { idx:7,  accion:'tonificar' }],
  'deficiencia de yin de corazon':          [{ idx:4,  accion:'tonificar' }, { idx:7,  accion:'tonificar' }],
  'deficiencia de qi de corazon':           [{ idx:4,  accion:'tonificar' }, { idx:3,  accion:'tonificar' }],
  // Bazo/Estómago — las de 2 órganos primero para match prioritario
  'deficiencia de qi de bazo y corazon':    [{ idx:3,  accion:'tonificar' }, { idx:4,  accion:'tonificar' }, { idx:0,  accion:'tonificar' }],
  'deficiencia de qi de bazo':              [{ idx:3,  accion:'tonificar' }, { idx:2,  accion:'tonificar' }, { idx:0,  accion:'tonificar' }],
  'deficiencia de yang de bazo':            [{ idx:3,  accion:'tonificar' }, { idx:7,  accion:'tonificar' }],
  'deficiencia de bazo':                    [{ idx:3,  accion:'tonificar' }, { idx:2,  accion:'tonificar' }],
  'calor en estomago':                      [{ idx:2,  accion:'dispersar' }, { idx:1,  accion:'dispersar' }],
  'deficiencia de yin de estomago':         [{ idx:2,  accion:'tonificar' }, { idx:7,  accion:'tonificar' }],
  // Pulmón
  'deficiencia de qi de pulmon':            [{ idx:0,  accion:'tonificar' }, { idx:3,  accion:'tonificar' }],
  'deficiencia de yin de pulmon':           [{ idx:0,  accion:'tonificar' }, { idx:7,  accion:'tonificar' }, { idx:2,  accion:'tonificar' }],
  // Riñón
  'deficiencia de yang de rinon':           [{ idx:7,  accion:'tonificar' }, { idx:3,  accion:'tonificar' }, { idx:4,  accion:'tonificar' }],
  'deficiencia de yin de rinon':            [{ idx:7,  accion:'tonificar' }, { idx:4,  accion:'tonificar' }, { idx:11, accion:'tonificar' }],
  'deficiencia de qi de rinon':             [{ idx:7,  accion:'tonificar' }, { idx:3,  accion:'tonificar' }],
  'deficiencia de rinon':                   [{ idx:7,  accion:'tonificar' }, { idx:3,  accion:'tonificar' }, { idx:11, accion:'tonificar' }],
  // Intestino / Vejiga
  'calor en intestino grueso':              [{ idx:1,  accion:'dispersar' }, { idx:2,  accion:'dispersar' }],
  'humedad-calor en vejiga':                [{ idx:6,  accion:'dispersar' }, { idx:7,  accion:'dispersar' }, { idx:3,  accion:'dispersar' }],
};

const _SYNONYM_GROUPS = [
  // ── Peso / metabolismo ──
  ['obesidad','sobrepeso','exceso de peso','exceso peso','gordura','adiposidad'],
  // ── Infecciones ──
  ['infeccion','infecciones','infecciosa','infeccioso','proceso infeccioso'],
  // ── Dolor de cabeza ──
  ['cefalea','migrana','jaqueca','dolor de cabeza','hemicranea','hemicraneal'],
  // ── Dolor lumbar ──
  ['lumbalgia','dolor lumbar','lumbago','dolor de espalda baja','dorsalgia'],
  // ── Articulaciones ──
  ['artritis','reumatismo','reumatico','artralgia','dolor articular'],
  ['artrosis','degeneracion articular','gonalgia'],
  // ── Fatiga ──
  ['fatiga','cansancio','agotamiento','astenia','adinamia','debilidad general'],
  // ── Insomnio ──
  ['insomnio','dificultad para dormir','alteracion del sueno','sueno perturbado','sueno interrumpido'],
  // ── Estados emocionales ──
  ['ansiedad','angustia','tension nerviosa','nerviosismo'],
  ['depresion','tristeza','melancolia','abatimiento'],
  // ── Digestivo ──
  ['estreñimiento','estrenimiento','constipacion','intestino lento'],
  ['diarrea','deposiciones blandas','deposiciones sueltas','heces blandas'],
  ['nausea','nauseas','vomito','vomitos','nauseas y vomitos'],
  // ── Cardiovascular ──
  ['palpitaciones','taquicardia','arritmia','latido irregular'],
  // ── Vértigo ──
  ['mareo','vertigo','mareos','desequilibrio','vahido'],
  // ── Sudoración ──
  ['sudoracion','sudoracion nocturna','sudores nocturnos','hiperhidrosis','sudor espontaneo'],
  // ── Inflamación ──
  ['inflamacion','hinchazon','edema','tumefaccion'],
  // ── Piel ──
  ['eccema','eczema','dermatitis','psoriasis'],
  // ── Flema / moco ──
  ['flema','mucosidad','mucus','moco','mucosidades','expectoracion'],

  // ══ SÍNDROMES MTC — Humedad ══
  // "humedad" sola agrupa todas las variantes de humedad
  ['humedad','humedad-calor','humedad calor','calor humedo','calor-humedo',
   'humedad-frio','humedad frio','frio humedo','frio-humedo',
   'estancamiento de humedad','retencion de humedad','acumulacion de humedad',
   'flema humedad','flema-humedad','bi humedad','bi-humedad'],
  // Variante Humedad-Calor específica
  ['humedad calor','humedad-calor','calor humedo','calor-humedo','calor en humedad',
   'bi humedad-calor','bi humedad calor'],
  // Variante Humedad-Frío específica
  ['humedad frio','humedad-frio','frio humedo','frio-humedo','bi humedad frio',
   'bi humedad-frio'],
  // Estancamiento de humedad
  ['estancamiento de humedad','retencion de humedad','acumulacion de humedad',
   'flema-humedad','flema humedad'],

  // ══ SÍNDROMES MTC — Viento ══
  ['viento','viento externo','viento interno','viento-frio','viento frio',
   'viento calor','viento-calor','viento frio humedad','bi viento'],
  ['viento frio','viento-frio','frio viento','invasion viento-frio','invasion viento frio'],
  ['viento calor','viento-calor','invasion viento-calor','invasion viento calor'],
  ['viento interno','yang del higado ascendente','ascenso yang del higado',
   'ascenso yang higado','yang ascendente','viento del higado'],

  // ══ SÍNDROMES MTC — Estancamiento ══
  ['estancamiento','estasis','estagnacion','bloqueo','obstruccion'],
  ['estancamiento de qi','estancamiento qi','qi estancado','estasis qi','qi bloqueado'],
  ['estasis de sangre','sangre estancada','estancamiento de sangre','sangre estasis',
   'obstruccion de sangre','sangre obstruida'],

  // ══ SÍNDROMES MTC — Deficiencia ══
  ['deficiencia','insuficiencia','xu','deplecion','vaciamiento'],
  ['deficiencia yang','yang deficiente','yang xu','insuficiencia yang','yang vacio'],
  ['deficiencia yin','yin deficiente','yin xu','insuficiencia yin','yin vacio'],
  ['deficiencia qi','qi deficiente','qi xu','insuficiencia qi','qi debil'],
  ['deficiencia de sangre','sangre deficiente','sangre escasa','sangre xu'],

  // ══ SÍNDROMES MTC — Flema ══
  ['flema-fuego','flema fuego','fuego-flema','fuego flema'],
  ['flema-calor','flema calor','calor en flema'],

  // ══ SÍNDROMES MTC — Calor / Frío ══
  ['calor vacio','calor-vacio','fuego vacio','fuego-vacio'],
  ['frio en','frio interno','frio externo','invasion de frio'],

  // ══ Órganos (búsqueda sin acentos) ══
  ['corazon','xin','cardiaco','cardiaca','cardio'],
  ['estomago','gastrico','gastrica','gastrointestinal'],
  ['higado','hepatico','hepatica'],
  ['rinon','renal','nefro','nefrico'],
  ['pulmon','pulmonar','respiratorio','respiratoria'],
  ['bazo','pancreas','bazo-pancreas'],
  ['vesicula biliar','vb','hepático lateral'],
  ['intestino grueso','ig','colon'],
  ['intestino delgado','id'],
];

const _SYNONYM_MAP = {};
