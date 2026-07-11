// Auto-extraído del monolito index.html — módulo de funcionalidad
// (sin cambios de contenido; solo separado en archivo)

let ttsActive=false,ttsPaused=false,ttsChunks=[],ttsIdx=0;

let ttsRate=0.88,ttsPitch=0.95,ttsVoice=null;

let _ttsWatchdog=null,_ttsKeepAlive=null,_ttsCurrentU=null;

let _ttsElemMap=[];

let _ttsLastHighlighted=null;

let _renderedChunks=[];

function _ttsClearHighlight(){
  if(_ttsLastHighlighted){
    // Fade out gracefully
    _ttsLastHighlighted.classList.remove('tts-reading');
    _ttsLastHighlighted.classList.add('tts-reading-fade');
    const el=_ttsLastHighlighted;
    setTimeout(()=>{ el.classList.remove('tts-reading-fade'); },900);
    _ttsLastHighlighted=null;
  }
}

function _ttsHighlightChunk(chunkIdx){
  const el=_ttsElemMap[chunkIdx]||null;
  if(el===_ttsLastHighlighted) return; // already highlighted
  _ttsClearHighlight();
  if(!el) return;
  el.classList.add('tts-reading');
  // Scroll manual sobre el contenedor correcto (overflow-y:auto),
  // ya que scrollIntoView actúa sobre el window y no funciona en este layout.
  const wrap=document.getElementById('chapterContentWrap');
  if(wrap){
    const elTop=el.offsetTop;
    const wrapH=wrap.clientHeight;
    const targetScroll=elTop - wrapH/2 + el.clientHeight/2;
    wrap.scrollTo({top:Math.max(0,targetScroll),behavior:'smooth'});
  }
  _ttsLastHighlighted=el;
}

function loadBestVoice(){
  return loadBestVoiceForLang(window._lang||'es');
}

function loadBestVoiceForLang(lang){
  const voices=speechSynthesis.getVoices();
  if(!voices.length){ttsVoice=null;return null;}
  if(lang==='en'){
    // Preferred English voices — genuine native English, NOT Spanish
    const preferredEN=[
      'Google US English','Google UK English Female','Google UK English Male',
      'Microsoft Zira','Microsoft David','Microsoft Mark',
      'Microsoft Aria','Microsoft Guy','Microsoft Jenny',
      'Samantha','Alex','Karen','Daniel','Moira','Fiona'];
    for(const name of preferredEN){
      const v=voices.find(v=>v.name.includes(name));
      if(v){ttsVoice=v;return v;}
    }
    // Any voice whose lang starts with 'en', prefer non-compact
    const enV=voices.find(v=>v.lang&&v.lang.startsWith('en')&&!v.name.toLowerCase().includes('compact'));
    if(enV){ttsVoice=enV;return enV;}
    const anyEn=voices.find(v=>v.lang&&v.lang.startsWith('en'));
    if(anyEn){ttsVoice=anyEn;return anyEn;}
    ttsVoice=voices[0]||null;
    return ttsVoice;
  } else {
    // Spanish voices
    const preferredES=['Google español de Estados Unidos','Google español',
      'Microsoft Pablo','Microsoft Sabina','Microsoft Laura',
      'Jorge','Paulina','Monica','Juan','Mónica','Diego','Carlos','Enrique'];
    for(const name of preferredES){
      const v=voices.find(v=>v.name.includes(name));
      if(v){ttsVoice=v;return v;}
    }
    const esV=voices.find(v=>v.lang&&v.lang.startsWith('es')&&!v.name.toLowerCase().includes('compact'));
    if(esV){ttsVoice=esV;return esV;}
    const anyEs=voices.find(v=>v.lang&&v.lang.startsWith('es'));
    if(anyEs){ttsVoice=anyEs;return anyEs;}
    ttsVoice=voices[0]||null;
    return ttsVoice;
  }
}

function prepareTextForReading(html){
  let t=html
    .replace(/<table[^>]*>[\s\S]*?<\/table>/gi,' tabla de referencia. ')
    .replace(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi,'\n\n$1.\n\n')
    .replace(/<li>(.*?)<\/li>/gi,'$1. ')
    .replace(/<br\s*\/?>/gi,', ')
    .replace(/<[^>]+>/g,' ')
    .replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&nbsp;/g,' ')
    .replace(/&#96;/g,'').replace(/&[a-z0-9#]+;/g,' ');
  // Only apply Spanish-language acronym replacements when in Spanish mode
  if((window._lang||'es')==='es'){
    t=t.replace(/\bVB\b/g,'Vesícula Biliar').replace(/\bIG\b/g,'Intestino Grueso')
       .replace(/\bID\b/g,'Intestino Delgado').replace(/\bXB\b/g,'Xin Bao')
       .replace(/\bSJ\b/g,'San Jiao').replace(/\bMTC\b/g,'Medicina Tradicional China')
       .replace(/\bQi\b/g,'Chí');
  }
  t=t.replace(/♯/g,' sostenido').replace(/♭/g,' bemol')
     .replace(/—/g,', ').replace(/\s+/g,' ').replace(/\.\s*\./g,'.').trim();
  return t;
}

