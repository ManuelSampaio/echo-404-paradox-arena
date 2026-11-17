# v17 — plano executável para aprovação

Estado: **planeamento e guião; nenhuma alteração de gameplay integrada**. Base: v16.0.0, main `d154cbd28487b4297fbe6bdc7213920eaf8ddd02`. A tag `v16.0.0-stable` deve apontar a esse commit e nunca ser deslocada. Não recriar uma edição antiga no site: a salvaguarda é Git, mantendo a publicação atual intacta.

Entrada do pedido: briefing «A MEMÓRIA DA ESTAÇÃO». Esta proposta substitui a obrigação de conservar 25 níveis jogáveis por 15 zonas novas; os 25 IDs anteriores continuam preservados no histórico.

## Portas de aprovação

1. **Agora:** aprovar `docs/STORY.md`, a origem de ECHO e os finais. O JSON em `docs/v17/story.pt-PT.draft.json` é uma proposta de dados, não conteúdo carregado pelo jogo.
2. **Depois:** implementar controlos → armas → hierarquia → mundo 1 completo. Publicar apenas com suites aprovadas. Entregar três zonas jogáveis e parar para teste do proprietário no telemóvel.
3. **Só após esse teste:** mundos 2–5, chefes restantes, Diário completo, final e polimento. Não apresentar as doze zonas planeadas como já jogáveis.

Os cinco chefes e o final são escritos agora para permitir avaliar o arco inteiro; isso não autoriza antecipar a implementação dos mundos 2–5 antes do teste do piloto.

## Duração e âmbito

15 × 3–5 minutos = 45–75 minutos de primeiras conclusões. As 1h30–2h30 só são compatíveis com exploração, treino, replays e tentativas adicionais; não constituem uma duração comprovada. Proposta: manter 3–5 minutos como alvo de zona e medir o total humano no piloto. Não acrescentar espera obrigatória para fazer caber um número.

Não é um metroidvania: não há backtracking obrigatório entre mundos, inventário livre nem portas obrigatórias exclusivas de um operador. Segredos e atalhos são locais. Durante a fase de teste, todas as zonas implementadas ficam selecionáveis; resultados antigos não simulam conclusões novas.

## Tabela das quinze zonas

