// Auto-extraído del monolito index.html — módulo de funcionalidad
// (sin cambios de contenido; solo separado en archivo)

function getJieqiDay(year, jieqiIndex) {
  const century = Math.floor(year / 100);
  const YY = year % 100;
  const C = century <= 20 ? JIEQI_C[jieqiIndex][0] : JIEQI_C[jieqiIndex][1];
  return Math.floor(YY * 0.2422 + C) - Math.floor((YY - 1) / 4);
}

function buildJieqiTable(year) {
  // Meses gregorianos y sus ramas terrestres correspondientes
  // Ene→丑(1), Feb→寅(2), Mar→卯(3), Abr→辰(4), May→巳(5), Jun→午(6)
  // Jul→未(7), Ago→申(8), Sep→酉(9), Oct→戌(10), Nov→亥(11), Dic→子(0)
  const branches = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0];
  const table = [];
  for (let i = 0; i < 12; i++) {
    const month = i + 1;
    const dayStart = getJieqiDay(year, i);
    table.push([month, dayStart, branches[i]]);
  }
  return table;
}

function getYearBranchIdx(year, month, day) {
  let y = year;
  // Lìchūn (inicio del año chino): aprox. 4 Feb, pero varía entre 3-5 Feb
  const lichunDay = getJieqiDay(year, 1); // índice 1 = Lìchūn (Feb)
  if (month < 2 || (month === 2 && day < lichunDay)) y = year - 1;
  return ((y - 1900) % 12 + 12) % 12;
}

function getMonthBranchIdx(year, month, day) {
  const jieqi = buildJieqiTable(year);
  const entry = jieqi.find(j => j[0] === month);
  if (!entry) return 0;
  if (day >= entry[1]) return entry[2];
  // Antes del jieqi de este mes → rama del mes anterior
  const prevM = month === 1 ? 12 : month - 1;
  // Si pasamos a diciembre anterior, usamos el año anterior
  const prevYear = month === 1 ? year - 1 : year;
  const prevJieqi = buildJieqiTable(prevYear);
  const prev = prevJieqi.find(j => j[0] === prevM);
  return prev ? prev[2] : 0;
}

function getDayBranchIdx(year, month, day) {
  const BASE = new Date(1899, 11, 31); // ciclo 9 (癸酉)
  const birth = new Date(year, month - 1, day);
  const diffDays = Math.round((birth - BASE) / 86400000);
  const cycle60 = ((diffDays + 9) % 60 + 60) % 60;
  return cycle60 % 12;
}

function getDayStemIdx(year, month, day) {
  const BASE = new Date(1899, 11, 31);
  const birth = new Date(year, month - 1, day);
  const diffDays = Math.round((birth - BASE) / 86400000);
  const cycle60 = ((diffDays + 9) % 60 + 60) % 60;
  return cycle60 % 10;
}

function getHourBranchIdx(hour) {
  const h = parseInt(hour);
  if (isNaN(h)) return 6; // sin hora → mediodía (午 Caballo)
  if (h === 23 || h < 1)  return 0;  // 子 Rata  (23:00–01:00)
  if (h < 3)              return 1;  // 丑 Buey  (01:00–03:00)
  if (h < 5)              return 2;  // 寅 Tigre (03:00–05:00)
  if (h < 7)              return 3;  // 卯 Conejo(05:00–07:00)
  if (h < 9)              return 4;  // 辰 Dragón(07:00–09:00)
  if (h < 11)             return 5;  // 巳 Serpiente(09:00–11:00)
  if (h < 13)             return 6;  // 午 Caballo(11:00–13:00)
  if (h < 15)             return 7;  // 未 Cabra (13:00–15:00)
  if (h < 17)             return 8;  // 申 Mono  (15:00–17:00)
  if (h < 19)             return 9;  // 酉 Gallo (17:00–19:00)
  if (h < 21)             return 10; // 戌 Perro (19:00–21:00)
  return 11;                         // 亥 Cerdo (21:00–23:00)
}