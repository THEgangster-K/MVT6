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
 if(cx===46&&cz===-46)return {district,kind:'plaza',parcels:[]};
 if(Math.abs(cx-184)<50&&Math.abs(cz)<50)return {district,kind:'parking',parcels:[]};
 if(rand(1)<.13)return {district,kind:'park',parcels:[]};
 // Neighbourhoods influence probability rather than dictate identical blocks.
 const weights={
  'WEST HAVEN':['hotel','market','apartment','house','hotel','market','tower'],
  'NORTH QUARTER':['house','house','market','apartment','warehouse','house','hotel'],
  'EAST SOLARA':['warehouse','market','house','warehouse','apartment','hotel','market'],
  'SOUTH PIER':['market','apartment','house','hotel','warehouse','market','tower'],
  'DOWNTOWN':['tower','apartment','market','hotel','house','apartment','warehouse']
 };
 const kinds={'WEST HAVEN':'coast','NORTH QUARTER':'residential','EAST SOLARA':'industrial','SOUTH PIER':'commercial','DOWNTOWN':'urban'};
 const list=weights[district],parcels=[];
 const dims={house:[11,17,13,20,4.8,8.5],warehouse:[18,29,15,26,8,14],market:[14,25,12,23,7,14],hotel:[17,27,17,26,15,36],apartment:[16,26,15,26,17,48],tower:[19,28,18,28,42,96]};
 // Offset two-to-four independent parcels inside a 62-unit buildable square.
 // A continuous corridor is reserved on one varying axis. Empty plots form courts and gaps.
 const axis=rand(2)<.5?'x':'z',split=-7+rand(3)*14,lanew=7+rand(4)*4;
 const slots=[];
 for(const [lo,hi] of [[-31,split-lanew/2],[split+lanew/2,31]]){
   const cut=-5+rand(5+slots.length)*10;
   if(rand(12+slots.length)<.36)slots.push([lo,hi,-31,31]);
   else slots.push([lo,hi,-31,cut-3],[lo,hi,cut+3,31]);
 }
 const order=slots.map((_,i)=>i).sort((a,b)=>rand(30+a)-rand(30+b));
 for(let k=0;k<order.length;k++){
   if(k>=2&&rand(50+k)<.22)continue;
   const [lo,hi,zlo,zhi]=slots[order[k]],type=list[Math.floor(rand(60+k)*list.length)],d=dims[type];
   const w=Math.min(hi-lo-3,d[0]+rand(70+k)*(d[1]-d[0])),depth=Math.min(zhi-zlo-3,d[2]+rand(80+k)*(d[3]-d[2]));
   if(w<8||depth<8)continue;
   const x=lo+w/2+1.5+rand(90+k)*Math.max(0,hi-lo-w-3),z=zlo+depth/2+1.5+rand(100+k)*Math.max(0,zhi-zlo-depth-3);
   const h=d[4]+rand(110+k)*(d[5]-d[4]);
   parcels.push(axis==='x'?{x:cx+x,z:cz+z,w,d:depth,h,type}:{x:cx+z,z:cz+x,w:depth,d:w,h,type});
 }
 return {district,kind:kinds[district],parcels,alley:{axis,offset:split,width:lanew}};
}

// Game-only vehicle contact: overlap of two short capsule-like footprints.
// Returns a bounded separation normal; no real-world crash dynamics are simulated.
export function arcadeCarContact(a,b){
 const offsets=[-1.85,1.85];let best=null;
 for(const p of offsets)for(const q of offsets){
  const ax=a.x+Math.sin(a.yaw)*p,az=a.z+Math.cos(a.yaw)*p;
  const bx=b.x+Math.sin(b.yaw)*q,bz=b.z+Math.cos(b.yaw)*q;
  const x=ax-bx,z=az-bz,d=Math.hypot(x,z),overlap=3.7-d;
  if(overlap>0&&(!best||overlap>best.overlap)){
   const fallback=Math.hypot(a.x-b.x,a.z-b.z);
   best={x:d>.0001?x/d:fallback>.0001?(a.x-b.x)/fallback:1,z:d>.0001?z/d:fallback>.0001?(a.z-b.z)/fallback:0,overlap};
  }
 }
 return best;
}
// Simple fictional city traffic: alternating green phases and smooth queue speeds.
export function junctionPhase(time,ix,iz){
 const t=((time+((ix*7+iz*11)%8)+40)%20+20)%20;
 return t<8?'east':t<10?'all-red':t<18?'north':'all-red';
}
export function trafficQueueSpeed(base,obstacle,stopDistance){
 const gap=Math.min(obstacle,stopDistance);
 return gap<=7?0:Math.min(base,Math.max(0,(gap-7)*.72));
}
export function nextJunction(position,direction,block=92){
 const junction=direction>0?Math.ceil((position+.01)/block)*block:Math.floor((position-.01)/block)*block;
 return junction===0?0:junction; // Normalise negative zero at the centre intersection.
}

