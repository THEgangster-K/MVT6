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
// Execute the real geometry helper and the exact waterfront pier construction
// in a minimal scene stub. Syntax checks alone missed this invalid-parent crash.
const helperStart=html.indexOf('function mesh(geometry,material,parent=scene)');
const helperEnd=html.indexOf('function textTexture',helperStart);
const pierLine=html.split('\n').find(line=>line.includes('for(const x of [-455,-437,-419])'));
assert.ok(helperStart>=0&&helperEnd>helperStart&&pierLine,'Pier construction and helpers exist');
const pierChildren=[];
const pierSandbox={scene:{add:m=>pierChildren.push(m)},rail:{},THREE:{
 Mesh:class {constructor(geometry,material){this.geometry=geometry;this.material=material;this.position={set:(...v)=>{this.coords=v}}}},
 CylinderGeometry:class {constructor(...args){this.args=args}}
}};
vm.runInNewContext(html.slice(helperStart,helperEnd)+'\n'+pierLine,pierSandbox,{filename:'waterfront-startup'});
assert.equal(pierChildren.length,6,'All six pier supports attach to scene');
assert.ok(pierChildren.every(m=>m.geometry.args[3]===8),'Pier support detail argument reaches cylinder geometry');
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
 '\n;globalThis.core={movementVector,slideMove,approachAngle,policeRoadWaypoint,bailAmount,nextMissionPhase,arcadeSlideStep,clearsStreet,cityDistrict,cityBlockPlan,junctionPhase,trafficQueueSpeed,nextJunction,arcadeCarContact,secondaryLane,vehicleProfile,homeCatalog,purchaseHome,residentRoutine,visualSpring};';
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
assert.ok(html.includes('HOMESTEAD · V2.8'),'Visible release marker');
assert.equal(core.homeCatalog.length,3,'Three purchasable properties');
const originalProgress={money:4000,homes:[]};
let owned=originalProgress;
for(const home of core.homeCatalog){
 assert.ok(core.clearsStreet(home.x,home.z,14,12),'Home plot clears primary road');
 const result=core.purchaseHome(owned,home.id);
 if(owned.money>=home.price){assert.ok(result.ok,'Affordable property purchase');assert.equal(result.money,owned.money-home.price,'Exact property cost');owned={money:result.money,homes:result.homes}}
 else assert.ok(!result.ok,'Unaffordable purchase rejected');
}
assert.equal(originalProgress.money,4000,'Transaction does not mutate original');
assert.equal(originalProgress.homes.length,0,'Original ownership intact');
assert.ok(!core.purchaseHome(owned,'starter').ok,'Duplicate purchase blocked');
assert.ok(!core.purchaseHome({money:0,homes:[]},'loft').ok,'Insufficient funds blocked');
assert.ok(!core.purchaseHome({money:9000,homes:[]},'unknown').ok,'Unknown home blocked');
const routineStates=new Set();for(let i=0;i<12;i++)routineStates.add(core.residentRoutine(i*18,0));
assert.equal(routineStates.size,3,'Residents have three routine states');
assert.ok(core.residentRoutine(0,0)!==core.residentRoutine(0,1),'Routines stagger by resident');
let spring={position:0,velocity:0};
for(let i=0;i<120;i++){spring=core.visualSpring(spring.position,spring.velocity,i<40?.06:0,.016);assert.ok(Number.isFinite(spring.position)&&Math.abs(spring.position)<=.12,'Bounded cosmetic spring');}
assert.ok(Math.abs(spring.position)<.01,'Spring settles back');
assert.ok(html.includes('save.homes=result.homes'),'Ownership saved after purchase');
assert.ok(html.includes('if(!confirm(\'Buy \'+home.name'),'Purchase requires confirmation');
assert.ok(read('server.js').includes("homes:Array.isArray(v?.homes)"),'Account save retains properties');
assert.ok(cityLifeSource.includes('residentRoutine(now/1000,n.id)'),'NPC routine applied');
assert.ok(html.includes("turn.className='storyTurn'"),'Individual speaker cards rendered');

