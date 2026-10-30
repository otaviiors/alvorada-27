/* Alvorada 27 — regras do modo Governar (versão 1, enxuta).
   Tudo que é número de calibragem mora aqui, para ser ajustado depois de testar.
   Os efeitos vêm de um modelo simplificado; ver docs/calibragem.md. */

export const REGIOES = ["Norte", "Nordeste", "Sudeste", "Sul", "Centro-Oeste"];

/* Dinheiro para projetos novos por ano (R$ bi). Das discricionárias do Executivo
   (R$ 213,7 bi no PLOA 2027), a maior parte mantém os ministérios funcionando.
   Simplificação do jogo: R$ 70 bi/ano ficam para projetos novos. */
export const ORCAMENTO = { livre: 213.7, custeio: 143.7, projetos: 70 };

export const AREAS = {
  saude:       { nome: "Saúde",                cor: "#d0613a", ministro: "saude" },
  educacao:    { nome: "Educação",             cor: "#3f6ea0", ministro: "educacao" },
  infra:       { nome: "Infraestrutura",       cor: "#8a7f74", ministro: "infra" },
  seguranca:   { nome: "Segurança",            cor: "#4b4e8a", ministro: "seguranca" },
  ambiente:    { nome: "Meio ambiente",        cor: "#2f7d4f", ministro: "ambiente" },
  economia:    { nome: "Economia e emprego",   cor: "#c2953b", ministro: "economia" },
  assistencia: { nome: "Assistência social",   cor: "#b9475a", ministro: "assistencia" }
};

export const TIPOS = {
  construir:  { nome: "Construir",            ajuda: "Obra. Demora para ficar pronta, o efeito dura e deixa custo de manutenção." },
  contratar:  { nome: "Contratar e manter",   ajuda: "Serviço contínuo. Começa a valer no ano seguinte e passa a custar todo ano." },
  transferir: { nome: "Transferir",           ajuda: "Dinheiro direto às pessoas ou aos estados. Efeito rápido, mas só naquele ano." },
  regular:    { nome: "Regular e fiscalizar", ajuda: "Lei ou regra. Barato, mas precisa passar no Congresso." }
};

export const TAMANHOS = {
  pequeno: { nome: "Pequeno", custo: { construir: 1.5, contratar: 1, transferir: 2, regular: 0.2 } },
  medio:   { nome: "Médio",   custo: { construir: 5,   contratar: 3, transferir: 6, regular: 0.5 } },
  grande:  { nome: "Grande",  custo: { construir: 12,  contratar: 6, transferir: 15, regular: 1 } }
};
export const ESCALA = { pequeno: 1, medio: 1, grande: 1 };   // o efeito já sai do custo

/* Prazo (anos até o efeito) e manutenção anual (fração do custo) */
export const PRAZO = { construir: { pequeno: 1, medio: 1, grande: 2 }, contratar: 1, transferir: 0, regular: 1 };
export const MANUTENCAO = { construir: 0.06, contratar: 1, transferir: 0, regular: 0 };
/* Regras valem como se custassem este múltiplo (são baratas, mas mexem em muita coisa) */
export const PESO_REGRA = 12;

/* Nome de cada projeto por área e tipo */
export const NOMES = {
  saude:       { construir: "Hospitais regionais e UBS",        contratar: "Médicos e equipes de saúde da família", transferir: "Repasse extra para a saúde dos estados", regular: "Mutirão de cirurgias e regras de fila única" },
  educacao:    { construir: "Creches e escolas",                contratar: "Professores e ensino integral",          transferir: "Bolsa para alunos do ensino médio",       regular: "Metas de alfabetização na idade certa" },
  infra:       { construir: "Estradas, ferrovias e portos",     contratar: "Manutenção de rodovias federais",        transferir: "Saneamento com os estados",               regular: "Concessões à iniciativa privada" },
  seguranca:   { construir: "Presídios e centros integrados",   contratar: "Reforço da Polícia Federal e da PRF",    transferir: "Fundo de segurança para os estados",      regular: "Lei contra o crime organizado" },
  ambiente:    { construir: "Obras contra enchentes e secas",   contratar: "Fiscais ambientais e brigadistas",       transferir: "Pagamento por floresta em pé",            regular: "Regras contra o desmatamento ilegal" },
  economia:    { construir: "Polos industriais e de tecnologia", contratar: "Qualificação profissional",             transferir: "Crédito barato para pequenas empresas",   regular: "Simplificação de impostos e burocracia" },
  assistencia: { construir: "Cozinhas e centros sociais",       contratar: "Equipes de assistência social (CRAS)",   transferir: "Aumento do Bolsa Família",                regular: "Revisão do Cadastro Único" }
};
export const NOME_NACIONAL = { ambiente: { contratar: "Ciência e monitoramento (clima, desastres, florestas)" } };

