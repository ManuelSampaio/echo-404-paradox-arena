// Authored solutions use the actual deterministic collision/replay simulation.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..'),context=vm.createContext({Intl,Date});context.window=context;
for(const name of ['paradox-data.js','paradox-core.js'])vm.runInContext(fs.readFileSync(path.join(root,name),'utf8'),context);
const C=context.ParadoxCore,D=context.ParadoxData;
const cell=p=>({x:Math.floor(p.x/D.T),y:Math.floor(p.y/D.T)}),dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
function pathTo(s,target){const start=cell(s.player),end=cell(target),queue=[start],previous=new Map([[start.x+','+start.y,null]]);let found=false;
 for(let i=0;i<queue.length;i++){const p=queue[i];if(p.x===end.x&&p.y===end.y){found=true;break;}const neighbours=[[1,0],[-1,0],[0,1],[0,-1]].map(([dx,dy])=>({x:p.x+dx,y:p.y+dy}));
  if(s.level.portals&&(s.level.portalPlates||[]).every(id=>s.plates[id])){const n=s.level.portals.findIndex(q=>cell(q).x===p.x&&cell(q).y===p.y);if(n>=0)neighbours.push(cell(s.level.portals[1-n]));}
  for(const q of neighbours){const key=q.x+','+q.y,pixel=D.at(q.x,q.y);if(previous.has(key)||C.blocked(s,pixel.x,pixel.y))continue;previous.set(key,p);queue.push(q);}}
 if(!found)return null;const route=[];let p=end;while(p){route.unshift(D.at(p.x,p.y));p=previous.get(p.x+','+p.y);}return route;
}
function wait(s,seconds){for(let i=0;i<Math.ceil(seconds*60)&&!s.done;i++)C.step(s,{},1/60);}
function walk(s,target){const before=s.deaths;let frames=0;while(!s.done&&dist(s.player,target)>3&&frames<1800){
 let route=pathTo(s,target);if(!route){C.step(s,{},1/60);frames++;continue;}
 let waypoint=route.length>1?route[1]:target;
 if(route.length>1&&dist(route[0],route[1])>D.T*1.5)waypoint=route[0];
 for(let i=0;i<80&&!s.done;i++){const x=waypoint.x-s.player.x,y=waypoint.y-s.player.y,len=Math.hypot(x,y);if(len<2)break;C.step(s,{x:x/len,y:y/len},Math.min(1/60,len/C.SPEED));frames++;assert.equal(s.deaths,before,s.level.id+': safe puzzle route');if(s.events.some(e=>e.type==='portal'))break;}
 }
 assert.ok(s.done||dist(s.player,target)<3,s.level.id+': arrived at '+JSON.stringify(target)+' from '+JSON.stringify(s.player));}
function record(s,id){walk(s,s.level.plates.find(p=>p.id===id));wait(s,.16);assert.equal(C.rewind(s,true),true);}
const solved=[];
assert.equal(D.levels.length,25);assert.equal(new Set(D.levels.map(l=>JSON.stringify(l.walls))).size,25);
for(let index=0;index<D.levels.length;index++){
 const s=C.make(index);s.active=true;
 // Isolate temporal layout proofs from the separately tested security AI.
 s.level={...s.level,patrols:[],hazards:[],scanner:null};C.resetPatrols(s);
 assert.equal(C.blocked(s,s.player.x,s.player.y),false);assert.equal(C.blocked(s,s.level.exit.x,s.level.exit.y),false);
 if(index)assert.ok(s.level.duration<D.levels[index-1].duration,'cycle pressure increases');
 for(const p of s.level.plates)record(s,p.id);
 const timed=s.level.gates.find(g=>g.pulse);if(timed)wait(s,timed.pulse.start+.12);else wait(s,.2);
 walk(s,s.level.exit);if(!s.done)wait(s,Math.min(7,s.level.duration-s.t-.2));
 assert.equal(s.done,true,s.level.id+': solvable');assert.equal(s.echoes.length,s.level.minEchoes);assert.equal(s.deaths,0);assert.equal(C.medal(s),'OURO');solved.push(s);
 console.log('PASS:',String(index+1).padStart(2,'0'),s.level.place,'temporal solution,',s.echoes.length,'echo(es),',s.total.toFixed(2)+'s');
}
// Ghosts hold the final pose; recorded teleports never sweep through sensors.
assert.equal(C.pose([{t:0,x:0,y:0},{t:1,x:40,y:10}],10).x,40);
assert.equal(C.pose([{t:0,x:0,y:0},{t:1,x:400,y:10,warp:true}],.9).x,0);
const s=C.make(0);s.active=true;wait(s,.5);C.rewind(s);const earlier=JSON.stringify(s.echoes[0]);wait(s,.5);C.rewind(s);C.undo(s);assert.equal(s.echoes.length,1);assert.equal(JSON.stringify(s.echoes[0]),earlier);
// Simultaneous opposite directions have no diagonal speed advantage; gates are solid even in phase.
const blocked=C.make(0);blocked.active=true;wait(blocked,.4);const start={...blocked.player};for(let i=0;i<30;i++)C.step(blocked,{x:1,y:1});assert.ok(dist(start,blocked.player)<=C.SPEED*.5+.01);
const phase=C.make(0);phase.active=true;phase.player=D.at(7,5);for(let i=0;i<60;i++)C.step(phase,{x:1,phase:i===0});assert.ok(phase.player.x<8*D.T-C.R+1);
const paused=C.make(0);C.step(paused,{x:1},.05);assert.equal(paused.t,0);
const map=new Map([['echo404_paradox_v06','classic'],['echo404_v93_origin_result','origin']]),storage={getItem:k=>map.get(k)||null,setItem:(k,v)=>map.set(k,v)};
for(const result of solved)assert.equal(C.save(storage,result),true);const progress=C.load(storage);assert.equal(Object.keys(progress.levels).length,25);assert.equal(map.get('echo404_paradox_v06'),'classic');assert.equal(map.get('echo404_v93_origin_result'),'origin');
const worse=solved[0];worse.deaths=7;worse.total+=100;C.save(storage,worse);assert.equal(C.load(storage).levels.origin.medal,'OURO');assert.ok(C.load(storage).levels.origin.bestTime<worse.total);
assert.equal(C.save({getItem(){throw Error('unavailable');},setItem(){throw Error('unavailable');}},solved[0]),false);
map.set(C.KEY,'broken');assert.equal(Object.keys(C.load(storage).levels).length,0);
const before=C.daily(new Date('2026-11-14T22:59:59Z')),after=C.daily(new Date('2026-11-14T23:00:01Z'));assert.notEqual(before.day,after.day);assert.ok(after.index>=0&&after.index<25);assert.equal(C.daily(new Date('2026-11-15T12:00:00Z')).code,after.code);
console.log('PASS: ghost hold/teleport, undo, speed normalization, solid phase gates, pause, isolated saves, best medals and UTC+1 daily rollover');
module.exports={solved,pathTo,walk,wait,C,D};
