import {legalActions,observation,decisionOwner} from './survive-engine.js';
const pick=(a,rng)=>a[Math.floor(rng()*a.length)];
function distances(s){const d={},queue=Object.values(s.cells).filter(c=>c.terrain==='rescue').map(c=>c.id);for(const id of queue)d[id]=0;for(let i=0;i<queue.length;i++)for(const id of s.cells[queue[i]].neighbors)if(d[id]===undefined&&s.cells[id].terrain!=='volcano'){d[id]=d[queue[i]]+1;queue.push(id);}return d;}
export function chooseSurvive(s,level='medium',rng=Math.random){
 const actions=legalActions(s);if(!actions.length)throw Error('No hay decisiones legales para esta etapa.');
 if(level==='easy')return pick(actions,rng);
 const owner=decisionOwner(s),v=observation(s,owner),d=distances(v),own=a=>a.owner===owner,weight=a=>own(a)?(level==='hard'?a.value:3):3;
 const danger=(to,raft=false)=>v.creatures.reduce((sum,c)=>sum+(c.cell===to?(c.type==='serpent'?15:c.type==='shark'&&!raft?12:0):level==='hard'&&v.cells[to]?.neighbors.includes(c.cell)?(c.type==='serpent'?3:c.type==='shark'&&!raft?2:0):0),0);
 const benefit=(person,to,from=person.cell)=>((d[from]??12)-(d[to]??12))*weight(person)+(v.cells[to].terrain==='rescue'?weight(person)*8:0)-danger(to,!!v.rafts.find(r=>r.cell===to))*weight(person);
 function rate(a){
  const person=v.adventurers.find(p=>p.id===a.id),raft=v.rafts.find(r=>r.id===a.id),to=a.to||a.path?.at(-1);
  switch(a.type){
  case 'setup-person':return -(d[to]??12)*weight(person)+['beach','forest','mountain'].indexOf(v.cells[to].terrain)*.6;
  case 'setup-raft':return v.cells[to].neighbors.reduce((sum,id)=>sum+v.adventurers.filter(p=>p.cell===id&&own(p)).length,0)*4-(d[to]??12);
  case 'end-action':return -100;
  case 'move':case 'ability-move':{
   let n=person?benefit(person,to):v.adventurers.filter(p=>p.raft===a.id).reduce((sum,p)=>sum+(own(p)?1:-.6)*benefit(p,to),0);
   if(raft&&!v.adventurers.some(p=>p.raft===a.id))n=v.adventurers.filter(p=>own(p)&&p.status==='active'&&v.cells[to].neighbors.includes(p.cell)).length*2-2;
   if(a.type==='ability-move')n-=1;return n;
  }
  case 'repel':return a.tile?20:0;
  case 'board':return a.ids.reduce((sum,id)=>{const p=v.adventurers.find(p=>p.id===id);return sum+(own(p)?weight(p):-.5);},0);
  case 'sink':return v.adventurers.filter(p=>p.cell===to&&p.status==='active').reduce((sum,p)=>sum+(own(p)?-weight(p)*3:4),0);
  case 'push-person':return (own(person)?1:-1)*benefit(person,to);
  case 'creature':case 'push-creature':{
   const c=v.creatures.find(c=>c.id===a.id);return v.adventurers.filter(p=>p.status==='active'&&p.cell===to&&(c.type!=='shark'||!p.raft)).reduce((sum,p)=>sum+(own(p)?-weight(p)*8:15),0)+v.adventurers.filter(p=>p.status==='active'&&!own(p)&&v.cells[to].neighbors.includes(p.cell)).length-(a.type==='push-creature'&&v.creatures.some(x=>x.type==='kaiju'&&x.id!==a.id&&x.cell===to)?50:0);
  }
  case 'dive':return -danger(to)-2;
  case 'ability-die':return -5;
  default:return 0;
  }
 }
 const ranked=actions.map(action=>({action,value:rate(action)})),best=Math.max(...ranked.map(x=>x.value));return pick(ranked.filter(x=>x.value===best),rng).action;
}
