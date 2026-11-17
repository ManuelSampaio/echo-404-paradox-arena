import {defineConfig} from 'vite';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
export default defineConfig({base:'./',publicDir:false,build:{outDir:'dist',emptyOutDir:true,rollupOptions:{input:{home:'index.html',boot:'origin-reborn.html'},output:{entryFileNames:'assets/[name]-[hash].js',chunkFileNames:'assets/[name]-[hash].js',assetFileNames:'assets/[name]-[hash][extname]'}}},plugins:[{name:'preserve-public-game-urls',closeBundle(){
 // Publish current campaign resources and tiny legacy redirects only.
 const runtime=['paradox.webmanifest','paradox-register.js','paradox.css','origin-pilot.css','origin-session.js','origin-geometry.js','origin-feel-config.js','origin-pilot-data.js','origin-tiled.js','origin-maps.js','origin-balance.js','origin-devices.js','origin-abilities.js','origin-home.js','origin-pilot.js'];
 for(const name of runtime)fs.copyFileSync(name,path.join('dist',name));
 for(const name of fs.readdirSync('.').filter(n=>n.endsWith('.html')&&!['index.html','origin-reborn.html'].includes(n)))fs.copyFileSync(name,path.join('dist',name));
 for(const name of ['vendor','origin-modules','maps','src'])fs.cpSync(name,path.join('dist',name),{recursive:true});
 for(const name of ['operators'])fs.cpSync('assets/'+name,'dist/assets/'+name,{recursive:true});
 fs.mkdirSync('dist/assets/origin',{recursive:true});fs.copyFileSync('assets/origin/patrols.png','dist/assets/origin/patrols.png');
 fs.mkdirSync('dist/assets/paradox',{recursive:true});for(const icon of ['192','512','maskable'])fs.copyFileSync('assets/paradox/icon-'+icon+'.png','dist/assets/paradox/icon-'+icon+'.png');
 for(const name of ['index.html','origin-reborn.html']){const p=path.join('dist',name);fs.writeFileSync(p,fs.readFileSync(p,'utf8').replace(/\.\/assets\/paradox(?:-[a-zA-Z0-9_-]+)?\.webmanifest/g,'./paradox.webmanifest'));}
 fs.copyFileSync('paradox-sw.js','dist/paradox-sw.js');
 const hash=crypto.createHash('sha256');const visit=p=>{for(const name of fs.readdirSync(p).sort()){const f=path.join(p,name);if(fs.statSync(f).isDirectory())visit(f);else{hash.update(f.replaceAll('\\','/'));hash.update(fs.readFileSync(f));}}};visit('dist/assets');visit('dist/vendor');for(const n of ['index.html','origin-reborn.html','paradox.webmanifest'])hash.update(fs.readFileSync('dist/'+n));const release=hash.digest('hex').slice(0,12);
 const built=fs.readdirSync('dist/assets').filter(f=>/\.(js|css|png)$/.test(f)).map(f=>'./assets/'+f);const worker=fs.readFileSync('dist/paradox-sw.js','utf8').replace("echo404-v16-1","echo404-v16-"+release);fs.writeFileSync('dist/paradox-sw.js',worker.replace('/* BUILD_FILES */','FILES.push(...'+JSON.stringify(built)+');'));
}}]});
