// MVT 6 City Life Update — low-poly detailed props, street residents and dialogue.
// No copyrighted assets. All geometry is procedural.
import {clearsStreet} from './game-core.js';
export function createCityLife({THREE,scene,box,mesh,mat,roadPositions,rnd,collision,publicSpaces=[],getPlayer,isPlaying,onNotice,onReward,onStoryContact}){
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
// Reusable fabric details: woven textile grain, seams and creases without costly loaded models.
const textile=[];
for(let k=0;k<6;k++){
 const cv=document.createElement('canvas');cv.width=128;cv.height=128;const c=cv.getContext('2d');
 c.fillStyle='#dedbd6';c.fillRect(0,0,128,128);
 for(let y=0;y<128;y+=3){c.strokeStyle=y%2?'#b3ada933':'#ffffff88';c.beginPath();c.moveTo(0,y);c.lineTo(128,y);c.stroke()}
 for(let i=0;i<250;i++){const x=(i*67+k*43)%128,y=(i*37+k*23)%128;c.fillStyle=i%3?'#ffffff14':'#746c6c18';c.fillRect(x,y,1,2)}
 c.strokeStyle='#77747a55';c.lineWidth=2;c.strokeRect(7,7,114,114);
 const tex=new THREE.CanvasTexture(cv);tex.colorSpace=THREE.SRGBColorSpace;textile.push(tex);
}
const legGeo=new THREE.CapsuleGeometry(.15,.65,3,8),armGeo=new THREE.CapsuleGeometry(.13,.55,3,8),headGeo=new THREE.SphereGeometry(.34,14,10);
const eyeMat=new THREE.MeshStandardMaterial({color:0x292726,roughness:.42});
const soleMat=mat('#262a33');
// Shared wardrobe trim and accessory materials keep GPU material counts bounded.
const stitchingMat=mat('#b3a99b'),metalMat=new THREE.MeshStandardMaterial({color:0x8d9ba5,metalness:.6,roughness:.36});
const glassMat=new THREE.MeshStandardMaterial({color:0x263d46,metalness:.12,roughness:.25});
const jacketMat=[mat('#243d54'),mat('#6f5145'),mat('#3d615c'),mat('#424656')];
const capBrimGeo=new THREE.BoxGeometry(.53,.075,.24);
const hairLockGeo=new THREE.CapsuleGeometry(.065,.16,3,6);


function human(i,x,z){
 const root=new THREE.Group();scene.add(root);root.position.set(x,0,z);
 const fineDetail=new THREE.Group();root.add(fineDetail);
 const color=mat(shirts[i%shirts.length]),pant=mat(trousers[i%trousers.length]),face=mat(skin[i%skin.length]),hair=mat(['#32241e','#d4a05f','#141c24','#76573c'][i%4]);
 color.map=textile[i%textile.length];color.needsUpdate=true;
 pant.map=textile[(i+2)%textile.length];pant.needsUpdate=true;
 // Anatomical silhouette uses rounded shoulders, curved torso, layered fabric and neck.
 const torso=mesh(new THREE.CapsuleGeometry(.41,.47,5,12),color,root);torso.position.set(0,1.77,0);torso.scale.z=.67;
 const shoulders=mesh(new THREE.SphereGeometry(.46,12,9),color,root);
 shoulders.position.set(0,2.11,0);shoulders.scale.set(1.26,.5,.75);
 const hips=mesh(new THREE.SphereGeometry(.38,12,8),pant,root);
 hips.position.set(0,1.29,0);hips.scale.set(1.0,.42,.75);
 box(.24,.64,.04,0,1.73,.284,mat(['#f0e8dc','#253e58','#f2cf9a'][i%3]),root);
 box(.8,.095,.45,0,1.27,0,soleMat,root);
 const collar=box(.45,.10,.43,0,2.28,0,mat('#e0d4c2'),root);
 // Each passerby gets an accessory or a second clothing layer.
 if(i%4===0){box(.63,.68,.22,0,1.76,-.35,mat('#556e73'),root);box(.1,.65,.15,-.35,1.81,-.32,soleMat,root)}
 if(i%4===1)box(.86,.14,.53,0,2.26,0,mat('#d3b477'),root);
 if(i%4===2)box(.18,.8,.08,.18,1.73,.265,mat('#e5ce9e'),root);
 // Structured clothing silhouettes instead of flat blocks; trim only renders at close range.
 if(i%3===0){
   const coat=mesh(new THREE.CylinderGeometry(.415,.465,.76,12,1,true),jacketMat[i%4],root);
   coat.position.set(0,1.73,0);coat.scale.z=.72;
   const zip=box(.025,.64,.019,0,1.71,.322,metalMat,fineDetail);
   for(const side of [-1,1])box(.18,.025,.015,side*.19,1.52,.322,stitchingMat,fineDetail);
 }else if(i%3===1){
   box(.45,.042,.016,0,1.55,.289,stitchingMat,fineDetail);
   for(const side of [-1,1])box(.05,.14,.02,side*.29,1.57,.285,stitchingMat,fineDetail);
 }


 const neck=box(.2,.19,.2,0,2.36,0,face,root);
 const head=mesh(headGeo,face,root);head.position.y=2.69;head.scale.set(.94,1.15,.86);
 const jaw=mesh(new THREE.SphereGeometry(.255,12,10),face,root);jaw.position.set(0,2.50,.07);jaw.scale.set(1.05,.6,.88);
 for(const side of [-1,1]){
  const ear=mesh(new THREE.SphereGeometry(.12,9,7),face,root);
  ear.position.set(side*.316,2.62,0);ear.scale.set(.7,1.17,.58);
 }
 const cap=mesh(new THREE.SphereGeometry(.345,12,8,0,Math.PI*2,0,1.20),hair,root);cap.position.set(0,2.8,0);
 // Four head silhouettes with low-cost geometry: cropped, swept, textured locks, and a cap.
 if(i%4===0){
   for(let lock=0;lock<5;lock++){
     const strand=mesh(hairLockGeo,hair,fineDetail);strand.position.set((lock-2)*.105,2.93,.19);
     strand.rotation.z=(lock-2)*-.13;
   }
 }else if(i%4===1){
   const sideLock=mesh(new THREE.CapsuleGeometry(.115,.34,3,7),hair,fineDetail);
   sideLock.position.set(-.32,2.65,-.05);sideLock.rotation.z=-.22;
   const backLock=mesh(new THREE.SphereGeometry(.33,9,7),hair,fineDetail);
   backLock.position.set(0,2.68,-.17);backLock.scale.set(.92,.96,.65);
 }else if(i%4===2){
   const brim=mesh(capBrimGeo,jacketMat[i%4],fineDetail);brim.position.set(0,2.94,.29);
   const crown=mesh(new THREE.SphereGeometry(.355,12,8),jacketMat[i%4],fineDetail);
   crown.position.set(0,2.98,0);crown.scale.y=.49;
 }else{
   for(let lock=0;lock<4;lock++){
     const strand=mesh(hairLockGeo,hair,fineDetail);strand.position.set((lock-1.5)*.14,3.03,.08);
     strand.rotation.z=(lock-1.5)*.32;
   }
 }
 if(i%7===0){
   const frame=mesh(new THREE.TorusGeometry(.116,.018,5,10),metalMat,fineDetail);
   frame.position.set(-.128,2.72,.305);
   const second=mesh(frame.geometry,metalMat,fineDetail);second.position.set(.128,2.72,.305);
   box(.08,.02,.022,0,2.72,.31,metalMat,fineDetail);
 }

 for(const side of [-1,1]){
  const eye=mesh(new THREE.SphereGeometry(.038,9,7),eyeMat,root);
  eye.position.set(side*.126,2.72,.29);
  const brow=mesh(new THREE.CapsuleGeometry(.023,.15,3,7),hair,root);brow.rotation.z=Math.PI/2;
  brow.position.set(side*.128,2.81,.29);
 }
 box(.09,.11,.1,0,2.60,.338,face,root);
 const lip=box(.19,.018,.022,0,2.46,.32,mat('#946f66'),fineDetail);
 // Small facial depth cues instead of an untextured spherical mask.
 const noseTip=mesh(new THREE.SphereGeometry(.055,8,6),face,fineDetail);
 noseTip.position.set(0,2.59,.393);noseTip.scale.set(.8,.7,1.05);


 const arms=[],legs=[];
 for(const side of [-1,1]){
  const a=new THREE.Group();a.position.set(side*.54,2.17,0);root.add(a);
  const arm=mesh(armGeo,color,a);arm.position.y=-.48;
 const elbow=mesh(new THREE.SphereGeometry(.145,9,7),color,a);elbow.position.y=-.70;
 const hand=mesh(new THREE.SphereGeometry(.12,10,8),face,a);hand.position.y=-1.03;hand.scale.set(.85,1.22,.75);
 arms.push(a);
  const leg=new THREE.Group();leg.position.set(side*.23,1.28,0);root.add(leg);
  const shin=mesh(legGeo,pant,leg);shin.position.y=-.61;
  const shoe=mesh(new THREE.SphereGeometry(.29,12,8),soleMat,leg);
  shoe.position.set(0,-1.15,.15);shoe.scale.set(1.03,.50,1.48);
  const sole=mesh(new THREE.SphereGeometry(.295,11,7),mat('#a5a39e'),leg);sole.position.set(0,-1.24,.18);
  sole.scale.set(1,.18,1.49);
  legs.push(leg);
 }
 return {root,fineDetail,arms,legs,head,torso,x,z,baseX:x,baseZ:z,phase:i*1.63,angle:i*.91,walk:0,name:npcNames[i%npcNames.length],id:i,chatIndex:0,pathAxis:i%3===0?'x':'z',direction:(i%2?1:-1),pace:.8+rnd(i*21)*.7,gesture:0,dodgeUntil:0,chatUntil:0,panic:0,stumbleUntil:0,stumbleSide:1};
}
function streetPoint(i){
 const road=roadPositions[Math.floor(rnd(i*7+1)*roadPositions.length)],horizontal=rnd(i*9+2)>.5;
 const offset=(rnd(i*9+3)>.5?1:-1)*14.4;
 const travel=(rnd(i*9+4)-.5)*710;
 return horizontal?{x:travel,z:road+offset,axis:'x'}:{x:road+offset,z:travel,axis:'z'};
}
// Named contact for story jobs, stays by the start-of-game sidewalk.
const fixer=human(29,12.5,-18);fixer.name='Rae';fixer.role='fixer';fixer.root.rotation.y=Math.PI/2;
// Walkers follow the sidewalk axis; public spaces attract small local groups.
for(let i=0;i<48;i++){
 let p=i<18?{x:i%2===0?14:-14,z:-175+i*19,axis:'z'}:streetPoint(i+12);
 if(collision(p.x,p.z)||!clearsStreet(p.x,p.z,.6,.6)){p=streetPoint(i+101)}
 if(!collision(p.x,p.z)&&clearsStreet(p.x,p.z,.6,.6)){
  const resident=human(i,p.x,p.z);resident.pathAxis=p.axis;citizens.push(resident);
 }
}
for(const [i,space] of publicSpaces.slice(0,8).entries()){
 for(let j=0;j<(i===0?4:2);j++){
  const x=space.cx-16+j*8,z=space.cz-8;
  if(collision(x,z,.6)||!clearsStreet(x,z,.7,.7))continue;
  const resident=human(48+i*4+j,x,z);resident.pathAxis='x';resident.pathRange=7;resident.pace=.6+rnd(i+j)*.35;
  citizens.push(resident);
 }
}
const dark=mat('#1d323a',.85),silver=mat('#85949b'),glow=new THREE.MeshBasicMaterial({color:0xffe3a4}),wood=mat('#87644c'),planter=mat('#596f65');
// Sparse street furniture near intersections. Keep draw calls moderate.
for(let i=-4;i<=4;i+=2)for(let j=-4;j<=4;j+=2){
 const x=i*92+17,z=j*92+17;
 if(!clearsStreet(x-1.2,z,3.4,1.0)||collision(x,z,.5))continue;
 const pole=new THREE.Group();scene.add(pole);pole.position.set(x,0,z);props.push(pole);
 box(.24,8.5,.24,0,4.25,0,dark,pole);box(2.3,.22,.28,-1.05,8.43,0,dark,pole);
 box(.9,.2,.5,-2.1,8.24,0,glow,pole);
}
for(let i=0;i<16;i++){
 const x=(i%4-1.5)*182+30,z=(Math.floor(i/4)-1.5)*182+30;
 if(collision(x,z,1.8)||!clearsStreet(x,z,3.2,1.2))continue;
 const b=new THREE.Group();scene.add(b);b.position.set(x,0,z);props.push(b);
 box(3,.36,.9,0,.95,0,wood,b);for(const side of [-1,1])box(.15,1,.16,side*1.1,.50,0,dark,b);
 box(3,.78,.18,0,1.42,-.4,wood,b);
}
let active=null,dialogUntil=0;
const pop=document.createElement('div');pop.id='citizenPrompt';pop.style.cssText='display:none;position:fixed;bottom:160px;left:50%;transform:translateX(-50%);z-index:7;background:#0b1d2fe8;border:1px solid #75e6bfaa;border-radius:12px;padding:11px 17px;color:white;font:700 13px system-ui;pointer-events:none;box-shadow:0 8px 24px #0008';document.body.appendChild(pop);
const dialog=document.createElement('div');dialog.id='citizenDialog';dialog.style.cssText='display:none;position:fixed;bottom:205px;left:50%;transform:translateX(-50%);z-index:8;max-width:min(480px,90vw);background:#112439f2;border:1px solid #73e6b7b0;border-radius:14px;padding:15px 19px;color:#f5fbff;box-shadow:0 14px 50px #0009;font:14px/1.55 system-ui';document.body.appendChild(dialog);
function nearest(){const p=getPlayer();if(p.inCar)return null;let best=null,d=5.2;for(const n of [fixer,...citizens]){const distance=Math.hypot(p.x-n.root.position.x,p.z-n.root.position.z);if(distance<d){best=n;d=distance}}return best}
function interact(){const n=nearest();if(!n)return false;if(n.role==='fixer'){onStoryContact?.();return true}active=n;n.chatUntil=performance.now()+2200;const story=stories[n.id%stories.length];const first=n.chatIndex++===0;dialog.innerHTML='<b style="color:#6ee8ba">'+n.name+'</b><div style="margin-top:5px">'+(first?story[0]:story[1])+'</div><small style="color:#a7c4cf">Press F to talk again · Walk away to close</small>';dialog.style.display='block';dialogUntil=performance.now()+6500;if(first){onReward(story[2]);onNotice(n.name+' gave you $'+story[2]+' for helping around town')}return true}
let lastNpc=0,lastPropCull=0;
function update(dt,now){
 if(now-lastNpc>33){
   const step=Math.min(.065,(now-lastNpc)/1000||dt);lastNpc=now;
   const player=getPlayer();
   if(now-lastPropCull>500){
     lastPropCull=now;
     const sceneActive=isPlaying();
     for(const prop of props){
       const dx=prop.position.x-player.x,dz=prop.position.z-player.z;
       prop.visible=!sceneActive||dx*dx+dz*dz<190*190;
     }
   }
   for(const n of citizens){
     const px=n.root.position.x,pz=n.root.position.z;
     const distanceSq=(px-player.x)**2+(pz-player.z)**2;
     const nearby=distanceSq<115*115;
     n.root.visible=nearby;if(!nearby)continue;
     // Close-up accessories are hidden at medium distance, saving GPU draw calls.
     n.fineDetail.visible=distanceSq<35*35;
     // Far pedestrians keep silhouettes but skip costly limb/face pose updates.
     const animateDetail=distanceSq<65*65;
     const dxFromCar=px-player.x,dzFromCar=pz-player.z;
     const dist=Math.hypot(dxFromCar,dzFromCar);
     const incoming=player.inCar&&Math.abs(player.speed||0)>3&&dist<11;
     if(incoming)n.dodgeUntil=Math.max(n.dodgeUntil,now+550);
     const stumbling=now<n.stumbleUntil;
     const dodging=!stumbling&&now<n.dodgeUntil&&dist<15;
     const chatting=!stumbling&&now<n.chatUntil;
     let nx=px,nz=pz,walking=false;
     if(stumbling){
       // Abstract, non-graphic impact reaction: step aside, crouch, recover.
       const retreat=step*3.3,nx=px+Math.cos(n.root.rotation.y)*retreat*n.stumbleSide;
       const nz=pz+Math.sin(n.root.rotation.y)*retreat*n.stumbleSide;
       if(!collision(nx,nz,.25)){n.root.position.set(nx,0,nz);walking=true}
     }else if(dodging){
       const len=Math.max(1,dist),side=(n.id%2?1:-1),speed=step*7.3;
       nx=px+(dxFromCar/len*1.5-dzFromCar/len*.35*side)*speed;
       nz=pz+(dzFromCar/len*1.5+dxFromCar/len*.35*side)*speed;
       if(!collision(nx,nz,.3)){n.root.position.set(nx,0,nz);walking=true}
     }else if(!chatting){
       const speed=n.pace*step*n.direction,axis=n.pathAxis;
       nx=axis==='x'?px+speed:px;nz=axis==='z'?pz+speed:pz;
       const dFromBase=Math.abs((axis==='x'?nx-n.baseX:nz-n.baseZ));
       if(dFromBase>(n.pathRange||26)||collision(nx,nz,.25)||!clearsStreet(nx,nz,.6,.6)){n.direction*=-1}
       else{n.root.position.x=nx;n.root.position.z=nz;walking=Math.abs(speed)>.0001}
     }
     const movedX=n.root.position.x-px,movedZ=n.root.position.z-pz;
     const heading=walking?Math.atan2(movedX,movedZ):(n.pathAxis==='x'?(n.direction>0?Math.PI/2:-Math.PI/2):(n.direction>0?0:Math.PI));
     const turn=Math.atan2(Math.sin(heading-n.root.rotation.y),Math.cos(heading-n.root.rotation.y));
     n.root.rotation.y+=turn*Math.min(1,step*(dodging?12:7));
     if(!animateDetail){
       n.root.position.y=0;
       n.root.rotation.z=0;
       continue;
     }
     const stride=Math.sin(now*.01*(dodging?1.5:n.pace)+n.phase)*(walking?(dodging?.7:.44):0);
     n.legs[0].rotation.x=stride;n.legs[1].rotation.x=-stride;
     const wave=chatting?Math.sin(now*.014)*.2:0;
     n.arms[0].rotation.x=dodging?-.45:-stride*.7;
     n.arms[1].rotation.x=chatting?-1.15+wave:dodging?-.55:stride*.7;
     n.head.rotation.y=chatting?.12*Math.sin(now*.003):dodging?-.22:Math.sin(now*.00065+n.phase)*.12;
     n.root.position.y=walking?Math.abs(stride)*.029:Math.sin(now*.002+n.phase)*.009;
     const stumblePhase=stumbling?1-Math.max(0,n.stumbleUntil-now)/800:0;
     if(n.torso)n.torso.rotation.x=stumbling?.55*Math.sin(stumblePhase*Math.PI):Math.sin(now*.004+n.phase)*.016;
     if(stumbling){n.arms[0].rotation.x=-.9;n.arms[1].rotation.x=.6;}
     n.root.rotation.z=stumbling?.21*Math.sin(stumblePhase*Math.PI)*n.stumbleSide:THREE.MathUtils.lerp(n.root.rotation.z,0,Math.min(1,step*10));
   }
 }
 if(!isPlaying()){pop.style.display='none';dialog.style.display='none';return}
 const n=nearest();
 pop.style.display=n?'block':'none';if(n)pop.textContent=n.role==='fixer'?'F  ·  Talk to Rae (street jobs)':'F  ·  Talk to '+n.name;
 if(!n||now>dialogUntil)dialog.style.display='none';
}

function reactToVehicle(x,z,force=1){
 const now=performance.now();let reacted=false;
 for(const n of citizens){
  if(!n.root.visible||now<n.stumbleUntil)continue;
  const dx=n.root.position.x-x,dz=n.root.position.z-z,dist=Math.hypot(dx,dz);
  if(dist>3.6)continue;
  n.stumbleUntil=now+850;n.dodgeUntil=now+1350;n.stumbleSide=n.id%2?1:-1;
  n.chatUntil=0;reacted=true;
  // Make space for the vehicle; characters return to their walking route.
  const safeX=n.root.position.x+dx/Math.max(.2,dist)*Math.min(2.2,1.1*force);
  const safeZ=n.root.position.z+dz/Math.max(.2,dist)*Math.min(2.2,1.1*force);
  if(!collision(safeX,safeZ,.25))n.root.position.set(safeX,0,safeZ);
 }
 return reacted;
}
return {update,interact,citizens,fixer,reactToVehicle};
}
