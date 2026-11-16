# ECHO//404 — inventário de licenças

Copyright © 2026 MANUEL SAMPAIO01. Código e assets próprios deste projeto são disponibilizados sob MIT (ver LICENSE), incluindo os desenhos programáticos de operadores, retratos, cenários, plataformas, ícones e patrulhas. A marca e assinatura identificam o autor; a licença não implica endosso de terceiros.

| Material | Origem | Licença / estado |
|---|---|---|
| Phaser 3.90.0 | vendor/phaser-3.90.0.min.js | MIT; texto integral em vendor/PHASER-LICENSE.md |
| assets/operators/*.png | scripts/create-operator-art.cjs | MIT do projeto; retratos derivados dos sprites do mesmo script |
| assets/origin/{explorer,patrols,platform,horizon}.png | scripts/create-origin-art.cjs | MIT do projeto |
| assets/paradox/25 cenários e icon-{192,512}.png | scripts/create-paradox-art.cjs | MIT do projeto |
| icon-maskable.png | ícone próprio 512, reduzido e centrado numa margem de 96 px | MIT do projeto |
| preview.png (Origin e Paradox) | capturas/renderizações dos motores e assets próprios presentes no repositório | MIT do projeto; não usados pela campanha v15 nem pelo seu precache |
| Sons atuais | Osciladores e envelopes de PilotSound (Web Audio API) | MIT do projeto; sem samples externos |
| Tipografia em execução | system-ui, -apple-system, sans-serif, monospace | Fontes fornecidas pelo dispositivo; não se redistribuem ficheiros de fonte |
| Texto rasterizado por scripts | sans-serif do ambiente de geração | Não se inclui o ficheiro de fonte no jogo; identificação exata da fonte de geração histórica não confirmada |
| Vite, Capacitor, jsdom, @napi-rs/canvas | npm/package-lock.json | Licenças MIT declaradas nos pacotes; manter avisos das dependências distribuídas |

## Fora da campanha: classic.html

A página clássica referencia por CDN PixiJS 8.16.0, pixi-filters 6.1.5 e GSAP 3.14.2. Não são carregados nem precacheados pela campanha. Pixi e filtros declaram MIT; GSAP tem licença própria, cuja adequação a uma distribuição futura do clássico deve ser revista nos termos oficiais. Não incluir o clássico num pacote de loja sem concluir essa revisão. Links: https://pixijs.com/ ; https://github.com/pixijs/filters ; https://gsap.com/community/standard-license/ .

## Verificação e limites

As imagens da campanha têm geradores no repositório. A margem maskable pode ser verificada por `npm run test:v15`; a apresentação em todos os launchers não foi confirmada. Não há música, imagem de banco ou fonte web externa na campanha. As licenças transitivas de ferramentas de desenvolvimento ficam nos respetivos pacotes e não são automaticamente anexadas ao bundle web.