assert.ok(html.includes('heroOccupant.group.visible=inCar&&playerCar.visible'),'Hero seated character visible when driving');
assert.ok(html.includes('const driverRig=attachOccupant(car,i)'),'Traffic uses detailed occupant');
assert.ok(html.includes('attachOccupant(c,i+8)'),'Police vehicles use detailed occupant');
assert.ok(html.includes('const rig=makeOccupant(t.id,false)'),'Standing NPC retains same appearance');
assert.ok(html.includes('if(!collision(nextX,nextZ,.35))'),'Walking NPC avoids static footprints');
assert.ok(html.includes('alley:plan.alley||null'),'Minimap can show offset alley routes');
assert.ok(html.includes('venueGlass=new THREE.MeshStandardMaterial'),'Accessible venue glazing exists');
const occupantStart=html.indexOf('const occupantGeo='),occupantEnd=html.indexOf("function makeCar(color=",occupantStart);
assert.ok(occupantStart>=0&&occupantEnd>occupantStart,'Occupant code exists');
const xyz=()=>({x:0,y:0,z:0,set(x,y,z){this.x=x;this.y=y;this.z=z}});
class TestGroup{constructor(){this.position=xyz();this.rotation=xyz();this.scale=xyz();this.children=[];this.userData={};this.visible=true}add(child){this.children.push(child)}}
const shape=class{constructor(...args){this.args=args}};
const occupantSandbox={THREE:{Group:TestGroup,SphereGeometry:shape,CapsuleGeometry:shape},mat:color=>({color}),mesh:(geometry,material,parent)=>{const obj=new TestGroup();obj.geometry=geometry;obj.material=material;parent.add(obj);return obj}};
vm.runInNewContext(html.slice(occupantStart,occupantEnd)+'\nglobalThis.occupantTest={makeOccupant,setOccupantPose,attachOccupant,occupantDetail}',occupantSandbox);
const occupantTest=occupantSandbox.occupantTest;
for(let id=0;id<24;id++){
 const car=new TestGroup();car.userData.cabin={material:{transparent:true,opacity:.25,depthWrite:false}};
 const rig=occupantTest.attachOccupant(car,id);
 assert.equal(rig.arms.length,2,'Occupant arms');
 assert.equal(rig.legs.length,2,'Occupant legs');
 assert.equal(rig.knees.length,2,'Occupant knees');
 assert.equal(rig.elbows.length,2,'Occupant elbows');
 assert.ok(rig.legs.every(l=>l.rotation.x===-1.45),'Seated pose');
 assert.ok(rig.fine.children.length>=8,'Facial detail');
 occupantTest.occupantDetail(car,false);assert.ok(!rig.group.visible&&!car.userData.cabin.material.transparent,'Distant occupant hidden');
 occupantTest.occupantDetail(car,true);assert.ok(rig.group.visible&&car.userData.cabin.material.transparent,'Near occupant visible through glazing');
 occupantTest.occupantDetail(car,true,false);assert.ok(!rig.group.visible,'Exited occupant stays hidden in car');
 occupantTest.setOccupantPose(rig,false);assert.ok(rig.legs.every(l=>Object.is(l.rotation.x,0)),'Neutral standing pose');
}
assert.ok(html.includes('KANG DYNASTY STUDIOS PRESENTS')&&!html.includes('SOLARA CITY STUDIOS PRESENTS'),'Requested studio branding');
assert.ok(!html.includes('<div class="bootArtwork"'),'Flat art removed from opening');
assert.ok(html.includes('@keyframes studioPremiere{0%,7%{opacity:0}34%,64%{opacity:1}92%,100%{opacity:0}}'),'Studio fades from and to black');
assert.ok(html.includes('renderer.render(scene,camera);if(!firstFrameReady)'),'First rendered frame gates title');
assert.ok(html.includes('function playTitleCue(hz,duration)')&&html.includes('ENABLE INTRO AUDIO'),'Optional original title audio');
assert.ok(html.includes('function updateGameAudio(now)'),'Optional game audio');
assert.ok(html.includes('waveMap.offset.x='),'Water animation');
function testTitle(reduced=false){
 const elements=new Map(),makeElement=()=>{const set=new Set();return {style:{},classList:{add:(...v)=>v.forEach(k=>set.add(k)),remove:(...v)=>v.forEach(k=>set.delete(k)),contains:k=>set.has(k)}}};
 const document={body:makeElement(),getElementById:id=>{if(!elements.has(id))elements.set(id,makeElement());return elements.get(id)}};
 let now=0,id=0;const pending=new Map(),listeners={},window={addEventListener:(name,handler)=>{listeners[name]=handler}};
 const context={document,window,performance:{now:()=>now},matchMedia:()=>({matches:reduced}),setInterval:()=>++id,clearInterval:()=>{},setTimeout:(fn,delay)=>{pending.set(++id,{fn,time:now+delay});return id},clearTimeout:k=>pending.delete(k)};
 vm.runInNewContext(matches[0][1],context,{filename:'title-bootstrap'});
 const advance=target=>{while(true){const item=[...pending.entries()].filter(([k,v])=>v.time<=target).sort((a,b)=>a[1].time-b[1].time)[0];if(!item)break;pending.delete(item[0]);now=item[1].time;item[1].fn()}now=target};
 return {window,root:document.getElementById('boot'),body:document.body,skip:()=>document.getElementById('bootSkip').onclick(),fail:()=>listeners.error({message:'test renderer error'}),advance};
}
const title=testTitle();title.window.__mvtLoaded();
assert.ok(title.root.classList.contains('bootStudio'),'First frame is studio splash');
title.advance(3400);assert.ok(title.root.classList.contains('bootStudio')&&!title.root.classList.contains('bootMontage'),'Studio gets full fade interval');
title.advance(3500);assert.ok(title.window.__mvtTitleStart!==null&&title.root.classList.contains('bootMontage')&&!title.root.classList.contains('bootStudio'),'Live montage begins after studio');
title.advance(13099);assert.ok(title.root.classList.contains('bootMontage'),'All six shots have time to play');
title.advance(13100);assert.ok(title.root.classList.contains('bootIdentity')&&title.window.__mvtTitleStart===null,'Logo reveal follows montage');
title.advance(15200);assert.ok(title.root.classList.contains('bootDone')&&!title.body.classList.contains('bootPlaying'),'Title completes and menu restored');
const skipped=testTitle();skipped.window.__mvtLoaded();skipped.advance(4400);skipped.skip();skipped.advance(16000);assert.ok(skipped.root.classList.contains('bootDone')&&skipped.window.__mvtTitleStart===null&&!skipped.root.classList.contains('bootIdentity'),'Skip cancels pending title stages');
const reduced=testTitle(true);reduced.window.__mvtLoaded();assert.ok(reduced.root.classList.contains('bootIdentity')&&!reduced.root.classList.contains('bootStudio'),'Reduced motion skips montage');reduced.advance(600);assert.ok(reduced.root.classList.contains('bootDone'),'Reduced motion reaches menu');
const failedTitle=testTitle();failedTitle.window.__mvtLoaded();failedTitle.advance(4800);failedTitle.fail();failedTitle.advance(16000);assert.ok(failedTitle.root.classList.contains('bootFailed')&&!failedTitle.root.classList.contains('bootDone')&&failedTitle.window.__mvtTitleStart===null,'Runtime failure during montage stops title and shows retry');
const earlySkip=testTitle();earlySkip.skip();assert.ok(!earlySkip.root.classList.contains('bootDone'),'Skip cannot bypass initial rendering');
const cameraStart=html.indexOf('const titleShots=['),cameraEnd=html.indexOf('function updateIntroCamera(dt)',cameraStart);
assert.ok(cameraStart>=0&&cameraEnd>cameraStart,'Actual montage camera functions exist');
const cameraEls=new Map(),frames=[],lights=[];
const shotCtx={window:{__mvtTitleStart:0},atmosphereIndex:0,cubicEase:x=>x*x*(3-2*x),setAtmosphere:x=>lights.push(x),advanceTraffic:()=>{},camera:{position:{set:(...v)=>frames.push(v)},updateProjectionMatrix:()=>{},lookAt:(...v)=>frames.push(v)},$:id=>{if(!cameraEls.has(id))cameraEls.set(id,{style:{},textContent:''});return cameraEls.get(id)}};
vm.runInNewContext(html.slice(cameraStart,cameraEnd)+'\nglobalThis.titleTest={liveTitleCamera,restoreTitleAtmosphere,titleShots}',shotCtx);
assert.equal(shotCtx.titleTest.titleShots.length,6,'Six in-engine camera shots');
for(let i=0;i<6;i++){shotCtx.titleTest.liveTitleCamera(i*1600+800,.016);assert.ok(frames.slice(-2).every(v=>v.length===3&&v.every(Number.isFinite)),'Camera position and target remain finite');assert.ok(cameraEls.get('liveTitleCaption').textContent.startsWith('0'+(i+1)),'Correct shot caption');}
shotCtx.titleTest.restoreTitleAtmosphere();assert.equal(lights.at(-1),0,'Restores original lighting');
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

