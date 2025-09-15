const fs = require('fs');
const src = fs.readFileSync('public/embed.js','utf8');
let bal=0, extras=[]; let inS=false,inD=false,inB=false,inLC=false,inML=false, prev='';
let line=1,col=0;
for (let i=0;i<src.length;i++){
  const ch=src[i], next=src[i+1];
  if (ch==='\n'){ line++; col=0; inLC=false; continue } else col++;
  if (inLC) continue;
  if (inML){ if (ch==='*'&&next=== '/') {inML=false; i++; col++;} continue }
  if (!inS && !inD && !inB){
    if (ch==='/'&&next==='/' ){ inLC=true; i++; col++; continue }
    if (ch==='/'&&next==='*' ){ inML=true; i++; col++; continue }
    if (ch==="'") { inS=true; continue }
    if (ch==='"') { inD=true; continue }
    if (ch==='`') { inB=true; continue }
    if (ch==='('){ bal++; continue }
    if (ch===')'){ if (bal===0) extras.push({line,col}); else bal--; continue }
  } else {
    if (inS && ch==="'" && prev!=='\\') inS=false;
    if (inD && ch==='"' && prev!=='\\') inD=false;
    if (inB && ch==='`' && prev!=='\\') inB=false;
  }
  prev=ch;
}
console.log('extra_count', extras.length, 'final_balance', bal);
extras.forEach(e=>console.log('extra ) at line', e.line, 'col', e.col));