# ECHO//404 v15 — relatório da atualização final

Data: 16-11-2026. Branch: feat/v15-final-playtest. PR de salvaguarda #41; PR de atualização #42.

## Alterações por tarefa

1. Salvaguarda: tag v14.2.0-stable no commit 6ffc120; /v14-stable/ publicado antes de mudar o jogo, com escritas isoladas. Correções: recuperação pelo menu conta como morte; gravação interrompida é cancelada e ecos fixados mantêm-se; dados novos em v15; manifest portrait, identidade e ícone maskable; eventos pagehide/pageshow/rotação; áudio suspenso/retomado através do contexto; linha de visão por segmento e hitboxes alinhadas; instruções de saída por posição; curva inicial de patrulhas; CSS sem declarações repetidas para o mesmo contexto/seletor; lista explícita de cache; LICENSES.md.
2. Teste humano: 25 níveis sempre disponíveis, versão no rodapé, modo puro por defeito, reduzir efeitos e ?debug com relatório copiável. Registo local das últimas 300 sessões por nível/operador e causas.
3. Bot: 75 conclusões com dano ativo, 3 fragmentos naturais, eco gravado, elevador físico e nós de segundo eco, sem habilidades. Mortes e recuperações não são omitidas. Resultados detalhados abaixo e em bot-results.json. Testes de migração usam resultados serializados pela implementação v14 congelada, não gravações privadas extraídas do iPhone do proprietário.
4. Sistemas: módulos de movimento, treino, HUD, habilidades, ecos, elevador, inimigos e mecanismos; atualização do eco separada do elevador; sensores e dispositivos ligados por IDs com AND.
5. Ferramentas: 25 mapas Tiled, validação/adaptação e comparação; Vite com base relativa; workflow GitHub Actions/Pages; Capacitor 8 configurado e documentado, sem geração ou publicação nativa.
6. Conteúdo: cinco mundos; botões, portas, lasers com aviso, plataformas móveis, janela de sensor 8/12s e puzzle de dois ecos com nó local. Salas empilhadas, ilhas e terraços substituem parte dos ziguezagues. Nem todas as plataformas móveis são obrigatórias: também existem como apoios/rotas alternativas. Estrelas independentes e histórico v14 visível.
7. Assistido: abrandamento de ameaças, íman, escudo, moeda por primeira conclusão e upgrades de recarga de 2% até 10%; ghosts de melhores tempos puros por operador. Assistido não altera estrelas/medalhas/recordes puros. Sem pagamentos ou anúncios.
8. Apresentação: partículas, rastos, scanlines e shake controlados; reduzir efeitos; Web Audio mantido. Removido backdrop blur preventivamente. Zoom mínimo 0,38. Custo GPU em aparelho real não medido.
9. Equilíbrio: dash mantém duração 0,14s, mas imunidade só nos primeiros 0,06s. Recargas AXIOM/NYRA/KAI-7 mantidas em 8/4/12s porque o bot base não fornece evidência suficiente para mudar as habilidades. Alvos de estrelas em origin-balance.js, derivados do bot ×1,65 com mínimo 75s; exigem calibração humana.

## Falhas encontradas e correções

- Jogo: echoPoint sobrevivia a um restart e podia acionar o elevador antes da chegada; estado limpo em create().
- Mapas: entradas no elevador demasiado dependentes de timing; elevadores posteriores reposicionados, plataforma inferior mais baixa e chamada automática enquanto se espera junto à âncora.
- Mapas: novas salas criavam intervalos largos; centros consecutivos limitados e travessias novamente verificadas.
- Mapas: patrulhas deixavam de corresponder às plataformas editadas; reposicionadas na geometria final, fora da direção principal de saída.
- Mapas: lasers podiam alcançar a aproximação ao botão de desativação; deslocados para depois desse exercício.
- Bot: não reconhecia conclusão no ar e interpretava algumas conclusões como falhas de aterragem; condição corrigida.
- Bot: não reconhecia touching.down em plataformas dinâmicas; corrigido. Recolha exige caminhada natural sobre os fragmentos. Recuperação usa apenas comandos e checkpoints reais.
- Dependências: preparação Capacitor atualizada para 8.6.2; npm audit --omit=dev sem vulnerabilidades reportadas no momento da execução. Isto não é uma auditoria completa de segurança.

## Confirmado por teste

npm test; npm run test:phaser; npm run test:v15; npm run test:bot; npm run build. Inclui física Arcade real, treino/habilidades, novo ciclo de morte/pausa, atualização de worker v14→v15, chaves antigas inalteradas, geometria Tiled, AND de dois sensores, isolamento de resultados e margem segura do ícone.

A suite de saltos isolados usa posicionamento/imunidade para validar geometria; a suite contínua abaixo não usa esses atalhos. Passar com mortes não prova obtenção da estrela sem morrer.

## Resultados contínuos por nível e operador

Formato: conclusão · segundos de simulação / mortes. Tempos idênticos entre operadores são esperados: o bot não usa habilidades e o movimento base é partilhado.

