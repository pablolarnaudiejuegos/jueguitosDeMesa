import test from 'node:test';
import assert from 'node:assert/strict';
import {templates,tile,legal,createGame,canPlace,placementError,place,claim,feature} from './engine.js';

test('última captura: el camino inferior coincide, pero el camino del vecino derecho también debe continuar',()=>{
 const s=createGame(['A','B'],{withRiver:false});
 s.board={'0,1':tile(1,3),'1,0':tile(19),'-1,0':tile(21,2)};
 assert.match(placementError(s,tile(0),0,0),/derecha.*campo contra camino/);
 assert.equal(canPlace(s,tile(0),0,0),false);
 assert.equal(canPlace(s,tile(2),0,0),true);
});

test('22.528 huecos: cada orientación exige coincidencia simultánea con los cuatro vecinos',()=>{
 const dirs=[[0,-1],[1,0],[0,1],[-1,0]],symbols=['C','R','W','F'];let cases=0;
 for(let type=0;type<22;type++)for(let rotation=0;rotation<4;rotation++)for(let pattern=0;pattern<256;pattern++){
  const board={},t=tile(type,rotation);let n=pattern,expected=true;
  for(let side=0;side<4;side++){
   const symbol=symbols[n%4];n=Math.floor(n/4);const edges=['F','F','F','F'];edges[(side+2)%4]=symbol;
   board[dirs[side].join(',')]={edges};expected=expected&&symbol===templates[type].edges[(side-rotation+4)%4];
  }
  assert.equal(legal(board,t,0,0),expected);cases++;
 }
 assert.equal(cases,22528);
});

test('captura: U inmediata bloqueada; la misma ficha girada hacia abajo es válida',()=>{
 const s=createGame(['A','B']);s.board={'0,0':tile(10),'0,1':tile(15,1),'0,2':tile(16,2)};
 s.river={active:true,tip:[1,2],direction:1,lastBend:3};
 assert.match(placementError(s,tile(21,2),1,2),/U inmediata/);
 assert.equal(canPlace(s,tile(21,1),1,2),true);
});
test('captura ciudad: reserva disponible no permite reclamar una ciudad ya ocupada',()=>{
 const s=createGame(['A','B'],{withRiver:false});s.board={'0,0':tile(16,2)};
 s.board['0,0'].meeple={player:1,group:0};s.players[1].meeples=6;s.turn=1;s.current=3;s.rotation=1;
 place(s,-1,0);assert.equal(feature(s.board,'-1,0',0).followers[0].player,1);
 assert.throws(()=>claim(s,0),/ocupada/);assert.equal(feature(s.board,'-1,0',1).followers.length,0);
 s.board['0,0'].meeple=null;assert.equal(feature(s.board,'-1,0',0).followers.length,0);
 claim(s,0);assert.equal(s.players[1].meeples,5);
});
test('30.976 pares: todas las losetas, cuatro giros y cuatro lados coinciden exactamente con sus bordes',()=>{
 const dir=[[0,-1],[1,0],[0,1],[-1,0]];let cases=0;
 for(let a=0;a<templates.length;a++)for(let ar=0;ar<4;ar++)for(let b=0;b<templates.length;b++)for(let br=0;br<4;br++)for(let side=0;side<4;side++){
  const first=tile(a,ar),second=tile(b,br),[x,y]=dir[side];
  const expected=templates[a].edges[(side-ar+4)%4]===templates[b].edges[((side+2)%4-br+4)%4];
  assert.equal(legal({'0,0':first},second,x,y),expected,`${a}/${ar} ${b}/${br} lado ${side}`);cases++;
 }
 assert.equal(cases,30976);
});
test('río: todos los tipos y giros, entradas y salidas, validan U inmediata por geometría',()=>{
 const dir=[[0,-1],[1,0],[0,1],[-1,0]];
 for(let a=12;a<22;a++)for(let ar=0;ar<4;ar++){
  const prev=tile(a,ar),waters=prev.edges.flatMap((e,i)=>e==='W'?[i]:[]);
  for(const out of waters){const entry=waters.find(e=>e!==out),incoming=(entry+2)%4;
   const [x,y]=dir[out],s={board:{'0,0':prev},river:{active:true,tip:[x,y],direction:out,lastBend:99}};
   for(let b=11;b<22;b++)for(let br=0;br<4;br++){
    const next=tile(b,br),nextEntry=(out+2)%4;
    let expected=next.edges[nextEntry]==='W';
    if(expected&&b!==11){const nextOut=next.edges.findIndex((e,i)=>e==='W'&&i!==nextEntry);
     // Dos curvas forman U si la salida final invierte el rumbo anterior a ambas.
     const prevCurve=(entry+2)%4!==out,nextCurve=(nextEntry+2)%4!==nextOut;
     if(prevCurve&&nextCurve&&nextOut===(incoming+2)%4)expected=false;
    }
    assert.equal(canPlace(s,next,x,y),expected,`${a}/${ar} rumbo ${out} -> ${b}/${br}`);
   }
  }
 }
});
