// Reproducible full-threat playthroughs: no injected echoes, disabled threats or
// altered level data. The agent uses legal movement, waiting, phase and rewind.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..'),context=vm.createContext({});context.window=context;
for(const file of ['paradox-data.js','paradox-core.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context);
const C=context.ParadoxCore,D=context.ParadoxData,cell=p=>({x:Math.floor(p.x/D.T),y:Math.floor(p.y/D.T)}),distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
function pathTo(s,target){
 const start=cell(s.player),end=cell(target),queue=[start],previous=new Map([[start.x+','+start.y,null]]);let found=false;
 for(let i=0;i<queue.length;i++){
  const p=queue[i];if(p.x===end.x&&p.y===end.y){found=true;break;}
  const neighbours=[[1,0],[-1,0],[0,1],[0,-1]].map(([dx,dy])=>({x:p.x+dx,y:p.y+dy}));
  if(s.level.portals&&(s.level.portalPlates||[]).every(id=>s.plates[id])){const n=s.level.portals.findIndex(q=>cell(q).x===p.x&&cell(q).y===p.y);if(n>=0)neighbours.push(cell(s.level.portals[1-n]));}
  for(const q of neighbours){const key=q.x+','+q.y,pixel=D.at(q.x,q.y);if(previous.has(key)||C.blocked(s,pixel.x,pixel.y))continue;previous.set(key,p);queue.push(q);}
 }
 if(!found)return null;const route=[];let p=end;while(p){route.unshift(D.at(p.x,p.y));p=previous.get(p.x+','+p.y);}return route;
}
const phaseThreshold={7:24,11:30,14:24,18:24,22:30,23:30,24:24};
let phases=0,shots=0,portals=0;
for(let index=0;index<25;index++){
 const s=C.make(index),initialEnemies=s.enemies.length,threshold=phaseThreshold[index+1]||18;let frames=0;s.active=true;
 function tick(input={}){
  assert.ok(frames++<4800,s.level.id+': bounded playthrough');C.step(s,input,1/60);
  assert.equal(s.deaths,0,s.level.id+': '+s.message);
  for(const event of s.events){if(event.type==='phase')phases++;if(event.type==='shot')shots++;if(event.type==='portal')portals++;}
 }
 function walk(target){
  while(!s.done&&distance(s.player,target)>4){
   const route=pathTo(s,target);if(!route){tick();continue;}
   let q=route.length>1?route[1]:target;if(route.length>1&&distance(route[0],route[1])>D.T*1.5)q=route[0];
   for(let n=0;n<80&&!s.done;n++){
    const x=q.x-s.player.x,y=q.y-s.player.y,d=Math.hypot(x,y);if(d<4)break;
    const beam=s.level.hazards.some(h=>C.pulseOn({period:h.period,start:h.start,end:h.end},s.t+.08)&&s.player.x>h.x-C.R-8&&s.player.x<h.x+h.w+C.R+8&&s.player.y>h.y-C.R-8&&s.player.y<h.y+h.h+C.R+8);
    const risk=beam||s.enemies.some(e=>e.kind!=='sentinel'&&distance(e,s.player)<threshold)||s.shots.some(p=>distance(p,s.player)<threshold);
    tick({x:x/d,y:y/d,phase:risk});if(s.events.some(e=>e.type==='portal'))break;
   }
  }
 }
 for(const p of s.level.plates){if(index===23)for(let j=0;j<6;j++)tick();walk(p);for(let j=0;j<10;j++)tick();assert.ok(C.rewind(s,true));}
 const timed=s.level.gates.find(g=>g.pulse);for(let j=0;j<(timed?Math.ceil((timed.pulse.start+.12)*60):12);j++)tick();
 walk(s.level.exit);for(let j=0;j<420&&!s.done;j++)tick();
 assert.equal(s.done,true,s.level.id+': completed with live threats');assert.equal(s.echoes.length,s.level.minEchoes);assert.equal(s.enemies.length,initialEnemies);assert.equal(C.medal(s),'OURO');
 console.log('PASS:',String(index+1).padStart(2,'0'),s.level.place,'live threats, zero failures,',s.echoes.length,'echoes,',s.total.toFixed(2)+'s');
}
assert.ok(phases>0);assert.ok(shots>0);assert.ok(portals>0);
// Phase lasts long enough to cross an emitter but has a real recovery period.
const s=C.make(0);s.active=true;C.step(s,{phase:true});assert.equal(s.phase,.4);assert.equal(s.phaseCooldown,1.8);
for(let i=0;i<25;i++)C.step(s,{});assert.equal(s.phase,0);assert.ok(s.phaseCooldown>1);C.step(s,{phase:true});assert.equal(s.phase,0,'cooldown cannot be bypassed');
console.log('PASS: all 25 live-threat playthroughs, real phase/shot/portal events and phase recovery');
