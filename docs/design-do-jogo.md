# Design do jogo

Documento vivo. Cada seção é decidida em conversa e marcada como **decidido**, **proposta** ou **em aberto**.

Prazo-alvo: primeira versão jogável até **1º de janeiro de 2027**, quando começa o novo mandato.

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

## 4. O orçamento — *proposta*

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

**Mecânica proposta:** o jogador vê o orçamento inteiro como uma barra, com 89% travado. Só a fatia livre (cerca de R$ 214 bi) é dele, gasta em **projetos** (ver seção 5). Gastar acima da fatia é possível, mas piora as contas públicas. As emendas são gastas pelo Congresso por conta própria.

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

## 7. O Congresso e os personagens — *em aberto*

Quem pode travar ou ajudar o jogador, e como.

## 8. Como o mapa reage — *em aberto*

O que muda na maquete conforme o país vai bem ou mal.

## 9. Fim de partida e reflexão — *em aberto*

Como o mandato termina e o que o jogo devolve ao jogador.

## 10. Dificuldade e duração — *em aberto*

Fácil, médio e difícil; partidas curtas, médias e longas.

## Princípios

- **Neutro.** Nenhum partido, nenhum candidato, nenhuma ideologia premiada. O jogo mostra custos e efeitos das escolhas e deixa o jogador decidir o que vale mais.
- **Honesto.** Os dados de partida são reais e citados. Os efeitos das decisões vêm de um modelo simplificado, e o jogo diz isso.
- **Ensina jogando.** Cada regra deve ensinar algo verdadeiro sobre como o Brasil é governado.
