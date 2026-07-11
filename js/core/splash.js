// Auto-extraído — animación de partículas + toggle de idioma en splash

// Partículas de fondo
(function(){
  const canvas = document.getElementById('splashCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, stars = [];
  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);
  for (let i = 0; i < 160; i++) {
    stars.push({ x: Math.random(), y: Math.random(), r: Math.random()*1.2+0.2, a: Math.random(), da: (Math.random()-0.5)*0.008 });
  }
  function draw() {
    if (!document.getElementById('essamSplash')) return;
    ctx.clearRect(0,0,W,H);
    stars.forEach(s => {
      s.a = Math.max(0.05, Math.min(0.9, s.a + s.da));
      if (s.a <= 0.05 || s.a >= 0.9) s.da *= -1;
      ctx.beginPath();
      ctx.arc(s.x*W, s.y*H, s.r, 0, Math.PI*2);
      ctx.fillStyle = `rgba(42,90,60,${s.a * 0.45})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  draw();
})();

function closeSplash() {
  const el = document.getElementById('essamSplash');
  if (!el) return;
  el.style.pointerEvents = 'none';
  el.style.animation = 'splashOut 0.7s ease forwards';
  // Sync main app language with splash language
  applyI18n(window._lang);
  applyContentTranslations(window._lang);
  setTimeout(() => { if(el.parentNode) el.remove(); }, 680);
}

function toggleSplashLang() {
  window._lang = (window._lang === 'es') ? 'en' : 'es';
  const isEN = window._lang === 'en';
  document.getElementById('splashLangFlag').textContent = isEN ? '🇬🇧' : '🇪🇸';
  document.getElementById('splashLangLabel').textContent = isEN ? 'ES' : 'EN';
  applyI18n(window._lang);
}
