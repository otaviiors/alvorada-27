/* Alvorada 27 — o povo: grupos da sociedade, cidadãos de cada região e o jornal.
   Tudo fictício. Nenhum grupo, cidadão ou manchete se refere a pessoas, partidos ou veículos reais. */

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const nf = (v, d = 1) => new Intl.NumberFormat("pt-BR", { minimumFractionDigits: d, maximumFractionDigits: d }).format(v);
const FORCA_TRABALHO = 110e6;
export const ELEITORES = 156e6;   // eleitorado apto (TSE, 2024: 155,9 milhões)
const gente = n => n >= 1e6 ? nf(n / 1e6, 1) + (n >= 2e6 ? " milhões" : " milhão") : n >= 1000 ? nf(Math.round(n / 1000), 0) + " mil" : nf(Math.round(n), 0);

/* ---------- grupos da sociedade ----------
   peso: parte do eleitorado (simplificação do jogo)
   comp: quanto cada coisa pesa para o grupo (1 = como a média do país)
   pref: quanto o grupo gosta de projetos de cada área */
export const GRUPOS = {
  trabalhadores: { nome: "Trabalhadores", peso: 0.22, cor: "#c2953b",
    resumo: "Querem emprego e salário.",
    comp: { cres: 1.2, des: 1.6, idh: 0.8, mvi: 0.8, dsm: 0, div: 0, extra: 0.8 },
    pref: { economia: 1.6, infra: 1.3, saude: 1, educacao: 0.9, assistencia: 0.7, seguranca: 1, ambiente: 0.6 } },
  baixaRenda: { nome: "Famílias de baixa renda", peso: 0.2, cor: "#b9475a",
    resumo: "Querem renda, saúde e escola.",
    comp: { cres: 0.6, des: 1.2, idh: 1.6, mvi: 0.8, dsm: 0, div: 0, extra: 1.2 },
    pref: { assistencia: 2, saude: 1.5, educacao: 1.2, economia: 1, infra: 0.8, seguranca: 0.8, ambiente: 0.5 } },
  jovens: { nome: "Jovens e estudantes", peso: 0.14, cor: "#3f6ea0",
    resumo: "Querem estudo, primeiro emprego e futuro.",
    comp: { cres: 0.8, des: 1.3, idh: 1, mvi: 0.8, dsm: 1, div: 0, extra: 0.6 },
    pref: { educacao: 1.8, economia: 1.3, ambiente: 1.4, saude: 0.9, assistencia: 0.8, seguranca: 0.8, infra: 0.8 } },
  aposentados: { nome: "Aposentados", peso: 0.14, cor: "#8a7f74",
    resumo: "Querem saúde, segurança e preço estável.",
    comp: { cres: 0.6, des: 0.4, idh: 1, mvi: 1.2, dsm: 0.2, div: 0.6, extra: 1.4 },
    pref: { saude: 2, seguranca: 1.3, assistencia: 1, educacao: 0.6, infra: 0.8, economia: 0.7, ambiente: 0.6 } },
  cidades: { nome: "Moradores das grandes cidades", peso: 0.14, cor: "#4b4e8a",
    resumo: "Querem segurança, transporte e saúde.",
    comp: { cres: 1, des: 1, idh: 0.8, mvi: 1.8, dsm: 0.3, div: 0.2, extra: 1 },
    pref: { seguranca: 1.8, saude: 1.2, infra: 1.2, educacao: 1, economia: 1, assistencia: 0.7, ambiente: 0.8 } },
  agricultores: { nome: "Agricultores e agronegócio", peso: 0.06, cor: "#6a9a2f",
    resumo: "Querem estrada, crédito e menos burocracia.",
    comp: { cres: 1.6, des: 0.6, idh: 0.6, mvi: 0.6, dsm: -0.6, div: 0.4, extra: 0.8 },
    pref: { infra: 2, economia: 1.4, seguranca: 0.9, saude: 0.8, educacao: 0.6, assistencia: 0.4, ambiente: -0.8 } },
  empresarios: { nome: "Empresários", peso: 0.05, cor: "#3b8a5a",
    resumo: "Querem crescimento e contas em ordem.",
    comp: { cres: 2.2, des: 0.6, idh: 0.4, mvi: 0.8, dsm: -0.3, div: 1.6, extra: 2 },
    pref: { economia: 2, infra: 1.6, seguranca: 1, educacao: 0.8, saude: 0.6, assistencia: 0.2, ambiente: 0.3 } },
  ambientalistas: { nome: "Ambientalistas", peso: 0.05, cor: "#2f7d4f",
    resumo: "Querem floresta em pé e prevenção de desastres.",
    comp: { cres: 0.3, des: 0.4, idh: 0.8, mvi: 0.5, dsm: 3, div: 0, extra: 0.3 },
    pref: { ambiente: 3, educacao: 1, saude: 0.8, assistencia: 0.8, seguranca: 0.5, economia: 0.3, infra: -0.5 } }
};

