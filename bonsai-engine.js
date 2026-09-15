// Motor propio de Mesa Abierta. Referencia: DV Games, Bonsai English, /giochi/bonsai/.
export const TYPES=['wood','leaf','flower','fruit'];
export const LABELS={wood:'Madera',leaf:'Hoja',flower:'Flor',fruit:'Fruto',wild:'Cualquier pieza',growth:'Crecimiento',tool:'Herramienta',master:'Maestro',helper:'Ayudante',parchment:'Pergamino'};
export const RULESET='dv-english-32-43-47-v1';
const empty=()=>Object.fromEntries(TYPES.map(t=>[t,0]));
const check=(condition,message)=>{if(!condition)throw Error(message);};
export const key=(x,y)=>`${x},${y}`;
export const coords=k=>k.split(',').map(Number);
// Coordenadas dobles: los centros vecinos difieren en (2,0) o (1,1).
export const DIRECTIONS=[[2,0],[1,1],[-1,1],[-2,0],[-1,-1],[1,-1]];
export const adjacent=(x,y)=>DIRECTIONS.map(([dx,dy])=>[x+dx,y+dy]);
export function inPot(x,y,flipped=false){
  const root=flipped?2:0;
  if(y===0)return x>=-4&&x<=6&&x!==root;
  if(y===-1)return x>=-3&&x<=5;
  if(y===-2)return x>=-2&&x<=4;
  return false;
}
export function neighbourRule(type,n){
  if(type==='wood'||type==='leaf')return n.includes('wood')?'':'Necesita tocar madera por un lado.';
  if(type==='flower')return n.includes('leaf')?'':'La flor necesita tocar una hoja por un lado.';
  if(type==='fruit'){
    if(n.includes('fruit'))return 'Dos frutos no pueden tocarse por un lado.';
    return n.some((t,i)=>t==='leaf'&&n[(i+1)%6]==='leaf')?'':'El fruto necesita dos hojas en lados consecutivos; esas hojas también deben tocarse entre sí.';
  }
  return 'Tipo de pieza desconocido.';
}
export function placementReason(player,type,x,y){
  if(!Number.isSafeInteger(x)||!Number.isSafeInteger(y)||(x+y)%2!==0)return 'Coordenada inválida.';
  if(!TYPES.includes(type))return 'Elegí un tipo de pieza.';
  if(player.tree[key(x,y)])return 'Ya hay una pieza en este lugar.';
  if(inPot(x,y,player.flipped))return 'La maceta ocupa este lugar.';
  return neighbourRule(type,adjacent(x,y).map(([a,b])=>player.tree[key(a,b)]));
}
export function candidates(player){
  const result=new Set();
  for(const k of Object.keys(player.tree))for(const [x,y]of adjacent(...coords(k)))if(!player.tree[key(x,y)]&&!inPot(x,y,player.flipped))result.add(key(x,y));
  return [...result].map(coords);
}
export const legalSpaces=(p,type)=>candidates(p).filter(([x,y])=>!placementReason(p,type,x,y));

