const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const {JSDOM}=require('jsdom');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
(async()=>{
 const dom=new JSDOM(read('index.html').replace(/<script[\s\S]*?<\/script>/g,''),{url:'https://example.com/game/',runScripts:'outside-only'}),w=dom.window;
 for(const file of ['paradox-data.js','paradox-core.js','paradox-home.js'])w.eval(read(file));
 assert.equal(w.document.querySelectorAll('#arenaGrid a').length,25);
 assert.ok(w.document.getElementById('continue14').href.endsWith('#nivel=origin'));
 const localFiles=['index.html','paradox.html','campaign-v12.html'];
 for(const file of localFiles){const d=new JSDOM(read(file));for(const el of d.window.document.querySelectorAll('[href],[src]')){const raw=el.getAttribute('href')||el.getAttribute('src');if(!raw||/^(https?:|#|data:|mailto:)/.test(raw))continue;const p=raw.split(/[?#]/)[0];if(p)assert.ok(fs.existsSync(path.resolve(root,p)),file+': '+p);}}
 const events={},cached=new Map(),deleted=[],scope='https://example.com/game/';let offline=false;
 const cache={addAll:async files=>{for(const f of files){const p=new URL(f,scope);assert.ok(fs.existsSync(path.join(root,p.pathname.replace('/game/','')||'index.html')),f);cached.set(p.pathname,{ok:true,marker:f});}},put:async()=>{}};
 const caches={open:async()=>cache,keys:async()=>['echo404-v14-old','classic-cache'],delete:async k=>deleted.push(k),match:async req=>cached.get(new URL(req.url).pathname)};
 const self={location:new URL(scope+'paradox-sw.js'),addEventListener:(name,fn)=>events[name]=fn,skipWaiting:async()=>{},clients:{claim:async()=>{}}};
 vm.runInNewContext(read('paradox-sw.js'),{self,caches,URL,fetch:async()=>{if(offline)throw Error('offline');return {ok:true,clone(){return this;}};}});
 let pending;events.install({waitUntil:p=>pending=p});await pending;assert.equal(cached.size,42);
 events.activate({waitUntil:p=>pending=p});await pending;assert.deepEqual(deleted,['echo404-v14-old']);
 function request(file,mode='navigate',method='GET'){let response;events.fetch({request:{url:scope+file,mode,method},respondWith:p=>response=p});return response;}
 assert.equal(request('classic.html'),undefined);assert.equal(request('origin-reborn.html'),undefined);assert.equal(request('storage.js'),undefined);assert.equal(request('paradox.html','navigate','POST'),undefined);
 offline=true;assert.ok(await request('paradox.html?v=1400'));assert.ok(await request('assets/paradox/archive.png','cors'));
 console.log('PASS: 25 home links, local resources, isolated cache cleanup, classic bypass and offline page/arena fallback');
 w.close();
})().catch(e=>{console.error(e);process.exit(1);});
