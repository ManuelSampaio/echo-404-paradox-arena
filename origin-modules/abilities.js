/* ECHO//404: abilities system. */
(()=>{window.OriginModules ||= {};window.OriginModules.abilities={
  abilityHelp(){const data=this.data,feel=OriginFeel,{clamp,pose,groundedAt,rank,save}=OriginPilot,$=id=>document.getElementById(id);const c=this.ability.config;return c.description+(c.duration?' Proteção de '+c.duration.toFixed(1)+' s.':'')+' Recarga de '+c.cooldown+' s.';},
  abilityContext(){const data=this.data,feel=OriginFeel,{clamp,pose,groundedAt,rank,save}=OriginPilot,$=id=>document.getElementById(id);const b=this.player.body;return {grounded:!!(b.blocked.down||b.touching.down)&&b.velocity.y>=Math.min(0,this.lift?.body?.velocity.y||0)-1,hasEcho:!!this.echo,recording:!!this.capture};},
  useAbility(){const data=this.data,feel=OriginFeel,{clamp,pose,groundedAt,rank,save}=OriginPilot,$=id=>document.getElementById(id);
   if(!this.running||this.pausedByUser||this.finished||this.training&&this.trainingStep!==5)return false;
   if(!this.ability.use(this.abilityContext()))return false;if(!this.pure&&window.OriginSession)this.ability.cooldown*=1-OriginSession.economy(localStorage).tier*.02;
   if(this.operator==='axiom'){this.soundBus.play('checkpoint');this.spark(this.player.x,this.player.y-35,0x77f5df,12);this.toast('AXIOM','Escudo de fase ativo durante '+this.ability.config.duration.toFixed(1)+' s.');}
   else if(this.operator==='nyra'){this.dashTime=0;this.player.body.setAllowGravity(true);this.player.setVelocityY(-this.ability.config.jumpSpeed);this.jumpStyle='ability';this.jumpBuffer=0;this.coyote=0;this.soundBus.play('jump-high');this.spark(this.player.x,this.player.y,0xdca0ff,12);}
   else{if(this.extraEcho)this.extraEcho.sprite.destroy();this.extraEcho={...this.echo,sprite:this.echoSprite,point:this.echoPoint};this.extraEcho.sprite.setTint(0xffc578);this.echo=null;this.echoSprite=null;this.echoPoint=null;this.toggleEcho();this.toast('KAI-7','O primeiro eco continua. Grava outro percurso e toca em ECO para fixar o segundo.');}
   this.updateAbilityHUD();return true;
  },
  updateAbilityHUD(){const data=this.data,feel=OriginFeel,{clamp,pose,groundedAt,rank,save}=OriginPilot,$=id=>document.getElementById(id);
   if(!this.ability||!this.player)return;const a=this.ability,c=a.config,context=this.abilityContext(),ready=a.ready(context),button=$('operatorAbility');
   button.disabled=!this.running||this.pausedByUser||this.finished||this.training&&this.trainingStep!==5||!ready;
   button.querySelector('span').textContent=c.icon;button.querySelector('small').textContent=a.cooldown>0?(Math.ceil(a.cooldown*10)/10).toFixed(1)+'s':!this.running?c.name:this.operator==='nyra'&&context.grounded?'NO AR':this.operator==='nyra'&&a.airUsed?'ATERRA':this.operator==='kai7'&&context.recording?'FIXA ECO':this.operator==='kai7'&&!context.hasEcho?'1.º ECO':c.name;
   button.classList.toggle('ability-active',a.active>0);button.title=this.abilityHelp();
   $('abilityHUD').textContent=c.icon+' '+(a.active>0?a.active.toFixed(1)+'s':a.cooldown>0?Math.ceil(a.cooldown)+'s':c.name);$('abilityHUD').classList.toggle('ability-active',a.active>0);$('abilityHUD').setAttribute('aria-label',c.label+(a.active>0?' ativo':a.cooldown>0?': recarga '+Math.ceil(a.cooldown)+' segundos':': pronto'));
  },
  drawAbility(){const data=this.data,feel=OriginFeel,{clamp,pose,groundedAt,rank,save}=OriginPilot,$=id=>document.getElementById(id);
   const g=this.abilityGraphics;g.clear();if(this.ability.active<=0)return;g.fillStyle(0x77f5df,.09);g.fillEllipse(this.player.x,this.player.y-34,76,96);g.lineStyle(2,0x77f5df,.85);g.strokeEllipse(this.player.x,this.player.y-34,76,96);
  }
};})();
