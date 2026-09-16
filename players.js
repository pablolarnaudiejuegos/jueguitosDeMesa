export const LEVELS=['easy','medium','hard'];
export const LEVEL_NAMES={easy:'Fácil',medium:'Medio',hard:'Difícil'};
export function controller(s,i=s.turn){return s.players[i]?.controller||{type:s.machine&&i===1?'ai':'human',level:'medium'};}
export const isAI=(s,i=s?.turn)=>!!s&&controller(s,i).type==='ai';
export function seatFields(i){return `<label>Quién juega en el asiento ${i+1}<select name="controller"><option value="human">Persona</option><option value="easy">IA · Fácil</option><option value="medium">IA · Medio</option><option value="hard">IA · Difícil</option></select></label>`;}
export function configureSeats(s,form){const choices=[...form.querySelectorAll('[name=controller]')].map(x=>x.value);if(choices.length!==s.players.length||choices.some(x=>x!=='human'&&!LEVELS.includes(x)))throw Error('Configuración de jugadores inválida.');s.players.forEach((p,i)=>{p.controller={type:choices[i]==='human'?'human':'ai',level:choices[i]==='human'?null:choices[i]};if(choices[i]!=='human')p.name+=` · IA ${LEVEL_NAMES[choices[i]]}`;});s.machine=choices.some(x=>x!=='human');return s;}
// Adapters must choose legal actions using only their own private information and public state.
// Persist controller on each player; engines must preserve this metadata when saving/cloning.
export function chooseRanked(items,level='medium',rng=Math.random){if(!items.length)throw Error('No hay acciones legales.');if(level==='easy')return items[Math.floor(rng()*items.length)].action;items.sort((a,b)=>b.value-a.value);return items[0].action;}
