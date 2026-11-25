/**
 * MVT 6 - small, dependency-free gameplay helpers.
 * Keeping core mathematics outside the scene makes regression tests possible.
 */
export function movementVector(yaw, forward, strafe) {
  const len=Math.hypot(forward,strafe);
  if(!Number.isFinite(yaw)||!len)return {x:0,z:0};
  return {x:(Math.sin(yaw)*forward-Math.cos(yaw)*strafe)/len,
          z:(Math.cos(yaw)*forward+Math.sin(yaw)*strafe)/len};
}
export function slideMove(pos, delta, blocked, radius=.35) {
  let x=pos.x,z=pos.z;
  if(!blocked(x+delta.x,z,radius))x+=delta.x;
  if(!blocked(x,z+delta.z,radius))z+=delta.z;
  return {x,z,moved:Math.hypot(x-pos.x,z-pos.z)>1e-7};
}
export function approachAngle(current, target, maxTurn) {
  const d=Math.atan2(Math.sin(target-current),Math.cos(target-current));
  return current+Math.max(-maxTurn,Math.min(maxTurn,d));
}
export function policeRoadWaypoint(pos, target, block=92) {
  const line=n=>Math.round(n/block)*block+5;
  const nearX=Math.abs(pos.x-line(pos.x))<8;
  const nearZ=Math.abs(pos.z-line(pos.z))<8;
  if(nearZ&&Math.abs(target.x-pos.x)>10)return {x:target.x,z:line(pos.z)};
  if(nearX)return {x:line(pos.x),z:target.z};
  const dx=Math.abs(pos.x-line(pos.x)),dz=Math.abs(pos.z-line(pos.z));
  return dx<dz?{x:line(pos.x),z:pos.z}:{x:pos.x,z:line(pos.z)};
}
export function bailAmount(wantedLevel, perStar=175) {
  return Math.max(1,Math.min(5,Math.ceil(Number(wantedLevel)||0)))*perStar;
}
export function nextMissionPhase(mission, completedAction) {
  if(!mission||!completedAction)return mission?.stage||null;
  if(mission.stage==='pickup')return mission.kind==='escape'?'escape':'deliver';
  if(mission.stage==='terminal')return mission.kind==='finale'?'escape':'deliver';
  return mission.stage;
}

// MVT6 arcade movement only: visual heading and travel direction are separate.
// All values are game-tuning parameters, not a simulation of real vehicle dynamics.
export function arcadeSlideStep(state, input, dt) {
  const cap=(v,a,b)=>Math.max(a,Math.min(b,v));
  const wrap=a=>Math.atan2(Math.sin(a),Math.cos(a));
  dt=cap(Number.isFinite(dt)?dt:0,0,.05);
  const speed=Number.isFinite(input.speed)?input.speed:0;
  const steer=cap(input.steer||0,-1,1),rate=cap(input.turnRate||1.55,.5,2.5);
  const active=Boolean(input.slide&&Math.abs(speed)>7);
  let yaw=Number.isFinite(state.yaw)?state.yaw:0;
  let slip=Number.isFinite(state.slip)?state.slip:0;
  const steerFactor=Math.min(1,Math.abs(speed)/8);
  yaw=wrap(yaw+steer*rate*steerFactor*Math.sign(speed)*(active?1.28:1)*dt);
  const wanted=active?steer*.78*steerFactor:0;
  // Sustained slide, gradual recovery, and reversal rather than a lateral position teleport.
  slip+=(wanted-slip)*(1-Math.exp(-(active?3.5:8.8)*dt));
  slip=cap(slip,-.85,.85);
  const travel=yaw-slip;
  const tractionLoss=active?1-.20*Math.abs(slip):1;
  return {yaw,slip,dx:Math.sin(travel)*speed*tractionLoss*dt,dz:Math.cos(travel)*speed*tractionLoss*dt,sliding:active&&Math.abs(slip)>.10};
}

// A street object's complete horizontal footprint must avoid both axes of the road grid.
export function clearsStreet(x,z,width,depth,block=92,road=20,padding=.35){
  if(![x,z,width,depth,block,road,padding].every(Number.isFinite)||width<0||depth<0||block<=0||road<=0)return false;
  const laneDistance=v=>Math.abs(v-Math.round(v/block)*block);
  return laneDistance(x)>=road/2+width/2+padding&&laneDistance(z)>=road/2+depth/2+padding;
}

/** District classification and reproducible parcel plans. Coordinates remain compatible with existing saves and jobs. */
export function cityDistrict(x,z){
 if(x<-184)return 'WEST HAVEN';
 if(z>184)return 'SOUTH PIER';
 if(x>184)return 'EAST SOLARA';
 if(z<-184)return 'NORTH QUARTER';
 return 'DOWNTOWN';
}
export function cityBlockPlan(cx,cz,seed=0){
 const district=cityDistrict(cx,cz);
 const rand=i=>{const v=Math.sin((seed+i*17.31)*127.1+71.31)*43758.5453;return v-Math.floor(v)};
 const parcel=(dx,dz,w,d,h,type)=>({x:cx+dx,z:cz+dz,w,d,h,type});
 if(cx===46&&cz===-46)return {district,kind:'plaza',parcels:[]};
 // Reserve the workshop's approach and its surrounding courtyards.
 if(Math.abs(cx-184)<50&&Math.abs(cz)<50)return {district,kind:'parking',parcels:[]};
 if(district==='WEST HAVEN'){
  if(rand(1)<.26)return {district,kind:'park',parcels:[]};
  return {district,kind:'coast',parcels:[parcel(-15,-17,25,23,16+rand(2)*18,'hotel'),parcel(17,16,23,25,9+rand(3)*8,'market')]};
 }
 if(district==='NORTH QUARTER'){
  if(rand(1)<.19)return {district,kind:'park',parcels:[]};
  return {district,kind:'residential',parcels:[-19,19].flatMap(dx=>[-19,19].map(dz=>parcel(dx,dz,12+rand(dx+dz)*5,14+rand(dx-dz)*5,4.8+rand(dx+dz+2)*3,'house')))};
 }
 if(district==='EAST SOLARA')return {district,kind:'industrial',parcels:[parcel(0,-17,51,24,9+rand(4)*5,'warehouse'),parcel(16,17,25,22,7+rand(5)*6,'warehouse')]};
 if(district==='SOUTH PIER'){
  if(rand(1)<.35)return {district,kind:'park',parcels:[]};
  return {district,kind:'commercial',parcels:[parcel(-17,-12,24,32,9+rand(5)*5,'market'),parcel(17,15,25,22,15+rand(6)*11,'apartment')]};
 }
 if(rand(1)<.14)return {district,kind:'park',parcels:[]};
 return {district,kind:'urban',parcels:[parcel(-18,-17,26,27,49+rand(3)*49,'tower'),parcel(18,-17,24,27,27+rand(4)*26,'apartment'),parcel(-17,18,27,23,7+rand(5)*9,'market'),parcel(17,18,24,23,20+rand(6)*22,'apartment')]};
}
