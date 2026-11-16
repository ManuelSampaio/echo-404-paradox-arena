# Mapas Tiled

Os 25 ficheiros maps/{id}.json são mapas ortogonais Tiled com object layers. Plataformas, spawn, fragmentos, inimigos, elevador, âncora, sensores, dispositivos e power-ups usam objetos com posição/retângulo; `json:value` preserva propriedades completas. As propriedades `json:level` guardam ID, rota e metadados. Editar no Tiled ou JSON e executar `npm run maps:export` para validar e recompilar origin-maps.js.

O adaptador valida mapa/layers/fragmentos/IDs de objetos; os testes verificam IDs de nível e referências de sensores/dispositivos. IDs de nível nunca mudam. `node scripts/export-tiled.cjs --from-code` é uma ferramenta de migração/reprodução da autoria inicial, NÃO o comando a usar após editar manualmente os mapas: substitui os JSON pela fonte de autoria inicial. A comparação da primeira conversão e dos 25 mapas foi feita antes de introduzir os novos mecanismos. Os testes v15 comparam o bundle com cada JSON final.

Sensores: id, x, y, w, latch. Dispositivos: id, type (door/laser/moving), retângulo, hold/period/travel conforme o tipo. Links: sensor, device. Vários links para um dispositivo têm semântica AND. Eco e jogador são atores de sensor pela posição dos pés; os ecos continuam sem corpo físico.