/* Ajustes por tipo de projeto em alguns grupos */
function prefDe(g, p) {
  let v = GRUPOS[g].pref[p.area] ?? 1;
  if (g === "agricultores" && p.area === "ambiente" && p.tipo === "regular") v = -2;
  if (g === "empresarios" && p.area === "economia" && p.tipo === "regular") v = 2.5;
  if (g === "ambientalistas" && p.area === "infra" && p.tipo === "construir" && ["Norte", "Centro-Oeste"].includes(p.regiao)) v = -1.5;
  if (g === "baixaRenda" && p.tipo === "transferir") v *= 1.3;
  return v;
}

/* Quem gosta e quem não gosta de um projeto (para mostrar no cartão) */
export function quemGosta(p) {
  const agrada = [], desagrada = [];
  for (const g of Object.keys(GRUPOS)) {
    const v = prefDe(g, p);
    if (v >= 1.5) agrada.push(GRUPOS[g].nome);
    else if (v <= 0.3) desagrada.push(GRUPOS[g].nome);
  }
  return { agrada, desagrada };
}

/* Áreas de que o grupo mais gosta e as que ele vê com desconfiança */
export function gostosDoGrupo(g) {
  const pref = Object.entries(GRUPOS[g].pref).sort((a, b) => b[1] - a[1]);
  return { gosta: pref.filter(([, v]) => v >= 1.5).map(([a]) => a), torce: pref.filter(([, v]) => v <= 0.3).map(([a]) => a) };
}

export function iniciarPovo(e, aprovacao) {
  e.grupos = {};
  for (const g of Object.keys(GRUPOS)) e.grupos[g] = aprovacao;
  e.cidadaos = {};
  e.jornais = [];
}
export function aprovacaoGeral(e) {
  return Object.entries(GRUPOS).reduce((s, [g, x]) => s + x.peso * e.grupos[g], 0);
}

/* Atualiza a aprovação de cada grupo no fechamento do ano.
   ctx: componentes já calculados pelo motor (na escala da aprovação nacional) */
export function atualizarGrupos(e, ctx) {
  const antes = { ...e.grupos };
  for (const [g, G] of Object.entries(GRUPOS)) {
    const c = G.comp;
    let v = e.grupos[g] + 0.25 * (45 - e.grupos[g]) - ctx.desgaste;
    v += c.cres * ctx.cres + c.des * ctx.des + c.idh * ctx.idh + c.mvi * ctx.mvi + c.dsm * ctx.dsm + c.div * ctx.div + c.extra * ctx.extra;
    // cada projeto agrada ou irrita os grupos conforme a área: o efeito médio é o do motor,
    // e a diferença entre grupos cresce com o tamanho do projeto
    const visivel = p => 0.6 * Math.sqrt(p.custo * (p.tipo === "regular" ? 12 : 1));
    for (const p of ctx.prontos) v += p.efeitos.apr + (prefDe(g, p) - 1) * visivel(p);
    for (const p of ctx.anunciados) v += 0.5 * (prefDe(g, p) - 1) * visivel(p);
    v += ctx.eventos;
    e.grupos[g] = Math.round(clamp(v, 3, 92));
  }
  return Object.fromEntries(Object.keys(GRUPOS).map(g => [g, e.grupos[g] - antes[g]]));
}

