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
