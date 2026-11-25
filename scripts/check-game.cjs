'use strict';
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const html=read('index.html');
const matches=[...html.matchAll(/<script(?: type="module")?>([\s\S]*?)<\/script>/g)];
assert.ok(matches.length>=2,'Expected bootstrap and game scripts');
for(const [index,match] of matches.entries()){
 const plain=match[1].replace(/^import .*;$/gm,'');
 new vm.Script(plain,{filename:'inline-script-'+index});
}
for(const moduleName of ['city-life.js','client.js','game-core.js','model-assets.js']){
 const plain=read(moduleName).replace(/^import .*;$/gm,'').replace(/^export /gm,'');
 new vm.Script(plain,{filename:moduleName});
}
// Rendering regression checks: pedestrian models retain dialogue and interaction,
// while detail groups and street props are distance-cullable.
const cityLifeSource=read('city-life.js');
assert.ok(cityLifeSource.includes('const fineDetail=new THREE.Group()'),'Pedestrians have close-up detail groups');
assert.ok(cityLifeSource.includes('n.fineDetail.visible=distanceSq<35*35'),'Close-up detail is distance culled');
assert.ok(cityLifeSource.includes('const animateDetail=distanceSq<65*65'),'Distant limb animation is limited');
assert.ok(cityLifeSource.includes('prop.visible=!sceneActive||dx*dx+dz*dz<190*190'),'Street props are culled');
assert.ok(cityLifeSource.includes('onStoryContact?.()'),'Story contact interaction remains available');
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
assert.equal(ids.length,new Set(ids).size,'Duplicate HTML IDs');
assert.ok(/<option value="auto"(?: selected)?>AUTO · TARGET 60 FPS<\/option>/.test(html),'Adaptive quality option exists');
assert.ok(html.includes("graphicsPreset='auto'"),'Auto quality is the default for new players');
assert.ok(html.includes('fpsCounter*1000/elapsed'),'FPS uses real elapsed time, not clamped physics dt');
assert.ok(html.includes('autoQualityGoodWindows>=3'),'Adaptive quality recovery uses hysteresis');
assert.ok(html.includes('autoQualityLastChange>=1800'),'Adaptive quality changes are rate limited');
assert.ok(html.includes('group.userData.detail=vehicleDetail'),'Vehicles keep optional close-up detail groups');
assert.ok(html.includes('if(playerCar.userData.detail)playerCar.userData.detail.visible=true'),'Player vehicle detail is retained');
assert.ok(html.includes('detail.visible=(t.pos.x-px)**2+(t.pos.z-pz)**2<78*78'),'Traffic vehicle details are distance culled');
assert.ok(html.includes('detail.visible=p.active&&(p.pos.x-px)**2+(p.pos.z-pz)**2<78*78'),'Police vehicle details are distance culled');
assert.ok(html.includes('group.userData.wheels=wheelAssemblies'),'Vehicle wheel physics interface is retained');
assert.ok(html.includes('detailBatch(solarModules'),'Instanced rooftop solar arrays exist');
assert.ok(html.includes('detailBatch(parapetModules'),'Instanced rooftop parapets exist');

assert.ok(html.includes('group.userData.brakeLights=brakeTailLights'),'Brake light interface is retained');
assert.ok(html.includes('walkBlend=THREE.MathUtils.lerp(walkBlend,walkMotion,transition)'),'Walking blend is damped');
assert.ok(html.includes('runBlend=THREE.MathUtils.lerp(runBlend,walkMotion&&keys.shift?1:0'),'Sprint blend is damped');
assert.ok(html.includes('gaitPhase+=dt*'),'Gait animation has continuous phase');
assert.ok(html.includes('const targetFov=normalCameraFov+drivingCameraSpeed'),'Driving FOV depends on speed');
assert.ok(html.includes('Math.abs(camera.fov-nextFov)>.035'),'FOV projection updates are throttled');
assert.ok(html.includes('const lead=inCar?Math.min(5.5,Math.abs(velocity)*.11):0'),'Camera leads at speed');
assert.ok(html.includes('if(jumping){limbs.legs[0].rotation.x=-.48'),'Jump poses retained');
assert.ok(html.includes('function setSeatPose(amount)'),'Seated character pose retained');


assert.ok(!html.includes('fpsTime+=dt'),'Old FPS calculation is removed');

const builtAtRuntime=new Set(['hackCode','hackProgress','hackButtons','hackCancel','carHint','lockHint','citizenDialog','citizenPrompt']);
for(const match of matches[1][1].matchAll(/\$\('([^']+)'\)/g)){
 assert.ok(ids.includes(match[1])||builtAtRuntime.has(match[1]),'Missing UI element: '+match[1]);
}
const coreSource=read('game-core.js').replace(/^export /gm,'')+
 '\n;globalThis.core={movementVector,slideMove,approachAngle,policeRoadWaypoint,bailAmount,nextMissionPhase,arcadeSlideStep,clearsStreet,cityDistrict,cityBlockPlan,junctionPhase,trafficQueueSpeed,nextJunction,arcadeCarContact};';
