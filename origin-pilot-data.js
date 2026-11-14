/* ECHO//404 v12.0: one authored vertical slice, not six recoloured maps. */
(() => {
 'use strict';
 const platforms=[
  {id:'dock',x:0,y:1320,w:980,h:180},
  {id:'broken-stair',x:460,y:1200,w:180,h:24},
  {id:'signal-ledge',x:760,y:1100,w:180,h:24},
  {id:'arrival',x:1080,y:1150,w:400,h:44},
  {id:'silo-a',x:1530,y:1030,w:180,h:24},
  {id:'silo-b',x:1770,y:910,w:190,h:24},
  {id:'silo-c',x:1530,y:790,w:180,h:24},
  {id:'anchor',x:1760,y:670,w:300,h:32},
  {id:'sky-dock',x:2370,y:420,w:340,h:38},
  {id:'rooftop',x:2790,y:310,w:240,h:38},
  {id:'secret',x:3030,y:190,w:120,h:20},
  {id:'memory-ledge',x:3100,y:410,w:250,h:30},
  {id:'evacuation',x:3410,y:490,w:620,h:50}
 ];
 const data={width:4100,height:1560,spawn:{x:160,y:1318},platforms,
  anchor:{x:1910,y:670,radius:55},lift:{x:2195,y:830,top:405,bottom:830,w:180,h:24},
  fragments:[{x:820,y:1058},{x:2000,y:628},{x:3215,y:368}],
  secrets:[{x:645,y:1280},{x:3090,y:148},{x:3630,y:448}],
  checkpoints:[{x:160,y:1318},{x:1140,y:1148},{x:1810,y:668},{x:2440,y:418}],
  enemies:[{type:'scout',x:1320,y:1150,min:1240,max:1430},{type:'sentry',x:2895,y:310,min:2895,max:2895},{type:'hound',x:3660,y:490,min:3500,max:3870}],
  exit:{x:3890,y:490},vent:{x:1370,y:1150,w:65,period:5.4}
 };
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 function pose(frames,time){
  if(!frames.length)return null;
  if(time<=frames[0].t)return {...frames[0]};
  for(let i=1;i<frames.length;i++)if(time<=frames[i].t){const a=frames[i-1],b=frames[i],f=(time-a.t)/(b.t-a.t||1);return {...b,x:a.x+(b.x-a.x)*f,y:a.y+(b.y-a.y)*f};}
  return {...frames[frames.length-1]};
 }
 function groundedAt(point,zone){return point&&Math.abs(point.x-zone.x)<zone.radius&&Math.abs(point.y-zone.y)<18;}
 function rank({deaths,secrets}){return deaths===0&&secrets>=2?'OURO':deaths<=3?'PRATA':'BRONZE';}
 function save(storage,result){
  const resultKey='echo404_v93_origin_result',flagKey='echo404_v91_origin_mission_complete';
  try{
   let old={};try{old=JSON.parse(storage.getItem(resultKey))||{};}catch(_){}
   const ranks={OURO:3,PRATA:2,BRONZE:1},medal=ranks[old.medal]>ranks[result.medal]?old.medal:result.medal;
   const oldTime=Number(old.bestTime||old.time),bestTime=Number.isFinite(oldTime)&&oldTime>0?Math.min(oldTime,result.time):result.time;
   storage.setItem(resultKey,JSON.stringify({...result,medal,bestTime,version:'12.0'}));
   storage.setItem(flagKey,'true');return true;
  }catch(_){return false;}
 }
 window.OriginPilot={data,clamp,pose,groundedAt,rank,save};
})();
