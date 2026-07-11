// Auto-extraído del monolito index.html — módulo de funcionalidad
// (sin cambios de contenido; solo separado en archivo)

let dodecaState = {isDragging:false, lastX:0, lastY:0, rotVelX:0, rotVelY:0, labels:[], movedDuringDrag:false};

function updateDodecaLabels() {
  const isEN = window._lang === 'en';
  const noteArr = isEN ? DODECA_ORGAN_ORDER_BY_NOTE_EN : DODECA_ORGAN_ORDER_BY_NOTE;
  const noteToOrgan = {};
  ORGANOS.forEach((o, i) => { o.nota.split('/').forEach(n => { noteToOrgan[n.trim()] = i; }); });
  dodecaState.labels.forEach((label, idx) => {
    const esNote = DODECA_ORGAN_ORDER_BY_NOTE[idx];
    const displayNote = noteArr[idx];
    const organIdx = noteToOrgan[esNote];
    const o = organIdx !== undefined ? ORGANOS[organIdx] : null;
    const orgName = o ? (isEN ? (o.nombre_en || o.nombre) : o.nombre).replace(/ \(.*\)/,'') : '';
    label.innerHTML = `<span class="ln-note">${displayNote}</span><span class="ln-org">${orgName}</span>`;
  });
  
}

