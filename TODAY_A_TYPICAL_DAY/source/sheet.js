const sharp=require('sharp');const {I,svg}=require('./icons');
(async()=>{const names=Object.keys(I);const cell=200,cols=6,rows=Math.ceil(names.length/cols);const comps=[];
for(let k=0;k<names.length;k++){const b=await sharp(Buffer.from(svg(names[k],{size:130})),{density:300}).resize(130,130).png().toBuffer();
comps.push({input:b,left:(k%cols)*cell+35,top:Math.floor(k/cols)*cell+15});
comps.push({input:Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${cell}" height="30"><text x="${cell/2}" y="20" font-family="JetBrains Mono" font-size="14" text-anchor="middle" fill="#0B1440">${names[k]}</text></svg>`),left:(k%cols)*cell,top:Math.floor(k/cols)*cell+160});}
await sharp({create:{width:cols*cell,height:rows*cell,channels:3,background:'#F3EFE6'}}).composite(comps).png().toFile('/tmp/td/icon_sheet.png');})();
