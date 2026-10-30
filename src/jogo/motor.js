/* Alvorada 27 — motor do modo Governar.
   Puro: não sabe nada de tela nem de 3D. Recebe as condições iniciais (data/jogo/inicio.json)
   e devolve um estado que a interface lê e modifica pelas funções exportadas.
   Roda no navegador e no Node (para simular partidas). */
import {
  REGIOES, ORCAMENTO, AREAS, TIPOS, TAMANHOS, PRAZO, MANUTENCAO, PESO_REGRA, NOMES, NOME_NACIONAL,
  EFEITOS, TIPO_MULT, TEMPORARIO, PRESSAO_FLORESTA, REGIOES_FLORESTA, MEIA_VIDA, TENDENCIA, VOTACAO,
  PROMESSAS, MINISTROS, GOVERNADORES, CAMARA, NEGOCIACOES, EVENTOS, promessaDe, TEMAS_PROMESSA, AMBICAO
} from "./regras.js";
import { iniciarPovo, atualizarGrupos, aprovacaoGeral, reacoesCidadaos, manchetes, GRUPOS, CIDADAOS, ELEITORES, quemGosta, gostosDoGrupo } from "./povo.js";

/* ---------- utilidades ---------- */
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const r1 = v => Math.round(v * 10) / 10;
const r3 = v => Math.round(v * 1000) / 1000;
function criarRng(seed) {
  let s = seed >>> 0;
  return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
function rngDe(e) {   // o estado guarda a semente atual, então salvar e carregar continua igual
  const f = criarRng(e.semente);
  return () => { const v = f(); e.semente = (e.semente + 0x9E3779B1) >>> 0; return v; };
}
const escolher = (rnd, lista) => lista[Math.floor(rnd() * lista.length)];
function escolherPeso(rnd, pesos) {
  const tot = Object.values(pesos).reduce((a, b) => a + b, 0);
  let x = rnd() * tot;
  for (const [k, w] of Object.entries(pesos)) { x -= w; if (x <= 0) return k; }
  return Object.keys(pesos)[0];
}
const copia = o => JSON.parse(JSON.stringify(o));

/* ---------- nacional a partir das regiões ---------- */
function popTotal(e) { return REGIOES.reduce((s, r) => s + e.reg[r].populacao, 0); }
function recalcularNacional(e) {
  const P = popTotal(e);
  const media = k => REGIOES.reduce((s, r) => s + e.reg[r][k] * e.reg[r].populacao, 0) / P;
  e.nac.desemprego = r1(media("desemprego"));
  e.nac.idhm = r3(media("idhm"));
  e.nac.mvi = r1(media("mvi"));
  e.nac.desmatamento = Math.round(REGIOES.reduce((s, r) => s + e.reg[r].desmatamento, 0));
}
function retrato(e) { return { nac: copia(e.nac), reg: copia(e.reg) }; }

/* ---------- criar ---------- */
export function criarJogo(inicio, { semente = Date.now() % 2147483647, anos = 4 } = {}) {
  const reg = {};
  for (const r of REGIOES) {
    const x = inicio.regioes[r];
    reg[r] = {
      populacao: x.populacao, pib: x.pibBilhoes, desemprego: x.desemprego, idhm: x.idhm,
      mvi: x.mvi, desmatamento: x.desmatamento, resiliencia: 0, investido: {}, governador: 55
    };
    for (const a of Object.keys(AREAS)) reg[r].investido[a] = 0;
  }
  const n = inicio.nacional;
  const e = {
    versao: 1, semente, ano: inicio.ano_inicio, anoInicial: inicio.ano_inicio, anoFinal: inicio.ano_inicio + anos - 1,
    fase: "promessas", promessas: [],
    nac: { crescimento: n.crescimento, divida: n.divida, aprovacao: n.aprovacao, congresso: n.congresso, pibTri: n.pib_trilhoes,
           idhm: n.idhm, desemprego: n.desemprego, mvi: n.mvi, desmatamento: n.desmatamento },
    reg, caixa: 0, manutencao: 0, gastoExtra: 0, precisao: 1, cedidos: [],
    projetos: [], projetosAno: [], eventos: [], previsoes: [], cartas: [], negociado: {}, votacoes: [],
    historico: [], temporarios: [], orcamento: inicio.orcamento, fontes: inicio.fontes
  };
  recalcularNacional(e);
  e.nac.idhm = n.idhm; e.nac.desemprego = n.desemprego; e.nac.mvi = n.mvi;   // valores oficiais nacionais no ano zero
  iniciarPovo(e, n.aprovacao);
  e.ini = retrato(e);
  e.ini.grupos = { ...e.grupos };
  e.previsoes = gerarPrevisoes(e);
  return e;
}

export function escolherPromessas(e, ids) {
  if (e.fase !== "promessas") throw new Error("As promessas são escolhidas só no começo.");
  const validas = [...new Set(ids)].filter(id => promessaDe(id, e.ini));
  if (validas.length !== 3) throw new Error("Escolha exatamente 3 promessas.");
  e.promessas = validas;
  iniciarAno(e);
}

/* ---------- começo do ano: eventos e cartas ---------- */
function iniciarAno(e) {
  const rnd = rngDe(e);
  e.caixa = r1(ORCAMENTO.projetos - e.manutencao);
  e.gastoExtra = 0;
  e.negociado = {};
  e.votacoes = [];
  e.eventos = sortearEventos(e, rnd);
  e.cartas = gerarCartas(e, rnd);
  e.projetosAno = [];
  e.fase = "decisoes";
}

function chanceReal(e, ev) {
  let c = ev.chance;
  if (ev.maisCom && ev.maisCom.dsm) {
    const razao = e.nac.desmatamento / e.ini.nac.desmatamento;
    c *= 1 + ev.maisCom.dsm * (razao - 1);
  }
  if (ev.soSeApoioBaixo && e.nac.congresso > ev.soSeApoioBaixo) c *= 0.25;
  return clamp(c, 0.02, 0.85);
}
function gerarPrevisoes(e) {
  const rnd = rngDe(e);
  const out = [];
  for (const ev of EVENTOS) {
    if (ev.aviso === "nunca") continue;
    if (ev.aviso === "as vezes" && rnd() < 0.5) continue;
    const c = chanceReal(e, ev);
    const erro = (rnd() - 0.5) * 0.3 / e.precisao;
    const mostrada = clamp(Math.round((c + erro) * 10) * 10, 10, 90);
    const largura = e.precisao >= 1.6 ? 0 : 1;
    const centro = 1 + Math.floor(rnd() * 3);
    const sevMin = clamp(centro - (rnd() < 0.5 ? largura : 0), 1, 3);
    const sevMax = clamp(sevMin + largura + (e.precisao < 1.2 ? 1 : 0), 1, 3);
    out.push({ id: ev.id, nome: ev.nome, regiao: ev.regiao, causa: ev.causa || null, chance: mostrada, sevMin, sevMax, bom: !!ev.bom });
  }
  return out.sort((a, b) => b.chance - a.chance);
}
function sortearEventos(e, rnd) {
  const ocorridos = [];
  for (const ev of EVENTOS) {
    const prev = e.previsoes.find(p => p.id === ev.id);
    const c = prev ? prev.chance / 100 : chanceReal(e, ev) * 0.8;
    if (rnd() < c) {
      const sev = prev ? prev.sevMin + Math.floor(rnd() * (prev.sevMax - prev.sevMin + 1)) : 1 + Math.floor(rnd() * rnd() * 3);
      ocorridos.push({ id: ev.id, sev, avisado: !!prev });
    }
  }
  if (!ocorridos.length) {
    const ev = escolher(rnd, EVENTOS.filter(x => !x.bom));
    ocorridos.push({ id: ev.id, sev: 1, avisado: false });
  }
  while (ocorridos.length > 2) ocorridos.splice(Math.floor(rnd() * ocorridos.length), 1);
  return ocorridos.map(o => {
    const ev = EVENTOS.find(x => x.id === o.id);
    return { id: ev.id, nome: ev.nome, tipo: ev.tipo, regiao: ev.regiao, sev: o.sev, avisado: o.avisado, bom: !!ev.bom,
             respostas: ev.respostas.map(x => ({ ...x })), resposta: null };
  });
}

/* ---------- projetos ---------- */
const ORDEM_TAMANHO = ["pequeno", "medio", "grande"];
export function nomeProjeto(spec) {
  if (spec.regiao === "Nacional" && NOME_NACIONAL[spec.area] && NOME_NACIONAL[spec.area][spec.tipo]) return NOME_NACIONAL[spec.area][spec.tipo];
  return NOMES[spec.area][spec.tipo];
}
function regioesDo(spec) { return spec.regiao === "Nacional" ? REGIOES : [spec.regiao]; }

/* Monta um projeto (carta ou do jogador) e calcula custo, prazo e efeitos previstos */
export function montarProjeto(e, spec) {
  const { area, tipo, tamanho, regiao } = spec;
  if (!AREAS[area] || !TIPOS[tipo] || !TAMANHOS[tamanho] || !(regiao === "Nacional" || REGIOES.includes(regiao))) throw new Error("Projeto inválido.");
  const custo = TAMANHOS[tamanho].custo[tipo];
  const prazo = tipo === "construir" ? PRAZO.construir[tamanho] : PRAZO[tipo];
  const manut = r1(custo * MANUTENCAO[tipo]);
  const ef = calcularEfeitos(e, spec, custo);
  const precisaVoto = tipo === "regular" || tamanho === "grande";
  return {
    area, tipo, tamanho, regiao, custo, prazo, manutencao: manut, efeitos: ef, precisaVoto,
    nome: nomeProjeto(spec) + (regiao === "Nacional" ? "" : ` — ${regiao}`),
    temporario: !!TEMPORARIO[tipo], monitoramento: area === "ambiente" && tipo === "contratar" && regiao === "Nacional"
  };
}
function calcularEfeitos(e, spec, custo) {
  const { area, tipo, regiao } = spec;
  const base = EFEITOS[area], mult = TIPO_MULT[tipo];
  const peso = tipo === "regular" ? PESO_REGRA : 1;
  const regs = regioesDo(spec);
  const P = regs.reduce((s, r) => s + e.reg[r].populacao, 0);
  const Ptot = popTotal(e);
  const cedido = e.cedidos.includes(area) ? 0.8 : 1;
  const porRegiao = {};
  let g = 0, apr = 0;
  for (const r of regs) {
    const R = e.reg[r];
    const parte = custo * R.populacao / P;                      // dinheiro que cai nesta região
    const I = parte * peso * 1e9 / R.populacao / 100;           // em "R$ 100 por habitante"
    const ret = 1 / (1 + R.investido[area] / MEIA_VIDA);          // retorno decrescente
    const gov = 0.8 + 0.4 * R.governador / 100;                  // relação com o governador
    const k = I * ret * gov * cedido;
    const x = {};
    if (base.idh) x.idh = base.idh * mult.idh * k * clamp((0.87 - R.idhm) / 0.06, 0.4, 2.2);
    if (base.des) x.des = base.des * mult.des * k * clamp(R.desemprego / 5.4, 0.5, 2);
    if (base.mvi) x.mvi = base.mvi * mult.mvi * k * clamp(R.mvi / 19, 0.5, 1.8);
    if (base.dsm && R.desmatamento > 0) {
      if (base.dsm < 0) x.dsm = Math.max(-60, base.dsm * mult.dsm * k);
      else if (tipo === "construir" && PRESSAO_FLORESTA[area] && REGIOES_FLORESTA.includes(r)) x.dsm = base.dsm * PRESSAO_FLORESTA[area] * k;
    }
    if (base.res) x.res = base.res * mult.res * k;
    porRegiao[r] = x;
    if (base.apr) apr += base.apr * mult.apr * k * (R.populacao / Ptot) * 5;
    if (base.g) g += base.g * mult.g * (parte * peso / 10) * ret * cedido;
  }
  return { porRegiao, g: r3(g), apr: r1(apr) };
}

/* Resumo legível dos efeitos (para mostrar na carta) */
export function resumoEfeitos(proj) {
  const s = { idh: 0, des: 0, mvi: 0, dsm: 0 };
  const regs = Object.keys(proj.efeitos.porRegiao);
  for (const r of regs) for (const k of Object.keys(s)) s[k] += proj.efeitos.porRegiao[r][k] || 0;
  const n = regs.length;
  const out = [];
  const add = (ind, v, bom, fmt, min) => { if (Math.abs(v) >= min) out.push({ ind, valor: v, bom, texto: fmt(v) }); };
  add("Qualidade de vida", s.idh / n, s.idh > 0, v => (v > 0 ? "+" : "") + v.toFixed(3).replace(".", ",") + " IDHM", 0.0005);
  add("Emprego", s.des / n, s.des < 0, v => (v > 0 ? "+" : "−") + Math.abs(v).toFixed(1).replace(".", ",") + " pt desemprego", 0.05);
  add("Segurança", s.mvi / n, s.mvi < 0, v => (v > 0 ? "+" : "−") + Math.abs(v).toFixed(0) + "% mortes violentas", 0.5);
  add("Meio ambiente", s.dsm / n, s.dsm < 0, v => (v > 0 ? "+" : "−") + Math.abs(v).toFixed(0) + "% desmatamento", 0.5);
  add("Crescimento", proj.efeitos.g, proj.efeitos.g > 0, v => (v > 0 ? "+" : "−") + Math.abs(v).toFixed(2).replace(".", ",") + " pt PIB", 0.005);
  add("Aprovação", proj.efeitos.apr, proj.efeitos.apr > 0, v => (v > 0 ? "+" : "−") + Math.abs(v).toFixed(1).replace(".", ",") + " pt", 0.05);
  return out;
}

export function chanceVotacao(e, proj, extra = false) {
  const lim = extra ? VOTACAO.extra : proj.tipo === "regular" ? VOTACAO.regular : VOTACAO.grande;
  return clamp(1 / (1 + Math.exp(-(e.nac.congresso - lim) / VOTACAO.inclinacao)), 0.05, 0.97);
}

/* O jogador decide fazer um projeto. Devolve o resultado (inclusive da votação). */
export function executarProjeto(e, spec) {
  if (e.fase !== "decisoes") throw new Error("Agora não é hora de decidir.");
  const proj = montarProjeto(e, spec);
  const extra = proj.custo > e.caixa + 1e-9;
  let aprovado = true, chance = null;
  if (proj.precisaVoto || extra) {
    chance = chanceVotacao(e, proj, extra);
    aprovado = rngDe(e)() < chance;
    e.votacoes.push({ nome: proj.nome, chance, aprovado });
    if (!aprovado) { e.nac.congresso = clamp(e.nac.congresso - 1, 5, 95); return { ok: false, motivo: "votacao", chance, proj }; }
  }
  const doCaixa = Math.min(e.caixa, proj.custo);
  e.caixa = r1(e.caixa - doCaixa);
  e.gastoExtra = r1(e.gastoExtra + proj.custo - doCaixa);
  const id = e.projetos.length + 1;
  const p = { id, ...proj, anoInicio: e.ano, ativo: false, pronto: false };
  e.projetos.push(p);
  e.projetosAno.push(id);
  for (const r of regioesDo(proj)) {
    const parte = proj.custo * e.reg[r].populacao / regioesDo(proj).reduce((s, x) => s + e.reg[x].populacao, 0);
    e.reg[r].investido[proj.area] += parte * (proj.tipo === "regular" ? PESO_REGRA : 1) * 1e9 / e.reg[r].populacao;
    if (proj.regiao !== "Nacional") e.reg[r].governador = clamp(e.reg[r].governador + Math.min(8, proj.custo * 0.8), 0, 100);
  }
  return { ok: true, chance, proj: p, extra };
}

/* Desfaz um projeto decidido neste ano (antes de fechar o ano) */
export function desfazerProjeto(e, id) {
  const i = e.projetos.findIndex(p => p.id === id && p.anoInicio === e.ano);
  if (i < 0) return false;
  const p = e.projetos[i];
  const volta = p.custo;
  const extraUsado = Math.min(e.gastoExtra, volta);
  e.gastoExtra = r1(e.gastoExtra - extraUsado);
  e.caixa = r1(e.caixa + volta - extraUsado);
  for (const r of regioesDo(p)) {
    const parte = p.custo * e.reg[r].populacao / regioesDo(p).reduce((s, x) => s + e.reg[x].populacao, 0);
    e.reg[r].investido[p.area] -= parte * (p.tipo === "regular" ? PESO_REGRA : 1) * 1e9 / e.reg[r].populacao;
  }
  e.projetos.splice(i, 1);
  e.projetosAno = e.projetosAno.filter(x => x !== id);
  return true;
}

export function responderEvento(e, indice, respostaId) {
  const ev = e.eventos[indice];
  if (!ev) throw new Error("Evento não existe.");
  const antes = ev.resposta && ev.respostas.find(x => x.id === ev.resposta);
  if (antes) desfazerCusto(e, antes);
  const resp = ev.respostas.find(x => x.id === respostaId);
  if (!resp) throw new Error("Resposta inválida.");
  ev.resposta = respostaId;
  aplicarCusto(e, resp);
}
function aplicarCusto(e, resp) {
  if (resp.custo > 0) {
    if (resp.extra) e.gastoExtra = r1(e.gastoExtra + resp.custo);
    else { const d = Math.min(e.caixa, resp.custo); e.caixa = r1(e.caixa - d); e.gastoExtra = r1(e.gastoExtra + resp.custo - d); }
  } else if (resp.custo < 0) {
    if (resp.caixa) e.caixa = r1(e.caixa + resp.caixa);
    else e.gastoExtra = r1(e.gastoExtra + resp.custo);
  }
}
function desfazerCusto(e, resp) {
  if (resp.custo > 0) {
    if (resp.extra) e.gastoExtra = r1(e.gastoExtra - resp.custo);
    else e.caixa = r1(e.caixa + resp.custo);
  } else if (resp.custo < 0) {
    if (resp.caixa) e.caixa = r1(e.caixa - resp.caixa);
    else e.gastoExtra = r1(e.gastoExtra - resp.custo);
  }
}

export function negociar(e, tipo, area = null) {
  const n = NEGOCIACOES[tipo];
  if (!n) throw new Error("Negociação inválida.");
  if (e.negociado[tipo]) return { ok: false, motivo: "Já feito neste ano." };
  if (tipo === "ministerio") {
    if (!area || !AREAS[area] || e.cedidos.includes(area)) return { ok: false, motivo: "Escolha uma área ainda não cedida." };
    e.cedidos.push(area);
  }
  if (n.custo) { const d = Math.min(e.caixa, n.custo); e.caixa = r1(e.caixa - d); e.gastoExtra = r1(e.gastoExtra + n.custo - d); }
  e.nac.congresso = clamp(e.nac.congresso + n.apoio, 5, 95);
  e.negociado[tipo] = true;
  return { ok: true };
}

/* ---------- cartas dos ministros ---------- */
const PREF_TIPO = {
  saude: { construir: 3, contratar: 4, transferir: 1, regular: 1 },
  educacao: { construir: 3, contratar: 4, transferir: 2, regular: 1 },
  infra: { construir: 6, contratar: 1, transferir: 2, regular: 2 },
  seguranca: { construir: 2, contratar: 3, transferir: 3, regular: 2 },
  ambiente: { construir: 2, contratar: 4, transferir: 2, regular: 3 },
  economia: { construir: 2, contratar: 2, transferir: 3, regular: 4 },
  assistencia: { construir: 1, contratar: 2, transferir: 5, regular: 1 }
};
function necessidade(e, area, r) {
  const R = e.reg[r];
  switch (area) {
    case "saude": case "educacao": case "assistencia": return Math.max(0.05, 0.87 - R.idhm) * 10;
    case "economia": case "infra": return R.desemprego / 3 + (area === "infra" ? R.pib / 3000 : 0);
    case "seguranca": return R.mvi / 10;
    case "ambiente": return R.desmatamento / 1500 + R.resiliencia * -0.1 + 0.2;
  }
  return 1;
}
const FALAS = {
  saude: ["Tem gente esperando meses por uma consulta. Isso não pode esperar.", "Cada real na atenção básica economiza três no hospital."],
  educacao: ["Educação é lenta, mas é o investimento que mais dura.", "Sem professor bom, escola nova vira prédio vazio."],
  infra: ["Sem estrada e ferrovia, a produção encalha. Precisamos de obra grande!", "Obra gera emprego hoje e crescimento amanhã."],
  seguranca: ["Segurança é dos estados, mas o crime organizado é nacional.", "Sem integração entre as polícias, a gente enxuga gelo."],
  ambiente: ["Desmatar hoje vira seca e queimada amanhã.", "Prevenir desastre custa muito menos que reconstruir."],
  economia: ["Presidente, olhe as contas. Toda despesa nova vira custo fixo.", "Menos burocracia é crescimento quase de graça."],
  assistencia: ["Tem família passando fome. Transferência chega rápido.", "Ninguém pode ficar para trás."]
};
function gerarCartas(e, rnd) {
  const cartas = [];
  for (const area of Object.keys(AREAS)) {
    const pesos = {};
    for (const r of REGIOES) pesos[r] = Math.pow(necessidade(e, area, r), 1.5);
    let regiao = escolherPeso(rnd, pesos);
    let tipo = escolherPeso(rnd, PREF_TIPO[area]);
    if (area === "ambiente" && tipo === "contratar" && rnd() < 0.35) regiao = "Nacional";
    if (area === "economia" && tipo === "regular") regiao = "Nacional";
    const tamanho = area === "infra" ? escolherPeso(rnd, { pequeno: 1, medio: 2, grande: 4 }) : escolherPeso(rnd, { pequeno: 2, medio: 4, grande: 2 });
    const m = MINISTROS[area];
    cartas.push({ ...montarProjeto(e, { area, tipo, tamanho, regiao }), autor: m.nome, cargo: m.cargo, autorId: area, fala: escolher(rnd, FALAS[area]) });
  }
  // um governador pede algo para a sua região
  const r = escolher(rnd, REGIOES);
  const area = escolherPeso(rnd, { saude: 2, educacao: 1, infra: 3, seguranca: 1, economia: 2 });
  const g = GOVERNADORES[r];
  cartas.push({ ...montarProjeto(e, { area, tipo: "construir", tamanho: "medio", regiao: r }), autor: g.nome, cargo: g.cargo, autorId: "gov:" + r,
    fala: "O estado não dá conta sozinho. Preciso do apoio do governo federal." });
  return cartas;
}

/* ---------- fechar o ano ---------- */
export function eventosPendentes(e) { return e.eventos.filter(ev => !ev.resposta); }

export function fecharAno(e) {
  if (e.fase !== "decisoes") throw new Error("Não há ano aberto.");
  if (eventosPendentes(e).length) throw new Error("Responda aos eventos antes de fechar o ano.");
  const rnd = rngDe(e);
  if (!e.grupos) iniciarPovo(e, e.nac.aprovacao);   // mandatos salvos antes da versão com grupos
  const antes = retrato(e);

  // desfaz efeitos temporários do ano anterior
  for (const t of e.temporarios) for (const [r, x] of Object.entries(t)) {
    if (x.idh) e.reg[r].idhm -= x.idh;
    if (x.des) e.reg[r].desemprego -= x.des;
  }
  e.temporarios = [];

  // 1. crescimento do ano
  let g = TENDENCIA.crescimento + (rnd() - 0.5) * 0.5;
  g -= TENDENCIA.freioGasto * (e.gastoExtraAnterior || 0) / 10;
  if (e.nac.divida > 88) g -= 0.15 * (e.nac.divida - 88) / 4;
  const prontos = [];
  for (const p of e.projetos) {
    const anoEfeito = p.anoInicio + p.prazo;
    const comeca = p.prazo === 0 ? p.anoInicio : anoEfeito - 1;  // efeito conta no fechamento deste ano
    if (!p.pronto && e.ano >= comeca) { p.pronto = true; prontos.push(p); }
    if (p.anoInicio === e.ano && p.tipo === "construir" && p.prazo > 0) g += p.efeitos.g * 0.3;   // canteiro de obras já movimenta
  }
  for (const p of prontos) g += p.efeitos.g;
  // eventos de economia
  const sevMult = [0, 0.6, 1, 1.5];
  const danoDe = (ev) => {
    const def = EVENTOS.find(x => x.id === ev.id);
    const resp = ev.respostas.find(x => x.id === ev.resposta) || {};
    let m = sevMult[ev.sev] * (def.bom ? (resp.alivio ?? 1) : (1 - (resp.alivio ?? 0)));
    if (def.pioraComDivida) m *= 1 + Math.max(0, e.nac.divida - 80) / 20;
    return { def, resp, m };
  };
  for (const ev of e.eventos) { const { def, m } = danoDe(ev); if (def.dano.g) g += def.dano.g * m; }
  g = clamp(g, -5, 7);
  e.nac.crescimento = r1(g);
  e.nac.pibTri = Math.round(e.nac.pibTri * (1 + g / 100) * 100) / 100;

  // 2. regiões: tendências
  const desIni = Object.fromEntries(REGIOES.map(r => [r, e.ini.reg[r].desemprego]));
  for (const r of REGIOES) {
    const R = e.reg[r];
    R.desemprego += -0.35 * (g - TENDENCIA.crescimento);
    R.desemprego += 0.2 * (desIni[r] - R.desemprego);           // volta para o nível estrutural
    R.idhm += TENDENCIA.idh;
    R.mvi *= 1 + TENDENCIA.mvi + 0.02 * (R.desemprego - desIni[r]);
    R.desmatamento *= 1 + (rnd() - 0.5) * 0.12;
    R.pib *= 1 + g / 100;
  }

  // 3. projetos que ficaram prontos
  let aprProj = 0;
  const temp = {};
  for (const p of prontos) {
    aprProj += p.efeitos.apr;
    if (p.monitoramento) e.precisao = Math.min(2, e.precisao + (p.tamanho === "grande" ? 0.5 : p.tamanho === "medio" ? 0.3 : 0.15));
    for (const [r, x] of Object.entries(p.efeitos.porRegiao)) {
      const R = e.reg[r];
      if (x.idh) R.idhm += x.idh;
      if (x.des) R.desemprego += x.des;
      if (x.mvi) R.mvi *= 1 + x.mvi / 100;
      if (x.dsm) R.desmatamento *= 1 + x.dsm / 100;
      if (x.res) R.resiliencia += x.res;
      if (p.temporario) { temp[r] = temp[r] || { idh: 0, des: 0 }; temp[r].idh += x.idh || 0; temp[r].des += x.des || 0; }
    }
  }
  if (Object.keys(temp).length) e.temporarios.push(temp);

  // 4. eventos
  let aprEv = 0, congEv = 0, divEv = 0;
  const relatoEventos = [];
  for (const ev of e.eventos) {
    const { def, resp, m } = danoDe(ev);
    const regs = def.regiao ? [def.regiao] : REGIOES;
    for (const r of regs) {
      const R = e.reg[r];
      let mm = m;
      if (def.desastre) mm /= 1 + R.resiliencia;
      if (def.prevencao) mm /= 1 + R.investido[def.prevencao] / 400;
      if (def.dano.des) R.desemprego += def.dano.des * mm;
      if (def.dano.idh) R.idhm += def.dano.idh * mm;
      if (def.dano.mvi) R.mvi *= 1 + def.dano.mvi * mm / 100;
      if (def.dano.dsm) R.desmatamento *= 1 + def.dano.dsm * mm / 100;
    }
    if (resp.dsm && def.regiao) e.reg[def.regiao].desmatamento *= 1 + resp.dsm / 100;
    aprEv += (def.dano.apr || 0) * m + (resp.apr || 0);
    congEv += (def.dano.congresso || 0) * m + (resp.congresso || 0);
    divEv += resp.divida || 0;
    if (resp.governador && def.regiao) e.reg[def.regiao].governador = clamp(e.reg[def.regiao].governador + resp.governador, 0, 100);
    relatoEventos.push({ id: ev.id, nome: ev.nome, regiao: ev.regiao, sev: ev.sev, resposta: resp.texto, bom: ev.bom,
      alivio: resp.alivio ?? (ev.bom ? 1 : 0) });
  }

  // 5. limites
  for (const r of REGIOES) {
    const R = e.reg[r];
    R.desemprego = clamp(R.desemprego, 1.5, 25);
    R.idhm = clamp(R.idhm, 0.5, 0.96);
    R.mvi = clamp(R.mvi, 1, 80);
    R.desmatamento = Math.max(R.desmatamento > 0 ? 30 : 0, R.desmatamento);
  }
  recalcularNacional(e);

  // 6. dívida, aprovação e Congresso
  const pibBi = e.nac.pibTri * 1000;
  // gasto além do orçamento vira dívida; dinheiro de projetos não usado vira economia
  e.nac.divida = r1(e.nac.divida + TENDENCIA.dividaJuros - 0.45 * (g - TENDENCIA.crescimento) + (e.gastoExtra - e.caixa) / pibBi * 100 + divEv);
  const dDes = e.nac.desemprego - antes.nac.desemprego;
  const dIdh = e.nac.idhm - antes.nac.idhm - TENDENCIA.idh;
  const dMvi = (e.nac.mvi - antes.nac.mvi) / antes.nac.mvi * 100;
  // a aprovação é a soma dos grupos da sociedade; cada grupo pesa as coisas de um jeito
  const dDsm = antes.nac.desmatamento ? (e.nac.desmatamento - antes.nac.desmatamento) / antes.nac.desmatamento * 100 : 0;
  const anunciados = e.projetosAno.map(id => e.projetos.find(x => x.id === id)).filter(p => p && !prontos.includes(p));
  const ctxPovo = {
    desgaste: TENDENCIA.desgaste, cres: 1.5 * (g - TENDENCIA.crescimento), des: -2.5 * dDes, idh: 400 * dIdh, mvi: -0.12 * dMvi,
    dsm: -0.04 * dDsm, div: -0.5 * (e.nac.divida - antes.nac.divida - TENDENCIA.dividaJuros),
    extra: e.gastoExtra > 20 ? -(e.gastoExtra - 20) / 10 : 0, eventos: aprEv, prontos, anunciados
  };
  void aprProj;
  const dGrupos = atualizarGrupos(e, ctxPovo);
  e.nac.aprovacao = Math.round(clamp(aprovacaoGeral(e), 3, 92));
  const cidadaos = reacoesCidadaos(e, antes, { ...ctxPovo, g, gastoExtra: e.gastoExtra, eventos: relatoEventos });
  e.nac.congresso = Math.round(clamp(0.7 * e.nac.congresso + 0.3 * e.nac.aprovacao + congEv - e.gastoExtra / 20, 5, 95));

  // 7. manutenção que fica para os próximos anos
  for (const id of e.projetosAno) {
    const p = e.projetos.find(x => x.id === id);
    if (p) e.manutencao = r1(e.manutencao + p.manutencao);
  }

  e.gastoExtraAnterior = Math.max(0, e.gastoExtra);
  const relatorio = {
    ano: e.ano, economia: e.caixa, crescimento: e.nac.crescimento, gastoExtra: e.gastoExtra,
    antes: antes.nac, depois: copia(e.nac), prontos: prontos.map(p => p.nome), eventos: relatoEventos,
    votacoes: e.votacoes.slice(), manutencao: e.manutencao,
    grupos: Object.fromEntries(Object.keys(GRUPOS).map(k => [k, { valor: e.grupos[k], delta: dGrupos[k] }])),
    cidadaos
  };
  relatorio.jornal = manchetes(e, relatorio, { eventos: relatoEventos, prontos }, dGrupos, rnd);
  e.jornais.push({ ano: e.ano, manchetes: relatorio.jornal });
  e.historico.push({ ano: e.ano, nac: copia(e.nac), reg: copia(e.reg), projetos: e.projetosAno.slice(), relatorio });

  if (e.ano >= e.anoFinal) { e.fase = "fim"; e.previsoes = []; return relatorio; }
  e.ano += 1;
  e.previsoes = gerarPrevisoes(e);
  iniciarAno(e);
  return relatorio;
}

/* ---------- fim de partida ---------- */
export function relatorioFinal(e) {
  const f = { nac: e.nac, reg: e.reg, ini: e.ini,
    mediaCrescimento: e.historico.reduce((s, h) => s + h.nac.crescimento, 0) / Math.max(1, e.historico.length) };
  const promessas = e.promessas.map(id => {
    const p = promessaDe(id, e.ini);
    const v = p.medir(f);
    return { id, texto: p.texto, alvo: p.alvo, valor: v, resultado: p.fmt(v), cumprida: p.meta(v), ambicao: p.ambicao || null };
  });
  const ind = [
    { id: "crescimento", nome: "Crescimento médio", ini: e.ini.nac.crescimento, fim: r1(f.mediaCrescimento), melhorSe: "maior", un: "%" },
    { id: "desemprego", nome: "Desemprego", ini: e.ini.nac.desemprego, fim: e.nac.desemprego, melhorSe: "menor", un: "%" },
    { id: "idhm", nome: "Qualidade de vida (IDHM)", ini: e.ini.nac.idhm, fim: e.nac.idhm, melhorSe: "maior", un: "" },
    { id: "divida", nome: "Dívida pública", ini: e.ini.nac.divida, fim: e.nac.divida, melhorSe: "menor", un: "% do PIB" },
    { id: "mvi", nome: "Mortes violentas", ini: e.ini.nac.mvi, fim: e.nac.mvi, melhorSe: "menor", un: " por 100 mil" },
    { id: "desmatamento", nome: "Desmatamento", ini: e.ini.nac.desmatamento, fim: e.nac.desmatamento, melhorSe: "menor", un: " km²" },
    { id: "aprovacao", nome: "Aprovação", ini: e.ini.nac.aprovacao, fim: e.nac.aprovacao, melhorSe: "maior", un: "%" }
  ].map(x => ({ ...x, melhorou: x.melhorSe === "maior" ? x.fim > x.ini : x.fim < x.ini }));

  // investimento por habitante em cada região e em cada área
  const porRegiao = {}, porArea = {};
  for (const r of REGIOES) porRegiao[r] = 0;
  for (const a of Object.keys(AREAS)) porArea[a] = 0;
  for (const p of e.projetos) {
    porArea[p.area] += p.custo;
    for (const r of regioesDo(p)) porRegiao[r] += p.custo * e.reg[r].populacao / regioesDo(p).reduce((s, x) => s + e.reg[x].populacao, 0);
  }
  const perCap = Object.fromEntries(REGIOES.map(r => [r, porRegiao[r] * 1e9 / e.reg[r].populacao]));
  const regEsquecida = REGIOES.slice().sort((a, b) => perCap[a] - perCap[b])[0];
  const regFavorita = REGIOES.slice().sort((a, b) => perCap[b] - perCap[a])[0];
  const areasOrd = Object.keys(AREAS).sort((a, b) => porArea[b] - porArea[a]);
  const areaFoco = areasOrd[0], areaIgnorada = areasOrd[areasOrd.length - 1];
  const piores = ind.filter(x => !x.melhorou && x.id !== "crescimento");

  const total = Object.values(porArea).reduce((a, b) => a + b, 0);
  const frases = [];
  if (total < 1) frases.push("Você quase não usou o orçamento. O país seguiu no piloto automático, e o piloto automático também é uma escolha.");
  else frases.push(`Você apostou principalmente em ${AREAS[areaFoco].nome.toLowerCase()}, e a região que mais recebeu por habitante foi o ${regFavorita}.`);
  if (regEsquecida !== regFavorita) frases.push(`O ${regEsquecida} foi quem menos recebeu.`);
  if (piores.length) frases.push(`Pioraram: ${piores.map(x => x.nome.toLowerCase()).join(", ")}.`);
  const dDiv = e.nac.divida - e.ini.nac.divida;
  if (dDiv > 6) frases.push(`A dívida subiu ${r1(dDiv).toString().replace(".", ",")} pontos. Parte da conta ficou para o próximo governo.`);
  if (e.manutencao > 20) frases.push(`Seus projetos deixaram R$ ${Math.round(e.manutencao)} bi por ano de custo fixo. É assim que o orçamento vai ficando travado.`);
  const cumpridas = promessas.filter(p => p.cumprida).length;
  frases.push(cumpridas === 3 ? "Você cumpriu as três promessas." : cumpridas === 0 ? "Nenhuma promessa foi cumprida." : `Você cumpriu ${cumpridas} de 3 promessas.`);
  frases.push("Governar é escolher o que deixar para depois.");

  return { promessas, indicadores: ind, porRegiao: perCap, porArea, regEsquecida, regFavorita, areaFoco, areaIgnorada, reflexao: frases, manutencao: e.manutencao };
}

export { GRUPOS, CIDADAOS, ELEITORES, quemGosta, gostosDoGrupo, promessaDe, TEMAS_PROMESSA, AMBICAO };
export { REGIOES, AREAS, TIPOS, TAMANHOS, PROMESSAS, MINISTROS, GOVERNADORES, CAMARA, NEGOCIACOES, ORCAMENTO };