assert.ok(html.includes('coachworkGeometry(police,type)'),'Vehicles use distinct original coachwork profiles');
const vehicleTypes=['sedan','taxi','utility','compact','wagon','coupe'];
assert.equal(new Set(vehicleTypes.map(t=>JSON.stringify(core.vehicleProfile(t)))).size,6,'Six distinct profiles');
for(const type of vehicleTypes){const p=core.vehicleProfile(type);assert.ok([p.roof,p.rear,p.front,p.body].every(Number.isFinite),'Finite vehicle shape');assert.ok(1.48+p.front-p.rear>1,'Positive roof dimensions');}
assert.ok(html.includes('venueVisits:[ ]')||html.includes('venueVisits:[]'),'Venue activity save default');
assert.ok(html.includes("save.venueVisits=[...visited,id]"),'Venue completion recorded per lead');
assert.ok(read('server.js').includes('venueVisits:Array.isArray'),'Venue completion persists to account');
let lanes=0;
for(let ix=-4;ix<4;ix++)for(let iz=-4;iz<4;iz++){
 const cx=(ix+.5)*92,cz=(iz+.5)*92,seed=(ix+4)*10+iz+4;
 const p=core.cityBlockPlan(cx,cz,seed),lane=core.secondaryLane(cx,cz,p.alley,seed);
 if(!p.alley){assert.equal(lane,null,'No lane in reserved public block');continue;}
 lanes++;assert.equal(lane.points.length,17,'Curved lane sample count');
 assert.ok(lane.width>4&&lane.width<=6,'Reasonable lane width');
 const a=p.alley,center=a.axis==='x'?cx:cz;
 for(const pt of lane.points){const cross=(a.axis==='x'?pt.x:pt.z)-center;assert.ok(Math.abs(cross-a.offset)+lane.width/2<=a.width/2,'Lane stays inside reserved envelope');}
 assert.ok(Math.abs((a.axis==='x'?lane.points[0].z:lane.points[0].x)-(a.axis==='x'?cz:cx))===36,'Lane connects block edge');
}
assert.ok(lanes>30,'Substantial secondary lane coverage');

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
assert.ok(html.includes("modelAssets.update(dt,{...motion,enabled:showPerson&&!showLuxie})")&&html.includes("luxieAssets.update(dt,{...motion,enabled:showPerson&&showLuxie})"),'Separate active animated character assets');
assert.equal(modelManifest.luxie,'models/solara-luxie.gltf','Luxie asset registered');
const luxieAsset=JSON.parse(read(modelManifest.luxie));
assert.equal(luxieAsset.asset.version,'2.0','Luxie glTF version');
assert.ok(luxieAsset.animations.length===hero.animations.length,'Luxie shares compatible animation clips');
assert.ok(JSON.stringify(luxieAsset.materials)!==JSON.stringify(hero.materials),'Distinct clothing palette');
assert.ok(luxieAsset.nodes.some(n=>n.name==='Luxie hair silhouette'),'Distinct hair');
assert.ok(html.includes("luxieOccupant.group.visible=inCar&&playerCar.visible&&activeLead()==='luxie'"),'Matching driver model');
assert.ok(cityLifeSource.includes('setPartner(activeLead)'),'Inactive protagonist contact can switch');
const switchStart=html.indexOf('function switchLead(){'),switchEnd=html.indexOf("$('leadSwitch').onclick",switchStart);
const switchCtx={save:{lead:'jawson'},gameMode:'play',inCar:false,jumping:false,mission:null,taxiJob:null,phoneOpen:false,wheelOpen:false,tutorialOpen:false,keys:{w:true},walkBlend:1,runBlend:1,cityLife:{setPartner:lead=>switchCtx.partner=lead},persist:()=>switchCtx.saved=true,updateHUD:()=>{},setNotice:()=>{},activeLead:()=>switchCtx.save.lead,leadName:()=>switchCtx.save.lead};
vm.runInNewContext(html.slice(switchStart,switchEnd)+`
globalThis.results=[];
globalThis.results.push(switchLead(),save.lead);
mission={};globalThis.results.push(switchLead(),save.lead);
mission=null;inCar=true;globalThis.results.push(switchLead());
inCar=false;globalThis.results.push(switchLead(),save.lead);
`,switchCtx);
assert.deepEqual(Array.from(switchCtx.results),[true,'luxie',false,'luxie',false,true,'jawson'],'Switch guards and both directions');
assert.equal(switchCtx.partner,'jawson','Partner updated');
assert.ok(switchCtx.saved&&!switchCtx.keys.w,'Save and clear movement');
assert.ok(read('server.js').includes("lead:v?.lead==='luxie'?'luxie':'jawson'"),'Server retains valid lead');
assert.ok(read('server.js').includes('leadJobs:{jawson:limit'),'Server retains character chapter counts');

