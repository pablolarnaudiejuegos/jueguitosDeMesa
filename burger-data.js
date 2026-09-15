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
