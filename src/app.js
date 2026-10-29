/* Alvorada 27 — protótipo 0.2: o Brasil como maquete 3D */
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

/* ============ Constantes ============ */
const LON0 = -53.5, LAT0 = -14.5, KX = Math.cos(14.5 * Math.PI / 180);
const px = lon => (lon - LON0) * KX;      // x no plano da forma (leste +)
const py = lat => (lat - LAT0);           // y no plano da forma (norte +)
const TOP = 1.7;                          // altura do bloco de terra
const SEA = 0.45;                         // nível do mar
const FOV = 30;
const MOBILE = () => window.matchMedia("(max-width: 760px)").matches;
const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Biomas: cor do chão, paleta das árvores, densidade (árvores por grau²), forma */
const BIOMAS = {
  floresta:  { nome: "Floresta amazônica", chao: "#4f7a37", copa: ["#3f7a30", "#4f8a36", "#356d2c", "#5c9640", "#2f6a2d", "#6aa046"], dens: 30, tam: [0.10, 0.17], forma: "copa", achata: 0.85 },
  transicao: { nome: "Transição", chao: "#7f9a45", copa: ["#5f8c36", "#7a9c3e", "#4f7d32", "#8fab48"], dens: 14, tam: [0.08, 0.14], forma: "copa", achata: 0.75 },
  cerrado:   { nome: "Cerrado", chao: "#a89a4c", copa: ["#7b8c3a", "#93993f", "#6d7f34", "#a6a24a"], dens: 7, tam: [0.06, 0.11], forma: "copa", achata: 0.5 },
  caatinga:  { nome: "Caatinga", chao: "#bfa66a", copa: ["#8c9a62", "#7e8a5a", "#a0a26c", "#6f7d52"], dens: 6, tam: [0.045, 0.085], forma: "copa", achata: 0.7 },
  mata:      { nome: "Mata Atlântica", chao: "#679246", copa: ["#4c8a3c", "#5d9a44", "#3f7d38", "#6fa64c"], dens: 16, tam: [0.08, 0.14], forma: "copa", achata: 0.85 },
  araucaria: { nome: "Mata de araucária", chao: "#749a4c", copa: ["#3d6e3a", "#4a7d42", "#5a8c48"], dens: 12, tam: [0.06, 0.1], forma: "cone", achata: 1 },
  pampa:     { nome: "Pampa", chao: "#8db058", copa: ["#4a7a34", "#5d8a3a", "#3b6a30"], dens: 2.5, tam: [0.06, 0.1], forma: "copa", achata: 0.8 }
};
const BIOMA_UF = {
  AM: "floresta", PA: "floresta", AC: "floresta", RO: "floresta", RR: "floresta", AP: "floresta",
  MA: "transicao", TO: "transicao", MT: "transicao",
  GO: "cerrado", DF: "cerrado", MS: "cerrado",
  PI: "caatinga", CE: "caatinga", RN: "caatinga", PB: "caatinga", PE: "caatinga", AL: "caatinga", SE: "caatinga", BA: "caatinga",
  MG: "mata", ES: "mata", RJ: "mata", SP: "mata",
  PR: "araucaria", SC: "araucaria", RS: "pampa"
};
const REGIOES = { "Norte": "#4f9a62", "Nordeste": "#e2a33f", "Centro-Oeste": "#c2b25a", "Sudeste": "#d3784e", "Sul": "#77acc9" };
const RAMP = ["#8a3f2b", "#cf7a3c", "#e8c35a", "#9cc47a", "#3f8f5a"];

const LAYERS = {
  natureza: { nome: "Natureza" },
  regiao: { nome: "Regiões" },
  pibPerCapita: { nome: "PIB per capita", campo: "pibPerCapita", fmt: v => "R$ " + fmtInt(v) },
  idhm: { nome: "IDHM", campo: "idhm", fmt: v => v == null ? "em verificação" : fmtDec(v, 3) },
  densidade: { nome: "Densidade", campo: "densidade", fmt: v => fmtDec(v, 1) + " hab/km²" }
};

/* ============ Formatação ============ */
const nf0 = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 });
const fmtInt = v => nf0.format(v);
const fmtDec = (v, d) => new Intl.NumberFormat("pt-BR", { minimumFractionDigits: d, maximumFractionDigits: d }).format(v);
const fmtPop = v => v >= 1e6 ? fmtDec(v / 1e6, 1) + " mi" : fmtInt(Math.round(v / 1000)) + " mil";
const fmtPib = bi => bi >= 1000 ? "R$ " + fmtDec(bi / 1000, 2) + " tri" : "R$ " + fmtDec(bi, 1) + " bi";
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

/* ============ Aleatório com semente (a maquete sai igual sempre) ============ */
function rng(seed) {
  let s = seed >>> 0;
  return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const ease = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/* ============ Estado do app ============ */
const S = {
  data: null, geo: null, ranks: {}, layer: "natureza", mood: 0.8,
  selected: null, hover: null, states: {}, overviewDist: 80, needShadow: true
};

/* ============ Geometria ============ */
function polysOf(f) {
  const g = f.geometry;
  return g.type === "Polygon" ? [g.coordinates] : g.coordinates;
}
function pip(x, y, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1], xj = ring[j][0], yj = ring[j][1];
    if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) inside = !inside;
  }
  return inside;
}
function inPolys(lon, lat, polys) {
  for (const p of polys) {
    if (!pip(lon, lat, p[0])) continue;
    let hole = false;
    for (let k = 1; k < p.length; k++) if (pip(lon, lat, p[k])) { hole = true; break; }
    if (!hole) return true;
  }
  return false;
}
function ringArea(r) {
  let a = 0;
  for (let i = 0, j = r.length - 1; i < r.length; j = i++) a += (px(r[j][0]) * py(r[i][1]) - px(r[i][0]) * py(r[j][1]));
  return Math.abs(a / 2);
}
function bboxLL(polys) {
  let x0 = 180, y0 = 90, x1 = -180, y1 = -90;
  for (const p of polys) for (const [x, y] of p[0]) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  return [x0, y0, x1, y1];
}
// anel limpo: sem ponto final repetido e sem pontos duplicados seguidos (a triangulação falha com eles)
function cleanRing(ring) {
  const out = [];
  for (const [lo, la] of ring) {
    const v = new THREE.Vector2(px(lo), py(la));
    const prev = out[out.length - 1];
    if (!prev || prev.distanceToSquared(v) > 1e-10) out.push(v);
  }
  if (out.length > 1 && out[0].distanceToSquared(out[out.length - 1]) < 1e-10) out.pop();
  return out;
}
function shapesOf(polys) {
  return polys.map(p => {
    const sh = new THREE.Shape(cleanRing(p[0]));
    for (let k = 1; k < p.length; k++) sh.holes.push(new THREE.Path(cleanRing(p[k])));
    return sh;
  }).filter(sh => sh.getPoints().length >= 3);
}

