// ╔══════════════════════════════════════════════════════════════════╗
// ║  Record Room — VERSION 5                                ║
// ║  Date: 29 March 2026                                            ║
// ║                                                                  ║
// ║  Concept: Brand advisor without catalogue                       ║
// ║  Same intake as v4. Output is:                                  ║
// ║  1. System character + brand direction (no specific models)     ║
// ║  2. Budget guidance by category                                 ║
// ║  3. Dealer recommendations by region                            ║
// ║  4. Downloadable dealer brief PDF                               ║
// ╚══════════════════════════════════════════════════════════════════╝

import { useState, useEffect, useRef } from "react";
import * as React from "react";

function useIsMobile(breakpoint = 600) {
  const [mobile, setMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth <= breakpoint : false
  );
  useEffect(() => {
    const handler = () => setMobile(window.innerWidth <= breakpoint);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, [breakpoint]);
  return mobile;
}

const GLOBAL_CSS = `
:root {
  --paper:  #F7F2E8;
  --paper2: #EEE8D8;
  --ink:    #111008;
  --ink2:   #2A2418;
  --ink3:   #5C5444;
  --ink4:   #A89E8C;
  --rule:   #DDD5C0;
  --amber:  #C4621A;
  --red:    #8B2020;
  --green:  #2A5040;
  --serif:  'Source Serif 4', 'Libre Baskerville', Georgia, serif;
  --mono:   'JetBrains Mono', 'Courier New', monospace;
}
*, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
body { background:var(--paper); color:var(--ink); -webkit-font-smoothing:antialiased; }
::selection { background:var(--ink); color:var(--paper); }
::-webkit-scrollbar { width:3px; }
::-webkit-scrollbar-thumb { background:var(--rule); }
input[type=range] { -webkit-appearance:none; height:1px; outline:none; cursor:pointer; background:var(--rule); }
input[type=range]::-webkit-slider-thumb { -webkit-appearance:none; width:22px; height:22px; border-radius:50%; border:none; cursor:pointer; background:var(--ink); }
textarea, input[type=number] { font-family:var(--serif); font-size:15px; background:transparent; color:var(--ink); border:none; border-bottom:2px solid var(--ink); outline:none; padding:10px 0; width:100%; }
@keyframes fadeUp   { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
@keyframes fadeIn   { from{opacity:0} to{opacity:1} }
@keyframes vinylTurn{ to{transform:rotate(360deg)} }
@keyframes slideUp  { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
.fu { animation:fadeUp .4s cubic-bezier(.16,1,.3,1) both; }
.fi { animation:fadeIn .3s ease both; }
.sl { animation:slideUp .7s cubic-bezier(.16,1,.3,1) both; }
.sl1{animation-delay:.04s}.sl2{animation-delay:.1s}.sl3{animation-delay:.18s}
.sl4{animation-delay:.28s}.sl5{animation-delay:.4s}.vinyl-turn{animation:vinylTurn 6s linear infinite;}
body::before{content:'';position:fixed;inset:0;pointer-events:none;z-index:1000;opacity:.018;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
  background-repeat:repeat;background-size:200px 200px;}
`;

function useGlobalStyles() {
  useEffect(() => {
    if (document.querySelector('[data-hifi-v5]')) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,opsz,wght@0,8..60,300;0,8..60,400;0,8..60,600;1,8..60,300;1,8..60,400&family=JetBrains+Mono:wght@300;400&display=swap";
    document.head.appendChild(link);
    const style = document.createElement("style");
    style.setAttribute("data-hifi-v5","1");
    style.textContent = GLOBAL_CSS;
    document.head.appendChild(style);
  }, []);
}

// ── Constants ─────────────────────────────────────────────────────────────────

const TALLY_URL    = "https://tally.so/r/YOUR_FORM_ID";
const TIKTOK_URL   = "https://www.tiktok.com/@stevevinyl";
const SUBSTACK_URL = "https://substack.com/@stevinyl";

const LOCALES = {
  gb:{ id:"gb", flag:"🇬🇧", label:"UK",        symbol:"£", currency:"GBP" },
  us:{ id:"us", flag:"🇺🇸", label:"USA",       symbol:"$", currency:"USD" },
  eu:{ id:"eu", flag:"🇪🇺", label:"Europe",    symbol:"€", currency:"EUR" },
  au:{ id:"au", flag:"🇦🇺", label:"Australia", symbol:"A$",currency:"AUD" },
};

const GENRES = [
  { id:"classical",  label:"Classical",      emoji:"🎻", desc:"Orchestral, chamber, opera" },
  { id:"jazz",       label:"Jazz",           emoji:"🎷", desc:"From bebop to fusion" },
  { id:"rock",       label:"Rock",           emoji:"🎸", desc:"Classic rock to indie" },
  { id:"electronic", label:"Electronic",     emoji:"🎛️", desc:"Techno, ambient, electronica" },
  { id:"pop_soul",   label:"Pop & Soul",     emoji:"🎤", desc:"Pop, R&B, Motown, soul" },
  { id:"folk",       label:"Folk & Acoustic",emoji:"🪕", desc:"Singer-songwriter, acoustic" },
  { id:"world",      label:"World",          emoji:"🌍", desc:"Global roots, African, Latin" },
];

const BUILDING_TYPES = {
  apt_ground:   { id:"apt_ground",   label:"Ground Floor Flat",    riskScore:55,  isoRequired:false },
  apt_upper:    { id:"apt_upper",    label:"Upper Floor Flat",     riskScore:95,  isoRequired:true  },
  semi_detached:{ id:"semi_detached",label:"Semi-Detached House",  riskScore:35,  isoRequired:false },
  detached:     { id:"detached",     label:"Detached House",       riskScore:5,   isoRequired:false },
};

const ROOM_SIZES = [
  { id:"small",    label:"Small",     sub:"Bedroom or study",      desc:"Up to 12 m²",  dims:{length:3.5,width:3.2,height:2.4}, tierHint:"entry"  },
  { id:"medium",   label:"Medium",    sub:"Standard living room",  desc:"12–20 m²",     dims:{length:5.0,width:4.0,height:2.5}, tierHint:"mid"    },
  { id:"large",    label:"Large",     sub:"Generous living room",  desc:"20–30 m²",     dims:{length:6.0,width:5.0,height:2.6}, tierHint:"mid"    },
  { id:"openplan", label:"Open Plan", sub:"Kitchen-diner or loft", desc:"30 m²+",       dims:{length:7.5,width:5.5,height:2.8}, tierHint:"high"   },
];

// ── UK Dealers ────────────────────────────────────────────────────────────────
const DEALERS = [
  { name:"Signals",           region:"East",      city:"Ipswich",         specialism:"Naim, Linn, Rega, Harbeth. One of the UK's most respected independent dealers.", url:"https://www.signals.co.uk" },
  { name:"Cymbiosis",         region:"Midlands",  city:"Leicester",       specialism:"Linn, Naim, ATC, Kudos. Exceptional demo facilities and home trial service.", url:"https://www.cymbiosis.com" },
  { name:"Loud & Clear",      region:"Scotland",  city:"Edinburgh",       specialism:"Naim, Linn, Rega, Chord. Scotland's leading hi-fi independent.", url:"https://www.loudandclear.co.uk" },
  { name:"Moorgate Acoustics",region:"North",     city:"Sheffield",       specialism:"Naim, Harbeth, Rega, ProAc. Long-established northern specialist.", url:"https://www.moorgate-acoustics.com" },
  { name:"KJ West One",       region:"London",    city:"London W1",       specialism:"Naim, Linn, Wilson, dCS. High-end London showroom.", url:"https://www.kjwestone.co.uk" },
  { name:"Richer Sounds",     region:"Nationwide",city:"Multiple",        specialism:"Best-value mainstream hi-fi across all major brands. 50+ UK stores.", url:"https://www.richersounds.com" },
  { name:"Audio T",           region:"Nationwide",city:"Multiple",        specialism:"Rega, Naim, Cambridge, Audiolab. Knowledgeable staff across 15 stores.", url:"https://audiot.co.uk" },
  { name:"Hi-Fi Corner",      region:"Scotland",  city:"Edinburgh",       specialism:"Rega, Naim, Harbeth. Edinburgh's other specialist dealer.", url:"https://www.hificorner.co.uk" },
  { name:"Basically Sound",   region:"South",     city:"Southampton",     specialism:"Rega, Naim, PMC, ATC. Respected southern independent.", url:"https://www.basicallysound.co.uk" },
  { name:"Tom Tom Audio",     region:"London",    city:"London N10",      specialism:"Linn specialist. Deep LP12 knowledge. Home demos available.", url:"https://www.tomtomaudio.com" },
  { name:"Fanthorpes",        region:"North",     city:"Hull",            specialism:"Long-established northern dealer. Broad range across all budgets.", url:"https://www.fanthorpes.co.uk" },
  { name:"Pursuits",          region:"South West",city:"Bristol",         specialism:"Rega, Naim, Harbeth, Spendor. Convenient for Bristol Show attendees.", url:"https://www.hifi-pursuits.co.uk" },
  { name:"Acoustica",         region:"North West",city:"Chester",         specialism:"Linn, Naim, Bowers & Wilkins. Northwest's leading specialist.", url:"https://www.acoustica.org.uk" },
  { name:"Grahams Hi-Fi",     region:"London",    city:"London N1",       specialism:"Naim, Linn, ATC, Roksan. Islington's respected independent.", url:"https://www.grahams.co.uk" },
  { name:"Hifi Lounge",       region:"Midlands",  city:"Beds/Bucks",      specialism:"Home demo specialists. Naim, Linn, Wilson Benesch.", url:"https://www.hifilounge.co.uk" },
];

const REGIONS = ["London","South","South West","Midlands","East","North West","North","Scotland","Nationwide"];

// ── Brand character mapping ───────────────────────────────────────────────────
const BRAND_PROFILES = {
  turntable: {
    warm:     { brands:["Linn (LP12)","Rega (Planar series)"],           why:"Suspended-chassis or carefully tuned rigid designs. Musical, engaging, forgiving of imperfect recordings." },
    balanced: { brands:["Rega (Planar 3–8)","Roksan (Xerxes)"],         why:"Well-engineered, honest presentation. Neither analytical nor coloured. Strong across all genres." },
    detailed: { brands:["Clearaudio","Rega Planar 10","Pro-Ject (upper)"],why:"Rigid chassis, low noise floors, high resolution. Rewards well-recorded material." },
  },
  cartridge: {
    warm:     { brands:["Rega Nd series (MM)","Nagaoka MP series","Goldring 1042"],    why:"Musical and forgiving. Moving Magnet — no dedicated MC phono stage needed." },
    balanced: { brands:["Ortofon 2M series","Rega Nd9 (MM)","Ortofon Cadenza"],        why:"Even-handed across the frequency range. Both MM and MC options available." },
    detailed: { brands:["Audio-Technica VM95/ART series","Ortofon A95","Rega Aphelion"],why:"High-resolution. Moving Coil cartridges require a dedicated MC phono stage." },
  },
  phono: {
    warm:     { brands:["Rega (Fono/MM series)","Naim Stageline"],          why:"Musical phono stages that flatter the signal rather than exposing every flaw." },
    balanced: { brands:["Audiolab Solo","Rega io (built-in)","Graham Slee"],  why:"Clean, quiet, accurate. Good starting point for most systems." },
    detailed: { brands:["Rega Aura (MC)","Naim Superline","Clearaudio Trio"], why:"Reference MC stages for the most demanding cartridges." },
  },
  amplifier: {
    warm:     { brands:["Sugden (Class A)","Naim (Nait/SuperNait)","Rega (io/Brio)"], why:"Class A or carefully voiced Class A/B. Music feels alive and rhythmically engaging." },
    balanced: { brands:["Exposure","Rega (Elicit/Aethos)","Audiolab","Leema"],         why:"Honest, well-engineered amplification. Strong across all genres." },
    detailed: { brands:["Musical Fidelity","Chord Electronics","Cambridge Audio"],     why:"High power, low distortion, analytical. Reveals everything — rewards careful system matching." },
  },
  speakers: {
    warm:     { brands:["Harbeth (P3ESR, C30, 40 series)","Spendor (A/D series)","ProAc","Graham Audio (LS3/5A)"], why:"BBC monitoring heritage. Natural, fatigue-free midrange. Exceptional for voice and acoustic instruments." },
    balanced: { brands:["ProAc","PMC","Neat Acoustics","Kudos"],                                                   why:"Musical and detailed in equal measure. Strong performers across all genres." },
    detailed: { brands:["ATC (passive/active)","KEF (Reference/R series)","B&W","Focal"],                         why:"Studio monitor accuracy. Brutally honest — reward powerful amplification and careful room setup." },
  },
};

// ── Budget allocation by tier and bias ───────────────────────────────────────
function getBudgetSplit(budget, bias, roomSize) {
  if (!budget || budget === 0) return null;

  // Source pct: 0=Foundation(45%), 50=Balanced(30%), 100=Expression(20%)
  const sourcePct  = bias < 50 ? 0.45 - (bias/50)*0.15 : 0.30 - ((bias-50)/50)*0.10;
  const speakerPct = bias < 50 ? 0.25 + (bias/50)*0.05 : 0.30 + ((bias-50)/50)*0.15;
  const ampPct     = 0.25;
  const isoPct     = 0.08;
  const cablePct   = 0.05;
  // Phono is included in source budget
  const phonoPct   = sourcePct * 0.25;
  const ttPct      = sourcePct * 0.75;

  return {
    turntable: Math.round(budget * ttPct / 50) * 50,
    cartridge: Math.round(budget * ttPct * 0.25 / 50) * 50,
    phono:     Math.round(budget * phonoPct / 50) * 50,
    amplifier: Math.round(budget * ampPct / 50) * 50,
    speakers:  Math.round(budget * speakerPct / 50) * 50,
    isolation: Math.round(budget * isoPct / 50) * 50,
    cables:    Math.round(budget * cablePct / 50) * 50,
  };
}

// ── Character from bias + genres ─────────────────────────────────────────────
function getSystemCharacter(bias, genres) {
  const warmGenres = ["classical","jazz","folk"];
  const detailGenres = ["electronic","rock"];
  const genreWarmScore = genres.filter(g=>warmGenres.includes(g)).length;
  const genreDetailScore = genres.filter(g=>detailGenres.includes(g)).length;

  let charScore = bias; // 0=warm, 100=detailed
  if (genreWarmScore > genreDetailScore) charScore -= 15;
  if (genreDetailScore > genreWarmScore) charScore += 15;
  charScore = Math.max(0, Math.min(100, charScore));

  if (charScore < 35) return "warm";
  if (charScore > 65) return "detailed";
  return "balanced";
}

// ── Format currency ───────────────────────────────────────────────────────────
function fmt(n, loc) {
  if (!n || n === 0) return "—";
  return `${loc.symbol}${n.toLocaleString()}`;
}


// ── NL Room Sizes ─────────────────────────────────────────────────────────────
const NL_ROOM_SIZES = {
  small:    { dims:{length:3.5,width:3.2,height:2.4} },
  medium:   { dims:{length:5.0,width:4.0,height:2.5} },
  large:    { dims:{length:6.0,width:5.0,height:2.6} },
  openplan: { dims:{length:7.5,width:5.5,height:2.8} },
};

// ── Natural Language Input ────────────────────────────────────────────────────
function NLInput({ onResult, apiKey, localeId }) {
  const [text, setText] = React.useState("");
  const [state, setState] = React.useState("idle");
  const [parsed, setParsed] = React.useState(null);
  const loc = LOCALES[localeId] || LOCALES.gb;

  async function handleSubmit() {
    if (!text.trim() || state==="loading") return;
    setState("loading");
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{"Content-Type":"application/json","x-api-key":apiKey,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},
        body: JSON.stringify({
          model:"claude-haiku-4-5-20251001",
          max_tokens:600,
          messages:[{role:"user",content:`Extract fields from this hi-fi listening room description. Respond ONLY with valid JSON, no markdown, no backticks:
{"roomSize":"small|medium|large|openplan","buildingType":"apt_ground|apt_upper|detached|semi_detached","floorType":"carpet|wood|tile","budget":number,"genres":["classical","jazz","rock","electronic","pop_soul","folk","world"],"bias":0-100,"confidence":"high|medium|low","summary":"one sentence"}

Rules:
- roomSize: small = up to 12m² or 16x13ft, medium = 12-20m² or up to 20x16ft, large = 20-30m², openplan = 30m²+
- Dimensions may be in feet or metres — convert as needed
- budget as integer in ${loc.currency}, 0 if not mentioned
- bias: 0=Foundation/source-first/detail, 100=Expression/speakers/soundstage, 50=balanced. Infer from "warm","musical","fill the room" (high) or "detail","analytical","resolution" (low)
- buildingType: flat/apartment=apt_ground or apt_upper (upper if mentions floor/upstairs), house with neighbours=semi_detached, standalone=detached
- genres: only include if clearly mentioned
- Use null for unknown fields, not empty string

Description: "${text}"`}]
        })
      });
      const data = await res.json();
      const raw = data.content?.map(c=>c.text||"").join("") || "";
      const result = JSON.parse(raw.replace(/```json|```/g,"").trim());
      setParsed(result);
      setState("done");
    } catch(e) { setState("error"); }
  }

  if (state==="done" && parsed) return (
    <div className="fu">
      <div style={{padding:"20px",background:"var(--ink)",marginBottom:12}}>
        <div style={{fontSize:9,color:"rgba(245,242,232,.4)",letterSpacing:".18em",textTransform:"uppercase",fontFamily:"var(--mono)",marginBottom:8}}>Understood · {parsed.confidence} confidence</div>
        <p style={{fontFamily:"var(--serif)",fontSize:14,color:"var(--paper)",lineHeight:1.7,marginBottom:14}}>{parsed.summary}</p>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:14}}>
          {[{l:"Room",v:parsed.roomSize||"—"},{l:"Building",v:(parsed.buildingType||"—").replace("apt_","Flat · ").replace("semi_detached","Semi").replace("detached","Detached")},{l:"Budget",v:parsed.budget>0?`${loc.symbol}${parsed.budget.toLocaleString()}`:"—"},{l:"Bias",v:parsed.bias!=null?(parsed.bias<35?"Foundation":parsed.bias>65?"Expression":"Balanced"):"—"}].map(m=>(
            <div key={m.l} style={{padding:"8px 10px",background:"rgba(245,242,232,.07)"}}>
              <div style={{fontSize:8,color:"rgba(245,242,232,.35)",letterSpacing:".12em",textTransform:"uppercase",fontFamily:"var(--mono)",marginBottom:2}}>{m.l}</div>
              <div style={{fontFamily:"var(--serif)",fontSize:13,color:"rgba(245,242,232,.85)",textTransform:"capitalize"}}>{m.v}</div>
            </div>
          ))}
        </div>
        {parsed.genres?.length>0&&<div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14}}>{parsed.genres.map(g=>{const genre=GENRES.find(x=>x.id===g);return genre?<span key={g} style={{fontSize:11,padding:"3px 10px",background:"rgba(245,242,232,.1)",color:"rgba(245,242,232,.8)",fontFamily:"var(--mono)"}}>{genre.emoji} {genre.label}</span>:null;})}</div>}
        <div style={{display:"flex",gap:10}}>
          <button onClick={()=>onResult(parsed)} style={{flex:1,padding:"13px",background:"var(--amber)",color:"var(--paper)",border:"none",cursor:"pointer",fontFamily:"var(--mono)",fontSize:11,letterSpacing:".14em",textTransform:"uppercase"}}>Find my sound →</button>
          <button onClick={()=>{setState("idle");setParsed(null);setText("");}} style={{padding:"13px 14px",background:"transparent",color:"rgba(245,242,232,.5)",border:"1px solid rgba(245,242,232,.15)",cursor:"pointer",fontFamily:"var(--mono)",fontSize:10}}>Edit</button>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div style={{fontSize:9,color:"var(--ink4)",letterSpacing:".16em",textTransform:"uppercase",fontFamily:"var(--mono)",marginBottom:10}}>Describe your room and what you're looking for</div>
      <textarea value={text} onChange={e=>setText(e.target.value)}
        placeholder="e.g. I'm in a first floor flat in a Victorian semi, medium sized living room, hardwood floors. Budget around £3,500. Mainly listen to jazz and folk — want it to feel musical and warm."
        rows={5} style={{width:"100%",padding:"14px 16px",fontFamily:"var(--serif)",fontSize:13,color:"var(--ink)",background:"var(--paper)",border:"2px solid var(--ink)",outline:"none",lineHeight:1.65,resize:"vertical",marginBottom:10}}/>
      {!text.trim()&&(
        <div style={{marginBottom:12}}>
          <div style={{fontSize:8,color:"var(--ink4)",letterSpacing:".12em",textTransform:"uppercase",fontFamily:"var(--mono)",marginBottom:8}}>Not sure where to start?</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
            {["I'm completely new to hi-fi, budget around £","I want to upgrade from my existing Rega turntable, budget is £","I have a large room in a detached house, serious budget around £"].map((p,i)=>(
              <button key={i} onClick={()=>setText(p)} style={{padding:"7px 12px",background:"var(--paper2)",border:"1px solid var(--rule)",cursor:"pointer",fontFamily:"var(--serif)",fontSize:11,color:"var(--ink3)",textAlign:"left",lineHeight:1.4}}>
                {p}<span style={{color:"var(--ink4)"}}>...</span>
              </button>
            ))}
          </div>
        </div>
      )}
      {!text.trim()&&(
        <div style={{marginBottom:12,padding:"10px 14px",borderLeft:"2px solid var(--rule)",background:"var(--paper2)"}}>
          <div style={{fontSize:9,color:"var(--ink4)",letterSpacing:".1em",textTransform:"uppercase",fontFamily:"var(--mono)",marginBottom:6}}>Helpful to mention</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:"4px 14px"}}>
            {["Room size","Flat or house","Budget","Music you love","New or upgrading"].map(h=><span key={h} style={{fontSize:10,color:"var(--ink3)",fontFamily:"var(--mono)"}}>· {h}</span>)}
          </div>
        </div>
      )}
      {state==="error"&&<p style={{fontSize:11,color:"var(--red)",fontFamily:"var(--mono)",marginBottom:8}}>Couldn't parse that — use the step-by-step guide below.</p>}
      <button onClick={handleSubmit} disabled={!text.trim()||state==="loading"} style={{display:"flex",alignItems:"center",gap:14,padding:"16px 24px",width:"100%",maxWidth:340,justifyContent:"space-between",background:text.trim()?"var(--ink)":"var(--paper2)",color:text.trim()?"var(--paper)":"var(--ink4)",border:`1px solid ${text.trim()?"var(--ink)":"var(--rule)"}`,cursor:text.trim()?"pointer":"default",fontFamily:"var(--mono)",fontSize:11,letterSpacing:".14em",textTransform:"uppercase",transition:"all .2s"}}>
        <span>{state==="loading"?"Reading your room...":"Find my sound"}</span>
        {state==="loading"
          ? <svg className="vinyl-turn" width="18" height="18" viewBox="0 0 18 18"><circle cx="9" cy="9" r="8" fill="none" stroke="currentColor" strokeWidth="1.2"/><circle cx="9" cy="9" r="3" fill="none" stroke="currentColor" strokeWidth=".8"/><circle cx="9" cy="9" r="1.2" fill="currentColor"/></svg>
          : <svg width="18" height="12" viewBox="0 0 20 12" fill="none"><path d="M13 1l6 5-6 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><line x1="19" y1="6" x2="1" y2="6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>}
      </button>
    </div>
  );
}

