/* ECHO//404 v10.3 — reads existing mission saves without migrating or rewriting them. */
(() => {
  'use strict';
  const missions = [
    ['origin-v97.html', 'echo404_v91_origin_mission_complete', 'echo404_v93_origin_result'],
    ['origin-v98.html', 'echo404_v98_sector02_complete', 'echo404_v98_sector02_result'],
    ['origin-v99.html', 'echo404_v99_archive03_complete', 'echo404_v99_archive03_result'],
    ['origin-v100.html', 'echo404_v100_truth04_complete', 'echo404_v100_truth04_result'],
    ['origin-v101.html', 'echo404_v101_architect05_complete', 'echo404_v101_architect05_result'],
    ['origin-v102.html', 'echo404_v102_arca06_complete', 'echo404_v102_arca06_result']
  ];
  const $ = id => document.getElementById(id);
  if (!$('echoCampaignHub')) return;
  function read(key) {
    try { return localStorage.getItem(key); } catch (_) { return null; }
  }
  function medal(key) {
    try {
      const value = JSON.parse(read(key));
      return ['OURO', 'PRATA', 'BRONZE'].includes(value?.medal) ? value.medal : '';
    } catch (_) { return ''; }
  }
  function refresh() {
    const completed = missions.map(([, key]) => ['true', '1'].includes(read(key)));
    const count = completed.filter(Boolean).length;
    const next = completed.indexOf(false);
    const launch = $('echoV91Launch');
    launch.href = './' + missions[next < 0 ? 0 : next][0];
    launch.textContent = next < 0 ? '↻ REJOGAR CAMPANHA' : count === 0
      ? '▶ COMEÇAR CAMPANHA · MISSÃO 01'
      : '▶ CONTINUAR CAMPANHA · MISSÃO ' + String(next + 1).padStart(2, '0');
    $('echoCampaignProgress').textContent = `${count} / ${missions.length} missões concluídas`;
    $('echoCampaignHint').textContent = next < 0
      ? 'Todas as missões disponíveis concluídas. Podes repetir qualquer missão.'
      : 'Continua pela primeira missão por concluir. Cada missão começa do início; as medalhas ficam guardadas.';
    missions.forEach(([, , resultKey], index) => {
      const award = medal(resultKey);
      $('echoMissionStatus' + (index + 1)).textContent =
        (completed[index] ? 'CONCLUÍDA' : 'POR CONCLUIR') + (award ? ' · MEDALHA ' + award : '');
    });
  }
  refresh();
  window.addEventListener('pageshow', refresh);
  window.addEventListener('storage', refresh);
})();
