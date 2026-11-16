/* ECHO//404: movement system. */
(()=>{window.OriginModules ||= {};window.OriginModules.movement={
  move(dt){const data=this.data,feel=OriginFeel,{clamp,pose,groundedAt,rank,save}=OriginPilot,$=id=>document.getElementById(id);
   const p=this.player,b=p.body,grounded=b.blocked.down||b.touching.down;
   this.coyote=grounded ? feel.coyote :Math.max(0,this.coyote-dt);this.jumpBuffer=Math.max(0,this.jumpBuffer-dt);
   if(this.control.take('jump')){this.jumpBuffer=feel.jumpBuffer;this.jumpStyle='variable';}if(this.control.take('shortJump')){this.jumpBuffer=feel.jumpBuffer;this.jumpStyle='short';}if(this.control.take('fullJump')){this.jumpBuffer=feel.jumpBuffer;this.jumpStyle='full';}
   if(this.jumpBuffer>0&&this.coyote>0&&this.dashTime<=0){p.setVelocityY(this.jumpStyle==='short'?-feel.jumps.shortSpeed:-feel.jumps.highSpeed);this.jumpAge=0;this.touchJumpReleased=false;this.lastJumpStyle=this.jumpStyle;this.jumpBuffer=0;this.coyote=0;this.soundBus.play(this.jumpStyle==='short'?'jump-short':'jump-high');this.spark(p.x,p.y,0xb3cbb8,4);}
   if(this.control.releasedJump){if(this.jumpStyle==='variable'&&b.velocity.y<-260)p.setVelocityY(b.velocity.y*feel.jumps.keyboardReleaseFactor);this.control.releasedJump=false;}
   this.jumpAge+=dt;if(['short','full'].includes(this.jumpStyle)&&!this.touchJumpReleased){const short=this.jumpStyle==='short',held=this.control.down(short?'shortJump':'fullJump'),minimum=short?feel.jumps.shortMinHold:feel.jumps.highMinHold;if(!held&&this.jumpAge>=minimum){if(b.velocity.y<-150)p.setVelocityY(b.velocity.y*feel.jumps.touchReleaseFactor);this.touchJumpReleased=true;}}
   const abilityUsed=this.control.take('ability')&&this.useAbility();
   this.dashCooldown=Math.max(0,this.dashCooldown-dt);
   if(this.control.take('dash')&&this.dashCooldown<=0&&!(abilityUsed&&this.operator==='nyra')){this.dashTime=feel.dash.duration;this.dashCooldown=feel.dash.cooldown;this.soundBus.play('dash');this.spark(p.x,p.y-35,0xa6e4d6);}
   const direction=Number(this.control.down('right'))-Number(this.control.down('left'));if(direction)this.facing=direction;p.setFlipX(this.facing<0);
   if(this.dashTime>0){this.dashTime=Math.max(0,this.dashTime-dt);b.setAllowGravity(false);p.setAccelerationX(0).setDragX(0).setMaxVelocity(feel.dash.speed+30,1080).setVelocity(this.facing*feel.dash.speed,0);p.play('pilot-dash-'+this.operator,true);}
   else{b.setAllowGravity(true);p.setMaxVelocity(feel.horizontal.maxSpeed,1080).setDragX(direction?0:grounded?feel.horizontal.groundBrake:feel.horizontal.airBrake).setAccelerationX(direction*(grounded?feel.horizontal.groundAcceleration:feel.horizontal.airAcceleration));
    if(!grounded){p.anims.stop();p.setFrame(b.velocity.y<0?12:13);}else p.play('pilot-'+(Math.abs(b.velocity.x)>28?'run':'idle')+'-'+this.operator,true);
   }
   if(grounded&&!this.wasGrounded)this.spark(p.x,p.y,0xaac6be,5);this.wasGrounded=grounded;
   this.updateAbilityHUD();p.setAlpha(this.invincible>0&&Math.floor(this.invincible*14)%2?.4:1);
  }
};})();
