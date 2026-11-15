// 25 original futuristic environments, generated reproducibly from arena data.
const {createCanvas}=require('@napi-rs/canvas'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),out=path.join(root,'assets/paradox');fs.mkdirSync(out,{recursive:true});
const ctx=vm.createContext({});ctx.window=ctx;vm.runInContext(fs.readFileSync(path.join(root,'paradox-data.js'),'utf8'),ctx);
for(const name of ['bay','rail','dunes','falls','cliffs']){const p=path.join(out,name+'.png');if(fs.existsSync(p))fs.unlinkSync(p);}
for(const [index,level]of ctx.ParadoxData.levels.entries()){
 const c=createCanvas(896,616),g=c.getContext('2d'),accent=level.color,seed=index+1;
 const sky=g.createLinearGradient(0,0,896,616);sky.addColorStop(0,['#101f35','#172335','#232139','#19283a','#0e3037'][index%5]);sky.addColorStop(.6,level.ground);sky.addColorStop(1,'#081a29');g.fillStyle=sky;g.fillRect(0,0,896,616);
 const glow=g.createRadialGradient(150+seed*27%600,120+seed*19%200,5,450,270,650);glow.addColorStop(0,accent+'45');glow.addColorStop(1,accent+'00');g.fillStyle=glow;g.fillRect(0,0,896,616);
 // Distinct structure silhouette per arena: rings, towers, lattice, shafts or chasms.
 const kind=index%5;g.save();g.translate(448,308);g.rotate((seed%7-3)*.09);g.strokeStyle=accent+'35';g.fillStyle='#0c213988';
 if(kind===0){for(let j=0;j<4;j++){g.lineWidth=12-j*2;g.beginPath();g.ellipse(25-j*20,0,140+j*80,100+j*50,.2,0,Math.PI*2);g.stroke();}g.fillRect(-370,160,740,110);}
 if(kind===1){for(let j=0;j<8;j++){const x=-400+j*117,h=100+(j*seed*31)%260;g.fillStyle=j%2?'#19374c':'#102b43';g.fillRect(x,180-h,80,h+120);g.fillStyle=accent+'44';for(let y=200-h;y<250;y+=24)g.fillRect(x+14,y,8,6);}}
 if(kind===2){for(let j=0;j<7;j++){g.lineWidth=3;g.strokeRect(-390+j*31,-210+j*25,780-j*62,420-j*50);g.beginPath();g.moveTo(-390+j*31,-210+j*25);g.lineTo(390-j*31,210-j*25);g.stroke();}}
 if(kind===3){for(let j=0;j<9;j++){const x=-420+j*105;g.fillStyle='#142d46';g.fillRect(x,-280,55,560);g.strokeStyle=accent+'33';g.strokeRect(x,-280,55,560);g.fillStyle=accent+'25';g.fillRect(x+18,-180+(j*seed%6)*40,7,210);}}
 if(kind===4){g.fillStyle='#10243e';g.beginPath();g.moveTo(-480,-260);g.lineTo(-70,-160);g.lineTo(-110,120);g.lineTo(-390,300);g.lineTo(-480,300);g.fill();g.beginPath();g.moveTo(480,-300);g.lineTo(100,-210);g.lineTo(40,140);g.lineTo(360,300);g.lineTo(480,300);g.fill();g.lineWidth=3;g.beginPath();g.moveTo(-70,-160);g.lineTo(-110,120);g.lineTo(-390,300);g.moveTo(100,-210);g.lineTo(40,140);g.lineTo(360,300);g.stroke();}
 g.restore();
 // Energy conduits and holographic nodes use different routing in every scene.
 g.strokeStyle=accent+'28';g.lineWidth=2;for(let j=0;j<7;j++){const x=(seed*67+j*137)%896,y=(seed*59+j*91)%616;g.beginPath();g.moveTo(x,0);g.lineTo(x,y);g.lineTo((x+180+seed*11)%896,y);g.lineTo((x+180+seed*11)%896,616);g.stroke();g.fillStyle=accent+'66';g.fillRect(x-3,y-3,6,6);}
 g.strokeStyle=accent+'12';g.lineWidth=1;for(let x=0;x<896;x+=32){g.beginPath();g.moveTo(x,0);g.lineTo(x,616);g.stroke();}for(let y=0;y<616;y+=32){g.beginPath();g.moveTo(0,y);g.lineTo(896,y);g.stroke();}
 g.font='900 150px sans-serif';g.textAlign='right';g.fillStyle=accent+'0b';g.fillText(String(seed).padStart(2,'0'),870,570);
 const shade=g.createLinearGradient(0,0,0,616);shade.addColorStop(0,'#071a2a00');shade.addColorStop(1,'#04152388');g.fillStyle=shade;g.fillRect(0,0,896,616);
 fs.writeFileSync(path.join(out,level.id+'.png'),c.toBuffer('image/png'));
}
for(const size of [192,512]){const c=createCanvas(size,size),g=c.getContext('2d');g.fillStyle='#102d35';g.fillRect(0,0,size,size);g.strokeStyle='#e6cd91';g.lineWidth=size*.025;g.beginPath();g.arc(size*.5,size*.5,size*.34,0,6.28);g.stroke();g.strokeStyle='#96dace';g.globalAlpha=.6;g.beginPath();g.arc(size*.5,size*.5,size*.41,-1.3,3.5);g.stroke();g.globalAlpha=1;g.fillStyle='#ecdbad';g.font='900 '+size*.25+'px sans-serif';g.textAlign='center';g.fillText('404',size*.5,size*.58);g.fillStyle='#d67d68';g.fillRect(size*.35,size*.69,size*.3,size*.03);fs.writeFileSync(path.join(out,'icon-'+size+'.png'),c.toBuffer('image/png'));}
console.log('Generated 25 unique futuristic arena backdrops and app icons.');
