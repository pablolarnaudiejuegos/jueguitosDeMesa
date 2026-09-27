import {CLUB} from './club-data.js';
import {placementError,requirements,burgerInfo} from './burger-engine.js';
// Decisions see only this player's hand and public market/orders/burgers.
export function chooseClub(s,level='medium',rng=Math.random){
 const p=s.players[s.current],choices=[];
 if(s.phase==='handoff')return {type:'ready'};
 if(s.phase==='cleanup')return {type:'cleanup',discard:p.hand.slice(4)};
 if(s.phase==='market'){
  if(p.coins>1&&p.hand.length<5)for(let i=0;i<3;i++)if(s.market[i]){const card=CLUB.cards.find(c=>c.id===s.market[i]);const fits=card.sides.some((_,side)=>p.burgers.some(b=>!placementError(b,{id:card.id,side},CLUB)));if(fits)choices.push({action:{type:'buy',index:i},value:1});}
 }
 if(s.phase==='build'&&s.placed<(p.upgraded?4:3))for(const id of p.hand)for(const side of [0,1])for(const burger of [0,1]){
  const piece={id,side},stack=p.burgers[burger];if(placementError(stack,piece,CLUB))continue;
  const after=[...stack,piece],info=burgerInfo(after,CLUB);
  let value=info.count+info.perfect*.7;
  if(level==='hard')value+=Math.max(...s.orders.map(o=>{const checks=requirements(after,CLUB.orders.find(x=>x.id===o.id),CLUB);return checks.every(x=>x.ok)?30+o.coins:checks.filter(x=>x.ok).length*2;}));
  choices.push({action:{type:'place',id,side,burger},value});
 }
 if(s.phase==='score')for(const burger of [0,1])for(const o of s.orders)if(requirements(p.burgers[burger],CLUB.orders.find(x=>x.id===o.id),CLUB).every(x=>x.ok))choices.push({action:{type:'score',burger,order:o.id,reward:'coins'},value:burgerInfo(p.burgers[burger],CLUB).reward+o.coins});
 if(choices.length){if(level==='easy')return choices[Math.floor(rng()*choices.length)].action;choices.sort((a,b)=>b.value-a.value);return choices[0].action;}
 return {type:'advance'};
}
