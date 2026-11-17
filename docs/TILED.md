# Mapas Tiled

Os 25 ficheiros maps/{id}.json são mapas ortogonais Tiled com object layers. Plataformas, spawn, fragmentos, inimigos, elevador, âncora, sensores, dispositivos e power-ups usam objetos com posição/retângulo; `json:value` preserva propriedades completas. As propriedades `json:level` guardam ID, rota e metadados. Posição e dimensões dos objetos são autoritativas: arrastar/redimensionar no Tiled altera o jogo; json:value preserva as propriedades adicionais. Editar no Tiled ou JSON e executar `npm run maps:export` para validar e recompilar src/maps.js.

O adaptador valida estrutura/layers, três fragmentos, IDs de objetos e nomes semânticos únicos, camadas singulares, dimensões de dispositivos, referências de links e rota. Testes negativos impedem grafos inválidos. Os 25 IDs de nível nunca mudam.

`npm run maps:export` só valida e atualiza as entradas de importação. `--from-code` foi retirado para evitar sobrescrever edições Tiled. `scripts/author-action-maps.cjs` é uma ferramenta explícita de reautoria, nunca chamada em build/test. A geometria em `maps/*.json` continua autoritativa.

A camada `relays` define os alvos; `json:level.operation` contém `type` (explore/assault/sabotage/relay/sequence/defend), título, quota, ordem e duração. O combate e os objetivos são módulos independentes da geometria.

Sensores: id, x, y, w, latch. Dispositivos: id, type (door/laser/moving), retângulo, hold/period/travel conforme o tipo. Links: sensor, device. Vários links para um dispositivo têm semântica AND. Eco e jogador são atores de sensor pela posição dos pés; os ecos continuam sem corpo físico.
