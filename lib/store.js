import {readFileSync,writeFileSync,renameSync,mkdirSync,existsSync} from 'node:fs';
import path from 'node:path';
import {MongoClient} from 'mongodb';
let pending;
export async function getStore(){
 if(!pending)pending=open().catch(e=>{pending=undefined;throw e;});
 return pending;
}
async function open(){
 if(process.env.MONGODB_URI){
  const client=new MongoClient(process.env.MONGODB_URI,{maxPoolSize:5,minPoolSize:0,serverSelectionTimeoutMS:8000});
  await client.connect();const db=client.db(process.env.MONGODB_DB||'mesa_abierta');
  try{await Promise.all([
   db.collection('users').createIndex({id:1},{unique:true}),
   db.collection('users').createIndex({nameKey:1},{unique:true}),
   db.collection('sessions').createIndex({token:1},{unique:true}),
   db.collection('sessions').createIndex({expiresAt:1},{expireAfterSeconds:0}),
   db.collection('matches').createIndex({id:1},{unique:true}),
   db.collection('matches').createIndex({owner:1,date:-1}),
   db.collection('attempts').createIndex({expiresAt:1},{expireAfterSeconds:0})
  ]);}catch(e){await client.close();throw e;}
  return {
   find:(c,q)=>db.collection(c).findOne(q),
   list:(c,q)=>db.collection(c).find(q,{projection:{_id:0}}).toArray(),
   insert:(c,v)=>db.collection(c).insertOne({...v}),
   update:(c,q,v)=>db.collection(c).updateOne(q,{$set:v}),
   remove:(c,q)=>db.collection(c).deleteMany(q),
   async rate(key){const bucket=Math.floor(Date.now()/600000);const r=await db.collection('attempts').findOneAndUpdate({_id:key+':'+bucket},{$inc:{n:1},$setOnInsert:{expiresAt:new Date((bucket+2)*600000)}},{upsert:true,returnDocument:'after'});return r.n<=30;}
  };
 }
 if(process.env.VERCEL||process.env.NODE_ENV==='production')throw Error('MONGODB_URI required in production');
 const dir=process.env.MESA_DATA_DIR||new URL('../private-data/',import.meta.url).pathname.replace(/^\/(\w:)/,'$1');mkdirSync(dir,{recursive:true});
 const file=path.join(dir,'accounts.json');const db=existsSync(file)?JSON.parse(readFileSync(file,'utf8')):{users:[],sessions:[],matches:[]};
 db.users.forEach(u=>u.nameKey=u.name.toLowerCase());const rates=new Map();
 const match=(v,q)=>Object.entries(q).every(([k,x])=>v[k]===x);
 const save=()=>{writeFileSync(file+'.tmp',JSON.stringify(db),{mode:0o600});renameSync(file+'.tmp',file);};
 return {
  async find(c,q){return db[c].find(v=>match(v,q));},async list(c,q){return db[c].filter(v=>match(v,q));},
  async insert(c,v){if(db[c].some(x=>c==='users'?(x.id===v.id||x.nameKey===v.nameKey):c==='matches'?x.id===v.id:x.token===v.token)){const e=Error('Duplicate');e.code=11000;throw e;}db[c].push(v);save();},
  async update(c,q,v){const item=db[c].find(x=>match(x,q));if(item)Object.assign(item,v);save();},
  async remove(c,q){db[c]=db[c].filter(v=>!match(v,q));save();},
  async rate(key){const bucket=Math.floor(Date.now()/600000);const k=key+':'+bucket;const n=(rates.get(k)||0)+1;rates.set(k,n);return n<=30;}
 };
}
