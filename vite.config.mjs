import {defineConfig} from 'vite';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
export default defineConfig({base:'./',publicDir:false,build:{outDir:'dist',emptyOutDir:true,rollupOptions:{input:{home:'index.html',boot:'origin-reborn.html'},output:{entryFileNames:'assets/[name].js',chunkFileNames:'assets/[name]-[hash].js',assetFileNames:'assets/[name][extname]'}}},plugins:[{name:'preserve-public-game-urls',closeBundle(){
 for(const name of fs.readdirSync('.'))if((/\.html$/.test(name)&&!['index.html','origin-reborn.html'].includes(name))||(/\.(js|css|webmanifest)$/.test(name)&&!name.startsWith('vite.')))fs.copyFileSync(name,path.join('dist',name));
 for(const name of ['assets','vendor','v14-stable','origin-modules','maps','src'])fs.cpSync(name,path.join('dist',name),{recursive:true});
 for(const name of ['index.html','origin-reborn.html']){const p=path.join('dist',name);fs.writeFileSync(p,fs.readFileSync(p,'utf8').replaceAll('./assets/paradox.webmanifest','./paradox.webmanifest'));}
 fs.copyFileSync('paradox-sw.js','dist/paradox-sw.js');
 const hash=crypto.createHash('sha256');const visit=p=>{for(const name of fs.readdirSync(p).sort()){const f=path.join(p,name);if(fs.statSync(f).isDirectory())visit(f);else{hash.update(f.replaceAll('\\','/'));hash.update(fs.readFileSync(f));}}};visit('dist/assets');visit('dist/vendor');for(const n of ['index.html','origin-reborn.html','paradox.webmanifest'])hash.update(fs.readFileSync('dist/'+n));const release=hash.digest('hex').slice(0,12);
 const built=fs.readdirSync('dist/assets').filter(f=>/\.(js|css|png)$/.test(f)).map(f=>'./assets/'+f);const worker=fs.readFileSync('dist/paradox-sw.js','utf8').replace("echo404-v15-1","echo404-v15-"+release);fs.writeFileSync('dist/paradox-sw.js',worker.replace('/* BUILD_FILES */','FILES.push(...'+JSON.stringify(built)+');'));
}}]});
