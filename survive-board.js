// 2024 board, checked against the rulebook and the licensed BGA board image.
// Offset rows, pointy hexagons. Each corner refuge occupies three grid positions.
// These are equivalent entry cells: entering any of them immediately rescues a person.
export const key=(r,c)=>`${r}:${c}`;
export const SERPENT_STARTS=['1:1','2:10','6:5','10:0','11:10'];
export function createBoard(){
 const cells={};
 for(let r=0;r<13;r++)for(let c=0;c<(r%2?12:11);c++){
  const id=key(r,c);cells[id]={id,r,c,x:c+(r%2?0:.5),y:r,terrain:'water',neighbors:[]};
 }
 for(const a of Object.values(cells))a.neighbors=Object.values(cells).filter(b=>a!==b&&(a.r===b.r&&Math.abs(a.x-b.x)===1||Math.abs(a.r-b.r)===1&&Math.abs(a.x-b.x)===.5)).map(b=>b.id);
 for(const id of ['0:0','0:1','1:0','0:9','0:10','1:11','12:0','12:1','11:0','12:9','12:10','11:11'])cells[id].terrain='rescue';
 const rows={3:[4,5,6,7],4:[3,4,5,6,7],5:[2,3,4,5,6,7,8,9],6:[2,3,4,6,7,8],7:[2,3,4,5,6,7,8,9],8:[3,4,5,6,7],9:[4,5,6,7]};
 for(const [r,cols] of Object.entries(rows))for(const c of cols)cells[key(r,c)].island=true;
 return cells;
}
export const cellName=id=>{const [r,c]=id.split(':').map(Number);return `${String.fromCharCode(65+r)}${c+1}`;};
