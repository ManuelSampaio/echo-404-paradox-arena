# ECHO//404 v16.0.0 — SINAL DE REBELIÃO

17 de novembro de 2026. Branch `feat/v16-action-campaign`, a partir da main `6c8a00e`. Atualização autorizada pelo proprietário, incluindo commits, push, PR e merge condicionado aos testes.

## O que foi feito

| Tarefa | Implementação / commit |
|---|---|
| Auditoria e correções | Repetidos os testes de base, com 75/75 conclusões da v15. Corrigidos relatórios inválidos que bloqueavam missões e agregados puros substituídos por partidas assistidas. [a26b140](https://github.com/ManuelSampaio/echo-404-paradox-arena/commit/a26b140e781d317b2315e8b57dfb6c0a3005967d) |
| Combate | PULSO / F para os três operadores, incluindo puro: disparo contínuo, recarga de 0,42s, mira assistida à frente, impactos, atordoamento, desativação permanente na sessão e interceção de projéteis. Cobertura bloqueia disparos. Drone 1 impacto, patrulha/caçador 2, sentinela 3. [54e7852](https://github.com/ManuelSampaio/echo-404-paradox-arena/commit/54e785296f9b3b007c316b0b46219430bc996a5d) |
| Objetivos | Exploração, assalto com quota, sabotagem por disparo, relés por contacto, sequência ordenada e defesa de transmissor. Defesa requer presença na zona e acrescenta até três reforços com aviso de 0,85s. Mesma implementação do commit de combate. |
| 25 níveis | IDs mantidos; 24 percursos reestruturados com corredores, descidas, salas, ilhas e terraços; cinco perfis combinados com cinco mundos de eco. O nível 1 conserva a aprendizagem original. Os elevadores e puzzles temporais continuam, combinados com combate/objetivos. [646db12](https://github.com/ManuelSampaio/echo-404-paradox-arena/commit/646db123d81ddf42e227bb5a3bc3ef480a64afab) |
| Tiled | Validação reforçada de layers, IDs semânticos, links, dispositivos e rota. JSON é autoritativo. Exportação normal nunca regenera geometria. Testes negativos e validação do esquema de operação. |
| Progresso | v16 usa chaves próprias; lê v14/v15 e preferências antigas sem escrever nessas chaves. Os recordes da geometria antiga ficam como histórico. Fixtures produzidas por serializers v14 e v15 reais provam preservação dos bytes nos 25 IDs. |
| Só versão atual | Retirada a pasta v14-stable e o workflow que a preservava no site. Entradas antigas são redirecionamentos. Build publica apenas runtime atual e recursos necessários; motores clássicos não entram. Histórico Git e tag original mantidos. [4b85e12](https://github.com/ManuelSampaio/echo-404-paradox-arena/commit/4b85e125b026220595c6f4b42306925c0a1a179d) |
| Apresentação | Botão PULSO encaixado na grelha existente sem acrescentar uma terceira fila, sons sintetizados próprios, impactos, cenografia de salas e central atualizada. Mantidos reduzir efeitos, portrait e assinatura MANUEL SAMPAIO01. Inspiração genérica de ficção científica; sem assets/personagens/músicas de Star Wars. |
| Equilíbrio | Tempos-alvo recalculados a partir do bot final ×2,2, arredondados a 5s e mínimo 60s. Dash e habilidades mantidos: não houve evidência humana suficiente para os alterar. Habilidades não são necessárias a nenhuma das 75 conclusões. |

## Confirmado por teste

Passaram localmente: `npm run maps:export`, `npm test`, `npm run test:phaser`, `npm run test:v15`, `npm run test:action`, `npm run test:bot`, `npm run build`, `npm run test:build`, `git diff --check`.

- Phaser Arcade real: saltos dos 25 mapas, ecos/elevador, treino, operadores, habilidades, checkpoint, pausa, rotação, page lifecycle, navegação e gravação.
- Combate real: projéteis contra inimigo e cobertura, cooldown, takedown persistente após morte, toque independente para movimento/disparo, cancelamento, sabotagem, ordem e relógio de defesa que congela em pausa e fora da zona.
- Persistência: dados inválidos, quota indisponível, puro→assistido→puro e migrações produzidas pelos serializers originais v14/v15. Os dados antigos não são apagados quando a edição antiga sai do site.
- Atualização dos workers v14 e v15 para v16, cache antigo removido sem tocar em localStorage, fallback offline/HTTP 500, manifest/ícone maskable e recursos do build.
- As 25 entradas e os três operadores continuam disponíveis. O build não contém v14-stable nem runtimes clássicos; URLs antigas redirecionam.
- Renderizações Canvas do Phaser inspecionadas, incluindo uma sala da missão 9. Isto não equivale a uma inspeção de Safari/iPhone nem do layout CSS no browser.

## Bot contínuo final — por nível e operador

Comandos normais de movimento/eco/PULSO, dano ativo, recolha natural dos três fragmentos e objetivos reais, sem habilidades, sem teletransporte ou imunidade artificial. Conhece a rota do mapa; não é um jogador exploratório. Recuperações são normais em checkpoints/plataformas. A suite isolada de saltos usa posicionamento/imunidade e é reportada separadamente.

**75/75 conclusões; 24 mortes no total.** Tempos de simulação entre 25.8 e 71.7 segundos. Não são 75 partidas sem morrer.

| Nível / ID | Objetivo | AXIOM (tempo / mortes) | NYRA | KAI-7 |
|---|---|---|---|---|
| 01 / origin | explore | PASSOU · 25.8s / 0 | PASSOU · 25.8s / 0 | PASSOU · 25.8s / 0 |
| 02 / drift | sabotage | PASSOU · 34.2s / 0 | PASSOU · 34.2s / 0 | PASSOU · 34.2s / 0 |
| 03 / resonance | relay | PASSOU · 39.3s / 0 | PASSOU · 39.3s / 0 | PASSOU · 39.3s / 0 |
| 04 / mirage | sequence | PASSOU · 31.5s / 0 | PASSOU · 31.5s / 0 | PASSOU · 31.5s / 0 |
| 05 / window | defend | PASSOU · 47.4s / 0 | PASSOU · 47.4s / 0 | PASSOU · 47.4s / 0 |
| 06 / junction | sabotage | PASSOU · 40.4s / 0 | PASSOU · 40.4s / 0 | PASSOU · 40.4s / 0 |
| 07 / interference | relay | PASSOU · 35.1s / 0 | PASSOU · 35.1s / 0 | PASSOU · 35.1s / 0 |
| 08 / trace | sequence | PASSOU · 41.7s / 0 | PASSOU · 41.7s / 0 | PASSOU · 41.7s / 0 |
| 09 / reflection | defend | PASSOU · 47.8s / 2 | PASSOU · 47.8s / 2 | PASSOU · 47.8s / 2 |
| 10 / escape | assault | PASSOU · 44.4s / 0 | PASSOU · 44.4s / 0 | PASSOU · 44.4s / 0 |
| 11 / current | relay | PASSOU · 41.5s / 0 | PASSOU · 41.5s / 0 | PASSOU · 41.5s / 0 |
| 12 / frequency | sequence | PASSOU · 39.4s / 0 | PASSOU · 39.4s / 0 | PASSOU · 39.4s / 0 |
| 13 / between | defend | PASSOU · 51.9s / 1 | PASSOU · 51.9s / 1 | PASSOU · 51.9s / 1 |
| 14 / phasebridge | assault | PASSOU · 38.5s / 0 | PASSOU · 38.5s / 0 | PASSOU · 38.5s / 0 |
| 15 / fracture | sabotage | PASSOU · 46.6s / 0 | PASSOU · 46.6s / 0 | PASSOU · 46.6s / 0 |
| 16 / blind | sequence | PASSOU · 41.2s / 0 | PASSOU · 41.2s / 0 | PASSOU · 41.2s / 0 |
| 17 / order | defend | PASSOU · 47.9s / 2 | PASSOU · 47.9s / 2 | PASSOU · 47.9s / 2 |
| 18 / presents | assault | PASSOU · 46.9s / 0 | PASSOU · 46.9s / 0 | PASSOU · 46.9s / 0 |
| 19 / silence | sabotage | PASSOU · 35.8s / 0 | PASSOU · 35.8s / 0 | PASSOU · 35.8s / 0 |
| 20 / overload | relay | PASSOU · 46.8s / 0 | PASSOU · 46.8s / 0 | PASSOU · 46.8s / 0 |
| 21 / signatures | defend | PASSOU · 71.7s / 3 | PASSOU · 71.7s / 3 | PASSOU · 71.7s / 3 |
| 22 / maze | assault | PASSOU · 42.4s / 0 | PASSOU · 42.4s / 0 | PASSOU · 42.4s / 0 |
| 23 / lastwindow | sabotage | PASSOU · 43.9s / 0 | PASSOU · 43.9s / 0 | PASSOU · 43.9s / 0 |
| 24 / paradox | relay | PASSOU · 38.6s / 0 | PASSOU · 38.6s / 0 | PASSOU · 38.6s / 0 |
| 25 / archive | sequence | PASSOU · 51.3s / 0 | PASSOU · 51.3s / 0 | PASSOU · 51.3s / 0 |

Dados completos, incluindo tiros, inimigos desativados, objetivos e recuperações: [bot-results.json](bot-results.json). Tempos iguais entre operadores são esperados: o bot não usa as habilidades específicas.

## Falhas encontradas e resolvidas durante o trabalho

- Resumo de estrelas: a partida assistida sobrescrevia o campo agregado; agora a última sessão e as conquistas puras estão separadas.
- Relatórios válidos em JSON mas com `runs:null` lançavam exceção: validação de estrutura e falhas isoladas; economia/ghosts/settings também normalizados.
- Primeiras entradas em percursos descendentes coincidiam com a laje de partida: primeira plataforma reposicionada para cima e para fora da laje, mantendo descidas posteriores.
- O antigo solver presumia sobreposição vertical e subidas: foi adaptado para travar sobre a plataforma-alvo e saltar para fora da laje em descidas, sem reposicionar o corpo.
- O bot tentava atacar inimigos ou recolher objetos distantes na mesma altitude: agora limita interações à plataforma onde está. Isto corrige o controlo do bot, não elimina ameaças do jogo.
- Relé de defesa podia ativar-se por contacto antes da rotina do bot: o bot passa a esperar ativamente na zona até completar o objetivo; reforços e mortes ficam no resultado.
- Os objetivos adicionais são verificados pelo bot contínuo. Os testes isolados de geometria preparam objetivos para poderem avaliar apenas saltos, explicitamente identificados no código.

Não foram apagados testes para esconder falhas. As referências à edição estável foram adaptadas para fixtures de serialização e histórico Git, pois essa edição foi retirada por pedido do proprietário.

## Não confirmado

- iPhone físico, Safari real, conforto dos seis botões em duas mãos, instalação PWA em todos os sistemas.
- FPS/GPU/memória em gama baixa e sessão longa, áudio após chamadas/notificações reais, Lighthouse.
- Duração humana de 2–4 minutos e todos os percursos perfeitos sem mortes por operador. Os tempos de estrelas são referências do bot, ajustáveis em `origin-balance.js`.
- APK/AAB/iOS e lojas. Capacitor continua apenas preparado, sem publicação ou pagamentos.
- O Chromium local não arrancou: o ambiente recusou criar sockets; Vite preview também encontrou uma restrição de interfaces de rede. A compilação e os testes Phaser/Canvas passaram. Uma verificação posterior do site publicado deve ser distinguida deste teste local.

## Como testar no telemóvel

1. Abrir [o jogo](https://manuelsampaio.github.io/echo-404-paradox-arena/) com internet, atualizar e confirmar **v16.0.0**. Não apagar dados do site.
2. Escolher qualquer nível e operador. Deixar MODO PURO ligado para avaliar a dificuldade base. Preferências de treino antigas são reconhecidas; PRATICAR permite repetir.
3. Mover e saltar com uma mão enquanto manténs PULSO com a outra. Os tiros miram alvos à frente; muda de direção para virar. Inimigos e relés de sabotagem aceitam impactos; paredes bloqueiam tiros.
4. Experimentar: missão 2 (sabotagem), missão 5 (defesa), missão 9 (defesa com botão), missões 21–25 (dois ecos e nó local). Seguir o briefing próprio de cada missão e recuperar sempre os três fragmentos.
5. Testar pausa, voltar ao checkpoint, rotação, sair/regressar ao navegador e CONTINUAR. Uma recuperação conta como morte; ecos fixados e inimigos desativados mantêm-se na sessão. Reiniciar o nível repõe a operação.
6. Abrir [modo de relatório](https://manuelsampaio.github.io/echo-404-paradox-arena/origin-reborn.html?debug#nivel=1), jogar e tocar em **RELATÓRIO LOCAL → COPIAR RELATÓRIO**. Se a cópia falhar, selecionar o texto da caixa e copiar manualmente. Enviar esse texto para afinar os níveis.
7. Testar modo assistido separadamente; não deve melhorar nem apagar estrelas/tempos puros. Medalhas antigas devem aparecer como histórico na central.

## Riscos e decisões restantes

O objetivo agora é o teste humano dos 25 níveis, sobretudo mira/toque, defesa com reforços e legibilidade portrait. Os saves continuam locais e não sincronizam entre dispositivos. Não há bloqueio funcional conhecido nos 75 percursos contínuos finais; isso não demonstra ausência de todos os bugs nem garante todas as estrelas. A remoção da edição antiga é da publicação atual, não uma reescrita do histórico Git. Novos ajustes de dificuldade devem usar os relatórios do proprietário.

## Correção após verificação da publicação

O deploy passou, mas o navegador recebeu ficheiros `assets/home.js` de uma edição anterior durante a transição, misturando HTML novo e JavaScript antigo. As entradas do Vite passaram a usar nomes com hash do conteúdo, tal como os chunks; foi acrescentada uma regressão no teste de build. Esta correção não altera mapas, combate ou dados guardados. A verificação do site publicado é necessária para confirmar a saída do estado misto.

## Verificação no navegador publicado

Após a correção dos nomes com hash, confirmados na publicação: as descrições novas dos 25 mapas, treino completo pelos botões/teclado, disparo contínuo visível e abertura da missão 25 com objetivo de relés em ordem e dois ecos. O deploy e todas as suites da main passaram. Foi ainda corrigida a reposição do texto/classe do PULSO ao mudar de missão durante a recarga, com regressão Phaser. Esta verificação é num navegador desktop remoto; iPhone/Safari físico, desempenho mobile e áudio após chamadas continuam não confirmados.
