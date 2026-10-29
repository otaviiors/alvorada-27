/* Alvorada 27 — telas do modo Governar.
   Liga o motor (src/jogo/motor.js) à maquete. A maquete entra pelo objeto `mapa`. */
import {
  criarJogo, escolherPromessas, montarProjeto, executarProjeto, desfazerProjeto, responderEvento, negociar,
  fecharAno, relatorioFinal, resumoEfeitos, chanceVotacao, eventosPendentes,
  REGIOES, AREAS, TIPOS, TAMANHOS, PROMESSAS, CAMARA, NEGOCIACOES, ORCAMENTO,
  GRUPOS, CIDADAOS, ELEITORES, quemGosta, gostosDoGrupo
} from "./jogo/motor.js";
import { iconSVG, ICONES } from "./icones.js";
import { criarTutorial, termo } from "./tutorial.js";

const CHAVE = "alvorada27-mandato";
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const nf = (v, d = 1) => new Intl.NumberFormat("pt-BR", { minimumFractionDigits: d, maximumFractionDigits: d }).format(v);
const bi = v => "R$ " + nf(v, v % 1 ? 1 : 0) + " bi";
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const SEV = ["", "moderado", "forte", "muito forte"];
const AREA_ICONE = { saude: "a_saude", educacao: "a_educacao", infra: "a_infra", seguranca: "a_seguranca", ambiente: "a_ambiente", economia: "a_economia", assistencia: "a_assistencia" };

/* Indicadores mostrados no topo. regional: dá para pintar o mapa por região */
const IND = [
  { id: "crescimento", nome: "Crescimento", icone: "i_crescimento", fmt: v => nf(v) + "%", melhor: "maior", dica: "Quanto a economia cresceu no ano" },
  { id: "desemprego", nome: "Desemprego", icone: "i_desemprego", fmt: v => nf(v) + "%", melhor: "menor", regional: "desemprego", escala: [3, 9], dica: "0,1 ponto ≈ 110 mil pessoas" },
  { id: "idhm", nome: "Qualidade de vida (IDHM)", icone: "i_idhm", fmt: v => nf(v, 3), melhor: "maior", regional: "idhm", escala: [0.85, 0.74], dica: "Saúde, estudo e renda, de 0 a 1" },
  { id: "divida", nome: "Dívida (% do PIB)", icone: "i_divida", fmt: v => nf(v) + "%", melhor: "menor", dica: "Quanto o governo deve, perto do que o país produz" },
  { id: "mvi", nome: "Mortes violentas (por 100 mil)", icone: "i_mvi", fmt: v => nf(v), melhor: "menor", regional: "mvi", escala: [8, 35], dica: "0,1 a menos ≈ 200 vidas por ano" },
  { id: "desmatamento", nome: "Desmatamento (km²/ano)", icone: "i_desmatamento", fmt: v => nf(v, 0), melhor: "menor", regional: "desmatamento", escala: [0, 6000], dica: "1 km² ≈ 140 campos de futebol" },
  { id: "aprovacao", nome: "Aprovação", icone: "i_aprovacao", fmt: v => Math.round(v) + "%", melhor: "maior", dica: "Quanto da população aprova o governo" }
];
const BOM = "#3f8f5a", RUIM = "#b8452f", MEIO = "#e2b84a";
function corEscala(v, [bom, ruim]) {
  const t = clamp((v - bom) / (ruim - bom), 0, 1);
  const mix = (a, b, k) => { const p = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)); const A = p(a), B = p(b); return "#" + A.map((x, i) => Math.round(x + (B[i] - x) * k).toString(16).padStart(2, "0")).join(""); };
  return t < 0.5 ? mix(BOM, MEIO, t * 2) : mix(MEIO, RUIM, (t - 0.5) * 2);
}
const FORCA_TRABALHO = 110e6;   // força de trabalho aproximada (PNAD Contínua)
const fmtGente = n => n >= 1e6 ? nf(n / 1e6, 1) + (n >= 2e6 ? " milhões" : " milhão") : n >= 1000 ? nf(Math.round(n / 1000), 0) + " mil" : nf(Math.round(n), 0);
/* rostinho do humor de um cidadão */
const HUMOR = { feliz: ["gostou do ano", "#3f8f5a", "M6 11.5q4 4.5 8 0"], neutro: ["ano normal", "#e2b84a", "M6.5 13h7"], preocupado: ["ano difícil", "#b8452f", "M6 14.5q4-4 8 0"] };
const rosto = h => { const [t, c, d] = HUMOR[h] || HUMOR.neutro;
  return `<svg class="rosto" viewBox="0 0 20 20" width="18" height="18" role="img" aria-label="${t}"><circle cx="10" cy="10" r="9" fill="${c}"/><circle cx="7" cy="8" r="1.3" fill="#1a1a1a"/><circle cx="13" cy="8" r="1.3" fill="#1a1a1a"/><path d="${d}" fill="none" stroke="#1a1a1a" stroke-width="1.6" stroke-linecap="round"/></svg>`; };
const sinal = d => d > 0 ? `<em class="bom">+${d}</em>` : d < 0 ? `<em class="ruim">−${-d}</em>` : `<em>=</em>`;
const iniciais = nome => nome.split(" ").filter(Boolean).map(x => x[0]).slice(0, 2).join("");

