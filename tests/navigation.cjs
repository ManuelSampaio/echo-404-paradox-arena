// Run with Node.js: node tests/navigation.cjs
// Executes real inline mission scripts with a minimal DOM/canvas simulation.
// Accelerated completion checks navigation/storage, not full gameplay or rendering.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const renderDir=process.env.ECHO_RENDER_DIR;
const canvasLibrary=renderDir?require('@napi-rs/canvas'):null;
if(renderDir)fs.mkdirSync(renderDir,{recursive:true});
const read = name => fs.readFileSync(path.join(root,name),'utf8');
const missions = ['origin-v97.html','origin-v98.html','origin-v99.html','origin-v100.html','origin-v101.html','origin-v102.html'];
const legacy = ['origin-v91.html','origin-v961.html'];
const saveKeys = [
 ['echo404_v91_origin_mission_complete','echo404_v93_origin_result'],
 ['echo404_v98_sector02_complete','echo404_v98_sector02_result'],
 ['echo404_v99_archive03_complete','echo404_v99_archive03_result'],
 ['echo404_v100_truth04_complete','echo404_v100_truth04_result'],
 ['echo404_v101_architect05_complete','echo404_v101_architect05_result'],
 ['echo404_v102_arca06_complete','echo404_v102_arca06_result']
];
const scripts = html => [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].filter(m=>! /\bsrc=/.test(m[1]));
for(const name of fs.readdirSync(root)) {
 if(name.endsWith('.js')) new vm.Script(read(name),{filename:name});
 if(name.endsWith('.html')) {
  for(const m of scripts(read(name))) new vm.Script(m[2],{filename:name});
  for(const m of read(name).matchAll(/href=["']\.\/([^"'#?]+\.html)["']/g)) assert.ok(fs.existsSync(path.join(root,m[1])),`${name}: ${m[1]}`);
 }
}
console.log('PASS: syntax of all JS files/inline scripts; all literal HTML link destinations exist');
const saved = new Map();
const localStorage = {getItem:k=>saved.get(k)??null,setItem:(k,v)=>saved.set(k,String(v)),removeItem:k=>saved.delete(k)};
function environment(html='') {
 const elements=new Map(),inserted=[],events={},frames=[];
 const realCanvas=canvasLibrary?.createCanvas(960,540);
 const canvas = realCanvas?.getContext('2d') || new Proxy({}, {get:(_,k)=>k==='createLinearGradient'||k==='createRadialGradient'?()=>({addColorStop(){}}):()=>{}});
 const element = id => {
  if(!elements.has(id)) elements.set(id,{
   hidden:false,textContent:'',innerHTML:'',listeners:{},dataset:{},style:{setProperty(){}},
   classList:{add(){},remove(){}},getContext:()=>canvas,
   addEventListener(name,fn){this.listeners[name]=fn;},
   insertAdjacentElement(where,node){inserted.push(node);},
   click(){this.listeners.click?.();}
  });
  return elements.get(id);
 };
 for(const m of html.matchAll(/id="([^"]+)"([^>]*)/g)) element(m[1]).hidden=/\bhidden\b/.test(m[2]);
 const document={getElementById:element,createElement:()=>element(Symbol()),querySelector:()=>element('zone'),querySelectorAll:()=>[],body:element('body')};
 const context=vm.createContext({document,localStorage,console:{log(){},warn(){},group(){},groupEnd(){}},CustomEvent:class{},performance:{now:()=>0},requestAnimationFrame(fn){frames.push(fn);},setTimeout(){},clearTimeout(){},addEventListener(name,fn){events[name]=fn;},dispatchEvent(){}});
 context.window=context;
 return {context,element,inserted,events,frames,realCanvas};
}
const classic=environment();
vm.runInContext(read('storage.js'),classic.context);
vm.runInContext('GameStorage.win(0,1234);GameStorage.saveMedal(0,"gold");',classic.context);
const snapshot=new Map(saved);
const progress=vm.runInContext('JSON.stringify(GameStorage.getProgress())',classic.context);
const indexHtml=read('index.html');
const index=environment(indexHtml);
vm.runInContext(read('campaign-hub.js'),index.context);
assert.equal(index.element('echoV91Launch').href,'./origin-reborn.html');
assert.match(index.element('echoV91Launch').textContent,/COMEÇAR/);
for(const name of [...missions,...legacy]) assert.ok(indexHtml.includes(`href="./${name}"`));
assert.ok(indexHtml.includes('href="./classic.html"'));
assert.ok(read('classic.html').includes('id="arenaShell"'));
assert.ok(!indexHtml.includes('src="game.js'));
assert.ok(read('classic.html').includes('src="game.js'));
assert.deepEqual(saved,snapshot);
console.log('PASS: mission hub entry, six mission links, classic/legacy access; no save writes');
// Existing flags drive continuation. Leave holes, malformed results and unavailable
// storage in the matrix: no migration, hidden mission locks or invented medals.
function hubCase(flags, results={}) {
 const data=new Map([...snapshot,...Object.entries(flags),...Object.entries(results)]);
 const before=new Map(data);
 const env=environment(indexHtml);
 env.context.localStorage={getItem:k=>data.get(k)??null,setItem(){throw Error('hub must not write');}};
 vm.runInContext(read('campaign-hub.js'),env.context);
 assert.deepEqual(data,before);
 return env;
}
for(let n=0;n<=missions.length;n++) {
 const flags=Object.fromEntries(saveKeys.slice(0,n).map(([key])=>[key,'true']));
 const env=hubCase(flags);
 assert.equal(env.element('echoV91Launch').href,'./'+(n===0||n===6?'origin-reborn.html':missions[n]));
 assert.equal(env.element('echoCampaignProgress').textContent,`${n} / 6 missões concluídas`);
 if(n===6) assert.match(env.element('echoV91Launch').textContent,/REJOGAR/);
 for(let i=0;i<6;i++) assert.equal(env.element('echoMissionStatus'+(i+1)).textContent,i<n?'CONCLUÍDA':'POR CONCLUIR');
}
const gap=hubCase({[saveKeys[1][0]]:'true'});
assert.equal(gap.element('echoV91Launch').href,'./origin-reborn.html');
for(const award of ['OURO','PRATA','BRONZE']) {
 const env=hubCase({[saveKeys[0][0]]:'1'},{[saveKeys[0][1]]:JSON.stringify({medal:award})});
 assert.equal(env.element('echoMissionStatus1').textContent,'CONCLUÍDA · MEDALHA '+award);
}
for(const invalid of ['{bad','null','{}','{"medal":"<script>"}']) {
 const env=hubCase({}, {[saveKeys[0][1]]:invalid});
 assert.equal(env.element('echoMissionStatus1').textContent,'POR CONCLUIR');
}
const unavailable=environment(indexHtml);
unavailable.context.localStorage={getItem(){throw Error('unavailable');}};
vm.runInContext(read('campaign-hub.js'),unavailable.context);
assert.equal(unavailable.element('echoV91Launch').href,'./origin-reborn.html');
unavailable.context.localStorage={getItem:k=>k===saveKeys[0][0]?'true':null};
unavailable.events.pageshow();
assert.equal(unavailable.element('echoV91Launch').href,'./origin-v98.html');
unavailable.context.localStorage={getItem:()=>null};
unavailable.events.storage();
assert.equal(unavailable.element('echoV91Launch').href,'./origin-reborn.html');
console.log('PASS: new/partial/full/gapped saves; all medals; malformed/blocked storage; saved values unchanged');
for(let i=0;i<missions.length;i++) {
 const name=missions[i], html=read(name), env=environment(html);
 vm.runInContext(read('campaign-worlds.js'),env.context);
 vm.runInContext(read('campaign-world.js'),env.context);
 // Export a test hook only inside this VM. Production HTML is unmodified.
 const code=scripts(html)[0][2].replace('bind();reset();draw();',`
  window.sceneForTest=()=>{cam=1550;player.x=1900;missionTime=3;worldState.time=mission.period*.75;draw();};
  window.playForTest={
   position:(x,y=417)=>{player.x=x;player.y=y;player.vx=player.vy=0;player.inv=120;},
   step:(dt=0.02)=>update(dt),
   right:(pressed)=>{if(pressed)keys.add("right");else keys.delete("right");},
   status:()=>({x:player.x,gateOpen,gate2Open,terminalDone,echoes:echoes.length,${i>=2?'survivorRecovered,':''}${i===3?'bossPhase,':''}${i===4?'relayCount,architectRevealed,':''}${i===5?'arcaStep,arcaWindow,':''}}),
   ${i>=2?'survivorX:survivor.x,terminalX:terminal.x,':''}
   ${i===3?'coreX:bossCore.x,':''}
   ${i===4?'relayNodes,':''}
   ${i===5?'arcaNodes,':''}
   plate:plate.x,plate2:plate2.x,gate:gate.x,gate2:gate2.x
  };
  window.finishForTest=()=>{
   terminalDone=true;${i>=2?'survivorRecovered=true;':''}${i===3?'bossPhase=3;':''}${i===4?'relaySignals=new Set([0,1,2]);relayCount=3;architectRevealed=true;':''}${i===5?'arcaStep=3;':''}
   player.x=exit.x;player.y=ground-player.h;player.inv=10;update(0);
  };bind();reset();draw();`);
 vm.runInContext(code,env.context,{filename:name});
 assert.equal(env.element('result').hidden,true);
 assert.ok(env.element('missionBriefing').textContent.length>50);
 if(renderDir){env.context.sceneForTest();fs.writeFileSync(path.join(renderDir,name+'.png'),env.realCanvas.toBuffer('image/png'));}
 env.element('begin').click();
 assert.equal(env.frames.length,1);
 env.element('begin').click();
 assert.equal(env.frames.length,1,'no duplicate animation loops');
 const controls=env.context.playForTest;
 // Exercise actual record/replay and physics for both temporal gates.
 for(const [plateX,gateX] of [[controls.plate,controls.gate],[controls.plate2,controls.gate2]]) {
  controls.position(plateX+5);
  env.element('record').click();
  for(let t=0;t<5;t++)controls.step();
  env.element('record').click();
  controls.right(true);
  for(let t=0;t<90;t++)controls.step();
  controls.right(false);
  assert.ok(controls.status().x>gateX+30,name+' crosses recorded echo gate');
 }
 assert.equal(controls.status().echoes,2);
 if(i>=2){
  controls.position(controls.survivorX);controls.step();
  controls.position(controls.terminalX);controls.step();
  assert.equal(controls.status().survivorRecovered,true);assert.equal(controls.status().terminalDone,true);
 }
 if(i===3){
  controls.position(controls.coreX);env.element('record').click();
  for(let t=0;t<5;t++)controls.step();env.element('record').click();
  for(let t=0;t<300;t++)controls.step();
  assert.equal(controls.status().bossPhase,3,'NULL overload requires a real recorded echo');
 }
 if(i===4){
  for(const x of controls.relayNodes){controls.position(x);controls.step();}
  assert.equal(controls.status().relayCount,3,'all unique relay contacts counted');
  for(let t=0;t<65;t++)controls.step();
  assert.equal(controls.status().architectRevealed,true,'relays unlock architect transmission');
 }
 if(i===5){
  controls.position(controls.arcaNodes[1].x);controls.step();
  assert.equal(controls.status().arcaStep,0,'ARCA rejects out of order activation');
  controls.position(controls.arcaNodes[0].x);controls.step();
  assert.equal(controls.status().arcaStep,1);
  controls.position(2530);for(let t=0;t<610;t++)controls.step();
  assert.equal(controls.status().arcaStep,0,'ARCA time limit resets sequence');
  for(const node of controls.arcaNodes){controls.position(node.x);controls.step();}
  assert.equal(controls.status().arcaStep,3,'ordered ARCA contacts unlock final exit');
 }
 env.context.finishForTest();
 assert.equal(env.element('result').hidden,false);
 assert.match(env.element('resultMedal').textContent,/OURO/);
 assert.equal(saved.get(saveKeys[i][0]),'true');
 assert.equal(JSON.parse(saved.get(saveKeys[i][1])).medal,'OURO');
 const medal=saved.get(saveKeys[i][1]);
 const staleFrame=env.frames.shift();
 env.element('retryMission').click();
 staleFrame(100);assert.equal(env.frames.length,0,'retry invalidates pending animation frame');
 assert.equal(env.element('result').hidden,true);
 assert.equal(saved.get(saveKeys[i][1]),medal);
 env.element('begin').click();env.context.finishForTest();
 assert.equal(env.element('result').hidden,false);
 const result=html.match(/<section id="result"[\s\S]*?<\/section>/)[0];
 const next=[...result.matchAll(/href="\.\/([^"]+)"/g)].map(m=>m[1]);
 assert.deepEqual(next,i<missions.length-1?[missions[i+1]]:[]);
 assert.match(html,/<footer>[\s\S]*href="\.\/index.html"/);
 assert.equal(vm.runInContext('JSON.stringify(GameStorage.getProgress())',classic.context),progress);
 for(const [key,value] of snapshot) assert.equal(saved.get(key),value,`classic save modified: ${key}`);
 console.log(`PASS: ${name}: actual completion event, gold medal save, retry, next link and classic return`);
}
for(const name of legacy) {
 assert.match(read(name),/href="\.\/index.html"/);
}
console.log('PASS: existing classic progress/medals preserved; legacy return links valid');
