import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,tile,place,claim,finishTurn,availableSpaces,canPlace,feature,migrateGame} from './engine.js';

test('captura: permite volver a girar al norte tras dos tramos rectos hacia el oeste, incluso en guardados antiguos',()=>{
 const s=createGame(['A','B']);
 s.board={'0,0':tile(10),'0,1':tile(20),'0,2':tile(16,1),'-1,2':tile(14,2),'-2,2':tile(19,1)};
 s.river={active:true,tip:[-3,2],direction:3,lastBend:1};s.current=13;s.rotation=1;
 assert.equal(canPlace(s,tile(13,1),-3,2),true);place(s,-3,2);
 assert.deepEqual(s.river.tip,[-3,1]);
});

test('dibujo de la captura: el tramo serpenteante tiene agua arriba y admite la ciudad por ese extremo',()=>{
 const s=createGame(['A','B']);s.board={'0,0':tile(20)};
 s.river={active:true,tip:[0,-1],direction:0,lastBend:0};s.current=16;
 assert.equal(canPlace(s,tile(16),0,-1),true);
 assert.deepEqual(tile(20).edges,['W','F','W','F']);
 assert.deepEqual(tile(10).edges,['R','R','W','F']);
});
test('migración del río conserva extremo, turno y las cartas pendientes',()=>{
 const s=createGame(['A','B']);s.version=2;s.board['0,0']={...tile(10),edges:['F','F','W','F'],groups:[]};
 const before=JSON.stringify({river:s.river,riverDeck:s.riverDeck,deck:s.deck,current:s.current,turn:s.turn});
 migrateGame(s);assert.equal(s.version,3);assert.equal(s.board['0,0'].edges[0],'R');
 assert.equal(JSON.stringify({river:s.river,riverDeck:s.riverDeck,deck:s.deck,current:s.current,turn:s.turn}),before);
});

test('captura: Gran ciudad tiene un camino al oeste que acepta el camino del vecino',()=>{
 const s=createGame(['A','B'],{withRiver:false});s.board={'0,0':tile(3,3)};s.current=6;
 assert.equal(s.board['0,0'].edges[1],'R');assert.equal(tile(6).edges[3],'R');
 assert.equal(canPlace(s,tile(6),1,0),true);place(s,1,0);
 assert.equal(feature(s.board,'1,0',1).tiles,2);
 claim(s,1);assert.equal(s.players[0].score,2);
});
test('migración repara el camino y conserva turno, puntos, seguidores y mazo',()=>{
 const s=createGame(['A','B'],{withRiver:false});delete s.version;
 s.board['1,0']=tile(6);s.board['1,0'].edges[3]='F';s.board['1,0'].groups=[[0,1,2]];
 s.board['1,0'].meeple={player:0,group:0};s.players[0].meeples=6;s.players[0].score=4;
 const deck=[...s.deck];migrateGame(s);assert.equal(s.board['1,0'].edges[3],'R');
 assert.deepEqual(s.board['1,0'].meeple,{player:0,group:0});assert.equal(s.players[0].score,4);assert.deepEqual(s.deck,deck);
});
test('preparación: nacimiento, diez intermedias y lago; terreno separado',()=>{
 const s=createGame(['A','B']);assert.equal(s.board['0,0'].type,10);assert.equal(s.riverDeck.length,10);
 assert.equal(s.riverDeck[0],11);assert.equal(s.deck.length,43);assert.ok(s.current>=12);
 assert.equal(canPlace(s,tile(0),0,1),false);assert.equal(canPlace(s,tile(12),1,0),false);
});
test('río: bloquea dos curvas del mismo sentido y permite la contraria',()=>{
 const s=createGame(['A','B']);s.current=13;s.rotation=0;place(s,0,1);finishTurn(s);
 s.current=13;assert.equal(canPlace(s,tile(13,1),-1,1),false);assert.equal(canPlace(s,tile(13,2),-1,1),true);
});
test('el agua no se puede reclamar ni puntuar',()=>{
 const s=createGame(['A','B']);s.current=12;s.rotation=0;place(s,0,1);assert.throws(()=>claim(s,0),/Zona inválida/);
 assert.equal(s.players[0].score,0);assert.equal(s.players[0].meeples,7);
});
test('100 partidas con río terminan, conservan reservas y pasan al terreno después del lago',()=>{
 for(let i=0;i<100;i++){
  let s=createGame(['A','B']);let turns=0,riverPlaced=0;
  while(s.phase!=='over'){
   const river=s.river.active;let choices=[];
   const rotations=[0,1,2,3].sort(()=>Math.random()-.5);
   for(const r of rotations){choices=availableSpaces(s,tile(s.current,r));if(choices.length){s.rotation=r;break;}}
   assert.ok(choices.length,`sin lugar: ${s.current}, río ${river}`);
   const pos=choices[Math.floor(Math.random()*choices.length)];place(s,...pos);
   if(river){riverPlaced++;if(s.river.active)assert.equal(s.deck.length,43);else assert.equal(s.board[s.last].type,11);}
   const g=s.board[s.last].groups.findIndex((_,j)=>!feature(s.board,s.last,j).followers.length);
   if(g>=0&&s.players[s.turn].meeples)claim(s,g);else finishTurn(s);
   s.players.forEach((p,j)=>assert.equal(p.meeples+Object.values(s.board).filter(t=>t.meeple?.player===j).length,7));
   s=JSON.parse(JSON.stringify(s));assert.ok(++turns<=54);
  }
  assert.equal(riverPlaced+(s.riverDiscarded||0),11);assert.equal(Object.keys(s.board).length+s.discarded,55);
 }
});

