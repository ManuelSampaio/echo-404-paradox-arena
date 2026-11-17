/* ECHO//404 v17 original procedural artwork. MIT, MANUEL SAMPAIO01.
   Reproduce from repository root: node v17/scripts/create-art.cjs
   No downloads, fonts, samples or third-party pictures. */
const {createCanvas}=require('@napi-rs/canvas'),fs=require('node:fs'),path=require('node:path');
const out=path.join(__dirname,'../assets');fs.mkdirSync(out,{recursive:true});
const W=1024,H=576,pal={ink:'#080e17',steel:'#24303c',rim:'#81918f',ivory:'#efe5ce',amber:'#d6aa66',copper:'#9b644a',signal:'#d9d0a7'};
const generated=[];
const save=(c,n)=>{const bytes=c.toBuffer('image/png');fs.writeFileSync(path.join(out,n),bytes);generated.push({file:n,width:c.width,height:c.height,bytes:bytes.length});};
const canvas=(w=W,h=H)=>{const c=createCanvas(w,h);return [c,c.getContext('2d')];};
function line(g,points,color,width=2){g.strokeStyle=color;g.lineWidth=width;g.lineJoin='round';g.lineCap='round';g.beginPath();points.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.stroke();}
function rect(g,x,y,w,h,fill,stroke){g.fillStyle=fill;g.fillRect(x,y,w,h);if(stroke){g.strokeStyle=stroke;g.lineWidth=2;g.strokeRect(x,y,w,h);}}
function poly(g,pts,fill,stroke){g.beginPath();pts.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.fillStyle=fill;g.fill();if(stroke){g.strokeStyle=stroke;g.lineWidth=2;g.stroke();}}
function circle(g,x,y,r,fill,stroke){g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.fillStyle=fill;g.fill();if(stroke){g.strokeStyle=stroke;g.lineWidth=2;g.stroke();}}
function glow(g,x,y,r,color){const a=g.createRadialGradient(x,y,0,x,y,r);a.addColorStop(0,color);a.addColorStop(1,'#00000000');g.fillStyle=a;g.fillRect(x-r,y-r,r*2,r*2);}
function bolts(g,x,y,w,h){for(const [a,b]of [[x+5,y+5],[x+w-5,y+5],[x+5,y+h-5],[x+w-5,y+h-5]])circle(g,a,b,1.6,'#8e978a');}
const configs=[
 {id:'zone01',top:'#060b15',bottom:'#17222b',accent:'#c3b398'},
 {id:'zone02',top:'#080d12',bottom:'#302720',accent:'#d1a36a'},
 {id:'zone03',top:'#080c11',bottom:'#252d30',accent:'#c3c4aa'}
];
for(const z of configs){
 const [far,f]=canvas();const sky=f.createLinearGradient(0,0,0,H);sky.addColorStop(0,z.top);sky.addColorStop(1,z.bottom);f.fillStyle=sky;f.fillRect(0,0,W,H);
 for(let n=0;n<80;n++){const x=(n*173+31)%W,y=(n*67+19)%320;f.fillStyle=n%11?'#b8c2bd22':'#e9ddbd66';f.fillRect(x,y,n%11?1:2,1);}
 if(z.id==='zone01'){
  // Vertical memory chamber: rounded shaft ribs, silent archivist alcoves.
  glow(f,560,160,250,'#8f7f4b18');
  for(let i=-1;i<6;i++){const x=i*220+30;rect(f,x,80,150,490,'#111c26','#24313b');rect(f,x+18,102,114,440,'#0a141f');f.strokeStyle='#4b534c55';f.lineWidth=5;f.beginPath();f.ellipse(x+75,110,55,45,0,Math.PI,0);f.stroke();for(let n=0;n<6;n++)rect(f,x+38,160+n*58,72,34,'#1b2730');}
  line(f,[[0,52],[W,52]],'#5c5c4b55',1);line(f,[[0,552],[W,552]],'#927c4a55',2);
 }else if(z.id==='zone02'){
  // Broad abandoned docks, interrupted approach lights and one grounded ship.
  glow(f,650,200,320,'#b3723d22');
  for(let i=0;i<6;i++){const x=i*220-40;poly(f,[[x,0],[x+22,0],[x+90,330],[x+70,330]],'#172028');line(f,[[x+15,4],[x+80,325]],'#9d785136',3);}
  for(let y=80;y<390;y+=105){line(f,[[0,y],[W,y]],'#3d3c3544',2);}
  poly(f,[[360,326],[420,280],[660,250],[796,296],[873,336],[805,355],[440,355]],'#151d23','#4e504749');
  poly(f,[[620,267],[656,230],[696,277]],'#30332e');rect(f,458,310,125,13,'#7d735055');rect(f,715,320,78,8,'#9b80514d');
  for(let i=0;i<3;i++){circle(f,480+i*87,352,20,'#0d141b','#4b4c3c');line(f,[[480+i*87,365],[480+i*87,400]],'#39454b',9);}
  rect(f,0,405,W,171,'#121d25');for(let x=0;x<W;x+=96){rect(f,x+16,420,52,4,'#c7a76f44');line(f,[[x,450],[x+80,510]],'#45505244',2);}
 }else{
  // Quarantine gate: huge concentric rectilinear locks instead of repeating towers.
  glow(f,512,260,310,'#c7b87c19');
  for(let i=0;i<6;i++){const inset=i*48+10;rect(f,inset,20+i*19,W-inset*2,H-45-i*32,'#131c23',i%2?'#48524d55':'#6c6e5455');}
  rect(f,452,140,120,370,'#090f17','#4c5852');for(let y=170;y<490;y+=74){rect(f,472,y,80,8,'#8a917533');}
  for(let x=76;x<W;x+=218){rect(f,x,180,35,280,'#10171f','#4c554c55');rect(f,x+8,205,19,4,'#c0ba8b66');}
 }
 save(far,z.id+'-far.png');
 const [mid,m]=canvas();
 if(z.id==='zone01'){
  for(let i=-1;i<5;i++){const x=i*270+90;rect(m,x,0,31,H,'#18242dbb','#68716655');rect(m,x+8,0,7,H,'#080f17aa');for(let y=30;y<H;y+=115){rect(m,x+28,y,124,16,'#1f2a32bb','#58645c55');bolts(m,x+28,y,124,16);}for(let j=0;j<3;j++){rect(m,x+54,70+j*135,80,70,'#151f28bb','#64706555');rect(m,x+68,82+j*135,38,3,'#d8c48b88');line(m,[[x+66,95+j*135],[x+116,95+j*135]],'#88928a66',1);}}
 }else if(z.id==='zone02'){
  for(let i=-1;i<4;i++){const x=i*390+50;line(m,[[x,0],[x,70],[x+140,70],[x+140,260]],'#38423fbb',10);line(m,[[x+5,70],[x+100,180]],'#a98b5c66',2);rect(m,x+125,255,38,58,'#253235cc','#7e7d6466');circle(m,x+144,287,8,'#beaa6b77');}
  for(let i=0;i<4;i++){const x=i*285+30;rect(m,x,448,110,76,'#222b31dd','#67716377');line(m,[[x+8,514],[x+100,460]],'#7a7b5a66',2);bolts(m,x,448,110,76);rect(m,x+9,460,25,5,'#ddbd7d99');}
  for(let x=0;x<W;x+=260){line(m,[[x,-10],[x+20,200],[x+70,390]],'#68705a66',2);}
 }else{
  for(let x=25;x<W;x+=258){rect(m,x,0,63,H,'#1b272ddd','#78827277');rect(m,x+12,0,16,H,'#080f16aa');for(let y=40;y<H;y+=120){poly(m,[[x+32,y],[x+78,y+24],[x+78,y+82],[x+32,y+55]],'#28373b','#7a826355');rect(m,x+38,y+30,30,6,'#dfca9488');}}
  line(m,[[0,75],[W,75]],'#b0a77855',5);line(m,[[0,500],[W,500]],'#68746288',6);
 }
 save(mid,z.id+'-mid.png');
 const [near,n]=canvas();
 // Sparse framing only; transparent central play space protects silhouettes.
 if(z.id==='zone01'){
  poly(n,[[0,0],[125,0],[85,180],[0,215]],'#09121dcc');poly(n,[[W,0],[W-80,0],[W-45,160],[W,190]],'#09121dbb');
  line(n,[[20,0],[28,150],[65,200]],'#89907366',4);line(n,[[W-38,0],[W-44,130]],'#71847766',2);
  rect(n,0,H-25,W,25,'#081019aa');for(let x=20;x<W;x+=180)rect(n,x,H-23,55,3,'#c7b58455');
 }else if(z.id==='zone02'){
  for(let x=100;x<W;x+=430){line(n,[[x,0],[x+8,80],[x+48,115]],'#0b141fe6',9);line(n,[[x+48,115],[x+45,155]],'#6e735977',2);rect(n,x+35,153,22,12,'#1b272dcc','#bca46c66');}
  poly(n,[[0,H],[0,H-45],[70,H-45],[100,H-12],[200,H-12],[220,H]],'#08121cdd');poly(n,[[W,H],[W,H-65],[W-55,H-65],[W-110,H]],'#08121ccc');
 }else{
  poly(n,[[0,0],[150,0],[100,70],[0,100]],'#07101be0');poly(n,[[W,0],[W-150,0],[W-100,70],[W,100]],'#07101be0');
  for(const x of [13,W-36]){rect(n,x,108,23,112,'#202a2ce0','#a49d6b88');for(let y=118;y<208;y+=16)rect(n,x+5,y,13,5,'#dac38a99');}
 }
 save(near,z.id+'-near.png');
 // Own thumbnail, composed from the same three generated layers.
 const thumb=createCanvas(480,270),t=thumb.getContext('2d');for(const image of [far,mid,near])t.drawImage(image,0,0,480,270);save(thumb,z.id+'-preview.png');
}
// Original nonhumanoid industrial maintenance units. Four frames, 96 x 96.
const [units,u]=canvas(384,96);
for(let role=0;role<4;role++){u.save();u.translate(role*96,0);
 if(role===0){
  // Mole: squat service crawler with one large status lamp.
  for(const x of [22,38,58,74]){line(u,[[x,62],[x+(x<48?-7:7),78],[x+(x<48?-12:12),84]],'#758078',5);}
  poly(u,[[20,42],[35,31],[66,31],[78,45],[73,67],[25,67]],'#44535a','#b0b49a');rect(u,25,49,48,10,'#0c1922');circle(u,49,53,6,'#e6cf8a');rect(u,30,35,34,5,'#8c9180');
 }else if(role===1){
  // Blindado: visibly wide shell, front plates and an exposed copper rear port.
  for(const x of [23,70]){rect(u,x,65,12,19,'#263740','#8f9785');rect(u,x-6,81,25,7,'#6d776f');}
  poly(u,[[18,30],[35,15],[69,22],[83,42],[78,70],[22,70]],'#50605e','#c6c5a4');poly(u,[[57,21],[78,30],[88,62],[68,72],[52,56]],'#283e49','#c7c3a3');rect(u,21,39,16,25,'#a66e4c','#f0c087');circle(u,28,51,4,'#e9d9aa');line(u,[[62,29],[76,57]],'#d1d2ad',5);rect(u,43,32,15,5,'#e5d4a6');
 }else if(role===2){
  // Atirador: tall tripod, narrow barrel and triangular optical head.
  for(const [x,y]of [[16,86],[46,89],[82,86]])line(u,[[48,59],[x,y]],'#7c8a81',5);
  rect(u,40,36,16,32,'#374c57','#bcc2a4');poly(u,[[28,26],[48,10],[67,27],[61,46],[34,46]],'#708076','#d6d2ae');rect(u,52,29,35,9,'#899384','#e8dfbd');circle(u,43,28,5,'#efcf8e');rect(u,32,47,31,5,'#a67a4e');
 }else{
  // Elite: paired heavy arms and a crown-shaped maintenance yoke, no humanoid face.
  for(const x of [27,62]){line(u,[[x,62],[x-5,78],[x+2,86]],'#9b9f8c',9);rect(u,x-7,83,23,7,'#3d525a','#c3c3a0');}
  poly(u,[[24,27],[37,14],[65,14],[77,28],[73,66],[28,66]],'#64736a','#ece0b9');rect(u,32,34,36,15,'#122632');rect(u,36,39,12,5,'#e6c47e');rect(u,53,39,10,5,'#e6c47e');
  for(const x of [12,73]){rect(u,x,30,14,34,'#465c64','#b4b69b');line(u,[[x+7,57],[x+7,74]],'#c09a63',7);}rect(u,35,8,30,6,'#b58b58');rect(u,44,51,14,14,'#b0804c','#e8d7a7');
 }u.restore();}
