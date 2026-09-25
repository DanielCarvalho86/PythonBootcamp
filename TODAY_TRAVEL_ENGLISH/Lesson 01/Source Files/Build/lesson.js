// Single source of truth for TTE Lesson 01 — used by deck, lesson plan, print materials, toolkit.
const CORE=[ // [key, article, word, category]
 ['passport','a','passport','Essentials'],['phone_charger','a','phone charger','Essentials'],
 ['tshirt','a','T-shirt','Clothes'],['shorts','','shorts','Clothes'],['trousers','','trousers','Clothes'],
 ['sweater','a','sweater','Clothes'],['jacket','a','jacket','Clothes'],['shoes','','shoes','Clothes'],['swimsuit','a','swimsuit','Clothes'],
 ['umbrella','an','umbrella','Weather items'],['raincoat','a','raincoat','Weather items'],['sunglasses','','sunglasses','Weather items'],
 ['sunscreen','','sunscreen','Weather items'],['hat','a','hat','Weather items']];
const WEATHER=[['sunny','sunny'],['rainy','rainy'],['hot','hot'],['cold','cold']];
const RECOG=[['wallet','a','wallet'],['adapter','an','adapter'],['toothbrush','a','toothbrush'],['medicine','','medicine'],['scarf','a','scarf'],['gloves','','gloves'],['sandals','','sandals']];
const RECOG_OTHER=['suitcase','backpack','carry-on','windy','snowy','religious site','dress rules'];
const SCRIPT=[
['SOFIA',"Hi, Leo! Are you ready for Madrid?"],
['LEO',"Hi, Sofia! I'm packing now. I'm going to Madrid for four days."],
['SOFIA',"Great! What are you taking?"],
['LEO',"T-shirts, shorts and sunglasses. It's hot, right?"],
['SOFIA',"It's sunny in the day. But this week it's cold at night."],
['LEO',"Really? OK. I'm not taking shorts. I'm taking trousers and a jacket."],
['SOFIA',"Good idea. And we're going to walk a lot."],
['LEO',"OK, I need good shoes. Do I need an umbrella?"],
['SOFIA',"No, you don't. It's not rainy this week."],
['LEO',"Great. I'm not taking an umbrella."],
['SOFIA',"And on Sunday, we're going to swim. There's a pool near my house."],
['LEO',"A pool! OK, I'm taking a swimsuit."],
['SOFIA',"And sunscreen!"],
['LEO',"Yes, I need sunscreen. And my passport! See you on Friday!"]];
const L2_GRID=[['shorts',false],['trousers',true],['jacket',true],['shoes',true],['umbrella',false],['swimsuit',true],['sunscreen',true],['sunglasses',true]];
const TRIPS=[
 {id:'A',city:'Lisbon',country:'Portugal',month:'April',days:3,forecast:[['sunny','22°'],['rainy','17°'],['sunny','21°']],acts:[['walk','walk a lot'],['dinner','dinner out']]},
 {id:'B',city:'Sapporo',country:'Japan',month:'February',days:3,forecast:[['snowy','−4°'],['cold','−2°'],['snowy','−5°']],acts:[['walk','walk'],['festival','visit a festival']]},
 {id:'C',city:'Bangkok',country:'Thailand',month:'August',days:3,forecast:[['rainy','33°'],['hot','34°'],['rainy','32°']],acts:[['market','go to a market'],['old_city','visit the old city']],note:'Rainy afternoons'},
 {id:'D',city:'Cape Town',country:'South Africa',month:'January',days:3,forecast:[['sunny','27°'],['windy','24°'],['sunny','28°']],acts:[['swim','swim'],['hike','hike']]}];
const TWISTS=[
 {n:1,title:'New forecast',text:'Day 3 is cold.',task:'Take 1 thing out. Put 1 thing in.'},
 {n:2,title:'Good news',text:'Your hotel has a pool.',task:'Take 1 thing out. Put 1 thing in.'},
 {n:3,title:'New plan',text:"You're visiting a religious site. Check the local dress rules.",small:'Some places ask visitors to cover their shoulders or knees. Rules are different in different places.',task:'Take 1 thing out. Put 1 thing in.'},
 {n:4,title:'Oh no!',text:'Your bag is too heavy.',task:'Take 2 things out.'}];
const WCARDS=[
 {n:1,icons:['rainy'],text:"It's rainy this week."},
 {n:2,icons:['hot','sunny'],text:"It's very hot this week."},
 {n:3,icons:['sunny','cold'],text:"It's sunny in the day. It's cold at night."},
 {n:4,icons:['cold','rainy'],text:"It's cold and rainy this week."}];
const STAGES=[ // n, name, start, end, slides
 [1,'Which bag?',0,5,'1–3'],[2,"What's on the bed?",5,14,'4–6'],[3,'Always or it depends?',14,19,'7'],
 [4,"Leo's Call (listening)",19,31,'8–11'],[5,'Decision language',31,37,'12–13'],[6,'Say it (pronunciation)',37,43,'14–15'],
 [7,'Change the weather',43,50,'16'],[8,'One bag, ten things (signature task)',50,66,'17–20'],[9,'Travel Note: it depends',66,70,'21'],
 [10,'My Travel Bag (final production)',70,86,'22–24'],[11,'Feedback, Can-do check, Toolkit',86,90,'25–28']];
const TOOLKIT={
 phrases:["I'm going to Lisbon for three days.","I need a jacket.  /  I need sunscreen.","I'm taking a sweater.","I'm not taking shorts.","It's cold at night.  /  It's rainy this week.","My bag is full."],
 questions:["Where are you going?","How many days?","What's the weather like?","Do I need an umbrella?","Are you taking a jacket?"],
 answers:["Yes, you do.  /  No, you don't.","Yes, I am.  /  No, I'm not.","Yes, I do.  /  No, I don't.","OK, good idea!  /  Hmm, I'm not sure.","No, thanks. I have a sweater."],
 checker:["Are you taking a hat?","Do you need sunscreen?","You need a jacket. It's cold at night.","You don't need shorts.","Take a raincoat, not an umbrella."],
 repair:["Sorry?","Can you repeat that, please?","Slowly, please.","What's this in English?"]};
module.exports={CORE,WEATHER,RECOG,RECOG_OTHER,SCRIPT,L2_GRID,TRIPS,TWISTS,WCARDS,STAGES,TOOLKIT};
