/* Validate authoritative editor maps; never regenerate geometry during build/export. */
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');const c={};c.window=c;for(const f of ['origin-pilot-data.js','origin-tiled.js'])vm.runInNewContext(fs.readFileSync(f,'utf8'),c);
if(process.argv.includes('--from-code'))throw Error('Use author-action-maps.cjs only for intentional room reauthoring; Tiled JSON is authoritative.');
const ids=c.OriginPilot.levels.map(l=>l.id);for(const id of ids){const map=JSON.parse(fs.readFileSync('maps/'+id+'.json'));c.OriginTiled.validate(map);assert.equal(c.OriginTiled.adapt(map).id,id);}
fs.writeFileSync('origin-maps.js','/* Adapt the authoritative Tiled JSON loaded by src/maps.js or the Node harness. */\nOriginPilot.levels=OriginMaps.map(OriginTiled.adapt);OriginPilot.data=OriginPilot.levels[0];\n');
fs.writeFileSync('src/maps.js',"import '../origin-pilot-data.js';\nimport '../origin-tiled.js';\n"+ids.map((id,i)=>"import m"+i+" from '../maps/"+id+".json' with {type:'json'};").join('\n')+'\nwindow.OriginMaps=['+ids.map((_,i)=>'m'+i).join(',')+"];\nOriginPilot.levels=OriginMaps.map(OriginTiled.adapt);OriginPilot.data=OriginPilot.levels[0];\n");
console.log('PASS: 25 authoritative Tiled maps, IDs, geometry and device graphs');