save(units,'units.png');
// Accessible role identifiers: dot / hexagon / triangle / double chevron.
const [icons,ic]=canvas(256,64);for(let i=0;i<4;i++){const x=i*64;rect(ic,x+6,6,52,52,'#0d1b26','#818b7a');if(i===0)circle(ic,x+32,32,10,pal.ivory);if(i===1)poly(ic,[[x+22,15],[x+42,15],[x+51,32],[x+42,49],[x+22,49],[x+13,32]],pal.ivory);if(i===2)poly(ic,[[x+32,14],[x+49,48],[x+15,48]],pal.ivory);if(i===3){line(ic,[[x+14,34],[x+32,19],[x+50,34]],pal.ivory,5);line(ic,[[x+14,46],[x+32,31],[x+50,46]],pal.ivory,5);}}
save(icons,'role-icons.png');
// Porteiro: industrial quarantine carriage, 4 frames (closed / warning / open / defeated).
const [boss,bo]=canvas(640,160);
for(let f=0;f<4;f++){bo.save();bo.translate(f*160,0);const dead=f===3,exposed=f===2,warning=f===1;
 for(const x of [24,112]){rect(bo,x,113,25,31,dead?'#354044':'#59696b','#b6b99d');rect(bo,x-10,139,46,12,'#243b48','#889586');circle(bo,x+12,124,6,'#1b2b34','#9b9e84');}
 poly(bo,[[24,41],[42,24],[119,24],[137,42],[132,119],[29,119]],dead?'#374347':'#566a6d','#d3cfaf');
 rect(bo,49,37,63,73,'#132836','#a8b49e');
 if(exposed){glow(bo,80,74,42,'#f2d99d66');circle(bo,80,74,23,'#1c333c','#efe2b8');circle(bo,80,74,13,'#f1e1b2');line(bo,[[63,74],[97,74]],'#7c673f',3);line(bo,[[80,57],[80,91]],'#7c673f',3);}
 else{for(const x of [49,81]){rect(bo,x,38,31,71,'#6e7e79','#aeb99f');for(let y=49;y<105;y+=13)line(bo,[[x+5,y],[x+26,y]],'#2e4853',3);}rect(bo,66,58,28,12,dead?'#4b4e45':warning?'#f3c078':'#bbb991','#e3d6af');}
 for(const [x,side]of [[3,-1],[130,1]]){rect(bo,x,52,27,64,dead?'#384b52':'#3a535e','#bec3a5');line(bo,[[x+13,81],[x+13+side*(warning?5:0),127]],warning?'#d4ad6c':'#8e9b89',13);rect(bo,x-3,121,34,13,'#8a9685','#e3ddbc');}
 for(const x of [36,116]){rect(bo,x,14,12,24,'#9f956f','#ded3ac');rect(bo,x+3,10,6,6,dead?'#6b6d5d':warning?'#efc27f':'#d0c599');}
 rect(bo,59,116,43,8,'#b28b56');bolts(bo,29,27,104,89);
 if(warning){for(const x of [14,145])line(bo,[[x,22],[x,41]],'#f1cc89',4);}
 if(dead){line(bo,[[41,47],[67,66],[57,87],[91,108]],'#091725',6);line(bo,[[114,44],[103,66],[118,85]],'#172a34',4);}
 bo.restore();}