| ID / zona | Ambiente e momento marcante | Estrutura / objetivo | Novos papéis e combinações | Regra de eco / chefe | Memória principal |
|---|---|---|---|---|---|
| m1-z1 · Câmara de Eco | Luzes de emergência desenham a primeira rota; o primeiro eco fica visível do outro lado de uma porta | Vertical curta, varanda lateral e regresso; exploração | Mole; elite combina avanço e aviso de tiro | Âncora e elevador, sem habilidade obrigatória | Acordei como reconstrução |
| m1-z2 · Cais sem Tripulação | Vapor em ciclos claros, guias de luz nas zonas seguras; uma nave imobilizada ocupa o fundo | Horizontal com uma descida e sala de combate; sabotagem | Atirador e mole; cobertura baixa | Eco mantém o acesso à grua durante sabotagem | Sou a memória de um piloto |
| m1-z3 · Portão de Quarentena | Contrapesos imensos enquadram uma arena baixa; a porta abre-se pela primeira vez | Arena com duas alturas; chefe / assalto | Exame: aviso de golpe + tiro de supressão | O Porteiro; **eco obrigatório** no selo de confirmação | A ordem que me prendeu era minha |
| m2-z1 · Linha de Manutenção | Vapor mostra e oculta a rota, com aviso de pressão por forma e som | Descida em salas; relés | Blindado introduzido sozinho, depois com mole | Botão e porta; PULSO abre janela de atordoamento para qualquer arma | Uma memória não cabe numa pessoa |
| m2-z2 · Galeria dos Moldes | Moldes vazios iluminados um a um; primeiro encontro com uma cópia incompleta | Horizontal em salas largas; ordem e segredo superior | Esquivo, blindado, elite combina recuo e proteção | Eco sustenta a porta enquanto se percorre a sequência | AXIOM, NYRA e KAI-7 formaram o sinal |
| m2-z3 · Coração da Forja | Pinças industriais mudam a cobertura entre fases | Arena central e corredores laterais; chefe | A Matriz: molde, blindagem e deslocação | Eco dá cobertura/atalho; chefe vencível sem a habilidade de operador | Não preciso de outra tentativa |
| m3-z1 · Observatório Cego | Escuridão parcial e cones baratos de luz; o observatório revela que todas as lentes apontam para dentro | Salas em cotovelos; exploração | Esquivo com atirador; enxame apresentado em número reduzido | Eco desliga lasers; perigos continuam visíveis sem depender da lanterna | A experiência causou a falha |
| m3-z2 · Corredor das Refrações | Janelas de luz revelam os registos rejeitados | Galerias cruzadas e descida; relés em ordem | Enxame + atirador; elite alterna recuo e tiro | Sensores independentes desligam grupos de laser, sem eliminações como atalho | Os ecos eram tentativas descartadas |
| m3-z3 · Câmara de Inspeção | Obturadores revelam uma nave ainda ligada ao cais | Arena com três baias seguras; chefe | O Prismático: rastreio, feixe e área avisada | **Eco obrigatório**, como isco e ocupante do sensor que expõe o núcleo | As pessoas estão interrompidas, não perdidas |
| m4-z1 · Reservatório Suspenso | Água rasa reflete avisos; uma gota parece suspensa no fundo | Horizontal com ilhas e diferenças baixas de altura; defesa | Enxame fraco e blindado; sem afogamento ou natação nesta versão | Plataformas móveis e janela temporal | A energia da nave sustenta o laço |
| m4-z2 · Anel de Transferência | Comportas alteram passagens seguras; o regresso revela marcas deixadas pelo próprio jogador | Circuito curto com retorno local e subida final; sabotagem | Atirador + esquivo; elite de tiro/avanço | Eco cronometrado, sem consumos de energia para o nó local | Eu ensinei o sistema a deter-me |
| m4-z3 · Eclusa do Instante | Ondas de pressão visíveis atravessam a arena em intervalos largos | Arena larga com apoios móveis; chefe | A Eclusa: pressão, retorno, vazão | Eco facilita janelas e cobertura; não exige habilidade especial | A minha dúvida tornou-se regra eterna |
| m5-z1 · Arquivo das Tentativas | Painéis separados respondem com vozes textuais distintas | Salas empilhadas com atalhos; exploração e relés | Combina os papéis anteriores em grupos pequenos | Dois sensores, nó local disponível aos três operadores | Divergir não era uma falha |
| m5-z2 · Ponte dos Dois Presentes | Dois ecos iluminam pontos separados de uma ponte que finalmente se completa | Horizontal descontínua com duas salas de apoio; ordem e defesa curta | Elite combina blindagem e recuo, com janelas verificáveis | Dois ecos coordenados; nenhum salto depende de habilidade | Posso avançar sem gastar as cópias |
| m5-z3 · Sala da Última Escolha | Três núcleos de arquivo cedem e o fundo ganha um horizonte que não se repete | Arena final, caminho seguro até à escolha e créditos | O Curador: padrões combinados sem enxame ilimitado | **Dois ecos obrigatórios**, nó gratuito; fase final legível sem vantagem de operador necessária | O sinal pode acabar sem apagar quem o criou |

Cada zona tem um terminal opcional e/ou atalho com recompensa de exploração. Textos completos, incluindo os quinze terminais, estão no guião. Minimapa é opcional e fica fora do piloto se comprometer a legibilidade; nunca substitui landmarks claros.

## Chefes — desenho verificável

Todos têm checkpoint antes da arena, três fases de vida, barra com nome e indicação de fase. O início de uma fase cancela projéteis antigos e proporciona uma janela segura; diálogos não escondem ataques. Valores abaixo são propostas de configuração para testes, não equilíbrio já confirmado.

| Chefe | Fase 1 | Fase 2 | Fase 3 | Como qualquer operador vence |
|---|---|---|---|---|
| O Porteiro | Braço com marca no chão e aviso ≥0,7s; núcleo aberto após golpe | Eco no selo mantém o painel exposto; jogador sai da linha do disparo | Alterna os dois ataques, sem reduzir o aviso abaixo do limite validado | Arma base da personagem causa dano na abertura; eco/NÓ sem habilidade; interceção com PULSO é alternativa à defesa exclusiva de AXIOM |
| A Matriz | Pinça anuncia local antes de descer | Blindagem fechada; ponto fraco acessível após PULSO ou erro da pinça | Desloca a cobertura entre ciclos completos | NYRA usa o ponto fraco, KAI-7 a carga, AXIOM a aproximação; nenhuma exige energia da habilidade |
| O Prismático | Eco desvia o rastreio; faixa segura marcada por geometria | Sensor ocupado pelo eco abre obturador; jogador ataca núcleo | Combina rastreio e faixas em ordem fixa, com pausas | Utilitário comum cria tempo para reposicionar; a abertura não depende de alcance exclusivo de uma arma |
| A Eclusa | Onda de chão com aviso de pressão | Retorno da onda indicado antes de acontecer | Duas ondas espaçadas e núcleo exposto | Salto variável base e apoios fixos dão uma rota legal; plataformas móveis/eco podem facilitar |
| O Curador | Três núcleos expostos em ordem | Dois nós exigem ecos; núcleo de dano acessível ao jogador | Alterna ataques já ensinados e oferece a última abertura | Nó local fornece segundo eco gratuitamente; armas assinatura normais causam dano; chefes não podem ser apagados por dano fora das janelas |