/* ============ Texturas pintadas em canvas ============ */
function soilTexture() {
  const c = document.createElement("canvas"); c.width = 512; c.height = 256;
  const g = c.getContext("2d");
  const r = rng(7);
  // de cima (fundo do bloco) para baixo (topo do bloco, onde fica a grama)
  const camadas = [
    [0.00, "#5b4a3d"], [0.22, "#6e5641"], [0.42, "#8a5a3a"], [0.62, "#a9693e"], [0.80, "#6b4a30"], [0.91, "#3f6a2e"]
  ];
  for (let i = 0; i < camadas.length; i++) {
    const top = camadas[i][0] * c.height;
    g.fillStyle = camadas[i][1];
    g.beginPath();
    g.moveTo(0, c.height);
    // borda superior ondulada de cada camada
    for (let x = 0; x <= c.width; x += 16) g.lineTo(x, top + (i ? (r() - 0.5) * 10 : 0));
    g.lineTo(c.width, c.height); g.closePath(); g.fill();
  }
  // pedrinhas e grão
  for (let k = 0; k < 2600; k++) {
    const x = r() * c.width, y = r() * c.height * 0.9;
    const v = Math.floor(r() * 60);
    g.fillStyle = `rgba(${30 + v},${22 + v * 0.8},${14 + v * 0.6},${0.25 + r() * 0.3})`;
    g.fillRect(x, y, 1 + r() * 3, 1 + r() * 2);
  }
  // franja de grama com fios
  for (let x = 0; x < c.width; x += 2) {
    const h = 6 + r() * 14;
    g.fillStyle = r() > 0.5 ? "#4f7d34" : "#3a6428";
    g.fillRect(x, c.height * 0.9 - h * 0.4, 2, h);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = THREE.RepeatWrapping; t.wrapT = THREE.ClampToEdgeWrapping;
  t.repeat.set(0.18, 1);
  t.anisotropy = 4;
  return t;
}
function grainTexture() {
  const c = document.createElement("canvas"); c.width = c.height = 256;
  const g = c.getContext("2d");
  g.fillStyle = "#ffffff"; g.fillRect(0, 0, 256, 256);
  const r = rng(11);
  for (let k = 0; k < 9000; k++) {
    const v = 200 + Math.floor(r() * 55);
    g.fillStyle = `rgb(${v},${v},${v})`;
    g.fillRect(r() * 256, r() * 256, 1 + r() * 3, 1 + r() * 3);
  }
  for (let k = 0; k < 60; k++) {
    const v = 215 + Math.floor(r() * 40);
    g.fillStyle = `rgba(${v},${v},${v},0.5)`;
    g.beginPath(); g.arc(r() * 256, r() * 256, 6 + r() * 18, 0, Math.PI * 2); g.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(0.9, 0.9);
  return t;
}
function cloudTexture() {
  const c = document.createElement("canvas"); c.width = 256; c.height = 128;
  const g = c.getContext("2d");
  const r = rng(3);
  for (let k = 0; k < 14; k++) {
    const x = 40 + r() * 176, y = 50 + r() * 40, rad = 22 + r() * 30;
    const gr = g.createRadialGradient(x, y, 0, x, y, rad);
    gr.addColorStop(0, "rgba(255,255,255,0.9)"); gr.addColorStop(0.6, "rgba(255,255,255,0.45)"); gr.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = gr; g.beginPath(); g.arc(x, y, rad, 0, Math.PI * 2); g.fill();
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

/* ============ Cena ============ */
let renderer, scene, camera, controls, sun, hemi, sea, seaMat, cloudSprites = [];
const raycaster = new THREE.Raycaster();
const slabMeshes = [];

function initScene() {
  const stage = document.getElementById("stage");
  renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, MOBILE() ? 1.5 : 1.5));
  renderer.setSize(stage.clientWidth, stage.clientHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.shadowMap.autoUpdate = false;     // a maquete é estática: só recalcula sombra quando algo mexe
  stage.appendChild(renderer.domElement);

  scene = new THREE.Scene();
  scene.background = new THREE.Color("#1d4c66");
  scene.fog = new THREE.Fog("#1d4c66", 90, 260);

  camera = new THREE.PerspectiveCamera(FOV, stage.clientWidth / stage.clientHeight, 0.5, 600);

  hemi = new THREE.HemisphereLight("#d8e9f7", "#6a5238", 1.0);
  scene.add(hemi);
  sun = new THREE.DirectionalLight("#ffd29e", 2.6);
  sun.position.set(-30, 34, -6);
  sun.castShadow = true;
  const sm = MOBILE() ? 1024 : 2048;
  sun.shadow.mapSize.set(sm, sm);
  Object.assign(sun.shadow.camera, { left: -26, right: 26, top: 26, bottom: -26, near: 1, far: 120 });
  sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.03;
  scene.add(sun); scene.add(sun.target);

  seaMat = new THREE.MeshStandardMaterial({ color: "#1f6a8a", roughness: 0.38, metalness: 0.08 });
  sea = new THREE.Mesh(new THREE.PlaneGeometry(600, 600), seaMat);
  sea.rotation.x = -Math.PI / 2; sea.position.y = SEA; sea.receiveShadow = true;
  scene.add(sea);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableRotate = false;
  controls.enablePan = false;
  controls.enableDamping = true;
  controls.dampingFactor = 0.12;
  controls.zoomToCursor = true;
  controls.zoomSpeed = 1.1;
  controls.minDistance = 4.5;
  controls.touches = { ONE: null, TWO: THREE.TOUCH.DOLLY_PAN };
}

/* ---------- Estados como blocos ---------- */
function buildStates() {
  const soil = soilTexture(), grain = grainTexture();
  const sideMat = new THREE.MeshStandardMaterial({ map: soil, roughness: 1 });
  const coastPts = [];
  const borderMat = new THREE.LineBasicMaterial({ color: "#fff6dc", transparent: true, opacity: 0.55 });

  for (const f of S.geo.features) {
    const uf = f.properties.sigla;
    const e = S.data.estados[uf];
    const polys = polysOf(f);
    const geom = new THREE.ExtrudeGeometry(shapesOf(polys), { depth: TOP, bevelEnabled: false, curveSegments: 1 });
    geom.rotateX(-Math.PI / 2);
    const topMat = new THREE.MeshStandardMaterial({ color: BIOMAS[BIOMA_UF[uf]].chao, map: grain, roughness: 0.95 });
    const slab = new THREE.Mesh(geom, [topMat, sideMat]);
    slab.castShadow = true; slab.receiveShadow = true;
    slab.userData.uf = uf;
    slabMeshes.push(slab);

    const group = new THREE.Group();
    group.add(slab);

    // contorno do estado no topo
    const segs = [];
    for (const p of polys) for (const ring of p) {
      for (let i = 0; i < ring.length - 1; i++) {
        segs.push(px(ring[i][0]), TOP + 0.006, -py(ring[i][1]), px(ring[i + 1][0]), TOP + 0.006, -py(ring[i + 1][1]));
        coastPts.push(px(ring[i][0]), SEA + 0.004, -py(ring[i][1]), px(ring[i + 1][0]), SEA + 0.004, -py(ring[i + 1][1]));
      }
    }
    const bg = new THREE.BufferGeometry();
    bg.setAttribute("position", new THREE.Float32BufferAttribute(segs, 3));
    group.add(new THREE.LineSegments(bg, borderMat));

    const area = polys.reduce((s, p) => s + ringArea(p[0]), 0);
    S.states[uf] = { uf, e, polys, bbox: bboxLL(polys), area, group, slab, topMat, lift: 0, liftTarget: 0, treeMats: [] };
    scene.add(group);
  }
  // espuma do litoral (as divisas internas ficam escondidas dentro do bloco)
  const cg = new THREE.BufferGeometry();
  cg.setAttribute("position", new THREE.Float32BufferAttribute(coastPts, 3));
  scene.add(new THREE.LineSegments(cg, new THREE.LineBasicMaterial({ color: "#e8f6ff", transparent: true, opacity: 0.7 })));
}

/* ---------- Vegetação ---------- */
function buildTrees() {
  const blobGeo = new THREE.IcosahedronGeometry(1, 0); blobGeo.translate(0, 0.6, 0);
  const coneGeo = new THREE.ConeGeometry(0.55, 2.2, 6); coneGeo.translate(0, 1.1, 0);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), pos = new THREE.Vector3(), scl = new THREE.Vector3(), col = new THREE.Color();
  const factor = MOBILE() ? 0.6 : 1;

  for (const st of Object.values(S.states)) {
    const b = BIOMAS[BIOMA_UF[st.uf]];
    const r = rng(st.uf.charCodeAt(0) * 131 + st.uf.charCodeAt(1));
    const target = Math.min(3200, Math.round(st.area * b.dens * factor));
    const capX = px(st.e.lon), capZ = -py(st.e.lat);
    const cityR = cityRadius(st.e.populacao) * 1.25;
    const [x0, y0, x1, y1] = st.bbox;
    const pts = [];
    let tries = 0;
    while (pts.length < target && tries < target * 8) {
      tries++;
      const lon = lerp(x0, x1, r()), lat = lerp(y0, y1, r());
      if (!inPolys(lon, lat, st.polys)) continue;
      const x = px(lon), z = -py(lat);
      if (Math.hypot(x - capX, z - capZ) < cityR) continue;
      pts.push([x, z]);
    }
    if (!pts.length) continue;
    const geo = b.forma === "cone" ? coneGeo : blobGeo;
    const mat = new THREE.MeshStandardMaterial({ color: "#ffffff", flatShading: true, roughness: 0.9 });
    const inst = new THREE.InstancedMesh(geo, mat, pts.length);
    // no Sul, misturar copas redondas entre as araucárias
    pts.forEach(([x, z], i) => {
      const s = lerp(b.tam[0], b.tam[1], r());
      pos.set(x, TOP, z);
      q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), r() * Math.PI * 2);
      scl.set(s, s * b.achata * (0.85 + r() * 0.3), s);
      m4.compose(pos, q, scl);
      inst.setMatrixAt(i, m4);
      col.set(b.copa[Math.floor(r() * b.copa.length)]).offsetHSL(0, 0, (r() - 0.5) * 0.06);
      inst.setColorAt(i, col);
    });
    inst.castShadow = true; inst.receiveShadow = false;
    inst.instanceMatrix.needsUpdate = true;
    st.group.add(inst);
    st.treeMats.push(mat);
  }
}

