const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const notes=[],root=path.resolve(__dirname,'..');let resumed=0,muted=false;
class AudioContext{constructor(){this.currentTime=10;}resume(){resumed++;return Promise.resolve();}createOscillator(){const note={};notes.push(note);return {frequency:{setValueAtTime(value){note.frequency=value;}},set type(value){note.type=value;},connect(){},start(time){note.start=time;},stop(time){note.end=time;}};}createGain(){return {gain:{setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){}};}}
const w=vm.createContext({Phaser:{Scene:class{}},ORIGIN_PILOT_NO_BOOT:true,AudioContext,localStorage:{getItem:()=>muted?'false':null}});w.window=w;
for(const file of ['origin-feel-config.js','origin-pilot-data.js','origin-abilities.js','origin-pilot.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),w);
const sound=new w.OriginPilotSound();sound.unlock();assert.equal(resumed,1);
const profile=type=>{notes.length=0;sound.play(type);return JSON.parse(JSON.stringify(notes));};
const short=profile('jump-short'),high=profile('jump-high'),start=profile('echo-start'),fixed=profile('echo-fix');
assert.equal(short.length,2);assert.equal(high.length,2);assert.notDeepEqual(short,high);assert.ok(high[1].end-short[1].end>.08);assert.equal(start.length,2);assert.equal(fixed.length,3);assert.notDeepEqual(start,fixed);
sound.enabled=false;assert.equal(profile('echo-fix').length,0);assert.equal(profile('jump-high').length,0);
muted=true;assert.equal(new w.OriginPilotSound().enabled,false);
console.log('PASS: distinct short/high jumps, echo start/fix tones, user-gesture audio unlock and persisted mute');
