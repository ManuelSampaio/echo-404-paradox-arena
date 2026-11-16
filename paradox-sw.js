/* ECHO//404 v15: explicit resources only; comparison build is out of scope. */
const CACHE='echo404-v15-1';
const FILES=['./','./index.html','./origin-reborn.html','./paradox.html','./paradox.webmanifest','./paradox-register.js','./paradox.css','./origin-pilot.css','./vendor/phaser-3.90.0.min.js','./assets/origin/patrols.png',...['axiom','nyra','kai7','axiom-portrait','nyra-portrait','kai7-portrait','platform','horizon'].map(n=>'./assets/operators/'+n+'.png'),...['192','512','maskable'].map(n=>'./assets/paradox/icon-'+n+'.png'),...['origin-balance','origin-pilot-data','origin-feel-config','origin-abilities','origin-session','origin-geometry','origin-tiled','origin-maps','origin-content','origin-devices','origin-home','origin-pilot'].map(n=>'./'+n+'.js'),...['movement','echoes','devices','enemies','hud','training','abilities','mechanisms'].map(n=>'./origin-modules/'+n+'.js'),'./src/boot.js','./src/home.js','./src/maps.js',...['origin','drift','resonance','mirage','window','junction','interference','trace','reflection','escape','current','frequency','between','phasebridge','fracture','blind','order','presents','silence','overload','signatures','maze','lastwindow','paradox','archive'].map(id=>'./maps/'+id+'.json')];
/* BUILD_FILES */
const ALLOWED=new Set(FILES.map(p=>new URL(p,self.location.href).pathname));
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES.map(p=>new Request(new URL(p,self.location.href),{cache:'reload'})))).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>/^echo404-v1[45]-/.test(k)&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET'||u.origin!==self.location.origin||!ALLOWED.has(u.pathname)||u.pathname.includes('/v14-stable/'))return;
 const network=()=>fetch(e.request,{cache:'no-cache'}).then(r=>{if(!r.ok)throw Error('HTTP '+r.status);caches.open(CACHE).then(c=>c.put(e.request,r.clone()));return r;});
 if(e.request.mode==='navigate'||/\.(js|css)$/.test(u.pathname)&&!u.pathname.includes('/vendor/'))e.respondWith(network().catch(()=>caches.match(e.request,{ignoreSearch:true})));
 else e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(r=>r||network()));
});
