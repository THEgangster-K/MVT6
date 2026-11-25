
export function applyStoryPose(model,joints,baseY,amount){
 const a=Math.max(0,Math.min(1,amount));
 model.position.y=baseY+.64*a;
 const {pelvis,spine,legs,knees,arms,elbows}=joints;
 pelvis.position.y=1.25-.63*a;spine.rotation.x=-.14*a;
 for(let i=0;i<2;i++){
  legs[i].rotation.x=-1.48*a;knees[i].rotation.x=1.42*a;
  arms[i].rotation.x=-.4*a;elbows[i].rotation.x=-.32*a;
 }
}
// Optional original GLB/GLTF player character pipeline.
// A missing, malformed or incompatible model never prevents the game from booting.
// Add files under /models and opt in via /models/manifest.json.
export function createPlayerModelSystem({THREE, root, fallbackChildren, manifestKey='player', onStatus=()=>{}}) {
  let mixer=null, model=null, actions={}, activeAction=null, loaded=false,showing=false;
  const original=fallbackChildren.slice();
  let lastState='idle',poseJoints=null,posing=false,baseY=0,gestureBase=null;
  function status(message) { onStatus(message); }
  function update(dt,{walking=0,running=0,jumping=false,enabled=true,seatAmount=null,gesture=0}={}) {
    if(!loaded || !mixer)return;
    if(gestureBase){for(const [joint,rotation] of gestureBase)joint.rotation.copy(rotation);gestureBase=null;}
    // The same loaded hero is used for the seated-to-standing story pose and ordinary movement.
    if(enabled!==showing){showing=enabled;model.visible=enabled;for(const child of original)child.visible=!enabled;}
    if(!enabled)return;
    if(seatAmount!==null&&poseJoints){
      if(!posing){mixer.stopAllAction();activeAction=null;posing=true}
      applyStoryPose(model,poseJoints,baseY,seatAmount);
      lastState='seated';return;
    }
    if(posing){posing=false;model.position.y=baseY;poseJoints.pelvis.position.y=1.25;poseJoints.spine.rotation.set(0,0,0);for(const j of [...poseJoints.legs,...poseJoints.knees,...poseJoints.arms,...poseJoints.elbows])j.rotation.set(0,0,0);activeAction=null}
    // Hysteresis prevents clip thrashing when movement is near a transition threshold.
    const runThreshold=lastState==='run'?.43:.60;
    const walkThreshold=(lastState==='walk'||lastState==='run')?.07:.17;
    const next=jumping&&actions.jump?'jump':running>runThreshold&&actions.run?'run':walking>walkThreshold&&actions.walk?'walk':'idle';
    const clip=actions[next]||actions.idle;
    if(clip && clip!==activeAction){
      const previous=activeAction;
      const locomotion=(lastState==='walk'||lastState==='run')&&(next==='walk'||next==='run');
      const phase=locomotion&&previous?previous.time/Math.max(.001,previous.getClip().duration):0;
      clip.reset().setEffectiveWeight(1).setEffectiveTimeScale(1).play();
      if(locomotion)clip.time=(phase%1)*clip.getClip().duration;
      if(previous)previous.crossFadeTo(clip,jumping?.13:.23,false);
      activeAction=clip;
    }
    lastState=next;
    mixer.update(Math.max(0,Math.min(dt,.06)));
    if(gesture>0&&!jumping&&walking<.3&&poseJoints){
      const arm=poseJoints.arms[1],elbow=poseJoints.elbows[1],amount=Math.min(1,gesture*5);
      gestureBase=[[arm,arm.rotation.clone()],[elbow,elbow.rotation.clone()]];
      arm.rotation.x+=( -1.02-arm.rotation.x)*amount;arm.rotation.z+=Math.sin(gesture*11)*.12*amount;
      elbow.rotation.x+=(-.48-elbow.rotation.x)*amount;
    }
  }
  async function load() {
    try{
      const response=await fetch('./models/manifest.json',{cache:'no-cache'});
      if(!response.ok)return;
      const manifest=await response.json();
      const src=manifest?.[manifestKey];
      if(typeof src!=='string'||!/^models\/[a-zA-Z0-9_./-]+\.(glb|gltf)$/i.test(src)||src.includes('..'))return;
      // Import the Three.js loader only if a real local asset is configured.
      const {GLTFLoader}=await import('https://cdn.jsdelivr.net/npm/three@0.160.1/examples/jsm/loaders/GLTFLoader.js');
      const gltf=await new GLTFLoader().loadAsync('./'+src);
      if(!gltf?.scene)throw Error('Model scene missing');
      if(!gltf.animations?.length)throw Error('Player asset must contain walk/idle animation clips');
      const clips={};
      for(const clip of gltf.animations){
        const name=clip.name.toLowerCase();
        for(const kind of ['idle','walk','run','jump'])if(!clips[kind]&&(name===kind||name.startsWith(kind+'_')||name.includes(kind)))clips[kind]=clip;
      }
      if(!clips.idle||!clips.walk)throw Error('At least Idle and Walk animation clips are required');
      const asset=gltf.scene;
      const bounds=new THREE.Box3().setFromObject(asset);
      const dimensions=bounds.getSize(new THREE.Vector3());
      if(!Number.isFinite(dimensions.y)||dimensions.y<=.01)throw Error('Invalid model height');
      const center=bounds.getCenter(new THREE.Vector3()),height=2.98,scale=height/dimensions.y;
      // Keep local player origin at the feet; the existing collision system stays unchanged.
      asset.scale.multiplyScalar(scale);
      asset.position.set(-center.x*scale,-bounds.min.y*scale,-center.z*scale);
      asset.traverse(node=>{if(node.isMesh){node.frustumCulled=false;node.castShadow=true}});
      const find=name=>asset.getObjectByName(name);
      const joints={pelvis:find('Pelvis'),spine:find('Spine'),legs:[find('LeftHip'),find('RightHip')],knees:[find('LeftKnee'),find('RightKnee')],arms:[find('LeftShoulder'),find('RightShoulder')],elbows:[find('LeftElbow'),find('RightElbow')]};
      poseJoints=[joints.pelvis,joints.spine,...joints.legs,...joints.knees,...joints.arms,...joints.elbows].every(Boolean)?joints:null;
      baseY=asset.position.y;
      const nextMixer=new THREE.AnimationMixer(asset);
      const nextActions={};
      for(const [key,clip] of Object.entries(clips))nextActions[key]=nextMixer.clipAction(clip);
      root.add(asset);
      asset.visible=false;
      model=asset;mixer=nextMixer;actions=nextActions;loaded=true;showing=false;
      activeAction=(actions.idle||actions.walk).reset().play();
      status('Custom character model loaded');
    }catch(err){
      // Restore the original procedural model if loading or validation fails.
      if(model){root.remove(model);model=null}
      for(const child of original)child.visible=true;
      mixer=null;loaded=false;showing=false;actions={};activeAction=null;poseJoints=null;posing=false;
      console.warn('MVT6 character model fallback:',String(err?.message||err));
      status('Using built-in character');
    }
  }
  return {update,load,get loaded(){return loaded},get state(){return lastState}};
}
