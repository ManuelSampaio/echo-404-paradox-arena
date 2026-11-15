// Actual Phaser scene/render integration; the deterministic temporal model is tested separately.
process.on('uncaughtException',e=>{console.error(e.stack);process.exit(1)});
const {JSDOM}=require('jsdom');const native=require('@napi-rs/canvas'),fs=require('fs'),path=require('path');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
(async()=>{
 const images={human:await native.loadImage(root+'/assets/origin/explorer.png'),patrols:await native.loadImage(root+'/assets/origin/patrols.png')};
 const dom=new JSDOM(fs.readFileSync(root+'/paradox.html','utf8').replace(/<script[\s\S]*?<\/script>/g,''),{url:'http://localhost/paradox.html',pretendToBeVisual:true,runScripts:'outside-only'});
 const w=dom.window;global.window=w;global.document=w.document;Object.defineProperty(global,'navigator',{value:w.navigator,configurable:true});for(const key of ['Element','HTMLElement','HTMLCanvasElement','HTMLVideoElement','HTMLImageElement','XMLHttpRequest','screen'])global[key]=w[key];global.ImageData=native.ImageData;global.self=w;global.requestAnimationFrame=w.requestAnimationFrame.bind(w);global.cancelAnimationFrame=w.cancelAnimationFrame.bind(w);
 w.HTMLCanvasElement.prototype.getContext=function(type){if(type!=='2d')return null;if(!this._canvas)this._canvas=native.createCanvas(this.width||1,this.height||1);if(this._canvas.width!==this.width)this._canvas.width=this.width||1;if(this._canvas.height!==this.height)this._canvas.height=this.height||1;const ctx=this._canvas.getContext('2d');if(!ctx._patched){for(const method of ['drawImage','createPattern']){const fn=ctx[method].bind(ctx);ctx[method]=(img,...args)=>fn(img?._canvas||img,...args);}ctx._patched=true;}return ctx;};
 w.HTMLCanvasElement.prototype.toDataURL=function(){return this._canvas?.toDataURL()||'';};
 global.Image=w.Image=native.Image;w.CanvasRenderingContext2D=native.createCanvas(1,1).getContext('2d').constructor;w.focus=()=>{};w.PARADOX_NO_BOOT=true;
 const Phaser=require(root+'/vendor/phaser-3.90.0.min.js');global.Phaser=w.Phaser=Phaser;for(const name of ['paradox-data.js','paradox-core.js','paradox-game.js'])w.eval(fs.readFileSync(root+'/'+name,'utf8'));
 for(const level of w.ParadoxData.levels)images[level.id]=await native.loadImage(root+'/assets/paradox/'+level.id+'.png');
 let ready;const created=new Promise(r=>ready=r);
 class TestScene extends w.ParadoxScene{preload(){this.textures.addSpriteSheet('echo-human',images.human,{frameWidth:72,frameHeight:88});this.textures.addSpriteSheet('echo-patrols',images.patrols,{frameWidth:64,frameHeight:80});for(const level of w.ParadoxData.levels)this.textures.addImage('memory-'+level.id,images[level.id]);}create(){super.create();ready(this);}}
 const game=new Phaser.Game({type:process.env.RENDER_DIR?Phaser.CANVAS:Phaser.HEADLESS,width:896,height:616,banner:false,audio:{noAudio:true},scene:[TestScene]});
 const scene=await Promise.race([created,new Promise((_,j)=>setTimeout(()=>j(Error('boot timeout')),4000))]);game.loop.stop();scene.begin();let time=0;
 const tick=(n=1)=>{for(let i=0;i<n;i++)game.headlessStep(time+=1000/60,1000/60);};
 const start=scene.model.player.x;scene.controls.hold(1,'right',true);tick(20);scene.controls.clear();assert.ok(scene.model.player.x>start+50);
 w.document.getElementById('pxRewind').click();tick(2);assert.equal(scene.model.echoes.length,1);assert.equal(scene.ghostSprites.length,1);
 w.document.getElementById('pxUndo').click();tick(2);assert.equal(scene.model.echoes.length,0);
 const before=scene.model.total;w.document.getElementById('pxPause').click();tick(20);assert.equal(scene.model.total,before);assert.equal(w.document.getElementById('pxPauseCard').hidden,false);w.document.getElementById('pxResume').click();
 w.document.getElementById('pxMenu').click();assert.equal(w.document.querySelectorAll('#signalList button').length,25);w.document.querySelectorAll('#signalList button')[24].click();assert.equal(scene.model.index,24);assert.equal(scene.model.active,true);
 scene.scale.resize(390,720);scene.layout();assert.equal(scene.portrait,true);scene.controls.hold('up','up',true);assert.equal(scene.controls.read(true).x,-1);scene.controls.clear();
 console.log('PASS: real Phaser boot, movement, click controls, echo/undo, pause, 25-arena selection and portrait projection');
 const fixtures=require('./paradox.cjs');
 w.localStorage.setItem('echo404_paradox_v06','classic untouched');w.localStorage.setItem('echo404_v93_origin_result','origin untouched');
 scene.select(0);scene.model=fixtures.solved[0];scene.model.done=false;scene.model.active=true;tick(2);assert.equal(w.document.getElementById('pxResult').hidden,false);assert.ok(w.ParadoxCore.load(w.localStorage).levels.origin);assert.equal(w.localStorage.getItem('echo404_paradox_v06'),'classic untouched');assert.equal(w.localStorage.getItem('echo404_v93_origin_result'),'origin untouched');
 w.document.getElementById('pxNext').click();assert.equal(scene.model.index,1);assert.equal(scene.model.active,true);
 console.log('PASS: compact completion, next arena, isolated v14 medal save and legacy progress preservation');
 const renderDir=process.env.RENDER_DIR;if(renderDir)fs.mkdirSync(renderDir,{recursive:true});
 scene.scale.resize(896,616);scene.layout();
 for(let index=0;index<25;index++){
  scene.select(index);const s=scene.model;s.echoes=JSON.parse(JSON.stringify(fixtures.solved[index].echoes));s.t=Math.max(...s.echoes.map(trace=>trace[trace.length-1].t))+.2;s.player={...s.level.spawn,dx:1,dy:0};w.ParadoxCore.refresh(s);scene.renderState(s.t);assert.equal(scene.ghostSprites.length,s.echoes.length);assert.equal(scene.enemySprites.length,s.enemies.length);
  if(renderDir){game.step(time+=17,17);fs.writeFileSync(path.join(renderDir,String(index+1).padStart(2,'0')+'.png'),game.canvas._canvas.toBuffer('image/png'));}
 }
 if(renderDir){scene.select(0);scene.model.echoes=JSON.parse(JSON.stringify(fixtures.solved[0].echoes));scene.model.t=1.5;scene.model.player={...w.ParadoxData.at(7,5),dx:1,dy:0};w.ParadoxCore.refresh(scene.model);scene.renderState(2);game.step(time+=17,17);fs.writeFileSync(root+'/assets/paradox/preview.png',game.canvas._canvas.toBuffer('image/png'));scene.scale.resize(390,720);scene.layout();scene.renderState(2);game.step(time+=17,17);fs.writeFileSync(path.join(renderDir,'portrait.png'),game.canvas._canvas.toBuffer('image/png'));}
 console.log('PASS: all 25 arenas render with recorded echoes, patrols and themed geometry');game.destroy(true);dom.window.close();
})().catch(e=>{console.error(e.stack);process.exit(1);});
