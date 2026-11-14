"use strict";
/*
 ECHO//404 — WORLD REBIRTH v5.1
 Standalone deterministic map-layout library, loaded after levels.js.
 Uses the existing canvas/PixiJS renderer; no network dependencies.
 CREATED & DEVELOPED BY MANUEL SAMPAIO01
 © 2026 MANUEL SAMPAIO01
*/
(() => {
  const W = 800, H = 500, GAP = 100, THICK = 24;
  const themes = [
    ["NEON LAB", "#061b29", "#1b5363", "#48f6ff"],
    ["MEMORY VAULT", "#1a102a", "#4b3575", "#b48aff"],
    ["LASER FOUNDRY", "#230d17", "#6c2a3d", "#ff617b"],
    ["QUANTUM HALLS", "#0b1930", "#294c86", "#55b7ff"],
    ["REACTOR CORE", "#26180c", "#76502a", "#ffae45"],
    ["ABANDONED FACTORY", "#21161b", "#63404a", "#f08c95"],
    ["ECHO GARDENS", "#0b211c", "#296558", "#58ffb3"],
    ["SINGULARITY", "#0b1d2b", "#285b77", "#4be8ff"],
    ["BROKEN REALITY", "#201c2d", "#5a4e78", "#ffdf94"],
    ["SYSTEM HEART", "#280e1a", "#743149", "#ff4261"]
  ];
  // Alternate between vertical and horizontal containment walls.
  // Unlike v4.3, the door is not fixed to x=380 and the goal may be
  // above, below, left or right of the player.
  const specs = [
    {axis:"v", at:320, gap:235, start:[75,390], plate:[150,390], goal:[700,70],  cover:[[110,160,125,22],[470,310,160,22]]},
    {axis:"h", at:230, gap:550, start:[85,90], plate:[160,90], goal:[690,380], cover:[[290,80,22,95],[150,340,145,22]]},
    {axis:"v", at:470, gap:100, start:[80,390], plate:[160,390], goal:[700,350], cover:[[250,175,145,22],[565,190,22,100]]},
    {axis:"h", at:320, gap:160, start:[710,420], plate:[625,420], goal:[95,90], cover:[[400,370,22,95],[300,105,160,22]]},
    {axis:"v", at:280, gap:330, start:[75,80], plate:[140,80], goal:[690,410], cover:[[110,210,95,22],[460,105,22,110]]},
    {axis:"h", at:180, gap:620, start:[80,80], plate:[165,80], goal:[100,410], cover:[[310,50,22,85],[390,335,165,22]]},
    {axis:"v", at:535, gap:260, start:[80,410], plate:[160,410], goal:[690,75], cover:[[280,120,145,22],[620,365,22,90]]},
    {axis:"h", at:280, gap:290, start:[700,80], plate:[620,80], goal:[95,410], cover:[[455,115,22,90],[540,365,130,22]]},
    {axis:"v", at:410, gap:355, start:[75,90], plate:[155,90], goal:[700,90], cover:[[220,210,22,110],[565,220,145,22]]},
    {axis:"h", at:255, gap:450, start:[90,410], plate:[170,410], goal:[695,80], cover:[[320,365,22,100],[580,90,130,22]]}
  ];
  const rect = (x,y,w,h) => ({x,y,w,h});
  function build(spec,index){
    const vertical=spec.axis==="v";
    const door=vertical?rect(spec.at,spec.gap,THICK,GAP):rect(spec.gap,spec.at,GAP,THICK);
    door.plateIndex=0;
    const walls=vertical?[rect(spec.at,0,THICK,spec.gap),rect(spec.at,spec.gap+GAP,THICK,H-spec.gap-GAP)]:[rect(0,spec.at,spec.gap,THICK),rect(spec.gap+GAP,spec.at,W-spec.gap-GAP,THICK)];
    const start={x:spec.start[0],y:spec.start[1]},goal=rect(spec.goal[0],spec.goal[1],48,58);
    const secondAt=vertical?Math.round((spec.at+goal.x)/2):Math.round((spec.at+goal.y)/2);
    const opening=vertical?70+(index*41)%290:65+(index*53)%310;
    const second=vertical?rect(secondAt,opening,THICK,GAP):rect(opening,secondAt,GAP,THICK);
    second.plateIndex=1;
    if(vertical)walls.push(rect(secondAt,0,THICK,opening),rect(secondAt,opening+GAP,THICK,H-opening-GAP));
    else walls.push(rect(0,secondAt,opening,THICK),rect(opening+GAP,secondAt,W-opening-GAP,THICK));
    walls.push(...spec.cover.map(v=>rect(...v)));
    const plate2=vertical?{x:Math.round((spec.at+secondAt)/2),y:250}:{x:400,y:Math.round((spec.at+secondAt)/2)};
    return {start,goal,door,walls,doors:[door,second],plate2,mazeRevolution:true,
      theme:{name:themes[index][0],background:themes[index][1],wall:themes[index][2],accent:themes[index][3]},
      scenery:spec.cover.map((v,i)=>({x:v[0],y:v[1],w:v[2],h:v[3],kind:i%2?"conduit":"console"}))};
  }
  function intersectsCircle(point, obstacle, radius=12) {
    const x=Math.max(obstacle.x,Math.min(point.x,obstacle.x+obstacle.w));
    const y=Math.max(obstacle.y,Math.min(point.y,obstacle.y+obstacle.h));
    return Math.hypot(point.x-x,point.y-y)<radius;
  }
  // Collision-aware flood-fill used for layout verification. A route to
  // the plate must exist while the door is shut, and a route to the goal
  // must exist after it opens.
  function reachable(arena, from, to, closed) {
    const cell=10, cols=W/cell, rows=H/cell;
    const blocked = closed ? [...arena.walls,arena.door] : arena.walls;
    const valid=(x,y)=>x>=12&&x<=W-12&&y>=12&&y<=H-12&&
      !blocked.some(w=>intersectsCircle({x,y},w));
    const index=(x,y)=>y*cols+x;
    const sx=Math.floor(from.x/cell),sy=Math.floor(from.y/cell);
    const tx=Math.floor(to.x/cell),ty=Math.floor(to.y/cell);
    const queue=[[sx,sy]],seen=new Uint8Array(cols*rows);
    seen[index(sx,sy)]=1;
    for(let i=0;i<queue.length;i++){
      const [x,y]=queue[i];
      if(Math.abs(x-tx)<=2&&Math.abs(y-ty)<=2)return true;
      for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
        const nx=x+dx,ny=y+dy;
        if(nx<0||nx>=cols||ny<0||ny>=rows||seen[index(nx,ny)])continue;
        if(!valid(nx*cell+5,ny*cell+5))continue;
        seen[index(nx,ny)]=1;queue.push([nx,ny]);
      }
    }
    return false;
  }
  // v7: modular corridors and room partitions, verified against the real
  // two-gate route. A partition is only retained if all mandatory routes survive.
  function enrichMaze(arena, spec, index, plate1) {
    const original=arena.walls.slice();
    const gates=arena.doors;
    const p2=arena.plate2;
    const safe=[arena.start,plate1,p2,
      {x:arena.goal.x+arena.goal.w/2,y:arena.goal.y+arena.goal.h/2}];
    const candidates=[];
    // Each sector uses a different pattern of alcoves, side rooms and bends.
    for(let k=0;k<18;k++){
      const seed=index*37+k*29;
      const x=55+(seed*47)%650;
      const y=48+(seed*31)%360;
      const horizontal=(k+index)%4!==0;
      const length=50+(seed%4)*21;
      candidates.push(horizontal?rect(x,y,length,14):rect(x,y,14,length));
    }
    const intersects=(a,b,pad=0)=>a.x<b.x+b.w+pad&&a.x+a.w+pad>b.x&&a.y<b.y+b.h+pad&&a.y+a.h+pad>b.y;
    const safeFor=(w)=>!safe.some(p=>intersectsCircle(p,w,30)) &&
      !gates.some(g=>intersects(w,g,20)) &&
      !original.some(o=>intersects(w,o,12));
    function routesHold(){
      const secondClosed={...arena,walls:[...arena.walls,gates[1]]};
      return reachable(arena,arena.start,plate1,true) &&
        reachable(secondClosed,arena.start,p2,false) &&
        reachable(arena,arena.start,arena.goal,false);
    }
    let added=0;
    for(const w of candidates){
      if(w.x<24||w.y<24||w.x+w.w>W-24||w.y+w.h>H-24||!safeFor(w))continue;
      arena.walls.push(w);
      if(!routesHold()){arena.walls.pop();continue;}
      added++;
      if(added>=6+(index%3))break;
    }
    arena.scenery.push(...arena.walls.slice(original.length).map((w,k)=>({...w,kind:k%2?"partition":"conduit"})));
    arena.layoutStyle=["LABYRINTH","CROSSROADS","VAULT","SPLIT PATH","REACTOR","FACTORY","GARDEN","RIFT","RUINS","CORE"][index];
    arena.extraPartitions=added;
  }
  const report=[];
  if(typeof GAME_LEVELS==="undefined")throw Error("WORLD REBIRTH: levels.js must load first");
  GAME_LEVELS.forEach((level,i)=>{
    const spec=specs[i],arena=build(spec,i),plate={x:spec.plate[0],y:spec.plate[1]};
    enrichMaze(arena,spec,i,plate);
    const plate2=arena.plate2;
    const errors=[];
    const door1=arena.doors[0],door2=arena.doors[1];
    const secondClosed={...arena,walls:[...arena.walls,door2]};
    if(!reachable(arena,arena.start,plate,true))errors.push("first plate unreachable");
    if(!reachable(secondClosed,arena.start,plate2,false))errors.push("second plate unreachable");
    if(!reachable(arena,arena.start,arena.goal,false))errors.push("goal unreachable");
    if(reachable(arena,arena.start,arena.goal,true))errors.push("first gate bypass");
    if(reachable(secondClosed,plate2,arena.goal,false))errors.push("second gate bypass");
    if(errors.length)throw Error("MAZE REVOLUTION sector "+(i+1)+": "+errors.join(", "));
    level.arena=arena;
    if(level.plates?.[0])Object.assign(level.plates[0],plate);
    level.plates.splice(1,0,{...plate2,id:"maze_gate_2_"+(i+1),radius:24});
    level.worldRebirth={...arena.theme,orientation:spec.axis,layoutVersion:"8.0"};
    report.push({sector:i+1,theme:arena.theme.name,style:arena.layoutStyle,partitions:arena.extraPartitions,doors:arena.doors,plates:[plate,plate2]});
  });
  // Decorative geometry is drawn underneath actors and collision walls.
  // The existing PixiJS layer and particle engine remain operational.
  function draw(ctx,levelIndex,width=W,height=H){
    const arena=GAME_LEVELS[levelIndex]?.arena;
    if(!arena?.theme)return;
    const t=arena.theme;
    ctx.save();
    ctx.fillStyle=t.background;ctx.fillRect(0,0,width,height);
    ctx.strokeStyle=t.wall;ctx.globalAlpha=.24;ctx.lineWidth=1;
    for(let x=20;x<width;x+=40){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,height);ctx.stroke();}
    for(let y=20;y<height;y+=40){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(width,y);ctx.stroke();}
    ctx.globalAlpha=.18;ctx.fillStyle=t.accent;
    for(let y=40;y<height;y+=120)for(let x=45;x<width;x+=160){
      ctx.fillRect(x,y,25,4);ctx.fillRect(x+10,y-10,4,25);
    }
    ctx.globalAlpha=.48;ctx.strokeStyle=t.accent;ctx.lineWidth=2;
    for(const s of arena.scenery){ctx.strokeRect(s.x-5,s.y-5,s.w+10,s.h+10);}
    ctx.restore();
  }
  window.EchoWorldRebirth={version:"8.0",getLayouts:()=>report.map(v=>({...v})),validate:()=>report.length===10,draw};
  console.info("ECHO//404 WORLD REBIRTH: 10 two-gate maze layouts validated");
})();
