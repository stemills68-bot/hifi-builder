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

// ── FIX 1: CSS string without @import (fonts loaded separately via <link>) ──
const GLOBAL_CSS = `
:root {
  --paper:   #F5F0E8;
  --paper2:  #EDE7D8;
  --ink:     #1C1812;
  --ink2:    #3A342A;
  --ink3:    #6B6358;
  --ink4:    #9A9088;
  --rule:    #D4C9B4;
  --amber:   #B8732A;
  --amber2:  #D4943A;
  --red:     #8B2020;
  --blue:    #1E4060;
  --green:   #2A5040;
  --serif:   'Source Serif 4', 'Libre Baskerville', Georgia, serif;
  --mono:    'JetBrains Mono', 'Courier New', monospace;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { background: var(--paper); color: var(--ink); }
::selection { background: var(--amber); color: var(--paper); }

::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: var(--paper2); }
::-webkit-scrollbar-thumb { background: var(--rule); border-radius: 0; }

input[type=range] { -webkit-appearance: none; height: 2px; outline: none; cursor: pointer; border-radius: 0; }
input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 16px; height: 16px; border-radius: 0; border: 2px solid var(--paper); box-shadow: 0 0 0 1px var(--amber); cursor: pointer; background: var(--amber); }
input[type=range]::-moz-range-thumb { width: 16px; height: 16px; border-radius: 0; border: 2px solid var(--paper); background: var(--amber); cursor: pointer; }
textarea { font-family: var(--mono); font-size: 11px; line-height: 1.7; }

@keyframes fadeUp   { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
@keyframes fadeIn   { from { opacity:0; } to { opacity:1; } }
@keyframes vinylTurn { to { transform: rotate(360deg); } }
@media (max-width: 600px) {
  input[type=range]::-webkit-slider-thumb { width: 20px; height: 20px; }
  input[type=range]::-moz-range-thumb { width: 20px; height: 20px; }
  ::-webkit-scrollbar { width: 0; height: 0; }
}
@keyframes slideUp  { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
@keyframes press    { 0%{transform:scale(1)} 50%{transform:scale(.97)} 100%{transform:scale(1)} }

.fu  { animation: fadeUp .5s cubic-bezier(.16,1,.3,1) both; }
.fi  { animation: fadeIn .4s ease both; }
.vinyl-turn { animation: vinylTurn 5s linear infinite; }
.sl  { animation: slideUp .65s cubic-bezier(.16,1,.3,1) both; }
.sl1{animation-delay:.06s}.sl2{animation-delay:.14s}.sl3{animation-delay:.24s}
.sl4{animation-delay:.36s}.sl5{animation-delay:.48s}.sl6{animation-delay:.60s}

button:active:not([disabled]) { animation: press .15s ease; }

body::before {
  content:''; position:fixed; inset:0; pointer-events:none; z-index:1000; opacity:.025;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
  background-repeat: repeat; background-size: 300px 300px;
}
`;

// ── FIX 2: Hook to inject CSS + Google Fonts link once, on mount only ──
function useGlobalStyles() {
  useEffect(() => {
    // Inject Google Fonts as a <link> (avoids @import re-evaluation on every render)
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Source+Serif+4:ital,opsz,wght@0,8..60,300;0,8..60,400;0,8..60,600;1,8..60,300;1,8..60,400&family=JetBrains+Mono:wght@300;400&display=swap";
    document.head.appendChild(link);

    // Inject the CSS string once
    const style = document.createElement("style");
    style.setAttribute("data-hifi-styles", "1");
    style.textContent = GLOBAL_CSS;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(link);
      document.head.removeChild(style);
    };
  }, []); // empty deps = runs once on mount, cleans up on unmount
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOCALISATION
// ═══════════════════════════════════════════════════════════════════════════════

const LOCALES = {
  gb: {
    id:"gb", label:"United Kingdom", flag:"🇬🇧", currency:"GBP", symbol:"£",
    locale:"en-GB", measureSystem:"metric", priceMultiplier:1.0,
    buildingTypes:{
      apt_ground:   {label:"Flat / Apartment",       sub:"Ground floor"},
      apt_upper:    {label:"Flat / Apartment",       sub:"1st floor or above"},
      detached:     {label:"Detached House",         sub:"No shared walls or floors"},
      semi_detached:{label:"Semi-Detached",          sub:"One shared party wall"},
    },
    wallMaterials:[
      {value:"solid_brick",  label:"Solid Brick / Masonry"},
      {value:"plasterboard", label:"Plasterboard / Stud Wall"},
      {value:"glass",        label:"Large Glass / Windows"},
    ],
    negotiationTips:[
      {tip:"Full cash purchase — no part-exchange or finance",      saving:"–£600–1,000 typical"},
      {tip:"Bundle cabling and isolation as 'fitting accessories'", saving:"–£300–500 typical"},
      {tip:"End of financial quarter (March / September)",          saving:"Dealer targets flexible"},
      {tip:"Request ex-demonstration unit on the amplifier",        saving:"–£300–600 typical"},
      {tip:"Mention a competing quote from a rival dealer",         saving:"Psychological leverage"},
    ],
    terms:{mains:"mains",apartment:"flat",neighbor:"neighbour",drywall:"plasterboard",grounding:"earthing"},
    tierRanges:{entry:"£1.5k – £5k", mid:"£5k – £15k", high:"£15k+"},
    statsLabel:"UK brands",
    catalogueNote:"These brands have been selected for their UK provenance, service network, and demonstrated synergy with each other.",
  },
  us: {
    id:"us", label:"United States", flag:"🇺🇸", currency:"USD", symbol:"$",
    locale:"en-US", measureSystem:"imperial", priceMultiplier:1.25,
    buildingTypes:{
      apt_ground:   {label:"Apartment",              sub:"Ground floor"},
      apt_upper:    {label:"Apartment",              sub:"Upper floor"},
      detached:     {label:"Single-Family Home",     sub:"No shared walls or floors"},
      semi_detached:{label:"Townhouse / Row Home",   sub:"One shared party wall"},
    },
    wallMaterials:[
      {value:"solid_brick",  label:"Brick / Masonry"},
      {value:"plasterboard", label:"Drywall / Stud Frame"},
      {value:"glass",        label:"Large Glass / Windows"},
    ],
    negotiationTips:[
      {tip:"Pay cash up front — no financing",                      saving:"–$600–1,200 typical"},
      {tip:"Bundle cables and isolation into the package",          saving:"–$400–600 typical"},
      {tip:"End of calendar year (November / December)",            saving:"Dealer inventory clearance"},
      {tip:"Request an open-box or demo floor model",               saving:"–$400–700 typical"},
      {tip:"Get a competing quote from another authorized dealer",  saving:"Psychological leverage"},
    ],
    terms:{mains:"power line",apartment:"apartment",neighbor:"neighbor",drywall:"drywall",grounding:"grounding"},
    tierRanges:{entry:"$2k – $6k", mid:"$6k – $18k", high:"$18k+"},
    statsLabel:"International brands",
    catalogueNote:"These brands are available in the US through authorised dealers. Import pricing applies — expect 20–30% above UK MSRP.",
  },
  eu: {
    id:"eu", label:"Europe", flag:"🇪🇺", currency:"EUR", symbol:"€",
    locale:"de-DE", measureSystem:"metric", priceMultiplier:1.18,
    buildingTypes:{
      apt_ground:   {label:"Apartment",              sub:"Ground floor / Erdgeschoss"},
      apt_upper:    {label:"Apartment",              sub:"Upper floor / Obergeschoss"},
      detached:     {label:"Detached House",         sub:"No shared walls"},
      semi_detached:{label:"Semi-Detached / Reihenhaus", sub:"One shared wall"},
    },
    wallMaterials:[
      {value:"solid_brick",  label:"Solid Masonry / Beton"},
      {value:"plasterboard", label:"Plasterboard / Trockenbau"},
      {value:"glass",        label:"Large Glass / Windows"},
    ],
    negotiationTips:[
      {tip:"Full cash purchase",                                    saving:"–€500–900 typical"},
      {tip:"Bundle cables and isolation into the package price",    saving:"–€300–500 typical"},
      {tip:"End of financial year (November / December)",           saving:"Stock clearance period"},
      {tip:"Request a demonstration or ex-display model",           saving:"–€300–600 typical"},
      {tip:"Compare pricing across EU dealers",                     saving:"Useful leverage"},
    ],
    terms:{mains:"secteur",apartment:"appartement",neighbor:"voisin",drywall:"Trockenbau",grounding:"mise à la terre"},
    tierRanges:{entry:"€2k – €6k", mid:"€6k – €18k", high:"€18k+"},
    statsLabel:"International brands",
    catalogueNote:"These brands are widely distributed across Europe. Pricing shown is approximate — local VAT rates and import duties vary by country.",
  },
  au: {
    id:"au", label:"Australia", flag:"🇦🇺", currency:"AUD", symbol:"A$",
    locale:"en-AU", measureSystem:"metric", priceMultiplier:1.95,
    buildingTypes:{
      apt_ground:   {label:"Unit / Apartment",       sub:"Ground floor"},
      apt_upper:    {label:"Unit / Apartment",       sub:"Upper floor"},
      detached:     {label:"Detached House",         sub:"No shared walls"},
      semi_detached:{label:"Semi-Detached",          sub:"One shared party wall"},
    },
    wallMaterials:[
      {value:"solid_brick",  label:"Brick / Double Brick"},
      {value:"plasterboard", label:"Plasterboard / Gyprock"},
      {value:"glass",        label:"Large Glass / Windows"},
    ],
    negotiationTips:[
      {tip:"Full cash purchase",                                    saving:"–A$800–1,500 typical"},
      {tip:"Bundle accessories into the package",                   saving:"–A$500–800 typical"},
      {tip:"End of financial year (June)",                          saving:"Australian FY clearance"},
      {tip:"Request an ex-display or demo model",                   saving:"–A$500–900 typical"},
      {tip:"Mention a competing quote",                             saving:"Effective leverage"},
    ],
    terms:{mains:"mains power",apartment:"unit",neighbor:"neighbour",drywall:"Gyprock",grounding:"earthing"},
    tierRanges:{entry:"A$3k – A$8k", mid:"A$8k – A$22k", high:"A$22k+"},
    statsLabel:"International brands",
    catalogueNote:"Import pricing applies across the board. A small number of authorised dealers carry the full catalogue in Australia.",
  },
  ca: {
    id:"ca", label:"Canada", flag:"🇨🇦", currency:"CAD", symbol:"C$",
    locale:"en-CA", measureSystem:"metric", priceMultiplier:1.68,
    buildingTypes:{
      apt_ground:   {label:"Condo / Apartment",      sub:"Ground floor"},
      apt_upper:    {label:"Condo / Apartment",      sub:"Upper floor"},
      detached:     {label:"Detached House",         sub:"No shared walls"},
      semi_detached:{label:"Semi-Detached",          sub:"One shared party wall"},
    },
    wallMaterials:[
      {value:"solid_brick",  label:"Brick / Masonry"},
      {value:"plasterboard", label:"Drywall / Gypsum Board"},
      {value:"glass",        label:"Large Glass / Windows"},
    ],
    negotiationTips:[
      {tip:"Full cash or e-transfer payment",                       saving:"–C$700–1,200 typical"},
      {tip:"Bundle cables and isolation into the deal",             saving:"–C$400–700 typical"},
      {tip:"End of calendar year (November / December)",            saving:"Dealer clearance period"},
      {tip:"Request a demo or open-box unit",                       saving:"–C$400–800 typical"},
      {tip:"Compare across Canadian authorised dealers",            saving:"Leverage available"},
    ],
    terms:{mains:"power line",apartment:"condo",neighbor:"neighbour",drywall:"drywall",grounding:"grounding"},
    tierRanges:{entry:"C$2.5k – C$7k", mid:"C$7k – C$20k", high:"C$20k+"},
    statsLabel:"International brands",
    catalogueNote:"Import pricing applies. IsoAcoustics is Canadian-made and priced competitively. Most UK brands are available through specialist dealers in Toronto, Vancouver, and Montreal.",
  },
  jp: {
    id:"jp", label:"Japan", flag:"🇯🇵", currency:"JPY", symbol:"¥",
    locale:"ja-JP", measureSystem:"metric", priceMultiplier:200,
    buildingTypes:{
      apt_ground:   {label:"Apartment / マンション",  sub:"Ground floor"},
      apt_upper:    {label:"Apartment / マンション",  sub:"Upper floor"},
      detached:     {label:"Detached / 一戸建て",     sub:"No shared walls"},
      semi_detached:{label:"Terraced / 連棟住宅",     sub:"One shared wall"},
    },
    wallMaterials:[
      {value:"solid_brick",  label:"Concrete / RC Construction"},
      {value:"plasterboard", label:"Light Frame / Plasterboard"},
      {value:"glass",        label:"Large Glass / Windows"},
    ],
    negotiationTips:[
      {tip:"Purchase full system in a single transaction",          saving:"–¥100,000–200,000 typical"},
      {tip:"Include cables and isolation accessories",              saving:"–¥50,000–100,000 typical"},
      {tip:"End of fiscal year (March)",                            saving:"Japanese FY discount window"},
      {tip:"Ask for a floor model or display unit",                 saving:"–¥80,000–150,000 typical"},
      {tip:"Mention a competing online or import price",            saving:"Some leverage available"},
    ],
    terms:{mains:"電源",apartment:"マンション",neighbor:"隣人",drywall:"石膏ボード",grounding:"アース"},
    tierRanges:{entry:"¥300k – ¥700k", mid:"¥700k – ¥2M", high:"¥2M+"},
    statsLabel:"International brands",
    catalogueNote:"All brands listed are available in Japan through specialist retailers in Tokyo and Osaka. Pricing shown is approximate.",
  },
};

