# Calibragem do motor

Como os números do modo Governar foram escolhidos. Os **valores de partida são reais**; os **efeitos das decisões vêm de um modelo simplificado**, ajustado para que as escolhas tenham custos e consequências plausíveis. Os números de ajuste ficam em [`src/jogo/regras.js`](../src/jogo/regras.js).

## Ponto de partida (1º de janeiro de 2027)

Arquivo: [`data/jogo/inicio.json`](../data/jogo/inicio.json).

| Indicador | Brasil | Fonte |
|---|---|---|
| Crescimento (tendência) | 1,8% ao ano | Boletim Focus para 2026 (1,82%); PIB de 2025 cresceu 2,3% (IBGE) |
| Desemprego | 5,4% | PNAD Contínua, 2º tri 2026 (IBGE) |
| Qualidade de vida | IDHM 0,805 | Radar IDHM 2024 (PNUD/Ipea/FJP) |
| Dívida bruta | 82,9% do PIB | Banco Central, agosto de 2026 |
| Mortes violentas | 19,1 por 100 mil | Anuário Brasileiro de Segurança Pública 2026 (dados de 2025) |
| Desmatamento | 13.031 km² | PRODES 2025 (Inpe): Amazônia 5.796 + Cerrado 7.235 |
| Aprovação | 55% | Fictício (não usa pesquisas reais) |
| Apoio no Congresso | 50 | Fictício |

Por região:

| Região | Desemprego | IDHM | Mortes violentas | Desmatamento (km²) |
|---|---|---|---|---|
| Norte | 6,1% | 0,767 | 25,3 | 5.486 |
| Nordeste | 7,6% | 0,762 | 31,6 | 4.373 |
| Sudeste | 5,2% | 0,826 | 12,5 | 300 |
| Sul | 3,2% | 0,823 | 11,9 | 0 |
| Centro-Oeste | 3,8% | 0,820 | 17,2 | 2.872 |

Notas:
- **IDHM regional**: média dos estados ponderada pela população; Amazonas e Amapá ainda sem valor publicado no Radar 2024.
- **Mortes violentas regionais**: taxas estaduais de 2024 (Anuário 2025) com a variação de cada estado em 2025 (Anuário 2026). A média nacional calculada dá 19,0, contra 19,1 oficial.
- **Desmatamento regional**: PRODES por estado; 1.600 km² do Cerrado sem estado informado foram divididos entre Centro-Oeste e Minas Gerais. O Sul fica em zero porque Pampa e Mata Atlântica não entram nessa série.

## Orçamento

Do PLOA 2027 (agosto de 2026): despesa primária de R$ 2.576,5 bi; R$ 2.304,3 bi obrigatórios (~89%); R$ 213,7 bi discricionários do Executivo; R$ 44,8 bi de emendas.

**Simplificação do jogo:** das discricionárias, R$ 70 bi por ano ficam para projetos novos; o resto mantém os ministérios funcionando. Esse valor é uma estimativa de jogo, não um dado oficial.

## Custos de referência

| Projeto real | Custo | Uso no jogo |
|---|---|---|
| Hospital regional | R$ 160–185 milhões cada | "Construir saúde, grande" (R$ 12 bi) equivale a uma rede de ~70 hospitais |
| Creche ou pré-escola (Novo PAC) | ~R$ 6 milhões cada | "Construir educação, médio" (R$ 5 bi) equivale a ~800 creches |
| Pé-de-Meia | R$ 10–20 bi por ano | "Transferir educação, grande" (R$ 15 bi) |
| Ferrogrão (933 km) | estimativas de R$ 10 a 87 bi | "Construir infraestrutura, grande" (R$ 12 bi) é uma fração de uma ferrovia dessas |
| Combate a incêndios e fiscalização ambiental | ~R$ 340 milhões (repasse de 2026) | Explica por que meio ambiente rende muito por real gasto |

## Regras do modelo

- **Efeito por real gasto por habitante:** o mesmo dinheiro rende mais numa região menor ou com mais necessidade (IDHM mais baixo, mais desemprego, mais violência).
- **Retorno decrescente:** o efeito cai pela metade quando a região já recebeu R$ 260 por habitante na mesma área.
- **Prazos:** obra pequena e média leva 1 ano, obra grande 2; contratação vale a partir do ano seguinte; transferência vale só no ano; regra vale no ano seguinte.
- **Custo que fica:** obras deixam 6% do custo por ano de manutenção; contratações passam a custar o valor cheio todo ano.
- **Tendências sem o jogador:** IDHM +0,003/ano; mortes violentas −2,5%/ano; dívida +1,6 ponto/ano por causa dos juros; aprovação volta aos poucos para perto de 45%.
- **Gastar além do orçamento** vira dívida, tira crescimento no ano seguinte e, acima de R$ 20 bi, derruba a aprovação. Dinheiro de projetos não usado reduz a dívida.
- **Desemprego** segue o crescimento (lei de Okun simplificada) e volta aos poucos para o nível estrutural de cada região.

## Simulação (200 partidas por estilo)

Valores médios no fim do mandato. Início: crescimento 1,8 · desemprego 5,4 · IDHM 0,805 · dívida 82,9 · mortes 19,1 · desmatamento 13.031 · aprovação 55.

| Estilo | Cresc. médio | Desemp. | IDHM | Dívida | Mortes | Desmat. | Aprov. | Custo fixo deixado |
|---|---|---|---|---|---|---|---|---|
| Piloto automático | 1,6 | 6,1 | 0,813 | 87,5 | 17,6 | 14.092 | 25 | 0 |
| Aceita os ministros | 1,8 | 5,4 | 0,824 | 88,2 | 16,5 | 10.173 | 50 | 25 |
| Gasta sem limite | 2,2 | 4,4 | 0,824 | 88,6 | 15,7 | 11.866 | 71 | 33 |
| Social no Nordeste | 1,7 | 5,7 | 0,827 | 88,4 | 17,3 | 13.690 | 49 | 30 |
| Desenvolvimentista | 2,3 | 4,1 | 0,816 | 87,7 | 16,1 | 17.439 | 61 | 10 |
| Verde | 1,8 | 5,5 | 0,822 | 88,9 | 16,6 | 5.300 | 43 | 60 |
| Austero | 1,8 | 5,6 | 0,814 | 87,3 | 17,2 | 14.060 | 26 | 0 |
| Segurança | 1,7 | 5,7 | 0,821 | 88,9 | 14,5 | 10.959 | 44 | 66 |

Leitura: nenhum estilo vence em tudo. Quem foca numa área cumpre a promessa daquela área e paga em outra (o desenvolvimentista aumenta o desmatamento em 34%; o verde e o da segurança deixam o orçamento dos anos seguintes travado; o austero segura a dívida e perde aprovação). Para refazer: `node scripts/simular.mjs 200`.

Pontos a revisar depois de jogar de verdade: "gastar sem limite" ainda parece forte demais; crescer 2,5% ao ano é muito difícil (14% no melhor estilo).
