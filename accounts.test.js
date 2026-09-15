import test from 'node:test';
import assert from 'node:assert/strict';
import {createBonsai,act,validateSave} from './bonsai-engine.js';
import {createGame} from './engine.js';
import {bonsaiMove,carcassonneMove} from './bots.js';
test('máquinas completan partidas legales de ambos juegos',()=>{
 for(let seed=0;seed<8;seed++){
 let s=createBonsai({names:['A','B'],seed:String(seed)}),steps=0;
 while(s.phase!=='over'&&steps++<1500)s=act(s,bonsaiMove(s));
 assert.equal(s.phase,'over');validateSave(s);
 const c=createGame(['A','B'],{withRiver:seed%2===0});steps=0;
 while(c.phase!=='over'&&steps++<400)carcassonneMove(c);
 assert.equal(c.phase,'over');assert(c.players.every(p=>p.score>=0));
 }
});
