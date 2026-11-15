const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const {JSDOM}=require('jsdom');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
(async()=>{
 const dom=new JSDOM(read('index.html').replace(/<script[\s\S]*?<\/script>/g,''),{url:'https://example.com/game/',runScripts:'outside-only'}),w=dom.window;
 for(const file of ['origin-pilot-data.js','origin-home.js'])w.eval(read(file));
 assert.equal(w.document.querySelectorAll('#arenaGrid a').length,25);
 assert.ok(w.document.getElementById('continue14').href.endsWith('#nivel=1'));
 const localFiles=['index.html','paradox.html','campaign-v12.html'];
 for(const file of localFiles){const d=new JSDOM(read(file));for(const el of d.window.document.querySelectorAll('[href],[src]')){const raw=el.getAttribute('href')||el.getAttribute('src');if(!raw||/^(https?:|#|data:|mailto:)/.test(raw))continue;const p=raw.split(/[?#]/)[0];if(p)assert.ok(fs.existsSync(path.resolve(root,p)),file+': '+p);}}
 const events={},cached=new Map(),deleted=[],scope='https://example.com/game/';let offline=false;const requests=[];
 const cache={addAll:async files=>{for(const f of files){const p=new URL(typeof f==='string'?f:f.url,scope);assert.equal(f.cache,'reload');assert.ok(fs.existsSync(path.join(root,p.pathname.replace('/game/','')||'index.html')),f);cached.set(p.pathname,{ok:true,marker:f});}},put:async(req,response)=>cached.set(new URL(req.url).pathname,response)};
 const caches={open:async()=>cache,keys:async()=>['echo404-v14-old','classic-cache'],delete:async k=>deleted.push(k),match:async req=>cached.get(new URL(req.url).pathname)};
 const self={location:new URL(scope+'paradox-sw.js'),addEventListener:(name,fn)=>events[name]=fn,skipWaiting:async()=>{},clients:{claim:async()=>{}}};
 vm.runInNewContext(read('paradox-sw.js'),{self,caches,URL,Request,fetch:async(req,options)=>{requests.push({url:req.url,cache:options?.cache});if(offline)throw Error('offline');return {ok:true,marker:'fresh-v14.0.3',clone(){return this;}};}});
 let pending;events.install({waitUntil:p=>pending=p});await pending;assert.equal(cached.size,34);
 events.activate({waitUntil:p=>pending=p});await pending;assert.deepEqual(deleted,['echo404-v14-old']);
 function request(file,mode='navigate',method='GET'){let response;events.fetch({request:{url:scope+file,mode,method},respondWith:p=>response=p});return response;}
 assert.equal(request('classic.html'),undefined);assert.equal(request('game.js'),undefined);assert.equal(request('storage.js'),undefined);assert.equal(request('paradox.html','navigate','POST'),undefined);
 const fresh=await request('origin-reborn.html?v=old');assert.equal(fresh.marker,'fresh-v14.0.3');assert.equal(requests.at(-1).cache,'no-cache');const freshScript=await request('origin-pilot.js?v=old','cors');assert.equal(freshScript.marker,'fresh-v14.0.3');assert.equal(requests.at(-1).cache,'no-cache');
 offline=true;assert.ok(await request('paradox.html?v=1400'));assert.ok(await request('assets/operators/horizon.png','cors'));assert.ok(await request('origin-reborn.html'));assert.ok(await request('origin-pilot.js','cors'));assert.ok(await request('assets/operators/nyra.png','cors'));
 console.log('PASS: 25 home links, local resources, isolated cache cleanup, classic bypass and fresh online HTML/scripts and offline page/arena fallback');
 const registrationEvents={};let registeredOptions,updateChecks=0;const status={textContent:''};
 const registration={update:async()=>{updateChecks++;}},navigator={serviceWorker:{register:async(url,options)=>{assert.equal(url,'./paradox-sw.js');registeredOptions=options;return registration;},ready:Promise.resolve(registration)}};
 vm.runInNewContext(read('paradox-register.js'),{navigator,window:{isSecureContext:true,addEventListener:(event,fn)=>registrationEvents[event]=fn},document:{getElementById:()=>status}});registrationEvents.load();for(let n=0;n<12;n++)await Promise.resolve();assert.equal(registeredOptions.updateViaCache,'none');assert.equal(updateChecks,1);assert.match(status.textContent,/offline/);
 console.log('PASS: registration checks current worker without HTTP cache and preserves offline readiness');
 w.close();
})().catch(e=>{console.error(e);process.exit(1);});
