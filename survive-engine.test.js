import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createSurvive,actSurvive,legalActions,observation,restoreSurvive} from './survive-engine.js';
import {chooseSurvive} from './survive-bot.js';
import {createBoard} from './survive-board.js';
test('los cuatro refugios ocupan las esquinas completas, sin agua ficticia en la costa',()=>{const b=createBoard();assert.equal(Object.values(b).filter(c=>c.terrain==='rescue').length,12);for(const id of ['0:1','0:9','12:1','12:9'])assert.equal(b[id].terrain,'rescue');assert.equal(b['0:2'].terrain,'water');assert.equal(b['0:8'].terrain,'water');assert.equal(b['6:5'].terrain,'water');});
test('tablero conectado, cuarenta losetas, cinco serpientes y reserva completa',()=>{const s=createSurvive(['A','B']);assert.equal(Object.values(s.cells).filter(c=>c.tile).length,40);assert.equal(s.adventurers.length,40);assert.equal(s.rafts.length,12);for(const c of Object.values(s.cells))for(const id of c.neighbors)assert.ok(s.cells[id].neighbors.includes(c.id));assert.equal(s.creatures.filter(c=>c.cell).length,5);});
test('la observación de IA no contiene reversos, tesoros rivales ni azar futuro',()=>{const s=createSurvive(['A','B','C']),v=observation(s,0);assert.equal(v.rng,undefined);assert.ok(Object.values(v.cells).every(c=>!c.tile));assert.ok(v.adventurers.filter(p=>p.owner!==0).every(p=>p.value===undefined));});
test('partidas completas de dos a cinco participantes en las tres dificultades',()=>{
 for(const n of [2,3,4,5])for(const level of ['easy','medium','hard']){
  let s=createSurvive(Array.from({length:n},(_,i)=>'J'+i),{seed:123+n}),ticks=0,seed=19;const rng=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
  while(s.phase!=='finished'&&ticks++<1800){const a=chooseSurvive(s,level,rng);try{s=actSurvive(s,a);if(ticks%25===0)s=restoreSurvive(JSON.stringify(s));}catch(e){throw Error(`${n}/${level}/${s.phase}/${JSON.stringify(a)}: ${e.message}`);}}
  assert.equal(s.phase,'finished',`${n}/${level}: ${JSON.stringify(s.pending)}`);assert.ok(s.results.every(v=>Number.isInteger(v)&&v>=0&&v<=(n===2?60:30)));assert.ok(s.winners.length);
 }
});
test('a cinco primero se llenan cuarenta casillas y después se comparte',()=>{let s=createSurvive(['A','B','C','D','E']);for(let i=0;i<40;i++)s=actSurvive(s,legalActions(s)[0]);assert.equal(new Set(s.adventurers.filter(p=>p.cell).map(p=>p.cell)).size,40);s=actSurvive(s,legalActions(s)[0]);assert.equal(s.adventurers.filter(p=>p.status==='active').length,41);assert.ok(legalActions(s).every(a=>s.adventurers.filter(p=>p.cell===a.to).length===1));});
test('guardado roto se rechaza y los dos equipos conservan dos colores con dos tesoros de cada valor',()=>{const s=createSurvive(['A','B']);for(const p of s.players)for(const color of p.colors)for(let value=1;value<=5;value++)assert.equal(s.adventurers.filter(a=>a.color===color&&a.value===value).length,2);assert.deepEqual(restoreSurvive(JSON.stringify(s)),s);s.adventurers[0].value=99;assert.throws(()=>restoreSurvive(s));});
