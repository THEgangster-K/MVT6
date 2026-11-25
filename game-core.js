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
