import {defineConfig} from 'vite';
import fs from 'node:fs';
import path from 'node:path';
export default defineConfig({base:'./',publicDir:false,build:{outDir:'dist',emptyOutDir:true,rollupOptions:{input:{home:'index.html',boot:'origin-reborn.html'},output:{entryFileNames:'assets/[name].js',chunkFileNames:'assets/[name]-[hash].js',assetFileNames:'assets/[name][extname]'}}},plugins:[{name:'preserve-public-game-urls',closeBundle(){
 for(const name of fs.readdirSync('.'))if((/\.html$/.test(name)&&!['index.html','origin-reborn.html'].includes(name))||(/\.(js|css|webmanifest)$/.test(name)&&!name.startsWith('vite.')))fs.copyFileSync(name,path.join('dist',name));
 for(const name of ['assets','vendor','v14-stable','origin-modules','maps','src'])fs.cpSync(name,path.join('dist',name),{recursive:true});
 fs.copyFileSync('paradox-sw.js','dist/paradox-sw.js');
 const built=fs.readdirSync('dist/assets').filter(f=>/\.(js|css|png)$/.test(f)).map(f=>'./assets/'+f);const worker=fs.readFileSync('dist/paradox-sw.js','utf8');fs.writeFileSync('dist/paradox-sw.js',worker.replace('/* BUILD_FILES */','FILES.push(...'+JSON.stringify(built)+');'));
}}]});
