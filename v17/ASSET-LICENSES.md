# v17 — origem e licença dos assets do piloto

Copyright © 2026 **MANUEL SAMPAIO01**. Todo o código e todo o desenho original aqui descritos são disponibilizados sob a licença **MIT do projeto**, cujo texto integral está no `LICENSE` da raiz.

## Origem

Todos estes PNG foram desenhados por código no gerador original `v17/scripts/create-art.cjs`, usando retângulos, polígonos, linhas, círculos e gradientes rasterizados. Não foram descarregadas imagens, fontes, amostras de áudio ou modelos. Não são utilizados personagens, emblemas, formas de armas, sons ou música de franquias de terceiros. A direção é industrial: carvão, aço, cobre, marfim e âmbar.

A biblioteca de desenvolvimento `@napi-rs/canvas` é a dependência já existente do projeto; não acrescenta um CDN nem uma dependência de runtime ao jogo. Os gradientes são pré-renderizados nos PNG, não shaders nem filtros executados em cada frame.

Reprodução, a partir da raiz:

```sh
node v17/scripts/create-art.cjs
```

`v17/assets/manifest.json` regista o gerador, a licença, dimensões, bytes e a ordem dos frames. Não contém datas variáveis; os resultados podem ser comparados por hash em execuções consecutivas.

## Inventário

| Ficheiros | Dimensões / conteúdo | Utilização prevista |
|---|---|---|
| `zone01-far.png`, `zone01-mid.png`, `zone01-near.png` | 1024×576 cada; shaft vertical e alcovas | Câmara de Eco: fundo, arquitetura intermédia e enquadramento próximo |
| `zone02-far.png`, `zone02-mid.png`, `zone02-near.png` | 1024×576 cada; doca larga, nave imobilizada e guindastes | Cais sem Tripulação |
| `zone03-far.png`, `zone03-mid.png`, `zone03-near.png` | 1024×576 cada; portão concêntrico e mecanismos de quarentena | Portão de Quarentena |
| `zone01-preview.png`, `zone02-preview.png`, `zone03-preview.png` | 480×270; composição das três camadas respetivas | Arte do hub, sem texto rasterizado |
| `units.png` | 384×96, quatro frames 96×96 | 0 Mole, 1 Blindado, 2 Atirador, 3 Elite; silhuetas mecânicas distintas |
| `role-icons.png` | 256×64, quatro frames 64×64 | Mesma ordem; círculo, hexágono, triângulo e duplo chevron para redundância não cromática |
| `porteiro.png` | 640×160, quatro frames 160×160 | 0 fechado, 1 aviso, 2 núcleo exposto, 3 derrotado; carro industrial não humanoide |
| `porteiro-static.png` | 160×160, frame fechado | Alternativa para loader de imagem simples / hub |
| `kai7.png` | 1296×88, dezoito frames 72×88 | Andróide visivelmente mecânico, sem pele/cabelo; compatível com o tamanho de frame dos operadores existentes |
| `kai7-portrait.png` | 180×180 | Retrato do andróide derivado do sprite original |
| `platform.png` | 128×48, repetível horizontalmente | Plataforma industrial com bordo superior legível |
| `terminal.png` | 64×96, transparente | Terminal de memória, sem texto de idioma no PNG |
| `memory.png` | 32×32, transparente | Ícone de memória opcional |
| `steam.png` | 128×128, alfa suave | Textura de vapor; limitar número e alfa em runtime |

## Integração e acessibilidade

- `far` é opaco; `mid` e `near` conservam alfa. As camadas próximas enquadram margens e deixam o centro livre; não devem cobrir inimigos ou plataformas.
- Perfis baixos podem reduzir ou omitir `mid`/`near`, sem ocultar informação de gameplay. Avisos perigosos devem ser renderizados pelo runtime acima do fundo.
- Os papéis diferem em silhueta e ícone, não apenas em cor. As opções de contraste alto/daltonismo podem acrescentar contornos/ícones sem substituir a arte.
- Estados do Porteiro têm diferenças geométricas: abertura física do núcleo e carcaça partida. Não dependem só de um flash ou de uma cor.
- O KAI-7 usa a convenção de frames: idle 0–3, corrida 4–11, ar 12–13, esquiva 14–15 e dano 16. O frame 17 é uma pose neutra adicional. A cadência mecânica deve ser configurada no runtime.

## Validação deste lote

Confirmado: geração local com dependências existentes, dimensões e frames inventariados, alfa em todas as camadas intermédias/próximas, reprodução determinística por hashes e inspeção visual das três composições, unidades, Porteiro e retrato KAI-7.

Não confirmado por este lote: integração no runtime, legibilidade física num ecrã de 320px, FPS/GPU no iPhone, animações/configuração de hitboxes e comportamento de qualidade. Esses pontos pertencem aos testes do piloto.
