# Design do jogo

A visão geral e as ideias futuras estão em [visao.md](visao.md).

Documento vivo. Cada seção é decidida em conversa e marcada como **decidido**, **proposta** ou **em aberto**.

Prazo-alvo: primeira versão jogável até **1º de janeiro de 2027**, quando começa o novo mandato.

**Estado (29/10/2026):** primeira versão jogável pronta (protótipo 0.5): promessas, eventos com previsões, cartas dos ministros, projeto próprio, Congresso, orçamento, balanço anual, fim de mandato com antes e depois no mapa. Personagens ainda com iniciais no lugar das ilustrações.

## 1. A fantasia do jogador — *decidido (29/10/2026)*

- O jogador é o **presidente da República**, que assume em 1º de janeiro de 2027.
- **Objetivo duplo:**
  - **Plano de governo:** no início, o jogador escolhe **3 prioridades** (as promessas de campanha). No fim, é avaliado por elas.
  - **Legado:** o jogo compara o Brasil do início com o do fim do mandato, em todos os números, inclusive os que o jogador deixou de lado.
- Não existe "vencer" ou "perder". O resultado é um retrato do mandato: o que foi prometido, o que foi entregue e quem ficou de fora.

## 2. O mandato e os turnos — *decidido (29/10/2026)*

- Um mandato de **4 anos**, com **1 turno por ano** (2027 a 2030), igual ao ciclo do orçamento real.
- Cada turno: ver a situação → decidir → ver o resultado no mapa.

## Escopo da primeira versão jogável — *decidido (29/10/2026)*

**Bem enxuta**: poucas áreas e poucos números, jogável em cerca de 10 minutos. Cresce depois de testar.

## 3. Os números do país — *decidido (29/10/2026)*

Sete indicadores nacionais, com valores iniciais reais (fontes oficiais: IBGE, Banco Central, Tesouro, Inpe, Fórum Brasileiro de Segurança Pública):

| Indicador | O que representa |
|---|---|
| Crescimento | PIB subindo ou caindo |
| Emprego | Taxa de desemprego |
| Qualidade de vida | Saúde, educação e renda, no espírito do IDHM |
| Contas públicas | Dívida em relação ao PIB |
| Segurança | Violência (ex.: mortes violentas por 100 mil habitantes) |
| Meio ambiente | Desmatamento e emissões |
| Aprovação | Apoio da população ao governo |

- O orçamento é distribuído entre as **5 regiões**, para que o mapa reaja e a desigualdade regional apareça. Os 27 estados entram numa versão futura.
- Lições que esses números devem ensinar:
  - **Segurança** é sobretudo responsabilidade dos estados (polícias estaduais). O presidente age por meio da Polícia Federal, da PRF, de fundos e de integração, então seus efeitos são indiretos e lentos.
  - **Meio ambiente** cria tensões reais com o crescimento (expansão de lavoura e pasto) e também riscos ao crescimento (chuva, mercados externos, multas). O jogo mostra os dois lados.

## 4. O orçamento — *decidido (29/10/2026)*

Valores reais do Projeto de Lei Orçamentária de 2027 (PLOA 2027, agosto de 2026), em R$ bilhões:

| Parte | Valor | Quem decide |
|---|---|---|
| Despesa primária total (limite) | 2.576,5 | — |
| Obrigatórias | 2.304,3 (~89%) | Já definidas por lei |
| · Previdência | 1.169,3 | |
| · Pessoal e encargos | 440,7 | |
| · Bolsa Família | 157,1 | |
| · BPC | 145,1 | |
| · Abono e seguro-desemprego | 104,7 | |
| · Demais | 287,4 | |
| Discricionárias do Executivo | 213,7 (~8%) | **O jogador** |
| Emendas parlamentares | 44,8 | O Congresso |
| Outros Poderes (Judiciário, MPU, DPU) | 13,7 | Cada Poder |

Pisos constitucionais já garantidos dentro do total: saúde 272,2 e educação 141,2.

**Mecânica:** o jogador vê o orçamento inteiro como uma barra, com 89% travado. Da fatia discricionária (R$ 214 bi), a maior parte mantém os ministérios funcionando; **R$ 70 bi por ano** ficam para projetos novos (simplificação do jogo; ver [calibragem.md](calibragem.md)). Dinheiro não usado reduz a dívida. Gastar acima da fatia é possível, mas piora as contas públicas. As emendas são gastas pelo Congresso por conta própria.

