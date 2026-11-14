// Real Phaser Arcade simulation with DOM/image adapters; no mocked physics.
process.on('uncaughtException',e=>{console.error(e.stack);process.exit(1)});
const {JSDOM}=require('jsdom');const native=require('@napi-rs/canvas'),fs=require('fs'),path=require('path');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
(async()=>{
 const images={};for(const name of ['explorer','patrols','platform','horizon'])images[name]=await native.loadImage(root+'/assets/origin/'+name+'.png');
 const dom=new JSDOM(fs.readFileSync(root+'/origin-reborn.html','utf8').replace(/<script[\s\S]*?<\/script>/g,''),{url:'http://localhost/origin-reborn.html',pretendToBeVisual:true,runScripts:'outside-only'});
 const w=dom.window;global.window=w;global.document=w.document;Object.defineProperty(global,'navigator',{value:w.navigator,configurable:true});for(const key of ['Element','HTMLElement','HTMLCanvasElement','HTMLVideoElement','HTMLImageElement','XMLHttpRequest','screen'])global[key]=w[key];global.ImageData=native.ImageData;global.self=w;global.requestAnimationFrame=w.requestAnimationFrame.bind(w);global.cancelAnimationFrame=w.cancelAnimationFrame.bind(w);
 w.HTMLCanvasElement.prototype.getContext=function(type){if(type!=='2d')return null;if(!this._canvas)this._canvas=native.createCanvas(this.width||1,this.height||1);if(this._canvas.width!==this.width)this._canvas.width=this.width||1;if(this._canvas.height!==this.height)this._canvas.height=this.height||1;const ctx=this._canvas.getContext('2d');if(!ctx._patched){for(const method of ['drawImage','createPattern']){const fn=ctx[method].bind(ctx);ctx[method]=(img,...args)=>fn(img?._canvas||img,...args);}ctx._patched=true;}return ctx;};
 w.HTMLCanvasElement.prototype.toDataURL=function(){return this._canvas?.toDataURL()||'';};
 global.Image=w.Image=native.Image;w.CanvasRenderingContext2D=native.createCanvas(1,1).getContext('2d').constructor;w.focus=()=>{};w.ORIGIN_PILOT_NO_BOOT=true;
 const Phaser=require(root+'/vendor/phaser-3.90.0.min.js');global.Phaser=w.Phaser=Phaser;console.log('loaded',Phaser.VERSION);w.eval(fs.readFileSync(root+'/origin-pilot-data.js','utf8'));w.eval(fs.readFileSync(root+'/origin-pilot.js','utf8'));
 let ready;const created=new Promise(r=>ready=r);
 class TestScene extends w.OriginPilotScene{preload(){this.textures.addSpriteSheet('explorer',images.explorer,{frameWidth:72,frameHeight:88});this.textures.addSpriteSheet('patrols',images.patrols,{frameWidth:64,frameHeight:80});for(const name of ['platform','horizon'])this.textures.addImage(name,images[name]);}create(){super.create();ready(this);}}
 const game=new Phaser.Game({type:process.env.RENDER?Phaser.CANVAS:Phaser.HEADLESS,width:960,height:540,banner:false,audio:{noAudio:true},physics:{default:'arcade',arcade:{gravity:{y:1700},fixedStep:true,fps:60}},scene:[TestScene]});
 const scene=await Promise.race([created,new Promise((_,j)=>setTimeout(()=>j(Error('boot timeout')),3000))]);

 game.loop.stop();scene.begin();let clock=0;
 const tick=(n=1)=>{for(let i=0;i<n;i++)game.headlessStep(clock+=1000/60,1000/60);};
 const place=(x,y)=>{scene.player.body.reset(x,y);scene.player.setVelocity(0,0);scene.control.clear();scene.invincible=100000;scene.dashTime=0;scene.dashCooldown=0;scene.jumpBuffer=0;scene.coyote=0;scene.player.body.setAllowGravity(true);};
 tick(3);assert.equal(scene.player.body.blocked.down,true);assert.equal(scene.player.y,1320);
 tick(1);assert.equal(scene.lift.body.width,180);assert.equal(scene.lift.body.height,24);
 const input=scene.control;
 input.hold('touch-a','left',true);input.hold('touch-b','jump',true);input.hold('touch-b','jump',false);assert.equal(input.down('left'),true);input.clear();
 place(200,1320);tick(2);input.hold('test','right',true);tick(5);assert.ok(scene.player.body.velocity.x>0&&scene.player.body.velocity.x<310);tick(25);assert.equal(scene.player.body.velocity.x,310);input.clear();tick(15);assert.equal(scene.player.body.velocity.x,0);
 const jumpHeight=short=>{place(200,1320);tick(2);input.hold('jump','jump',true);tick(short?3:1);if(short)input.hold('jump','jump',false);let lowest=scene.player.y;for(let i=0;i<60;i++){tick();lowest=Math.min(lowest,scene.player.y);}input.clear();return 1320-lowest;};
 const full=jumpHeight(false),short=jumpHeight(true);assert.ok(full>125&&full<155);assert.ok(short<full-35);
 place(200,1320);tick(2);input.press('dash');tick(8);assert.ok(scene.player.x>260);assert.ok(scene.dashCooldown>0);const cooldown=scene.dashCooldown;input.press('dash');tick();assert.ok(scene.dashCooldown<cooldown,'dash cooldown cannot be bypassed');
 place(200,1280);scene.player.setVelocityY(300);input.hold('buffer','jump',true);tick(12);assert.ok(scene.player.body.velocity.y<0,'jump buffered shortly before landing');
 console.log('PASS: actual Phaser ground collision, acceleration/braking, short/full jump, buffered jump, dash and multi-pointer ownership');
 // Every authored jump on the main route is executed by the real Arcade solver.
 const jumpTo=(source,target)=>{
  const direction=Math.sign(target.x+target.w/2-(source.x+source.w/2))||1;
  const t=(700+Math.sqrt(700*700+3400*(target.y-source.y)))/1700;
  const start=Math.max(source.x+30,Math.min(source.x+source.w-30,target.x+target.w/2-direction*310*t));
  place(start,source.y);tick(2);scene.player.setVelocityX(direction*310);input.hold('route',direction>0?'right':'left',true);input.hold('route-jump','jump',true);
  let landed=false;
  for(let frame=0;frame<100;frame++){tick();if(frame>8&&scene.player.body.blocked.down&&Math.abs(scene.player.y-target.y)<2&&scene.player.x>target.x-10&&scene.player.x<target.x+target.w+10){landed=true;break;}}
  input.clear();assert.ok(landed,source.id+' -> '+target.id+' is traversable');
 };
 const map=w.OriginPilot.data,byId=id=>map.platforms.find(p=>p.id===id);
 const route=['dock','broken-stair','signal-ledge','arrival','silo-a','silo-b','silo-c','anchor'];
 for(let i=1;i<route.length;i++)jumpTo(byId(route[i-1]),byId(route[i]));
 // Record a stationary echo at the pad, then ride the physical moving platform.
 place(map.anchor.x,map.anchor.y);tick(2);scene.toggleEcho();tick(45);scene.toggleEcho();assert.ok(scene.echo&&scene.echo.frames.length>=5);
 const oldLiftY=scene.lift.y;place(map.lift.x,scene.lift.body.top-2);tick(360);
 assert.ok(scene.padPowered,'recorded echo sustains the crane');assert.ok(scene.lift.y<oldLiftY-250,'crane rises');
 assert.ok(Math.abs(scene.player.y-map.lift.top)<10,'Arcade platform carries the player to the upper dock');
 jumpTo({id:'lift',x:map.lift.x-map.lift.w/2,y:map.lift.top,w:map.lift.w},byId('sky-dock'));
 for(const pair of [['sky-dock','rooftop'],['rooftop','secret'],['rooftop','memory-ledge'],['memory-ledge','evacuation']])jumpTo(byId(pair[0]),byId(pair[1]));
 console.log('PASS: all mandatory jumps, optional rooftop route, real echo recording, powered crane and moving-platform ride');
 // Checkpoint recovery retains already recovered fragments.
 scene.recovered.add(0);scene.checkpointIndex=2;scene.respawn();assert.equal(scene.player.x,map.checkpoints[2].x);assert.ok(scene.recovered.has(0));
 const previousTime=scene.elapsed;scene.setPaused(true);tick(60);assert.equal(scene.elapsed,previousTime);scene.setPaused(false);
 for(const item of map.fragments){place(item.x,item.y+40);tick(2);}assert.equal(scene.recovered.size,3);
 for(const item of map.secrets){place(item.x,item.y+40);tick(2);}assert.equal(scene.secrets.size,3);
 w.localStorage.setItem('echo404_paradox_v06','classic sentinel');w.localStorage.setItem('echo404_awakening_medals_v07','medal sentinel');
 place(map.exit.x,map.exit.y);tick(2);assert.equal(scene.finished,true);assert.equal(w.document.getElementById('resultCard').hidden,false);assert.equal(w.localStorage.getItem('echo404_v91_origin_mission_complete'),'true');
 assert.equal(w.localStorage.getItem('echo404_paradox_v06'),'classic sentinel');assert.equal(w.localStorage.getItem('echo404_awakening_medals_v07'),'medal sentinel');
 assert.equal(w.document.querySelector('#resultCard .primary').getAttribute('href'),'./origin-v98.html');
 console.log('PASS: pause, checkpoints, fragment collection, compact victory, next mission and preservation of classic saves');
 if(process.env.RENDER){scene.finished=false;scene.pausedByUser=false;scene.player.setPosition(1840,670);scene.cameras.main.stopFollow();scene.cameras.main.setScroll(1410,300);game.step(clock+20,20);fs.writeFileSync(process.env.RENDER,game.canvas._canvas.toBuffer('image/png'));}
 game.destroy(true);dom.window.close();
})().catch(e=>{console.error(e.stack);process.exit(1);});