| Nível | ID | AXIOM | NYRA | KAI-7 |
|---:|---|---|---|---|
| 1 | origin | PASSOU · 25.7s / 0 | PASSOU · 25.7s / 0 | PASSOU · 25.7s / 0 |
| 2 | drift | PASSOU · 23.6s / 0 | PASSOU · 23.6s / 0 | PASSOU · 23.6s / 0 |
| 3 | resonance | PASSOU · 23.3s / 0 | PASSOU · 23.3s / 0 | PASSOU · 23.3s / 0 |
| 4 | mirage | PASSOU · 23.6s / 0 | PASSOU · 23.6s / 0 | PASSOU · 23.6s / 0 |
| 5 | window | PASSOU · 24.9s / 0 | PASSOU · 24.9s / 0 | PASSOU · 24.9s / 0 |
| 6 | junction | PASSOU · 30.2s / 0 | PASSOU · 30.2s / 0 | PASSOU · 30.2s / 0 |
| 7 | interference | PASSOU · 29.1s / 0 | PASSOU · 29.1s / 0 | PASSOU · 29.1s / 0 |
| 8 | trace | PASSOU · 27.8s / 0 | PASSOU · 27.8s / 0 | PASSOU · 27.8s / 0 |
| 9 | reflection | PASSOU · 27.3s / 0 | PASSOU · 27.3s / 0 | PASSOU · 27.3s / 0 |
| 10 | escape | PASSOU · 36.4s / 1 | PASSOU · 36.4s / 1 | PASSOU · 36.4s / 1 |
| 11 | current | PASSOU · 32.8s / 1 | PASSOU · 32.8s / 1 | PASSOU · 32.8s / 1 |
| 12 | frequency | PASSOU · 35.6s / 1 | PASSOU · 35.6s / 1 | PASSOU · 35.6s / 1 |
| 13 | between | PASSOU · 34.5s / 1 | PASSOU · 34.5s / 1 | PASSOU · 34.5s / 1 |
| 14 | phasebridge | PASSOU · 44s / 1 | PASSOU · 44s / 1 | PASSOU · 44s / 1 |
| 15 | fracture | PASSOU · 34.3s / 1 | PASSOU · 34.3s / 1 | PASSOU · 34.3s / 1 |
| 16 | blind | PASSOU · 37.5s / 1 | PASSOU · 37.5s / 1 | PASSOU · 37.5s / 1 |
| 17 | order | PASSOU · 32.9s / 1 | PASSOU · 32.9s / 1 | PASSOU · 32.9s / 1 |
| 18 | presents | PASSOU · 38.6s / 1 | PASSOU · 38.6s / 1 | PASSOU · 38.6s / 1 |
| 19 | silence | PASSOU · 34.6s / 1 | PASSOU · 34.6s / 1 | PASSOU · 34.6s / 1 |
| 20 | overload | PASSOU · 79.7s / 3 | PASSOU · 79.7s / 3 | PASSOU · 79.7s / 3 |
| 21 | signatures | PASSOU · 39.5s / 1 | PASSOU · 39.5s / 1 | PASSOU · 39.5s / 1 |
| 22 | maze | PASSOU · 50.8s / 1 | PASSOU · 50.8s / 1 | PASSOU · 50.8s / 1 |
| 23 | lastwindow | PASSOU · 40.8s / 1 | PASSOU · 40.8s / 1 | PASSOU · 40.8s / 1 |
| 24 | paradox | PASSOU · 50.8s / 1 | PASSOU · 50.8s / 1 | PASSOU · 50.8s / 1 |
| 25 | archive | PASSOU · 49.5s / 1 | PASSOU · 49.5s / 1 | PASSOU · 49.5s / 1 |

## Não confirmado

- iPhone físico, Safari real, FPS/GPU, memória e consumo numa sessão longa.
- Recuperação de áudio em chamadas/notificações reais.
- Lighthouse e instalação PWA em todos os sistemas.
- APK, AAB, assinatura Android, compilação iOS ou aprovação das lojas.
- Duração humana de 2–4 minutos na primeira conclusão e conforto dos controlos.
- Todas as estrelas sem morrer por todos os operadores: o bot demonstra conclusão, não um percurso perfeito.
- Medição quantitativa do custo original de blur/sombras/gradientes. As simplificações são preventivas.

## Como testar no telemóvel

1. Abrir a central publicada e atualizar a página com rede; não apagar dados do site.
2. Escolher qualquer nível. Começar com MODO PURO ligado e o treino, se necessário.
3. Testar CURTO/ALTO por toque e pressão longa, movimento simultâneo, impulso e habilidade.
4. Comparar os cinco mundos. No mundo 5, fixar um eco no primeiro botão, usar NÓ perto do segundo e fixar outro.
5. Testar pausa, rotação e regresso ao navegador; tocar em CONTINUAR para retomar.
6. Abrir origin-reborn.html?debug#nivel=1; o parâmetro mantém-se ao mudar de nível. Abrir RELATÓRIO LOCAL e COPIAR RELATÓRIO. Se o clipboard falhar, selecionar o texto na caixa.
7. Testar assistido numa sessão separada e comparar; os resultados puros permanecem independentes.
8. Para comparar a edição anterior, abrir v14-stable/. Para voltar ao código anterior existe a tag, mas não se apagam chaves v15 nem v14.

## Riscos e validação do proprietário

A curva final e os tempos humanos dependem do teste no telemóvel. Dados continuam locais, sem sincronização; limpar o armazenamento ou mudar de navegador pode perder dados. A preparação nativa exige ferramentas/hardware e as lojas cobram as suas próprias taxas (documentadas); nada foi pago/publicado. Não há decisão funcional pendente para executar esta atualização; a próxima decisão é ajustar dificuldade/tempos a partir dos teus relatórios.
