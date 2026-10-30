/* Alvorada 27 — tutorial guiado pela chefe de gabinete e glossário de termos */
import { eventosPendentes } from "./jogo/motor.js";

const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

/* ---------- glossário ---------- */
export const TERMOS = {
  idhm: { t: "IDHM", d: "Índice de Desenvolvimento Humano Municipal. Junta saúde (quanto se vive), educação (quanto se estuda) e renda. Vai de 0 a 1; acima de 0,800 é considerado muito alto. O Brasil chegou a 0,805 em 2024." },
  mvi: { t: "Mortes violentas", d: "Homicídios, latrocínios, lesões seguidas de morte e mortes causadas por policiais, somados. Em 2025 foram 40,8 mil no Brasil: 19,1 a cada 100 mil habitantes." },
  desemprego: { t: "Desemprego", d: "Parte das pessoas que procuram trabalho e não encontram. 5,4% equivale a cerca de 6 milhões de pessoas. Cada 0,1 ponto a menos é por volta de 110 mil pessoas voltando a trabalhar." },
  desmatamento: { t: "Desmatamento", d: "Área de vegetação nativa derrubada por ano na Amazônia e no Cerrado, medida por satélite pelo Inpe. 13 mil km² é quase 9 vezes a área da cidade de São Paulo." },
  divida: { t: "Dívida pública", d: "Quanto o governo deve, comparado com tudo o que o país produz em um ano (PIB). Em 2026 passou de R$ 11 trilhões, ou 82,9% do PIB. Quanto maior, mais dinheiro vai só para pagar juros." },
  crescimento: { t: "Crescimento", d: "Quanto a economia (o PIB) cresceu no ano. Crescer gera emprego e arrecadação; parar de crescer é recessão." },
  aprovacao: { t: "Aprovação", d: "Quanto da população aprova o governo. Ajuda no Congresso e, no futuro, na eleição." },
  obrigatorias: { t: "Despesas obrigatórias", d: "Gastos que a lei manda fazer todo ano: aposentadorias, salários de servidores, Bolsa Família, BPC, pisos de saúde e educação. São cerca de 89% do orçamento federal." },
  discricionarias: { t: "Despesas discricionárias", d: "A parte do orçamento que o governo pode decidir onde gastar. É pequena: cerca de 8% do total." },
  emendas: { t: "Emendas parlamentares", d: "Parte do orçamento que deputados e senadores direcionam para obras e serviços nas suas bases. Em 2027, R$ 44,8 bilhões." },
  coalizao: { t: "Presidencialismo de coalizão", d: "No Brasil, o partido do presidente quase nunca tem maioria sozinho. Para aprovar leis, o governo monta uma coalizão com vários partidos, oferecendo cargos e espaço no orçamento." },
  credito: { t: "Gasto além do orçamento", d: "Quando o governo gasta mais do que o previsto, precisa de autorização do Congresso e o dinheiro vira dívida." },
  transicao: { t: "Transição de governo", d: "Entre a eleição (outubro) e a posse (1º de janeiro), a equipe do presidente eleito recebe informações do governo que está saindo para se preparar. No Brasil, isso está previsto em lei desde 2002." },
  manutencao: { t: "Custo fixo", d: "Tudo o que é construído ou contratado continua custando nos anos seguintes: manutenção de obras, salários de quem foi contratado. É assim que o orçamento vai ficando travado." }
};
export const termo = (id, texto) => `<button type="button" class="termo" data-termo="${id}">${esc(texto || TERMOS[id].t)}</button>`;

/* ---------- chefe de gabinete ---------- */
export const CHEFE = { nome: "Marta Quintela", cargo: "Chefe de gabinete", iniciais: "MQ", cor: "#7a5bb0" };

/* Passos do primeiro ano.
   espera: "continuar" | "abrir-promessas" | "posse" | "eventos" | "carta" | "balanco"
   painel: false recolhe o painel (para o mapa aparecer inteiro no celular) */