function initDodecahedron() {
  const host = document.getElementById('dodeca-canvas-host');
  if (!host || typeof THREE === 'undefined') return;
  while (host.firstChild) host.removeChild(host.firstChild);
  dodecaState.labels.forEach(l => l.remove());
  dodecaState.labels = [];

  const W = host.clientWidth || 780, H = host.clientHeight || 520;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, W/H, 0.1, 100);
  camera.position.set(0, 0, 7);
  const renderer = new THREE.WebGLRenderer({antialias:true, alpha:true});
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(W, H);
  renderer.setClearColor(0x000000, 0);
  host.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0xffffff, 0.7));
  const dl = new THREE.DirectionalLight(0xffffff, 0.55); dl.position.set(5, 5, 7); scene.add(dl);
  const dl2 = new THREE.DirectionalLight(0xc4b5fd, 0.35); dl2.position.set(-5, -3, 4); scene.add(dl2);
  const pl = new THREE.PointLight(0xfcd34d, 0.45, 20); pl.position.set(0, 0, 6); scene.add(pl);

  const geo = new THREE.DodecahedronGeometry(2.3, 0);
  geo.clearGroups();
  const totalTris = geo.attributes.position.count / 3;
  const facesPerOrgan = totalTris / 12;
  for (let f = 0; f < 12; f++) geo.addGroup(f * facesPerOrgan * 3, facesPerOrgan * 3, f);

  const facesData = [];
  const pos = geo.attributes.position;
  for (let f = 0; f < 12; f++) {
    const base = f * facesPerOrgan * 3;
    const center = new THREE.Vector3();
    const verts = [];
    for (let i = 0; i < facesPerOrgan * 3; i++) {
      const v = new THREE.Vector3().fromBufferAttribute(pos, base + i);
      verts.push(v); center.add(v);
    }
    center.multiplyScalar(1 / verts.length);
    const normal = center.clone().normalize();
    facesData.push({faceIdx: f, center, normal});
  }

  const materials = DODECA_ORGAN_ORDER_BY_NOTE.map((noteName) => {
    const c = CORRESPONDENCIAS.find(x => x.nota === noteName);
    const colorHex = c ? c.color : '#888888';
    const col = new THREE.Color(colorHex);
    return new THREE.MeshStandardMaterial({
      color: col, emissive: col.clone().multiplyScalar(0.18),
      metalness: 0.25, roughness: 0.55, flatShading: true, side: THREE.DoubleSide
    });
  });

  const noteToOrgan = {};
  ORGANOS.forEach((o, i) => {
    o.nota.split('/').forEach(n => { noteToOrgan[n.trim()] = i; });
  });

  const mesh = new THREE.Mesh(geo, materials);
  const edges = new THREE.EdgesGeometry(geo, 1);
  const wire = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({color:0x1a1a3a, transparent:true, opacity:0.55}));
  const group = new THREE.Group();
  group.add(mesh); group.add(wire);
  scene.add(group);
  group.rotation.x = 0.45; group.rotation.y = 0.4;

  const wrap = document.getElementById('dodeca-wrap');
  facesData.forEach((fd) => {
    const esNote = DODECA_ORGAN_ORDER_BY_NOTE[fd.faceIdx];
    const isEN = window._lang === 'en';
    const displayNote = isEN ? DODECA_ORGAN_ORDER_BY_NOTE_EN[fd.faceIdx] : esNote;
    const organIdx = noteToOrgan[esNote];
    const o = organIdx !== undefined ? ORGANOS[organIdx] : null;
    const c = CORRESPONDENCIAS.find(x => x.nota === esNote);
    const colorHex = c ? c.color : '#888';
    const orgName = o ? (isEN ? (o.nombre_en || o.nombre) : o.nombre).replace(/ \(.*\)/,'') : '';
    const label = document.createElement('div');
    label.className = 'dodeca-label';
    label.style.background = `linear-gradient(135deg, ${colorHex}, ${colorHex}dd)`;
    label.innerHTML = `<span class="ln-note">${displayNote}</span><span class="ln-org">${orgName}</span>`;
    label.style.cursor = 'pointer';
    label.addEventListener('click', (e) => {
      e.stopPropagation();
      if (organIdx === undefined) return;
      selectOrgano(organIdx);
      const el = document.getElementById('organ-'+organIdx);
      if (el) { const top = el.getBoundingClientRect().top + window.scrollY - 72; window.scrollTo({top, behavior:'smooth'}); }
    });
    label.addEventListener('click', (e) => { e.stopPropagation(); if (c) playNote(c.freq); });
    wrap.appendChild(label);
    dodecaState.labels.push(label);
  });

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  renderer.domElement.addEventListener('click', (ev) => {
    if (dodecaState.movedDuringDrag) return;
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObject(mesh, false);
    if (hits.length) {
      const faceIdx = hits[0].face.materialIndex;
      const noteName = DODECA_ORGAN_ORDER_BY_NOTE[faceIdx];
      const organIdx = noteToOrgan[noteName];
      if (organIdx === undefined) return;
      selectOrgano(organIdx);
      const el = document.getElementById('organ-'+organIdx);
      if (el) { const top = el.getBoundingClientRect().top + window.scrollY - 72; window.scrollTo({top, behavior:'smooth'}); }
    }
  });

  let startX=0, startY=0;
  wrap.addEventListener('mousedown', (e) => {
    dodecaState.isDragging = true; dodecaState.movedDuringDrag = false;
    startX = dodecaState.lastX = e.clientX; startY = dodecaState.lastY = e.clientY;
    wrap.classList.add('grabbing');
  });
  window.addEventListener('mousemove', (e) => {
    if (!dodecaState.isDragging) return;
    const dx = e.clientX - dodecaState.lastX;
    const dy = e.clientY - dodecaState.lastY;
    if (Math.abs(e.clientX-startX) + Math.abs(e.clientY-startY) > 5) dodecaState.movedDuringDrag = true;
    group.rotation.y += dx * 0.008;
    group.rotation.x += dy * 0.008;
    dodecaState.rotVelX = dy * 0.008; dodecaState.rotVelY = dx * 0.008;
    dodecaState.lastX = e.clientX; dodecaState.lastY = e.clientY;
  });
  window.addEventListener('mouseup', () => {
    dodecaState.isDragging = false;
    wrap.classList.remove('grabbing');
  });
  wrap.addEventListener('touchstart', (e) => {
    if (!e.touches[0]) return;
    dodecaState.isDragging = true; dodecaState.movedDuringDrag = false;
    dodecaState.lastX = e.touches[0].clientX; dodecaState.lastY = e.touches[0].clientY;
  }, {passive:true});
  wrap.addEventListener('touchmove', (e) => {
    if (!dodecaState.isDragging || !e.touches[0]) return;
    const dx = e.touches[0].clientX - dodecaState.lastX;
    const dy = e.touches[0].clientY - dodecaState.lastY;
    group.rotation.y += dx * 0.01;
    group.rotation.x += dy * 0.01;
    dodecaState.rotVelX = dy*0.01; dodecaState.rotVelY = dx*0.01;
    dodecaState.lastX = e.touches[0].clientX; dodecaState.lastY = e.touches[0].clientY;
    dodecaState.movedDuringDrag = true;
  }, {passive:true});
  wrap.addEventListener('touchend', () => { dodecaState.isDragging = false; });

  const labelV = new THREE.Vector3();
  function animate() {
    requestAnimationFrame(animate);
    if (!dodecaState.isDragging) {
      group.rotation.y += 0.0028 + dodecaState.rotVelY * 0.92;
      group.rotation.x += dodecaState.rotVelX * 0.92;
      dodecaState.rotVelX *= 0.92; dodecaState.rotVelY *= 0.92;
    }
    const cw = host.clientWidth || W, ch = host.clientHeight || H;
    facesData.forEach((fd, i) => {
      const v = fd.center.clone();
      v.applyMatrix4(group.matrixWorld);
      const n = fd.normal.clone().transformDirection(group.matrixWorld);
      v.add(n.clone().multiplyScalar(0.05));
      labelV.copy(v).project(camera);
      const x = (labelV.x * 0.5 + 0.5) * cw;
      const y = (-labelV.y * 0.5 + 0.5) * ch;
      const lbl = dodecaState.labels[i];
      const dot = n.dot(new THREE.Vector3(0,0,1));
      if (dot < 0.05) {
        lbl.style.opacity = '0';
        lbl.style.pointerEvents = 'none';
      } else {
        lbl.style.opacity = Math.min(1, dot * 1.3 + 0.15).toFixed(2);
        lbl.style.pointerEvents = 'auto';
      }
      lbl.style.left = x + 'px';
      lbl.style.top  = y + 'px';
      const sc = 0.78 + dot * 0.42;
      lbl.style.transform = `translate(-50%,-50%) scale(${sc.toFixed(2)})`;
    });
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    const nw = host.clientWidth, nh = host.clientHeight;
    if (nw <= 0 || nh <= 0) return;
    camera.aspect = nw / nh; camera.updateProjectionMatrix();
    renderer.setSize(nw, nh);
  });

  // Expose for dodeca state
  dodecaState.scene = scene;
  dodecaState.group = group;
  dodecaState.facesData = facesData;
  dodecaState.materials = materials;
  dodecaState.noteToOrgan = noteToOrgan;
}