/* ---------- cidadãos ---------- */
export const CIDADAOS = {
  "Norte": { nome: "Joana Ferreira", chamada: "Joana", idade: 34, oficio: "professora", cidade: "Santarém (PA)", cor: "#4f9a62",
    importa: "escola, saúde e a fumaça das queimadas",
    liga: { educacao: 2, saude: 1, ambiente: 1.5, assistencia: 0.8, des: 0.6, idh: 1.2, dsm: 1.5, mvi: 0.6 }, eventos: ["queimadas"] },
  "Nordeste": { nome: "Antônio Batista", chamada: "Seu Antônio", idade: 58, oficio: "agricultor", cidade: "Juazeiro (BA)", cor: "#e2a33f",
    importa: "chuva, renda e emprego para os filhos",
    liga: { assistencia: 1.5, infra: 1, economia: 1, saude: 0.8, des: 1.5, idh: 1, mvi: 0.8 }, eventos: ["seca", "presidios", "investimento"] },
  "Sudeste": { nome: "Camila Rocha", chamada: "Camila", idade: 27, oficio: "entregadora de aplicativo", cidade: "São Paulo (SP)", cor: "#d3784e",
    importa: "emprego, segurança e o preço da gasolina",
    liga: { economia: 1.5, seguranca: 1.5, saude: 0.8, educacao: 0.8, des: 1.8, mvi: 1.6, idh: 0.5, extra: 1 }, eventos: ["dengue", "petroleo", "greve"] },
  "Sul": { nome: "Lurdes Schneider", chamada: "Dona Lurdes", idade: 66, oficio: "aposentada", cidade: "Pelotas (RS)", cor: "#77acc9",
    importa: "saúde, segurança e as enchentes",
    liga: { saude: 2, seguranca: 1, ambiente: 1, des: 0.5, mvi: 0.8, idh: 1, extra: 1.2 }, eventos: ["enchente"] },
  "Centro-Oeste": { nome: "Rafael Moreira", chamada: "Rafael", idade: 41, oficio: "produtor de soja", cidade: "Sorriso (MT)", cor: "#c2b25a",
    importa: "estrada, frete e regras claras",
    liga: { infra: 2, economia: 1.5, ambiente: -1, des: 0.6, g: 1.5, dsm: -0.5 }, eventos: ["commodities", "safra", "crise"] }
};

