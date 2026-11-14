// A single Canvas frame previews the primary mode without starting a game loop.
(() => {
  const canvas=document.getElementById('campaignPreview');
  if(!canvas||!window.CampaignWorld)return;
  const ctx=canvas.getContext('2d'),mission=CampaignWorlds.get(1),state=CampaignWorld.create(mission);
  ctx.save();ctx.translate(0,-125);CampaignWorld.background(ctx,mission,3,200);
  ctx.fillStyle=mission.surface;ctx.fillRect(0,455,960,85);
  ctx.fillStyle=mission.accent;ctx.fillRect(0,455,960,3);
  for(const [x,y,w] of [[90,400,170],[430,380,150],[770,390,160]]){ctx.fillStyle=mission.deep;ctx.fillRect(x,y,w,18);ctx.strokeStyle=mission.accent;ctx.strokeRect(x,y,w,18);}
  CampaignWorld.human(ctx,{x:282,y:417,vx:70,onGround:true},.4,{skin:mission.skin,suit:mission.suit});
  CampaignWorld.human(ctx,{x:215,y:417,vx:70,onGround:true},.4,{echo:true,suit:'#ab93d5'});
  state.guards=[{...CampaignWorld.makeGuard('scout',650,620,750),y:413},{...CampaignWorld.makeGuard('drone',800,700,900),y:340}];
  CampaignWorld.drawEnemies(ctx,state,1);ctx.restore();
})();
