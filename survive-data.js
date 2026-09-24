// Survive the Island (2024), official English rulebook, pp. 2, 6, 8.
export const RULEBOOK='https://cdn.svc.asmodee.net/production-asmodeeca/uploads/2024/07/ZYGSTI01EN_RULES_20240227-low.pdf';
export const TERRAIN=['beach','forest','mountain'];
export const DISTRIBUTION={
 beach:{shark:3,kaiju:3,raft:1,paddles:2,dolphin:3,die:2,repellent:2},
 forest:{shark:3,kaiju:2,raft:3,whirlpool:2,dolphin:1,dive:2,die:2,repellent:1},
 mountain:{whirlpool:4,volcano:4},
};
export const ABILITIES=['paddles','dolphin','dive','die','repellent'];
export const CREATURES={serpent:{count:5,min:1,max:1,land:false},shark:{count:6,min:1,max:2,land:false},kaiju:{count:2,min:1,max:2,land:true}};
export function tiles(){return Object.entries(DISTRIBUTION).flatMap(([terrain,effects])=>Object.entries(effects).flatMap(([effect,n])=>Array.from({length:n},(_,i)=>({id:`${terrain}-${effect}-${i}`,terrain,effect,ability:ABILITIES.includes(effect)}))));}
export function setupCounts(players){if(!Number.isInteger(players)||players<2||players>5)throw Error('Elegí entre 2 y 5 personas.');return {adventurersPerPlayer:players===2?20:10,colorsPerPlayer:players===2?2:1,raftsPerPlayer:players===2?4:2};}
export function removableTiles(board){const land=board.filter(t=>TERRAIN.includes(t.terrain)),rank=Math.min(...land.map(t=>TERRAIN.indexOf(t.terrain)));return land.filter(t=>TERRAIN.indexOf(t.terrain)===rank);}
export function controlsRaft(owner,passengers){const counts=new Map();for(const p of passengers)counts.set(p.owner,(counts.get(p.owner)||0)+1);return passengers.length===0||(counts.get(owner)||0)>0&&[...counts.values()].every(n=>n<=(counts.get(owner)||0));}
export function swimmingMove(from,to){return from==='water'||to==='water';}
export function endReason(volcanoes,adventurers){return volcanoes>=3?'volcanoes':adventurers.every(p=>p.status==='rescued'||p.status==='eliminated')?'no-adventurers':null;}
export function score(adventurers,players){return Array.from({length:players},(_,owner)=>adventurers.filter(p=>p.owner===owner&&p.status==='rescued').reduce((sum,p)=>sum+p.value,0));}
