/* Ícones do Alvorada 27: economia dos estados e camadas do mapa.
   Desenhados à mão em traço simples (viewBox 24x24, traço branco). */

export const ICONES = {
  agro:       { nome: "Agricultura", cor: "#6a9a2f", d: "M12 21v-9 M12 12c0-4-3-7-8-7 0 5 3 7 8 7z M12 14c0-4 3-6 8-6 0 4-3 6-8 6z M7 21h10" },
  gado:       { nome: "Pecuária", cor: "#9a6b3c", d: "M6 9h12v5a5 5 0 0 1-5 5h-2a5 5 0 0 1-5-5z M6 10 3 6 M18 10l3-4 M9.5 13h.01 M14.5 13h.01 M10 17h4" },
  floresta:   { nome: "Extrativismo", cor: "#2f7d4f", d: "M12 21v-5 M12 3l7 10H5z M12 7l6 8.5H6z" },
  governo:    { nome: "Serviço público", cor: "#4b6aa8", d: "M3 20h18 M5 11v7 M9.5 11v7 M14.5 11v7 M19 11v7 M2.5 10h19L12 4z" },
  cana:       { nome: "Cana-de-açúcar", cor: "#7aa33a", d: "M8 21V3 M16 21V3 M8 8 5 6 M8 13l3-2 M16 9l3-2 M16 15l-3-2 M5 21h14" },
  turismo:    { nome: "Turismo", cor: "#e0952f", d: "M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8z M12 2v2.5 M12 19.5V22 M2 12h2.5 M19.5 12H22 M4.9 4.9l1.8 1.8 M17.3 17.3l1.8 1.8 M4.9 19.1l1.8-1.8 M17.3 6.7l1.8-1.8" },
  quimica:    { nome: "Química", cor: "#8a5bb0", d: "M9 3h6 M10 3v6l-5.5 9.5A1.6 1.6 0 0 0 6 21h12a1.6 1.6 0 0 0 1.5-2.5L14 9V3 M7 15h10" },
  mineracao:  { nome: "Mineração", cor: "#8a7f74", d: "M4 20 14 10 M9 4.5c4-1.5 8.5 0 11 3.5 M9 4.5l10.5 10.5 M3 21l2-2" },
  tecnologia: { nome: "Tecnologia", cor: "#2f8fb0", d: "M7 7h10v10H7z M10 10h4v4h-4z M10 3v4 M14 3v4 M10 17v4 M14 17v4 M3 10h4 M3 14h4 M17 10h4 M17 14h4" },
  petroleo:   { nome: "Petróleo e gás", cor: "#2b2b2b", d: "M12 3c4 5 6.5 8.2 6.5 11.2a6.5 6.5 0 0 1-13 0C5.5 11.2 8 8 12 3z M9 15a3 3 0 0 0 3 3" },
  comercio:   { nome: "Comércio e serviços", cor: "#d0613a", d: "M4 10h16 M5 10v10h14V10 M3 10l2.5-6h13L21 10 M10 20v-5h4v5" },
  eolica:     { nome: "Energia eólica", cor: "#5aa6c9", d: "M12 11v10 M9 21h6 M12 11 12 2.5 M12 11l7.4 4.3 M12 11l-7.4 4.3 M12 9.6a1.4 1.4 0 1 1 0 2.8 1.4 1.4 0 0 1 0-2.8z" },
  cafe:       { nome: "Café", cor: "#6b4226", d: "M5 9h11v4.5a5.5 5.5 0 0 1-5.5 5.5A5.5 5.5 0 0 1 5 13.5z M16 10.5h1.5a2.5 2.5 0 0 1 0 5H16 M8.5 3c0 2 2 2 2 4 M12.5 3c0 2 2 2 2 4 M4 21h13" },
  industria:  { nome: "Indústria", cor: "#c2553b", d: "M3 21V11l6 4v-4l6 4V6h4v15z M3 21h18 M16 6V3h2v3" },
  porto:      { nome: "Porto e navegação", cor: "#2c6e9e", d: "M3 15h18l-3 5H6z M7 15V10h10v5 M12 10V4 M12 4l4.5 2.2L12 8" },
  energia:    { nome: "Hidrelétricas", cor: "#e2b52e", d: "M13 2 5 13.5h6L10 22l9-12h-6.5z" },
  automotiva: { nome: "Indústria automotiva", cor: "#5d6d7e", d: "M5 16v-4l2.2-5h9.6l2.2 5v4z M5 16v2 M19 16v2 M3.5 12h17 M8 14h.01 M16 14h.01" },
  fruta:      { nome: "Fruticultura", cor: "#e58a1f", d: "M12 8.5a6 6 0 1 1 0 12 6 6 0 0 1 0-12z M12 8.5c0-2.5 1-4 3-5 M12 6.5c-1.5-1.5-3.5-1.8-5-1" },
  vinho:      { nome: "Vinho", cor: "#7a2a4a", d: "M8 3h8l-.5 6a3.5 3.5 0 0 1-7 0z M12 12.5V20 M8.5 20.5h7" },
  financas:   { nome: "Serviços financeiros", cor: "#3b8a5a", d: "M12 2.5v19 M16.5 6.5H10a3 3 0 0 0 0 6h4a3 3 0 0 1 0 6H7" },

  /* camadas do mapa */
  natureza:   { nome: "Natureza e biomas", cor: "#4a7a34", d: "M5 20c0-9 6-15 15-15 0 9-6 15-15 15z M5 20l8-8" },
  regiao:     { nome: "Regiões", cor: "#3f6ea0", d: "M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z M9 4v14 M15 6v14" },
  pibPerCapita: { nome: "PIB per capita", cor: "#3b8a5a", d: "M12 2.5v19 M16.5 6.5H10a3 3 0 0 0 0 6h4a3 3 0 0 1 0 6H7" },
  idhm:       { nome: "Desenvolvimento humano (IDHM)", cor: "#b9475a", d: "M12 20s-7.5-4.5-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.5-7.5 10-7.5 10z" },
  densidade:  { nome: "Densidade demográfica", cor: "#7a5bb0", d: "M8.5 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M3 20c0-3.3 2.5-6 5.5-6s5.5 2.7 5.5 6 M16 11a2.6 2.6 0 1 0 0-5.2 M15.5 14c3 0 5.5 2.4 5.5 6" },
  economia:   { nome: "Ícones de economia", cor: "#c2553b", d: "M3 21V11l6 4v-4l6 4V6h4v15z M3 21h18" }
};

