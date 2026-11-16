/* ECHO//404 — 25-MISSION VERTICAL CAMPAIGN v15.0.0. Modular campaign / Phaser 3.90 / Arcade Physics. */
(() => {
 'use strict';
 if(!window.Phaser){document.getElementById('startCard').hidden=true;document.getElementById('loadError').hidden=false;return;}
 const {clamp,pose,groundedAt,rank,save}=OriginPilot;let data=OriginPilot.data;const feel=OriginFeel;
 const $=id=>document.getElementById(id);
 class PilotInput {
  constructor(){this.holds=new Map();this.pending=new Set();this.releasedJump=false;}
  hold(token,key,on){const before=this.down('jump');if(on)this.holds.set(token,key);else this.holds.delete(token);if(!before&&this.down('jump'))this.pending.add('jump');if(before&&!this.down('jump'))this.releasedJump=true;}
  down(key){return [...this.holds.values()].includes(key);}
  press(key){this.pending.add(key);}
  take(key){const value=this.pending.has(key);this.pending.delete(key);return value;}
  clear(){this.holds.clear();this.pending.clear();this.releasedJump=false;}
 }
 class PilotSound {
  constructor(){this.enabled=true;try{this.enabled=localStorage.getItem('echo404_origin_sound')!=='false';}catch(_){}this.context=null;}
  unlock(){try{this.context ||= new (window.AudioContext||window.webkitAudioContext)();this.context.resume().catch(()=>{});}catch(_){} }
  note(freq,duration=.12,volume=.035,type='sine',delay=0){if(!this.enabled||!this.context)return;const c=this.context,t=c.currentTime+delay,o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(freq,t);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(volume,t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+duration);o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+duration+.02);}
  play(type){if(type==='fragment'){[440,660,880].forEach((f,i)=>this.note(f,.2,.03,'sine',i*.08));}else if(type==='checkpoint'){this.note(330,.25,.025);this.note(495,.3,.025,'sine',.12);}else if(type==='jump-short'){this.note(380,.075,.04,'triangle');this.note(520,.06,.022,'sine',.03);}else if(type==='jump-high'){this.note(240,.12,.04,'triangle');this.note(580,.16,.028,'sine',.045);}else if(type==='dash')this.note(120,.12,.03,'triangle');else if(type==='hurt')this.note(75,.2,.04,'triangle');else if(type==='echo-start'){this.note(250,.1,.035);this.note(370,.12,.025,'sine',.06);}else if(type==='echo-fix'){this.note(370,.24,.035);this.note(554,.3,.025,'sine',.08);this.note(740,.22,.02,'sine',.14);}}
 }
 class OriginScene extends Phaser.Scene {
  constructor(){super('OriginPilot');}
  preload(){
   for(const id of ['axiom','nyra','kai7'])this.load.spritesheet('operator-'+id,'assets/operators/'+id+'.png',{frameWidth:72,frameHeight:88});
   this.load.spritesheet('patrols','assets/origin/patrols.png',{frameWidth:64,frameHeight:80});
   this.load.image('platform','assets/operators/platform.png');this.load.image('horizon','assets/operators/horizon.png');
   this.load.on('loaderror',()=>{this.assetFailed=true;});
  }
  create(){
   const requested=new URLSearchParams(location.hash.slice(1)).get('nivel')||'1';this.levelIndex=OriginPilot.levels.findIndex((l,i)=>l.id===requested||String(i+1)===requested);if(this.levelIndex<0)this.levelIndex=0;data=OriginPilot.levels[this.levelIndex];this.data=data;
   if(this.assetFailed){$('startCard').hidden=true;$('loadError').hidden=false;return;}
   this.elapsed=0;this.deaths=0;this.health=3;this.invincible=0;this.running=false;this.finished=false;this.pausedByUser=false;
   this.recovered=new Set();this.secrets=new Set();this.visited=new Set();this.checkpointIndex=0;
   this.extraEcho=null;this.maxEchoes=0;this.echoPoint=null;this.session=null;this.ghostSprite=null;this.nearEchoNode=false;this.capture=null;this.echo=null;this.echoSprite=null;this.captureAccumulator=0;this.echoUsed=false;this.padPowered=false;
   this.jumpBuffer=0;this.coyote=0;this.jumpAge=0;this.touchJumpReleased=false;this.dashTime=0;this.dashCooldown=0;this.facing=1;this.wasGrounded=false;this.noticeUntil=0;this.uiTick=0;
   this.operator='axiom';try{const saved=localStorage.getItem('echo404_origin_operator')||localStorage.getItem('echo404_operator');if(['axiom','nyra','kai7'].includes(String(saved).toLowerCase().replace('-','')))this.operator=String(saved).toLowerCase().replace('-','');}catch(_){}this.training=false;this.trainingCompleted=false;this.jumpStyle='variable';this.control=new PilotInput();this.soundBus=new PilotSound();
   this.ability=new OriginAbilities.Ability(this.operator);
   this.physics.world.setBounds(0,-200,data.width,data.height+500);
   this.cameras.main.setBounds(0,0,data.width,data.height);
   this.background=this.add.image(0,0,'horizon').setOrigin(.5).setScrollFactor(0).setDepth(-30);if(this.levelIndex)this.background.setTint(Phaser.Display.Color.HexStringToColor(data.color).color);
   this.createArchitecture();
   this.solids=this.physics.add.staticGroup();
   for(const p of data.platforms){const tile=this.add.tileSprite(p.x+p.w/2,p.y+p.h/2,p.w,p.h,'platform');this.physics.add.existing(tile,true);this.solids.add(tile);}
   this.player=this.physics.add.sprite(data.spawn.x,data.spawn.y,'operator-'+this.operator,0).setOrigin(.5,1).setDepth(15);
   this.player.setSize(26,66).setOffset(23,22).setMaxVelocity(feel.horizontal.maxSpeed,1080).setDragX(2200).setCollideWorldBounds(true);
   this.physics.add.collider(this.player,this.solids,null,(_player,platform)=>platform.body.height>50||(this.player.body.velocity.y>=0&&this.player.body.prev.y+this.player.body.height<=platform.body.top+7));
   this.lift=this.physics.add.image(data.lift.x,data.lift.y+12,'platform').setDisplaySize(data.lift.w,24).setDepth(3);
   this.lift.body.setSize(128,64).setAllowGravity(false).setImmovable(true).setVelocity(0,0);this.lift.setOrigin(.5,.5);
   this.physics.add.collider(this.player,this.lift,null,()=>this.player.body.velocity.y>=this.lift.body.velocity.y-25&&this.player.body.prev.y+this.player.body.height<=this.lift.body.top+20);
   for(const id of ['axiom','nyra','kai7'])for(const [name,start,end,rate]of [['idle',0,3,4],['run',4,11,14],['dash',14,15,16]]){const key='pilot-'+name+'-'+id;if(!this.anims.exists(key))this.anims.create({key,frames:this.anims.generateFrameNumbers('operator-'+id,{start,end}),frameRate:rate,repeat:-1});}
   this.fragments=data.fragments.map((p,i)=>({id:i,x:p.x,y:p.y,image:this.add.star(p.x,p.y,4,9,18,0xe9f2b3).setDepth(7),halo:this.add.circle(p.x,p.y,25,0xe9f2b3,.08).setDepth(6)}));
   this.secretItems=data.secrets.map((p,i)=>({id:i,x:p.x,y:p.y,image:this.add.circle(p.x,p.y,8,0x9edfd4).setStrokeStyle(2,0xe9f2c9).setDepth(7)}));
   this.beacons=data.checkpoints.map((p,i)=>{const post=this.add.rectangle(p.x,p.y-24,6,44,i===0?0xdcf49a:0x567c82).setDepth(2);this.add.ellipse(p.x,p.y,38,6,0xbce7c4,.4);return post;});
   this.anchorLight=this.add.rectangle(data.anchor.x,data.anchor.y-3,90,6,0x778d8e).setDepth(5);
   this.add.text(data.anchor.x-54,data.anchor.y+22,'ANCORE UM ECO',{fontFamily:'monospace',fontSize:'12px',color:'#b3d4c8'}).setDepth(2);
   this.liftLabel=this.add.text(data.lift.x-62,data.anchor.y-10,'GRUA / SEM SINAL',{fontFamily:'monospace',fontSize:'12px',color:'#93b5ba'}).setDepth(3);
   this.exit=this.add.container(data.exit.x,data.exit.y).setDepth(2);
   this.exit.add([this.add.rectangle(0,-49,68,98,0x1c3e4d).setStrokeStyle(3,0xb8d1b1),this.add.rectangle(0,-47,46,80,0x0c2633),this.add.rectangle(0,-91,46,5,0xdcf49a)]);
   this.add.text(data.exit.x-58,data.exit.y+16,'EVACUAÇÃO',{fontFamily:'monospace',fontSize:'12px',color:'#dcf49a'});
   this.enemies=data.enemies.map((e,i)=>({...e,dir:-1,alert:0,aim:0,target:null,cooldown:1+i*.3,sprite:this.add.sprite(e.x,e.y,'patrols',e.type==='scout'?0:e.type==='sentry'||e.type==='drone'?4:8).setOrigin(.5,1).setDepth(8)}));
   this.bolts=[];this.effects=[];this.aimLines=this.add.graphics().setDepth(10);this.ventGraphics=this.add.graphics().setDepth(5);this.pathGlow=this.add.graphics().setDepth(0);this.abilityGraphics=this.add.graphics().setDepth(17);
   this.cameras.main.startFollow(this.player,true,.085,.085,-70,55);this.resize();
   this.scale.on('resize',this.resize,this);
   this.pure=true;this.reducedEffects=false;this.ghostFrames=[];this.ghostTick=0;this.createDevices();this.physics.pause();this.bindUI();$('chapterName').textContent=String(this.levelIndex+1).padStart(2,'0')+' / '+data.name;$('startMission').textContent='MISSÃO '+(this.levelIndex+1)+' / 25 · MODO VERTICAL';$('startStory').textContent=data.briefing+' Estrela de tempo: menos de '+data.targetTime+' s.';if(this.levelIndex)$('startTitle').textContent=data.name;this.fillLevelMenu();this.selectOperator(this.operator,false);this.updateHUD();
   if(this.assetFailed){$('startCard').hidden=true;$('loadError').hidden=false;return;}
   $('beginPilot').disabled=false;let trained=false;try{trained=localStorage.getItem('echo404_origin_training_v14')==='true';}catch(_){}$('beginPilot').textContent=trained?'ENTRAR NA MISSÃO →':'APRENDER OS CONTROLOS →';
   this.events.once('shutdown',()=>this.cleanup());
  }
  createArchitecture(){
   if(this.levelIndex){this.createTower();return;}
   const g=this.add.graphics().setDepth(-10);
   // An authored silhouette: collapsed docks, a switchback silo, a crane and roofs.
   g.fillStyle(0x112f41,.68);g.fillRect(1500,330,560,1120);g.lineStyle(4,0x5d7b80,.35);g.strokeRect(1520,330,520,1120);
   for(let y=370;y<1450;y+=115){g.lineStyle(2,0x86a49b,.22);g.lineBetween(1520,y,2040,y+115);g.lineBetween(2040,y,1520,y+115);}
   g.fillStyle(0x163847,.7);g.fillRect(2390,440,300,1060);g.fillRect(2795,335,230,1165);g.fillRect(3420,520,610,980);
   for(let x=2420;x<2670;x+=42)for(let y=480;y<1400;y+=75){g.fillStyle((x+y)%3?0xd9d6a1:0x6a9a9c,.2);g.fillRect(x,y,15,30);}
   g.lineStyle(14,0x304d5a,1);g.lineBetween(2070,160,2070,1100);g.lineBetween(2070,175,2430,175);g.lineStyle(3,0xb9c7a7,.5);g.lineBetween(2070,175,2390,330);g.lineBetween(data.lift.x-40,175,data.lift.x-40,1100);g.lineBetween(data.lift.x+40,175,data.lift.x+40,1100);
   g.lineStyle(5,0x274655,.8);for(const p of data.platforms.filter(p=>p.id.includes('silo')))g.lineBetween(p.x+p.w/2,p.y+20,p.x+p.w/2,p.y+115);
   g.fillStyle(0x123242,.7);g.fillTriangle(100,1320,330,950,470,1320);g.fillTriangle(430,1320,650,1040,740,1320);
   for(const [x,y,label] of [[120,1180,'01 / CAIS EM RUÍNAS'],[1560,510,'02 / SILO DE MEMÓRIA'],[2450,180,'03 / AS COBERTURAS']])this.add.text(x,y,label,{fontFamily:'monospace',fontSize:'16px',color:'#d9e1bf'}).setAlpha(.55).setDepth(-5);
   this.add.text(410,1275,'↑ ALTO · ↑ CURTO · TOCA PARA SALTAR',{fontFamily:'monospace',fontSize:'12px',color:'#b7d2c6'}).setDepth(1);
   this.add.text(1780,730,'E / GRAVA · E / FIXA O TEU ECO',{fontFamily:'monospace',fontSize:'12px',color:'#d8dfa9'}).setDepth(1);
  }
  createTower(){
   const g=this.add.graphics().setDepth(-10),color=Phaser.Display.Color.HexStringToColor(data.color).color;
   for(let y=160;y<data.height;y+=230){g.fillStyle(0x0c1930,.7);g.fillRect(60,y,980,140);g.lineStyle(2,color,.22);
    if(data.kind==='reactor'){g.strokeCircle(550,y+70,100);g.fillStyle(color,.08);g.fillCircle(550,y+70,75);}
    else if(data.kind==='glass'){g.strokeTriangle(80,y+130,550,y-20,1020,y+130);g.lineBetween(80,y+130,1020,y+130);}
    else if(data.kind==='garden'){for(let x=100;x<1050;x+=150){g.strokeEllipse(x,y+70,85,140);g.lineBetween(x,y,x,y+140);}}
    else if(data.kind==='foundry'){for(let x=120;x<1050;x+=220){g.strokeRect(x,y,110,140);g.lineBetween(x,y+50,x+110,y+100);}}
    else if(data.kind==='vault'){for(let x=100;x<1050;x+=110){g.strokeRect(x,y+10,70,110);g.lineBetween(x+10,y+40,x+60,y+40);}}
    else{g.strokeEllipse(550,y+70,850,130);g.lineBetween(110,y,990,y+140);}
   }
   for(const p of data.platforms){g.lineStyle(2,color,.25);g.lineBetween(p.x+15,p.y+24,p.x+15,p.y+100);g.lineBetween(p.x+p.w-15,p.y+24,p.x+p.w-15,p.y+100);}
   g.lineStyle(3,color,.5);g.lineBetween(data.lift.x-50,data.lift.top-60,data.lift.x-50,data.lift.bottom+60);g.lineBetween(data.lift.x+50,data.lift.top-60,data.lift.x+50,data.lift.bottom+60);
   this.add.text(70,data.spawn.y-170,String(this.levelIndex+1).padStart(2,'0')+' / '+data.name,{fontFamily:'monospace',fontSize:'22px',color:data.color}).setDepth(-5);
  }
  resize(){if(!this.player)return;const cam=this.cameras.main;cam.setZoom(Math.max(.38,Math.min(1,this.scale.width/960,this.scale.height/540)));this.background.setPosition(this.scale.width/2,this.scale.height/2).setDisplaySize(this.scale.width/cam.zoom,this.scale.height/cam.zoom);}
  bindUI(){
   this.domHandlers=[];const on=(target,event,fn)=>{target.addEventListener(event,fn);this.domHandlers.push(()=>target.removeEventListener(event,fn));};
   for(const event of ['contextmenu','selectstart','dragstart'])on(document,event,e=>{if(!e.target.closest?.('#debugPanel'))e.preventDefault();});
   const clearSelection=()=>{const selected=window.getSelection?.();if(selected?.rangeCount)selected.removeAllRanges();};clearSelection();on(document,'pointerdown',e=>{if(!e.target.closest?.('#debugPanel'))clearSelection();});
   on($('beginPilot'),'click',()=>{let trained=false;try{trained=localStorage.getItem('echo404_origin_training_v14')==='true';}catch(_){}if(trained)this.begin();else this.startTraining();});on($('practicePilot'),'click',()=>this.startTraining());on($('trainingMission'),'click',()=>this.finishTraining());for(const button of document.querySelectorAll('[data-operator]'))on(button,'click',()=>{if(!this.running)this.selectOperator(button.dataset.operator);});on($('pauseToggle'),'click',()=>this.setPaused(!this.pausedByUser));on($('resumePilot'),'click',()=>this.setPaused(false));
   on($('checkpointPilot'),'click',()=>{this.respawn(true,'menu-checkpoint');this.setPaused(false);});on($('retryPilot'),'click',()=>this.scene.restart());on($('levelsToggle'),'click',()=>{this.clearInput();if(this.running&&!this.finished)this.setPaused(true);$('levelCard').hidden=false;});on($('closeLevels'),'click',()=>{$('levelCard').hidden=true;});on(window,'hashchange',()=>this.scene.restart());
   on($('soundToggle'),'click',()=>{this.soundBus.unlock();this.soundBus.enabled=!this.soundBus.enabled;try{localStorage.setItem('echo404_origin_sound',String(this.soundBus.enabled));}catch(_){}this.soundButton();});this.soundButton();
   const keyMap={ArrowLeft:'left',a:'left',A:'left',ArrowRight:'right',d:'right',D:'right',ArrowUp:'jump',w:'jump',W:'jump',' ':'jump'};
   on(window,'keydown',e=>{if(keyMap[e.key]){e.preventDefault();this.control.hold('key:'+e.code,keyMap[e.key],true);}else if(!e.repeat&&['e','E','Shift','q','Q'].includes(e.key)){e.preventDefault();this.control.press(e.key==='Shift'?'dash':['q','Q'].includes(e.key)?'ability':'echo');}else if(e.key==='Escape'&&!e.repeat)this.setPaused(!this.pausedByUser);});
   on(window,'keyup',e=>{if(keyMap[e.key]){e.preventDefault();this.control.hold('key:'+e.code,keyMap[e.key],false);}});
   for(const b of document.querySelectorAll('[data-hold],[data-action]')){
    let pointerActivation=false;
    on(b,'pointerdown',e=>{pointerActivation=true;e.preventDefault();this.soundBus.unlock();try{b.setPointerCapture(e.pointerId);}catch(_){}if(b.dataset.hold)this.control.hold('pointer:'+e.pointerId,b.dataset.hold,true);else{if(['shortJump','fullJump'].includes(b.dataset.action))this.control.hold('pointer:'+e.pointerId,b.dataset.action,true);this.control.press(b.dataset.action);}b.classList.add('pressed');});
    const release=e=>{this.control.hold('pointer:'+e.pointerId,b.dataset.hold,false);b.classList.remove('pressed');};
    on(b,'pointerup',release);on(b,'pointercancel',e=>{release(e);pointerActivation=false;});on(b,'lostpointercapture',release);
    // Assistive technology and keyboard activation can emit only a click.
    // Consume the synthetic click after a real pointer press to avoid duplicates.
    on(b,'click',()=>{if(pointerActivation){pointerActivation=false;return;}
     this.soundBus.unlock();if(b.dataset.action)this.control.press(b.dataset.action);
     else if(b.dataset.hold==='jump')this.control.press('jump');
     else{const token='click:'+b.dataset.hold;this.control.hold(token,b.dataset.hold,true);this.time.delayedCall(180,()=>this.control.hold(token,b.dataset.hold,false));}
    });
   }
   const interrupt=()=>{this.clearInput();if(this.running&&!this.finished)this.setPaused(true);this.soundBus.context?.suspend?.().catch(()=>{});};on(window,'blur',interrupt);on(window,'pagehide',interrupt);on(window,'pageshow',()=>{if(this.running&&!this.finished)this.setPaused(true);});on(window,'orientationchange',interrupt);if(window.screen?.orientation)on(window.screen.orientation,'change',interrupt);
   on(document,'visibilitychange',()=>{if(document.hidden){this.clearInput();if(this.running&&!this.finished)this.setPaused(true);this.soundBus.context?.suspend?.().catch(()=>{});}});
   this.bindTestUI();$('startCard').hidden=false;$('levelCard').hidden=true;$('pauseCard').hidden=true;$('resultCard').hidden=true;$('echoMeter').hidden=true;
  }
  bindTestUI(){
   const S=window.OriginSession;if(!S)return;const settings=S.read(localStorage,S.SETTINGS,{pure:true,reduced:false});this.pure=settings.pure!==false;this.reducedEffects=!!settings.reduced;const pure=$('pureMode'),reduced=$('reducedEffects');pure.checked=this.pure;reduced.checked=this.reducedEffects;
   const save=()=>{this.pure=pure.checked;this.reducedEffects=reduced.checked;document.body.classList.toggle('reduced-effects',this.reducedEffects);S.write(localStorage,S.SETTINGS,{pure:this.pure,reduced:this.reducedEffects});};pure.onchange=save;reduced.onchange=save;save();
   const refresh=()=>{const e=S.economy(localStorage);$('economyInfo').textContent=e.coins+' fragmentos · recargas −'+(e.tier*2)+'% (só assistido)';};refresh();$('buyUpgrade').onclick=()=>{S.buy(localStorage);refresh();};
   $('debugPanel').hidden=!new URLSearchParams(location.search).has('debug');$('copyReport').onclick=async()=>{this.session?.flush(this.elapsed);const text=S.report(localStorage);$('testReport').value=text;try{await navigator.clipboard.writeText(text);$('copyReport').textContent='RELATÓRIO COPIADO';}catch(_){$('testReport').focus();$('testReport').select();}};
  }
  clearInput(){this.control.clear();for(const b of document.querySelectorAll('.pilot-controls .pressed'))b.classList.remove('pressed');}
  selectOperator(id,persist=true){
   if(!['axiom','nyra','kai7'].includes(id))return;this.operator=id;this.player.anims.stop();this.player.setTexture('operator-'+id,0);
   for(const button of document.querySelectorAll('[data-operator]'))button.setAttribute('aria-pressed',String(button.dataset.operator===id));
   this.ability=new OriginAbilities.Ability(id);const ability=this.ability.config;$('operatorInfo').textContent=id.toUpperCase().replace('KAI7','KAI-7')+' · '+this.abilityHelp()+' Tecla Q ou botão '+ability.name+'.';$('operatorAbility').setAttribute('aria-label','Habilidade: '+ability.label);document.body.style.setProperty('--operator-color',ability.color);this.updateAbilityHUD();
   if(persist)try{localStorage.setItem('echo404_origin_operator',id);}catch(_){}
  }
  soundButton(){$('soundToggle').textContent=this.soundBus.enabled?'SOM ●':'SOM ○';$('soundToggle').setAttribute('aria-pressed',String(this.soundBus.enabled));}
  begin(){if(this.running||this.finished)return;this.running=true;this.physics.resume();this.soundBus.unlock();if(window.OriginSession&&!this.session)this.session=new OriginSession.Session(localStorage,data.id,this.operator,this.pure);this.ghostBest=window.OriginSession?.read(localStorage,'echo404_origin_ghost_v15:'+data.id+':'+this.operator,null);$('startCard').hidden=true;this.clearInput();this.toast('ECHO','O teu sinal está vivo. Segue os fragmentos de luz.');$('pilotStage').focus({preventScroll:true});this.updateAbilityHUD();}
  setPaused(value){if(!this.running||this.finished)return;this.pausedByUser=value;this.session?.flush(this.elapsed);this.clearInput();if(value)this.physics.pause();else{this.physics.resume();this.soundBus.unlock();}if(value)this.soundBus.context?.suspend?.().catch(()=>{});$('pauseCard').hidden=!value;$('pauseToggle').textContent=value?'▶':'Ⅱ';this.updateAbilityHUD();}
  spark(x,y,color=0xcce8b8,count=7){if(this.reducedEffects)return;for(let i=0;i<count;i++){const angle=i/count*Math.PI*2,o=this.add.rectangle(x,y,3,3,color).setDepth(20);this.effects.push({o,vx:Math.cos(angle)*80,vy:Math.sin(angle)*80,life:.4});}}
  respawn(countDeath=true,cause='fall'){if(this.capture){this.capture=null;this.captureTime=0;$('echoMeter').hidden=true;}if(countDeath){this.deaths++;this.session?.death(cause,this.elapsed);this.soundBus.play('hurt');}const point=data.checkpoints[this.checkpointIndex];this.health=3;this.invincible=1.8;this.ability.active=0;this.ability.airUsed=false;this.dashTime=0;this.player.body.setAllowGravity(true);this.player.body.reset(point.x,point.y);this.player.setVelocity(0,0);if(!this.reducedEffects)this.cameras.main.shake(100,.003);this.clearInput();this.toast('ECHO','Sinal estabilizado no último ponto seguro. Os fragmentos continuam contigo.');}
  hurt(cause='damage'){if(this.invincible>0||this.dashTime>feel.dash.duration-(feel.dash.immunity||0)||this.ability.active>0||this.finished)return;if(!this.pure&&this.power?.shield>0){this.power.shield=0;this.invincible=1;return;}this.health--;this.invincible=1.1;this.soundBus.play('hurt');this.spark(this.player.x,this.player.y-35,0xf0a893);if(!this.reducedEffects)this.cameras.main.shake(110,.004);if(this.health<=0)this.respawn(true,cause);else this.player.setVelocity(-this.facing*140,-240);}
  collectibles(){
   for(const item of this.fragments){if(this.recovered.has(item.id))continue;item.image.rotation+=.012;item.image.y=item.y+Math.sin(this.elapsed*2+item.id)*5;
    if(Phaser.Math.Distance.Between(this.player.x,this.player.y-40,item.x,item.y)<(!this.pure&&this.power?.magnet>0?140:48)){this.recovered.add(item.id);item.image.destroy();item.halo.destroy();this.spark(item.x,item.y,0xe8f4b0,12);this.soundBus.play('fragment');this.toast('REGISTO',this.recovered.size===3?'Os três fragmentos estão contigo. '+(data.exit.x>this.player.x?'Procura a saída à direita.':'Procura a saída à esquerda.'):'Fragmento '+this.recovered.size+'/3 recuperado. Continua a subir.');}}
   for(const item of this.secretItems){if(this.secrets.has(item.id))continue;if(Phaser.Math.Distance.Between(this.player.x,this.player.y-40,item.x,item.y)<40){this.secrets.add(item.id);item.image.destroy();this.spark(item.x,item.y,0x9ee5de,10);this.soundBus.play('fragment');this.toast('MEMÓRIA OPCIONAL',this.secrets.size+'/3 memórias encontradas. A estação ainda guarda segredos.');}}
   for(let i=this.checkpointIndex+1;i<data.checkpoints.length;i++){const cp=data.checkpoints[i];if(Math.abs(this.player.x-cp.x)<65&&Math.abs(this.player.y-cp.y)<32){this.checkpointIndex=i;this.beacons[i].setFillStyle(0xdcf49a);this.soundBus.play('checkpoint');this.toast('ECHO','Ponto seguro. Se caíres, o teu sinal regressa aqui.');}}
  }
  complete(){
   if(this.finished)return;this.finished=true;this.physics.pause();this.clearInput();
   const result={time:Math.max(1,Math.round(this.elapsed)),health:this.health,echoes:this.maxEchoes,operator:this.operator,abilityUses:this.ability.uses,deaths:this.deaths,secrets:this.secrets.size,fragments:this.recovered.size,pure:this.pure,stars:this.pure&&window.OriginSession?OriginSession.stars({fragments:this.recovered.size,time:this.elapsed,deaths:this.deaths},data.targetTime||180):[false,false,false],medal:rank({deaths:this.deaths,secrets:this.secrets.size})};
   this.session?.flush(this.elapsed,true);if(window.OriginSession){if(!this.pure)OriginSession.reward(localStorage,data.id+':'+this.operator);if(this.pure&&(!this.ghostBest||this.elapsed<this.ghostBest.time))OriginSession.write(localStorage,'echo404_origin_ghost_v15:'+data.id+':'+this.operator,{time:this.elapsed,frames:this.ghostFrames});}let stored=false;try{stored=save(localStorage,result,this.levelIndex);}catch(_){}
   const next=$('nextMission');next.href=this.levelIndex<24?'./origin-reborn.html'+(new URLSearchParams(location.search).has('debug')?'?debug':'')+'#nivel='+(this.levelIndex+2):'./index.html';next.textContent=this.levelIndex<24?'CONTINUAR · MISSÃO '+String(this.levelIndex+2).padStart(2,'0')+' →':'CAMPANHA CONCLUÍDA →';$('resultStory').textContent=this.levelIndex===24?'O arquivo voltou a ligar-se. Completaste as 25 missões. ECHO guardou a tua assinatura.':'O sinal foi recuperado. A ascensão continua em '+OriginPilot.levels[this.levelIndex+1].name+'. Os teus controlos e o teu operador continuam contigo.';$('resultMission').textContent=String(this.levelIndex+1).padStart(2,'0')+' / '+data.name;this.fillLevelMenu();$('resultAward').textContent=(this.pure?result.stars.map(x=>x?'★':'☆').join(''):'MODO ASSISTIDO · SEM ESTRELAS')+(this.pure?' · '+result.medal:'');$('resultSummary').textContent=Math.floor(result.time/60)+'m '+result.time%60+'s · '+this.deaths+' quedas · '+this.secrets.size+'/3 memórias';$('saveNotice').hidden=stored;$('resultCard').hidden=false;$('notice').hidden=true;$('echoMeter').hidden=true;
   this.updateAbilityHUD();this.soundBus.play('fragment');$('resultCard').querySelector('.primary').focus({preventScroll:true});
  }
  tickEffects(dt){
   for(const effect of this.effects){effect.life-=dt;effect.vy+=160*dt;effect.o.x+=effect.vx*dt;effect.o.y+=effect.vy*dt;effect.o.setAlpha(Math.max(0,effect.life/.4));if(effect.life<=0)effect.o.destroy();}this.effects=this.effects.filter(e=>e.life>0);
  }
  update(_,delta){
   if(!this.running||this.pausedByUser||this.finished)return;const dt=Math.min(delta/1000,.04);if(!this.training){this.elapsed+=dt;this.ghostTick+=dt;if(this.ghostTick>=.2){this.ghostTick=0;this.ghostFrames.push([Math.round(this.elapsed*10)/10,Math.round(this.player.x),Math.round(this.player.y),Number(this.player.frame.name)||0,this.player.flipX?1:0]);if(this.ghostFrames.length>1500)this.ghostFrames=this.ghostFrames.filter((_,i)=>i%2===0);}if(this.ghostBest&&!this.pure){if(!this.ghostSprite)this.ghostSprite=this.add.sprite(0,0,'operator-'+this.operator).setOrigin(.5,1).setAlpha(.2).setTint(0xffffff);const f=this.ghostBest.frames.find(f=>f[0]>=this.elapsed)||this.ghostBest.frames.at(-1);if(f)this.ghostSprite.setPosition(f[1],f[2]).setFrame(f[3]).setFlipX(!!f[4]);}}this.invincible=Math.max(0,this.invincible-dt);this.ability.tick(dt,this.abilityContext());this.drawAbility();this.tickEffects(dt);
   if(this.training){this.trainingUpdate(dt);return;}this.move(dt);this.updateEcho(dt);this.updateLift(dt);this.collectibles();this.updateDevices(dt);this.patrols(dt*(this.power?.slow>0?.55:1));
   if(this.player.y>data.height-30)this.respawn();

   if(this.elapsed>this.noticeUntil)$('notice').hidden=true;
   const visit=(key,condition,text)=>{if(condition&&!this.visited.has(key)){this.visited.add(key);this.toast('ECHO',text);}};
   visit('dash',this.levelIndex===0&&this.player.x>1000&&this.player.y>1000,'IMPULSO atravessa intervalos maiores. Shift ou o botão »; volta a carregar em um segundo.');
   visit('anchor',this.levelIndex===0&&this.player.x>1740&&this.player.y<750&&this.player.y>550,'Grava-te parado sobre a âncora iluminada. Fixa o eco e salta para a grua.');
   visit('sky',this.levelIndex===0&&this.player.x>2380&&this.player.y<550,'Conseguiste subir. A cobertura mais alta esconde uma memória opcional.');
   if(Math.abs(this.player.x-data.exit.x)<55&&Math.abs(this.player.y-data.exit.y)<40){if(this.recovered.size===3&&(!this.mechanisms?.devices.some(d=>d.type==='door')||this.mechanisms.state['exit-door']))this.complete();else visit('missing',true,'Ainda faltam '+(3-this.recovered.size)+' fragmentos. Procura os sinais de luz no percurso.');}
   this.uiTick+=dt;if(this.uiTick>.1){this.uiTick=0;this.updateHUD();}
  }
  cleanup(){this.session?.flush(this.elapsed);this.clearInput();for(const off of this.domHandlers||[])off();this.scale.off('resize',this.resize,this);if(this.soundBus.context)this.soundBus.context.close().catch(()=>{});}
 }
 for(const methods of Object.values(window.OriginModules||{}))Object.assign(OriginScene.prototype,methods);
 window.OriginPilotSound=PilotSound;window.OriginPilotInput=PilotInput;window.OriginPilotScene=OriginScene;
 if(window.ORIGIN_PILOT_NO_BOOT)return;
 window.addEventListener('error',()=>{if($('beginPilot').disabled){$('startCard').hidden=true;$('loadError').hidden=false;}},{once:true});
 try{window.originPilotGame=new Phaser.Game({type:Phaser.AUTO,parent:'gameMount',width:960,height:540,backgroundColor:'#193547',antialias:true,roundPixels:false,banner:false,physics:{default:'arcade',arcade:{gravity:{y:1700},fixedStep:true,fps:60}},scale:{mode:Phaser.Scale.RESIZE,autoCenter:Phaser.Scale.CENTER_BOTH},scene:[OriginScene],audio:{noAudio:true},render:{powerPreference:'low-power'}});}catch(error){$('startCard').hidden=true;$('loadError').hidden=false;console.error(error);}
})();
