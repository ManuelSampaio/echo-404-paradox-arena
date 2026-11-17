// Staged engine captures: positions are arranged only for proof images, never used by the continuous bot.
process.env.RENDER='1';
const fs=require('fs'),path=require('path');
(async()=>{const h=await require('./harness.cjs')(),{w,scene,tick}=h;const out=path.resolve('docs/reports/v17-r2-captures'+(process.env.CAPTURE_WIDTH?'/portrait':''));fs.mkdirSync(out,{recursive:true});
function reset(z,op='nyra'){w.history.replaceState({},'','/v17/index.html#nivel='+z);scene.scene.restart();tick(3);scene.selectOperator(op,false);scene.begin();tick(3);scene.cameras.main.stopFollow();}
function place(x,y,zoom=1){scene.player.body.reset(x,y);scene.player.setVelocity(0);scene.cameras.main.setZoom(process.env.CAPTURE_WIDTH?.55:zoom);scene.resize();scene.cameras.main.setZoom(process.env.CAPTURE_WIDTH?.55:zoom).centerOn(x+180,y-150);scene.updateScenery(.016);scene.drawWeapon(.016);}
if(process.env.CAPTURE_WIDTH){reset(1);place(180,1900,.38);h.render(out+'/saida-da-nave.png');h.close();return;}
for(const [z,x,y]of [[1,180,1900],[2,1580,1370],[3,3290,850]]){reset(z);place(x,y,.95);tick(1);h.render(out+'/zona-0'+z+'.png');}
for(const op of ['nyra','kai7','axiom']){reset(2,op);place(1540,1370,1.65);scene.facing=1;scene.chargeTime=scene.weaponConfig().charge;scene.attackHeld=true;scene.signature(op!=='nyra');scene.player.setVelocity(0);if(op!=='axiom'){for(let i=0;i<4;i++)scene.updateCombat(1/60);}scene.drawWeapon(.001);h.render(out+'/arma-'+op+'.png');}
reset(1);place(180,1900,1);h.render(out+'/saida-da-nave.png');h.close();console.log('Captured staged Phaser frames in '+out);})().catch(e=>{console.error(e.stack);process.exit(1)});