Combate com eco: ameaça e isco, botões e sincronização; nunca autoriza atravessar uma porta cujo grafo de sensores não esteja resolvido. Testes devem provar que eliminar todos os inimigos não abre os puzzles. KAI-7 beneficia de fogo sincronizado, mas não passa a ser obrigatório.

## Controlos propostos para o piloto

Três botões principais à direita, com área útil generosa e posição ajustável: **SALTAR, ATACAR e HABILIDADE**. ECO é secundário e continua visível. Sem dois botões de salto nem botão principal separado para impulso.

- SALTAR: toque/pressão libertada cedo = salto baixo; segurar = alto; manter coyote de 110ms e buffer de 120ms como base a revalidar. Nada de salto diferente por operador.
- ATACAR: toque = arma assinatura; segurar carrega AXIOM/KAI-7 e mantém fogo em NYRA. O normal não deve aguardar uma janela de duplo toque. AXIOM abre uma janela de defesa/reflexo configurável de ~0,2s no toque; geometria/direção e temporização têm de ser testadas para não oferecer defesa automática permanente.
- **PULSO utilitário: deslizar para cima a partir de ATACAR.** Ícone ↑ PULSO sempre acessível na ajuda e no treino. É uma proposta: testar em aparelho real antes de fixar. Evita duplo toque, que introduziria atraso em ataques precisos. Teclado R oferece acesso direto; opção acessível pode mostrar uma pequena tecla PULSO extra.
- **ESQUIVA: deslizar para baixo a partir de ATACAR**, com dead zone que impeça disparos involuntários. Reconhecer um gesto cancela ataque/carga pendente, uma vez por contacto. Não consumir o dedo que mantém movimento ou salto. Teclado Shift.
- ECO: tecla E e botão secundário; HABILIDADE: Q; ataque: F; salto: Espaço; mover: A/D ou setas. Mapeamento de teclado/comando deve usar ações semânticas e oferecer reposição dos valores padrão.
- Layout configurável: tamanho, deslocamento limitado à safe area, troca de lado, opacidade com mínimo legível. Guardar só em definições v17. Ao redimensionar, limitar posições à área disponível. Prever preset de 320px sem sobreposição.
- Pausa/cancelamento/rotação limpam dedos, carga, ataques e gestos. Não há seleção de texto sobre o jogo; Diário/relatório continuam selecionáveis. Nenhuma melhoria de arma altera o gesto nem a janela-base sem configuração explícita.

**Ainda não testado:** todos estes gestos, o conforto de corpo a corpo em portrait e o layout configurável. A proposta de controlo pode mudar após o piloto. Não alegar validação mobile apenas com eventos sintéticos.

## Armas e hierarquia — implementação após aprovação

Tudo orientado por dados: dano, alcance, cadência, preparação, carga, recuperação, stun, hitbox, som e custos. Ficheiros previstos `src/content/weapons.js`, `src/content/enemies.js`, `src/content/bosses.js` e conteúdo `src/content/pt-PT/`; caminhos são propostas, ainda não criados.

Ordem: NYRA → KAI-7 → AXIOM. PULSO comum será principalmente utilitário: relés, interceção e atordoamento, sem eliminar a identidade das armas assinatura. Todas têm dano base suficiente para a rota obrigatória.

