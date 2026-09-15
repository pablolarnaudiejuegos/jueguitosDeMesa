import {TYPES,act,candidates,playReason,eligibleGoals,inventoryCount,score,legalSpaces} from './bonsai-engine.js';
import {tile,availableSpaces,place,claim,finishTurn} from './engine.js';
export function bonsaiMove(s){
 const p=s.players[s.turn];
 switch(s.phase){
 case'handoff':return {type:'ready'};
 case'action':return {type:(inventoryCount(p)>=3&&TYPES.some(t=>p.inventory[t]>0&&legalSpaces(p,t).length))||s.deck.length===0?'cultivate':'meditate'};
 case'market':{let best=-Infinity,index=0;s.market.forEach((c,i)=>{if(!c)return;const n=(c.type==='growth'?4:c.type==='tool'?2:3)+i;if(n>best){best=n;index=i;}});return {type:'card',index};}
 case'reward':return {type:'resource',resource:s.rewards[0].options.reduce((a,b)=>p.inventory[a]<=p.inventory[b]?a:b)};
 case'plant':{let best=null,value=-Infinity;for(const resource of TYPES)for(const [x,y]of candidates(p)){if(playReason(s,resource,x,y))continue;const a={type:'place',resource,x,y},next=act(s,a),v=score(next.players[s.turn]).total-score(p).total+(resource==='wood'?2:0)-Math.abs(x)*.01;if(v>value){value=v;best=a;}}return best||{type:'endPlant'};}
 case'goals':return {type:'goal',id:eligibleGoals(s)[0].id,claim:true};
 case'discard':return {type:'discard',resource:TYPES.find(t=>p.inventory[t]>0)};
 case'confirm':return {type:'finish'};
 default:throw Error('La máquina no tiene una acción disponible.');
 }
}
export function carcassonneMove(s){
 if(s.phase==='tile'){for(let r=0;r<4;r++){const spaces=availableSpaces(s,tile(s.current,r));if(spaces.length){s.rotation=r;place(s,...spaces[0]);return;}}throw Error('No hay una ubicación disponible.');}
 if(s.phase==='meeple'){for(let i=0;i<s.board[s.last].groups.length;i++){try{claim(s,i);return;}catch{}}finishTurn(s);}
}