const context={Math};
vm.runInNewContext(coreSource,context,{filename:'game-core.js'});
const core=context.core;
const near=(a,b)=>Math.abs(a-b)<1e-8;
assert.ok(near(core.movementVector(0,1,0).z,1),'W moves forward');
assert.ok(near(core.movementVector(0,0,1).x,-1),'D uses camera-right vector');
assert.ok(near(core.movementVector(Math.PI/2,1,0).x,1),'Rotated camera forward');
assert.equal(core.slideMove({x:0,z:0},{x:3,z:4},(x)=>x>1).z,4,'Slide along blocked wall');
assert.ok(near(core.approachAngle(0,Math.PI,.2),.2),'Police heading has turn-rate limit');
assert.equal(core.bailAmount(3.1),700,'Bail rounds up to next wanted star');
assert.equal(core.nextMissionPhase({stage:'pickup',kind:'escape'},true),'escape');
assert.equal(core.nextMissionPhase({stage:'pickup',kind:'courier'},true),'deliver');
// Actual behavior tests for the release's arcade motion and map-placement math.
let arc={yaw:0,slip:0};
for(let i=0;i<45;i++)arc=core.arcadeSlideStep(arc,{speed:20,steer:1,slide:true},1/60);
assert.ok(arc.sliding&&arc.slip>.4,'Arcade drift builds a sustained travel/heading offset');
assert.ok(Math.abs(Math.atan2(arc.dx,arc.dz)-arc.yaw)>.3,'Travel direction differs from car heading');
assert.ok(Math.hypot(arc.dx,arc.dz)<20/60,'Drift translation does not exceed configured speed');
for(let i=0;i<60;i++)arc=core.arcadeSlideStep(arc,{speed:20,steer:0,slide:false},1/60);
assert.ok(Math.abs(arc.slip)<.01,'Slide recovers smoothly on release');
const straight=core.arcadeSlideStep({yaw:0,slip:0},{speed:10,steer:0,slide:false},.02);
assert.ok(near(straight.dx,0)&&near(straight.dz,.2),'Straight motion remains unchanged');
const reverse=core.arcadeSlideStep({yaw:0,slip:0},{speed:-10,steer:0,slide:false},.02);
assert.ok(near(reverse.dz,-.2),'Reversing remains possible');
assert.ok(core.clearsStreet(46,14,8,3.4),'Safe sidewalk shelter footprint');
assert.ok(!core.clearsStreet(0,46,1,1),'Reject object centered in street');
assert.ok(!core.clearsStreet(12,46,8,3),'Reject object partially crossing street');
assert.ok(!core.clearsStreet(46,9,1,1),'Check both road axes');
assert.ok(html.includes('arcadeSlideStep({yaw:angle,slip:slideSlip}'),'Game uses the tested arcade movement');
assert.ok(html.includes('const nx=carPos.x+slide.dx,nz=carPos.z+slide.dz'),'New movement passes through collision checks');
assert.ok(html.includes('clearsStreet(x,z,w,h,d')===false,'Street guard uses the horizontal dimensions only');
assert.ok(html.includes('clearsStreet(x,z,w,d,BLOCK,ROAD)'),'Street prop footprint guard is connected');
assert.ok(html.includes('detailBatch(palmFronds,palmGeometry()'),'Original curved foliage is GPU-instanced');
assert.ok(html.includes('CROSSROADS · V2.1'),'Visible release marker');
assert.ok(!html.includes('<div class="bootArtwork"'),'Old illustration montage removed');
assert.ok(html.includes('function liveTitleCamera(now,dt)'),'Title shots use live game camera');
assert.ok(html.includes("renderer.shadowMap.enabled=graphicsPreset==='cinematic'"),'Real shadows are opt-in');
assert.ok(html.includes('scene.environment=skyEnvironment.texture'),'Sky reflections integrated');
assert.ok(html.includes('const openVenues=[]'),'Walk-in public venues exist');
assert.ok(html.includes('resolveTrafficContact()'),'Vehicle movement uses contact resolution');
const testCar={x:0,z:0,yaw:0};
assert.equal(core.arcadeCarContact(testCar,{x:30,z:0,yaw:0}),null,'Distant cars do not collide');
const sideContact=core.arcadeCarContact(testCar,{x:2.8,z:0,yaw:0});
assert.ok(sideContact&&sideContact.x<-.99&&sideContact.overlap>0,'Side overlap yields outward separation');
const noseContact=core.arcadeCarContact(testCar,{x:0,z:6,yaw:Math.PI});
assert.ok(noseContact&&noseContact.z<-.99,'Front overlap yields outward separation');
assert.ok(core.arcadeCarContact(testCar,{x:0,z:0,yaw:0}),'Coincident vehicles remain finite');

