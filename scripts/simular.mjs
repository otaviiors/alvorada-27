/* Simula muitas partidas com estilos diferentes de governar, para calibrar o motor.
   Uso: node scripts/simular.mjs [partidas] */
import fs from "node:fs";
import { criarJogo, escolherPromessas, executarProjeto, responderEvento, fecharAno, relatorioFinal, negociar, eventosPendentes } from "../src/jogo/motor.js";
import { REGIOES } from "../src/jogo/regras.js";

const inicio = JSON.parse(fs.readFileSync(new URL("../data/jogo/inicio.json", import.meta.url)));
const N = +process.argv[2] || 200;

const estilos = {
  "Piloto automático": {
    responde: ev => ev.respostas[ev.respostas.length - 1].id,
    decide: () => {}
  },
  "Aceita os ministros": {
    responde: ev => (ev.respostas[1] || ev.respostas[0]).id,
    decide: e => { for (const c of e.cartas) if (c.custo <= e.caixa) executarProjeto(e, c); }
  },
  "Gasta sem limite": {
    responde: ev => ev.respostas[0].id,
    decide: e => { for (const c of e.cartas) executarProjeto(e, c); for (const r of REGIOES) executarProjeto(e, { area: "infra", tipo: "construir", tamanho: "grande", regiao: r }); }
  },
  "Social no Nordeste": {
    responde: ev => (ev.respostas[1] || ev.respostas[0]).id,
    decide: e => {
      const lista = [["assistencia", "transferir", "grande"], ["saude", "contratar", "medio"], ["educacao", "construir", "medio"], ["economia", "contratar", "medio"], ["saude", "construir", "medio"], ["educacao", "contratar", "pequeno"]];
      for (const [area, tipo, tamanho] of lista) { const s = { area, tipo, tamanho, regiao: "Nordeste" }; if (e.caixa >= 1) executarProjeto(e, s); }
    }
  },
  "Desenvolvimentista": {
    responde: ev => ev.respostas[0].id,
    decide: e => {
      negociar(e, "conversa");
      if (e.nac.congresso < 50) negociar(e, "emendas");
      for (const r of ["Centro-Oeste", "Norte", "Nordeste", "Sudeste"]) if (e.caixa >= 12) executarProjeto(e, { area: "infra", tipo: "construir", tamanho: "grande", regiao: r });
      executarProjeto(e, { area: "economia", tipo: "regular", tamanho: "grande", regiao: "Nacional" });
      if (e.caixa >= 5) executarProjeto(e, { area: "economia", tipo: "construir", tamanho: "medio", regiao: "Nordeste" });
    }
  },
  "Verde": {
    responde: ev => (ev.respostas[1] || ev.respostas[0]).id,
    decide: e => {
      negociar(e, "conversa");
      executarProjeto(e, { area: "ambiente", tipo: "regular", tamanho: "grande", regiao: "Nacional" });
      if (e.ano === e.anoInicial) executarProjeto(e, { area: "ambiente", tipo: "contratar", tamanho: "medio", regiao: "Nacional" });
      for (const r of ["Norte", "Centro-Oeste", "Nordeste"]) if (e.caixa >= 3) executarProjeto(e, { area: "ambiente", tipo: "contratar", tamanho: "medio", regiao: r });
      for (const r of ["Nordeste", "Sul"]) if (e.caixa >= 5) executarProjeto(e, { area: "ambiente", tipo: "construir", tamanho: "medio", regiao: r });
      for (const c of e.cartas) if (c.custo <= e.caixa) executarProjeto(e, c);
    }
  },
  "Austero": {
    responde: ev => ev.respostas[ev.respostas.length - 1].id,
    decide: e => { negociar(e, "conversa"); executarProjeto(e, { area: "economia", tipo: "regular", tamanho: "grande", regiao: "Nacional" }); executarProjeto(e, { area: "infra", tipo: "regular", tamanho: "grande", regiao: "Nacional" }); }
  },
  "Segurança": {
    responde: ev => (ev.respostas[1] || ev.respostas[0]).id,
    decide: e => {
      negociar(e, "conversa");
      executarProjeto(e, { area: "seguranca", tipo: "regular", tamanho: "grande", regiao: "Nacional" });
      for (const r of ["Nordeste", "Norte", "Centro-Oeste"]) if (e.caixa >= 6) executarProjeto(e, { area: "seguranca", tipo: "contratar", tamanho: "grande", regiao: r });
      for (const c of e.cartas) if (c.custo <= e.caixa) executarProjeto(e, c);
    }
  }
};

const fmt = (v, d = 1) => (Math.round(v * 10 ** d) / 10 ** d).toFixed(d).padStart(6);
console.log(`${N} partidas por estilo. Valores médios no fim do mandato (início entre parênteses).\n`);
const ini = criarJogo(inicio, { semente: 1 }).nac;
console.log(`Início: cresc ${ini.crescimento} | desemp ${ini.desemprego} | IDHM ${ini.idhm} | dívida ${ini.divida} | MVI ${ini.mvi} | desmat ${ini.desmatamento} | aprov ${ini.aprovacao} | congresso ${ini.congresso}\n`);
console.log("Estilo                 cresc  desemp  IDHM    dívida  MVI    desmat  aprov  congr  manut  extra/ano  promessas cumpridas (%)");
const promessasTodas = ["emprego", "crescer", "nordeste", "idh", "norte", "violencia", "floresta", "divida", "popular"];
for (const [nome, est] of Object.entries(estilos)) {
  const soma = { g: 0, des: 0, idh: 0, div: 0, mvi: 0, dsm: 0, apr: 0, cong: 0, man: 0, extra: 0 };
  const cumpre = Object.fromEntries(promessasTodas.map(p => [p, 0]));
  for (let s = 1; s <= N; s++) {
    const e = criarJogo(inicio, { semente: s * 7919 });
    escolherPromessas(e, ["emprego", "crescer", "nordeste"]);
    let extra = 0;
    while (e.fase === "decisoes") {
      e.eventos.forEach((ev, i) => responderEvento(e, i, est.responde(ev)));
      est.decide(e);
      extra += e.gastoExtra;
      fecharAno(e);
    }
    e.promessas = promessasTodas;
    const f = relatorioFinal(e);
    soma.g += f.indicadores[0].fim; soma.des += e.nac.desemprego; soma.idh += e.nac.idhm; soma.div += e.nac.divida;
    soma.mvi += e.nac.mvi; soma.dsm += e.nac.desmatamento; soma.apr += e.nac.aprovacao; soma.cong += e.nac.congresso; soma.man += e.manutencao; soma.extra += extra / 4;
    for (const p of f.promessas) if (p.cumprida) cumpre[p.id]++;
  }
  const m = k => soma[k] / N;
  console.log(`${nome.padEnd(22)}${fmt(m("g"))}${fmt(m("des"))}  ${fmt(m("idh"), 3)} ${fmt(m("div"))} ${fmt(m("mvi"))} ${fmt(m("dsm"), 0)} ${fmt(m("apr"), 0)} ${fmt(m("cong"), 0)} ${fmt(m("man"), 0)} ${fmt(m("extra"), 0)}     ` +
    promessasTodas.map(p => `${p}:${Math.round(cumpre[p] / N * 100)}`).join(" "));
}
