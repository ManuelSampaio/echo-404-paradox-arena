# ECHO//404 — inventário de licenças

Copyright © 2026 MANUEL SAMPAIO01. Código e assets próprios deste projeto são disponibilizados sob MIT (ver LICENSE), incluindo os desenhos programáticos de operadores, retratos, cenários, plataformas, ícones e patrulhas. A marca e assinatura identificam o autor; a licença não implica endosso de terceiros.

| Material | Origem | Licença / estado |
|---|---|---|
| Phaser 3.90.0 | vendor/phaser-3.90.0.min.js | MIT; texto integral em vendor/PHASER-LICENSE.md |
| assets/operators/*.png | scripts/create-operator-art.cjs | MIT do projeto; retratos derivados dos sprites do mesmo script |
| assets/origin/{explorer,patrols,platform,horizon}.png | scripts/create-origin-art.cjs | MIT do projeto |
| assets/paradox/25 cenários e icon-{192,512}.png | scripts/create-paradox-art.cjs | MIT do projeto |
| icon-maskable.png | ícone próprio 512, reduzido e centrado numa margem de 96 px | MIT do projeto |
| preview.png (Origin e Paradox) | capturas/renderizações dos motores e assets próprios presentes no repositório | MIT do projeto; não usados pela campanha atual nem pelo seu precache |
| Sons atuais | Osciladores e envelopes de PilotSound (Web Audio API) | MIT do projeto; sem samples externos |
| Tipografia em execução | system-ui, -apple-system, sans-serif, monospace | Fontes fornecidas pelo dispositivo; não se redistribuem ficheiros de fonte |
| Texto rasterizado por scripts | sans-serif do ambiente de geração | Não se inclui o ficheiro de fonte no jogo; identificação exata da fonte de geração histórica não confirmada |
| Vite, Capacitor, jsdom, @napi-rs/canvas | npm/package-lock.json | Licenças MIT declaradas nos pacotes; manter avisos das dependências distribuídas |

## Histórico fora da distribuição atual

O clássico antigo referenciava PixiJS, pixi-filters e GSAP por CDN. A sua página foi substituída por um redirecionamento para a campanha atual. Esses motores, assets históricos de cenários e a edição v14-stable não entram no build publicado. O histórico Git mantém as fontes e o inventário anterior. As imagens acima que não são necessárias à campanha ficam apenas no repositório.

A v16 não usa personagens, nomes, música, logótipos ou assets de Star Wars; o combate de pulso e os cenários são implementação original de ficção científica sob a licença do projeto.

## Verificação e limites

As imagens da campanha têm geradores no repositório. A margem maskable pode ser verificada por `npm run test:v15`; a apresentação em todos os launchers não foi confirmada. Não há música, imagem de banco ou fonte web externa na campanha. As licenças transitivas de ferramentas de desenvolvimento ficam nos respetivos pacotes e não são automaticamente anexadas ao bundle web.