const SETA = (s, cls, v) => `<span class="ex-seta">${v} <em class="${cls}">${s}</em></span>`;
const PASSOS = [
  { id: "oi", espera: "continuar", ind: null, voar: "geral", painel: false,
    texto: () => `Bom dia, presidente. Eu sou a Marta, sua chefe de gabinete. Estamos na ${termo("transicao", "transição de governo")}: a posse é só em janeiro. Deixa eu te mostrar o país que você vai receber.` },
  { id: "emprego", espera: "continuar", ind: "desemprego", voar: "Nordeste", painel: false,
    texto: () => `Comecemos pelo trabalho. Hoje ${termo("desemprego", "5,4% das pessoas")} procuram emprego e não acham: cerca de <b>6 milhões de brasileiros</b>. No mapa, quanto mais vermelho, pior. Veja o Nordeste: lá são 7,6%, ou <b>2,2 milhões de pessoas</b> sem trabalho, quase tanto quanto no Sudeste inteiro, que tem 30 milhões de habitantes a mais.` },
  { id: "vida", espera: "continuar", ind: "idhm", voar: "geral", painel: false,
    texto: () => `Agora a qualidade de vida, medida pelo ${termo("idhm")}: saúde, estudo e renda. O Brasil nunca esteve tão bem nesse índice, mas o Norte e o Nordeste, onde vivem <b>72 milhões de pessoas</b>, um em cada três brasileiros, ainda estão bem atrás do Sul e do Sudeste.` },
  { id: "violencia", espera: "continuar", ind: "mvi", voar: "Nordeste", painel: false,
    texto: () => `Segurança. Em 2025, ${termo("mvi", "40,8 mil pessoas morreram de forma violenta")}. É o menor número em mais de uma década, mas só no Nordeste foram <b>cerca de 17 mil vidas</b>, como se uma cidade pequena inteira desaparecesse todo ano. Detalhe importante: polícia é, quase toda, responsabilidade dos estados. Você ajuda, mas não manda.` },
  { id: "floresta", espera: "continuar", ind: "desmatamento", voar: "Norte", painel: false,
    texto: () => `E a floresta. No último ano foram derrubados ${termo("desmatamento", "13 mil km²")} de Amazônia e Cerrado, quase 9 vezes a cidade de São Paulo, ou <b>1,8 milhão de campos de futebol</b>. Vem caindo, mas obras e expansão de lavoura no Norte e no Centro-Oeste pressionam de novo.` },
  { id: "dinheiro", espera: "continuar", ind: null, voar: "geral", painel: false,
    texto: () => `Por último, o dinheiro. O orçamento federal é de R$ 2,58 trilhões, mas quase 90% já chega ${termo("obrigatorias", "comprometido por lei")}. Para projetos novos, sobram uns <b>R$ 70 bilhões por ano</b>: cerca de <b>R$ 345 por brasileiro</b>. E o país deve ${termo("divida", "82,9% de tudo o que produz")}, uns <b>R$ 54 mil por habitante</b>. Não dá para fazer tudo.` },
  { id: "analise", espera: "abrir-promessas", alvo: "#gov-panel", ind: "idhm", voar: "geral", painel: true, aba: "raiox",
    texto: () => `Agora o tempo é seu. Aqui no painel está o <b>Raio-X</b> do país: toque num tema para pintar o mapa e ver qual região está pior. Dê uma olhada também nas abas <b>Povo</b> (quem são os brasileiros e o que querem), <b>Orçamento</b> e <b>Previsões</b>. Tire as suas conclusões. Quando estiver pronto, toque em <b>Escolher as promessas</b>, lá embaixo.` },
  { id: "promessas", espera: "posse", ind: null, abre: "promessas",
    texto: () => `Na campanha você fez promessas. Escolha 3: pode usar as prontas ou montar as suas, escolhendo o tema, a região e a ambição. Dica: escolha coisas que combinam entre si. Prometer cortar o desmatamento pela metade e, ao mesmo tempo, muita obra no Norte vai dar briga.` },
  { id: "termometros", espera: "continuar", alvo: "#gov-top .gt-inds", ind: "idhm",
    texto: () => `Posse feita! Lá em cima ficam os termômetros do país. Toque nos que têm cor por região para pintar o mapa. A partir do fim deste ano, cada um ganha uma setinha comparando com o dia da posse: ${SETA("▼", "bom", "desemprego 5,1%")} quer dizer que caiu, e isso é bom; ${SETA("▲", "ruim", "dívida 84%")} quer dizer que subiu, e isso é ruim. A seta mostra a direção; a cor diz se foi bom ou ruim.` },
  { id: "caixa", espera: "continuar", alvo: ".gt-caixa",
    texto: () => `Este é o seu dinheiro para projetos neste ano: R$ 70 bilhões parece muito, mas dá uns R$ 345 por brasileiro. O que sobrar no fim do ano ajuda a baixar a dívida. Se gastar mais do que tem, vira dívida, e o Congresso precisa autorizar.` },
  { id: "eventos", espera: "eventos", alvo: "#gov-body", aba: "eventos", pular: e => !e.eventos.length,
    texto: e => `Todo ano acontecem coisas que ninguém controla. Este ano teve ${e.eventos.length === 1 ? "um evento" : e.eventos.length + " eventos"}. Responda a cada um. Não existe resposta certa: só custos diferentes.` },
  { id: "ministros", espera: "carta", alvo: "#gov-body .proj", aba: "ministros",
    texto: () => `Seus ministros trouxeram propostas. Repare no mapa: cada rosto é um ministro pedindo algo para aquela região; toque nele para ver o pedido. Aqui no painel, cada cartão mostra quanto custa, quando faz efeito, o custo fixo que deixa para os próximos anos, o que melhora e quem gosta da ideia. Aprove pelo menos uma.` },
  { id: "montar", espera: "continuar", alvo: "#gov-body .montar", aba: "montar",
    texto: () => `Na aba <b>Montar</b> você cria o seu próprio projeto. Escolha a área, o tipo, o tamanho e onde. <b>Construir</b> demora e deixa custo fixo; <b>contratar</b> deixa salários para pagar; <b>transferir</b> dinheiro age rápido, mas só vale naquele ano; <b>mudar uma regra</b> é barato, mas precisa do Congresso. O cartão embaixo mostra tudo na hora. Não precisa aprovar nada agora.` },
  { id: "congresso", espera: "continuar", alvo: "#gov-body .medidor", aba: "congresso",
    texto: () => `Na aba <b>Congresso</b> está o seu apoio entre deputados e senadores. Projetos grandes, mudanças de regra e gasto além do orçamento passam por votação: quanto mais apoio, mais chance. Dá para negociar (cargos, emendas, até ceder um ministério), mas tudo tem preço. Isso tem nome: ${termo("coalizao", "presidencialismo de coalizão")}.` },
  { id: "orcamento", espera: "continuar", alvo: "#gov-body .barra", aba: "orcamento",
    texto: () => `Na aba <b>Orçamento</b> você vê o dinheiro inteiro do governo. Repare no tamanho da sua fatia, a verde. E se se arrepender de um projeto, dá para desfazer aqui antes de fechar o ano.` },
  { id: "povo", espera: "continuar", alvo: "#gov-body .grupos", aba: "povo",
    texto: () => `Na aba <b>Povo</b> estão os oito grupos que formam a sua aprovação. Cada um pesa as coisas de um jeito: o que agrada aos agricultores pode irritar os ambientalistas. Mais embaixo estão cinco brasileiros, um de cada região, que vão comentar o seu ano.` },
  { id: "previsoes", espera: "continuar", alvo: "#gov-body .prev", aba: "previsoes",
    texto: () => `E na aba <b>Previsões</b> está o boletim do ano: o que pode acontecer e com qual chance. Tem margem de erro. Use para se preparar: se vem seca forte, talvez valha guardar dinheiro. Investir em ciência e monitoramento deixa as previsões mais precisas.` },
  { id: "fechar", espera: "balanco", alvo: "#gov-foot",
    texto: () => `Pronto, você já conhece todas as abas. Quando estiver satisfeito com as decisões do ano, feche o ano aqui embaixo. Aí a gente vê o que aconteceu com o país.` },
  { id: "balanco", espera: "continuar", modal: true,
    texto: () => `Fim de ano é dia de jornal. Primeiro, as manchetes do Diário da Alvorada. Depois, o que cinco brasileiros acharam das suas decisões, os termômetros do país e como cada grupo reagiu. No fim, vem o boletim de previsões do ano que vem.` },
  { id: "tchau", espera: "continuar", modal: true,
    texto: () => `Daqui para frente é com você. Quando fechar esta tela, repare nos termômetros lá em cima: agora eles têm as setinhas, verde quando melhorou desde a posse e vermelha quando piorou. Qualquer termo sublinhado, é só tocar que eu explico. Bom mandato, presidente.` }
];
const ABA_PASSO = { montar: "montar", congresso: "congresso", orcamento: "orcamento", povo: "povo", previsoes: "previsoes" };