function splitIntoSentences(text){
  // Chunks cortos (≤180 chars) para evitar el bug de Chrome de 15 s
  const s=text.match(/[^.!?…]+[.!?…]+/g)||[text];
  const chunks=[];let cur='';
  for(const x of s){
    if((cur+x).length>180&&cur){chunks.push(cur.trim());cur=x;}
    else cur+=' '+x;
  }
  if(cur.trim()) chunks.push(cur.trim());
  return chunks.filter(c=>c.trim().length>2);
}

function ttsToggle(){
  if(!ttsActive&&!ttsPaused) ttsStart();
  else if(ttsActive&&!ttsPaused) ttsPause_fn();
  else if(ttsPaused) ttsResume();
}

function ttsStart(){
  const _useEN2=(window._lang==='en')&&CHAPTERS_DATA_EN;
  const ch=getActiveChapters()[currentChapter];
  if(!ch){alert(window._lang==='en'?'Select a chapter first.':'Selecciona un capítulo primero.');return;}
  ttsStop();
  // Reusar los chunks generados en renderChapter para que los índices
  // del mapa highlight (_ttsElemMap) sean exactamente los mismos.
  if(_renderedChunks.length){
    ttsChunks=_renderedChunks;
  } else {
    const txt=prepareTextForReading(ch.content);
    ttsChunks=splitIntoSentences(txt);
  }
  if(!ttsChunks.length) return;
  ttsIdx=0;ttsActive=true;ttsPaused=false;
  const lbl=document.getElementById('ttsTitleLabel');
  if(lbl) lbl.textContent=ch.title;
  updTTSBtn();
  _startKeepAlive();
  // Chrome bug: después de cancel(), el motor queda en estado zombie.
  // resume() SIEMPRE (no solo si paused) lo desbloquea antes del speak().
  speechSynthesis.resume();
  // Delay para que cancel() se limpie completamente antes de speak()
  setTimeout(speakChunk, 250);
}

function speakChunk(){
  if(!ttsActive||ttsPaused) return;
  if(ttsIdx>=ttsChunks.length){ttsStop();return;}
  _clearWatchdog();

  const chunk=ttsChunks[ttsIdx];
  // ── HIGHLIGHT current paragraph ──
  _ttsHighlightChunk(ttsIdx);
  const u=new SpeechSynthesisUtterance(chunk);
  // Use the correct language based on the current UI language
  const _ttsLang = (window._lang === 'en') ? 'en-US' : 'es-MX';
  u.lang=_ttsLang;
  u.rate=ttsRate;
  u.pitch=ttsPitch+(chunk.length<60?0.05:0);
  u.volume=1.0;
  // Always reload voice for current language (handles language switches)
  ttsVoice=loadBestVoiceForLang(window._lang||'es');
  if(ttsVoice) u.voice=ttsVoice;
  _ttsCurrentU=u;

  // Chrome: el motor puede estar en estado "zombie" (paused=false pero bloqueado).
  // resume() siempre antes de speak() — en Edge/Firefox no hace daño.
  speechSynthesis.resume();

  // Detector de "speak silencioso": onstart no dispara → el motor falló sin ruido
  let _chunkStarted=false;
  let _noStartTimer=null;

  u.onstart=()=>{
    _chunkStarted=true;
    if(_noStartTimer){clearTimeout(_noStartTimer);_noStartTimer=null;}
  };

  u.onend=()=>{
    _clearWatchdog();
    if(_noStartTimer){clearTimeout(_noStartTimer);_noStartTimer=null;}
    if(!ttsActive||ttsPaused) return;
    ttsIdx++;
    _updateProgress();
    setTimeout(speakChunk,60);
  };

  u.onerror=(e)=>{
    _clearWatchdog();
    if(_noStartTimer){clearTimeout(_noStartTimer);_noStartTimer=null;}
    // 'interrupted' y 'canceled' son normales al parar/cambiar chunk
    if(e.error==='interrupted'||e.error==='canceled') return;
    // En cualquier otro error, avanzar al siguiente chunk
    if(ttsActive&&!ttsPaused){ttsIdx++;setTimeout(speakChunk,120);}
  };

  // Watchdog: si onend no dispara (bug Chrome), avanzamos manualmente
  // Estimamos duración: ~150 palabras/min en español × rate
  const estMs=Math.max(3000,(chunk.length/(ttsRate*2.5))*1000)+1500;
  _ttsWatchdog=setTimeout(()=>{
    if(ttsActive&&!ttsPaused){
      speechSynthesis.cancel();
      ttsIdx++;
      _updateProgress();
      setTimeout(speakChunk,150);
    }
  },estMs);

  speechSynthesis.speak(u);
  // Chrome: después de speak() el motor puede quedar en paused implícito.
  // Un resume() inmediato lo desbloquea. En Edge/Firefox no hace daño.
  speechSynthesis.resume();

  // Si onstart no dispara en 1.5 s → speak() falló silenciosamente.
  // Cancelamos y reintentamos el mismo chunk (sin avanzar índice).
  _noStartTimer=setTimeout(()=>{
    if(!_chunkStarted&&ttsActive&&!ttsPaused){
      _clearWatchdog();
      speechSynthesis.cancel();
      setTimeout(()=>{
        if(ttsActive&&!ttsPaused){
          speakChunk();
          // Chrome: forzar resume también en el reintento
          setTimeout(()=>{ if(!speechSynthesis.speaking) speechSynthesis.resume(); },80);
        }
      },300);
    }
  },1500);
}

