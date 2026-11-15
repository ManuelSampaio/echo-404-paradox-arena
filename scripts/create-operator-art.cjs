// Original articulated operator art. Same frame geometry and hitbox for everyone.
const {createCanvas}=require('@napi-rs/canvas'),fs=require('node:fs'),path=require('node:path');
const out=path.join(__dirname,'../assets/operators');fs.mkdirSync(out,{recursive:true});
const palettes=[{id:'axiom',accent:'#5ff3e5',skin:'#b7795c',hair:'#172330',armor:'#294657'},{id:'nyra',accent:'#dca0ff',skin:'#774c42',hair:'#1b172d',armor:'#413953'},{id:'kai7',accent:'#ffc578',skin:'#d8a285',hair:'#d8dfed',armor:'#394759'}];
const line=(c,p,color,w)=>{c.strokeStyle=color;c.lineWidth=w;c.lineCap='round';c.lineJoin='round';c.beginPath();p.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();};
const save=(c,n)=>fs.writeFileSync(path.join(out,n),c.toBuffer('image/png'));
for(const a of palettes){const c=createCanvas(72*18,88),g=c.getContext('2d');
 for(let f=0;f<18;f++){
  g.save();g.translate(f*72+36,0);const run=f>=4&&f<12,angle=(f-4)/8*Math.PI*2,s=run?Math.sin(angle):0,air=f===12||f===13,dash=f===14||f===15;
  g.translate(dash?5:0,run?Math.cos(angle*2):Math.sin(f)*.4);if(dash){g.translate(0,7);g.rotate(.16);}
  const back=air?-10:s*11,front=air?8:-s*11;
  // Long articulated legs, segmented shin armour and magnetic boots.
  for(const [offset,knee,color]of [[-5,back,'#152838'],[6,front,a.armor]]){
   line(g,[[offset,49],[offset+knee,65],[offset+knee*.55,81]],color,8);
   line(g,[[offset+knee,66],[offset+knee*.55,77]],'#516579',5);
   line(g,[[offset+knee*.55-1,80],[offset+knee*.55+7,81]],'#111c2c',7);
   line(g,[[offset+knee*.55,83],[offset+knee*.55+8,83]],a.accent,1.4);
  }
  g.fillStyle='#122132';g.fillRect(-11,24,23,28);g.fillStyle=a.armor;
  g.beginPath();g.moveTo(-12,25);g.lineTo(8,24);g.lineTo(14,34);g.lineTo(9,49);g.lineTo(-9,49);g.closePath();g.fill();
  g.fillStyle='#6a8190';g.beginPath();g.moveTo(-9,27);g.lineTo(6,27);g.lineTo(8,37);g.lineTo(0,41);g.lineTo(-8,36);g.fill();
  line(g,[[-8,28],[0,34],[8,29]],a.accent,1.7);g.fillStyle=a.accent;g.fillRect(-2,36,4,6);
  g.fillStyle='#0b1828';g.fillRect(-10,48,22,5);g.fillStyle='#a2b9c3';g.fillRect(-1,48,5,3);
  // Backpack and separate arms preserve a readable human silhouette.
  g.fillStyle='#203344';g.fillRect(-16,28,6,17);g.fillStyle=a.accent;g.fillRect(-16,29,2,9);
  const arm=air?-.8:run?s*.8:.08;
  for(const [x,rotation,shade]of [[-11,-arm,'#233547'],[11,arm,a.armor]]){g.save();g.translate(x,28);g.rotate(rotation);line(g,[[0,0],[x<0?-4:3,11],[0,22]],shade,6);line(g,[[x<0?-4:3,13],[0,19]],'#718794',4);g.fillStyle='#182736';g.fillRect(-2,20,5,6);g.fillStyle=a.accent;g.fillRect(-2,14,3,2);g.restore();}
  g.fillStyle=a.skin;g.fillRect(-2,19,7,8);g.fillStyle=a.hair;
  g.beginPath();g.ellipse(0,12,8,10,0,0,Math.PI*2);g.fill();g.fillStyle=a.skin;
  g.beginPath();g.moveTo(-5,6);g.quadraticCurveTo(6,2,8,10);g.lineTo(8,17);g.lineTo(4,22);g.lineTo(-3,20);g.lineTo(-6,13);g.fill();
  g.fillStyle=a.hair;g.beginPath();g.moveTo(-8,12);g.lineTo(-8,5);g.quadraticCurveTo(0,-2,8,4);g.lineTo(10,8);g.lineTo(2,7);g.lineTo(-2,5);g.lineTo(-5,13);g.fill();
  // A small optical visor leaves the face visible.
  line(g,[[0,11],[8,11]],'#163340',3);line(g,[[1,10],[8,10]],a.accent,1.2);g.fillStyle='#f2c7ad';g.fillRect(8,13,2,2);g.fillStyle='#704b4a';g.fillRect(3,18,4,1);
  if(a.id==='nyra'){line(g,[[-6,5],[-12,11],[-15,23+s*2]],a.hair,5);g.fillStyle=a.accent;g.fillRect(-12,12,3,2);}
  if(a.id==='kai7'){g.fillStyle='#627c90';g.fillRect(-6,13,3,7);g.fillStyle=a.accent;g.fillRect(-6,13,2,2);}
  line(g,[[-5,24],[4,24],[10,26]],a.accent,2);g.restore();
 }
 save(c,a.id+'.png');
 const portrait=createCanvas(180,180),p=portrait.getContext('2d');const bg=p.createRadialGradient(90,80,10,90,90,120);bg.addColorStop(0,a.armor);bg.addColorStop(1,'#0a1526');p.fillStyle=bg;p.fillRect(0,0,180,180);p.strokeStyle=a.accent;p.globalAlpha=.35;p.lineWidth=1;p.strokeRect(12,12,156,156);p.globalAlpha=1;p.drawImage(c,0,0,72,88,18,6,144,176);save(portrait,a.id+'-portrait.png');
}
const horizon=createCanvas(1920,1080),b=horizon.getContext('2d'),gradient=b.createLinearGradient(0,0,0,1080);gradient.addColorStop(0,'#050b21');gradient.addColorStop(.6,'#112b4a');gradient.addColorStop(1,'#18394d');b.fillStyle=gradient;b.fillRect(0,0,1920,1080);
for(let i=0;i<180;i++){b.fillStyle=i%5?'#91bdd655':'#bdf9ed';b.fillRect(i*157%1920,i*83%760,i%5?1:2,1);}
b.strokeStyle='#5ff3e533';b.lineWidth=16;b.beginPath();b.ellipse(1090,360,540,190,-.25,0,Math.PI*2);b.stroke();b.lineWidth=2;b.strokeStyle='#83fff188';b.stroke();
for(let layer=0;layer<3;layer++)for(let i=0;i<26;i++){const x=i*85-layer*39,h=140+(i*73+layer*51)%400,y=1020-layer*50-h;b.fillStyle=['#102139','#132b45','#153952'][layer];b.fillRect(x,y,55,h+100);b.beginPath();b.moveTo(x,y);b.lineTo(x+28,y-30);b.lineTo(x+55,y);b.fill();b.fillStyle=layer===2?'#56decc55':'#a899ff44';for(let q=y+20;q<1080;q+=23)b.fillRect(x+8+(i%3)*9,q,5,8);b.fillStyle='#82f8e988';b.fillRect(x+1,y+1,1,h);}
for(let n=0;n<3;n++){line(b,[[0,800+n*90],[1920,570+n*90]],'#5bb9db22',5);line(b,[[0,803+n*90],[1920,573+n*90]],'#ac8aff44',1);}
save(horizon,'horizon.png');
const platform=createCanvas(128,64),p=platform.getContext('2d');p.fillStyle='#14243a';p.fillRect(0,0,128,64);p.fillStyle='#68f8e0';p.fillRect(0,0,128,3);p.fillStyle='#315776';p.fillRect(0,4,128,9);p.strokeStyle='#577b94';p.strokeRect(4,18,120,38);for(let i=9;i<120;i+=24){line(p,[[i,52],[i+15,23]],'#314a66',3);p.fillStyle='#aba4ff';p.fillRect(i,10,9,2);}save(platform,'platform.png');
console.log('Generated three original operators, portraits and futuristic station art.');
