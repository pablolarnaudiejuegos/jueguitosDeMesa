import http from 'node:http';
import {readFileSync} from 'node:fs';
import {getStore} from './lib/store.js';
import {randomBytes,scryptSync,timingSafeEqual,createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=fileURLToPath(new URL('.',import.meta.url));
const hash=v=>createHash('sha256').update(v).digest('hex');
const token=()=>randomBytes(32).toString('hex');
const password=(p,s)=>scryptSync(p,s,64).toString('hex');
const equal=(a,b)=>a.length===b.length&&timingSafeEqual(Buffer.from(a),Buffer.from(b));
const publicUser=u=>({id:u.id,name:u.name});

export async function handler(req,res){
 const send=(status,value)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(value));};
 try{
 const url=new URL(req.url,'http://localhost');res.setHeader('X-Content-Type-Options','nosniff');
 if(url.pathname.startsWith('/api/')){
  const store=await getStore();
  if(req.method==='POST'&&req.headers.origin&&new URL(req.headers.origin).host!==req.headers.host)return send(403,{error:'Origen no permitido.'});
  let b={};if(req.method==='POST'){let raw='';if(req.body===undefined)for await(const c of req){raw+=c;if(raw.length>20000)return send(413,{error:'Solicitud demasiado grande.'});}try{b=req.body&&typeof req.body==='object'?req.body:JSON.parse(typeof req.body==='string'?req.body:raw||'{}');}catch{return send(400,{error:'Datos invÃ¡lidos.'});}}
  const sid=/(?:^|;\s*)mesa_session=([^;]+)/.exec(req.headers.cookie||'')?.[1];
  const found=await store.find('sessions',{token:hash(sid||'')}),session=found&&found.expires>Date.now()?found:null,user=session&&await store.find('users',{id:session.user});
  const newSession=async u=>{const raw=token(),expires=Date.now()+7*86400000;await store.insert('sessions',{token:hash(raw),user:u.id,expires,expiresAt:new Date(expires)});res.setHeader('Set-Cookie',`mesa_session=${raw}; HttpOnly; SameSite=Strict; Path=/; Max-Age=604800${process.env.VERCEL||process.env.MESA_HTTPS==='1'?'; Secure':''}`);};
  if(req.method==='GET'&&url.pathname==='/api/me')return send(200,{user:user?publicUser(user):null});
  if(req.method==='POST'&&['/api/register','/api/login','/api/recover'].includes(url.pathname)){
   if(!await store.rate(hash(process.env.VERCEL?String(req.headers['x-vercel-forwarded-for']||req.headers['x-forwarded-for']||'unknown').split(',')[0]:req.socket.remoteAddress)))return send(429,{error:'Demasiados intentos. EsperÃ¡ diez minutos.'});
   const name=String(b.name||'').trim(),pass=String(b.password||'');if(!/^[\p{L}\p{N}_ -]{3,24}$/u.test(name)||pass.length<10||pass.length>128)return send(400,{error:'Usuario de 3â€“24 caracteres y contraseÃ±a de 10â€“128 caracteres.'});
   let u=await store.find('users',{nameKey:name.toLowerCase()});
   if(url.pathname==='/api/register'){
    if(u)return send(409,{error:'Ese usuario ya existe.'});const salt=token(),recovery=token();u={id:token(),name,nameKey:name.toLowerCase(),salt,password:password(pass,salt),recovery:hash(recovery)};try{await store.insert('users',u);}catch(e){if(e.code===11000)return send(409,{error:'Ese usuario ya existe.'});throw e;}await newSession(u);return send(201,{user:publicUser(u),recovery});
   }
   if(url.pathname==='/api/recover'){
    if(!u||!equal(hash(String(b.recovery||'')),u.recovery))return send(401,{error:'Usuario o cÃ³digo incorrectos.'});u.salt=token();u.password=password(pass,u.salt);const recovery=token();u.recovery=hash(recovery);await store.update('users',{id:u.id},{salt:u.salt,password:u.password,recovery:u.recovery});await store.remove('sessions',{user:u.id});await newSession(u);return send(200,{user:publicUser(u),recovery});
   }
   const candidate=password(pass,u?.salt||'dummy-salt');if(!u||!equal(candidate,u.password))return send(401,{error:'Usuario o contraseÃ±a incorrectos.'});await newSession(u);return send(200,{user:publicUser(u)});
  }
  if(req.method==='POST'&&url.pathname==='/api/logout'){if(session)await store.remove('sessions',{token:session.token});res.setHeader('Set-Cookie','mesa_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0'+(process.env.VERCEL||process.env.MESA_HTTPS==='1'?'; Secure':''));return send(200,{ok:true});}
  if(!user)return send(401,{error:'IniciÃ¡ sesiÃ³n para continuar.'});
  if(req.method==='GET'&&url.pathname==='/api/history')return send(200,{matches:(await store.list('matches',{owner:user.id})).sort((a,b)=>b.date.localeCompare(a.date))});
  if(req.method==='POST'&&url.pathname==='/api/matches'){
   if(!/^[a-zA-Z0-9-]{8,100}$/.test(b.id||'')||!['bonsai','carcassonne','naturalis'].includes(b.game)||!['solo','local','machine'].includes(b.mode)||!Array.isArray(b.players)||b.players.length<1||b.players.length>5||b.players.some(p=>typeof p.name!=='string'||p.name.length>24||!Number.isSafeInteger(p.score)||p.score<0||p.score>10000))return send(400,{error:'Resultado invÃ¡lido.'});
   const existing=await store.find('matches',{id:b.id});if(existing)return existing.owner===user.id?send(200,{ok:true}):send(409,{error:'Partida ya registrada.'});
   try{await store.insert('matches',{id:b.id,owner:user.id,game:b.game,mode:b.mode,date:new Date().toISOString(),players:b.players.map((p,i)=>({name:i===0?user.name:p.name,score:p.score})),verified:false});}catch(e){if(e.code!==11000)throw e;const saved=await store.find('matches',{id:b.id});return send(saved.owner===user.id?200:409,saved.owner===user.id?{ok:true}:{error:'Partida ya registrada.'});}return send(201,{ok:true});
  }
  return send(404,{error:'No encontrado.'});
 }
 const name=url.pathname==='/'?'index.html':decodeURIComponent(url.pathname).slice(1),relative=path.normalize(name);
 const allowed=new Set(['burger.html','burger.js','burger.css','burger-data.js','burger-engine.js','naturalis.html','naturalis.js','naturalis.css','naturalis-data.js','naturalis-engine.js','index.html','carcassonne.html','bonsai.html','profile.html','app.js','bonsai.js','engine.js','bonsai-engine.js','accounts.js','bots.js','style.css','bonsai.css','accounts.css']);
 if(!allowed.has(relative)&&!(relative.startsWith('assets'+path.sep)&&!relative.split(path.sep).includes('..')&&/\.(jpg|png|svg)$/.test(relative))){res.writeHead(404);return res.end('No encontrado');}
 const types={'.jpg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml','.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8'};
 res.writeHead(200,{'Content-Type':types[path.extname(relative)],'Cache-Control':'no-cache'});res.end(readFileSync(path.join(root,relative)));
 }catch{if(!res.headersSent)send(500,{error:'No se pudo completar la operaciÃ³n.'});else res.end();}
}
export const server=http.createServer(handler);
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))server.listen(Number(process.env.PORT||4173),'127.0.0.1',()=>console.log('Mesa Abierta lista'));