## 5. As decisões — *decidido (29/10/2026)*

A fatia livre do orçamento é gasta em **projetos**, de dois jeitos que usam as mesmas regras:

- **Cartas sugeridas pelos ministros:** a cada ano, cerca de 8 projetos prontos (ex.: "Hospital regional no Norte — R$ 6 bi"). Rápido e concreto.
- **Projeto próprio:** o jogador monta o seu escolhendo:
  1. **Área:** saúde, educação, infraestrutura, segurança, meio ambiente, economia e emprego, assistência social.
  2. **Região:** uma das 5, ou nacional.
  3. **Tipo:** construir (obra), contratar e manter (serviço contínuo), transferir (dinheiro direto às pessoas ou aos estados), regular ou fiscalizar.
  4. **Tamanho:** pequeno, médio ou grande.
  O jogo calcula custo, efeitos e prazo com as mesmas fórmulas das cartas. Uma carta é só um projeto já montado.

Para que montar livremente continue sendo uma escolha (e não um atalho), valem regras realistas:
- **Retorno decrescente:** o 10º hospital na mesma região rende menos que o 1º.
- **Prazo:** obras grandes levam anos para dar efeito; transferências agem rápido, mas não constroem nada.
- **Custo que fica:** obras e serviços deixam custo de manutenção nos anos seguintes, que entra no orçamento travado.
- **Capacidade de execução:** cada área consegue gastar bem só até certo ponto por ano.

Ideia para o futuro (o Otávio quer trazer IA para o jogo): o jogador escreve a proposta em texto livre e uma IA a traduz em projeto. Fica para depois, porque precisa de servidor, tem custo e é mais difícil manter equilibrado e neutro.

## 6. Os eventos — *decidido (29/10/2026)*

**Frequência:** 1 a 2 eventos por ano, sorteados no começo do turno, antes das decisões.

**Tipos, com exemplos inspirados em casos reais:**

| Tipo | Exemplos | Região típica |
|---|---|---|
| Clima e natureza | Seca prolongada, enchente, queimadas, onda de calor | Nordeste, Sul, Norte e Centro-Oeste |
| Economia | Queda no preço da soja ou do minério, crise internacional, alta do petróleo | Nacional ou regiões exportadoras |
| Saúde e sociedade | Epidemia de dengue, greve de caminhoneiros, crise no sistema prisional | Nacional ou regional |
| Política | Congresso trava uma votação, conflito com governadores, escândalo num ministério | Nacional |
| Oportunidade | Safra recorde, investimento estrangeiro, descoberta de reserva, evento internacional sediado no país | Variada |

**Cada evento pede uma resposta**, com 2 ou 3 opções de custo e efeito diferentes. Exemplo, enchente no Sul:
- Socorro emergencial amplo: R$ 12 bi fora do orçamento, alívio rápido, piora as contas públicas.
- Socorro dentro do orçamento: tira dinheiro de projetos já escolhidos, alívio parcial.
- Repassar aos estados: custa pouco, recuperação lenta, desgaste com o governador e com a população.

**As escolhas anteriores mudam os eventos** (causa e consequência):
- Investir em prevenção e defesa civil reduz o estrago de enchentes e secas.
- Desmatamento alto aumenta a chance de queimadas e de seca.
- Contas públicas ruins deixam crises econômicas mais caras.
- Aprovação alta facilita o Congresso em eventos políticos.

**Previsões com margem de incerteza** (como na vida real):
- No fim de cada turno sai um **boletim de previsões** para o ano seguinte. Cada item traz região, **chance** de acontecer e **faixa de tamanho**. Ex.: "El Niño: 70% de chance de seca no Nordeste, de moderada a forte."
- O evento real é sorteado **dentro da faixa avisada**. Às vezes não acontece (alarme falso), e às vezes vem no limite de cima.
- Isso cria a decisão: gastar com prevenção agora, sem certeza, ou guardar o dinheiro e arriscar.
- Nem tudo é previsível:
  - **Clima e economia:** quase sempre avisados, com margem.
  - **Saúde e sociedade:** às vezes avisados (ex.: sazonalidade da dengue), às vezes não.
  - **Política e escândalos:** surpresa.
