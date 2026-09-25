// TODAY TRAVEL ENGLISH · L01 icon set — 48-unit grid, 2.5 stroke, round caps/joins (Today icon DNA)
const N='#0B1440', O='#F44904';
const I={
passport:`<rect x="12" y="6" width="24" height="36" rx="3"/><circle cx="24" cy="20" r="6"/><path d="M18 20h12M24 14c-2.4 3.6-2.4 8.4 0 12M24 14c2.4 3.6 2.4 8.4 0 12"/><path d="M18 33h12"/>`,
phone_charger:`<rect x="14" y="10" width="20" height="15" rx="3"/><path d="M20 4v6M28 4v6M24 25v4c0 5 7 4 7 9v2"/><rect x="28" y="40" width="6" height="4" rx="1"/>`,
tshirt:`<path d="M17.5 8 10 11.5 5 20l6 3.5 3-3.5V40h20V20l3 3.5 6-3.5-5-8.5L30.5 8c-1.2 3-3.8 5-6.5 5s-5.3-2-6.5-5Z"/>`,
shorts:`<path d="M12 9h24l4 29H28.5L24 22l-4.5 16H8Z"/><path d="M12.6 14.5h22.8"/>`,
trousers:`<path d="M14 6h20l3.5 36h-9.5L24 17l-4 25h-9.5Z"/><path d="M14.4 11h19.2"/>`,
sweater:`<path d="M17 8c1.8 2.6 4.3 4 7 4s5.2-1.4 7-4l7 3 4 25h-6l-2-13v17H14V23l-2 13H6l4-25Z"/><path d="M14 35.5h20M6.5 32.5h5.8M35.7 32.5h5.8"/>`,
jacket:`<path d="M17 7 10 10 7 38h6l1-14v18h20V24l1 14h6l-3-28-7-3-7 7Z"/><path d="M24 14v28M17 7l3 9M31 7l-3 9M17 31h3.5M27.5 31H31"/>`,
shoes:`<path d="M6 34v-12c0-2 2-3.2 4-2.4l6 2.4c2-4 5.5-6 8.5-6l2.5 1c2 5 6 9 12.5 10 2.6.4 3.5 2 3.5 4v3c0 1.4-1 2.5-2.5 2.5H8c-1.2 0-2-.8-2-2Z"/><path d="M6 31h37M19 20.5l3 2.5M22.5 18l3 2.5"/>`,
swimsuit:`<path d="M16.5 5v8.5c0 3.5-2.5 5.5-2.5 9.5v7c3.8 1.2 6.3 4.6 7.2 10h5.6c.9-5.4 3.4-8.8 7.2-10v-7c0-4-2.5-6-2.5-9.5V5"/><path d="M16.5 13.5c3.6 4.6 11.4 4.6 15 0"/>`,
umbrella:`<path d="M6 24C6 14.5 14 7 24 7s18 7.5 18 17c-3-2.5-6-2.5-9 0-3-2.5-6-2.5-9 0-3-2.5-6-2.5-9 0-3-2.5-6-2.5-9 0Z"/><path d="M24 4v3M24 24v12a3.2 3.2 0 0 1-6.4 0"/>`,
raincoat:`<path d="M17 13c0-5 3-9 7-9s7 4 7 9"/><path d="M17 13l-7 4-2 23h6l1-13v15h18V27l1 13h6l-2-23-7-4c-1 3-4 4.5-7 4.5S18 16 17 13Z"/><circle cx="24" cy="25" r=".6"/><circle cx="24" cy="32" r=".6"/><path d="M40 4.5c0 0-2.2 2.8-2.2 4.2a2.2 2.2 0 0 0 4.4 0c0-1.4-2.2-4.2-2.2-4.2Z"/>`,
sunglasses:`<path d="M5 20h16v4c0 4.5-3.2 7-7 7h-2c-3.8 0-7-2.5-7-7Z"/><path d="M27 20h16v4c0 4.5-3.2 7-7 7h-2c-3.8 0-7-2.5-7-7Z"/><path d="M21 22c1.8-1.6 4.2-1.6 6 0M5 20l-2-3M43 20l2-3"/>`,
sunscreen:`<path d="M15 6h18M16.5 9h15L29 34H19Z"/><rect x="19" y="34" width="10" height="8" rx="1.5"/><circle cx="24" cy="19.5" r="3"/><path d="M24 12.8v1.2M24 25v1.2M17.3 19.5h1.2M29.5 19.5h1.2"/>`,
hat:`<path d="M13 27c0-9 4.5-15 11-15s11 6 11 15"/><path d="M4 30c4.5-2.5 11.5-3.5 20-3.5s15.5 1 20 3.5c-4.5 2.5-11.5 3.5-20 3.5S8.5 32.5 4 30Z"/><path d="M13.3 22.5h21.4"/>`,
// weather
sunny:`<circle cx="24" cy="24" r="8"/><path d="M24 5v4M24 39v4M5 24h4M39 24h4M10.6 10.6l2.8 2.8M34.6 34.6l2.8 2.8M10.6 37.4l2.8-2.8M34.6 13.4l2.8-2.8"/>`,
rainy:`<path d="M14 29h20.5a7 7 0 0 0 .6-14 11 11 0 0 0-20.8 2.2A6 6 0 0 0 14 29Z"/><path d="M17 34l-2 5M25 34l-2 5M33 34l-2 5"/>`,
hot:`<path d="M20 29.5V10a4 4 0 0 1 8 0v19.5a7.5 7.5 0 1 1-8 0Z"/><path stroke="${O}" d="M24 34V12"/><circle cx="24" cy="35.5" r="3" fill="${O}" stroke="${O}"/><path d="M34 10c2 1.5 2 3.5 0 5s-2 3.5 0 5M39 10c2 1.5 2 3.5 0 5s-2 3.5 0 5"/>`,
cold:`<path d="M20 29.5V10a4 4 0 0 1 8 0v19.5a7.5 7.5 0 1 1-8 0Z"/><path d="M24 34v-6"/><circle cx="24" cy="35.5" r="3" fill="${N}"/><path d="M38 7v12M32.8 10l10.4 6M32.8 16l10.4-6"/>`,
check:`<path d="M9 25l9.5 9.5L39 14"/>`,
cross:`<path d="M13 13l22 22M35 13 13 35"/>`,
// recognition
windy:`<path d="M6 18h22a5 5 0 1 0-5-5M6 26h30a5 5 0 1 1-5 5M6 34h14"/>`,
snowy:`<path d="M24 6v36M8.4 15l31.2 18M8.4 33l31.2-18M20 8l4 4 4-4M20 40l4-4 4 4"/>`,
wallet:`<rect x="6" y="12" width="36" height="26" rx="3"/><path d="M42 20H32a4.5 4.5 0 0 0 0 9h10M10 12l18-6 3 6"/><circle cx="32" cy="24.5" r=".6"/>`,
adapter:`<rect x="12" y="14" width="24" height="20" rx="3"/><path d="M19 8v6M29 8v6M24 34v6M20 40h8"/><circle cx="20" cy="24" r="1"/><circle cx="28" cy="24" r="1"/>`,
toothbrush:`<path d="M10 40 32 18"/><rect x="29" y="8" width="7" height="14" rx="2" transform="rotate(45 32.5 15)"/><path d="M33 7.5l-2 2M36.5 11l-2 2M40 14.5l-2 2"/>`,
medicine:`<rect x="10" y="17" width="28" height="14" rx="7" transform="rotate(-35 24 24)"/><path d="M20 18.3l8 11.4"/>`,
scarf:`<path d="M12 10c4 3 20 3 24 0l-2 9c-3 2-17 2-20 0Z"/><path d="M16 19l-2 23h8l1-21M30 20l-3 18"/>`,
gloves:`<path d="M14 42V26l-5-7c-1-1.6 1-3.5 2.6-2.2L15 20V9a2 2 0 0 1 4 0v8V6a2 2 0 0 1 4 0v11V8a2 2 0 0 1 4 0v10-5a2 2 0 0 1 4 0v14c0 6-2 10-4 15Z"/><path d="M14 36h13"/>`,
sandals:`<path d="M10 40c-3 0-4-3-4-6V14c0-5 3-8 7-8s7 3 7 8v20c0 3-1 6-4 6Z"/><path d="M6 18c4-2 10-2 14 0M13 18v-4"/><path d="M32 40c-3 0-4-3-4-6V14c0-5 3-8 7-8s7 3 7 8v20c0 3-1 6-4 6Z"/><path d="M28 18c4-2 10-2 14 0M35 18v-4"/>`,
suitcase:`<rect x="10" y="12" width="28" height="28" rx="3"/><path d="M19 12V7h10v5M17 12v28M31 12v28M14 40v3M34 40v3"/>`,
backpack:`<path d="M12 40V20c0-6 5-10 12-10s12 4 12 10v20c0 1.2-.8 2-2 2H14c-1.2 0-2-.8-2-2Z"/><path d="M19 10V7c0-1.2.8-2 2-2h6c1.2 0 2 .8 2 2v3M17 42V30h14v12M12 24h24"/>`,
// activities
walk:`<circle cx="26" cy="7" r="3"/><path d="M24 13l-4 12 6 6 2 11M20 25l-4 17M23 16l-6 5v6M25 16l5 6 5 1"/>`,
swim:`<circle cx="31" cy="15" r="3"/><path d="M6 33c3-2.5 6-2.5 9 0s6 2.5 9 0 6-2.5 9 0 6 2.5 9 0M6 41c3-2.5 6-2.5 9 0s6 2.5 9 0 6-2.5 9 0 6 2.5 9 0M12 27l9-7 5 4 6-3"/>`,
hike:`<path d="M4 40 17 18l7 10 5-7 15 19Z"/><path d="M13.5 24l3.5-2 3 3"/>`,
museum:`<path d="M6 17 24 7l18 10ZM8 40h32M6 44h36M12 21v15M20 21v15M28 21v15M36 21v15"/>`,
dinner:`<path d="M14 6v10a4 4 0 0 0 8 0V6M18 6v36M32 42V6c-4 3-6 8-6 14 0 3 2 4 6 4"/>`,
market:`<path d="M6 16 10 6h28l4 10ZM6 16c0 3 2.5 4.5 4.5 4.5S15 19 15 16c0 3 2.5 4.5 4.5 4.5S24 19 24 16c0 3 2.5 4.5 4.5 4.5S33 19 33 16c0 3 2.5 4.5 4.5 4.5S42 19 42 16M9 21v21h30V21M19 42V30h10v12"/>`,
festival:`<path d="M24 4v5M17 9h14M17 39h14M24 39v5"/><path d="M17 9c-5 4-7 9-7 15s2 11 7 15h14c5-4 7-9 7-15s-2-11-7-15Z"/><path d="M24 9c-3 4-4 9-4 15s1 11 4 15c3-4 4-9 4-15s-1-11-4-15Z"/>`,
old_city:`<path d="M4 42h40M8 42V22l6-5 6 5v20M20 42V14l4-8 4 8v28M28 42V26h12v16M12 30h4M24 20v4M32 32h4"/>`,
};
function svg(name,{stroke=N,size=48,opacity=1}={}){
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="${size}" height="${size}"><g fill="none" stroke="${stroke}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" opacity="${opacity}">${I[name]}</g></svg>`;
}
module.exports={I,svg,N,O};
