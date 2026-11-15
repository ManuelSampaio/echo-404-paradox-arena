/* ECHO//404 v14 offline cache. Only explicit game resources are intercepted. */
const CACHE='echo404-v14-4';
const CORE=['./','./index.html','./paradox.html','./paradox.css?v=1410','./paradox-data.js?v=1410','./paradox-core.js?v=1410','./paradox-game.js?v=1410','./paradox-home.js?v=1410','./paradox-register.js?v=1410','./paradox.webmanifest','./vendor/phaser-3.90.0.min.js','./assets/origin/explorer.png','./assets/origin/patrols.png','./assets/paradox/icon-192.png','./assets/paradox/icon-512.png','./assets/paradox/preview.png','./assets/operators/horizon.png'];
CORE.push('./origin-home.js?v=1410','./origin-reborn.html','./origin-pilot.css?v=1410','./origin-pilot-data.js?v=1410','./origin-pilot.js?v=1410',...['axiom','nyra','kai7','axiom-portrait','nyra-portrait','kai7-portrait','platform'].map(id=>'./assets/operators/'+id+'.png'));
CORE.push('./origin-v91.html','./origin-v961.html','./campaign-v12.html',...Array.from({length:6},(_,i)=>'./origin-v'+(97+i)+'.html'));
const FILES=CORE.filter(path=>!path.includes('paradox-core')&&!path.includes('paradox-data')&&!path.includes('paradox-game')&&!path.includes('paradox-home')&&!path.includes('assets/origin/explorer')&&!path.includes('assets/paradox/preview'));
const ALLOWED=new Set(FILES.map(path=>new URL(path,self.location.href).pathname));
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES.map(path=>new Request(new URL(path,self.location.href),{cache:'reload'})))).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('echo404-v14-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{const url=new URL(event.request.url);if(event.request.method!=='GET'||url.origin!==self.location.origin||!ALLOWED.has(url.pathname))return;
 if(event.request.mode==='navigate'||/\.(?:js|css)$/.test(url.pathname)&&!url.pathname.includes('/vendor/')){event.respondWith(fetch(event.request,{cache:'no-cache'}).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));}return response;}).catch(()=>caches.match(event.request,{ignoreSearch:true})));}
 else event.respondWith(caches.match(event.request,{ignoreSearch:true}).then(cached=>cached||fetch(event.request).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));}return response;})));
});
self.addEventListener('message',event=>{if(event.data==='ECHO14_READY')event.source?.postMessage({type:'ECHO14_READY'});});
