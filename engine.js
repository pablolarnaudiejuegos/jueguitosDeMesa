export const directions=[[0,-1],[1,0],[0,1],[-1,0]];
export const key=(x,y)=>`${x},${y}`;
// Cada grupo representa un camino o ciudad conectado dentro de una loseta.
export const templates=[
 {name:'Camino recto',edges:'RFRF',groups:[[0,2]],count:6},
 {name:'Curva del camino',edges:'RRFF',groups:[[0,1]],count:6},
 {name:'Cruce de caminos',edges:'RRRF',groups:[[0],[1],[2]],count:4},
 {name:'Puerta de la ciudad',edges:'CFRF',groups:[[0],[2]],count:5},
 {name:'Muralla',edges:'CFFF',groups:[[0]],count:5},
 {name:'Barrio amurallado',edges:'CCFF',groups:[[0,1]],count:4},
 {name:'Gran ciudad',edges:'CCCR',groups:[[0,1,2],[3]],shield:1,count:3},
 {name:'Dos ciudades',edges:'CFCF',groups:[[0],[2]],count:3},
 {name:'Monasterio',edges:'FFFF',groups:[[]],monastery:true,count:4},
 {name:'Monasterio con camino',edges:'FFRF',groups:[[],[2]],monastery:true,count:3},
 {name:'Nacimiento del río',edges:'RRWF',groups:[[0,1]],river:'source',count:0},
 {name:'Lago con monasterio',edges:'WFFF',groups:[[]],monastery:true,river:'lake',count:0},
 {name:'Río recto',edges:'WFWF',groups:[],river:'course',count:0,riverCount:1},
 {name:'Curva del río',edges:'WFFW',groups:[],river:'course',count:0,riverCount:1},
 {name:'Río, ciudad y puente',edges:'CWRW',groups:[[0],[2]],river:'course',count:0,riverCount:1},
 {name:'Río entre ciudades',edges:'CWCW',groups:[[0],[2]],river:'course',count:0,riverCount:1},
 {name:'Río junto a ciudad',edges:'CCWW',groups:[[0,1]],river:'course',count:0,riverCount:1},
 {name:'Río y monasterio',edges:'FWRW',groups:[[],[2]],monastery:true,river:'course',count:0,riverCount:1},
 {name:'Curva del río y camino',edges:'RWWR',groups:[[0,3]],river:'course',count:0,riverCount:1},
 {name:'Río con puente',edges:'WRWR',groups:[[1,3]],river:'course',count:0,riverCount:1},
 {name:'Río serpenteante',edges:'WFWF',groups:[],river:'course',count:0,riverCount:1},
 {name:'Curva del río con jardín',edges:'FWWF',groups:[],river:'course',count:0,riverCount:1}
];
export function tile(type,rotation=0){const t=templates[type];return {type,rotation,edges:Array.from({length:4},(_,i)=>t.edges[(i-rotation+4)%4]),groups:t.groups.map(g=>g.map(e=>(e+rotation)%4)),meeple:null};}
function shuffle(deck){for(let i=deck.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[deck[i],deck[j]]=[deck[j],deck[i]];}return deck;}
export function createGame(names,{withRiver=true}={}){
 if(names.length<2||names.length>5)throw Error('Se necesitan entre 2 y 5 jugadores');
 const deck=shuffle(templates.flatMap((t,i)=>Array(t.count).fill(i)));
 const riverDeck=withRiver?[11,...shuffle(templates.flatMap((t,i)=>Array(t.riverCount||0).fill(i)))]:[];
 return {version:3,board:{'0,0':tile(withRiver?10:3)},players:names.map(name=>({name,score:0,meeples:7})),deck,riverDeck,river:withRiver?{active:true,tip:[0,1],direction:2,lastBend:0}:null,current:withRiver?riverDeck.pop():deck.pop(),rotation:0,turn:0,phase:'tile',last:null,log:[withRiver?'Comienza el río: continuá desde el nacimiento.':'La mesa está lista. ¡Comienza la partida!'],discarded:0};
}
export function migrateGame(s){
 if(s.version===3)return s;
 const previous=s.version;
 for(const [k,t]of Object.entries(s.board)){
  // El lago antiguo tenía su única salida al este; conservar esa conexión.
  const rotation=t.type===11?(t.rotation+1)%4:t.rotation;
  const fixed=tile(t.type,rotation);fixed.meeple=t.meeple;s.board[k]=fixed;
 }
 if(previous!==2){s.river=null;s.riverDeck=[];}
 if(s.current===11)s.rotation=(s.rotation+1)%4;
 s.version=3;
 s.log.unshift(s.river?'Se corrigieron las imágenes y conexiones del nacimiento y del lago.':'Se actualizaron las conexiones de las losetas.');
 return s;
}
export function legal(board,t,x,y){if(board[key(x,y)])return false;let touch=false;for(let e=0;e<4;e++){const [dx,dy]=directions[e],n=board[key(x+dx,y+dy)];if(n){touch=true;if(n.edges[(e+2)%4]!==t.edges[e])return false;}}return touch;}
export function spaces(board,t){const found=new Map();for(const k of Object.keys(board)){const [x,y]=k.split(',').map(Number);for(const [dx,dy]of directions){const a=x+dx,b=y+dy;if(legal(board,t,a,b))found.set(key(a,b),[a,b]);}}return [...found.values()];}
export function placementError(s,t,x,y){
 if(s.board[key(x,y)])return 'Esta casilla ya tiene una loseta.';
 let touches=false;
 const names={W:'río',R:'camino',C:'ciudad',F:'campo'},sides=['arriba','a la derecha','abajo','a la izquierda'];
 for(let e=0;e<4;e++){
  const [dx,dy]=directions[e],neighbor=s.board[key(x+dx,y+dy)];
  if(!neighbor)continue;touches=true;
  if(t.edges[e]!==neighbor.edges[(e+2)%4])return `El borde ${sides[e]} no coincide: ${names[t.edges[e]]} contra ${names[neighbor.edges[(e+2)%4]]}. Girá la ficha.`;
 }
 if(!touches)return 'La loseta debe tocar otra por un borde.';
 if(!s.river?.active)return templates[t.type].river?'La etapa del río ya terminó.':'';
 if(!templates[t.type].river)return 'Primero se colocan las losetas del río.';
 if(x!==s.river.tip[0]||y!==s.river.tip[1])return 'Continuá por el extremo abierto del río.';
 const entry=(s.river.direction+2)%4;
 if(t.edges[entry]!=='W')return 'La entrada de agua debe coincidir con el extremo del río.';
 const exit=t.edges.findIndex((e,i)=>e==='W'&&i!==entry);
 if(exit<0)return templates[t.type].river==='lake'?'':'Solo el lago puede cerrar el río.';
 const bend=(exit-s.river.direction+4)%4;
 const [px,py]=directions[s.river.direction];
 const previous=s.board[key(x-px,y-py)];
 const water=previous.edges.flatMap((e,i)=>e==='W'?[i]:[]);
 const previousEntry=water.find(e=>e!==s.river.direction);
 const previousBend=water.length===2?(s.river.direction-((previousEntry+2)%4)+4)%4:0;
 if(bend===2||(bend!==0&&bend===previousBend))return 'El agua coincide, pero forma una U inmediata: dos curvas consecutivas giran hacia el mismo lado. Girá la ficha para que el río salga hacia el otro lado.';
 const [dx,dy]=directions[exit];
 if(s.board[key(x+dx,y+dy)])return 'La salida del río desembocaría en una casilla ocupada.';
 return '';
}
export function canPlace(s,t,x,y){return placementError(s,t,x,y)==='';}
export function availableSpaces(s,t){return spaces(s.board,t).filter(([x,y])=>canPlace(s,t,x,y));}
export function feature(board,start,group){const queue=[[start,group]],seen=new Set(),nodes=[],tiles=new Set();let open=0,shields=0;const first=board[start],type=first.groups[group].length?first.edges[first.groups[group][0]]:'M';while(queue.length){const [k,g]=queue.pop(),id=`${k}:${g}`;if(seen.has(id))continue;seen.add(id);nodes.push([k,g]);const t=board[k];if(!tiles.has(k)){tiles.add(k);if(type==='C')shields+=templates[t.type].shield||0;}const [x,y]=k.split(',').map(Number);for(const e of t.groups[g]){const [dx,dy]=directions[e],nk=key(x+dx,y+dy),n=board[nk];if(!n){open++;continue;}const ng=n.groups.findIndex(a=>a.includes((e+2)%4));if(ng>=0)queue.push([nk,ng]);}}if(type==='M'){const[x,y]=start.split(',').map(Number);open=0;for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++)if(!board[key(x+dx,y+dy)])open++;}const followers=nodes.filter(([k,g])=>board[k].meeple?.group===g).map(([k])=>({key:k,player:board[k].meeple.player}));return {nodes,tiles:tiles.size,type,open,shields,followers};}
export function place(s,x,y){if(s.phase!=='tile')throw Error('Primero terminá el turno');const t=tile(s.current,s.rotation);const error=placementError(s,t,x,y);if(error)throw Error(error);s.board[key(x,y)]=t;s.last=key(x,y);s.phase='meeple';
 if(s.river?.active){const entry=(s.river.direction+2)%4,exit=t.edges.findIndex((e,i)=>e==='W'&&i!==entry);if(exit<0){s.river.active=false;s.log.unshift('El lago cierra el río. Ahora se juega con las losetas de terreno.');}else{const bend=(exit-s.river.direction+4)%4;s.river.lastBend=bend;s.river.direction=exit;const[dx,dy]=directions[exit];s.river.tip=[x+dx,y+dy];}}
}
export function claim(s,group){if(s.phase!=='meeple')throw Error('No es momento de colocar un seguidor');if(!s.board[s.last].groups[group])throw Error('Zona inválida');const p=s.players[s.turn];if(!p.meeples)throw Error('No quedan seguidores');if(s.board[s.last].meeple)throw Error('Ya colocaste un seguidor');if(feature(s.board,s.last,group).followers.length)throw Error('Esta zona ya está ocupada');s.board[s.last].meeple={group,player:s.turn};p.meeples--;finishTurn(s);}
export function score(s,final=false){for(const [k,t]of Object.entries(s.board)){if(!t.meeple)continue;const f=feature(s.board,k,t.meeple.group);if(f.open&&!final)continue;const points=f.type==='M'?9-f.open:f.type==='C'?(f.tiles+f.shields)*(f.open?1:2):f.tiles;const counts=new Map();for(const m of f.followers)counts.set(m.player,(counts.get(m.player)||0)+1);const max=Math.max(...counts.values());for(const [p,n]of counts)if(n===max){s.players[p].score+=points;
const zone=f.type==='C'?'ciudad':f.type==='R'?'camino':'monasterio';
const rate=f.type==='C'&&!f.open?2:1;
const calculation=f.type==='M'?`1 punto por el monasterio + ${8-f.open} por las losetas vecinas = ${points}.`:f.type==='C'?`${f.tiles} losetas × ${rate} + ${f.shields} escudos × ${rate} = ${points}.`:`${f.tiles} losetas × 1 punto por loseta = ${points}.`;
const tied=[...counts.values()].filter(value=>value===max).length>1;
const ownership=tied?' Empate en seguidores: cada jugador empatado recibe el total.':counts.size>1?` Mayoría con ${max} seguidores.`:'';
const title=`${s.players[p].name} obtuvo ${points} ${points===1?'punto':'puntos'}`;
const detail=`${f.open?'Puntuación final de':'Completó'} ${zone==='ciudad'?'una':'un'} ${zone}. ${calculation}${ownership}`;
s.scoreEvents??=[];s.scoreEvents.push({player:p,points,title,detail});
s.log.unshift(`${title}. ${detail}`);}for(const m of f.followers){s.players[m.player].meeples++;s.board[m.key].meeple=null;}}}
export function finishTurn(s){if(s.phase!=='meeple')throw Error('Colocá una loseta primero');score(s);s.turn=(s.turn+1)%s.players.length;s.rotation=0;s.phase='tile';if(s.river?.active){while(s.riverDeck.length){s.current=s.riverDeck.pop();if([0,1,2,3].some(r=>availableSpaces(s,tile(s.current,r)).length))return;s.discarded++;s.riverDiscarded=(s.riverDiscarded||0)+1;s.log.unshift('Se descartó una loseta de río que no encaja en ninguna orientación.');}s.river.active=false;s.log.unshift('No quedan losetas de río que puedan colocarse. Continúa el mazo de terreno.');}while(s.deck.length){s.current=s.deck.pop();if([0,1,2,3].some(r=>spaces(s.board,tile(s.current,r)).length))return;s.discarded++;s.log.unshift('Se descartó una loseta sin ubicaciones posibles.');}score(s,true);s.phase='over';s.current=null;s.log.unshift('Partida terminada. Se puntuaron las zonas pendientes.');}