/* Efeito por R$ 100 por habitante da região, antes da necessidade e do retorno decrescente.
   idh: pontos de IDHM | des: pontos de desemprego | mvi: % das mortes violentas
   dsm: % do desmatamento | apr: pontos de aprovação (já ponderados pela população)
   g: pontos de crescimento do PIB por R$ 10 bi | res: resiliência a desastres */
export const EFEITOS = {
  saude:       { idh: 0.0045, apr: 0.7, des: -0.04 },
  educacao:    { idh: 0.0045, apr: 0.35, g: 0.03 },
  infra:       { g: 0.16, des: -0.35, apr: 0.5, dsm: 4, res: 0.3 },
  seguranca:   { mvi: -4, apr: 0.5 },
  ambiente:    { dsm: -15, res: 0.8, g: -0.01, apr: 0.1 },
  economia:    { des: -0.45, g: 0.09, idh: 0.001, apr: 0.35 },
  assistencia: { idh: 0.0035, apr: 1.0, des: -0.05 }
};
/* Ajustes por tipo: multiplicadores sobre EFEITOS */
export const TIPO_MULT = {
  construir:  { idh: 1, des: 0.7, apr: 0.8, g: 1, mvi: 0.8, dsm: 1, res: 1.4 },
  contratar:  { idh: 1.1, des: 0.8, apr: 0.9, g: 0.6, mvi: 1.2, dsm: 1.3, res: 0.8 },
  transferir: { idh: 0.7, des: 0.6, apr: 1.6, g: 0.5, mvi: 0.5, dsm: 0.8, res: 0.3 },
  regular:    { idh: 0.6, des: 0.6, apr: -0.2, g: 1.2, mvi: 1.0, dsm: 1.2, res: 0.2 }
};
/* Quanto do efeito de cada tipo some no ano seguinte (transferência é só no ano) */
export const TEMPORARIO = { transferir: true };
/* Obras de infraestrutura e polos industriais no Norte e no Centro-Oeste pressionam a floresta */
export const PRESSAO_FLORESTA = { infra: 1, economia: 0.6 };
export const REGIOES_FLORESTA = ["Norte", "Centro-Oeste", "Nordeste"];

/* Retorno decrescente: o efeito cai pela metade quando a região já recebeu
   este valor por habitante na mesma área */
export const MEIA_VIDA = 260;

/* Tendências sem o jogador (por ano) */
export const TENDENCIA = {
  crescimento: 1.8,     // Focus 2026
  idh: 0.003,           // IDHM subiu cerca de 0,003 a 0,004 por ano na série recente
  mvi: -0.025,          // queda recente das mortes violentas
  dividaJuros: 1.6,     // dívida sobe por causa dos juros, mesmo sem gasto novo
  desgaste: 1.5,        // aprovação cai com o tempo de governo
  freioGasto: 0.04      // cada R$ 10 bi gastos além do orçamento tiram este tanto do crescimento do ano seguinte (juros, inflação)
};

/* Votações: chance de aprovar = logística em torno de um limiar de apoio */
export const VOTACAO = { grande: 42, regular: 48, extra: 55, inclinacao: 9 };

