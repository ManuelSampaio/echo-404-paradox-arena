// Reproducible in-repo artwork; dev dependency: @napi-rs/canvas.
const {createCanvas}=require('@napi-rs/canvas'),fs=require('node:fs'),path=require('node:path');
const out=path.join(__dirname,'../assets/origin');fs.mkdirSync(out,{recursive:true});
const save=(canvas,name)=>fs.writeFileSync(path.join(out,name),canvas.toBuffer('image/png'));
function stroke(ctx,points,color,width){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();}
const atlas=createCanvas(72*18,88),a=atlas.getContext('2d');
for(let f=0;f<18;f++){
 a.save();a.translate(f*72+36,0);
 const running=f>=4&&f<=11,phase=running?(f-4)/8*Math.PI*2:f*.9,s=running?Math.sin(phase):0;
 const airborne=f===12||f===13,dashing=f===14||f===15,bob=running?Math.cos(phase*2)*1.5:Math.sin(phase)*.7;
 a.translate(dashing?6:0,bob);if(dashing){a.translate(0,10);a.rotate(.2);}
 // Rear leg and boot, then front leg: articulated hips, knees and ankles.
 const back=airborne?-8:s*11,front=airborne?10:-s*11;
 stroke(a,[[-4,55],[-7+back,68],[-5+back*.6,81]],'#1c3346',8);
 a.fillStyle='#82949a';a.fillRect(-11+back*.6,79,14,6);
 stroke(a,[[5,55],[7+front,68],[6+front*.8,81]],'#36566b',8);
 a.fillStyle='#b6b8ac';a.fillRect(1+front*.8,79,15,6);
 // Jacket and backpack, with a cloth outline rather than a square hitbox.
 a.fillStyle='#152b39';a.beginPath();a.moveTo(-13,29);a.lineTo(-19,34);a.lineTo(-18,55);a.lineTo(-10,58);a.fill();
 a.fillStyle='#407784';a.beginPath();a.moveTo(-10,28);a.quadraticCurveTo(4,24,12,30);a.lineTo(14,56);a.lineTo(-12,58);a.closePath();a.fill();
 a.fillStyle='#699c9c';a.beginPath();a.moveTo(1,28);a.lineTo(10,31);a.lineTo(12,53);a.lineTo(2,54);a.fill();
 stroke(a,[[-9,32],[0,42],[10,44]],'#abc5b5',2);a.fillStyle='#d3e9a5';a.fillRect(4,33,5,7);
 a.fillStyle='#1a2f3e';a.fillRect(-11,54,24,5);a.fillStyle='#f1d29b';a.fillRect(0,54,5,4);
 const arm=airborne?-.7:running?s*.65:.1;
 a.save();a.translate(-10,32);a.rotate(-arm);stroke(a,[[0,0],[-4,12],[-2,23]],'#2d586a',7);a.fillStyle='#bd8b70';a.beginPath();a.ellipse(-2,24,3,4,0,0,Math.PI*2);a.fill();a.restore();
 a.save();a.translate(11,32);a.rotate(arm);stroke(a,[[0,0],[4,12],[1,22]],'#629298',7);a.fillStyle='#d9a181';a.beginPath();a.ellipse(1,23,3,4,0,0,Math.PI*2);a.fill();a.restore();
 a.fillStyle='#9a6c58';a.fillRect(-3,23,8,8);
 a.fillStyle='#d7a081';a.beginPath();a.moveTo(-7,8);a.quadraticCurveTo(5,1,11,12);a.lineTo(10,21);a.lineTo(4,27);a.lineTo(-4,25);a.lineTo(-9,18);a.closePath();a.fill();
 a.fillStyle='#f0bda0';a.fillRect(6,14,6,4);a.fillStyle='#25343d';a.fillRect(7,12,3,2);
 a.fillStyle='#302d36';a.beginPath();a.moveTo(-10,17);a.lineTo(-11,8);a.quadraticCurveTo(-1,-3,10,6);a.lineTo(13,11);a.lineTo(3,10);a.lineTo(-3,7);a.lineTo(-5,19);a.fill();
 a.fillStyle='#6a4b42';a.fillRect(2,23,6,2);
 // Ochre scarf makes the explorer identifiable at phone scale.
 a.fillStyle='#dbbc76';a.beginPath();a.moveTo(-8,27);a.lineTo(9,27);a.lineTo(10,32);a.lineTo(-9,32);a.fill();
 a.beginPath();a.moveTo(-7,29);a.lineTo(-22-(running?Math.abs(s)*8:0),33);a.lineTo(-18,39+s*2);a.lineTo(-6,32);a.fill();
 if(f===16){a.globalCompositeOperation='source-atop';a.fillStyle='#ff9d8c88';a.fillRect(-35,0,70,88);}
 a.restore();
}save(atlas,'explorer.png');
const enemies=createCanvas(64*12,80),e=enemies.getContext('2d');
for(let i=0;i<12;i++){
 e.save();e.translate(i*64+32,0);const phase=i%4*Math.PI/2;
 if(i<4){
  stroke(e,[[-7,47],[-10+Math.sin(phase)*7,62],[-7,76]],'#405465',8);stroke(e,[[8,47],[10-Math.sin(phase)*7,62],[10,76]],'#7b8b92',8);
  e.fillStyle='#4e6978';e.fillRect(-14,22,29,30);e.fillStyle='#9ea9a4';e.fillRect(-11,8,23,18);e.fillStyle='#f39d89';e.fillRect(-7,14,16,4);e.fillStyle='#202e3e';e.fillRect(-19,31,9,23);e.fillRect(12,28,20,7);e.fillStyle='#d8d79e';e.fillRect(-3,27,6,8);
 }else if(i<8){e.fillStyle='#2b3e50';e.fillRect(-8,35,16,40);e.fillStyle='#71858d';e.fillRect(-25,68,50,10);e.fillStyle='#9ca89e';e.fillRect(-22,18,44,26);e.fillStyle='#efaa86';e.fillRect(-15,24,15,6);e.fillStyle='#233c4c';e.fillRect(16,29,24,8);e.strokeStyle='#b9b995';e.lineWidth=2;e.strokeRect(-23,17,46,28);
 }else{e.translate(0,43);e.fillStyle='#59727c';e.fillRect(-22,0,42,15);e.fillStyle='#a9b9af';e.beginPath();e.moveTo(17,0);e.lineTo(30,-6);e.lineTo(32,8);e.lineTo(20,14);e.fill();e.fillStyle='#ffb18e';e.fillRect(26,0,6,3);for(const n of [-1,1])stroke(e,[[n*15,12],[n*24,21+Math.sin(phase+n)*4],[n*20,32]],'#778c94',4);}
 e.restore();
}save(enemies,'patrols.png');
const plat=createCanvas(128,64),p=plat.getContext('2d');p.fillStyle='#1e3948';p.fillRect(0,0,128,64);p.fillStyle='#76918e';p.fillRect(0,0,128,6);p.fillStyle='#b4c9b0';p.fillRect(0,0,128,2);p.fillStyle='#3c5967';p.fillRect(0,10,128,5);p.strokeStyle='#54717a';p.lineWidth=2;p.strokeRect(4,20,120,35);p.beginPath();p.moveTo(8,55);p.lineTo(64,20);p.lineTo(120,55);p.stroke();for(const x of [8,120]){p.fillStyle='#b9b995';p.beginPath();p.arc(x,9,2,0,7);p.fill();}save(plat,'platform.png');
const bg=createCanvas(1920,1080),b=bg.getContext('2d');const sky=b.createLinearGradient(0,0,0,1080);sky.addColorStop(0,'#102639');sky.addColorStop(.56,'#385862');sky.addColorStop(1,'#b6b798');b.fillStyle=sky;b.fillRect(0,0,1920,1080);
const sun=b.createRadialGradient(1400,490,20,1400,490,600);sun.addColorStop(0,'#f0d39777');sun.addColorStop(1,'#d9c99200');b.fillStyle=sun;b.fillRect(0,0,1920,1080);
b.fillStyle='#ecdfae';b.beginPath();b.arc(1400,490,78,0,7);b.fill();
// Several hand-composed mountain ridges, haze and the abandoned orbital ring.
for(let layer=0;layer<4;layer++){b.fillStyle=['#526f73','#45636c','#345666','#254454'][layer];b.beginPath();b.moveTo(0,1080);for(let x=-100;x<=2050;x+=100){const y=660+layer*90-Math.abs(Math.sin(x*.003+layer))*180;b.lineTo(x,y);}b.lineTo(1920,1080);b.fill();}
b.save();b.translate(660,500);b.rotate(-.3);b.strokeStyle='#78938e66';b.lineWidth=44;b.beginPath();b.ellipse(0,0,420,310,0,0,Math.PI*2);b.stroke();b.strokeStyle='#b7c6a033';b.lineWidth=3;b.beginPath();b.ellipse(0,0,448,337,0,0,Math.PI*2);b.stroke();b.restore();
for(let i=0;i<15;i++){const x=i*147+40,h=120+(i*71%200);b.fillStyle='#23455588';b.fillRect(x,910-h,50+(i%3)*27,h);b.fillStyle='#b9cba933';for(let y=930-h;y<900;y+=24)b.fillRect(x+8,y,8,4);}
for(let i=0;i<120;i++){b.fillStyle=i%4?'#c5dcc322':'#edf7dd66';b.fillRect((i*163)%1920,(i*79)%550,i%4?1:2,1);}save(bg,'horizon.png');
console.log('Origin artwork:',fs.readdirSync(out).map(n=>n+' '+fs.statSync(path.join(out,n)).size+' B').join(', '));
