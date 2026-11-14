// node tests/worlds.cjs — gameplay contracts for mission data and patrol AI.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=name=>fs.readFileSync(path.join(root,name),'utf8');
const context=vm.createContext({});context.window=context;
vm.runInContext(read('campaign-worlds.js'),context);vm.runInContext(read('campaign-world.js'),context);
const data=context.CampaignWorlds,engine=context.CampaignWorld;
assert.equal(new Set(data.missions.map(m=>m.kind)).size,6);
assert.equal(new Set(data.missions.map(m=>m.sky)).size,6);
assert.equal(new Set(data.missions.map(m=>JSON.stringify(m.platforms))).size,6);
assert.equal(new Set(Object.keys(data.archetypes)).size,8);
const maxJump=530*530/(2*1450);
for(let id=1;id<=6;id++) {
 const m=data.get(id),gates=id===1?[1500,2300]:[1460,2400];
 for(const p of m.platforms) {
  assert.ok(455-p.y<maxJump,`mission ${id}: platform reachable from ground`);
  // An elevated platform may not cross a locked gate or end close enough
  // before one to allow a full-height jump over its 130px wall.
  // Ground jump travel is 172px; reserve 220px including the player width.
  for(const x of gates) assert.ok(p.x>x+30 || p.x+p.w<x-220,`mission ${id}: preserve echo gate at ${x}`);
 }
 for(const x of m.zones)for(const plate of id===1?[1210,2110]:[1140,2060])assert.ok(Math.abs(x-plate)>120,'safe echo plate');
 assert.ok(m.guards.length>=2);
 const state=engine.create(m);
 let alert=0,hits=0;const player={x:82,y:417,w:24,h:38};
 for(let tick=0;tick<3600;tick++)engine.update(state,1/60,player,m.blocks,()=>hits++,()=>alert++);
 assert.equal(hits,0,'spawn safety');
 assert.equal(alert,0,'no remote detection');
 for(const g of state.guards){assert.ok(g.x>=g.min&&g.x<=g.max);assert.ok(Number.isFinite(g.y));}
 assert.ok(state.shots.length<20,'bounded projectiles');
}
console.log('PASS: six distinct palettes/layouts, eight archetypes, reachable platforms, echo gate/plate safety, 60s patrol bounds and safe spawn');
assert.equal(engine.blocked(0,440,150,440,[{x:60,y:410,w:50,h:45}]),true);
assert.equal(engine.blocked(0,380,150,380,[{x:60,y:410,w:50,h:45}]),false);
for(const type of Object.keys(data.archetypes)) {
 const m=data.get(1),state=engine.create(m),g=engine.makeGuard(type,500,450,550);
 state.guards=[g];let alerts=0,hits=0;
 const p={x:590,y:417,w:24,h:38};
 for(let tick=0;tick<100;tick++)engine.update(state,.01,p,[],()=>hits++,()=>alerts++);
 assert.equal(g.state,'chase',type+' detects player');assert.ok(alerts>0);
 assert.equal(state.shots.length,0,type+' telegraphs before firing');
 for(let tick=0;tick<500;tick++)engine.update(state,.01,p,[],()=>hits++,()=>alerts++);
 if(!data.archetypes[type].melee)assert.ok(hits>0,type+' fires aimed shots');
 p.x=2000;
 for(let tick=0;tick<400;tick++)engine.update(state,.01,p,[],()=>{},()=>{});
 assert.equal(g.state,'patrol',type+' returns to patrol after losing player');
}
// Verify melee pursuers can reach and hurt a player, without inventing ranged fire.
for(const type of ['hound','crawler']) {
 const state=engine.create(data.get(1));state.guards=[engine.makeGuard(type,500,450,750)];let hits=0;
 for(let i=0;i<350;i++)engine.update(state,.01,{x:620,y:417,w:24,h:38},[],()=>hits++,()=>{});
 assert.ok(hits>0);assert.equal(state.shots.length,0);
}
// Solid cover cancels detection and physically absorbs a projectile.
const covered=engine.create(data.get(1));covered.guards=[engine.makeGuard('scout',500,500,500)];
const wall=[{x:550,y:350,w:40,h:105}];
for(let i=0;i<300;i++)engine.update(covered,.01,{x:650,y:417,w:24,h:38},wall,()=>assert.fail('cover damage'),()=>assert.fail('cover detection'));
covered.shots.push({x:549,y:430,vx:230,vy:0,life:2});
engine.update(covered,.02,{x:650,y:417,w:24,h:38},wall,()=>assert.fail('shot through cover'),()=>{});
assert.equal(covered.shots.length,0);
// Environmental damage has a warning phase and can be avoided on platforms.
for(let id=2;id<=6;id++) {
 const m=data.get(id),state=engine.create(m);state.guards=[];let hits=0;
 const p={x:m.zones[0]+15,y:417,w:24,h:38};
 state.time=m.period*.5;engine.update(state,0,p,[],()=>hits++,()=>{});assert.equal(hits,0);
 state.time=m.period*.75;engine.update(state,0,p,[],()=>hits++,()=>{});assert.equal(hits,1);
 p.y=325;engine.update(state,0,p,[],()=>hits++,()=>{});assert.equal(hits,1);
}
console.log('PASS: detection/chase/search/patrol, telegraphed ranged attacks, melee, cover, timed hazard warnings and vertical avoidance');
// Both entry modes resolve to their own game; classic still loads the original engine.
const home=read('index.html'),classic=read('classic.html');
assert.ok(home.includes('href="./classic.html"'));assert.ok(!home.includes('src="game.js'));
for(const script of ['game.js','storage.js','levels.js','awakening.js'])assert.ok(classic.includes('src="'+script));
assert.ok(classic.includes('href="./index.html"'));
for(const file of ['origin-v91.html','origin-v961.html'])assert.ok(fs.existsSync(path.join(root,file)));
console.log('PASS: campaign primary, classic standalone, both return routes and legacy entry files');
