# Alvorada 27

Olhe o Brasil de cima, entenda cada estado e tente governar o país.

Alvorada 27 é um jogo web em três atos:

1. **Explorar**: mapa 2.5D do Brasil com relevo, nuvens e zoom até os estados, com dados reais em camadas.
2. **Decidir**: simulador de gestão com orçamento limitado, níveis de dificuldade e duração de partida.
3. **Refletir**: uma leitura final das escolhas do jogador.

**Por que o nome?** Alvorada é o palácio presidencial e o amanhecer. 27 são as unidades da federação (26 estados + DF), e 2027 é o início de um novo mandato. A história da ideia está em [ORIGEM.md](ORIGEM.md).

## Estado atual

Protótipo 0.1 do Ato 1: mapa com relevo, quatro camadas (regiões, PIB per capita, IDHM, densidade), ficha por estado, ranking e o controle de "céu" que muda o clima do cenário.

## Como abrir

O jogo é um site estático, sem instalação. Publicado pelo GitHub Pages a partir da branch `main`.

Para rodar no computador, os dados precisam ser servidos por um servidor local (abrir o `index.html` direto não carrega os arquivos de dados).

## Estrutura

```
index.html            página principal
src/app.js            lógica do mapa e do painel
src/style.css         visual
data/estados.geojson  contornos dos 27 estados
data/estados-dados.json  números de cada estado, com fontes
data/vizinhos.geojson países vizinhos (Natural Earth)
data/rios.geojson     rios principais (Natural Earth)
```

## Fontes dos dados

- População: IBGE, Censo Demográfico 2022
- Densidade: IBGE, Anuário Estatístico do Brasil 2024
- PIB e PIB per capita: IBGE, Contas Regionais 2023
- IDHM: PNUD/Ipea/FJP, Radar IDHM 2024 (Amazonas e Amapá em verificação)
- Contornos: IBGE; rios e países: Natural Earth; relevo: Terrain Tiles (Mapzen/AWS)
