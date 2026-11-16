/* Authored chapter mechanisms augment stable geometry without changing IDs. */
(()=>{'use strict';const D=OriginPilot;
 const worldNames=['SINAL','CIRCUITO','REFRAÇÃO','ÓRBITA','CONVERGÊNCIA'];
 D.levels.forEach((l,i)=>{l.world=Math.floor(i/5)+1;l.worldName=worldNames[l.world-1];l.stage=i%5+1;l.targetTime=180+i*2;l.version=15;l.sensors=[];l.devices=[];l.links=[];l.powerups=[];
  // A coherent first chapter starts with one patrol; new types are introduced later.
  if(i>0){l.lift.x+=l.lift.x<550?40:-40;}
  if(i===0){l.enemies=l.enemies.filter(e=>e.type==='scout');l.vent={x:-1000,y:0,w:0,period:6};}
  if(i>0&&i<5){l.enemies=l.enemies.map(e=>({...e,type:'scout'}));}
  const p=l.platforms;
  // Chapter topology: stacked rooms, split islands, orbit ledges, wide convergence terraces.
  if(i>=5){for(let k=9;k<p.length;k++){const a=p[k];if(l.world===2){a.w=360;a.x=k%4<2?120:600;}else if(l.world===3){a.w=k%3===0?420:240;a.x=k%3===0?340:k%3===1?170:660;}else if(l.world===4){a.w=k%4===0?430:220;a.x=k%4===0?330:k%4===1?140:k%4===2?380:660;}else{a.w=k%3===0?700:300;a.x=k%3===0?170:k%3===1?170:630;}}
   for(let k=9;k<p.length;k++){const a=p[k],prev=p[k-1],center=prev.x+prev.w/2;a.x=Math.max(40,Math.min(1060-a.w,Math.max(center-250-a.w/2,Math.min(center+250-a.w/2,a.x))));}
   const last=p.at(-1);last.w=Math.max(last.w,320);l.exit={x:last.x+last.w-45,y:last.y};const frag=p.at(-3);l.fragments[2]={x:frag.x+frag.w/2,y:frag.y-42};l.checkpoints=l.checkpoints.map((cp,n)=>n===l.checkpoints.length-1?{x:frag.x+frag.w/2,y:frag.y-2}:cp);l.secrets[2]={x:p.at(-2).x+p.at(-2).w/2,y:p.at(-2).y-42};
  }

  if(l.world>=2){const a=p[Math.min(9,p.length-3)],exitPlatform=p.at(-1);l.sensors.push({id:'pressure-a',type:'pressure',x:a.x+45,y:a.y,w:70,latch:l.world===2&&l.stage<3});l.devices.push({id:'exit-door',type:'door',x:l.exit.x-38,y:l.exit.y-108,w:22,h:108,hold:l.world===4?8:0});l.links.push({sensor:'pressure-a',device:'exit-door'});}
  if(l.world>=3){for(let n=0;n<(l.stage>=3?2:1);n++){const a=p[10+n*2];l.devices.push({id:'laser-'+n,type:'laser',x:a.x+a.w/2,y:a.y-90,w:8,h:90,period:6+n,offset:i%3});if(l.sensors.length)l.links.push({sensor:'pressure-a',device:'laser-'+n});}}
  if(l.world>=4){const a=p[11];l.devices.push({id:'shuttle',type:'moving',x:a.x+a.w/2,y:a.y-8,w:100,h:16,travel:80,period:5});l.links.push({sensor:'pressure-a',device:'shuttle'});}
  if(l.world===5){const a=p[Math.min(13,p.length-2)];l.sensors.push({id:'pressure-b',type:'pressure',x:a.x+a.w-45,y:a.y,w:70});l.links.push({sensor:'pressure-b',device:'exit-door'});l.echoNode={x:a.x+a.w-45,y:a.y,radius:130};}
  // Optional pickups never gate the base route, and are inactive in pure mode.
  if(i>=4){const a=p[3];l.powerups.push({id:'pickup-'+i,type:['slow','magnet','shield'][i%3],x:a.x+a.w/2,y:a.y-40});}
  if(i>0)l.enemies.forEach((e,n)=>{const a=p[Math.min(p.length-2,3+n*2)];e.x=a.x+a.w*.75;e.y=a.y-(e.type==='drone'?70:0);e.min=a.x+20;e.max=a.x+a.w-20;});
  l.briefing=(l.world===1?'Fixa o eco na âncora e usa o elevador.':l.world===2?'Deixa um eco no botão para abrir a porta.':l.world===3?'O eco no botão desliga os lasers. Observa o aviso antes de atravessar.':l.world===4?'Coordena o eco, a plataforma móvel e a janela da porta.':'Mantém os dois botões ocupados por ecos. O nó local permite gravar o segundo.')+' Recupera os três fragmentos e procura a saída '+(l.exit.x<l.spawn.x?'à esquerda.':'no topo do percurso.');
 });
})();
