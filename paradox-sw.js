/* ECHO//404 v14 offline cache. Only explicit game resources are intercepted. */
const CACHE='echo404-v14-2';
const CORE=['./','./index.html','./paradox.html','./paradox.css?v=1401','./paradox-data.js?v=1401','./paradox-core.js?v=1401','./paradox-game.js?v=1401','./paradox-home.js?v=1401','./paradox-register.js?v=1401','./paradox.webmanifest','./vendor/phaser-3.90.0.min.js','./assets/origin/explorer.png','./assets/origin/patrols.png','./assets/paradox/icon-192.png','./assets/paradox/icon-512.png','./assets/paradox/preview.png','./assets/operators/horizon.png'];
const ARENAS=['origin','drift','resonance','mirage','window','junction','interference','trace','reflection','escape','current','frequency','between','phasebridge','fracture','blind','order','presents','silence','overload','signatures','maze','lastwindow','paradox','archive'];
const FILES=CORE.concat(ARENAS.map(id=>'./assets/paradox/'+id+'.png'));
const ALLOWED=new Set(FILES.map(path=>new URL(path,self.location.href).pathname));
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('echo404-v14-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{const url=new URL(event.request.url);if(event.request.method!=='GET'||url.origin!==self.location.origin||!ALLOWED.has(url.pathname))return;
 if(event.request.mode==='navigate'||/\.(?:js|css)$/.test(url.pathname)&&!url.pathname.includes('/vendor/')){event.respondWith(fetch(event.request).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));}return response;}).catch(()=>caches.match(event.request,{ignoreSearch:true})));}
 else event.respondWith(caches.match(event.request,{ignoreSearch:true}).then(cached=>cached||fetch(event.request).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));}return response;})));
});
self.addEventListener('message',event=>{if(event.data==='ECHO14_READY')event.source?.postMessage({type:'ECHO14_READY'});});
