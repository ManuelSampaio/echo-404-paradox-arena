const assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm');
const c={};c.window=c;for(const f of ['origin-pilot-data.js','origin-tiled.js','origin-maps.js','origin-devices.js','origin-geometry.js','origin-session.js'])vm.runInNewContext(fs.readFileSync(f,'utf8'),c);
const D=c.OriginPilot,S=c.OriginSession,G=c.OriginGeometry;
const map=new Map(),store={getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,String(v)),removeItem:k=>map.delete(k)};
// Real v14 output, produced by its frozen implementation, not a hand-written approximation.
const old={};old.window=old;vm.runInNewContext(fs.readFileSync('v14-stable/origin-pilot-data.js','utf8'),old);
for(let i=0;i<25;i++)old.OriginPilot.save(store,{time:90+i,health:2,echoes:1,deaths:0,secrets:2,medal:'OURO'},i);
map.set('echo404_origin_operator','nyra');map.set('echo404_origin_sound','false');const before=JSON.stringify([...map]);const legacy=new Map(map);
assert.equal(D.load(store).levels.archive.legacyMedal,'OURO');assert.equal(JSON.stringify([...map]),before,'migration is read-only');
for(let i=0;i<25;i++)assert.ok(D.save(store,{time:50+i,health:3,fragments:3,deaths:0,operator:'axiom',pure:true,stars:[true,true,true],medal:'PRATA'},i));
for(const [k,v]of legacy)assert.equal(map.get(k),v,'legacy unchanged: '+k);
assert.equal(JSON.parse(map.get(D.KEY)).version,15);assert.equal(D.load(store).levels.origin.version,require('../package.json').version);
assert.deepEqual([...S.stars({fragments:3,time:180,deaths:0},180)],[true,false,true]);
assert.ok(D.save(store,{time:1,operator:'axiom',pure:false,stars:[false,false,false],medal:'BRONZE'},0));assert.equal(D.load(store).levels.origin.byOperator.axiom.bestTime,50,'assisted cannot replace pure record');assert.ok(D.load(store).levels.origin.byOperator.axiom.stars.every(Boolean));
const session=new S.Session(store,'origin','nyra',true);session.death('menu-checkpoint',12);session.flush(33,true);assert.match(S.report(store),/menu-checkpoint/);for(const [k,v]of legacy)assert.equal(map.get(k),v);
assert.ok(G.segmentRect(0,5,20,5,{x:8,y:0,width:4,height:10}));assert.ok(!G.segmentRect(0,15,20,15,{x:8,y:0,width:4,height:10}));assert.ok(G.segmentRect(10,-5,10,20,{x:8,y:0,width:4,height:10}));
for(const l of D.levels){assert.equal(l.id,old.OriginPilot.levels[l.index].id);assert.equal(l.world,Math.floor(l.index/5)+1);assert.equal(l.fragments.length,3);const m=JSON.parse(fs.readFileSync('maps/'+l.id+'.json'));assert.ok(c.OriginTiled.validate(m));assert.equal(JSON.stringify(c.OriginTiled.adapt(m)),JSON.stringify(l));for(const link of l.links){assert.ok(l.sensors.some(s=>s.id===link.sensor));assert.ok(l.devices.some(d=>d.id===link.device));}}
const final=D.levels[24],devices=new c.OriginDevices.Devices(final);devices.update(.1,[final.sensors[0]],0);assert.equal(devices.state['exit-door'],false);devices.update(.1,final.sensors,0);assert.equal(devices.state['exit-door'],true,'AND door requires two actors');devices.update(.1,[],0);assert.equal(devices.state['exit-door'],false);
const invalid=JSON.parse(fs.readFileSync('maps/origin.json'));invalid.layers=invalid.layers.filter(l=>l.name!=='fragments');assert.throws(()=>c.OriginTiled.validate(invalid));
const manifest=JSON.parse(fs.readFileSync('paradox.webmanifest'));assert.equal(manifest.orientation,'portrait');assert.equal(manifest.id,'./origin-reborn.html');assert.ok(manifest.icons.some(i=>i.purpose==='maskable'));assert.match(fs.readFileSync('origin-reborn.html','utf8'),/rel="manifest"/);
// Stable comparison reads historical data but writes only its own prefix.
const sw={localStorage:store};vm.runInNewContext(fs.readFileSync('v14-stable/stable-storage.js','utf8'),{window:sw,Object});sw.localStorage.setItem('echo404_origin_sound','true');assert.equal(map.get('echo404_origin_sound'),'false');
console.log('PASS v15: genuine v14 save immutability, independent stars/pure records, telemetry, geometry, Tiled parity/validation, double-echo AND, portrait manifest and isolated stable comparison');