function formatPrice(price, loc) {
  if (!price || price === 0) return "—";
  const p = Math.round(price * loc.priceMultiplier);
  if (loc.currency === "JPY") return `${loc.symbol}${p.toLocaleString("ja-JP")}`;
  if (loc.currency === "AUD" || loc.currency === "CAD") return `${loc.symbol}${p.toLocaleString("en-AU")}`;
  return `${loc.symbol}${p.toLocaleString(loc.locale)}`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// GENRE PREFERENCES
// ═══════════════════════════════════════════════════════════════════════════════

const GENRES = [
  {
    id:"classical", label:"Classical", emoji:"🎻", desc:"Orchestral, chamber, opera, choral",
    speakerProfile:"Wide dynamic range and natural tonal accuracy are paramount. Harbeth's RADIAL cone and Spendor's linear-flow loading both excel at reproducing the full weight of an orchestra without compression. Graham Audio LS designs capture the BBC monitoring heritage specifically optimised for acoustic music.",
    ampProfile:"Low-wattage Class A amplification — Sugden especially — pairs beautifully with classical. The absence of crossover distortion at low listening levels preserves the delicacy of pianissimo passages.",
    cartridgeProfile:"MC cartridges with low moving mass reproduce the transient attack of bowed strings and piano hammers with greater accuracy. The Ortofon Cadenza series and Rega Ania Pro are both well-suited.",
    speakerWeights:{spendor:10,harbeth:12,graham_ls:12,proac:8,atc:10,chord_elec:6,kef:8,pmc:8,neat:8,focal:6,dali:6},
    ampWeights:{sugden:10,naim:6,exposure:8,rega:6,musical_fidelity:4},
  },
  {
    id:"jazz", label:"Jazz", emoji:"🎷", desc:"Acoustic jazz, bebop, fusion, vocal jazz",
    speakerProfile:"Midrange clarity and imaging precision are the priority. Jazz recordings are typically close-miked and intimate — a speaker that places instruments accurately in a small soundstage rewards attentive listening. ProAc and Harbeth both excel here. The Graham LS3/5A was literally designed for this kind of programme material.",
    ampProfile:"Class A or high-bias Class AB. Jazz at moderate levels is where Class A amplifiers make their strongest case — the low-level detail and texture of brushed cymbals and double bass is preserved without the grain that Class AB can introduce.",
    cartridgeProfile:"MM or MC both work well for jazz. The Goldring 1042 and Nagaoka MP-200 are particularly musical choices — warm without being dull, detailed without being clinical.",
    speakerWeights:{harbeth:10,proac:10,graham_ls:12,spendor:8,atc:8,neat:10,kef:8,pmc:8,dali:8,focal:6},
    ampWeights:{sugden:10,exposure:8,naim:8,rega:8,musical_fidelity:4},
  },
  {
    id:"rock", label:"Rock", emoji:"🎸", desc:"Rock, indie, punk, metal, alternative",
    speakerProfile:"Dynamic headroom and controlled bass are the priorities. ATC's professional monitor lineage gives them an authority with electric guitar and drums that few domestic speakers can match. ProAc floorstanders also handle rock well — rhythmically engaging without smearing transients. Harbeth is a less obvious choice here but works well at moderate levels.",
    ampProfile:"Power headroom matters for rock. 80W+ is advisable — not because you'll always use it, but because the headroom above your listening level prevents compression on drum transients and guitar peaks. Naim's characteristic pace and timing is a natural fit.",
    cartridgeProfile:"A cartridge with good dynamic range and fast transient response. The Ortofon 2M Black and Audio-Technica VM95ML both track fast, aggressive grooves without distortion. The Rega Ania MC is particularly well-suited to rhythmic music.",
    speakerWeights:{atc:12,proac:10,spendor:6,harbeth:4,graham_ls:4,bw:10,monitor_audio:10,pmc:10,kef:8,kudos:8,focal:8},
    ampWeights:{naim:12,musical_fidelity:8,audiolab:8,exposure:8,rega:6},
  },
  {
    id:"electronic", label:"Electronic", emoji:"🎛️", desc:"Electronic, ambient, techno, dance, synth",
    speakerProfile:"Bass extension and dynamics are critical. Electronic music often contains synthesised bass well below 40Hz and dynamic peaks that expose speaker limitations quickly. ATC active systems are extraordinary for electronic music — the built-in amplification is designed for exactly this kind of programme. A subwoofer-friendly design or genuinely extended bass response is worth prioritising.",
    ampProfile:"High power and high damping factor. The amplifier needs to control the bass drivers at high excursion without losing composure. Musical Fidelity's high-power integrateds and ATC's active systems are both strong choices.",
    cartridgeProfile:"Tracking ability under high-level bass grooves is important. The Ortofon 2M Black and Audio-Technica VM95ML both handle the wide-groove modulations of heavily cut dance pressings well. Stylus wear on heavy electronic vinyl is higher than average — budget for stylus replacement.",
    speakerWeights:{atc:14,proac:8,spendor:4,harbeth:4,musical_fidelity:8,bw:10,pmc:12,monitor_audio:10,kef:10,focal:8},
    ampWeights:{musical_fidelity:10,naim:8,audiolab:8,atc:10,rega:4},
  },
  {
    id:"pop", label:"Pop & Soul", emoji:"🎤", desc:"Pop, soul, R&B, funk, Motown",
    speakerProfile:"Vocal presence and rhythmic engagement. Pop recordings are typically produced with a strong centre image — a speaker with good midrange coherence will make vocals sound natural and present. Spendor A-line and ProAc Tablette are both excellent for voice-forward programme material.",
    ampProfile:"A balanced, uncoloured presentation works well. The Rega Brio and Audiolab 6000A both offer the clarity and timing that suits pop and soul without adding warmth that can make dense mixes sound congested.",
    cartridgeProfile:"A well-tracking MM is perfectly appropriate for pop. The Ortofon 2M Blue or Audio-Technica VM95ML both handle the varied sonic demands of pop production — from dense modern masters to vintage soul pressings.",
    speakerWeights:{spendor:10,proac:10,harbeth:8,graham_ls:6,atc:4,dali:10,monitor_audio:8,bw:8,kef:8,focal:8},
    ampWeights:{rega:10,audiolab:8,cambridge:8,exposure:8,naim:6},
  },
  {
    id:"folk", label:"Folk & Acoustic", emoji:"🪕", desc:"Folk, acoustic, singer-songwriter, Americana, bluegrass",
    speakerProfile:"Tonal naturalness above all. Acoustic guitar and voice are among the most familiar sounds a human ear encounters — any tonal colouration is immediately apparent. Harbeth's RADIAL cone technology was specifically developed to reduce cabinet resonances that colour acoustic instruments. The P3ESR and C30.2 are both exceptional for this kind of music.",
    ampProfile:"Low-power Class A is ideal. At the modest levels appropriate for intimate acoustic recordings, a Sugden 2010S2 or 3010S2D reveals textural detail — finger noise on strings, breath before a phrase — that higher-power amplifiers can obscure.",
    cartridgeProfile:"Tonal accuracy over dynamic range. The Goldring 1042, Nagaoka MP-200, and Ortofon 2M Bronze are all warm and natural in character. The Rega Exact 2 is also excellent for acoustic music.",
    speakerWeights:{harbeth:14,spendor:10,graham_ls:10,proac:8,atc:4,neat:12,dali:10,pmc:8,kef:8,focal:6},
    ampWeights:{sugden:14,exposure:8,rega:8,naim:6,musical_fidelity:4},
  },
  {
    id:"world", label:"World & Experimental", emoji:"🌍", desc:"World music, experimental, avant-garde, ambient",
    speakerProfile:"Resolution and spatial imaging. World music recordings vary enormously — from close-miked percussion to complex multi-layered ensembles. A speaker with wide, even dispersion and good imaging precision will handle this variety well. ATC and Spendor D-line both offer the neutrality to reveal what's in the recording without imposing a character.",
    ampProfile:"Neutrality and resolution. A revealing amplifier lets you hear the acoustic of recording spaces — important for world music that's often recorded in interesting venues. Chord Electronics Hugo TT2 used as a preamplifier into a power amplifier is an interesting option at higher budgets.",
    cartridgeProfile:"A high-resolution MC rewards the variety of world music. The Audio-Technica AT-ART9Xi and Ortofon Cadenza Red both combine neutrality with excellent spatial rendering.",
    speakerWeights:{atc:10,spendor:10,proac:8,harbeth:8,graham_ls:6,kef:10,pmc:10,monitor_audio:8,dali:8,focal:8},
    ampWeights:{chord_elec:10,naim:8,musical_fidelity:8,exposure:8,rega:6},
  },
];

function getGenreAdjustments(selectedGenres) {
  if (!selectedGenres || selectedGenres.length === 0) return { speakers:{}, amps:{} };
  const speakerAdj = {}, ampAdj = {};
  selectedGenres.forEach(gid => {
    const g = GENRES.find(x => x.id === gid);
    if (!g) return;
    Object.entries(g.speakerWeights||{}).forEach(([k,v]) => { speakerAdj[k] = (speakerAdj[k]||0) + v; });
    Object.entries(g.ampWeights||{}).forEach(([k,v])   => { ampAdj[k]   = (ampAdj[k]||0)   + v; });
  });
  return { speakers: speakerAdj, amps: ampAdj };
}

const BUNDLED_CARTRIDGES = {
  "e_planar1":    { name:"Carbon MM",        type:"MM", note:"Carbon MM cartridge is factory-fitted. You can replace it with any of the cartridges below for an upgrade, but it is not required." },
  "e_planar2":    { name:"Carbon MM",        type:"MM", note:"Carbon MM cartridge is factory-fitted. Upgrading to the Nd3 is the most effective first upgrade on this turntable." },
  "e_planar3rs":  { name:"Nd5",              type:"MM", note:"Nd5 moving magnet cartridge is factory-fitted and included in the price. No additional cartridge is needed." },
  "e_radius5":    { name:"Ortofon 2M Red",   type:"MM", note:"Ortofon 2M Red is factory-fitted. A complete plug-and-play package — no separate cartridge purchase needed." },
  "e_tt3":        { name:"Ortofon 2M Red",   type:"MM", note:"Ortofon 2M Red is factory-fitted. No separate cartridge needed to start playing." },
  "m_lp12_majik": { name:"Adikt MM",         type:"MM", note:"Linn Adikt MM cartridge is included. No additional cartridge needed. Upgrade to Krystal or Kandid MC when the budget allows." },
  "m_lp12_akurate":{ name:"Krystal MC",      type:"MC", note:"Linn Krystal MC cartridge is factory-fitted and included in the price. A separate phono stage compatible with MC is required — the Urika II or Uphorik are the natural choices." },
  "m_concept":    { name:"Concept MC",       type:"MC", note:"Clearaudio Concept MC cartridge is factory-fitted. A dedicated MC phono stage is required." },
  "h_planar10":   { name:"Apheta 3 MC",      type:"MC", note:"Rega Apheta 3 MC cartridge is factory-fitted and included in the £5,398 price. No additional cartridge is needed or recommended. The Aura MC phono stage is the correct partner for this cartridge." },
  "h_lp12_akurate":{ name:"Krystal MC",      type:"MC", note:"Linn Krystal MC cartridge is included. No additional cartridge needed. A dedicated MC phono stage (Urika II or Uphorik) is required." },
  "h_lp12_selekt":{ name:"Kandid MC",        type:"MC", note:"Linn Kandid MC cartridge is included. No additional cartridge needed. The Urika II internal phono stage is the correct partner." },
  "h_lp12_klimax":{ name:"Kandid MC",        type:"MC", note:"Linn Kandid MC cartridge is included in the price. The Urika II internal phono stage is the correct and only recommended partner." },
  "h_innovation": { name:"Charisma MC",      type:"MC", note:"Clearaudio Charisma MC cartridge is factory-fitted. A dedicated MC phono stage is required." },
  "h_master":     { name:"Goldfinger MC",    type:"MC", note:"Clearaudio Goldfinger Statement MC is included. Requires a reference MC phono stage." },
};

const REQUIRES_CARTRIDGE = new Set([
  "e_planar3","m_planar6","m_planar6rs","m_planar8","m_xerxes20","m_lp12_akurate"
]);

const AMPS_WITH_PHONO = new Set([
  "e_io","e_brio","e_elex4","e_6000a","e_8300a","e_cxa81","m_sn3"
]);

const CARTRIDGE_PHONO_PAIRS = {
  h_kandid:  "The Linn Kandid works best with the Linn Urika II phono stage, which mounts inside the LP12 arm-board. If you select the Kandid, the Urika II is the strongly recommended phono stage.",
  h_krystal: "The Linn Krystal is designed for the LP12 ecosystem. The Linn Urika II or Linn Uphorik are the natural phono stage partners.",
  h_aphelion2:"The Rega Aphelion 2 is designed specifically for use with the Rega Aura MC phono stage — they were co-developed for optimal noise performance.",
  h_apheta3:  "The Rega Apheta 3 pairs naturally with the Rega Aura MC or Fono Super MC. The Aura is the correct long-term partner.",
};

const VENDORS = {
  rega:        { id:"rega",        name:"Rega",           country:"UK", city:"Southend-on-Sea", col:"var(--amber)", desc:"Founded 1973. Vertically integrated manufacturer; makes own tonearms, cartridges, motors, platters. Renowned for musical pace and timing.", synergy:{rega:100,spendor:92,harbeth:88,proac:85,atc:80,graham_ls:82,naim:72,linn:75,audiolab:85,cambridge:80,musical_fidelity:78,exposure:88,sugden:85,cyrus:80,chord_elec:78,leema:82,roksan:90,clearaudio:80,ortofon:88,chord_co:85,isoacoustics:78,townshend:82,generic:30} },
  linn:        { id:"linn",        name:"Linn",           country:"UK", city:"Glasgow",         col:"#8A9FC5", desc:"Founded 1972 with the iconic LP12 turntable. Scottish audiophile institution. Vertically integrated from source to speaker.", synergy:{rega:75,spendor:80,harbeth:78,proac:82,atc:85,graham_ls:80,naim:90,linn:100,audiolab:70,cambridge:65,musical_fidelity:72,exposure:75,sugden:80,cyrus:72,chord_elec:75,leema:78,roksan:80,clearaudio:75,ortofon:85,chord_co:80,isoacoustics:85,townshend:78,generic:30} },
  roksan:      { id:"roksan",      name:"Roksan",         country:"UK", city:"London",          col:"var(--amber)", desc:"Founded 1985. Creator of the Xerxes turntable. Strong musical pedigree with a focus on dynamics and clarity.", synergy:{rega:90,spendor:85,harbeth:82,proac:88,atc:82,graham_ls:80,naim:78,linn:80,audiolab:88,cambridge:82,musical_fidelity:85,exposure:88,sugden:82,cyrus:85,chord_elec:80,leema:85,roksan:100,clearaudio:78,ortofon:85,chord_co:82,isoacoustics:80,townshend:78,generic:30} },
  clearaudio:  { id:"clearaudio",  name:"Clearaudio",     country:"DE", city:"Erlangen",        col:"#A0A0A0", desc:"German precision turntable manufacturer with UK distribution. Magnetic bearing technology. Extremely low noise floors.", synergy:{rega:80,spendor:82,harbeth:80,proac:82,atc:78,graham_ls:85,naim:72,linn:75,audiolab:80,cambridge:75,musical_fidelity:80,exposure:82,sugden:80,cyrus:78,chord_elec:82,leema:80,roksan:78,clearaudio:100,ortofon:90,chord_co:85,isoacoustics:85,townshend:82,generic:30} },
  ortofon:     { id:"ortofon",     name:"Ortofon",        country:"DK", city:"Nakskov",         col:"#6A8CAD", desc:"Danish cartridge specialist founded 1918. The world's most widely used cartridges across all price points.", synergy:{rega:88,spendor:82,harbeth:80,proac:82,atc:78,graham_ls:85,naim:75,linn:85,audiolab:80,cambridge:78,musical_fidelity:80,exposure:82,sugden:80,cyrus:78,chord_elec:80,leema:80,roksan:85,clearaudio:90,ortofon:100,chord_co:82,isoacoustics:78,townshend:82,generic:30} },
  naim:        { id:"naim",        name:"Naim",           country:"UK", city:"Salisbury",       col:"#7CA87C", desc:"Founded 1973. Defined the British amplifier sound — fast, rhythmically accurate, musically engaging. Star-earth topology.", synergy:{rega:72,spendor:88,harbeth:90,proac:88,atc:92,graham_ls:85,naim:100,linn:90,audiolab:65,cambridge:60,musical_fidelity:70,exposure:75,sugden:80,cyrus:70,chord_elec:72,leema:75,roksan:78,clearaudio:72,ortofon:75,chord_co:65,isoacoustics:85,townshend:80,generic:30} },
  sugden:      { id:"sugden",      name:"Sugden",         country:"UK", city:"Brighouse",       col:"#C8A882", desc:"Founded 1967 in West Yorkshire. Pioneer of Class A solid-state amplification. Hand-built in England.", synergy:{rega:85,spendor:90,harbeth:95,proac:90,atc:82,graham_ls:88,naim:80,linn:80,audiolab:78,cambridge:75,musical_fidelity:80,exposure:88,sugden:100,cyrus:80,chord_elec:82,leema:85,roksan:82,clearaudio:80,ortofon:80,chord_co:85,isoacoustics:80,townshend:82,generic:30} },
  exposure:    { id:"exposure",    name:"Exposure",       country:"UK", city:"Brighton",        col:"#8CB88C", desc:"Founded 1974. Beautifully engineered British amplifiers. Strong synergy with Rega sources and Spendor/ProAc speakers.", synergy:{rega:88,spendor:92,harbeth:88,proac:90,atc:80,graham_ls:85,naim:75,linn:75,audiolab:82,cambridge:80,musical_fidelity:82,exposure:100,sugden:88,cyrus:82,chord_elec:82,leema:85,roksan:88,clearaudio:82,ortofon:82,chord_co:85,isoacoustics:80,townshend:80,generic:30} },
  musical_fidelity:{ id:"musical_fidelity", name:"Musical Fidelity", country:"UK", city:"London", col:"#9A8CB8", desc:"Founded 1982. High-power, high-specification amplifiers. Strong value proposition at mid-to-high price points.", synergy:{rega:78,spendor:82,harbeth:80,proac:82,atc:85,graham_ls:80,naim:70,linn:72,audiolab:82,cambridge:80,musical_fidelity:100,exposure:82,sugden:80,cyrus:82,chord_elec:80,leema:82,roksan:85,clearaudio:80,ortofon:80,chord_co:82,isoacoustics:78,townshend:78,generic:30} },
  audiolab:    { id:"audiolab",    name:"Audiolab",       country:"UK", city:"Cambridge",       col:"#7A9A9A", desc:"Cambridge-based brand with strong British engineering heritage. Outstanding value integrated amplifiers and CD players.", synergy:{rega:85,spendor:85,harbeth:82,proac:82,atc:80,graham_ls:80,naim:65,linn:70,audiolab:100,cambridge:85,musical_fidelity:82,exposure:82,sugden:78,cyrus:85,chord_elec:78,leema:82,roksan:88,clearaudio:80,ortofon:80,chord_co:82,isoacoustics:78,townshend:78,generic:30} },
  cambridge:   { id:"cambridge",   name:"Cambridge Audio", country:"UK", city:"Cambridge",      col:"#7A8CA0", desc:"Founded 1968. Democratised high-fidelity audio. Excellent engineering at accessible price points.", synergy:{rega:80,spendor:80,harbeth:78,proac:78,atc:75,graham_ls:75,naim:60,linn:65,audiolab:85,cambridge:100,musical_fidelity:80,exposure:80,sugden:75,cyrus:88,chord_elec:75,leema:80,roksan:82,clearaudio:75,ortofon:78,chord_co:80,isoacoustics:75,townshend:75,generic:30} },
  cyrus:       { id:"cyrus",       name:"Cyrus",          country:"UK", city:"St Ives",         col:"#A09878", desc:"Spin-off from Mission Electronics in 1984. Distinctively styled compact amplifiers.", synergy:{rega:80,spendor:82,harbeth:78,proac:80,atc:78,graham_ls:78,naim:70,linn:72,audiolab:85,cambridge:88,musical_fidelity:82,exposure:82,sugden:80,cyrus:100,chord_elec:78,leema:80,roksan:85,clearaudio:78,ortofon:78,chord_co:80,isoacoustics:78,townshend:75,generic:30} },
  leema:       { id:"leema",       name:"Leema Acoustics", country:"UK", city:"Pontypridd",     col:"#B89878", desc:"Welsh manufacturer founded 2004. Precision-engineered amplifiers with excellent measured performance.", synergy:{rega:82,spendor:85,harbeth:82,proac:85,atc:82,graham_ls:82,naim:75,linn:78,audiolab:82,cambridge:80,musical_fidelity:82,exposure:85,sugden:85,cyrus:80,chord_elec:82,leema:100,roksan:85,clearaudio:80,ortofon:80,chord_co:85,isoacoustics:80,townshend:80,generic:30} },
  chord_elec:  { id:"chord_elec",  name:"Chord Electronics", country:"UK", city:"Maidstone",   col:"var(--amber)", desc:"Maidstone, Kent. Pioneering FPGA DAC technology. Hugo, Dave, Qutest acclaimed worldwide.", synergy:{rega:78,spendor:82,harbeth:82,proac:82,atc:85,graham_ls:80,naim:72,linn:75,audiolab:78,cambridge:75,musical_fidelity:80,exposure:82,sugden:82,cyrus:78,chord_elec:100,leema:82,roksan:80,clearaudio:82,ortofon:80,chord_co:80,isoacoustics:78,townshend:80,generic:30} },
  spendor:     { id:"spendor",     name:"Spendor",        country:"UK", city:"Hailsham",        col:"#A0B4C8", desc:"Founded 1969 by Spencer Hughes at the BBC. Natural, accurate midrange reproduction. Linear-flow cabinet loading.", synergy:{rega:92,spendor:100,harbeth:88,proac:82,atc:80,graham_ls:80,naim:88,linn:80,audiolab:85,cambridge:80,musical_fidelity:82,exposure:92,sugden:90,cyrus:82,chord_elec:82,leema:85,roksan:85,clearaudio:82,ortofon:82,chord_co:80,isoacoustics:90,townshend:85,generic:30} },
  harbeth:     { id:"harbeth",     name:"Harbeth",        country:"UK", city:"Lindfield",       col:"#B8A888", desc:"Founded 1977. BBC monitoring heritage. RADIAL cone technology. World-renowned for natural, fatigue-free listening.", synergy:{rega:88,spendor:88,harbeth:100,proac:82,atc:80,graham_ls:82,naim:90,linn:78,audiolab:82,cambridge:78,musical_fidelity:80,exposure:88,sugden:95,cyrus:78,chord_elec:82,leema:82,roksan:82,clearaudio:80,ortofon:80,chord_co:80,isoacoustics:88,townshend:85,generic:30} },
  proac:       { id:"proac",       name:"ProAc",          country:"UK", city:"Kings Langley",   col:"#C8B090", desc:"Founded 1979 by Stewart Tyler. Exceptional imaging and scale. Popular with Naim and tube amplifiers.", synergy:{rega:85,spendor:82,harbeth:82,proac:100,atc:80,graham_ls:82,naim:88,linn:82,audiolab:82,cambridge:80,musical_fidelity:82,exposure:90,sugden:90,cyrus:80,chord_elec:82,leema:85,roksan:88,clearaudio:82,ortofon:82,chord_co:82,isoacoustics:88,townshend:88,generic:30} },
  atc:         { id:"atc",         name:"ATC",            country:"UK", city:"Stroud",          col:"#909898", desc:"Founded 1974 by Billy Woodman. Professional studio monitors adapted for home use. Hand-wound soft-dome midrange drivers.", synergy:{rega:80,spendor:80,harbeth:80,proac:80,atc:100,graham_ls:80,naim:92,linn:85,audiolab:80,cambridge:75,musical_fidelity:85,exposure:80,sugden:82,cyrus:78,chord_elec:85,leema:82,roksan:80,clearaudio:78,ortofon:78,chord_co:82,isoacoustics:88,townshend:85,generic:30} },
  graham_ls:   { id:"graham_ls",   name:"Graham Audio",   country:"UK", city:"London",          col:"#A8A8C8", desc:"Licensed BBC LS3/5A and LS5/9 designs. Identical spec to original BBC monitors. Extraordinary midrange purity.", synergy:{rega:82,spendor:80,harbeth:82,proac:82,atc:80,graham_ls:100,naim:85,linn:80,audiolab:80,cambridge:78,musical_fidelity:80,exposure:85,sugden:88,cyrus:78,chord_elec:80,leema:82,roksan:80,clearaudio:80,ortofon:80,chord_co:80,isoacoustics:88,townshend:85,generic:30} },
  chord_co:    { id:"chord_co",    name:"Chord Company",  country:"UK", city:"Wiltshire",       col:"var(--amber)", desc:"Wiltshire cable manufacturer. Industry-standard cables. Supplied to BBC and studios.", synergy:{rega:85,spendor:80,harbeth:80,proac:82,atc:82,graham_ls:80,naim:65,linn:80,audiolab:82,cambridge:80,musical_fidelity:82,exposure:85,sugden:85,cyrus:80,chord_elec:80,leema:85,roksan:82,clearaudio:85,ortofon:82,chord_co:100,isoacoustics:78,townshend:82,generic:30} },
  townshend:   { id:"townshend",   name:"Townshend Audio", country:"UK", city:"London",         col:"#9A78C8", desc:"Founded by Max Townshend. Pioneered seismic isolation with Podiums and Platforms. Also produces cables.", synergy:{rega:82,spendor:85,harbeth:85,proac:88,atc:85,graham_ls:85,naim:80,linn:78,audiolab:78,cambridge:75,musical_fidelity:78,exposure:80,sugden:82,cyrus:75,chord_elec:80,leema:80,roksan:78,clearaudio:82,ortofon:82,chord_co:82,isoacoustics:85,townshend:100,generic:30} },
  isoacoustics:{ id:"isoacoustics",name:"IsoAcoustics",   country:"CA", city:"Toronto",         col:"#8A78C5", desc:"Canadian isolation specialist. GAIA speaker footers and Orea component platforms. Scientifically proven.", synergy:{rega:78,spendor:90,harbeth:88,proac:88,atc:88,graham_ls:88,naim:85,linn:85,audiolab:78,cambridge:75,musical_fidelity:78,exposure:80,sugden:80,cyrus:78,chord_elec:78,leema:80,roksan:80,clearaudio:85,ortofon:78,chord_co:78,isoacoustics:100,townshend:85,generic:30} },
  goldring:    { id:"goldring",    name:"Goldring",       country:"UK", city:"London",          col:"#8A9878", desc:"Founded 1906. Britain's oldest cartridge manufacturer.", synergy:{rega:88,spendor:82,harbeth:80,proac:82,atc:78,graham_ls:85,naim:78,linn:85,audiolab:82,cambridge:80,musical_fidelity:80,exposure:85,sugden:82,cyrus:80,chord_elec:78,leema:80,roksan:85,clearaudio:88,ortofon:85,chord_co:82,isoacoustics:78,townshend:80,goldring:100,audio_technica:80,nagaoka:80,generic:30} },
  audio_technica:{ id:"audio_technica", name:"Audio-Technica", country:"JP", city:"Tokyo",     col:"#7A8898", desc:"Japanese cartridge and headphone specialist. AT-VM95 series dominates the entry/mid MM market.", synergy:{rega:85,spendor:80,harbeth:78,proac:80,atc:75,graham_ls:80,naim:72,linn:80,audiolab:80,cambridge:80,musical_fidelity:78,exposure:82,sugden:80,cyrus:78,chord_elec:75,leema:78,roksan:82,clearaudio:85,ortofon:85,chord_co:80,isoacoustics:78,townshend:78,goldring:80,audio_technica:100,nagaoka:85,generic:30} },
  nagaoka:     { id:"nagaoka",     name:"Nagaoka",        country:"JP", city:"Tokyo",           col:"#9A7858", desc:"Japanese cartridge specialist. MP series uses unique boron stylus cantilever.", synergy:{rega:82,spendor:80,harbeth:80,proac:80,atc:75,graham_ls:80,naim:70,linn:78,audiolab:78,cambridge:78,musical_fidelity:78,exposure:80,sugden:80,cyrus:78,chord_elec:72,leema:78,roksan:80,clearaudio:82,ortofon:85,chord_co:78,isoacoustics:78,townshend:78,goldring:80,audio_technica:85,nagaoka:100,generic:30} },
  monitor_audio:{ id:"monitor_audio", name:"Monitor Audio", country:"UK", city:"Rayleigh",     col:"#8A7858", desc:"Founded 1972. British brand producing a wide range at every price point. RSLD ribbon tweeter technology.", synergy:{rega:82,spendor:78,harbeth:76,proac:80,atc:74,graham_ls:78,naim:80,linn:78,audiolab:82,cambridge:85,musical_fidelity:80,exposure:80,sugden:76,cyrus:80,chord_elec:72,leema:78,roksan:80,clearaudio:78,ortofon:80,chord_co:78,isoacoustics:80,townshend:78,goldring:78,audio_technica:80,nagaoka:78,generic:30} },
  kef:         { id:"kef",          name:"KEF",            country:"UK", city:"Maidstone",      col:"#5A7898", desc:"Founded 1961. Uni-Q coincident driver technology. Exceptional imaging and wide sweet spot.", synergy:{rega:80,spendor:78,harbeth:76,proac:80,atc:76,graham_ls:76,naim:78,linn:80,audiolab:82,cambridge:85,musical_fidelity:80,exposure:80,sugden:76,cyrus:80,chord_elec:76,leema:78,roksan:78,clearaudio:78,ortofon:78,chord_co:80,isoacoustics:80,townshend:80,goldring:78,audio_technica:78,nagaoka:78,generic:30} },
  dali:        { id:"dali",         name:"Dali",           country:"DK", city:"Nørager",        col:"#9A8878", desc:"Danish loudspeaker manufacturer. Known for paper cone bass drivers and ribbon/soft dome hybrid tweeters.", synergy:{rega:82,spendor:80,harbeth:78,proac:80,atc:74,graham_ls:78,naim:76,linn:78,audiolab:82,cambridge:82,musical_fidelity:80,exposure:80,sugden:80,cyrus:78,chord_elec:72,leema:78,roksan:78,clearaudio:76,ortofon:78,chord_co:78,isoacoustics:78,townshend:78,goldring:80,audio_technica:78,nagaoka:80,generic:30} },
  bw:          { id:"bw",           name:"Bowers & Wilkins",country:"UK",city:"Worthing",       col:"#6A6A7A", desc:"Founded 1966. The 600 and 700 series are among the UK's best-selling speaker ranges.", synergy:{rega:78,spendor:76,harbeth:74,proac:78,atc:76,graham_ls:74,naim:82,linn:80,audiolab:80,cambridge:82,musical_fidelity:82,exposure:78,sugden:74,cyrus:80,chord_elec:80,leema:78,roksan:76,clearaudio:78,ortofon:78,chord_co:82,isoacoustics:80,townshend:78,goldring:76,audio_technica:78,nagaoka:76,generic:30} },
  pmc:         { id:"pmc",          name:"PMC",            country:"UK", city:"St Albans",      col:"#7A8878", desc:"Professional Monitor Company. Transmission line bass loading. Used in major recording studios.", synergy:{rega:80,spendor:78,harbeth:78,proac:80,atc:82,graham_ls:78,naim:82,linn:80,audiolab:78,cambridge:78,musical_fidelity:80,exposure:80,sugden:80,cyrus:78,chord_elec:78,leema:80,roksan:78,clearaudio:78,ortofon:78,chord_co:80,isoacoustics:80,townshend:80,goldring:78,audio_technica:78,nagaoka:78,generic:30} },
  neat:        { id:"neat",         name:"Neat Acoustics", country:"UK", city:"County Durham",  col:"#8A9878", desc:"Small British manufacturer from County Durham. Hand-built, unconventional designs.", synergy:{rega:82,spendor:80,harbeth:80,proac:82,atc:78,graham_ls:82,naim:90,linn:88,audiolab:80,cambridge:78,musical_fidelity:78,exposure:82,sugden:84,cyrus:78,chord_elec:78,leema:80,roksan:80,clearaudio:78,ortofon:80,chord_co:80,isoacoustics:80,townshend:80,goldring:80,audio_technica:78,nagaoka:80,generic:30} },
  kudos:       { id:"kudos",        name:"Kudos Audio",    country:"UK", city:"County Durham",  col:"#7A8898", desc:"British manufacturer with close ties to Naim. The Super 20A and Titan series are benchmark designs.", synergy:{rega:78,spendor:76,harbeth:76,proac:78,atc:78,graham_ls:76,naim:95,linn:85,audiolab:76,cambridge:76,musical_fidelity:78,exposure:80,sugden:80,cyrus:78,chord_elec:80,leema:78,roksan:76,clearaudio:76,ortofon:78,chord_co:82,isoacoustics:82,townshend:82,goldring:76,audio_technica:78,nagaoka:76,generic:30} },
  focal:       { id:"focal",        name:"Focal",          country:"FR", city:"Saint-Étienne",  col:"#8A6858", desc:"French loudspeaker manufacturer. Beryllium tweeter and 'W' sandwich cone technology.", synergy:{rega:78,spendor:76,harbeth:74,proac:78,atc:76,graham_ls:74,naim:90,linn:80,audiolab:78,cambridge:80,musical_fidelity:80,exposure:78,sugden:76,cyrus:80,chord_elec:80,leema:78,roksan:76,clearaudio:78,ortofon:78,chord_co:82,isoacoustics:80,townshend:80,goldring:76,audio_technica:78,nagaoka:76,generic:30} },
  generic:     { id:"generic",     name:"Generic",        country:"—",  city:"—",              col:"var(--ink3)", desc:"Non-specialist alternative.", synergy:{rega:30,spendor:30,harbeth:30,proac:30,atc:30,graham_ls:30,naim:30,linn:30,audiolab:30,cambridge:30,musical_fidelity:30,exposure:30,sugden:30,cyrus:30,chord_elec:30,leema:30,roksan:30,clearaudio:30,ortofon:30,chord_co:30,isoacoustics:30,townshend:30,generic:50} },
};

const CATALOG = {
  entry: {
    tier:"entry", label:"Entry", range:"£1.5k – £5k", accent:"#7CA87C",
    components: {
      turntable:[
        {id:"e_planar1",    name:"Planar 1 Plus",      sub:"Rega · Carbon MM · RB110 · built-in phono",  vendor:"rega",  price:498,  cat:"turntable", note:"Rega's plug-and-play entry point. Includes a built-in MM phono stage. RB110 tonearm, Carbon cartridge fitted."},
        {id:"e_planar2",    name:"Planar 2",            sub:"Rega · Carbon MM standard · RB220 arm",     vendor:"rega",  price:499,  cat:"turntable", note:"RB220 tonearm, 10mm glass platter. Carbon cartridge fitted as standard. A meaningful step up from the Planar 1."},
        {id:"e_planar3",    name:"Planar 3",            sub:"Rega · no cartridge standard · RB330",      vendor:"rega",  price:695,  cat:"turntable", note:"Sold without a cartridge as standard. RB330 tonearm, 12mm glass platter. The most recommended starting point in the Rega range."},
        {id:"e_planar3rs",  name:"Planar 3 RS",         sub:"Rega · Reference Spec · Neo MK2 PSU · RB330 · Nd5", vendor:"rega", price:998, cat:"turntable", note:"Reference Spec edition. What Hi-Fi? Product of the Year 2025. The recommended choice at this price point."},
        {id:"e_radius5",    name:"Radius 5",            sub:"Roksan · Ortofon 2M Red",             vendor:"roksan",    price:649,  cat:"turntable", note:"Acrylic plinth, DC motor. Good starter from Roksan's respected lineage."},
        {id:"e_tt3",        name:"TT-3",                sub:"Cambridge Audio · Ortofon 2M Red",    vendor:"cambridge", price:399,  cat:"turntable", note:"Plug-and-play simplicity. Built-in phono stage option available."},
      ],
      cartridge:[
        {id:"e_carbon",     name:"Carbon",             sub:"Rega · Moving Magnet · 5.5mV",         vendor:"rega",          price:35,  cat:"cartridge", note:"Included with Planar 1 Plus. Upgrading to the Nd3 is the single highest-value upgrade on any entry Rega turntable."},
        {id:"e_nd3",        name:"Nd3",                sub:"Rega · Moving Magnet · Neodymium · 5mV", vendor:"rega",         price:175, cat:"cartridge", note:"Replaces the Elys 2. World-first use of Neodymium magnets in a moving magnet design."},
        {id:"e_vm95e",      name:"VM95E",              sub:"Audio-Technica · MM · Elliptical",     vendor:"audio_technica",price:75,  cat:"cartridge", note:"Elliptical stylus. Outstanding value. One of the best-measured cartridges at any price."},
        {id:"e_vm95ml",     name:"VM95ML",             sub:"Audio-Technica · MM · MicroLinear",    vendor:"audio_technica",price:149, cat:"cartridge", note:"MicroLinear stylus — superior groove tracing. Noticeably better treble detail and sibilance control."},
        {id:"e_2m_red",     name:"2M Red",             sub:"Ortofon · Moving Magnet · 5.5mV",      vendor:"ortofon",       price:99,  cat:"cartridge", note:"The world's best-selling cartridge. Nude elliptical stylus. Safe, musical, reliable."},
        {id:"e_2m_blue",    name:"2M Blue",            sub:"Ortofon · Moving Magnet · 5.5mV",      vendor:"ortofon",       price:199, cat:"cartridge", note:"Nude elliptical, improved suspension over the Red. Stylus-upgradeable to 2M Bronze."},
        {id:"e_1042",       name:"1042",               sub:"Goldring · Moving Magnet · 6.5mV",     vendor:"goldring",      price:299, cat:"cartridge", note:"Goldring's flagship MM. Exceptional value. Vivid, dynamic, and surprisingly extended at the top."},
        {id:"e_mp110",      name:"MP-110",             sub:"Nagaoka · Moving Magnet · 3.5mV",      vendor:"nagaoka",       price:125, cat:"cartridge", note:"Boron cantilever. Warm, smooth, fatigue-free."},
      ],
      amplifier:[
        {id:"e_io",         name:"io",                 sub:"Rega · 30W · MM phono · compact",     vendor:"rega",         price:245,  cat:"amplifier", note:"Rega's compact entry integrated. Built-in MM phono stage. Designed to partner the Planar 1/2 and Kyte speakers."},
        {id:"e_brio",       name:"Brio MK7",           sub:"Rega · 50W · MM phono · DAC",         vendor:"rega",         price:998,  cat:"amplifier", note:"Rega's most popular integrated. Built-in MM phono stage and DAC. The natural partner for the Planar 3."},
        {id:"e_elex4",      name:"Elex MK4",           sub:"Rega · 72W · MM phono",               vendor:"rega",         price:1498, cat:"amplifier", note:"Includes MM phono stage. Significantly more power than the Brio."},
        {id:"e_6000a",      name:"6000A",              sub:"Audiolab · 50W · MM phono",            vendor:"audiolab",     price:549,  cat:"amplifier", note:"Includes MM phono stage. Exceptional value. The benchmark entry-level integrated."},
        {id:"e_8300a",      name:"8300A",              sub:"Audiolab · 75W · MM phono",            vendor:"audiolab",     price:799,  cat:"amplifier", note:"Includes MM phono stage. A step up from the 6000A with improved power supply."},
        {id:"e_cxa81",      name:"CXA81 MK2",          sub:"Cambridge · 80W · MM phono · DAC",    vendor:"cambridge",    price:1099, cat:"amplifier", note:"Includes MM phono stage, DAC, and Bluetooth. One of the most complete entry integrateds available."},
        {id:"e_xa8200r",    name:"XA-8200R",           sub:"Roksan · 75W integrated",             vendor:"roksan",       price:899,  cat:"amplifier", note:"No built-in phono stage. Pairs naturally with Roksan Radius turntable."},
      ],
      speakers:[
        {id:"e_kyte",       name:"Kyte",               sub:"Rega · Compact standmount · phenolic",    vendor:"rega",          price:295,  cat:"speakers", note:"Rega's own compact standmount. Works across the full Rega range."},
        {id:"e_q_concept",  name:"Q Concept 20",       sub:"Q Acoustics · Standmount · 2-way",        vendor:"cambridge",     price:299,  cat:"speakers", note:"Neutral, balanced presentation. A sensible first speaker for a complete system under £800."},
        {id:"e_ma_bronze2", name:"Bronze 100",         sub:"Monitor Audio · Standmount · RSDL",       vendor:"monitor_audio", price:449,  cat:"speakers", note:"Ribbon/soft-dome hybrid tweeter. Excellent detail for the price."},
        {id:"e_dali_oberon1",name:"Oberon 1",          sub:"Dali · Compact standmount · wood fibre",  vendor:"dali",          price:399,  cat:"speakers", note:"Warm, musical, and fatigue-free. Good partner for Rega Brio."},
        {id:"e_kef_q150",   name:"Q150",               sub:"KEF · Standmount · Uni-Q",                vendor:"kef",           price:499,  cat:"speakers", note:"KEF's entry Uni-Q standmount. One of the best-measured entry standmounts available."},
        {id:"e_b1",         name:"B1",                 sub:"Spendor · Compact standmount",            vendor:"spendor",       price:849,  cat:"speakers", note:"A meaningful step up — more natural midrange and better imaging."},
        {id:"e_a1",         name:"A1 MK2",             sub:"Spendor · Standmount 2-way",              vendor:"spendor",       price:895,  cat:"speakers"},
        {id:"e_bw_607s2",   name:"607 S3",             sub:"B&W · Standmount · Continuum",            vendor:"bw",            price:699,  cat:"speakers", note:"Continuum cone mid/bass driver, decoupled tweeter. Natural partner for Cambridge CXA81."},
        {id:"e_tablette",   name:"Tablette 10",        sub:"ProAc · Standmount · front-ported",       vendor:"proac",         price:1195, cat:"speakers", note:"Front-ported design — works well close to rear and side walls."},
        {id:"e_gr_ls3",     name:"LS3/5A",             sub:"Graham Audio · BBC licensed standmount",  vendor:"graham_ls",     price:1995, cat:"speakers"},
        {id:"e_p3esr",      name:"P3ESR XD",           sub:"Harbeth · BBC LS3/5A heritage",           vendor:"harbeth",       price:2798, cat:"speakers"},
        {id:"e_dali_oberon5",name:"Oberon 5",          sub:"Dali · Compact floorstander · 2-way",     vendor:"dali",          price:699,  cat:"speakers", note:"Dali's entry floorstander. Warm and forgiving — good for smaller rooms."},
        {id:"e_ma_bronze6",  name:"Bronze 500",        sub:"Monitor Audio · Floorstander · RSDL",     vendor:"monitor_audio", price:899,  cat:"speakers", note:"Ribbon tweeter, three-driver array. Genuinely capable bass extension."},
        {id:"e_kef_q550",    name:"Q550",              sub:"KEF · Floorstander · Uni-Q",              vendor:"kef",           price:799,  cat:"speakers", note:"Wide sweet spot makes placement more forgiving than most floorstanders."},
        {id:"e_bw_603s3",    name:"603 S3",            sub:"B&W · Floorstander · Continuum",          vendor:"bw",            price:1099, cat:"speakers", note:"Three-way with Continuum cone. Needs at least 60W to perform well."},
        {id:"e_a2",          name:"A2",                sub:"Spendor · Compact floorstander",          vendor:"spendor",       price:1195, cat:"speakers"},
      ],
      phono:[
        {id:"e_builtin",    name:"Use Amp's Built-in", sub:"MM only · no extra cost",             vendor:"generic",      price:0,    cat:"phono", note:"Many entry-level integrated amplifiers include a competent MM phono stage."},
        {id:"e_rega_mm",    name:"Rega MM",             sub:"Rega · Moving Magnet · dedicated",    vendor:"rega",         price:275,  cat:"phono", note:"Rega's current dedicated MM phono stage. The natural first dedicated phono stage for any Rega-based MM system."},
        {id:"e_fono_mini",  name:"Fono Mini A2D",      sub:"Rega · MM/MC · USB output",           vendor:"rega",         price:195,  cat:"phono", note:"MM and MC stages plus USB ripping output. Compact and excellent value."},
        {id:"e_fono_mm",    name:"Fono MM MK3",        sub:"Rega · MM dedicated",                 vendor:"rega",         price:245,  cat:"phono", note:"Purpose-built Moving Magnet stage. Noticeably lower noise floor than a built-in amp stage."},
        {id:"e_ph100",      name:"Solo MM",            sub:"Audiolab · Moving Magnet",            vendor:"audiolab",     price:149,  cat:"phono", note:"Dedicated MM stage. A meaningful step up from built-in."},
        {id:"e_azur651p",   name:"Azur 651P",          sub:"Cambridge · MM/MC",                   vendor:"cambridge",    price:149,  cat:"phono", note:"MM and MC compatible. Good flexibility if you upgrade your cartridge."},
        {id:"e_tcx2",       name:"TC-X2",              sub:"Roksan · MM/MC",                      vendor:"roksan",       price:199,  cat:"phono", note:"Good synergy with Roksan turntables."},
        {id:"e_1042e",      name:"E3",                 sub:"Goldring · MM/MC phono",              vendor:"goldring",     price:249,  cat:"phono", note:"Good value MM/MC phono from Goldring."},
      ],
      cables:[
        {id:"e_clearway_r", name:"Clearway RCA",       sub:"Chord Co. · Interconnect 1m",         vendor:"chord_co",     price:55,   cat:"cables", note:"Recommended starting point. Connects your turntable (or phono stage) to your amplifier."},
        {id:"e_clearway_s", name:"Clearway X Speaker", sub:"Chord Co. · Speaker cable 3m pair",   vendor:"chord_co",     price:110,  cat:"cables"},
        {id:"e_carnival",   name:"Carnival Silver",    sub:"Chord Co. · Speaker 3m pair",         vendor:"chord_co",     price:85,   cat:"cables"},
      ],
      isolation:[
        {id:"e_orea_b",     name:"Orea Bordeaux ×3",   sub:"IsoAcoustics · Component footers",   vendor:"isoacoustics", price:109,  cat:"isolation", note:"Three footers sit under your turntable or phono stage. The single most effective isolation upgrade for a first system."},
        {id:"e_gaia3",      name:"GAIA III ×4",        sub:"IsoAcoustics · Speaker footers",      vendor:"isoacoustics", price:215,  cat:"isolation"},
      ],
      power:[
        {id:"e_protoplex",  name:"ProtoPlex 4",        sub:"Chord Co. · Mains block 4-way",       vendor:"chord_co",     price:85,   cat:"power", note:"A filtered 4-way mains block. Better than a generic power strip from a hardware store."},
      ],
    },
  },

  mid: {
    tier:"mid", label:"Mid", range:"£5k – £15k", accent:"#B8732A",
    components: {
      turntable:[
        {id:"m_planar6",    name:"Planar 6",            sub:"Rega · no cartridge standard · RB330 · Neo PSU",  vendor:"rega",  price:1295, cat:"turntable", note:"Sold without a cartridge as standard. Tancast 8 foam core plinth, RB330 tonearm, Neo MK2 PSU. What Hi-Fi? Award winner."},
        {id:"m_planar6rs",  name:"Planar 6 RS",         sub:"Rega · Reference Spec · HPL plinth · RB330",vendor:"rega",    price:1695, cat:"turntable", note:"Reference Spec Planar 6 — aluminium HPL laminate plinth. The recommended P6 to buy."},
        {id:"m_planar8",    name:"Planar 8",            sub:"Rega · no cartridge standard · RB880 · Neo PSU",  vendor:"rega",  price:2695, cat:"turntable", note:"RB880 tonearm, triple-layer glass platter. Performance approaches the P10 at a substantial saving."},
        {id:"m_lp12_majik", name:"LP12 Majik",          sub:"Linn · Karousel bearing · Adikt MM",  vendor:"linn",         price:2895, cat:"turntable", note:"The iconic LP12 in its most accessible form. Karousel bearing is a major upgrade. Upgradeable indefinitely."},
        {id:"m_lp12_akurate",name:"LP12 Akurate",      sub:"Linn · Karousel · Ekos SE · Krystal", vendor:"linn",         price:7995, cat:"turntable", note:"Mid-hierarchy LP12 with Ekos SE tonearm and Krystal MC cartridge."},
        {id:"m_xerxes20",   name:"Xerxes 20+",          sub:"Roksan · Reference suspended",        vendor:"roksan",       price:3995, cat:"turntable", note:"Suspended subchassis design. Exceptional speed stability."},
        {id:"m_concept",    name:"Concept",             sub:"Clearaudio · Satisfy tonearm · Concept MC", vendor:"clearaudio", price:1895, cat:"turntable"},
      ],
      cartridge:[
        {id:"m_nd5",        name:"Nd5",                sub:"Rega · Moving Magnet · Neodymium · nude elliptical", vendor:"rega", price:295, cat:"cartridge", note:"Replaces the Exact 2. Nude perfect elliptical diamond stylus. Hi-Fi Choice Recommended."},
        {id:"m_nd7",        name:"Nd7",                sub:"Rega · Moving Magnet · Fine Line nude diamond", vendor:"rega",  price:450,  cat:"cartridge", note:"Top of the Nd range. Same Fine Line nude diamond stylus profile as the Apheta 3 MC. AVForums Editors Choice 2024/2025."},
        {id:"m_2m_bronze",  name:"2M Bronze",          sub:"Ortofon · MM · Fine Line stylus",      vendor:"ortofon",      price:375,  cat:"cartridge", note:"Fine Line stylus, exceptional detail retrieval for an MM. The best mass-market MM currently available."},
        {id:"m_2m_black",   name:"2M Black",           sub:"Ortofon · MM · Shibata stylus",        vendor:"ortofon",      price:649,  cat:"cartridge", note:"Shibata stylus — the most revealing stylus profile made. Requires excellent tonearm alignment."},
        {id:"m_1042_mm",    name:"1042",               sub:"Goldring · MM · Special Gyger II",     vendor:"goldring",     price:299,  cat:"cartridge", note:"Goldring's flagship MM. Exceptional tracking and channel separation."},
        {id:"m_mp200",      name:"MP-200",             sub:"Nagaoka · MM · Boron · Vital",         vendor:"nagaoka",      price:299,  cat:"cartridge", note:"Vital stylus profile on boron cantilever. Smooth, musical, low distortion."},
        {id:"m_ania",       name:"Ania",               sub:"Rega · Moving Coil · 350μV",           vendor:"rega",         price:399,  cat:"cartridge", note:"Rega's entry MC. Natural upgrade path from Exact 2. Significant jump in resolution."},
        {id:"m_ania_pro",   name:"Ania Pro",           sub:"Rega · Moving Coil · 500μV · boron",   vendor:"rega",         price:699,  cat:"cartridge", note:"Boron cantilever. Higher output — works with more phono stages. The best value MC Rega make."},
        {id:"m_2m_blk_lv",  name:"2M Black LVB 250",  sub:"Ortofon · MM · 0.3mV low-voltage",    vendor:"ortofon",      price:849,  cat:"cartridge", note:"Unique low-voltage MM. More dynamics than standard 2M Black."},
        {id:"m_quintet_bk", name:"Quintet Black S",    sub:"Ortofon · Moving Coil · 500μV",        vendor:"ortofon",      price:649,  cat:"cartridge", note:"High-output MC. Works with more phono stages than low-output MCs."},
        {id:"m_cadenza_red",name:"Cadenza Red",        sub:"Ortofon · Moving Coil · 500μV",        vendor:"ortofon",      price:699,  cat:"cartridge", note:"Entry Cadenza series. Shibata stylus. One of the finest MCs at this price."},
        {id:"m_ethos",      name:"Ethos",              sub:"Goldring · Moving Coil · 500μV",       vendor:"goldring",     price:549,  cat:"cartridge", note:"Goldring's flagship MC. High output makes it easy to accommodate."},
        {id:"m_at_art9xi",  name:"AT-ART9Xi",          sub:"Audio-Technica · MC · 500μV",          vendor:"audio_technica",price:599, cat:"cartridge", note:"High-output version of the ART9. Exceptional channel separation and speed."},
      ],
      amplifier:[
        {id:"m_elicit",     name:"Elicit MK5",         sub:"Rega · 105W integrated",              vendor:"rega",         price:2498, cat:"amplifier", note:"No built-in phono stage. Rega's most popular serious integrated."},
        {id:"m_aethos",     name:"Aethos",             sub:"Rega · 125W integrated",              vendor:"rega",         price:3498, cat:"amplifier", note:"No built-in phono stage. Rega's flagship integrated. Class A/AB output stage."},
        {id:"m_nait_xs3",   name:"Nait XS3",           sub:"Naim · 70W integrated",               vendor:"naim",         price:2449, cat:"amplifier", note:"No built-in phono stage. Naim's characteristic pace and timing."},
        {id:"m_sn3",        name:"SuperNait 3",        sub:"Naim · 80W · MM phono",               vendor:"naim",         price:3999, cat:"amplifier", note:"Includes MM phono stage — the only mid-range Naim with built-in phono."},
        {id:"m_2010s2",     name:"2010S2",             sub:"Sugden · 30W Pure Class A",           vendor:"sugden",       price:1895, cat:"amplifier", note:"No built-in phono. 30W pure Class A. Extraordinary midrange warmth for Classical, Jazz, and Folk."},
        {id:"m_3010s2",     name:"3010S2D",            sub:"Sugden · 35W Class A · DAC",          vendor:"sugden",       price:2450, cat:"amplifier", note:"No built-in phono. Adds a DAC to the 2010S2."},
        {id:"m_3050se",     name:"3050SE",             sub:"Exposure · 75W integrated",           vendor:"exposure",     price:2195, cat:"amplifier", note:"No built-in phono. Strong synergy with Rega sources and Spendor/ProAc speakers."},
        {id:"m_m2si",       name:"M2si",               sub:"Musical Fidelity · 75W integrated",   vendor:"musical_fidelity",price:1499, cat:"amplifier", note:"No built-in phono. High power, clean sound. Excellent value."},
        {id:"m_lyra",       name:"Lyra Integrated",    sub:"Leema · 100W integrated",             vendor:"leema",        price:2495, cat:"amplifier", note:"No built-in phono. Welsh-made. Excellent measured performance."},
        {id:"m_8300mb",     name:"8300MB",             sub:"Audiolab · Monoblock pair",           vendor:"audiolab",     price:1998, cat:"amplifier", note:"No built-in phono. Exceptional power for the money. Each speaker gets its own amplifier."},
      ],
      speakers:[
        {id:"m_c30",        name:"C30.2 XD",           sub:"Harbeth · Compact standmount · RADIAL",   vendor:"harbeth",       price:2798, cat:"speakers"},
        {id:"m_kef_r3",     name:"R3 Meta",            sub:"KEF · Standmount · Metamaterial Uni-Q",   vendor:"kef",           price:2299, cat:"speakers", note:"Metamaterial Absorption Technology reduces rear tweeter distortion. Exceptionally wide sweet spot."},
        {id:"m_response2",  name:"Response D2R",       sub:"ProAc · Standmount · ribbon tweeter",     vendor:"proac",         price:3695, cat:"speakers", note:"Ribbon tweeter. Front-ported — works against rear walls. Extremely versatile placement."},
        {id:"m_pmc_twenty5_21",name:"Twenty5 21i",     sub:"PMC · Standmount · transmission line",   vendor:"pmc",           price:2499, cat:"speakers", note:"Transmission line bass loading. Studio-grade accuracy. Excellent for Jazz and Classical."},
        {id:"m_neat_sx3",   name:"Sx3i",               sub:"Neat · Standmount · isobaric",            vendor:"neat",          price:2495, cat:"speakers", note:"Remarkably full range for its size. Natural partner for Naim and Linn amplification."},
        {id:"m_gr_ls5_9",   name:"LS5/9",              sub:"Graham Audio · BBC licensed 2-way",       vendor:"graham_ls",     price:4995, cat:"speakers"},
        {id:"m_dali_rubicon2",name:"Rubicon 2",        sub:"Dali · Standmount · ribbon hybrid",       vendor:"dali",          price:1999, cat:"speakers", note:"Ribbon/soft dome hybrid tweeter. Natural, grain-free high frequencies."},
        {id:"m_p3esr",      name:"P3ESR XD",           sub:"Harbeth · BBC LS3/5A heritage",           vendor:"harbeth",       price:2798, cat:"speakers"},
        {id:"m_bw_705s3",   name:"705 S3",             sub:"B&W · Standmount · Carbon Dome",          vendor:"bw",            price:2299, cat:"speakers", note:"Carbon fibre dome tweeter, Continuum cone. Class-leading treble resolution."},
        {id:"m_classic7",   name:"Classic 7",          sub:"Spendor · Floorstander 3-way",            vendor:"spendor",       price:3495, cat:"speakers"},
        {id:"m_kef_r7",     name:"R7 Meta",            sub:"KEF · Floorstander · Metamaterial Uni-Q", vendor:"kef",           price:4499, cat:"speakers", note:"Wide, room-filling sound with a remarkably even off-axis response."},
        {id:"m_ma_gold200", name:"Gold 200",           sub:"Monitor Audio · Floorstander · RSDL",     vendor:"monitor_audio", price:2499, cat:"speakers", note:"Ribbon/dome hybrid tweeter plus ceramic cone drivers."},
        {id:"m_dali_rubicon6",name:"Rubicon 6",        sub:"Dali · Floorstander · ribbon hybrid",     vendor:"dali",          price:2999, cat:"speakers", note:"Natural, warm, and fatigue-free. Good match for Sugden Class A amplification."},
        {id:"m_scm40",      name:"SCM40",              sub:"ATC · Floorstander passive",               vendor:"atc",           price:4498, cat:"speakers", note:"Requires 100W+ amplification. Extraordinary accuracy and dynamic range."},
        {id:"m_pmc_twenty5_23",name:"Twenty5 23i",     sub:"PMC · Floorstander · transmission line",  vendor:"pmc",           price:3999, cat:"speakers", note:"Unusually deep and well-controlled bass. Excellent for Rock and Electronic music."},
        {id:"m_focal_kanta1",name:"Kanta No.1",        sub:"Focal · Standmount · Beryllium",          vendor:"focal",         price:3999, cat:"speakers", note:"Flax cone, Beryllium tweeter. Natural partner for Naim amplification."},
        {id:"m_shl5",       name:"SHL5 Plus",          sub:"Harbeth · Floorstander · RADIAL",         vendor:"harbeth",       price:5498, cat:"speakers"},
        {id:"m_d30rs",      name:"D30RS",              sub:"ProAc · Floorstander · ribbon",            vendor:"proac",         price:5995, cat:"speakers"},
        {id:"m_d72",        name:"D7.2",               sub:"Spendor · Floorstander · linear flow",    vendor:"spendor",       price:5650, cat:"speakers"},
        {id:"m_kudos_x2",   name:"X2",                 sub:"Kudos · Standmount · isobaric",           vendor:"kudos",         price:3995, cat:"speakers", note:"Isobaric bass loading — exceptionally articulate and fast. Outstanding synergy with Naim."},
        {id:"m_bw_703s3",   name:"703 S3",             sub:"B&W · Floorstander · Carbon Dome",        vendor:"bw",            price:3499, cat:"speakers", note:"Three-way, Carbon dome tweeter. Strong partner for Naim or Musical Fidelity."},
      ],
      phono:[
        {id:"m_builtin",    name:"Use Amp's Built-in", sub:"MM only · SuperNait 3 / some integrateds", vendor:"generic", price:0, cat:"phono", note:"The Naim SuperNait 3 includes a capable MM stage."},
        {id:"m_rega_mm2",   name:"Rega MM",             sub:"Rega · Moving Magnet · dedicated",    vendor:"rega",         price:275,  cat:"phono"},
        {id:"m_fono_mm2",   name:"Fono MM MK3",        sub:"Rega · MM dedicated",                 vendor:"rega",         price:245,  cat:"phono"},
        {id:"m_mm100",      name:"MM100",              sub:"Musical Fidelity · MM/MC",            vendor:"musical_fidelity",price:299, cat:"phono"},
        {id:"m_fono_mc",    name:"Fono MC MK3",        sub:"Rega · Dedicated MC",                 vendor:"rega",         price:498,  cat:"phono", note:"Purpose-built MC stage. Required once you move to a Moving Coil cartridge."},
        {id:"m_io_mk3",     name:"io MK3",             sub:"Rega · MM/MC · ultra-quiet",          vendor:"rega",         price:698,  cat:"phono"},
        {id:"m_fono_super", name:"Fono Super MC",      sub:"Rega · Ultra-low noise MC",           vendor:"rega",         price:795,  cat:"phono"},
        {id:"m_aios",       name:"Aios",               sub:"Rega · Reference MC phono stage",     vendor:"rega",         price:1500, cat:"phono"},
        {id:"m_graham_ref", name:"Reflex M",           sub:"Graham Slee · MM/MC",                 vendor:"generic",      price:449,  cat:"phono"},
      ],
      cables:[
        {id:"m_shawline_r", name:"Shawline RCA",       sub:"Chord Co. · Interconnect 1m",         vendor:"chord_co",     price:108,  cat:"cables"},
        {id:"m_shawline_s", name:"Shawline X Speaker", sub:"Chord Co. · 5m pair",                 vendor:"chord_co",     price:420,  cat:"cables"},
        {id:"m_epic_r",     name:"Epic RCA",           sub:"Chord Co. · Interconnect 1m",         vendor:"chord_co",     price:195,  cat:"cables"},
        {id:"m_epic_s",     name:"Epic X Speaker",     sub:"Chord Co. · 5m pair",                 vendor:"chord_co",     price:695,  cat:"cables"},
        {id:"m_fractal_s",  name:"Fractal Speaker",    sub:"Townshend · 3m pair",                 vendor:"townshend",    price:895,  cat:"cables"},
      ],
      isolation:[
        {id:"m_gaia3",      name:"GAIA III ×4",        sub:"IsoAcoustics · Speaker footer",       vendor:"isoacoustics", price:215,  cat:"isolation"},
        {id:"m_gaia2",      name:"GAIA II ×4",         sub:"IsoAcoustics · Speaker footer",       vendor:"isoacoustics", price:330,  cat:"isolation"},
        {id:"m_orea_g",     name:"Orea Graphite ×3",   sub:"IsoAcoustics · Component footers",    vendor:"isoacoustics", price:149,  cat:"isolation"},
        {id:"m_seismic",    name:"Seismic Platform",   sub:"Townshend · Component isolation",     vendor:"townshend",    price:645,  cat:"isolation"},
      ],
      power:[
        {id:"m_powerhaus",  name:"PowerHAUS M6",       sub:"Chord Co. · Mains block 6-way",       vendor:"chord_co",     price:295,  cat:"power"},
        {id:"m_groundarray",name:"GroundArray",        sub:"Chord Co. · System earth block",      vendor:"chord_co",     price:125,  cat:"power"},
      ],
    },
  },

  high: {
    tier:"high", label:"High", range:"£15k+", accent:"#C5782A",
    components: {
      turntable:[
        {id:"h_planar10",   name:"Planar 10",          sub:"Rega · Apheta 3 MC · RB3000",         vendor:"rega",         price:5398, cat:"turntable"},
        {id:"h_lp12_akurate",name:"LP12 Akurate",     sub:"Linn · Karousel · Ekos SE · Krystal", vendor:"linn",         price:7995, cat:"turntable"},
        {id:"h_lp12_selekt",name:"LP12 Selekt",        sub:"Linn · Karousel · Ekos SE · Kandid",  vendor:"linn",         price:12995,cat:"turntable"},
        {id:"h_lp12_klimax",name:"LP12 Klimax",        sub:"Linn · Radikal PSU · Ekos SE · Kandid",vendor:"linn",        price:22995,cat:"turntable"},
        {id:"h_innovation", name:"Innovation Compact", sub:"Clearaudio · Universal · Charisma MC", vendor:"clearaudio",   price:8995, cat:"turntable"},
        {id:"h_master",     name:"Master Innovation",  sub:"Clearaudio · Unify tonearm · Goldfinger",vendor:"clearaudio", price:18995,cat:"turntable"},
      ],
      cartridge:[
        {id:"h_nd9",        name:"Nd9",                sub:"Rega · Moving Magnet · Boron · Fine Line · reference", vendor:"rega", price:695, cat:"cartridge"},
        {id:"h_apheta3",    name:"Apheta 3",           sub:"Rega · MC · 350μV · fine-line",        vendor:"rega",         price:799,  cat:"cartridge"},
        {id:"h_aphelion2",  name:"Aphelion 2",         sub:"Rega · MC · 350μV · boron",            vendor:"rega",         price:2999, cat:"cartridge"},
        {id:"h_cadenza_bk", name:"Cadenza Black",      sub:"Ortofon · MC · 0.33mV · Shibata",      vendor:"ortofon",      price:1299, cat:"cartridge"},
        {id:"h_windfeld",   name:"A95",                sub:"Ortofon · MC · 0.2mV · Replicant",     vendor:"ortofon",      price:2699, cat:"cartridge"},
        {id:"h_ethos_ref",  name:"Ethos",              sub:"Goldring · MC · 500μV",                vendor:"goldring",     price:549,  cat:"cartridge"},
        {id:"h_art1000",    name:"AT-ART1000",         sub:"Audio-Technica · MC · 0.2mV · direct-coupled",vendor:"audio_technica",price:3499,cat:"cartridge"},
        {id:"h_krystal",    name:"Krystal",            sub:"Linn · MC · 0.35mV",                   vendor:"linn",         price:1650, cat:"cartridge"},
        {id:"h_kandid",     name:"Kandid",             sub:"Linn · MC · 0.35mV · reference",       vendor:"linn",         price:3495, cat:"cartridge"},
      ],
      amplifier:[
        {id:"h_aethos_h",   name:"Aethos",             sub:"Rega · 125W flagship integrated",     vendor:"rega",         price:3498, cat:"amplifier"},
        {id:"h_3050ref",    name:"3050S2 Reference",   sub:"Exposure · 110W reference integrated",vendor:"exposure",     price:3995, cat:"amplifier"},
        {id:"h_ja5010",     name:"Masterclass IA-4",   sub:"Sugden · 35W Pure Class A",           vendor:"sugden",       price:5250, cat:"amplifier"},
        {id:"h_m8xi",       name:"M8xi",               sub:"Musical Fidelity · 550W integrated",  vendor:"musical_fidelity",price:5999,cat:"amplifier"},
        {id:"h_qutest",     name:"Hugo TT2 + Etude",   sub:"Chord Electronics · DAC + power amp", vendor:"chord_elec",   price:8498, cat:"amplifier"},
        {id:"h_252_250",    name:"NAC 252 + NAP 250DR",sub:"Naim · Pre-power combination",        vendor:"naim",         price:11998,cat:"amplifier"},
        {id:"h_552_500",    name:"NAC 552 + NAP 500DR",sub:"Naim · Reference pre-power",          vendor:"naim",         price:28995,cat:"amplifier"},
        {id:"h_selekt_dsm", name:"Selekt DSM",          sub:"Linn · Streaming pre-amp · Katalyst DAC",vendor:"linn",     price:5995, cat:"amplifier"},
        {id:"h_akurate_dsm",name:"Akurate DSM",         sub:"Linn · Reference streaming pre-amp", vendor:"linn",         price:8995, cat:"amplifier"},
      ],
      speakers:[
        {id:"h_40_3",       name:"40.3 XD",            sub:"Harbeth · Flagship standmount · RADIAL",   vendor:"harbeth",       price:6998, cat:"speakers"},
        {id:"h_kef_ref1",   name:"Reference 1 Meta",   sub:"KEF · Standmount · Metamaterial Uni-Q",    vendor:"kef",           price:7999, cat:"speakers"},
        {id:"h_bw_805d4",   name:"805 D4",             sub:"B&W · Standmount · Diamond tweeter",       vendor:"bw",            price:5499, cat:"speakers"},
        {id:"h_focal_sopra1",name:"Sopra No.1",        sub:"Focal · Standmount · Beryllium",           vendor:"focal",         price:8499, cat:"speakers"},
        {id:"h_pmc_fact3",  name:"Fact.3",             sub:"PMC · Standmount · transmission line",     vendor:"pmc",           price:5999, cat:"speakers"},
        {id:"h_neat_ekstra", name:"Ekstra",            sub:"Neat · Standmount · isobaric",             vendor:"neat",          price:5495, cat:"speakers"},
        {id:"h_d72_h",      name:"D7.2",               sub:"Spendor · Floorstander · linear flow",     vendor:"spendor",       price:5650, cat:"speakers"},
        {id:"h_kef_ref3",   name:"Reference 3 Meta",   sub:"KEF · Floorstander · Metamaterial Uni-Q",  vendor:"kef",           price:12999,cat:"speakers"},
        {id:"h_bw_804d4",   name:"804 D4",             sub:"B&W · Floorstander · Diamond tweeter",     vendor:"bw",            price:6999, cat:"speakers"},
        {id:"h_focal_kanta2",name:"Kanta No.2",        sub:"Focal · Floorstander · Beryllium",         vendor:"focal",         price:7999, cat:"speakers"},
        {id:"h_shl5xd",     name:"SHL5 Plus XD",       sub:"Harbeth · Anniversary floorstander",       vendor:"harbeth",       price:8498, cat:"speakers"},
        {id:"h_d92",        name:"D9.2",               sub:"Spendor · Reference floorstander",         vendor:"spendor",       price:9495, cat:"speakers"},
        {id:"h_ls5_8",      name:"LS5/8",              sub:"Graham Audio · BBC reference",             vendor:"graham_ls",     price:8995, cat:"speakers"},
        {id:"h_pmc_fact12",  name:"Fact.12",           sub:"PMC · Floorstander · transmission line",   vendor:"pmc",           price:12999,cat:"speakers"},
        {id:"h_kudos_titan505",name:"Titan 505",       sub:"Kudos · Floorstander · isobaric",          vendor:"kudos",         price:9500, cat:"speakers"},
        {id:"h_response5",  name:"Response D48R",      sub:"ProAc · Flagship ribbon floorstander",     vendor:"proac",         price:9995, cat:"speakers"},
        {id:"h_scm50",      name:"SCM50",              sub:"ATC · Reference passive studio",           vendor:"atc",           price:9995, cat:"speakers"},
        {id:"h_scm50a",     name:"SCM50ASL",           sub:"ATC · Active reference studio",            vendor:"atc",           price:14995,cat:"speakers"},
      ],
      phono:[
        {id:"h_aura_mc",    name:"Aura MC",            sub:"Rega · Reference MC phono stage",     vendor:"rega",         price:3998, cat:"phono"},
        {id:"h_superline",  name:"Superline",          sub:"Naim · Reference MC phono",           vendor:"naim",         price:3799, cat:"phono"},
        {id:"h_trio",       name:"Trio",               sub:"Clearaudio · Balanced MC",            vendor:"clearaudio",   price:2395, cat:"phono"},
        {id:"h_mf_vinyl",   name:"Nu-Vista Vinyl",     sub:"Musical Fidelity · Valve/solid MC",   vendor:"musical_fidelity",price:2999,cat:"phono"},
        {id:"h_symphony",   name:"Symphony",           sub:"Leema · Fully balanced",              vendor:"leema",        price:2995, cat:"phono"},
      ],
      cables:[
        {id:"h_sarum_r",    name:"Sarum T RCA",        sub:"Chord Co. · Interconnect 1m",         vendor:"chord_co",     price:1250, cat:"cables"},
        {id:"h_sarum_s",    name:"Sarum T Speaker",    sub:"Chord Co. · 3m pair reference",       vendor:"chord_co",     price:2800, cat:"cables"},
        {id:"h_fractal_ref",name:"Fractal Speaker Ref",sub:"Townshend · Reference 3m pair",       vendor:"townshend",    price:2495, cat:"cables"},
        {id:"h_music_r",    name:"ChordMusic RCA",     sub:"Chord Co. · Flagship 1m",             vendor:"chord_co",     price:2200, cat:"cables"},
        {id:"h_music_s",    name:"ChordMusic Speaker", sub:"Chord Co. · Flagship 3m pair",        vendor:"chord_co",     price:5800, cat:"cables"},
      ],
      isolation:[
        {id:"h_gaia1",      name:"GAIA I ×4",          sub:"IsoAcoustics · Reference footers",    vendor:"isoacoustics", price:580,  cat:"isolation"},
        {id:"h_orea_bor",   name:"Orea Bordeaux ×4",   sub:"IsoAcoustics · Component footers",   vendor:"isoacoustics", price:436,  cat:"isolation"},
        {id:"h_seismic_ref",name:"Seismic Sink Ref",   sub:"Townshend · Reference component",    vendor:"townshend",    price:1495, cat:"isolation"},
        {id:"h_podium2",    name:"Podium Platforms",   sub:"Townshend · Speaker isolation pair",  vendor:"townshend",    price:2995, cat:"isolation"},
      ],
      power:[
        {id:"h_burndy",     name:"Burndy PowerLine",   sub:"Naim · Reference mains lead",        vendor:"naim",         price:495,  cat:"power"},
        {id:"h_powerhaus8", name:"PowerHAUS M8",       sub:"Chord Co. · Reference mains 8-way",  vendor:"chord_co",     price:895,  cat:"power"},
      ],
    },
  },
};

const BUILDING_TYPES = {
  apt_ground: { id:"apt_ground", label:"Apartment", sub:"Ground floor", isApartment:true, floorRisk:"low", ceilingRisk:"none", wallRisk:"high",
    description:"Ground floor flat. No downstairs transmission risk, but party walls are the primary concern. Structural bass travels laterally through masonry.",
    isolation:{ speakerFooters:{required:false,recommended:true,item:"Speaker Isolation Footers",reason:"Party wall bass transmission via floor joists",price:280}, carpetDiscs:{required:false,recommended:true,item:"Anti-Slip Floor Discs",reason:"Decouples spike from floor into party-wall structure",price:45}, phonoPlatform:{required:false,recommended:true,item:"Component Isolation Platform",reason:"Reduces airborne vibration coupling to stylus",price:195}, powerCond:{required:true,recommended:true,item:"Mains Conditioner",reason:"Shared mains ring with other flats — dirty power likely",price:395}, wallTreatment:{required:false,recommended:true,item:"Acoustic Wall Panels",reason:"Reduces flutter echo and lateral reflection",price:0}, graniteBase:{required:false,recommended:false,item:"Granite slab",reason:"Not critical at ground level",price:0} },
    warnings:[ {level:"warn",msg:"Shared party walls on both sides. Bass below 80Hz travels laterally through the masonry structure. Keep volume levels below 85dB after 10pm."}, {level:"info",msg:"Ground floor: no downstairs neighbour transmission risk. Speaker isolation footers are advisory rather than mandatory."} ], riskScore:55 },
  apt_upper: { id:"apt_upper", label:"Apartment", sub:"1st floor or above", isApartment:true, floorRisk:"critical", ceilingRisk:"medium", wallRisk:"high",
    description:"Upper-floor flat. Critical floor transmission risk — structural bass couples directly through the slab to the flat below. Speaker isolation footers are a safety item.",
    isolation:{ speakerFooters:{required:true,recommended:true,item:"Speaker Isolation Footers",reason:"SAFETY: structural bass transmission to flat below confirmed",price:280}, carpetDiscs:{required:true,recommended:true,item:"Anti-Slip Floor Discs",reason:"Mandatory when using isolation footers on carpeted floors",price:45}, phonoPlatform:{required:true,recommended:true,item:"Component Isolation Platform",reason:"Airborne and structural feedback to stylus at upper floors",price:195}, powerCond:{required:true,recommended:true,item:"Mains Conditioner",reason:"Shared mains with building — dirty power confirmed",price:395}, wallTreatment:{required:false,recommended:true,item:"Acoustic Wall Panels",reason:"Reduces early reflections from parallel walls",price:0}, graniteBase:{required:false,recommended:true,item:"Granite Slab (PSU base)",reason:"Adds mass to decouple PSU transformer vibration from floor",price:25} },
    warnings:[ {level:"critical",msg:"Upper-floor apartment: structural bass below 100Hz transmits directly to the flat below at up to +14dB. Speaker isolation footers are a mandatory safety item."}, {level:"critical",msg:"Mains conditioning is required. Shared building mains introduces high-frequency noise from lifts, LED drivers, and other flats' equipment."}, {level:"warn",msg:"Party walls on shared sides — consider speaker toe-in to direct sound away from the shared wall surface."} ], riskScore:95 },
  detached: { id:"detached", label:"Detached House", sub:"No shared walls or floors", isApartment:false, floorRisk:"none", ceilingRisk:"none", wallRisk:"none",
    description:"No shared structural elements with neighbours. Isolation is about sound quality improvement rather than neighbour compliance.",
    isolation:{ speakerFooters:{required:false,recommended:true,item:"Speaker Isolation Footers",reason:"Performance: decouples speakers from floor resonance",price:280}, carpetDiscs:{required:false,recommended:false,item:"Anti-Slip Floor Discs",reason:"Optional — use floor spikes on hard floors instead",price:45}, phonoPlatform:{required:false,recommended:true,item:"Component Isolation Platform",reason:"Performance: isolates stylus from airborne feedback",price:195}, powerCond:{required:false,recommended:true,item:"Mains Conditioner",reason:"Mains quality varies — benefits all analogue systems",price:395}, wallTreatment:{required:false,recommended:false,item:"Room treatment",reason:"Based on room measurements",price:0}, graniteBase:{required:false,recommended:false,item:"Granite slab",reason:"Not required",price:0} },
    warnings:[ {level:"info",msg:"Detached house: no neighbour isolation constraints. All isolation recommendations are purely for sonic performance."}, {level:"info",msg:"Focus on room acoustics — first reflection points, bass trapping, and diffusion at the rear wall."} ], riskScore:5 },
  semi_detached: { id:"semi_detached", label:"Semi-Detached", sub:"One shared party wall", isApartment:false, floorRisk:"none", ceilingRisk:"none", wallRisk:"medium",
    description:"One shared party wall with a neighbour. No floor/ceiling risk. Bass transmission is lateral through the party wall only.",
    isolation:{ speakerFooters:{required:false,recommended:true,item:"Speaker Isolation Footers",reason:"Reduces floor-coupled bass reaching party wall",price:280}, carpetDiscs:{required:false,recommended:false,item:"Anti-Slip Floor Discs",reason:"Advisory only — floor risk is low",price:45}, phonoPlatform:{required:false,recommended:true,item:"Component Isolation Platform",reason:"Performance and low-level vibration control",price:195}, powerCond:{required:false,recommended:true,item:"Mains Conditioner",reason:"Shared mains spur with neighbour possible",price:395}, wallTreatment:{required:false,recommended:true,item:"Wall Absorption Treatment",reason:"Reduces direct bass radiation into the shared wall",price:0}, graniteBase:{required:false,recommended:false,item:"Granite slab",reason:"Not required",price:0} },
    warnings:[ {level:"warn",msg:"One shared party wall. Position speakers to toe away from the shared wall side."}, {level:"info",msg:"No floor or ceiling transmission risk. Neighbour compliance is manageable with reasonable volume levels."} ], riskScore:35 },
};

const MOUNTING = [
  { id:"sideboard", label:"Sideboard",      sub:"Standard furniture",      requireIso:true,  cableDress:false, vibWarn:false, floorSpike:false, granite:false, note:"Isolation platforms mandatory for all components. Component isolation platform under phono stage if stacked." },
  { id:"rack",      label:"Dedicated Rack", sub:"Fraim · Quadraspire etc", requireIso:false, cableDress:true,  vibWarn:false, floorSpike:true,  granite:false, note:"Built-in isolation assumed. Prioritise cable dressing, floor spike coupling, and star-earthing at the rack." },
  { id:"other",     label:"Floor / Custom", sub:"Informal or custom build", requireIso:true,  cableDress:false, vibWarn:true,  floorSpike:false, granite:true,  note:"Vibration Warning active. Place mains conditioner on floor or a 20mm granite slab." },
];

function analyseRoom({ length, width, height, floorTypes=["wood"], wallMaterials=["plasterboard"], sideboardWidth, sideboardMat, sideWallGap, buildingType }) {
  const area = +(length * width).toFixed(1);
  const volume = +(area * height).toFixed(1);
  const separation = Math.round(width * 0.55 * 10) / 10;
  const backWall = Math.round(width * 0.18 * 10) / 10;
  const listenPos = Math.round(length * 0.62 * 10) / 10;
  const modeL = +(172 / length).toFixed(1);
  const modeW = +(172 / width).toFixed(1);
  const modeH = +(172 / height).toFixed(1);
  const bld = BUILDING_TYPES[buildingType] || BUILDING_TYPES.apt_upper;
  const iso = bld.isolation;
  const warnings = [...bld.warnings];
  const autoItems = [];
  let speakerRec = null, tierRec = null;
  if (area < 12) { speakerRec = "Compact standmount"; tierRec = "entry"; warnings.push({ level:"warn", msg:`Room is ${area} m² — compact. A standmount speaker is better suited than a floorstander here.` }); }
  else if (area > 30) { speakerRec = "Large floorstander"; tierRec = "high"; warnings.push({ level:"info", msg:`Large room at ${area} m². A second mains conditioner and longer cable runs (5m+) are advised.` }); autoItems.push({ id:"pq2", name:"Second Mains Conditioner", reason:"Room > 30 m²", price:395 }); }
  if (sideWallGap < 30) warnings.push({ level:"critical", msg:`Only ${sideWallGap}cm from side wall. Rear-ported designs will cause bass boom. Choose a sealed or front-ported cabinet.` });
  if (iso.speakerFooters.required) autoItems.push({ id:"gaia_auto", name:iso.speakerFooters.item, reason:iso.speakerFooters.reason, price:iso.speakerFooters.price });
  const hasCarpet  = floorTypes.includes("carpet");
  const hasWood    = floorTypes.includes("wood");
  const hasGlass   = wallMaterials.includes("glass");
  const hasPlaster = wallMaterials.includes("plasterboard");
  if (iso.carpetDiscs.required && !floorTypes.every(f=>f==="tile")) autoItems.push({ id:"carpet_discs", name:"Anti-Slip Floor Discs", reason:iso.carpetDiscs.reason, price:iso.carpetDiscs.price });
  if (iso.phonoPlatform.required) autoItems.push({ id:"lateral_auto", name:iso.phonoPlatform.item, reason:iso.phonoPlatform.reason, price:iso.phonoPlatform.price });
  if (iso.powerCond.required) autoItems.push({ id:"pq_auto", name:iso.powerCond.item, reason:iso.powerCond.reason, price:iso.powerCond.price });
  if (hasWood && bld.floorRisk === "critical") warnings.push({ level:"critical", msg:"Hardwood floor amplifies structural transmission. Isolation footers with anti-slip discs are doubly important here." });
  if (hasCarpet && hasWood) warnings.push({ level:"info", msg:"Mixed floor surfaces (carpet + hardwood): use appropriate isolation footers for each surface." });
  if (sideboardWidth < 1.5 && !autoItems.find(i=>i.id==="lateral_auto")) { warnings.push({ level:"warn", msg:`Sideboard is ${sideboardWidth}m wide (< 1.5m). Stacking config required: component isolation platform under phono stage.` }); autoItems.push({ id:"lateral_auto", name:"Component Isolation Platform", reason:"Stacking — sideboard < 1.5m", price:195 }); }
  if (sideboardMat === "lightweight_wood") warnings.push({ level:"warn", msg:"Lightweight wood sideboard will resonate with the amp transformer. Mount the mains conditioner on a granite slab or floor." });
  if (hasPlaster) warnings.push({ level:"warn", msg:"Plasterboard / stud walls resonate at 100–160Hz. Corner bass traps at the room boundaries will reduce this significantly." });
  if (hasGlass)   warnings.push({ level:"critical", msg:"Glass surfaces cause early reflections at 2–8kHz. Heavy curtains or acoustic panels on the glass-facing wall are essential." });
  if (wallMaterials.includes("plasterboard") && wallMaterials.includes("glass")) warnings.push({ level:"warn", msg:"Combined plasterboard + glass: prioritise soft furnishings on the glass wall first, then bass trapping in the corners." });
  const seen = new Set();
  const deduped = autoItems.filter(i=>{ if(seen.has(i.id)) return false; seen.add(i.id); return true; });
  return { area, volume, separation, backWall, listenPos, modeL, modeW, modeH, warnings, autoItems:deduped, speakerRec, tierRec, bld, iso, floorTypes, wallMaterials };
}

function calcSynergy(basket) {
  const ids = basket.map(i => i.vendor).filter(Boolean);
  if (ids.length < 2) return 100;
  let total = 0, count = 0;
  for (let i = 0; i < ids.length; i++) for (let j = i+1; j < ids.length; j++) { const a = VENDORS[ids[i]], b = VENDORS[ids[j]]; if (a && b) { total += (a.synergy[ids[j]] ?? 50); count++; } }
  return count ? Math.round(total / count) : 80;
}
function synergyMeta(s) { return s>=90?{label:"Exceptional",col:"#2A5040"}:s>=75?{label:"Very Good",col:"#B8732A"}:s>=60?{label:"Adequate",col:"#B8732A"}:{label:"Mismatch",col:"#8B2020"}; }
function getDefaultBasket(tier) {
  return Object.values(CATALOG[tier].components)
    .map(opts => opts[0])
    .filter(item => item.cat !== "cartridge");
}

function RoomDiagram({ length, width, separation, backWall, listenPos, sideWallGap, accent }) {
  const W=300,H=200,pad=26,rw=W-pad*2,rh=H-pad*2,sx=rw/width,sy=rh/length;
  const spkY=pad+backWall*sy, spkLX=pad+(width/2-separation/2)*sx, spkRX=pad+(width/2+separation/2)*sx;
  const lisY=pad+listenPos*sy, lisX=pad+(width/2)*sx, danger=sideWallGap<30;
  return (<svg width={W} height={H}>
    {danger&&<rect x={pad} y={pad} width={(sideWallGap/100)*sx} height={rh} fill="rgba(239,68,68,0.07)"/>}
    {danger&&<rect x={pad+rw-(sideWallGap/100)*sx} y={pad} width={(sideWallGap/100)*sx} height={rh} fill="rgba(239,68,68,0.07)"/>}
    {[.25,.5,.75].map(f=><g key={f}><line x1={pad+f*rw} y1={pad} x2={pad+f*rw} y2={pad+rh} stroke="#D4C9B4" strokeWidth="1"/><line x1={pad} y1={pad+f*rh} x2={pad+rw} y2={pad+f*rh} stroke="#D4C9B4" strokeWidth="1"/></g>)}
    <rect x={pad} y={pad} width={rw} height={rh} fill="#EDE7D8" stroke="#1C1812" strokeWidth="1.5"/>
    <rect x={pad+rw*.12} y={pad+3} width={rw*.76} height={10} fill={`${accent}12`} stroke={`${accent}30`} strokeWidth="1" rx="1"/>
    <text x={pad+rw/2} y={pad+10} textAnchor="middle" fill={accent} fontSize="7" fontFamily="JetBrains Mono, monospace" letterSpacing="1">SIDEBOARD</text>
    <line x1={spkLX} y1={spkY+12} x2={spkRX} y2={spkY+12} stroke={`${accent}60`} strokeWidth="1" strokeDasharray="3 2"/>
    <line x1={spkLX} y1={lisY} x2={lisX} y2={spkY} stroke="rgba(42,143,197,0.2)" strokeWidth="1" strokeDasharray="3 2"/>
    <line x1={spkRX} y1={lisY} x2={lisX} y2={spkY} stroke="rgba(42,143,197,0.2)" strokeWidth="1" strokeDasharray="3 2"/>
    <rect x={spkLX-6} y={spkY-10} width={12} height={20} fill={`${accent}18`} stroke={accent} strokeWidth="1.5" rx="1"/>
    <circle cx={spkLX} cy={spkY-2} r={3.5} fill="none" stroke={accent} strokeWidth="1"/>
    <text x={spkLX} y={spkY+22} textAnchor="middle" fill={accent} fontSize="7" fontFamily="JetBrains Mono, monospace">L</text>
    <rect x={spkRX-6} y={spkY-10} width={12} height={20} fill={`${accent}18`} stroke={accent} strokeWidth="1.5" rx="1"/>
    <circle cx={spkRX} cy={spkY-2} r={3.5} fill="none" stroke={accent} strokeWidth="1"/>
    <text x={spkRX} y={spkY+22} textAnchor="middle" fill={accent} fontSize="7" fontFamily="JetBrains Mono, monospace">R</text>
    <text x={(spkLX+spkRX)/2} y={spkY+10} textAnchor="middle" fill={accent} fontSize="7" fontFamily="JetBrains Mono, monospace">{separation}m</text>
    <circle cx={lisX} cy={lisY} r={8} fill="rgba(30,64,96,0.12)" stroke="#1E4060" strokeWidth="1.5"/>
    <circle cx={lisX} cy={lisY} r={2.5} fill="#1E4060"/>
    <text x={lisX+12} y={lisY+4} fill="#1E4060" fontSize="7" fontFamily="JetBrains Mono, monospace">EAR</text>
    <text x={pad-4} y={pad+rh/2} textAnchor="middle" fill="#9A9088" fontSize="7" fontFamily="JetBrains Mono, monospace" transform={`rotate(-90,${pad-4},${pad+rh/2})`}>{length}m</text>
    <text x={pad+rw/2} y={pad+rh+14} textAnchor="middle" fill="#9A9088" fontSize="7" fontFamily="JetBrains Mono, monospace">{width}m</text>
  </svg>);
}

function SynergyRing({ score }) {
  const { label, col } = synergyMeta(score);
  const R=36, circ=2*Math.PI*R, offset=circ*(1-score/100);
  return (
    <div style={{display:"flex",alignItems:"center",gap:20}}>
      <div style={{position:"relative",width:88,height:88,flexShrink:0}}>
        <svg width={88} height={88} style={{transform:"rotate(-90deg)"}}>
          <circle cx={44} cy={44} r={R} fill="none" stroke="#D4C9B4" strokeWidth={4}/>
          <circle cx={44} cy={44} r={R} fill="none" stroke={col} strokeWidth={4}
            strokeDasharray={circ} strokeDashoffset={offset}
            style={{transition:"stroke-dashoffset .9s cubic-bezier(.4,0,.2,1),stroke .4s"}}/>
        </svg>
        <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
          <span style={{fontFamily:"var(--serif)",fontSize:22,fontWeight:400,color:"var(--ink)",lineHeight:1}}>{score}</span>
          <span style={{fontSize:8,color:"var(--ink4)",letterSpacing:".08em",fontFamily:"var(--mono)"}}>/100</span>
        </div>
      </div>
      <div>
        <div style={{fontSize:9,letterSpacing:".18em",textTransform:"uppercase",color:"var(--ink3)",marginBottom:4,fontFamily:"var(--mono)"}}>Synergy</div>
        <div style={{fontFamily:"var(--serif)",fontSize:18,fontWeight:400,color:col}}>{label}</div>
      </div>
    </div>
  );
}

function Tag({ children, col }) {
  return <span style={{fontSize:8,letterSpacing:".12em",textTransform:"uppercase",padding:"2px 8px",border:`1px solid ${col}`,color:col,fontFamily:"var(--mono)"}}>{children}</span>;
}

function DimSlider({ label, value, unit, min, max, step, onChange, noteOn, noteMsg, noteCol }) {
  const pct = ((value - min) / (max - min)) * 100;
  const activeCol = noteOn && noteCol ? noteCol : "var(--amber)";
  return (
    <div style={{padding:"16px 0",borderBottom:"1px solid var(--rule)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:12}}>
        <span style={{fontSize:9,letterSpacing:".18em",textTransform:"uppercase",color:"var(--ink3)",fontFamily:"var(--mono)"}}>{label}</span>
        <span style={{fontFamily:"var(--serif)",fontSize:22,fontWeight:300,color:"var(--ink)",letterSpacing:"-.01em"}}>{value}<span style={{fontSize:13,color:"var(--ink3)",marginLeft:3}}>{unit}</span></span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={e=>onChange(parseFloat(e.target.value))}
        style={{width:"100%",background:`linear-gradient(to right,${activeCol} 0%,${activeCol} ${pct}%,var(--rule) ${pct}%,var(--rule) 100%)`,transition:"background .25s"}}/>
      {noteMsg&&<div style={{fontSize:9,color:noteOn?activeCol:"var(--ink4)",marginTop:8,letterSpacing:".04em",fontFamily:"var(--mono)"}}>{noteMsg}</div>}
    </div>
  );
}

function SelectButtons({ label, value, onChange, opts }) {
  return (
    <div style={{marginBottom:4}}>
      <div style={{fontSize:9,letterSpacing:".18em",textTransform:"uppercase",color:"var(--ink3)",marginBottom:10,fontFamily:"var(--mono)"}}>{label}</div>
      <div style={{display:"flex",gap:0,flexWrap:"wrap",border:"1px solid var(--rule)"}}>
        {opts.map((o,i)=>{
          const sel=value===o.value;
          return <button key={o.value} onClick={()=>onChange(o.value)} style={{
            flex:"1 1 auto",padding:"10px 14px",fontSize:10,letterSpacing:".05em",
            cursor:"pointer",fontFamily:"var(--mono)",
            background:sel?"var(--amber)":"transparent",
            color:sel?"var(--paper)":"var(--ink3)",
            border:"none",borderLeft:i>0?"1px solid var(--rule)":"none",
            transition:"all .15s",whiteSpace:"nowrap",minWidth:0,overflow:"hidden",textOverflow:"ellipsis",
          }}>{o.label}</button>;
        })}
      </div>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14,paddingBottom:8,borderBottom:"1px solid var(--rule)"}}>
      <div style={{width:3,height:12,background:"var(--amber)",flexShrink:0}}/>
      <span style={{fontSize:9,letterSpacing:".22em",textTransform:"uppercase",color:"var(--ink3)",fontFamily:"var(--mono)"}}>{children}</span>
    </div>
  );
}

const STEPS = [
  { id:"materials", label:"Building",   sub:"Type & Surfaces"},
  { id:"room",      label:"Room",       sub:"Dimensions"   },
  { id:"furniture", label:"Furniture",  sub:"Placement"    },
  { id:"genres",    label:"Music",      sub:"Preferences"  },
  { id:"tier",      label:"Brief",      sub:"Requirements" },
  { id:"catalog",   label:"Components", sub:"Brand picks"  },
  { id:"summary",   label:"Summary",    sub:"Pricing"      },
];

function StepBar({ current, onGoto, completed, isMobile }) {
  const ci = STEPS.findIndex(s=>s.id===current);
  return (
    <div style={{marginBottom:isMobile?20:40,overflowX:"auto"}}>
      <div style={{height:2,background:"var(--rule)",marginBottom:isMobile?10:20,position:"relative"}}>
        <div style={{position:"absolute",left:0,top:0,height:"100%",background:"var(--amber)",transition:"width .5s cubic-bezier(.4,0,.2,1)",width:`${Math.round((ci/(STEPS.length-1))*100)}%`}}/>
      </div>
      <div style={{display:"flex",alignItems:"flex-start",gap:0}}>
        {STEPS.map((s,i)=>{
          const done=completed.has(s.id), active=s.id===current, canClick=done&&!active;
          return (
            <div key={s.id} onClick={()=>canClick&&onGoto(s.id)}
              style={{flex:1,textAlign:"center",cursor:canClick?"pointer":"default",minWidth:0,padding:"0 4px"}}>
              <div style={{width:20,height:20,margin:"0 auto 5px",display:"flex",alignItems:"center",justifyContent:"center",background:active?"var(--ink)":done?"var(--amber)":"transparent",border:`1px solid ${active?"var(--ink)":done?"var(--amber)":"var(--rule)"}`,transition:"all .25s"}}>
                {done&&!active
                  ? <svg width={10} height={8} viewBox="0 0 10 8"><polyline points="1,4 3.5,6.5 9,1" stroke="#F5F0E8" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  : <span style={{fontSize:9,color:active?"var(--paper)":"var(--ink4)",fontFamily:"var(--mono)",lineHeight:1}}>{i+1}</span>
                }
              </div>
              {!isMobile&&<div style={{fontSize:8,color:active?"var(--ink)":done?"var(--amber)":"var(--ink4)",letterSpacing:".1em",textTransform:"uppercase",fontFamily:"var(--mono)",transition:"color .25s",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.label}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function IconSideboard({size=32,col="currentColor"}) { return <svg width={size} height={size} viewBox="0 0 32 32" fill="none"><rect x="2" y="18" width="28" height="10" rx="1.5" stroke={col} strokeWidth="1.5"/><rect x="4" y="13" width="24" height="6" rx="1" stroke={col} strokeWidth="1.2"/><line x1="16" y1="18" x2="16" y2="28" stroke={col} strokeWidth="1"/><circle cx="10" cy="23" r="1" fill={col}/><circle cx="22" cy="23" r="1" fill={col}/><rect x="5" y="7" width="9" height="6" rx=".5" stroke={col} strokeWidth="1"/><rect x="18" y="7" width="9" height="6" rx=".5" stroke={col} strokeWidth="1"/></svg>; }
function IconRack({size=32,col="currentColor"}) { return <svg width={size} height={size} viewBox="0 0 32 32" fill="none"><rect x="5" y="2" width="22" height="27" rx="1.5" stroke={col} strokeWidth="1.5"/>{[5,11,17].map((y,i)=><rect key={i} x="7" y={y} width="18" height="5" rx=".5" stroke={col} strokeWidth="1"/>)}{[7.5,13.5,19.5].map((y,i)=><circle key={i} cx="10" cy={y} r="1" fill={col}/>)}<line x1="8" y1="29" x2="8" y2="32" stroke={col} strokeWidth="1.5" strokeLinecap="round"/><line x1="24" y1="29" x2="24" y2="32" stroke={col} strokeWidth="1.5" strokeLinecap="round"/></svg>; }
function IconFloor({size=32,col="currentColor"}) { return <svg width={size} height={size} viewBox="0 0 32 32" fill="none"><rect x="8" y="4" width="16" height="14" rx="1.5" stroke={col} strokeWidth="1.5"/><line x1="8" y1="9" x2="24" y2="9" stroke={col} strokeWidth="1"/><line x1="8" y1="13" x2="20" y2="13" stroke={col} strokeWidth="1"/><line x1="3" y1="26" x2="29" y2="26" stroke={col} strokeWidth="1.5" strokeLinecap="round"/><line x1="12" y1="18" x2="12" y2="26" stroke={col} strokeWidth="1"/><line x1="20" y1="18" x2="20" y2="26" stroke={col} strokeWidth="1"/></svg>; }

function CatIcon({cat,size=14,col="currentColor"}) {
  const p={
    turntable:<><circle cx="10" cy="10" r="8" stroke={col} strokeWidth="1.2"/><circle cx="10" cy="10" r="4" stroke={col} strokeWidth=".8" strokeDasharray="2 1.5"/><circle cx="10" cy="10" r="1.5" fill={col}/><line x1="15" y1="4" x2="18" y2="2" stroke={col} strokeWidth="1" strokeLinecap="round"/></>,
    cartridge:<><rect x="3" y="8" width="14" height="6" rx="1" stroke={col} strokeWidth="1.2"/><line x1="3" y1="11" x2="17" y2="11" stroke={col} strokeWidth=".8"/><line x1="7" y1="8" x2="5" y2="4" stroke={col} strokeWidth="1" strokeLinecap="round"/><line x1="10" y1="8" x2="10" y2="4" stroke={col} strokeWidth="1" strokeLinecap="round"/><line x1="13" y1="8" x2="15" y2="4" stroke={col} strokeWidth="1" strokeLinecap="round"/></>,
    amplifier:<><rect x="1" y="5" width="18" height="10" rx="1.5" stroke={col} strokeWidth="1.2"/><circle cx="6" cy="10" r="2.5" stroke={col} strokeWidth="1"/><line x1="10" y1="8" x2="18" y2="8" stroke={col} strokeWidth=".8"/><line x1="10" y1="11" x2="16" y2="11" stroke={col} strokeWidth=".8"/></>,
    speakers:<><rect x="5" y="2" width="10" height="16" rx="1.5" stroke={col} strokeWidth="1.2"/><circle cx="10" cy="8" r="3" stroke={col} strokeWidth="1"/><circle cx="10" cy="8" r="1" fill={col}/><circle cx="10" cy="14" r="1.5" stroke={col} strokeWidth=".8"/></>,
    phono:<><rect x="2" y="6" width="16" height="8" rx="1" stroke={col} strokeWidth="1.2"/><circle cx="6" cy="10" r="1.5" stroke={col} strokeWidth=".8"/><circle cx="14" cy="10" r="1.5" stroke={col} strokeWidth=".8"/><line x1="8" y1="10" x2="12" y2="10" stroke={col} strokeWidth=".8"/></>,
    cables:<><path d="M2 10 Q5 4 10 10 Q15 16 18 10" stroke={col} strokeWidth="1.2" fill="none" strokeLinecap="round"/><circle cx="2" cy="10" r="1.5" fill={col}/><circle cx="18" cy="10" r="1.5" fill={col}/></>,
    isolation:<><rect x="4" y="12" width="12" height="4" rx="1" stroke={col} strokeWidth="1.2"/><line x1="7" y1="12" x2="7" y2="8" stroke={col} strokeWidth="1"/><line x1="13" y1="12" x2="13" y2="8" stroke={col} strokeWidth="1"/><rect x="5" y="6" width="10" height="4" rx="1" stroke={col} strokeWidth="1.2"/></>,
    power:<><rect x="3" y="5" width="14" height="10" rx="1.5" stroke={col} strokeWidth="1.2"/><line x1="10" y1="5" x2="10" y2="2" stroke={col} strokeWidth="1.5" strokeLinecap="round"/><circle cx="7" cy="10" r="1" fill={col}/><circle cx="10" cy="10" r="1" fill={col}/><circle cx="13" cy="10" r="1" fill={col}/></>,
  };
  return <svg width={size} height={size} viewBox="0 0 20 20" fill="none">{p[cat]||null}</svg>;
}

const CAT_LABELS = {turntable:"Turntable",cartridge:"Cartridge",amplifier:"Amplifier",speakers:"Speakers",phono:"Phono Stage",cables:"Cables",isolation:"Isolation",power:"Power"};
const BANK_MAP = {turntable:"A",cartridge:null,phono:"A",amplifier:"B",speakers:"B",isolation:null,cables:null,power:null};

function SystemDiagram({ basket, autoItems }) {
  const get = (cat) => basket.find(i => i.cat === cat);
  const turntable = get("turntable");
  const cartridge = get("cartridge") || (
    basket.find(i=>i.cat==="turntable") && BUNDLED_CARTRIDGES[basket.find(i=>i.cat==="turntable")?.id]
      ? { name: BUNDLED_CARTRIDGES[basket.find(i=>i.cat==="turntable").id].name, sub:"Bundled · included in turntable price", cat:"cartridge", vendor: basket.find(i=>i.cat==="turntable").vendor, price:0, _bundled:true }
      : null
  );
  const phono = get("phono");
  const amp = get("amplifier");
  const speakers = get("speakers");
  const isolation = get("isolation");
  const power = get("power");

  // Use fixed widths to avoid reading window.innerWidth on every render
  const NODE_W = 110, NODE_H = 72, GAP = 32;
  const chain = [
    { role:"turntable", label:"Turntable",   item:turntable },
    { role:"cartridge", label:"Cartridge",   item:cartridge },
    { role:"phono",     label:"Phono Stage", item:phono     },
    { role:"amplifier", label:"Amplifier",   item:amp       },
    { role:"speakers",  label:"Speakers",    item:speakers  },
  ];
  const support = [
    { role:"isolation", label:"Isolation", item:isolation },
    { role:"power",     label:"Power",     item:power     },
  ];
  const TOTAL_W = chain.length * NODE_W + (chain.length - 1) * GAP;
  const SVG_W = Math.max(TOTAL_W + 40, 480);
  const SVG_H = 240;
  const startX = (SVG_W - TOTAL_W) / 2;
  const chainY = 20;

  function vendorCol(item) { if (!item) return "#D4C9B4"; const v = VENDORS[item.vendor]; return v ? v.col : "#9A9088"; }
  function shortName(item, maxLen=14) { if (!item) return "Not selected"; const n=item.name; return n.length>maxLen?n.slice(0,maxLen-1)+"…":n; }
  function vendorName(item) { if (!item) return ""; const v=VENDORS[item.vendor]; return v?v.name:""; }

  const selAmp = basket.find(i=>i.cat==="amplifier");
  const selPhono = basket.find(i=>i.cat==="phono");
  const phonoMissing = selAmp && !AMPS_WITH_PHONO.has(selAmp.id) && (!selPhono || selPhono.id==="e_builtin" || selPhono.id==="m_builtin");

  return (
    <div style={{overflowX:"auto",background:"var(--paper2)",border:"1px solid var(--rule)",padding:"20px 16px 16px"}}>
      <svg width={SVG_W} height={SVG_H} viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{display:"block",minWidth:560}}>
        {chain.map((node,i) => {
          if (i === chain.length-1) return null;
          const x1=startX+i*(NODE_W+GAP)+NODE_W, x2=startX+(i+1)*(NODE_W+GAP), cy=chainY+NODE_H/2, mx=(x1+x2)/2;
          const col1=vendorCol(node.item), col2=vendorCol(chain[i+1].item);
          return <g key={i}><line x1={x1} y1={cy} x2={mx} y2={cy} stroke={col1} strokeWidth="2" strokeLinecap="round" opacity="0.7"/><line x1={mx} y1={cy} x2={x2} y2={cy} stroke={col2} strokeWidth="2" strokeLinecap="round" opacity="0.7"/><polygon points={`${x2-6},${cy-4} ${x2},${cy} ${x2-6},${cy+4}`} fill={col2} opacity="0.7"/></g>;
        })}
        {support.map((node,i) => {
          const sx=startX+(i===0?0:(chain.length-1))*(NODE_W+GAP)+NODE_W/2, sy=chainY+NODE_H+36, col=vendorCol(node.item);
          return <line key={node.role} x1={sx} y1={chainY+NODE_H} x2={sx} y2={sy-2} stroke={col} strokeWidth="1.5" strokeDasharray="4 3" opacity="0.5"/>;
        })}
        {chain.map((node,i) => {
          const nx=startX+i*(NODE_W+GAP), isMissingPhono=node.role==="phono"&&phonoMissing, col=isMissingPhono?"#8B2020":vendorCol(node.item), selected=!!node.item;
          return (
            <g key={node.role}>
              <rect x={nx} y={chainY} width={NODE_W} height={NODE_H} fill={isMissingPhono?"rgba(139,32,32,.06)":selected?"#F5F0E8":"#EDE7D8"} stroke={col} strokeWidth={selected||isMissingPhono?2:1} rx="2" strokeDasharray={isMissingPhono?"4 3":"none"}/>
              <rect x={nx} y={chainY} width={4} height={NODE_H} fill={col} rx="2"/>
              <text x={nx+NODE_W/2+2} y={chainY+14} textAnchor="middle" fill="#9A9088" fontSize="7" fontFamily="JetBrains Mono, monospace" style={{textTransform:"uppercase",letterSpacing:"1.5px"}}>{node.label}</text>
              {isMissingPhono&&<text x={nx+NODE_W/2+2} y={chainY+26} textAnchor="middle" fill="#8B2020" fontSize="14" fontFamily="JetBrains Mono, monospace">⚠</text>}
              <text x={nx+NODE_W/2+2} y={isMissingPhono?chainY+44:chainY+30} textAnchor="middle" fill={isMissingPhono?"#8B2020":selected?"#1C1812":"#9A9088"} fontSize={selected||isMissingPhono?"10":"9"} fontFamily="Source Serif 4, Georgia, serif" fontWeight="400">{isMissingPhono?"Add phono stage":shortName(node.item,13)}</text>
              {selected&&<text x={nx+NODE_W/2+2} y={chainY+44} textAnchor="middle" fill={col} fontSize="8" fontFamily="JetBrains Mono, monospace">{vendorName(node.item)}</text>}
              <circle cx={nx+NODE_W-10} cy={chainY+10} r={8} fill={col}/>
              <text x={nx+NODE_W-10} y={chainY+14} textAnchor="middle" fill="#F5F0E8" fontSize="8" fontFamily="JetBrains Mono, monospace">{i+1}</text>
            </g>
          );
        })}
        {support.map((node,i) => {
          const nx=startX+(i===0?0:(chain.length-1)*(NODE_W+GAP)), ny=chainY+NODE_H+36, col=vendorCol(node.item), SH=52, selected=!!node.item;
          return (
            <g key={node.role}>
              <rect x={nx} y={ny} width={NODE_W} height={SH} fill={selected?"#F5F0E8":"#EDE7D8"} stroke={col} strokeWidth={selected?1.5:1} strokeDasharray={selected?"none":"4 3"} rx="2"/>
              <rect x={nx} y={ny} width={4} height={SH} fill={col} rx="2"/>
              <text x={nx+NODE_W/2+2} y={ny+14} textAnchor="middle" fill="#9A9088" fontSize="7" fontFamily="JetBrains Mono, monospace" style={{letterSpacing:"1.5px"}}>{node.label.toUpperCase()}</text>
              <text x={nx+NODE_W/2+2} y={ny+28} textAnchor="middle" fill={selected?"#1C1812":"#9A9088"} fontSize="9" fontFamily="Source Serif 4, Georgia, serif">{shortName(node.item,13)}</text>
              {selected&&<text x={nx+NODE_W/2+2} y={ny+42} textAnchor="middle" fill={col} fontSize="8" fontFamily="JetBrains Mono, monospace">{vendorName(node.item)}</text>}
            </g>
          );
        })}
        <text x={SVG_W/2} y={SVG_H-4} textAnchor="middle" fill="#D4C9B4" fontSize="8" fontFamily="JetBrains Mono, monospace" style={{letterSpacing:"2px"}}>SIGNAL FLOW →</text>
      </svg>
    </div>
  );
}

function CollapsibleSection({ label, children }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div style={{marginBottom:8,border:"1px solid var(--rule)"}}>
      <button onClick={()=>setOpen(!open)} style={{width:"100%",display:"flex",justifyContent:"space-between",alignItems:"center",padding:"13px 16px",background:open?"var(--paper2)":"transparent",border:"none",cursor:"pointer",textAlign:"left"}}>
        <span style={{fontSize:9,letterSpacing:".18em",textTransform:"uppercase",color:"var(--ink2)",fontFamily:"var(--mono)"}}>{label}</span>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{transform:open?"rotate(180deg)":"rotate(0deg)",transition:"transform .2s",flexShrink:0}}>
          <path d="M2 4.5l5 5 5-5" stroke="#6B6358" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open&&<div className="fu" style={{padding:"14px 16px",borderTop:"1px solid var(--rule)"}}>{children}</div>}
    </div>
  );
}

function WiringMap({ basket }) {
  return (
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:1,border:"1px solid var(--rule)"}}>
      {[{label:"Bank A — Filtered",items:basket.filter(i=>BANK_MAP[i.cat]==="A"),col:"var(--amber)"},{label:"Bank B — High-Current",items:basket.filter(i=>BANK_MAP[i.cat]==="B"),col:"var(--blue)"}].map((b,bi)=>(
        <div key={b.label} style={{padding:"16px",background:"var(--paper2)",borderLeft:bi>0?"1px solid var(--rule)":"none"}}>
          <div style={{fontSize:9,color:b.col,letterSpacing:".16em",textTransform:"uppercase",marginBottom:10,fontFamily:"var(--mono)"}}>{b.label}</div>
          {b.items.length===0?<div style={{fontSize:10,color:"var(--ink4)",fontFamily:"var(--mono)"}}>No devices</div>:b.items.map(i=>(
            <div key={i.id} style={{display:"flex",alignItems:"center",gap:8,marginBottom:7}}>
              <div style={{width:5,height:5,background:b.col,transform:"rotate(45deg)",flexShrink:0}}/>
              <span style={{fontSize:11,color:"var(--ink2)",fontFamily:"var(--serif)"}}>{i.name}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function StepHeading({title,sub}) {
  return (
    <div style={{marginBottom:32,paddingBottom:20,borderBottom:"2px solid var(--ink)"}}>
      <h2 style={{fontFamily:"var(--serif)",fontSize:"clamp(24px,4vw,34px)",fontWeight:400,color:"var(--ink)",lineHeight:1.1,margin:"0 0 6px",letterSpacing:"-.02em"}}>{title}</h2>
      <p style={{fontSize:12,color:"var(--ink3)",lineHeight:1.6,fontFamily:"var(--mono)",letterSpacing:".02em"}}>{sub}</p>
    </div>
  );
}

function NavRow({onBack,onNext,nextLabel="Continue →"}) {
  return (
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:32,paddingTop:24,borderTop:"1px solid var(--rule)"}}>
      {onBack
        ? <button onClick={onBack} style={{background:"none",border:"none",padding:"10px 0",fontSize:10,letterSpacing:".14em",textTransform:"uppercase",color:"var(--ink4)",cursor:"pointer",fontFamily:"var(--mono)",display:"flex",alignItems:"center",gap:8}}>
            <svg width="14" height="10" viewBox="0 0 14 10" fill="none"><path d="M6 1L1 5l5 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><line x1="1" y1="5" x2="13" y2="5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
            Back
          </button>
        : <div/>
      }
      <button onClick={onNext} style={{background:"var(--ink)",color:"var(--paper)",border:"none",padding:"12px 28px",fontSize:10,letterSpacing:".16em",textTransform:"uppercase",cursor:"pointer",fontFamily:"var(--mono)",display:"flex",alignItems:"center",gap:10}}>
        {nextLabel}
        <svg width="14" height="10" viewBox="0 0 14 10" fill="none"><path d="M8 1l5 4-5 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><line x1="13" y1="5" x2="1" y2="5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
      </button>
    </div>
  );
}

function InfoBanner({msg}) {
  return (
    <div style={{padding:"14px 18px",borderLeft:"3px solid var(--amber)",background:"rgba(184,115,42,.05)",marginBottom:16,display:"flex",gap:12,alignItems:"flex-start"}}>
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{flexShrink:0,marginTop:2}}><circle cx="7" cy="7" r="6" stroke="#B8732A" strokeWidth="1.2"/><line x1="7" y1="5" x2="7" y2="8.5" stroke="#B8732A" strokeWidth="1.4" strokeLinecap="round"/><circle cx="7" cy="10.5" r=".7" fill="#B8732A"/></svg>
      <p style={{fontSize:12,color:"var(--ink2)",lineHeight:1.65,fontFamily:"var(--serif)",fontStyle:"italic"}}>{msg}</p>
    </div>
  );
}

function WarningBadge({w,SEV}) {
  const s=SEV[w.level]||SEV.info;
  const borderCols={critical:"#8B2020",warn:"#B8732A",info:"#1E4060"};
  const bc=borderCols[w.level]||"#1E4060";
  return (
    <div style={{display:"flex",gap:12,padding:"12px 16px",borderLeft:`3px solid ${bc}`,background:`${s.dot}08`,marginBottom:8}}>
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,paddingTop:1,flexShrink:0}}>
        <div style={{width:5,height:5,background:bc,transform:"rotate(45deg)"}}/>
        <span style={{fontSize:7,color:bc,letterSpacing:".1em",writingMode:"vertical-rl",transform:"rotate(180deg)",textTransform:"uppercase",fontFamily:"var(--mono)"}}>{s.txt}</span>
      </div>
      <div style={{fontSize:11,color:"var(--ink2)",lineHeight:1.7,fontFamily:"var(--serif)"}}>{w.msg}</div>
    </div>
  );
}

function NegotiationSlider({ msrp, deal, accent, loc }) {
  const [target, setTarget] = useState(deal);
  const min=Math.round(deal*.88/50)*50, max=msrp;
  const pct=((target-min)/(max-min))*100;
  const saving=msrp-target, savingPct=Math.round((saving/msrp)*100);
  const atDeal=target<=deal, thumbCol=atDeal?"#2A5040":"#B8732A";
  return (
    <div style={{padding:"20px 0",borderTop:"1px solid var(--rule)",borderBottom:"1px solid var(--rule)",marginBottom:28}}>
      <div style={{fontSize:9,color:"var(--ink3)",letterSpacing:".22em",textTransform:"uppercase",marginBottom:16,fontFamily:"var(--mono)"}}>Negotiation Slider</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:16}}>
        {[{l:"Your Target",v:formatPrice(target,loc)},{l:"Saving",v:formatPrice(saving,loc)},{l:"Off MSRP",v:`${savingPct}%`}].map(m=>(
          <div key={m.l} style={{textAlign:"center"}}>
            <div style={{fontSize:9,color:"var(--ink3)",letterSpacing:".12em",textTransform:"uppercase",marginBottom:4,fontFamily:"var(--mono)"}}>{m.l}</div>
            <div style={{fontFamily:"var(--serif)",fontSize:24,fontWeight:400,color:thumbCol,transition:"color .3s"}}>{m.v}</div>
          </div>
        ))}
      </div>
      <div style={{position:"relative",marginBottom:10}}>
        <div style={{position:"absolute",bottom:"100%",marginBottom:4,left:`${((deal-min)/(max-min))*100}%`,transform:"translateX(-50%)",fontSize:8,color:"var(--green)",letterSpacing:".08em",whiteSpace:"nowrap",fontFamily:"var(--mono)"}}>▾ DEAL ESTIMATE</div>
        <input type="range" min={min} max={max} step={50} value={target} onChange={e=>setTarget(Number(e.target.value))} style={{width:"100%",background:`linear-gradient(to right,${thumbCol} 0%,${thumbCol} ${pct}%,#D4C9B4 ${pct}%,#D4C9B4 100%)`,transition:"background .2s"}}/>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:"var(--ink4)",fontFamily:"var(--mono)",marginTop:6}}><span>{formatPrice(min,loc)}</span><span>MSRP {formatPrice(msrp,loc)}</span></div>
      {atDeal&&<div style={{marginTop:10,fontSize:10,color:"#2A5040",letterSpacing:".06em",fontFamily:"var(--mono)"}}>✓ At or below the estimated deal price — a realistic target</div>}
    </div>
  );
}

const TALLY_URL    = "https://tally.so/r/YOUR_FORM_ID";
const TIKTOK_URL   = "https://www.tiktok.com/@stevevinyl";
const SUBSTACK_URL = "https://substack.com/@stevinyl";

function LandingScreen({ onEnter, localeId, onLocaleChange }) {
  const loc = LOCALES[localeId] || LOCALES.gb;
  const features = [
    { icon:"room",    label:"Room Intelligence",   desc:"Enter your dimensions. Get acoustic analysis, speaker placement, and axial mode frequencies." },
    { icon:"building",label:"Building Type Logic", desc:"Apartment, semi-detached, or detached — isolation requirements are calculated automatically." },
    { icon:"catalog", label:"188-Item Catalogue",  desc:"Every major UK hi-fi brand across three budget tiers. Entry level to reference." },
    { icon:"price",   label:"Real Pricing",        desc:"Full MSRP breakdown with a negotiation slider and five dealer leverage points." },
  ];
  const SVGS = {
    room:     <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><rect x="2" y="10" width="16" height="8" rx="1" stroke="currentColor" strokeWidth="1.4"/><polyline points="2,10 10,3 18,10" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/></svg>,
    building: <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><rect x="3" y="8" width="14" height="10" rx="1" stroke="currentColor" strokeWidth="1.4"/><rect x="7" y="12" width="6" height="6" rx=".5" stroke="currentColor" strokeWidth="1.2"/><line x1="3" y1="8" x2="17" y2="8" stroke="currentColor" strokeWidth="1"/></svg>,
    catalog:  <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.4"/><circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="1" strokeDasharray="2 1.5"/><circle cx="10" cy="10" r="1.5" fill="currentColor"/></svg>,
    price:    <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><rect x="3" y="6" width="14" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.4"/><line x1="3" y1="10" x2="17" y2="10" stroke="currentColor" strokeWidth="1"/><line x1="7" y1="13" x2="10" y2="13" stroke="currentColor" strokeWidth="1.2"/></svg>,
  };
  return (
    <div style={{fontFamily:"var(--mono)",background:"var(--paper)",minHeight:"100vh",color:"var(--ink)",position:"relative",overflow:"hidden"}}>
      <div style={{position:"fixed",inset:0,pointerEvents:"none",overflow:"hidden"}}>
        <svg style={{position:"absolute",bottom:"-80px",right:"-80px",opacity:.04}} width="600" height="600" viewBox="0 0 600 600">
          {[280,240,200,160,120,80,40].map(r=><circle key={r} cx="300" cy="300" r={r} fill="none" stroke="#1C1812" strokeWidth="1"/>)}
          <circle cx="300" cy="300" r="14" fill="#1C1812"/>
        </svg>
      </div>
      <div style={{height:3,background:"var(--ink)",width:"100%"}}/>
      <div style={{position:"relative",maxWidth:680,margin:"0 auto",padding:"48px 24px 60px"}}>
        <div className="sl sl1" style={{display:"flex",alignItems:"center",gap:10,marginBottom:24}}>
          <svg width="38" height="38" viewBox="0 0 38 38" className="vinyl-turn">
            <circle cx="19" cy="19" r="18" fill="#EDE7D8" stroke="#D4C9B4" strokeWidth="1"/>
            {[14,10,6].map(r=><circle key={r} cx="19" cy="19" r={r} fill="none" stroke="rgba(197,160,40,.2)" strokeWidth="1"/>)}
            <circle cx="19" cy="19" r="3" fill="#B8732A" opacity=".6"/>
            <circle cx="19" cy="19" r="1.5" fill="#B8732A"/>
          </svg>
          <div>
            <div style={{fontSize:9,letterSpacing:".22em",textTransform:"uppercase",color:"var(--amber)",fontFamily:"var(--mono)"}}>Hi-Fi System Builder</div>
            <div style={{fontSize:9,letterSpacing:".12em",textTransform:"uppercase",color:"var(--ink3)",marginTop:1,fontFamily:"var(--mono)"}}>Property Edition · Beta</div>
          </div>
        </div>
        <div className="sl sl2" style={{marginBottom:20}}>
          <h1 style={{fontFamily:"var(--serif)",fontSize:"clamp(38px,8vw,62px)",fontWeight:400,color:"var(--ink)",lineHeight:1.0,letterSpacing:"-.03em",marginBottom:12}}>
            Build the right<br/><em style={{color:"var(--amber)",fontStyle:"italic",fontWeight:300}}>hi-fi system</em><br/>for your room.
          </h1>
          <p style={{fontSize:13,color:"var(--ink2)",lineHeight:1.75,maxWidth:460,fontFamily:"var(--serif)"}}>
            A guided tool for UK vinyl enthusiasts. Enter your room dimensions, tell it about your building, and it builds a fully priced component recommendation — room-tuned, isolation-aware, and negotiation-ready.
          </p>
        </div>
        <div className="sl sl3" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:1,marginBottom:36,border:"1px solid var(--rule)"}}>
          {features.map((f,fi)=>(
            <div key={f.icon} style={{padding:"16px 18px",background:"var(--paper2)",borderTop:fi>=2?"1px solid var(--rule)":"none",borderLeft:fi%2===1?"1px solid var(--rule)":"none"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                <div style={{color:"var(--amber)",display:"flex",alignItems:"center"}}>{SVGS[f.icon]}</div>
                <span style={{fontSize:9,color:"var(--amber)",letterSpacing:".12em",textTransform:"uppercase",fontFamily:"var(--mono)"}}>{f.label}</span>
              </div>
              <p style={{fontSize:11,color:"var(--ink2)",lineHeight:1.65,fontFamily:"var(--serif)"}}>{f.desc}</p>
            </div>
          ))}
        </div>
        <div className="sl sl4" style={{display:"flex",gap:0,marginBottom:36,borderTop:"2px solid var(--ink)",borderBottom:"1px solid var(--rule)",padding:"16px 0"}}>
          {[{val:"188",label:"Components catalogued"},{val:"33",label:loc.statsLabel},{val:"4",label:"Building types"},{val:"8",label:"Acoustic rules"}].map((s,i)=>(
            <div key={i} style={{flex:1,textAlign:"center",borderRight:i<3?"1px solid var(--rule)":"none",padding:"0 8px"}}>
              <div style={{fontFamily:"var(--serif)",fontSize:28,fontWeight:400,color:"var(--amber)",lineHeight:1}}>{s.val}</div>
              <div style={{fontSize:8,color:"var(--ink3)",letterSpacing:".1em",textTransform:"uppercase",marginTop:4,lineHeight:1.4,fontFamily:"var(--mono)"}}>{s.label}</div>
            </div>
          ))}
        </div>
        <div className="sl sl5" style={{marginBottom:32}}>
          <button onClick={onEnter} style={{display:"inline-flex",alignItems:"center",gap:12,padding:"16px 40px",background:"var(--ink)",border:"none",cursor:"pointer",fontFamily:"var(--mono)",fontSize:11,letterSpacing:".18em",textTransform:"uppercase",color:"var(--paper)"}}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><polygon points="3,2 12,7 3,12" fill="currentColor"/></svg>
            Start Building Your System
          </button>
          <div style={{marginTop:10,fontSize:10,color:"var(--ink4)",letterSpacing:".06em",fontFamily:"var(--mono)"}}>Free to use · no account needed · takes around 8 minutes</div>
        </div>
        <div className="sl sl6" style={{padding:"16px 20px",background:"rgba(42,143,197,.06)",border:"1px solid rgba(42,143,197,.18)",borderRadius:4,marginBottom:28}}>
          <div style={{fontSize:9,color:"var(--blue)",letterSpacing:".18em",textTransform:"uppercase",marginBottom:8}}>Early Access · We want your feedback</div>
          <p style={{fontSize:11,color:"var(--ink3)",lineHeight:1.7,marginBottom:12}}>This is a beta release. The catalogue, acoustic rules, and pricing are based on real UK products but the tool is new — your experience will help shape what gets built next.</p>
          <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
            <a href={TALLY_URL} target="_blank" rel="noopener noreferrer" style={{display:"inline-flex",alignItems:"center",gap:7,padding:"8px 16px",background:"var(--blue)",border:"none",color:"var(--paper)",fontSize:10,letterSpacing:".1em",textTransform:"uppercase",textDecoration:"none",fontFamily:"var(--mono)"}}>Leave Feedback</a>
            <a href={TIKTOK_URL} target="_blank" rel="noopener noreferrer" style={{display:"inline-flex",alignItems:"center",gap:7,padding:"8px 16px",background:"transparent",border:"1px solid var(--rule)",color:"var(--ink3)",fontSize:10,letterSpacing:".1em",textTransform:"uppercase",textDecoration:"none",fontFamily:"var(--mono)"}}>TikTok</a>
            <a href={SUBSTACK_URL} target="_blank" rel="noopener noreferrer" style={{display:"inline-flex",alignItems:"center",gap:7,padding:"8px 16px",background:"transparent",border:"1px solid var(--rule)",color:"var(--ink3)",fontSize:10,letterSpacing:".1em",textTransform:"uppercase",textDecoration:"none",fontFamily:"var(--mono)"}}>Substack</a>
          </div>
        </div>
        <div className="sl sl6" style={{marginBottom:28}}>
          <div style={{fontSize:9,color:"var(--ink3)",letterSpacing:".18em",textTransform:"uppercase",marginBottom:10,fontFamily:"var(--mono)"}}>Your Location</div>
          <div style={{display:"flex",gap:0,flexWrap:"wrap",border:"1px solid var(--rule)"}}>
            {Object.values(LOCALES).map((l,li)=>(
              <button key={l.id} onClick={()=>onLocaleChange(l.id)} style={{display:"flex",alignItems:"center",gap:7,padding:"10px 14px",cursor:"pointer",background:localeId===l.id?"var(--amber)":"transparent",borderLeft:li>0?"1px solid var(--rule)":"none",border:"none",fontFamily:"var(--mono)",fontSize:10,letterSpacing:".06em",color:localeId===l.id?"var(--paper)":"var(--ink3)",transition:"all .15s"}}>
                <span style={{fontSize:16,lineHeight:1}}>{l.flag}</span>
                <span>{l.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════════════════════

export default function HiFiSystemBuilder() {
  // ── FIX 3: Inject styles ONCE via this hook ──
  useGlobalStyles();

  const isMobile = useIsMobile();
  const [showLanding, setShowLanding] = useState(true);
  const [localeId, setLocaleId] = useState("gb");
  const [step, setStep] = useState("materials");
  const [completed, setCompleted] = useState(new Set());
  const [animKey, setAnimKey] = useState(0);
  const [room, setRoom] = useState({ length:5.2, width:4.1, height:2.5 });
  const [floorTypes, setFloorTypes] = useState(["wood"]);
  const [wallMaterials, setWallMaterials] = useState(["plasterboard"]);

  function toggleFloor(v) { setFloorTypes(prev => prev.includes(v) ? prev.filter(x=>x!==v) : [...prev, v]); }
  function toggleWall(v)  { setWallMaterials(prev => prev.includes(v) ? prev.filter(x=>x!==v) : [...prev, v]); }

  const [buildingType, setBuildingType] = useState("apt_upper");
  const [sideboardWidth, setSideboardWidth] = useState(1.2);
  const [sideboardMat, setSideboardMat] = useState("lightweight_wood");
  const [sideWallGap, setSideWallGap] = useState(22);
  const [mounting, setMounting] = useState("sideboard");
  const [tier, setTier] = useState("mid");
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [openCat, setOpenCat] = useState(null);
  const [budget, setBudget] = useState(0);
  const [basket, setBasket] = useState(()=>getDefaultBasket("mid"));
  const prevTier = useRef("mid");

  const loc = LOCALES[localeId] || LOCALES.gb;
  const genreAdj = getGenreAdjustments(selectedGenres);
  const selectedTurntable = basket.find(i=>i.cat==="turntable");
  const bundledCart = selectedTurntable ? (BUNDLED_CARTRIDGES[selectedTurntable.id] || null) : null;
  const needsCartridge = selectedTurntable ? REQUIRES_CARTRIDGE.has(selectedTurntable.id) : false;
  const analysis = analyseRoom({ ...room, floorTypes, wallMaterials, sideboardWidth, sideboardMat, sideWallGap, buildingType });
  const tierData = CATALOG[tier];
  const synergy = calcSynergy(basket);
  const mountData = MOUNTING.find(m=>m.id===mounting);
  const basketTotal = basket.reduce((s,i)=>s+i.price,0);
  const autoTotal = analysis.autoItems.reduce((s,i)=>s+i.price,0);

  useEffect(()=>{
    if(prevTier.current!==tier){
      setBasket(getDefaultBasket(tier));
      prevTier.current=tier;
    }
    const firstCat = Object.keys(CATALOG[tier].components)[0];
    setOpenCat(firstCat);
  },[tier]);

  useEffect(()=>{
    if(step==="catalog"){
      const SIGNAL_ORDER = ["turntable","cartridge","phono","amplifier","speakers","cables","isolation","power"];
      const cats = SIGNAL_ORDER.filter(k => tierData.components[k]);
      const firstUndone = cats.find(k => !basket.find(b=>(tierData.components[k]||[]).some(o=>o.id===b.id)));
      setOpenCat(firstUndone || cats[0]);
    }
  },[step]);

  function goTo(id) { setAnimKey(k=>k+1); setStep(id); }
  function advance(current, next) { setCompleted(c=>new Set([...c,current])); goTo(next); }
  function selectComp(catKey, item) { setBasket(prev => { const opts=CATALOG[tier].components[catKey]||[]; const filtered=prev.filter(b=>!opts.find(o=>o.id===b.id)&&b.id!==`generic_${catKey}`); return [...filtered, item]; }); }
  function isSelected(item) { return basket.some(b=>b.id===item.id); }

  const SEV = {
    critical:{ bg:"rgba(139,32,32,.06)",  border:"rgba(139,32,32,.2)",   dot:"#8B2020", txt:"CRITICAL" },
    warn:    { bg:"rgba(184,115,42,.06)", border:"rgba(184,115,42,.2)",  dot:"#B8732A", txt:"WARNING"  },
    info:    { bg:"rgba(30,64,96,.06)",   border:"rgba(30,64,96,.2)",    dot:"#1E4060", txt:"INFO"     },
  };

  const BICONS = {
    apt_ground:    ({col,size=28})=><svg width={size} height={size} viewBox="0 0 28 28" fill="none"><rect x="3" y="14" width="22" height="11" rx="1" stroke={col} strokeWidth="1.4"/><rect x="3" y="8" width="22" height="7" rx="1" stroke={col} strokeWidth="1.4"/><line x1="3" y1="14" x2="25" y2="14" stroke={col} strokeWidth="1"/><rect x="10" y="16" width="8" height="6" rx=".5" stroke={col} strokeWidth="1"/><line x1="3" y1="8" x2="25" y2="8" stroke={col} strokeWidth=".6" strokeDasharray="2 2"/></svg>,
    apt_upper:     ({col,size=28})=><svg width={size} height={size} viewBox="0 0 28 28" fill="none"><rect x="3" y="4" width="22" height="6" rx="1" stroke={col} strokeWidth="1.4"/><rect x="3" y="11" width="22" height="6" rx="1" stroke={col} strokeWidth="1"/><rect x="3" y="18" width="22" height="6" rx="1" stroke={col} strokeWidth=".8" opacity=".4"/><line x1="3" y1="11" x2="25" y2="11" stroke={col} strokeWidth="1"/><rect x="10" y="6" width="8" height="3" rx=".5" stroke={col} strokeWidth="1"/><circle cx="22" cy="7" r="1.5" fill={col}/></svg>,
    detached:      ({col,size=28})=><svg width={size} height={size} viewBox="0 0 28 28" fill="none"><polygon points="14,3 25,11 25,24 3,24 3,11" stroke={col} strokeWidth="1.4" fill="none"/><line x1="14" y1="3" x2="14" y2="11" stroke={col} strokeWidth="1"/><rect x="10" y="16" width="8" height="8" rx=".5" stroke={col} strokeWidth="1"/><rect x="6" y="14" width="4" height="4" rx=".5" stroke={col} strokeWidth=".8"/></svg>,
    semi_detached: ({col,size=28})=><svg width={size} height={size} viewBox="0 0 28 28" fill="none"><polygon points="8,5 17,11 17,24 3,24 3,11" stroke={col} strokeWidth="1.4" fill="none"/><polygon points="17,8 25,13 25,24 17,24 17,11" stroke={col} strokeWidth="1" fill="none" opacity=".5"/><line x1="17" y1="11" x2="17" y2="24" stroke={col} strokeWidth="1.5"/><rect x="6" y="16" width="5" height="8" rx=".5" stroke={col} strokeWidth="1"/></svg>,
  };

  // ── Step panels ──────────────────────────────────────────────────────────────

  const panels = {

    materials: (
      <div>
        <StepHeading title="Building & Materials" sub="Your building type determines isolation requirements — select carefully"/>
        <SectionLabel>Building Type</SectionLabel>
        <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10,marginBottom:24}}>
          {Object.values(BUILDING_TYPES).map(bt=>{
            const active=buildingType===bt.id;
            const riskCol=bt.riskScore>=80?"var(--red)":bt.riskScore>=50?"var(--amber)":bt.riskScore>=25?"var(--amber)":"var(--green)";
            const BIcon=BICONS[bt.id];
            return (
              <button key={bt.id} onClick={()=>setBuildingType(bt.id)} style={{padding:"18px 16px",textAlign:"left",cursor:"pointer",borderRadius:4,border:`1px solid ${active?riskCol+"70":"var(--rule)"}`,background:active?`${riskCol}0C`:"var(--paper2)",transition:"all .22s"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                  <BIcon col={active?riskCol:"var(--ink3)"} size={28}/>
                  <div style={{fontSize:8,color:riskCol,background:`${riskCol}18`,border:`1px solid ${riskCol}30`,padding:"1px 6px",borderRadius:2,letterSpacing:".1em",textTransform:"uppercase"}}>Risk {bt.riskScore}</div>
                </div>
                <div style={{fontFamily:"var(--serif)",fontSize:15,color:active?riskCol:"var(--ink2)",marginBottom:2}}>{(loc.buildingTypes[bt.id]||{label:bt.label}).label}</div>
                <div style={{fontSize:9,color:active?riskCol+"AA":"var(--ink4)",letterSpacing:".08em",marginBottom:8}}>{(loc.buildingTypes[bt.id]||{sub:bt.sub}).sub}</div>
                <div style={{fontSize:10,color:"var(--ink4)",lineHeight:1.5}}>{bt.description}</div>
              </button>
            );
          })}
        </div>

        {analysis.bld&&(
          <div style={{marginBottom:20}}>
            <SectionLabel>Isolation Requirements — {analysis.bld.label} {analysis.bld.sub}</SectionLabel>
            <div style={{display:"grid",gap:6}}>
              {Object.entries(analysis.iso).map(([key,spec])=>{
                if(spec.price===0&&!spec.required&&!spec.recommended) return null;
                const statusCol=spec.required?"var(--red)":spec.recommended?"var(--amber)":"var(--ink4)";
                const statusLabel=spec.required?"MANDATORY":spec.recommended?"RECOMMENDED":"OPTIONAL";
                return (
                  <div key={key} style={{display:"grid",gridTemplateColumns:"auto 1fr",alignItems:"center",gap:12,padding:"11px 14px",background:spec.required?"rgba(239,68,68,.05)":spec.recommended?"rgba(197,160,40,.04)":"transparent",border:`1px solid ${spec.required?"rgba(239,68,68,.2)":spec.recommended?"rgba(197,160,40,.15)":"var(--rule)"}`,borderRadius:3}}>
                    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3}}><div style={{width:5,height:5,borderRadius:"50%",background:statusCol}}/><span style={{fontSize:7,color:statusCol,letterSpacing:".1em",writingMode:"vertical-rl",transform:"rotate(180deg)",textTransform:"uppercase"}}>{statusLabel}</span></div>
                    <div><div style={{fontSize:12,color:"var(--ink)",fontFamily:"var(--serif)",marginBottom:2}}>{spec.item}</div><div style={{fontSize:10,color:"var(--ink4)",lineHeight:1.5}}>{spec.reason}</div></div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div style={{height:1,background:"var(--ink)",margin:"28px 0 24px"}}/>
        <StepHeading title="Surface Materials" sub="Wall and floor materials affect acoustic reflections and bass character"/>
        <div style={{display:"grid",gap:12,marginBottom:20}}>
          <div style={{marginBottom:4}}>
            <div style={{fontSize:9,letterSpacing:".18em",textTransform:"uppercase",color:"var(--ink3)",marginBottom:10,fontFamily:"var(--mono)"}}>Floor Type — select all that apply</div>
            <div style={{display:"flex",gap:0,flexWrap:"wrap",border:"1px solid var(--rule)"}}>
              {[{value:"carpet",label:"Carpet"},{value:"wood",label:"Hardwood / Engineered"},{value:"tile",label:"Tile / Stone"}].map((o,i)=>{
                const sel=floorTypes.includes(o.value);
                return (
                  <button key={o.value} onClick={()=>toggleFloor(o.value)} style={{flex:"1 1 auto",padding:"10px 14px",fontSize:10,letterSpacing:".05em",cursor:"pointer",fontFamily:"var(--mono)",background:sel?"var(--amber)":"transparent",color:sel?"var(--paper)":"var(--ink3)",border:"none",borderLeft:i>0?"1px solid var(--rule)":"none",transition:"all .15s",whiteSpace:"nowrap",position:"relative"}}>
                    {sel&&<span style={{position:"absolute",top:4,right:5,fontSize:8,opacity:.7}}>✓</span>}
                    {o.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div style={{marginBottom:4}}>
            <div style={{fontSize:9,letterSpacing:".18em",textTransform:"uppercase",color:"var(--ink3)",marginBottom:10,fontFamily:"var(--mono)"}}>Wall Materials — select all that apply</div>
            <div style={{display:"flex",gap:0,flexWrap:"wrap",border:"1px solid var(--rule)"}}>
              {loc.wallMaterials.map((o,i)=>{
                const sel=wallMaterials.includes(o.value);
                return (
                  <button key={o.value} onClick={()=>toggleWall(o.value)} style={{flex:"1 1 auto",padding:"10px 14px",fontSize:10,letterSpacing:".05em",cursor:"pointer",fontFamily:"var(--mono)",background:sel?"var(--amber)":"transparent",color:sel?"var(--paper)":"var(--ink3)",border:"none",borderLeft:i>0?"1px solid var(--rule)":"none",transition:"all .15s",whiteSpace:"nowrap",minWidth:0,position:"relative"}}>
                    {sel&&<span style={{position:"absolute",top:4,right:5,fontSize:8,opacity:.7}}>✓</span>}
                    {o.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        {analysis.warnings.filter(w=>w.level==="critical"||w.msg.toLowerCase().includes("plasterboard")||w.msg.toLowerCase().includes("glass")||w.msg.toLowerCase().includes("floor")).map((w,i)=><WarningBadge key={i} w={w} SEV={SEV}/>)}
        <NavRow onNext={()=>advance("materials","room")}/>
      </div>
    ),

    room: (
      <div>
        <StepHeading title="Room Dimensions" sub="Enter your listening room's physical dimensions"/>
        <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"repeat(3,1fr)",gap:isMobile?0:10,marginBottom:16}}>
          {[{k:"length",label:"Length",max:12},{k:"width",label:"Width",max:10},{k:"height",label:"Height",max:4}].map(({k,label,max})=><DimSlider key={k} label={label} value={room[k]} unit="m" min={1.5} max={max} step={0.1} onChange={v=>setRoom(r=>({...r,[k]:v}))}/>)}
        </div>
        <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"repeat(3,1fr)",gap:8,marginBottom:24}}>
          {[{label:"Floor Area",val:`${analysis.area} m²`},{label:"Volume",val:`${analysis.volume} m³`},{label:"Speaker Sep.",val:`${analysis.separation}m`}].map(m=>(
            <div key={m.label} style={{padding:"12px 14px",background:"var(--paper2)",border:"1px solid var(--rule)",borderRadius:3,textAlign:"center"}}>
              <div style={{fontSize:9,color:"var(--ink4)",letterSpacing:".12em",textTransform:"uppercase",marginBottom:4}}>{m.label}</div>
              <div style={{fontFamily:"var(--serif)",fontSize:18,color:"var(--amber)"}}>{m.val}</div>
            </div>
          ))}
        </div>
        <div style={{display:"flex",justifyContent:"center",marginBottom:24}}>
          <RoomDiagram length={room.length} width={room.width} separation={analysis.separation} backWall={analysis.backWall} listenPos={analysis.listenPos||3.2} sideWallGap={sideWallGap} accent={tierData.accent}/>
        </div>
        {analysis.tierRec&&<InfoBanner msg={`Room size suggests a ${analysis.tierRec==="entry"?"compact, focused":analysis.tierRec==="mid"?"mid-range":"high-end reference"} system for this space.`}/>}
        <NavRow onBack={()=>goTo("materials")} onNext={()=>{if(analysis.tierRec)setTier(analysis.tierRec);advance("room","furniture");}}/>
      </div>
    ),

    furniture: (
      <div>
        <StepHeading title="Furniture & Placement" sub="How your equipment is mounted changes what we ask next"/>
        <SectionLabel>Mounting Option</SectionLabel>
        <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"repeat(3,1fr)",gap:isMobile?6:10,marginBottom:20}}>
          {MOUNTING.map(m=>{
            const active=mounting===m.id, Icon=m.id==="sideboard"?IconSideboard:m.id==="rack"?IconRack:IconFloor;
            return (
              <button key={m.id} onClick={()=>setMounting(m.id)} style={{padding:"22px 14px 16px",textAlign:"center",cursor:"pointer",borderRadius:3,border:`1px solid ${active?"rgba(197,160,40,.5)":"var(--rule)"}`,background:active?"rgba(197,160,40,.08)":"var(--paper2)",transition:"all .2s"}}>
                <div style={{marginBottom:12,opacity:active?1:.35}}><Icon size={30} col={active?"var(--amber)":"var(--ink3)"}/></div>
                <div style={{fontSize:12,fontFamily:"var(--serif)",color:active?"var(--amber)":"var(--ink2)",marginBottom:3}}>{m.label}</div>
                <div style={{fontSize:8,color:"var(--ink4)",letterSpacing:".06em"}}>{m.sub}</div>
              </button>
            );
          })}
        </div>
        {mountData&&<InfoBanner msg={mountData.note}/>}
        <div style={{display:"grid",gap:12,marginBottom:16,marginTop:16}}>
          {mounting!=="rack"&&(
            <>
              <DimSlider label="Sideboard Width" value={sideboardWidth} unit="m" min={0.6} max={3.0} step={0.05} onChange={setSideboardWidth} noteOn={sideboardWidth<1.5} noteMsg={sideboardWidth<1.5?"Below 1.5m — stacking config will apply":"Sufficient width for side-by-side components"} noteCol={sideboardWidth<1.5?"var(--amber)":"var(--green)"}/>
              <SelectButtons label="Sideboard Material" value={sideboardMat} onChange={setSideboardMat} opts={[{value:"solid_oak",label:"Solid Oak"},{value:"lightweight_wood",label:"Lightweight / MDF"},{value:"glass_steel",label:"Glass & Steel"},{value:"slate_stone",label:"Slate / Stone"}]}/>
            </>
          )}
          <DimSlider label="Speaker to Side Wall" value={sideWallGap} unit="cm" min={5} max={100} step={1} onChange={setSideWallGap} noteOn={sideWallGap<30} noteMsg={sideWallGap<30?"< 30cm — Side-Wall Rule triggered":"Good side-wall clearance"} noteCol={sideWallGap<30?"var(--red)":"var(--green)"}/>
        </div>
        {analysis.warnings.filter(w=>w.msg.toLowerCase().includes("sideboard")||w.msg.toLowerCase().includes("side wall")||w.msg.toLowerCase().includes("stacking")).map((w,i)=><WarningBadge key={i} w={w} SEV={SEV}/>)}
        <NavRow onBack={()=>goTo("room")} onNext={()=>advance("furniture","genres")}/>
      </div>
    ),

    genres: (
      <div>
        <StepHeading title="Music Preferences" sub="Select the genres you listen to most — this shapes the component recommendations"/>
        <div style={{marginBottom:24,padding:"14px 18px",borderLeft:"3px solid var(--amber)",background:"rgba(184,115,42,.05)"}}>
          <p style={{fontSize:12,color:"var(--ink2)",lineHeight:1.7,fontFamily:"var(--serif)",fontStyle:"italic"}}>Select as many as apply. Genre preference influences speaker character, amplifier topology, and cartridge guidance.</p>
        </div>
        <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"repeat(auto-fill,minmax(280px,1fr))",gap:10,marginBottom:28}}>
          {GENRES.map(g => {
            const sel=selectedGenres.includes(g.id);
            return (
              <button key={g.id} onClick={()=>setSelectedGenres(prev=>prev.includes(g.id)?prev.filter(x=>x!==g.id):[...prev,g.id])} style={{padding:"16px 18px",textAlign:"left",cursor:"pointer",background:sel?"var(--paper2)":"transparent",border:`1px solid ${sel?"var(--ink2)":"var(--rule)"}`,borderLeft:`4px solid ${sel?"var(--amber)":"var(--rule)"}`,transition:"all .18s"}}>
                <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:8}}>
                  <span style={{fontSize:22,lineHeight:1,flexShrink:0}}>{g.emoji}</span>
                  <div>
                    <div style={{fontFamily:"var(--serif)",fontSize:15,color:sel?"var(--ink)":"var(--ink2)"}}>{g.label}</div>
                    <div style={{fontSize:9,color:"var(--ink4)",letterSpacing:".08em",fontFamily:"var(--mono)",marginTop:1}}>{g.desc}</div>
                  </div>
                  {sel&&<div style={{marginLeft:"auto",width:18,height:18,background:"var(--ink)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><svg width="10" height="8" viewBox="0 0 10 8" fill="none"><polyline points="1,4 3.5,6.5 9,1" stroke="#F5F0E8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></div>}
                </div>
                {sel&&<div className="fu" style={{fontSize:10,color:"var(--ink3)",lineHeight:1.65,fontFamily:"var(--serif)",borderTop:"1px solid var(--rule)",paddingTop:8,marginTop:4}}>{g.speakerProfile.split(".")[0]}.</div>}
              </button>
            );
          })}
        </div>
        <div style={{position:"sticky",bottom:0,background:"var(--paper)",borderTop:"2px solid var(--ink)",padding:"14px 0 4px",zIndex:10,marginTop:8}}>
          <NavRow onBack={()=>goTo("furniture")} onNext={()=>advance("genres","tier")} nextLabel="Continue to System Brief →"/>
        </div>
      </div>
    ),

    tier: (
      <div>
        <StepHeading title="System Brief" sub="What your room and building profile actually requires — no brands yet"/>
        <div style={{marginBottom:24,padding:"16px 18px",background:"var(--paper2)",border:"1px solid var(--rule)",borderRadius:4}}>
          <SectionLabel>Your Profile</SectionLabel>
          <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"repeat(3,1fr)",gap:10}}>
            {[{l:"Room",v:`${room.length}×${room.width}m`,sub:`${analysis.area} m²`},{l:"Building",v:analysis.bld?.label||"—",sub:analysis.bld?.sub||""},{l:"Floor",v:(floorTypes||["wood"]).map(f=>f==="wood"?"Hardwood":f==="carpet"?"Carpet":"Tile").join(" + "),sub:"floor type"}].map(m=>(
              <div key={m.l} style={{textAlign:"center",padding:"10px 8px",background:"var(--paper2)",border:"1px solid var(--rule)"}}>
                <div style={{fontSize:8,color:"var(--ink4)",letterSpacing:".12em",textTransform:"uppercase",marginBottom:4}}>{m.l}</div>
                <div style={{fontFamily:"var(--serif)",fontSize:14,color:"var(--ink)"}}>{m.v}</div>
                <div style={{fontSize:9,color:"var(--ink4)",marginTop:2}}>{m.sub}</div>
              </div>
            ))}
          </div>
        </div>
        <SectionLabel>System Level</SectionLabel>
        {analysis.tierRec&&<InfoBanner msg={`Based on your room (${analysis.area} m²), the ${analysis.tierRec==="entry"?"Entry Level":analysis.tierRec==="mid"?"Mid-Range":"High-End"} system level is a strong match. (${loc.tierRanges[analysis.tierRec]})`}/>}
        <div style={{marginBottom:16,padding:"14px 16px",background:"var(--paper2)",border:"1px solid var(--rule)"}}>
          <div style={{fontSize:9,color:"var(--ink3)",letterSpacing:".18em",textTransform:"uppercase",marginBottom:8,fontFamily:"var(--mono)"}}>Your Budget (optional)</div>
          <div style={{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,flex:1}}>
              <span style={{fontFamily:"var(--serif)",fontSize:18,color:"var(--ink3)"}}>{loc.symbol}</span>
              <input type="number" min="0" step="100" value={budget||""} onChange={e=>setBudget(Math.max(0,parseInt(e.target.value)||0))} placeholder="e.g. 2000" style={{flex:1,minWidth:120,padding:"8px 12px",fontFamily:"var(--serif)",fontSize:16,color:"var(--ink)",background:"var(--paper)",border:"1px solid var(--rule)",outline:"none"}}/>
            </div>
            {budget>0&&<button onClick={()=>setBudget(0)} style={{background:"none",border:"none",cursor:"pointer",fontSize:10,color:"var(--ink4)",fontFamily:"var(--mono)",letterSpacing:".1em",textTransform:"uppercase"}}>Clear</button>}
          </div>
        </div>
        <div style={{display:"grid",gap:10,marginBottom:4}}>
          {Object.values(CATALOG).map(t=>{
            const active=tier===t.tier, rec=analysis.tierRec===t.tier;
            const DESCS={entry:"Excellent entry into high-fidelity vinyl replay. All components are purpose-built for music.",mid:"The sweet spot for diminishing returns. Components at this level are sonically mature.",high:"Reference-level performance. At this level isolation, cabling, and room acoustics have as much impact as the components."};
            return (
              <button key={t.tier} onClick={()=>setTier(t.tier)} style={{padding:"18px 20px",textAlign:"left",cursor:"pointer",borderRadius:3,border:`1px solid ${active?t.accent+"60":rec?t.accent+"30":"var(--rule)"}`,background:active?`${t.accent}0E`:"var(--paper2)",transition:"all .25s"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}><span style={{fontFamily:"var(--serif)",fontSize:20,color:active?t.accent:"var(--ink2)"}}>{t.label==="Entry"?"Entry Level":t.label==="Mid"?"Mid-Range":"High-End"}</span>{rec&&<Tag col="#2A5040">Room Match</Tag>}{active&&<Tag col={t.accent}>Selected</Tag>}</div>
                </div>
                <div style={{fontSize:11,color:active?"var(--ink2)":"var(--ink4)",lineHeight:1.6}}>{DESCS[t.tier]}</div>
                {active&&<div style={{marginTop:8,fontSize:10,color:t.accent,letterSpacing:".08em",fontFamily:"var(--mono)"}}>Specific brand recommendations appear in the next step →</div>}
              </button>
            );
          })}
        </div>
        <NavRow onBack={()=>goTo("genres")} onNext={()=>advance("tier","catalog")} nextLabel="See Component Recommendations →"/>
      </div>
    ),

    catalog: (
      <div>
        <StepHeading title="Component Recommendations" sub={`${tier==="entry"?"Entry Level":tier==="mid"?"Mid-Range":"High-End"} · select one item per category`}/>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 16px",background:"var(--paper2)",border:"1px solid var(--rule)",marginBottom:20,flexWrap:"wrap",gap:12}}>
          <SynergyRing score={synergy}/>
          <div style={{textAlign:"right",display:"flex",gap:isMobile?12:20,alignItems:"flex-start"}}>
            <div>
              <div style={{fontSize:9,color:"var(--ink4)",letterSpacing:".14em",textTransform:"uppercase",marginBottom:4,fontFamily:"var(--mono)"}}>Current Build</div>
              <div style={{fontFamily:"var(--serif)",fontSize:22,color:budget>0&&basketTotal>budget?"#8B2020":basketTotal>0?"var(--ink)":"var(--ink4)"}}>{basketTotal>0?formatPrice(basketTotal,loc):"—"}</div>
              {budget>0&&basketTotal>0&&<div style={{fontSize:9,fontFamily:"var(--mono)",marginTop:2,color:basketTotal>budget?"#8B2020":"#2A5040"}}>{basketTotal>budget?`${formatPrice(basketTotal-budget,loc)} over`:`${formatPrice(budget-basketTotal,loc)} left`}</div>}
            </div>
            <div>
              <div style={{fontSize:9,color:"var(--ink4)",letterSpacing:".14em",textTransform:"uppercase",marginBottom:4,fontFamily:"var(--mono)"}}>Selected</div>
              <div style={{fontFamily:"var(--serif)",fontSize:22,color:tierData.accent}}>{basket.length}<span style={{fontSize:13,color:"var(--ink4)"}}> / {Object.keys(tierData.components).length}</span></div>
            </div>
          </div>
        </div>

        <div style={{border:"1px solid var(--rule)",marginBottom:24}}>
          {(()=>{
            const SIGNAL_ORDER = ["turntable","cartridge","phono","amplifier","speakers","cables","isolation","power"];
            return SIGNAL_ORDER.filter(k=>tierData.components[k]).map(k=>[k,tierData.components[k]]);
          })().map(([catKey,rawOpts],catIdx)=>{
            const genreScore=(item)=>{ if(catKey==="speakers"&&genreAdj.speakers[item.vendor])return genreAdj.speakers[item.vendor]; if(catKey==="amplifier"&&genreAdj.amps[item.vendor])return genreAdj.amps[item.vendor]; return 0; };
            const selCartForSort=basket.find(b=>b.cat==="cartridge");
            const phonoScore=(item)=>{ if(catKey!=="phono"||!selCartForSort)return 0; const subL=((selCartForSort.sub||"").toLowerCase()); const cartIsMC=subL.includes("moving coil")||subL.includes(" mc "); const stageSubL=(item.sub||"").toLowerCase(); const stageNoteL=(item.note||"").toLowerCase(); const stageMC=stageSubL.includes(" mc")||stageNoteL.includes("moving coil"); const stageMM=stageSubL.includes(" mm")||stageNoteL.includes("moving magnet")||item.id==="e_builtin"||item.id==="m_builtin"; if(cartIsMC&&stageMC)return 10; if(!cartIsMC&&stageMM)return 10; if(cartIsMC&&stageMM&&!stageMC)return -5; if(!cartIsMC&&stageMC&&!stageMM)return -5; return 0; };
            const opts=(()=>{ const base=selectedGenres.length>0?[...rawOpts].sort((a,b)=>genreScore(b)-genreScore(a)):[...rawOpts]; return catKey==="phono"&&selCartForSort?base.sort((a,b)=>phonoScore(b)-phonoScore(a)):base; })();
            const sel=basket.find(b=>opts.some(o=>o.id===b.id));
            const v=sel?(VENDORS[sel.vendor]||VENDORS.generic):null;
            const isOpen=openCat===catKey;
            return (
              <div key={catKey} style={{borderTop:catIdx>0?"1px solid var(--rule)":"none"}}>
                <button onClick={()=>setOpenCat(isOpen?null:catKey)} style={{width:"100%",display:"grid",gridTemplateColumns:"auto auto 1fr auto",alignItems:"center",gap:12,padding:"14px 16px",background:isOpen?"var(--ink)":"transparent",border:"none",cursor:"pointer",textAlign:"left",transition:"background .15s"}}>
                  <CatIcon cat={catKey} size={13} col={isOpen?"#F5F0E8":sel?"#B8732A":"#9A9088"}/>
                  <span style={{fontSize:9,letterSpacing:".18em",textTransform:"uppercase",color:isOpen?"#F5F0E8":sel?"var(--amber)":"var(--ink4)",fontFamily:"var(--mono)",whiteSpace:"nowrap"}}>{CAT_LABELS[catKey]}</span>
                  {sel?(
                    <div style={{display:"flex",alignItems:"center",gap:8,minWidth:0,paddingLeft:4}}>
                      <div style={{width:3,height:20,background:isOpen?"rgba(245,240,232,.4)":v.col,borderRadius:1,flexShrink:0}}/>
                      <div style={{minWidth:0}}>
                        <span style={{fontFamily:"var(--serif)",fontSize:12,color:isOpen?"#F5F0E8":"var(--ink)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",display:"block"}}>{sel.name}</span>
                        <span style={{fontSize:9,color:isOpen?"rgba(245,240,232,.6)":"var(--ink4)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",display:"block"}}>{v.name} · {formatPrice(sel.price,loc)}</span>
                      </div>
                    </div>
                  ):(
                    <span style={{fontSize:10,color:isOpen?"rgba(245,240,232,.5)":"var(--ink4)",fontStyle:"italic",paddingLeft:4}}>Choose one</span>
                  )}
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{transform:isOpen?"rotate(180deg)":"rotate(0)",transition:"transform .2s",flexShrink:0}}>
                    <path d="M2 4.5l5 5 5-5" stroke={isOpen?"#F5F0E8":"#9A9088"} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                {isOpen&&(
                  <div className="fu" style={{borderTop:"1px solid var(--rule)",background:"var(--paper)"}}>
                    {catKey==="cartridge"&&bundledCart&&(
                      <div style={{padding:"10px 16px 0 16px"}}>
                        <div style={{padding:"10px 14px",borderLeft:"3px solid #2A5040",background:"rgba(42,80,64,.05)",marginBottom:2}}>
                          <div style={{fontSize:9,color:"#2A5040",letterSpacing:".14em",textTransform:"uppercase",marginBottom:4,fontFamily:"var(--mono)"}}>Cartridge included — {bundledCart.name}</div>
                          <p style={{fontSize:10,color:"var(--ink2)",lineHeight:1.65,fontFamily:"var(--serif)"}}>{bundledCart.note}</p>
                        </div>
                      </div>
                    )}
                    {catKey==="phono"&&(()=>{
                      const selCart=basket.find(b=>b.cat==="cartridge");
                      if(!selCart) return null;
                      const isMC=(selCart.sub||"").toLowerCase().includes("moving coil")||(selCart.sub||"").toLowerCase().includes(" mc ");
                      return (
                        <div style={{padding:"10px 16px 0"}}>
                          <div style={{padding:"8px 12px",borderLeft:"3px solid var(--amber)",background:"rgba(184,115,42,.05)",fontSize:10,color:"var(--ink2)",fontFamily:"var(--serif)",lineHeight:1.65}}>
                            {isMC?<>You've selected <strong>{selCart.name}</strong> — a Moving Coil cartridge. You need a dedicated MC phono stage.</>:<>You've selected <strong>{selCart.name}</strong> — a Moving Magnet cartridge. A MM phono stage or your amp's built-in stage is all you need.</>}
                          </div>
                        </div>
                      );
                    })()}
                    <div style={{display:"grid",gap:0}}>
                      {opts.map((item,optIdx)=>{
                        const on=isSelected(item), iv=VENDORS[item.vendor]||VENDORS.generic;
                        const score=genreScore(item);
                        const matchedGenres=score>0?GENRES.filter(g=>selectedGenres.includes(g.id)&&((catKey==="speakers"&&g.speakerWeights[item.vendor])||(catKey==="amplifier"&&g.ampWeights[item.vendor]))):[];
                        const allCatKeysList=Object.keys(tierData.components);
                        const nextCat=allCatKeysList[allCatKeysList.indexOf(catKey)+1];
                        return (
                          <div key={item.id} style={{borderTop:optIdx>0?"1px solid var(--rule)":"none"}}>
                            <button onClick={()=>{ selectComp(catKey,item); if(nextCat) setOpenCat(nextCat); else setOpenCat(null); }} style={{width:"100%",display:"grid",gridTemplateColumns:"4px 1fr auto",alignItems:"center",gap:0,background:on?"var(--paper2)":"transparent",border:"none",cursor:"pointer",textAlign:"left",padding:0,transition:"background .15s"}}>
                              <div style={{width:4,alignSelf:"stretch",background:on?iv.col:"transparent",transition:"background .15s"}}/>
                              <div style={{padding:"12px 14px"}}>
                                <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:8,marginBottom:3}}>
                                  <span style={{fontFamily:"var(--serif)",fontSize:13,color:on?"var(--ink)":"var(--ink2)",fontWeight:on?400:300,lineHeight:1.3}}>{item.name}</span>
                                  {matchedGenres.length>0&&<div style={{display:"flex",gap:2,flexShrink:0}}>{matchedGenres.slice(0,3).map(g=><span key={g.id} style={{fontSize:15,lineHeight:1}}>{g.emoji}</span>)}</div>}
                                </div>
                                <div style={{fontSize:9,color:"var(--ink4)",marginBottom:4}}>{item.sub}</div>
                                <div style={{display:"flex",alignItems:"center",gap:6}}>
                                  <span style={{fontSize:8,letterSpacing:".06em",textTransform:"uppercase",padding:"1px 6px",background:`${iv.col}15`,border:`1px solid ${iv.col}30`,color:iv.col,fontFamily:"var(--mono)"}}>{iv.name}</span>
                                  {iv.city&&iv.city!=="—"&&<span style={{fontSize:8,color:"var(--ink4)",letterSpacing:".04em"}}>{iv.city}</span>}
                                </div>
                                {item.note&&<div style={{marginTop:6,fontSize:9,color:"var(--ink3)",lineHeight:1.55,borderTop:"1px solid var(--rule)",paddingTop:6}}>{item.note}</div>}
                              </div>
                              <div style={{padding:"12px 16px 12px 0",textAlign:"right",flexShrink:0}}>
                                <div style={{fontFamily:"var(--serif)",fontSize:14,color:on?"var(--ink)":"var(--ink3)",marginBottom:2}}>{formatPrice(item.price,loc)}</div>
                                {budget>0&&!on&&item.price>0&&(basketTotal+item.price)>budget&&<div style={{fontSize:7,color:"#8B2020",fontFamily:"var(--mono)",letterSpacing:".08em"}}>over budget</div>}
                                {on&&<div style={{width:18,height:18,background:"var(--ink)",display:"flex",alignItems:"center",justifyContent:"center",marginLeft:"auto"}}><svg width="10" height="8" viewBox="0 0 10 8" fill="none"><polyline points="1,4 3.5,6.5 9,1" stroke="#F5F0E8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></div>}
                              </div>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <NavRow onBack={()=>goTo("tier")} onNext={()=>advance("catalog","summary")} nextLabel="View Full Summary →"/>
      </div>
    ),

    summary: (()=>{
      const msrpComp=basket.filter(i=>i.price>0).reduce((s,i)=>s+i.price,0);
      const msrpAuto=analysis.autoItems.filter(i=>i.price>0).reduce((s,i)=>s+i.price,0);
      const msrpTotal=msrpComp+msrpAuto;
      const discPct=tier==="high"?0.82:tier==="mid"?0.77:0.88;
      const dealEst=Math.round(msrpTotal*discPct/50)*50;
      const saving=msrpTotal-dealEst;
      const [swapOpen, setSwapOpen] = React.useState(null);
      const SIGNAL_ORDER_SUMMARY = ["turntable","cartridge","phono","amplifier","speakers","cables","isolation","power"];
      const allCats = SIGNAL_ORDER_SUMMARY.filter(k=>tierData.components[k]);
      const selectedByCat=(catKey)=>basket.find(b=>(tierData.components[catKey]||[]).some(o=>o.id===b.id));
      const overBy=budget>0?basketTotal-budget:0;
      const budgetSuggestions=(()=>{ if(overBy<=0||budget===0)return []; const suggestions=[]; basket.forEach(selItem=>{ const catKey=selItem.cat; const opts=tierData.components[catKey]||[]; const cheaper=opts.filter(o=>o.id!==selItem.id&&o.price<selItem.price).sort((a,b)=>a.price-b.price)[0]; if(cheaper)suggestions.push({catKey,from:selItem,to:cheaper,saving:selItem.price-cheaper.price}); }); suggestions.sort((a,b)=>b.saving-a.saving); let covered=0; const result=[]; for(const s of suggestions){if(covered>=overBy)break;if(result.length>=3)break;result.push(s);covered+=s.saving;} return result; })();
      return (
        <div>
          <StepHeading title="Your System" sub="Review your build · swap any component · see full pricing"/>
          {overBy>0&&(
            <div className="fu" style={{marginBottom:24,padding:"16px 18px",borderLeft:"3px solid #8B2020",background:"rgba(139,32,32,.04)"}}>
              <div style={{fontSize:9,color:"#8B2020",letterSpacing:".18em",textTransform:"uppercase",marginBottom:6,fontFamily:"var(--mono)"}}>Over budget by {formatPrice(overBy,loc)}</div>
              <div style={{display:"grid",gap:6}}>
                {budgetSuggestions.length>0?budgetSuggestions.map((s,i)=>{
                  const toV=VENDORS[s.to.vendor]||VENDORS.generic;
                  return (
                    <div key={i} style={{display:"grid",gridTemplateColumns:"1fr auto",alignItems:"center",gap:12,padding:"10px 14px",background:"var(--paper2)",border:"1px solid var(--rule)"}}>
                      <div>
                        <div style={{fontSize:9,color:"var(--ink4)",letterSpacing:".12em",textTransform:"uppercase",marginBottom:3,fontFamily:"var(--mono)"}}>{CAT_LABELS[s.catKey]}</div>
                        <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                          <span style={{fontFamily:"var(--serif)",fontSize:12,color:"var(--ink3)",textDecoration:"line-through"}}>{s.from.name}</span>
                          <svg width="12" height="10" viewBox="0 0 12 10" fill="none"><path d="M1 5h10M7 1l4 4-4 4" stroke="#B8732A" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          <span style={{fontFamily:"var(--serif)",fontSize:12,color:"var(--ink)"}}>{s.to.name}</span>
                        </div>
                      </div>
                      <div style={{textAlign:"right",flexShrink:0}}>
                        <div style={{fontSize:9,color:"#2A5040",fontFamily:"var(--mono)",letterSpacing:".08em",marginBottom:2}}>save {formatPrice(s.saving,loc)}</div>
                        <button onClick={()=>selectComp(s.catKey,s.to)} style={{padding:"6px 12px",background:"var(--ink)",border:"none",cursor:"pointer",fontSize:9,letterSpacing:".12em",textTransform:"uppercase",color:"var(--paper)",fontFamily:"var(--mono)"}}>Apply</button>
                      </div>
                    </div>
                  );
                }):<div style={{fontSize:11,color:"var(--ink3)",fontFamily:"var(--serif)",fontStyle:"italic",padding:"8px 0"}}>No cheaper alternatives available in this tier.</div>}
              </div>
            </div>
          )}

          <div style={{marginBottom:28}}><SystemDiagram basket={basket} autoItems={analysis.autoItems}/></div>

          <div style={{marginBottom:28}}>
            <SectionLabel>Selected Components</SectionLabel>
            <div style={{display:"grid",gap:0,border:"1px solid var(--rule)"}}>
              {allCats.map((catKey,ci)=>{
                const sel=selectedByCat(catKey);
                const effectiveSel=sel||(catKey==="cartridge"&&bundledCart?{name:bundledCart.name,sub:"Bundled · included in turntable price",cat:"cartridge",vendor:selectedTurntable?.vendor||"generic",price:0,_bundled:true}:null);
                const v=effectiveSel?(VENDORS[effectiveSel.vendor]||VENDORS.generic):null;
                const isOpen=swapOpen===catKey;
                const opts=tierData.components[catKey]||[];
                return (
                  <div key={catKey} style={{borderTop:ci>0?"1px solid var(--rule)":"none"}}>
                    <div style={{display:"grid",gridTemplateColumns:"auto 1fr auto",alignItems:"center",gap:isMobile?8:12,padding:isMobile?"10px 12px":"13px 16px",background:isOpen?"var(--paper2)":"transparent"}}>
                      <div style={{display:"flex",alignItems:"center",gap:isMobile?6:8}}>
                        <CatIcon cat={catKey} size={12} col={effectiveSel?(effectiveSel._bundled?"#2A5040":"var(--amber)"):"var(--ink4)"}/>
                        <span style={{fontSize:8,color:"var(--ink4)",letterSpacing:".16em",textTransform:"uppercase",fontFamily:"var(--mono)",width:72,flexShrink:0}}>{CAT_LABELS[catKey]}</span>
                      </div>
                      {effectiveSel?(
                        <div style={{display:"flex",alignItems:"center",gap:10,minWidth:0}}>
                          <div style={{width:3,height:28,background:effectiveSel._bundled?"#2A5040":v.col,flexShrink:0,borderRadius:1}}/>
                          <div style={{minWidth:0}}>
                            <div style={{fontFamily:"var(--serif)",fontSize:13,color:"var(--ink)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{effectiveSel.name}</div>
                            <div style={{fontSize:9,color:effectiveSel._bundled?"#2A5040":"var(--ink4)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{effectiveSel._bundled?"Bundled with turntable · £0 extra":`${v.name} · ${formatPrice(effectiveSel.price,loc)}`}</div>
                          </div>
                        </div>
                      ):<div style={{fontSize:11,color:"var(--ink4)",fontStyle:"italic",fontFamily:"var(--serif)"}}>Not selected</div>}
                      <button onClick={()=>setSwapOpen(isOpen?null:catKey)} style={{padding:"6px 12px",border:"1px solid var(--rule)",cursor:"pointer",fontSize:9,letterSpacing:".12em",textTransform:"uppercase",fontFamily:"var(--mono)",background:isOpen?"var(--ink)":"transparent",color:isOpen?"var(--paper)":"var(--ink3)",transition:"all .15s",whiteSpace:"nowrap"}}>{isOpen?"Close ✕":"Swap"}</button>
                    </div>
                    {isOpen&&(
                      <div className="fu" style={{borderTop:"1px solid var(--rule)",background:"var(--paper2)",padding:"12px 16px",maxHeight:320,overflowY:"auto"}}>
                        <div style={{display:"grid",gap:6}}>
                          {opts.map(item=>{
                            const iv=VENDORS[item.vendor]||VENDORS.generic, isSel=basket.some(b=>b.id===item.id);
                            return (
                              <button key={item.id} onClick={()=>{selectComp(catKey,item);setSwapOpen(null);}} style={{display:"grid",gridTemplateColumns:"auto 1fr auto",alignItems:"center",gap:10,padding:"10px 12px",textAlign:"left",cursor:"pointer",background:isSel?"var(--ink)":"transparent",border:`1px solid ${isSel?"var(--ink)":"var(--rule)"}`,transition:"all .15s"}}>
                                <div style={{width:3,height:32,background:iv.col,borderRadius:1,flexShrink:0}}/>
                                <div>
                                  <div style={{fontFamily:"var(--serif)",fontSize:12,color:isSel?"var(--paper)":"var(--ink)",lineHeight:1.3}}>{item.name}</div>
                                  <div style={{fontSize:9,color:isSel?"rgba(245,240,232,.6)":"var(--ink4)",marginTop:2}}>{item.sub}</div>
                                </div>
                                <div style={{textAlign:"right",flexShrink:0}}>
                                  <div style={{fontFamily:"var(--serif)",fontSize:13,color:isSel?"var(--paper)":"var(--ink2)"}}>{formatPrice(item.price,loc)}</div>
                                  {isSel&&<div style={{fontSize:8,color:"rgba(245,240,232,.7)",letterSpacing:".08em",fontFamily:"var(--mono)"}}>SELECTED</div>}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{marginBottom:28,border:"2px solid var(--ink)",background:"var(--paper2)"}}>
            <div style={{padding:"24px 24px 16px",textAlign:"center",borderBottom:"1px solid var(--rule)"}}>
              <div style={{fontSize:9,color:"var(--ink3)",letterSpacing:".22em",textTransform:"uppercase",marginBottom:6,fontFamily:"var(--mono)"}}>Negotiated Target</div>
              <div style={{fontFamily:"var(--serif)",fontSize:"clamp(36px,6vw,52px)",fontWeight:400,color:"var(--ink)",lineHeight:1,letterSpacing:"-.02em"}}>{formatPrice(dealEst,loc)}</div>
              <div style={{fontSize:11,color:"var(--ink3)",marginTop:6,fontFamily:"var(--serif)",fontStyle:"italic"}}>realistic deal estimate at a good dealer</div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:0}}>
              {[{label:"Full MSRP",val:formatPrice(msrpTotal,loc),col:"var(--ink3)",strike:true},{label:"Potential Saving",val:formatPrice(saving,loc),sub:`${Math.round((saving/msrpTotal)*100)}% off MSRP`,col:"#2A5040"}].map((m,i)=>(
                <div key={m.label} style={{padding:"14px 16px",textAlign:"center",borderLeft:i>0?"1px solid var(--rule)":"none"}}>
                  <div style={{fontSize:8,color:"var(--ink4)",letterSpacing:".14em",textTransform:"uppercase",marginBottom:4,fontFamily:"var(--mono)"}}>{m.label}</div>
                  <div style={{fontFamily:"var(--serif)",fontSize:20,fontWeight:300,color:m.col,textDecoration:m.strike?"line-through":"none"}}>{m.val}</div>
                </div>
              ))}
            </div>
          </div>

          <NegotiationSlider msrp={msrpTotal} deal={dealEst} accent={tierData.accent} loc={loc}/>

          {analysis.autoItems.filter(i=>i.price>0).length>0&&(
            <div style={{marginBottom:20}}>
              <SectionLabel>Mandatory Additions — Room & Building Requirements</SectionLabel>
              <div style={{display:"grid",gap:4}}>
                {analysis.autoItems.filter(i=>i.price>0).map(item=>(
                  <div key={item.id} style={{display:"grid",gridTemplateColumns:"auto 1fr auto auto",alignItems:"center",gap:12,padding:"11px 16px",background:"rgba(42,143,197,0.04)",border:"1px solid rgba(42,143,197,0.14)"}}>
                    <div style={{width:5,height:5,borderRadius:"50%",background:"var(--blue)",flexShrink:0}}/>
                    <span style={{fontSize:12,color:"var(--ink2)",fontFamily:"var(--serif)"}}>{item.name}</span>
                    <span style={{fontSize:9,color:"var(--blue)",background:"rgba(42,143,197,0.1)",border:"1px solid rgba(42,143,197,0.25)",padding:"2px 7px",letterSpacing:".06em",whiteSpace:"nowrap"}}>{item.reason}</span>
                    <span style={{fontFamily:"var(--serif)",fontSize:15,color:"var(--blue)",minWidth:72,textAlign:"right"}}>{formatPrice(item.price,loc)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{marginBottom:28,padding:isMobile?"12px 14px":"16px 20px",background:"var(--paper2)",border:"1px solid var(--rule)"}}>
            <SynergyRing score={synergy}/>
          </div>

          {analysis.warnings.filter(w=>w.level==="critical").length>0&&(
            <div style={{marginBottom:20}}><SectionLabel>Critical Constraints</SectionLabel><div style={{display:"grid",gap:7}}>{analysis.warnings.filter(w=>w.level==="critical").map((w,i)=><WarningBadge key={i} w={w} SEV={SEV}/>)}</div></div>
          )}

          {[
            {id:"placement",label:"Placement Diagram",content:(
              <div>
                <div style={{display:"flex",justifyContent:"center",background:"var(--paper)",border:"1px solid var(--rule)",padding:16,marginBottom:12}}><RoomDiagram length={room.length} width={room.width} separation={analysis.separation} backWall={analysis.backWall} listenPos={analysis.listenPos||3.2} sideWallGap={sideWallGap} accent={tierData.accent}/></div>
                <div style={{display:"flex",justifyContent:"center",gap:24,flexWrap:"wrap"}}>
                  {[{l:"Speaker separation",v:`${analysis.separation}m`},{l:"Back wall",v:`${analysis.backWall}m`},{l:"Listening position",v:`${analysis.listenPos||3.2}m`}].map(m=><div key={m.l} style={{textAlign:"center"}}><div style={{fontSize:9,color:"var(--ink4)",letterSpacing:".1em",textTransform:"uppercase",marginBottom:3}}>{m.l}</div><div style={{fontFamily:"var(--serif)",fontSize:16,color:tierData.accent}}>{m.v}</div></div>)}
                </div>
              </div>
            )},
            {id:"negotiation",label:"Dealer Negotiation Guide",content:(
              <div style={{display:"grid",gap:6}}>
                {loc.negotiationTips.map((g,i)=>(
                  <div key={i} style={{display:"grid",gridTemplateColumns:"1fr auto",alignItems:"center",gap:8,padding:"11px 14px",background:"var(--paper)",border:"1px solid var(--rule)"}}>
                    <div style={{display:"flex",alignItems:"center",gap:10}}><div style={{width:3,height:3,background:tierData.accent,flexShrink:0,transform:"rotate(45deg)"}}/><span style={{fontSize:11,color:"var(--ink2)"}}>{g.tip}</span></div>
                    <span style={{fontSize:10,color:tierData.accent,whiteSpace:"nowrap",letterSpacing:".04em"}}>{g.saving}</span>
                  </div>
                ))}
              </div>
            )},
            {id:"wiring",label:"Mains Conditioner — Power Bank Assignment",content:<WiringMap basket={basket}/>},
          ].map(section=>(
            <CollapsibleSection key={section.id} label={section.label}>{section.content}</CollapsibleSection>
          ))}

          <div style={{marginTop:24,padding:"16px 20px",background:"rgba(42,143,197,.06)",border:"1px solid rgba(42,143,197,.18)",borderRadius:4,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
            <div>
              <div style={{fontSize:9,color:"var(--blue)",letterSpacing:".18em",textTransform:"uppercase",marginBottom:3}}>Help improve this tool</div>
              <div style={{fontSize:10,color:"var(--ink3)",lineHeight:1.5}}>Two minutes · tells us what to build next</div>
            </div>
            <a href={TALLY_URL} target="_blank" rel="noopener noreferrer" style={{display:"inline-flex",alignItems:"center",gap:8,padding:"10px 20px",background:"rgba(42,143,197,.12)",border:"1px solid rgba(42,143,197,.4)",color:"var(--blue)",fontSize:10,letterSpacing:".12em",textTransform:"uppercase",textDecoration:"none",fontFamily:"var(--mono)",whiteSpace:"nowrap"}}>Give Feedback</a>
          </div>
          <NavRow onBack={()=>goTo("catalog")} nextLabel="← Restart" onNext={()=>{setCompleted(new Set());goTo("materials");setShowLanding(true);}}/>
        </div>
      );
    })(),
  };

  if (showLanding) return <LandingScreen onEnter={()=>setShowLanding(false)} localeId={localeId} onLocaleChange={setLocaleId}/>;

  return (
    <div style={{fontFamily:"var(--mono)",background:"var(--paper)",minHeight:"100vh",color:"var(--ink)"}}>
      {/* ── FIX 4: NO <style> tag here — CSS is injected once by useGlobalStyles() ── */}
      <div style={{height:3,background:"var(--ink)",width:"100%"}}/>
      <div style={{maxWidth:900,margin:"0 auto",padding:isMobile?"0 12px 80px":"0 24px 80px"}}>
        <div className="fu" style={{padding:"28px 0 24px",borderBottom:"1px solid var(--rule)",marginBottom:32}}>
          <div style={{display:"flex",flexDirection:isMobile?"column":"row",justifyContent:"space-between",alignItems:isMobile?"flex-start":"flex-start",flexWrap:"wrap",gap:isMobile?8:16}}>
            <div>
              <div style={{fontSize:9,letterSpacing:".28em",textTransform:"uppercase",color:"var(--ink3)",fontFamily:"var(--mono)",marginBottom:8}}>Hi-Fi System Builder &nbsp;·&nbsp; {loc.flag} {loc.label}</div>
              <h1 style={{fontFamily:"var(--serif)",fontSize:"clamp(26px,4vw,38px)",fontWeight:400,color:"var(--ink)",lineHeight:1,letterSpacing:"-.03em"}}>Reference System<br/><em style={{fontWeight:300,fontStyle:"italic",color:"var(--amber)"}}>Configurator</em></h1>
            </div>
            <div style={{display:"flex",gap:0,border:"1px solid var(--rule)",flexWrap:"wrap"}}>
              {Object.values(LOCALES).map((l,i)=>(
                <button key={l.id} onClick={()=>setLocaleId(l.id)} title={l.label} style={{display:"flex",alignItems:"center",justifyContent:"center",width:36,height:36,cursor:"pointer",background:localeId===l.id?"var(--amber)":"transparent",border:"none",borderLeft:i>0?"1px solid var(--rule)":"none",fontSize:16,transition:"background .15s"}}>
                  {l.flag}
                </button>
              ))}
            </div>
          </div>
        </div>
        <StepBar current={step} onGoto={goTo} completed={completed} isMobile={isMobile}/>
        <div key={animKey} className="fu">{panels[step]}</div>
      </div>
      <div style={{height:1,background:"var(--rule)",marginTop:60}}/>
    </div>
  );
}
