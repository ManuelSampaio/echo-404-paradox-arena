/* ECHO//404 v14.1: a unified 25-mission vertical platform campaign. */
(() => {
 'use strict';
 const platforms=[
  {id:'dock',x:0,y:1320,w:980,h:180},
  {id:'broken-stair',x:460,y:1200,w:180,h:24},
  {id:'signal-ledge',x:760,y:1100,w:180,h:24},
  {id:'arrival',x:1080,y:1150,w:400,h:44},
  {id:'silo-a',x:1530,y:1030,w:180,h:24},
  {id:'silo-b',x:1770,y:910,w:190,h:24},
  {id:'silo-c',x:1530,y:790,w:180,h:24},
  {id:'anchor',x:1760,y:670,w:300,h:32},
  {id:'sky-dock',x:2370,y:420,w:340,h:38},
  {id:'rooftop',x:2790,y:310,w:240,h:38},
  {id:'secret',x:3030,y:190,w:120,h:20},
  {id:'memory-ledge',x:3100,y:410,w:250,h:30},
  {id:'evacuation',x:3410,y:490,w:620,h:50}
 ];
 const data={width:4100,height:1560,spawn:{x:160,y:1318},platforms,
  anchor:{x:1910,y:670,radius:55},lift:{x:2195,y:830,top:405,bottom:830,w:180,h:24},
  fragments:[{x:820,y:1058},{x:2000,y:628},{x:3215,y:368}],
  secrets:[{x:645,y:1280},{x:3090,y:148},{x:3630,y:448}],
  checkpoints:[{x:160,y:1318},{x:1140,y:1148},{x:1810,y:668},{x:2440,y:418}],
  enemies:[{type:'scout',x:1320,y:1150,min:1240,max:1430},{type:'sentry',x:2895,y:310,min:2895,max:2895},{type:'hound',x:3660,y:490,min:3500,max:3870}],
  exit:{x:3890,y:490},vent:{x:1370,y:1150,w:65,period:5.4}
 };

 // Explicit ascent profiles: each route changes its turns, ledge spacing and lift side.
 const profiles=[
 [220,460,720,500,260,500,720,480,220,440,690,450,210,450],
 [760,530,290,510,750,520,280,500,760,520,290,530,760,500],
 [180,430,680,440,200,450,700,460,720,480,230,470,710,470,220],
 [780,560,320,550,790,560,310,550,290,530,780,540,300,540,780],
 [230,480,730,510,270,500,750,530,280,520,770,550,300,540,780],
 [760,510,260,500,740,490,240,480,730,490,250,500,750,510,270],
 [170,410,650,430,190,440,690,470,720,480,230,460,710,490,240,480],
 [790,570,340,550,780,560,330,560,310,540,770,550,320,540,780,550],
 [210,450,700,480,250,490,730,510,270,500,750,530,290,530,770,540],
 [770,530,290,510,750,520,280,510,750,500,260,490,730,510,270,500],
 [200,440,680,460,220,450,700,480,730,490,250,480,720,500,260,500,740],
 [780,550,310,540,780,550,300,530,290,520,760,540,300,530,770,540,300],
 [180,420,660,440,200,440,680,460,220,460,700,480,240,480,720,500,260],
 [800,570,340,560,790,560,330,550,310,540,780,550,320,540,780,550,310],
 [230,470,710,490,250,490,730,510,270,510,750,530,290,530,770,540,300],
 [750,510,270,500,740,500,260,490,730,490,250,480,720,490,250,480,720],
 [190,430,670,450,210,450,690,470,710,480,240,480,720,490,250,490,730,500],
 [790,560,320,550,790,560,320,550,310,540,780,550,310,540,780,550,310,540],
 [200,440,680,460,220,460,700,480,240,480,720,500,260,500,740,520,280,520],
 [780,540,300,530,770,530,290,520,760,520,280,510,750,510,270,500,740,500],
 [180,420,660,440,200,440,680,460,700,470,230,470,710,480,240,480,720,490,250],
 [800,570,340,560,790,560,330,550,310,540,780,550,320,540,780,550,310,540,780],
 [210,450,690,470,230,470,710,490,250,490,730,510,270,510,750,530,290,530,770],
 [770,530,290,520,760,520,280,510,750,510,270,500,740,500,260,490,730,490,250]
 ];
 const ids=['origin','drift','resonance','mirage','window','junction','interference','trace','reflection','escape','current','frequency','between','phasebridge','fracture','blind','order','presents','silence','overload','signatures','maze','lastwindow','paradox','archive'];
 const names=['ORIGIN','DERIVA','RESSONÂNCIA','MIRAGEM','PASSAGEM','LINHAS CRUZADAS','INTERFERÊNCIA','RASTO','REFLEXO','LINHA DE FUGA','CORRENTE','FREQUÊNCIA','ENTRELINHAS','PONTE DE FASE','CÉU PARTIDO','PROTOCOLO CEGO','ORDEM','DOIS PRESENTES','SILÊNCIO ACTIVO','SOBRECARGA','TRÊS ASSINATURAS','LABIRINTO DE MEMÓRIA','ÚLTIMA JANELA','PARADOXO','ARQUIVO ZERO'];
 const colors=['#77f5df','#a5c9ff','#d9b2ff','#ffc789','#8ce7ce','#ffae96'];
 const kinds=['orbital','foundry','glass','reactor','garden','vault'];
 Object.assign(data,{id:ids[0],name:names[0],index:0,color:colors[0],kind:'orbital',difficulty:1,route:['dock','broken-stair','signal-ledge','arrival','silo-a','silo-b','silo-c','anchor','lift','sky-dock','rooftop','memory-ledge','evacuation'],briefing:'Recupera os três fragmentos. Um eco na âncora alimenta a grua. Sobe pelas coberturas até à evacuação.'});
 const levels=[data,...profiles.map((centers,n)=>{
  const index=n+1,base=2700+index*25,rise=94+Math.min(22,Math.floor(index/2)),w=220-Math.floor(index/4)*8,platforms=[{id:'floor',x:0,y:base,w:1100,h:160}];
  let y=base;
  centers.forEach((cx,k)=>{y-=rise+(k%3===index%3?6:0);platforms.push({id:k===6?'anchor':'step-'+k,x:cx-w/2,y,w:k===6?260:w,h:24});});
  // A mandatory vertical separation is bridged only by the echo-powered lift.
  const anchor=platforms[7],left=index%2===0,liftX=left?140:960;
  anchor.x=left?270:570;anchor.w=260;
  const lift={x:liftX,y:anchor.y+90,top:anchor.y-205,bottom:anchor.y+90,w:180,h:24};
  for(let k=8;k<platforms.length;k++)platforms[k].y-=230;
  platforms[8].x=left?260:590;platforms[8].w=250;
  // Limit horizontal gaps in late narrow ledges while retaining each authored turn.
  for(let k=9;k<platforms.length;k++){const prev=platforms[k-1],p=platforms[k],center=prev.x+prev.w/2;p.x=Math.max(center-250-p.w/2,Math.min(center+250-p.w/2,p.x));}
  const last=platforms.at(-1);last.w=Math.max(last.w,270);
  const spawn={x:centers[0]>550?850:160,y:base-2},point=(p,dx=0)=>({x:p.x+p.w/2+dx,y:p.y-2});
  const enemies=[];const count=Math.min(6,1+Math.floor(index/4));
  for(let e=0;e<count;e++){const p=platforms[Math.min(platforms.length-2,4+e*2)],type=index>=9&&e===count-1?'drone':index>=5&&e%3===1?'sentry':e%3===2?'hound':'scout';enemies.push({type,x:p.x+p.w/2,y:p.y-(type==='drone'?70:0),min:p.x+30,max:p.x+p.w-30});}
  const vents=index<4?[]:[platforms[5],...(index>=12?[platforms.at(-3)]:[])].map((p,i)=>({x:p.x+20,y:p.y,w:40+index,period:6-index*.035,offset:i*2}));
  return {id:ids[index],name:names[index],index,difficulty:index+1,kind:kinds[index%6],color:colors[index%6],width:1100,height:base+240,spawn,platforms,route:platforms.flatMap(p=>p.id==='anchor'?[p.id,'lift']:[p.id]),anchor:{x:anchor.x+anchor.w/2,y:anchor.y,radius:55},lift,
   fragments:[point(platforms[3]),point(anchor,45),point(platforms.at(-3))].map(p=>({...p,y:p.y-40})),secrets:[{x:spawn.x<500?900:170,y:base-40},point(platforms[5],-55),point(platforms.at(-2),55)].map((p,i)=>i?({...p,y:p.y-40}):p),
   checkpoints:[spawn,point(platforms[4]),point(anchor,-35),point(platforms[8]),point(platforms.at(-3))],enemies,vents,vent:{x:-1000,y:0,w:0,period:6},exit:{x:last.x+last.w-40,y:last.y},briefing:'Sobe a '+names[index]+'. Recolhe três fragmentos, fixa o eco na âncora e usa o elevador para continuar a ascensão.'};
 })];
 const KEY='echo404_origin_campaign_v15',LEGACY_KEY='echo404_origin_campaign_v14';
 function load(storage){
  const read=key=>{try{const p=JSON.parse(storage.getItem(key));return p&&p.levels&&typeof p.levels==='object'&&!Array.isArray(p.levels)?p:null;}catch(_){return null;}};
  const old=read(LEGACY_KEY),current=read(KEY);const levels={...(old?.version===14?old.levels:{})};
  if(!levels.origin)try{const r=JSON.parse(storage.getItem('echo404_v93_origin_result'));if(r&&['OURO','PRATA','BRONZE'].includes(r.medal))levels.origin=r;}catch(_){}
  for(const [id,r]of Object.entries(levels))levels[id]={...r,legacyMedal:r.medal,legacyBestTime:r.bestTime||r.time};
  if(current?.version===15)for(const [id,r]of Object.entries(current.levels))levels[id]={...levels[id],...r};
  return {version:15,levels};
 }
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 function pose(frames,time){
  if(!frames.length)return null;
  if(time<=frames[0].t)return {...frames[0]};
  for(let i=1;i<frames.length;i++)if(time<=frames[i].t){const a=frames[i-1],b=frames[i],f=(time-a.t)/(b.t-a.t||1);return {...b,x:a.x+(b.x-a.x)*f,y:a.y+(b.y-a.y)*f};}
  return {...frames[frames.length-1]};
 }
 function groundedAt(point,zone){return point&&Math.abs(point.x-zone.x)<zone.radius&&Math.abs(point.y-zone.y)<18;}
 function rank({deaths,secrets}){return deaths===0&&secrets>=2?'OURO':deaths<=3?'PRATA':'BRONZE';}
 function save(storage,result,index=0){
  try{const id=levels[index]?.id;if(!id)return false;let current;try{current=JSON.parse(storage.getItem(KEY));}catch(_){}
   if(!current||current.version!==15||!current.levels)current={version:15,levels:{}};
   const old=current.levels[id]||{},history=load(storage).levels[id]||{},ranks={OURO:3,PRATA:2,BRONZE:1};
   const byOperator={...(old.byOperator||{})},previous=byOperator[result.operator]||{};if(result.pure){byOperator[result.operator]={bestTime:Math.min(previous.bestTime||Infinity,result.time),stars:(result.stars||[]).map((v,i)=>v||previous.stars?.[i]||false)};}
   current.levels[id]={...old,...result,byOperator,medal:ranks[old.medal]>ranks[result.medal]?old.medal:result.medal,bestTime:Math.min(Number(old.bestTime||old.time)||Infinity,result.time),legacyMedal:history.legacyMedal,legacyBestTime:history.legacyBestTime,version:'15.0.0'};
   storage.setItem(KEY,JSON.stringify(current));return true;
  }catch(_){return false;}
 }
 window.OriginPilot={data,levels,load,KEY,clamp,pose,groundedAt,rank,save};
})();
