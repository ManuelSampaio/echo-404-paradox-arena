/* ECHO//404: echoes system. */
(()=>{window.OriginModules ||= {};window.OriginModules.echoes={
  toggleEcho(){const data=this.data,feel=OriginFeel,{clamp,pose,groundedAt,rank,save}=OriginPilot,$=id=>document.getElementById(id);
   if(this.capture){
    if(this.captureTime<.5||this.capture.length<15){this.toast('ECHO','Grava pelo menos meio segundo antes de fixar o eco.');return;}
    if(this.echoSprite)this.echoSprite.destroy();this.echo={frames:this.capture,time:0};this.echoUsed=true;this.maxEchoes=Math.max(this.maxEchoes,this.extraEcho?2:1);this.echoSprite=this.add.sprite(this.capture[0].x,this.capture[0].y,'operator-'+this.operator,0).setOrigin(.5,1).setTint(0x92e8e4).setAlpha(.5).setDepth(13);
    this.capture=null;$('echoMeter').hidden=true;this.soundBus.play('echo-fix');this.toast('ECHO','Eco fixado. Ele repete o percurso e mantém a posição final.');
   }else{this.soundBus.play('echo-start');this.capture=[];this.captureTime=0;this.captureAccumulator=0;$('echoMeter').hidden=false;this.toast('ECHO','A gravar. Toca em ECO outra vez para fixar a tua posição.');}
  },
  updateEcho(dt){const data=this.data,feel=OriginFeel,{clamp,pose,groundedAt,rank,save}=OriginPilot,$=id=>document.getElementById(id);
   if(this.control.take('echo'))this.toggleEcho();
   if(this.capture){this.captureTime+=dt;this.captureAccumulator+=dt;if(this.captureAccumulator>=1/30){this.captureAccumulator=0;this.capture.push({t:this.captureTime,x:this.player.x,y:this.player.y,flip:this.player.flipX,frame:Number(this.player.frame.name)||0});}
    $('echoMeter').querySelector('span').style.transform='scaleX('+Math.min(1,this.captureTime/5)+')';if(this.captureTime>=5)this.toggleEcho();}
   if(this.echo){this.echo.time+=dt;const point=pose(this.echo.frames,this.echo.time);this.echoSprite.setPosition(point.x,point.y).setFlipX(point.flip).setFrame(point.frame);this.echoPoint=point;}
   if(!this.reducedEffects){this.trailTick=(this.trailTick||0)+dt;if(this.trailTick>.12){this.trailTick=0;for(const p of [this.echoPoint,this.extraEcho?.point])if(p){const o=this.add.rectangle(p.x,p.y-30,4,12,0x77f5df).setDepth(12).setAlpha(.3);this.effects.push({o,vx:0,vy:0,life:.25});}}}
   if(this.extraEcho){this.extraEcho.time+=dt;const point=pose(this.extraEcho.frames,this.extraEcho.time);this.extraEcho.point=point;this.extraEcho.sprite.setPosition(point.x,point.y).setFlipX(point.flip).setFrame(point.frame);}
   this.updateAbilityHUD();$('echoAction').innerHTML=this.capture?'◈<small>FIXAR</small>':this.echo?'◈<small>REGRAVAR</small>':'◈<small>ECO</small>';
  }
};})();
