// A Typical Day — icon set in the Today icon style: 48 grid, thin navy stroke, rounded ends, one orange accent
const N='#0B1440',O='#F44904';
const o=(d)=>`<g stroke="${O}">${d}</g>`;
const I={
get_up:`<circle cx="24" cy="26" r="13"/><path d="M8.5 14.5a6 6 0 0 1 8-6.5M39.5 14.5a6 6 0 0 0-8-6.5M14 38l-3 4M34 38l3 4"/>${o('<path d="M24 26v-8M24 26l5 3"/>')}`,
have_breakfast:`<path d="M9.5 27c-2.5-6.5 2.5-13 9.5-11.5 4.5-5.5 14.5-3.5 15.5 3.5 6.5 2 7 11.5.5 14-2 5.5-11.5 7-15.5 3-6 2-12-2-10-9Z"/>${o('<circle cx="23" cy="25" r="4.5" fill="'+O+'"/>')}`,
go_to_work:`<path d="M7 31v-5l5-8h19l6 8h4v5ZM13 18l-2 8h28"/>${o('<circle cx="14" cy="32" r="3.5"/><circle cx="34" cy="32" r="3.5"/>')}`,
start_work:`<rect x="7" y="16" width="34" height="23" rx="2"/><path d="M18 16v-4h12v4M7 25h34"/>${o('<path d="M21 25v4h6v-4"/>')}`,
have_lunch:`<circle cx="25" cy="25" r="11"/><path d="M8 7v9a3 3 0 0 0 3 3v23M5 7v7M11 7v7M42 42V7c-3.5 3-4.5 8-4.5 14 0 2 2 3 4.5 3"/>${o('<circle cx="25" cy="25" r="5"/>')}`,
take_a_break:`<path d="M10 20h22v9a9 9 0 0 1-9 9h-4a9 9 0 0 1-9-9ZM32 23h3a4.5 4.5 0 0 1 0 9h-3M8 42h28"/>${o('<path d="M17 8c-2 3 2 5 0 8M24 8c-2 3 2 5 0 8"/>')}`,
finish_work:`<path d="M28 13V7H9v35h19v-6"/>${o('<path d="M20 24.5h21M35 18.5l6 6-6 6"/>')}`,
go_home:`<path d="M7 22 24 8l17 14M11 19v23h26V19"/>${o('<path d="M20 42V31h8v11"/>')}`,
watch_tv:`<rect x="5" y="9" width="38" height="25" rx="2"/><path d="M17 42h14M24 34v8"/>${o('<path d="M21 16.5v10l8-5Z"/>')}`,
go_to_bed:`<path d="M6 16v26M6 34h36v8M42 34v-7a4 4 0 0 0-4-4H20v11"/><rect x="9" y="26" width="8" height="5" rx="1"/>${o('<path d="M36 5a6.5 6.5 0 1 0 7.5 8 5.5 5.5 0 0 1-7.5-8Z"/>')}`,
clinic:`<path d="M7 42V19L24 9l17 10v23ZM4 42h40"/><path d="M20 42v-9h8v9"/>${o('<path d="M24 16v9M19.5 20.5h9"/>')}`,
hospital:`<rect x="9" y="7" width="30" height="35"/><path d="M4 42h40M20 42v-8h8v8"/>${o('<path d="M19 13v10M29 13v10M19 18h10"/>')}`,
see_patients:`<circle cx="15" cy="15" r="5"/><path d="M6 38l2.5-12h13L24 38Z"/>${o('<circle cx="34" cy="15" r="5"/><path d="M25 38l2.5-12h13L43 38Z"/>')}`,
examine:`<path d="M12 6v10a8 8 0 0 0 16 0V6M9 6h6M25 6h6M20 24v6a8 8 0 0 0 16 0v-3.5"/>${o('<circle cx="36" cy="22.5" r="4"/>')}`,
check_patient:`<rect x="5" y="9" width="38" height="30" rx="2"/>${o('<path d="M9 25h8l3-8 5 15 3-7h11"/>')}`,
records:`<rect x="11" y="8" width="26" height="34" rx="1.5"/><rect x="18" y="5" width="12" height="6" rx="1"/><path d="M17 33h9"/>${o('<path d="M17 20h14M17 26.5h14"/>')}`,
appointments:`<rect x="7" y="11" width="34" height="30" rx="2"/><path d="M15 7v8M33 7v8M7 20h34"/>${o('<rect x="27" y="28" width="7" height="6" fill="'+O+'"/>')}`,
weekends:`<rect x="7" y="11" width="34" height="30" rx="2"/><path d="M15 7v8M33 7v8M7 20h34M14 27h3M21 27h3M14 34h3M21 34h3"/>${o('<rect x="28" y="25.5" width="3" height="3" fill="'+O+'"/><rect x="35" y="25.5" width="3" height="3" fill="'+O+'"/><rect x="28" y="32.5" width="3" height="3" fill="'+O+'"/><rect x="35" y="32.5" width="3" height="3" fill="'+O+'"/>')}`,
};
function svg(n,{size=48,stroke=N,accent=O}={}){let b=I[n];if(stroke!==N)b=b.split(N).join(stroke);if(accent!==O)b=b.split(O).join(accent);
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="${size}" height="${size}"><g fill="none" stroke="${stroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${b}</g></svg>`;}
module.exports={I,svg};
