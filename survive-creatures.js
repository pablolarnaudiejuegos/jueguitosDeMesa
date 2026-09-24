import {CREATURES} from './survive-data.js';

const check=(ok,message)=>{if(!ok)throw Error(message);};
const activeAt=(s,cell)=>s.adventurers.filter(p=>p.cell===cell&&p.status==='active');
const kill=p=>{p.status='eliminated';p.cell=null;p.raft=null;};
function interacts(s,c){return c.type==='kaiju'?activeAt(s,c.cell).length||s.rafts.some(r=>r.cell===c.cell)||s.creatures.some(x=>x.id!==c.id&&x.cell===c.cell):c.type==='serpent'?activeAt(s,c.cell).length||s.rafts.some(r=>r.cell===c.cell):activeAt(s,c.cell).some(p=>!p.raft);}
export function creatureStepReason(s,id,to){
 const c=s.creatures.find(c=>c.id===id),cell=s.cells[to];
 if(!c?.cell||!cell||!s.cells[c.cell]?.neighbors.includes(to))return 'La criatura debe ir a una casilla adyacente.';
 if(cell.terrain==='volcano'||cell.terrain==='rescue')return 'Las criaturas no pueden entrar a ese refugio o volcán.';
 if(c.type!=='kaiju'&&cell.terrain!=='water')return 'Esta criatura solo se mueve por agua.';
 if(c.type!=='kaiju'&&s.creatures.some(x=>x.type==='kaiju'&&x.cell===to))return 'No puede entrar donde hay un Kaiju.';
 return '';
}
export function moveCreature(s,id,path){
 check(!s.pending,'Resolvé primero la interacción pendiente.');
 const c=s.creatures.find(c=>c.id===id),rule=CREATURES[c?.type];
 check(rule&&Array.isArray(path)&&path.length>=rule.min&&path.length<=rule.max,'Distancia inválida para esta criatura.');
 const n=structuredClone(s),moving=n.creatures.find(c=>c.id===id);
 for(let i=0;i<path.length;i++){
  const why=creatureStepReason(n,id,path[i]);check(!why,why);moving.cell=path[i];
  if(moving.type==='kaiju'){
   for(const a of activeAt(n,moving.cell))check(n.cells[moving.cell].neighbors.some(to=>n.cells[to].terrain!=='volcano'&&!n.creatures.some(c=>c.type==='kaiju'&&c.cell===to)),'El Kaiju no puede completar el empuje de ese aventurero.');
   for(const other of n.creatures.filter(c=>c.id!==id&&c.cell===moving.cell))check(n.cells[moving.cell].neighbors.some(to=>!creatureStepReason(n,other.id,to)),'El Kaiju no puede completar el desplazamiento de esa criatura.');
  }
  if(interacts(n,moving)){check(i===path.length-1,'La criatura debe detenerse al interactuar.');n.pending={type:'attacks',cell:moving.cell,creatures:[id]};}
 }
 return n;
}
// Select an attacker explicitly: the active player determines interaction order.
export function chooseAttack(s,id){
 const p=s.pending;check(p?.type==='attacks'&&p.creatures.includes(id),'Elegí una criatura pendiente.');
 const n=structuredClone(s),c=n.creatures.find(c=>c.id===id),remaining=p.creatures.filter(x=>x!==id);
 const after=remaining.length?{...p,creatures:remaining}:p.after||null;
 if(!c||c.cell!==p.cell||!interacts(n,c)){n.pending=after;return n;}
 const owners=[...new Set(activeAt(n,c.cell).map(p=>p.owner))].filter(owner=>n.players[owner].abilities.some(t=>t.effect==='repellent'));
 n.pending={type:'attack',creature:id,cell:c.cell,responders:c.type==='serpent'?[]:owners,after};
 return n;
}
export function respondRepellent(s,owner,tileId=null){
 const p=s.pending;check(p?.type==='attack'&&p.responders[0]===owner,'No corresponde responder a este jugador.');
 const n=structuredClone(s);
 if(tileId===null){n.pending.responders.shift();return n;}
 const index=n.players[owner].abilities.findIndex(t=>t.id===tileId&&t.effect==='repellent');check(index>=0,'Repelente no disponible.');
 n.players[owner].abilities.splice(index,1);n.creatures.find(c=>c.id===p.creature).cell=null;n.pending=p.after;return n;
}
export function applyAttack(s){
 const p=s.pending;check(p?.type==='attack'&&!p.responders.length,'Esperá las respuestas de repelente.');
 const n=structuredClone(s),c=n.creatures.find(c=>c.id===p.creature);
 if(c.type==='shark')for(const person of activeAt(n,p.cell).filter(a=>!a.raft))kill(person);
 if(c.type==='serpent'){for(const person of activeAt(n,p.cell))kill(person);for(const r of n.rafts.filter(r=>r.cell===p.cell))r.cell=null;}
 if(c.type==='kaiju'){
  n.pending={type:'kaiju-push',cell:p.cell,creature:c.id,people:activeAt(n,p.cell).map(a=>a.id),creatures:n.creatures.filter(x=>x.id!==c.id&&x.cell===p.cell).map(x=>x.id),rafts:n.rafts.filter(r=>r.cell===p.cell).map(r=>r.id),after:p.after};
 }else n.pending=p.after;
 return n;
}

export function pushAdventurer(s,id,to){
 const p=s.pending;check(p?.type==='kaiju-push'&&p.people.includes(id),'Elegí un aventurero pendiente de empuje.');
 check(s.cells[p.cell].neighbors.includes(to)&&s.cells[to]&&s.cells[to].terrain!=='volcano'&&!s.creatures.some(c=>c.type==='kaiju'&&c.cell===to),'Destino de empuje inválido.');
 const n=structuredClone(s),a=n.adventurers.find(a=>a.id===id);a.cell=to;a.raft=null;
 if(n.cells[to].terrain==='rescue')a.status='rescued';
 else{const raft=n.rafts.find(r=>r.cell===to);if(raft&&n.adventurers.filter(x=>x.status==='active'&&x.raft===raft.id).length<3)a.raft=raft.id;}
 const continuation={...p,people:p.people.filter(x=>x!==id)};
 const after=continuation.people.length||continuation.creatures.length||continuation.rafts?.length?continuation:p.after;
 const threats=n.creatures.filter(c=>c.cell===to&&interacts(n,c));n.pending=threats.length?{type:'attacks',cell:to,creatures:threats.map(c=>c.id),after}:after;
 return n;
}

export function pushCreature(s,id,path){
 const p=s.pending;check(p?.type==='kaiju-push'&&p.creatures.includes(id),'Elegí una criatura pendiente de desplazar.');
 const continuation={...p,creatures:p.creatures.filter(x=>x!==id)},after=continuation.people.length||continuation.creatures.length||continuation.rafts?.length?continuation:p.after;
 const n=moveCreature({...s,pending:null},id,path);
 if(n.pending)n.pending.after=after;else n.pending=after;
 return n;
}
export function destroyRaft(s,id){
 const p=s.pending;check(p?.type==='kaiju-push'&&p.rafts?.includes(id),'Elegí una balsa pendiente de destruir.');
 const n=structuredClone(s);n.rafts.find(r=>r.id===id).cell=null;for(const a of n.adventurers)if(a.raft===id)a.raft=null;
 n.pending.rafts=n.pending.rafts.filter(x=>x!==id);if(!n.pending.rafts.length&&!n.pending.people.length&&!n.pending.creatures.length)n.pending=p.after||null;return n;
}
