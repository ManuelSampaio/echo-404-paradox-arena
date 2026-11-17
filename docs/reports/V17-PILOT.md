# v17 — Piloto do Mundo 1

17 de novembro de 2026 · 17.0.0-pilot.1

Pré-visualização privada: https://echo404-v17-memoria-piloto.buitanda-5186.chatgpt.site/
Acesso com a conta ChatGPT proprietária. A main/v16 não foi substituída. Não houve merge.

## Implementado

- Guião revisto e sincronizado em STORY.md e JSON: vozes próprias, responsabilidade coletiva, memórias de 40–50 palavras em dois cartões, Ótica Partida e revelação adiada. Só intro/Mundo 1 integram o runtime; mundos 2–5 continuam pendentes de aprovação.
- Dados v17 isolados, histórico antigo apenas por leitura, resultados por operador/modo, Diário, definições, relatório local e importação de histórico. O pacote raiz mantém 16.0.0 porque continua a representar a produção; o piloto mostra a sua versão própria.
- Salto variável único, ataque normal/carregado, defesa por timing, habilidade, ECO secundário. Deslizar para cima em ATACAR ativa PULSO; para baixo ativa esquiva. Teclado/comando mantidos; tamanho, posição, opacidade e lados configuráveis.
- Intro de 40 segundos, treino de sete passos por arma, SALTAR disponível desde o início e confirmação antes de saltar. Veteranos entram no hub. Rever história/treino nas definições.
- NYRA: pistolas duplas. KAI-7: canhão carregável, calor e disparo sincronizado com eco, representação mecânica original. AXIOM: lâmina, combo e defesa por timing.
- Mole, Blindado, Atirador e Elite com avisos, sinais visuais e áudio sintetizado. Cenários originais em três planos, efeitos reduzidos e qualidade adaptativa.
- Três mapas Tiled distintos: subida nas docas; travessia horizontal com vapor e relés; descida e acesso à arena. Fragmentos, segredos, terminal, memórias e puzzles de âncora/elevador. Porteiro com três fases, checkpoint e eco obrigatório no selo na fase 2.
- Build Vite e PWA exclusivos do piloto. Arte reproduzível por script, inventário de licenças e workflow de validação sem deploy da produção.

## Confirmado por teste

Passaram: npm test, npm run test:phaser, npm run test:v15, npm run test:action, npm run build, npm run test:build; npm run test:v17, npm run test:bot:v17, npm run build:v17 e node v17/tests/build.cjs.

Contratos: fixtures produzidas pelos serializadores v14/v15/v16, 75 resultados históricos, leitura/mapeamento e igualdade dos bytes antigos depois de guardar v17. Modos separados; chaves antigas rejeitadas para escrita. Treino executado nas sete etapas com os três operadores; salto variável, gestos/cancelamento, armas, calor, blindagem, defesa e selo do chefe. Build: recursos, manifest portrait, resposta offline e atualização do cache restrita à v17, preservando o cache v16 e sem chamadas a localStorage no worker.

O bot usa Phaser real com comandos normais, dano ativo, recolha de três fragmentos, gravação/fixação do eco e elevador. Não reposiciona o corpo nem concede imunidade artificial. Não usa habilidades especiais. São percursos conhecidos automatizados: os tempos não representam uma primeira partida humana.

| Zona | NYRA | KAI-7 | AXIOM |
|---|---|---|---|
| 01 | Passou · 20,7 s · 0 mortes | Passou · 21,7 s · 0 | Passou · 21,5 s · 0 |
| 02 | Passou · 27,0 s · 0 | Passou · 28,4 s · 0 | Passou · 28,4 s · 0 |
| 03 + Porteiro | Passou · 44,0 s · 1 | Passou · 56,9 s · 1 | Passou · 48,1 s · 0 |

As duas mortes foram causadas por projéteis do Porteiro na fase 3. O chefe chegou a 0 HP nos três casos; o selo exigiu eco na fase 2. Dados completos em V17-BOT.json.

Correções durante a validação: orientação do bot junto ao chefe; uso de disparo normal quando KAI sobreaquece; pausa de impacto aplicada também à IA/projéteis, para não atrasar apenas o jogador. Cancelamento de carga em gestos/pausa e defesa sem renovação abusiva por spam.

## Como testar

1. No telemóvel, abre a pré-visualização acima e entra com a tua conta ChatGPT. Usa portrait; começa pelo modo puro.
2. Caso novo: usa um perfil/navegador sem dados desta pré-visualização. A intro deve anteceder o treino, com SALTAR visível. Completa o treino e entra no hub.
3. Escolhe cada operador e testa as três zonas. Compara toque curto/segurar SALTAR; toca/segura ATACAR; desliza para cima/baixo nesse botão para PULSO/esquiva. Experimenta o layout nas definições.
4. No Porteiro, observa os avisos; na segunda fase fixa um eco sobre o selo. Experimenta morrer e voltar ao checkpoint.
5. Nas definições, revê história e treino. No Diário verifica cartões e terminais, sem repetição automática de memórias já vistas.
6. Acrescenta ?debug ao endereço. Usa o painel de testes e COPIAR RELATÓRIO depois de jogar; envia o texto com tentativas, mortes, causas e tempos.
7. Caso antigo: esta pré-visualização tem outra origem, por isso não vê o localStorage do GitHub Pages. Se já tens um ficheiro de histórico, usa Histórico v14–v16 → IMPORTAR HISTÓRICO (JSON com chaves e respetivos valores brutos). Só grava a cópia importada em dados v17. Não apagues os dados da v16. A migração automática na mesma origem foi comprovada pelas fixtures, não no teu telemóvel.
8. Reabre a pré-visualização após uma visita online e testa offline. O acesso privado pode exigir autenticação online; não foi confirmado offline num dispositivo físico.

## Não confirmado e riscos

- iPhone/Android físicos, FPS/GPU, áudio durante chamadas/notificações, ergonomia dos gestos, conforto do corpo a corpo e comando físico.
- Leitura efetiva dos teus dados privados reais; só fixtures dos serializadores reais foram usadas. Não existe exportação guiada na v16 nesta entrega.
- Duração de 2–4 minutos na primeira conclusão, exploração livre e dificuldade humana. O bot conhece a rota e pode falhar caminhos alternativos.
- Verificação visual da publicação: o endereço respondeu com o acesso privado, mas o início de sessão impediu a inspeção do jogo neste navegador. Publicação confirmada pelo serviço; UI publicada não confirmada visualmente.
- Os testes de cache são simulação do ciclo install/activate/fetch; instalação e atualização PWA em dispositivos reais ainda precisam de validação.
- Lighthouse e custos reais de renderização mobile não medidos. Tempos e estrelas são provisórios até ao teu teste.

Paragem deliberada no piloto: sem integração dos mundos 2–5, sem finais jogáveis e sem substituir a produção. Próxima decisão: aprovação do piloto e das versões revistas dos restantes mundos.
