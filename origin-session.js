/* Local-only v15 playtest data; legacy keys are read by OriginPilot, never written here. */
(()=>{'use strict';
 const read=(s,k,f)=>{try{return JSON.parse(s.getItem(k))??f;}catch(_){return f;}},write=(s,k,v)=>{try{s.setItem(k,JSON.stringify(v));return true;}catch(_){return false;}};
 const KEY='echo404_origin_tests_v15',SETTINGS='echo404_origin_settings_v15',ECONOMY='echo404_origin_economy_v15';
 class Session{
  constructor(storage,level,operator,pure=true){this.storage=storage;this.level=level;this.operator=operator;this.pure=pure;this.record={level,operator,pure,started:new Date().toISOString(),time:0,deaths:[],complete:false};this.log=read(storage,KEY,{version:15,runs:[]});this.log.runs.push(this.record);this.log.runs=this.log.runs.slice(-300);this.flush();}
  death(cause,time){this.record.deaths.push({cause,time:Math.round(time*10)/10});this.flush(time);}
  flush(time=this.record.time,complete=this.record.complete){this.record.time=Math.round(time*10)/10;this.record.complete=complete;write(this.storage,KEY,this.log);}
 }
 function report(storage){const l=read(storage,KEY,{runs:[]});let rows=['ECHO//404 v15.0.0 — relatório local','Data: '+new Date().toISOString(),'Nível | Operador | Modo | Tentativas | Mortes | Conclusões | Melhor tempo | Causas'];const groups={};for(const r of l.runs){const k=r.level+' | '+r.operator+' | '+(r.pure?'PURO':'ASSISTIDO'),g=groups[k]||={runs:0,deaths:0,wins:0,best:Infinity,causes:{}};g.runs++;g.deaths+=r.deaths.length;if(r.complete){g.wins++;g.best=Math.min(g.best,r.time);}for(const d of r.deaths)g.causes[d.cause]=(g.causes[d.cause]||0)+1;}for(const [k,g]of Object.entries(groups))rows.push(k+' | '+[g.runs,g.deaths,g.wins,Number.isFinite(g.best)?g.best+'s':'—',JSON.stringify(g.causes)].join(' | '));return rows.join('\n');}
 function stars(result,target){return [result.fragments===3,result.time<target,result.deaths===0].map(Boolean);}
 function economy(storage){return read(storage,ECONOMY,{coins:0,tier:0,awarded:{}});}
 function reward(storage,id){const e=economy(storage);if(!e.awarded[id]){e.coins+=3;e.awarded[id]=true;write(storage,ECONOMY,e);}return e;}
 function buy(storage){const e=economy(storage),cost=6+e.tier*3;if(e.tier>=5||e.coins<cost)return false;e.coins-=cost;e.tier++;return write(storage,ECONOMY,e);}
 window.OriginSession={Session,report,stars,read,write,KEY,SETTINGS,ECONOMY,economy,reward,buy};
})();
