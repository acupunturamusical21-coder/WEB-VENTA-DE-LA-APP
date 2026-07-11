// Auto-extraído del monolito index.html — módulo de funcionalidad
// (sin cambios de contenido; solo separado en archivo)

function goToChapterById(id) {
  const idx = getActiveChapters().findIndex(c => c.id === id);
  if (idx >= 0) { showSection('libro'); currentChapter = idx; renderChapter(); }
}

function goToOrganInCap17(organNombre) {
  const keyword = ORGAN_CAP17_KEYWORD[organNombre];
  if (!keyword) return;
  const idx = getActiveChapters().findIndex(c => c.id === 'cap17');
  if (idx < 0) return;
  showSection('libro');
  currentChapter = idx;
  renderChapter();
  // Wait for render then find the h2
  requestAnimationFrame(() => requestAnimationFrame(() => {
    const box = document.getElementById('chapterContent');
    if (!box) return;
    const h2s = box.querySelectorAll('h2');
    let target = null;
    for (const h2 of h2s) {
      const txt = h2.textContent.trim().toUpperCase();
      // Match exactly the organ heading (not TONIFICAR / DISPERSAR)
      if (txt === keyword || txt === `<STRONG>${keyword}</STRONG>`) {
        target = h2; break;
      }
      // textContent won't have HTML tags, just check plain text
      if (txt === keyword) { target = h2; break; }
    }
    // fallback: first h2 whose text starts with keyword but not TONIFICAR/DISPERSAR
    if (!target) {
      for (const h2 of h2s) {
        const txt = h2.textContent.trim().toUpperCase();
        if (txt.startsWith(keyword) && !txt.startsWith('TONIFICAR') && !txt.startsWith('DISPERSAR')) {
          target = h2; break;
        }
      }
    }
    if (target) {
      const wrap = document.getElementById('chapterContentWrap');
      if (wrap) {
        const top = target.offsetTop - 72;
        wrap.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
      } else {
        const top = target.getBoundingClientRect().top + window.scrollY - 72;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    }
  }));
}

const CHAPTERS = CHAPTERS_DATA;

function getActiveChapters() {
  return (window._lang === 'en' && typeof CHAPTERS_DATA_EN !== 'undefined' && CHAPTERS_DATA_EN) ? CHAPTERS_DATA_EN : CHAPTERS_DATA;
}

let currentChapter = 0;

function buildLector() {
  const useEN = (window._lang === 'en');
  const chapSrc = (useEN && CHAPTERS_DATA_EN) ? CHAPTERS_DATA_EN : CHAPTERS_DATA;
  const idx = document.getElementById('chapterIndex');
  let html = '';
  chapSrc.forEach((ch, i) => {
    const isFirst = i === 0 || chapSrc[i-1].tomo !== ch.tomo;
    if (isFirst) {
      const top = i > 0 ? '1px solid var(--border)' : 'none';
      html += '<div style="font-family:Cinzel,serif;font-size:0.65rem;letter-spacing:0.08em;color:var(--gold2);padding:0.6rem 0.5rem 0.2rem;border-top:' + top + '">' + ch.tomo + '</div>';
    }
    const color = i === currentChapter ? 'var(--vio4)' : 'var(--text)';
    const bg = i === currentChapter ? 'rgba(139,26,26,0.08)' : 'transparent';
    const shortTitle = ch.title.replace(/Chapter \d+\s*[—-]\s*/i, '').replace(/Chapters? \d+[–-]\d+\s*[—-]\s*/i,'').replace(/Cap.tulo \d+ [—-] /i, '').replace(/Prólogo — /, '').replace(/Prólogo/, 'Prólogo').replace(/Prologue/, 'Prologue');
    html += '<div style="padding:0.35rem 0.5rem;cursor:pointer;border-radius:3px;font-size:0.82rem;color:' + color + ';background:' + bg + ';transition:all 0.15s" id="cidx-' + i + '" onclick="goToChapter(' + i + ')">' + shortTitle + '</div>';
  });
  idx.innerHTML = html;
  renderChapter();
}

function renderChapter() {
  const useEN = (window._lang === 'en');
  const chapterSource = (useEN && CHAPTERS_DATA_EN) ? CHAPTERS_DATA_EN : CHAPTERS_DATA;
  const ch = chapterSource[currentChapter] || getActiveChapters()[currentChapter];
  const _box = document.getElementById('chapterContent');
  _box.innerHTML = '';
  const _tomo = document.createElement('div');
  _tomo.style.cssText = 'font-size:0.72rem;color:var(--gold2);font-family:Cinzel,serif;letter-spacing:0.1em;margin-bottom:0.5rem';
  _tomo.textContent = ch.tomo;
  const _h2 = document.createElement('h2');
  _h2.style.cssText = "font-family:'Cinzel',serif;color:var(--vio4);font-size:1.3rem;margin-bottom:1.5rem;line-height:1.3";
  _h2.textContent = ch.title;
  const _body = document.createElement('div');
  _body.innerHTML = ch.content;
  _box.appendChild(_tomo);
  _box.appendChild(_h2);
  _box.appendChild(_body);
  // TTS: pre-map each element to its chunk index at render time (direct text match)
  {
    const _useEN_tts=(window._lang==='en')&&CHAPTERS_DATA_EN;
    const _ch = getActiveChapters()[currentChapter];
    const _fullText = prepareTextForReading(_ch.content);
    const _allChunks = splitIntoSentences(_fullText);
    // Guardar chunks para que ttsStart() use exactamente los mismos índices
    _renderedChunks = _allChunks;
    const _elems = Array.from(_box.querySelectorAll('p, h1, h2, h3, h4'));
    _elems.forEach((el, pos) => {
      el.title = '\u25b6 Leer desde aquí';
      // Find chunk by direct text search (first 40 chars of this element)
      const elText = prepareTextForReading(el.textContent).trim();
      let found = 0;
      if (_allChunks.length && elText.length > 3) {
        const needle = elText.slice(0, Math.min(40, elText.length));
        const exactIdx = _allChunks.findIndex(c => c.includes(needle));
        if (exactIdx >= 0) {
          found = exactIdx;
        } else {
          // Fallback: char-offset accumulation using plain text only
          const beforeText = prepareTextForReading(
            _elems.slice(0, pos).map(e => e.textContent).join(' ')
          );
          const charPos = beforeText.length;
          let acc = 0;
          for (let i = 0; i < _allChunks.length; i++) {
            if (acc >= charPos) { found = i; break; }
            acc += _allChunks[i].length + 1;
            found = Math.min(i + 1, _allChunks.length - 1);
          }
        }
      }
      el.dataset.ttsChunkIdx = found;
      el.addEventListener('click', () => {
        if (!_allChunks.length) return;
        // Limpiar estado previo: watchdog + keepalive + cancel
        _clearWatchdog(); _stopKeepAlive();
        speechSynthesis.cancel();
        ttsChunks = _allChunks;
        ttsIdx = parseInt(el.dataset.ttsChunkIdx) || 0;
        ttsActive = true; ttsPaused = false;
        const lbl = document.getElementById('ttsTitleLabel');
        if (lbl) lbl.textContent = _ch.title;
        updTTSBtn(); _startKeepAlive();
        el.classList.add('tts-jump-flash');
        setTimeout(() => el.classList.remove('tts-jump-flash'), 700);
        // Chrome: resume() tras cancel() desbloquea el motor antes de speak()
        setTimeout(()=>{
          if(ttsActive&&!ttsPaused){ speechSynthesis.resume(); speakChunk(); speechSynthesis.resume(); }
        }, 200);
      });
    });
    // ── BUILD REVERSE MAP: chunkIdx → closest DOM element ──────────────
    // Sort elements by their assigned chunk index
    _ttsElemMap = new Array(_allChunks.length).fill(null);
    const _sortedByChunk = [..._elems]
      .filter(el => el.dataset.ttsChunkIdx !== undefined)
      .sort((a,b) => +a.dataset.ttsChunkIdx - +b.dataset.ttsChunkIdx);
    // For each chunk assign the last element whose chunkIdx ≤ that chunk
    let _mapPtr = 0;
    for(let i=0; i<_allChunks.length; i++){
      while(_mapPtr+1 < _sortedByChunk.length &&
            +_sortedByChunk[_mapPtr+1].dataset.ttsChunkIdx <= i){
        _mapPtr++;
      }
      _ttsElemMap[i] = _sortedByChunk[_mapPtr] || null;
    }
    // ────────────────────────────────────────────────────────────────────
  }
  // Update index highlight
  document.querySelectorAll('[id^="cidx-"]').forEach((el, i) => {
    el.style.color = i === currentChapter ? 'var(--vio4)' : 'var(--text)';
    el.style.background = i === currentChapter ? 'rgba(139,26,26,0.08)' : 'transparent';
  });
  // Scroll al inicio en el contenedor correcto (chapterContentWrap tiene overflow-y:auto)
  const _cWrap=document.getElementById('chapterContentWrap');
  if(_cWrap) _cWrap.scrollTop=0;
  else document.getElementById('chapterContent').scrollTop=0;
  const ctr = document.getElementById('chapCounter');
  if(ctr) ctr.textContent = (currentChapter+1) + ' / ' + getActiveChapters().length;
  ttsStop();
  const ttsLbl=document.getElementById('ttsTitleLabel');
  if(ttsLbl) {
    const useEN2=(window._lang==='en');
    const enCh2=(useEN2&&CHAPTERS_DATA_EN)?CHAPTERS_DATA_EN[currentChapter]:null;
    ttsLbl.textContent=(enCh2?enCh2.title:ch.title);
  }
  // Update chapter title in sticky toolbar
  const titleBar = document.getElementById('chapterTitleBar');
  if(titleBar) titleBar.textContent = ch.title;
}

function goToChapter(i) {
  currentChapter = i;
  renderChapter();
}

let _sidebarOpen = true;

function toggleBookSidebar() {
  _sidebarOpen = !_sidebarOpen;
  const sidebar = document.getElementById('bookSidebar');
  const icon = document.getElementById('indexToggleIcon');
  const label = document.getElementById('indexToggleLabel');
  const edgeArrow = document.getElementById('edgeTabArrow');
  const edgeTab = document.getElementById('sidebarEdgeTab');
  if (_sidebarOpen) {
    sidebar.style.width = '240px';
    sidebar.style.opacity = '1';
    sidebar.style.overflowY = 'auto';
    sidebar.style.overflowX = 'hidden';
    if (icon) { icon.textContent = '◀'; }
    if (label) label.textContent = 'Ocultar índice';
    if (edgeArrow) edgeArrow.textContent = '◀';
    if (edgeTab) edgeTab.style.left = '240px';
  } else {
    sidebar.style.width = '0';
    sidebar.style.opacity = '0';
    sidebar.style.overflow = 'hidden';
    if (icon) { icon.textContent = '▶'; }
    if (label) label.textContent = 'Ver índice';
    if (edgeArrow) edgeArrow.textContent = '▶';
    if (edgeTab) edgeTab.style.left = '0px';
  }
}

function goToModuleChapter(organIdx, accion) {
  const o = ORGANOS[organIdx];
  showSection('libro');
  const targetId = 'cap17';
  const chIdx = getActiveChapters().findIndex(c => c.id === targetId);
  if (chIdx < 0) { alert('Capítulo no encontrado'); return; }
  currentChapter = chIdx;
  renderChapter();
  // Use a longer timeout so the heavy chapter content fully renders in the DOM
  setTimeout(() => {
    const content = document.getElementById('chapterContent');
    if (!content) return;
    const nombreBase = o.nombre.toUpperCase()
      .replace(' (MAESTRO DE CORAZÓN)','')
      .replace('(MAESTRO DE CORAZÓN)','')
      .replace(' (TRIPLE RECALENTADOR)','')
      .replace('(TRIPLE RECALENTADOR)','')
      .replace('-PÁNCREAS','')
      .replace('-PANCREAS','')
      .trim();
    const isEN = (window._lang === 'en');
    let needle;
    let needleAlt = null;
    if (isEN) {
      const nombreEN = ORGAN_CAP17_KEYWORD_EN[o.nombre] || nombreBase;
      needle = (accion === 'tonificar' ? 'TONIFY' : 'DISPERSE') + ' ' + nombreEN;
      needleAlt = (accion === 'tonificar' ? 'TONIFYING' : 'SEDATE') + ' ' + nombreEN;
    } else {
      needle = (accion === 'tonificar' ? 'TONIFICAR' : 'DISPERSAR') + ' ' + nombreBase;
    }
    // Search ALL elements, not just headings — some chapters use <p><strong>
    const all = content.querySelectorAll('h1, h2, h3, h4, strong, b, p');
    let found = null;
    for (const el of all) {
      const txt = (el.textContent || '').trim().toUpperCase().replace(/\s+/g,' ');
      const matchesNeedle = txt === needle || txt.startsWith(needle + ' ') || txt.startsWith(needle + ':');
      const matchesAlt = needleAlt && (txt === needleAlt || txt.startsWith(needleAlt + ' ') || txt.startsWith(needleAlt + ':') || txt.includes(needleAlt));
      if (matchesNeedle || matchesAlt) {
        // Navigate to this element or its closest block ancestor
        found = el.closest('h1,h2,h3,h4,p') || el;
        break;
      }
    }
    if (found) {
      found.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Highlight
      found.style.background = 'linear-gradient(90deg, rgba(252,211,77,0.4), transparent)';
      found.style.padding = '0.4rem 0.75rem';
      found.style.borderRadius = '4px';
      found.style.transition = 'background 2s ease';
      setTimeout(() => { found.style.background = ''; found.style.padding = ''; found.style.borderRadius = ''; }, 3500);
    }
  }, 900);
}

function navigateChapter(dir) {
  const next = currentChapter + dir;
  if (next >= 0 && next < getActiveChapters().length) {
    currentChapter = next;
    renderChapter();
  }
}

function buildLibro() {
  buildLector();
}