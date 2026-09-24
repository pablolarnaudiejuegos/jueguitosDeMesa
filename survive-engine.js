import {tiles,setupCounts,TERRAIN,CREATURES,endReason,score} from './survive-data.js';
import {createBoard,SERPENT_STARTS} from './survive-board.js';
import {move,movementReason,resolveBoarding} from './survive-movement.js';
import {moveCreature,chooseAttack,respondRepellent,applyAttack,pushAdventurer,pushCreature,destroyRaft} from './survive-creatures.js';
import {sinkTile,spawn} from './survive-sinking.js';
import {useMovementAbility,dive,resumeAbility} from './survive-abilities.js';
export const COLORS=['#e85f49','#e5b635','#46a9d2','#956bc4','#ed9244'];
const check=(ok,msg)=>{if(!ok)throw Error(msg);};
function random(s){let x=s.rng|0;x^=x<<13;x^=x>>>17;x^=x<<5;s.rng=x>>>0;return s.rng/4294967296;}
function shuffled(s,list){const a=[...list];for(let i=a.length-1;i>0;i--){const j=Math.floor(random(s)*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
export function createSurvive(names,{seed=Date.now(),colors=names.map((_,i)=>i)}={}){
 const counts=setupCounts(names.length);check(new Set(colors).size===names.length&&colors.every(c=>Number.isInteger(c)&&c>=0&&c<5),'Elegí colores diferentes.');
 const s={version:1,game:'survive',rng:(seed>>>0)||1,phase:'setup-people',turn:0,turnNumber:0,moves:0,swum:[],pending:null,volcanoes:0,sinksRemaining:1,roll:null,rollReturn:null,log:[],players:names.map((name,i)=>({name:String(name).slice(0,24),color:colors[i],abilities:[]})),cells:createBoard(),adventurers:[],rafts:Array.from({length:12},(_,i)=>({id:`r${i}`,cell:null})),creatures:[]};
 const terrain=shuffled(s,tiles());for(const c of Object.values(s.cells).filter(c=>c.island)){c.tile=terrain.pop();c.terrain=c.tile.terrain;}
 const unused=[0,1,2,3,4].filter(c=>!colors.includes(c));
 names.forEach((_,owner)=>{s.players[owner].colors=names.length===2?[colors[owner],unused[owner]]:[colors[owner]];for(let group=0;group<counts.colorsPerPlayer;group++){const values=shuffled(s,[1,1,2,2,3,3,4,4,5,5]);values.forEach((value,j)=>{const i=group*10+j;s.adventurers.push({id:`p${owner}-${i}`,owner,color:s.players[owner].colors[group],number:i+1,value,status:'unplaced',cell:null,raft:null});});}});
 for(const [type,rule] of Object.entries(CREATURES))for(let i=0;i<rule.count;i++)s.creatures.push({id:`${type}${i}`,type,cell:type==='serpent'?SERPENT_STARTS[i]:null});
 s.setupRafts=names.map(()=>counts.raftsPerPlayer);return s;
}
export function decisionOwner(s){return s.pending?.type==='attack'&&s.pending.responders.length?s.pending.responders[0]:s.turn;}
function beginTurn(s){s.phase='action';s.moves=0;s.swum=[];s.roll=null;s.sinksRemaining=s.adventurers.some(a=>a.owner===s.turn&&a.status==='active')?1:2;}
function settle(s){
 if(s.phase.startsWith('setup'))return s;
 const reason=endReason(s.volcanoes,s.adventurers);
 if(reason){s.phase='finished';s.endReason=reason;s.pending=null;s.results=score(s.adventurers,s.players.length);const best=Math.max(...s.results);s.winners=s.results.flatMap((v,i)=>v===best?[i]:[]);return s;}
 while(s.pending?.type==='kaiju-push'){
  const p=s.pending;p.people=p.people.filter(id=>s.adventurers.some(a=>a.id===id&&a.status==='active'&&a.cell===p.cell));p.creatures=p.creatures.filter(id=>s.creatures.some(c=>c.id===id&&c.cell===p.cell));
  p.rafts=(p.rafts||[]).filter(id=>s.rafts.some(r=>r.id===id&&r.cell===p.cell));if(p.people.length||p.creatures.length||p.rafts.length)break;s.pending=p.after||null;
 }
 if(s.pending)return s;
 if(s.phase==='sink'&&!s.sinksRemaining)s.phase='roll';
 if(s.phase==='creature-done'){
  if(s.rollReturn==='action'){s.phase='action';s.rollReturn=null;}
  else{s.turn=(s.turn+1)%s.players.length;s.turnNumber++;beginTurn(s);}
 }
 return s;
}
function perform(s,a){
 check(s.phase!=='finished','La partida terminó.');
 if(s.pending){switch(s.pending.type){
  case 'ability-resume':check(a.type==='resume-ability','Completá la habilidad.');return resumeAbility(s);
  case 'boarding':check(a.type==='board','Elegí pasajeros.');return resolveBoarding(s,a.ids);
  case 'spawn':check(a.type==='spawn','Elegí una pieza de la reserva.');return spawn(s,a.id);
  case 'attacks':check(a.type==='attack','Elegí el orden de las criaturas.');return chooseAttack(s,a.id);
  case 'attack':if(s.pending.responders.length){check(a.type==='repel','Esperá la respuesta de repelente.');return respondRepellent(s,decisionOwner(s),a.tile??null);}check(a.type==='resolve','Resolvé el ataque.');return applyAttack(s);
  case 'kaiju-push':if(a.type==='destroy-raft')return destroyRaft(s,a.id);if(a.type==='push-person')return pushAdventurer(s,a.id,a.to);if(a.type==='push-creature')return pushCreature(s,a.id,a.path);throw Error('Elegí una pieza para empujar.');
 }}
 if(s.phase==='setup-people'){
  check(a.type==='setup-person','Colocá un aventurero.');const p=s.adventurers.find(p=>p.id===a.id),c=s.cells[a.to];check(p?.owner===s.turn&&p.status==='unplaced'&&c?.island,'Elegí uno de tus aventureros y una loseta de isla.');
  const placed=s.adventurers.filter(p=>p.status==='active'),limit=placed.length<40?1:2;check(placed.filter(p=>p.cell===a.to).length<limit,'Primero ocupá las losetas vacías.');p.cell=a.to;p.status='active';s.turn=(s.turn+1)%s.players.length;
  if(s.adventurers.every(p=>p.status==='active')){s.phase='setup-rafts';s.turn=0;}return s;
 }
 if(s.phase==='setup-rafts'){
  const c=s.cells[a.to];check(a.type==='setup-raft'&&s.setupRafts[s.turn]>0&&c?.terrain==='water'&&c.neighbors.some(id=>s.cells[id].island)&&!s.rafts.some(r=>r.cell===a.to)&&!s.creatures.some(x=>x.cell===a.to),'Elegí agua vacía junto a la isla.');
  s.rafts.find(r=>!r.cell).cell=a.to;s.setupRafts[s.turn]--;s.turn=(s.turn+1)%s.players.length;if(s.setupRafts.every(n=>n===0)){s.turn=0;s.turnNumber=1;beginTurn(s);}return s;
 }
 if(s.phase==='action'){
  if(a.type==='move'){check(s.adventurers.some(p=>p.owner===s.turn&&p.status==='active'),'Ya no tenés aventureros por rescatar.');return move(s,{...a,type:a.kind});}
  if(a.type==='end-action'){s.phase='sink';return s;}
  if(a.type==='ability-move')return useMovementAbility(s,a.tile,a.id,a.path);
  if(a.type==='dive')return dive(s,a.tile,a.id,a.to);
  if(a.type==='ability-die'){const i=s.players[s.turn].abilities.findIndex(t=>t.id===a.tile&&t.effect==='die'&&t.acquiredTurn<s.turnNumber);check(i>=0,'Dado no disponible.');s.players[s.turn].abilities.splice(i,1);s.phase='roll';s.rollReturn='action';return s;}
 }
 if(s.phase==='sink'&&a.type==='sink')return sinkTile(s,a.to);
 if(s.phase==='roll'&&a.type==='roll'){
  s.roll=['serpent','shark','kaiju'][Math.floor(random(s)*3)];s.phase='creature';
  if(!creatureActions(s).length)s.phase='creature-done';return s;
 }
 if(s.phase==='creature'&&a.type==='creature'){
  check(s.creatures.some(c=>c.id===a.id&&c.type===s.roll),'Mové la criatura del dado.');const n=moveCreature(s,a.id,a.path);n.phase='creature-done';return n;
 }
 throw Error('Acción no disponible en esta etapa.');
}
export function actSurvive(s,a){const n=settle(perform(structuredClone(s),a));n.log=[`${s.players[decisionOwner(s)].name}: ${a.type}${a.to?' · '+a.to:''}`, ...s.log].slice(0,40);return n;}
function valid(fn){try{fn();return true;}catch{return false;}}
function paths(s,id){return (s.cells[id]?.neighbors||[]).flatMap(to=>[[to],...s.cells[to].neighbors.map(end=>[to,end])]);}
function creatureActions(s){return s.creatures.filter(c=>c.cell&&c.type===s.roll).flatMap(c=>paths(s,c.cell).filter(path=>valid(()=>moveCreature(s,c.id,path))).map(path=>({type:'creature',id:c.id,path})));}
export function legalActions(s,{abilities=true}={}){
 if(s.phase==='finished')return [];
 const p=s.pending,ids=Object.keys(s.cells);
 if(p){switch(p.type){
 case 'ability-resume':return [{type:'resume-ability'}];
 case 'boarding':{const combos=[];function pick(start,list){if(list.length===p.count){combos.push({type:'board',ids:list});return;}for(let i=start;i<p.candidates.length;i++)pick(i+1,[...list,p.candidates[i]]);}pick(0,[]);return combos;}
 case 'spawn':return p.candidates.map(id=>({type:'spawn',id}));
 case 'attacks':return p.creatures.map(id=>({type:'attack',id}));
 case 'attack':return p.responders.length?[{type:'repel'},...s.players[decisionOwner(s)].abilities.filter(t=>t.effect==='repellent').map(t=>({type:'repel',tile:t.id}))]:[{type:'resolve'}];
 case 'kaiju-push':return [...(p.rafts||[]).map(id=>({type:'destroy-raft',id})),...p.people.flatMap(id=>s.cells[p.cell].neighbors.filter(to=>valid(()=>pushAdventurer(s,id,to))).map(to=>({type:'push-person',id,to}))),...p.creatures.flatMap(id=>paths(s,p.cell).filter(path=>valid(()=>pushCreature(s,id,path))).map(path=>({type:'push-creature',id,path})))];
 }}
 if(s.phase==='setup-people'){const placed=s.adventurers.filter(p=>p.status==='active'),limit=placed.length<40?1:2;return s.adventurers.filter(p=>p.owner===s.turn&&p.status==='unplaced').flatMap(p=>ids.filter(id=>s.cells[id].island&&placed.filter(a=>a.cell===id).length<limit).map(to=>({type:'setup-person',id:p.id,to})));}
 if(s.phase==='setup-rafts')return ids.filter(to=>s.cells[to].terrain==='water'&&s.cells[to].neighbors.some(id=>s.cells[id].island)&&!s.rafts.some(r=>r.cell===to)&&!s.creatures.some(c=>c.cell===to)).map(to=>({type:'setup-raft',to}));
 if(s.phase==='sink'){const rank=Math.min(...Object.values(s.cells).map(c=>TERRAIN.indexOf(c.terrain)).filter(n=>n>=0));return ids.filter(id=>TERRAIN.indexOf(s.cells[id].terrain)===rank).map(to=>({type:'sink',to}));}
 if(s.phase==='roll')return [{type:'roll'}];
 if(s.phase==='creature')return creatureActions(s);
 if(s.phase==='action'){
  const out=[{type:'end-action'}];
  if(s.adventurers.some(p=>p.owner===s.turn&&p.status==='active'))for(const [kind,list] of [['adventurer',s.adventurers],['raft',s.rafts]])for(const item of list.filter(x=>x.cell))for(const to of s.cells[item.cell].neighbors){const a={type:'move',kind,id:item.id,to};if(!movementReason(s,{...a,type:kind}))out.push(a);}
  if(abilities)for(const t of s.players[s.turn].abilities.filter(t=>t.acquiredTurn<s.turnNumber)){
   if(t.effect==='die')out.push({type:'ability-die',tile:t.id});
   if(t.effect==='dive'){const empty=ids.filter(to=>s.cells[to].terrain==='water'&&!s.creatures.some(c=>c.cell===to)&&!s.rafts.some(r=>r.cell===to)&&!s.adventurers.some(p=>p.status==='active'&&p.cell===to));for(const c of s.creatures.filter(c=>c.cell))for(const to of empty)out.push({type:'dive',tile:t.id,id:c.id,to});}
   if(['paddles','dolphin'].includes(t.effect))for(const item of (t.effect==='paddles'?s.rafts:s.adventurers.filter(p=>p.owner===s.turn&&p.status==='active')).filter(x=>x.cell))for(const path of paths(s,item.cell))if(valid(()=>useMovementAbility(s,t.id,item.id,path)))out.push({type:'ability-move',tile:t.id,id:item.id,path});
  }
  return out;
 }
 return [];
}
// No opponent treasures, unused tile backs, opponent ability identities, or RNG state.
export function observation(s,owner){const n=structuredClone(s);delete n.rng;for(const c of Object.values(n.cells))delete c.tile;for(const p of n.adventurers)if(p.owner!==owner)delete p.value;for(let i=0;i<n.players.length;i++)if(i!==owner)n.players[i].abilities=n.players[i].abilities.map(()=>({hidden:true}));return n;}

export function restoreSurvive(raw){
 const s=typeof raw==='string'?JSON.parse(raw):structuredClone(raw),phases=['setup-people','setup-rafts','action','sink','roll','creature','creature-done','finished'];
 check(s?.version===1&&s.game==='survive'&&Array.isArray(s.players)&&s.players.length>=2&&s.players.length<=5&&phases.includes(s.phase),'Guardado de Survive incompatible.');
 check(Number.isInteger(s.turn)&&s.turn>=0&&s.turn<s.players.length&&Number.isInteger(s.turnNumber)&&s.turnNumber>=0&&Number.isInteger(s.moves)&&s.moves>=0&&s.moves<=3,'Turno inválido.');
 const board=createBoard();check(s.cells&&Object.keys(s.cells).length===Object.keys(board).length,'Tablero incompleto.');
 for(const [id,c] of Object.entries(board)){const x=s.cells[id];check(x&&['water','rescue','volcano',...TERRAIN].includes(x.terrain)&&JSON.stringify(x.neighbors)===JSON.stringify(c.neighbors)&&(c.terrain==='rescue')===(x.terrain==='rescue'),'Casilla inválida.');}
 check(Array.isArray(s.adventurers)&&s.adventurers.length===s.players.length*setupCounts(s.players.length).adventurersPerPlayer&&new Set(s.adventurers.map(p=>p.id)).size===s.adventurers.length,'Aventureros inválidos.');
 check(Array.isArray(s.rafts)&&s.rafts.length===12&&Array.isArray(s.creatures)&&s.creatures.length===13,'Reserva inválida.');
 check(Array.isArray(s.swum)&&Array.isArray(s.log)&&Number.isInteger(s.rng)&&s.rng>=0&&Number.isInteger(s.volcanoes)&&s.volcanoes>=0&&s.volcanoes<=4,'Datos de partida inválidos.');
 for(const p of s.players)check(typeof p.name==='string'&&Array.isArray(p.abilities)&&Number.isInteger(p.color)&&p.color>=0&&p.color<5,'Jugador inválido.');
 for(const p of s.adventurers){check(Number.isInteger(p.owner)&&s.players[p.owner]&&Number.isInteger(p.value)&&p.value>=1&&p.value<=5&&['unplaced','active','rescued','eliminated'].includes(p.status),'Aventurero inválido.');if(p.status==='active')check(!!s.cells[p.cell],'Aventurero fuera del tablero.');if(p.raft)check(s.rafts.some(r=>r.id===p.raft&&r.cell===p.cell),'Pasajero sin balsa.');}
 for(const x of [...s.rafts,...s.creatures])check(x.cell===null||!!s.cells[x.cell],'Pieza fuera del tablero.');
 for(const r of s.rafts)check(s.adventurers.filter(p=>p.status==='active'&&p.raft===r.id).length<=3,'Balsa sobrecargada.');
 if(s.phase==='finished')check(Array.isArray(s.results)&&JSON.stringify(s.results)===JSON.stringify(score(s.adventurers,s.players.length))&&Array.isArray(s.winners)&&s.winners.length>0,'Resultado inválido.');
 return s;
}
