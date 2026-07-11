// Auto-extraído del monolito index.html — módulo de funcionalidad
// (sin cambios de contenido; solo separado en archivo)

function buildCorrespondencias() {
  const grid = document.getElementById('corrGrid');
  const isEN = window._lang === 'en';
  const isPremium = typeof essamIsPremium === 'function' && essamIsPremium();
  // Demo (no premium): solo 1 correspondencia de muestra, no las 12.
  const items = isPremium ? CORRESPONDENCIAS : CORRESPONDENCIAS.slice(0, 1);
  grid.innerHTML = items.map((c, i) => {
    const nota = isEN ? noteDisplayEn(c.nota) : c.nota;
    const canal = isEN ? canalEn(c.canal) : c.canal;
    const animal = isEN ? animalEn(c.animal) : c.animal;
    const listen = isEN ? 'Listen' : 'Escuchar';
    return `
    <div class="corr-card" onclick="selectCorr(${i})" style="--note-color:${c.color};border-color:${c.color}55">
      <button class="play-btn" onclick="event.stopPropagation();playNote(${c.freq})" title="${listen}" style="background:${c.color};color:#0a0a0a">♪</button>
      <div class="corr-note nota-clickable" style="color:${c.color};text-shadow:0 0 18px ${c.color}55" onclick="playNote(${c.freq})" title="♪ ${listen} ${nota}">${nota}</div>
      <div class="cn">${canal}</div>
      <div class="cn2">${animal}</div>
      <div style="font-size:0.7rem;color:var(--light);margin-top:0.2rem">${c.hora}</div>
    </div>
  `}).join('') + (isPremium ? '' : essamDemoBannerHtml(11, 'correspondencias'));
}

// Banner reutilizable de "esto es una demo" — usado en Correspondencias,
// Escalas y 12 Órganos cuando la cuenta no es premium.
function essamDemoBannerHtml(masCantidad, seccion) {
  const isEN = window._lang === 'en';
  const textos = {
    correspondencias: { es: 'correspondencias más', en: 'more correspondences' },
    escalas: { es: 'escalas más', en: 'more scales' },
    organos: { es: 'órganos más', en: 'more organs' },
  };
  const t = textos[seccion] || textos.correspondencias;
  return `
    <div class="essam-demo-banner" onclick="essamGoPremium()">
      <div class="essam-demo-banner-icon">🔒</div>
      <div>
        <div class="essam-demo-banner-title">+${masCantidad} ${isEN ? t.en : t.es}</div>
        <div class="essam-demo-banner-sub">${isEN ? 'in the full version' : 'en la versión completa'}</div>
      </div>
      <button class="essam-lock-btn">${isEN ? 'Unlock' : 'Desbloquear'}</button>
    </div>`;
}

let selectedCorr = null;

function selectCorr(i) {
  const c = CORRESPONDENCIAS[i];
  document.querySelectorAll('.corr-card').forEach((el, j) => {
    el.classList.toggle('selected', j === i);
  });
  
  if (selectedCorr === i) {
    document.getElementById('corrDetail').classList.remove('visible');
    selectedCorr = null; return;
  }
  selectedCorr = i;
  
  const detail = document.getElementById('corrDetail');
  detail.classList.add('visible');
  const isEN = window._lang === 'en';
  const nota = isEN ? noteDisplayEn(c.nota) : c.nota;
  const canal = isEN ? canalEn(c.canal) : c.canal;
  const animal = isEN ? animalEn(c.animal) : c.animal;
  const elemento = isEN ? elementoEn(c.elemento) : c.elemento;
  detail.innerHTML = `
    <div class="cd-title" style="border-left:4px solid ${c.color};padding-left:0.75rem">
      ${nota} — ${canal} (${c.abrev})
      <button onclick="playNote(${c.freq})" style="margin-left:1rem;background:${c.color};border:none;color:#0a0a0a;padding:0.3rem 0.8rem;border-radius:3px;cursor:pointer;font-size:0.8rem;font-weight:600">♪ ${isEN?'Listen':'Escuchar'} ${nota}</button>
    </div>
    <div class="cd-grid">
      <div class="cd-item"><label>${isEN?'NOTE':'NOTA'}</label><span style="font-family:'Cinzel',serif;font-size:1.5rem;color:${c.color}">${nota}</span></div>
      <div class="cd-item"><label>${isEN?'CHANNEL':'CANAL'}</label><span>${canal} (${c.abrev})</span></div>
      <div class="cd-item"><label>${isEN?'EARTHLY BRANCH':'RAMA TERRESTRE'}</label><span>${c.rama} · ${animal}</span></div>
      <div class="cd-item"><label>${isEN?'QI SCHEDULE':'HORARIO DEL QI'}</label><span>${c.hora}</span></div>
      <div class="cd-item"><label>${isEN?'ELEMENT':'ELEMENTO'}</label><span>${elemento}</span></div>
      <div class="cd-item"><label>${isEN?'POLARITY':'POLARIDAD'}</label><span>${c.polaridad}</span></div>
      <div class="cd-item"><label>${isEN?'APPROX. FREQUENCY':'FRECUENCIA APROX.'}</label><span>${c.freq.toFixed(1)} Hz</span></div>
    </div>
    <p style="margin-top:0.75rem;font-size:0.82rem;color:var(--muted);font-style:italic">
      ${isEN
        ? `Technical note: The energy cycle schedule has direct diagnostic application.
           ${(c.abrev === 'H' || c.abrev === 'P') ? `A patient who systematically wakes during this time points to an imbalance in the ${canalEn(c.canal)} channel.` : ''}`
        : `Nota técnica: El horario del ciclo energético tiene aplicación diagnóstica directa.
           ${(c.abrev === 'H' || c.abrev === 'P') ? `Un paciente que se despierta sistemáticamente en este horario señala una alteración en el canal de ${c.canal}.` : ''}`
      }
    </p>
  `;
}