/* Do que cada estado vive, em ícones (mesma ordem do resumo do painel) */
export const ECONOMIA_UF = {
  AC: ["gado", "floresta", "governo"], AL: ["cana", "turismo", "quimica"], AP: ["governo", "mineracao", "floresta"],
  AM: ["tecnologia", "petroleo", "comercio"], BA: ["quimica", "agro", "turismo"], CE: ["comercio", "industria", "eolica"],
  DF: ["governo", "comercio", "financas"], ES: ["petroleo", "mineracao", "cafe"], GO: ["agro", "industria", "quimica"],
  MA: ["agro", "porto", "industria"], MT: ["agro", "gado", "industria"], MS: ["agro", "gado", "floresta"],
  MG: ["mineracao", "automotiva", "cafe"], PA: ["mineracao", "gado", "energia"], PB: ["comercio", "cana", "industria"],
  PR: ["agro", "automotiva", "porto"], PE: ["tecnologia", "porto", "fruta"], PI: ["comercio", "agro", "eolica"],
  RJ: ["petroleo", "comercio", "turismo"], RN: ["eolica", "petroleo", "turismo"], RS: ["agro", "industria", "vinho"],
  RO: ["gado", "agro", "energia"], RR: ["governo", "agro", "comercio"], SC: ["industria", "gado", "tecnologia"],
  SP: ["industria", "financas", "cana"], SE: ["petroleo", "comercio", "fruta"], TO: ["agro", "gado", "governo"]
};

export function iconSVG(nome, size = 22, cor = "currentColor") {
  const i = ICONES[nome];
  if (!i) return "";
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="${cor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${i.d}"/></svg>`;
}

/* Medalhão redondo (estilo SimCity) desenhado num canvas, para usar como sprite 3D */
export async function iconCanvas(nome, px = 128) {
  const i = ICONES[nome];
  const c = document.createElement("canvas"); c.width = c.height = px;
  const g = c.getContext("2d");
  const r = px / 2;
  // sombra suave
  g.fillStyle = "rgba(0,0,0,0.25)";
  g.beginPath(); g.arc(r, r + px * 0.04, r * 0.86, 0, Math.PI * 2); g.fill();
  // aro claro + miolo colorido com brilho
  g.fillStyle = "#fffaf0";
  g.beginPath(); g.arc(r, r, r * 0.86, 0, Math.PI * 2); g.fill();
  const grd = g.createLinearGradient(0, r * 0.3, 0, px);
  grd.addColorStop(0, shade(i.cor, 0.18)); grd.addColorStop(1, shade(i.cor, -0.12));
  g.fillStyle = grd;
  g.beginPath(); g.arc(r, r, r * 0.72, 0, Math.PI * 2); g.fill();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${px}" height="${px}" fill="none" stroke="#ffffff" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="${i.d}"/></svg>`;
  const img = new Image();
  img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  try { await img.decode(); g.drawImage(img, px * 0.24, px * 0.24, px * 0.52, px * 0.52); } catch (_) { /* fica só o medalhão */ }
  return c;
}

function shade(hex, k) {
  const n = parseInt(hex.slice(1), 16);
  let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  const t = k > 0 ? 255 : 0, a = Math.abs(k);
  r = Math.round(r + (t - r) * a); g = Math.round(g + (t - g) * a); b = Math.round(b + (t - b) * a);
  return `rgb(${r},${g},${b})`;
}