/* ---------- Cidades em miniatura ---------- */
function cityRadius(pop) { return 0.16 + 0.55 * Math.sqrt(pop / 44e6); }
function buildCities() {
  const box = new THREE.BoxGeometry(1, 1, 1); box.translate(0, 0.5, 0);
  const roofGeo = new THREE.ConeGeometry(0.75, 0.6, 4); roofGeo.rotateY(Math.PI / 4); roofGeo.translate(0, 0.3, 0);
  const fachadas = ["#f3ead8", "#efe0c2", "#e9c9a0", "#d9e4ea", "#f2d37a", "#e8b49a", "#cfe0c8", "#ffffff"];
  const vidros = ["#b9c8d4", "#a7b9c8", "#d4dde4", "#c3cfd8", "#8fa4b6"];
  const telhas = ["#b4553a", "#c0673f", "#9e4a34"];
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), pos = new THREE.Vector3(), scl = new THREE.Vector3(), col = new THREE.Color();

  for (const st of Object.values(S.states)) {
    const e = st.e, r = rng(e.populacao % 100000 + 17);
    const k = Math.pow(e.populacao / 44e6, 0.55);
    const nTall = Math.round(6 + 70 * k), nHouse = Math.round(18 + 90 * k);
    const R = cityRadius(e.populacao);
    const cx = px(e.lon), cz = -py(e.lat);
    const bodies = [], roofs = [];
    const place = (radius) => {
      for (let t = 0; t < 20; t++) {
        const a = r() * Math.PI * 2, d = Math.sqrt(r()) * radius;
        const x = cx + Math.cos(a) * d, z = cz + Math.sin(a) * d;
        if (inPolys(x / KX + LON0, -z + LAT0, st.polys)) return [x, z, d / radius];
      }
      return null;
    };
    for (let i = 0; i < nTall; i++) {
      const p = place(R * 0.55); if (!p) continue;
      const h = (0.08 + r() * 0.5) * (0.25 + 1.1 * k) * (1 - p[2] * 0.6);
      const w = 0.035 + r() * 0.035;
      bodies.push({ x: p[0], z: p[1], w, d: w * (0.8 + r() * 0.5), h: Math.max(0.05, h), c: vidros[Math.floor(r() * vidros.length)] });
    }
    for (let i = 0; i < nHouse; i++) {
      const p = place(R); if (!p) continue;
      const w = 0.025 + r() * 0.02;
      const h = 0.02 + r() * 0.02;
      bodies.push({ x: p[0], z: p[1], w, d: w * (0.8 + r() * 0.4), h, c: fachadas[Math.floor(r() * fachadas.length)] });
      roofs.push({ x: p[0], z: p[1], w: w * 1.05, h, c: telhas[Math.floor(r() * telhas.length)] });
    }
    const mat = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.8 });
    const inst = new THREE.InstancedMesh(box, mat, bodies.length);
    bodies.forEach((b, i) => {
      pos.set(b.x, TOP, b.z); q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), r() * 0.6);
      scl.set(b.w, b.h, b.d); m4.compose(pos, q, scl); inst.setMatrixAt(i, m4);
      inst.setColorAt(i, col.set(b.c));
    });
    inst.castShadow = true; inst.receiveShadow = true;
    st.group.add(inst);
    if (roofs.length) {
      const ri = new THREE.InstancedMesh(roofGeo, new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.85, flatShading: true }), roofs.length);
      roofs.forEach((b, i) => {
        pos.set(b.x, TOP + b.h, b.z); q.identity(); scl.set(b.w, b.w * 0.9, b.w); m4.compose(pos, q, scl);
        ri.setMatrixAt(i, m4); ri.setColorAt(i, col.set(b.c));
      });
      ri.castShadow = true;
      st.group.add(ri);
    }
    // praça clarinha embaixo da cidade
    const plaza = new THREE.Mesh(new THREE.CircleGeometry(R * 0.9, 28), new THREE.MeshStandardMaterial({ color: "#cbbf9f", roughness: 1, transparent: true, opacity: 0.55 }));
    plaza.rotation.x = -Math.PI / 2; plaza.position.set(cx, TOP + 0.003, cz); plaza.receiveShadow = true;
    st.group.add(plaza);
  }
}

