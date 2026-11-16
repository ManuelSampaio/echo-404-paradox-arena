/* ECHO//404: training system. */
(()=>{window.OriginModules ||= {};window.OriginModules.training={
  startTraining(){const data=this.data,feel=OriginFeel,{clamp,pose,groundedAt,rank,save}=OriginPilot,$=id=>document.getElementById(id);
   if(this.running||this.finished)return;this.training=true;this.trainingStep=0;this.trainingDistance={left:0,right:0};this.trainingLastX=160;this.trainingPeak=1320;this.lastJumpStyle=null;this.clearInput();this.running=true;this.physics.resume();this.soundBus.unlock();
   $('startCard').hidden=true;$('trainingPanel').hidden=false;$('trainingMission').hidden=true;$('notice').hidden=true;
   this.solids.children.each(o=>{o.setVisible(false);o.body.enable=false;});this.lift.setVisible(false);this.lift.body.enable=false;
   for(const e of this.enemies)e.sprite.setVisible(false);for(const f of this.fragments){f.image.setVisible(false);f.halo.setVisible(false);}for(const f of this.secretItems)f.image.setVisible(false);
   this.trainingFloor=this.add.tileSprite(490,1360,980,80,'platform');this.physics.add.existing(this.trainingFloor,true);this.trainingCollider=this.physics.add.collider(this.player,this.trainingFloor);
   this.trainingMark=this.add.text(100,1200,'SIMULAÇÃO / SEM PERDER VIDAS',{fontFamily:'monospace',fontSize:'18px',color:'#73f4df'});
   this.physics.world.setBounds(0,900,980,700);this.cameras.main.setBounds(0,900,980,660);this.player.body.reset(160,1318);this.player.setVelocity(0,0);this.trainingPrompt();$('pilotStage').focus({preventScroll:true});
  },
  trainingPrompt(){const data=this.data,feel=OriginFeel,{clamp,pose,groundedAt,rank,save}=OriginPilot,$=id=>document.getElementById(id);
   const steps=[['ESQUERDA E DIREITA','Segura ← para andar para a esquerda e → para a direita. Experimenta os dois lados.',['left','right']],['SALTO CURTO','CURTO faz um salto baixo. Um toque basta; manter o botão aumenta um pouco a altura. Experimenta e aterra.',['shortJump']],['SALTO ALTO','ALTO sobe mais. Toca para um salto alto ou mantém pressionado para a altura máxima. Podes andar e saltar ao mesmo tempo.',['fullJump']],['IMPULSO','Toca em IMPULSO para avançar rapidamente. A contagem no botão mostra quando podes voltar a usar.',['dash']],['O TEU ECO','Toca em ECO, grava durante meio segundo ou mais e toca de novo para FIXAR. O teu holograma repete o percurso e fica na posição final.',['echo']],['A TUA HABILIDADE',this.abilityHelp()+' Usa o botão '+this.ability.config.name+'.',this.operator==='nyra'?['fullJump','ability']:this.operator==='kai7'?['ability','echo']:['ability']],['PRONTO PARA A ORIGIN','Aprendeste os controlos. Na missão, recolhe 3 fragmentos, fixa um eco na âncora da grua e sobe até à evacuação.',[]]];
   const [title,text,keys]=steps[this.trainingStep];$('trainingCount').textContent=this.trainingStep<6?'TREINO '+(this.trainingStep+1)+' / 6 · SEM PERDER VIDAS':'SIMULAÇÃO CONCLUÍDA';$('trainingTitle').textContent=title;$('trainingText').textContent=text;$('trainingMission').hidden=this.trainingStep!==6;
   for(const b of document.querySelectorAll('.pilot-controls button'))b.classList.toggle('training-target',keys.includes(b.dataset.action||b.dataset.hold));
   $('objective').textContent='SIMULAÇÃO · '+title;
  },
  trainingAdvance(){const data=this.data,feel=OriginFeel,{clamp,pose,groundedAt,rank,save}=OriginPilot,$=id=>document.getElementById(id);this.trainingStep++;this.clearInput();this.lastJumpStyle=null;this.trainingPeak=1320;this.trainingPrompt();},
  trainingUpdate(dt){const data=this.data,feel=OriginFeel,{clamp,pose,groundedAt,rank,save}=OriginPilot,$=id=>document.getElementById(id);
   const oldX=this.trainingLastX??this.player.x;this.move(dt);this.updateEcho(dt);this.updateLift(dt);const dx=this.player.x-oldX;this.trainingLastX=this.player.x;$('notice').hidden=true;
   if(this.trainingStep===0){if(this.control.down('left'))this.trainingDistance.left+=Math.max(0,-dx);if(this.control.down('right'))this.trainingDistance.right+=Math.max(0,dx);if(this.trainingDistance.left>35&&this.trainingDistance.right>35)this.trainingAdvance();}
   else if(this.trainingStep===1||this.trainingStep===2){this.trainingPeak=Math.min(this.trainingPeak,this.player.y);const expected=this.trainingStep===1?'short':'full';if(this.lastJumpStyle===expected&&1320-this.trainingPeak>(expected==='short'?30:95)&&this.player.body.blocked.down)this.trainingAdvance();}
   else if(this.trainingStep===3&&this.dashTime>0)this.trainingAdvance();
   else if(this.trainingStep===4&&this.echo){this.trainingAbilityUses=this.ability.uses;this.trainingAdvance();}
   else if(this.trainingStep===5&&this.ability.uses>this.trainingAbilityUses&&(this.operator!=='kai7'||this.extraEcho&&this.echo))this.trainingAdvance();
   if(this.player.y>1550){this.player.body.reset(160,1318);this.player.setVelocity(0,0);this.clearInput();}
   $('vitals').textContent='TREINO';$('clock').textContent='—';$('fragmentCount').textContent=(Math.min(this.trainingStep,6))+'/6';
   const dash=document.querySelector('[data-action="dash"]');dash.disabled=this.dashCooldown>0;dash.querySelector('small').textContent=this.dashCooldown>0?this.dashCooldown.toFixed(1)+'s':'IMPULSO';
  },
  finishTraining(){const data=this.data,feel=OriginFeel,{clamp,pose,groundedAt,rank,save}=OriginPilot,$=id=>document.getElementById(id);
   if(!this.training||this.trainingStep!==6)return;this.training=false;this.trainingCompleted=true;try{localStorage.setItem('echo404_origin_training_v14','true');}catch(_){}this.running=false;this.pausedByUser=false;$('pauseCard').hidden=true;this.trainingCollider.destroy();this.trainingFloor.destroy();this.trainingMark.destroy();
   this.solids.children.each(o=>{o.setVisible(true);o.body.enable=true;});this.lift.setVisible(true);this.lift.body.enable=true;for(const e of this.enemies)e.sprite.setVisible(true);for(const f of this.fragments){f.image.setVisible(true);f.halo.setVisible(true);}for(const f of this.secretItems)f.image.setVisible(true);
   if(this.echoSprite){this.echoSprite.destroy();this.echoSprite=null;}if(this.extraEcho){this.extraEcho.sprite.destroy();this.extraEcho=null;}this.ability=new OriginAbilities.Ability(this.operator);this.maxEchoes=0;this.abilityGraphics.clear();for(const effect of this.effects)effect.o.destroy();this.effects=[];this.echo=null;this.echoPoint=null;this.echoUsed=false;this.capture=null;this.captureTime=0;this.captureAccumulator=0;this.dashTime=0;this.dashCooldown=0;this.jumpBuffer=0;this.coyote=0;this.jumpStyle='variable';this.elapsed=0;this.invincible=0;
   this.physics.world.setBounds(0,-200,data.width,data.height+500);this.cameras.main.setBounds(0,0,data.width,data.height);this.player.body.reset(data.spawn.x,data.spawn.y);this.player.setVelocity(0,0);this.player.body.setAllowGravity(true);$('trainingPanel').hidden=true;$('echoMeter').hidden=true;
   for(const b of document.querySelectorAll('.pilot-controls button'))b.classList.remove('training-target');this.begin();this.updateHUD();
  }
};})();
