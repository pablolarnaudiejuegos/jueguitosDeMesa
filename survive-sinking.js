import {TERRAIN,ABILITIES,endReason} from './survive-data.js';
const check=(ok,msg)=>{if(!ok)throw Error(msg);};
const people=(s,cell)=>s.adventurers.filter(a=>a.status==='active'&&a.cell===cell);
function destroy(s,cells){
 for(const a of s.adventurers)if(a.status==='active'&&cells.includes(a.cell)){a.status='eliminated';a.cell=null;a.raft=null;}
 for(const x of [...s.rafts,...s.creatures])if(cells.includes(x.cell))x.cell=null;
}
function finish(s){const reason=endReason(s.volcanoes||0,s.adventurers);if(reason){s.phase='finished';s.endReason=reason;s.pending=null;}return s;}
export function sinkTile(s,cell){
 check(s.phase==='sink'&&!s.pending,'Resolvé los efectos pendientes antes de hundir otra loseta.');
 const target=s.cells[cell],rank=TERRAIN.indexOf(target?.terrain);
 const ranks=Object.values(s.cells).map(c=>TERRAIN.indexOf(c.terrain)).filter(r=>r>=0);
 check(rank>=0&&rank===Math.min(...ranks),'Primero se retiran las losetas del terreno más bajo.');
 check(target.tile?.effect,'Falta el reverso de esta loseta.');
 const n=structuredClone(s),tile=n.cells[cell].tile;n.cells[cell].terrain='water';delete n.cells[cell].tile;
 n.sinksRemaining=Math.max(0,(n.sinksRemaining??1)-1);
 if(ABILITIES.includes(tile.effect)){
  n.players[n.turn].abilities.push({...tile,acquiredTurn:n.turnNumber});
 }else if(tile.effect==='volcano'){
  n.cells[cell].terrain='volcano';n.volcanoes=(n.volcanoes||0)+1;destroy(n,[cell]);
 }else if(tile.effect==='whirlpool'){
  destroy(n,[cell,...n.cells[cell].neighbors.filter(id=>n.cells[id].terrain==='water')]);
 }else if(['shark','kaiju','raft'].includes(tile.effect)){
  const supply=tile.effect==='raft'?n.rafts:n.creatures.filter(c=>c.type===tile.effect);
  const available=supply.filter(x=>!x.cell);
  const choices=available.length?available:supply.filter(x=>tile.effect!=='raft'||!n.adventurers.some(a=>a.status==='active'&&a.raft===x.id));
  const blocked=n.creatures.some(c=>c.type==='kaiju'&&c.cell===cell)&&tile.effect!=='kaiju';
  if(choices.length&&!blocked)n.pending={type:'spawn',cell,kind:tile.effect,candidates:choices.map(x=>x.id)};
 }else throw Error('Reverso desconocido.');
 return finish(n);
}
export function spawn(s,id){
 const p=s.pending;check(p?.type==='spawn'&&p.candidates.includes(id),'Elegí una pieza disponible para recolocar.');
 const n=structuredClone(s),x=(p.kind==='raft'?n.rafts:n.creatures).find(x=>x.id===id);x.cell=p.cell;n.pending=null;
 if(p.kind==='raft'){
  const swimmers=people(n,p.cell).filter(a=>!a.raft);
  if(swimmers.length>3)n.pending={type:'boarding',raft:id,candidates:swimmers.map(a=>a.id),count:3};
  else for(const a of swimmers)a.raft=id;
 }else n.pending={type:'attacks',cell:p.cell,creatures:[id]};
 return n;
}