for(let i=-2;i<=2;i++)for(let j=-2;j<=2;j++){
 const phases=new Set(Array.from({length:20},(_,t)=>core.junctionPhase(t,i,j)));
 assert.ok(phases.has('east')&&phases.has('north')&&phases.has('all-red'),'Each signal cycles through both axes');
}
assert.equal(core.trafficQueueSpeed(12,Infinity,Infinity),12,'Unblocked NPC drives at cruise speed');
assert.equal(core.trafficQueueSpeed(12,5,Infinity),0,'NPC stops for nearby vehicle');
assert.equal(core.trafficQueueSpeed(12,Infinity,6),0,'NPC stops for signal');
assert.ok(core.trafficQueueSpeed(12,15,Infinity)<12,'Queue slows gradually');
assert.equal(core.nextJunction(-20,1),0);
assert.equal(core.nextJunction(-20,-1),-92);
assert.ok(html.includes('updateSignals(dt)'),'Signals advance with traffic');
assert.ok(html.includes('trafficQueueSpeed(t.baseSpeed,obstacle,stopDistance)'),'NPC traffic uses tested queue rule');
assert.ok(html.includes('plane(420,900,-620,0,materials.water'),'Sea separated from road');
assert.ok(html.includes("type==='taxi'"),'Taxi variation present');
assert.ok(html.includes("type==='utility'"),'Utility variation present');

assert.ok(!html.includes('const wallFacade='),'Artificial spawn wall removed');
assert.ok(!html.includes('const shopBrick='),'Old decorative wall material removed');
assert.equal(core.cityBlockPlan(46,-46,0).kind,'plaza','Spawn block is a plaza');
assert.equal(core.cityBlockPlan(46,-46,0).parcels.length,0,'Spawn block has no building footprint');
assert.equal(core.cityBlockPlan(138,46,0).kind,'parking','Customs approach remains open');
const kinds=new Set(),types=new Set(),districtTypes={},alleyAxes=new Set(),parcelCounts=new Set();let count=0;
for(let i=-4;i<4;i++)for(let j=-4;j<4;j++){
 const cx=(i+.5)*92,cz=(j+.5)*92,seed=(i+4)*10+j+4;
 const plan=core.cityBlockPlan(cx,cz,seed);
 kinds.add(plan.kind);parcelCounts.add(plan.parcels.length);
 if(plan.alley)alleyAxes.add(plan.alley.axis);
 for(const p of plan.parcels){
  (districtTypes[plan.district]??=new Set()).add(p.type);
  if(plan.alley){const a=plan.alley,center=a.axis==='x'?cx:cz,loc=a.axis==='x'?p.x:p.z,half=(a.axis==='x'?p.w:p.d)/2;assert.ok(Math.abs(loc-center-a.offset)>=a.width/2+half,'Reserved through alley remains clear');}
  count++;types.add(p.type);
  assert.ok(core.clearsStreet(p.x,p.z,p.w,p.d),'Building stays off road');
  assert.ok(p.h>0&&Number.isFinite(p.h),'Positive finite building height');
  for(const q of plan.parcels){
   if(q===p)continue;
   assert.ok(Math.abs(p.x-q.x)>=(p.w+q.w)/2||Math.abs(p.z-q.z)>=(p.d+q.d)/2,'Parcel footprints do not overlap');
  }
 }
}
assert.ok(kinds.size>=7&&types.size>=6&&count>80,'Distinct city districts and building archetypes');
assert.ok(Object.values(districtTypes).every(t=>t.size>=4),'Every district has mixed building uses');
assert.equal(alleyAxes.size,2,'Alleys alternate orientation');
assert.ok(parcelCounts.size>=4,'Blocks have irregular parcel counts');
assert.ok(html.includes('detailBatch(houseRoofs,gabledRoof()'),'Pitched residential roofs');
assert.ok(html.includes('detailBatch(warehouseRoofs,gabledRoof()'),'Industrial roof geometry');
assert.ok(html.includes('detailBatch(parkMounds'),'Landscaped relief');
assert.ok(html.includes('detailBatch(fountainBases'),'Spawn plaza centerpiece');
assert.ok(html.includes('publicSpaces:neighborhoods.filter'),'Public spaces connected to residents');
assert.ok(cityLifeSource.includes('resident.pathAxis=p.axis'),'Walkers follow sidewalk direction');

