/* ECHO//404 v14 — a Phaser presentation of deterministic temporal puzzles. */
(() => {
 'use strict';
 const $=id=>document.getElementById(id),D=ParadoxData,C=ParadoxCore;
 if(!window.Phaser){$('pxIntro').hidden=true;$('pxLoadError').hidden=false;return;}
 class Controls{
  constructor(){this.holds=new Map();this.actions=new Set();}
  hold(token,key,down){if(down)this.holds.set(token,key);else this.holds.delete(token);}
  press(action){this.actions.add(action);}
  read(portrait=false){const down=key=>[...this.holds.values()].includes(key);const x=Number(down('right'))-Number(down('left')),y=Number(down('down'))-Number(down('up'));const result={x:portrait?y:x,y:portrait?x:y};for(const action of this.actions)result[action]=true;this.actions.clear();return result;}
  clear(){this.holds.clear();this.actions.clear();}
 }
 class Audio{
  constructor(){this.enabled=true;this.ctx=null;try{this.enabled=localStorage.getItem('echo404_v14_sound')!=='false';}catch(_){} }
  unlock(){try{this.ctx ||= new (window.AudioContext||window.webkitAudioContext)();this.ctx.resume().catch(()=>{});}catch(_){} }
  tone(freq,time=.15,volume=.025,delay=0,type='sine'){if(!this.enabled||!this.ctx)return;const t=this.ctx.currentTime+delay,o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type=type;o.frequency.setValueAtTime(freq,t);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(volume,t+.015);g.gain.exponentialRampToValueAtTime(.0001,t+time);o.connect(g);g.connect(this.ctx.destination);o.start(t);o.stop(t+time+.03);}
  play(event){if(event==='complete')[330,440,660].forEach((f,i)=>this.tone(f,.3,.025,i*.11));else if(event==='rewind'){this.tone(440,.2);this.tone(220,.3,.025,.1);}else if(event==='signal'||event==='portal'){this.tone(370,.16);this.tone(554,.2,.02,.08);}else if(event==='recover')this.tone(90,.15,.025,0,'triangle');else if(event==='phase')this.tone(160,.1,.02,0,'triangle');}
 }
 const storage=()=>{try{return localStorage;}catch(_){return {getItem:()=>null,setItem:()=>{throw Error('unavailable');}};}};
 class EchoScene extends Phaser.Scene{
  constructor(){super('Echo14');}
  preload(){this.load.spritesheet('echo-human','assets/origin/explorer.png',{frameWidth:72,frameHeight:88});this.load.spritesheet('echo-patrols','assets/origin/patrols.png',{frameWidth:64,frameHeight:80});this.load.image('memory-origin','assets/paradox/origin.png');this.load.on('loaderror',()=>{this.assetFailed=true;});}
  create(){
   if(this.assetFailed){$('pxIntro').hidden=true;$('pxLoadError').hidden=false;return;}
   this.controls=new Controls();this.soundBus=new Audio();this.model=null;this.paused=false;this.queuedBegin=false;this.accumulator=0;this.toastTimer=0;this.ghostSprites=[];this.ghostLabels=[];this.lastEchoCount=-1;this.listeners=[];this.tickHUD=0;
   this.background=this.add.image(0,0,'memory-origin').setOrigin(0).setDepth(-10);
   this.staticRoom=this.add.graphics().setDepth(0);this.trails=this.add.graphics().setDepth(1);this.dynamicRoom=this.add.graphics().setDepth(2);
   this.playerShadow=this.add.ellipse(0,0,30,12,0x00161d,.5).setDepth(4);
   this.player=this.add.sprite(0,0,'echo-human',0).setOrigin(.5,.9).setDepth(10);this.roomLabels=[];this.enemySprites=[];
   this.bind();this.scale.on('resize',this.layout,this);
   const params=new URLSearchParams(location.hash.slice(1));let index=D.levels.findIndex(l=>l.id===params.get('nivel'));
   this.challenge=null;const code=params.get('desafio');if(code&&/^E404-\d{8}$/.test(code)){const value=code.slice(5),date=new Date(value.slice(0,4)+'-'+value.slice(4,6)+'-'+value.slice(6,8)+'T12:00:00+01:00');if(Number.isFinite(date.getTime())){this.challenge=C.daily(date);index=this.challenge.index;}}
   this.select(index<0?0:index);this.fillMenu();
   if(!this.loadingScene){$('pxBegin').disabled=false;$('pxBegin').textContent='ENTRAR NO CICLO →';}this.events.once('shutdown',()=>this.cleanup());
  }
  bind(){
   const on=(target,event,fn)=>{target.addEventListener(event,fn);this.listeners.push(()=>target.removeEventListener(event,fn));};
   on($('pxBegin'),'click',()=>this.begin());on($('pxPause'),'click',()=>this.pause(!this.paused));on($('pxResume'),'click',()=>this.pause(false));on($('pxRestart'),'click',()=>{this.select(this.model.index);this.begin();});
   on($('pxHelp'),'click',()=>{this.pause(false);this.toast(this.model.level.hint,9);});
   on($('pxMenu'),'click',()=>this.menu(true));on($('pxCloseMenu'),'click',()=>this.menu(false));
   on($('pxNext'),'click',()=>{this.challenge=null;if(this.model.index<D.levels.length-1){this.select(this.model.index+1);this.begin();}else this.menu(true);});
   on($('pxReplay'),'click',()=>{this.select(this.model.index);this.begin();});on($('pxShare'),'click',()=>this.share());
   on($('pxSound'),'click',()=>{this.soundBus.unlock();this.soundBus.enabled=!this.soundBus.enabled;try{storage().setItem('echo404_v14_sound',String(this.soundBus.enabled));}catch(_){}this.soundButton();});this.soundButton();
   const keys={ArrowUp:'up',w:'up',W:'up',ArrowDown:'down',s:'down',S:'down',ArrowLeft:'left',a:'left',A:'left',ArrowRight:'right',d:'right',D:'right'};
   on(window,'keydown',e=>{if(keys[e.key]){e.preventDefault();this.controls.hold('key:'+e.code,keys[e.key],true);}else if(!e.repeat&&['e','E','Shift',' ','Backspace'].includes(e.key)){e.preventDefault();this.controls.press(e.key===' '?'phase':e.key==='Backspace'?'undo':'rewind');}else if(e.key==='Escape'&&!e.repeat)this.pause(!this.paused);});
   on(window,'keyup',e=>{if(keys[e.key]){e.preventDefault();this.controls.hold('key:'+e.code,keys[e.key],false);}});
   for(const b of document.querySelectorAll('[data-move]')){let pointer=false;on(b,'pointerdown',e=>{pointer=true;e.preventDefault();try{b.setPointerCapture(e.pointerId);}catch(_){}this.controls.hold('pointer:'+e.pointerId,b.dataset.move,true);b.classList.add('pressed');});const release=e=>{this.controls.hold('pointer:'+e.pointerId,b.dataset.move,false);b.classList.remove('pressed');};on(b,'pointerup',release);on(b,'pointercancel',e=>{release(e);pointer=false;});on(b,'lostpointercapture',release);on(b,'click',()=>{if(pointer){pointer=false;return;}const key='tap:'+b.dataset.move;this.controls.hold(key,b.dataset.move,true);this.time.delayedCall(160,()=>this.controls.hold(key,b.dataset.move,false));});}
   for(const [id,action]of [['pxRewind','rewind'],['pxUndo','undo'],['pxPhase','phase']])on($(id),'click',()=>{if(this.model?.active&&!this.paused)this.controls.press(action);});
   on(window,'blur',()=>{this.controls.clear();if(this.model?.active&&!this.model.done)this.pause(true);});on(document,'visibilitychange',()=>{if(document.hidden&&this.model?.active&&!this.model.done)this.pause(true);});
  }
  soundButton(){$('pxSound').textContent=this.soundBus.enabled?'SOM ●':'SOM ○';$('pxSound').setAttribute('aria-pressed',String(this.soundBus.enabled));}
  select(index){
   this.controls.clear();$('pxToast').hidden=true;this.toastTimer=0;this.loadToken=(this.loadToken||0)+1;this.model=C.make(index);this.paused=false;this.queuedBegin=false;this.accumulator=0;this.lastEchoCount=-1;const texture='memory-'+this.model.level.id;this.loadingScene=!this.textures.exists(texture);if(!this.loadingScene)this.background.setTexture(texture);this.clearGhosts();
   for(const id of ['pxPauseCard','pxResult','pxSelection'])$(id).hidden=true;$('pxIntro').hidden=false;
   const l=this.model.level;$('introPlace').textContent=(index+1).toString().padStart(2,'0')+' / '+l.region;$('introTitle').textContent=l.title.toUpperCase();$('introStory').textContent=l.story;$('introHint').textContent=l.hint;
   $('locationName').textContent=(this.challenge?'DESAFIO / ':'')+l.place;$('pxPause').textContent='Ⅱ';$('pxStage').setAttribute('aria-label','Puzzle temporal: '+l.title);
   this.layout();this.hud();this.renderState(0);
   if(this.loadingScene){const token=this.loadToken;$('pxBegin').disabled=true;$('pxBegin').textContent='A LIGAR A ARENA…';this.load.image(texture,'assets/paradox/'+l.id+'.png');this.load.once('complete',()=>{if(token!==this.loadToken)return;if(!this.textures.exists(texture)){$('pxIntro').hidden=true;$('pxLoadError').hidden=false;return;}this.loadingScene=false;this.background.setTexture(texture);this.layout();$('pxBegin').disabled=false;$('pxBegin').textContent='ENTRAR NO CICLO →';this.loadedThemes=(this.loadedThemes||[]).filter(key=>key!==texture).concat(texture);while(this.loadedThemes.length>3){const old=this.loadedThemes.shift();if(old!=='memory-origin')this.textures.remove(old);}if(this.queuedBegin){this.queuedBegin=false;this.begin();}});this.load.start();}
   else{$('pxBegin').disabled=false;$('pxBegin').textContent='ENTRAR NO CICLO →';}

  }
  begin(){if(this.loadingScene){this.queuedBegin=true;return;}if(this.model.done)return;this.model.active=true;this.paused=false;this.controls.clear();this.soundBus.unlock();$('pxIntro').hidden=true;$('pxPauseCard').hidden=true;$('pxSelection').hidden=true;$('pxPause').textContent='Ⅱ';this.toast(this.model.index===0?'Move-te até A, fica no sensor e toca em ECO. O teu passado vai repetir esse percurso.':this.model.level.hint,8);$('pxStage').focus({preventScroll:true});}
  pause(value){if(!this.model?.active||this.model.done)return;this.paused=value;this.controls.clear();$('pxPauseCard').hidden=!value;$('pxPause').textContent=value?'▶':'Ⅱ';}
  menu(show){if(!this.model)return;this.controls.clear();if(show){this.menuWasPaused=this.paused;this.paused=true;this.fillMenu();$('pxSelection').hidden=false;$('pxPauseCard').hidden=true;}else{$('pxSelection').hidden=true;this.paused=this.model.done?true:!!this.menuWasPaused;}}
  fillMenu(){const p=C.load(storage()),list=$('signalList');list.replaceChildren();D.levels.forEach((l,index)=>{const button=document.createElement('button'),title=document.createElement('b'),detail=document.createElement('small');title.textContent=(index+1).toString().padStart(2,'0')+' / '+l.place;const saved=p.levels[l.id];detail.textContent=saved&&['OURO','PRATA','BRONZE'].includes(saved.medal)?'MEDALHA '+saved.medal+' · '+Number(saved.bestTime||0).toFixed(1)+'s':l.title;button.style.setProperty('--place',l.color);button.append(title,detail);button.addEventListener('click',()=>{this.challenge=null;this.select(index);this.begin();});list.append(button);});}
  layout(){if(!this.model)return;this.portrait=this.scale.height>this.scale.width*1.12;const w=this.portrait?D.height:D.width,h=this.portrait?D.width:D.height;this.unit=Math.min(this.scale.width/w,this.scale.height/h);this.ox=(this.scale.width-w*this.unit)/2;this.oy=(this.scale.height-h*this.unit)/2;this.background.setPosition(this.ox,this.oy).setDisplaySize(w*this.unit,h*this.unit);this.player.setDisplaySize(49*this.unit,60*this.unit);this.playerShadow.setDisplaySize(27*this.unit,10*this.unit);this.paintStatic();this.paintTrails();}
  point(p){return {x:this.ox+(this.portrait?p.y:p.x)*this.unit,y:this.oy+(this.portrait?p.x:p.y)*this.unit};}
  rectangle(r){const p=this.point(r);return {...p,w:(this.portrait?r.h:r.w)*this.unit,h:(this.portrait?r.w:r.h)*this.unit};}
  color(hex){return Phaser.Display.Color.HexStringToColor(hex).color;}
  box(g,r,color,alpha=1){const q=this.rectangle(r);g.fillStyle(color,alpha);g.fillRect(q.x,q.y,q.w,q.h);}
  paintStatic(){
   for(const sprite of this.enemySprites)if(sprite)sprite.destroy();this.enemySprites=[];for(const enemy of this.model.enemies){this.enemySprites.push(enemy.kind==='drone'?null:this.add.sprite(0,0,'echo-patrols',enemy.kind==='sentinel'?4:0).setOrigin(.5,.78).setDepth(6));}
   for(const label of this.roomLabels)label.destroy();this.roomLabels=[];const g=this.staticRoom;g.clear();const l=this.model.level,u=this.unit,col=this.color(l.color),base=this.color(l.ground);
   for(let y=1;y<10;y++)for(let x=1;x<15;x++){this.box(g,{x:x*D.T+1,y:y*D.T+1,w:D.T-2,h:D.T-2},base,.56);const p=this.point({x:(x+.5)*D.T,y:(y+.5)*D.T});g.fillStyle(col,.12);g.fillCircle(p.x,p.y,1*u);}
   for(const r of [{x:0,y:0,w:D.width,h:D.T},{x:0,y:D.height-D.T,w:D.width,h:D.T},{x:0,y:D.T,w:D.T,h:D.height-2*D.T},{x:D.width-D.T,y:D.T,w:D.T,h:D.height-2*D.T},...l.walls]){
    const q=this.rectangle(r);g.fillStyle(0x04141e,.75);g.fillRect(q.x,q.y+5*u,q.w,q.h);g.fillStyle(base,.95);g.fillRect(q.x+u,q.y+u,q.w-2*u,q.h-2*u);g.lineStyle(1.5*u,col,.38);g.strokeRect(q.x+3*u,q.y+3*u,q.w-6*u,q.h-6*u);
    if(l.theme==='falls'&&r.w>=3*D.T&&r.x===7*D.T){g.lineStyle(2*u,0xa4dfce,.35);for(let i=0;i<8;i++){const p=this.point({x:r.x+10+i*18,y:r.y+5}),p2=this.point({x:r.x+10+i*18,y:r.y+r.h-5});g.lineBetween(p.x,p.y,p2.x,p2.y);}}
   }
   for(const p of l.plates){const at=this.point(p),text=this.add.text(at.x,at.y-33*u,p.id,{fontFamily:'system-ui',fontStyle:'bold',fontSize:Math.max(9,12*u)+'px',color:l.color}).setOrigin(.5).setDepth(3);this.roomLabels.push(text);}
   const spawn=this.point(l.spawn);g.lineStyle(1.5*u,col,.5);g.strokeCircle(spawn.x,spawn.y,22*u);
  }
  paintTrails(){const g=this.trails;g.clear();if(!this.model)return;const colors=[0x8de1d8,0xc9b4ee,0xedbd83];this.model.echoes.forEach((trace,index)=>{g.lineStyle(2*this.unit,colors[index],.15);for(let i=1;i<trace.length;i++){if(trace[i].warp)continue;const a=this.point(trace[i-1]),b=this.point(trace[i]);g.lineBetween(a.x,a.y,b.x,b.y);}});}
  clearGhosts(){for(const s of this.ghostSprites)s.destroy();for(const l of this.ghostLabels)l.destroy();this.ghostSprites=[];this.ghostLabels=[];}
  renderState(time){
   const s=this.model,g=this.dynamicRoom,u=this.unit,l=s.level,col=this.color(l.color);g.clear();
   if(this.lastEchoCount!==s.echoes.length){this.lastEchoCount=s.echoes.length;this.clearGhosts();for(let i=0;i<s.echoes.length;i++){this.ghostSprites.push(this.add.sprite(0,0,'echo-human',0).setOrigin(.5,.9).setTint([0x8de1d8,0xc9b4ee,0xedbd83][i]).setAlpha(.52).setDepth(7));this.ghostLabels.push(this.add.text(0,0,'E'+(i+1),{fontFamily:'system-ui',fontSize:'9px',color:'#e7edcf'}).setOrigin(.5).setDepth(8));}this.paintTrails();}
   for(const gate of s.gates){const q=this.rectangle(gate);g.fillStyle(gate.open?0x9cd6b5:0xe59b83,gate.open?.16:.7);g.fillRect(q.x+2*u,q.y+2*u,q.w-4*u,q.h-4*u);g.lineStyle(2*u,gate.open?0xb9f1c9:0xe9b4a0,.9);g.strokeRect(q.x+5*u,q.y+5*u,q.w-10*u,q.h-10*u);if(gate.pulse&&!gate.open){g.lineStyle(u,0xf2d49d,.4);g.lineBetween(q.x,q.y,q.x+q.w,q.y+q.h);}}
   for(const p of l.plates){const at=this.point(p),on=s.plates[p.id];g.fillStyle(on?0xdceaac:col,on?.6:.12);g.fillCircle(at.x,at.y,20*u);g.lineStyle(2*u,on?0xe7f2ba:col,.9);g.strokeCircle(at.x,at.y,20*u);g.lineStyle(u,col,.5);g.strokeCircle(at.x,at.y,25*u);if(on){g.fillStyle(0xf2efb8,.9);g.fillCircle(at.x,at.y,4*u);}}
   if(l.portals)for(const portal of l.portals){const p=this.point(portal),on=(l.portalPlates||[l.portalPlate]).every(id=>s.plates[id]);g.lineStyle(4*u,on?0xc0acec:0x637f88,on?.9:.4);g.strokeEllipse(p.x,p.y,35*u,(44+Math.sin(time*3)*4)*u);g.lineStyle(u,0xd9cdf4,.7);g.strokeEllipse(p.x,p.y,24*u,33*u);}
   for(const h of l.hazards){const q=this.rectangle(h),active=C.pulseOn({period:h.period,start:h.start,end:h.end},s.t),warning=C.pulseOn({period:h.period,start:h.start-.8,end:h.start},s.t);g.fillStyle(active?0xf0a793:0xe7cd91,active?.9:warning?.45:.13);g.fillRect(q.x,q.y,q.w,q.h);}
   if(l.scanner){const source=this.point(l.scanner);g.fillStyle(0x728b98);g.fillCircle(source.x,source.y,16*u);g.fillStyle(0xf1a48c);g.fillCircle(source.x,source.y,5*u);if(s.scan){const target=this.point(s.scan),firing=s.t%l.scanner.period>=l.scanner.start;g.lineStyle((firing?5:1.5)*u,firing?0xef9b87:0xf0d29a,firing?.8:.45);g.lineBetween(source.x,source.y,target.x,target.y);g.lineStyle(u,0xf4d9ae,.8);g.strokeCircle(target.x,target.y,15*u);}}
   this.model.enemies.forEach((enemy,index)=>{const p=this.point(enemy),sprite=this.enemySprites[index],alert=enemy.state==='chase',shade=alert?0xf2a18b:0x95c6cd;
    if(sprite){sprite.setPosition(p.x,p.y).setDisplaySize(42*u,52*u).setFrame((enemy.kind==='sentinel'?4:0)+Math.floor(time*7)%4);if(enemy.lastSeen.x!==enemy.x)sprite.setFlipX(enemy.lastSeen.x<enemy.x);}
    else{g.fillStyle(0x304d61,.95);g.fillEllipse(p.x,p.y-8*u,33*u,19*u);g.lineStyle(2*u,shade,.9);g.strokeEllipse(p.x,p.y-8*u,33*u,19*u);g.lineBetween(p.x-23*u,p.y-20*u,p.x-8*u,p.y-20*u);g.lineBetween(p.x+8*u,p.y-20*u,p.x+23*u,p.y-20*u);g.fillStyle(0xf0a18c);g.fillCircle(p.x,p.y-8*u,4*u);}
    if(enemy.alert>.05){g.fillStyle(0x09222d,.8);g.fillRect(p.x-16*u,p.y-43*u,32*u,3*u);g.fillStyle(shade,.9);g.fillRect(p.x-16*u,p.y-43*u,32*u*enemy.alert,3*u);}
    if(enemy.target){const t=this.point(enemy.target);g.lineStyle(1.5*u,0xf4ca99,.65);g.lineBetween(p.x,p.y-7*u,t.x,t.y);g.strokeCircle(t.x,t.y,11*u);}
   });
   for(const shot of s.shots){const p=this.point(shot);g.fillStyle(0xffba93,.95);g.fillCircle(p.x,p.y,4*u);}
   const exit=this.point(l.exit),powered=l.goal.every(id=>s.plates[id])&&(!l.sequence||s.sequenceLatched);g.fillStyle(powered?0xe9d596:0x77918c,.15);g.fillCircle(exit.x,exit.y,28*u);g.lineStyle(3*u,powered?0xe9d596:0x77918c,.95);g.strokeCircle(exit.x,exit.y,22*u);g.lineStyle(1.5*u,powered?0xf1e4b8:0x8ca197,.8);g.strokeRect(exit.x-9*u,exit.y-10*u,18*u,20*u);
   const p=this.point(s.player);this.player.setPosition(p.x,p.y).setDisplaySize(49*u,60*u);this.playerShadow.setPosition(p.x,p.y+3*u).setDisplaySize(27*u,10*u);
   const dx=this.portrait?s.player.dy:s.player.dx;if(Math.abs(dx)>.1)this.player.setFlipX(dx<0);this.player.setFrame(s.player.moving?4+Math.floor(time*13)%8:Math.floor(time*3)%4);this.player.setAlpha(s.phase>0?.5:1);if(s.phase>0){g.lineStyle(2*u,0xf5e5ae,.8);g.strokeCircle(p.x,p.y-13*u,27*u);}
   s.ghosts.forEach((ghost,i)=>{const p=this.point(ghost),sprite=this.ghostSprites[i];if(!sprite)return;const dx=this.portrait?ghost.dy:ghost.dx;sprite.setPosition(p.x,p.y).setDisplaySize(49*u,60*u).setFrame(ghost.moving?4+Math.floor(s.t*13)%8:0);if(Math.abs(dx)>.1)sprite.setFlipX(dx<0);this.ghostLabels[i].setPosition(p.x,p.y-58*u).setFontSize(Math.max(8,10*u));});
  }
  toast(message,seconds=5){$('pxToast').textContent=message;$('pxToast').hidden=false;this.toastTimer=seconds;}
  hud(){const s=this.model,remaining=Math.max(0,s.level.duration-s.t);$('pxTime').textContent=remaining.toFixed(1)+'s';$('pxEchoes').textContent='ECOS '+s.echoes.length+'/3';$('cycleBar').style.transform='scaleX('+(remaining/s.level.duration)+')';$('pxUndo').disabled=s.echoes.length===0||s.done;$('pxPhase').disabled=s.phaseCooldown>0||s.done;$('pxPhase').querySelector('small').textContent=s.phaseCooldown>0?s.phaseCooldown.toFixed(1)+'s':'FASE';$('pxRewind').disabled=s.done;$('pxObjective').textContent=s.level.sequence?'ARQUIVO '+s.sequence+'/'+s.level.sequence.length+' · '+s.level.sequence.join(' → '):s.level.portals?'ECOS → PORTAL → SAÍDA':s.level.gates.some(g=>g.pulse)?'SENSOR A → PULSO VERDE → SAÍDA':s.level.goal.length?'ECOS EM '+s.level.goal.join(' + ')+' → SAÍDA':s.level.plates.length>1?s.level.plates.length+' ECOS → '+s.level.plates.length+' SENSORES → SAÍDA':'SENSOR A → ECO → SAÍDA';$('pxFootHint').textContent=(s.index+1)+'/25 · TENTATIVA '+s.attempts+' · '+s.level.title.toUpperCase();}
  completed(){const s=this.model,stored=C.save(storage(),s);$('resultPlace').textContent=s.level.place+' / SINAL RESTAURADO';$('resultTitle').textContent=s.index===D.levels.length-1?'A MEMÓRIA FICOU.':'O PASSADO ABRIU CAMINHO.';$('pxAward').textContent='MEDALHA '+C.medal(s);$('pxStats').textContent=s.total.toFixed(1)+'s · '+s.echoes.length+' eco'+(s.echoes.length===1?'':'s')+' · '+s.deaths+' falhas';$('pxMemory').textContent=s.level.memory;$('pxSaveError').hidden=stored;$('pxNext').textContent=s.index===D.levels.length-1?'AS 25 ARENAS →':'PRÓXIMO SINAL →';$('pxResult').hidden=false;$('pxToast').hidden=true;this.controls.clear();this.hud();this.fillMenu();$('pxNext').focus({preventScroll:true});}
  async share(){const s=this.model,challenge=this.challenge,url=new URL('paradox.html',location.href);url.hash=challenge?'desafio='+challenge.code:'nivel='+s.level.id;const text='ECHO//404 · '+s.level.place+'\n'+s.total.toFixed(1)+'s · '+s.echoes.length+' ecos. O teu passado joga contigo.\n'+url.href;try{await navigator.clipboard.writeText(text);$('pxShare').textContent='COPIADO ✓';}catch(_){$('pxShare').textContent=challenge?challenge.code:'COPIA A LIGAÇÃO DA PÁGINA';} }
  update(_,delta){if(!this.model)return;const real=Math.min(delta/1000,.1);if(this.model.active&&!this.paused&&!this.model.done){this.accumulator+=real;let input=this.controls.read(this.portrait),steps=0;while(this.accumulator>=1/60&&steps<6){C.step(this.model,input,1/60);for(const event of this.model.events){this.soundBus.play(event.type);if(event.type==='message')this.toast(event.text,6);else if(event.type==='rewind'||event.type==='recover'){this.paintTrails();if(event.type==='recover'&&this.model.deaths>=3)this.toast(this.model.level.hint,9);}else if(event.type==='complete')this.completed();}input={x:input.x,y:input.y};this.accumulator-=1/60;steps++;if(this.model.done)break;}if(steps===0)for(const key of ['rewind','undo','phase'])if(input[key])this.controls.press(key);this.toastTimer-=real;if(this.toastTimer<=0)$('pxToast').hidden=true;}this.renderState(this.model.total);this.tickHUD+=real;if(this.tickHUD>.1){this.hud();this.tickHUD=0;}}
  cleanup(){for(const off of this.listeners)off();this.scale.off('resize',this.layout,this);this.controls.clear();if(this.soundBus.ctx)this.soundBus.ctx.close().catch(()=>{});}
 }
 window.ParadoxControls=Controls;window.ParadoxScene=EchoScene;if(window.PARADOX_NO_BOOT)return;
 window.addEventListener('error',()=>{if($('pxBegin').disabled){$('pxIntro').hidden=true;$('pxLoadError').hidden=false;}},{once:true});
 try{window.echo14=new Phaser.Game({type:Phaser.AUTO,parent:'pxMount',width:896,height:616,banner:false,backgroundColor:'#0c2029',scale:{mode:Phaser.Scale.RESIZE,autoCenter:Phaser.Scale.CENTER_BOTH},scene:[EchoScene],audio:{noAudio:true},render:{powerPreference:'low-power',antialias:true}});}catch(error){$('pxIntro').hidden=true;$('pxLoadError').hidden=false;console.error(error);}
})();
