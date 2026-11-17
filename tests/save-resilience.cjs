const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const c={};c.window=c;for(const f of ['origin-pilot-data.js','origin-session.js'])vm.runInNewContext(fs.readFileSync(f,'utf8'),c);
const m=new Map([['echo404_origin_campaign_v14','{"version":14,"levels":{"origin":{"medal":"OURO","bestTime":88}}}']]),s={getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,String(v))},legacy=m.get('echo404_origin_campaign_v14'),D=c.OriginPilot,S=c.OriginSession;
for(const bad of [null,[],{runs:null},{runs:[null,{}, {level:'origin',operator:'axiom',time:1,deaths:[null,{cause:'fall',time:1}]}]}]){m.set(S.KEY,JSON.stringify(bad));const run=new S.Session(s,'origin','axiom');run.death('fall',1);run.flush(2,true);assert.match(S.report(s),/origin/);}
for(const bad of [null,[],{coins:-20,tier:-2},{coins:Infinity,tier:999,awarded:null}]){m.set(S.ECONOMY,JSON.stringify(bad));const e=S.economy(s);assert.ok(e.coins>=0&&e.tier>=0&&e.tier<=5);S.reward(s,'origin:axiom');S.buy(s);}
for(const bad of [null,[],{pure:null,reduced:'yes'}]){m.set(S.SETTINGS,JSON.stringify(bad));assert.equal(S.settings(s).pure,true);assert.equal(S.settings(s).reduced,false);}
for(const bad of [null,{time:1,frames:[]},{time:1,frames:[null,[1,2]]}]){m.set('ghost',JSON.stringify(bad));assert.equal(S.ghost(s,'ghost'),null);}
for(const operator of ['axiom','nyra','kai7']){D.save(s,{operator,pure:true,time:50,stars:[true,true,true],medal:'OURO'},0);D.save(s,{operator,pure:false,time:1,stars:[false,false,false],medal:'BRONZE'},0);const r=D.load(s).levels.origin;assert.equal(r.medal,'OURO');assert.equal(r.bestTime,50);assert.equal(r.time,50);assert.ok(r.stars.every(Boolean));assert.ok(r.byOperator[operator].stars.every(Boolean));assert.equal(r.lastRun.pure,false);}
assert.equal(m.get('echo404_origin_campaign_v14'),legacy);
const blocked={getItem(){throw Error('blocked')},setItem(){throw Error('quota')}};assert.doesNotThrow(()=>new S.Session(blocked,'origin','axiom').flush());assert.equal(D.save(blocked,{time:1},0),false);
console.log('PASS: corrupt reports/settings/economy/ghosts, quota failures, pure aggregates and immutable legacy data');
