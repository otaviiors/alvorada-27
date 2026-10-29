/* Ambiente vivo do Alvorada 27: mar, ondas, espuma, nuvens, aves e aviões */
import * as THREE from "three";

function rng(seed) {
  let s = seed >>> 0;
  return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const lerp = (a, b, t) => a + (b - a) * t;

/* ---------- Texturas ---------- */
function seaNormalTexture() {
  // relevo de ondulações miúdas convertido em mapa de normais
  const N = 256, h = new Float32Array(N * N), r = rng(5);
  const waves = Array.from({ length: 18 }, () => ({ kx: Math.round((r() - 0.5) * 16), ky: Math.round((r() - 0.5) * 16), a: 0.4 + r(), p: r() * 6.28 }));
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    let v = 0;
    for (const w of waves) v += w.a * Math.sin((w.kx * x + w.ky * y) / N * Math.PI * 2 + w.p);
    h[y * N + x] = v;
  }
  const c = document.createElement("canvas"); c.width = c.height = N;
  const g = c.getContext("2d"), img = g.createImageData(N, N);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const dx = h[y * N + (x + 1) % N] - h[y * N + (x - 1 + N) % N];
    const dy = h[((y + 1) % N) * N + x] - h[((y - 1 + N) % N) * N + x];
    const nx = -dx * 0.35, ny = -dy * 0.35, nz = 1, L = Math.hypot(nx, ny, nz);
    const i = (y * N + x) * 4;
    img.data[i] = (nx / L * 0.5 + 0.5) * 255; img.data[i + 1] = (ny / L * 0.5 + 0.5) * 255; img.data[i + 2] = (nz / L * 0.5 + 0.5) * 255; img.data[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(22, 22);
  return t;
}
function waveTexture() {
  // crista de espuma: frente nítida, rastro suave, pontas sumindo
  const c = document.createElement("canvas"); c.width = 256; c.height = 64;
  const g = c.getContext("2d"), r = rng(8);
  for (let x = 0; x < 256; x++) {
    const taper = Math.sin(Math.PI * x / 255) ** 1.4;
    for (let y = 0; y < 64; y++) {
      const front = y < 14 ? y / 14 : Math.max(0, 1 - (y - 14) / 50);
      const a = taper * front * (0.75 + r() * 0.25);
      g.fillStyle = `rgba(255,255,255,${a.toFixed(3)})`;
      g.fillRect(x, y, 1, 1);
    }
  }
  return new THREE.CanvasTexture(c);
}
function splashTexture() {
  const c = document.createElement("canvas"); c.width = c.height = 128;
  const g = c.getContext("2d"), r = rng(13);
  for (let k = 0; k < 40; k++) {
    const a = r() * Math.PI * 2, d = 10 + r() * 46, rad = 4 + r() * 10;
    const x = 64 + Math.cos(a) * d, y = 64 + Math.sin(a) * d;
    const gr = g.createRadialGradient(x, y, 0, x, y, rad);
    gr.addColorStop(0, "rgba(255,255,255,0.95)"); gr.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = gr; g.beginPath(); g.arc(x, y, rad, 0, Math.PI * 2); g.fill();
  }
  return new THREE.CanvasTexture(c);
}
function cloudTexture(seed, puffs) {
  const c = document.createElement("canvas"); c.width = 256; c.height = 128;
  const g = c.getContext("2d"), r = rng(seed);
  for (let k = 0; k < puffs; k++) {
    const x = 40 + r() * 176, y = 48 + r() * 44, rad = 16 + r() * 34;
    const gr = g.createRadialGradient(x, y - rad * 0.2, 0, x, y, rad);
    gr.addColorStop(0, "rgba(255,255,255,0.95)"); gr.addColorStop(0.55, "rgba(250,250,252,0.5)"); gr.addColorStop(1, "rgba(240,242,248,0)");
    g.fillStyle = gr; g.beginPath(); g.arc(x, y, rad, 0, Math.PI * 2); g.fill();
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

/* ---------- Ambiente ---------- */
export function createAmbiente({ scene, SEA, TOP, isLand, coastSegments, mobile, reduced }) {
  const r = rng(2027);
  const amb = {};

  /* Mar */
  const seaNormal = seaNormalTexture();
  const seaMat = new THREE.MeshStandardMaterial({ color: "#1f6a8a", roughness: 0.32, metalness: 0.08, normalMap: seaNormal, normalScale: new THREE.Vector2(0.16, 0.16) });
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), seaMat);
  sea.rotation.x = -Math.PI / 2; sea.position.y = SEA; sea.receiveShadow = true;
  scene.add(sea);
  amb.seaMat = seaMat;

  /* Espuma do litoral */
  const cg = new THREE.BufferGeometry();
  cg.setAttribute("position", new THREE.Float32BufferAttribute(coastSegments, 3));
  const coastMat = new THREE.LineBasicMaterial({ color: "#f2fbff", transparent: true, opacity: 0.8 });
  scene.add(new THREE.LineSegments(cg, coastMat));

  /* Grade terra/mar e direção até a costa mais próxima (para as ondas) */
  const G = { x0: -30, z0: -30, step: 0.3, n: 200 };
  const land = new Uint8Array(G.n * G.n), near = new Int32Array(G.n * G.n).fill(-1), dist = new Int16Array(G.n * G.n).fill(-1);
  const queue = [];
  for (let j = 0; j < G.n; j++) for (let i = 0; i < G.n; i++) {
    const x = G.x0 + i * G.step, z = G.z0 + j * G.step, k = j * G.n + i;
    if (isLand(x, z)) { land[k] = 1; near[k] = k; dist[k] = 0; queue.push(k); }
  }
  for (let q = 0; q < queue.length; q++) {
    const k = queue[q], i = k % G.n, j = (k / G.n) | 0;
    for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const ii = i + di, jj = j + dj;
      if (ii < 0 || jj < 0 || ii >= G.n || jj >= G.n) continue;
      const kk = jj * G.n + ii;
      if (dist[kk] !== -1) continue;
      dist[kk] = dist[k] + 1; near[kk] = near[k]; queue.push(kk);
    }
  }
  const cellOf = (x, z) => {
    const i = Math.round((x - G.x0) / G.step), j = Math.round((z - G.z0) / G.step);
    if (i < 0 || j < 0 || i >= G.n || j >= G.n) return -1;
    return j * G.n + i;
  };
  const spawnCells = [];
  for (let k = 0; k < dist.length; k++) if (dist[k] >= 8 && dist[k] <= 26) spawnCells.push(k);

  /* Ondas */
  const waveTex = waveTexture(), splashTex = splashTexture();
  const waveGeo = (() => {
    const seg = 16, pos = [], uv = [], idx = [];
    for (let s = 0; s <= seg; s++) {
      const t = s / seg, x = t - 0.5, bow = -0.22 * (1 - (2 * x) ** 2);
      pos.push(x, 0, bow - 0.06, x, 0, bow + 0.06);
      uv.push(t, 1, t, 0);
      if (s < seg) { const b = s * 2; idx.push(b, b + 1, b + 2, b + 2, b + 1, b + 3); }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx);
    return g;
  })();
  const waves = [], splashes = [];
  const MAXW = mobile ? 14 : 30;
  let spawnT = 0;
  function spawnWave() {
    if (!spawnCells.length) return;
    const k = spawnCells[Math.floor(r() * spawnCells.length)];
    const i = k % G.n, j = (k / G.n) | 0;
    const x = G.x0 + i * G.step, z = G.z0 + j * G.step;
    const t = near[k], ti = t % G.n, tj = (t / G.n) | 0;
    const tx = G.x0 + ti * G.step, tz = G.z0 + tj * G.step;
    const dx = tx - x, dz = tz - z, L = Math.hypot(dx, dz) || 1;
    const mat = new THREE.MeshBasicMaterial({ map: waveTex, transparent: true, depthWrite: false, opacity: 0, side: THREE.DoubleSide });
    const m = new THREE.Mesh(waveGeo, mat);
    const width = 1.2 + r() * 2.6;
    m.scale.set(width, 1, 1 + r() * 0.6);
    m.position.set(x, SEA + 0.015, z);
    m.rotation.y = Math.atan2(dx, dz) + Math.PI;   // a crista fica de frente para a costa
    m.renderOrder = 2;
    scene.add(m);
    waves.push({ m, dir: new THREE.Vector2(dx / L, dz / L), speed: 0.55 + r() * 0.5, age: 0, peak: 0.45 + r() * 0.4, life: 9 + r() * 6 });
  }
  function splash(x, z, size) {
    const mat = new THREE.SpriteMaterial({ map: splashTex, transparent: true, depthWrite: false, opacity: 0.9 });
    const sp = new THREE.Sprite(mat);
    sp.position.set(x, SEA + 0.15, z);
    sp.scale.set(0.2, 0.2, 1);
    scene.add(sp);
    splashes.push({ sp, age: 0, size });
  }

  /* Nuvens com densidades diferentes */
  const cloudTex = [cloudTexture(3, 6), cloudTexture(4, 12), cloudTexture(9, 20), cloudTexture(17, 30)];
  const clouds = [];
  const nC = mobile ? 9 : 14;
  for (let k = 0; k < nC; k++) {
    const dens = Math.floor(r() * cloudTex.length);
    const mat = new THREE.SpriteMaterial({ map: cloudTex[dens], transparent: true, depthWrite: false, opacity: 0 });
    const sp = new THREE.Sprite(mat);
    const w = 5 + r() * 10 + dens * 1.5;
    sp.scale.set(w, w * (0.42 + r() * 0.18), 1);
    sp.position.set(-36 + r() * 72, 6 + r() * 5, -28 + r() * 56);
    sp.userData = { speed: 0.2 + r() * 0.45, base: 0.18 + dens * 0.13 + r() * 0.14 };
    scene.add(sp);
    clouds.push(sp);
  }

  /* Aves */
  const wingGeo = new THREE.BufferGeometry();
  wingGeo.setAttribute("position", new THREE.Float32BufferAttribute([0, 0, -0.03, 0, 0, 0.04, 0.13, 0, -0.01], 3));
  wingGeo.computeVertexNormals();
  const birdMat = new THREE.MeshBasicMaterial({ color: "#2c2a28", side: THREE.DoubleSide });
  const flocks = [];
  function newFlock(f) {
    const ang = r() * Math.PI * 2;
    f.dir.set(Math.cos(ang), Math.sin(ang));
    f.pos.set(-f.dir.x * 26 + (r() - 0.5) * 20, 2.6 + r() * 1.6, -f.dir.y * 26 + (r() - 0.5) * 20);
    f.speed = 1.1 + r() * 0.7;
    f.group.rotation.y = Math.atan2(f.dir.x, f.dir.y);
  }
  const nF = mobile ? 2 : 4;
  for (let k = 0; k < nF; k++) {
    const group = new THREE.Group(), birds = [];
    const n = 5 + Math.floor(r() * 6);
    for (let b = 0; b < n; b++) {
      const bird = new THREE.Group();
      const L = new THREE.Mesh(wingGeo, birdMat), R = new THREE.Mesh(wingGeo, birdMat);
      R.scale.x = -1;
      bird.add(L, R);
      // formação em V
      const side = b % 2 ? 1 : -1, row = Math.ceil(b / 2);
      bird.position.set(side * row * 0.16 + (r() - 0.5) * 0.05, (r() - 0.5) * 0.08, -row * 0.18);
      bird.userData = { L, R, ph: r() * 6.28, sp: 9 + r() * 3 };
      group.add(bird); birds.push(bird);
    }
    scene.add(group);
    const f = { group, birds, dir: new THREE.Vector2(), pos: new THREE.Vector3(), speed: 1 };
    newFlock(f);
    f.pos.addScaledVector(new THREE.Vector3(f.dir.x, 0, f.dir.y), r() * 40);
    flocks.push(f);
  }

  /* Aviões com rastro */
  const planeMat = new THREE.MeshStandardMaterial({ color: "#f4f6f8", roughness: 0.5 });
  const trailTex = (() => {
    const c = document.createElement("canvas"); c.width = 256; c.height = 8;
    const g = c.getContext("2d"), gr = g.createLinearGradient(0, 0, 256, 0);
    gr.addColorStop(0, "rgba(255,255,255,0.75)"); gr.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = gr; g.fillRect(0, 0, 256, 8);
    return new THREE.CanvasTexture(c);
  })();
  function makePlane() {
    const p = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.03, 0.42, 8), planeMat); body.rotation.x = Math.PI / 2;
    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), planeMat); nose.position.z = 0.21;
    const wings = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.012, 0.09), planeMat); wings.position.z = 0.02;
    const tailH = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.01, 0.05), planeMat); tailH.position.z = -0.19;
    const tailV = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.08, 0.06), planeMat); tailV.position.set(0, 0.04, -0.19);
    const trail = new THREE.Mesh(new THREE.PlaneGeometry(4.5, 0.05), new THREE.MeshBasicMaterial({ map: trailTex, transparent: true, depthWrite: false, opacity: 0.8 }));
    trail.rotation.set(-Math.PI / 2, 0, Math.PI / 2); trail.position.z = -2.45;
    p.add(body, nose, wings, tailH, tailV, trail);
    p.traverse(o => { if (o.isMesh && o !== trail) o.castShadow = true; });
    scene.add(p);
    return p;
  }
  const planes = [];
  function newPlane(pl) {
    const ang = r() * Math.PI * 2;
    pl.dir.set(Math.cos(ang), Math.sin(ang));
    pl.pos.set(-pl.dir.x * 34 + (r() - 0.5) * 24, 6.5 + r() * 1.5, -pl.dir.y * 34 + (r() - 0.5) * 24);
    pl.speed = 2.6 + r() * 1.2;
    pl.wait = 4 + r() * 14;
    pl.obj.rotation.y = Math.atan2(pl.dir.x, pl.dir.y);
  }
  for (let k = 0; k < 2; k++) {
    const pl = { obj: makePlane(), dir: new THREE.Vector2(), pos: new THREE.Vector3(), speed: 3, wait: 0 };
    newPlane(pl); pl.wait = k * 9;
    planes.push(pl);
  }

  /* ---------- Animação ---------- */
  let time = 0;
  amb.update = (dt, camDist, overviewDist, mood = 0.8) => {
    time += dt;
    if (!reduced) { seaNormal.offset.x = time * 0.004; seaNormal.offset.y = time * 0.0025; }
    coastMat.opacity = 0.55 + 0.3 * Math.sin(time * 1.3);

    // ondas
    spawnT -= dt;
    if (!reduced && spawnT <= 0 && waves.length < MAXW) { spawnWave(); spawnT = 0.25 + r() * 0.35; }
    for (let w = waves.length - 1; w >= 0; w--) {
      const o = waves[w];
      o.age += dt;
      o.m.position.x += o.dir.x * o.speed * dt;
      o.m.position.z += o.dir.y * o.speed * dt;
      const fadeIn = Math.min(1, o.age / 1.5), fadeOut = Math.min(1, (o.life - o.age) / 1.5);
      o.m.material.opacity = o.peak * Math.max(0, Math.min(fadeIn, fadeOut));
      // quando a crista chega no bloco de terra, quebra em espuma
      const fx = o.m.position.x + o.dir.x * 0.25, fz = o.m.position.z + o.dir.y * 0.25;
      const c = cellOf(fx, fz);
      const hit = c >= 0 && land[c];
      if (hit || o.age > o.life) {
        if (hit) splash(fx, fz, o.m.scale.x * 0.55);
        scene.remove(o.m); o.m.material.dispose();
        waves.splice(w, 1);
      }
    }
    for (let s = splashes.length - 1; s >= 0; s--) {
      const o = splashes[s];
      o.age += dt;
      const t = o.age / 1.1;
      const k = 0.25 + o.size * Math.sqrt(t);
      o.sp.scale.set(k * 1.6, k * 0.7, 1);
      o.sp.material.opacity = 0.9 * (1 - t);
      if (t >= 1) { scene.remove(o.sp); o.sp.material.dispose(); splashes.splice(s, 1); }
    }

    // nuvens somem quando a câmera chega perto
    const fade = Math.max(0, Math.min(1, (camDist - overviewDist * 0.3) / (overviewDist * 0.45)));
    const cloudCol = new THREE.Color("#6f7780").lerp(new THREE.Color("#ffffff"), mood);
    for (const c of clouds) {
      if (!reduced) { c.position.x += c.userData.speed * dt; if (c.position.x > 40) c.position.x = -40; }
      c.material.opacity = c.userData.base * fade;
      c.material.color.copy(cloudCol);
    }

    // aves
    for (const f of flocks) {
      f.pos.x += f.dir.x * f.speed * dt; f.pos.z += f.dir.y * f.speed * dt;
      f.group.position.copy(f.pos);
      for (const b of f.birds) {
        const a = Math.sin(time * b.userData.sp + b.userData.ph) * 0.55;
        b.userData.L.rotation.z = a; b.userData.R.rotation.z = -a;
      }
      if (Math.abs(f.pos.x) > 34 || Math.abs(f.pos.z) > 34) newFlock(f);
    }

    // aviões
    for (const p of planes) {
      if (p.wait > 0) { p.wait -= dt; p.obj.visible = false; continue; }
      p.obj.visible = true;
      p.pos.x += p.dir.x * p.speed * dt; p.pos.z += p.dir.y * p.speed * dt;
      p.obj.position.copy(p.pos);
      if (Math.abs(p.pos.x) > 40 || Math.abs(p.pos.z) > 40) newPlane(p);
    }
  };
  return amb;
}
