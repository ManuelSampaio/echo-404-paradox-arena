# ECHO//404 — v16.0.0 · SINAL DE REBELIÃO

Criado e desenvolvido por **MANUEL SAMPAIO01**. 25 missões desbloqueadas, três operadores, ecos e combate de energia. Ficção científica original: sem personagens, nomes, músicas ou assets de Star Wars.

## Jogar

Abrir `origin-reborn.html`; escolher qualquer missão, ou usar `#nivel=25`. A central organiza os 25 IDs originais em cinco mundos. Só a campanha atual é publicada; antigas entradas redirecionam e `/v14-stable/` foi retirado. O histórico Git e a tag original permanecem.

Direções à esquerda. CURTO/ALTO, ECO, IMPULSO, habilidade e PULSO à direita. Mantém PULSO para disparar repetidamente; mira assistida para alvos à frente, recarga de 0,42s, sem munições pagas. Inimigos podem ser desativados: drone 1 impacto, patrulha/caçador 2, sentinela 3. Paredes bloqueiam tiros; pulsos podem intercetar projéteis. No teclado: A/D, Espaço, Shift, E, Q e **F**. O combate é uma mecânica base, disponível também em modo puro.

Missões de sabotagem exigem disparar nos relés; recolha/ativação faz-se por contacto; sequência exige ordem; defesa exige permanecer junto ao transmissor, com reforços avisados. Assalto exige desativar a quota indicada. A missão 1 conserva o percurso de aprendizagem. As restantes combinam corredores, descidas, ilhas, salas e terraços, sem se limitarem à subida de placas. Os cinco mundos continuam a ensinar âncora/elevador, botões, lasers, janelas temporais e dois ecos. O NÓ fornece o segundo eco a todos os operadores.

## Progresso e resultados

A v16 lê v14/v15 como histórico, sem escrever nessas chaves. Novas conclusões: `echo404_origin_campaign_v16`; definições/economia/relatórios/ghosts têm sufixo v16. Preferências anteriores de operador, som, treino e efeitos são lidas. Resultados e tempos antigos não são usados como recordes da geometria nova. Medalhas históricas continuam visíveis.

Estrelas: três fragmentos, tempo abaixo do alvo, zero mortes. Memórias são opcionais. Recuperar pelo menu conta como morte. Partidas assistidas não apagam nem melhoram as conquistas puras; a última sessão fica separada do agregado. Modo puro desliga power-ups, upgrades e ghost. Dados inválidos de relatórios, economia e ghosts são tratados sem bloquear a missão. Tudo fica neste dispositivo, sem contas ou analytics remoto.

Relatório: `origin-reborn.html?debug#nivel=1` → RELATÓRIO LOCAL → COPIAR RELATÓRIO. Inclui tentativas, mortes, causas, tempos, conclusões e inimigos desativados. Máximo 300 sessões.

## Desenvolvimento e validação

Node 22, `npm ci`, `npm run dev`. `npm run maps:export` valida os mapas Tiled sem mudar geometria; build Vite com base relativa para Pages. `maps/*.json` é a fonte da geometria. `scripts/author-action-maps.cjs` existe apenas para reautoria intencional, nunca é executado no build. `origin-pilot.js` coordena módulos de movimento, ecos, dispositivos, inimigos, HUD, treino, habilidades, combate e operações.

```sh
npm test
npm run test:phaser
npm run test:v15
npm run test:action
npm run test:bot
npm run build
npm run test:build
```

`test:v15` é o nome conservado da suite de migração/cache/manifest; também há migração v15→v16 em `test:action`. O bot usa comandos legais, dano ativo, recolha natural, pulsos, relés e nós locais, sem habilidades/teletransporte/imunidade artificial. Pode morrer e recuperar. Os testes isolados de geometria usam posicionamento/imunidade para avaliar saltos; não se confundem com o bot contínuo.

GitHub Actions executa as suites antes de publicar `dist`. A distribuição contém apenas a campanha atual, recursos necessários e redirecionamentos. Phaser local, Web Audio sintetizado e assets do projeto; sem API paga ou CDN de runtime. Capacitor continua apenas preparado/documentado, sem publicação nativa.

Ver `docs/reports/V16-REPORT.md`, `docs/TILED.md`, `docs/LICENSES.md`, `docs/MOBILE-PUBLISHING.md`.

## Não confirmado

iPhone físico/Safari, FPS/GPU/memória em gama baixa, áudio após chamadas, Lighthouse, builds APK/AAB/iOS e duração humana de 2–4 minutos. Os alvos de estrelas são referências ajustáveis do bot, não medição humana. O lançamento local de Chromium foi bloqueado pelo ambiente nesta revisão; testes físicos/visuais de browser não são substituídos pelo Phaser automatizado.
