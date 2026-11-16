(() => {
 'use strict';const $=id=>document.getElementById(id),D=OriginPilot;let progress={levels:{}};try{progress=D.load(localStorage);}catch(_){}
 const next=D.levels.findIndex(l=>!progress.levels[l.id]),index=next<0?0:next;
 $('continue14').href='./origin-reborn.html#nivel='+(index+1);$('continue14').textContent=next<0?'REPETIR A CAMPANHA →':index?'CONTINUAR · MISSÃO '+String(index+1).padStart(2,'0')+' →':'COMEÇAR / TREINAR →';
 $('progress14').textContent=Object.keys(progress.levels).filter(id=>D.levels.some(l=>l.id===id)).length+' / 25 missões concluídas · recordes neste dispositivo';
 let world=0;for(const [index,l]of D.levels.entries()){if(l.world&&world!==l.world){world=l.world;const title=document.createElement('h2');title.className='world-title';title.textContent='MUNDO '+world+' / '+l.worldName;$('arenaGrid').append(title);}
  const a=document.createElement('a');a.className='px-level-card';a.href='./origin-reborn.html#nivel='+(index+1);a.style.setProperty('--place',l.color);a.style.setProperty('--scene','url("assets/operators/horizon.png")');
  const small=document.createElement('small'),h=document.createElement('h3'),p=document.createElement('p'),medal=document.createElement('span');small.textContent='MISSÃO '+String(index+1).padStart(2,'0')+' / DIFICULDADE '+l.difficulty;h.textContent=l.name;p.textContent=(l.platforms.length-1)+' plataformas · '+l.enemies.length+' patrulhas · eco + elevador';medal.className='medal';const r=progress.levels[l.id];medal.textContent=r?Object.values(r.byOperator||{}).reduce((best,v)=>Math.max(best,(v.stars||[]).filter(Boolean).length),0)+'/3 ★ · '+(r.legacyMedal?'HISTÓRICO '+r.legacyMedal:r.medal||''):'SALTO CURTO · SALTO ALTO · IMPULSO · ECO';a.append(small,h,p,medal);$('arenaGrid').append(a);
 }
 let install;window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();install=event;$('install14').hidden=false;});$('install14').onclick=async()=>{if(install){await install.prompt();install=null;$('install14').hidden=true;}};
})();
