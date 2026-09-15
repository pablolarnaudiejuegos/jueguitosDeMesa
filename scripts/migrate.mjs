import {readFileSync} from 'node:fs';
import {MongoClient} from 'mongodb';
if(!process.env.MONGODB_URI)throw Error('Configurar MONGODB_URI en entorno privado.');
const apply=process.argv.includes('--apply'),data=JSON.parse(readFileSync(new URL('../private-data/accounts.json',import.meta.url),'utf8'));
const client=new MongoClient(process.env.MONGODB_URI,{maxPoolSize:2});
try{await client.connect();const db=client.db(process.env.MONGODB_DB||'mesa_abierta'),session=client.startSession();
try{await session.withTransaction(async()=>{
for(const u of data.users){const e=await db.collection('users').findOne({$or:[{id:u.id},{nameKey:u.name.toLowerCase()}]},{session});if(e&&e.id!==u.id)throw Error('Conflicto de usuario');if(apply)await db.collection('users').updateOne({id:u.id},{$setOnInsert:{...u,nameKey:u.name.toLowerCase()}},{upsert:true,session});}
for(const m of data.matches){if(!data.users.some(u=>u.id===m.owner))throw Error('Partida sin propietario');const e=await db.collection('matches').findOne({id:m.id},{session});if(e&&e.owner!==m.owner)throw Error('Conflicto de partida');if(apply)await db.collection('matches').updateOne({id:m.id},{$setOnInsert:m},{upsert:true,session});}
});}finally{await session.endSession();}
console.log({mode:apply?'importado':'simulación',users:data.users.length,matches:data.matches.length});
}finally{await client.close();}