/* Falas. Chave: "motivo:sinal". sinal "+" = bom para o cidadão, "-" = ruim. */
const FALAS = {
  "Norte": {
    "proj:educacao:+": "Chegaram professores novos na escola. Pela primeira vez em anos a turma não ficou sem aula de matemática.",
    "proj:saude:+": "Abriu um posto perto da escola. Os alunos estão faltando menos.",
    "proj:ambiente:+": "Vi os brigadistas passando de barco pelo rio. Parece que alguém lembrou da floresta.",
    "proj:assistencia:+": "Algumas famílias dos meus alunos estão conseguindo comprar material escolar. Faz diferença.",
    "dsm:+": "O céu de Santarém ficou azul mais tempo este ano. Menos queimada, menos aluno com tosse.",
    "dsm:-": "A fumaça voltou. Teve semana em que a gente suspendeu a aula.",
    "ev:queimadas:+": "As queimadas vieram, mas a força-tarefa chegou rápido. Foram só uns dias de fumaça.",
    "ev:queimadas:-": "As queimadas foram feias. A escola fechou três dias por causa da fumaça.",
    "idh:+": "Tem família conseguindo pagar curso para os filhos. Os alunos estão sonhando mais alto.",
    "idh:-": "Está faltando de tudo: remédio no posto, merenda na escola.",
    "des:+": "Os pais dos meus alunos estão empregados. Dá para sentir na sala de aula.",
    "des:-": "Dois pais de aluno perderam o emprego no porto. A gente sente na sala.",
    "+": "Devagarinho, as coisas estão melhorando por aqui.",
    "-": "Parece que Brasília esqueceu o Norte de novo.",
    "0": "Nada mudou muito por aqui. A gente segue."
  },
  "Nordeste": {
    "ev:seca:+": "A seca veio braba, mas o carro-pipa chegou. Deu para salvar as cabras.",
    "ev:seca:-": "A seca levou a plantação inteira. Ninguém de fora apareceu.",
    "ev:presidios:-": "A confusão no presídio assustou todo mundo. Ficamos dias sem sair de casa à noite.",
    "ev:investimento:+": "Estão montando um parque de energia perto daqui. Meu sobrinho já foi contratado.",
    "proj:assistencia:+": "O Bolsa Família aumentou um pouco. Deu para comprar semente boa.",
    "proj:infra:+": "Estão fazendo a adutora. Se ficar pronta, muda a vida aqui.",
    "proj:economia:+": "Meu filho fez um curso e arrumou serviço na fruticultura.",
    "proj:saude:+": "Chegou médico no posto. Antes tinha que ir até Petrolina.",
    "proj:educacao:+": "Minha neta vai estudar em tempo integral. Eu nem terminei o primário.",
    "des:+": "Meus dois filhos estão trabalhando. Fazia tempo que não era assim.",
    "des:-": "Meu filho mais novo foi para São Paulo procurar serviço. Aqui não tem.",
    "mvi:+": "Diminuiu a violência na cidade. Dá para ficar na calçada de novo.",
    "mvi:-": "Está perigoso andar de noite em Juazeiro. A gente se recolhe cedo.",
    "+": "O sertão é duro, mas este ano foi menos.",
    "-": "Promessa a gente já ouviu muita. Queria ver chegar.",
    "0": "Se chover, já está bom."
  },
  "Sudeste": {
    "des:+": "Tem mais gente contratando de carteira assinada. Estou pensando em mudar de área.",
    "des:-": "Cada vez mais gente fazendo entrega. A corrida está pagando menos.",
    "mvi:+": "Este ano não fui assaltada nenhuma vez. Já é uma vitória.",
    "mvi:-": "Levaram a moto de um colega na frente do restaurante. Estou com medo.",
    "proj:seguranca:+": "Vi mais polícia na rua. Não sei se resolve, mas a gente se sente melhor.",
    "proj:economia:+": "Abriu um curso gratuito de programação. Me inscrevi!",
    "proj:saude:+": "Consegui consulta no posto em uma semana. Antes era um mês.",
    "proj:educacao:+": "Voltei a estudar à noite, numa escola técnica nova.",
    "ev:dengue:-": "Peguei dengue. Fiquei dez dias sem trabalhar e sem ganhar nada.",
    "ev:dengue:+": "Teve dengue no bairro, mas o mutirão passou cedo. Escapei.",
    "ev:petroleo:-": "A gasolina subiu de novo. O que eu ganho vai todo para o tanque.",
    "ev:petroleo:+": "Seguraram o preço do combustível. Pelo menos isso.",
    "ev:greve:-": "Com a greve, faltou comida no mercado e a gasolina sumiu.",
    "extra:-": "Tudo está mais caro no mercado. O dinheiro não rende.",
    "+": "São Paulo continua corrida, mas este ano deu para respirar.",
    "-": "Trabalho doze horas por dia e não sobra nada.",
    "0": "Mais um ano na correria."
  },
  "Sul": {
    "proj:saude:+": "Consegui marcar a cirurgia de catarata. Esperei dois anos, mas saiu.",
    "proj:ambiente:+": "Estão reforçando os diques. Agora durmo mais tranquila quando chove.",
    "proj:seguranca:+": "Tem viatura passando na rua toda noite. Os vizinhos estão mais calmos.",
    "proj:assistencia:+": "Abriram um centro de convivência para idosos aqui perto. Voltei a dançar!",
    "ev:enchente:+": "A água subiu de novo, mas desta vez a ajuda veio rápido. Já voltei para casa.",
    "ev:enchente:-": "A enchente levou meus móveis. Até agora ninguém apareceu.",
    "idh:-": "A fila do posto está enorme. Remédio, só comprando.",
    "idh:+": "O posto do bairro melhorou muito. Até o dentista voltou.",
    "mvi:+": "Os netos podem brincar na praça de novo.",
    "mvi:-": "Roubaram a bolsa de uma amiga na parada de ônibus. Não saio mais sozinha.",
    "extra:-": "A aposentadoria rende cada vez menos no mercado.",
    "+": "Na minha idade, um ano tranquilo já é um presente.",
    "-": "Trabalhei a vida inteira e agora tenho que escolher entre remédio e comida.",
    "0": "Tudo igual por aqui. Chimarrão e paciência."
  },
  "Centro-Oeste": {
    "proj:infra:+": "Asfaltaram a estrada. O frete da soja caiu e a carreta não atola mais.",
    "proj:economia:+": "Saiu a linha de crédito. Comprei a plantadeira que estava esperando.",
    "proj:ambiente:-": "Agora tem fiscal toda semana. Concordo em cuidar da mata, mas a burocracia está pesada.",
    "proj:ambiente:+": "Até que a fiscalização organizou as coisas. Quem trabalha certo não tem medo.",
    "g:+": "Ano bom. Vendemos bem e contratei mais dois funcionários.",
    "g:-": "A economia travou. Segurei os investimentos na fazenda.",
    "ev:commodities:-": "A soja despencou lá fora. Este ano vai ser de aperto.",
    "ev:commodities:+": "O preço caiu, mas o crédito de emergência segurou as pontas.",
    "ev:safra:+": "Safra recorde! Os silos não deram conta.",
    "ev:crise:-": "Com a crise lá fora, o banco fechou a torneira do crédito.",
    "dsm:-": "Apertaram as regras de desmatamento. Tem vizinho que não vai poder abrir a área nova.",
    "+": "O campo está produzindo. É o Brasil que dá certo.",
    "-": "Quem produz carrega o país nas costas e ninguém lembra.",
    "0": "Ano normal. Plantar, colher, vender."
  }
};