| Operador | Identidade base | Três melhorias opcionais a configurar; desligadas no puro |
|---|---|---|
| NYRA | Duas pistolas, disparo em movimento/no ar, cadência alta, mesma física de salto | Perfuração limitada de um alvo; pequena redução da recuperação; capacidade utilitária de atordoamento ligeiramente maior |
| KAI-7 | Andróide industrial, canhão normal/carregado, movimentos mecânicos, carga com calor e arrefecimento claro; eco dispara sincronizado | Carga até 10% mais rápida; arrefecimento ligeiramente maior; pequena melhoria do disparo sincronizado |
| AXIOM | Lâmina angular como ferramenta de condução de plasma, alcance curto, combo de três golpes, orientação assistida sem teletransportar o corpo, defesa/reflexo | Onda curta apenas no fim do combo; recuperação ligeiramente menor; pequeno aumento da barra de atordoamento |

O calor nunca bloqueia indefinidamente o tiro normal nem um puzzle; existe recuperação automática. A energia obtida por impactos alimenta habilidades opcionais, não o NÓ nem os controlos obrigatórios. A janela de defesa não é vendida como upgrade. Armas/silhuetas/sons originais, sem lâmina constante de cor icónica nem zumbido de franquia.

Papéis: mole → atirador → blindado → esquivo → enxame, seguidos de combinações elite. Blindado sempre tem ponto fraco/janela utilizável por NYRA; não pode exigir a carga de KAI-7 ou a lâmina de AXIOM. Enxames têm limite fixo. Atordoamento/finalização usa aviso claro e não depende de cor. A dificuldade vem de leitura e posicionamento, não só de mais HP.

## Esquema de dados e preservação

- **Identidade:** `schemaVersion: 17`, IDs de zona `m1-z1`…`m5-z3`, `operatorId` em axiom/nyra/kai7, versão do pacote separada do esquema.
- `echo404_origin_campaign_v17`: resultados por zona → operador → modo (`pure`, `normal`, `assisted`). Melhor tempo, estrelas independentes, medalha e última sessão separados. Assistido não substitui resultados de outros modos.
- `echo404_origin_settings_v17`: som, efeitos, contraste, daltónico, qualidade, layout, mapeamentos e idioma PT. Valores limitados e validados; restaurar defaults não limpa resultados.
- `echo404_origin_story_v17`: fragmentos principais/opcionais e finais vistos, intro vista/saltada, treino por operador visto/saltado, origem histórica dos desbloqueios. Sem reproduzir automaticamente textos migrados.
- `echo404_origin_economy_v17`: fragmentos, melhorias por arma e IDs de recompensa atribuída, sem farm infinito no mesmo objetivo. Decidir conversão de moeda antiga só após avaliar dados reais; nunca consumir moedas nas chaves antigas.
- `echo404_origin_tests_v17`: sessões limitadas, zona/operador/arma/modo, tempo ativo, mortes com tipo de inimigo/chefe/perigo, fases de chefe, conclusões, intro/treino vistos ou saltados e fragmentos narrativos desbloqueados.
- Leitura de v14/v15/v16 através de adaptadores puros; nenhuma escrita, remoção ou «correção» dessas chaves. Novas escritas só v17 após validação; erro de quota não bloqueia o jogo.
- Histórico apresenta versão + ID antigo + medalha + tempo antigos. Não agregar tempos de mapas diferentes, não converter medalhas em estrelas e não marcar chefes v17 como vencidos por migração.
- Detetar veterano por treino `true` válido numa chave conhecida v14–v17 **ou** resultado de campanha válido nessas versões. JSON inválido/objeto vazio não é prova de conclusão. A decisão deve anteceder intro/treino. Não percorrer outras chaves de aplicações.

### Mapeamento explícito dos 25 IDs antigos

A associação serve o histórico e o Diário, não estabelece equivalência física nem competitiva. Um resultado válido desbloqueia a memória principal equivalente no Diário, com rótulo «Recuperada de um arquivo anterior»; não dispara pop-ups e não dá medalhas, estrelas, moedas nem vitórias de chefes novas.

| Zona nova | IDs antigos preservados |
|---|---|
| m1-z1 | origin |
| m1-z2 | drift, resonance |
| m1-z3 | mirage, window |
| m2-z1 | junction |
| m2-z2 | interference, trace |
| m2-z3 | reflection, escape |
| m3-z1 | current |
| m3-z2 | frequency, between |
| m3-z3 | phasebridge, fracture |
| m4-z1 | blind |
| m4-z2 | order, presents |
| m4-z3 | silence, overload |
| m5-z1 | signatures |
| m5-z2 | maze, lastwindow |
| m5-z3 | paradox, archive |

