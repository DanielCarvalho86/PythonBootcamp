const sharp=require('sharp');const fs=require('fs');const {I,svg,N}=require('./icons');
const L=process.argv[2];
(async()=>{for(const n of Object.keys(I)){
 const nm='TTE_L01_icon_'+n.replace('_','-');
 fs.writeFileSync(`${L}/Images/Icons/SVG/${nm}.svg`,svg(n,{size:480}));
 await sharp(Buffer.from(svg(n,{size:512})),{density:400}).resize(512,512).png().toFile(`${L}/Images/Icons/PNG/${nm}_navy.png`);
 await sharp(Buffer.from(svg(n,{size:512,stroke:'#FAF7F2'})),{density:400}).resize(512,512).png().toFile(`${L}/Images/Icons/PNG/${nm}_paper.png`);
}})();