/* Promessas de campanha (o jogador escolhe 3) */
export const PROMESSAS = [
  { id: "emprego",    texto: "Desemprego abaixo de 5%",                     medir: f => f.nac.desemprego, meta: v => v < 5,     alvo: "< 5,0%" },
  { id: "crescer",    texto: "Crescimento médio de 2,5% ao ano",            medir: f => f.mediaCrescimento, meta: v => v >= 2.5, alvo: "≥ 2,5%" },
  { id: "nordeste",   texto: "Cortar 1,5 ponto do desemprego no Nordeste",  medir: f => f.ini.reg.Nordeste.desemprego - f.reg.Nordeste.desemprego, meta: v => v >= 1.5, alvo: "−1,5 ponto" },
  { id: "idh",        texto: "IDHM do Brasil em 0,825",                     medir: f => f.nac.idhm, meta: v => v >= 0.825, alvo: "≥ 0,825" },
  { id: "norte",      texto: "Subir 0,025 no IDHM do Norte",                medir: f => f.reg.Norte.idhm - f.ini.reg.Norte.idhm, meta: v => v >= 0.025, alvo: "+0,025" },
  { id: "violencia",  texto: "Reduzir as mortes violentas em 20%",          medir: f => 1 - f.nac.mvi / f.ini.nac.mvi, meta: v => v >= 0.2, alvo: "−20%" },
  { id: "floresta",   texto: "Cortar o desmatamento pela metade",           medir: f => 1 - f.nac.desmatamento / f.ini.nac.desmatamento, meta: v => v >= 0.5, alvo: "−50%" },
  { id: "divida",     texto: "Dívida abaixo de 88% do PIB",                 medir: f => f.nac.divida, meta: v => v < 88, alvo: "< 88%" },
  { id: "popular",    texto: "Terminar com aprovação acima de 50%",         medir: f => f.nac.aprovacao, meta: v => v > 50, alvo: "> 50%" }
];

/* Promessas montadas pelo jogador: tema + onde + ambição.
   id: "m:<tema>:<onde>:<nível 0-2>"  (onde = "Brasil" ou uma região) */