assert.ok(html.includes('coachworkGeometry(police)'),'Vehicles use original longitudinal coachwork mesh');
assert.ok(html.includes('assembly.spin.children'),'Wheel rim customisation addresses nested wheel meshes');
assert.ok(html.includes('exitOffsets.find'),'Vehicle exit checks nearby open space');
assert.ok(html.includes('if(collision(camPos.x,camPos.z,.3))'),'Camera retracts when inside a building footprint');
assert.ok(cityLifeSource.includes('!clearsStreet(x,z,3.2,1.2)'),'Secondary street furniture uses clearance guards');

assert.ok(html.includes('prefers-reduced-motion:reduce'),'Reduced-motion opening variant');

assert.ok(read('server.js').includes("'game-core.js'"),'Server serves game core');
assert.ok(read('server.js').includes("'model-assets.js'"),'Server serves model loader');
assert.ok(read('server.js').includes("'.glb'"),'Server can serve local model format');
const modelManifest=JSON.parse(read('models/manifest.json'));
assert.equal(modelManifest.player,'models/solara-hero.gltf','Original hero is installed');
const hero=JSON.parse(read(modelManifest.player));
assert.equal(hero.asset.version,'2.0','Valid glTF version');
assert.ok(hero.nodes.length>40&&hero.meshes.length>30,'Articulated hero contains detailed mesh parts');
const animNames=hero.animations.map(a=>a.name);
assert.ok(['Idle','Walk','Run','Jump'].every(n=>animNames.includes(n)),'All four animation clips exist');
const binaryUri=hero.buffers[0].uri;
assert.ok(binaryUri.startsWith('data:application/octet-stream;base64,'),'Asset has embedded buffer');
const base64=binaryUri.split(',')[1],padding=base64.endsWith('==')?2:base64.endsWith('=')?1:0;
assert.equal(base64.length*3/4-padding,hero.buffers[0].byteLength,'Asset buffer length matches');
for(const view of hero.bufferViews){assert.ok(view.byteOffset+view.byteLength<=hero.buffers[0].byteLength,'Buffer view inside embedded data');}
for(const a of hero.accessors){assert.ok(a.bufferView>=0&&a.bufferView<hero.bufferViews.length&&a.count>0,'Valid accessor reference');}
for(const anim of hero.animations)for(const ch of anim.channels){assert.ok(ch.target.node<hero.nodes.length&&ch.sampler<anim.samplers.length,'Animation targets real joints');}

assert.ok(html.includes("import {createPlayerModelSystem} from './model-assets.js';"),'Character pipeline is imported');
assert.ok(html.includes('modelAssets.load()'),'Optional character loading begins');
assert.ok(html.includes("modelAssets.update(dt,{walking:walkBlend,running:runBlend,jumping,enabled:gameMode==='play'&&!inCar})"),'Animation mixer preserves special story poses');
assert.ok(html.includes('new THREE.CapsuleGeometry(.185,.68'),'New rounded fallback arms are present');
assert.ok(html.includes('new THREE.CapsuleGeometry(.206,.79'),'New rounded fallback legs are present');

const taxiStart=html.indexOf('const taxiStops=['),taxiEnd=html.indexOf('function offerMission(){',taxiStart);
assert.ok(taxiStart>0&&taxiEnd>taxiStart,'Taxi job module is present');
const taxiSandbox={
 Math,carPos:{x:0,z:0},velocity:0,mission:null,inCar:true,phoneOpen:false,
 save:{money:45},setNotice:()=>{},setWaypoint:()=>{},closePhone:()=>{},
 persist:()=>{},updateHUD:()=>{}
};
const taxiFunctions=html.slice(taxiStart,taxiEnd)+
 ';globalThis.taxi={startTaxiJob,updateTaxiJob,taxiObjective,get job(){return taxiJob}};';
vm.runInNewContext(taxiFunctions,taxiSandbox,{filename:'taxi-job'});
taxiSandbox.taxi.startTaxiJob();
assert.ok(taxiSandbox.taxi.job,'Taxi job starts from phone');
assert.equal(taxiSandbox.taxi.job.stage,'pickup');
taxiSandbox.carPos.x=taxiSandbox.taxi.job.from.x;
taxiSandbox.carPos.z=taxiSandbox.taxi.job.from.z;
taxiSandbox.taxi.updateTaxiJob(.1);
assert.equal(taxiSandbox.taxi.job.stage,'dropoff','Taxi can collect passenger');
const fare=taxiSandbox.taxi.job.pay;
taxiSandbox.carPos.x=taxiSandbox.taxi.job.to.x;
taxiSandbox.carPos.z=taxiSandbox.taxi.job.to.z;
taxiSandbox.taxi.updateTaxiJob(.1);
assert.equal(taxiSandbox.taxi.job,null,'Taxi job completes');
assert.equal(taxiSandbox.save.money,45+fare,'Taxi fare is paid');
console.log('MVT 6 QA: inline JS, UI IDs, gameplay math, static route, and taxi fare tests passed.');