/* ---------- Rios ---------- */
function buildRivers(rios) {
  const verts = [], idx = [];
  const inBR = (lon, lat) => {
    for (const st of Object.values(S.states)) {
      const [x0, y0, x1, y1] = st.bbox;
      if (lon < x0 || lon > x1 || lat < y0 || lat > y1) continue;
      if (inPolys(lon, lat, st.polys)) return true;
    }
    return false;
  };
  for (const f of rios.features) {
    const lines = f.geometry.type === "LineString" ? [f.geometry.coordinates] : f.geometry.coordinates;
    const w = (f.properties.scalerank <= 3 ? 0.13 : 0.075);
    for (const line of lines) {
      const inside = line.map(([lo, la]) => inBR(lo, la));
      for (let i = 0; i < line.length - 1; i++) {
        if (!inside[i] || !inside[i + 1]) continue;
        const ax = px(line[i][0]), az = -py(line[i][1]), bx = px(line[i + 1][0]), bz = -py(line[i + 1][1]);
        const dx = bx - ax, dz = bz - az, L = Math.hypot(dx, dz) || 1;
        const nx = -dz / L * w / 2, nz = dx / L * w / 2;
        const y = TOP + 0.009, base = verts.length / 3;
        verts.push(ax + nx, y, az + nz, ax - nx, y, az - nz, bx + nx, y, bz + nz, bx - nx, y, bz - nz);
        idx.push(base, base + 2, base + 1, base + 1, base + 2, base + 3);
        // juntas arredondadas simples: um losango no vértice
        const jb = verts.length / 3;
        verts.push(bx + w / 2, y, bz, bx, y, bz + w / 2, bx - w / 2, y, bz, bx, y, bz - w / 2);
        idx.push(jb, jb + 1, jb + 2, jb, jb + 2, jb + 3);
      }
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
  g.setIndex(idx); g.computeVertexNormals();
  const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: "#4fb3e0", roughness: 0.25, metalness: 0.05, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2 }));
  m.receiveShadow = true;
  scene.add(m);
}