/* Dicas que aparecem uma vez, na primeira visita a cada aba */
const DICAS = {
  montar: `Aqui você monta seu próprio projeto, escolhendo área, tipo, tamanho e lugar. Obras demoram e deixam custo fixo; transferências agem rápido, mas só valem naquele ano. O mesmo dinheiro rende mais onde a necessidade é maior.`,
  congresso: `Projetos grandes, leis e gastos além do orçamento passam por votação. Quanto mais apoio, mais chance. Dá para negociar, mas tudo tem preço. Isso tem nome: ${termo("coalizao", "presidencialismo de coalizão")}.`,
  povo: `Esses são os oito grupos que formam a sua aprovação, e cinco brasileiros que vão te contar, todo fim de ano, como sentiram as suas decisões. Antes de aprovar um projeto, olhe no cartão quem ele agrada e quem ele desagrada.`,
  raiox: `Este é o Raio-X do país antes da posse. Toque num tema para pintar o mapa e ver qual região está pior. Quando quiser, escolha as promessas lá embaixo.`,
  previsoes: `Este é o boletim de previsões para o ano. Ele tem margem de erro. Investir em ciência e monitoramento (Meio ambiente, contratar, Brasil todo) deixa as previsões mais precisas.`
};

export function criarTutorial({ root, mapa, ui }) {
  let e = null;
  const coach = document.createElement("div");
  coach.id = "coach";
  coach.hidden = true;
  coach.setAttribute("role", "dialog");
  coach.setAttribute("aria-live", "polite");
  root.appendChild(coach);
  const pop = document.createElement("div");
  pop.id = "termo-pop";
  pop.hidden = true;
  document.getElementById("app").appendChild(pop);

  const st = () => e.tutorial || (e.tutorial = { ativo: false, passo: 0, vistos: [] });
  const passo = () => PASSOS[st().passo];

  function limparDestaque() { document.querySelectorAll(".destaque").forEach(el => el.classList.remove("destaque")); }
  /* coloca o balão perto do que está sendo explicado, com uma setinha apontando */
  function posicionar(el) {
    coach.style.left = coach.style.top = coach.style.bottom = coach.style.right = "";
    coach.classList.remove("seta-cima", "seta-esq", "seta-baixo");
    if (!el || window.matchMedia("(max-width: 760px)").matches) return;
    const r = el.getBoundingClientRect(), W = window.innerWidth, H = window.innerHeight;
    const w = coach.offsetWidth, h = coach.offsetHeight, m = 16;
    let x, y;
    if (r.right < W * 0.42) {                       // alvo no painel da esquerda: balão à direita dele
      x = r.right + m;
      y = Math.max(80, Math.min(H - h - m, r.top + Math.min(r.height, 120) / 2 - 40));
      coach.classList.add("seta-esq");
      coach.style.setProperty("--sy", Math.max(18, Math.min(h - 18, r.top + Math.min(r.height, 120) / 2 - y)) + "px");
    } else if (r.top < H / 2) {                      // alvo no alto: balão logo abaixo
      x = Math.max(m, Math.min(W - w - m, r.left + r.width / 2 - w / 2));
      y = r.bottom + 14;
      coach.classList.add("seta-cima");
      coach.style.setProperty("--sx", Math.max(18, Math.min(w - 18, r.left + r.width / 2 - x)) + "px");
    } else {                                         // alvo embaixo: balão logo acima
      x = Math.max(m, Math.min(W - w - m, r.left + r.width / 2 - w / 2));
      y = r.top - h - 14;
      coach.classList.add("seta-baixo");
      coach.style.setProperty("--sx", Math.max(18, Math.min(w - 18, r.left + r.width / 2 - x)) + "px");
    }
    coach.style.left = x + "px"; coach.style.top = y + "px"; coach.style.bottom = "auto";
  }
  let alvoDica = null;   // dicas das abas (fora do tutorial) apontam para o painel
  function destacar() {
    limparDestaque();
    if (!e || !st().ativo || coach.hidden) { posicionar(coach.hidden ? null : alvoDica); return; }
    const p = passo();
    const el = p && p.alvo ? document.querySelector(p.alvo) : null;
    if (el) el.classList.add("destaque");
    posicionar(el);
  }
  window.addEventListener("resize", () => { if (!coach.hidden) destacar(); });

  const conteudo = (html, botoes) => `<div class="ch-top"><span class="avatar" style="--c:${CHEFE.cor}">${CHEFE.iniciais}</span><div><b>${CHEFE.nome}</b><small>${CHEFE.cargo}</small></div>
      ${st().ativo ? `<button type="button" class="link ch-pular" data-tut="pular">Pular tutorial</button>` : ""}</div>
      <p>${html}</p>${botoes ? `<div class="ch-acoes">${botoes}</div>` : ""}`;
  function balao(html, botoes) {
    coach.innerHTML = conteudo(html, botoes);
    coach.hidden = false;
  }
  /* nas telas cheias (promessas, balanço) a Marta fala dentro da própria tela */
  function preencherModal() {
    const slot = document.getElementById("gm-marta");
    if (!slot) return;
    const p = passo();
    if (!e || !st().ativo || !p || !(p.modal || p.abre)) { slot.innerHTML = ""; slot.hidden = true; return; }
    const botao = p.espera === "continuar" ? `<button type="button" class="btn" data-tut="ok">${p.id === "tchau" ? "Entendi" : "Continuar"}</button>` : "";
    slot.innerHTML = conteudo(p.texto(e), botao);
    slot.hidden = false;
  }

  function mostrar() {
    const s = st();
    if (!s.ativo) { coach.hidden = true; limparDestaque(); return; }
    let p = passo();
    while (p && p.pular && p.pular(e)) { s.passo++; p = passo(); }
    if (!p) { encerrar(); return; }
    if (p.ind !== undefined) ui.indicador(p.ind);
    if (p.voar === "geral") mapa.visaoGeral(); else if (p.voar) mapa.voarRegiao(p.voar);
    if (p.aba) ui.aba(p.aba);
    if (p.painel !== undefined) ui.painel(p.painel);
    if (p.abre === "promessas") ui.promessas();
    if (p.modal || p.abre) { coach.hidden = true; limparDestaque(); preencherModal(); ui.salvar(); return; }
    const botao = p.espera === "continuar" ? `<button type="button" class="btn" data-tut="ok">${s.passo === 0 ? "Vamos lá" : "Continuar"}</button>`
      : p.id === "analise" ? `<button type="button" class="btn" data-tut="esconder">Vou explorar</button>` : "";
    balao(p.texto(e), botao);
    if (p.espera === "eventos" && !eventosPendentes(e).length) { avancar(); return; }
    ui.salvar();
    requestAnimationFrame(destacar);
  }
  function avancar() { st().passo++; mostrar(); }
  function encerrar() {
    const s = st(); s.ativo = false;
    coach.hidden = true; limparDestaque(); preencherModal();
    ui.salvar(); ui.render();
  }

  document.addEventListener("click", ev => {
    const b = ev.target.closest("[data-tut]");
    if (!b) return;
    if (b.dataset.tut === "ok") {
      if (st().ativo) avancar();
      else { coach.hidden = true; }
    } else if (b.dataset.tut === "esconder") { coach.hidden = true; limparDestaque(); }
    else if (b.dataset.tut === "pular") encerrar();
  });

  /* glossário: toque num termo sublinhado */
  document.addEventListener("click", ev => {
    const t = ev.target.closest("[data-termo]");
    if (!t) { if (!ev.target.closest("#termo-pop")) pop.hidden = true; return; }
    ev.preventDefault(); ev.stopPropagation();
    const x = TERMOS[t.dataset.termo]; if (!x) return;
    pop.innerHTML = `<b>${esc(x.t)}</b><p>${esc(x.d)}</p>`;
    pop.hidden = false;
    const r = t.getBoundingClientRect(), W = window.innerWidth, H = window.innerHeight;
    const w = Math.min(320, W - 24);
    pop.style.width = w + "px";
    pop.style.left = Math.max(12, Math.min(W - w - 12, r.left + r.width / 2 - w / 2)) + "px";
    const abaixo = r.bottom + 10 + 160 < H;
    pop.style.top = abaixo ? (r.bottom + 8) + "px" : "auto";
    pop.style.bottom = abaixo ? "auto" : (H - r.top + 8) + "px";
  }, true);

  return {
    usar(x) { e = x; coach.hidden = true; limparDestaque(); },
    comecar(ativo) { st().ativo = ativo; st().passo = 0; if (ativo) mostrar(); },
    retomar() { if (st().ativo) mostrar(); },
    ativo: () => !!(e && st().ativo),
    passoId: () => (e && st().ativo && passo() ? passo().id : null),
    /* no 1º ano guiado, cada aba aparece quando a Marta chega nela */
    bloqueadas: () => {
      if (!e || !st().ativo || e.fase === "promessas") return [];
      return Object.entries(ABA_PASSO).filter(([, id]) => st().passo < PASSOS.findIndex(p => p.id === id)).map(([a]) => a);
    },
    /* avisos vindos da interface */
    notificar(ev) {
      if (!e) return;
      const s = st();
      if (!s.ativo) return;
      const p = passo(); if (!p) return;
      if (p.espera === "posse" && ev === "posse") avancar();
      else if (p.espera === "abrir-promessas" && ev === "abrir-promessas") avancar();
      else if (p.id === "promessas" && ev === "voltar") { s.passo--; mostrar(); }
      else if (p.espera === "eventos" && ev === "evento" && !eventosPendentes(e).length) avancar();
      else if (p.espera === "carta" && ev === "carta") avancar();
      else if (p.espera === "balanco" && ev === "balanco") avancar();
      else requestAnimationFrame(destacar);
    },
    aposRender() { requestAnimationFrame(destacar); },
    dicaAba(aba) {
      if (!e || st().ativo || !DICAS[aba] || st().vistos.includes(aba)) return;
      st().vistos.push(aba);
      ui.salvar();
      balao(DICAS[aba], `<button type="button" class="btn" data-tut="ok">Entendi</button>`);
      alvoDica = document.querySelector("#gov-body");
      requestAnimationFrame(() => posicionar(alvoDica));
    },
    fecharBalao() { if (!st().ativo) coach.hidden = true; },
    preencherModal
  };
}
