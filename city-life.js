// MVT 6 City Life Update — low-poly detailed props, street residents and dialogue.
// No copyrighted assets. All geometry is procedural.
export function createCityLife({THREE,scene,box,mesh,mat,roadPositions,rnd,collision,getPlayer,isPlaying,onNotice,onReward,onStoryContact}){
const citizens=[],props=[],clock=new THREE.Clock(),npcNames=['Ava','Mason','Nia','Kai','Sofia','Jordan','Riley','Sam','Aria','Luca','Noah','Maya','Zoe','Max','Ellie','Leo','Ivy','Finn','Nova','Alex','Charlie','Harper','Jules','Jamie'];
const stories=[
 ['The city looks great from the waterfront after sunset.','Thanks for showing me around. Here is a small tip!',75],
 ['I work at the marina. The quickest road runs straight south.','Good luck out there!',55],
 ['My old car is parked near the garage on the east side.','That sounds like a good place to go.',45],
 ['Have you tried the express delivery jobs yet?','Safe driving makes a difference.',60],
 ['I have been exploring the market district all afternoon.','Enjoy your time in Solara!',40],
 ['The sports cars here are surprisingly fast.','Thanks for stopping to chat.',50]
];
const skin=['#f4c4a1','#a76e52','#e4b28c','#6e4939','#c28d67'];
const shirts=['#ea785e','#4a9eb5','#8a77bf','#e6ba5a','#6aaf8d','#cb80a7'];
const trousers=['#303c50','#49415c','#4d5556'];
const legGeo=new THREE.CapsuleGeometry(.15,.65,3,6),armGeo=new THREE.CapsuleGeometry(.13,.55,3,6),headGeo=new THREE.SphereGeometry(.34,10,7);
function human(i,x,z){
 const root=new THREE.Group();scene.add(root);root.position.set(x,0,z);
 const color=mat(shirts[i%shirts.length]),pant=mat(trousers[i%trousers.length]),face=mat(skin[i%skin.length]),hair=mat(['#32241e','#d4a05f','#141c24','#76573c'][i%4]);
 const torso=box(.8,1.04,.4,0,1.75,0,color,root);
 const neck=box(.2,.19,.2,0,2.36,0,face,root);
 const head=mesh(headGeo,face,root);head.position.y=2.69;
 const cap=mesh(new THREE.SphereGeometry(.345,9,5,0,Math.PI*2,0,1.20),hair,root);cap.position.set(0,2.78,0);
 const arms=[],legs=[];
 for(const side of [-1,1]){
  const a=new THREE.Group();a.position.set(side*.54,2.17,0);root.add(a);
  const arm=mesh(armGeo,color,a);arm.position.y=-.48;arms.push(a);
  const leg=new THREE.Group();leg.position.set(side*.23,1.28,0);root.add(leg);
  const shin=mesh(legGeo,pant,leg);shin.position.y=-.61;
  box(.32,.18,.52,0,-1.14,.13,mat('#242a30'),leg);legs.push(leg);
 }
 return {root,arms,legs,x,z,baseX:x,baseZ:z,phase:i*1.63,angle:i*.91,walk:0,name:npcNames[i%npcNames.length],id:i,chatIndex:0};
}
function streetPoint(i){
 const road=roadPositions[Math.floor(rnd(i*7+1)*roadPositions.length)],horizontal=rnd(i*9+2)>.5;
 const offset=(rnd(i*9+3)>.5?1:-1)*14.4;
 const travel=(rnd(i*9+4)-.5)*865;
 return horizontal?{x:travel,z:road+offset}:{x:road+offset,z:travel};
}
// Named contact for story jobs, stays by the start-of-game sidewalk.
const fixer=human(29,12.5,-18);fixer.name='Rae';fixer.role='fixer';fixer.root.rotation.y=Math.PI/2;
for(let i=0;i<28;i++){
 let p=streetPoint(i+12);
 if(collision(p.x,p.z)){p=streetPoint(i+101)}
 if(!collision(p.x,p.z))citizens.push(human(i,p.x,p.z));
}
const dark=mat('#1d323a',.85),silver=mat('#85949b'),glow=new THREE.MeshBasicMaterial({color:0xffe3a4}),wood=mat('#87644c'),planter=mat('#596f65');
// Sparse street furniture near intersections. Keep draw calls moderate.
for(let i=-4;i<=4;i+=2)for(let j=-4;j<=4;j+=2){
 const x=i*92+17,z=j*92+17;
 const pole=new THREE.Group();scene.add(pole);pole.position.set(x,0,z);props.push(pole);
 box(.24,8.5,.24,0,4.25,0,dark,pole);box(2.3,.22,.28,-1.05,8.43,0,dark,pole);
 box(.9,.2,.5,-2.1,8.24,0,glow,pole);
}
for(let i=0;i<16;i++){
 const x=(i%4-1.5)*182+30,z=(Math.floor(i/4)-1.5)*182+30;
 if(collision(x,z))continue;
 const b=new THREE.Group();scene.add(b);b.position.set(x,0,z);props.push(b);
 box(3,.36,.9,0,.95,0,wood,b);for(const side of [-1,1])box(.15,1,.16,side*1.1,.50,0,dark,b);
 box(3,.78,.18,0,1.42,-.4,wood,b);
}
let active=null,dialogUntil=0;
const pop=document.createElement('div');pop.id='citizenPrompt';pop.style.cssText='display:none;position:fixed;bottom:160px;left:50%;transform:translateX(-50%);z-index:7;background:#0b1d2fe8;border:1px solid #75e6bfaa;border-radius:12px;padding:11px 17px;color:white;font:700 13px system-ui;pointer-events:none;box-shadow:0 8px 24px #0008';document.body.appendChild(pop);
const dialog=document.createElement('div');dialog.id='citizenDialog';dialog.style.cssText='display:none;position:fixed;bottom:205px;left:50%;transform:translateX(-50%);z-index:8;max-width:min(480px,90vw);background:#112439f2;border:1px solid #73e6b7b0;border-radius:14px;padding:15px 19px;color:#f5fbff;box-shadow:0 14px 50px #0009;font:14px/1.55 system-ui';document.body.appendChild(dialog);
function nearest(){const p=getPlayer();if(p.inCar)return null;let best=null,d=5.2;for(const n of [fixer,...citizens]){const distance=Math.hypot(p.x-n.root.position.x,p.z-n.root.position.z);if(distance<d){best=n;d=distance}}return best}
function interact(){const n=nearest();if(!n)return false;if(n.role==='fixer'){onStoryContact?.();return true}active=n;const story=stories[n.id%stories.length];const first=n.chatIndex++===0;dialog.innerHTML='<b style="color:#6ee8ba">'+n.name+'</b><div style="margin-top:5px">'+(first?story[0]:story[1])+'</div><small style="color:#a7c4cf">Press F to talk again · Walk away to close</small>';dialog.style.display='block';dialogUntil=performance.now()+6500;if(first){onReward(story[2]);onNotice(n.name+' gave you $'+story[2]+' for helping around town')}return true}
let lastNpc=0;
function update(dt,now){
 // NPC movement update at 30fps; animation and camera interaction run every frame.
 if(now-lastNpc>33){const step=Math.min(.05,(now-lastNpc)/1000||dt);lastNpc=now;for(const n of citizens){
 const nearby=Math.hypot(n.root.position.x-getPlayer().x,n.root.position.z-getPlayer().z)<145;
 n.root.visible=nearby;
 if(!nearby)continue;
 const cycle=now*.0002+n.phase;const targetX=n.baseX+Math.cos(cycle)*7,targetZ=n.baseZ+Math.sin(cycle)*7;
 if(!collision(targetX,targetZ)){n.root.position.x+=(targetX-n.root.position.x)*Math.min(.065,step*2);n.root.position.z+=(targetZ-n.root.position.z)*Math.min(.065,step*2)}
 n.root.rotation.y=Math.atan2(-Math.sin(cycle),Math.cos(cycle));
 const gait=now*.004+n.phase;const swing=Math.sin(gait)*.28;
 n.legs[0].rotation.x=swing;n.legs[1].rotation.x=-swing;
 n.arms[0].rotation.x=-swing*.75;n.arms[1].rotation.x=swing*.75;
 }}
 if(!isPlaying()){pop.style.display='none';dialog.style.display='none';return}
 const n=nearest();
 pop.style.display=n?'block':'none';if(n)pop.textContent=n.role==='fixer'?'F  ·  Talk to Rae (street jobs)':'F  ·  Talk to '+n.name;
 if(!n||now>dialogUntil)dialog.style.display='none';
}
return {update,interact,citizens,fixer};
}
