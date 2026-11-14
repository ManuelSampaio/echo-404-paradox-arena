"use strict";
/* ECHO//404 v6.0 SYSTEM WAR — final sector boss encounter.
   CREATED & DEVELOPED BY MANUEL SAMPAIO01 */
(() => {
  let won=false;
  const zone={x:385,y:235,r:42};
  const state={phase:1};
  function phase(t){return t<9?1:t<19?2:3;}
  function collides({player,levelIndex,worldTime,level}){
    if(levelIndex!==9||!player)return false;
    state.phase=phase(worldTime);
    const p=state.phase;
    const pulse=(worldTime%(p===1?5:p===2?3.8:2.7));
    if(pulse>.65)return false;
    const walls=level?.arena?.walls||[];
    const laserX=400+Math.sin(worldTime*(.7+p*.12))*190;
    const laserY=250+Math.cos(worldTime*(.6+p*.12))*120;
    const within=(x,y)=>!walls.some(w=>x>w.x&&x<w.x+w.w&&y>w.y&&y<w.y+w.h);
    return (within(laserX,player.y)&&Math.abs(player.x-laserX)<11) ||
      (p>=2&&within(player.x,laserY)&&Math.abs(player.y-laserY)<11);
  }
  function draw(ctx,{levelIndex,worldTime,level}){
    if(levelIndex!==9)return;
    const p=phase(worldTime),pulse=worldTime%(p===1?5:p===2?3.8:2.7);
    ctx.save();
    ctx.textAlign="center";ctx.font="bold 13px monospace";
    ctx.fillStyle="#ff6c8c";ctx.fillText("ECHO // SYSTEM WAR · FASE "+p,400,48);
    ctx.globalAlpha=.55;
    ctx.strokeStyle="#ff4b77";ctx.lineWidth=3;
    ctx.beginPath();ctx.arc(zone.x,zone.y,zone.r+Math.sin(worldTime*2)*7,0,Math.PI*2);ctx.stroke();
    ctx.globalAlpha=1;
    const x=400+Math.sin(worldTime*(.7+p*.12))*190;
    const y=250+Math.cos(worldTime*(.6+p*.12))*120;
    ctx.strokeStyle=pulse<.65?"#ff3659":"#ffae45";
    ctx.lineWidth=pulse<.65?6:2;ctx.setLineDash(pulse<.65?[]:[8,9]);
    ctx.beginPath();ctx.moveTo(x,15);ctx.lineTo(x,485);ctx.stroke();
    if(p>=2){ctx.beginPath();ctx.moveTo(15,y);ctx.lineTo(785,y);ctx.stroke();}
    ctx.restore();
  }
  function onVictory(){
    if(won)return;won=true;
    const overlay=document.createElement("div");
    overlay.id="echoSystemWarEnding";
    Object.assign(overlay.style,{position:"fixed",inset:"0",zIndex:"9999",background:"rgba(2,5,16,.94)",color:"#b8faff",display:"grid",placeItems:"center",padding:"24px",textAlign:"center",fontFamily:"monospace"});
    overlay.innerHTML='<div style="max-width:550px"><h1 style="color:#ff6488">SYSTEM WAR // COMPLETE</h1><p>A simulação foi quebrada. Os teus ecos venceram o sistema.</p><p>«Não foste apenas um erro. Foste a variável que eu não consegui prever.» — ECHO</p><p style="font-size:12px">CREATED &amp; DEVELOPED BY MANUEL SAMPAIO01</p><button id="echoEndClose" style="padding:13px 22px;border:1px solid #68f6ff;background:#082334;color:#d7ffff;border-radius:10px">VOLTAR AO JOGO</button></div>';
    document.body.appendChild(overlay);
    overlay.querySelector("#echoEndClose").addEventListener("click",()=>overlay.remove());
  }
  window.EchoSystemBoss={version:"6.0",collides,draw,onVictory};
})();
