import {controlsRaft,swimmingMove} from './survive-data.js';

// Board connectivity is injected: do not substitute a guessed retail board.
const requireRule=(condition,message)=>{if(!condition)throw Error(message);};
const adjacent=(s,a,b)=>s.cells[a]?.neighbors.includes(b)&&!!s.cells[b];
const raftAt=(s,cell)=>s.rafts.find(r=>r.cell===cell);
const occupants=(s,raft)=>s.adventurers.filter(p=>p.raft===raft.id&&p.status==='active');
const water=(s,cell)=>s.cells[cell]?.terrain==='water';
const positionType=(s,p)=>p.raft?'raft':s.cells[p.cell]?.terrain;
const kaijuAt=(s,cell)=>s.creatures.some(c=>c.type==='kaiju'&&c.cell===cell);

export function movementReason(s,a){
 if(s.phase!=='action')return 'Ahora no es la fase de acción.';
 if(s.pending)return 'Primero resolvé el efecto pendiente.';
 if(s.moves>=3)return 'Ya usaste tus tres movimientos.';
 const item=(a.type==='adventurer'?s.adventurers:s.rafts).find(p=>p.id===a.id);
 if(!item||!item.cell)return 'La pieza no está en el tablero.';
 if(!adjacent(s,item.cell,a.to))return 'Elegí una casilla adyacente.';
 if(s.cells[a.to].terrain==='volcano')return 'Un volcán revelado no es accesible.';
 if(kaijuAt(s,a.to))return 'No podés entrar donde hay un Kaiju.';
 if(a.type==='adventurer'){
  if(item.owner!==s.turn||item.status!=='active')return 'Elegí uno de tus aventureros pendientes de rescate.';
  const raft=raftAt(s,a.to),toType=raft&&occupants(s,raft).length<3?'raft':s.cells[a.to].terrain;
  if(swimmingMove(positionType(s,item),toType)&&s.swum.includes(item.id))return 'Este aventurero ya nadó durante este turno.';
 }else if(a.type==='raft'){
  if(!water(s,a.to))return 'Las balsas solo se desplazan por agua.';
  if(raftAt(s,a.to))return 'Ya hay una balsa en esa casilla.';
  if(!controlsRaft(s.turn,occupants(s,item)))return 'No controlás esta balsa.';
 }else return 'Tipo de movimiento desconocido.';
 return '';
}

// Creature attacks and crowded boarding deliberately suspend the action.
// The UI/turn engine must resolve pending before accepting another movement.
export function move(s,a){
 const why=movementReason(s,a);requireRule(!why,why);
 const next=structuredClone(s);next.moves++;
 if(a.type==='adventurer'){
  const p=next.adventurers.find(p=>p.id===a.id),from=positionType(next,p),oldRaft=p.raft&&next.rafts.find(r=>r.id===p.raft),raft=raftAt(next,a.to),boards=raft&&occupants(next,raft).length<3;
  const toType=boards?'raft':next.cells[a.to].terrain;
  if(swimmingMove(from,toType))next.swum.push(p.id);
  p.cell=a.to;p.raft=boards?raft.id:null;
  if(next.cells[a.to].terrain==='rescue'){p.status='rescued';p.raft=null;}
  if(oldRaft){const waiting=next.adventurers.filter(x=>x.status==='active'&&x.cell===oldRaft.cell&&!x.raft),room=3-occupants(next,oldRaft).length;if(waiting.length>room)next.pending={type:'boarding',raft:oldRaft.id,candidates:waiting.map(x=>x.id),count:room};else for(const x of waiting)x.raft=oldRaft.id;}
 }else{
  const raft=next.rafts.find(r=>r.id===a.id),aboard=occupants(next,raft);raft.cell=a.to;for(const p of aboard)p.cell=a.to;
  const swimmers=next.adventurers.filter(p=>p.status==='active'&&p.cell===a.to&&!p.raft),room=3-aboard.length;
  if(swimmers.length>room&&room>0)next.pending={type:'boarding',raft:raft.id,candidates:swimmers.map(p=>p.id),count:room};
  else for(const p of swimmers.slice(0,room))p.raft=raft.id;
 }
 const threats=next.creatures.filter(c=>c.cell===a.to&&(c.type==='serpent'||c.type==='shark'&&next.adventurers.some(p=>p.cell===a.to&&p.status==='active'&&!p.raft)));
 if(threats.length){const attacks={type:'attacks',cell:a.to,creatures:threats.map(c=>c.id)};if(next.pending)next.pending.after=attacks;else next.pending=attacks;}
 return next;
}
export function resolveBoarding(s,ids){
 const p=s.pending;requireRule(p?.type==='boarding','No hay un embarque pendiente.');
 requireRule(Array.isArray(ids)&&ids.length===p.count&&new Set(ids).size===ids.length&&ids.every(id=>p.candidates.includes(id)),'Elegí exactamente los pasajeros indicados.');
 const next=structuredClone(s);for(const id of ids)next.adventurers.find(a=>a.id===id).raft=p.raft;next.pending=p.after||null;return next;
}
