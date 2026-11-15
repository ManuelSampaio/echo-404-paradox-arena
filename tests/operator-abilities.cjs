const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');const root=path.resolve(__dirname,'..'),w=vm.createContext({});w.window=w;
for(const file of ['origin-feel-config.js','origin-abilities.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),w);
const A=w.OriginAbilities.Ability;
const shield=new A('axiom');assert.ok(shield.use({grounded:true}));assert.equal(shield.active,1.5);assert.equal(shield.cooldown,8);assert.equal(shield.use({}),false);assert.equal(shield.uses,1);for(let n=0;n<31;n++)shield.tick(.05);assert.equal(shield.active,0);assert.ok(shield.cooldown>6);for(let n=0;n<132;n++)shield.tick(.05);assert.ok(shield.ready({}));
const jump=new A('nyra');assert.equal(jump.use({grounded:true}),false);assert.equal(jump.cooldown,0);assert.ok(jump.use({grounded:false}));assert.equal(jump.airUsed,true);for(let n=0;n<90;n++)jump.tick(.05,{grounded:false});assert.equal(jump.ready({grounded:false}),false,'one jump per flight even after cooldown');jump.tick(.01,{grounded:true});assert.ok(jump.ready({grounded:false}));
const echo=new A('kai7');assert.equal(echo.use({hasEcho:false}),false);assert.equal(echo.use({hasEcho:true,recording:true}),false);assert.equal(echo.cooldown,0);assert.ok(echo.use({hasEcho:true}));assert.equal(echo.use({hasEcho:true}),false);assert.equal(echo.cooldown,12);
for(const id of ['axiom','nyra','kai7']){const a=new A(id);a.tick(-10);assert.equal(a.cooldown,0);assert.ok(a.config.icon);assert.ok(a.config.description);}
// Mobility adds height but must not replace the mandatory first echo-powered lift.
assert.ok((w.OriginFeel.jumps.highSpeed**2+w.OriginFeel.abilities.nyra.jumpSpeed**2)/(2*1700)<250);
console.log('PASS: configurable phase duration/recovery, one NYRA jump per flight, KAI-7 echo preconditions and rejected-action cooldown safety');
