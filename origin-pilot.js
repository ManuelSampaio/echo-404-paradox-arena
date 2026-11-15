/* ECHO//404 — 25-MISSION VERTICAL CAMPAIGN v14.1.0. Phaser 3.90 / Arcade Physics. */
(() => {
 'use strict';
 if(!window.Phaser){document.getElementById('startCard').hidden=true;document.getElementById('loadError').hidden=false;return;}
 const {clamp,pose,groundedAt,rank,save}=OriginPilot;let data=OriginPilot.data;
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
   this.capture=null;this.echo=null;this.echoSprite=null;this.captureAccumulator=0;this.echoUsed=false;this.padPowered=false;
   this.jumpBuffer=0;this.coyote=0;this.dashTime=0;this.dashCooldown=0;this.facing=1;this.wasGrounded=false;this.noticeUntil=0;this.uiTick=0;
   this.operator='axiom';try{const saved=localStorage.getItem('echo404_origin_operator')||localStorage.getItem('echo404_operator');if(['axiom','nyra','kai7'].includes(String(saved).toLowerCase().replace('-','')))this.operator=String(saved).toLowerCase().replace('-','');}catch(_){}this.training=false;this.trainingCompleted=false;this.jumpStyle='variable';this.control=new PilotInput();this.soundBus=new PilotSound();
   this.physics.world.setBounds(0,-200,data.width,data.height+500);
   this.cameras.main.setBounds(0,0,data.width,data.height);
   this.background=this.add.image(0,0,'horizon').setOrigin(.5).setScrollFactor(0).setDepth(-30);if(this.levelIndex)this.background.setTint(Phaser.Display.Color.HexStringToColor(data.color).color);
   this.createArchitecture();
   this.solids=this.physics.add.staticGroup();
   for(const p of data.platforms){const tile=this.add.tileSprite(p.x+p.w/2,p.y+p.h/2,p.w,p.h,'platform');this.physics.add.existing(tile,true);this.solids.add(tile);}
   this.player=this.physics.add.sprite(data.spawn.x,data.spawn.y,'operator-'+this.operator,0).setOrigin(.5,1).setDepth(15);
   this.player.setSize(26,66).setOffset(23,22).setMaxVelocity(310,1080).setDragX(2200).setCollideWorldBounds(true);
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
   this.bolts=[];this.effects=[];this.aimLines=this.add.graphics().setDepth(10);this.ventGraphics=this.add.graphics().setDepth(5);this.pathGlow=this.add.graphics().setDepth(0);
   this.cameras.main.startFollow(this.player,true,.085,.085,-70,55);this.resize();
   this.scale.on('resize',this.resize,this);
   this.physics.pause();this.bindUI();$('chapterName').textContent=String(this.levelIndex+1).padStart(2,'0')+' / '+data.name;$('startMission').textContent='MISSÃO '+(this.levelIndex+1)+' / 25 · MODO VERTICAL';$('startStory').textContent=data.briefing;if(this.levelIndex)$('startTitle').textContent=data.name;this.fillLevelMenu();this.selectOperator(this.operator,false);this.updateHUD();
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
  fillLevelMenu(){const list=$('missionList');list.replaceChildren();let progress={levels:{}};try{progress=OriginPilot.load(localStorage);}catch(_){}
   OriginPilot.levels.forEach((level,i)=>{const a=document.createElement('a');a.href='./origin-reborn.html#nivel='+(i+1);const record=progress.levels[level.id];a.textContent=String(i+1).padStart(2,'0')+' / '+level.name+(record?' · '+record.medal:'');a.setAttribute('aria-current',i===this.levelIndex?'page':'false');list.append(a);});
  }
  resize(){if(!this.player)return;const cam=this.cameras.main;cam.setZoom(Math.max(.55,Math.min(1,this.scale.width/960,this.scale.height/540)));this.background.setPosition(this.scale.width/2,this.scale.height/2).setDisplaySize(this.scale.width/cam.zoom,this.scale.height/cam.zoom);}
  bindUI(){
   this.domHandlers=[];const on=(target,event,fn)=>{target.addEventListener(event,fn);this.domHandlers.push(()=>target.removeEventListener(event,fn));};
   for(const event of ['contextmenu','selectstart','dragstart'])on(document,event,e=>e.preventDefault());
   const clearSelection=()=>{const selected=window.getSelection?.();if(selected?.rangeCount)selected.removeAllRanges();};clearSelection();on(document,'pointerdown',clearSelection);
   on($('beginPilot'),'click',()=>{let trained=false;try{trained=localStorage.getItem('echo404_origin_training_v14')==='true';}catch(_){}if(trained)this.begin();else this.startTraining();});on($('practicePilot'),'click',()=>this.startTraining());on($('trainingMission'),'click',()=>this.finishTraining());for(const button of document.querySelectorAll('[data-operator]'))on(button,'click',()=>{if(!this.running)this.selectOperator(button.dataset.operator);});on($('pauseToggle'),'click',()=>this.setPaused(!this.pausedByUser));on($('resumePilot'),'click',()=>this.setPaused(false));
   on($('checkpointPilot'),'click',()=>{this.respawn(false);this.setPaused(false);});on($('retryPilot'),'click',()=>this.scene.restart());on($('levelsToggle'),'click',()=>{this.control.clear();if(this.running&&!this.finished)this.setPaused(true);$('levelCard').hidden=false;});on($('closeLevels'),'click',()=>{$('levelCard').hidden=true;});on(window,'hashchange',()=>this.scene.restart());
   on($('soundToggle'),'click',()=>{this.soundBus.unlock();this.soundBus.enabled=!this.soundBus.enabled;try{localStorage.setItem('echo404_origin_sound',String(this.soundBus.enabled));}catch(_){}this.soundButton();});this.soundButton();
   const keyMap={ArrowLeft:'left',a:'left',A:'left',ArrowRight:'right',d:'right',D:'right',ArrowUp:'jump',w:'jump',W:'jump',' ':'jump'};
   on(window,'keydown',e=>{if(keyMap[e.key]){e.preventDefault();this.control.hold('key:'+e.code,keyMap[e.key],true);}else if(!e.repeat&&['e','E','Shift'].includes(e.key)){e.preventDefault();this.control.press(e.key==='Shift'?'dash':'echo');}else if(e.key==='Escape'&&!e.repeat)this.setPaused(!this.pausedByUser);});
   on(window,'keyup',e=>{if(keyMap[e.key]){e.preventDefault();this.control.hold('key:'+e.code,keyMap[e.key],false);}});
   for(const b of document.querySelectorAll('[data-hold],[data-action]')){
    let pointerActivation=false;
    on(b,'pointerdown',e=>{pointerActivation=true;e.preventDefault();this.soundBus.unlock();try{b.setPointerCapture(e.pointerId);}catch(_){}if(b.dataset.hold)this.control.hold('pointer:'+e.pointerId,b.dataset.hold,true);else this.control.press(b.dataset.action);b.classList.add('pressed');});
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
   on(window,'blur',()=>{this.control.clear();if(this.running&&!this.finished)this.setPaused(true);});
   on(document,'visibilitychange',()=>{if(document.hidden&&this.running&&!this.finished)this.setPaused(true);});
   $('startCard').hidden=false;$('levelCard').hidden=true;$('pauseCard').hidden=true;$('resultCard').hidden=true;$('echoMeter').hidden=true;
  }
  selectOperator(id,persist=true){
   if(!['axiom','nyra','kai7'].includes(id))return;this.operator=id;this.player.anims.stop();this.player.setTexture('operator-'+id,0);
   for(const button of document.querySelectorAll('[data-operator]'))button.setAttribute('aria-pressed',String(button.dataset.operator===id));
   $('operatorInfo').textContent={axiom:'AXIOM · Armadura de fase e visor de sinal.',nyra:'NYRA · Fato de reconhecimento e linhas de luz.',kai7:'KAI-7 · Operador aumentado com interface óptica.'}[id]+' Mesmos saltos, velocidade e controlos para todos.';
   if(persist)try{localStorage.setItem('echo404_origin_operator',id);}catch(_){}
  }
  startTraining(){
   if(this.running||this.finished)return;this.training=true;this.trainingStep=0;this.trainingDistance={left:0,right:0};this.trainingLastX=160;this.trainingPeak=1320;this.lastJumpStyle=null;this.control.clear();this.running=true;this.physics.resume();this.soundBus.unlock();
   $('startCard').hidden=true;$('trainingPanel').hidden=false;$('trainingMission').hidden=true;$('notice').hidden=true;
   this.solids.children.each(o=>{o.setVisible(false);o.body.enable=false;});this.lift.setVisible(false);this.lift.body.enable=false;
   for(const e of this.enemies)e.sprite.setVisible(false);for(const f of this.fragments){f.image.setVisible(false);f.halo.setVisible(false);}for(const f of this.secretItems)f.image.setVisible(false);
   this.trainingFloor=this.add.tileSprite(490,1360,980,80,'platform');this.physics.add.existing(this.trainingFloor,true);this.trainingCollider=this.physics.add.collider(this.player,this.trainingFloor);
   this.trainingMark=this.add.text(100,1200,'SIMULAÇÃO / SEM PERDER VIDAS',{fontFamily:'monospace',fontSize:'18px',color:'#73f4df'});
   this.physics.world.setBounds(0,900,980,700);this.cameras.main.setBounds(0,900,980,660);this.player.body.reset(160,1318);this.player.setVelocity(0,0);this.trainingPrompt();$('pilotStage').focus({preventScroll:true});
  }
  trainingPrompt(){
   const steps=[['ESQUERDA E DIREITA','Segura ← para andar para a esquerda e → para a direita. Experimenta os dois lados.',['left','right']],['SALTO CURTO','Toca uma vez em CURTO. É sempre um salto pequeno; não precisas de segurar.',['shortJump']],['SALTO ALTO','Toca uma vez em ALTO. Vais subir mais. Podes segurar uma direção enquanto saltas.',['fullJump']],['IMPULSO','Toca em IMPULSO para avançar rapidamente. A contagem no botão mostra quando podes voltar a usar.',['dash']],['O TEU ECO','Toca em ECO, grava durante meio segundo ou mais e toca de novo para FIXAR. O teu holograma repete o percurso e fica na posição final.',['echo']],['PRONTO PARA A ORIGIN','Aprendeste os controlos. Na missão, recolhe 3 fragmentos, fixa um eco na âncora da grua e sobe até à evacuação.',[]]];
   const [title,text,keys]=steps[this.trainingStep];$('trainingCount').textContent=this.trainingStep<5?'TREINO '+(this.trainingStep+1)+' / 5 · SEM PERDER VIDAS':'SIMULAÇÃO CONCLUÍDA';$('trainingTitle').textContent=title;$('trainingText').textContent=text;$('trainingMission').hidden=this.trainingStep!==5;
   for(const b of document.querySelectorAll('.pilot-controls button'))b.classList.toggle('training-target',keys.includes(b.dataset.action||b.dataset.hold));
   $('objective').textContent='SIMULAÇÃO · '+title;
  }
  trainingAdvance(){this.trainingStep++;this.control.clear();this.lastJumpStyle=null;this.trainingPeak=1320;this.trainingPrompt();}
  trainingUpdate(dt){
   const oldX=this.trainingLastX??this.player.x;this.move(dt);this.updateEcho(dt);const dx=this.player.x-oldX;this.trainingLastX=this.player.x;$('notice').hidden=true;
   if(this.trainingStep===0){if(this.control.down('left'))this.trainingDistance.left+=Math.max(0,-dx);if(this.control.down('right'))this.trainingDistance.right+=Math.max(0,dx);if(this.trainingDistance.left>35&&this.trainingDistance.right>35)this.trainingAdvance();}
   else if(this.trainingStep===1||this.trainingStep===2){this.trainingPeak=Math.min(this.trainingPeak,this.player.y);const expected=this.trainingStep===1?'short':'full';if(this.lastJumpStyle===expected&&1320-this.trainingPeak>(expected==='short'?40:110)&&this.player.body.blocked.down)this.trainingAdvance();}
   else if(this.trainingStep===3&&this.dashTime>0)this.trainingAdvance();
   else if(this.trainingStep===4&&this.echo)this.trainingAdvance();
   if(this.player.y>1550){this.player.body.reset(160,1318);this.player.setVelocity(0,0);this.control.clear();}
   $('vitals').textContent='TREINO';$('clock').textContent='—';$('fragmentCount').textContent=(Math.min(this.trainingStep,5))+'/5';
   const dash=document.querySelector('[data-action="dash"]');dash.disabled=this.dashCooldown>0;dash.querySelector('small').textContent=this.dashCooldown>0?this.dashCooldown.toFixed(1)+'s':'IMPULSO';
  }
  finishTraining(){
   if(!this.training||this.trainingStep!==5)return;this.training=false;this.trainingCompleted=true;try{localStorage.setItem('echo404_origin_training_v14','true');}catch(_){}this.running=false;this.pausedByUser=false;$('pauseCard').hidden=true;this.trainingCollider.destroy();this.trainingFloor.destroy();this.trainingMark.destroy();
   this.solids.children.each(o=>{o.setVisible(true);o.body.enable=true;});this.lift.setVisible(true);this.lift.body.enable=true;for(const e of this.enemies)e.sprite.setVisible(true);for(const f of this.fragments){f.image.setVisible(true);f.halo.setVisible(true);}for(const f of this.secretItems)f.image.setVisible(true);
   if(this.echoSprite){this.echoSprite.destroy();this.echoSprite=null;}for(const effect of this.effects)effect.o.destroy();this.effects=[];this.echo=null;this.echoPoint=null;this.echoUsed=false;this.capture=null;this.captureTime=0;this.captureAccumulator=0;this.dashTime=0;this.dashCooldown=0;this.jumpBuffer=0;this.coyote=0;this.jumpStyle='variable';this.elapsed=0;this.invincible=0;
   this.physics.world.setBounds(0,-200,data.width,data.height+500);this.cameras.main.setBounds(0,0,data.width,data.height);this.player.body.reset(data.spawn.x,data.spawn.y);this.player.setVelocity(0,0);this.player.body.setAllowGravity(true);$('trainingPanel').hidden=true;$('echoMeter').hidden=true;
   for(const b of document.querySelectorAll('.pilot-controls button'))b.classList.remove('training-target');this.begin();this.updateHUD();
  }
  soundButton(){$('soundToggle').textContent=this.soundBus.enabled?'SOM ●':'SOM ○';$('soundToggle').setAttribute('aria-pressed',String(this.soundBus.enabled));}
  begin(){if(this.running||this.finished)return;this.running=true;this.physics.resume();this.soundBus.unlock();$('startCard').hidden=true;this.control.clear();this.toast('ECHO','O teu sinal está vivo. Segue os fragmentos de luz.');$('pilotStage').focus({preventScroll:true});}
  setPaused(value){if(!this.running||this.finished)return;this.pausedByUser=value;this.control.clear();if(value)this.physics.pause();else this.physics.resume();$('pauseCard').hidden=!value;$('pauseToggle').textContent=value?'▶':'Ⅱ';}
  toast(name,text){$('noticeName').textContent=name;$('noticeText').textContent=text;$('notice').hidden=false;this.noticeUntil=this.elapsed+5;}
  spark(x,y,color=0xcce8b8,count=7){for(let i=0;i<count;i++){const angle=i/count*Math.PI*2,o=this.add.rectangle(x,y,3,3,color).setDepth(20);this.effects.push({o,vx:Math.cos(angle)*80,vy:Math.sin(angle)*80,life:.4});}}
  respawn(countDeath=true){if(countDeath){this.deaths++;this.soundBus.play('hurt');}const point=data.checkpoints[this.checkpointIndex];this.health=3;this.invincible=1.8;this.dashTime=0;this.player.body.setAllowGravity(true);this.player.body.reset(point.x,point.y);this.player.setVelocity(0,0);this.cameras.main.shake(100,.003);this.control.clear();this.toast('ECHO','Sinal estabilizado no último ponto seguro. Os fragmentos continuam contigo.');}
  hurt(){if(this.invincible>0||this.dashTime>0||this.finished)return;this.health--;this.invincible=1.1;this.soundBus.play('hurt');this.spark(this.player.x,this.player.y-35,0xf0a893);this.cameras.main.shake(110,.004);if(this.health<=0)this.respawn();else this.player.setVelocity(-this.facing*140,-240);}
  toggleEcho(){
   if(this.capture){
    if(this.captureTime<.5||this.capture.length<15){this.toast('ECHO','Grava pelo menos meio segundo antes de fixar o eco.');return;}
    if(this.echoSprite)this.echoSprite.destroy();this.echo={frames:this.capture,time:0};this.echoUsed=true;this.echoSprite=this.add.sprite(this.capture[0].x,this.capture[0].y,'operator-'+this.operator,0).setOrigin(.5,1).setTint(0x92e8e4).setAlpha(.5).setDepth(13);
    this.capture=null;$('echoMeter').hidden=true;this.soundBus.play('echo-fix');this.toast('ECHO','Eco fixado. Ele repete o percurso e mantém a posição final.');
   }else{this.soundBus.play('echo-start');this.capture=[];this.captureTime=0;this.captureAccumulator=0;$('echoMeter').hidden=false;this.toast('ECHO','A gravar. Toca em ECO outra vez para fixar a tua posição.');}
  }
  move(dt){
   const p=this.player,b=p.body,grounded=b.blocked.down||b.touching.down;
   this.coyote=grounded ? .11 :Math.max(0,this.coyote-dt);this.jumpBuffer=Math.max(0,this.jumpBuffer-dt);
   if(this.control.take('jump')){this.jumpBuffer=.13;this.jumpStyle='variable';}if(this.control.take('shortJump')){this.jumpBuffer=.16;this.jumpStyle='short';}if(this.control.take('fullJump')){this.jumpBuffer=.16;this.jumpStyle='full';}
   if(this.jumpBuffer>0&&this.coyote>0&&this.dashTime<=0){p.setVelocityY(this.jumpStyle==='short'?-480:-700);this.lastJumpStyle=this.jumpStyle;this.jumpBuffer=0;this.coyote=0;this.soundBus.play(this.jumpStyle==='short'?'jump-short':'jump-high');this.spark(p.x,p.y,0xb3cbb8,4);}
   if(this.control.releasedJump){if(this.jumpStyle==='variable'&&b.velocity.y<-260)p.setVelocityY(b.velocity.y*.5);this.control.releasedJump=false;}
   this.dashCooldown=Math.max(0,this.dashCooldown-dt);
   if(this.control.take('dash')&&this.dashCooldown<=0){this.dashTime=.14;this.dashCooldown=1.05;this.soundBus.play('dash');this.spark(p.x,p.y-35,0xa6e4d6);}
   const direction=Number(this.control.down('right'))-Number(this.control.down('left'));if(direction)this.facing=direction;p.setFlipX(this.facing<0);
   if(this.dashTime>0){this.dashTime=Math.max(0,this.dashTime-dt);b.setAllowGravity(false);p.setAccelerationX(0).setDragX(0).setMaxVelocity(650,1080).setVelocity(this.facing*620,0);p.play('pilot-dash-'+this.operator,true);}
   else{b.setAllowGravity(true);p.setMaxVelocity(310,1080).setDragX(direction?0:grounded?2300:600).setAccelerationX(direction*(grounded?1900:1300));
    if(!grounded){p.anims.stop();p.setFrame(b.velocity.y<0?12:13);}else p.play('pilot-'+(Math.abs(b.velocity.x)>28?'run':'idle')+'-'+this.operator,true);
   }
   if(grounded&&!this.wasGrounded)this.spark(p.x,p.y,0xaac6be,5);this.wasGrounded=grounded;
   p.setAlpha(this.invincible>0&&Math.floor(this.invincible*14)%2?.4:1);
  }
  updateEcho(dt){
   if(this.control.take('echo'))this.toggleEcho();
   if(this.capture){this.captureTime+=dt;this.captureAccumulator+=dt;if(this.captureAccumulator>=1/30){this.captureAccumulator=0;this.capture.push({t:this.captureTime,x:this.player.x,y:this.player.y,flip:this.player.flipX,frame:Number(this.player.frame.name)||0});}
    $('echoMeter').querySelector('span').style.transform='scaleX('+Math.min(1,this.captureTime/5)+')';if(this.captureTime>=5)this.toggleEcho();}
   if(this.echo){this.echo.time+=dt;const point=pose(this.echo.frames,this.echo.time);this.echoSprite.setPosition(point.x,point.y).setFlipX(point.flip).setFrame(point.frame);this.echoPoint=point;}
   this.padPowered=groundedAt(this.player,data.anchor)||groundedAt(this.echoPoint,data.anchor);
   this.anchorLight.setFillStyle(this.padPowered?0xdcf49a:0x778d8e);this.liftLabel.setText(this.padPowered?'GRUA / ECO ONLINE':'GRUA / SEM SINAL');
   const goal=(this.padPowered?data.lift.top:data.lift.bottom)+12,error=goal-this.lift.y;
   if(Math.abs(error)<1){this.lift.body.reset(data.lift.x,goal);this.lift.setVelocityY(0);}else this.lift.setVelocityY(clamp(error*2,-110,85));
   $('echoAction').innerHTML=this.capture?'◈<small>FIXAR</small>':this.echo?'◈<small>REGRAVAR</small>':'◈<small>ECO</small>';
  }
  collectibles(){
   for(const item of this.fragments){if(this.recovered.has(item.id))continue;item.image.rotation+=.012;item.image.y=item.y+Math.sin(this.elapsed*2+item.id)*5;
    if(Phaser.Math.Distance.Between(this.player.x,this.player.y-40,item.x,item.y)<48){this.recovered.add(item.id);item.image.destroy();item.halo.destroy();this.spark(item.x,item.y,0xe8f4b0,12);this.soundBus.play('fragment');this.toast('REGISTO',this.recovered.size===3?'Os três fragmentos estão contigo. A evacuação está a leste.':'Fragmento '+this.recovered.size+'/3 recuperado. Continua a subir.');}}
   for(const item of this.secretItems){if(this.secrets.has(item.id))continue;if(Phaser.Math.Distance.Between(this.player.x,this.player.y-40,item.x,item.y)<40){this.secrets.add(item.id);item.image.destroy();this.spark(item.x,item.y,0x9ee5de,10);this.soundBus.play('fragment');this.toast('MEMÓRIA OPCIONAL',this.secrets.size+'/3 memórias encontradas. A estação ainda guarda segredos.');}}
   for(let i=this.checkpointIndex+1;i<data.checkpoints.length;i++){const cp=data.checkpoints[i];if(Math.abs(this.player.x-cp.x)<65&&Math.abs(this.player.y-cp.y)<32){this.checkpointIndex=i;this.beacons[i].setFillStyle(0xdcf49a);this.soundBus.play('checkpoint');this.toast('ECHO','Ponto seguro. Se caíres, o teu sinal regressa aqui.');}}
  }
  patrols(dt){
   this.aimLines.clear();const p=this.player;
   for(const enemy of this.enemies){const dx=p.x-enemy.x,dy=(p.y-36)-(enemy.y-38),near=Math.abs(dx)<(enemy.type==='sentry'?450:330)&&Math.abs(dy)<100;
    const facing=enemy.type==='sentry'||enemy.alert>.6||dx*enemy.dir>-25;
    const blocked=data.platforms.some(s=>s.h>35&&s.x>Math.min(p.x,enemy.x)&&s.x<Math.max(p.x,enemy.x)&&s.y<Math.min(p.y,enemy.y)-25);
    const sees=near&&facing&&!blocked;enemy.alert=clamp(enemy.alert+dt*(sees?2:-.6),0,1);enemy.cooldown=Math.max(0,enemy.cooldown-dt);
    if(enemy.type!=='sentry'){if(enemy.alert>.6)enemy.dir=dx>0?1:-1;enemy.x=clamp(enemy.x+enemy.dir*(enemy.alert>.6?(enemy.type==='hound'?180:100):45)*(1+this.levelIndex*.012)*dt,enemy.min,enemy.max);if(enemy.x===enemy.min)enemy.dir=1;if(enemy.x===enemy.max)enemy.dir=-1;}
    enemy.sprite.setPosition(enemy.x,enemy.y+(enemy.type==='drone'?Math.sin(this.elapsed*2)*12:0)).setFlipX(enemy.dir<0).setFrame((enemy.type==='scout'?0:enemy.type==='sentry'||enemy.type==='drone'?4:8)+Math.floor(this.elapsed*8)%4);
    if(Math.abs(dx)<35&&Math.abs(p.y-enemy.y)<62)this.hurt();
    if(enemy.type==='hound')continue;
    if(sees&&enemy.alert>.6&&enemy.cooldown<=0){
     if(!enemy.target){enemy.target={x:p.x,y:p.y-35};enemy.aim=(enemy.type==='sentry'?1.2:.95)*Math.max(.75,1-this.levelIndex*.007);}
     enemy.aim-=dt;this.aimLines.lineStyle(1.5,0xf3bd8d,.6);this.aimLines.lineBetween(enemy.x,enemy.y-44,enemy.target.x,enemy.target.y);this.aimLines.strokeCircle(enemy.target.x,enemy.target.y,10);
     if(enemy.aim<=0){const x=enemy.x,y=enemy.y-44,tx=enemy.target.x-x,ty=enemy.target.y-y,len=Math.hypot(tx,ty)||1,o=this.add.circle(x,y,4,0xffc294).setDepth(11);this.bolts.push({o,x,y,vx:tx/len*300,vy:ty/len*300,life:2});enemy.target=null;enemy.cooldown=Math.max(1.65,2.5-this.levelIndex*.03);}
    }else{enemy.target=null;enemy.aim=0;}
   }
   this.bolts=this.bolts.filter(shot=>{shot.x+=shot.vx*dt;shot.y+=shot.vy*dt;shot.life-=dt;shot.o.setPosition(shot.x,shot.y);
    if(data.platforms.some(s=>shot.x>s.x&&shot.x<s.x+s.w&&shot.y>s.y&&shot.y<s.y+s.h))shot.life=0;
    if(Math.abs(shot.x-p.x)<18&&shot.y>p.y-65&&shot.y<p.y){this.hurt();shot.life=0;}
    if(shot.life<=0){shot.o.destroy();return false;}return true;});
   this.ventGraphics.clear();for(const v of (data.vents||[data.vent])){const phase=(this.elapsed+(v.offset||0))%v.period,active=phase>3.9&&phase<4.8,warning=phase>2.9&&phase<=3.9;this.ventGraphics.fillStyle(active?0xe5b38a:warning?0xdce8a1:0x5c7b80,active ? .6 : .4);this.ventGraphics.fillRect(v.x,v.y-5,v.w,5);
   if(active){for(let i=0;i<5;i++){this.ventGraphics.fillStyle(0xd7e0cb,.22);this.ventGraphics.fillCircle(v.x+8+i*12,v.y-20-Math.sin(this.elapsed*5+i)*12,13);}if(p.x>v.x-12&&p.x<v.x+v.w+12&&p.y>v.y-45&&p.y<v.y+8)this.hurt();}
   if(warning){this.ventGraphics.lineStyle(2,0xf4d7a1,.7);this.ventGraphics.strokeRect(v.x,v.y-50,v.w,45);}}
  }
  updateHUD(){const m=Math.floor(this.elapsed/60),s=Math.floor(this.elapsed%60);$('clock').textContent=String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');$('vitals').textContent='● '.repeat(this.health)+'○ '.repeat(3-this.health);$('fragmentCount').textContent='◈ '+this.recovered.size+'/3';for(const button of document.querySelectorAll('[data-action=\"dash\"]')){button.disabled=this.dashCooldown>0;button.querySelector('small').textContent=this.dashCooldown>0?this.dashCooldown.toFixed(1)+'s':'IMPULSO';}$('objective').textContent=this.recovered.size===3?'ALCANÇA A EVACUAÇÃO →':this.player.y<550?'SEGUE PELAS COBERTURAS →':Math.abs(this.player.y-data.anchor.y)<140?'FIXA UM ECO NA ÂNCORA DA GRUA':'RECUPERA OS TRÊS FRAGMENTOS';}
  complete(){
   if(this.finished)return;this.finished=true;this.physics.pause();this.control.clear();
   const result={time:Math.max(1,Math.round(this.elapsed)),health:this.health,echoes:this.echoUsed?1:0,deaths:this.deaths,secrets:this.secrets.size,medal:rank({deaths:this.deaths,secrets:this.secrets.size})};
   let stored=false;try{stored=save(localStorage,result,this.levelIndex);}catch(_){}
   const next=$('nextMission');next.href=this.levelIndex<24?'./origin-reborn.html#nivel='+(this.levelIndex+2):'./index.html';next.textContent=this.levelIndex<24?'CONTINUAR · MISSÃO '+String(this.levelIndex+2).padStart(2,'0')+' →':'CAMPANHA CONCLUÍDA →';$('resultStory').textContent=this.levelIndex===24?'O arquivo voltou a ligar-se. Completaste as 25 missões. ECHO guardou a tua assinatura.':'O sinal foi recuperado. A ascensão continua em '+OriginPilot.levels[this.levelIndex+1].name+'. Os teus controlos e o teu operador continuam contigo.';$('resultMission').textContent=String(this.levelIndex+1).padStart(2,'0')+' / '+data.name;this.fillLevelMenu();$('resultAward').textContent='MEDALHA '+result.medal;$('resultSummary').textContent=Math.floor(result.time/60)+'m '+result.time%60+'s · '+this.deaths+' quedas · '+this.secrets.size+'/3 memórias';$('saveNotice').hidden=stored;$('resultCard').hidden=false;$('notice').hidden=true;$('echoMeter').hidden=true;
   this.soundBus.play('fragment');$('resultCard').querySelector('.primary').focus({preventScroll:true});
  }
  update(_,delta){
   if(!this.running||this.pausedByUser||this.finished)return;const dt=Math.min(delta/1000,.04);if(!this.training)this.elapsed+=dt;this.invincible=Math.max(0,this.invincible-dt);
   if(this.training){this.trainingUpdate(dt);return;}this.move(dt);this.updateEcho(dt);this.collectibles();this.patrols(dt);
   if(this.player.y>data.height-30)this.respawn();
   for(const effect of this.effects){effect.life-=dt;effect.vy+=160*dt;effect.o.x+=effect.vx*dt;effect.o.y+=effect.vy*dt;effect.o.setAlpha(Math.max(0,effect.life/.4));if(effect.life<=0)effect.o.destroy();}this.effects=this.effects.filter(e=>e.life>0);
   if(this.elapsed>this.noticeUntil)$('notice').hidden=true;
   const visit=(key,condition,text)=>{if(condition&&!this.visited.has(key)){this.visited.add(key);this.toast('ECHO',text);}};
   visit('dash',this.levelIndex===0&&this.player.x>1000&&this.player.y>1000,'IMPULSO atravessa intervalos maiores. Shift ou o botão »; volta a carregar em um segundo.');
   visit('anchor',this.levelIndex===0&&this.player.x>1740&&this.player.y<750&&this.player.y>550,'Grava-te parado sobre a âncora iluminada. Fixa o eco e salta para a grua.');
   visit('sky',this.levelIndex===0&&this.player.x>2380&&this.player.y<550,'Conseguiste subir. A cobertura mais alta esconde uma memória opcional.');
   if(Math.abs(this.player.x-data.exit.x)<55&&Math.abs(this.player.y-data.exit.y)<40){if(this.recovered.size===3)this.complete();else visit('missing',true,'Ainda faltam '+(3-this.recovered.size)+' fragmentos. Procura os sinais de luz no percurso.');}
   this.uiTick+=dt;if(this.uiTick>.1){this.uiTick=0;this.updateHUD();}
  }
  cleanup(){this.control.clear();for(const off of this.domHandlers||[])off();this.scale.off('resize',this.resize,this);if(this.soundBus.context)this.soundBus.context.close().catch(()=>{});}
 }
 window.OriginPilotSound=PilotSound;window.OriginPilotInput=PilotInput;window.OriginPilotScene=OriginScene;
 if(window.ORIGIN_PILOT_NO_BOOT)return;
 window.addEventListener('error',()=>{if($('beginPilot').disabled){$('startCard').hidden=true;$('loadError').hidden=false;}},{once:true});
 try{window.originPilotGame=new Phaser.Game({type:Phaser.AUTO,parent:'gameMount',width:960,height:540,backgroundColor:'#193547',antialias:true,roundPixels:false,banner:false,physics:{default:'arcade',arcade:{gravity:{y:1700},fixedStep:true,fps:60}},scale:{mode:Phaser.Scale.RESIZE,autoCenter:Phaser.Scale.CENTER_BOTH},scene:[OriginScene],audio:{noAudio:true},render:{powerPreference:'low-power'}});}catch(error){$('startCard').hidden=true;$('loadError').hidden=false;console.error(error);}
})();