function _updateProgress(){
  const bar=document.getElementById('ttsBarFill');
  if(bar&&ttsChunks.length)
    bar.style.width=(Math.min(ttsIdx,ttsChunks.length)/ttsChunks.length*100).toFixed(1)+'%';
}

function _clearWatchdog(){
  if(_ttsWatchdog){clearTimeout(_ttsWatchdog);_ttsWatchdog=null;}
}

function _startKeepAlive(){
  _stopKeepAlive();
  _ttsKeepAlive=setInterval(()=>{
    if(ttsActive&&!ttsPaused&&speechSynthesis.speaking){
      speechSynthesis.pause();
      speechSynthesis.resume();
    }
  },10000);
}

function _stopKeepAlive(){
  if(_ttsKeepAlive){clearInterval(_ttsKeepAlive);_ttsKeepAlive=null;}
}

function ttsPause_fn(){
  _clearWatchdog();_stopKeepAlive();
  speechSynthesis.cancel(); // pause() no es confiable en Chrome; mejor cancel y reanudar desde chunk
  ttsPaused=true;ttsActive=false;
  updTTSBtn();
}

function ttsResume(){
  if(!ttsChunks.length||ttsIdx>=ttsChunks.length){ttsStop();return;}
  ttsPaused=false;ttsActive=true;
  updTTSBtn();
  _startKeepAlive();
  speechSynthesis.resume(); // Chrome: siempre, no solo si paused
  speakChunk(); // Retoma desde ttsIdx (chunk actual)
}

function ttsStop(){
  _clearWatchdog();_stopKeepAlive();
  speechSynthesis.cancel();
  ttsActive=false;ttsPaused=false;ttsIdx=0;_ttsCurrentU=null;
  _ttsClearHighlight();
  const bar=document.getElementById('ttsBarFill');if(bar) bar.style.width='0%';
  updTTSBtn();
}

function setTTSRate(v){
  ttsRate=parseFloat(v);
  if(ttsActive||ttsPaused){
    const si=ttsIdx;
    const wasPaused=ttsPaused;
    ttsStop();
    ttsChunks=splitIntoSentences(prepareTextForReading(getActiveChapters()[currentChapter].content));
    ttsIdx=Math.min(si,ttsChunks.length-1);
    if(!wasPaused){ttsActive=true;ttsPaused=false;updTTSBtn();_startKeepAlive();speakChunk();}
  }
}

function updTTSBtn(){
  const btn=document.getElementById('ttsPlayBtn');
  const ic=document.getElementById('ttsIcon');
  const tx=document.getElementById('ttsBtnTxt'); // puede ser null — guards añadidos
  const isEN=window._lang==='en';
  if(!btn) return;
  if(ttsActive){btn.classList.add('playing');if(ic)ic.textContent='⏸';if(tx)tx.textContent=isEN?'Pause':'Pausar';}
  else if(ttsPaused){btn.classList.remove('playing');if(ic)ic.textContent='▶';if(tx)tx.textContent=isEN?'Continue':'Continuar';}
  else{btn.classList.remove('playing');if(ic)ic.textContent='▶';if(tx)tx.textContent=isEN?'Read aloud':'Leer en voz alta';}
}

if(typeof speechSynthesis!=='undefined'){
  if(speechSynthesis.onvoiceschanged!==undefined)
    speechSynthesis.onvoiceschanged=()=>loadBestVoice();
  // Intentar cargar inmediatamente y también con delay
  loadBestVoice();
  setTimeout(loadBestVoice,500);
  setTimeout(loadBestVoice,1500);
}