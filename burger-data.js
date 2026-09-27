export const RULEBOOK='https://c.tabletopia.com/games/burger-up/rules/burgerup-rulebook-v2-20161208/en';
export const TYPES={meat:{name:'Carne y medallones',icon:'●',color:'#805636'},salad:{name:'Vegetales',icon:'❧',color:'#4f7746'},cheese:{name:'Queso y huevo',icon:'◆',color:'#b48318'},sauce:{name:'Salsas',icon:'♦',color:'#b64835'},bun:{name:'Pan comodín',icon:'✦',color:'#846386'}};
// These three physical card examples are visible on page 1 of the v2 rules.
// They are NOT a reconstructed deck and do not establish copy counts.
export const EXAMPLES=[
 {id:'example-meat',sides:[{name:'Beef Patty',label:'Medallón de carne',type:'meat',tags:['Meat','Patty'],next:'meat'},{name:'Grilled Chicken',label:'Pollo grillado',type:'meat',tags:['Meat','Patty'],next:'meat'}]},
 {id:'example-pepper',sides:[{name:'Roasted Pepper',label:'Morrón asado',type:'salad',tags:['Salad'],perfect:true,next:'sauce'},{name:'Mustard',label:'Mostaza',type:'sauce',tags:['Sauce'],next:'salad'}]},
 {id:'example-cheese',sides:[{name:'Cheddar Cheese',label:'Queso cheddar',type:'cheese',tags:['Cheese'],next:'salad'},{name:'Tomato',label:'Tomate',type:'salad',tags:['Salad'],next:'cheese'}]},
];
export const VERIFIED_ORDERS=[
 {id:'vegetarian-deluxe',name:'Vegetarian Deluxe',min:7,checks:[{kind:'tag',value:'Salad',count:2},{kind:'without',value:'Meat'}]},
 {id:'vegetarian-cowboy',name:'Vegetarian Cowboy',checks:[{kind:'name',value:'BBQ Sauce'},{kind:'name',value:'Veggie Patty'},{kind:'without',value:'Meat'}]},
 {id:'breakfast',name:'Breakfast to Go',max:3,checks:[{kind:'name',value:'Bacon'},{kind:'name',value:'Fried Egg'}]},
 {id:'chicken-avo',name:'Chicken & Avo',min:4,checks:[{kind:'name',value:'Grilled Chicken'},{kind:'name',value:'Avocado'}]},
 {id:'garden',name:'Garden Delight',checks:[{kind:'distinct',value:'Salad',count:4}]},
 {id:'even',name:'Even Stevens',checks:[{kind:'equal',values:['Meat','Sauce','Salad','Cheese']}]},
 {id:'og',name:'O.G. Cheeseburger',checks:[{kind:'name',value:'Beef Patty'},{kind:'name',value:'Pickles'},{kind:'tag',value:'Cheese',count:1}]},
 {id:'sunny',name:'Sunny Side Up',min:4,checks:[{kind:'top',value:'Fried Egg'}]},
 {id:'saucy',name:'Saucy Minx',checks:[{kind:'distinct',value:'Sauce',count:3}]},
 {id:'meat-a-saurus',name:'Meat-A-Saurus Rex',min:4,checks:[{kind:'tag',value:'Meat',count:2},{kind:'without',value:'Salad'}]},
 {id:'hawaiian',name:'Hawaiian Sunrise',min:4,checks:[{kind:'name',value:'Fried Egg'},{kind:'name',value:'Pineapple'}]},
 {id:'iron',name:'Iron Giant',min:10,checks:[{kind:'tag',value:'Patty',count:3}]},
];
export const CATALOG={id:'burger-up-v2',complete:false,cards:[],orders:VERIFIED_ORDERS};

// Original Burger Club deck. These are design choices, not a retail Burger Up inventory.
const food=(name,label,type,tags)=>({name,label,type,tags});
const foods=[food('Beef Patty','Medallón de carne','meat',['Meat','Patty']),food('Grilled Chicken','Pollo grillado','meat',['Meat']),food('Tomato','Tomate','salad',['Salad']),food('Roasted Pepper','Morrón asado','salad',['Salad']),food('Cheddar Cheese','Queso cheddar','cheese',['Cheese']),food('Mustard','Mostaza','sauce',['Sauce'])];
const types=['meat','salad','cheese','sauce'];
// Twelve two-half recipes, six physical copies of each; 72 cards total.
export const CLUB_CARDS=Array.from({length:72},(_,i)=>{const recipe=Math.floor(i/6),a=recipe%6,b=(a+1+Math.floor(recipe/6)*2)%6;return {id:`club-${i}`,sides:[{...foods[a],next:types[recipe%4],perfect:recipe===3||recipe===8},{...foods[b],next:types[(recipe+2)%4],perfect:recipe===5||recipe===10}]};});
export const CLUB_ORDERS=[
 ...[3,4,5,6,7,8,10].map((n,i)=>({id:`height-${n}`,name:['La primera ronda','Buen apetito','Doble servilleta','La de la casa','Piso siete','La torre del club','El gran desafío'][i],min:n,checks:[{kind:'minimum',count:n}]})),
 ...['Meat','Salad','Cheese','Sauce'].flatMap((value,i)=>[2,3].map(count=>({id:`type-${value}-${count}`,name:`${['Parrilla','Huerta','Quesería','Salseo'][i]} ${count===2?'doble':'triple'}`,min:count+1,checks:[{kind:'tag',value,count}]}))),
 {id:'mix-a',name:'Parrilla y huerta',min:4,checks:[{kind:'tag',value:'Meat',count:2},{kind:'tag',value:'Salad',count:2}]},
 {id:'mix-b',name:'Queso con carácter',min:4,checks:[{kind:'tag',value:'Cheese',count:2},{kind:'tag',value:'Sauce',count:1}]},
 {id:'mix-c',name:'Un poco de todo',checks:types.map((_,i)=>({kind:'tag',value:['Meat','Salad','Cheese','Sauce'][i],count:1}))},
 {id:'veggie',name:'Verde que te quiero',min:4,checks:[{kind:'tag',value:'Salad',count:2},{kind:'without',value:'Meat'}]},
 {id:'perfect',name:'Selección del chef',min:4,checks:[{kind:'perfect',count:2}]},
 {id:'balanced',name:'Cuatro estaciones',checks:[{kind:'equal',values:['Meat','Salad','Cheese','Sauce']}]},
];
export const CLUB={id:'burger-club-v1',complete:true,cards:CLUB_CARDS,orders:CLUB_ORDERS,maxTurns:20};
export const CLUB_RULES='Variante propia inspirada en Burger Up. Mazo propio de 72 cartas y 21 pedidos. De 2 a 4 participantes; 20 turnos por persona como máximo. También termina al cerrar la ronda en que no se puede reponer un pedido. Se eligen 12/14/18 pedidos para 2/3/4 participantes. Cada participante empieza con $2, cuatro cartas y dos bases. Cada turno permite comprar a $1, colocar hasta 3 cartas (4 tras mejorar), vender una hamburguesa y descartar antes de robar hasta 4. La espátula permite dos movimientos de bloques durante la partida. Tamaños: 1–3=$1, 4–6=$3, 7–9=$5, 10+=$10 o mejora; sumá monedas del pedido y $1 por ingrediente perfecto. Al final: dinero + 4/2/0 por espátula + 5 por mayoría única de pedidos. Los empates finales se comparten; las hamburguesas sin vender no puntúan.';
