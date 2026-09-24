import {move} from './survive-movement.js';
const check=(ok,msg)=>{if(!ok)throw Error(msg);};
export function useMovementAbility(s,tileId,id,path){
 check(s.phase==='action'&&!s.pending,'Esperá tu fase de acción y resolvé los efectos pendientes.');
 const index=s.players[s.turn].abilities.findIndex(t=>t.id===tileId),t=s.players[s.turn].abilities[index];
 check(t&&['paddles','dolphin'].includes(t.effect),'Elegí remos o delfín.');
 check(t.acquiredTurn===undefined||t.acquiredTurn<s.turnNumber,'La habilidad se usa en un turno posterior.');
 check(Array.isArray(path)&&path.length>=1&&path.length<=2,'La habilidad permite uno o dos pasos.');
 if(t.effect==='dolphin')check(s.adventurers.some(a=>a.id===id&&a.owner===s.turn&&a.status==='active'&&!a.raft&&s.cells[a.cell]?.terrain==='water'),'El delfín solo lleva a uno de tus nadadores.');
 let n=structuredClone(s);const moves=n.moves,swum=[...n.swum];n.players[n.turn].abilities.splice(index,1);
 for(let i=0;i<path.length;i++){
  n.moves=0;n.swum=[];n=move(n,{type:t.effect==='paddles'?'raft':'adventurer',id,to:path[i]});
  if(i<path.length-1){
   if(t.effect==='dolphin'){const a=n.adventurers.find(a=>a.id===id);check(a.status==='active'&&!a.raft&&n.cells[a.cell].terrain==='water','El recorrido del delfín termina al llegar a tierra o a una balsa.');}
   if(n.pending){let tail=n.pending;while(tail.after)tail=tail.after;tail.after={type:'ability-resume',kind:t.effect==='paddles'?'raft':'adventurer',id,path:path.slice(i+1)};break;}
  }
 }
 n.moves=moves;n.swum=swum;return n;
}
export function resumeAbility(s){
 const p=s.pending;check(p?.type==='ability-resume','No hay habilidad pendiente.');
 let n=structuredClone(s);n.pending=null;const moves=n.moves,swum=[...n.swum];
 const item=(p.kind==='raft'?n.rafts:n.adventurers).find(x=>x.id===p.id);
 if(!item?.cell||p.kind==='adventurer'&&item.status!=='active')return n;
 // The first step may have removed the mover or changed raft control.
 const test={...n,moves:0,swum:[]};
 try{n=move(test,{type:p.kind,id:p.id,to:p.path[0]});}catch{return n;}
 n.moves=moves;n.swum=swum;return n;
}
export function dive(s,tileId,creatureId,to){
 check(s.phase==='action'&&!s.pending,'Ahora no podés usar esta habilidad.');
 const index=s.players[s.turn].abilities.findIndex(t=>t.id===tileId&&t.effect==='dive'),t=s.players[s.turn].abilities[index];
 check(t&&(t.acquiredTurn===undefined||t.acquiredTurn<s.turnNumber),'Habilidad no disponible todavía.');
 check(s.cells[to]?.terrain==='water'&&!s.rafts.some(r=>r.cell===to)&&!s.creatures.some(c=>c.cell===to)&&!s.adventurers.some(a=>a.status==='active'&&a.cell===to),'Elegí un espacio de agua vacío.');
 check(s.creatures.some(c=>c.id===creatureId&&c.cell),'Elegí una criatura del tablero.');
 const n=structuredClone(s);n.creatures.find(c=>c.id===creatureId).cell=to;n.players[n.turn].abilities.splice(index,1);return n;
}
