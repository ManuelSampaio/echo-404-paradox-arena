// Run with Node.js: node tests/navigation.cjs
// Executes real inline mission scripts with a minimal DOM/canvas simulation.
// Accelerated completion checks navigation/storage, not full gameplay or rendering.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
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
 const elements=new Map(),inserted=[];
 const canvas = new Proxy({}, {get:(_,k)=>k==='createLinearGradient'||k==='createRadialGradient'?()=>({addColorStop(){}}):()=>{}});
 const element = id => {
  if(!elements.has(id)) elements.set(id,{
   hidden:false,textContent:'',innerHTML:'',listeners:{},dataset:{},
   classList:{add(){},remove(){}},getContext:()=>canvas,
   addEventListener(name,fn){this.listeners[name]=fn;},
   insertAdjacentElement(where,node){inserted.push(node);},
   click(){this.listeners.click?.();}
  });
  return elements.get(id);
 };
 for(const m of html.matchAll(/id="([^"]+)"([^>]*)/g)) element(m[1]).hidden=/\bhidden\b/.test(m[2]);
 const document={getElementById:element,createElement:()=>element(Symbol()),querySelector:()=>element('zone'),querySelectorAll:()=>[],body:element('body')};
 const context=vm.createContext({document,localStorage,console:{log(){},warn(){},group(){},groupEnd(){}},CustomEvent:class{},performance:{now:()=>0},requestAnimationFrame(){},setTimeout(){},clearTimeout(){},addEventListener(){},dispatchEvent(){}});
 context.window=context;
 return {context,element,inserted};
}
const classic=environment();
vm.runInContext(read('storage.js'),classic.context);
vm.runInContext('GameStorage.win(0,1234);GameStorage.saveMedal(0,"gold");',classic.context);
const snapshot=new Map(saved);
const progress=vm.runInContext('JSON.stringify(GameStorage.getProgress())',classic.context);
const index=environment();
vm.runInContext(scripts(read('index.html')).find(m=>m[1].includes('id="echo-v91-launch"'))[2],index.context);
assert.equal(index.inserted[0].href,'./origin-v97.html');
assert.match(index.inserted[0].innerHTML,/missão 01 atualizada/);
for(const name of legacy) assert.ok(index.inserted[1].innerHTML.includes(`href="./${name}"`));
for(const node of index.inserted) for(const m of (node.innerHTML||'').matchAll(/href="\.\/([^"]+)"/g)) assert.ok(fs.existsSync(path.join(root,m[1])));
assert.deepEqual(saved,snapshot);
console.log('PASS: generated main entry targets mission 01 v9.7; both legacy versions accessible; navigation writes no saves');
for(let i=0;i<missions.length;i++) {
 const name=missions[i], html=read(name), env=environment(html);
 // Export a test hook only inside this VM. Production HTML is unmodified.
 const code=scripts(html)[0][2].replace('bind();reset();draw();',`
  window.finishForTest=()=>{
   terminalDone=true;${i>=2?'survivorRecovered=true;':''}${i>=3?'bossPhase=3;':''}${i>=4?'architectRevealed=true;':''}${i>=5?'arcaStep=3;':''}
   player.x=exit.x;player.y=ground-player.h;player.inv=10;update(0);
  };bind();reset();draw();`);
 vm.runInContext(code,env.context,{filename:name});
 assert.equal(env.element('result').hidden,true);
 env.element('begin').click();env.context.finishForTest();
 assert.equal(env.element('result').hidden,false);
 assert.match(env.element('resultMedal').textContent,/OURO/);
 assert.equal(saved.get(saveKeys[i][0]),'true');
 assert.equal(JSON.parse(saved.get(saveKeys[i][1])).medal,'OURO');
 const medal=saved.get(saveKeys[i][1]);
 env.element('retryMission').click();
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