Fixtures: reutilizar outputs reais v14/v15 e acrescentar serializer v16 congelado da tag nova; testar vazio, parcial, completo, dados interrompidos/inválidos e quotas. Comparar os bytes de todas as chaves antigas antes/depois de iniciar, concluir, comprar, saltar intro/treino, atualizar worker e regressar ao hub.

## Apresentação, acessibilidade e orçamento

Piloto com assets procedurais próprios e licença MIT do projeto; nada externo é necessário para avançar. Registar cada gerador/output em `docs/LICENSES.md`. Três camadas de parallax com silhuetas distintas por zona, desligáveis no perfil baixo. Luzes simples em Canvas; nada de shaders pesados. Vapor no mundo 1/2, luz/lasers no 3, comportas/água rasa no 4 e arquitetura temporal no 5 têm sinais por geometria/ícone, não só cor.

Contraste alto e modos daltónicos devem preservar perigos, silhuetas e plataformas; efeitos ambientais não tapam hitboxes. Hit-stop proposto ~50ms só em impactos relevantes, sem congelar interface ou estender invulnerabilidade por engano. Reduzir efeitos desliga shake/partículas decorativas/transições animadas. Som por Web Audio gerado localmente, sem narração nem Howler salvo ganho medido.

Perfil automático deve usar uma janela de frames com histerese para não alternar continuamente. Medir frame time p50/p95, partículas e custo de camadas em baixa/média/alta; comparar sombras/gradientes com opções desligadas no mesmo cenário. Backdrop-filter já não é necessário no jogo atual: não reintroduzir para depois «otimizar». Nenhuma medição desktop prova desempenho iPhone.

## Ordem, commits e testes futuros

| Etapa | Alterações pequenas e revisáveis | Gate |
|---|---|---|
| 1 · esta PR | Plano, mapeamento histórico e guião/dados PT em rascunho; tag v16 estável | Aprovação do guião. Não mexer no runtime nem publicar v17 |
| 2 · controlos/onboarding | Ações semânticas → salto único → ataque/gestos → layout → deteção de veterano → replay opcional | Cancelamento/multi-pointer, safe areas, fixtures v14–v16 e treino dos três operadores; conforto físico ainda pendente |
| 3 · armas | NYRA, depois KAI-7, depois AXIOM; uma configuração e suite por arma | Cadência, carga, calor, hitboxes, parry, energia, pureza e eco. Se AXIOM não estiver polido, reportar explicitamente a limitação, não anunciar três armas prontas |
| 4 · inimigos | Introdução por papéis, pontos fracos, stun/finalização e elites | Telegraph, cobertura, dano justo e possibilidade com cada arma base |
| 5 · piloto | Três zonas do mundo 1, chefe completo, história aprovada, ambiente e áudio próprios, Diário parcial | Bot 3 × 3 sem atalhos; testes de chefe/eco/armas, migração, cache, build, Tiled. Relatório e pausa para teste mobile |
| 6 · campanha restante | Um mundo de cada vez, dois níveis + chefe | Só após aprovação do piloto; bot 15 × 3 no fim, sem imunidade ou reposicionamento |
| 7 · final | Diário completo, escolhas, créditos, estatísticas e variante opcional | Fluxos novos/veteranos, replays sem repetição, finais sem apagar saves, todos os testes e publicação final |

O bot deve usar as ações reais de toque/teclado, refletir as armas e resolver sensores. Registar mortes por causa e tempo/fase de chefe. Testes isolados de hitbox/padrões podem preparar posições; a suite contínua nunca os usa. Separar conclusão de obtenção das três estrelas. Tempos-alvo ficam por dados e com marca de calibração humana pendente.

## Confirmado nesta entrega / não confirmado

**Confirmado por revisão:** main v16 no SHA acima; guião e plano são ficheiros de documentação; 15 zonas e cinco chefes definidos; todos os 25 IDs antigos aparecem uma vez no mapeamento; nenhum import do runtime aponta para o JSON de rascunho. A tag só deve ser anunciada como publicada depois da leitura do ref remoto.

**Não implementado nem testado como gameplay v17:** controlos, armas assinatura, hierarquia, chefes, quinze mapas, intro/Diário, migração v17 e perfis de qualidade. Estes documentos não são prova de execução. O relato «v16 funciona no telemóvel» vem do proprietário; não equivale a nova medição de FPS/Safari.

Próxima ação depende da aprovação do guião, sobretudo da origem partilhada de ECHO e do final. O primeiro checkpoint jogável posterior será apenas o mundo 1, nunca a campanha inteira sem o teste do proprietário.
