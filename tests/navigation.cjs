const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');const root=path.resolve(__dirname,'..');
for(const name of fs.readdirSync(root)){
 if(name.endsWith('.js'))new vm.Script(fs.readFileSync(path.join(root,name),'utf8'),{filename:name});
 if(!name.endsWith('.html'))continue;const html=fs.readFileSync(path.join(root,name),'utf8');
 for(const match of html.matchAll(/(?:src|href)=["']([^"']+)["']/g)){const link=match[1];if(/^(https?:|data:|mailto:|#)/.test(link))continue;const file=link.split(/[?#]/)[0];if(file)assert.ok(fs.existsSync(path.resolve(root,file)),name+' -> '+file);}
 for(const script of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g))if(script[1].trim())new vm.Script(script[1],{filename:name});
}
const game=fs.readFileSync(path.join(root,'origin-reborn.html'),'utf8');assert.ok(!game.includes('origin-v98.html'));assert.ok(!fs.readFileSync(path.join(root,'index.html'),'utf8').includes('paradox.html'));
console.log('PASS: JS/inline syntax, local HTML links and unified platform campaign entry/continuation');
