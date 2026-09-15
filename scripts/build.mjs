import {mkdir,copyFile,cp} from 'node:fs/promises';
const files=['burger.html','burger.js','burger.css','burger-data.js','burger-engine.js','index.html','carcassonne.html','bonsai.html','naturalis.html','profile.html','app.js','bonsai.js','naturalis.js','engine.js','bonsai-engine.js','naturalis-engine.js','naturalis-data.js','accounts.js','bots.js','style.css','bonsai.css','naturalis.css','accounts.css'];
await mkdir('public',{recursive:true});
for(const file of files)await copyFile(file,'public/'+file);
await cp('assets','public/assets',{recursive:true});
console.log('Static build ready; private account data is excluded.');
