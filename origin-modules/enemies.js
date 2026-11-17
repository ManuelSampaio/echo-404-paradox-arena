/* ECHO//404: enemies system. */
(()=>{window.OriginModules ||= {};window.OriginModules.enemies={
  patrols(dt){const data=this.data,feel=OriginFeel,{clamp,pose,groundedAt,rank,save}=OriginPilot,$=id=>document.getElementById(id);
   this.aimLines.clear();const p=this.player;
   for(const enemy of this.enemies){if(enemy.defeated)continue;if(enemy.stun>0){enemy.sprite.setTint(0xd8ffff);continue;}enemy.sprite.clearTint();const dx=p.x-enemy.x,dy=(p.y-36)-(enemy.y-38),near=Math.abs(dx)<(enemy.type==='sentry'?450:330)&&Math.abs(dy)<100;
    const facing=enemy.type==='sentry'||enemy.alert>.6||dx*enemy.dir>-25;
    const blocked=data.platforms.some(s=>OriginGeometry.segmentRect(enemy.x,enemy.y-44,p.x,p.y-35,{x:s.x,y:s.y,width:s.w,height:s.h}));
    const sees=near&&facing&&!blocked;enemy.alert=clamp(enemy.alert+dt*(sees?2:-.6),0,1);enemy.cooldown=Math.max(0,enemy.cooldown-dt);
    if(enemy.type!=='sentry'){if(enemy.alert>.6)enemy.dir=dx>0?1:-1;enemy.x=clamp(enemy.x+enemy.dir*(enemy.alert>.6?(enemy.type==='hound'?180:100):45)*(1+this.levelIndex*.012)*dt,enemy.min,enemy.max);if(enemy.x===enemy.min)enemy.dir=1;if(enemy.x===enemy.max)enemy.dir=-1;}
    enemy.sprite.setPosition(enemy.x,enemy.y+(enemy.type==='drone'?Math.sin(this.elapsed*2)*12:0)).setFlipX(enemy.dir<0).setFrame((enemy.type==='scout'?0:enemy.type==='sentry'||enemy.type==='drone'?4:8)+Math.floor(this.elapsed*8)%4);
    if(OriginGeometry.intersects(p.body,{x:enemy.x-13,y:enemy.y-66,width:26,height:66}))this.hurt('contact:'+enemy.type);
    if(enemy.type==='hound')continue;
    if(sees&&enemy.alert>.6&&enemy.cooldown<=0){
     if(!enemy.target){enemy.target={x:p.x,y:p.y-35};enemy.aim=(enemy.type==='sentry'?1.2:.95)*Math.max(.75,1-this.levelIndex*.007);}
     enemy.aim-=dt;this.aimLines.lineStyle(1.5,0xf3bd8d,.6);this.aimLines.lineBetween(enemy.x,enemy.y-44,enemy.target.x,enemy.target.y);this.aimLines.strokeCircle(enemy.target.x,enemy.target.y,10);
     if(enemy.aim<=0){const x=enemy.x,y=enemy.y-44,tx=enemy.target.x-x,ty=enemy.target.y-y,len=Math.hypot(tx,ty)||1,o=this.add.circle(x,y,4,0xffc294).setDepth(11);this.bolts.push({o,x,y,vx:tx/len*300,vy:ty/len*300,life:2});enemy.target=null;enemy.cooldown=Math.max(1.65,2.5-this.levelIndex*.03);}
    }else{enemy.target=null;enemy.aim=0;}
   }
   this.bolts=this.bolts.filter(shot=>{const oldX=shot.x,oldY=shot.y;shot.x+=shot.vx*dt;shot.y+=shot.vy*dt;shot.life-=dt;shot.o.setPosition(shot.x,shot.y);
    if(data.platforms.some(s=>shot.x>s.x&&shot.x<s.x+s.w&&shot.y>s.y&&shot.y<s.y+s.h))shot.life=0;
    if(shot.life>0&&OriginGeometry.segmentRect(oldX,oldY,shot.x,shot.y,p.body,4)){this.hurt('projectile');shot.life=0;}
    if(shot.life<=0){shot.o.destroy();return false;}return true;});
   this.ventGraphics.clear();for(const v of (data.vents||[data.vent])){const phase=(this.elapsed+(v.offset||0))%v.period,active=phase>3.9&&phase<4.8,warning=phase>2.9&&phase<=3.9;this.ventGraphics.fillStyle(active?0xe5b38a:warning?0xdce8a1:0x5c7b80,active ? .6 : .4);this.ventGraphics.fillRect(v.x,v.y-5,v.w,5);
   if(active){for(let i=0;i<5;i++){this.ventGraphics.fillStyle(0xd7e0cb,.22);this.ventGraphics.fillCircle(v.x+8+i*12,v.y-20-Math.sin(this.elapsed*5+i)*12,13);}if(p.x>v.x-12&&p.x<v.x+v.w+12&&p.y>v.y-45&&p.y<v.y+8)this.hurt('vent');}
   if(warning){this.ventGraphics.lineStyle(2,0xf4d7a1,.7);this.ventGraphics.strokeRect(v.x,v.y-50,v.w,45);}}
  }
};})();
