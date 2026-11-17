/* Explicit action-room profiles. Run only when intentionally reauthoring maps, never during build. */
const fs=require('fs'),vm=require('vm');const c={};c.window=c;for(const f of ['origin-pilot-data.js','origin-tiled.js'])vm.runInNewContext(fs.readFileSync(f,'utf8'),c);
const titles=['O último sinal','Cais sob cerco','Rede interrompida','Travessia da fundição','Evacuação do cais','Contracorrente','Estação dos relés','Escolta do sinal','Ponte de pressão','Cerco ao circuito','Caça ao espectro','Relés da refração','Câmara de interferência','Desvio de fase','Núcleo de vidro','Docas em órbita','A sequência perdida','Corredor em queda','Janela de transmissão','Defesa do reator','Duas assinaturas','Arquivo dividido','Rotas cruzadas','Última transmissão','O coração do arquivo'];
const patterns=[
 {name:'cais e corredores',width:420,dx:[330,300,360,280,-310,-330,340,330],dy:[0,-80,45,-100,-70,0,-95,40]},
 {name:'salas em retorno',width:340,dx:[270,290,-250,-280,300,280,290,-260],dy:[-80,-90,-95,35,-90,0,-100,-80]},
 {name:'descida e recuperação',width:440,dx:[350,330,300,-300,-320,-300,340,320],dy:[65,70,0,-100,-100,-90,30,-90]},
 {name:'ilhas e galerias',width:300,dx:[250,270,250,-260,-250,260,270,-250],dy:[-90,30,-100,-90,40,-100,-90,-80]},
 {name:'terraços de combate',width:520,dx:[400,420,-400,-420,400,420,400,-420],dy:[0,-85,0,-100,40,-90,0,-100]}
];
const types=['assault','sabotage','relay','sequence','defend'];
for(const [i,base]of c.OriginPilot.levels.entries()){
 const existing=c.OriginTiled.adapt(JSON.parse(fs.readFileSync('maps/'+base.id+'.json','utf8')));let l=existing;
 if(i){const stage=i%5,world=Math.floor(i/5)+1,pattern=patterns[stage],n=16+Math.floor(i/10),anchorIndex=4+(i%4),p=[];let x=500+(i%3)*80,y=2300;let direction=1;
  p.push({id:'floor',x:0,y,w:900,h:160});
  for(let k=1;k<n;k++){
   const w=pattern.width+(k%4===0?80:0);let dx=Math.abs(pattern.dx[(k-1+world)%pattern.dx.length]);x+=dx;y+=pattern.dy[(k-1+world)%pattern.dy.length];if(k===1){x=1040;y=2200;}
   if(k===anchorIndex){p.push({id:'anchor',x:x-150,y,w:300,h:24});direction=dx>0?1:-1;}
   else if(k===anchorIndex+1){const a=p[k-1],lx=direction>0?a.x+a.w+85:a.x-85;x=lx+direction*235;y=a.y-300;p.push({id:'step-'+k,x:x-w/2,y,w,h:24});}
   else p.push({id:'step-'+k,x:x-w/2,y,w,h:24});
  }
  const a=p[anchorIndex],lx=direction>0?a.x+a.w+85:a.x-85;
  l={...existing,width:8000,height:3100,platforms:p,spawn:{x:180,y:2298},anchor:{x:a.x+150,y:a.y,radius:55},lift:{x:lx,y:a.y+120,top:a.y-220,bottom:a.y+120,w:180,h:24},route:p.flatMap(v=>v.id==='anchor'?[v.id,'lift']:[v.id]),exit:{x:p.at(-1).x+p.at(-1).w-55,y:p.at(-1).y},sensors:[],devices:[],links:[],echoNode:undefined};
  l.fragments=[p[3],a,p.at(-3)].map(v=>({x:v.x+v.w/2,y:v.y-42}));l.secrets=[p[2],p[8],p.at(-2)].map((v,n)=>({x:v.x+(n%2?v.w-35:35),y:v.y-42}));l.checkpoints=[l.spawn,...[3,anchorIndex,anchorIndex+1,n-3].map(k=>({x:p[k].x+p[k].w/2,y:p[k].y-2}))];
  l.enemies=Array.from({length:Math.min(7,2+Math.floor(i/4))},(_,e)=>{const k=Math.min(n-2,3+e*2),v=p[k],type=i<4?'scout':e%4===0?'drone':e%4===1?'sentry':e%4===2?'hound':'scout';return {type,x:v.x+v.w/2+(e%2?60:-60),y:v.y-(type==='drone'?65:0),min:v.x+40,max:v.x+v.w-40};});
  l.vents=world<3?[]:[{x:p[10].x+30,y:p[10].y,w:45,period:6,offset:i%3}];l.vent={x:-1000,y:0,w:0,period:6};
  if(world>=2){const v=p[anchorIndex+2];l.sensors=[{id:'pressure-a',type:'pressure',x:v.x+70,y:v.y,w:70,latch:world===2&&stage<2}];l.devices=[{id:'exit-door',type:'door',x:l.exit.x-38,y:l.exit.y-108,w:22,h:108,hold:world===4?12:0}];l.links=[{sensor:'pressure-a',device:'exit-door'}];}
  if(world>=3){const v=p[n-4];l.devices.push({id:'laser-0',type:'laser',x:v.x+v.w-65,y:v.y-85,w:8,h:85,period:6,offset:i%3});l.links.push({sensor:'pressure-a',device:'laser-0'});}
  if(world>=4){const v=p[anchorIndex+3];l.devices.push({id:'shuttle',type:'moving',x:v.x+v.w/2,y:v.y+25,w:120,h:16,travel:120,period:5});l.links.push({sensor:'pressure-a',device:'shuttle'});}
  if(world===4)l.sensors[0].pulse={period:12,active:8};
  if(world===5){const v=p[n-3];l.sensors.push({id:'pressure-b',type:'pressure',x:v.x+v.w-70,y:v.y,w:70});l.links.push({sensor:'pressure-b',device:'exit-door'});l.echoNode={x:v.x+v.w-70,y:v.y,radius:130};}
  l.powerups=world===1?[]:[{id:'supply-'+i,type:['slow','magnet','shield'][i%3],x:p[2].x+p[2].w/2,y:p[2].y-40}];
  l.layout=pattern.name;
 }
 l.version=16;const type=i===0?'explore':types[(i+Math.floor(i/5))%5];l.operation={type,title:titles[i],required:type==='assault'?Math.min(l.enemies.length,2+Math.floor(i/10)):0,ordered:type==='sequence',duration:type==='defend'?6+Math.floor(i/5)*2:0};
 const routePlatforms=l.platforms.filter(p=>l.route.includes(p.id));const ks=type==='defend'?[3]:type==='sequence'?[2,5,routePlatforms.length-3]:['relay','sabotage'].includes(type)?[3,routePlatforms.length-3]:[];
 l.relays=ks.map((k,n)=>{const p=routePlatforms[k];return {id:'relay-'+n,x:p.x+p.w/2+(n%2?30:-30),y:p.y};});
 l.briefing=(type==='assault'?'Desativa '+l.operation.required+' patrulhas com PULSO.':type==='sabotage'?'Destrói os relés com PULSO; aproxima-te e dispara.':type==='defend'?'Liga o transmissor por contacto e defende a zona durante '+l.operation.duration+' segundos.':type==='sequence'?'Liga os relés pela ordem indicada.':type==='relay'?'Recupera os relés por contacto ao atravessar as galerias.':'Aprende o eco e experimenta PULSO / F contra a patrulha.')+' '+(l.world===5?'Coordena dois ecos com o NÓ local.':l.world===4?'Usa o eco na janela temporal.':l.world===3?'Desliga os lasers com o eco.':l.world===2?'Deixa um eco no botão da porta.':'Fixa um eco na âncora da grua.')+' Recupera os três fragmentos e segue para a evacuação.';
 const layers=['relays','sensors','devices','powerups','echoNode','platforms','spawn','anchor','lift','fragments','secrets','checkpoints','enemies','exit','vent','vents'];const meta={...l};for(const k of layers)delete meta[k];let id=1;
 const map={type:'map',version:'1.10',tiledversion:'1.11.2',orientation:'orthogonal',renderorder:'right-down',width:Math.ceil(l.width/32),height:Math.ceil(l.height/32),tilewidth:32,tileheight:32,infinite:false,layers:[],properties:[{name:'json:level',type:'string',value:JSON.stringify(meta)}],tilesets:[]};
 for(const name of layers){if(!l[name])continue;map.layers.push({id:map.layers.length+1,name,type:'objectgroup',opacity:1,visible:true,x:0,y:0,objects:(Array.isArray(l[name])?l[name]:[l[name]]).map(v=>({id:id++,name:v.id||v.type||name,type:name,x:v.x,y:v.y,width:v.w||0,height:v.h||0,rotation:0,visible:true,properties:[{name:'json:value',type:'string',value:JSON.stringify(v)}]}))});}map.nextobjectid=id;map.nextlayerid=map.layers.length+1;c.OriginTiled.validate(map);fs.writeFileSync('maps/'+l.id+'.json',JSON.stringify(map,null,2)+'\n');
}
console.log('Authored 25 action missions with distinct operations and room profiles');
