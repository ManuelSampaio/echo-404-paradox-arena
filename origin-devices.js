/* Sensors use actor feet; links have explicit IDs and AND semantics. */
(()=>{'use strict';
 class Devices{
  constructor(map){this.sensors=map.sensors||[];this.devices=map.devices||[];this.links=map.links||[];this.state={};this.latched=new Set();this.timers={};}
  update(dt,actors,time){for(const s of this.sensors){let on=actors.some(a=>a&&Math.abs(a.x-s.x)<s.w/2&&Math.abs(a.y-s.y)<18);if(on&&s.latch)this.latched.add(s.id);this.state[s.id]=on||this.latched.has(s.id);}
   for(const d of this.devices){const sources=this.links.filter(l=>l.device===d.id);const active=sources.length>0&&sources.every(l=>!!this.state[l.sensor]);if(active&&d.hold)this.timers[d.id]=d.hold;else this.timers[d.id]=Math.max(0,(this.timers[d.id]||0)-dt);this.state[d.id]=active||this.timers[d.id]>0;if(d.type==='laser'){const phase=(time+(d.offset||0))%(d.period||6);this.state[d.id+':warning']=phase>3&&phase<4;this.state[d.id+':harmful']=phase>=4&&phase<5&&!this.state[d.id];}}
   return this.state;
  }
 }
 window.OriginDevices={Devices};})();
