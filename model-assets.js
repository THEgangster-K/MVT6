// Optional original GLB/GLTF player character pipeline.
// A missing, malformed or incompatible model never prevents the game from booting.
// Add files under /models and opt in via /models/manifest.json.
export function createPlayerModelSystem({THREE, root, fallbackChildren, onStatus=()=>{}}) {
  let mixer=null, model=null, actions={}, activeAction=null, loaded=false,showing=false;
  const original=fallbackChildren.slice();
  let lastState='idle';
  function status(message) { onStatus(message); }
  function update(dt,{walking=0,running=0,jumping=false,enabled=true}={}) {
    if(!loaded || !mixer)return;
    // Keep the original character for story seating, standing, and other special poses.
    if(enabled!==showing){showing=enabled;model.visible=enabled;for(const child of original)child.visible=!enabled;}
    if(!enabled)return;
    const next=jumping&&actions.jump?'jump':running>.55&&actions.run?'run':walking>.12&&actions.walk?'walk':'idle';
    const clip=actions[next]||actions.idle;
    if(clip && clip!==activeAction){
      clip.reset().play();
      if(activeAction)activeAction.crossFadeTo(clip,.23,false);
      activeAction=clip;
    }
    lastState=next;
    mixer.update(Math.max(0,Math.min(dt,.06)));
  }
  async function load() {
    try{
      const response=await fetch('./models/manifest.json',{cache:'no-cache'});
      if(!response.ok)return;
      const manifest=await response.json();
      const src=manifest?.player;
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
      mixer=null;loaded=false;showing=false;actions={};activeAction=null;
      console.warn('MVT6 character model fallback:',String(err?.message||err));
      status('Using built-in character');
    }
  }
  return {update,load,get loaded(){return loaded},get state(){return lastState}};
}
