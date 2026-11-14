"use strict";
/* ECHO//404 v5.4 DYNAMIC THREATS — original gameplay module
   © 2026 MANUEL SAMPAIO01 */
(() => {
  const drones = Array.from({length:10},(_,i)=>{
    const x=90+(i*73)%180,y=100+(i*59)%250;
    return [
      {x,y,range:55+i*3,axis:i%2?"x":"y",speed:.8+i*.12,radius:11},
      ...(i>=3?[{x:530+(i*19)%100,y:120+(i*31)%210,range:55,axis:i%2?"y":"x",speed:1.2,radius:10}]:[])
    ];
  });
  function position(d,t){
    const offset=Math.sin(t*d.speed)*d.range;
    return {x:d.x+(d.axis==="x"?offset:0),y:d.y+(d.axis==="y"?offset:0)};
  }
  function activeDrones(levelIndex){return levelIndex===0?[]:(drones[levelIndex]||[]);}
  function collides({player,levelIndex,worldTime,level}){
    if(!player)return false;
    const walls=level?.arena?.walls||[];
    return activeDrones(levelIndex).some(d=>{
      const p=position(d,worldTime);
      if(walls.some(w=>p.x>w.x&&p.x<w.x+w.w&&p.y>w.y&&p.y<w.y+w.h))return false;
      return Math.hypot(p.x-player.x,p.y-player.y)<d.radius+player.size*.42;
    });
  }
  function draw(ctx,{levelIndex,worldTime,level}){
    const walls=level?.arena?.walls||[];
    for(const d of activeDrones(levelIndex)){
      const p=position(d,worldTime);
      if(walls.some(w=>p.x>w.x&&p.x<w.x+w.w&&p.y>w.y&&p.y<w.y+w.h))continue;
      ctx.save();
      ctx.strokeStyle="#ff6688";ctx.lineWidth=2;
      ctx.setLineDash([4,5]);ctx.globalAlpha=.35;
      ctx.beginPath();
      if(d.axis==="x"){ctx.moveTo(d.x-d.range,d.y);ctx.lineTo(d.x+d.range,d.y);}
      else{ctx.moveTo(d.x,d.y-d.range);ctx.lineTo(d.x,d.y+d.range);}
      ctx.stroke();ctx.setLineDash([]);ctx.globalAlpha=1;
      ctx.shadowColor="#ff385d";ctx.shadowBlur=14;
      ctx.fillStyle="#2a1029";ctx.strokeStyle="#ff6688";
      ctx.beginPath();ctx.arc(p.x,p.y,d.radius,0,Math.PI*2);ctx.fill();ctx.stroke();
      ctx.fillStyle="#ff4261";ctx.beginPath();ctx.arc(p.x,p.y,4,0,Math.PI*2);ctx.fill();
      ctx.restore();
    }
  }
  window.EchoDynamicThreats={version:"5.4",collides,draw};
})();