const _nf = (v, d = 1) => new Intl.NumberFormat("pt-BR", { minimumFractionDigits: d, maximumFractionDigits: d }).format(v);
const _gente = n => n >= 1e6 ? _nf(n / 1e6, 1) + (n >= 2e6 ? " milhões" : " milhão") : n >= 1000 ? _nf(Math.round(n / 1000), 0) + " mil" : _nf(Math.round(n), 0);
const _no = onde => onde === "Brasil" ? "no Brasil" : "no " + onde;
const _FT = 110e6;   // força de trabalho (PNAD Contínua)
export const AMBICAO = ["Pé no chão", "Ousada", "Muito ousada"];
export const TEMAS_PROMESSA = {
  desemprego: { nome: "Emprego", onde: ["Brasil", ...REGIOES], niveis: [0.5, 1, 1.5],
    texto: (x, o) => `Tirar ${_nf(x, x % 1 ? 1 : 0)} ponto${x >= 2 ? "s" : ""} do desemprego ${_no(o)}`, alvo: x => `−${_nf(x, x % 1 ? 1 : 0)} ponto`,
    medir: (f, o) => o === "Brasil" ? f.ini.nac.desemprego - f.nac.desemprego : f.ini.reg[o].desemprego - f.reg[o].desemprego,
    fmt: v => `${v >= 0 ? "−" : "+"}${_nf(Math.abs(v))} ponto`,
    gente: (x, o, ini) => `≈ ${_gente(x / 100 * _FT * popDe(ini, o) / popDe(ini, "Brasil"))} pessoas a mais trabalhando` },
  idhm: { nome: "Qualidade de vida (IDHM)", onde: ["Brasil", ...REGIOES], niveis: [0.01, 0.018, 0.025],
    texto: (x, o) => `Subir ${_nf(x, 3)} no IDHM ${o === "Brasil" ? "do Brasil" : "do " + o}`, alvo: x => `+${_nf(x, 3)}`,
    medir: (f, o) => o === "Brasil" ? f.nac.idhm - f.ini.nac.idhm : f.reg[o].idhm - f.ini.reg[o].idhm,
    fmt: v => `${v >= 0 ? "+" : "−"}${_nf(Math.abs(v), 3)}`,
    gente: (x, o, ini) => `mais saúde, estudo e renda para ${_gente(popDe(ini, o))} de pessoas` },
  mvi: { nome: "Segurança", onde: ["Brasil", ...REGIOES], niveis: [0.1, 0.2, 0.3],
    texto: (x, o) => `Reduzir as mortes violentas ${_no(o)} em ${_nf(x * 100, 0)}%`, alvo: x => `−${_nf(x * 100, 0)}%`,
    medir: (f, o) => o === "Brasil" ? 1 - f.nac.mvi / f.ini.nac.mvi : 1 - f.reg[o].mvi / f.ini.reg[o].mvi,
    fmt: v => `${v >= 0 ? "−" : "+"}${_nf(Math.abs(v) * 100, 0)}%`,
    gente: (x, o, ini) => { const m = o === "Brasil" ? ini.nac.mvi : ini.reg[o].mvi; return `≈ ${_gente(x * m * popDe(ini, o) / 1e5)} vidas salvas por ano`; } },
  desmatamento: { nome: "Floresta", onde: ["Brasil", "Norte", "Centro-Oeste", "Nordeste"], niveis: [0.25, 0.45, 0.65],
    texto: (x, o) => `Cortar o desmatamento ${_no(o)} em ${_nf(x * 100, 0)}%`, alvo: x => `−${_nf(x * 100, 0)}%`,
    medir: (f, o) => o === "Brasil" ? 1 - f.nac.desmatamento / f.ini.nac.desmatamento : 1 - f.reg[o].desmatamento / f.ini.reg[o].desmatamento,
    fmt: v => `${v >= 0 ? "−" : "+"}${_nf(Math.abs(v) * 100, 0)}%`,
    gente: (x, o, ini) => { const k = o === "Brasil" ? ini.nac.desmatamento : ini.reg[o].desmatamento; return `≈ ${_gente(x * k * 140)} campos de futebol de floresta a menos derrubados por ano`; } },
  crescimento: { nome: "Economia", onde: ["Brasil"], niveis: [2, 2.3, 2.6],
    texto: x => `Crescimento médio de ${_nf(x)}% ao ano`, alvo: x => `≥ ${_nf(x)}%`,
    medir: f => f.mediaCrescimento, fmt: v => _nf(v) + "%", cmp: "valor",
    gente: (x, o, ini) => `≈ R$ ${_nf(((1 + x / 100) ** 4 - 1) * (ini.nac.pib_trilhoes || 12.7) * 1e12 / popDe(ini, "Brasil"), 0)} a mais de renda por habitante em 4 anos` },
  divida: { nome: "Contas públicas", onde: ["Brasil"], niveis: [90, 88, 85],
    texto: x => `Terminar com a dívida abaixo de ${_nf(x, 0)}% do PIB`, alvo: x => `< ${_nf(x, 0)}%`,
    medir: f => f.nac.divida, fmt: v => _nf(v) + "%", cmp: "abaixo",
    gente: (x, o, ini) => `≈ R$ ${_nf(Math.round(x / 100 * (ini.nac.pib_trilhoes || 12.7) * 1e12 / popDe(ini, "Brasil") / 1000), 0)} mil de dívida por habitante, no máximo` },
  aprovacao: { nome: "Aprovação", onde: ["Brasil"], niveis: [45, 55, 65],
    texto: x => `Terminar com mais de ${_nf(x, 0)}% de aprovação`, alvo: x => `> ${_nf(x, 0)}%`,
    medir: f => f.nac.aprovacao, fmt: v => Math.round(v) + "%", cmp: "valor",
    gente: x => `≈ ${_gente(x / 100 * 156e6)} de eleitores satisfeitos` }
};
function popDe(ini, o) {
  const R = Object.keys(ini.reg);
  return o === "Brasil" ? R.reduce((s, r) => s + ini.reg[r].populacao, 0) : ini.reg[o].populacao;
}

/* Promessas prontas: formato do resultado e tradução em gente */
const FMT_PRONTA = {
  emprego: v => _nf(v) + "%", crescer: v => _nf(v) + "%", divida: v => _nf(v) + "%", popular: v => Math.round(v) + "%",
  idh: v => _nf(v, 3), norte: v => `${v >= 0 ? "+" : "−"}${_nf(Math.abs(v), 3)}`,
  nordeste: v => `${v >= 0 ? "−" : "+"}${_nf(Math.abs(v))} ponto`,
  violencia: v => `${v >= 0 ? "−" : "+"}${_nf(Math.abs(v) * 100, 0)}%`, floresta: v => `${v >= 0 ? "−" : "+"}${_nf(Math.abs(v) * 100, 0)}%`
};
const GENTE_PRONTA = {
  emprego: ini => `≈ ${_gente((ini.nac.desemprego - 5) / 100 * _FT)} pessoas a mais trabalhando`,
  crescer: () => "a economia cresce mais rápido que a média dos últimos anos (1,8%)",
  nordeste: ini => `≈ ${_gente(0.015 * _FT * popDe(ini, "Nordeste") / popDe(ini, "Brasil"))} nordestinos a mais trabalhando`,
  idh: ini => `mais saúde, estudo e renda para ${_gente(popDe(ini, "Brasil"))} de pessoas`,
  norte: ini => `mais saúde, estudo e renda para ${_gente(popDe(ini, "Norte"))} de pessoas`,
  violencia: ini => `≈ ${_gente(0.2 * ini.nac.mvi * popDe(ini, "Brasil") / 1e5)} vidas salvas por ano`,
  floresta: ini => `≈ ${_gente(0.5 * ini.nac.desmatamento * 140)} campos de futebol de floresta a menos derrubados por ano`,
  divida: ini => `≈ R$ ${_nf(Math.round(0.88 * (ini.nac.pib_trilhoes || 12.7) * 1e12 / popDe(ini, "Brasil") / 1000), 0)} mil de dívida por habitante, no máximo`,
  popular: () => `≈ ${_gente(0.5 * 156e6)} de eleitores satisfeitos`
};