/* ---------- Nuvens ---------- */
function buildClouds() {
  const tex = cloudTexture();
  const r = rng(99);
  const n = MOBILE() ? 10 : 16;
  for (let i = 0; i < n; i++) {
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, opacity: 0.8 });
    const sp = new THREE.Sprite(mat);
    const w = 8 + r() * 9;
    sp.scale.set(w, w * 0.5, 1);
    sp.position.set(-34 + r() * 68, 5 + r() * 4, -26 + r() * 52);
    sp.userData = { speed: 0.25 + r() * 0.5, base: 0.45 + r() * 0.4, idx: i };
    scene.add(sp);
    cloudSprites.push(sp);
  }
}

/* ============ Câmera ============ */
const BR_CENTER = new THREE.Vector3(-0.6, TOP, 0.2);
let viewOff = { x: 0, y: 0, fx: 1, fy: 1 };

function panelBox() {
  const p = document.getElementById("panel");
  if (MOBILE()) {
    const h = p.classList.contains("collapsed") ? 92 : p.offsetHeight;
    return { side: 0, bottom: h };
  }
  return { side: p.offsetWidth + 32, bottom: 0 };
}
function applyViewOffset() {
  const st = document.getElementById("stage");
  const W = st.clientWidth, H = st.clientHeight;
  const pb = panelBox();
  const top = 70;   // barra superior + camadas
  const fullW = W + pb.side, fullH = H + pb.bottom + top;
  camera.aspect = fullW / fullH;
  // desloca o centro óptico para longe do painel e da barra superior
  camera.setViewOffset(fullW, fullH, 0, pb.bottom, W, H);
  camera.updateProjectionMatrix();
  viewOff = { fy: (H - pb.bottom - top) / fullH, fx: camera.aspect * (W - pb.side) / fullW };
}
function pitchFor(dist) {
  const t = clamp((dist - 5) / (S.overviewDist - 5), 0, 1);
  return THREE.MathUtils.degToRad(lerp(34, 50, t));
}
function distToFit(w, d) {
  const tan = Math.tan(THREE.MathUtils.degToRad(FOV / 2));
  const dh = (d * 0.85) / (2 * tan * viewOff.fy);
  const dw = w / (2 * tan * viewOff.fx);
  return Math.max(dh, dw) * 1.08;
}
function placeCamera(target, dist) {
  const p = pitchFor(dist);
  camera.position.set(target.x, target.y + Math.sin(p) * dist, target.z + Math.cos(p) * dist);
  camera.lookAt(target);
  controls.target.copy(target);
}
let fly = null;
function flyTo(target, dist, dur = 1600) {
  const from = { t: controls.target.clone(), d: camera.position.distanceTo(controls.target) };
  fly = { from, to: { t: target.clone(), d: dist }, start: performance.now(), dur: REDUCED ? 1 : dur };
  controls.enabled = false;
}
function overview(animated = true) {
  S.overviewDist = distToFit(40, 41);
  controls.maxDistance = S.overviewDist * 1.12;
  scene.fog.near = S.overviewDist * 1.5; scene.fog.far = S.overviewDist * 4;
  if (animated) flyTo(BR_CENTER, S.overviewDist); else placeCamera(BR_CENTER, S.overviewDist);
}
function stateView(uf) {
  const st = S.states[uf];
  const [x0, y0, x1, y1] = st.bbox;
  const w = (x1 - x0) * KX, d = (y1 - y0);
  const t = new THREE.Vector3(px((x0 + x1) / 2), TOP, -py((y0 + y1) / 2));
  const dist = clamp(distToFit(w, d) * 1.15, 6, S.overviewDist);
  flyTo(t, dist, 1900);
}

/* ============ Cores por camada ============ */
function quantileStops(campo) {
  const vals = Object.values(S.data.estados).map(e => e[campo]).filter(v => v != null).sort((a, b) => a - b);
  const q = p => vals[Math.min(vals.length - 1, Math.round(p * (vals.length - 1)))];
  return [q(0), q(0.25), q(0.5), q(0.75), q(1)];
}
function rampColor(v, stops) {
  if (v == null) return new THREE.Color("#8a9296");
  let i = 0;
  while (i < stops.length - 2 && v > stops[i + 1]) i++;
  const t = clamp((v - stops[i]) / ((stops[i + 1] - stops[i]) || 1), 0, 1);
  return new THREE.Color(RAMP[i]).lerp(new THREE.Color(RAMP[i + 1]), t);
}
function applyLayer() {
  const L = LAYERS[S.layer];
  const stops = L.campo ? quantileStops(L.campo) : null;
  for (const st of Object.values(S.states)) {
    let c, tint;
    if (S.layer === "natureza") { c = new THREE.Color(BIOMAS[BIOMA_UF[st.uf]].chao); tint = new THREE.Color("#ffffff"); }
    else if (S.layer === "regiao") { c = new THREE.Color(REGIOES[st.e.regiao]); tint = c.clone().lerp(new THREE.Color("#ffffff"), 0.35); }
    else { c = rampColor(st.e[L.campo], stops); tint = c.clone().lerp(new THREE.Color("#ffffff"), 0.35); }
    st.topMat.color.copy(c);
    st.treeMats.forEach(m => m.color.copy(tint));
  }
  renderLegend();
}

