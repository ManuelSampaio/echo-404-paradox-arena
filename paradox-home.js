(() => {
 'use strict';
 const $=id=>document.getElementById(id),D=ParadoxData,C=ParadoxCore;
 let storage;try{storage=localStorage;}catch(_){storage={getItem:()=>null};}
 const progress=C.load(storage),saved=level=>progress.levels[level.id];
 const next=D.levels.findIndex(l=>!saved(l)),target=next<0?0:next;
 $('continue14').href='./paradox.html#nivel='+D.levels[target].id;
 $('continue14').textContent=next<0?'REPETIR A VIAGEM →':Object.keys(progress.levels).length?'CONTINUAR · ARENA '+String(target+1).padStart(2,'0')+' →':'ENTRAR NO PRIMEIRO CICLO →';
 $('progress14').textContent=D.levels.filter(l=>saved(l)).length+' / 25 sinais restaurados · recordes neste dispositivo';
 const daily=C.daily();$('daily14').href='./paradox.html#desafio='+daily.code;$('dailyInfo14').textContent='Desafio do dia · '+D.levels[daily.index].place+' · '+daily.day;
 const grid=$('arenaGrid');D.levels.forEach((level,index)=>{
  const a=document.createElement('a');a.className='px-level-card';a.href='./paradox.html#nivel='+level.id;a.style.setProperty('--place',level.color);a.style.setProperty('--scene','url("assets/paradox/'+level.id+'.png")');
  const small=document.createElement('small'),h=document.createElement('h3'),p=document.createElement('p'),medal=document.createElement('span');
  small.textContent='ARENA '+String(index+1).padStart(2,'0')+' / '+(index<5?'INICIAÇÃO':index<10?'VIGILÂNCIA':index<15?'SINCRONIA':index<20?'INTELIGÊNCIA':'PARADOXO');h.textContent=level.place;p.textContent=level.title;medal.className='medal';const r=saved(level);medal.textContent=r&&['OURO','PRATA','BRONZE'].includes(r.medal)?'MEDALHA '+r.medal+' · '+Number(r.bestTime||0).toFixed(1)+'s':level.minEchoes+' ECO'+(level.minEchoes>1?'S':'')+' · '+(level.patrols.length?level.patrols.length+' PATRULHA'+(level.patrols.length>1?'S':''):'APRENDE A REBOBINAR');a.append(small,h,p,medal);grid.append(a);
 });
 let install=null;window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();install=event;$('install14').hidden=false;});$('install14').addEventListener('click',async()=>{if(install){await install.prompt();await install.userChoice;install=null;$('install14').hidden=true;}});
})();
