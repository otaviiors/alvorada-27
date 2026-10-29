# Alvorada 27 — notas para o Claude

Projeto do Otávio (Pelotas, RS). Jogo web sobre governar o Brasil. Leia antes de trabalhar:

- [docs/visao.md](docs/visao.md): o que o projeto quer ser e as ideias futuras.
- [docs/design-do-jogo.md](docs/design-do-jogo.md): regras do jogo, decididas em conversa. Atualize a seção certa quando algo for decidido, marcando *decidido (data)* ou *proposta*.
- [docs/identidade-visual.md](docs/identidade-visual.md): direção visual da maquete.
- [ORIGEM.md](ORIGEM.md): a história da ideia (não reescrever).

## Princípios
- **Neutro:** nada de partidos, candidatos ou pessoas reais. Personagens são fictícios.
- **Honesto:** dados reais com fonte citada; efeitos vêm de um modelo simplificado e o jogo diz isso.
- **Educativo e divertido:** cada regra deve ensinar algo verdadeiro sobre o Brasil.
- **Sempre em escala de gente (regra fixa, pedida pelo Otávio):** todo número que aparece para o jogador vem acompanhado de uma tradução visível: pessoas, vidas, campos de futebol, reais por habitante. Ex.: "7,6% (2,2 milhões de pessoas sem trabalho)". Referências: força de trabalho ≈ 110 milhões; 1 km² ≈ 140 campos de futebol; população do Censo 2022.
- **O tutorial aponta para o que explica:** o balão da chefe de gabinete fica perto do elemento destacado, com setinha.

## Técnica
- Site estático, sem build: `index.html`, módulos ES em `src/`, dados em `data/`. three.js 0.160 via importmap (unpkg).
- Publicado pelo GitHub Pages a partir da `main`.
- Precisa rodar bem em celular Android, notebook e desktop (RTX 2060).
- Textos do jogo, comentários e commits em **português do Brasil**. O Otávio usa "tu".
- Para testar localmente: `python3 -m http.server` na raiz.