// ── Room Photo Analysis Component ────────────────────────────────────────────
function RoomPhotoAnalysis({ onResult, apiKey }) {
  const [state, setState] = React.useState("idle");
  const [result, setResult] = React.useState(null);
  const [preview, setPreview] = React.useState(null);
  const fileRef = React.useRef(null);

  async function analyse(file) {
    setState("loading");
    try {
      const [base64, prev] = await Promise.all([
        new Promise((res,rej)=>{ const r=new FileReader(); r.onload=()=>res(r.result.split(",")[1]); r.onerror=rej; r.readAsDataURL(file); }),
        new Promise(res=>{ const r=new FileReader(); r.onload=()=>res(r.result); r.readAsDataURL(file); }),
      ]);
      setPreview(prev);
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{"Content-Type":"application/json","x-api-key":apiKey,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},
        body: JSON.stringify({
          model:"claude-haiku-4-5-20251001",
          max_tokens:600,
          messages:[{role:"user",content:[
            {type:"image",source:{type:"base64",media_type:file.type||"image/jpeg",data:base64}},
            {type:"text",text:`Analyse this room photo for a hi-fi advisor. Respond ONLY with JSON:
{"roomSize":"small|medium|large|openplan","floorType":"carpet|wood|tile","buildingType":"apt_ground|apt_upper|detached|semi_detached","issues":[],"confidence":"high|medium|low","notes":"one sentence"}
Be honest. Low confidence if unclear.`}
          ]}]
        })
      });
      const data = await response.json();
      const parsed = JSON.parse(data.content?.map(c=>c.text||"").join("").replace(/```json|```/g,"").trim());
      setResult(parsed);
      onResult(parsed);
      setState("done");
    } catch(e) { setState("error"); }
  }

  if (state==="idle") return (
    <div style={{marginBottom:24}}>
      <div style={{fontFamily:"var(--serif)",fontSize:18,color:"var(--ink)",marginBottom:6}}>Let Claude read your room</div>
      <p style={{fontSize:13,color:"var(--ink3)",fontFamily:"var(--serif)",lineHeight:1.65,marginBottom:14}}>
        Upload a photo and Claude will identify room size, floor type, and flag acoustic issues — filling everything in automatically.
      </p>
      <p style={{fontSize:10,color:"var(--ink4)",fontFamily:"var(--mono)",lineHeight:1.5,marginBottom:14}}>
        Note — requires a direct internet connection. Won't work on corporate networks or VPNs.
      </p>
      <button onClick={()=>fileRef.current?.click()} style={{display:"flex",alignItems:"center",gap:14,padding:"18px 24px",width:"100%",background:"var(--ink)",color:"var(--paper)",border:"none",cursor:"pointer",fontFamily:"var(--mono)",fontSize:11,letterSpacing:".14em",textTransform:"uppercase",marginBottom:8}}>
        <svg width="20" height="20" viewBox="0 0 22 22" fill="none"><rect x="1" y="4" width="20" height="15" rx="2" stroke="var(--paper)" strokeWidth="1.5"/><circle cx="11" cy="11.5" r="4" stroke="var(--paper)" strokeWidth="1.5"/><path d="M7 4l1.5-3h5L15 4" stroke="var(--paper)" strokeWidth="1.5" strokeLinejoin="round"/></svg>
        <span>Upload a photo</span>
      </button>
      <div style={{height:1,background:"var(--rule)",margin:"20px 0"}}/>
      <input ref={fileRef} type="file" accept="image/*" onChange={e=>{const f=e.target.files?.[0];if(f)analyse(f);}} style={{display:"none"}}/>
    </div>
  );

  if (state==="loading") return (
    <div style={{marginBottom:24,padding:"28px",textAlign:"center",background:"var(--ink)"}}>
      <div className="vinyl-turn" style={{width:40,height:40,margin:"0 auto 14px"}}>
        <svg width="40" height="40" viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="none" stroke="rgba(245,242,232,.2)" strokeWidth="2"/><circle cx="20" cy="20" r="10" fill="none" stroke="rgba(245,242,232,.2)" strokeWidth="1"/><circle cx="20" cy="20" r="3" fill="rgba(245,242,232,.6)"/></svg>
      </div>
      <div style={{fontSize:11,color:"var(--paper)",fontFamily:"var(--mono)",letterSpacing:".1em",textTransform:"uppercase"}}>Reading your room...</div>
    </div>
  );

  if (state==="done" && result) return (
    <div style={{marginBottom:24}} className="fu">
      {preview&&<div style={{position:"relative",marginBottom:10}}><img src={preview} alt="Room" style={{width:"100%",maxHeight:180,objectFit:"cover",display:"block"}}/><div style={{position:"absolute",top:8,right:8,background:"var(--green)",color:"var(--paper)",fontSize:9,fontFamily:"var(--mono)",letterSpacing:".1em",textTransform:"uppercase",padding:"3px 8px"}}>✓ Read</div></div>}
      <div style={{padding:"14px 16px",background:"var(--ink)",marginBottom:10}}>
        <div style={{fontSize:9,color:"rgba(245,242,232,.4)",letterSpacing:".14em",textTransform:"uppercase",fontFamily:"var(--mono)",marginBottom:6}}>Claude's assessment · {result.confidence} confidence</div>
        <p style={{fontSize:13,color:"var(--paper)",fontFamily:"var(--serif)",lineHeight:1.65,marginBottom:result.issues?.length>0?10:0}}>{result.notes}</p>
        {result.issues?.length>0&&<div style={{paddingTop:8,borderTop:"1px solid rgba(245,242,232,.1)"}}>{result.issues.map((issue,i)=><div key={i} style={{fontSize:12,color:"rgba(245,242,232,.65)",fontFamily:"var(--serif)",display:"flex",gap:8,marginBottom:4}}><span style={{color:"var(--amber)",flexShrink:0}}>→</span>{issue}</div>)}</div>}
      </div>
      <button onClick={()=>{setState("idle");setResult(null);setPreview(null);}} style={{fontSize:9,color:"var(--ink4)",fontFamily:"var(--mono)",letterSpacing:".1em",textTransform:"uppercase",background:"none",border:"none",cursor:"pointer",textDecoration:"underline"}}>Upload a different photo</button>
      <div style={{height:1,background:"var(--rule)",margin:"20px 0"}}/>
    </div>
  );

  return (
    <div style={{marginBottom:24,padding:"14px 16px",border:"1px solid var(--rule)",background:"var(--paper2)"}}>
      <div style={{fontSize:12,color:"var(--red)",fontFamily:"var(--serif)",marginBottom:6}}>Analysis failed — set the details manually below.</div>
      <div style={{fontSize:10,color:"var(--ink4)",fontFamily:"var(--mono)",lineHeight:1.5,marginBottom:8}}>This can happen on corporate networks or VPNs. Your home or phone connection will work fine.</div>
      <button onClick={()=>{setState("idle");setPreview(null);}} style={{fontSize:9,color:"var(--ink3)",fontFamily:"var(--mono)",letterSpacing:".1em",textTransform:"uppercase",background:"none",border:"none",cursor:"pointer",textDecoration:"underline"}}>Try again</button>
      <div style={{height:1,background:"var(--rule)",margin:"20px 0"}}/>
    </div>
  );
}