function random(seed){let h=2166136261;for(const c of String(seed))h=Math.imul(h^c.charCodeAt(0),16777619);return()=>{h+=0x6D2B79F5;let t=h;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
function shuffle(a,rng){a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
// Cantidades por efecto para 2, 3, 4 jugadores. El modo solo usa las de 2.
export function cardSet(players){
  check(Number.isInteger(players)&&players>=1&&players<=4,'Se requieren de 1 a 4 jugadores.');
  const n=Math.max(2,players)-2,out=[];
  const add=(type,items,counts,points=0)=>{for(let i=0;i<counts[n];i++)out.push({id:`c${out.length+1}`,type,items:[...items],points});};
  add('tool',[],[3,5,6]);
  add('growth',['wood'],[2,3,4]);add('growth',['leaf'],[2,4,4]);add('growth',['flower'],[2,3,3]);add('growth',['fruit'],[2,2,3]);
  add('master',['wild'],[2,3,3]);add('master',['wood','wood'],[1,1,1]);add('master',['wood','leaf'],[1,3,3]);
  add('master',['wood','leaf','flower'],[0,1,1]);add('master',['wood','leaf','fruit'],[0,1,1]);add('master',['leaf','leaf'],[1,1,1]);
  add('master',['leaf','flower'],[1,1,1]);add('master',['leaf','flower','flower'],[0,0,1]);add('master',['leaf','fruit'],[1,1,1]);
  add('helper',['wild','wood'],[3,3,3]);add('helper',['wild','leaf'],[2,2,2]);add('helper',['wild','flower'],[1,1,1]);add('helper',['wild','fruit'],[1,1,1]);
  for(const t of [...TYPES,'growth','helper','master'])add('parchment',[t],[1,1,1],t==='wood'||t==='leaf'?1:2);
  return out;
}
export const GOALS=Object.entries({wood:[[8,5],[10,10],[12,15]],leaf:[[5,6],[7,9],[9,12]],fruit:[[3,9],[4,11],[5,13]],flower:[[3,8],[4,12],[5,16]],shape:[[1,7],[2,10],[3,14]]}).flatMap(([type,levels])=>levels.map(([target,points],tier)=>({id:`${type}-${tier}`,type,tier,target,points})));
export function goalText(g){return g.type==='wood'?`${g.target} maderas, incluido el brote`:g.type==='leaf'?`${g.target} hojas en un mismo grupo conectado`:g.type==='fruit'?`${g.target} frutos`:g.type==='flower'?`${g.target} flores sobresaliendo por el mismo lado`:['Una pieza sobresale por el lado de la grieta dorada','Piezas sobresalen por ambos lados','Una pieza sobresale por un lado y otra baja de la maceta por el lado opuesto'][g.tier];}
export function goalProgress(p,g){
  const entries=Object.entries(p.tree);
  if(g.type==='wood'||g.type==='fruit')return entries.filter(([,t])=>t===g.type).length;
  if(g.type==='leaf'){
    const unseen=new Set(entries.filter(([,t])=>t==='leaf').map(([k])=>k));let max=0;
    while(unseen.size){let count=0;const stack=[unseen.values().next().value];while(stack.length){const k=stack.pop();if(!unseen.delete(k))continue;count++;for(const c of adjacent(...coords(k)))if(unseen.has(key(...c)))stack.push(key(...c));}max=Math.max(max,count);}return max;
  }
  const side=x=>x<-3?-1:x>=6?1:0;
  if(g.type==='flower')return Math.max(...[-1,1].map(s=>entries.filter(([k,t])=>t==='flower'&&side(coords(k)[0])===s).length));
  const c=entries.map(([k])=>coords(k));
  if(g.tier===0)return c.some(([x])=>side(x)===(p.flipped?-1:1))?1:0;
  if(g.tier===1)return [-1,1].filter(s=>c.some(([x])=>side(x)===s)).length;
  return [-1,1].some(s=>c.some(([x])=>side(x)===s)&&c.some(([x,y])=>side(x)===-s&&y<=-2))?3:0;
}
export const capacity=p=>5+2*p.cards.filter(c=>c.type==='tool').length;
export const inventoryCount=p=>TYPES.reduce((n,t)=>n+p.inventory[t],0);
export function cultivationCaps(p){const caps={...empty(),wood:1,leaf:1,wild:1};for(const c of p.cards)if(c.type==='growth')for(const t of c.items)caps[t]++;return caps;}
export function permit(caps,used,type){return TYPES.reduce((sum,t)=>sum+Math.max(0,(used[t]||0)+(t===type?1:0)-(caps[t]||0)),0)<=(caps.wild||0);}
export function playReason(s,type,x,y){
  if(s.phase!=='plant')return 'Ahora no es la etapa de colocar piezas.';
  const p=s.players[s.turn];
  if(!TYPES.includes(type))return 'Elegí una pieza.';
  if(!p.inventory[type])return `No tenés ${LABELS[type].toLowerCase()} en tu reserva.`;
  if(!permit(s.caps,s.used,type))return 'Ya utilizaste los permisos disponibles para ese tipo y los comodines.';
  return placementReason(p,type,x,y);
}
export function eligibleGoals(s){const p=s.players[s.turn];return s.goals.filter(g=>!p.renounced.includes(g.id)&&!p.claimed.some(a=>a.type===g.type)&&goalProgress(p,g)>=g.target);}
export function score(p){
  const counts=empty(),flowers=[];for(const [k,t]of Object.entries(p.tree)){counts[t]++;if(t==='flower')flowers.push({position:k,points:adjacent(...coords(k)).filter(c=>!p.tree[key(...c)]).length});}
  const rows=[{label:`Hojas: ${counts.leaf} × 3`,points:counts.leaf*3},{label:`Frutos: ${counts.fruit} × 7`,points:counts.fruit*7},{label:'Flores: lados libres',points:flowers.reduce((n,f)=>n+f.points,0)}];
  for(const c of p.cards.filter(c=>c.type==='parchment')){const t=c.items[0],n=TYPES.includes(t)?counts[t]:p.cards.filter(a=>a.type===t).length;rows.push({label:`Pergamino · ${LABELS[t]}: ${n} × ${c.points}`,points:n*c.points});}
  for(const g of p.claimed)rows.push({label:`Objetivo · ${goalText(g)}`,points:g.points});
  return {total:rows.reduce((n,r)=>n+r.points,0),rows,flowers,counts};
}
// Convención explícita de la adaptación: tras podar se conservan apoyos legales.
// Se minimiza cantidad retirada, nunca puntos. Solo se retiran piezas que desbloquean madera.
export function pruningOptions(p){
  if(legalSpaces(p,'wood').length)return [];
  const options=[];
  for(const [k,t]of Object.entries(p.tree))if(t!=='wood'&&adjacent(...coords(k)).some(c=>p.tree[key(...c)]==='wood')){
    const tree={...p.tree},removed=[k];delete tree[k];let changed=true;
    while(changed){changed=false;for(const [a,type]of Object.entries(tree))if(type!=='wood'&&neighbourRule(type,adjacent(...coords(a)).map(c=>tree[key(...c)]))){delete tree[a];removed.push(a);changed=true;}}
    if(legalSpaces({...p,tree},'wood').length)options.push(removed.sort());
  }
  if(!options.length)return [];
  const min=Math.min(...options.map(a=>a.length));return [...new Map(options.filter(a=>a.length===min).map(a=>[a.join('|'),a])).values()];
}
export function createBonsai({names=['Jugador 1'],seed=Date.now(),target=80,tokonoma=false,flips=[]}={}){
  check(Array.isArray(names)&&names.length>=1&&names.length<=4,'Elegí de 1 a 4 jugadores.');
  check([80,100,120,140].includes(target),'Dificultad inválida.');
  const rng=random(seed),all=cardSet(names.length);let deck;
  if(tokonoma){const parch=all.filter(c=>c.type==='parchment'),other=shuffle(all.filter(c=>c.type!=='parchment'),rng),half=Math.floor(other.length/2);deck=[...other.slice(0,half),...shuffle([...other.slice(half),...parch],rng)];}else deck=shuffle(all,rng);
  const colors=shuffle(['wood','leaf','flower','fruit','shape'],rng).slice(0,3);
  const players=names.map((name,i)=>({name:String(name).trim().slice(0,24)||`Jugador ${i+1}`,flipped:!!flips[i],tree:{[key(flips[i]?2:0,0)]:'wood'},inventory:{wood:1,leaf:i>=1||names.length===1?1:0,flower:i>=2?1:0,fruit:i>=3?1:0},cards:[],claimed:[],renounced:[]}));
  const s={version:1,ruleset:RULESET,seed:String(seed),players,deck,market:[],discarded:[],goals:GOALS.filter(g=>colors.includes(g.type)&&(names.length>2||g.tier!==1)),turn:0,tick:0,phase:'action',target,tokonoma,finalRemaining:null,finalAt:null,log:[],caps:null,used:null,history:[],rewards:[],pendingCard:null};
  for(let i=0;i<4;i++)s.market.push(s.deck.pop());
  log(s,'El jardín está listo. Elegí meditar para conseguir recursos o cultivar para usarlos.');return s;
}
function log(s,message){s.log.unshift(message);s.log=s.log.slice(0,60);}
function draw(s){const c=s.deck.pop();if(c&&!s.deck.length&&s.finalRemaining===null){s.finalRemaining=s.players.length;s.finalAt=s.tick;log(s,'Se agotó el mazo. Cada jugador tendrá un turno adicional.');}return c;}
function refill(s){const rest=s.market.filter(Boolean),newCards=[];while(rest.length+newCards.length<4&&s.deck.length)newCards.unshift(draw(s));s.market=[...Array(4-rest.length-newCards.length).fill(null),...newCards,...rest];}
function settle(s){if(eligibleGoals(s).length)s.phase='goals';else if(inventoryCount(s.players[s.turn])>capacity(s.players[s.turn]))s.phase='discard';else s.phase='confirm';}
function beginPlant(s,caps,origin){s.phase='plant';s.caps=caps;s.used=empty();s.history=[];s.origin=origin;}
function cardEffect(s){const c=s.pendingCard,p=s.players[s.turn];s.pendingCard=null;
  if(c.type==='helper'){const caps={...empty(),wild:0};for(const t of c.items)caps[t]++;beginPlant(s,caps,'helper');}
  else if(c.type==='master'){s.rewards=c.items.map(t=>({options:t==='wild'?[...TYPES]:[t],optional:false,source:'Maestro'}));s.phase='reward';}
  else settle(s);
}
function afterRewards(s){if(s.pendingCard){refill(s);cardEffect(s);}else settle(s);}
function finish(s){
  const p=s.players[s.turn];check(inventoryCount(p)<=capacity(p),'Todavía tenés piezas de más.');
  log(s,`${p.name} terminó el turno.`);
  if(s.finalRemaining!==null&&s.tick>s.finalAt)s.finalRemaining--;
  s.tick++;s.caps=null;s.used=null;s.history=[];s.pendingCard=null;
  if(s.finalRemaining===0){s.phase='over';s.results=s.players.map(score);s.winner=s.results.reduce((a,r,i)=>r.total>=s.results[a].total?i:a,0);s.soloWon=s.players.length===1&&s.results[0].total>=s.target&&s.players[0].claimed.length===3;log(s,'Partida finalizada. La puntuación incluye todos los pergaminos y objetivos.');return;}
  s.turn=(s.turn+1)%s.players.length;s.phase=s.players.length>1?'handoff':'action';
}
// Reducer transaccional: un error no cambia el estado anterior.
export function act(state,action){
  const s=structuredClone(state),p=s.players[s.turn],a=action;
  check(s.phase!=='over','La partida ya terminó.');
  switch(a.type){
    case 'ready':check(s.phase==='handoff','No es el momento de cambiar jugador.');s.phase='action';break;
    case 'prune':{
      check(s.phase==='action','Solo se puede podar al inicio.');const opts=pruningOptions(p);check(Number.isInteger(a.index)&&opts[a.index],'Poda inválida.');for(const k of opts[a.index])delete p.tree[k];log(s,`${p.name} podó ${opts[a.index].length} piezas para permitir madera.`);break;
    }
    case 'meditate':check(s.phase==='action','Primero terminá la acción actual.');s.phase='market';break;
    case 'cancelMarket':check(s.phase==='market','La carta ya fue elegida.');s.phase='action';break;
    case 'cultivate':{
      check(s.phase==='action','Primero terminá la acción actual.');beginPlant(s,cultivationCaps(p),'cultivate');
      if(s.players.length===1){const c=s.market[3];if(c)s.discarded.push(c);s.market[3]=null;refill(s);}break;
    }
    case 'card':{
      check(s.phase==='market','Elegí meditar primero.');check(Number.isInteger(a.index)&&a.index>=0&&a.index<4&&s.market[a.index],'Carta no disponible.');
      const c=s.market[a.index];s.market[a.index]=null;p.cards.push(c);s.pendingCard=c;
      if(s.players.length===1){if(a.index>0){const d=s.market[a.index-1];if(d)s.discarded.push(d);s.market[a.index-1]=null;}else{const d=draw(s);if(d)s.discarded.push(d);}}
      const slots=[[],[['wood','leaf']],[['wood'],['flower']],[['leaf'],['fruit']]];
      s.rewards=slots[a.index].map(options=>({options,optional:true,source:'Posición en el mercado'}));log(s,`${p.name} eligió ${LABELS[c.type]}.`);
      if(s.rewards.length)s.phase='reward';else afterRewards(s);break;
    }
    case 'resource':{
      check(s.phase==='reward'&&s.rewards.length,'No hay recursos por elegir.');const r=s.rewards[0];check(r.options.includes(a.resource)||(a.resource===null&&r.optional),'Recurso no permitido.');if(a.resource)p.inventory[a.resource]++;s.rewards.shift();if(!s.rewards.length)afterRewards(s);break;
    }
    case 'place':{
      const reason=playReason(s,a.resource,a.x,a.y);check(!reason,reason);p.tree[key(a.x,a.y)]=a.resource;p.inventory[a.resource]--;s.used[a.resource]++;s.history.push({position:key(a.x,a.y),resource:a.resource});break;
    }
    case 'undo':{
      check(s.phase==='plant'&&s.history.length,'No hay una colocación para deshacer.');const h=s.history.pop();delete p.tree[h.position];p.inventory[h.resource]++;s.used[h.resource]--;break;
    }
    case 'endPlant':check(s.phase==='plant','No estás colocando piezas.');s.history=[];settle(s);break;
    case 'goal':{
      check(s.phase==='goals','No hay objetivos por resolver ahora.');const g=eligibleGoals(s).find(g=>g.id===a.id);check(g,'Ese objetivo no está disponible.');check(typeof a.claim==='boolean','Elegí reclamar o renunciar.');
      if(a.claim){p.claimed.push(g);s.goals=s.goals.filter(v=>v.id!==g.id);log(s,`${p.name} reclamó un objetivo de ${g.points} puntos: ${goalText(g)}.`);}else{p.renounced.push(g.id);log(s,`${p.name} renunció al objetivo de ${g.points} puntos.`);}settle(s);break;
    }
    case 'discard':check(s.phase==='discard','No tenés que descartar ahora.');check(TYPES.includes(a.resource)&&p.inventory[a.resource]>0,'No tenés esa pieza.');p.inventory[a.resource]--;settle(s);break;
    case 'finish':check(s.phase==='confirm','Todavía quedan decisiones por resolver.');finish(s);break;
    default:throw Error('Acción desconocida.');
  }
  return s;
}
export function validateSave(s){
  check(s?.version===1&&s.ruleset===RULESET,'Esta partida pertenece a otra versión de reglas.');
  check(Array.isArray(s.players)&&s.players.length>=1&&s.players.length<=4,'Jugadores inválidos.');
  check(Number.isInteger(s.turn)&&s.turn>=0&&s.turn<s.players.length,'Turno inválido.');
  check(['action','market','reward','plant','goals','discard','confirm','handoff','over'].includes(s.phase),'Etapa inválida.');
  check(Array.isArray(s.market)&&s.market.length===4&&Array.isArray(s.deck)&&Array.isArray(s.discarded)&&Array.isArray(s.goals)&&Array.isArray(s.log)&&Array.isArray(s.rewards)&&Array.isArray(s.history),'Partida incompleta.');
  for(const p of s.players){check(typeof p.name==='string'&&p.tree&&p.tree[key(p.flipped?2:0,0)]==='wood','Falta el brote inicial.');check(Array.isArray(p.cards)&&Array.isArray(p.claimed)&&Array.isArray(p.renounced),'Datos incompletos.');for(const t of TYPES)check(Number.isInteger(p.inventory?.[t])&&p.inventory[t]>=0,'Reserva inválida.');for(const [k,t]of Object.entries(p.tree)){const [x,y]=coords(k);check(TYPES.includes(t)&&Number.isSafeInteger(x)&&Number.isSafeInteger(y)&&(x+y)%2===0&&!inPot(x,y,p.flipped),'Tablero inválido.');}}
  const cards=[...s.deck,...s.market.filter(Boolean),...s.discarded,...s.players.flatMap(p=>p.cards)],expected=cardSet(s.players.length);
  check(cards.length===expected.length&&new Set(cards.map(c=>c.id)).size===cards.length,'Cartas duplicadas o ausentes.');
  const catalogue=new Map(expected.map(c=>[c.id,JSON.stringify(c)]));for(const c of cards)check(catalogue.get(c.id)===JSON.stringify(c),'Carta alterada.');
  if(s.phase==='plant')check(s.caps&&s.used,'Faltan los permisos de colocación.');
  return s;
}
