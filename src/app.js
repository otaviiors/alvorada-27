/* Alvorada 27 — protótipo 0.1 (Ato 1: explorar o mapa) */
(function () {
  "use strict";

  const BR_BOUNDS = [[-74.2, -33.9], [-34.6, 5.4]];
  const TERRAIN_TILES = "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png";
  const MOBILE = () => window.matchMedia("(max-width: 760px)").matches;

  const REGIOES = {
    "Norte": "#4f9a62",
    "Nordeste": "#e2a33f",
    "Centro-Oeste": "#c2b25a",
    "Sudeste": "#d3784e",
    "Sul": "#77acc9"
  };
  const RAMP = ["#8a3f2b", "#cf7a3c", "#e8c35a", "#9cc47a", "#3f8f5a"];

  const LAYERS = {
    regiao: { nome: "Regiões", campo: null },
    pibPerCapita: { nome: "PIB per capita", campo: "pibPerCapita", fmt: v => "R$ " + fmtInt(v), fonte: "pib", menor: "menor", maior: "maior" },
    idhm: { nome: "IDHM", campo: "idhm", fmt: v => v == null ? "em verificação" : v.toFixed(3).replace(".", ","), fonte: "idhm", menor: "menor", maior: "maior" },
    densidade: { nome: "Densidade", campo: "densidade", fmt: v => fmtDec(v, 1) + " hab/km²", fonte: "densidade", menor: "vazio", maior: "denso" }
  };

  const nf0 = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 });
  function fmtInt(v) { return nf0.format(v); }
  function fmtDec(v, d) { return new Intl.NumberFormat("pt-BR", { minimumFractionDigits: d, maximumFractionDigits: d }).format(v); }
  function fmtPop(v) {
    if (v >= 1e6) return fmtDec(v / 1e6, 1) + " mi";
    return fmtInt(Math.round(v / 1000)) + " mil";
  }
  function fmtPib(bi) {
    if (bi >= 1000) return "R$ " + fmtDec(bi / 1000, 2) + " tri";
    return "R$ " + fmtDec(bi, 1) + " bi";
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }

  const state = { layer: "regiao", selected: null, hover: null, data: null, geo: null, ranks: {} };
  let map;

  /* ---------- Sol de 27 raios ---------- */
  function drawSun(svg, animate) {
    const ns = "http://www.w3.org/2000/svg";
    svg.innerHTML = "";
    const g = document.createElementNS(ns, "g");
    for (let i = 0; i < 27; i++) {
      const a = (i / 27) * Math.PI * 2 - Math.PI / 2;
      const long = i % 3 === 0;
      const r1 = 21, r2 = long ? 46 : 36;
      const l = document.createElementNS(ns, "line");
      l.setAttribute("x1", (Math.cos(a) * r1).toFixed(2));
      l.setAttribute("y1", (Math.sin(a) * r1).toFixed(2));
      l.setAttribute("x2", (Math.cos(a) * r2).toFixed(2));
      l.setAttribute("y2", (Math.sin(a) * r2).toFixed(2));
      l.setAttribute("stroke", "#f2c230");
      l.setAttribute("stroke-width", long ? "4" : "3");
      l.setAttribute("stroke-linecap", "round");
      g.appendChild(l);
    }
    const c = document.createElementNS(ns, "circle");
    c.setAttribute("r", "16"); c.setAttribute("fill", "#f2c230");
    svg.appendChild(g); svg.appendChild(c);
    if (animate && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      g.animate([{ transform: "rotate(0deg)" }, { transform: "rotate(360deg)" }], { duration: 90000, iterations: Infinity });
    }
  }

  /* ---------- Nuvens ---------- */
  function makeClouds() {
    const box = document.getElementById("clouds");
    const n = 11;
    for (let i = 0; i < n; i++) {
      const c = document.createElement("div");
      c.className = "cloud";
      const w = 180 + Math.random() * 320;
      c.style.width = w + "px";
      c.style.height = (w * (0.35 + Math.random() * 0.2)) + "px";
      c.style.top = (Math.random() * 85) + "%";
      c.style.left = "0";
      const dur = 90 + Math.random() * 110;
      c.style.animationDuration = dur + "s";
      c.style.animationDelay = (-Math.random() * dur) + "s";
      c.style.opacity = (0.35 + Math.random() * 0.4).toFixed(2);
      box.appendChild(c);
    }
  }

  /* ---------- Humor do país ---------- */
  function setMood(v) {
    const m = v / 100;
    document.documentElement.style.setProperty("--mood", m.toFixed(2));
    const g = Math.round(150 + m * 105);
    document.documentElement.style.setProperty("--cloud-rgb", `${g}, ${g}, ${Math.round(g + m * 0)}`);
    const label = m < 0.25 ? "Tempestade" : m < 0.5 ? "Nublado" : m < 0.75 ? "Parcialmente nublado" : "Céu risonho";
    document.getElementById("mood-label").textContent = label;
    document.querySelectorAll(".cloud").forEach((c, i) => {
      c.style.display = (i < 4 + Math.round((1 - m) * 7)) ? "" : "none";
    });
  }

  /* ---------- Cores por camada ---------- */
  function quantileStops(campo) {
    const vals = Object.values(state.data.estados).map(e => e[campo]).filter(v => v != null).sort((a, b) => a - b);
    const q = p => vals[Math.min(vals.length - 1, Math.round(p * (vals.length - 1)))];
    const stops = [q(0), q(0.25), q(0.5), q(0.75), q(1)];
    for (let i = 1; i < stops.length; i++) if (stops[i] <= stops[i - 1]) stops[i] = stops[i - 1] + 1e-6;
    return stops;
  }
  function fillExpr(layer) {
    if (layer === "regiao") {
      const m = ["match", ["get", "regiao"]];
      Object.entries(REGIOES).forEach(([k, v]) => m.push(k, v));
      m.push("#999");
      return m;
    }
    const campo = LAYERS[layer].campo;
    const s = quantileStops(campo);
    const e = ["interpolate", ["linear"], ["coalesce", ["get", campo], -1]];
    // valor ausente cai abaixo do mínimo e fica cinza-neutro
    e.push(-1, "#7d8a8f", s[0] - 1e-3, "#7d8a8f");
    s.forEach((v, i) => e.push(v, RAMP[i]));
    return e;
  }

  function computeRanks() {
    const est = state.data.estados;
    ["pibPerCapita", "idhm", "densidade", "populacao", "pibBilhoes"].forEach(campo => {
      const ord = Object.keys(est).filter(k => est[k][campo] != null).sort((a, b) => est[b][campo] - est[a][campo]);
      state.ranks[campo] = {};
      ord.forEach((k, i) => state.ranks[campo][k] = i + 1);
    });
  }

  /* ---------- Legenda ---------- */
  function renderLegend() {
    const el = document.getElementById("legend");
    if (state.layer === "regiao") {
      el.innerHTML = '<div class="sw">' + Object.entries(REGIOES).map(([k, v]) => `<span><i style="background:${v}"></i>${k}</span>`).join("") + "</div>";
      return;
    }
    const L = LAYERS[state.layer];
    const s = quantileStops(L.campo);
    el.innerHTML = `<div>${esc(L.nome)}</div><div class="ramp" style="background:linear-gradient(90deg,${RAMP.join(",")})"></div>
      <div class="ends"><span>${esc(L.fmt(s[0]))}</span><span>${esc(L.fmt(s[4]))}</span></div>`;
  }

  /* ---------- Painel ---------- */
  function rankList() {
    const est = state.data.estados;
    const L = LAYERS[state.layer];
    const campo = L.campo || "populacao";
    const fmt = L.fmt || fmtPop;
    const ks = Object.keys(est).sort((a, b) => (est[b][campo] ?? -Infinity) - (est[a][campo] ?? -Infinity));
    const max = Math.max(...ks.map(k => est[k][campo] || 0));
    const titulo = L.campo ? L.nome : "População";
    return `<div class="section-h">27 unidades por ${esc(titulo.toLowerCase())}<small>toque para aproximar</small></div>
      <ol class="rank-list">` + ks.map((k, i) => {
        const e = est[k], v = e[campo];
        const w = v == null ? 0 : Math.max(2, (v / max) * 100);
        const bar = L.campo ? "" : `background:${REGIOES[e.regiao]}`;
        return `<li><button type="button" data-uf="${k}"><span class="pos">${v == null ? "–" : i + 1}</span>
          <span class="nm"><span>${esc(e.nome)}</span><span class="bar" style="width:${w}%;${bar}"></span></span>
          <span class="val">${esc(v == null ? "–" : fmt(v))}</span></button></li>`;
      }).join("") + "</ol>";
  }

  function renderOverview() {
    const est = Object.values(state.data.estados);
    const pop = est.reduce((s, e) => s + e.populacao, 0);
    const pib = est.reduce((s, e) => s + e.pibBilhoes, 0);
    document.getElementById("panel-body").innerHTML = `
      <p class="eyebrow">Visão geral</p>
      <h1 class="panel-title">Brasil</h1>
      <p class="panel-sub">26 estados e o Distrito Federal. Escolha um para aproximar.</p>
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
    const e = state.data.estados[uf];
    const r = state.ranks;
    const rk = (campo) => r[campo] && r[campo][uf] ? `<span class="rank">${r[campo][uf]}º de 27</span>` : "";
    document.getElementById("panel-body").innerHTML = `
      <button type="button" class="btn ghost back" data-back>← Brasil</button>
      <p class="eyebrow">${esc(e.regiao)} · capital ${esc(e.capital)}</p>
      <h1 class="panel-title">${esc(e.nome)}</h1>
      <p class="panel-sub">${uf}</p>
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
      <p class="note">Resumo editorial. Os números por setor (agro, indústria, serviços) entram na próxima versão.</p>
      <p class="src">Fontes: IBGE, Censo 2022 e Contas Regionais 2023; Radar IDHM 2024 (PNUD/Ipea/FJP).</p>`;
  }
  function totalPib() { return Object.values(state.data.estados).reduce((s, e) => s + e.pibBilhoes, 0); }

  function renderPanel() {
    if (state.selected) renderState(state.selected); else renderOverview();
    document.getElementById("panel-body").scrollTop = 0;
  }

  /* ---------- Câmera ---------- */
  function padding() {
    if (MOBILE()) {
      const h = window.innerHeight;
      return { top: 120, bottom: Math.round(h * 0.46) + 20, left: 24, right: 24 };
    }
    const pw = document.getElementById("panel").offsetWidth;
    return { top: 110, bottom: 40, left: pw + 56, right: 60 };
  }
  function bboxOf(feature) {
    let x0 = 180, y0 = 90, x1 = -180, y1 = -90;
    const walk = c => { if (typeof c[0] === "number") { x0 = Math.min(x0, c[0]); x1 = Math.max(x1, c[0]); y0 = Math.min(y0, c[1]); y1 = Math.max(y1, c[1]); } else c.forEach(walk); };
    walk(feature.geometry.coordinates);
    return [[x0, y0], [x1, y1]];
  }
  function flyBrasil() {
    const cam = map.cameraForBounds(BR_BOUNDS, { padding: padding() });
    map.flyTo({ ...cam, pitch: 38, bearing: -6, duration: 2200, essential: true });
  }

  function select(uf, fromHash) {
    if (uf && !state.data.estados[uf]) uf = null;
    if (state.selected) map.setFeatureState({ source: "estados", id: state.selected }, { selected: false });
    state.selected = uf;
    if (uf) {
      map.setFeatureState({ source: "estados", id: uf }, { selected: true });
      const f = state.geo.features.find(f => f.properties.sigla === uf);
      const cam = map.cameraForBounds(bboxOf(f), { padding: padding(), maxZoom: 8.2 });
      map.flyTo({ ...cam, pitch: 56, bearing: -14, duration: 2600, curve: 1.6, essential: true });
      document.getElementById("panel").classList.remove("collapsed");
    } else {
      flyBrasil();
    }
    renderPanel();
    if (!fromHash) {
      try { history.replaceState(null, "", uf ? "#" + uf : location.pathname + location.search); } catch (_) { /* sem histórico */ }
    }
  }

  function setLayer(layer) {
    state.layer = layer;
    document.querySelectorAll("#layers button").forEach(b => b.classList.toggle("on", b.dataset.layer === layer));
    map.setPaintProperty("estados-fill", "fill-color", fillExpr(layer));
    renderLegend();
    if (!state.selected) renderPanel();
  }

  /* ---------- Marcadores ---------- */
  function addMarkers() {
    Object.entries(state.data.estados).forEach(([uf, e]) => {
      const lab = document.createElement("div");
      lab.className = "mk-uf"; lab.textContent = uf;
      new maplibregl.Marker({ element: lab }).setLngLat(e.rotulo).addTo(map);
      const cap = document.createElement("div");
      cap.className = "mk-cap";
      cap.innerHTML = `<i></i><span>${esc(e.capital)}</span>`;
      new maplibregl.Marker({ element: cap, anchor: "left", offset: [-4, 0] }).setLngLat([e.lon, e.lat]).addTo(map);
    });
    const upd = () => {
      const z = map.getZoom();
      document.getElementById("map").classList.toggle("hide-caps", z < 4.6);
      document.getElementById("clouds").style.opacity = Math.max(0, Math.min(1, (6 - z) / 2)).toFixed(2);
    };
    map.on("zoom", upd); upd();
  }

  /* ---------- Mapa ---------- */
  function buildMap() {
    map = new maplibregl.Map({
      container: "map",
      bounds: BR_BOUNDS,
      fitBoundsOptions: { padding: padding() },
      maxPitch: 65,
      minZoom: 2.5,
      maxZoom: 11,
      attributionControl: false,
      style: {
        version: 8,
        sources: {
          dem: { type: "raster-dem", tiles: [TERRAIN_TILES], tileSize: 256, encoding: "terrarium", maxzoom: 12,
            attribution: '<a href="https://github.com/tilezen/joerd" target="_blank" rel="noopener">Relevo: Terrain Tiles (Mapzen)</a>' },
          hs: { type: "raster-dem", tiles: [TERRAIN_TILES], tileSize: 256, encoding: "terrarium", maxzoom: 12 },
          vizinhos: { type: "geojson", data: "data/vizinhos.geojson", attribution: "Natural Earth" },
          rios: { type: "geojson", data: "data/rios.geojson" },
          estados: { type: "geojson", data: state.geo, promoteId: "sigla", attribution: "IBGE" }
        },
        layers: [
          { id: "oceano", type: "background", paint: { "background-color": "#16425e" } },
          { id: "vizinhos", type: "fill", source: "vizinhos", paint: { "fill-color": "#5d6a5f", "fill-opacity": 0.9 } },
          { id: "estados-fill", type: "fill", source: "estados", paint: {
              "fill-color": fillExpr("regiao"),
              "fill-opacity": ["case", ["boolean", ["feature-state", "selected"], false], 1, ["boolean", ["feature-state", "hover"], false], 0.98, 0.9]
          } },
          { id: "relevo", type: "hillshade", source: "hs", paint: {
              "hillshade-exaggeration": 0.65,
              "hillshade-shadow-color": "#1d2a26",
              "hillshade-highlight-color": "#fff3cf",
              "hillshade-accent-color": "#2b3b33",
              "hillshade-illumination-direction": 315
          } },
          { id: "rios", type: "line", source: "rios", paint: {
              "line-color": "#5fb4d8",
              "line-width": ["interpolate", ["linear"], ["zoom"], 3, ["case", ["<=", ["get", "scalerank"], 3], 1.6, 0.8], 8, ["case", ["<=", ["get", "scalerank"], 3], 4, 2.2]],
              "line-opacity": 0.9
          } },
          { id: "vizinhos-linha", type: "line", source: "vizinhos", paint: { "line-color": "#2e3a33", "line-width": 0.6, "line-opacity": 0.6 } },
          { id: "estados-linha", type: "line", source: "estados", paint: {
              "line-color": "#fff8e6",
              "line-width": ["interpolate", ["linear"], ["zoom"], 3, 0.7, 8, 1.6],
              "line-opacity": 0.75
          } },
          { id: "estados-destaque", type: "line", source: "estados", paint: {
              "line-color": "#f2c230",
              "line-width": ["case", ["boolean", ["feature-state", "selected"], false], 3.5, ["boolean", ["feature-state", "hover"], false], 2.2, 0],
              "line-opacity": 1
          } }
        ]
      }
    });

    map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-left");
    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "bottom-right");

    // "style.load" não espera os blocos de relevo; assim o mapa responde mesmo com internet lenta
    map.once("style.load", () => {
      try { map.setTerrain({ source: "dem", exaggeration: 2.2 }); } catch (_) { /* sem relevo 3D */ }
      addMarkers();
      const first = (location.hash || "").replace("#", "").toUpperCase();
      if (state.data.estados[first]) select(first, true);
      else map.easeTo({ pitch: 38, bearing: -6, duration: 2400 });
    });

    map.on("mousemove", "estados-fill", ev => {
      const id = ev.features[0] && ev.features[0].id;
      if (id === state.hover) return;
      if (state.hover) map.setFeatureState({ source: "estados", id: state.hover }, { hover: false });
      state.hover = id;
      if (id) map.setFeatureState({ source: "estados", id }, { hover: true });
      map.getCanvas().style.cursor = "pointer";
    });
    map.on("mouseleave", "estados-fill", () => {
      if (state.hover) map.setFeatureState({ source: "estados", id: state.hover }, { hover: false });
      state.hover = null;
      map.getCanvas().style.cursor = "";
    });
    map.on("click", "estados-fill", ev => {
      const id = ev.features[0] && ev.features[0].id;
      if (id) select(id === state.selected ? null : id);
    });
  }

  /* ---------- UI ---------- */
  function bindUI() {
    document.getElementById("layers").addEventListener("click", ev => {
      const b = ev.target.closest("button[data-layer]");
      if (b) setLayer(b.dataset.layer);
    });
    document.getElementById("panel").addEventListener("click", ev => {
      const b = ev.target.closest("button[data-uf]");
      if (b) { select(b.dataset.uf); return; }
      if (ev.target.closest("[data-back]")) { select(null); return; }
      if (ev.target.closest(".handle")) document.getElementById("panel").classList.toggle("collapsed");
    });
    const range = document.getElementById("mood-range");
    range.addEventListener("input", () => setMood(+range.value));
    setMood(+range.value);
    const dlg = document.getElementById("about");
    document.getElementById("brand").addEventListener("click", () => {
      if (dlg.showModal) dlg.showModal(); else dlg.setAttribute("open", "");
    });
    document.addEventListener("keydown", ev => {
      if (ev.key === "Escape" && state.selected && !dlg.open) select(null);
    });
    window.addEventListener("hashchange", () => {
      const uf = (location.hash || "").replace("#", "").toUpperCase();
      if ((uf || null) !== state.selected) select(state.data.estados[uf] ? uf : null, true);
    });
  }

  /* ---------- Início ---------- */
  async function init() {
    drawSun(document.getElementById("sun"), true);
    drawSun(document.querySelector(".about-sun"), false);
    makeClouds();
    bindUI();
    const [dados, geo] = await Promise.all([
      fetch("data/estados-dados.json").then(r => r.json()),
      fetch("data/estados.geojson").then(r => r.json())
    ]);
    state.data = dados;
    geo.features.forEach(f => {
      const e = dados.estados[f.properties.sigla];
      Object.assign(f.properties, { regiao: e.regiao, pibPerCapita: e.pibPerCapita, idhm: e.idhm, densidade: e.densidade });
    });
    state.geo = geo;
    computeRanks();
    document.getElementById("sources").innerHTML = Object.values(dados.fontes).map(s => `<li>${esc(s)}</li>`).join("");
    renderLegend();
    renderPanel();
    buildMap();
  }

  init().catch(err => {
    console.error(err);
    document.getElementById("panel-body").innerHTML =
      '<p class="eyebrow">Ops</p><p>Não deu para carregar os dados do mapa. Se abriu o arquivo direto do computador, use o link publicado ou um servidor local.</p>';
  });
})();
