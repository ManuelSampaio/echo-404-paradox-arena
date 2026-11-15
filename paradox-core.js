/* Deterministic top-down temporal simulation. Phaser renders this state.
   One cycle records a trace; rewinding replays all earlier traces from t=0. */
(() => {
 'use strict';
 const {T,width,height,levels}=ParadoxData,R=11,SPEED=220,MAX_ECHOES=3;
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
 function pose(trace,t){if(!trace.length)return null;if(t<=trace[0].t)return {...trace[0]};for(let i=1;i<trace.length;i++){const a=trace[i-1],b=trace[i];if(t<=b.t){if(b.warp)return t<b.t?{...a}:{...b};const f=(t-a.t)/(b.t-a.t||1);return {...b,x:a.x+(b.x-a.x)*f,y:a.y+(b.y-a.y)*f};}}return {...trace[trace.length-1]};}
 function make(index){const level=levels[index];if(!level)throw Error('Unknown ECHO sector');const s={index,level,player:{...level.spawn,dx:0,dy:1},echoes:[],ghosts:[],trace:[],t:0,total:0,attempts:1,deaths:0,done:false,active:false,phase:0,phaseCooldown:0,portalCooldown:0,plates:{},gates:[],sequence:0,sequenceLatched:false,previousPlate:{},scan:null,message:null,events:[],grace:1,enemies:[],shots:[]};s.trace=[sample(s)];resetPatrols(s);refresh(s);return s;}
 function sample(s,warp=false){return {t:s.t,x:s.player.x,y:s.player.y,dx:s.player.dx,dy:s.player.dy,moving:!!s.player.moving,warp};}
 function plateOn(p,zone){return p&&distance(p,zone)<23;}
 function pulseOn(p,t){if(!p)return true;const x=t%p.period;return x>=p.start&&x<p.end;}
 function refresh(s){
  s.ghosts=s.echoes.map(trace=>pose(trace,s.t));
  for(const p of s.level.plates)s.plates[p.id]=(p.echoOnly?[]:[s.player]).concat(s.ghosts).some(e=>plateOn(e,p));
  s.gates=s.level.gates.map(g=>({...g,open:g.plates.every(id=>s.plates[id])&&pulseOn(g.pulse,s.t)}));
 }
 function circleRect(p,r){const x=clamp(p.x,r.x,r.x+r.w),y=clamp(p.y,r.y,r.y+r.h);return Math.hypot(p.x-x,p.y-y)<R-.001;}
 function blocked(s,x,y){if(x<R+T||y<R+T||x>width-T-R||y>height-T-R)return true;const p={x,y};return s.level.walls.some(r=>circleRect(p,r))||s.gates.some(g=>!g.open&&circleRect(p,g));}
 function say(s,text){s.message=text;s.events.push({type:'message',text});}
 function rewind(s,store=true){
  if(s.done)return false;
  if(store&&s.t<.3){say(s,'Grava um pouco do teu percurso antes de criar o eco.');return false;}
  if(store&&s.echoes.length>=MAX_ECHOES){say(s,'Já tens três ecos. Desfaz o último para experimentar outro percurso.');return false;}
  if(store){s.trace.push(sample(s));s.echoes.push(s.trace.map(p=>({...p})));}
  s.t=0;s.attempts++;s.player={...s.level.spawn,dx:0,dy:1};s.trace=[sample(s)];s.phase=0;s.portalCooldown=0;s.phaseCooldown=0;s.sequence=0;s.sequenceLatched=false;s.previousPlate={};s.scan=null;s.grace=1;resetPatrols(s);refresh(s);
  s.events.push({type:store?'rewind':'recover'});return true;
 }
 function undo(s){if(s.done)return false;if(!s.echoes.length)return false;s.echoes.pop();rewind(s,false);say(s,'Último eco desfeito. O resto do teu passado continua contigo.');return true;}
 function fail(s,text){s.deaths++;rewind(s,false);say(s,text);}
 function pointLine(p,a,b){const dx=b.x-a.x,dy=b.y-a.y,d=dx*dx+dy*dy;if(!d)return distance(p,a);const f=clamp(((p.x-a.x)*dx+(p.y-a.y)*dy)/d,0,1);return Math.hypot(p.x-a.x-dx*f,p.y-a.y-dy*f);}
 function sequence(s){if(!s.level.sequence||s.sequenceLatched)return;for(const id of s.level.sequence){const entered=s.plates[id]&&!s.previousPlate[id];if(entered){if(s.level.sequence[s.sequence]===id){s.sequence++;s.events.push({type:'signal',id});if(s.sequence===s.level.sequence.length)s.sequenceLatched=true;}else{s.sequence=id===s.level.sequence[0]?1:0;say(s,'A ordem do arquivo é A → B → C. Ajusta o tempo de chegada dos teus ecos.');}}}s.previousPlate={...s.plates};}
 function resetPatrols(s){s.enemies=(s.level.patrols||[]).map(e=>({...e,x:e.from.x,y:e.from.y,route:1,aimDuration:e.aim,state:'patrol',alert:0,memory:0,cooldown:1.5+e.phase,target:null,aim:0,lastSeen:{...e.from}}));s.shots=[];}
 function ray(s,a,b){const len=distance(a,b),n=Math.max(1,Math.ceil(len/5)),walls=s.level.walls.concat(s.gates.filter(g=>!g.open));for(let i=1;i<=n;i++){const p={x:a.x+(b.x-a.x)*i/n,y:a.y+(b.y-a.y)*i/n};if(walls.some(r=>p.x>r.x&&p.x<r.x+r.w&&p.y>r.y&&p.y<r.y+r.h))return p;}return null;}
 function security(s,dt){
  for(const e of s.enemies){
   const decoy=[...s.ghosts].reverse().find(g=>distance(e,g)<e.range&&!ray(s,e,g));
   const candidate=decoy||s.player,visible=distance(e,candidate)<e.range&&!ray(s,e,candidate);
   if(visible){e.alert=clamp(e.alert+dt*1.8,0,1);e.lastSeen={x:candidate.x,y:candidate.y};e.memory=2.1;}else{e.alert=Math.max(0,e.alert-dt*.7);e.memory=Math.max(0,e.memory-dt);}
   e.state=e.alert>.65?'chase':e.memory>0?'search':'patrol';
   const destination=e.state==='patrol'?(e.route?e.to:e.from):e.lastSeen;
   if(e.speed>0){const dx=destination.x-e.x,dy=destination.y-e.y,len=Math.hypot(dx,dy);if(len<4&&e.state==='patrol')e.route=1-e.route;else if(len>2){const travel=e.speed*(e.state==='chase'?1.35:1)*dt;if(!blocked(s,e.x+dx/len*travel,e.y))e.x+=dx/len*travel;if(!blocked(s,e.x,e.y+dy/len*travel))e.y+=dy/len*travel;}}
   if(e.kind!=='sentinel'&&s.grace<=0&&s.phase<=0&&distance(e,s.player)<R+11){fail(s,'A patrulha encontrou o sinal. Usa as paredes, o eco ou FASE para criar uma abertura.');return true;}
   e.cooldown=Math.max(0,e.cooldown-dt);
   if(visible&&e.state==='chase'&&s.grace<=0&&e.cooldown<=0){if(!e.target){e.target={x:candidate.x,y:candidate.y};e.aim=e.aimDuration||1.1;}
    else{e.aim-=dt;if(e.aim<=0){const dx=e.target.x-e.x,dy=e.target.y-e.y,len=Math.hypot(dx,dy)||1;s.shots.push({x:e.x,y:e.y,vx:dx/len*270,vy:dy/len*270,life:2.5});e.target=null;e.cooldown=e.period;s.events.push({type:'shot'});}}
   }else{e.target=null;e.aim=0;}
  }
  const alive=[];for(const shot of s.shots){const old={x:shot.x,y:shot.y};shot.x+=shot.vx*dt;shot.y+=shot.vy*dt;shot.life-=dt;if(ray(s,old,shot))continue;if(s.grace<=0&&s.phase<=0&&pointLine(s.player,old,shot)<R+3){fail(s,'O disparo cortou o sinal. O aviso mostra onde a unidade vai atirar.');return true;}if(shot.life>0)alive.push(shot);}s.shots=alive;return false;
 }
 function step(s,input={},delta=1/60){
  s.events=[];if(!s.active||s.done)return s;const dt=clamp(delta,0,.05);s.total+=dt;s.t+=dt;s.phase=Math.max(0,s.phase-dt);s.phaseCooldown=Math.max(0,s.phaseCooldown-dt);s.portalCooldown=Math.max(0,s.portalCooldown-dt);s.grace=Math.max(0,s.grace-dt);
  if(input.undo){undo(s);return s;}
  if(input.rewind){rewind(s,true);return s;}
  if(input.phase&&s.phaseCooldown<=0){s.phase=.4;s.phaseCooldown=1.8;s.events.push({type:'phase'});}
  refresh(s);
  let dx=clamp(Number(input.x)||0,-1,1),dy=clamp(Number(input.y)||0,-1,1),length=Math.hypot(dx,dy);if(length>1){dx/=length;dy/=length;}if(length>.05){s.player.dx=dx;s.player.dy=dy;}
  const previousX=s.player.x,previousY=s.player.y;
  const vx=dx*SPEED*dt,vy=dy*SPEED*dt,parts=Math.max(1,Math.ceil(Math.max(Math.abs(vx),Math.abs(vy))/5));
  for(let i=0;i<parts;i++){if(!blocked(s,s.player.x+vx/parts,s.player.y))s.player.x+=vx/parts;if(!blocked(s,s.player.x,s.player.y+vy/parts))s.player.y+=vy/parts;}
  s.player.moving=Math.hypot(s.player.x-previousX,s.player.y-previousY)>.01;
  refresh(s);
  if(s.level.portals&&(s.level.portalPlates||[s.level.portalPlate]).every(id=>s.plates[id])&&s.portalCooldown<=0){const i=s.level.portals.findIndex(p=>distance(p,s.player)<20);if(i>=0){const destination=s.level.portals[1-i];s.player.x=destination.x;s.player.y=destination.y;s.portalCooldown=.8;s.trace.push(sample(s,true));s.events.push({type:'portal'});refresh(s);}}
  sequence(s);
  if(security(s,dt))return s;
  for(const h of s.level.hazards){if(pulseOn({period:h.period,start:h.start,end:h.end},s.t)&&s.grace<=0&&s.phase<=0&&s.player.x>h.x-R&&s.player.x<h.x+h.w+R&&s.player.y>h.y-R&&s.player.y<h.y+h.h+R){fail(s,'O emissor apanhou o sinal. Os teus ecos ficaram guardados.');return s;}}
  const scanner=s.level.scanner;if(scanner&&s.ghosts.length){const phase=s.t%scanner.period;if(phase>=scanner.start-.9&&phase<scanner.end){if(!s.scan)s.scan={...s.ghosts[s.ghosts.length-1]};if(phase>=scanner.start&&s.grace<=0&&s.phase<=0&&!ray(s,scanner,s.scan)&&pointLine(s.player,scanner,s.scan)<R+3&&distance(s.player,s.level.spawn)>T){fail(s,'NULL seguiu o sinal. Usa o teu eco para o distrair e procura outra rota.');return s;}}else s.scan=null;}
  if(s.gates.some(g=>g.pulse&&!g.open&&circleRect(s.player,g))){fail(s,'O pulso do passadiço fechou. Espera pela janela verde.');return s;}
  if(!s.trace.length||s.t-s.trace[s.trace.length-1].t>=1/30-.001)s.trace.push(sample(s));
  const powered=s.level.goal.every(id=>s.plates[id])&&(!s.level.sequence||s.sequenceLatched);
  if(distance(s.player,s.level.exit)<22&&powered){s.done=true;s.events.push({type:'complete'});return s;}
  if(s.t>=s.level.duration){if(s.echoes.length<MAX_ECHOES)rewind(s,true);else rewind(s,false);say(s,'O ciclo voltou ao início. O teu passado está a repetir-se.');}
  return s;
 }
 function medal(s){return s.deaths===0&&s.echoes.length<=s.level.minEchoes&&s.total<=s.level.par?'OURO':s.deaths<=2?'PRATA':'BRONZE';}
 function daily(date=new Date()){const day=new Date(date.getTime()+3600000).toISOString().slice(0,10),digits=day.replace(/\D/g,'');let seed=0;for(const c of digits)seed=(seed*31+Number(c))>>>0;return {day,code:'E404-'+digits,index:seed%levels.length};}
 const KEY='echo404_v14';
 function load(storage){try{const v=JSON.parse(storage.getItem(KEY));return v&&v.version===14&&v.levels&&typeof v.levels==='object'&&!Array.isArray(v.levels)?v:{version:14,levels:{}};}catch(_){return {version:14,levels:{}};}}
 function save(storage,s){try{const progress=load(storage),old=progress.levels[s.level.id]||{},rank={OURO:3,PRATA:2,BRONZE:1},award=medal(s),oldTime=Number(old.bestTime),oldEchoes=Number(old.bestEchoes);progress.levels[s.level.id]={medal:rank[old.medal]>rank[award]?old.medal:award,bestTime:Number.isFinite(oldTime)&&oldTime>0?Math.min(oldTime,s.total):s.total,bestEchoes:Number.isFinite(oldEchoes)&&oldEchoes>=0?Math.min(oldEchoes,s.echoes.length):s.echoes.length,completions:(Number(old.completions)||0)+1};storage.setItem(KEY,JSON.stringify(progress));return true;}catch(_){return false;}}
 window.ParadoxCore={make,step,rewind,undo,pose,blocked,refresh,medal,daily,load,save,KEY,MAX_ECHOES,R,SPEED,circleRect,pointLine,pulseOn,ray,security,resetPatrols};
})();
