import {CATALOG,TYPES} from './burger-data.js';
const need=(ok,msg)=>{if(!ok)throw Error(msg);};
const int=(n,a,b)=>Number.isInteger(n)&&n>=a&&n<=b;
export function validateCatalog(c){
 need(c?.complete===true,'El catálogo completo todavía no está verificado.');
 need(c.cards?.length===72&&c.orders?.length===21,'Se requieren 72 cartas físicas y 21 pedidos.');
 need(new Set(c.cards.map(x=>x.id)).size===72&&new Set(c.orders.map(x=>x.id)).size===21,'Identificadores duplicados.');
 for(const x of c.cards){need(typeof x.id==='string'&&x.sides?.length===2,'Carta incompleta.');for(const s of x.sides)need(typeof s.name==='string'&&TYPES[s.type]&&(s.next==='any'||TYPES[s.next])&&Array.isArray(s.tags)&&(s.type!=='bun'||s.next==='any'),'Mitad inválida.');}
 for(const o of c.orders){need(Array.isArray(o.checks)&&o.checks.length>0,'Pedido sin requisitos.');for(const q of o.checks)need(['name','tag','without','distinct','top','equal'].includes(q.kind),'Requisito desconocido.');}
 return true;
}
function rand(s){s.rng=(Math.imul(s.rng,1664525)+1013904223)>>>0;return s.rng/4294967296;}
function shuffle(s,values){const a=[...values];for(let i=a.length-1;i>0;i--){const j=Math.floor(rand(s)*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function draw(s){if(!s.deck.length&&s.discard.length){s.deck=shuffle(s,s.discard);s.discard=[];}return s.deck.pop()??null;}
function refill(s){for(let i=0;i<3;i++)if(s.market[i]===null)s.market[i]=draw(s);}
function log(s,text){s.log.push(text);s.log=s.log.slice(-60);}
export function createGame(names,{catalog=CATALOG,seed=Date.now(),first=0}={}){
 validateCatalog(catalog);need(Array.isArray(names)&&int(names.length,2,4),'Burger Up requiere 2–4 jugadores.');need(names.every(n=>typeof n==='string'&&n.trim().length>0&&n.trim().length<=24),'Nombre inválido.');need(int(first,0,names.length-1),'Primer jugador inválido.');
 const s={version:1,catalogId:catalog.id,rng:seed>>>0,first,current:first,phase:'handoff',placed:0,ending:false,deck:[],discard:[],market:[null,null,null],orders:[],orderDeck:[],retiredOrders:[],log:[],lastScore:null,scores:null,players:names.map(name=>({name:name.trim(),coins:2,upgraded:false,spatulaUses:0,hand:[],burgers:[[],[]],completed:[],turns:0}))};
 s.deck=shuffle(s,catalog.cards.map(x=>x.id));const orders=shuffle(s,catalog.orders.map(x=>x.id)),n={2:12,3:14,4:18}[names.length];s.orderDeck=orders.slice(0,n);s.retiredOrders=orders.slice(n);
 for(let i=0;i<3;i++)s.orders.push({id:s.orderDeck.pop(),coins:1});refill(s);for(const p of s.players)for(let i=0;i<4;i++)p.hand.push(draw(s));return s;
}
export function ingredient(p,c=CATALOG){const card=c.cards.find(x=>x.id===p?.id);need(card&&int(p.side,0,1),'Carta u orientación desconocida.');return card.sides[p.side];}
export function placementError(stack,p,c=CATALOG){const item=ingredient(p,c);if(!stack.length||item.type==='bun')return '';const next=ingredient(stack.at(-1),c).next;return next==='any'||next===item.type?'':`Necesitás ${TYPES[next].name.toLowerCase()}.`;}
export function burgerInfo(stack,c=CATALOG){const items=stack.map(x=>ingredient(x,c)),count=items.filter(x=>x.type!=='bun').length;return {items,count,tier:count<1?'Vacía':count<4?'Sándwich':count<7?'Gourmet':count<10?'Torre':'Colosal',reward:count<1?0:count<4?1:count<7?3:count<10?5:10,perfect:items.filter(x=>x.type!=='bun'&&x.perfect).length};}
export function requirements(stack,o,c=CATALOG){
 need(o&&Array.isArray(o.checks),'Pedido desconocido.');const {items,count}=burgerInfo(stack,c),r=[{text:'Al menos un ingrediente, sin contar panes',ok:count>0}],tag=t=>items.filter(x=>x.tags.includes(t));
 if(o.min)r.push({text:`Al menos ${o.min} ingredientes`,ok:count>=o.min});if(o.max)r.push({text:`Hasta ${o.max} ingredientes`,ok:count<=o.max});
 for(const q of o.checks){let text='',ok=false;switch(q.kind){
 case'name':text=q.value;ok=items.some(x=>x.name===q.value);break;
 case'tag':text=`${q.count} o más: ${q.value}`;ok=tag(q.value).length>=q.count;break;
 case'without':text=`Sin ${q.value}`;ok=tag(q.value).length===0;break;
 case'distinct':text=`${q.count} diferentes: ${q.value}`;ok=new Set(tag(q.value).map(x=>x.name)).size>=q.count;break;
 case'top':text=`${q.value} arriba de todo`;ok=items.at(-1)?.name===q.value;break;
 case'equal':{text=`Igual cantidad: ${q.values.join(', ')}`;const counts=q.values.map(t=>tag(t).length);ok=counts.every(n=>n===counts[0]);break;}
 default:throw Error('Requisito no implementado.');}r.push({text,ok});}return r;
}
export function finalScores(s){const most=Math.max(...s.players.map(p=>p.completed.length)),unique=s.players.filter(p=>p.completed.length===most).length===1;return s.players.map(p=>{const spatula=4-2*p.spatulaUses,bonus=unique&&p.completed.length===most?5:0;return {coins:p.coins,spatula,bonus,total:p.coins+spatula+bonus};});}
function cleanup(s){s.phase='cleanup';refill(s);}
export function act(original,a,c=CATALOG){
 need(original.version===1&&original.catalogId===c.id,'Guardado incompatible.');need(original.phase!=='over','La partida terminó.');const s=structuredClone(original),p=s.players[s.current];
 const phase=v=>need(s.phase===v,'Acción fuera de fase.'),burger=i=>{need(int(i,0,1),'Elegí una de tus hamburguesas.');return p.burgers[i];};s.lastScore=null;
 switch(a.type){
 case'ready':phase('handoff');s.phase='market';break;
 case'buy':{phase('market');need(int(a.index,0,2),'Espacio inválido.');const id=s.market[a.index];need(id!==null,'Espacio vacío.');need(p.coins>=1,'Necesitás $1.');p.coins--;p.hand.push(id);s.market[a.index]=null;break;}
 case'advance':if(s.phase==='market')s.phase='build';else if(s.phase==='build')s.phase='score';else if(s.phase==='score')cleanup(s);else throw Error('No podés avanzar desde esta fase.');break;
 case'place':{phase('build');need(s.placed<(p.upgraded?4:3),'Ya usaste las colocaciones de este turno.');const stack=burger(a.burger),index=p.hand.indexOf(a.id),v={id:a.id,side:a.side};need(index>=0,'La carta no está en tu mano.');const error=placementError(stack,v,c);need(!error,error);stack.push(v);p.hand.splice(index,1);s.placed++;break;}
 case'spatula':{phase('build');need(p.spatulaUses<2,'Espátula agotada.');const source=burger(a.burger);need(int(a.start,0,source.length-1),'Punto de corte inválido.');need(a.target==='discard'||int(a.target,0,1)&&a.target!==a.burger,'Elegí la otra hamburguesa o el descarte.');const block=source.slice(a.start);if(a.target==='discard')s.discard.push(...block.map(x=>x.id));else{const target=burger(a.target),error=placementError(target,block[0],c);need(!error,error);target.push(...block);}source.splice(a.start);p.spatulaUses++;log(s,`${p.name} usa la espátula (${p.spatulaUses}/2).`);break;}
 case'score':{phase('score');const stack=burger(a.burger),index=s.orders.findIndex(x=>x.id===a.order);need(index>=0,'Pedido no disponible.');const pending=s.orders[index],o=c.orders.find(x=>x.id===pending.id),missing=requirements(stack,o,c).filter(x=>!x.ok);need(!missing.length,missing.map(x=>x.text).join(' · '));const info=burgerInfo(stack,c);need(['coins','upgrade'].includes(a.reward),'Elegí la recompensa.');if(a.reward==='upgrade')need(info.count>=10&&!p.upgraded,'La mejora requiere una Colosal y no haber mejorado antes.');const size=a.reward==='coins'?info.reward:0,earned=size+pending.coins+info.perfect;if(a.reward==='upgrade')p.upgraded=true;p.coins+=earned;p.completed.push(pending.id);s.discard.push(...stack.map(x=>x.id));p.burgers[a.burger]=[];s.orders.splice(index,1);const next=s.orderDeck.pop();if(next)s.orders.splice(index,0,{id:next,coins:0});else s.ending=true;for(const x of s.orders)x.coins++;s.lastScore={player:s.current,earned,size,waiting:pending.coins,perfect:info.perfect,upgrade:a.reward==='upgrade',order:o.name};log(s,`${p.name}: +$${earned}. Tamaño $${size} + pedido $${pending.coins} + perfectos $${info.perfect}${a.reward==='upgrade'?' y mejora':''}.`);cleanup(s);break;}
 case'cleanup':{phase('cleanup');const ids=a.discard??[];need(Array.isArray(ids)&&new Set(ids).size===ids.length&&ids.every(id=>p.hand.includes(id)),'Descarte inválido.');need(p.hand.length-ids.length<=4,'Descartá hasta tener cuatro cartas como máximo.');for(const id of ids){p.hand.splice(p.hand.indexOf(id),1);s.discard.push(id);}while(p.hand.length<4){const id=draw(s);if(id===null)break;p.hand.push(id);}p.turns++;const next=(s.current+1)%s.players.length;if(s.ending&&next===s.first){s.phase='over';s.scores=finalScores(s);}else{s.current=next;s.phase='handoff';s.placed=0;}break;}
 default:throw Error('Acción desconocida.');}return s;
}
export function validateSave(s,c=CATALOG){validateCatalog(c);need(s?.version===1&&s.catalogId===c.id&&int(s.players?.length,2,4),'Guardado incompatible.');need(int(s.current,0,s.players.length-1)&&int(s.first,0,s.players.length-1),'Turno inválido.');need(['handoff','market','build','score','cleanup','over'].includes(s.phase),'Fase inválida.');const ids=[...s.deck,...s.discard,...s.market.filter(id=>id!==null)];for(const p of s.players){need(Number.isSafeInteger(p.coins)&&p.coins>=0&&int(p.spatulaUses,0,2)&&p.burgers.length===2,'Jugador inválido.');ids.push(...p.hand);for(const stack of p.burgers)for(let i=0;i<stack.length;i++){need(!placementError(stack.slice(0,i),stack[i],c),'Colocación inválida.');ids.push(stack[i].id);}}need(ids.length===72&&new Set(ids).size===72&&ids.every(id=>c.cards.some(x=>x.id===id)),'Cartas perdidas o duplicadas.');const orders=[...s.orderDeck,...s.retiredOrders,...s.orders.map(o=>o.id),...s.players.flatMap(p=>p.completed)];need(orders.length===21&&new Set(orders).size===21&&orders.every(id=>c.orders.some(x=>x.id===id)),'Pedidos perdidos o duplicados.');return true;}