// ── UI Components ─────────────────────────────────────────────────────────────

function VinylAccent({size=18,col="var(--ink)",opacity=0.12}) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" style={{flexShrink:0,opacity}}>
      <circle cx="9" cy="9" r="8" stroke={col} strokeWidth="1.2"/>
      <circle cx="9" cy="9" r="4.5" stroke={col} strokeWidth=".6"/>
      <circle cx="9" cy="9" r="1.5" fill={col}/>
    </svg>
  );
}

function StepHeading({title}) {
  return (
    <div style={{marginBottom:28,paddingBottom:20,borderBottom:"2px solid var(--ink)"}}>
      <h2 style={{fontFamily:"var(--serif)",fontSize:"clamp(26px,5vw,38px)",fontWeight:400,color:"var(--ink)",lineHeight:1,letterSpacing:"-.03em"}}>{title}</h2>
    </div>
  );
}

function NavRow({onBack,onNext,nextLabel="Continue →"}) {
  return (
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:40,paddingTop:28,borderTop:"1px solid var(--rule)"}}>
      {onBack
        ? <button onClick={onBack} style={{background:"none",border:"none",padding:"12px 0",fontSize:11,letterSpacing:".12em",textTransform:"uppercase",color:"var(--ink4)",cursor:"pointer",fontFamily:"var(--mono)",display:"flex",alignItems:"center",gap:10}}>
            <svg width="16" height="10" viewBox="0 0 16 10" fill="none"><path d="M7 1L1 5l6 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><line x1="1" y1="5" x2="15" y2="5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            Back
          </button>
        : <div/>
      }
      <button onClick={onNext} style={{background:"var(--ink)",color:"var(--paper)",border:"none",padding:"16px 36px",fontSize:11,letterSpacing:".16em",textTransform:"uppercase",cursor:"pointer",fontFamily:"var(--mono)",display:"flex",alignItems:"center",gap:12}}>
        {nextLabel}
        <svg width="16" height="10" viewBox="0 0 16 10" fill="none"><path d="M9 1l6 4-6 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><line x1="15" y1="5" x2="1" y2="5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
      </button>
    </div>
  );
}

