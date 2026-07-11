// Auto-extraído — Reproductor Oracular (Web Audio API)

/* =====================================================================
   REPRODUCTOR ORACULAR MULTI-ESTILO — Web Audio API v1.0
   ===================================================================== */
(function(){
'use strict';
var OP = {
  isPlaying:false, style:'jazz', instrument:'piano', bpm:90,
  chords:[], chordIdx:0, step:0, stepsPerChord:12,
  nextStepTime:0, timerID:null, lookahead:25, scheduleAhead:0.13,
  lastDisplayIdx:-1,
  ctx:null, masterGain:null, chordGain:null, bassGain:null, drumsGain:null,
  get stepDur(){ return (60/this.bpm)/3; },
  init:function(){
    if(this.ctx) return;
    this.ctx=new(window.AudioContext||window.webkitAudioContext)();
    this.masterGain=this.ctx.createGain(); this.masterGain.gain.value=0.85; this.masterGain.connect(this.ctx.destination);
    this.chordGain=this.ctx.createGain(); this.chordGain.gain.value=0.70; this.chordGain.connect(this.masterGain);
    this.bassGain=this.ctx.createGain();  this.bassGain.gain.value=0.75;  this.bassGain.connect(this.masterGain);
    this.drumsGain=this.ctx.createGain(); this.drumsGain.gain.value=0.70; this.drumsGain.connect(this.masterGain);
  },
  loadChords:function(list){
    this.chords=list.slice(); this.chordIdx=0; this.step=0; this.lastDisplayIdx=-1;
    this._buildPips();
  },
  _buildPips:function(){
    var el=document.getElementById('op-chord-display'); if(!el) return;
    el.innerHTML=this.chords.map(function(c,i){
      return '<div class="op-chord-pip'+(i===0?' active':'')+'">'+c+'</div>';
    }).join('');
  },
  start:function(){
    if(this.isPlaying) return;
    this.init();
    var self=this;
    var go=function(){
      self.isPlaying=true;
      self.nextStepTime=self.ctx.currentTime+0.05;
      self._tick();
      var btn=document.getElementById('op-play-btn');
      if(btn){btn.textContent='⏸';btn.classList.add('playing');}
    };
    if(this.ctx.state==='suspended') this.ctx.resume().then(go); else go();
  },
  pause:function(){
    this.isPlaying=false; clearTimeout(this.timerID);
    var btn=document.getElementById('op-play-btn');
    if(btn){btn.textContent='▶';btn.classList.remove('playing');}
  },
  stop:function(){
    this.pause(); this.step=0; this.chordIdx=0; this.lastDisplayIdx=-1;
    this._buildPips();
  },
  toggle:function(){
    if(!this.chords.length) return;
    if(this.isPlaying) this.pause(); else this.start();
  },
  _tick:function(){
    var self=this;
    while(this.nextStepTime < this.ctx.currentTime + this.scheduleAhead){
      this._scheduleStep(this.step, this.nextStepTime);
      this.nextStepTime += this.stepDur;
      this.step++;
      if(this.step >= this.stepsPerChord){
        this.step=0;
        this.chordIdx=(this.chordIdx+1)%this.chords.length;
      }
    }
    if(this.isPlaying) this.timerID=setTimeout(function(){self._tick();}, this.lookahead);
    requestAnimationFrame(function(){self._updateUI();});
  },
  _updateUI:function(){
    if(this.lastDisplayIdx===this.chordIdx) return;
    this.lastDisplayIdx=this.chordIdx;
    var idx=this.chordIdx;
    document.querySelectorAll('.op-chord-pip').forEach(function(el,i){
      el.classList.toggle('active', i===idx);
    });
  },
  _scheduleStep:function(step, t){
    var chord=this.chords[this.chordIdx]; if(!chord) return;
    var beat=Math.floor(step/3), sub=step%3;
    if(this.style==='jazz')          this._jazzStep(step,beat,sub,t,chord);
    else if(this.style==='bolero')   this._boleroStep(step,beat,sub,t,chord);
    else                             this._electroStep(step,beat,sub,t,chord);
  },

  /* ── JAZZ BEBOP ─────────────────────────────────────────────── */
  _jazzStep:function(step,beat,sub,t,chord){
    var dur=this.stepDur;
    if(sub===0||sub===2) this._ride(t, sub===0?0.085:0.065);
    if(step===0) this._kick(t,false,0.72);
    if(step===6) this._kick(t,false,0.52);
    if(step===3||step===9) this._snare(t,true);
    if(step===0||step===6) this._snare(t,false);
    if(step===3||step===9) this._hihat(t,true,0.04);
    if(sub===0) this._contrabass(t, this._walkFreq(beat,chord), dur*2.6);
    if(step===0) this._chordVoice(t,chord,1.0,dur*11.2,false);
    if(step===6) this._chordVoice(t,chord,0.44,dur*5.0,false);
  },

  /* ── BOLERO ─────────────────────────────────────────────────── */
  _boleroStep:function(step,beat,sub,t,chord){
    var dur=this.stepDur;
    this._maracas(t);
    if([0,3,6,9,11].indexOf(step)>=0) this._clave(t);
    if(step===0||step===3) this._bongo(t,true);
    if(step===6||step===9) this._bongo(t,false);
    if(step===0) this._conga(t,'bass');
    if(step===3) this._conga(t,'slap');
    if(step===6||step===9) this._conga(t,'open');
    if(sub===0){
      var freq=(beat<2)?this._rootFreq(chord):this._rootFreq(chord)*Math.pow(2,7/12);
      this._contrabass(t,freq,dur*2.75);
    }
    if(step===0) this._chordVoice(t,chord,1.0,dur*11.5,true);
    if(step===6) this._chordVoice(t,chord,0.5,dur*5.2,true);
  },

  /* ── ELECTRÓNICA ────────────────────────────────────────────── */
  _electroStep:function(step,beat,sub,t,chord){
    var dur=this.stepDur;
    var self=this;
    if(sub===0) this._kick(t,true,0.85);
    if(step===3||step===9) this._clap(t);
    if(sub===0) this._hihat(t,true,0.07);
    if(sub===2) this._hihat(t,false,0.055);
    if(sub===0) this._synthBass(t,this._rootFreq(chord)*0.5,dur*2.2,1.0);
    if(step===2||step===8) this._synthBass(t,this._rootFreq(chord)*0.5,dur,0.55);
    if(step===0) this._padChord(t,chord,dur*12.0);
    if(step===2||step===5||step===8||step===11){
      var freqs=this._chordFreqs(chord);
      if(freqs.length>0) this._synthNote(t,freqs[step%freqs.length]*2,dur*0.9,0.055);
    }
  },

  /* ── PERCUSIÓN ─────────────────────────────────────────────── */
  _kick:function(t,electronic,vol){
    var ctx=this.ctx;
    var osc=ctx.createOscillator(),g=ctx.createGain();
    osc.connect(g); g.connect(this.drumsGain); osc.type='sine';
    var f0=electronic?105:88;
    osc.frequency.setValueAtTime(f0*1.6,t);
    osc.frequency.exponentialRampToValueAtTime(28,t+(electronic?0.09:0.15));
    g.gain.setValueAtTime(vol,t); g.gain.exponentialRampToValueAtTime(0.001,t+(electronic?0.22:0.30));
    osc.start(t); osc.stop(t+0.35);
    this._noise(t,{hp:180,lp:2800,vol:0.07,dec:0.015});
  },
  _snare:function(t,accent){
    var vol=accent?0.21:0.04, dec=accent?0.19:0.06;
    this._noise(t,{hp:240,lp:7000,vol:vol,dec:dec});
    if(accent){
      var ctx=this.ctx,osc=ctx.createOscillator(),g=ctx.createGain();
      osc.connect(g); g.connect(this.drumsGain); osc.type='sine'; osc.frequency.value=185;
      g.gain.setValueAtTime(0.055,t); g.gain.exponentialRampToValueAtTime(0.001,t+0.08);
      osc.start(t); osc.stop(t+0.09);
    }
  },
  _ride:function(t,vol){
    this._noise(t,{hp:5200,lp:15500,vol:vol||0.07,dec:0.30});
    var ctx=this.ctx,osc=ctx.createOscillator(),g=ctx.createGain();
    osc.connect(g); g.connect(this.drumsGain); osc.type='sine'; osc.frequency.value=4100;
    g.gain.setValueAtTime(0.016,t); g.gain.exponentialRampToValueAtTime(0.001,t+0.20);
    osc.start(t); osc.stop(t+0.22);
  },
  _hihat:function(t,closed,vol){
    this._noise(t,{hp:6800,lp:18000,vol:vol||0.065,dec:closed?0.04:0.15});
  },
  _clap:function(t){
    for(var i=0;i<3;i++) this._noise(t+i*0.008,{hp:380,lp:5800,vol:0.17-i*0.04,dec:0.13});
  },
  _bongo:function(t,alto){
    var ctx=this.ctx,osc=ctx.createOscillator(),g=ctx.createGain();
    osc.connect(g); g.connect(this.drumsGain); osc.type='sine';
    var f=alto?415:238;
    osc.frequency.setValueAtTime(f*1.38,t); osc.frequency.exponentialRampToValueAtTime(f,t+0.038);
    g.gain.setValueAtTime(0.21,t); g.gain.exponentialRampToValueAtTime(0.001,t+0.22);
    osc.start(t); osc.stop(t+0.25);
    this._noise(t,{hp:700,lp:4500,vol:0.035,dec:0.055});
  },
  _conga:function(t,type){
    var ctx=this.ctx,osc=ctx.createOscillator(),g=ctx.createGain();
    osc.connect(g); g.connect(this.drumsGain); osc.type='sine';
    var fqMap={bass:148,open:183,slap:218};
    var fq=fqMap[type]||183;
    osc.frequency.setValueAtTime(fq*1.45,t); osc.frequency.exponentialRampToValueAtTime(fq,t+0.05);
    var dcMap={bass:0.36,open:0.28,slap:0.14};
    var dc=dcMap[type]||0.28;
    g.gain.setValueAtTime(0.26,t); g.gain.exponentialRampToValueAtTime(0.001,t+dc);
    osc.start(t); osc.stop(t+dc+0.05);
    if(type==='slap') this._noise(t,{hp:1100,lp:6000,vol:0.08,dec:0.06});
  },
  _clave:function(t){
    var ctx=this.ctx,osc=ctx.createOscillator(),g=ctx.createGain();
    osc.connect(g); g.connect(this.drumsGain); osc.type='sine'; osc.frequency.value=2500;
    g.gain.setValueAtTime(0.08,t); g.gain.exponentialRampToValueAtTime(0.001,t+0.08);
    osc.start(t); osc.stop(t+0.09);
  },
  _maracas:function(t){ this._noise(t,{hp:4200,lp:14000,vol:0.028,dec:0.07}); },

  /* ── BAJO ──────────────────────────────────────────────────── */
  _contrabass:function(t,freq,dur){
    var ctx=this.ctx;
    var osc=ctx.createOscillator(),flt=ctx.createBiquadFilter(),g=ctx.createGain();
    osc.connect(flt); flt.connect(g); g.connect(this.bassGain);
    osc.type='sawtooth'; osc.frequency.value=freq*0.5;
    flt.type='lowpass'; flt.frequency.value=310; flt.Q.value=1.8;
    g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(0.28,t+0.05);
    g.gain.setValueAtTime(0.20,t+dur*0.55); g.gain.exponentialRampToValueAtTime(0.001,t+dur);
    osc.start(t); osc.stop(t+dur+0.05);
    var o2=ctx.createOscillator(),g2=ctx.createGain();
    o2.connect(g2); g2.connect(this.bassGain); o2.type='triangle'; o2.frequency.value=freq;
    g2.gain.setValueAtTime(0,t); g2.gain.linearRampToValueAtTime(0.055,t+0.06);
    g2.gain.exponentialRampToValueAtTime(0.001,t+dur*0.65);
    o2.start(t); o2.stop(t+dur);
  },
  _synthBass:function(t,freq,dur,vol){
    var ctx=this.ctx;
    var osc=ctx.createOscillator(),flt=ctx.createBiquadFilter(),g=ctx.createGain();
    osc.connect(flt); flt.connect(g); g.connect(this.bassGain);
    osc.type='sawtooth'; osc.frequency.value=freq;
    flt.type='lowpass'; flt.Q.value=7.5;
    flt.frequency.setValueAtTime(2400,t); flt.frequency.exponentialRampToValueAtTime(340,t+0.08);
    g.gain.setValueAtTime((vol||1)*0.30,t); g.gain.exponentialRampToValueAtTime(0.001,t+dur);
    osc.start(t); osc.stop(t+dur+0.02);
  },

  /* ── ACORDES ────────────────────────────────────────────────── */
  _chordVoice:function(t,chordName,volMult,dur,strum){
    var freqs=this._chordFreqs(chordName); if(!freqs.length) return;
    var self=this;
    freqs.forEach(function(freq,i){
      var delay=strum?i*0.024:(self.instrument==='guitar'?i*0.016:0);
      if(self.instrument==='guitar')
        self._guitarNote(t+delay,freq,dur,volMult*(i===0?0.15:0.11));
      else
        self._pianoNote(t+delay,freq,dur,volMult*(i===0?0.13:0.095));
    });
  },
  _pianoNote:function(t,freq,dur,vol){
    var ctx=this.ctx;
    var osc=ctx.createOscillator(),g=ctx.createGain();
    osc.connect(g); g.connect(this.chordGain); osc.type='triangle'; osc.frequency.value=freq;
    g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(vol,t+0.008);
    g.gain.exponentialRampToValueAtTime(vol*0.42,t+0.28);
    g.gain.setValueAtTime(vol*0.28,t+dur*0.5); g.gain.exponentialRampToValueAtTime(0.001,t+dur);
    osc.start(t); osc.stop(t+dur+0.05);
    var o2=ctx.createOscillator(),g2=ctx.createGain();
    o2.connect(g2); g2.connect(this.chordGain); o2.type='sine'; o2.frequency.value=freq*2;
    g2.gain.setValueAtTime(0,t); g2.gain.linearRampToValueAtTime(vol*0.11,t+0.007);
    g2.gain.exponentialRampToValueAtTime(0.001,t+dur*0.38);
    o2.start(t); o2.stop(t+dur*0.42);
  },
  _guitarNote:function(t,freq,dur,vol){
    var ctx=this.ctx;
    var len=Math.ceil(ctx.sampleRate*0.042);
    var buf=ctx.createBuffer(1,len,ctx.sampleRate);
    var d=buf.getChannelData(0);
    for(var i=0;i<len;i++) d[i]=Math.random()*2-1;
    var src=ctx.createBufferSource(); src.buffer=buf;
    var bp=ctx.createBiquadFilter(); bp.type='bandpass'; bp.frequency.value=freq; bp.Q.value=24;
    var g=ctx.createGain();
    src.connect(bp); bp.connect(g); g.connect(this.chordGain);
    g.gain.setValueAtTime(vol*2.9,t); g.gain.exponentialRampToValueAtTime(0.001,t+Math.min(dur,1.9));
    src.start(t); src.stop(t+0.05);
    var osc=ctx.createOscillator(),g2=ctx.createGain();
    osc.connect(g2); g2.connect(this.chordGain); osc.type='sine'; osc.frequency.value=freq;
    g2.gain.setValueAtTime(0,t); g2.gain.linearRampToValueAtTime(vol*0.52,t+0.016);
    g2.gain.exponentialRampToValueAtTime(0.001,t+Math.min(dur*0.62,1.45));
    osc.start(t); osc.stop(t+Math.min(dur*0.65,1.5));
  },
  _padChord:function(t,chordName,dur){
    var freqs=this._chordFreqs(chordName,true); var self=this;
    freqs.forEach(function(freq,i){
      [-4,0,4].forEach(function(cent){
        var ctx=self.ctx;
        var osc=ctx.createOscillator(),flt=ctx.createBiquadFilter(),g=ctx.createGain();
        osc.connect(flt); flt.connect(g); g.connect(self.chordGain);
        osc.type='sawtooth'; osc.frequency.value=freq*Math.pow(2,cent/1200);
        flt.type='lowpass'; flt.frequency.value=2600; flt.Q.value=1.2;
        var v=(i===0?0.055:0.042)/3;
        g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(v,t+0.38);
        g.gain.setValueAtTime(v*0.82,t+dur*0.75); g.gain.linearRampToValueAtTime(0,t+dur);
        osc.start(t); osc.stop(t+dur+0.1);
      });
    });
  },
  _synthNote:function(t,freq,dur,vol){
    var ctx=this.ctx,osc=ctx.createOscillator(),g=ctx.createGain();
    osc.connect(g); g.connect(this.chordGain); osc.type='square'; osc.frequency.value=freq;
    g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(vol,t+0.012);
    g.gain.exponentialRampToValueAtTime(0.001,t+dur);
    osc.start(t); osc.stop(t+dur+0.01);
  },

  /* ── UTILIDADES ─────────────────────────────────────────────── */
  _noise:function(t,opts){
    var ctx=this.ctx;
    var len=Math.ceil(ctx.sampleRate*(opts.dec+0.01));
    var buf=ctx.createBuffer(1,len,ctx.sampleRate);
    var d=buf.getChannelData(0);
    for(var i=0;i<len;i++) d[i]=Math.random()*2-1;
    var src=ctx.createBufferSource(); src.buffer=buf;
    var hpf=ctx.createBiquadFilter(); hpf.type='highpass'; hpf.frequency.value=opts.hp||200;
    var lpf=ctx.createBiquadFilter(); lpf.type='lowpass';  lpf.frequency.value=opts.lp||8000;
    var g=ctx.createGain();
    src.connect(hpf); hpf.connect(lpf); lpf.connect(g); g.connect(this.drumsGain);
    g.gain.setValueAtTime(opts.vol||0.1,t);
    g.gain.exponentialRampToValueAtTime(0.001,t+opts.dec);
    src.start(t); src.stop(t+opts.dec+0.01);
  },
  _chordFreqs:function(chordName,forPad){
    if(!chordName) return [];
    var parsed=parseChordName(chordName); if(!parsed) return [];
    var root=NOTE_FREQ_MAP[parsed.root]; if(!root) return [];
    var ints=(CHORD_INTERVALS[parsed.type]||CHORD_INTERVALS['maj']).slice();
    if(this.style==='jazz'&&ints.length<4&&ints.indexOf(10)<0&&ints.indexOf(11)<0) ints.push(10);
    return ints.map(function(s){return root*Math.pow(2,s/12);});
  },
  _rootFreq:function(chordName){
    if(!chordName) return 261.63;
    var p=parseChordName(chordName);
    return (p&&NOTE_FREQ_MAP[p.root])||261.63;
  },
  _walkFreq:function(beat,chordName){
    var root=this._rootFreq(chordName);
    var next=this.chords[(this.chordIdx+1)%this.chords.length];
    var nextRoot=this._rootFreq(next);
    var walk=[root, root*Math.pow(2,7/12), root*Math.pow(2,4/12), nextRoot*Math.pow(2,-1/12)];
    return walk[beat%4];
  }
};

window.OraclePlayer=OP;

window.opLoadChords=function(list){
  if(!list||!list.length) return;
  OP.loadChords(list);
  var panel=document.getElementById('oracle-player-panel');
  if(panel) panel.style.display='';
};
window.opTogglePlay=function(){
  if(!OP.chords.length){alert(window._lang==='en'?'Generate an oracle progression first.':'Genera primero una progresión del oráculo.');return;}
  OP.toggle();
};
window.opStop=function(){OP.stop();};
window.opSetStyle=function(style){
  var wasPlaying=OP.isPlaying;
  if(wasPlaying){OP.pause();OP.step=0;}
  OP.style=style;
  document.querySelectorAll('.op-style-btn').forEach(function(b){b.classList.toggle('active',b.dataset.style===style);});
  var bassL=window._lang==='en'?{jazz:'Double Bass',bolero:'Double Bass',electronic:'Synth Bass'}:{jazz:'Contrabajo',bolero:'Contrabajo',electronic:'Bajo Sintetizador'};
  var drumsL=window._lang==='en'?{jazz:'Jazz Drums',bolero:'Bolero Percussion',electronic:'Electronic Drums'}:{jazz:'Batería Jazz',bolero:'Percusión Bolero',electronic:'Electrónica'};
  var bl=document.getElementById('op-bass-label'); if(bl) bl.textContent=bassL[style];
  var dl=document.getElementById('op-drums-label'); if(dl) dl.textContent=drumsL[style];
  if(wasPlaying) OP.start();
};
window.opSetInstrument=function(instr){
  OP.instrument=instr;
  document.querySelectorAll('.op-instr-btn').forEach(function(b){b.classList.toggle('active',b.dataset.instr===instr);});
};
window.opSetBpm=function(val){
  OP.bpm=parseInt(val);
  var el=document.getElementById('op-bpm-val'); if(el) el.textContent=val;
};
window.opSetVolume=function(track,val,slider){
  var v=parseInt(val)/100;
  if(slider){var row=slider.closest('.op-fader-row');if(row){var sp=row.querySelector('.op-fader-val');if(sp) sp.textContent=val;}}
  if(!OP.ctx) return;
  var targets={chords:OP.chordGain,bass:OP.bassGain,drums:OP.drumsGain};
  var t=targets[track]; if(t) t.gain.setTargetAtTime(v,OP.ctx.currentTime,0.025);
};

})();