save(boss,'porteiro.png');const [bossStatic,bs]=canvas(160,160);bs.drawImage(boss,0,0,160,160,0,0,160,160);save(bossStatic,'porteiro-static.png');
// KAI-7: explicitly mechanical android, same 72x88 frame geometry as existing actors.
const [kai,k]=canvas(72*18,88);
for(let f=0;f<18;f++){k.save();k.translate(f*72+36,0);const run=f>=4&&f<12,s=run?Math.sin((f-4)/8*Math.PI*2):0,air=f===12||f===13,dash=f===14||f===15;
 if(dash){k.translate(4,6);k.rotate(.13);}for(const [x,a]of [[-7,air?-10:s*9],[7,air?10:-s*9]]){line(k,[[x,48],[x+a,63],[x+a*.55,79]],'#71878c',7);circle(k,x+a,63,4,'#182e3a','#d0d6bd');line(k,[[x+a*.55-2,81],[x+a*.55+9,81]],'#d2d5bc',5);line(k,[[x+a*.55,84],[x+a*.55+8,84]],'#c5ad73',1.5);}
 poly(k,[[-13,26],[-7,23],[9,24],[15,31],[10,49],[-10,49]],'#415e6e','#b6c5ba');rect(k,-8,31,18,12,'#122f40','#7e9d9c');for(let i=0;i<3;i++)rect(k,-5+i*5,34,2,7,i===1?'#f0dbab':'#b6bfa1');rect(k,-10,49,21,5,'#a8b7ad');
 line(k,[[-12,29],[-17,40],[-11,52]],'#6e858b',6);circle(k,-17,40,3,'#182d39','#d2d6be');
 // Right forearm is a built-in industrial emitter, never a flesh hand.
 line(k,[[12,30],[18,40],[25,40]],'#9aacaa',6);circle(k,18,40,3,'#203847','#d5dbc5');rect(k,22,34,15,12,'#3b5b70','#b6c8bb');rect(k,34,37,4,6,'#e5d4a3');
 rect(k,-3,18,7,8,'#6e8a92');poly(k,[[-9,5],[-5,1],[8,2],[12,8],[10,19],[3,23],[-7,20]],'#aab9b5','#dce2c9');rect(k,-7,8,16,7,'#142c3a');for(let x=-5;x<8;x+=4)rect(k,x,10,2,2,'#e0d5a8');rect(k,-7,17,13,3,'#3f5d68');line(k,[[-11,5],[-11,13]],'#d8c28f',2);rect(k,6,21,4,3,'#c6ae76');
 if(f===16){k.globalCompositeOperation='source-atop';k.fillStyle='#d99d5b77';k.fillRect(-35,0,70,88);}k.restore();}