// ── Steps ─────────────────────────────────────────────────────────────────────
const STEPS = [
  { id:"room",    label:"Room"    },
  { id:"music",   label:"Music"   },
  { id:"budget",  label:"Budget"  },
  { id:"brief",   label:"Brief"   },
  { id:"dealers", label:"Dealers" },
];

function StepBar({current, isMobile}) {
  const ci = STEPS.findIndex(s=>s.id===current);
  return (
    <div style={{marginBottom:isMobile?20:36}}>
      <div style={{height:2,background:"var(--rule)",marginBottom:14,position:"relative"}}>
        <div style={{position:"absolute",left:0,top:0,height:"100%",background:"var(--amber)",transition:"width .5s cubic-bezier(.4,0,.2,1)",width:`${Math.round((ci/(STEPS.length-1))*100)}%`}}/>
      </div>
      <div style={{display:"flex"}}>
        {STEPS.map((s,i)=>{
          const done = i < ci, active = s.id===current;
          return (
            <div key={s.id} style={{flex:1,textAlign:"center"}}>
              <div style={{width:18,height:18,margin:"0 auto 4px",display:"flex",alignItems:"center",justifyContent:"center",background:active?"var(--ink)":done?"var(--amber)":"transparent",border:`1px solid ${active?"var(--ink)":done?"var(--amber)":"var(--rule)"}`}}>
                {done ? <svg width={9} height={7} viewBox="0 0 10 8"><polyline points="1,4 3.5,6.5 9,1" stroke="#F5F0E8" strokeWidth="1.5" fill="none"/></svg>
                      : <span style={{fontSize:8,color:active?"var(--paper)":"var(--ink4)",fontFamily:"var(--mono)"}}>{i+1}</span>}
              </div>
              {!isMobile&&<div style={{fontSize:8,color:active?"var(--ink)":done?"var(--amber)":"var(--ink4)",letterSpacing:".1em",textTransform:"uppercase",fontFamily:"var(--mono)"}}>{s.label}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── PDF Generation ────────────────────────────────────────────────────────────
function generateDealerBriefHTML(data) {
  const { roomSize, buildingType, genres, bias, budget, character, budgetSplit, loc, selectedGenres } = data;
  const charLabel = character==="warm"?"Warm & Musical":character==="detailed"?"Detailed & Analytical":"Balanced";
  const bld = BUILDING_TYPES[buildingType];
  const room = ROOM_SIZES.find(r=>r.id===roomSize);
  const genreLabels = GENRES.filter(g=>selectedGenres.includes(g.id)).map(g=>`${g.emoji} ${g.label}`).join(", ");

  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  body { font-family: Georgia, serif; max-width: 680px; margin: 40px auto; padding: 0 24px; color: #111008; background: #F7F2E8; }
  h1 { font-size: 32px; font-weight: 400; letter-spacing: -.02em; margin-bottom: 4px; }
  h2 { font-size: 14px; font-family: monospace; letter-spacing: .18em; text-transform: uppercase; color: #5C5444; font-weight: 400; margin: 28px 0 10px; }
  .rule { border: none; border-top: 1px solid #DDD5C0; margin: 16px 0; }
  .topline { font-family: monospace; font-size: 10px; letter-spacing: .2em; text-transform: uppercase; color: #A89E8C; margin-bottom: 20px; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; }
  .cell { padding: 12px 14px; background: #EEE8D8; }
  .cell-label { font-family: monospace; font-size: 9px; letter-spacing: .14em; text-transform: uppercase; color: #A89E8C; margin-bottom: 4px; }
  .cell-value { font-size: 15px; }
  .brand-group { margin-bottom: 16px; padding: 14px 16px; border-left: 3px solid #C4621A; background: #EEE8D8; }
  .brand-label { font-family: monospace; font-size: 9px; letter-spacing: .16em; text-transform: uppercase; color: #5C5444; margin-bottom: 6px; }
  .brand-names { font-size: 14px; font-weight: 400; margin-bottom: 4px; }
  .brand-why { font-size: 12px; color: #5C5444; font-style: italic; }
  .budget-row { display: grid; grid-template-columns: 1fr auto; align-items: center; padding: 8px 0; border-bottom: 1px solid #DDD5C0; }
  .budget-cat { font-family: monospace; font-size: 10px; letter-spacing: .1em; text-transform: uppercase; color: #5C5444; }
  .budget-val { font-size: 16px; color: #111008; }
  .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #DDD5C0; font-family: monospace; font-size: 9px; color: #A89E8C; letter-spacing: .1em; }
  .iso-warn { padding: 12px 14px; border-left: 3px solid #8B2020; background: rgba(139,32,32,.05); margin-bottom: 16px; font-size: 13px; }
</style>
</head>
<body>
<div class="topline">Record Room · Dealer Brief · ${new Date().toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"})}</div>
<h1>My Hi-Fi Brief</h1>
<hr class="rule">

<h2>My Room & Setup</h2>
<div class="grid">
  <div class="cell"><div class="cell-label">Room size</div><div class="cell-value">${room?.label||roomSize} · ${room?.desc||""}</div></div>
  <div class="cell"><div class="cell-label">Building</div><div class="cell-value">${bld?.label||buildingType}</div></div>
  <div class="cell"><div class="cell-label">Budget</div><div class="cell-value">${budget>0?fmt(budget,loc):"Not specified"}</div></div>
  <div class="cell"><div class="cell-label">Listening character</div><div class="cell-value">${charLabel}</div></div>
</div>
${genreLabels?`<div class="cell" style="margin-bottom:16px"><div class="cell-label">Music I love</div><div class="cell-value">${genreLabels}</div></div>`:""}

${bld?.isoRequired?`<div class="iso-warn">⚠ Upper floor flat — speaker isolation footers are a mandatory safety item (GAIA III or equivalent). Budget approximately ${loc.symbol}430 for a stereo pair (×8 footers).</div>`:""}

<h2>The Sound I'm Looking For</h2>
<p style="font-size:14px;line-height:1.7;margin-bottom:16px;font-style:italic">${
  character==="warm"
    ? "Warm, musical, and engaging. Music should feel alive and rhythmically involving. I'm happy to sacrifice some analytical precision for a sound I can listen to for hours without fatigue."
    : character==="detailed"
    ? "Detailed and revealing. I want to hear everything in the recording — texture, space, and precision. I understand this requires careful system matching."
    : "Balanced and honest. Neither warm and coloured nor cold and analytical. I want the music to sound natural and engaging across all the genres I listen to."
}</p>

<h2>Brand Directions</h2>
${["turntable","amplifier","speakers"].map(cat => {
  const profile = BRAND_PROFILES[cat]?.[character];
  if (!profile) return "";
  return `<div class="brand-group">
    <div class="brand-label">${cat.charAt(0).toUpperCase()+cat.slice(1)}</div>
    <div class="brand-names">${profile.brands.join(" · ")}</div>
    <div class="brand-why">${profile.why}</div>
  </div>`;
}).join("")}

${budgetSplit?`
<h2>Budget Guidance</h2>
${[
  ["Turntable & cartridge", (budgetSplit.turntable||0)+(budgetSplit.cartridge||0)],
  ["Phono stage",           budgetSplit.phono||0],
  ["Amplification",         budgetSplit.amplifier||0],
  ["Speakers",              budgetSplit.speakers||0],
  ["Cables",                budgetSplit.cables||0],
  ["Isolation",             budgetSplit.isolation||0],
].filter(([_,v])=>v>0).map(([label,val])=>`
<div class="budget-row">
  <span class="budget-cat">${label}</span>
  <span class="budget-val">${fmt(val,loc)}</span>
</div>`).join("")}`:""}

<h2>A Note on Dealer Demos</h2>
<p style="font-size:13px;line-height:1.7;color:#5C5444">Please demo any combination before buying. The right system is personal — your room, your ears, and the specific synergy between components can only be confirmed through listening. A good dealer will let you take equipment home for a trial.</p>

<div class="footer">Generated by Record Room · recordroom.vercel.app · ${new Date().getFullYear()}</div>
</body>
</html>`;
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function RecordRoom() {
  useGlobalStyles();
  const isMobile = useIsMobile();

  // Intake state
  const [step,          setStep]          = useState("room");
  const [roomSize,      setRoomSize]      = useState("medium");
  const [buildingType,  setBuildingType]  = useState("semi_detached");
  const [floorType,     setFloorType]     = useState("wood");
  const [selectedGenres,setSelectedGenres]= useState([]);
  const [bias,          setBias]          = useState(50);
  const [budget,        setBudget]        = useState(0);
  const [localeId,      setLocaleId]      = useState("gb");
  const [region,        setRegion]        = useState("");
  const [showLanding,   setShowLanding]   = useState(true);

  const loc = LOCALES[localeId] || LOCALES.gb;
  const character = getSystemCharacter(bias, selectedGenres);
  const budgetSplit = getBudgetSplit(budget, bias, roomSize);
  const bld = BUILDING_TYPES[buildingType];

  function goTo(s) { setStep(s); window.scrollTo(0,0); }

  // Filter dealers by region
  const nearbyDealers = region ? DEALERS.filter(d=>d.region===region||d.region==="Nationwide") : [];
  const otherDealers  = region ? DEALERS.filter(d=>d.region!==region&&d.region!=="Nationwide") : DEALERS;

  // Download dealer brief
  function downloadBrief() {
    const html = generateDealerBriefHTML({ roomSize, buildingType, genres:selectedGenres, bias, budget, character, budgetSplit, loc, selectedGenres });
    const blob = new Blob([html], {type:"text/html"});
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url;
    a.download = "hifi-dealer-brief.html";
    a.click();
    URL.revokeObjectURL(url);
  }

  // ── Landing ────────────────────────────────────────────────────────────────
  if (showLanding) return (
    <div style={{fontFamily:"var(--serif)",background:"var(--paper)",minHeight:"100vh",color:"var(--ink)"}}>
      <div style={{height:4,background:"var(--ink)",width:"100%"}}/>
      <div style={{maxWidth:580,margin:"0 auto",padding:"clamp(32px,6vw,64px) 24px 60px"}}>
        <div className="sl sl1" style={{display:"flex",alignItems:"center",gap:14,marginBottom:32}}>
          <svg width="44" height="44" viewBox="0 0 44 44" className="vinyl-turn" style={{flexShrink:0}}>
            <circle cx="22" cy="22" r="20" fill="#EEE8D8" stroke="#DDD5C0" strokeWidth="1.5"/>
            <circle cx="22" cy="22" r="13" fill="none" stroke="rgba(17,16,8,.06)" strokeWidth="1"/>
            <circle cx="22" cy="22" r="8"  fill="none" stroke="rgba(17,16,8,.06)" strokeWidth="1"/>
            <circle cx="22" cy="22" r="3.5"fill="#111008" opacity=".7"/>
            <circle cx="22" cy="22" r="1.8"fill="#111008"/>
          </svg>
          <div>
            <div style={{fontSize:10,letterSpacing:".2em",textTransform:"uppercase",color:"var(--amber)",fontFamily:"var(--mono)",lineHeight:1}}>Record Room</div>
            <div style={{fontSize:9,letterSpacing:".1em",textTransform:"uppercase",color:"var(--ink4)",marginTop:4,fontFamily:"var(--mono)"}}>Find Your Sound · Beta</div>
          </div>
        </div>
        <div className="sl sl2" style={{marginBottom:40}}>
          <h1 style={{fontFamily:"var(--serif)",fontSize:"clamp(40px,9vw,72px)",fontWeight:400,color:"var(--ink)",lineHeight:.95,letterSpacing:"-.04em",marginBottom:20}}>
            Record<br/>
            <em style={{color:"var(--amber)",fontStyle:"italic"}}>Room.</em>
          </h1>
          <p style={{fontSize:"clamp(14px,2vw,16px)",color:"var(--ink3)",lineHeight:1.7,maxWidth:420,fontFamily:"var(--serif)",fontWeight:300}}>
            Tell us about your room, your music, and your budget. We'll tell you what kind of system suits you — and which dealers to visit.
          </p>
          <p style={{fontSize:12,color:"var(--ink4)",fontFamily:"var(--mono)",lineHeight:1.6,marginTop:10}}>
            No specific models. No compatibility guesswork. Just honest direction.
          </p>
        </div>
        <div className="sl sl3" style={{marginBottom:40}}>
          <NLInput onResult={(parsed)=>{
              if (parsed.roomSize) setRoomSize(parsed.roomSize);
              if (parsed.buildingType) setBuildingType(parsed.buildingType);
              if (parsed.floorType) setFloorType(parsed.floorType);
              if (parsed.budget>0) setBudget(parsed.budget);
              if (parsed.genres?.length>0) setSelectedGenres(parsed.genres.filter(g=>GENRES.find(x=>x.id===g)));
              if (parsed.bias!=null) setBias(parsed.bias);
              setShowLanding(false);
              setStep("brief");
            }} apiKey={import.meta.env.VITE_ANTHROPIC_KEY} localeId={localeId}/>

          <div style={{display:"flex",alignItems:"center",gap:12,margin:"20px 0"}}>
            <div style={{flex:1,height:1,background:"var(--rule)"}}/>
            <span style={{fontSize:9,color:"var(--ink4)",fontFamily:"var(--mono)",letterSpacing:".14em",textTransform:"uppercase"}}>or</span>
            <div style={{flex:1,height:1,background:"var(--rule)"}}/>
          </div>

          <button onClick={()=>setShowLanding(false)} style={{display:"flex",alignItems:"center",gap:16,padding:"16px 28px",background:"transparent",color:"var(--ink)",border:"1px solid var(--ink)",cursor:"pointer",fontFamily:"var(--mono)",fontSize:11,letterSpacing:".14em",textTransform:"uppercase",width:"100%",maxWidth:340,justifyContent:"space-between"}}>
            <span>Step-by-step guide</span>
            <svg width="18" height="12" viewBox="0 0 20 12" fill="none"><path d="M13 1l6 5-6 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><line x1="19" y1="6" x2="1" y2="6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
          </button>
          <div style={{marginTop:8,fontSize:9,color:"var(--ink4)",fontFamily:"var(--mono)"}}>New to hi-fi? <span style={{color:"var(--ink2)"}}>Start here.</span> We ask the right questions.</div>
        </div>
        <div className="sl sl4" style={{display:"flex",gap:6,flexWrap:"wrap",paddingTop:20,borderTop:"1px solid var(--rule)",marginBottom:24}}>
          {Object.values(LOCALES).map(l=>(
            <button key={l.id} onClick={()=>setLocaleId(l.id)} style={{display:"flex",alignItems:"center",gap:6,padding:"7px 12px",cursor:"pointer",background:localeId===l.id?"var(--ink)":"transparent",border:`1px solid ${localeId===l.id?"var(--ink)":"var(--rule)"}`,fontFamily:"var(--mono)",fontSize:10,color:localeId===l.id?"var(--paper)":"var(--ink3)",transition:"all .15s"}}>
              <span style={{fontSize:14}}>{l.flag}</span><span>{l.label}</span>
            </button>
          ))}
        </div>
        <div className="sl sl5" style={{display:"flex",gap:16,alignItems:"center"}}>
          <a href={TALLY_URL} target="_blank" rel="noopener noreferrer" style={{fontSize:10,color:"var(--ink3)",fontFamily:"var(--mono)",letterSpacing:".1em",textTransform:"uppercase",textDecoration:"none",borderBottom:"1px solid var(--rule)"}}>Feedback</a>
          <a href={TIKTOK_URL} target="_blank" rel="noopener noreferrer" style={{fontSize:10,color:"var(--ink3)",fontFamily:"var(--mono)",letterSpacing:".1em",textTransform:"uppercase",textDecoration:"none",borderBottom:"1px solid var(--rule)"}}>TikTok</a>
          <a href={SUBSTACK_URL} target="_blank" rel="noopener noreferrer" style={{fontSize:10,color:"var(--ink3)",fontFamily:"var(--mono)",letterSpacing:".1em",textTransform:"uppercase",textDecoration:"none",borderBottom:"1px solid var(--rule)"}}>Substack</a>
          <span style={{marginLeft:"auto",fontSize:9,color:"var(--ink4)",fontFamily:"var(--mono)"}}>v5 · Find Your Sound</span>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{fontFamily:"var(--mono)",background:"var(--paper)",minHeight:"100vh",color:"var(--ink)"}}>
      <div style={{height:4,background:"var(--ink)",width:"100%"}}/>
      <div style={{maxWidth:640,margin:"0 auto",padding:isMobile?"0 16px 80px":"0 28px 80px"}}>
        <div className="fu" style={{padding:"24px 0 20px",borderBottom:"1px solid var(--rule)",marginBottom:28,display:"flex",alignItems:"center",gap:14}}>
          <VinylAccent size={28} opacity={0.15}/>
          <div>
            <div style={{fontSize:9,letterSpacing:".2em",textTransform:"uppercase",color:"var(--ink4)",fontFamily:"var(--mono)"}}>Record Room</div>
            <div style={{fontFamily:"var(--serif)",fontSize:18,color:"var(--ink)",letterSpacing:"-.02em"}}>Find Your Sound</div>
          </div>
          <div style={{marginLeft:"auto",display:"flex",gap:4}}>
            {Object.values(LOCALES).map((l,i)=>(
              <button key={l.id} onClick={()=>setLocaleId(l.id)} title={l.label} style={{width:30,height:30,display:"flex",alignItems:"center",justifyContent:"center",background:localeId===l.id?"var(--ink)":"transparent",border:"none",cursor:"pointer",fontSize:14,transition:"background .15s"}}>
                {l.flag}
              </button>
            ))}
          </div>
        </div>

        <StepBar current={step} isMobile={isMobile}/>

        <div key={step} className="fu">

          {/* ── STEP 1: ROOM ──────────────────────────────────────────────── */}
          {step==="room"&&(
            <div>
              <StepHeading title="Your Room"/>

              <div style={{marginBottom:24}}>
                <div style={{fontSize:9,color:"var(--ink4)",letterSpacing:".18em",textTransform:"uppercase",fontFamily:"var(--mono)",marginBottom:14}}>Room size</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8}}>
                  {ROOM_SIZES.map(size=>{
                    const active = roomSize===size.id;
                    return (
                      <button key={size.id} onClick={()=>setRoomSize(size.id)} style={{padding:"18px 16px",textAlign:"left",cursor:"pointer",border:`2px solid ${active?"var(--ink)":"var(--rule)"}`,background:active?"var(--ink)":"var(--paper2)",transition:"all .2s"}}>
                        <div style={{fontFamily:"var(--serif)",fontSize:20,color:active?"var(--paper)":"var(--ink)",lineHeight:1,marginBottom:4}}>{size.label}</div>
                        <div style={{fontSize:10,color:active?"rgba(245,242,232,.7)":"var(--ink4)",fontFamily:"var(--mono)",marginBottom:6}}>{size.sub}</div>
                        <div style={{fontSize:9,color:active?"rgba(245,242,232,.45)":"var(--ink4)",fontFamily:"var(--mono)"}}>{size.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{marginBottom:24}}>
                <div style={{fontSize:9,color:"var(--ink4)",letterSpacing:".18em",textTransform:"uppercase",fontFamily:"var(--mono)",marginBottom:14}}>Building type</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8}}>
                  {Object.values(BUILDING_TYPES).map(bt=>{
                    const active=buildingType===bt.id;
                    const col = bt.riskScore>=80?"var(--red)":bt.riskScore>=50?"var(--amber)":"var(--green)";
                    return (
                      <button key={bt.id} onClick={()=>setBuildingType(bt.id)} style={{padding:"16px 14px",textAlign:"left",cursor:"pointer",border:`2px solid ${active?"var(--ink)":"var(--rule)"}`,background:active?"var(--ink)":"var(--paper2)",transition:"all .2s"}}>
                        <div style={{fontFamily:"var(--serif)",fontSize:15,color:active?"var(--paper)":"var(--ink)",marginBottom:3}}>{bt.label}</div>
                        {bt.isoRequired&&<div style={{fontSize:9,color:active?"rgba(239,68,68,.8)":"var(--red)",fontFamily:"var(--mono)",letterSpacing:".06em"}}>Isolation required</div>}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{marginBottom:16}}>
                <div style={{fontSize:9,color:"var(--ink4)",letterSpacing:".18em",textTransform:"uppercase",fontFamily:"var(--mono)",marginBottom:14}}>Floor type</div>
                <div style={{display:"flex",gap:0,border:"1px solid var(--rule)"}}>
                  {[{id:"carpet",label:"Carpet"},{id:"wood",label:"Hardwood"},{id:"tile",label:"Tile / Stone"}].map((f,i)=>{
                    const sel=floorType===f.id;
                    return <button key={f.id} onClick={()=>setFloorType(f.id)} style={{flex:1,padding:"12px",fontSize:12,cursor:"pointer",fontFamily:"var(--serif)",background:sel?"var(--ink)":"transparent",color:sel?"var(--paper)":"var(--ink2)",border:"none",borderLeft:i>0?"1px solid var(--rule)":"none",transition:"all .15s"}}>{f.label}</button>;
                  })}
                </div>
              </div>

              <NavRow onNext={()=>goTo("music")}/>
            </div>
          )}

          {/* ── STEP 2: MUSIC ─────────────────────────────────────────────── */}
          {step==="music"&&(
            <div>
              <StepHeading title="Your Music"/>
              <div style={{marginBottom:28}}>
                <div style={{fontSize:9,color:"var(--ink4)",letterSpacing:".18em",textTransform:"uppercase",fontFamily:"var(--mono)",marginBottom:14}}>What do you mainly listen to?</div>
                <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"repeat(2,1fr)",gap:8,marginBottom:24}}>
                  {GENRES.map(g=>{
                    const sel=selectedGenres.includes(g.id);
                    return (
                      <button key={g.id} onClick={()=>setSelectedGenres(prev=>prev.includes(g.id)?prev.filter(x=>x!==g.id):[...prev,g.id])} style={{padding:"14px 16px",textAlign:"left",cursor:"pointer",background:sel?"var(--paper2)":"transparent",border:`1px solid ${sel?"var(--ink2)":"var(--rule)"}`,borderLeft:`4px solid ${sel?"var(--amber)":"var(--rule)"}`,transition:"all .18s",display:"flex",alignItems:"center",gap:12}}>
                        <span style={{fontSize:22,flexShrink:0}}>{g.emoji}</span>
                        <div>
                          <div style={{fontFamily:"var(--serif)",fontSize:14,color:sel?"var(--ink)":"var(--ink2)"}}>{g.label}</div>
                          <div style={{fontSize:9,color:"var(--ink4)",letterSpacing:".06em",fontFamily:"var(--mono)",marginTop:2}}>{g.desc}</div>
                        </div>
                        {sel&&<div style={{marginLeft:"auto",width:16,height:16,background:"var(--ink)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><svg width="9" height="7" viewBox="0 0 10 8" fill="none"><polyline points="1,4 3.5,6.5 9,1" stroke="#F5F0E8" strokeWidth="1.5" strokeLinecap="round"/></svg></div>}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{marginBottom:8,padding:"24px 20px",background:"var(--ink)"}}>
                <div style={{fontSize:9,color:"rgba(245,242,232,.4)",letterSpacing:".2em",textTransform:"uppercase",fontFamily:"var(--mono)",marginBottom:14}}>How should the system feel?</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
                  <div style={{opacity:bias<=50?1:0.4,transition:"opacity .3s"}}>
                    <div style={{fontFamily:"var(--serif)",fontSize:18,color:bias<50?"var(--amber)":"rgba(245,242,232,.5)",marginBottom:4}}>Foundation</div>
                    <p style={{fontSize:10,color:"rgba(245,242,232,.5)",fontFamily:"var(--mono)",lineHeight:1.6}}>Invest in the source. Detail and resolution first.</p>
                  </div>
                  <div style={{textAlign:"right",opacity:bias>=50?1:0.4,transition:"opacity .3s"}}>
                    <div style={{fontFamily:"var(--serif)",fontSize:18,color:bias>50?"var(--amber)":"rgba(245,242,232,.5)",marginBottom:4}}>Expression</div>
                    <p style={{fontSize:10,color:"rgba(245,242,232,.5)",fontFamily:"var(--mono)",lineHeight:1.6}}>Music fills the room. Scale and presence first.</p>
                  </div>
                </div>
                <div style={{position:"relative",marginBottom:4}}>
                  <input type="range" min={0} max={100} step={1} value={bias} onChange={e=>setBias(Number(e.target.value))}
                    style={{width:"100%",background:`linear-gradient(to right, rgba(196,98,26,.7) 0%, rgba(196,98,26,.7) ${bias}%, rgba(245,242,232,.18) ${bias}%, rgba(245,242,232,.18) 100%)`}}/>
                  <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:1,height:10,background:"rgba(245,242,232,.25)",pointerEvents:"none"}}/>
                </div>
                <div style={{marginTop:12,fontSize:12,color:"rgba(245,242,232,.7)",fontFamily:"var(--serif)",fontStyle:"italic",lineHeight:1.6}}>
                  {bias<35?"Strong Foundation bias — invest in the turntable and cartridge above all else.":bias>65?"Strong Expression bias — invest in the speakers and let them fill the space.":"Balanced — no strong preference between source and speakers."}
                </div>
              </div>

              <NavRow onBack={()=>goTo("room")} onNext={()=>goTo("budget")}/>
            </div>
          )}

          {/* ── STEP 3: BUDGET ────────────────────────────────────────────── */}
          {step==="budget"&&(
            <div>
              <StepHeading title="Your Budget"/>
              <p style={{fontFamily:"var(--serif)",fontSize:15,color:"var(--ink3)",lineHeight:1.7,marginBottom:28,fontStyle:"italic"}}>
                This covers everything — turntable, cartridge, phono stage, amplifier, speakers, cables and isolation. Be honest. We'll make the most of it.
              </p>
              <div style={{marginBottom:28,padding:"20px 20px",border:"2px solid var(--ink)",background:"var(--paper)"}}>
                <div style={{fontSize:9,color:"var(--ink4)",letterSpacing:".18em",textTransform:"uppercase",fontFamily:"var(--mono)",marginBottom:10}}>Total budget</div>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <span style={{fontFamily:"var(--serif)",fontSize:24,color:"var(--ink3)"}}>{loc.symbol}</span>
                  <input type="number" min="0" step="100" value={budget||""} onChange={e=>setBudget(Math.max(0,parseInt(e.target.value)||0))} placeholder="e.g. 3000" style={{fontFamily:"var(--serif)",fontSize:28,color:"var(--ink)",borderBottom:"2px solid var(--ink)",flex:1}}/>
                </div>
              </div>

              {/* Quick select buttons */}
              <div style={{marginBottom:28}}>
                <div style={{fontSize:9,color:"var(--ink4)",letterSpacing:".14em",textTransform:"uppercase",fontFamily:"var(--mono)",marginBottom:10}}>Quick select</div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  {[1500,2500,4000,6000,10000,15000,25000].map(v=>(
                    <button key={v} onClick={()=>setBudget(v)} style={{padding:"8px 14px",fontSize:11,fontFamily:"var(--mono)",background:budget===v?"var(--ink)":"var(--paper2)",color:budget===v?"var(--paper)":"var(--ink3)",border:`1px solid ${budget===v?"var(--ink)":"var(--rule)"}`,cursor:"pointer",transition:"all .15s"}}>
                      {loc.symbol}{v.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              {budget>0&&budgetSplit&&(
                <div className="fu" style={{padding:"18px 20px",background:"var(--paper2)",border:"1px solid var(--rule)",marginBottom:8}}>
                  <div style={{fontSize:9,color:"var(--ink4)",letterSpacing:".14em",textTransform:"uppercase",fontFamily:"var(--mono)",marginBottom:12}}>How it splits out</div>
                  {[
                    ["Turntable & cartridge", (budgetSplit.turntable)+(budgetSplit.cartridge)],
                    ["Phono stage",           budgetSplit.phono],
                    ["Amplification",         budgetSplit.amplifier],
                    ["Speakers",              budgetSplit.speakers],
                    ["Cables",                budgetSplit.cables],
                    ["Isolation",             budgetSplit.isolation],
                  ].map(([label,val])=>(
                    <div key={label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:"1px solid var(--rule)"}}>
                      <span style={{fontSize:11,color:"var(--ink3)",fontFamily:"var(--mono)",letterSpacing:".06em"}}>{label}</span>
                      <span style={{fontFamily:"var(--serif)",fontSize:15,color:"var(--ink)"}}>{fmt(val,loc)}</span>
                    </div>
                  ))}
                </div>
              )}

              <NavRow onBack={()=>goTo("music")} onNext={()=>goTo("brief")} nextLabel="See my brief →"/>
            </div>
          )}

          {/* ── STEP 4: BRIEF ─────────────────────────────────────────────── */}
          {step==="brief"&&(
            <div>
              <StepHeading title="Your System Brief"/>

              {/* Character summary */}
              <div style={{marginBottom:24,padding:"24px 22px",background:"var(--ink)"}}>
                <div style={{fontSize:9,color:"rgba(245,242,232,.4)",letterSpacing:".2em",textTransform:"uppercase",fontFamily:"var(--mono)",marginBottom:10}}>Your system character</div>
                <div style={{fontFamily:"var(--serif)",fontSize:"clamp(24px,5vw,36px)",color:"var(--amber)",lineHeight:1,marginBottom:12}}>
                  {character==="warm"?"Warm & Musical":character==="detailed"?"Detailed & Analytical":"Balanced & Honest"}
                </div>
                <p style={{fontFamily:"var(--serif)",fontSize:14,color:"rgba(245,242,232,.75)",lineHeight:1.75}}>
                  {character==="warm"
                    ? "Your room, your music, and your listening preference all point toward a warm, musical system. British brands with a history of natural, fatigue-free presentation will suit you best. The goal is a system you can listen to for hours."
                    : character==="detailed"
                    ? "Your preferences point toward a detailed, analytical system. You want to hear everything in the recording. This rewards well-recorded music and careful system matching — and you'll need to spend more time on room acoustics than most."
                    : "Your preferences point toward a balanced system — neither warm and coloured nor cold and clinical. You want music to sound natural and engaging across all the genres you love. A wide range of well-made British and European equipment will suit you."}
                </p>
              </div>

              {/* Building isolation warning */}
              {bld?.isoRequired&&(
                <div className="fu" style={{marginBottom:20,padding:"16px 18px",borderLeft:"3px solid var(--red)",background:"rgba(139,32,32,.04)"}}>
                  <div style={{fontSize:9,color:"var(--red)",letterSpacing:".16em",textTransform:"uppercase",fontFamily:"var(--mono)",marginBottom:6}}>Mandatory — upper floor flat</div>
                  <p style={{fontSize:13,color:"var(--ink2)",fontFamily:"var(--serif)",lineHeight:1.65}}>Speaker isolation footers are a safety item — not optional. Budget approximately {fmt(430,loc)} for GAIA III ×8 (4 per speaker × stereo pair). This prevents structural bass transmission to the flat below.</p>
                </div>
              )}

              {/* Brand directions */}
              <div style={{marginBottom:24}}>
                {[
                  {cat:"turntable", label:"Turntable"},
                  {cat:"cartridge", label:"Cartridge"},
                  {cat:"phono",     label:"Phono Stage"},
                  {cat:"amplifier", label:"Amplification"},
                  {cat:"speakers",  label:"Speakers"},
                ].map(({cat,label})=>{
                  const profile = BRAND_PROFILES[cat]?.[character];
                  if (!profile) return null;
                  return (
                    <div key={cat} className="fu" style={{marginBottom:12,padding:"16px 18px",borderLeft:"3px solid var(--amber)",background:"var(--paper2)"}}>
                      <div style={{fontSize:9,color:"var(--amber)",letterSpacing:".16em",textTransform:"uppercase",fontFamily:"var(--mono)",marginBottom:6}}>{label}</div>
                      <div style={{fontFamily:"var(--serif)",fontSize:15,color:"var(--ink)",marginBottom:5}}>{profile.brands.join(" · ")}</div>
                      <div style={{fontSize:12,color:"var(--ink3)",fontFamily:"var(--serif)",fontStyle:"italic",lineHeight:1.6}}>{profile.why}</div>
                    </div>
                  );
                })}
              </div>

              {/* Budget reminder */}
              {budget>0&&budgetSplit&&(
                <div style={{marginBottom:24,padding:"16px 18px",background:"var(--paper2)",border:"1px solid var(--rule)"}}>
                  <div style={{fontSize:9,color:"var(--ink4)",letterSpacing:".14em",textTransform:"uppercase",fontFamily:"var(--mono)",marginBottom:12}}>Budget guidance · {fmt(budget,loc)} total</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                    {[
                      ["Source",      (budgetSplit.turntable)+(budgetSplit.cartridge)+(budgetSplit.phono)],
                      ["Amplifier",   budgetSplit.amplifier],
                      ["Speakers",    budgetSplit.speakers],
                      ["Accessories", (budgetSplit.cables)+(budgetSplit.isolation)],
                    ].map(([label,val])=>(
                      <div key={label} style={{padding:"10px 12px",background:"var(--paper)"}}>
                        <div style={{fontSize:8,color:"var(--ink4)",letterSpacing:".12em",textTransform:"uppercase",fontFamily:"var(--mono)",marginBottom:3}}>{label}</div>
                        <div style={{fontFamily:"var(--serif)",fontSize:18,color:"var(--amber)"}}>{fmt(val,loc)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Download brief */}
              <div style={{marginBottom:8,padding:"20px 20px",background:"var(--paper2)",border:"1px solid var(--rule)"}}>
                <div style={{fontSize:9,color:"var(--ink4)",letterSpacing:".16em",textTransform:"uppercase",fontFamily:"var(--mono)",marginBottom:8}}>Take this to your dealer</div>
                <p style={{fontSize:13,color:"var(--ink3)",fontFamily:"var(--serif)",lineHeight:1.65,marginBottom:14,fontStyle:"italic"}}>Download a one-page brief summarising your room, your character preference, brand directions, and budget. Show it to your dealer or read from it — it gives them everything they need to help you.</p>
                <button onClick={downloadBrief} style={{display:"inline-flex",alignItems:"center",gap:10,padding:"14px 24px",background:"var(--ink)",color:"var(--paper)",border:"none",cursor:"pointer",fontFamily:"var(--mono)",fontSize:10,letterSpacing:".14em",textTransform:"uppercase"}}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v8M3 9l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><line x1="1" y1="13" x2="13" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  Download dealer brief
                </button>
              </div>

              <NavRow onBack={()=>goTo("budget")} onNext={()=>goTo("dealers")} nextLabel="Find dealers →"/>
            </div>
          )}

          {/* ── STEP 5: DEALERS ───────────────────────────────────────────── */}
          {step==="dealers"&&(
            <div>
              <StepHeading title="Find a Dealer"/>
              <p style={{fontFamily:"var(--serif)",fontSize:14,color:"var(--ink3)",lineHeight:1.7,marginBottom:24,fontStyle:"italic"}}>
                A good specialist dealer will demo your shortlist, talk through your room, and often lend equipment for a home trial. That conversation — and that relationship — is worth more than any online tool.
              </p>

              {/* Region selector */}
              <div style={{marginBottom:28}}>
                <div style={{fontSize:9,color:"var(--ink4)",letterSpacing:".18em",textTransform:"uppercase",fontFamily:"var(--mono)",marginBottom:12}}>Your region</div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {REGIONS.map(r=>(
                    <button key={r} onClick={()=>setRegion(region===r?"":r)} style={{padding:"8px 14px",fontSize:10,fontFamily:"var(--mono)",background:region===r?"var(--ink)":"var(--paper2)",color:region===r?"var(--paper)":"var(--ink3)",border:`1px solid ${region===r?"var(--ink)":"var(--rule)"}`,cursor:"pointer",transition:"all .15s",letterSpacing:".06em"}}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Nearby dealers */}
              {nearbyDealers.length>0&&(
                <div style={{marginBottom:28}}>
                  <div style={{fontSize:9,color:"var(--amber)",letterSpacing:".18em",textTransform:"uppercase",fontFamily:"var(--mono)",marginBottom:14}}>Near you · {region}</div>
                  <div style={{display:"grid",gap:10}}>
                    {nearbyDealers.map(d=>(
                      <a key={d.name} href={d.url} target="_blank" rel="noopener noreferrer" style={{padding:"18px 18px",background:"var(--ink)",textDecoration:"none",display:"block",transition:"opacity .2s"}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                          <div style={{fontFamily:"var(--serif)",fontSize:16,color:"var(--paper)"}}>{d.name}</div>
                          <div style={{fontSize:9,color:"rgba(245,242,232,.4)",fontFamily:"var(--mono)",letterSpacing:".08em",flexShrink:0,marginLeft:12}}>{d.city}</div>
                        </div>
                        <p style={{fontSize:12,color:"rgba(245,242,232,.65)",fontFamily:"var(--serif)",lineHeight:1.6,fontStyle:"italic"}}>{d.specialism}</p>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* All other dealers */}
              <div>
                <div style={{fontSize:9,color:"var(--ink4)",letterSpacing:".18em",textTransform:"uppercase",fontFamily:"var(--mono)",marginBottom:14}}>
                  {region?"Other UK dealers":"All UK dealers"}
                </div>
                <div style={{display:"grid",gap:8}}>
                  {otherDealers.map(d=>(
                    <a key={d.name} href={d.url} target="_blank" rel="noopener noreferrer" style={{padding:"16px 18px",background:"var(--paper2)",border:"1px solid var(--rule)",textDecoration:"none",display:"block",transition:"all .15s"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
                        <div style={{fontFamily:"var(--serif)",fontSize:15,color:"var(--ink)"}}>{d.name}</div>
                        <div style={{fontSize:9,color:"var(--ink4)",fontFamily:"var(--mono)",letterSpacing:".08em",flexShrink:0,marginLeft:12}}>{d.city} · {d.region}</div>
                      </div>
                      <p style={{fontSize:11,color:"var(--ink3)",fontFamily:"var(--serif)",lineHeight:1.6,fontStyle:"italic"}}>{d.specialism}</p>
                    </a>
                  ))}
                </div>
              </div>

              {/* Feedback + restart */}
              <div style={{marginTop:32,padding:"16px 18px",background:"rgba(42,143,197,.06)",border:"1px solid rgba(42,143,197,.18)",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
                <div>
                  <div style={{fontSize:9,color:"var(--ink3)",letterSpacing:".16em",textTransform:"uppercase",marginBottom:3,fontFamily:"var(--mono)"}}>Help improve this tool</div>
                  <div style={{fontSize:10,color:"var(--ink4)",lineHeight:1.5}}>Two minutes · tells us what to build next</div>
                </div>
                <a href={TALLY_URL} target="_blank" rel="noopener noreferrer" style={{display:"inline-flex",alignItems:"center",gap:8,padding:"10px 18px",background:"rgba(42,143,197,.12)",border:"1px solid rgba(42,143,197,.4)",color:"#1E4060",fontSize:10,letterSpacing:".12em",textTransform:"uppercase",textDecoration:"none",fontFamily:"var(--mono)",whiteSpace:"nowrap"}}>Give Feedback</a>
              </div>
              <NavRow onBack={()=>goTo("brief")} nextLabel="← Start over" onNext={()=>{setStep("room");setShowLanding(true);}}/>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