/* Qualquer promessa (pronta ou montada) a partir do id. ini: e.ini (números do começo) */
export function promessaDe(id, ini) {
  const pr = PROMESSAS.find(p => p.id === id);
  if (pr) return { ...pr, fmt: FMT_PRONTA[id], gente: ini ? GENTE_PRONTA[id](ini) : "", montada: false };
  const m = /^m:([a-z]+):([A-Za-z\u00C0-\u00FF-]+):([0-2])$/.exec(id || "");
  if (!m) return null;
  const T = TEMAS_PROMESSA[m[1]], o = m[2], n = +m[3];
  if (!T || !T.onde.includes(o)) return null;
  const x = T.niveis[n];
  const meta = T.cmp === "abaixo" ? v => v < x : v => v >= x;
  return { id, texto: T.texto(x, o), alvo: T.alvo(x), medir: f => T.medir(f, o), meta, fmt: T.fmt,
    gente: ini ? T.gente(x, o, ini) : "", montada: true, tema: m[1], onde: o, nivel: n, ambicao: AMBICAO[n] };
}

/* Personagens fictícios */
export const MINISTROS = {
  saude:       { nome: "Helena Bastos",      cargo: "Ministra da Saúde",               jeito: "Pensa primeiro em quem está na fila do SUS." },
  educacao:    { nome: "Raimundo Teixeira",  cargo: "Ministro da Educação",            jeito: "Lembra que educação demora, mas é o que mais dura." },
  infra:       { nome: "Válter Rocha",       cargo: "Ministro da Infraestrutura",      jeito: "Sempre quer uma obra grande." },
  seguranca:   { nome: "Simone Araújo",      cargo: "Ministra da Justiça e Segurança", jeito: "Repete que segurança é dos estados, mas cobra integração." },
  ambiente:    { nome: "Iara Matos",         cargo: "Ministra do Meio Ambiente",       jeito: "Avisa que desmatar hoje cobra caro amanhã." },
  economia:    { nome: "Beatriz Lemos",      cargo: "Ministra da Fazenda",             jeito: "Sempre alerta para as contas públicas." },
  assistencia: { nome: "Joaquim Nascimento", cargo: "Ministro do Desenvolvimento Social", jeito: "Defende que ninguém fique para trás." }
};
export const CAMARA = { nome: "Aurélio Marçal", cargo: "Presidente da Câmara" };
export const GOVERNADORES = {
  "Norte":        { nome: "Luana Barros",     cargo: "Governadora (Norte)" },
  "Nordeste":     { nome: "Davi Albuquerque", cargo: "Governador (Nordeste)" },
  "Sudeste":      { nome: "Paula Siqueira",   cargo: "Governadora (Sudeste)" },
  "Sul":          { nome: "Henrique Kessler", cargo: "Governador (Sul)" },
  "Centro-Oeste": { nome: "Rogério Almada",   cargo: "Governador (Centro-Oeste)" }
};

/* Negociação com o Congresso */
export const NEGOCIACOES = {
  emendas:   { nome: "Liberar emendas extras",  custo: 8,  apoio: 9,  ajuda: "Parlamentares levam obras para suas bases." },
  ministerio:{ nome: "Ceder um ministério",     custo: 0,  apoio: 14, ajuda: "A área cedida rende 20% menos até o fim do mandato." },
  conversa:  { nome: "Rodada de conversas",     custo: 0,  apoio: 3,  ajuda: "Ajuda pouco, mas não custa nada. Uma vez por ano." }
};

