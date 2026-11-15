// Real Phaser Arcade simulation with DOM/image adapters; no mocked physics.
process.on('uncaughtException',e=>{console.error(e.stack);process.exit(1)});
const {JSDOM}=require('jsdom');const native=require('@napi-rs/canvas'),fs=require('fs'),path=require('path');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
(async()=>{
 const images={};for(const name of ['patrols'])images[name]=await native.loadImage(root+'/assets/origin/'+name+'.png');
 for(const name of ['axiom','nyra','kai7','platform','horizon'])images[name]=await native.loadImage(root+'/assets/operators/'+name+'.png');
 const dom=new JSDOM(fs.readFileSync(root+'/origin-reborn.html','utf8').replace(/<script[\s\S]*?<\/script>/g,''),{url:'http://localhost/origin-reborn.html',pretendToBeVisual:true,runScripts:'outside-only'});
 const w=dom.window;global.window=w;global.document=w.document;Object.defineProperty(global,'navigator',{value:w.navigator,configurable:true});for(const key of ['Element','HTMLElement','HTMLCanvasElement','HTMLVideoElement','HTMLImageElement','XMLHttpRequest','screen'])global[key]=w[key];global.ImageData=native.ImageData;global.self=w;global.requestAnimationFrame=w.requestAnimationFrame.bind(w);global.cancelAnimationFrame=w.cancelAnimationFrame.bind(w);
 w.HTMLCanvasElement.prototype.getContext=function(type){if(type!=='2d')return null;if(!this._canvas)this._canvas=native.createCanvas(this.width||1,this.height||1);if(this._canvas.width!==this.width)this._canvas.width=this.width||1;if(this._canvas.height!==this.height)this._canvas.height=this.height||1;const ctx=this._canvas.getContext('2d');if(!ctx._patched){for(const method of ['drawImage','createPattern']){const fn=ctx[method].bind(ctx);ctx[method]=(img,...args)=>fn(img?._canvas||img,...args);}ctx._patched=true;}return ctx;};
 w.HTMLCanvasElement.prototype.toDataURL=function(){return this._canvas?.toDataURL()||'';};
 global.Image=w.Image=native.Image;w.CanvasRenderingContext2D=native.createCanvas(1,1).getContext('2d').constructor;w.focus=()=>{};w.ORIGIN_PILOT_NO_BOOT=true;
 const Phaser=require(root+'/vendor/phaser-3.90.0.min.js');global.Phaser=w.Phaser=Phaser;console.log('loaded',Phaser.VERSION);w.eval(fs.readFileSync(root+'/origin-pilot-data.js','utf8'));w.eval(fs.readFileSync(root+'/origin-pilot.js','utf8'));
 let ready;const created=new Promise(r=>ready=r);
 class TestScene extends w.OriginPilotScene{preload(){for(const id of ['axiom','nyra','kai7'])if(!this.textures.exists('operator-'+id))this.textures.addSpriteSheet('operator-'+id,images[id],{frameWidth:72,frameHeight:88});if(!this.textures.exists('patrols'))this.textures.addSpriteSheet('patrols',images.patrols,{frameWidth:64,frameHeight:80});for(const name of ['platform','horizon'])if(!this.textures.exists(name))this.textures.addImage(name,images[name]);}create(){super.create();ready(this);}}
 const game=new Phaser.Game({type:process.env.RENDER||process.env.RENDER_DIR?Phaser.CANVAS:Phaser.HEADLESS,width:960,height:540,banner:false,audio:{noAudio:true},physics:{default:'arcade',arcade:{gravity:{y:1700},fixedStep:true,fps:60}},scene:[TestScene]});
 if(process.env.RENDER_DIR)fs.mkdirSync(process.env.RENDER_DIR,{recursive:true});
 const scene=await Promise.race([created,new Promise((_,j)=>setTimeout(()=>j(Error('boot timeout')),3000))]);

 game.loop.stop();let clock=0;
 const tick=(n=1)=>{for(let i=0;i<n;i++)game.headlessStep(clock+=1000/60,1000/60);};
 const place=(x,y)=>{scene.player.body.reset(x,y);scene.player.setVelocity(0,0);scene.control.clear();scene.invincible=100000;scene.dashTime=0;scene.dashCooldown=0;scene.jumpBuffer=0;scene.coyote=0;scene.player.body.setAllowGravity(true);};
 // The public start action always opens the playable, harmless simulator.
 w.localStorage.setItem('echo404_operator','classic unchanged');
 for(const id of ['axiom','nyra','kai7']){w.document.querySelector('[data-operator="'+id+'"]').click();assert.equal(scene.operator,id);assert.equal(scene.player.texture.key,'operator-'+id);assert.equal(scene.player.body.width,26);}
 assert.equal(w.localStorage.getItem('echo404_origin_operator'),'kai7');assert.equal(w.localStorage.getItem('echo404_operator'),'classic unchanged');
 w.document.getElementById('beginPilot').click();assert.equal(scene.training,true);assert.equal(scene.trainingStep,0);tick(3);
 scene.control.hold('move','right',true);tick(30);scene.control.hold('move','right',false);scene.control.hold('move','left',true);tick(60);scene.control.clear();assert.equal(scene.trainingStep,1);
 w.document.getElementById('shortJump').click();tick(65);assert.equal(scene.trainingStep,2);
 w.document.getElementById('highJump').click();tick(70);assert.equal(scene.trainingStep,3);
 w.document.querySelector('[data-action="dash"]').click();tick(15);assert.equal(scene.trainingStep,4);
 w.document.getElementById('echoAction').click();tick(45);w.document.getElementById('echoAction').click();tick(2);assert.equal(scene.trainingStep,5);assert.ok(scene.echo);assert.equal(scene.echoSprite.texture.key,'operator-kai7');
 assert.equal(scene.elapsed,0);assert.equal(scene.deaths,0);assert.equal(scene.recovered.size,0);assert.equal(w.localStorage.getItem('echo404_v91_origin_mission_complete'),null);
 w.document.getElementById('trainingMission').click();assert.equal(scene.training,false);assert.equal(scene.trainingCompleted,true);assert.equal(scene.echo,null);assert.equal(scene.echoUsed,false);assert.equal(scene.player.x,160);assert.equal(scene.health,3);assert.equal(scene.running,true);
 console.log('PASS: three operators, isolated choice save, five playable tutorial steps, matching echo and clean mission start');
 tick(3);assert.equal(scene.player.body.blocked.down,true);assert.equal(scene.player.y,1320);
 tick(1);assert.equal(scene.lift.body.width,180);assert.equal(scene.lift.body.height,24);
 let input=scene.control;
 for(const type of ['contextmenu','selectstart','dragstart']){const event=new w.Event(type,{bubbles:true,cancelable:true});w.document.querySelector('footer b').dispatchEvent(event);assert.equal(event.defaultPrevented,true,type+' blocked on credit text');}
 const range=w.document.createRange();range.selectNodeContents(w.document.querySelector('footer b'));w.getSelection().addRange(range);w.document.dispatchEvent(new w.Event('pointerdown'));assert.equal(w.getSelection().rangeCount,0,'old iOS selection cleared');
 const soundEvents=[],playSound=scene.soundBus.play.bind(scene.soundBus);scene.soundBus.play=type=>{soundEvents.push(type);playSound(type);};
 w.document.getElementById('echoAction').click();assert.equal(input.take('echo'),true,'assistive click triggers echo');
 w.document.getElementById('highJump').click();assert.equal(input.take('fullJump'),true,'accessible high jump');w.document.getElementById('shortJump').click();assert.equal(input.take('shortJump'),true,'accessible short jump');

 input.hold('touch-a','left',true);input.hold('touch-b','jump',true);input.hold('touch-b','jump',false);assert.equal(input.down('left'),true);input.clear();
 place(200,1320);tick(2);input.hold('test','right',true);tick(5);assert.ok(scene.player.body.velocity.x>0&&scene.player.body.velocity.x<310);tick(25);assert.equal(scene.player.body.velocity.x,310);input.clear();tick(15);assert.equal(scene.player.body.velocity.x,0);
 const jumpHeight=short=>{place(200,1320);tick(2);input.hold('jump','jump',true);tick(short?3:1);if(short)input.hold('jump','jump',false);let lowest=scene.player.y;for(let i=0;i<60;i++){tick();lowest=Math.min(lowest,scene.player.y);}input.clear();return 1320-lowest;};
 const full=jumpHeight(false),short=jumpHeight(true);assert.ok(full>125&&full<155);assert.ok(short<full-35);const touchHeight=action=>{place(200,1320);tick(2);input.press(action);let peak=1320;for(let i=0;i<65;i++){tick();peak=Math.min(peak,scene.player.y);}return 1320-peak;};const shortTouch=touchHeight('shortJump'),highTouch=touchHeight('fullJump');assert.ok(shortTouch>55&&shortTouch<80);assert.ok(highTouch>125&&highTouch>shortTouch+50);assert.ok(soundEvents.includes('jump-short'));assert.ok(soundEvents.includes('jump-high'));
 place(200,1320);tick(2);input.press('dash');tick(8);assert.ok(scene.player.x>260);assert.ok(scene.dashCooldown>0);const cooldown=scene.dashCooldown;input.press('dash');tick();assert.ok(scene.dashCooldown<cooldown,'dash cooldown cannot be bypassed');
 place(200,1280);scene.player.setVelocityY(300);input.hold('buffer','jump',true);tick(12);assert.ok(scene.player.body.velocity.y<0,'jump buffered shortly before landing');
 const pointer=(button,type,id)=>{const e=new w.Event(type,{bubbles:true,cancelable:true});e.pointerId=id;button.dispatchEvent(e);};
 const leftButton=w.document.querySelector('[data-hold="left"]'),highButton=w.document.getElementById('highJump');input.clear();pointer(leftButton,'pointerdown',71);pointer(highButton,'pointerdown',72);assert.equal(input.down('left'),true);assert.equal(input.take('fullJump'),true);pointer(highButton,'pointerup',72);assert.equal(input.down('left'),true);pointer(leftButton,'pointercancel',71);assert.equal(input.down('left'),false);assert.equal(leftButton.classList.contains('pressed'),false);input.clear();
 console.log('PASS: independent touch movement/jump and cancellation without stuck controls');
 console.log('PASS: actual Phaser ground collision, acceleration/braking, short/full jump, buffered jump, dash and multi-pointer ownership');
 // Every authored jump on the main route is executed by the real Arcade solver.
 const jumpTo=(source,target)=>{
  let direction=Math.sign(target.x+target.w/2-(source.x+source.w/2))||1;const overlapLeft=Math.max(source.x,target.x),overlapRight=Math.min(source.x+source.w,target.x+target.w),vertical=overlapRight-overlapLeft>60;if(vertical)direction=0;
  const t=(700+Math.sqrt(700*700+3400*(target.y-source.y)))/1700;
  const start=vertical?(overlapLeft+overlapRight)/2:Math.max(source.x+30,Math.min(source.x+source.w-30,target.x+target.w/2-direction*310*t));
  place(start,source.y);tick(2);scene.player.setVelocityX(direction*310);if(direction)input.hold('route',direction>0?'right':'left',true);input.hold('route-jump','jump',true);
  let landed=false;
  for(let frame=0;frame<100;frame++){tick();if(scene.finished&&Math.abs(scene.player.x-scene.data.exit.x)<55&&Math.abs(scene.player.y-scene.data.exit.y)<40){landed=true;break;}if(frame>8&&scene.player.body.blocked.down&&Math.abs(scene.player.y-target.y)<2&&scene.player.x>target.x-10&&scene.player.x<target.x+target.w+10){landed=true;break;}}
  input.clear();if(!landed)console.log('FAILED ROUTE',scene.levelIndex,source,target,{x:scene.player.x,y:scene.player.y,vx:scene.player.body.velocity.x,vy:scene.player.body.velocity.y});assert.ok(landed,source.id+' -> '+target.id+' is traversable');
 };
 const map=w.OriginPilot.data,byId=id=>map.platforms.find(p=>p.id===id);
 const route=['dock','broken-stair','signal-ledge','arrival','silo-a','silo-b','silo-c','anchor'];
 for(let i=1;i<route.length;i++)jumpTo(byId(route[i-1]),byId(route[i]));
 // Record a stationary echo at the pad, then ride the physical moving platform.
 place(map.anchor.x,map.anchor.y);tick(2);scene.toggleEcho();tick(45);scene.toggleEcho();assert.ok(scene.echo&&scene.echo.frames.length>=5);assert.ok(soundEvents.includes('echo-start'));assert.ok(soundEvents.includes('echo-fix'));
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
 assert.equal(w.document.querySelector('#resultCard .primary').getAttribute('href'),'./origin-reborn.html#nivel=2');
 console.log('PASS: pause, checkpoints, fragment collection, compact victory, next mission and preservation of classic saves');
 // Every later mission uses this same scene, actual Arcade solver and controls.
 for(let index=1;index<25;index++){
  w.history.replaceState({},'', '/origin-reborn.html#nivel='+(index+1));scene.scene.restart();tick(3);input=scene.control;scene.begin();tick(3);
  assert.equal(scene.levelIndex,index);const map=scene.data;assert.equal(map.id,w.OriginPilot.levels[index].id);assert.equal(scene.operator,'kai7');
  const byId=id=>map.platforms.find(p=>p.id===id);let source=byId(map.route[0]);
  for(const id of map.route.slice(1)){
   if(id==='lift'){
    place(map.anchor.x,map.anchor.y);tick(2);scene.toggleEcho();tick(40);scene.toggleEcho();assert.ok(scene.echo);const before=scene.lift.y;place(map.lift.x,scene.lift.body.top-2);tick(360);assert.ok(scene.padPowered);assert.ok(scene.lift.y<before-200,map.name+': echo-powered lift ascends');assert.ok(Math.abs(scene.player.y-map.lift.top)<10,map.name+': moving lift carries player');source={id:'lift',x:map.lift.x-map.lift.w/2,y:map.lift.top,w:map.lift.w};
   }else{jumpTo(source,byId(id));source=byId(id);}
  }
  for(const item of map.fragments){place(item.x,item.y+40);tick(2);}assert.equal(scene.recovered.size,3);
  place(map.exit.x,map.exit.y);tick(2);assert.equal(scene.finished,true);assert.equal(w.document.getElementById('nextMission').getAttribute('href'),index<24?'./origin-reborn.html#nivel='+(index+2):'./index.html');assert.ok(w.OriginPilot.load(w.localStorage).levels[map.id]);
  if(process.env.RENDER_DIR){scene.player.body.reset(map.anchor.x-55,map.anchor.y);scene.cameras.main.stopFollow();scene.cameras.main.setScroll(Math.max(0,map.anchor.x-480),map.anchor.y-300);game.step(clock+=17,17);fs.writeFileSync(path.join(process.env.RENDER_DIR,String(index+1).padStart(2,'0')+'.png'),game.canvas._canvas.toBuffer('image/png'));}
  console.log('PASS: mission '+(index+1)+' '+map.name+', all authored jumps, physical echo lift, completion, save and same-engine next link');
 }
 assert.equal(Object.keys(w.OriginPilot.load(w.localStorage).levels).length,25);
 w.location.hash='#nivel=2';await new Promise(resolve=>setTimeout(resolve,20));tick(5);assert.equal(scene.levelIndex,1);assert.equal(w.document.getElementById('startTitle').textContent,'DERIVA');w.document.getElementById('beginPilot').click();tick(2);assert.equal(scene.running,true);assert.equal(scene.training,false,'completed tutorial need not repeat on the next mission');console.log('PASS: real hash navigation preserves operator and shared controls without replaying mandatory practice');
 if(process.env.RENDER){scene.finished=false;scene.pausedByUser=false;scene.player.setPosition(scene.data.anchor.x-55,scene.data.anchor.y);scene.cameras.main.stopFollow();scene.cameras.main.setScroll(Math.max(0,scene.data.anchor.x-480),scene.data.anchor.y-300);game.step(clock+20,20);fs.writeFileSync(process.env.RENDER,game.canvas._canvas.toBuffer('image/png'));}
 game.destroy(true);dom.window.close();
})().catch(e=>{console.error(e.stack);process.exit(1);});
