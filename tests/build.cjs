const fs=require('fs'),path=require('path'),assert=require('node:assert/strict'),vm=require('vm'),{JSDOM}=require('jsdom');
assert.match(fs.readFileSync('dist/paradox-sw.js','utf8'),/const CACHE='echo404-v16-[a-f0-9]{12}';/,'release cache derives from built content, including image bytes');
const events={},self={location:{href:'https://example.com/echo/paradox-sw.js'},addEventListener:(k,v)=>events[k]=v};let paths;
vm.runInNewContext(fs.readFileSync('dist/paradox-sw.js','utf8')+';paths=[...ALLOWED];',{self,URL,set paths(p){paths=p;}});
for(const file of ['index.html','origin-reborn.html']){const w=new JSDOM(fs.readFileSync('dist/'+file,'utf8')).window;for(const el of w.document.querySelectorAll('script[src],link[href],img[src]')){const ref=el.getAttribute('src')||el.getAttribute('href');if(ref.startsWith('http'))continue;const p=ref.split('?')[0].replace(/^\.\//,'');assert.ok(fs.existsSync('dist/'+p),file+' -> '+p);assert.ok(paths.includes('/echo/'+p),'offline precache includes '+p);}assert.equal(w.document.querySelector('link[rel=manifest]').getAttribute('href'),'./paradox.webmanifest','manifest URLs must stay at app root');w.close();}
const m=JSON.parse(fs.readFileSync('dist/paradox.webmanifest'));assert.ok(fs.existsSync(path.join('dist',m.start_url)));for(const i of m.icons)assert.ok(fs.existsSync('dist/'+i.src));console.log('PASS: built entry links, module chunks, images, offline precache and root-relative PWA manifest/start/icons');

assert.ok(!fs.existsSync('dist/v14-stable'),'comparison build is retired');
for(const old of ['game.js','storage.js','levels.js','awakening.js','paradox-game.js'])assert.ok(!fs.existsSync('dist/'+old),'old runtime is not published: '+old);
for(const html of ['classic.html','campaign-v12.html','origin-v97.html']){const text=fs.readFileSync('dist/'+html,'utf8');assert.ok(text.includes('location.replace'));assert.ok(!text.includes('game.js'));}
console.log('PASS: only current campaign runtime is published; old entries redirect, no stable edition');
