# ECHO//404 — v15.0.0

Criado e desenvolvido por **MANUEL SAMPAIO01**. Campanha de 25 níveis de plataformas, pensada para telemóvel na vertical, com AXIOM, NYRA e KAI-7. Todos os níveis ficam desbloqueados.

## Jogar e comparar

- Campanha: `origin-reborn.html`; nível direto: `origin-reborn.html#nivel=25`.
- Testar e copiar relatório: `origin-reborn.html?debug#nivel=1`.
- Comparar: `v14-stable/`; a tag `v14.2.0-stable` preserva a fonte original.
- A comparação lê resultados antigos e escreve apenas no prefixo `echo404_stable_compare:`.

O treino inicial de seis passos é obrigatório na primeira utilização e pode ser repetido. Direções à esquerda, CURTO/ALTO/IMPULSO/ECO e habilidade à direita. Teclado: A/D ou setas, Espaço, Shift, E, Q. No quinto mundo, o botão contextual NÓ fornece um segundo eco a qualquer operador, sem exigir habilidade.

## Cinco mundos

1. SINAL: âncora e elevador, patrulhas simples.
2. CIRCUITO: botões e portas; dois primeiros exercícios com memória, depois ocupação contínua.
3. REFRAÇÃO: lasers com aviso e desativação por eco.
4. ÓRBITA: plataformas móveis, eco e janela periódica de sensor (8 de 12 segundos).
5. CONVERGÊNCIA: dois sensores ligados por AND à porta, com segundo eco local.

Os mapas mudam entre ziguezagues, salas empilhadas, ilhas, plataformas orbitais e terraços largos. A geometria base e as ameaças são verificadas em Phaser real. Os elementos móveis acrescentam rotas/apoios; nem todos os saltos exigem usá-los.

## Resultados e dados

Modo puro é o padrão: sem power-ups, upgrades ou ghost visível. Estrelas independentes: três fragmentos, tempo abaixo do alvo, zero mortes. Recuperar pelo menu conta como morte. Os resultados assistidos não substituem estrelas, medalhas ou recordes puros. Os valores-alvo ficam em `origin-balance.js`; são referências do bot, não tempos humanos já calibrados.

Os dados v14, clássicos, medalhas, tempos e preferências antigos nunca são escritos pela nova campanha. Migração por leitura. Novos resultados: `echo404_origin_campaign_v15`; preferências: `echo404_origin_settings_v15`; relatórios: `echo404_origin_tests_v15` (últimas 300 sessões); economia: `echo404_origin_economy_v15`; ghosts: `echo404_origin_ghost_v15:{id}:{operador}`. Sem contas, analytics remoto ou sincronização entre dispositivos. Falhas de quota são tratadas sem apagar dados antigos.

Assistido: abrandamento de ameaças, íman e escudo extra; fragmentos por primeira conclusão nível/operador permitem reduzir recargas em passos de 2%, até 10%. Ghost do melhor tempo puro por operador. Sem pagamentos ou anúncios.

## Desenvolvimento

`npm ci`, `npm run dev`. Usar Vite: os imports JSON de Tiled são processados pelo bundler. `npm run maps:export` valida os JSON e atualiza as entradas. `npm run build` gera `dist/`, com base relativa e as URLs antigas preservadas. GitHub Actions valida e publica o build em Pages.

- `npm test`: sintaxe, navegação, áudio, persistência e cache.
- `npm run test:phaser`: física real, treino, habilidades, percursos isolados e lifecycle.
- `npm run test:v15`: migração de gravações v14 produzidas pela implementação estável, estrelas, sensores, mapas e manifest.
- `npm run test:bot`: 25 × 3 partidas contínuas, comandos normais, dano ativo, sem habilidades, teletransporte ou imunidade artificial; grava `docs/reports/bot-results.json`.

Os testes isolados usam posicionamento/imunidade para verificar geometria. O bot contínuo não usa esses atalhos; pode morrer e continuar normalmente a partir de checkpoints. As conclusões não equivalem a 75 partidas sem morrer. Consultar os resultados por nível/operador.

## Arquitetura

`origin-pilot.js` coordena a cena. `origin-modules/` separa movimento, ecos, elevador, dispositivos, inimigos, HUD, treino e habilidades. Os módulos são registados na cena e importados por entradas ES modules em `src/`, preservando compatibilidade com o harness Node. `origin-tiled.js` adapta object layers dos 25 JSON em `maps/`. `origin-devices.js` contém a lógica independente dos sensores/links. `origin-session.js` gere dados novos e relatórios. Phaser 3.90.0 é local, MIT. Web Audio mantém os sons sintetizados; não foi necessário introduzir Howler.

## Limites de validação

Não confirmado: iPhone real, FPS/GPU/memória em gama baixa, recuperação de áudio em chamadas, Lighthouse, APK/AAB/iOS e duração humana de primeira conclusão de 2–4 minutos. A opção de reduzir efeitos desliga partículas/shake/scanlines; o backdrop blur foi removido preventivamente, sem alegar uma medição GPU real.

Ver `docs/TILED.md`, `docs/LICENSES.md`, `docs/MOBILE-PUBLISHING.md` e `docs/reports/`.