// Curved secondary lanes remain within each reserved alley envelope.
export function secondaryLane(cx,cz,alley,seed=0){
 if(!alley)return null;
 const width=Math.min(6,alley.width-1.6),bend=Math.min(1.35,(alley.width-width)/2-.35)*(seed%2===0?1:-1);
 const points=[];
 for(let i=0;i<=16;i++){
  const t=i/16,along=-36+t*72,cross=alley.offset+Math.sin(t*Math.PI*2)*bend;
  points.push(alley.axis==='x'?{x:cx+cross,z:cz+along}:{x:cx+along,z:cz+cross});
 }
 return {width,points};
}
// Distinct original silhouettes, all compatible with the existing arcade footprint.
export function vehicleProfile(type='sedan'){
 const profiles={
  sedan:{roof:0,rear:0,front:0,body:0,trim:'sedan'},
  taxi:{roof:.025,rear:.13,front:0,body:.02,trim:'taxi'},
  utility:{roof:.27,rear:-.34,front:.14,body:.08,trim:'utility'},
  compact:{roof:.10,rear:.23,front:-.12,body:-.04,trim:'compact'},
  wagon:{roof:.16,rear:-.37,front:.05,body:.035,trim:'wagon'},
  coupe:{roof:-.08,rear:.31,front:-.15,body:-.025,trim:'coupe'}
 };
 return profiles[type]||profiles.sedan;
}

// Shared in-game property catalogue. All prices are fictional game currency.
export const homeCatalog=[
 {id:'starter',name:'Harbour Studio',x:138,z:-46,price:550,roof:'#657d87'},
 {id:'garden',name:'Garden Apartment',x:230,z:-46,price:1200,roof:'#7d8b65'},
 {id:'loft',name:'Solara Loft',x:230,z:46,price:2400,roof:'#a6795c'}
];
export function purchaseHome(progress,id){
 const home=homeCatalog.find(h=>h.id===id),owned=Array.isArray(progress?.homes)?progress.homes:[];
 if(!home)return {ok:false,reason:'Unknown property'};
 if(owned.includes(id))return {ok:false,reason:'Already owned'};
 if(!Number.isFinite(progress.money)||progress.money<home.price)return {ok:false,reason:'Not enough cash'};
 return {ok:true,money:progress.money-home.price,homes:[...owned,id]};
}
// Game-time neighbourhood routines, offset by citizen identity.
export function residentRoutine(seconds,id){
 const t=((Math.floor(seconds/18)+id*3)%12+12)%12;
 return t<3?'rest':t<7?'walk':t<9?'browse':'walk';
}
// Small cosmetic spring response, independent of game driving physics.
export function visualSpring(position,velocity,target,dt){
 const step=Math.max(0,Math.min(.05,dt));
 const v=(velocity+(target-position)*30*step)*Math.exp(-7*step);
 return {position:Math.max(-.12,Math.min(.12,position+v*step)),velocity:v};
}

