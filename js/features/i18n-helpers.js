// Auto-extraído del monolito index.html — módulo de funcionalidad
// (sin cambios de contenido; solo separado en archivo)

function escalaToEn(escalaEs) {
  const parts = escalaEs.trim().split(' ');
  const notaEn = LATIN_TO_ANGLO[parts[0]] || parts[0];
  const tipo = parts.slice(1).join(' ').replace('Mayor','Major').replace('Menor','Minor');
  return notaEn + ' ' + tipo;
}

function noteDisplayEn(notaEs) {
  return notaEs.split('/').map(n => LATIN_TO_ANGLO[n.trim()] || n.trim()).join('/');
}

function elementoEn(el) {
  return ({Madera:'Wood',Fuego:'Fire',Tierra:'Earth',Metal:'Metal',Agua:'Water'})[el] || el;
}

function canalEn(canal) {
  const m = {'Vesícula Biliar':'Gallbladder','Hígado':'Liver','Pulmón':'Lung',
    'Intestino Grueso':'Large Intestine','Estómago':'Stomach','Bazo-Páncreas':'Spleen-Pancreas',
    'Corazón':'Heart','Intestino Delgado':'Small Intestine','Vejiga':'Bladder',
    'Riñón':'Kidney','Xin Bao (M. Corazón)':'Xin Bao (Pericardium)','San Jiao':'San Jiao'};
  return m[canal] || canal;
}

function animalEn(a) {
  const m = {'Rata':'Rat','Buey':'Ox','Tigre':'Tiger','Conejo':'Rabbit','Dragón':'Dragon',
    'Serpiente':'Snake','Caballo':'Horse','Cabra':'Goat','Mono':'Monkey',
    'Gallo':'Rooster','Perro':'Dog','Cerdo':'Pig'};
  return a.replace(/^(\S+)/, w => m[w] || w);
}

function canalesText(canalesEs, isEN) {
  if (!isEN) return canalesEs;
  return canalesEs
    .replace(/Intestino Grueso/g,'Large Intestine').replace(/Intestino Delgado/g,'Small Intestine')
    .replace(/Vesícula Biliar/g,'Gallbladder').replace(/Bazo-Páncreas/g,'Spleen-Pancreas')
    .replace(/Bazo/g,'Spleen').replace(/Pulmón/g,'Lung').replace(/Corazón/g,'Heart')
    .replace(/Estómago/g,'Stomach').replace(/Vejiga/g,'Bladder').replace(/Riñón/g,'Kidney')
    .replace(/Hígado/g,'Liver').replace(/Xin Bao \(M\. Corazón\)/g,'Xin Bao (Pericardium)')
    .replace(/San Jiao/g,'San Jiao');
}

function notasToEn(notasEs) {
  const m = {'DO':'C','REB':'Db','RE♭':'Db','RE':'D','MIB':'Eb','MI♭':'Eb','MI':'E',
    'FA':'F','FA#':'F#','FA♯':'F#','SOL':'G','SOL#':'G#','SOL♯':'G#',
    'LAB':'Ab','LA♭':'Ab','LA':'A','LA#':'A#','LA♯':'A#','SIB':'Bb','SI♭':'Bb','SI':'B'};
  return notasEs.split('–').map(n => m[n.trim()] || n.trim()).join(' – ');
}

function moduloToEn(m) {
  return m.replace(/Tonificar/g,'Tonify').replace(/Dispersar/g,'Disperse')
    .replace(/Intestino Grueso/g,'Large Intestine').replace(/Intestino Delgado/g,'Small Intestine')
    .replace(/Vesícula Biliar/g,'Gallbladder').replace(/Bazo-Páncreas/g,'Spleen-Pancreas')
    .replace(/\bPulmón\b/g,'Lung').replace(/\bCorazón\b/g,'Heart')
    .replace(/\bHígado\b/g,'Liver').replace(/\bRiñón\b/g,'Kidney')
    .replace(/\bEstómago\b/g,'Stomach').replace(/\bBazo\b/g,'Spleen')
    .replace(/\bVejiga\b/g,'Bladder').replace(/\bVB\b/g,'GB').replace(/\bSJ\b/g,'SJ')
    .replace(/Xin Bao/g,'Pericardium').replace(/con moxa/g,'with moxa')
    .replace(/\(fase crónica\)/g,'(chronic phase)').replace(/\(si estancamiento\)/g,'(if stagnation)')
    .replace(/\(viento activo\)/g,'(active wind)').replace(/\(si irritabilidad\)/g,'(if irritability)')
    .replace(/— alternar/g,'— alternate').replace(/o Bazo/g,'or Spleen')
    .replace(/Escala Extraord\. Fa♯ mayor/g,'Extraord. Scale F# Major')
    .replace(/Escala Extraord\. Fa mayor/g,'Extraord. Scale F Major')
    .replace(/Escala Extraord\. Re♭ mayor/g,'Extraord. Scale Db Major');
}

