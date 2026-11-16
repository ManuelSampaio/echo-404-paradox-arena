/* ECHO//404: devices system. */
(()=>{window.OriginModules ||= {};window.OriginModules.devices={
  updateLift(dt){const data=this.data,feel=OriginFeel,{clamp,pose,groundedAt,rank,save}=OriginPilot,$=id=>document.getElementById(id);
   this.padPowered=groundedAt(this.player,data.anchor)||groundedAt(this.echoPoint,data.anchor)||groundedAt(this.extraEcho?.point,data.anchor);
   this.anchorLight.setFillStyle(this.padPowered?0xdcf49a:0x778d8e);this.liftLabel.setText(this.padPowered?'GRUA / ECO ONLINE':'GRUA / SEM SINAL');
   const goal=(this.padPowered?data.lift.top:data.lift.bottom)+12,error=goal-this.lift.y;
   if(Math.abs(error)<1){this.lift.body.reset(data.lift.x,goal);this.lift.setVelocityY(0);}else this.lift.setVelocityY(clamp(error*2,-110,85));
  }
};})();
