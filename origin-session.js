/* Local-only v15 playtest data; legacy keys are read by OriginPilot, never written here. */
(()=>{'use strict';
 const object=v=>v&&typeof v==='object'&&!Array.isArray(v);
 const read=(s,k,f)=>{try{const v=JSON.parse(s.getItem(k));return object(f)?(object(v)?v:f):v??f;}catch(_){return f;}},write=(s,k,v)=>{try{s.setItem(k,JSON.stringify(v));return true;}catch(_){return false;}};
 const KEY='echo404_origin_tests_v16',SETTINGS='echo404_origin_settings_v16',ECONOMY='echo404_origin_economy_v16';
 class Session{
  constructor(storage,level,operator,pure=true){this.storage=storage;this.level=level;this.operator=operator;this.pure=pure;this.record={level,operator,pure,started:new Date().toISOString(),time:0,deaths:[],complete:false};this.log=log(storage);this.log.runs.push(this.record);this.log.runs=this.log.runs.slice(-300);this.flush();}
  event(type,detail,time){this.record.events ||= [];this.record.events.push({type,detail,time:Math.round(time*10)/10});this.record.events=this.record.events.slice(-200);this.flush(time);}
  death(cause,time){this.record.deaths.push({cause,time:Math.round(time*10)/10});this.flush(time);}
  flush(time=this.record.time,complete=this.record.complete){this.record.time=Math.round(time*10)/10;this.record.complete=complete;write(this.storage,KEY,this.log);}
 }
 function log(storage){const value=read(storage,KEY,{});return {version:16,runs:(Array.isArray(value.runs)?value.runs:[]).filter(r=>object(r)&&typeof r.level==='string'&&typeof r.operator==='string'&&Number.isFinite(r.time)&&r.time>=0&&Array.isArray(r.deaths)).slice(-300).map(r=>({...r,deaths:r.deaths.filter(d=>object(d)&&typeof d.cause==='string'&&Number.isFinite(d.time))}))};}
 function settings(storage){const v=read(storage,SETTINGS,read(storage,'echo404_origin_settings_v15',{}));return {pure:v.pure!==false,reduced:v.reduced===true};}
 function ghost(storage,key){const v=read(storage,key,{});if(!Number.isFinite(v.time)||v.time<=0||!Array.isArray(v.frames)||!v.frames.length)return null;const frames=v.frames.filter(f=>Array.isArray(f)&&f.length===5&&f.every(Number.isFinite)&&f[0]>=0&&f[3]>=0&&f[3]<16&&[0,1].includes(f[4])).slice(0,1500).sort((a,b)=>a[0]-b[0]);return frames.length?{time:v.time,frames}:null;}
 function report(storage){const l=log(storage);let rows=['ECHO//404 v16.0.0 — relatório local','Data: '+new Date().toISOString(),'Nível | Operador | Modo | Tentativas | Mortes | Conclusões | Melhor tempo | Inimigos desativados | Causas'];const groups={};for(const r of l.runs){const k=r.level+' | '+r.operator+' | '+(r.pure?'PURO':'ASSISTIDO'),g=groups[k]||={runs:0,deaths:0,wins:0,best:Infinity,kills:0,causes:{}};g.runs++;g.deaths+=r.deaths.length;g.kills+=(Array.isArray(r.events)?r.events:[]).filter(e=>e?.type==='enemy').length;if(r.complete){g.wins++;g.best=Math.min(g.best,r.time);}for(const d of r.deaths)g.causes[d.cause]=(g.causes[d.cause]||0)+1;}for(const [k,g]of Object.entries(groups))rows.push(k+' | '+[g.runs,g.deaths,g.wins,Number.isFinite(g.best)?g.best+'s':'—',g.kills,JSON.stringify(g.causes)].join(' | '));return rows.join('\n');}
 function stars(result,target){return [result.fragments===3,result.time<target,result.deaths===0].map(Boolean);}
 function economy(storage){const e=read(storage,ECONOMY,{}),bounded=(v,max)=>Number.isFinite(v)?Math.max(0,Math.min(max,Math.floor(v))):0;return {coins:bounded(e.coins,100000),tier:bounded(e.tier,5),awarded:object(e.awarded)?e.awarded:{}};}
 function reward(storage,id){const e=economy(storage);if(!e.awarded[id]){e.coins+=3;e.awarded[id]=true;write(storage,ECONOMY,e);}return e;}
 function buy(storage){const e=economy(storage),cost=6+e.tier*3;if(e.tier>=5||e.coins<cost)return false;e.coins-=cost;e.tier++;return write(storage,ECONOMY,e);}
 window.OriginSession={Session,report,stars,read,write,settings,ghost,KEY,SETTINGS,ECONOMY,economy,reward,buy};
})();