- **Investir em ciência e monitoramento** (no espírito de Inpe, Cemaden, Inmet) estreita as faixas e aumenta os avisos. Prever melhor também é uma escolha de governo.

**Neutralidade:** eventos políticos não citam partidos nem pessoas reais. Personagens são fictícios.

**Ideia com IA para o futuro:** manchetes e notícias de jornal geradas a partir do que aconteceu no turno, para dar vida ao mundo sem precisar escrever cada texto à mão.

## 7. O Congresso e os personagens — *decidido (29/10/2026)*

**O Congresso**
- Medidor de **apoio no Congresso** (0 a 100).
- Projetos grandes, mudanças de regra e gastos acima do orçamento passam por **votação**; a chance de aprovar depende do apoio.
- Ganhar apoio tem custo: atender emendas, ceder um ministério, apoiar projetos nas regiões dos parlamentares. Ignorar o Congresso economiza, mas trava o governo.
- Lição: no Brasil o presidente quase nunca tem maioria sozinho e precisa montar uma coalizão (o **presidencialismo de coalizão**).

**Elenco da primeira versão (todos fictícios)**
| Personagem | Papel no jogo |
|---|---|
| 7 ministros, um por área (saúde, educação, infraestrutura, segurança, meio ambiente, economia e emprego, assistência social) | Trazem as cartas sugeridas; cada um tem um jeito e uma opinião (ex.: a ministra da economia sempre alerta para as contas) |
| Presidente da Câmara | O rosto das negociações com o Congresso |
| 5 governadores, um por região | Reagem ao que o jogador faz na região; ajudam ou atrapalham a execução dos projetos |
| A população | Aparece pela aprovação e pelas manchetes |

**Visual dos personagens**
- **Ilustrados** desde a primeira versão, com rosto e expressões (ao menos neutro, satisfeito e preocupado).
- Estilo **levemente caricato, entre o cartoon e o realismo**, combinando com a maquete.
- Inventados do zero: **nenhuma semelhança com políticos reais**, nem nomes, nem rostos, nem partidos.
- O elenco reflete a diversidade do Brasil (regiões, gêneros, idades, origens), sem estereótipos.
- Produção das ilustrações: a definir (ilustração própria, artista ou geração por IA com estilo fixo e revisão).

## 8. Como o mapa reage — *decidido (29/10/2026)*

- **Cor das regiões:** cada indicador é uma camada; dá para ver uma região mudar de cor ao longo do mandato.
- **Projetos aparecem construídos** na maquete, onde o jogador investiu (hospital, ferrovia, parque eólico…). No fim, a maquete mostra o legado.
- **Eventos aparecem no lugar:** fumaça nas queimadas, rio transbordando na enchente, chão rachado na seca.
- **Humor do país:** indo bem, céu limpo, luz dourada, cidades com mais vida; indo mal, céu nublado, cores apagadas, mar agitado. A música acompanha.
- **Antes e depois:** no fim, um botão alterna entre o Brasil de 2027 e o do fim do mandato.

## 9. Fim de partida e reflexão — *decidido (29/10/2026)*

1. **Boletim das promessas:** as 3 prioridades de campanha, cumpridas ou não, com números.
2. **Legado:** o que melhorou, o que piorou e **quem ficou de fora** (a região mais esquecida, o indicador mais ignorado).
3. **Reflexão final:** texto curto montado a partir das escolhas, sem julgar certo ou errado. Ex.: "Tu priorizou crescer rápido. O Centro-Oeste prosperou; a Amazônia pagou parte da conta. Governar é escolher o que deixar para depois."

## 10. Dificuldade e duração — *decidido (29/10/2026)*

Dificuldade e duração são escolhas separadas.

**Duração**
| Modo | Turnos | Ideia |
|---|---|---|
| Primeiro ano | 1 (2027) | Partida rápida, serve de tutorial |
| Mandato | 4 (2027–2030) | O jogo padrão |
| Reeleição | até 8 (2027–2034) | No fim do ano 4 há eleição, decidida pela aprovação. Reeleito, o jogador governa mais 4 anos; derrotado, a partida termina ali. (No Brasil só é permitida uma reeleição seguida.) |

**Dificuldade**
| Nível | O que muda |
|---|---|
| Fácil | Fatia livre do orçamento maior, Congresso mais favorável, previsões mais precisas, menos eventos ruins |
| Normal | **O Brasil real**: números reais de partida e do orçamento |
| Difícil | O Brasil real numa fase ruim: economia mundial em crise, Congresso hostil, previsões vagas, mais eventos |