function triadaRefToEn(t) {
  return t.replace(/^Tríada\s+(\d+)\s*\(([^)]+)\)(:?\s*)(.*)/,
    (_, num, nota, sep, desc) => 'Triad ' + num + ' (' + (LATIN_TO_ANGLO[nota]||nota) + ')' +
      (desc.trim() ? ': ' + (NOMBRETECH_EN[desc.trim()] || desc.trim()) : ''));
}

function sindromaToEn(s) {
  return s
    .replace(/Intestino Grueso/g,'Large Intestine').replace(/Intestino Delgado/g,'Small Intestine')
    .replace(/Bajo Calentador/g,'Lower Jiao').replace(/Vesícula Biliar/g,'Gallbladder')
    .replace(/Bazo-Páncreas/g,'Spleen-Pancreas')
    .replace(/Deficiencia de Sangre\/Yin de Hígado y Riñón/g,'Liver-Kidney Blood/Yin Deficiency')
    .replace(/Deficiencia de Sangre Hígado-Bazo/g,'Liver-Spleen Blood Deficiency')
    .replace(/Deficiencia de Sangre de Hígado/g,'Liver Blood Deficiency')
    .replace(/Deficiencia de Jing/g,'Jing Deficiency')
    .replace(/Deficiencia de Qi con frío interno/g,'Qi Deficiency with Internal Cold')
    .replace(/Deficiencia de Riñón e Hígado \+ Estasis/g,'Kidney-Liver Deficiency + Stasis')
    .replace(/Deficiencia de Riñón/g,'Kidney Deficiency')
    .replace(/Deficiencia de Bazo \(genera Flema\)/g,'Spleen Deficiency (generates Phlegm)')
    .replace(/Deficiencia Bazo-Riñón \+ Calor en Sangre/g,'Spleen-Kidney Deficiency + Blood Heat')
    .replace(/Deficiencia Bazo \+ Flema/g,'Spleen Deficiency + Phlegm')
    .replace(/Deficiencia Bazo con Humedad/g,'Spleen Deficiency with Dampness')
    .replace(/Deficiencia Jing-Yang de Riñón/g,'Kidney Jing-Yang Deficiency')
    .replace(/Deficiencia Qi Bazo-Pulmón/g,'Spleen-Lung Qi Deficiency')
    .replace(/Deficiencia Qi Bazo con Humedad-Flema/g,'Spleen Qi Deficiency with Phlegm-Damp')
    .replace(/Deficiencia Qi Bazo con Humedad/g,'Spleen Qi Deficiency with Dampness')
    .replace(/Deficiencia Qi Bazo \+ Estancamiento Hígado/g,'Spleen Qi Deficiency + Liver Stagnation')
    .replace(/Deficiencia Qi Bazo \+ Flema-Humedad/g,'Spleen Qi Deficiency + Phlegm-Damp')
    .replace(/Deficiencia Qi Bazo generando Flema ascendente/g,'Spleen Qi Deficiency generating Ascending Phlegm')
    .replace(/Deficiencia Qi Pulmón-Riñón/g,'Lung-Kidney Qi Deficiency')
    .replace(/Deficiencia Qi Pulmón/g,'Lung Qi Deficiency')
    .replace(/Deficiencia Qi Riñón/g,'Kidney Qi Deficiency')
    .replace(/Deficiencia Qi-Sangre Corazón-Bazo/g,'Heart-Spleen Qi-Blood Deficiency')
    .replace(/Deficiencia Qi-Sangre de Corazón/g,'Heart Qi-Blood Deficiency')
    .replace(/Deficiencia Qi-Sangre/g,'Qi-Blood Deficiency')
    .replace(/Deficiencia Qi-Yang de Bazo con acumulación de Flema-Humedad/g,'Spleen Qi-Yang Deficiency with Phlegm-Damp Accumulation')
    .replace(/Deficiencia Qi-Yang de Bazo/g,'Spleen Qi-Yang Deficiency')
    .replace(/Deficiencia Qi-Yang de Riñón/g,'Kidney Qi-Yang Deficiency')
    .replace(/Deficiencia Qi\/Sangre Corazón-Bazo/g,'Heart-Spleen Qi/Blood Deficiency')
    .replace(/Deficiencia Qi\/Yang Bazo/g,'Spleen Qi/Yang Deficiency')
    .replace(/Deficiencia Qi\/Yang Corazón/g,'Heart Qi/Yang Deficiency')
    .replace(/Deficiencia Qi\/Sangre/g,'Qi/Blood Deficiency')
    .replace(/Deficiencia Qi-Yin de Riñón \(otitis crónica\)/g,'Kidney Qi-Yin Deficiency (chronic otitis)')
    .replace(/Deficiencia Riñón \(Marrow\) \+ Viento interno \+ Flema-Humedad/g,'Kidney (Marrow) Deficiency + Internal Wind + Phlegm-Damp')
    .replace(/Deficiencia Riñón \+ Estasis/g,'Kidney Deficiency + Stasis')
    .replace(/Deficiencia Riñón \+ Flema-Humedad/g,'Kidney Deficiency + Phlegm-Damp')
    .replace(/Deficiencia Wei Qi \(Pulmón-Bazo\)/g,'Wei Qi Deficiency (Lung-Spleen)')
    .replace(/Deficiencia Wei Qi con hipersensibilidad/g,'Wei Qi Deficiency with Hypersensitivity')
    .replace(/Deficiencia Wei Qi y Pulmón/g,'Wei Qi and Lung Deficiency')
    .replace(/Deficiencia Wei Qi/g,'Wei Qi Deficiency')
    .replace(/Deficiencia Yang Bazo-Riñón con retención de Humedad/g,'Spleen-Kidney Yang Deficiency with Dampness Retention')
    .replace(/Deficiencia Yang Corazón con retención de Agua/g,'Heart Yang Deficiency with Water Retention')
    .replace(/Deficiencia Yang Riñón-Bazo/g,'Kidney-Spleen Yang Deficiency')
    .replace(/Deficiencia Yang( de)? Riñón con retención de Líquidos/g,'Kidney Yang Deficiency with Fluid Retention')
    .replace(/Deficiencia Yang( de)? Riñón/g,'Kidney Yang Deficiency')
    .replace(/Deficiencia Yin Corazón \+ Fuego Hígado/g,'Heart Yin Deficiency + Liver Fire')
    .replace(/Deficiencia Yin Corazón con Fuego vacío/g,'Heart Yin Deficiency with Empty Fire')
    .replace(/Deficiencia Yin Estómago/g,'Stomach Yin Deficiency')
    .replace(/Deficiencia Yin Hígado-Riñón \+ Estasis \(crónica\)/g,'Liver-Kidney Yin Deficiency + Chronic Stasis')
    .replace(/Deficiencia Yin Hígado-Riñón/g,'Liver-Kidney Yin Deficiency')
    .replace(/Deficiencia Yin Pulmón con Sequedad-Calor vacío/g,'Lung Yin Deficiency with Dryness-Empty Heat')
    .replace(/Deficiencia Yin Riñón con Calor vacío/g,'Kidney Yin Deficiency with Empty Heat')
    .replace(/Deficiencia Yin Riñón con ascenso( de)? Yang/g,'Kidney Yin Deficiency with Yang Rising')
    .replace(/Deficiencia Yin Riñón/g,'Kidney Yin Deficiency')
    .replace(/Deficiencia Yin con Calor vacío/g,'Yin Deficiency with Empty Heat')
    .replace(/Deficiencia Yin con Fuego vacío/g,'Yin Deficiency with Empty Fire')
    .replace(/Deficiencia Yin( de)? Riñón con ascenso de Yang/g,'Kidney Yin Deficiency with Yang Rising')
    .replace(/Deficiencia Yin de Riñón/g,'Kidney Yin Deficiency')
    .replace(/Deficiencia Yin\/Yang Riñón/g,'Kidney Yin/Yang Deficiency')
    .replace(/Deficiencia de Sangre-Yin/g,'Blood-Yin Deficiency')
    .replace(/Deficiencia de Marrow \(Riñón\) \+ Flema turbia obstruyendo orificios del Corazón/g,'Kidney Marrow Deficiency + Turbid Phlegm Obstructing Heart Orifices')
    .replace(/Deficiencia de Bazo \(músculos\) \+ Deficiencia Riñón \(médula\) \+ Flema seca/g,'Spleen Deficiency (muscles) + Kidney Deficiency (marrow) + Dry Phlegm')
    .replace(/Estancamiento de Qi de Hígado con Calor/g,'Liver Qi Stagnation with Heat')
    .replace(/Estancamiento de Qi de Hígado con exceso de Tierra/g,'Liver Qi Stagnation with Earth Excess')
    .replace(/Estancamiento de Qi de Hígado/g,'Liver Qi Stagnation')
    .replace(/Estancamiento de Qi y Sangre de Hígado/g,'Liver Qi-Blood Stagnation')
    .replace(/Estancamiento Hígado invade Bazo/g,'Liver Stagnation Invades Spleen')
    .replace(/Estancamiento Hígado invade Estómago/g,'Liver Stagnation Invades Stomach')
    .replace(/Estancamiento Qi Hígado con agitación ascendente/g,'Liver Qi Stagnation with Ascending Agitation')
    .replace(/Estancamiento Qi Hígado por sobreexigencia sostenida/g,'Liver Qi Stagnation from Sustained Overexertion')
    .replace(/Estancamiento Qi Hígado invade Bazo/g,'Liver Qi Stagnation Invades Spleen')
    .replace(/Estancamiento Qi Hígado invade Estómago \+ Flema/g,'Liver Qi Stagnation Invades Stomach + Phlegm')
    .replace(/Estancamiento Qi Hígado con Flema/g,'Liver Qi Stagnation with Phlegm')
    .replace(/Estancamiento Qi Hígado \+ Estasis/g,'Liver Qi Stagnation + Blood Stasis')
    .replace(/Estancamiento Qi Hígado \+ Humedad-Calor en Bajo Calentador/g,'Liver Qi Stagnation + Damp-Heat in Lower Jiao')
    .replace(/Estancamiento Qi Hígado/g,'Liver Qi Stagnation')
    .replace(/Estancamiento Qi-Sangre de Hígado/g,'Liver Qi-Blood Stagnation')
    .replace(/Estancamiento Qi-Sangre en canales Yang/g,'Qi-Blood Stagnation in Yang Channels')
    .replace(/Estancamiento Qi\/Sangre Hígado/g,'Liver Qi/Blood Stagnation')
    .replace(/Estasis de Qi-Sangre en canales/g,'Qi-Blood Stasis in Channels')
    .replace(/Estasis de Sangre en Bajo Calentador/g,'Blood Stasis in Lower Jiao')
    .replace(/Estasis de Sangre en canales inferiores/g,'Blood Stasis in Lower Channels')
    .replace(/Estasis de Sangre por desgaste/g,'Blood Stasis from Wear')
    .replace(/Estasis de Sangre por trauma o sobrecarga/g,'Blood Stasis from Trauma or Overload')
    .replace(/Estasis localizada por sobreuso/g,'Localized Stasis from Overuse')
    .replace(/Estasis por trauma/g,'Stasis from Trauma')
    .replace(/Estasis, Sequedad-Calor tóxico/g,'Stasis, Dryness-Toxic Heat')
    .replace(/Estasis \+ Calor tóxico/g,'Stasis + Toxic Heat')
    .replace(/Estasis \+ Humedad/g,'Stasis + Dampness')
    .replace(/Estasis, Flema/g,'Stasis, Phlegm').replace(/Estasis/g,'Blood Stasis')
    .replace(/Calor húmedo/g,'Damp-Heat').replace(/Calor vacío/g,'Empty Heat')
    .replace(/Calor-Toxicidad/g,'Heat-Toxicity').replace(/Calor tóxico/g,'Toxic Heat')
    .replace(/Calor-estancado/g,'Stagnant Heat').replace(/Calor-Humedad/g,'Damp-Heat')
    .replace(/Humedad-Calor tóxico/g,'Toxic Damp-Heat').replace(/Humedad-Calor/g,'Damp-Heat')
    .replace(/Viento-Calor-Humedad/g,'Wind-Heat-Damp').replace(/Viento-Calor/g,'Wind-Heat')
    .replace(/Viento-Frío-Humedad/g,'Wind-Cold-Damp').replace(/Viento-Frío/g,'Wind-Cold')
    .replace(/Viento-Sequedad/g,'Wind-Dryness').replace(/Viento-Flema/g,'Phlegm-Wind')
    .replace(/Flema-Calor/g,'Phlegm-Heat').replace(/Flema-Fuego/g,'Phlegm-Fire')
    .replace(/Flema-Humedad/g,'Phlegm-Damp').replace(/Flema-Viento/g,'Phlegm-Wind')
    .replace(/Flema-Frío/g,'Phlegm-Cold').replace(/Flema seca/g,'Dry Phlegm')
    .replace(/Flema turbia/g,'Turbid Phlegm').replace(/Sequedad-Calor/g,'Dryness-Heat')
    .replace(/Ascendencia Yang Hígado con Viento/g,'Liver Yang Rising with Wind')
    .replace(/Ascendencia Yang Hígado/g,'Liver Yang Rising')
    .replace(/Ascenso Yang Hígado/g,'Liver Yang Rising')
    .replace(/Ascenso rebelde de Qi de Estómago/g,'Rebellious Stomach Qi')
    .replace(/Bi Viento-Frío-Humedad/g,'Wind-Cold-Damp Bi Syndrome')
    .replace(/Bi Humedad-Calor/g,'Damp-Heat Bi Syndrome')
    .replace(/Calor en Pulmón y Estómago/g,'Heat in Lung and Stomach')
    .replace(/Calor en Pulmón-Estómago/g,'Heat in Lung-Stomach')
    .replace(/Calor en Sangre \+ Viento interno/g,'Blood Heat + Internal Wind')
    .replace(/Calor en Sangre con Viento/g,'Blood Heat with Wind')
    .replace(/Calor-Humedad \+ Viento \(brotes\)/g,'Damp-Heat + Wind (outbreaks)')
    .replace(/Calor-Humedad en Estómago e Intestino Grueso/g,'Damp-Heat in Stomach and Large Intestine')
    .replace(/Calor en Estómago/g,'Stomach Heat').replace(/Calor en Hígado/g,'Liver Heat')
    .replace(/Colapso Qi\/Sangre/g,'Qi/Blood Collapse')
    .replace(/Desconexión Corazón-Riñón/g,'Heart-Kidney Disconnection')
    .replace(/Flema-Calor obstruyendo orificios del rostro/g,'Phlegm-Heat Obstructing Facial Orifices')
    .replace(/Flema-Fuego obstruyendo los orificios/g,'Phlegm-Fire Obstructing the Orifices')
    .replace(/Flema-Fuego perturbando el Shen/g,'Phlegm-Fire Disturbing the Shen')
    .replace(/Flema-Humedad \(SOP\)/g,'Phlegm-Damp (PCOS)')
    .replace(/Flema-Humedad \+ Ascenso Qi Hígado/g,'Phlegm-Damp + Liver Qi Rising')
    .replace(/Flema-Humedad obstruyendo oídos con ascenso de Qi/g,'Phlegm-Damp Obstructing Ears with Qi Rising')
    .replace(/Flema-Humedad por déficit de transformación/g,'Phlegm-Damp from Transformation Deficit')
    .replace(/Flema-Viento \+ Estasis en canales \(avanzado\)/g,'Phlegm-Wind + Channel Stasis (advanced)')
    .replace(/Flema-Viento \+ Estasis \(avanzado\)/g,'Phlegm-Wind + Stasis (advanced)')
    .replace(/Frío en útero con bloqueo de Chong Mai/g,'Cold Uterus with Chong Mai Blockage')
    .replace(/Frío en útero/g,'Cold Uterus')
    .replace(/Fuego de Hígado con ascenso de Qi-Fuego/g,'Liver Fire with Qi-Fire Rising')
    .replace(/Humedad-Calor con Toxina recidivante/g,'Damp-Heat with Recurring Toxin')
    .replace(/Humedad-Calor en Hígado y VB/g,'Damp-Heat in Liver and Gallbladder')
    .replace(/Humedad-Calor en Vejiga y Bajo Calentador/g,'Damp-Heat in Bladder and Lower Jiao')
    .replace(/Humedad-Calor en oído medio/g,'Damp-Heat in Middle Ear')
    .replace(/Humedad-Calor tóxico en canales VB e Hígado/g,'Toxic Damp-Heat in GB and Liver Channels')
    .replace(/Invasión Viento-Frío en canales IG, ID y SJ/g,'Wind-Cold Invasion in LI, SI, and SJ Channels')
    .replace(/Invasión Viento-Frío en nuca/g,'Wind-Cold Invasion of the Nape')
    .replace(/Invasión Viento-Frío-Humedad en articulaciones/g,'Wind-Cold-Damp Invasion of Joints')
    .replace(/Invasión Viento-Frío-Humedad en canales Vejiga y VB/g,'Wind-Cold-Damp Invasion in Bladder and GB Channels')
    .replace(/Invasión Viento-Frío-Humedad en tendones/g,'Wind-Cold-Damp Invasion of Tendons')
    .replace(/Invasión Viento-Frío-Humedad/g,'Wind-Cold-Damp Invasion')
    .replace(/Invasión Viento-Frío/g,'Wind-Cold Invasion')
    .replace(/Viento interno por deficiencia de Sangre de Hígado/g,'Internal Wind from Liver Blood Deficiency')
    .replace(/Viento-Calor en Shaoyang \(VB-SJ\)/g,'Wind-Heat in Shaoyang (GB-SJ)')
    .replace(/Viento-Calor o Viento-Frío en superficie/g,'Wind-Heat or Wind-Cold in Exterior')
    .replace(/\bde Sangre\/Yin de Hígado y Riñón/g,'Blood/Yin de Liver y Kidney')
    // Casos con barra / que necesitan ser específicos antes de los genéricos
    .replace(/Deficiencia de Sangre\/Yin de Hígado y Riñón/g,'Liver-Kidney Blood/Yin Deficiency')
    .replace(/Deficiencia Qi\/Sangre Corazón-Bazo/g,'Heart-Spleen Qi/Blood Deficiency')
    .replace(/Deficiencia Qi\/Yang Bazo/g,'Spleen Qi/Yang Deficiency')
    .replace(/Deficiencia Qi\/Yang Corazón/g,'Heart Qi/Yang Deficiency')
    .replace(/Deficiencia Yin\/Yang Riñón/g,'Kidney Yin/Yang Deficiency')
    .replace(/Estancamiento Qi\/Sangre Hígado/g,'Liver Qi/Blood Stagnation')
    // Variante con músculos/médula en español
    .replace(/Deficiencia Bazo \(m[uú]sculos\) \+ Deficiencia Ri[nñ][oó]n \(m[eé]dula\) \+ Flema seca/g,
             'Spleen Deficiency (muscles) + Kidney Deficiency (marrow) + Dry Phlegm')
    // Genéricos al final
    .replace(/\bDeficiencia\b/g,'Deficiency')
    .replace(/\bm[uú]sculos\b/g,'muscles').replace(/\bm[eé]dula\b/g,'marrow')
    .replace(/\bPulmón\b/g,'Lung').replace(/\bCorazón\b/g,'Heart')
    .replace(/\bHígado\b/g,'Liver').replace(/\bRiñón\b/g,'Kidney')
    .replace(/\bEstómago\b/g,'Stomach').replace(/\bBazo\b/g,'Spleen')
    .replace(/\bVejiga\b/g,'Bladder').replace(/\bFlema\b/g,'Phlegm')
    .replace(/\bViento\b/g,'Wind').replace(/\bHumedad\b/g,'Dampness')
    .replace(/\bCalor\b/g,'Heat').replace(/\bFrío\b/g,'Cold')
    .replace(/\bSangre\b/g,'Blood').replace(/\bVB\b/g,'GB').replace(/\bSJ\b/g,'SJ')
    .replace(/\bEstancamiento\b/g,'Stagnation')
    // Cleanup residual Spanish particles
    .replace(/ de ([A-Z])/g,' $1').replace(/ y ([A-Z])/g,' and $1')
    .replace(/\b(músculos|m[uú]sculos)\b/g,'muscles').replace(/\b(médula|m[eé]dula)\b/g,'marrow');
}