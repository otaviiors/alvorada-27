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

## Técnica
- Site estático, sem build: `index.html`, módulos ES em `src/`, dados em `data/`. three.js 0.160 via importmap (unpkg).
- Publicado pelo GitHub Pages a partir da `main`.
- Precisa rodar bem em celular Android, notebook e desktop (RTX 2060).
- Textos do jogo, comentários e commits em **português do Brasil**. O Otávio usa "tu".
- Para testar localmente: `python3 -m http.server` na raiz.