/* ============ Humor do céu ============ */
function setMood(v) {
  const m = v / 100; S.mood = m;
  const L = (a, b) => new THREE.Color(a).lerp(new THREE.Color(b), m);
  sun.color.copy(L("#9aa6b4", "#ffd29e"));
  sun.intensity = lerp(0.9, 2.6, m);
  hemi.color.copy(L("#7d8894", "#cfe3f5"));
  hemi.intensity = lerp(0.6, 1.0, m);
  const sky = L("#2b3540", "#1d4c66");
  scene.background.copy(sky); scene.fog.color.copy(sky);
  seaMat.color.copy(L("#26414f", "#1f6a8a"));
  renderer.toneMappingExposure = lerp(0.85, 1.25, m);
  cloudSprites.forEach((c, i) => {
    c.material.color.copy(L("#6f7780", "#ffffff"));
    c.visible = i < Math.round(lerp(cloudSprites.length, 6, m));
  });
  const label = m < 0.25 ? "Tempestade" : m < 0.5 ? "Nublado" : m < 0.75 ? "Parcialmente nublado" : "Céu risonho";
  document.getElementById("mood-label").textContent = label;
  S.needShadow = true;
}

/* ============ Rótulos ============ */
const labels = [];
function buildLabels() {
  const box = document.getElementById("labels");
  for (const st of Object.values(S.states)) {
    const uf = document.createElement("div");
    uf.className = "lb lb-uf"; uf.textContent = st.uf;
    box.appendChild(uf);
    labels.push({ el: uf, st, p: new THREE.Vector3(px(st.e.rotulo[0]), TOP + 0.25, -py(st.e.rotulo[1])), kind: "uf" });
    const cap = document.createElement("div");
    cap.className = "lb lb-cap"; cap.innerHTML = `<i></i><span>${esc(st.e.capital)}</span>`;
    box.appendChild(cap);
    labels.push({ el: cap, st, p: new THREE.Vector3(px(st.e.lon), TOP + 0.05, -py(st.e.lat)), kind: "cap" });
  }
}
const _v = new THREE.Vector3();
function updateLabels() {
  const st = document.getElementById("stage");
  const W = st.clientWidth, H = st.clientHeight;
  const dist = camera.position.distanceTo(controls.target);
  const showCaps = dist < S.overviewDist * 0.55;
  const ufScale = clamp(lerp(1.25, 0.85, (dist - 6) / (S.overviewDist - 6)), 0.8, 1.3);
  for (const l of labels) {
    if (l.kind === "cap" && !showCaps) { l.el.classList.add("off"); continue; }
    _v.copy(l.p); _v.y += l.st.lift;
    _v.project(camera);
    const off = _v.z > 1 || _v.x < -1.1 || _v.x > 1.1 || _v.y < -1.1 || _v.y > 1.1;
    l.el.classList.toggle("off", off);
    if (off) continue;
    const x = (_v.x * 0.5 + 0.5) * W, y = (-_v.y * 0.5 + 0.5) * H;
    l.el.style.transform = l.kind === "uf"
      ? `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(-50%, -50%) scale(${ufScale.toFixed(2)})`
      : `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(-3px, -50%)`;
  }
}

/* ============ Painel ============ */
function computeRanks() {
  const est = S.data.estados;
  ["pibPerCapita", "idhm", "densidade", "populacao", "pibBilhoes"].forEach(campo => {
    const ord = Object.keys(est).filter(k => est[k][campo] != null).sort((a, b) => est[b][campo] - est[a][campo]);
    S.ranks[campo] = {}; ord.forEach((k, i) => S.ranks[campo][k] = i + 1);
  });
}
const totalPib = () => Object.values(S.data.estados).reduce((s, e) => s + e.pibBilhoes, 0);

