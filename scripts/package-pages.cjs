/* Compose both independently built campaigns without rewriting production files. */
const fs=require('node:fs');
for(const file of ['dist/index.html','dist/paradox-sw.js','dist-v17/index.html','dist-v17/sw.js'])if(!fs.existsSync(file))throw Error('Build required: '+file);
fs.rmSync('dist/v17',{recursive:true,force:true});
fs.cpSync('dist-v17','dist/v17',{recursive:true});
console.log('Packaged v17 under /v17/; v16 remains at the root');
