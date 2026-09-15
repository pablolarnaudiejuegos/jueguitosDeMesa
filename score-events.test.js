import test from 'node:test';
import assert from 'node:assert/strict';
import {tile,score} from './engine.js';
test('ciudad cerrada emite un evento con el cálculo correcto y no lo duplica',()=>{
 const board={'0,0':tile(4),'0,-1':tile(4,2)};board['0,0'].meeple={player:0,group:0};
 const s={board,players:[{name:'Ana',score:0,meeples:6}],log:[]};score(s);score(s);
 assert.equal(s.scoreEvents.length,1);assert.equal(s.scoreEvents[0].title,'Ana obtuvo 4 puntos');
 assert.match(s.scoreEvents[0].detail,/2 losetas × 2/);assert.match(s.log[0],/4 puntos/);
});
test('puntuación final explica escudos y empates para cada ganador',()=>{
 const board={'0,0':tile(6),'0,-1':tile(4,2)};board['0,0'].meeple={player:0,group:0};board['0,-1'].meeple={player:1,group:0};
 const s={board,players:[{name:'Ana',score:0,meeples:6},{name:'Luis',score:0,meeples:6}],log:[]};score(s,true);
 assert.equal(s.scoreEvents.length,2);
 for(const e of s.scoreEvents){assert.equal(e.points,3);assert.match(e.detail,/2 losetas × 1 \+ 1 escudos × 1 = 3/);assert.match(e.detail,/Empate/);assert.match(e.detail,/Puntuación final/);}
});