save(kai,'kai7.png');const [portrait,pk]=canvas(180,180);rect(pk,0,0,180,180,'#0a1723');glow(pk,90,70,105,'#547b8733');rect(pk,13,13,154,154,'#00000000','#718e8d');pk.drawImage(kai,0,0,72,88,18,6,144,176);save(portrait,'kai7-portrait.png');
// Gameplay helpers with clear silhouettes, no embedded text needing localization.
const [platform,p]=canvas(128,48);rect(p,0,0,128,48,'#18303e');rect(p,0,0,128,3,'#e3dbb9');rect(p,0,4,128,7,'#8f9d8b');rect(p,0,12,128,5,'#3d555d');rect(p,4,22,120,21,'#1d3441','#7e8e81');for(let x=8;x<120;x+=24)line(p,[[x,40],[x+13,24]],'#687d7c',2);save(platform,'platform.png');
const [terminal,te]=canvas(64,96);rect(te,12,13,41,60,'#344c57','#bbc3ab');rect(te,18,21,29,28,'#0b202d','#aebba1');line(te,[[22,31],[28,37],[41,27]],'#e5d6a6',3);rect(te,23,74,18,14,'#71867f');rect(te,13,86,38,6,'#b5baa0');save(terminal,'terminal.png');
const [memory,me]=canvas(32,32);poly(me,[[16,1],[28,16],[16,30],[4,16]],'#e9dfb9','#adbaab');poly(me,[[16,7],[23,16],[16,24],[9,16]],'#6a8d8f');save(memory,'memory.png');
const [steam,st]=canvas(128,128);glow(st,64,64,61,'#d5dbd963');save(steam,'steam.png');
fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify({generator:'v17/scripts/create-art.cjs',license:'MIT',copyright:'2026 MANUEL SAMPAIO01',files:generated,atlases:{'units.png':{frameWidth:96,frameHeight:96,frames:['mole','blindado','atirador','elite']},'role-icons.png':{frameWidth:64,frameHeight:64,frames:['mole','blindado','atirador','elite']},'porteiro.png':{frameWidth:160,frameHeight:160,frames:['closed','warning','exposed','defeated']},'kai7.png':{frameWidth:72,frameHeight:88,frames:18,idle:[0,3],run:[4,11],air:[12,13],dash:[14,15],hurt:16}}},null,2)+'\n');
console.log('Generated original v17 assets:',fs.readdirSync(out).map(n=>n+' '+fs.statSync(path.join(out,n)).size+' B').join(', '));