**Primeira versão jogável:** só **Normal + Mandato**. Os outros modos entram depois de testar.

## Princípios

- **Neutro.** Nenhum partido, nenhum candidato, nenhuma ideologia premiada. O jogo mostra custos e efeitos das escolhas e deixa o jogador decidir o que vale mais.
- **Honesto.** Os dados de partida são reais e citados. Os efeitos das decisões vêm de um modelo simplificado, e o jogo diz isso.
- **Ensina jogando.** Cada regra deve ensinar algo verdadeiro sobre como o Brasil é governado.

## 11. Engajamento: contexto, objetivo e pessoas — *proposta (29/10/2026)*

Primeiro teste do Otávio (29/10/2026): o jogo é educativo, mas faltou contexto, tutorial e um objetivo claro; foi preciso esforço para se interessar. Como ele não gosta de política, é exatamente o público a conquistar.

Decisões da conversa: **nota + reeleição + missões**; **cidadãos + manchetes** (um cidadão principal por região e vários grupos secundários reagindo); **tutorial guiado no 1º ano, opcional**, e um **modo tutorial no menu** (pode ficar para o futuro); tom **equilibrado** entre política e gestão.

### Nota do mandato
- Nota de 0 a 100, mostrada como 1 a 5 estrelas, visível o tempo todo como "nota parcial".
- Composição: promessas (30), legado comparado com o que aconteceria sem o jogador (40), equilíbrio entre as regiões (15), contas públicas (15).

### Reeleição
- No fim do ano 4 há eleição contra um adversário fictício. Os votos vêm da aprovação de cada grupo e de cada região.
- O resultado aparece no mapa, região por região. Reeleito: bônus na nota e opção de governar mais 4 anos. Derrotado: o mandato termina ali.

### Missões
- A cada ano, 2 ou 3 missões curtas e concretas, tiradas da situação do país. Ex.: "Socorrer o Nordeste na seca sem cortar a saúde", "Aprovar um projeto de educação no Norte", "Fechar o ano sem gastar além do orçamento", "Chegar a 55 de apoio no Congresso".
- Recompensa: pontos na nota, aprovação, apoio ou dinheiro extra no ano seguinte.

### Pessoas no lugar de números
- **Cinco cidadãos principais**, um por região, fictícios, com nome, idade, profissão, cidade e o que mais importa para eles. Cada um tem humor (feliz, neutro, preocupado) e uma fala por ano reagindo ao que aconteceu na região.
- **Grupos da sociedade**, cada um com sua aprovação: trabalhadores, empresários, agricultores, famílias de baixa renda, jovens e estudantes, aposentados, ambientalistas, moradores das grandes cidades. Cada grupo gosta e desgosta de coisas diferentes. A aprovação nacional passa a ser a média dos grupos, e o jogador entende **quem** está satisfeito e por quê.
- **Números traduzidos em gente:** 0,1 ponto de desemprego ≈ 110 mil pessoas; 0,1 morte por 100 mil ≈ 210 vidas por ano; 1 km² de floresta ≈ 140 campos de futebol.

### Manchetes
- No fim de cada ano, a capa de um jornal fictício (*Diário da Alvorada*) com 3 ou 4 manchetes geradas a partir do que aconteceu, com um pouco de humor e sem citar pessoas ou partidos reais.

### Tutorial
- Antes do mandato: "Primeira vez? Governar com a ajuda do gabinete" ou "Já sei jogar".
- **Chefe de gabinete** (personagem fictício) guia o primeiro ano passo a passo: o país herdado, as promessas, os eventos, as propostas, o orçamento, fechar o ano. As abas são liberadas aos poucos (Montar, Congresso e Previsões a partir do ano 2, com uma dica cada).
- **Futuro:** modo tutorial no menu principal, com mandato guiado do começo ao fim e cenários de treino (ex.: "Enfrentar uma enchente", "Destravar o Congresso", "Fechar as contas").

### Linguagem
- Equilíbrio: a parte política continua (é o que o jogo ensina de mais valioso), mas sem jargão solto. Todo termo técnico ganha explicação curta ao tocar (ex.: IDHM, discricionárias, emendas).
