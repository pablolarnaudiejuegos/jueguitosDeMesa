import test from 'node:test';import assert from 'node:assert/strict';import {spawn} from 'node:child_process';import {mkdtempSync,readFileSync} from 'node:fs';import os from 'node:os';import path from 'node:path';
test('cuentas, sesiones, recuperación, privacidad e idempotencia',async()=>{
 const dir=mkdtempSync(path.join(os.tmpdir(),'mesa-test-')),port=18473;
 const child=spawn(process.execPath,[new URL('./server.js',import.meta.url).pathname.replace(/^\/(\w:)/,'$1')],{env:{...process.env,MONGODB_URI:'',VERCEL:'',NODE_ENV:'test',PORT:String(port),MESA_DATA_DIR:dir},stdio:['ignore','pipe','pipe']});
 try{await new Promise((resolve,reject)=>{child.stdout.once('data',resolve);child.once('error',reject);child.once('exit',()=>reject(Error('No inició el servidor')));});
 let cookie='';const call=async(url,body)=>{const r=await fetch(`http://127.0.0.1:${port}/api/${url}`,{method:body?'POST':'GET',headers:{Cookie:cookie,'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined});if(r.headers.get('set-cookie'))cookie=r.headers.get('set-cookie').split(';')[0];return {status:r.status,data:await r.json()};};
 assert.equal((await call('history')).status,401);
 const reg=await call('register',{name:'Prueba Uno',password:'password-test-123'});assert.equal(reg.status,201);const recovery=reg.data.recovery;
 const match={id:'test-match-123',game:'bonsai',mode:'local',players:[{name:'A',score:90},{name:'B',score:80}]};assert.equal((await call('matches',match)).status,201);assert.equal((await call('matches',match)).status,200);assert.equal((await call('history')).data.matches.length,1);
 const survive={id:'survive-match-123',game:'survive',mode:'machine',players:[{name:'Humano',score:18},{name:'IA fácil',score:9},{name:'IA difícil',score:20}]};assert.equal((await call('matches',survive)).status,201);assert.equal((await call('matches',survive)).status,200);const history=(await call('history')).data.matches;assert.equal(history.length,2);assert.equal(history.find(m=>m.game==='survive').players[0].score,18);
 const club={id:'club-match-123',game:'burger-club',mode:'machine',players:[{name:'Chef',score:24},{name:'IA',score:20}]};assert.equal((await call('matches',club)).status,201);assert.equal((await call('matches',club)).status,200);assert.equal((await call('history')).data.matches.filter(m=>m.game==='burger-club').length,1);
 await call('logout',{});assert.equal((await call('login',{name:'Prueba Uno',password:'incorrecta-123'})).status,401);
 assert.equal((await call('recover',{name:'Prueba Uno',password:'new-password-123',recovery})).status,200);
 await call('logout',{});await call('register',{name:'Prueba Dos',password:'password-test-234'});assert.equal((await call('history')).data.matches.length,0);assert.equal((await call('matches',match)).status,409);
 assert(!readFileSync(path.join(dir,'accounts.json'),'utf8').includes('new-password-123'));
 assert.equal((await fetch(`http://127.0.0.1:${port}/private-data/accounts.json`)).status,404);
 }finally{child.kill();}
});