// Fictional showroom purchases and home furnishing choices.
export const showroomCatalog=[
 {id:'sedan',name:'Solara Standard',price:0,type:'sedan'},
 {id:'compact',name:'Harbour Compact',price:480,type:'compact'},
 {id:'wagon',name:'Vista Wagon',price:850,type:'wagon'},
 {id:'utility',name:'Atlas Utility',price:1250,type:'utility'},
 {id:'coupe',name:'Sunset Coupe',price:1800,type:'coupe'}
];
export function purchaseShowroom(progress,id){
 const item=showroomCatalog.find(v=>v.id===id),owned=['sedan',...(Array.isArray(progress?.vehicles)?progress.vehicles:[])];
 if(!item)return {ok:false,reason:'Unknown model'};
 if(owned.includes(id))return {ok:true,money:progress.money,vehicles:[...new Set(owned)],selectedVehicle:id};
 if(!Number.isFinite(progress.money)||progress.money<item.price)return {ok:false,reason:'Not enough cash'};
 return {ok:true,money:progress.money-item.price,vehicles:[...new Set([...owned,id])],selectedVehicle:id};
}
export const furnishingCatalog=[
 {id:'coastal',name:'Coastal blue',price:0,fabric:'#778d91',wood:'#9c7357',rug:'#caab88'},
 {id:'modern',name:'Modern charcoal',price:160,fabric:'#454c55',wood:'#74685a',rug:'#a9b0b8'},
 {id:'warm',name:'Warm terracotta',price:240,fabric:'#bd8063',wood:'#805e48',rug:'#d4ad87'}
];
export function purchaseFurnishing(progress,homeId,themeId){
 if(!Array.isArray(progress?.homes)||!progress.homes.includes(homeId))return {ok:false,reason:'Own the home first'};
 if(!homeCatalog.some(h=>h.id===homeId))return {ok:false,reason:'Unknown home'};
 const theme=furnishingCatalog.find(t=>t.id===themeId);
 if(!theme)return {ok:false,reason:'Unknown theme'};
 const prior=progress.homeThemes?.[homeId]||'coastal';
 if(prior===themeId)return {ok:false,reason:'Already applied'};
 if(!Number.isFinite(progress.money)||progress.money<theme.price)return {ok:false,reason:'Not enough cash'};
 return {ok:true,money:progress.money-theme.price,homeThemes:{...progress.homeThemes,[homeId]:themeId}};
}
export function cityWeather(seconds){
 const t=((Math.floor(seconds/95)%4)+4)%4;
 return ['clear','overcast','rain','clear'][t];
}

// An original, peaceful story trail through five districts.
export const horizonTrail=[
 {id:'plaza',name:'The First Photograph',x:46,z:-46,reward:120,jawson:"This photograph is where our story began.",luxie:"My family used to meet here after work. Let's keep those memories alive."},
 {id:'haven',name:'West Haven Memories',x:-322,z:-46,reward:160,jawson:"The harbour looks different in this old picture.",luxie:"Look at the original shoreline. We should preserve its history."},
 {id:'north',name:'A Neighbourhood Album',x:46,z:-322,reward:180,jawson:"Everyone has a story about this place.",luxie:"Let's collect the stories and make a community exhibition."},
 {id:'east',name:'The Workshop Years',x:322,z:46,reward:220,jawson:"Nico's old workshop sign belongs in the exhibition.",luxie:"It reminds me why we wanted to rebuild."},
 {id:'south',name:'The New Horizon',x:46,z:322,reward:350,jawson:"We have enough memories for the exhibition.",luxie:"This is our city now. Let's build something worth keeping."}
];
export function trailPlacement(site,blocked){
 // Try positions within the buildable block, then adjacent sidewalk edges.
 const offsets=[[0,24],[-24,0],[24,0],[0,-24],[-25,25],[25,25],[-25,-25],[25,-25],[-32,0],[32,0],[0,-32],[0,32]];
 for(const x of [-30,-20,-10,0,10,20,30])for(const z of [-30,-20,-10,0,10,20,30])offsets.push([x,z]);
 for(const [dx,dz] of offsets){
  const x=site.x+dx,z=site.z+dz;
  if(clearsStreet(x,z,1.8,1.8)&&!blocked(x,z,1.1))return {x,z};
 }
 return null;
}
export function completeTrailStop(progress,id,available=horizonTrail.map(s=>s.id)){
 const completed=Array.isArray(progress?.trailVisited)?progress.trailVisited:[],next=horizonTrail.find(s=>available.includes(s.id)&&!completed.includes(s.id));
 if(!next||next.id!==id||!Number.isFinite(progress.money))return {ok:false,reason:'Follow the next story marker'};
 return {ok:true,money:progress.money+next.reward,trailVisited:[...completed,id]};
}
