import {chooseRanked} from './players.js';
import {actNaturalis,spaces,reason,symbols,objectiveScore,card} from './naturalis-engine.js';
import {TYPES,act,candidates,playReason,eligibleGoals,inventoryCount,score,legalSpaces} from './bonsai-engine.js';
import {tile,availableSpaces,place,claim,finishTurn,feature} from './engine.js';
export function bonsaiMove(s,level='medium'){
 const p=s.players[s.turn];
 switch(s.phase){
 case'handoff':return {type:'ready'};
 case'action':return {type:(inventoryCount(p)>=3&&TYPES.some(t=>p.inventory[t]>0&&legalSpaces(p,t).length))||s.deck.length===0?'cultivate':'meditate'};
 case'market':{if(level==='easy'){const ids=s.market.flatMap((c,i)=>c?[i]:[]);return {type:'card',index:ids[Math.floor(Math.random()*ids.length)]};}let best=-Infinity,index=0;s.market.forEach((c,i)=>{if(!c)return;const n=(c.type==='growth'?4:c.type==='tool'?2:3)+i;if(n>best){best=n;index=i;}});return {type:'card',index};}
 case'reward':return {type:'resource',resource:s.rewards[0].options.reduce((a,b)=>p.inventory[a]<=p.inventory[b]?a:b)};
 case'plant':{let best=null,value=-Infinity;for(const resource of TYPES)for(const [x,y]of candidates(p)){if(playReason(s,resource,x,y))continue;const a={type:'place',resource,x,y},next=act(s,a),v=score(next.players[s.turn]).total-score(p).total+(resource==='wood'?2:0)-Math.abs(x)*.01;const adjusted=level==='easy'?Math.random():v+(level==='hard'?legalSpaces(next.players[s.turn],'leaf').length*.12+eligibleGoals(next).reduce((n,g)=>n+(g.points||1),0):0);if(adjusted>value){value=adjusted;best=a;}}return best||{type:'endPlant'};}
 case'goals':return {type:'goal',id:eligibleGoals(s)[0].id,claim:true};
 case'discard':return {type:'discard',resource:TYPES.find(t=>p.inventory[t]>0)};
 case'confirm':return {type:'finish'};
 default:throw Error('La máquina no tiene una acción disponible.');
 }
}
function carcValue(s,owner,hard){let v=s.players[owner].score-s.players.filter((_,i)=>i!==owner).reduce((n,p)=>n+p.score,0)*.4;if(hard){const seen=new Set();for(const [k,t] of Object.entries(s.board))if(t.meeple){const f=feature(s.board,k,t.meeple.group),key=f.nodes.map(n=>n.join(':')).sort().join('|');if(seen.has(key))continue;seen.add(key);const own=f.followers.filter(m=>m.player===owner).length;if(own)v+=(f.type==='C'?f.tiles+f.shields:f.type==='M'?9-f.open:f.tiles)/(1+f.open*.25);}}return v;}
export function carcassonneMove(s,level='medium'){
 const owner=s.turn,items=[];
 if(s.phase==='tile'){
  for(let r=0;r<4;r++)for(const [x,y] of availableSpaces(s,tile(s.current,r))){const t=structuredClone(s);t.rotation=r;place(t,x,y);let value=-Infinity;for(let g=-1;g<t.board[t.last].groups.length;g++){const next=structuredClone(t);try{if(g<0)finishTurn(next);else claim(next,g);value=Math.max(value,carcValue(next,owner,level==='hard'));}catch{}}items.push({action:{r,x,y},value});}
  const a=chooseRanked(items,level);s.rotation=a.r;place(s,a.x,a.y);return;
 }
 if(s.phase==='meeple'){for(let g=-1;g<s.board[s.last].groups.length;g++){const t=structuredClone(s);try{if(g<0)finishTurn(t);else claim(t,g);items.push({action:g,value:carcValue(t,owner,level==='hard')+(g>=0?.05:0)});}catch{}}const g=chooseRanked(items,level);if(g<0)finishTurn(s);else claim(s,g);}
}
function manuscriptValue(p,s,hard){const resources=symbols(p);let v=p.score;if(hard){v+=[...s.common,p.secret].filter(id=>id!==null).reduce((n,id)=>n+objectiveScore(p,id),0);v+=Object.values(resources).reduce((n,v)=>n+Math.min(v,4),0)*.15;}return v;}
export function naturalisMove(s,level='medium'){
 const p=s.players[s.turn],hard=level==='hard';
 if(s.phase==='privacy')return {type:'ready'};
 if(s.phase==='prepare'){const choices=[];for(const secret of p.options)for(const back of [false,true]){const q=structuredClone(p);q.secret=secret;q.board[0].back=back;choices.push({action:{type:'prepare',secret,back},value:manuscriptValue(q,s,true)});}return chooseRanked(choices,level);}
 if(s.phase==='place'){const choices=[];for(const id of p.hand)for(const back of [false,true])for(const [x,y] of spaces(p)){if(reason(p,id,back,x,y))continue;const action={type:'place',id,back,x,y},next=actNaturalis(s,action);choices.push({action,value:manuscriptValue(next.players[s.turn],s,hard)});}return chooseRanked(choices,level);}
 if(s.phase==='draw'){const choices=[];for(const kind of ['resource','gold']){if(s[kind].length)choices.push({action:{type:'draw',kind,index:-1},value:0});s.market[kind].forEach((id,index)=>{if(id===null)return;const c=card(id),have=symbols(p),needed={};for(const v of c.need||[])needed[v]=(needed[v]||0)+1;const missing=Object.entries(needed).reduce((n,[v,count])=>n+Math.max(0,count-(have[v]||0)),0);choices.push({action:{type:'draw',kind,index},value:(c.points||1)-(hard?missing:0)+(kind==='resource'?.1:0)});});}return choices.length?chooseRanked(choices,level):{type:'draw'};}
 throw Error('Phase inconnue.');
}
