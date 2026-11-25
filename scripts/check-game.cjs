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
for(const moduleName of ['city-life.js','client.js','game-core.js']){
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
assert.ok(html.includes('<option value="auto">AUTO · TARGET 60 FPS</option>'),'Adaptive quality option exists');
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
 '\n;globalThis.core={movementVector,slideMove,approachAngle,policeRoadWaypoint,bailAmount,nextMissionPhase};';
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
assert.ok(read('server.js').includes("'game-core.js'"),'Server serves game core');
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
