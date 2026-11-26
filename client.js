// MVT 6 multiplayer bridge. One shared room, max 32 players.
export function multiplayer({THREE,scene,makeCar,box,mat,mesh,getState,onMessage,onAccount}){
const remotes=new Map();
const state={online:false,players:1,account:null,connected:false};
const status=document.getElementById('onlineStatus');
const count=document.getElementById('playerCount');
const auth=document.getElementById('authPanel');
const info=document.getElementById('authInfo');
let ws=null,reconnect=0,latest=[],lastSend=0,alive=true,lastFrameTime=0;
const labelVector=new THREE.Vector3();
const worldUrl=location.protocol==='https:'?'wss://':'ws://';
function connect(){
 if(!alive)return;
 ws=new WebSocket(worldUrl+location.host+'/world');
 ws.onopen=()=>{state.online=true;state.connected=true;status.textContent='ONLINE';status.style.color='#78e8b2';};
 ws.onmessage=event=>{let m;try{m=JSON.parse(event.data)}catch{return}
 if(m.type==='welcome'){state.id=m.id;return}
 if(m.type==='snapshot'){const mine=m.players.find(p=>p.id===state.id);state.players=m.players.length;count.textContent=state.players+' ONLINE';latest=m.players.filter(p=>p.id!==state.id);sync();}
 };
 ws.onclose=()=>{state.online=false;state.connected=false;status.textContent='RECONNECTING';status.style.color='#f6bd68';clearTimeout(reconnect);reconnect=setTimeout(connect,2500)};
 ws.onerror=()=>{};
}
function createActor(p){
 const car=makeCar('#6bd1f5');
 const person=new THREE.Group();scene.add(person);
 box(.8,1.5,.5,0,1.5,0,mat('#bcdda9'),person);
 const head=mesh(new THREE.SphereGeometry(.46,10,8),mat('#f0bb94'),person);head.position.y=2.6;
 const label=document.createElement('div');label.className='remoteLabel';label.textContent=p.name;document.body.append(label);
 for(const actor of [car,person]){actor.position.set(p.x,0,p.z);actor.rotation.y=p.angle;}
 return {car,person,label,target:{x:p.x,z:p.z,angle:p.angle,inCar:p.inCar},wasInCar:p.inCar};
}
function sync(){const seen=new Set();for(const p of latest){seen.add(p.id);if(!remotes.has(p.id))remotes.set(p.id,createActor(p));const r=remotes.get(p.id);r.target={x:p.x,z:p.z,angle:p.angle,inCar:p.inCar}}
 for(const [id,r] of remotes)if(!seen.has(id)){scene.remove(r.car,r.person);r.label.remove();remotes.delete(id)}}
function frame(now,camera){const dt=lastFrameTime?Math.max(0,Math.min(.10,(now-lastFrameTime)/1000)):1/60;lastFrameTime=now;const blend=1-Math.exp(-14.9*dt);if(ws?.readyState===WebSocket.OPEN&&now-lastSend>85){const p=getState();ws.send(JSON.stringify({type:'move',...p}));lastSend=now}
 for(const r of remotes.values()){
 const {x,z,angle,inCar}=r.target;const actor=inCar?r.car:r.person;
 r.car.visible=inCar;r.person.visible=!inCar;
 if(r.wasInCar!==inCar){actor.position.set(x,0,z);actor.rotation.y=angle;r.wasInCar=inCar;}
 actor.position.x+=(x-actor.position.x)*blend;actor.position.z+=(z-actor.position.z)*blend;
 actor.rotation.y+=Math.atan2(Math.sin(angle-actor.rotation.y),Math.cos(angle-actor.rotation.y))*blend;
 const screen=labelVector.copy(actor.position);screen.y+=4;screen.project(camera);
 r.label.style.display=screen.z<1&&screen.z>-1&&Math.abs(screen.x)<1.15&&Math.abs(screen.y)<1.15?'block':'none';
 r.label.style.left=((screen.x+1)/2*innerWidth)+'px';r.label.style.top=((-screen.y+1)/2*innerHeight)+'px';
 }}
async function request(endpoint,body){const r=await fetch('/api/'+endpoint,{method:body?'POST':'GET',headers:{'Content-Type':'application/json'},credentials:'same-origin',body:body?JSON.stringify(body):undefined});const d=await r.json();if(!r.ok)throw Error(d.error||'Request failed');return d}
async function checkAccount(){try{const d=await request('me');account(d.user)}catch{info.textContent='Online accounts need a server database. Guest multiplayer is still available.'}}
function account(user){state.account=user;if(user){info.textContent='Signed in as '+user.username;auth.querySelector('#authActions').style.display='none';document.getElementById('logout').style.display='inline-block';onAccount(user.progress||null)}else{info.textContent='Guest mode: play online without an account';auth.querySelector('#authActions').style.display='block';document.getElementById('logout').style.display='none'}}
document.getElementById('authToggle').onclick=()=>{auth.style.display=auth.style.display==='none'?'block':'none'};
document.getElementById('authLogin').onclick=()=>login('login');
document.getElementById('authRegister').onclick=()=>login('register');
document.getElementById('logout').onclick=async()=>{await request('logout',{}).catch(()=>{});account(null)};
async function login(mode){const username=document.getElementById('username').value,password=document.getElementById('password').value;try{const d=await request(mode,{username,password});document.getElementById('password').value='';account(d.user)}catch(e){info.textContent=e.message}}
let saveTimer;
function save(progress){if(!state.account)return;clearTimeout(saveTimer);saveTimer=setTimeout(()=>request('progress',progress).catch(e=>{info.textContent='Cloud save failed: '+e.message}),400)}
connect();checkAccount();
return {state,frame,save};
}
