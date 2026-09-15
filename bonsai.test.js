import test from 'node:test';
import assert from 'node:assert/strict';
import {TYPES,GOALS,cardSet,createBonsai,act,validateSave,neighbourRule,placementReason,legalSpaces,playReason,capacity,permit,score,goalProgress,eligibleGoals,pruningOptions,key} from './bonsai-engine.js';
const game=(n=2)=>createBonsai({names:Array.from({length:n},(_,i)=>`J${i}`),seed:'test'});
const p=tree=>({tree,inventory:{wood:0,leaf:0,flower:0,fruit:0},cards:[],claimed:[],renounced:[],flipped:false});
test('mazos 32/32/43/47; 7 pergaminos y efectos no duplicados por id',()=>{
 for(let n=1;n<=4;n++){const c=cardSet(n);assert.equal(c.length,[32,32,43,47][n-1]);assert.equal(c.filter(c=>c.type==='parchment').length,7);assert.equal(new Set(c.map(c=>c.id)).size,c.length);validateSave(game(n));}
 assert.deepEqual(cardSet(3).reduce((a,c)=>(a[c.type]=(a[c.type]||0)+1,a),{}),{tool:5,growth:12,master:12,helper:7,parchment:7});
});
test('preparación: reserva por orden y Tokonoma con pergaminos en parte inicial',()=>{
 const s=game(4);assert.deepEqual(s.players.map(p=>Object.values(p.inventory).reduce((a,b)=>a+b)),[1,2,3,4]);assert.equal(game(1).players[0].inventory.leaf,1);
 for(let n=1;n<=4;n++){const t=createBonsai({names:Array(n).fill('J'),seed:'T',tokonoma:true});const played=[...t.market,...t.deck.toReversed()];const last=played.findLastIndex(c=>c.type==='parchment');assert.ok(last<Math.ceil((cardSet(n).length-7)/2)+7);validateSave(t);}
});
test('vecindarios: 375.000 comparaciones contra geometría y giros',()=>{
 const alphabet=[undefined,...TYPES],ring=[[1,0],[.5,Math.sqrt(3)/2],[-.5,Math.sqrt(3)/2],[-1,0],[-.5,-Math.sqrt(3)/2],[.5,-Math.sqrt(3)/2]];
 for(let m=0;m<15625;m++){let a=m;const ns=Array.from({length:6},()=>{const t=alphabet[a%5];a=Math.floor(a/5);return t;});for(const t of TYPES){const support=ns.flatMap((v,i)=>v===(t==='wood'||t==='leaf'?'wood':'leaf')?[i]:[]);const expected=t==='fruit'?!ns.includes('fruit')&&support.some(i=>support.some(j=>i!==j&&Math.abs(Math.hypot(ring[i][0]-ring[j][0],ring[i][1]-ring[j][1])-1)<1e-9)):support.length>0;for(let r=0;r<6;r++)assert.equal(!neighbourRule(t,[...ns.slice(r),...ns.slice(0,r)]),expected);}}
});
test('maceta: dos apoyos iniciales y simetría del reflejo',()=>{
 const a=game(1).players[0],b={...a,flipped:true,tree:{'2,0':'wood'}};
 assert.deepEqual(legalSpaces(a,'wood').sort(),[[-1,1],[1,1]].sort());
 assert.deepEqual(legalSpaces(a,'wood').map(([x,y])=>[2-x,y]).sort(),legalSpaces(b,'wood').sort());
 assert.ok(placementReason(a,'wood',2,0));assert.ok(placementReason(a,'wood',0,0));assert.ok(placementReason(a,'wood',0,1));
});
test('permisos: comodín no gastado prematuramente y ayudante aislado',()=>{
 const caps={wood:1,leaf:1,flower:0,fruit:0,wild:1};assert.equal(permit(caps,{wood:1,leaf:0},'flower'),true);assert.equal(permit(caps,{wood:2,leaf:0},'flower'),false);assert.equal(permit(caps,{wood:2,leaf:0},'leaf'),true);
 let s=game();s.market[0]={id:'helper',type:'helper',items:['wild','wood']};s.players[0].cards=[{type:'growth',items:['flower']}];s=act(act(s,{type:'meditate'}),{type:'card',index:0});assert.equal(s.phase,'plant');assert.equal(s.caps.flower,0);assert.equal(s.caps.wild,1);
});
test('error de colocación es atómico; colocar y deshacer conserva reserva',()=>{
 let s=act(game(),{type:'cultivate'}),original=JSON.stringify(s);assert.throws(()=>act(s,{type:'place',resource:'wood',x:0,y:0}));assert.equal(JSON.stringify(s),original);
 s=act(s,{type:'place',resource:'wood',x:1,y:1});assert.equal(s.players[0].inventory.wood,0);assert.equal(Object.keys(s.players[0].tree).length,2);
 s=act(s,{type:'undo'});assert.equal(s.players[0].inventory.wood,1);assert.equal(Object.keys(s.players[0].tree).length,1);
});
test('herramienta aplica capacidad en mismo turno; reserva común sin límite físico',()=>{
 let s=game();s.players[0].inventory.wood=5;s.market[2]={id:'tool',type:'tool',items:[]};s=act(act(s,{type:'meditate'}),{type:'card',index:2});s=act(s,{type:'resource',resource:'wood'});s=act(s,{type:'resource',resource:'flower'});assert.equal(capacity(s.players[0]),7);assert.equal(s.phase,'confirm');
 s=game();s.players[0].inventory.wood=52;s.market[0]={id:'master',type:'master',items:['wood']};s=act(act(s,{type:'meditate'}),{type:'card',index:0});s=act(s,{type:'resource',resource:'wood'});assert.equal(s.players[0].inventory.wood,53);assert.equal(s.phase,'discard');
});
test('mercado: recompensa original, elección excluyente y orden de reposición',()=>{
 let s=game();const old=s.market.map(c=>c.id),top=s.deck.at(-1).id;s=act(act(s,{type:'meditate'}),{type:'card',index:1});assert.deepEqual(s.rewards[0].options,['wood','leaf']);s=act(s,{type:'resource',resource:'leaf'});assert.deepEqual(s.market.map(c=>c.id),[top,old[0],old[2],old[3]]);
});
test('objetivos: hojas conectadas; renuncia personal y un color por jugador',()=>{
 const player=p({'0,0':'wood','0,4':'leaf','2,4':'leaf','4,4':'leaf','8,4':'leaf','10,4':'leaf'});assert.equal(goalProgress(player,GOALS.find(g=>g.type==='leaf')),3);
 let s=game();s.phase='goals';s.players[0].tree=Object.fromEntries(Array.from({length:12},(_,i)=>[key(i*2,2),'wood']));const g=GOALS.find(g=>g.id==='wood-0');s.goals=GOALS.filter(g=>g.type==='wood');s=act(s,{type:'goal',id:g.id,claim:false});assert.ok(s.goals.some(a=>a.id===g.id));assert.ok(s.players[0].renounced.includes(g.id));s=act(s,{type:'goal',id:'wood-2',claim:true});assert.equal(s.players[0].claimed.length,1);assert.equal(eligibleGoals(s).length,0);
});
test('flores, pergaminos y reserva: total exacto',()=>{
 const player=p({'0,0':'wood','1,1':'leaf','3,1':'flower','4,2':'fruit'});player.inventory.fruit=20;player.cards=[{type:'parchment',items:['wood'],points:1}];const v=score(player);assert.equal(v.flowers[0].points,4);assert.equal(v.total,15);
 player.tree['5,1']='flower';assert.equal(score(player).flowers.find(f=>f.position==='3,1').points,3);
});
test('poda mínima conserva apoyos y no confunde falta de inventario',()=>{
 const a=game(1).players[0];assert.deepEqual(pruningOptions(a),[]);a.tree['-1,1']='leaf';a.tree['1,1']='leaf';const opts=pruningOptions(a);assert.equal(opts.length,2);assert.ok(opts.every(o=>o.length===1));
 a.tree['-3,1']='flower';assert.deepEqual(pruningOptions(a),[['1,1']]);
});
test('solitario: descarte distinto para cada acción',()=>{
 let s=game(1),old=s.market.map(c=>c.id);s=act(act(s,{type:'meditate'}),{type:'card',index:2});assert.equal(s.discarded.at(-1).id,old[1]);
 s=game(1);old=s.market.map(c=>c.id);s=act(s,{type:'cultivate'});assert.equal(s.discarded.at(-1).id,old[3]);assert.equal(s.deck.length,27);
 s=game(1);const top=s.deck.at(-1).id;s=act(act(s,{type:'meditate'}),{type:'card',index:0});assert.equal(s.discarded.at(-1).id,top);
});
test('última carta descartada activa final; turno extra se cumple una sola vez',()=>{
 let s=game(1);s.deck=[s.deck[0]];s=act(act(s,{type:'meditate'}),{type:'card',index:0});assert.equal(s.finalRemaining,1);
 const settle=s=>{while(!['confirm','action','over'].includes(s.phase)){if(s.phase==='reward')s=act(s,{type:'resource',resource:s.rewards[0].options[0]});else if(s.phase==='plant')s=act(s,{type:'endPlant'});else if(s.phase==='discard')s=act(s,{type:'discard',resource:TYPES.find(t=>s.players[s.turn].inventory[t])});else throw Error(s.phase);}return s;};
 s=act(settle(s),{type:'finish'});assert.equal(s.phase,'action');s=act(s,{type:'cultivate'});s=act(s,{type:'endPlant'});s=act(settle(s),{type:'finish'});assert.equal(s.phase,'over');assert.throws(()=>act(s,{type:'finish'}));
});
test('partidas completas y recarga: 80 semillas con los cuatro tamaños',()=>{
 for(let n=1;n<=4;n++)for(let run=0;run<20;run++){
  let s=createBonsai({names:Array(n).fill('J'),seed:`sim-${n}-${run}`}),i=0;
  while(s.phase!=='over'&&i++<2000){const p=s.players[s.turn];let a;
   if(s.phase==='handoff')a={type:'ready'};
   else if(s.phase==='action')a={type:i%3===0?'cultivate':'meditate'};
   else if(s.phase==='market')a={type:'card',index:s.market.findIndex(Boolean)};
   else if(s.phase==='reward')a={type:'resource',resource:s.rewards[0].options[(i+run)%s.rewards[0].options.length]};
   else if(s.phase==='plant'){let move;for(const t of TYPES){const c=legalSpaces(p,t).find(([x,y])=>!playReason(s,t,x,y));if(c){move={type:'place',resource:t,x:c[0],y:c[1]};break;}}a=move||{type:'endPlant'};}
   else if(s.phase==='goals')a={type:'goal',id:eligibleGoals(s).at(-1).id,claim:true};
   else if(s.phase==='discard')a={type:'discard',resource:TYPES.find(t=>p.inventory[t])};
   else if(s.phase==='confirm')a={type:'finish'};
   s=act(s,a);s=validateSave(JSON.parse(JSON.stringify(s)));
  }
  assert.equal(s.phase,'over',`partida ${n}/${run}`);assert.equal(s.results.length,n);assert.ok(s.results.every(r=>r.total>=0));
 }
});
