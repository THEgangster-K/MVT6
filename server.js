'use strict';
const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const {WebSocketServer,WebSocket}=require('ws');
const {Pool}=require('pg');
const PORT=Number(process.env.PORT||3000);
const SECRET=process.env.SESSION_SECRET||crypto.randomBytes(32).toString('hex');
const db=process.env.DATABASE_URL?new Pool({connectionString:process.env.DATABASE_URL,ssl:process.env.DB_SSL==='false'?false:{rejectUnauthorized:false},max:5}):null;
const users=new Map(), sessions=new Map();
const peers=new Map();let nextId=0;
function json(res,status,body,extra={}){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store',...extra});res.end(JSON.stringify(body))}
function cookies(req){return Object.fromEntries((req.headers.cookie||'').split(';').map(x=>x.trim().split('=').map(decodeURIComponent)).filter(x=>x.length===2))}
function sign(data){return crypto.createHmac('sha256',SECRET).update(data).digest('base64url')}
function token(uid){const payload=Buffer.from(JSON.stringify({uid,exp:Date.now()+1000*60*60*24*7})).toString('base64url');return payload+'.'+sign(payload)}
function verify(value){try{const [p,s]=String(value||'').split('.');if(!p||!s||s.length!==sign(p).length||!crypto.timingSafeEqual(Buffer.from(s),Buffer.from(sign(p))))return null;const d=JSON.parse(Buffer.from(p,'base64url').toString());return d.exp>Date.now()?d.uid:null}catch{return null}}
function session(req){return verify(cookies(req).mvt6_session)}
function setCookie(res,value){res.setHeader('Set-Cookie','mvt6_session='+value+'; HttpOnly; SameSite=Lax; Path=/; Max-Age=604800'+(process.env.NODE_ENV==='production'?'; Secure':''))}
async function body(req){return new Promise((resolve,reject)=>{let text='';req.on('data',chunk=>{text+=chunk;if(text.length>8192){reject(Error('Request too large'));req.destroy()}});req.on('end',()=>{try{resolve(JSON.parse(text||'{}'))}catch{reject(Error('Invalid JSON'))}});req.on('error',reject)})}
function hash(password,salt=crypto.randomBytes(16).toString('hex')){return salt+':'+crypto.scryptSync(password,salt,64).toString('hex')}
function matches(password,stored){try{const [salt]=stored.split(':');const candidate=hash(password,salt);return crypto.timingSafeEqual(Buffer.from(stored),Buffer.from(candidate))}catch{return false}}
function cleanProgress(v){const limit=(x,max)=>Math.max(0,Math.min(max,Math.floor(Number(x)||0)));return {money:limit(v?.money,100000000),completed:limit(v?.completed,1000000),speed:limit(v?.speed,5),handling:limit(v?.handling,5),nitro:limit(v?.nitro,5)}}
async function initDb(){if(!db){console.warn('DATABASE_URL not set: guest multiplayer enabled; player accounts unavailable');return}await db.query('CREATE TABLE IF NOT EXISTS mvt_players (id BIGSERIAL PRIMARY KEY, username VARCHAR(20) UNIQUE NOT NULL, password_hash TEXT NOT NULL, progress JSONB NOT NULL DEFAULT \'{"money":500,"completed":0,"speed":0,"handling":0,"nitro":0}\'::jsonb, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())');console.log('Account database ready')}
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.ico':'image/x-icon'};
async function route(req,res){
const url=new URL(req.url,'http://localhost');
if(url.pathname==='/api/health')return json(res,200,{ok:true,online:peers.size,accountsEnabled:!!db});
if(url.pathname.startsWith('/api/')){
if(!db)return json(res,503,{error:'Accounts require a configured PostgreSQL database.'});
if(req.method==='GET'&&url.pathname==='/api/me'){const uid=session(req);if(!uid)return json(res,200,{user:null});const found=await db.query('SELECT username,progress FROM mvt_players WHERE id=$1',[uid]);return json(res,200,{user:found.rows[0]||null})}
if(req.method==='POST'&&['/api/register','/api/login'].includes(url.pathname)){
const input=await body(req),username=String(input.username||'').trim(),password=String(input.password||'');
if(!/^[a-zA-Z0-9_]{3,20}$/.test(username)||password.length<10||password.length>128)return json(res,400,{error:'Username: 3–20 letters/numbers/underscores. Password: 10–128 characters.'});
let found;
if(url.pathname==='/api/register'){try{found=await db.query('INSERT INTO mvt_players(username,password_hash) VALUES($1,$2) RETURNING id,username,progress',[username,hash(password)])}catch(e){if(e.code==='23505')return json(res,409,{error:'Username is already taken'});throw e}}
else{found=await db.query('SELECT id,username,password_hash,progress FROM mvt_players WHERE lower(username)=lower($1)',[username]);if(!found.rows[0]||!matches(password,found.rows[0].password_hash))return json(res,401,{error:'Invalid username or password'})}
setCookie(res,token(found.rows[0].id));return json(res,200,{user:{username:found.rows[0].username,progress:found.rows[0].progress}})
}
if(req.method==='POST'&&url.pathname==='/api/logout'){res.setHeader('Set-Cookie','mvt6_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0'+(process.env.NODE_ENV==='production'?'; Secure':''));return json(res,200,{ok:true})}
if(req.method==='POST'&&url.pathname==='/api/progress'){const uid=session(req);if(!uid)return json(res,401,{error:'Login required'});const value=cleanProgress(await body(req));await db.query('UPDATE mvt_players SET progress=$1 WHERE id=$2',[JSON.stringify(value),uid]);return json(res,200,{ok:true})}
return json(res,404,{error:'Not found'});
}
if(req.method!=='GET')return json(res,405,{error:'Method not allowed'});
const target=url.pathname==='/'?'/index.html':url.pathname;
const full=path.resolve(__dirname,'.'+target);
if(full!==path.resolve(__dirname,'index.html')&&full!==path.resolve(__dirname,'client.js')&&full!==path.resolve(__dirname,'city-life.js'))return json(res,404,{error:'Not found'});
fs.readFile(full,(err,data)=>{if(err)return json(res,404,{error:'File missing'});res.writeHead(200,{'Content-Type':mime[path.extname(full)]||'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff','Content-Security-Policy':"frame-ancestors 'none'"});res.end(data)})
}
const app=http.createServer((req,res)=>{route(req,res).catch(e=>{console.error(e);if(!res.headersSent)json(res,500,{error:'Server error'})})});
const wss=new WebSocketServer({server:app,path:'/world',maxPayload:2048});
function send(ws,obj){if(ws.readyState===WebSocket.OPEN&&ws.bufferedAmount<32768)ws.send(JSON.stringify(obj))}
wss.on('connection',(ws,req)=>{
if(peers.size>=32){ws.close(1013,'Room full');return}
const id=String(++nextId),name='Driver '+id;
const state={id,name,x:0,z:0,angle:0,inCar:true};
peers.set(ws,{state,last:0,lastPosition:Date.now()});
send(ws,{type:'welcome',id,players:[...peers.values()].map(p=>p.state)});
ws.on('message',raw=>{let m;try{m=JSON.parse(raw.toString())}catch{return}if(m.type!=='move')return;const peer=peers.get(ws),now=Date.now();if(!peer||now-peer.last<55)return;
const {x,z,angle,inCar}=m;
if(![x,z,angle].every(n=>typeof n==='number'&&Number.isFinite(n))||Math.abs(x)>490||Math.abs(z)>490||Math.abs(angle)>100000||typeof inCar!=='boolean')return;
const elapsed=Math.max(.055,(now-peer.lastPosition)/1000);
if(Math.hypot(x-peer.state.x,z-peer.state.z)>Math.max(20,120*elapsed))return;
Object.assign(peer.state,{x,z,angle,inCar});peer.last=now;peer.lastPosition=now;
});
ws.on('close',()=>peers.delete(ws));ws.on('error',()=>{});
});
setInterval(()=>{const players=[...peers.values()].map(p=>p.state);for(const ws of peers.keys())send(ws,{type:'snapshot',players})},100);
initDb().then(()=>app.listen(PORT,'0.0.0.0',()=>console.log('MVT 6 running on '+PORT))).catch(e=>{console.error('Database startup failed:',e);process.exit(1)});
process.on('SIGTERM',()=>{app.close();wss.close();if(db)db.end()});