/* Eventos. sev: 1 moderado, 2 forte, 3 muito forte.
   aviso: "sempre" | "as vezes" | "nunca" */
export const EVENTOS = [
  { id: "seca", nome: "Seca prolongada", tipo: "clima", regiao: "Nordeste", chance: 0.30, aviso: "sempre", causa: "El Niño",
    dano: { des: 0.5, idh: -0.002, apr: -2, g: -0.15 }, desastre: true, maisCom: { dsm: 0.4 },
    respostas: [
      { id: "amplo", texto: "Operação de emergência com carros-pipa, cisternas e auxílio", custo: 9, extra: true, alivio: 0.75, apr: 3 },
      { id: "dentro", texto: "Socorro dentro do orçamento, cortando projetos", custo: 4, alivio: 0.45, apr: 1 },
      { id: "estado", texto: "Deixar com os governos estaduais", custo: 0, alivio: 0.1, apr: -3, governador: -8 } ] },
  { id: "enchente", nome: "Enchente", tipo: "clima", regiao: "Sul", chance: 0.25, aviso: "sempre", causa: "El Niño",
    dano: { des: 0.6, idh: -0.003, apr: -2, g: -0.2 }, desastre: true,
    respostas: [
      { id: "amplo", texto: "Socorro amplo: reconstrução e auxílio às famílias", custo: 14, extra: true, alivio: 0.75, apr: 4 },
      { id: "dentro", texto: "Socorro dentro do orçamento, cortando projetos", custo: 6, alivio: 0.45, apr: 1 },
      { id: "estado", texto: "Repassar o problema ao estado", custo: 0, alivio: 0.1, apr: -4, governador: -10 } ] },
  { id: "queimadas", nome: "Temporada de queimadas", tipo: "clima", regiao: "Norte", chance: 0.30, aviso: "sempre", causa: "seca na Amazônia",
    dano: { dsm: 18, idh: -0.001, apr: -1.5 }, desastre: true, maisCom: { dsm: 1.2 },
    respostas: [
      { id: "amplo", texto: "Força-tarefa com brigadistas, aviões e Forças Armadas", custo: 3, extra: true, alivio: 0.75, apr: 2 },
      { id: "dentro", texto: "Reforço dentro do orçamento", custo: 1.5, alivio: 0.45, apr: 0 },
      { id: "estado", texto: "Deixar com os estados", custo: 0, alivio: 0.1, apr: -2, governador: -5 } ] },
  { id: "commodities", nome: "Queda no preço da soja e do minério", tipo: "economia", regiao: "Centro-Oeste", chance: 0.25, aviso: "sempre", causa: "desaceleração da China",
    dano: { g: -0.5, des: 0.4, apr: -2 }, nacionalG: true,
    respostas: [
      { id: "credito", texto: "Linha de crédito de emergência para produtores", custo: 6, extra: true, alivio: 0.6, apr: 1 },
      { id: "esperar", texto: "Esperar o mercado se ajustar", custo: 0, alivio: 0, apr: -1 } ] },
  { id: "crise", nome: "Crise financeira internacional", tipo: "economia", regiao: null, chance: 0.12, aviso: "sempre", causa: "juros altos nos EUA",
    dano: { g: -0.9, des: 0.6, apr: -3 }, nacionalG: true, pioraComDivida: true,
    respostas: [
      { id: "estimulo", texto: "Pacote de estímulo com obras e crédito", custo: 25, extra: true, alivio: 0.6, apr: 2 },
      { id: "ajuste", texto: "Cortar gastos para acalmar o mercado", custo: -10, alivio: 0.2, apr: -4, divida: -0.6 },
      { id: "esperar", texto: "Esperar passar", custo: 0, alivio: 0, apr: -1 } ] },
  { id: "petroleo", nome: "Petróleo em alta", tipo: "economia", regiao: "Sudeste", chance: 0.18, aviso: "as vezes", causa: "conflito no exterior",
    dano: { g: -0.2, apr: -2, des: 0.1 }, nacionalG: true,
    respostas: [
      { id: "subsidio", texto: "Segurar o preço do diesel com subsídio", custo: 10, extra: true, alivio: 0.7, apr: 2 },
      { id: "repassar", texto: "Repassar o aumento", custo: 0, alivio: 0, apr: -2 } ] },
  { id: "dengue", nome: "Epidemia de dengue", tipo: "saude", regiao: "Sudeste", chance: 0.30, aviso: "as vezes", causa: "verão quente e chuvoso",
    dano: { idh: -0.002, apr: -2 }, prevencao: "saude",
    respostas: [
      { id: "amplo", texto: "Mutirão nacional: vacina, agentes e hospitais de campanha", custo: 4, extra: true, alivio: 0.7, apr: 2 },
      { id: "dentro", texto: "Campanha dentro do orçamento", custo: 1.5, alivio: 0.4, apr: 0 },
      { id: "estado", texto: "Deixar com estados e municípios", custo: 0, alivio: 0.1, apr: -2 } ] },
  { id: "greve", nome: "Greve dos caminhoneiros", tipo: "sociedade", regiao: null, chance: 0.12, aviso: "nunca",
    dano: { g: -0.3, apr: -3 }, nacionalG: true,
    respostas: [
      { id: "ceder", texto: "Ceder: desconto no diesel e frete mínimo", custo: 6, extra: true, alivio: 0.8, apr: 1 },
      { id: "negociar", texto: "Negociar devagar", custo: 1, alivio: 0.4, apr: -1 },
      { id: "endurecer", texto: "Endurecer e liberar as estradas com a polícia", custo: 0, alivio: 0.6, apr: -3 } ] },
  { id: "presidios", nome: "Crise nos presídios", tipo: "sociedade", regiao: "Nordeste", chance: 0.15, aviso: "nunca",
    dano: { mvi: 6, apr: -2 }, prevencao: "seguranca",
    respostas: [
      { id: "federal", texto: "Mandar a Força Nacional e transferir líderes de facções", custo: 2, extra: true, alivio: 0.7, apr: 1 },
      { id: "estado", texto: "Deixar com o estado", custo: 0, alivio: 0.1, apr: -2, governador: -5 } ] },
  { id: "escandalo", nome: "Escândalo num ministério", tipo: "politica", regiao: null, chance: 0.18, aviso: "nunca",
    dano: { apr: -5, congresso: -6 },
    respostas: [
      { id: "demitir", texto: "Demitir o ministro e abrir investigação", custo: 0, alivio: 0.6, apr: 2, congresso: -3 },
      { id: "defender", texto: "Defender o ministro", custo: 0, alivio: 0, apr: -3, congresso: 3 } ] },
  { id: "travamento", nome: "Congresso trava a pauta", tipo: "politica", regiao: null, chance: 0.18, aviso: "nunca", soSeApoioBaixo: 45,
    dano: { congresso: -8, apr: -1 },
    respostas: [
      { id: "emendas", texto: "Liberar emendas para destravar", custo: 6, extra: true, alivio: 0.8, apr: -1 },
      { id: "povo", texto: "Ir à TV e pressionar pelo apoio popular", custo: 0, alivio: 0.4, apr: 1 } ] },
  { id: "safra", nome: "Safra recorde", tipo: "oportunidade", regiao: "Centro-Oeste", chance: 0.25, aviso: "sempre", causa: "clima favorável",
    dano: { g: 0.4, des: -0.3, apr: 1 }, nacionalG: true, bom: true,
    respostas: [
      { id: "guardar", texto: "Aproveitar a arrecadação extra para reduzir a dívida", custo: -8, alivio: 1, divida: -0.5 },
      { id: "investir", texto: "Usar a arrecadação extra em projetos", custo: -8, alivio: 1, caixa: 8 } ] },
  { id: "investimento", nome: "Onda de investimento estrangeiro", tipo: "oportunidade", regiao: "Nordeste", chance: 0.15, aviso: "as vezes", causa: "transição energética",
    dano: { g: 0.3, des: -0.4, apr: 1 }, bom: true, nacionalG: true,
    respostas: [
      { id: "aceitar", texto: "Facilitar licenças e infraestrutura para receber", custo: 2, alivio: 1.3, dsm: 4 },
      { id: "exigir", texto: "Exigir contrapartidas sociais e ambientais", custo: 0, alivio: 0.8, apr: 1 } ] }
];