/* Calcula como cada cidadão sentiu o ano */
export function reacoesCidadaos(e, antes, ctx) {
  const out = {};
  for (const [r, C] of Object.entries(CIDADAOS)) {
    const A = antes.reg[r], D = e.reg[r], L = C.liga;
    const contrib = [];
    const add = (chave, v) => { if (Math.abs(v) > 0.05) contrib.push([chave, v]); };
    add("des", -(D.desemprego - A.desemprego) * 6 * (L.des || 0));
    add("idh", (D.idhm - A.idhm - 0.003) * 1500 * (L.idh || 0));
    add("mvi", -((D.mvi - A.mvi) / A.mvi * 100) * 0.25 * (L.mvi || 0));
    if (A.desmatamento > 0) add("dsm", -((D.desmatamento - A.desmatamento) / A.desmatamento * 100) * 0.08 * (L.dsm || 0));
    add("g", (ctx.g - 1.8) * 2 * (L.g || 0));
    if (L.extra && ctx.gastoExtra > 20) add("extra", -(ctx.gastoExtra - 20) / 10 * L.extra);
    const porArea = {};
    for (const p of ctx.anunciados.concat(ctx.prontos)) {
      if (p.regiao !== r && p.regiao !== "Nacional") continue;
      const peso = (p.regiao === "Nacional" ? 0.4 : 1) * Math.sqrt(p.custo) * 0.8;
      let l = L[p.area] || 0;
      if (r === "Centro-Oeste" && p.area === "ambiente" && p.tipo !== "regular") l = 0.4;
      porArea[p.area] = (porArea[p.area] || 0) + l * peso;
    }
    for (const [a, v] of Object.entries(porArea)) add("proj:" + a, v);
    for (const ev of ctx.eventos) {
      const meu = ev.regiao ? ev.regiao === r : C.eventos.includes(ev.id);   // evento na minha região, ou nacional que me afeta
      if (!meu) continue;
      const v = ev.bom ? 3 * ev.sev * ev.alivio : -2 * ev.sev * (1 - ev.alivio) + (ev.alivio >= 0.6 ? 2.5 : 0);
      add("ev:" + ev.id, v);
    }
    const nota = contrib.reduce((s, [, v]) => s + v, 0);
    const humor = nota > 1.5 ? "feliz" : nota < -1.5 ? "preocupado" : "neutro";
    contrib.sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]));
    const F = FALAS[r];
    let fala = null, motivo = null;
    for (const [k, v] of contrib) {
      const chave = k + ":" + (v > 0 ? "+" : "-");
      if (F[chave]) { fala = F[chave]; motivo = k; break; }
    }
    if (!fala) fala = F[humor === "feliz" ? "+" : humor === "preocupado" ? "-" : "0"];
    out[r] = { humor, fala, motivo, nota: Math.round(nota * 10) / 10 };
  }
  e.cidadaos = out;
  return out;
}