assert.ok(cityLifeSource.includes("fixer.name='Luxie'"),'Luxie is recurring named NPC');
const storyStart=html.indexOf('const chapterBeats=['),storyEnd=html.indexOf('const chapterScreen=',storyStart);
const storySandbox={};vm.runInNewContext(html.slice(storyStart,storyEnd)+'\nglobalThis.storyTest={chapterBeats,chapterAftermath}',storySandbox);
assert.equal(storySandbox.storyTest.chapterBeats.length,8,'Eight chapter conversations');
assert.equal(storySandbox.storyTest.chapterAftermath.length,8,'Eight chapter follow-ups');
for(const [title,dialogue] of storySandbox.storyTest.chapterBeats){assert.ok(title&&dialogue.includes('JAWSON:')&&dialogue.includes('LUXIE:'),'Both leads participate in every briefing')}
const modelJointNames=new Set(hero.nodes.map(n=>n.name));
for(const name of ['Pelvis','Spine','LeftHip','RightHip','LeftKnee','RightKnee','LeftShoulder','RightShoulder','LeftElbow','RightElbow'])assert.ok(modelJointNames.has(name),'Articulated hero includes '+name);
const poseSource=read('model-assets.js').split('// Optional original GLB/GLTF player character pipeline.')[0].replace(/^export /gm,'');
const poseSandbox={};vm.runInNewContext(poseSource+'\nglobalThis.poseTest=applyStoryPose',poseSandbox);
const joint=()=>({position:{y:0},rotation:{x:0}});
const jointPair=()=>[joint(),joint()];
const j={pelvis:joint(),spine:joint(),legs:jointPair(),knees:jointPair(),arms:jointPair(),elbows:jointPair()},m={position:{y:0}};
poseSandbox.poseTest(m,j,0,1);
assert.ok(j.pelvis.position.y<1&&j.legs.every(x=>x.rotation.x<0)&&j.knees.every(x=>x.rotation.x>0),'Seated character pose uses the actual rig');
poseSandbox.poseTest(m,j,0,.5);assert.ok(j.pelvis.position.y>.62&&j.pelvis.position.y<1.25,'Intermediate stand pose');
poseSandbox.poseTest(m,j,0,0);assert.equal(j.pelvis.position.y,1.25,'Standing restores pelvis');
assert.ok(j.legs.every(x=>x.rotation.x===0)&&j.knees.every(x=>x.rotation.x===0),'Standing restores legs');
assert.equal(m.position.y,0,'Restores root position');
const foliageStart=html.indexOf('function updateFoliage(dt,nearX,nearZ)'),foliageEnd=html.indexOf('// Coastal visual:',foliageStart);
const matrix=()=>({elements:Array(16).fill(0),copy(src){this.elements=src.elements.slice();return this}});
const src=matrix(),out=[],batch={instanceMatrix:{needsUpdate:false},setMatrixAt(i,m){out[i]=m.elements.slice()}};
const tree={x:0,z:0,palm:false,first:0,count:1,phase:0,active:false};
const foliageSandbox={reactiveTrees:[tree],foliageMatrix:matrix(),canopyBatch:batch,frondBatch:null,treeCanopies:[src],palmFronds:[]};
vm.runInNewContext(html.slice(foliageStart,foliageEnd)+'\nglobalThis.swayTest=updateFoliage',foliageSandbox);
foliageSandbox.swayTest(.1,0,0);assert.ok(out[0][12]!==0&&batch.instanceMatrix.needsUpdate,'Nearby foliage responds');
foliageSandbox.swayTest(1.4,10,10);assert.equal(out[0][12],0,'Foliage restores original matrix');
assert.ok(!tree.active,'Foliage returns to idle');

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