function renderLegend() {
  const el = document.getElementById("legend");
  el.classList.toggle("simple", !LAYERS[S.layer].campo);
  if (S.layer === "natureza") {
    el.innerHTML = '<div class="sw">' + Object.entries(BIOMAS).map(([, b]) => `<span><i style="background:${b.chao}"></i>${esc(b.nome)}</span>`).join("") + "</div>";
    return;
  }
  if (S.layer === "regiao") {
    el.innerHTML = '<div class="sw">' + Object.entries(REGIOES).map(([k, v]) => `<span><i style="background:${v}"></i>${k}</span>`).join("") + "</div>";
    return;
  }
  const L = LAYERS[S.layer], s = quantileStops(L.campo);
  el.innerHTML = `<div>${esc(L.nome)}</div><div class="ramp" style="background:linear-gradient(90deg,${RAMP.join(",")})"></div>
    <div class="ends"><span>${esc(L.fmt(s[0]))}</span><span>${esc(L.fmt(s[4]))}</span></div>`;
}
function rankList() {
  const est = S.data.estados, L = LAYERS[S.layer];
  const campo = L.campo || "populacao", fmt = L.fmt || fmtPop;
  const ks = Object.keys(est).sort((a, b) => (est[b][campo] ?? -Infinity) - (est[a][campo] ?? -Infinity));
  const max = Math.max(...ks.map(k => est[k][campo] || 0));
  const titulo = L.campo ? L.nome : "População";
  return `<div class="section-h">27 unidades por ${esc(titulo.toLowerCase())}<small>toque para aproximar</small></div>
    <ol class="rank-list">` + ks.map((k, i) => {
      const e = est[k], v = e[campo];
      const w = v == null ? 0 : Math.max(2, (v / max) * 100);
      const bar = L.campo ? "" : `background:${S.layer === "regiao" ? REGIOES[e.regiao] : BIOMAS[BIOMA_UF[k]].chao}`;
      return `<li><button type="button" data-uf="${k}"><span class="pos">${v == null ? "–" : i + 1}</span>
        <span class="nm"><span>${esc(e.nome)}</span><span class="bar" style="width:${w}%;${bar}"></span></span>
        <span class="val">${esc(v == null ? "–" : fmt(v))}</span></button></li>`;
    }).join("") + "</ol>";
}
function renderOverview() {
  const est = Object.values(S.data.estados);
  const pop = est.reduce((s, e) => s + e.populacao, 0), pib = totalPib();
  document.getElementById("panel-body").innerHTML = `
    <p class="eyebrow">Visão geral</p>
    <h1 class="panel-title">Brasil</h1>
    <p class="panel-sub">26 estados e o Distrito Federal. Toque num estado para aproximar.</p>
    <dl class="stats">
      <div class="stat"><dt>População</dt><dd>${fmtPop(pop)}</dd></div>
      <div class="stat"><dt>PIB (2023)</dt><dd>${fmtPib(pib)}</dd></div>
      <div class="stat"><dt>PIB per capita</dt><dd>R$ ${fmtInt(pib * 1e9 / pop)}</dd></div>
      <div class="stat"><dt>IDHM (2024)</dt><dd>0,805</dd></div>
    </dl>
    ${rankList()}
    <p class="src">Fontes: IBGE (Censo 2022, Contas Regionais 2023), Radar IDHM 2024. PIB per capita do país calculado a partir da soma estadual.</p>`;
}
function renderState(uf) {
  const e = S.data.estados[uf], r = S.ranks;
  const rk = c => r[c] && r[c][uf] ? `<span class="rank">${r[c][uf]}º de 27</span>` : "";
  document.getElementById("panel-body").innerHTML = `
    <button type="button" class="btn ghost back" data-back>← Brasil</button>
    <p class="eyebrow">${esc(e.regiao)} · capital ${esc(e.capital)}</p>
    <h1 class="panel-title">${esc(e.nome)}</h1>
    <p class="panel-sub">${uf} · ${esc(BIOMAS[BIOMA_UF[uf]].nome)}</p>
    <dl class="stats">
      <div class="stat"><dt>População</dt><dd>${fmtPop(e.populacao)}</dd>${rk("populacao")}</div>
      <div class="stat"><dt>Densidade</dt><dd>${fmtDec(e.densidade, 1)} <small>hab/km²</small></dd>${rk("densidade")}</div>
      <div class="stat"><dt>PIB (2023)</dt><dd>${fmtPib(e.pibBilhoes)}</dd>${rk("pibBilhoes")}</div>
      <div class="stat"><dt>PIB per capita</dt><dd>R$ ${fmtInt(e.pibPerCapita)}</dd>${rk("pibPerCapita")}</div>
      <div class="stat"><dt>IDHM (2024)</dt><dd>${e.idhm == null ? "<small>em verificação</small>" : fmtDec(e.idhm, 3)}</dd>${rk("idhm")}</div>
      <div class="stat"><dt>Fatia do PIB</dt><dd>${fmtDec(e.pibBilhoes / totalPib() * 100, 1)}%</dd></div>
    </dl>
    <div class="section-h">Do que vive</div>
    <ul class="vocacao">${e.vocacao.map(v => `<li>${esc(v)}</li>`).join("")}</ul>
    <p class="note">Resumo editorial. Os números por setor (agro, indústria, serviços) entram numa próxima versão.</p>
    <p class="src">Fontes: IBGE, Censo 2022 e Contas Regionais 2023; Radar IDHM 2024 (PNUD/Ipea/FJP).</p>`;
}
function renderPanel() {
  if (S.selected) renderState(S.selected); else renderOverview();
  document.getElementById("panel-body").scrollTop = 0;
}

/* ============ Interação ============ */
function setLift() {
  for (const st of Object.values(S.states)) {
    st.liftTarget = st.uf === S.selected ? 0.22 : st.uf === S.hover ? 0.08 : 0;
  }
}
function select(uf, fromHash) {
  if (uf && !S.states[uf]) uf = null;
  S.selected = uf;
  setLift();
  if (uf) { document.getElementById("panel").classList.remove("collapsed"); applyViewOffset(); stateView(uf); }
  else overview(true);
  renderPanel();
  if (!fromHash) { try { history.replaceState(null, "", uf ? "#" + uf : location.pathname + location.search); } catch (_) { /* sem histórico */ } }
}
function setLayer(layer) {
  S.layer = layer;
  document.querySelectorAll("#layers button").forEach(b => b.classList.toggle("on", b.dataset.layer === layer));
  applyLayer();
  if (!S.selected) renderPanel();
}
const ndc = new THREE.Vector2();
function pick(ev) {
  const rect = renderer.domElement.getBoundingClientRect();
  ndc.set(((ev.clientX - rect.left) / rect.width) * 2 - 1, -((ev.clientY - rect.top) / rect.height) * 2 + 1);
  raycaster.setFromCamera(ndc, camera);
  const hit = raycaster.intersectObjects(slabMeshes, false)[0];
  return hit ? hit.object.userData.uf : null;
}
function bindInput() {
  const el = renderer.domElement;
  let down = null;
  el.addEventListener("pointerdown", ev => { down = { x: ev.clientX, y: ev.clientY, t: performance.now() }; });
  el.addEventListener("pointerup", ev => {
    if (!down) return;
    const moved = Math.hypot(ev.clientX - down.x, ev.clientY - down.y);
    down = null;
    if (moved > 8) return;
    const uf = pick(ev);
    if (uf) select(uf === S.selected ? null : uf);
  });
  let pending = null;
  el.addEventListener("pointermove", ev => {
    if (ev.pointerType !== "mouse") return;
    pending = ev;
  });
  el.addEventListener("pointerleave", () => { S.hover = null; setLift(); el.style.cursor = ""; });
  return () => {
    if (!pending) return;
    const uf = pick(pending); pending = null;
    if (uf !== S.hover) { S.hover = uf; setLift(); el.style.cursor = uf ? "pointer" : ""; }
  };
}
function bindUI() {
  document.getElementById("layers").addEventListener("click", ev => {
    const b = ev.target.closest("button[data-layer]"); if (b) setLayer(b.dataset.layer);
  });
  document.getElementById("panel").addEventListener("click", ev => {
    const b = ev.target.closest("button[data-uf]"); if (b) { select(b.dataset.uf); return; }
    if (ev.target.closest("[data-back]")) { select(null); return; }
    if (ev.target.closest(".handle")) {
      document.getElementById("panel").classList.toggle("collapsed");
      setTimeout(() => { applyViewOffset(); }, 360);
    }
  });
  document.getElementById("zoom").addEventListener("click", ev => {
    const b = ev.target.closest("button[data-zoom]"); if (!b) return;
    const d = camera.position.distanceTo(controls.target);
    const nd = clamp(d * (b.dataset.zoom === "in" ? 0.7 : 1.4), controls.minDistance, controls.maxDistance);
    flyTo(controls.target, nd, 500);
  });
  const range = document.getElementById("mood-range");
  range.addEventListener("input", () => setMood(+range.value));
  const dlg = document.getElementById("about");
  document.getElementById("brand").addEventListener("click", () => { if (dlg.showModal) dlg.showModal(); else dlg.setAttribute("open", ""); });
  document.addEventListener("keydown", ev => { if (ev.key === "Escape" && S.selected && !dlg.open) select(null); });
  window.addEventListener("hashchange", () => {
    const uf = (location.hash || "").slice(1).toUpperCase();
    if ((uf || null) !== S.selected) select(S.states[uf] ? uf : null, true);
  });
  window.addEventListener("resize", () => {
    const st = document.getElementById("stage");
    renderer.setSize(st.clientWidth, st.clientHeight);
    applyViewOffset();
    S.overviewDist = distToFit(40, 41);
    controls.maxDistance = S.overviewDist * 1.12;
  });
}