/* ---------- Diário da Alvorada ---------- */
const NOTAS = [
  "Ministro da Infraestrutura pede mais uma obra grande. Assessores perderam a conta.",
  "Chefe de gabinete completa mais um ano sem tirar férias.",
  "Capivara atravessa a Esplanada em pleno expediente; especialistas dizem que não é sinal de nada.",
  "Cafezinho do Planalto é eleito o pior de Brasília pelo terceiro ano seguido.",
  "Ministra da Fazenda é vista com uma calculadora até no aniversário da sobrinha.",
  "Pesquisa revela que 7 em cada 10 brasileiros não sabem o que é despesa discricionária. Os outros 3 trabalham no governo.",
  "Deputado chega atrasado à votação e culpa o trânsito do Eixo Monumental.",
  "Torcedores pedem que o governo invista também no time da cidade. Pedido segue em análise.",
  "Seca no ar de Brasília bate recorde; servidores trocam gravata por umidificador."
];
export function manchetes(e, rel, ctx, dGrupos, rnd) {
  const lista = [];
  const g = rel.crescimento;
  const principal = g >= 2.5 ? `Economia acelera e cresce ${nf(g)}% em ${rel.ano}`
    : g >= 1.5 ? `Economia cresce ${nf(g)}% em ${rel.ano}, no ritmo de sempre`
    : g >= 0 ? `Economia patina: crescimento de só ${nf(g)}% em ${rel.ano}`
    : `Recessão: PIB encolhe ${nf(-g)}% em ${rel.ano}`;
  const emp = (rel.antes.desemprego - rel.depois.desemprego) / 100 * FORCA_TRABALHO;
  const sub = Math.abs(emp) >= 20000 ? (emp > 0 ? `${gente(emp)} pessoas voltam a trabalhar` : `Mais ${gente(-emp)} pessoas ficam sem emprego`) : "Desemprego fica praticamente parado";
  lista.push({ tipo: "principal", titulo: principal, sub });

  for (const ev of ctx.eventos.slice(0, 2)) {
    const onde = ev.regiao ? ` no ${ev.regiao}` : "";
    let t;
    if (ev.bom) t = ev.id === "safra" ? `Safra recorde enche os silos${onde}` : `${ev.nome}${onde} anima o mercado`;
    else t = ev.alivio >= 0.6 ? `${ev.nome}${onde}: governo age rápido` : ev.alivio >= 0.3 ? `${ev.nome}${onde}: ajuda chega, mas não para todos` : `${ev.nome}${onde}: população reclama de abandono`;
    lista.push({ tipo: "evento", titulo: t, sub: ev.resposta || "" });
  }
  if (ctx.prontos.length) {
    const p = ctx.prontos[Math.floor(rnd() * ctx.prontos.length)];
    lista.push({ tipo: "obra", titulo: `Fica pronto: ${p.nome}`, sub: ctx.prontos.length > 1 ? (ctx.prontos.length > 2 ? `E mais ${ctx.prontos.length - 1} projetos começam a funcionar` : "E mais 1 projeto começa a funcionar") : "" });
  }
  const rej = rel.votacoes.filter(v => !v.aprovado);
  if (rej.length) lista.push({ tipo: "congresso", titulo: `Câmara derruba projeto do governo: "${rej[0].nome}"`, sub: rej.length > 1 ? `Foram ${rej.length} derrotas no ano` : "Base aliada rachou na votação" });
  const ord = Object.entries(dGrupos).sort((a, b) => a[1] - b[1]);
  const pior = ord[0], melhor = ord[ord.length - 1];
  lista.push({ tipo: "pesquisa", titulo: `Pesquisa: ${Math.round(rel.depois.aprovacao)}% aprovam o governo (≈ ${gente(rel.depois.aprovacao / 100 * ELEITORES)} de eleitores)`,
    sub: `${GRUPOS[melhor[0]].nome} ${melhor[1] >= 0 ? "estão mais satisfeitos" : "são os que menos se irritaram"}; ${GRUPOS[pior[0]].nome.toLowerCase()} ${pior[1] < 0 ? "são os mais insatisfeitos" : "seguem desconfiados"}` });
  lista.push({ tipo: "nota", titulo: NOTAS[Math.floor(rnd() * NOTAS.length)] });
  return lista;
}
