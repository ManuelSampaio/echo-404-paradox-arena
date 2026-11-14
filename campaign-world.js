/* ECHO//404 v11.0 — shared Canvas renderer and deterministic patrol state machine. */
(() => {
  'use strict';
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  const overlap=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
  function create(mission) {
    return {mission,time:0,shots:[],guards:mission.guards.map(([type,x,min,max])=>makeGuard(type,x,min,max))};
  }
  function makeGuard(type,x,min,max){return {type,x,y:type==='drone'?365:type==='heavy'?401:type==='hound'||type==='crawler'?432:413,min,max,dir:1,state:'patrol',alert:0,memory:0,lastSeen:x,cooldown:2,aim:0,target:null,phase:x*.01};}
  function blocked(x,y,tx,ty,blocks) {
    return blocks.some(b=>{
      if(b.x+b.w<Math.min(x,tx)||b.x>Math.max(x,tx))return false;
      const t=clamp((b.x+b.w/2-x)/(tx-x||1),0,1),height=y+(ty-y)*t;
      return height>b.y&&height<b.y+b.h;
    });
  }
  function update(state,dt,player,blocks,hurt,onAlert) {
    state.time+=dt;
    for(const guard of state.guards) {
      const a=CampaignWorlds.archetypes[guard.type], dx=player.x-guard.x;
      guard.y=a.flying?365+Math.sin(state.time*2+guard.phase)*18:455-(guard.type==='heavy'?54:guard.type==='hound'||guard.type==='crawler'?23:42);
      const eyeY=guard.y+12,py=player.y+18;
      const facing=dx*guard.dir>=-24||a.speed===0||guard.state==='chase';
      const visible=Math.abs(dx)<a.range&&Math.abs(py-eyeY)<175&&facing&&!blocked(guard.x+12,eyeY,player.x+12,py,blocks);
      if(visible){guard.alert=Math.min(1,guard.alert+dt*1.8);guard.lastSeen=player.x;guard.memory=2.5;}
      else{guard.alert=Math.max(0,guard.alert-dt*.65);guard.memory=Math.max(0,guard.memory-dt);}
      if(a.speed===0&&visible)guard.dir=dx>=0?1:-1;
      const previous=guard.state;
      guard.state=guard.alert>.65?'chase':guard.memory>0?'search':'patrol';
      if(guard.state==='chase'&&previous!=='chase')onAlert();
      if(a.speed>0) {
        if(guard.state!=='patrol')guard.dir=guard.lastSeen>=guard.x?1:-1;
        const speed=guard.state==='chase'?a.chase:a.speed;
        guard.x=clamp(guard.x+guard.dir*speed*dt,guard.min,guard.max);
        if(guard.x===guard.max)guard.dir=-1;
        if(guard.x===guard.min)guard.dir=1;
        if(!a.flying) for(const b of blocks) if(guard.x+24>b.x&&guard.x<b.x+b.w)guard.y=Math.min(guard.y,b.y-(455-guard.y));
      }
      if(Math.abs(dx)<(a.melee?35:24)&&Math.abs(player.y-guard.y)<50)hurt(a.label);
      guard.cooldown=Math.max(0,guard.cooldown-dt);
      const clear=visible&&guard.state==='chase';
      if(!clear){guard.target=null;guard.aim=0;}
      else if(!a.melee&&guard.cooldown<=0) {
        if(!guard.target){guard.target={x:player.x+12,y:py};guard.aim=a.aim;}
        else {
          guard.aim-=dt;
          if(guard.aim<=0){
            const x=guard.x+12,y=eyeY,dx=guard.target.x-x,dy=guard.target.y-y,len=Math.hypot(dx,dy)||1,speed=guard.type==='sniper'?360:230;
            state.shots.push({x,y,vx:dx/len*speed,vy:dy/len*speed,life:2.5});
            guard.target=null;guard.cooldown=a.cooldown;
          }
        }
      }
    }
    for(const shot of state.shots){shot.x+=shot.vx*dt;shot.y+=shot.vy*dt;shot.life-=dt;
      if(blocks.some(b=>overlap({x:shot.x-3,y:shot.y-3,w:6,h:6},b)))shot.life=0;
      if(shot.life>0&&overlap({x:shot.x-4,y:shot.y-4,w:8,h:8},player)){hurt('Disparo da patrulha');shot.life=0;}
    }
    state.shots=state.shots.filter(s=>s.life>0);
    const phase=state.time%state.mission.period;
    const active=phase>state.mission.period*.65&&phase<state.mission.period*.88;
    if(state.mission.hazard!=='ice'&&active)for(const x of state.mission.zones){
      if(overlap(player,{x,y:420,w:94,h:35}))hurt(state.mission.hazard==='steam'?'Vapor escaldante':state.mission.hazard==='spores'?'Esporos do biodomo':'Pulso elétrico');
    }
  }
  function human(ctx,p,time,{suit='#4995ba',skin='#c99270',echo=false,robot=false}={}) {
    const moving=Math.abs(p.vx||0)>1, swing=p.onGround===false?0.6:moving?Math.sin(time*11):0;
    const dir=(p.vx||p.facing||p.dir||1)<0?-1:1;
    ctx.save();ctx.translate(p.x+12,p.y);ctx.scale(dir,1);
    if(echo)ctx.globalAlpha=.5;
    // Face, hair and neck retain a human profile at the original 24×38 hitbox.
    ctx.fillStyle=robot?'#a8b3be':skin;ctx.beginPath();ctx.ellipse(0,6,5.5,6,0,0,Math.PI*2);ctx.fill();
    ctx.fillRect(-2,10,4,5);
    ctx.fillStyle=robot?'#df5f70':'#251f30';ctx.beginPath();ctx.ellipse(-1,3,5.7,3.7,0,Math.PI,Math.PI*2);ctx.fill();
    ctx.fillStyle=echo?'#d6c0ff':'#e1faf7';ctx.fillRect(2,5,4,2);
    ctx.fillStyle=suit;ctx.beginPath();ctx.moveTo(-7,14);ctx.lineTo(6,14);ctx.lineTo(7,25);ctx.lineTo(-6,25);ctx.closePath();ctx.fill();
    ctx.fillStyle='#233346';ctx.fillRect(-6,25,13,3);ctx.fillStyle='#9af5de';ctx.fillRect(2,16,3,4);
    function limb(x,y,angle,length,color,width){ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(1,length*.55);ctx.lineTo(-1,length);ctx.stroke();ctx.restore();}
    limb(-5,16,-swing*.7,12,suit,4);limb(5,16,swing*.7,12,suit,4);
    limb(-3,28,swing*.65,8,'#243447',4);limb(4,28,-swing*.65,8,'#30435a',4);
    ctx.fillStyle='#b3c8cc';ctx.fillRect(-7-swing*3,35,7,3);ctx.fillRect(2+swing*3,35,7,3);
    if(echo){ctx.strokeStyle='#d7c0ff';ctx.lineWidth=1;ctx.strokeRect(-10,-2,20,41);}
    ctx.restore();
  }
  function drawGuard(ctx,g,time,accent) {
    const type=g.type,a=CampaignWorlds.archetypes[type],color=g.state==='chase'?'#ff6e86':g.state==='search'?'#ffd883':accent;
    if(type==='scout'||type==='sentinel'||type==='sniper') {
      human(ctx,{x:g.x,y:g.y,vx:a.speed*g.dir,dir:g.dir,onGround:true},time,{robot:true,suit:type==='sentinel'?'#856c99':'#667482'});
      ctx.fillStyle=color;ctx.fillRect(g.x+12,g.y+17,g.dir*20,4);
    } else {
      ctx.save();ctx.translate(g.x+12,g.y+12);ctx.fillStyle='#253d4d';ctx.strokeStyle=color;ctx.lineWidth=2;
      if(type==='drone') {
        ctx.beginPath();ctx.ellipse(0,0,19,10,0,0,Math.PI*2);ctx.fill();ctx.stroke();
        ctx.fillStyle='#a5cbd3';ctx.fillRect(-27,-9,17,3);ctx.fillRect(11,-9,17,3);
      } else if(type==='hound'||type==='crawler') {
        ctx.fillRect(-18,-7,35,13);ctx.strokeRect(-18,-7,35,13);
        for(let j=-1;j<=1;j+=2){ctx.beginPath();ctx.moveTo(j*12,3);ctx.lineTo(j*20,10+Math.sin(time*13+j)*4);ctx.lineTo(j*16,14);ctx.stroke();}
        ctx.fillRect(g.dir*18-5,-11,10,10);
      } else if(type==='heavy') {
        ctx.fillRect(-19,-10,38,35);ctx.strokeRect(-19,-10,38,35);
        ctx.fillRect(-25,1,10,25);ctx.fillRect(15,1,10,25);ctx.fillRect(-17,25,12,17);ctx.fillRect(6,25,12,17);
      } else {ctx.fillRect(-8,-3,16,22);ctx.fillRect(-20,18,40,6);ctx.fillRect(-18,-12,36,14);ctx.strokeRect(-18,-12,36,14);ctx.fillRect(g.dir*14,-8,g.dir*20,5);}
      ctx.fillStyle=color;ctx.beginPath();ctx.arc(0,-2,4,0,Math.PI*2);ctx.fill();ctx.restore();
    }
    ctx.fillStyle=color;ctx.font='bold 10px monospace';ctx.textAlign='center';ctx.fillText(a.label,g.x+12,g.y-12);ctx.textAlign='left';
    if(g.target){ctx.save();ctx.strokeStyle='#ffe09b';ctx.lineWidth=1.5;ctx.setLineDash([6,7]);ctx.beginPath();ctx.moveTo(g.x+12,g.y+12);ctx.lineTo(g.target.x,g.target.y);ctx.stroke();ctx.setLineDash([]);ctx.beginPath();ctx.arc(g.target.x,g.target.y,10,0,Math.PI*2);ctx.stroke();ctx.restore();}
  }
  function background(ctx,m,time,cam) {
    const sky=ctx.createLinearGradient(0,0,0,540);sky.addColorStop(0,m.sky);sky.addColorStop(1,m.deep);ctx.fillStyle=sky;ctx.fillRect(0,0,960,540);
    ctx.save();ctx.translate(-cam*.18%220,0);
    for(let x=-220;x<1200;x+=220){
      ctx.fillStyle=m.deep;ctx.strokeStyle=m.accent+'35';ctx.lineWidth=2;
      if(m.kind==='ice') {ctx.beginPath();ctx.moveTo(x-100,455);ctx.lineTo(x+80,90);ctx.lineTo(x+240,455);ctx.fill();ctx.stroke();}
      else if(m.kind==='garden'){ctx.lineWidth=16;ctx.strokeStyle='#19493d';ctx.beginPath();ctx.moveTo(x+70,455);ctx.bezierCurveTo(x+130,350,x+20,240,x+110,80);ctx.stroke();ctx.fillStyle='#235746';for(let y=100;y<400;y+=85){ctx.beginPath();ctx.ellipse(x+95+Math.sin(y)*30,y,72,28,-.5,0,Math.PI*2);ctx.fill();}}
      else if(m.kind==='reactor'){ctx.lineWidth=5;ctx.beginPath();ctx.arc(x+100,240,125,0,Math.PI*2);ctx.stroke();ctx.strokeRect(x+65,60,70,360);}
      else if(m.kind==='foundry'){ctx.fillRect(x+30,160,85,300);ctx.strokeRect(x+30,160,85,300);ctx.fillStyle='#ff9c4533';ctx.fillRect(x+40,230,65,180);ctx.fillStyle='#642e30';ctx.fillRect(x+5,150,135,15);}
      else if(m.kind==='city'){const h=200+((x+220)*13%190);ctx.fillRect(x+20,455-h,155,h);for(let y=475-h;y<435;y+=27)for(let w=35;w<155;w+=32){ctx.fillStyle=(w+y)%3?'#ffc66a55':'#718ae177';ctx.fillRect(x+w,y,9,12);}}
      else{ctx.fillRect(x+25,90,130,365);ctx.strokeRect(x+25,90,130,365);for(let y=110;y<430;y+=32){ctx.fillStyle=m.accent+'55';ctx.fillRect(x+38,y,100,9);ctx.fillStyle='#ccfff0';ctx.fillRect(x+125,y,5,5);}}
    }
    ctx.restore();
    // Deterministic, bounded particles: no allocations or accumulating emitters.
    ctx.fillStyle=m.accent+'99';ctx.strokeStyle=m.accent+'55';ctx.lineWidth=1;
    for(let i=0;i<42;i++){const x=((i*137.7-cam*.3+time*(m.weather==='rain'?-80:12))%1000+1000)%1000,y=(i*53+time*(m.weather==='rain'?270:m.weather==='embers'?-30:18)+2000)%500;
      if(m.weather==='rain'){ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-7,y+19);ctx.stroke();}
      else ctx.fillRect(x,y,m.weather==='data'?2:3,m.weather==='data'?10:3);
    }
    ctx.fillStyle=m.accent;ctx.font='bold 14px monospace';ctx.fillText(m.biome,20,52);
  }
  function drawHazards(ctx,state) {
    const m=state.mission,phase=state.time%m.period,active=phase>m.period*.65&&phase<m.period*.88,warning=phase>m.period*.45&&phase<=m.period*.65;
    for(const x of m.zones){
      ctx.fillStyle=m.surface;ctx.fillRect(x,449,94,6);
      if(m.hazard==='ice'){ctx.fillStyle='#b6edff66';ctx.fillRect(x,455,94,4);continue;}
      ctx.strokeStyle=active?m.danger:warning?'#ffe39c':m.accent+'55';ctx.fillStyle=active?m.danger+'55':warning?'#ffdf8433':m.accent+'15';
      ctx.fillRect(x,active?420:444,94,active?35:6);ctx.strokeRect(x,444,94,10);
      if(active)for(let j=0;j<6;j++){ctx.beginPath();ctx.moveTo(x+j*17,452);ctx.lineTo(x+j*17+Math.sin(state.time*8+j)*12,420);ctx.stroke();}
      if(warning||active){ctx.fillStyle=warning?'#ffe39c':m.danger;ctx.font='bold 10px monospace';ctx.fillText(active?'PERIGO':'AVISO',x+22,410);}
    }
  }
  function drawEnemies(ctx,state,time) {
    for(const g of state.guards)drawGuard(ctx,g,time,state.mission.accent);
    ctx.fillStyle=state.mission.danger;for(const s of state.shots){ctx.beginPath();ctx.arc(s.x,s.y,4,0,Math.PI*2);ctx.fill();}
  }
  window.CampaignWorld = {create,makeGuard,blocked,update,human,background,drawHazards,drawEnemies};
})();
