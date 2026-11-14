/* ECHO//404 v11.0 — mission data shared by the launcher, renderer and patrol AI. */
(() => {
  'use strict';
  const missions = [
    {id:1,name:'ÚLTIMO SINAL',biome:'ORIGIN · GELO E DESTROÇOS',kind:'ice',sky:'#0a1c36',deep:'#182e4b',surface:'#355571',accent:'#8be8ff',danger:'#ff758f',skin:'#c99270',suit:'#4089b2',weather:'snow',
     intro:'A estação caiu no gelo. Usa caixas como cobertura, aprende a gravar ecos e atravessa a patrulha aérea. Recupera o registo e alcança o elevador.',tip:'Exploração · drones de reconhecimento · duas placas temporais',types:['drone','scout'],hazard:'ice',period:7,
     platforms:[[330,384,150],[690,365,170],[1080,385,130],[1720,372,145],[2460,380,130]],blocks:[[510,42],[960,38],[1990,44]],guards:[['drone',1760,1740,2000],['scout',2470,2390,2540]],zones:[700,1920]},
    {id:2,name:'SINAL FANTASMA',biome:'FUNDIÇÃO · LINHA DE MONTAGEM',kind:'foundry',sky:'#2d1520',deep:'#582b2a',surface:'#80503b',accent:'#ffc078',danger:'#ff644e',skin:'#c99270',suit:'#df9454',weather:'embers',
     intro:'O sinal vem da fundição. Vapor escaldante corta o chão e um robô pesado vigia a linha de montagem. Espera pela despressurização ou usa as passarelas.',tip:'Vapor intermitente · robô pesado · sentinela fixa',types:['heavy','turret'],hazard:'steam',period:6,
     platforms:[[250,392,170],[620,365,185],[1040,366,140],[1760,365,160],[2010,365,145]],blocks:[[470,38],[1010,45],[1940,40]],guards:[['heavy',1780,1700,1930],['turret',2470,2470,2470]],zones:[660,1800]},
    {id:3,name:'THE FORGOTTEN',biome:'BIODOMO · JARDIM ESQUECIDO',kind:'garden',sky:'#0a2927',deep:'#183f36',surface:'#38574b',accent:'#a4ef9d',danger:'#dce674',skin:'#c99270',suit:'#5da995',weather:'spores',
     intro:'NYRA está escondida no biodomo. Unidades quadrúpedes caçam ao nível do chão e as plantas libertam esporos. Usa as copas e recupera o arquivo sem abandonar NYRA.',tip:'Resgatar NYRA · caçadores quadrúpedes · esporos',types:['hound','scout'],hazard:'spores',period:8,
     platforms:[[290,386,150],[650,365,190],[1050,382,155],[1770,365,170],[2020,365,135]],blocks:[[490,35],[1000,42],[1970,42]],guards:[['hound',1800,1720,1950],['hound',2460,2380,2560]],zones:[680,1800]},
    {id:4,name:'THE TRUTH',biome:'REATOR · CÂMARA DE NULL',kind:'reactor',sky:'#200e30',deep:'#3c2353',surface:'#59406a',accent:'#dcb0ff',danger:'#ff5baf',skin:'#c99270',suit:'#9d80cc',weather:'energy',
     intro:'Entra no reator de NULL. Sentinelas fixas anunciam os disparos e os circuitos libertam pulsos elétricos. Recupera NYRA e coopera com um eco para romper as três camadas do núcleo.',tip:'Chefe NULL · sentinelas · sobrecarga com ecos',types:['sentinel','turret'],hazard:'electric',period:5.8,
     platforms:[[270,390,185],[640,365,175],[1050,376,145],[1740,365,180],[2000,365,145],[2535,388,140]],blocks:[[490,42],[1000,38],[1960,40]],guards:[['sentinel',1800,1720,1950],['turret',2440,2440,2440]],zones:[690,1800]},
    {id:5,name:'THE ARCHITECT',biome:'CIDADE VERTICAL · COBERTURAS',kind:'city',sky:'#141b3b',deep:'#292b53',surface:'#474b70',accent:'#ffcb79',danger:'#ff7399',skin:'#c99270',suit:'#d1a56e',weather:'rain',
     intro:'O ARQUITETO transmite do alto da cidade. A chuva esconde as patrulhas, mas um atirador vigia as passarelas. Interceta os três relés de comunicação e descobre a assinatura falsificada.',tip:'Três relés · atirador de longo alcance · chuva',types:['sniper','scout'],hazard:'electric',period:7.2,
     platforms:[[260,386,165],[630,365,190],[1060,370,140],[1730,365,180],[2000,365,145],[2530,386,145]],blocks:[[470,46],[1010,40],[1970,48]],guards:[['sniper',1830,1830,1830],['scout',2460,2390,2560]],zones:[680,1800]},
    {id:6,name:'PROJECT ARCA',biome:'ARCA · SERVIDOR DE ORIGEM',kind:'arca',sky:'#061e2a',deep:'#123d4a',surface:'#2a6269',accent:'#6fffd9',danger:'#ffd36d',skin:'#c99270',suit:'#60bcb6',weather:'data',
     intro:'O servidor ARCA muda de ciclo a cada pulso. Evita os robôs rastejantes e a vigilância aérea. Depois de alimentar o servidor, ativa os três terminais por ordem em 12 segundos.',tip:'Três terminais em sequência · rastejantes · vigilância aérea',types:['crawler','drone'],hazard:'electric',period:4.8,
     platforms:[[290,388,145],[640,365,185],[1060,380,145],[1740,365,170],[2010,365,145],[2540,390,130]],blocks:[[480,40],[1000,42],[1970,42]],guards:[['crawler',1800,1720,1950],['drone',2460,2380,2570]],zones:[690,1800]}
  ];
  const archetypes = {
    drone:{label:'DRONE',speed:66,chase:115,range:340,cooldown:3.4,aim:.95,flying:true},
    scout:{label:'ROBÔ BATEDOR',speed:58,chase:105,range:270,cooldown:3.8,aim:1.1},
    heavy:{label:'MECHA PESADO',speed:32,chase:60,range:310,cooldown:4.4,aim:1.35},
    turret:{label:'TORRETA',speed:0,chase:0,range:350,cooldown:3.6,aim:1.3},
    hound:{label:'CAÇADOR',speed:88,chase:165,range:250,cooldown:2.4,aim:.85,melee:true},
    sentinel:{label:'SENTINELA',speed:42,chase:78,range:320,cooldown:3.2,aim:1.15},
    sniper:{label:'ATIRADOR',speed:0,chase:0,range:480,cooldown:4.6,aim:1.7},
    crawler:{label:'RASTEJANTE',speed:78,chase:145,range:230,cooldown:2.7,aim:.9,melee:true}
  };
  // Layouts use shallow jump steps and preserve safe ground near story terminals,
  // gates, echo plates and the NULL core; no procedural unreachable objectives.
  window.CampaignWorlds = {missions, archetypes, get(id){
    const source=missions[id-1];
    if(!source) throw new Error('Unknown campaign mission: '+id);
    return {...source,platforms:source.platforms.map(([x,y,w])=>({x,y,w,h:18})),blocks:source.blocks.map(([x,h])=>({x,y:455-h,w:52,h}))};
  }};
})();