export function criarGovernar({ mapa, inicioUrl = "data/jogo/inicio.json" }) {
  let inicio = null, e = null;
  let aba = "eventos", indMapa = "idhm", snapshot = "agora", cartasUsadas = {}, confirmando = false;
  const root = document.createElement("div");
  root.id = "gov";
  root.innerHTML = `
    <header id="gov-top" class="gov-hud"></header>
    <aside id="gov-panel" class="gov-hud">
      <div class="handle gov-handle" role="button" tabindex="0" aria-label="Mostrar ou esconder o painel"><i></i></div>
      <nav id="gov-tabs" role="tablist"></nav>
      <div id="gov-body"></div>
      <footer id="gov-foot"></footer>
    </aside>
    <div id="gov-legend" class="gov-hud" aria-hidden="true"></div>
    <div id="gov-modal" hidden><div class="gm-box" role="dialog" aria-modal="true"></div></div>`;
  document.getElementById("app").appendChild(root);
  const $ = s => root.querySelector(s);
  const tut = criarTutorial({ root, mapa, ui: {
    indicador(id) { indMapa = id; if (e) { renderTopo(); pintarMapa(); } },
    aba(id) { aba = id; renderAbas(); renderCorpo(); renderRodape(); abrirPainel(); },
    promessas: () => telaPromessas(),
    salvar: () => salvar(),
    render: () => render()
  } });

  /* ---------- salvar ---------- */
  const salvar = () => { try { localStorage.setItem(CHAVE, JSON.stringify(e)); } catch (_) { /* sem armazenamento */ } };
  const apagar = () => { try { localStorage.removeItem(CHAVE); } catch (_) { /* nada */ } };
  function salvo() {
    try { const t = localStorage.getItem(CHAVE); if (!t) return null; const x = JSON.parse(t); return x && x.versao === 1 ? x : null; } catch (_) { return null; }
  }
  async function carregarInicio() { if (!inicio) inicio = await fetch(inicioUrl).then(r => r.json()); return inicio; }

  /* ---------- mapa ---------- */
  function pintarMapa() {
    const ind = IND.find(i => i.id === indMapa);
    const fonte = snapshot === "inicio" ? e.ini.reg : e.reg;
    if (!ind || !ind.regional) { mapa.colorir(null); $("#gov-legend").innerHTML = ""; return; }
    const cores = {};
    for (const r of REGIOES) cores[r] = corEscala(fonte[r][ind.regional], ind.escala);
    mapa.colorir(cores);
    const [a, b] = ind.escala;
    $("#gov-legend").innerHTML = `<div class="gl-t">${esc(ind.nome)}${snapshot === "inicio" ? " · " + e.anoInicial : ""}</div>
      <div class="gl-ramp"></div><div class="gl-ends"><span>${esc(ind.fmt(a))}</span><span>${esc(ind.fmt(b))}</span></div>
      <div class="gl-vals">${REGIOES.map(r => `<span><i style="background:${cores[r]}"></i>${r}<b>${esc(ind.fmt(fonte[r][ind.regional]))}</b><small>${esc(gente(ind.id, fonte, r))}</small></span>`).join("")}</div>`;
  }
  /* o mesmo número, em escala de gente */
  function gente(id, fonte, r) {
    const R = fonte[r], P = REGIOES.reduce((s, x) => s + fonte[x].populacao, 0);
    if (id === "desemprego") return "≈ " + fmtGente(R.desemprego / 100 * FORCA_TRABALHO * R.populacao / P) + " sem trabalho";
    if (id === "mvi") return "≈ " + fmtGente(R.mvi * R.populacao / 1e5) + " mortes/ano";
    if (id === "desmatamento") return R.desmatamento ? "≈ " + fmtGente(R.desmatamento * 140) + " campos" : "—";
    if (id === "idhm") return fmtGente(R.populacao) + " habitantes";
    return "";
  }
  function humor() { mapa.humor(clamp((e.nac.aprovacao - 15) / 55 * 100, 0, 100)); }
  function sincronizarProjetos() {
    mapa.projetos(e.projetos.filter(p => p.regiao !== "Nacional" && p.tipo !== "regular").map(p => ({ id: p.id, regiao: p.regiao, icone: AREA_ICONE[p.area], pronto: p.pronto })));
  }

  /* ---------- topo ---------- */
  function renderTopo() {
    const total = e.anoFinal - e.anoInicial + 1, n = Math.min(e.ano - e.anoInicial + 1, total);
    const fim = e.fase === "fim";
    $("#gov-top").innerHTML = `
      <div class="gt-ano"><b>${fim ? `Fim<span class="so-largo"> do mandato</span>` : e.ano}</b><small>${fim ? `${e.anoInicial}–${e.anoFinal}` : `Ano ${n} de ${total}`}</small></div>
      <div class="gt-inds">${IND.map(i => {
        const v = e.nac[i.id], v0 = e.ini.nac[i.id];
        const d = v - v0, melhor = i.melhor === "maior" ? d > 0 : d < 0;
        const seta = Math.abs(d) < 1e-6 || i.id === "crescimento" ? "" : `<em class="${melhor ? "bom" : "ruim"}">${d > 0 ? "▲" : "▼"}</em>`;
        return `<button type="button" class="gt-ind${indMapa === i.id ? " on" : ""}${i.regional ? " reg" : ""}" data-ind="${i.id}" title="${esc(i.nome)}${i.regional ? " — toque para ver no mapa" : ""}">
          ${iconSVG(i.icone, 16)}<span class="v">${esc(i.fmt(v))}</span>${seta}<span class="tip">${esc(i.nome)}<br><small>${esc(i.dica)}<br>Início: ${esc(i.fmt(v0))}${i.regional ? " · toque para ver no mapa" : ""}</small></span></button>`;
      }).join("")}</div>
      ${fim ? `<div class="gt-snap" role="group" aria-label="Comparar"><button type="button" data-snap="inicio" class="${snapshot === "inicio" ? "on" : ""}">${e.anoInicial}</button><button type="button" data-snap="agora" class="${snapshot === "agora" ? "on" : ""}">${e.anoFinal}</button></div>`
        : ""}${fim ? `<button type="button" class="btn ghost gt-bal" data-acao="ver-balanco">Balanço</button>` : ""}${fim ? "" : `<div class="gt-caixa" title="Dinheiro para projetos novos neste ano">${iconSVG("i_dinheiro", 16)}<span><b>${esc(bi(e.caixa))}</b><small>para projetos</small></span></div>`}`;
  }

  /* ---------- abas ---------- */
  const ABAS = [
    { id: "eventos", nome: "Eventos", icone: "i_alerta" },
    { id: "ministros", nome: "Ministros", icone: "i_congresso" },
    { id: "montar", nome: "Montar", icone: "i_montar" },
    { id: "congresso", nome: "Congresso", icone: "i_aprovacao" },
    { id: "orcamento", nome: "Orçamento", icone: "i_dinheiro" },
    { id: "povo", nome: "Povo", icone: "i_povo" },
    { id: "previsoes", nome: "Previsões", icone: "i_previsao" }
  ];
  function renderAbas() {
    const pend = eventosPendentes(e).length;
    const bloq = tut.bloqueadas();
    $("#gov-tabs").innerHTML = ABAS.filter(a => !bloq.includes(a.id)).map(a => `<button type="button" role="tab" data-aba="${a.id}" aria-selected="${aba === a.id}" class="${aba === a.id ? "on" : ""}">
      ${iconSVG(a.icone, 16)}<span>${a.nome}</span>${a.id === "eventos" && pend ? `<b class="badge">${pend}</b>` : ""}</button>`).join("");
  }
  function renderCorpo() {
    const f = { eventos: abaEventos, ministros: abaMinistros, montar: abaMontar, congresso: abaCongresso, orcamento: abaOrcamento, povo: abaPovo, previsoes: abaPrevisoes }[aba];
    $("#gov-body").innerHTML = f();
    if (aba === "montar") atualizarMontar();
  }
  function renderRodape() {
    const pend = eventosPendentes(e).length;
    const qtd = e.projetosAno.length;
    if (confirmando) {
      $("#gov-foot").innerHTML = `<p class="gf-resumo">Fechar ${e.ano} com ${qtd} projeto${qtd === 1 ? "" : "s"}, ${esc(bi(e.caixa))} sem usar${e.gastoExtra > 0 ? ` e ${esc(bi(e.gastoExtra))} além do orçamento` : ""}?</p>
        <div class="gf-acoes"><button type="button" class="btn ghost" data-acao="cancelar">Voltar</button><button type="button" class="btn" data-acao="confirmar">Fechar o ano</button></div>`;
      return;
    }
    $("#gov-foot").innerHTML = pend
      ? `<button type="button" class="btn wide" data-acao="ir-eventos">Responder ${pend} evento${pend > 1 ? "s" : ""} antes de fechar o ano</button>`
      : `<button type="button" class="btn wide" data-acao="fechar">Fechar o ano de ${e.ano} →</button>`;
  }
  function render() {
    root.classList.toggle("pre-posse", e.fase === "promessas");
    renderTopo(); renderAbas(); renderCorpo(); renderRodape();
    pintarMapa(); humor(); sincronizarProjetos();
    tut.aposRender();
  }

  /* ---------- cartões de projeto ---------- */
  function cartaoProjeto(p, { autor = null, acao = null, estado = null } = {}) {
    const ef = resumoEfeitos(p);
    const extra = p.custo > e.caixa;
    const voto = p.precisaVoto || extra;
    const chance = voto ? Math.round(chanceVotacao(e, p, extra) * 100) : null;
    const area = AREAS[p.area];
    return `<article class="proj" style="--c:${area.cor}">
      ${autor ? `<header class="pj-autor"><span class="avatar" style="--c:${autor.cor || area.cor}">${esc(iniciais(autor.nome))}</span>
        <div><b>${esc(autor.nome)}</b><small>${esc(autor.cargo)}</small></div></header>
        <blockquote>“${esc(autor.fala)}”</blockquote>` : ""}
      <h4><span class="pj-ic">${iconSVG(AREA_ICONE[p.area], 16, "#fff")}</span>${esc(p.nome)}</h4>
      <div class="pj-tags"><span>${esc(TIPOS[p.tipo].nome)}</span><span>${esc(TAMANHOS[p.tamanho].nome)}</span><span>${p.regiao === "Nacional" ? "Nacional" : esc(p.regiao)}</span></div>
      <dl class="pj-num">
        <div><dt>Custo</dt><dd>${esc(bi(p.custo))}</dd></div>
        <div><dt>Efeito</dt><dd>${p.prazo === 0 ? "neste ano" : p.prazo === 1 ? "em 1 ano" : `em ${p.prazo} anos`}</dd></div>
        <div><dt>${termo("manutencao", "Custo fixo")} depois</dt><dd>${p.manutencao ? esc(bi(p.manutencao)) + "/ano" : "nenhum"}</dd></div>
      </dl>
      <ul class="pj-ef">${ef.map(x => `<li class="${x.bom ? "bom" : "ruim"}"><span>${esc(x.ind)}</span><b>${esc(x.texto)}</b></li>`).join("") || "<li>Efeito pequeno</li>"}</ul>
      ${emGente(p)}
      ${quem(p)}
      ${p.temporario ? `<p class="pj-nota">Transferência: o efeito vale só neste ano.</p>` : ""}
      ${voto ? `<p class="pj-voto">${iconSVG("i_congresso", 14)} Precisa de votação${extra ? " (crédito além do orçamento)" : ""}: <b>${chance}% de chance</b></p>` : ""}
      ${estado ? `<p class="pj-estado ${estado.ok ? "ok" : "nao"}">${esc(estado.texto)}</p>` : acao ? `<button type="button" class="btn ${extra ? "ghost" : ""} wide" ${acao}>${extra ? "Aprovar com dinheiro extra" : "Aprovar"}</button>` : ""}
    </article>`;
  }

  /* que grupos da sociedade gostam ou não do projeto */
  function quem(p) {
    const q = quemGosta(p);
    if (!q.agrada.length && !q.desagrada.length) return "";
    return `<p class="pj-quem">${q.agrada.length ? `<span class="ok">Agrada: ${q.agrada.map(esc).join(", ")}</span>` : ""}${q.desagrada.length ? `<span class="nao">Desagrada: ${q.desagrada.map(esc).join(", ")}</span>` : ""}</p>`;
  }

  /* números traduzidos em gente */
  function emGente(p) {
    const popTot = REGIOES.reduce((s, r) => s + e.reg[r].populacao, 0);
    let emp = 0, vidas = 0, km = 0;
    for (const [r, x] of Object.entries(p.efeitos.porRegiao)) {
      const pop = e.reg[r].populacao;
      if (x.des) emp += -x.des / 100 * FORCA_TRABALHO * pop / popTot;
      if (x.mvi) vidas += -x.mvi / 100 * e.reg[r].mvi * pop / 1e5;
      if (x.dsm) km += -x.dsm / 100 * e.reg[r].desmatamento;
    }
    const f = [];
    if (emp >= 1000) f.push(`≈ ${fmtGente(emp)} pessoas a mais trabalhando`);
    if (vidas >= 10) f.push(`≈ ${fmtGente(vidas)} vidas salvas por ano`);
    if (km >= 10) f.push(`≈ ${fmtGente(km * 140)} campos de futebol de floresta preservados por ano`);
    if (km <= -10) f.push(`≈ ${fmtGente(-km * 140)} campos de futebol a mais desmatados por ano`);
    return f.length ? `<p class="pj-gente">${f.map(esc).join(" · ")}</p>` : "";
  }

  /* ---------- abas: conteúdo ---------- */
  function abaEventos() {
    if (!e.eventos.length) return `<p class="vazio">Nenhum evento neste ano.</p>`;
    return `<p class="intro">O que aconteceu em ${e.ano}. Escolha como o governo responde a cada evento.</p>` + e.eventos.map((ev, i) => `
      <article class="evento ${ev.bom ? "bom" : ""}">
        <header><span class="ev-ic">${iconSVG(ev.bom ? "i_crescimento" : "i_alerta", 18, "#fff")}</span>
          <div><h4>${esc(ev.nome)}</h4><small>${ev.regiao ? esc(ev.regiao) : "Nacional"} · ${SEV[ev.sev]} · ${ev.avisado ? "estava no boletim de previsões" : "surpresa"}</small></div></header>
        <div class="ev-resp" role="radiogroup" aria-label="Resposta">
          ${ev.respostas.map(r => `<label class="${ev.resposta === r.id ? "on" : ""}"><input type="radio" name="ev${i}" value="${r.id}" data-ev="${i}" ${ev.resposta === r.id ? "checked" : ""}>
            <span>${esc(r.texto)}</span><small>${r.custo > 0 ? esc(bi(r.custo)) + (r.extra ? " fora do orçamento" : " do orçamento") : r.custo < 0 ? "entra " + esc(bi(-r.custo)) : "sem custo"}</small></label>`).join("")}
        </div>
      </article>`).join("");
  }
  function abaMinistros() {
    cartasUsadas[e.ano] = cartasUsadas[e.ano] || {};
    const usadas = cartasUsadas[e.ano];
    return `<p class="intro">Seus ministros e um governador trazem propostas. Aprove as que cabem no seu plano, ou monte as suas na aba Montar.</p>
      <div class="proj-lista">${e.cartas.map((c, i) => cartaoProjeto(c, {
        autor: { nome: c.autor, cargo: c.cargo, fala: c.fala, cor: c.autorId.startsWith("gov") ? "#6b7c8f" : AREAS[c.autorId] && AREAS[c.autorId].cor },
        acao: `data-carta="${i}"`, estado: usadas[i]
      })).join("")}</div>`;
  }
  let spec = { area: "saude", tipo: "construir", tamanho: "medio", regiao: "Nordeste" };
  function abaMontar() {
    const sel = (id, label, opts) => `<label class="campo"><span>${label}</span><select id="m-${id}">${opts.map(([v, t]) => `<option value="${v}" ${spec[id] === v ? "selected" : ""}>${esc(t)}</option>`).join("")}</select></label>`;
    return `<p class="intro">Monte seu próprio projeto. O custo e os efeitos usam as mesmas regras das propostas dos ministros.</p>
      <div class="montar">
        ${sel("area", "Área", Object.entries(AREAS).map(([k, a]) => [k, a.nome]))}
        ${sel("tipo", "Tipo", Object.entries(TIPOS).map(([k, t]) => [k, t.nome]))}
        ${sel("tamanho", "Tamanho", Object.entries(TAMANHOS).map(([k, t]) => [k, t.nome]))}
        ${sel("regiao", "Onde", [...REGIOES.map(r => [r, r]), ["Nacional", "Brasil todo"]])}
      </div>
      <p class="ajuda" id="m-ajuda"></p>
      <div id="m-prev"></div>`;
  }
  let ultimoMontado = null;
  function atualizarMontar() {
    for (const k of ["area", "tipo", "tamanho", "regiao"]) { const el = $("#m-" + k); if (el) spec[k] = el.value; }
    $("#m-ajuda").textContent = TIPOS[spec.tipo].ajuda;
    const p = montarProjeto(e, spec);
    $("#m-prev").innerHTML = cartaoProjeto(p, { acao: `data-montar="1"`, estado: ultimoMontado });
    if (spec.regiao !== "Nacional") mapa.voarRegiao(spec.regiao);
  }
  function abaCongresso() {
    const c = e.nac.congresso;
    const fala = c >= 65 ? "A base está firme, presidente. Dá para votar o que for preciso." : c >= 45 ? "Tem votos, mas cada um tem seu preço." : "Do jeito que está, nada passa nesta Casa.";
    return `<p class="intro">Quase nunca um presidente tem maioria sozinho. Para aprovar leis, projetos grandes e gastos extras, é preciso montar uma coalizão. Os cientistas políticos chamam isso de ${termo("coalizao", "presidencialismo de coalizão")}.</p>
      <div class="medidor"><div class="md-top"><span>Apoio no Congresso</span><b>${Math.round(c)}</b></div><div class="md-bar"><i style="width:${c}%;background:${c >= 50 ? BOM : c >= 35 ? MEIO : RUIM}"></i></div></div>
      <article class="proj camara"><header class="pj-autor"><span class="avatar" style="--c:#4b6aa8">${esc(iniciais(CAMARA.nome))}</span><div><b>${esc(CAMARA.nome)}</b><small>${esc(CAMARA.cargo)}</small></div></header><blockquote>“${esc(fala)}”</blockquote></article>
      <h3 class="sub">Negociar</h3>
      <div class="neg">${Object.entries(NEGOCIACOES).map(([k, n]) => `
        <div class="neg-item"><div><b>${esc(n.nome)}</b><small>${esc(n.ajuda)} ${n.custo ? `Custa ${esc(bi(n.custo))}.` : ""} +${n.apoio} de apoio.</small></div>
        ${k === "ministerio" ? `<select id="neg-area" aria-label="Área a ceder">${Object.entries(AREAS).filter(([a]) => !e.cedidos.includes(a)).map(([a, x]) => `<option value="${a}">${esc(x.nome)}</option>`).join("")}</select>` : ""}
        <button type="button" class="btn ghost" data-neg="${k}" ${e.negociado[k] ? "disabled" : ""}>${e.negociado[k] ? "Feito" : "Negociar"}</button></div>`).join("")}</div>
      ${e.cedidos.length ? `<p class="ajuda">Ministérios cedidos: ${e.cedidos.map(a => esc(AREAS[a].nome)).join(", ")} (rendem 20% menos).</p>` : ""}
      ${e.votacoes.length ? `<h3 class="sub">Votações em ${e.ano}</h3><ul class="votos">${e.votacoes.map(v => `<li class="${v.aprovado ? "ok" : "nao"}"><span>${esc(v.nome)}</span><b>${v.aprovado ? "Aprovado" : "Rejeitado"}</b><small>${Math.round(v.chance * 100)}%</small></li>`).join("")}</ul>` : ""}`;
  }
  function abaOrcamento() {
    const o = e.orcamento;
    const partes = [
      ["Obrigatórias (por lei)", o.obrigatorias, "#5d6d7e"],
      ["Manter os ministérios", ORCAMENTO.custeio, "#8a9aa8"],
      ["Projetos de anos anteriores", e.manutencao, "#c2953b"],
      ["Livre para projetos novos", Math.max(0, ORCAMENTO.projetos - e.manutencao), "#3f8f5a"],
      ["Emendas do Congresso", o.emendas, "#4b6aa8"],
      ["Outros Poderes", o.outros_poderes, "#a7b0bb"]
    ];
    const tot = partes.reduce((s, p) => s + p[1], 0);
    const desteAno = e.projetos.filter(p => p.anoInicio === e.ano);
    return `<p class="intro">O orçamento federal de 2027 é de cerca de <b>R$ 2,58 trilhões</b>. Quase 90% já chega ${termo("obrigatorias", "comprometido por lei")}: previdência, salários, Bolsa Família, BPC. Só uma ${termo("discricionarias", "fatia pequena")} é sua para decidir, e o Congresso ainda tem as suas ${termo("emendas", "emendas")}.</p>
      <div class="barra">${partes.map(([n, v, c]) => `<i style="flex:${Math.max(v, 4)};background:${c}" title="${esc(n)}: ${esc(bi(v))}"></i>`).join("")}</div>
      <ul class="leg-orc">${partes.map(([n, v, c]) => `<li><i style="background:${c}"></i><span>${esc(n)}</span><b>${esc(bi(Math.round(v * 10) / 10))}</b><small>${nf(v / tot * 100)}%</small></li>`).join("")}</ul>
      <details class="obrig"><summary>O que são as obrigatórias</summary><ul>${Object.entries(o.obrigatorias_detalhe).map(([k, v]) => `<li><span>${esc(k)}</span><b>${esc(bi(v))}</b></li>`).join("")}</ul></details>
      <h3 class="sub">${e.ano}: dinheiro para projetos</h3>
      <dl class="caixa"><div><dt>Disponível</dt><dd>${esc(bi(e.caixa))}</dd></div><div><dt>Gasto além do orçamento</dt><dd class="${e.gastoExtra > 0 ? "ruim" : ""}">${esc(bi(Math.max(0, e.gastoExtra)))}</dd></div></dl>
      <p class="ajuda">Dinheiro não usado reduz a dívida. Gastar além do orçamento aumenta a dívida, freia o crescimento do ano seguinte e, acima de R$ 20 bi, derruba a aprovação.</p>
      ${desteAno.length ? `<ul class="feitos">${desteAno.map(p => `<li><span>${esc(p.nome)}</span><b>${esc(bi(p.custo))}</b><button type="button" class="link" data-desfazer="${p.id}">Desfazer</button></li>`).join("")}</ul>` : `<p class="vazio">Nenhum projeto aprovado em ${e.ano} ainda.</p>`}`;
  }
  function abaPovo() {
    const nomesAreas = l => l.map(a => AREAS[a].nome.toLowerCase()).join(", ");
    const grupos = Object.entries(GRUPOS).sort((a, b) => b[1].peso - a[1].peso).map(([k, G]) => {
      const v = e.grupos[k], d = v - e.ini.grupos[k], eleit = G.peso * ELEITORES, gg = gostosDoGrupo(k);
      return `<li class="grupo">
        <div class="gr-top"><b>${esc(G.nome)}</b><span class="gr-v">${v}%${e.ano > e.anoInicial || e.fase === "fim" ? sinal(d) : ""}</span></div>
        <div class="md-bar"><i style="width:${v}%;background:${G.cor}"></i></div>
        <small>${esc(G.resumo)} ≈ ${esc(fmtGente(eleit))} de eleitores, ${esc(fmtGente(v / 100 * eleit))} aprovam.${gg.gosta.length ? ` Gostam de projetos de ${esc(nomesAreas(gg.gosta))}.` : ""}${gg.torce.length ? ` Torcem o nariz para ${esc(nomesAreas(gg.torce))}.` : ""}</small>
      </li>`;
    }).join("");
    const cid = Object.entries(CIDADAOS).map(([r, C]) => {
      const x = e.cidadaos && e.cidadaos[r];
      return `<li class="cid" data-cid="${esc(r)}"><span class="avatar" style="--c:${C.cor}">${esc(iniciais(C.nome))}</span>
        <div><b>${esc(C.chamada)}</b> <small>${C.idade} anos, ${esc(C.oficio)}, ${esc(C.cidade)}</small>
        ${x ? `<p>${rosto(x.humor)} “${esc(x.fala)}”</p>` : `<p class="ajuda">Se importa com ${esc(C.importa)}. Vai dar a opinião no fim do ano.</p>`}</div></li>`;
    }).join("");
    return `<p class="intro">A aprovação é a soma de oito grupos da sociedade. Cada um pesa as coisas de um jeito: o que agrada a um pode irritar outro. ${e.ano > e.anoInicial || e.fase === "fim" ? "Os números ao lado mostram a mudança desde a posse." : ""}</p>
      <ul class="grupos">${grupos}</ul>
      <h3 class="sub">Um brasileiro de cada região</h3>
      <ul class="cids">${cid}</ul>
      <p class="ajuda">Grupos e pessoas fictícios. O tamanho de cada grupo é uma simplificação do jogo.</p>`;
  }
  function abaPrevisoes() {
    return `<p class="intro">Boletim feito no fim do ano anterior pelos órgãos de clima, desastres e economia. As previsões têm margem de erro: às vezes o evento vem mais forte, às vezes nem acontece. Investir em <b>ciência e monitoramento</b> (Meio ambiente, contratar, Brasil todo) deixa as previsões mais precisas.</p>
      ${e.previsoes.length ? `<ul class="prev">${e.previsoes.map(p => `<li class="${p.bom ? "bom" : ""}"><div class="pv-ch"><b>${p.chance}%</b></div><div><b>${esc(p.nome)}</b><small>${p.regiao ? esc(p.regiao) : "Nacional"}${p.causa ? " · " + esc(p.causa) : ""} · ${p.sevMin === p.sevMax ? SEV[p.sevMin] : `de ${SEV[p.sevMin]} a ${SEV[p.sevMax]}`}</small></div></li>`).join("")}</ul>` : `<p class="vazio">Sem previsões.</p>`}
      <p class="ajuda">Precisão atual: ${e.precisao >= 1.6 ? "alta" : e.precisao >= 1.2 ? "média" : "básica"}.</p>`;
  }

  /* ---------- telas cheias (modal) ---------- */
  function modal(html, cls = "") {
    const m = $("#gov-modal");
    m.querySelector(".gm-box").className = "gm-box " + cls;
    m.querySelector(".gm-box").innerHTML = `<div id="gm-marta" class="gm-marta" hidden></div>` + html;
    m.hidden = false;
    m.querySelector(".gm-box").scrollTop = 0;
    tut.preencherModal();
  }
  const fecharModal = () => { $("#gov-modal").hidden = true; };

  let escolhidas = [];
  function telaModo() {
    modal(`<p class="eyebrow">Antes da posse</p>
      <h2>Primeira vez no Palácio?</h2>
      <p class="lead">A chefe de gabinete pode te acompanhar no primeiro ano, mostrando o país, as regras e cada tela, uma de cada vez. Leva poucos minutos.</p>
      <div class="modo">
        <button type="button" class="modo-i" data-acao="modo-guiado"><b>Governar com a ajuda do gabinete</b><small>Recomendado na primeira partida</small></button>
        <button type="button" class="modo-i" data-acao="modo-livre"><b>Já sei jogar</b><small>Vai direto para as promessas</small></button>
      </div>`, "modo");
  }
  function telaPromessas() {
    modal(`<p class="eyebrow">1º de janeiro de ${e.anoInicial}</p>
      <h2>Você toma posse como presidente.</h2>
      <p class="lead">Mandato de ${e.anoFinal - e.anoInicial + 1} anos. O país começa com os números reais de hoje. Antes de começar, escolha as <b>3 promessas</b> da sua campanha. No fim, você será cobrado por elas, e também por tudo o que deixou de lado.</p>
      <div class="prom">${PROMESSAS.map(p => `<button type="button" class="prom-i ${escolhidas.includes(p.id) ? "on" : ""}" data-prom="${p.id}" aria-pressed="${escolhidas.includes(p.id)}"><span>${esc(p.texto)}</span><small>Meta: ${esc(p.alvo)}</small></button>`).join("")}</div>
      <div class="gm-acoes"><span class="cont">${escolhidas.length} de 3</span><button type="button" class="btn big" data-acao="posse" ${escolhidas.length === 3 ? "" : "disabled"}>Tomar posse</button></div>
      <p class="aviso">Os dados de partida são reais (IBGE, Banco Central, PNUD, Inpe, Anuário de Segurança Pública). Os efeitos das decisões vêm de um modelo simplificado.</p>`, "promessas");
  }

  function linhaInd(i, a, b) {
    const d = b - a, melhor = i.melhor === "maior" ? d > 0 : d < 0, igual = Math.abs(d) < 1e-6;
    return `<tr><th>${iconSVG(i.icone, 15)} ${esc(i.nome)}</th><td>${esc(i.fmt(a))}</td><td>→</td><td><b>${esc(i.fmt(b))}</b></td><td class="${igual ? "" : melhor ? "bom" : "ruim"}">${igual ? "=" : (d > 0 ? "▲" : "▼")}</td></tr>`;
  }
  function resumoGente(a, b) {
    const P = REGIOES.reduce((s, r) => s + e.reg[r].populacao, 0);
    const f = [];
    const emp = (a.desemprego - b.desemprego) / 100 * FORCA_TRABALHO;
    if (Math.abs(emp) >= 10000) f.push(emp > 0 ? `<b>${esc(fmtGente(emp))}</b> pessoas a mais trabalhando` : `<b>${esc(fmtGente(-emp))}</b> pessoas a mais sem emprego`);
    const vidas = (a.mvi - b.mvi) * P / 1e5;
    if (Math.abs(vidas) >= 50) f.push(vidas > 0 ? `<b>${esc(fmtGente(vidas))}</b> mortes violentas a menos por ano` : `<b>${esc(fmtGente(-vidas))}</b> mortes violentas a mais por ano`);
    const km = a.desmatamento - b.desmatamento;
    if (Math.abs(km) >= 50) f.push(km > 0 ? `<b>${esc(fmtGente(km * 140))}</b> campos de futebol de floresta a menos derrubados` : `<b>${esc(fmtGente(-km * 140))}</b> campos de futebol a mais derrubados`);
    return f.length ? `<p class="gente-ano">Em gente: ${f.join(" · ")}.</p>` : "";
  }
  const ROTULO = { evento: "País", obra: "Obras", congresso: "Política", pesquisa: "Pesquisa" };
  function jornal(rel) {
    const j = rel.jornal || [];
    const pri = j.find(x => x.tipo === "principal"), nota = j.find(x => x.tipo === "nota");
    const outras = j.filter(x => x !== pri && x !== nota);
    if (!pri) return "";
    return `<section class="jornal" aria-label="Jornal">
      <header class="jn-cab"><span>Edição de fim de ano · ${rel.ano}</span><b>Diário da Alvorada</b><span>Jornal fictício</span></header>
      <h3 class="jn-man">${esc(pri.titulo)}</h3>
      ${pri.sub ? `<p class="jn-sub">${esc(pri.sub)}</p>` : ""}
      ${outras.length ? `<div class="jn-cols">${outras.map(x => `<article><small>${ROTULO[x.tipo] || ""}</small><h4>${esc(x.titulo)}</h4>${x.sub ? `<p>${esc(x.sub)}</p>` : ""}</article>`).join("")}</div>` : ""}
      ${nota ? `<p class="jn-nota"><b>Bastidores</b> ${esc(nota.titulo)}</p>` : ""}
    </section>`;
  }
  function vozes(rel) {
    if (!rel.cidadaos) return "";
    return `<h3 class="sub">O que o povo diz</h3><ul class="vozes">${Object.entries(rel.cidadaos).map(([r, x]) => { const C = CIDADAOS[r];
      return `<li><header><span class="avatar" style="--c:${C.cor}">${esc(iniciais(C.nome))}</span><div><b>${esc(C.chamada)}</b><small>${C.idade} anos · ${esc(C.oficio)} · ${esc(C.cidade)}</small></div>${rosto(x.humor)}</header><p>“${esc(x.fala)}”</p></li>`; }).join("")}</ul>`;
  }
  function gruposAno(rel) {
    if (!rel.grupos) return "";
    const l = Object.entries(rel.grupos).sort((a, b) => b[1].delta - a[1].delta);
    return `<h3 class="sub">Como cada grupo reagiu</h3><ul class="grupos mini">${l.map(([k, x]) => `<li class="grupo"><div class="gr-top"><b>${esc(GRUPOS[k].nome)}</b><span class="gr-v">${x.valor}%${sinal(x.delta)}</span></div><div class="md-bar"><i style="width:${x.valor}%;background:${GRUPOS[k].cor}"></i></div></li>`).join("")}</ul>
      <p class="ajuda">A aprovação geral (${Math.round(rel.depois.aprovacao)}%, ≈ ${esc(fmtGente(rel.depois.aprovacao / 100 * ELEITORES))} de eleitores) é a média dos grupos, pesada pelo tamanho de cada um.</p>`;
  }
  function telaAno(rel) {
    const proximo = e.fase !== "fim";
    modal(`<p class="eyebrow">Balanço de ${rel.ano}</p>
      ${jornal(rel)}
      ${vozes(rel)}
      <h3 class="sub">Os termômetros</h3>
      <table class="tab-ind"><tbody>${IND.map(i => linhaInd(i, rel.antes[i.id], rel.depois[i.id])).join("")}</tbody></table>
      ${resumoGente(rel.antes, rel.depois)}
      ${gruposAno(rel)}
      ${rel.eventos.length ? `<h3 class="sub">Eventos</h3><ul class="lista">${rel.eventos.map(x => `<li><b>${esc(x.nome)}</b> ${x.regiao ? "(" + esc(x.regiao) + ")" : ""}: ${esc(x.resposta || "")}</li>`).join("")}</ul>` : ""}
      ${rel.prontos.length ? `<h3 class="sub">Projetos que começaram a fazer efeito</h3><ul class="lista">${rel.prontos.map(n => `<li>${esc(n)}</li>`).join("")}</ul>` : ""}
      ${rel.votacoes.length ? `<h3 class="sub">Votações</h3><ul class="lista">${rel.votacoes.map(v => `<li>${esc(v.nome)}: <b>${v.aprovado ? "aprovado" : "rejeitado"}</b></li>`).join("")}</ul>` : ""}
      <p class="ajuda">${rel.economia > 0 ? `${esc(bi(rel.economia))} sem usar reduziram a dívida. ` : ""}${rel.gastoExtra > 0 ? `${esc(bi(rel.gastoExtra))} além do orçamento viraram dívida. ` : ""}Custo fixo deixado para os próximos anos: ${esc(bi(rel.manutencao))} por ano.</p>
      ${proximo ? `<h3 class="sub">Boletim de previsões para ${e.ano}</h3><ul class="prev">${e.previsoes.slice(0, 5).map(p => `<li class="${p.bom ? "bom" : ""}"><div class="pv-ch"><b>${p.chance}%</b></div><div><b>${esc(p.nome)}</b><small>${p.regiao ? esc(p.regiao) : "Nacional"} · ${p.sevMin === p.sevMax ? SEV[p.sevMin] : `de ${SEV[p.sevMin]} a ${SEV[p.sevMax]}`}</small></div></li>`).join("")}</ul>` : ""}
      <div class="gm-acoes"><button type="button" class="btn big" data-acao="${proximo ? "seguir" : "ver-fim"}">${proximo ? `Começar ${e.ano}` : "Ver o fim do mandato"}</button></div>`, "ano");
  }
  function telaFim() {
    const f = relatorioFinal(e);
    const fmtProm = p => { const pr = PROMESSAS.find(x => x.id === p.id); const v = p.valor;
      return ["violencia", "floresta"].includes(p.id) ? `${v >= 0 ? "−" : "+"}${nf(Math.abs(v) * 100, 0)}%` : ["norte"].includes(p.id) ? `+${nf(v, 3)}` : ["nordeste"].includes(p.id) ? `${v >= 0 ? "−" : "+"}${nf(Math.abs(v))} ponto` : p.id === "idh" ? nf(v, 3) : nf(v) + "%"; };
    const mapaInd = { crescimento: "crescimento", desemprego: "desemprego", idhm: "idhm", divida: "divida", mvi: "mvi", desmatamento: "desmatamento", aprovacao: "aprovacao" };
    modal(`<p class="eyebrow">Fim do mandato · ${e.anoInicial}–${e.anoFinal}</p>
      <h2>O Brasil que você deixou.</h2>
      <h3 class="sub">Promessas de campanha</h3>
      <ul class="prom-res">${f.promessas.map(p => `<li class="${p.cumprida ? "ok" : "nao"}"><b>${p.cumprida ? "Cumprida" : "Não cumprida"}</b><span>${esc(p.texto)}</span><small>Resultado: ${esc(fmtProm(p))} · meta ${esc(p.alvo)}</small></li>`).join("")}</ul>
      <h3 class="sub">Legado</h3>
      <table class="tab-ind"><tbody>${f.indicadores.map(x => { const i = IND.find(y => y.id === mapaInd[x.id]); return linhaInd(i, x.ini, x.fim); }).join("")}</tbody></table>
      <h3 class="sub">Quem ficou de fora</h3>
      <p>Investimento por habitante em quatro anos: ${REGIOES.slice().sort((a, b) => f.porRegiao[b] - f.porRegiao[a]).map(r => `<b>${r}</b> R$ ${nf(f.porRegiao[r], 0)}`).join(" · ")}. A área com menos dinheiro foi <b>${esc(AREAS[f.areaIgnorada].nome.toLowerCase())}</b>.</p>
      <blockquote class="reflexao">${f.reflexao.map(esc).join(" ")}</blockquote>
      <div class="gm-acoes"><button type="button" class="btn ghost" data-acao="ver-mapa">Ver o antes e depois no mapa</button><button type="button" class="btn big" data-acao="nova">Governar de novo</button></div>
      <p class="aviso">Modelo simplificado. Ele mostra custos e efeitos plausíveis, não previsões. O jogo não diz o que é certo: diz o que cada escolha custou.</p>`, "fim");
  }

  /* ---------- eventos de interface ---------- */
  root.addEventListener("click", ev => {
    const t = ev.target;
    const ind = t.closest("[data-ind]");
    if (ind) { const x = IND.find(i => i.id === ind.dataset.ind); if (x && x.regional) { indMapa = x.id; renderTopo(); pintarMapa(); } return; }
    const snap = t.closest("[data-snap]");
    if (snap) { snapshot = snap.dataset.snap; renderTopo(); pintarMapa(); return; }
    const ab = t.closest("[data-aba]");
    if (ab) { aba = ab.dataset.aba; confirmando = false; ultimoMontado = null; renderAbas(); renderCorpo(); renderRodape(); abrirPainel(); tut.fecharBalao(); tut.dicaAba(aba); tut.aposRender(); return; }
    const cid = t.closest("[data-cid]");
    if (cid) { mapa.voarRegiao(cid.dataset.cid); return; }
    const pr = t.closest("[data-prom]");
    if (pr) {
      const id = pr.dataset.prom;
      if (escolhidas.includes(id)) escolhidas = escolhidas.filter(x => x !== id);
      else if (escolhidas.length < 3) escolhidas.push(id);
      telaPromessas(); return;
    }
    const carta = t.closest("[data-carta]");
    if (carta) {
      const i = +carta.dataset.carta, c = e.cartas[i];
      const r = executarProjeto(e, c);
      cartasUsadas[e.ano][i] = r.ok ? { ok: true, id: r.proj.id, texto: r.chance != null ? `Aprovado pelo Congresso (${Math.round(r.chance * 100)}%)` : "Aprovado" } : { ok: false, texto: `Rejeitado pelo Congresso (${Math.round(r.chance * 100)}% de chance)` };
      if (c.regiao !== "Nacional") mapa.voarRegiao(c.regiao);
      salvar(); render(); if (r.ok) tut.notificar("carta"); return;
    }
    if (t.closest("[data-montar]")) {
      const r = executarProjeto(e, { ...spec });
      ultimoMontado = r.ok ? { ok: true, texto: "Aprovado. Monte outro se quiser." } : { ok: false, texto: `Rejeitado pelo Congresso (${Math.round(r.chance * 100)}% de chance)` };
      salvar(); render(); if (r.ok) tut.notificar("carta"); return;
    }
    const des = t.closest("[data-desfazer]");
    if (des) {
      const id = +des.dataset.desfazer;
      desfazerProjeto(e, id);
      const u = cartasUsadas[e.ano] || {};
      for (const k of Object.keys(u)) if (u[k].id === id) delete u[k];   // a carta volta a poder ser aprovada
      salvar(); render(); return;
    }
    const neg = t.closest("[data-neg]");
    if (neg) {
      const k = neg.dataset.neg;
      const r = negociar(e, k, k === "ministerio" ? $("#neg-area") && $("#neg-area").value : null);
      if (!r.ok) mapa.aviso(r.motivo);
      salvar(); render(); return;
    }
    const ac = t.closest("[data-acao]");
    if (!ac) return;
    const a = ac.dataset.acao;
    if (a === "posse") { escolherPromessas(e, escolhidas); fecharModal(); aba = e.eventos.length ? "eventos" : "ministros"; salvar(); render(); mapa.visaoGeral(); tut.notificar("posse"); }
    else if (a === "modo-guiado" || a === "modo-livre") { tut.comecar(a === "modo-guiado"); if (a === "modo-livre") telaPromessas(); else fecharModal(); }
    else if (a === "ir-eventos") { aba = "eventos"; render(); abrirPainel(); }
    else if (a === "fechar") { confirmando = true; renderRodape(); }
    else if (a === "cancelar") { confirmando = false; renderRodape(); }
    else if (a === "confirmar") {
      confirmando = false; ultimoMontado = null;
      const rel = fecharAno(e);
      if (e.fase === "fim") snapshot = "agora";
      aba = e.fase === "fim" ? aba : (e.eventos.length ? "eventos" : "ministros");
      salvar(); render(); telaAno(rel); tut.notificar("balanco");
    }
    else if (a === "seguir") { fecharModal(); mapa.visaoGeral(); }
    else if (a === "ver-fim") telaFim();
    else if (a === "ver-mapa") { fecharModal(); root.classList.add("terminado"); snapshot = "inicio"; renderTopo(); pintarMapa(); mapa.visaoGeral(); mapa.aviso("Toque em " + e.anoInicial + " e " + e.anoFinal + " no topo para comparar."); }
    else if (a === "nova") { apagar(); novo(); }
    else if (a === "ver-balanco") telaFim();
  });
  root.addEventListener("change", ev => {
    const r = ev.target.closest("input[data-ev]");
    if (r) { responderEvento(e, +r.dataset.ev, r.value); salvar(); renderAbas(); renderCorpo(); renderRodape(); renderTopo(); tut.notificar("evento"); return; }
    if (ev.target.closest(".montar")) { ultimoMontado = null; atualizarMontar(); }
  });

  /* painel no celular: alça abre e fecha */
  const painel = $("#gov-panel");
  function abrirPainel() { painel.classList.remove("collapsed"); setTimeout(mapa.reajustar, 360); }
  painel.querySelector(".gov-handle").addEventListener("click", () => { painel.classList.toggle("collapsed"); setTimeout(mapa.reajustar, 360); });

  /* ---------- ciclo ---------- */
  async function novo() {
    await carregarInicio();
    e = criarJogo(inicio, { semente: (Date.now() % 2147483647) | 0 });
    escolhidas = []; cartasUsadas = {}; snapshot = "agora"; indMapa = "idhm"; root.classList.remove("terminado");
    tut.usar(e);
    render();
    telaModo();
  }
  function continuar(x) {
    e = x; cartasUsadas = {}; snapshot = "agora"; root.classList.remove("terminado");
    tut.usar(e);
    render();
    tut.retomar();
    if (e.fase === "promessas") telaPromessas();
    else if (e.fase === "fim") telaFim();
    else fecharModal();
  }

  return {
    salvo,
    async abrir({ continuar: cont = false } = {}) {
      document.body.classList.add("gov-on");
      mapa.modoJogo(true);
      const s = cont ? salvo() : null;
      if (s) continuar(s); else await novo();
      setTimeout(mapa.reajustar, 60);
      mapa.visaoGeral();
    },
    fechar() {
      document.body.classList.remove("gov-on");
      fecharModal();
      mapa.colorir(undefined);
      mapa.humor(80);
      mapa.projetos([]);
      mapa.modoJogo(false);
    },
    ativo: () => document.body.classList.contains("gov-on"),
    larguraPainel: () => painel.offsetWidth,
    alturaPainel: () => painel.classList.contains("collapsed") ? 100 : painel.offsetHeight
  };
}