/* ============ Sol de 27 raios ============ */
function drawSun(svg, animate) {
  const ns = "http://www.w3.org/2000/svg";
  svg.innerHTML = "";
  const g = document.createElementNS(ns, "g");
  for (let i = 0; i < 27; i++) {
    const a = (i / 27) * Math.PI * 2 - Math.PI / 2, long = i % 3 === 0, r1 = 21, r2 = long ? 46 : 36;
    const l = document.createElementNS(ns, "line");
    l.setAttribute("x1", (Math.cos(a) * r1).toFixed(2)); l.setAttribute("y1", (Math.sin(a) * r1).toFixed(2));
    l.setAttribute("x2", (Math.cos(a) * r2).toFixed(2)); l.setAttribute("y2", (Math.sin(a) * r2).toFixed(2));
    l.setAttribute("stroke", "#f2c230"); l.setAttribute("stroke-width", long ? "4" : "3"); l.setAttribute("stroke-linecap", "round");
    g.appendChild(l);
  }
  const c = document.createElementNS(ns, "circle"); c.setAttribute("r", "16"); c.setAttribute("fill", "#f2c230");
  svg.appendChild(g); svg.appendChild(c);
  if (animate && !REDUCED) g.animate([{ transform: "rotate(0deg)" }, { transform: "rotate(360deg)" }], { duration: 90000, iterations: Infinity });
}

/* ============ Laço de animação ============ */
const BOUND = { x0: -19, x1: 18.5, z0: -19.5, z1: 19.5 };
function loop(hoverCheck) {
  let last = performance.now();
  const tick = now => {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    hoverCheck();

    if (fly) {
      const t = clamp((now - fly.start) / fly.dur, 0, 1), k = ease(t);
      const tg = fly.from.t.clone().lerp(fly.to.t, k);
      placeCamera(tg, lerp(fly.from.d, fly.to.d, k));
      if (t >= 1) { fly = null; controls.enabled = true; }
    } else {
      controls.update();
      // mantém o alvo dentro do Brasil e inclina a câmera conforme a distância
      const t = controls.target;
      t.x = clamp(t.x, BOUND.x0, BOUND.x1); t.z = clamp(t.z, BOUND.z0, BOUND.z1); t.y = TOP;
      placeCamera(t, camera.position.distanceTo(t));
    }

    let moving = false;
    for (const st of Object.values(S.states)) {
      const d = st.liftTarget - st.lift;
      if (Math.abs(d) > 0.0005) { st.lift += d * Math.min(1, dt * 9); st.group.position.y = st.lift; moving = true; }
    }
    if (moving) S.needShadow = true;

    const dist = camera.position.distanceTo(controls.target);
    const cloudFade = clamp((dist - S.overviewDist * 0.3) / (S.overviewDist * 0.45), 0, 1);
    for (const c of cloudSprites) {
      if (!REDUCED) { c.position.x += c.userData.speed * dt; if (c.position.x > 38) c.position.x = -38; }
      c.material.opacity = c.userData.base * cloudFade * lerp(1, 0.75, S.mood);
    }

    if (S.needShadow) { renderer.shadowMap.needsUpdate = true; S.needShadow = false; }
    renderer.render(scene, camera);
    updateLabels();
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/* ============ Início ============ */
async function init() {
  drawSun(document.getElementById("sun"), true);
  drawSun(document.querySelector(".about-sun"), false);
  const [dados, geo, rios] = await Promise.all([
    fetch("data/estados-dados.json").then(r => r.json()),
    fetch("data/estados.geojson").then(r => r.json()),
    fetch("data/rios.geojson").then(r => r.json())
  ]);
  S.data = dados; S.geo = geo;
  computeRanks();
  document.getElementById("sources").innerHTML = Object.values(dados.fontes).map(s => `<li>${esc(s)}</li>`).join("");

  initScene();
  buildStates();
  buildCities();
  buildTrees();
  buildRivers(rios);
  buildClouds();
  buildLabels();
  applyLayer();
  setMood(+document.getElementById("mood-range").value);
  bindUI();
  const hoverCheck = bindInput();
  if (MOBILE()) document.getElementById("panel").classList.add("collapsed");
  applyViewOffset();
  overview(false);
  renderPanel();
  const first = (location.hash || "").slice(1).toUpperCase();
  if (S.states[first]) select(first, true);
  loop(hoverCheck);
}

init().catch(err => {
  console.error(err);
  document.getElementById("panel-body").innerHTML =
    '<p class="eyebrow">Ops</p><p>Não deu para montar a maquete. Se abriu o arquivo direto do computador, use o link publicado.</p>';
});
