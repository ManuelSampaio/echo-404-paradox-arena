/* Core pulse weapon: shared by all operators, including pure mode. No ammunition grind. */
(()=>{window.OriginModules ||= {};window.OriginModules.combat={
 createCombat(){this.pulseCooldown=0;this.pulseShots=[];this.defeated=0;this.shotsFired=0;this.combatGraphics=this.add.graphics().setDepth(14);for(const e of this.enemies){e.hp=e.type==='sentry'?3:e.type==='drone'?1:2;e.stun=0;e.defeated=false;}},
 firePulse(){if(!this.running||this.pausedByUser||this.finished||this.training||this.pulseCooldown>0)return false;this.pulseCooldown=.42;this.shotsFired++;const p=this.player,x=p.x+this.facing*20,y=p.y-38;
  const targets=[...this.enemies.filter(e=>!e.defeated).map(e=>({x:e.x,y:e.y-35})),...(this.operation?.type==='sabotage'?this.relays||[]:[]).filter(r=>!r.done).map(r=>({x:r.x,y:r.y-35}))];
  const target=targets.filter(t=>(t.x-x)*this.facing>=-12&&Math.abs(t.y-y)<105&&Math.hypot(t.x-x,t.y-y)<500).sort((a,b)=>Math.hypot(a.x-x,a.y-y)-Math.hypot(b.x-x,b.y-y))[0];const dx=target?target.x-x:this.facing*500,dy=target?target.y-y:0,len=Math.hypot(dx,dy)||1;
  const o=this.add.circle(x,y,5,0x77f5df).setStrokeStyle(2,0xe4ffff).setDepth(16);this.pulseShots.push({x,y,vx:dx/len*700,vy:dy/len*700,life:.8,o});this.soundBus.play('pulse');return true;
 },
 damageEnemy(e){if(e.defeated)return;e.hp--;e.stun=.3;e.alert=1;this.spark(e.x,e.y-35,0x77f5df,5);if(e.hp<=0){e.defeated=true;e.target=null;e.sprite.setAlpha(.22).setTint(0x77f5df).setAngle(85);this.defeated++;this.session?.event?.('enemy',e.type,this.elapsed);this.soundBus.play('disabled');}},
 updateCombat(dt){this.pulseCooldown=Math.max(0,this.pulseCooldown-dt);if(this.control.take('fire')||this.control.down('fire'))this.firePulse();for(const e of this.enemies)e.stun=Math.max(0,e.stun-dt);
  this.pulseShots=this.pulseShots.filter(s=>{const x=s.x,y=s.y;s.x+=s.vx*dt;s.y+=s.vy*dt;s.life-=dt;s.o.setPosition(s.x,s.y);const G=OriginGeometry;
   // Resolve cover before targets so shots cannot disable units through walls.
   const blocked=this.data.platforms.some(p=>G.segmentRect(x,y,s.x,s.y,{x:p.x,y:p.y,width:p.w,height:p.h}));
   if(blocked)s.life=0;
   if(s.life>0){const e=this.enemies.find(e=>!e.defeated&&G.segmentRect(x,y,s.x,s.y,{x:e.x-13,y:e.y-66,width:26,height:66},5));if(e){this.damageEnemy(e);s.life=0;}}
   if(s.life>0){const r=(this.operation?.type==='sabotage'?this.relays||[]:[]).find(r=>!r.done&&G.segmentRect(x,y,s.x,s.y,{x:r.x-18,y:r.y-65,width:36,height:65},5));if(r){this.activateRelay(r);s.life=0;}}
   if(s.life>0){const b=this.bolts.find(b=>Math.hypot(b.x-s.x,b.y-s.y)<22);if(b){b.life=0;s.life=0;this.spark(s.x,s.y,0xffc578,4);}}
   if(s.life<=0){s.o.destroy();return false;}return true;});
  const b=document.getElementById('pulseAction');if(b){b.disabled=this.training;b.querySelector('small').textContent=this.pulseCooldown>0?'A CARREGAR':'PULSO';b.classList.toggle('recharging',this.pulseCooldown>0);}
 }
};})();
