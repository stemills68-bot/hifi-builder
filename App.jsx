// ╔══════════════════════════════════════════════════════════════════╗
// ║  HiFi System Builder — VERSION 4                                ║
// ║  Date: 28 March 2026                                            ║
// ║                                                                  ║
// ║  Changes from v3:                                               ║
// ║  • Full visual restyle — warmer cream, deeper ink, simpler      ║
// ║  • Landing page rebuilt — big headline, one CTA, done           ║
// ║  • Buttons full-width, tall, black fill — more decisive         ║
// ║  • Room step rebuilt — named sizes instead of sliders           ║
// ║  • Claude vision photo analysis — auto-fills room details       ║
// ║  • Real-time consequences shown as you make choices             ║
// ║  • Side wall question simplified to Tight / Normal / Generous   ║
// ║  • All v3 logic preserved                                       ║
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

// ── FIX 1: CSS string without @import (fonts loaded separately via <link>) ──
const GLOBAL_CSS = `
:root {
  --paper:   #F7F2E8;
  --paper2:  #EEE8D8;
  --ink:     #111008;
  --ink2:    #2A2418;
  --ink3:    #5C5444;
  --ink4:    #A89E8C;
  --rule:    #DDD5C0;
  --amber:   #C4621A;
  --red:     #8B2020;
  --blue:    #1E4060;
  --green:   #2A5040;
  --serif:   'Source Serif 4', 'Libre Baskerville', Georgia, serif;
  --mono:    'JetBrains Mono', 'Courier New', monospace;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { background: var(--paper); color: var(--ink); -webkit-font-smoothing: antialiased; }
::selection { background: var(--ink); color: var(--paper); }

::-webkit-scrollbar { width: 3px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--rule); }

input[type=range] { -webkit-appearance: none; height: 1px; outline: none; cursor: pointer; }
input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 22px; height: 22px; border-radius: 50%; border: none; cursor: pointer; background: var(--ink); box-shadow: 0 2px 6px rgba(0,0,0,.2); }
input[type=range]::-moz-range-thumb { width: 22px; height: 22px; border-radius: 50%; border: none; background: var(--ink); cursor: pointer; }
textarea, input[type=text], input[type=number] {
  font-family: var(--serif); font-size: 15px; line-height: 1.6;
  background: transparent; color: var(--ink);
  border: none; border-bottom: 2px solid var(--ink);
  outline: none; padding: 10px 0; width: 100%;
}
textarea { resize: vertical; border: 1px solid var(--rule); padding: 12px 14px; background: var(--paper); }
textarea:focus, input[type=text]:focus, input[type=number]:focus { border-color: var(--amber); }

@keyframes fadeUp    { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
@keyframes fadeIn    { from { opacity:0; } to { opacity:1; } }
@keyframes vinylTurn { to { transform: rotate(360deg); } }
@keyframes slideUp   { from{opacity:0;transform:translateY(32px)} to{opacity:1;transform:translateY(0)} }
@keyframes press     { 0%{transform:scale(1)} 50%{transform:scale(.95)} 100%{transform:scale(1)} }
@keyframes slideRight{ from{width:0} to{width:100%} }

.fu  { animation: fadeUp .4s cubic-bezier(.16,1,.3,1) both; }
.fi  { animation: fadeIn .3s ease both; }
.vinyl-turn { animation: vinylTurn 6s linear infinite; }
.sl  { animation: slideUp .7s cubic-bezier(.16,1,.3,1) both; }
.sl1{animation-delay:.04s}.sl2{animation-delay:.1s}.sl3{animation-delay:.18s}
.sl4{animation-delay:.28s}.sl5{animation-delay:.4s}.sl6{animation-delay:.54s}

button:active:not([disabled]) { animation: press .12s ease; }

body::before {
  content:''; position:fixed; inset:0; pointer-events:none; z-index:1000; opacity:.018;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
  background-repeat: repeat; background-size: 200px 200px;
}

@media (max-width: 600px) { ::-webkit-scrollbar { display: none; } }
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


// Naim amplifiers use DIN interconnects — pairing with RCA phono stages requires an adaptor
const NAIM_DIN_AMPS = new Set([
  "m_nait_xs3","m_sn3","h_nac552","h_nap500","h_statement"
]);

// Speakers requiring minimum amplifier power (watts)
const SPEAKER_MIN_WATTS = {
  "m_scm40": 100,
  "h_scm50": 100,
};

// Amplifier power output (watts) — Class A amps derated by 2x vs AB
const AMP_POWER_WATTS = {
  "e_io":30,"e_brio":50,"e_elex4":72,"e_6000a":50,"e_8300a":75,"e_cxa81":80,"e_xa8200r":75,
  "m_elicit":105,"m_aethos":125,"m_nait_xs3":70,"m_sn3":80,
  "m_2010s2":30,"m_3010s2":35,  // Class A — real-world equivalent lower
  "m_3050se":75,"m_m2si":75,"m_lyra":100,"m_8300mb":200,
  "h_aethos_h":125,"h_3050ref":110,"h_ja5010":35,
};

const BUNDLED_CARTRIDGES = {
  "e_planar1":    { name:"Carbon MM",        type:"MM", note:"Carbon MM cartridge is factory-fitted. You can replace it with any of the cartridges below for an upgrade, but it is not required." },
  "e_planar2":    { name:"Carbon MM",        type:"MM", note:"Carbon MM cartridge is factory-fitted. Upgrading to the Nd3 is the most effective first upgrade on this turntable." },
  "e_planar3rs":  { name:"Nd5",              type:"MM", note:"Nd5 moving magnet cartridge is factory-fitted and included in the price. No additional cartridge is needed." },
  "e_radius5":    { name:"Ortofon 2M Red",   type:"MM", note:"Ortofon 2M Red is factory-fitted. A complete plug-and-play package — no separate cartridge purchase needed." },
  "e_tt3":        { name:"Ortofon 2M Red",   type:"MM", note:"Ortofon 2M Red is factory-fitted. No separate cartridge needed to start playing." },
  "m_planar8nd9": { name:"Nd9",         type:"MM", note:"Rega Nd9 MM cartridge is factory-fitted and included in the £2,554 price. No additional cartridge needed. A MM phono stage or built-in phono stage is all that is required — no MC stage needed." },
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

// Phono stages that are NOT compatible with Linn Kandid/Krystal (require Urika II or Uphorik)
const LINN_PHONO_ONLY = new Set(["h_kandid","h_krystal"]);
const LINN_PHONO_STAGES = new Set(["h_urika2","h_uphorik","m_uphorik"]);

// Phono stages that use RCA only (incompatible with Naim DIN without adaptor)
const RCA_PHONO_STAGES = new Set([
  "e_fono_mm","e_fono_mc","e_groovetracer","m_fono_mc","m_fono_super_mc",
  "m_aura","h_aura","h_trilogy906","h_lehmann","h_clearaudio_trio"
]);

const VENDORS = {
  rega:        { id:"rega",        name:"Rega",           country:"UK", city:"Southend-on-Sea", col:"var(--amber)", desc:"Founded 1973. Vertically integrated manufacturer; makes own tonearms, cartridges, motors, platters. Renowned for musical pace and timing.", synergy:{rega:100,spendor:92,harbeth:88,proac:85,atc:80,graham_ls:82,naim:80,linn:75,audiolab:85,cambridge:80,musical_fidelity:78,exposure:88,sugden:85,cyrus:80,chord_elec:78,leema:82,roksan:90,clearaudio:80,ortofon:88,chord_co:85,isoacoustics:78,townshend:82,generic:30} },
  linn:        { id:"linn",        name:"Linn",           country:"UK", city:"Glasgow",         col:"#8A9FC5", desc:"Founded 1972 with the iconic LP12 turntable. Scottish audiophile institution. Vertically integrated from source to speaker.", synergy:{rega:75,spendor:80,harbeth:78,proac:82,atc:85,graham_ls:80,naim:90,linn:100,audiolab:70,cambridge:65,musical_fidelity:72,exposure:75,sugden:80,cyrus:72,chord_elec:75,leema:78,roksan:80,clearaudio:75,ortofon:85,chord_co:80,isoacoustics:85,townshend:78,generic:30} },
  roksan:      { id:"roksan",      name:"Roksan",         country:"UK", city:"London",          col:"var(--amber)", desc:"Founded 1985. Creator of the Xerxes turntable. Strong musical pedigree with a focus on dynamics and clarity.", synergy:{rega:90,spendor:85,harbeth:82,proac:88,atc:82,graham_ls:80,naim:78,linn:80,audiolab:88,cambridge:82,musical_fidelity:85,exposure:88,sugden:82,cyrus:85,chord_elec:80,leema:85,roksan:100,clearaudio:78,ortofon:85,chord_co:82,isoacoustics:80,townshend:78,generic:30} },
  clearaudio:  { id:"clearaudio",  name:"Clearaudio",     country:"DE", city:"Erlangen",        col:"#A0A0A0", desc:"German precision turntable manufacturer with UK distribution. Magnetic bearing technology. Extremely low noise floors.", synergy:{rega:80,spendor:82,harbeth:80,proac:82,atc:78,graham_ls:85,naim:72,linn:75,audiolab:80,cambridge:75,musical_fidelity:80,exposure:82,sugden:80,cyrus:78,chord_elec:82,leema:80,roksan:78,clearaudio:100,ortofon:90,chord_co:85,isoacoustics:85,townshend:82,generic:30} },
  ortofon:     { id:"ortofon",     name:"Ortofon",        country:"DK", city:"Nakskov",         col:"#6A8CAD", desc:"Danish cartridge specialist founded 1918. The world's most widely used cartridges across all price points.", synergy:{rega:88,spendor:82,harbeth:80,proac:82,atc:78,graham_ls:85,naim:75,linn:85,audiolab:80,cambridge:78,musical_fidelity:80,exposure:82,sugden:80,cyrus:78,chord_elec:80,leema:80,roksan:85,clearaudio:90,ortofon:100,chord_co:82,isoacoustics:78,townshend:82,generic:30} },
  naim:        { id:"naim",        name:"Naim",           country:"UK", city:"Salisbury",       col:"#7CA87C", desc:"Founded 1973. Defined the British amplifier sound — fast, rhythmically accurate, musically engaging. Star-earth topology.", synergy:{rega:80,spendor:88,harbeth:90,proac:88,atc:92,graham_ls:85,naim:100,linn:90,audiolab:65,cambridge:60,musical_fidelity:70,exposure:75,sugden:80,cyrus:70,chord_elec:72,leema:75,roksan:78,clearaudio:72,ortofon:75,chord_co:65,isoacoustics:85,townshend:80,generic:30} },
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
        {id:"e_planar1", character:"warm", brandStory:"Rega have made turntables in Southend-on-Sea since 1973. Everything in the Planar 1 — the tonearm, the motor, the platter — is made in-house.",    name:"Planar 1 Plus",      sub:"Rega · Carbon MM · RB110 · built-in phono",  vendor:"rega",  price:498,  cat:"turntable", note:"Rega's plug-and-play entry point. Includes a built-in MM phono stage. RB110 tonearm, Carbon cartridge fitted."},
        {id:"e_planar2", character:"warm", brandStory:"A step up from the Planar 1. The RB220 tonearm is a meaningful improvement over the entry arm.",    name:"Planar 2",            sub:"Rega · Carbon MM standard · RB220 arm",     vendor:"rega",  price:499,  cat:"turntable", note:"RB220 tonearm, 10mm glass platter. Carbon cartridge fitted as standard. A meaningful step up from the Planar 1."},
        {id:"e_planar3", character:"balanced", brandStory:"The Planar 3 is where Rega's engineering really starts to show. Sold without a cartridge so you choose your own character.",    name:"Planar 3",            sub:"Rega · no cartridge standard · RB330",      vendor:"rega",  price:695,  cat:"turntable", note:"Sold without a cartridge as standard. RB330 tonearm, 12mm glass platter. The most recommended starting point in the Rega range."},
        {id:"e_planar3rs", character:"balanced", brandStory:"Reference Spec edition of the Planar 3. Neo PSU and Nd5 cartridge included. What Hi-Fi? Product of the Year 2025.",  name:"Planar 3 RS",         sub:"Rega · Reference Spec · Neo MK2 PSU · RB330 · Nd5", vendor:"rega", price:998, cat:"turntable", note:"Reference Spec edition. What Hi-Fi? Product of the Year 2025. The recommended choice at this price point."},
        {id:"e_radius5", character:"balanced", brandStory:"Roksan's acrylic-plinther entry turntable. DC motor, Ortofon 2M Red fitted. A different sonic character to Rega — slightly more forward.",    name:"Radius 5",            sub:"Roksan · Ortofon 2M Red",             vendor:"roksan",    price:649,  cat:"turntable", note:"Acrylic plinth, DC motor. Good starter from Roksan's respected lineage."},
        {id:"e_tt3", character:"balanced", brandStory:"Cambridge Audio's plug-and-play entry. Good value, unfussy setup. Less musical character than Rega but easier to live with.",        name:"TT-3",                sub:"Cambridge Audio · Ortofon 2M Red",    vendor:"cambridge", price:399,  cat:"turntable", note:"Plug-and-play simplicity. Built-in phono stage option available."},
      ],
      cartridge:[
        {id:"e_carbon", character:"balanced", brandStory:"Rega's own entry cartridge. Included with the Planar 1 Plus. Upgrade to the Nd3 when budget allows — it's a noticeable step up.",     name:"Carbon",             sub:"Rega · Moving Magnet · 5.5mV",         vendor:"rega",          price:35,  cat:"cartridge", note:"Included with Planar 1 Plus. Upgrading to the Nd3 is the single highest-value upgrade on any entry Rega turntable."},
        {id:"e_nd3", character:"warm", brandStory:"Rega's Neodymium MM cartridge. First use of Nd magnets in a moving magnet design. Warmer and more musical than most at the price.",        name:"Nd3",                sub:"Rega · Moving Magnet · Neodymium · 5mV", vendor:"rega",         price:175, cat:"cartridge", note:"Replaces the Elys 2. World-first use of Neodymium magnets in a moving magnet design."},
        {id:"e_vm95e", character:"detailed", brandStory:"Audio-Technica have been making cartridges in Tokyo since 1962. The VM95 series are among the best-measured at any price.",      name:"VM95E",              sub:"Audio-Technica · MM · Elliptical",     vendor:"audio_technica",price:75,  cat:"cartridge", note:"Elliptical stylus. Outstanding value. One of the best-measured cartridges at any price."},
        {id:"e_vm95ml", character:"detailed", brandStory:"MicroLinear stylus profile — superior groove tracing and sibilance control. Noticeably better treble detail than the VM95E.",     name:"VM95ML",             sub:"Audio-Technica · MM · MicroLinear",    vendor:"audio_technica",price:149, cat:"cartridge", note:"MicroLinear stylus — superior groove tracing. Noticeably better treble detail and sibilance control."},
        {id:"e_2m_red", character:"balanced", brandStory:"Ortofon have made cartridges in Denmark since 1918. The 2M Red is the world's best-selling cartridge — safe, musical, reliable.",     name:"2M Red",             sub:"Ortofon · Moving Magnet · 5.5mV",      vendor:"ortofon",       price:99,  cat:"cartridge", note:"The world's best-selling cartridge. Nude elliptical stylus. Safe, musical, reliable."},
        {id:"e_2m_blue", character:"balanced", brandStory:"Nude elliptical stylus, improved suspension over the Red. Stylus is upgradeable to 2M Bronze without changing the body.",    name:"2M Blue",            sub:"Ortofon · Moving Magnet · 5.5mV",      vendor:"ortofon",       price:199, cat:"cartridge", note:"Nude elliptical, improved suspension over the Red. Stylus-upgradeable to 2M Bronze."},
        {id:"e_1042", character:"warm", brandStory:"Goldring's flagship moving magnet. Made in London. Vivid and dynamic with a warmth that flatters vinyl's natural character.",       name:"1042",               sub:"Goldring · Moving Magnet · 6.5mV",     vendor:"goldring",      price:299, cat:"cartridge", note:"Goldring's flagship MM. Exceptional value. Vivid, dynamic, and surprisingly extended at the top."},
        {id:"e_mp110", character:"warm", brandStory:"Nagaoka have made cartridges in Tokyo since 1979. The MP-110's boron cantilever delivers a smooth, fatigue-free sound.",      name:"MP-110",             sub:"Nagaoka · Moving Magnet · 3.5mV",      vendor:"nagaoka",       price:125, cat:"cartridge", note:"Boron cantilever. Warm, smooth, fatigue-free."},
      ],
      amplifier:[
        {id:"e_io", character:"warm", brandStory:"Rega's smallest integrated. Built-in phono stage makes it genuinely plug-and-play with a Planar 1 or 2.", powerW:10,         name:"io",                 sub:"Rega · 30W · MM phono · compact",     vendor:"rega",         price:245,  cat:"amplifier", note:"Rega's compact entry integrated. Built-in MM phono stage. Designed to partner the Planar 1/2 and Kyte speakers."},
        {id:"e_brio", character:"warm", brandStory:"Rega's most popular integrated amplifier. Class A/B output stage with a distinctly musical character. Natural partner for the Planar 3.", powerW:30,       name:"Brio MK7",           sub:"Rega · 50W · MM phono · DAC",         vendor:"rega",         price:998,  cat:"amplifier", note:"Rega's most popular integrated. Built-in MM phono stage and DAC. The natural partner for the Planar 3."},
        {id:"e_elex4", character:"balanced", brandStory:"More power than the Brio with the same family sound. MM phono included. The step up if you want more dynamic headroom.", powerW:50,      name:"Elex MK4",           sub:"Rega · 72W · MM phono",               vendor:"rega",         price:1498, cat:"amplifier", note:"Includes MM phono stage. Significantly more power than the Brio."},
        {id:"e_6000a", character:"balanced", brandStory:"Audiolab are based in Cambridge. The 6000A measures exceptionally well for the price — neutral and transparent.", powerW:30,      name:"6000A",              sub:"Audiolab · 50W · MM phono",            vendor:"audiolab",     price:549,  cat:"amplifier", note:"Includes MM phono stage. Exceptional value. The benchmark entry-level integrated."},
        {id:"e_8300a", character:"balanced", brandStory:"Audiolab's step up. Improved power supply over the 6000A. Consistently strong reviews for its clean, uncoloured presentation.", powerW:50,      name:"8300A",              sub:"Audiolab · 75W · MM phono",            vendor:"audiolab",     price:799,  cat:"amplifier", note:"Includes MM phono stage. A step up from the 6000A with improved power supply."},
        {id:"e_cxa81", character:"detailed", brandStory:"Cambridge Audio's most complete entry integrated — phono, DAC, and Bluetooth in one box. More analytical than Rega amplification.", powerW:50,      name:"CXA81 MK2",          sub:"Cambridge · 80W · MM phono · DAC",    vendor:"cambridge",    price:1099, cat:"amplifier", note:"Includes MM phono stage, DAC, and Bluetooth. One of the most complete entry integrateds available."},
        {id:"e_xa8200r", character:"balanced", brandStory:"Roksan's entry integrated. No phono stage. More forward and dynamic than Audiolab — suits rock and electronic music well.", powerW:50,    name:"XA-8200R",           sub:"Roksan · 75W integrated",             vendor:"roksan",       price:899,  cat:"amplifier", note:"No built-in phono stage. Pairs naturally with Roksan Radius turntable."},
      ],
      speakers:[
        {id:"e_kyte", character:"warm", brandStory:"Rega's own standmount. Designed specifically to partner Rega electronics. A natural match for the io and Brio.",       name:"Kyte",               sub:"Rega · Compact standmount · phenolic",    vendor:"rega",          price:295,  cat:"speakers", note:"Rega's own compact standmount. Works across the full Rega range."},
        {id:"e_q_concept", character:"balanced", brandStory:"Q Acoustics produce neutral, well-engineered speakers at accessible prices. A sensible first speaker for a complete budget system.",  name:"Q Concept 20",       sub:"Q Acoustics · Standmount · 2-way",        vendor:"cambridge",     price:299,  cat:"speakers", note:"Neutral, balanced presentation. A sensible first speaker for a complete system under £800."},
        {id:"e_ma_bronze2", character:"detailed", brandStory:"Monitor Audio's ribbon/soft-dome hybrid tweeter gives exceptional high-frequency detail for the price. More revealing than average.", name:"Bronze 100",         sub:"Monitor Audio · Standmount · RSDL",       vendor:"monitor_audio", price:449,  cat:"speakers", note:"Ribbon/soft-dome hybrid tweeter. Excellent detail for the price."},
        {id:"e_dali_oberon1", character:"warm", brandStory:"Dali are a Danish speaker manufacturer founded in 1983. The Oberon 1 is warm and forgiving — flatters imperfect recordings.",name:"Oberon 1",          sub:"Dali · Compact standmount · wood fibre",  vendor:"dali",          price:399,  cat:"speakers", note:"Warm, musical, and fatigue-free. Good partner for Rega Brio."},
        {id:"e_kef_q150", character:"detailed", brandStory:"KEF's Uni-Q coincident driver gives an exceptionally wide, consistent sweet spot. One of the best-measured entry standmounts.",   name:"Q150",               sub:"KEF · Standmount · Uni-Q",                vendor:"kef",           price:499,  cat:"speakers", note:"KEF's entry Uni-Q standmount. One of the best-measured entry standmounts available."},
        {id:"e_b1", character:"warm", brandStory:"Spendor's compact standmount. BBC monitoring heritage — natural, honest midrange. A meaningful step up from budget speakers.",         name:"B1",                 sub:"Spendor · Compact standmount",            vendor:"spendor",       price:849,  cat:"speakers", note:"A meaningful step up — more natural midrange and better imaging."},
        {id:"e_a1", character:"warm", brandStory:"Spendor's A1 standmount. Linear-flow cabinet loading, natural midrange. Designed in the BBC tradition.",         name:"A1 MK2",             sub:"Spendor · Standmount 2-way",              vendor:"spendor",       price:895,  cat:"speakers"},
        {id:"e_bw_607s2", character:"detailed", brandStory:"B&W's entry standmount. Continuum cone driver and decoupled tweeter. More analytical character than Spendor or Harbeth.",   name:"607 S3",             sub:"B&W · Standmount · Continuum",            vendor:"bw",            price:699,  cat:"speakers", note:"Continuum cone mid/bass driver, decoupled tweeter. Natural partner for Cambridge CXA81."},
        {id:"e_tablette", character:"warm", brandStory:"ProAc's compact front-ported design. Works well close to walls. Warm and engaging — suits jazz and acoustic music particularly well.",   name:"Tablette 10",        sub:"ProAc · Standmount · front-ported",       vendor:"proac",         price:1195, cat:"speakers", note:"Front-ported design — works well close to rear and side walls."},
        {id:"e_gr_ls3", character:"warm", brandStory:"Graham Audio hold the BBC licence for the LS3/5A design. Identical specification to the original BBC monitor. Extraordinary midrange.",     name:"LS3/5A",             sub:"Graham Audio · BBC licensed standmount",  vendor:"graham_ls",     price:1995, cat:"speakers"},
        {id:"e_p3esr", character:"warm", brandStory:"Harbeth's most famous speaker. BBC monitoring heritage, RADIAL cone technology. World-renowned for natural, fatigue-free listening.",      name:"P3ESR XD",           sub:"Harbeth · BBC LS3/5A heritage",           vendor:"harbeth",       price:2798, cat:"speakers"},
        {id:"e_dali_oberon5", character:"warm", brandStory:"Dali's entry floorstander. Wood fibre cone, warm and forgiving. Good for smaller rooms where a standmount feels limiting.",name:"Oberon 5",          sub:"Dali · Compact floorstander · 2-way",     vendor:"dali",          price:699,  cat:"speakers", note:"Dali's entry floorstander. Warm and forgiving — good for smaller rooms."},
        {id:"e_ma_bronze6", character:"detailed", brandStory:"Monitor Audio's entry floorstander. Ribbon tweeter and three-driver array. Genuinely capable bass extension for the money.",  name:"Bronze 500",        sub:"Monitor Audio · Floorstander · RSDL",     vendor:"monitor_audio", price:899,  cat:"speakers", note:"Ribbon tweeter, three-driver array. Genuinely capable bass extension."},
        {id:"e_kef_q550", character:"detailed", brandStory:"KEF's entry floorstander. Wide sweet spot makes placement forgiving. More neutral than Dali or Spendor.",    name:"Q550",              sub:"KEF · Floorstander · Uni-Q",              vendor:"kef",           price:799,  cat:"speakers", note:"Wide sweet spot makes placement more forgiving than most floorstanders."},
        {id:"e_bw_603s3", character:"detailed", brandStory:"B&W's entry floorstander. Continuum cone, three-way design. Analytical character — rewards careful system matching.",    name:"603 S3",            sub:"B&W · Floorstander · Continuum",          vendor:"bw",            price:1099, cat:"speakers", note:"Three-way with Continuum cone. Needs at least 60W to perform well."},
        {id:"e_a2", character:"warm", brandStory:"Spendor's compact floorstander. BBC heritage, natural character. Works well in smaller rooms.",          name:"A2",                sub:"Spendor · Compact floorstander",          vendor:"spendor",       price:1195, cat:"speakers"},
      ],
      phono:[
        {id:"e_builtin", character:"balanced", brandStory:"Many entry integrated amplifiers include a competent MM phono stage — the Rega io, Brio, Audiolab 6000A and Cambridge CXA81 all do.",    name:"Use Amp's Built-in", sub:"MM only · no extra cost",             vendor:"generic",      price:0,    cat:"phono", note:"Many entry-level integrated amplifiers include a competent MM phono stage."},
        {id:"e_rega_mm", character:"warm", brandStory:"Rega's dedicated MM phono stage. Lower noise floor than any built-in stage. The natural first step up for a Rega MM system.",    name:"Rega MM",             sub:"Rega · Moving Magnet · dedicated",    vendor:"rega",         price:275,  cat:"phono", note:"Rega's current dedicated MM phono stage. The natural first dedicated phono stage for any Rega-based MM system."},
        {id:"e_fono_mini", character:"balanced", brandStory:"Rega's compact MM/MC stage with USB output for digitising records. Unusually flexible for the price.",  name:"Fono Mini A2D",      sub:"Rega · MM/MC · USB output",           vendor:"rega",         price:195,  cat:"phono", note:"MM and MC stages plus USB ripping output. Compact and excellent value."},
        {id:"e_fono_mm", character:"warm", brandStory:"Rega's purpose-built MM stage. Noticeably lower noise floor than a built-in amp stage.",    name:"Fono MM MK3",        sub:"Rega · MM dedicated",                 vendor:"rega",         price:245,  cat:"phono", note:"Purpose-built Moving Magnet stage. Noticeably lower noise floor than a built-in amp stage."},
        {id:"e_ph100", character:"balanced", brandStory:"Audiolab's dedicated MM stage. Clean and transparent — a good match for Audiolab amplification.",      name:"Solo MM",            sub:"Audiolab · Moving Magnet",            vendor:"audiolab",     price:149,  cat:"phono", note:"Dedicated MM stage. A meaningful step up from built-in."},
        {id:"e_azur651p", character:"balanced", brandStory:"Cambridge Audio's MM/MC phono stage. Flexible loading options — useful if you later upgrade to an MC cartridge.",   name:"Azur 651P",          sub:"Cambridge · MM/MC",                   vendor:"cambridge",    price:149,  cat:"phono", note:"MM and MC compatible. Good flexibility if you upgrade your cartridge."},
        {id:"e_tcx2", character:"balanced", brandStory:"Roksan's MM/MC phono stage. Good synergy with Roksan turntables.",       name:"TC-X2",              sub:"Roksan · MM/MC",                      vendor:"roksan",       price:199,  cat:"phono", note:"Good synergy with Roksan turntables."},
        {id:"e_1042e", character:"balanced", brandStory:"Goldring's MM/MC phono stage. Good value and musically voiced.",      name:"E3",                 sub:"Goldring · MM/MC phono",              vendor:"goldring",     price:249,  cat:"phono", note:"Good value MM/MC phono from Goldring."},
      ],
      cables:[
        {id:"e_clearway_r", name:"Clearway RCA",       sub:"Chord Co. · Interconnect 1m",         vendor:"chord_co",     price:55,   cat:"cables", note:"Recommended starting point. Connects your turntable (or phono stage) to your amplifier."},
        {id:"e_clearway_s", name:"Clearway X Speaker", sub:"Chord Co. · Speaker cable 3m pair",   vendor:"chord_co",     price:110,  cat:"cables"},
        {id:"e_carnival",   name:"Carnival Silver",    sub:"Chord Co. · Speaker 3m pair",         vendor:"chord_co",     price:85,   cat:"cables"},
      ],
      isolation:[
        {id:"e_orea_b",     name:"Orea Bordeaux ×3",   sub:"IsoAcoustics · Component footers",   vendor:"isoacoustics", price:109,  cat:"isolation", note:"Three footers sit under your turntable or phono stage. The single most effective isolation upgrade for a first system."},
        {id:"e_gaia3",      name:"GAIA III ×8",        sub:"IsoAcoustics · Speaker footers (stereo pair)",      vendor:"isoacoustics", price:430,  cat:"isolation", note:"4 footers per speaker × 2 speakers. This can be added later — your system will work correctly without them from day one. A worthwhile upgrade once the core system is in place."},
      ],
      // Power conditioning removed from entry tier — not essential when starting out
    },
  },

  mid: {
    tier:"mid", label:"Mid", range:"£5k – £15k", accent:"#B8732A",
    components: {
      turntable:[
        {id:"m_planar6", character:"balanced", brandStory:"Rega's Planar 6 is where the engineering steps up significantly — Tancast 8 foam plinth, RB330 tonearm, Neo PSU. A genuine step change.",    name:"Planar 6",            sub:"Rega · no cartridge standard · RB330 · Neo PSU",  vendor:"rega",  price:1295, cat:"turntable", note:"Sold without a cartridge as standard. Tancast 8 foam core plinth, RB330 tonearm, Neo MK2 PSU. What Hi-Fi? Award winner."},
        {id:"m_planar6rs", character:"balanced", brandStory:"Reference Spec Planar 6. RB880 tonearm normally found on the Planar 8. One of the most recommended mid-range turntables in the UK.",  name:"Planar 6 RS",         sub:"Rega · Reference Spec · HPL plinth · RB330",vendor:"rega",    price:1695, cat:"turntable", note:"Reference Spec Planar 6 — aluminium HPL laminate plinth. The recommended P6 to buy."},
        {id:"m_planar8nd9", character:"balanced", brandStory:"Planar 8 with Rega's flagship Nd9 MM cartridge factory-fitted. Saving of £111 vs buying separately. The complete reference MM package.", name:"Planar 8 + Nd9",    sub:"Rega · RB880 tonearm · Nd9 MM factory-fitted", vendor:"rega", price:2554, cat:"turntable", note:"Factory-fitted Nd9 package — saving £111 vs buying separately. The RB880 tonearm with Rega's finest MM cartridge. No separate cartridge purchase needed. The Nd9 does not require a dedicated MC phono stage."},
        {id:"m_planar8", character:"detailed", brandStory:"Rega's Planar 8 — hand-selected motor, ceramic/aluminium hybrid platter, RB880 tonearm. Measurably quieter than the Planar 6.",    name:"Planar 8",            sub:"Rega · no cartridge standard · RB880 · Neo PSU",  vendor:"rega",  price:2695, cat:"turntable", note:"RB880 tonearm, triple-layer glass platter. Performance approaches the P10 at a substantial saving."},
        {id:"m_lp12_majik", character:"warm", brandStory:"The Linn LP12 has been made in Glasgow since 1972. The Majik level is the entry to the LP12 world — suspended sub-chassis, Adikt MM cartridge.", name:"LP12 Majik",          sub:"Linn · Karousel bearing · Adikt MM",  vendor:"linn",         price:2895, cat:"turntable", note:"The iconic LP12 in its most accessible form. Karousel bearing is a major upgrade. Upgradeable indefinitely."},
        {id:"m_lp12_akurate", character:"warm", brandStory:"Akurate-level LP12 with Krystal MC cartridge and Ekos SE tonearm. The LP12 at its most musical — decades of refinement.",name:"LP12 Akurate",      sub:"Linn · Karousel · Ekos SE · Krystal", vendor:"linn",         price:7995, cat:"turntable", note:"Mid-hierarchy LP12 with Ekos SE tonearm and Krystal MC cartridge."},
        {id:"m_xerxes20", character:"balanced", brandStory:"Roksan's Xerxes 20+ is a rigid-chassis design. More forward and dynamic than the LP12 — suits rock and pop particularly well.",   name:"Xerxes 20+",          sub:"Roksan · Reference suspended",        vendor:"roksan",       price:3995, cat:"turntable", note:"Suspended subchassis design. Exceptional speed stability."},
        {id:"m_concept", character:"detailed", brandStory:"Clearaudio's Concept is German precision engineering — magnetic bearing, exceptional speed stability, extremely low noise floor.",    name:"Concept",             sub:"Clearaudio · Satisfy tonearm · Concept MC", vendor:"clearaudio", price:1895, cat:"turntable"},
      ],
      cartridge:[
        {id:"m_nd9", character:"balanced", brandStory:"Rega's flagship MM cartridge. Boron cantilever and Fine Line stylus from the Aphelion 2 MC. Extraordinary detail for a moving magnet.", name:"Nd9", sub:"Rega · MM · Boron cantilever · Fine Line · reference", vendor:"rega", price:695, cat:"cartridge", note:"Rega's flagship moving magnet. Boron cantilever and Fine Line stylus from the Aphelion 2 MC — extraordinary detail retrieval for an MM. Does not require a dedicated MC phono stage. The natural upgrade path on any Rega turntable."},

        {id:"m_nd5", character:"warm", brandStory:"Rega's Nd5 uses Neodymium magnet technology. Warm and musical — the natural upgrade path on any Rega MM system.",        name:"Nd5",                sub:"Rega · Moving Magnet · Neodymium · nude elliptical", vendor:"rega", price:295, cat:"cartridge", note:"Replaces the Exact 2. Nude perfect elliptical diamond stylus. Hi-Fi Choice Recommended."},
        {id:"m_nd7",        name:"Nd7",                sub:"Rega · Moving Magnet · Fine Line nude diamond", vendor:"rega",  price:450,  cat:"cartridge", note:"Top of the Nd range. Same Fine Line nude diamond stylus profile as the Apheta 3 MC. AVForums Editors Choice 2024/2025."},
        {id:"m_2m_bronze", character:"balanced", brandStory:"Ortofon's 2M Bronze with nude Fine Line stylus. A significant step up from the Blue — better resolution and tracking.",  name:"2M Bronze",          sub:"Ortofon · MM · Fine Line stylus",      vendor:"ortofon",      price:375,  cat:"cartridge", note:"Fine Line stylus, exceptional detail retrieval for an MM. The best mass-market MM currently available."},
        {id:"m_2m_black", character:"detailed", brandStory:"Ortofon's 2M Black with nude Shibata stylus. One of the best-measuring MM cartridges available. Very revealing.",   name:"2M Black",           sub:"Ortofon · MM · Shibata stylus",        vendor:"ortofon",      price:649,  cat:"cartridge", note:"Shibata stylus — the most revealing stylus profile made. Requires excellent tonearm alignment."},
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
        {id:"m_elicit", character:"balanced", brandStory:"Rega's Elicit MK5 — 105W, no phono stage. The natural partner for the Planar 6 and 8 when used with a separate phono stage.", powerW:75,     name:"Elicit MK5",         sub:"Rega · 105W integrated",              vendor:"rega",         price:2498, cat:"amplifier", note:"No built-in phono stage. Rega's most popular serious integrated."},
        {id:"m_aethos", character:"balanced", brandStory:"Rega's flagship integrated. Class A/B output stage, 125W. Exceptionally musical for the power output.", powerW:90,     name:"Aethos",             sub:"Rega · 125W integrated",              vendor:"rega",         price:3498, cat:"amplifier", note:"No built-in phono stage. Rega's flagship integrated. Class A/AB output stage."},
        {id:"m_nait_xs3", character:"warm", brandStory:"Naim have made amplifiers in Salisbury since 1973. The Nait XS3 has Naim's characteristic pace and rhythmic drive — music feels alive.", powerW:50,   name:"Nait XS3",           sub:"Naim · 70W integrated",               vendor:"naim",         price:2449, cat:"amplifier", note:"No built-in phono stage. Naim's characteristic pace and timing."},
        {id:"m_sn3", character:"warm", brandStory:"Naim's SuperNait 3 — 80W with built-in MM phono stage. The only mid-range Naim with phono. Naim's most complete integrated.", powerW:60,        name:"SuperNait 3",        sub:"Naim · 80W · MM phono",               vendor:"naim",         price:3999, cat:"amplifier", note:"Includes MM phono stage — the only mid-range Naim with built-in phono."},
        {id:"m_2010s2", character:"warm", brandStory:"Sugden have made Class A amplifiers in West Yorkshire since 1967. 30W of pure Class A — extraordinary midrange warmth and texture.", powerW:20,     name:"2010S2",             sub:"Sugden · 30W Pure Class A",           vendor:"sugden",       price:1895, cat:"amplifier", note:"No built-in phono. 30W pure Class A. Extraordinary midrange warmth for Classical, Jazz, and Folk."},
        {id:"m_3010s2", character:"warm", brandStory:"Sugden's 3010S2D adds a DAC to the Class A formula. 35W of pure Class A with digital inputs.", powerW:25,     name:"3010S2D",            sub:"Sugden · 35W Class A · DAC",          vendor:"sugden",       price:2450, cat:"amplifier", note:"No built-in phono. Adds a DAC to the 2010S2."},
        {id:"m_3050se", character:"balanced", brandStory:"Exposure are based in Brighton. 75W integrated with strong synergy with Rega sources and Spendor or ProAc speakers.", powerW:60,     name:"3050SE",             sub:"Exposure · 75W integrated",           vendor:"exposure",     price:2195, cat:"amplifier", note:"No built-in phono. Strong synergy with Rega sources and Spendor/ProAc speakers."},
        {id:"m_m2si", character:"detailed", brandStory:"Musical Fidelity's M2si. 75W, clean and transparent. More neutral than Rega or Naim — good for analytical listeners.", powerW:60,       name:"M2si",               sub:"Musical Fidelity · 75W integrated",   vendor:"musical_fidelity",price:1499, cat:"amplifier", note:"No built-in phono. High power, clean sound. Excellent value."},
        {id:"m_lyra", character:"balanced", brandStory:"Leema Acoustics are a Welsh manufacturer. 100W of precise, clean amplification with excellent measured performance.", powerW:80,       name:"Lyra Integrated",    sub:"Leema · 100W integrated",             vendor:"leema",        price:2495, cat:"amplifier", note:"No built-in phono. Welsh-made. Excellent measured performance."},
        {id:"m_8300mb", character:"detailed", brandStory:"Audiolab's monoblock pair. Each speaker gets its own dedicated amplifier. Exceptional separation and control.", powerW:120,     name:"8300MB",             sub:"Audiolab · Monoblock pair",           vendor:"audiolab",     price:1998, cat:"amplifier", note:"No built-in phono. Exceptional power for the money. Each speaker gets its own amplifier."},
      ],
      speakers:[
        {id:"m_c30", character:"warm", brandStory:"Harbeth's C30.2 compact standmount. RADIAL cone technology — natural, fatigue-free midrange. Exceptional for voice and acoustic instruments.",        name:"C30.2 XD",           sub:"Harbeth · Compact standmount · RADIAL",   vendor:"harbeth",       price:2798, cat:"speakers"},
        {id:"m_kef_r3", character:"detailed", brandStory:"KEF's R3 Meta standmount. Metamaterial Absorption Technology, 12th generation Uni-Q. Exceptionally measured and detailed.",     name:"R3 Meta",            sub:"KEF · Standmount · Metamaterial Uni-Q",   vendor:"kef",           price:2299, cat:"speakers", note:"Metamaterial Absorption Technology reduces rear tweeter distortion. Exceptionally wide sweet spot."},
        {id:"m_response2",  name:"Response D2R",       sub:"ProAc · Standmount · ribbon tweeter",     vendor:"proac",         price:3695, cat:"speakers", note:"Ribbon tweeter. Front-ported — works against rear walls. Extremely versatile placement."},
        {id:"m_pmc_twenty5_21",name:"Twenty5 21i",     sub:"PMC · Standmount · transmission line",   vendor:"pmc",           price:2499, cat:"speakers", note:"Transmission line bass loading. Studio-grade accuracy. Excellent for Jazz and Classical."},
        {id:"m_neat_sx3", character:"warm", brandStory:"Neat Acoustics from County Durham. Hand-built, unconventional isobaric bass loading. Musical and engaging.",   name:"Sx3i",               sub:"Neat · Standmount · isobaric",            vendor:"neat",          price:2495, cat:"speakers", note:"Remarkably full range for its size. Natural partner for Naim and Linn amplification."},
        {id:"m_gr_ls5_9",   name:"LS5/9",              sub:"Graham Audio · BBC licensed 2-way",       vendor:"graham_ls",     price:4995, cat:"speakers"},
        {id:"m_dali_rubicon2",name:"Rubicon 2",        sub:"Dali · Standmount · ribbon hybrid",       vendor:"dali",          price:1999, cat:"speakers", note:"Ribbon/soft dome hybrid tweeter. Natural, grain-free high frequencies."},
        {id:"m_p3esr", character:"warm", brandStory:"Harbeth's most famous speaker — also available at mid-tier budget. BBC monitoring heritage. World-renowned for natural listening.",      name:"P3ESR XD",           sub:"Harbeth · BBC LS3/5A heritage",           vendor:"harbeth",       price:2798, cat:"speakers"},
        {id:"m_bw_705s3",   name:"705 S3",             sub:"B&W · Standmount · Carbon Dome",          vendor:"bw",            price:2299, cat:"speakers", note:"Carbon fibre dome tweeter, Continuum cone. Class-leading treble resolution."},
        {id:"m_classic7",   name:"Classic 7",          sub:"Spendor · Floorstander 3-way",            vendor:"spendor",       price:3495, cat:"speakers"},
        {id:"m_kef_r7",     name:"R7 Meta",            sub:"KEF · Floorstander · Metamaterial Uni-Q", vendor:"kef",           price:4499, cat:"speakers", note:"Wide, room-filling sound with a remarkably even off-axis response."},
        {id:"m_ma_gold200", name:"Gold 200",           sub:"Monitor Audio · Floorstander · RSDL",     vendor:"monitor_audio", price:2499, cat:"speakers", note:"Ribbon/dome hybrid tweeter plus ceramic cone drivers."},
        {id:"m_dali_rubicon6",name:"Rubicon 6",        sub:"Dali · Floorstander · ribbon hybrid",     vendor:"dali",          price:2999, cat:"speakers", note:"Natural, warm, and fatigue-free. Good match for Sugden Class A amplification."},
        {id:"m_scm40", character:"detailed", brandStory:"ATC's SCM40 passive floorstander. Professional studio monitor technology in a domestic cabinet. Requires 100W+. Brutally honest.", minWatts:100,      name:"SCM40",              sub:"ATC · Floorstander passive",               vendor:"atc",           price:4498, cat:"speakers", note:"Requires 100W+ amplification. Extraordinary accuracy and dynamic range."},
        {id:"m_pmc_twenty5_23",name:"Twenty5 23i",     sub:"PMC · Floorstander · transmission line",  vendor:"pmc",           price:3999, cat:"speakers", note:"Unusually deep and well-controlled bass. Excellent for Rock and Electronic music."},
        {id:"m_focal_kanta1",name:"Kanta No.1",        sub:"Focal · Standmount · Beryllium",          vendor:"focal",         price:3999, cat:"speakers", note:"Flax cone, Beryllium tweeter. Natural partner for Naim amplification."},
        {id:"m_shl5", character:"warm", brandStory:"Harbeth's SHL5 Plus — the BBC's favourite monitor for music. Larger RADIAL driver, more bass extension than the C30.",       name:"SHL5 Plus",          sub:"Harbeth · Floorstander · RADIAL",         vendor:"harbeth",       price:5498, cat:"speakers"},
        {id:"m_d30rs",      name:"D30RS",              sub:"ProAc · Floorstander · ribbon",            vendor:"proac",         price:5995, cat:"speakers"},
        {id:"m_d72", character:"balanced", brandStory:"Spendor's D7.2 floorstander. Linear-flow bass loading — more extended and dynamic than Harbeth while keeping the natural midrange.",        name:"D7.2",               sub:"Spendor · Floorstander · linear flow",    vendor:"spendor",       price:5650, cat:"speakers"},
        {id:"m_kudos_x2",   name:"X2",                 sub:"Kudos · Standmount · isobaric",           vendor:"kudos",         price:3995, cat:"speakers", note:"Isobaric bass loading — exceptionally articulate and fast. Outstanding synergy with Naim."},
        {id:"m_bw_703s3",   name:"703 S3",             sub:"B&W · Floorstander · Carbon Dome",        vendor:"bw",            price:3499, cat:"speakers", note:"Three-way, Carbon dome tweeter. Strong partner for Naim or Musical Fidelity."},
      ],
      phono:[
        {id:"m_builtin",    name:"Use Amp's Built-in", sub:"MM only · SuperNait 3 / some integrateds", vendor:"generic", price:0, cat:"phono", note:"The Naim SuperNait 3 includes a capable MM stage."},
        {id:"m_rega_mm2", character:"warm", brandStory:"Rega's dedicated MM stage for mid-range systems. The natural partner for any Rega MM cartridge.",   name:"Rega MM",             sub:"Rega · Moving Magnet · dedicated",    vendor:"rega",         price:275,  cat:"phono"},
        {id:"m_fono_mm2", character:"warm", brandStory:"Rega's Fono MM MK3. Purpose-built Moving Magnet stage.",   name:"Fono MM MK3",        sub:"Rega · MM dedicated",                 vendor:"rega",         price:245,  cat:"phono"},
        {id:"m_mm100", character:"balanced", brandStory:"Musical Fidelity's MM100. Clean and transparent MM stage.",      name:"MM100",              sub:"Musical Fidelity · MM/MC",            vendor:"musical_fidelity",price:299, cat:"phono"},
        {id:"m_fono_mc", character:"warm", brandStory:"Rega's dedicated MC stage. Required once you move to a Moving Coil cartridge.",    name:"Fono MC MK3",        sub:"Rega · Dedicated MC",                 vendor:"rega",         price:498,  cat:"phono", note:"Purpose-built MC stage. Required once you move to a Moving Coil cartridge."},
        {id:"m_io_mk3", character:"balanced", brandStory:"Rega's io MK3 — ultra-quiet MM/MC stage. Exceptional noise performance.",     name:"io MK3",             sub:"Rega · MM/MC · ultra-quiet",          vendor:"rega",         price:698,  cat:"phono"},
        {id:"m_fono_super", character:"detailed", brandStory:"Rega's Fono Super MC — ultra-low noise for the most demanding MC cartridges.", name:"Fono Super MC",      sub:"Rega · Ultra-low noise MC",           vendor:"rega",         price:795,  cat:"phono"},
        {id:"m_aios", character:"detailed", brandStory:"Rega's Aios — reference MC phono stage. The top of Rega's phono range below the Aura.",       name:"Aios",               sub:"Rega · Reference MC phono stage",     vendor:"rega",         price:1500, cat:"phono"},
        {id:"m_graham_ref", character:"balanced", brandStory:"Graham Slee's Reflex M. British-made, well-regarded for musicality.", name:"Reflex M",           sub:"Graham Slee · MM/MC",                 vendor:"generic",      price:449,  cat:"phono"},
      ],
      cables:[
        {id:"m_shawline_r", name:"Shawline RCA",       sub:"Chord Co. · Interconnect 1m",         vendor:"chord_co",     price:108,  cat:"cables"},
        {id:"m_shawline_s", name:"Shawline X Speaker", sub:"Chord Co. · 5m pair",                 vendor:"chord_co",     price:420,  cat:"cables"},
        {id:"m_epic_r",     name:"Epic RCA",           sub:"Chord Co. · Interconnect 1m",         vendor:"chord_co",     price:195,  cat:"cables"},
        {id:"m_epic_s",     name:"Epic X Speaker",     sub:"Chord Co. · 5m pair",                 vendor:"chord_co",     price:695,  cat:"cables"},
        {id:"m_fractal_s",  name:"Fractal Speaker",    sub:"Townshend · 3m pair",                 vendor:"townshend",    price:895,  cat:"cables"},
      ],
      isolation:[
        {id:"m_gaia3",      name:"GAIA III ×8",        sub:"IsoAcoustics · Speaker footers (stereo pair)",       vendor:"isoacoustics", price:430,  cat:"isolation", note:"4 footers per speaker × 2 speakers. One set of 4 is not enough for a stereo system."},
        {id:"m_gaia2",      name:"GAIA II ×8",         sub:"IsoAcoustics · Speaker footers (stereo pair)",       vendor:"isoacoustics", price:660,  cat:"isolation", note:"4 footers per speaker × 2 speakers. One set of 4 is not enough for a stereo system."},
        {id:"m_orea_g",     name:"Orea Graphite ×3",   sub:"IsoAcoustics · Component footers",    vendor:"isoacoustics", price:149,  cat:"isolation"},
        {id:"m_seismic",    name:"Seismic Platform",   sub:"Townshend · Component isolation",     vendor:"townshend",    price:645,  cat:"isolation"},
      ],
      power:[
        {id:"m_powerhaus",  name:"PowerHAUS M6",       sub:"Chord Co. · Mains block 6-way",       vendor:"chord_co",     price:295,  cat:"power", note:"Relevant at upper mid-range and above. Skip if budget is tight — power conditioning is a refinement, not a requirement."},
      ],
    },
  },

  high: {
    tier:"high", label:"High", range:"£15k+", accent:"#C5782A",
    components: {
      turntable:[
        {id:"h_planar10", character:"detailed", brandStory:"Rega's Planar 10 — hand-selected motor, ceramic/aluminium platter, RB3000 tonearm. Apheta 3 MC included. Rega at its most resolving.",   name:"Planar 10",          sub:"Rega · Apheta 3 MC · RB3000",         vendor:"rega",         price:5398, cat:"turntable"},
        {id:"h_lp12_akurate", character:"warm", brandStory:"Akurate-level LP12 with Krystal MC. The LP12 has been continuously refined since 1972 — at this level the improvements are profound.",name:"LP12 Akurate",     sub:"Linn · Karousel · Ekos SE · Krystal", vendor:"linn",         price:7995, cat:"turntable"},
        {id:"h_lp12_selekt", character:"warm", brandStory:"Selekt-level LP12 with Kandid MC. The Kandid is Linn's reference cartridge — designed for the LP12's suspended sub-chassis.",name:"LP12 Selekt",        sub:"Linn · Karousel · Ekos SE · Kandid",  vendor:"linn",         price:12995,cat:"turntable"},
        {id:"h_lp12_klimax", character:"warm", brandStory:"Klimax LP12 — the definitive LP12. Radikal PSU, Ekos SE tonearm, Kandid MC. Linn's reference statement.",name:"LP12 Klimax",        sub:"Linn · Radikal PSU · Ekos SE · Kandid",vendor:"linn",        price:22995,cat:"turntable"},
        {id:"h_innovation", character:"detailed", brandStory:"Clearaudio's Innovation Compact. Magnetic bearing — no stylus contact, zero bearing noise. German precision engineering.", name:"Innovation Compact", sub:"Clearaudio · Universal · Charisma MC", vendor:"clearaudio",   price:8995, cat:"turntable"},
        {id:"h_master", character:"detailed", brandStory:"Clearaudio's Master Innovation with Goldfinger Statement MC. Reference-level German engineering. The most analytically precise deck in the catalogue.",     name:"Master Innovation",  sub:"Clearaudio · Unify tonearm · Goldfinger",vendor:"clearaudio", price:18995,cat:"turntable"},
      ],
      cartridge:[
        {id:"h_nd9", character:"balanced", brandStory:"Rega's flagship MM. Boron cantilever from the Aphelion 2 MC. Does not need a dedicated MC phono stage — exceptional value at this level.",        name:"Nd9",                sub:"Rega · MM · Boron cantilever · Fine Line · reference", vendor:"rega", price:695, cat:"cartridge", note:"Rega's flagship MM — Boron cantilever and Fine Line stylus technology from the Aphelion 2 MC. Does not need a dedicated MC phono stage. At £695 it is extraordinary value against MCs costing three times the price. Factory-fitted option on Planar 8 and Planar 6 RS."},
        {id:"h_apheta3", character:"balanced", brandStory:"Rega's Apheta 3 MC. 350μV output, Fine Line stylus. Musical and detailed in equal measure — Rega's most popular MC.",    name:"Apheta 3",           sub:"Rega · MC · 350μV · fine-line",        vendor:"rega",         price:799,  cat:"cartridge"},
        {id:"h_aphelion2", character:"detailed", brandStory:"Rega's reference MC. Boron cantilever, 350μV output. Co-developed with the Aura phono stage for optimal noise performance.",  name:"Aphelion 2",         sub:"Rega · MC · 350μV · boron",            vendor:"rega",         price:2999, cat:"cartridge"},
        {id:"h_cadenza_bk", character:"balanced", brandStory:"Ortofon's Cadenza Black with Shibata stylus. One of Ortofon's finest cartridges — a balanced character with exceptional tracking.", name:"Cadenza Black",      sub:"Ortofon · MC · 0.33mV · Shibata",      vendor:"ortofon",      price:1299, cat:"cartridge"},
        {id:"h_windfeld", character:"detailed", brandStory:"Ortofon's A95. Replicant 100 stylus, 0.2mV output. Among the most analytically accurate cartridges available.",   name:"A95",                sub:"Ortofon · MC · 0.2mV · Replicant",     vendor:"ortofon",      price:2699, cat:"cartridge"},
        {id:"h_ethos_ref", character:"warm", brandStory:"Goldring's Ethos — high-output MC at 500μV. Warm and musical. Works with any MM phono stage.",  name:"Ethos",              sub:"Goldring · MC · 500μV",                vendor:"goldring",     price:549,  cat:"cartridge"},
        {id:"h_art1000", character:"detailed", brandStory:"Audio-Technica's ART1000 — direct-coupled generator, 0.2mV. Exceptionally revealing. Requires careful tonearm matching (low compliance).",    name:"AT-ART1000",         sub:"Audio-Technica · MC · 0.2mV · direct-coupled",vendor:"audio_technica",price:3499,cat:"cartridge"},
        {id:"h_krystal", character:"warm", brandStory:"Linn's Krystal MC — designed for the LP12 ecosystem. Urika II or Uphorik are the natural phono stage partners.",    name:"Krystal",            sub:"Linn · MC · 0.35mV",                   vendor:"linn",         price:1650, cat:"cartridge"},
        {id:"h_kandid", character:"warm", brandStory:"Linn's reference Kandid MC. Designed specifically for the LP12 with Urika II internal phono stage. The definitive LP12 cartridge.",     name:"Kandid",             sub:"Linn · MC · 0.35mV · reference",       vendor:"linn",         price:3495, cat:"cartridge"},
      ],
      amplifier:[
        {id:"h_aethos_h", character:"balanced", brandStory:"Rega's flagship integrated. 125W, Class A/B. Musically balanced — neither warm nor cold.", powerW:90,   name:"Aethos",             sub:"Rega · 125W flagship integrated",     vendor:"rega",         price:3498, cat:"amplifier"},
        {id:"h_3050ref", character:"balanced", brandStory:"Exposure's reference integrated. 110W, built in Brighton. Strong synergy with Rega sources and British speakers.", powerW:90,    name:"3050S2 Reference",   sub:"Exposure · 110W reference integrated",vendor:"exposure",     price:3995, cat:"amplifier"},
        {id:"h_ja5010", character:"warm", brandStory:"Sugden's Masterclass IA-4. 35W pure Class A. Extraordinary midrange texture and warmth. Legendary with Harbeth and Spendor.", powerW:20,     name:"Masterclass IA-4",   sub:"Sugden · 35W Pure Class A",           vendor:"sugden",       price:5250, cat:"amplifier"},
        {id:"h_m8xi", character:"detailed", brandStory:"Musical Fidelity's M8xi. 550W into 8 ohms. Enormous power reserves — drives any speaker effortlessly. Clinical and transparent.",       name:"M8xi",               sub:"Musical Fidelity · 550W integrated",  vendor:"musical_fidelity",price:5999,cat:"amplifier"},
        {id:"h_qutest", character:"detailed", brandStory:"Chord's Hugo TT2 DAC with Etude power amplifier. FPGA-based digital processing. For those who want the most technically advanced replay.",     name:"Hugo TT2 + Etude",   sub:"Chord Electronics · DAC + power amp", vendor:"chord_elec",   price:8498, cat:"amplifier"},
        {id:"h_252_250", character:"warm", brandStory:"Naim's NAC 252 + NAP 250DR pre-power combination. Naim's characteristic pace and rhythmic drive at reference level.",    name:"NAC 252 + NAP 250DR",sub:"Naim · Pre-power combination",        vendor:"naim",         price:11998,cat:"amplifier"},
        {id:"h_552_500", character:"warm", brandStory:"Naim's reference pre-power. NAC 552DR + NAP 500DR. The definitive Naim system — 30 years of continuous refinement.",    name:"NAC 552 + NAP 500DR",sub:"Naim · Reference pre-power combination",vendor:"naim",       price:28995,cat:"amplifier", note:"Priced as a pair: NAC 552DR (approx £14,995) + NAP 500DR (approx £12,995). Both units benefit from Naim factory DR servicing — confirm DR status when purchasing. A Naim specialist dealer is essential at this level."},
        {id:"h_selekt_dsm", character:"balanced", brandStory:"Linn's Selekt DSM streaming pre-amp. Katalyst DAC, network streaming, analogue inputs. The modern Linn system hub.", name:"Selekt DSM",          sub:"Linn · Streaming pre-amp · Katalyst DAC",vendor:"linn",     price:5995, cat:"amplifier"},
        {id:"h_akurate_dsm", character:"balanced", brandStory:"Linn's Akurate DSM — reference streaming pre-amp. The complete source for a Linn-based system.",name:"Akurate DSM",         sub:"Linn · Reference streaming pre-amp", vendor:"linn",         price:8995, cat:"amplifier"},
      ],
      speakers:[
        {id:"h_40_3", character:"warm", brandStory:"Harbeth's 40.3 XD — their flagship standmount. RADIAL cone technology, 12-inch bass driver. The benchmark for natural midrange reproduction.",       name:"40.3 XD",            sub:"Harbeth · Flagship standmount · RADIAL",   vendor:"harbeth",       price:6998, cat:"speakers"},
        {id:"h_kef_ref1", character:"detailed", brandStory:"KEF's Reference 1 Meta. Metamaterial Absorption Technology and 12th gen Uni-Q. Among the most accurately engineered standmounts available.",   name:"Reference 1 Meta",   sub:"KEF · Standmount · Metamaterial Uni-Q",    vendor:"kef",           price:7999, cat:"speakers"},
        {id:"h_bw_805d4", character:"detailed", brandStory:"B&W's 805 D4. Diamond tweeter — lower distortion than any metal or fabric dome. More analytical than Harbeth or Spendor.",   name:"805 D4",             sub:"B&W · Standmount · Diamond tweeter",       vendor:"bw",            price:5499, cat:"speakers"},
        {id:"h_focal_sopra1", character:"detailed", brandStory:"Focal's Sopra No.1. Beryllium tweeter and 'W' sandwich cone. French precision engineering — fast and revealing.",name:"Sopra No.1",        sub:"Focal · Standmount · Beryllium",           vendor:"focal",         price:8499, cat:"speakers"},
        {id:"h_pmc_fact3", character:"detailed", brandStory:"PMC's Fact.3 standmount. Transmission line bass loading — deep, fast, controlled bass from a compact cabinet.",  name:"Fact.3",             sub:"PMC · Standmount · transmission line",     vendor:"pmc",           price:5999, cat:"speakers"},
        {id:"h_neat_ekstra", character:"warm", brandStory:"Neat's Ekstra standmount. Hand-built in County Durham. Isobaric bass loading. Warm and engaging — particularly good with Naim electronics.", name:"Ekstra",            sub:"Neat · Standmount · isobaric",             vendor:"neat",          price:5495, cat:"speakers"},
        {id:"h_d72_h", character:"balanced", brandStory:"Spendor's D7.2 floorstander. Linear-flow bass loading — extended and dynamic while keeping the natural BBC midrange character.",      name:"D7.2",               sub:"Spendor · Floorstander · linear flow",     vendor:"spendor",       price:5650, cat:"speakers"},
        {id:"h_kef_ref3", character:"detailed", brandStory:"KEF's Reference 3 Meta floorstander. The full-scale version of the Reference 1. Exceptional imaging and neutrality.",   name:"Reference 3 Meta",   sub:"KEF · Floorstander · Metamaterial Uni-Q",  vendor:"kef",           price:12999,cat:"speakers"},
        {id:"h_bw_804d4", character:"detailed", brandStory:"B&W's 804 D4 floorstander. Diamond tweeter, Continuum cone bass. Analytical character — rewards powerful amplification.",   name:"804 D4",             sub:"B&W · Floorstander · Diamond tweeter",     vendor:"bw",            price:6999, cat:"speakers"},
        {id:"h_focal_kanta2", character:"detailed", brandStory:"Focal's Kanta No.2. Beryllium tweeter, Flax cone. French engineering — fast, dynamic, revealing.",name:"Kanta No.2",        sub:"Focal · Floorstander · Beryllium",         vendor:"focal",         price:7999, cat:"speakers"},
        {id:"h_shl5xd", character:"warm", brandStory:"Harbeth's SHL5 Plus XD Anniversary. The SHL5 is the BBC's reference studio monitor — natural, fatigue-free, musical.",     name:"SHL5 Plus XD",       sub:"Harbeth · Anniversary floorstander",       vendor:"harbeth",       price:8498, cat:"speakers"},
        {id:"h_d92", character:"balanced", brandStory:"Spendor's D9.2 reference floorstander. The most dynamic Spendor in the range — extended bass with natural midrange.",        name:"D9.2",               sub:"Spendor · Reference floorstander",         vendor:"spendor",       price:9495, cat:"speakers"},
        {id:"h_ls5_8", character:"warm", brandStory:"Graham Audio's LS5/8 — BBC's reference studio monitor, licensed by Graham. The monitor the BBC used to master most of their archive.",      name:"LS5/8",              sub:"Graham Audio · BBC reference",             vendor:"graham_ls",     price:8995, cat:"speakers"},
        {id:"h_pmc_fact12", character:"detailed", brandStory:"PMC's Fact.12 floorstander. Transmission line bass, AMT tweeter. Studio engineering in a domestic cabinet.",  name:"Fact.12",           sub:"PMC · Floorstander · transmission line",   vendor:"pmc",           price:12999,cat:"speakers"},
        {id:"h_kudos_titan505", character:"balanced", brandStory:"Kudos's Titan 505 — made in County Durham with close ties to Naim. Legendary pairing with Naim electronics.",name:"Titan 505",       sub:"Kudos · Floorstander · isobaric",          vendor:"kudos",         price:9500, cat:"speakers"},
        {id:"h_response5", character:"warm", brandStory:"ProAc's Response D48R — ribbon tweeter floorstander. ProAc's finest — warm and musical with exceptional scale.",  name:"Response D48R",      sub:"ProAc · Flagship ribbon floorstander",     vendor:"proac",         price:9995, cat:"speakers"},
        {id:"h_scm50", character:"detailed", brandStory:"ATC's SCM50 passive. Professional studio monitor technology. Hand-wound soft-dome midrange. Brutally honest — requires 100W+.", minWatts:100,      name:"SCM50",              sub:"ATC · Reference passive studio",           vendor:"atc",           price:9995, cat:"speakers"},
        {id:"h_scm50a", character:"detailed", brandStory:"ATC's SCM50ASL active. Built-in amplification — no external amp needed. The monitor that defines studio accuracy.",     name:"SCM50ASL",           sub:"ATC · Active reference studio",            vendor:"atc",           price:14995,cat:"speakers"},
      ],
      phono:[
        {id:"h_aura_mc", character:"detailed", brandStory:"Rega's reference Aura MC phono stage. Co-developed with the Aphelion 2 cartridge for optimal noise performance.",    name:"Aura MC",            sub:"Rega · Reference MC phono stage",     vendor:"rega",         price:4295, cat:"phono"},
        {id:"h_superline", character:"warm", brandStory:"Naim's Superline — reference MC phono stage. Requires external PSU (Napsc at minimum). The definitive Naim phono stage.",  name:"Superline",          sub:"Naim · Reference MC phono",           vendor:"naim",         price:3799, cat:"phono", note:"Requires an external power supply — Napsc (£295 minimum) or HiCap DR (£1,595) for full performance. Budget for this separately. Without it the Superline borrows power from the preamp."},
        {id:"h_trio", character:"balanced", brandStory:"Clearaudio's Trio — balanced MC stage. Precise and transparent. The natural partner for Clearaudio cartridges.",       name:"Trio",               sub:"Clearaudio · Balanced MC",            vendor:"clearaudio",   price:2395, cat:"phono"},
        {id:"h_mf_vinyl", character:"detailed", brandStory:"Musical Fidelity's Nu-Vista Vinyl — valve/solid-state hybrid MC stage. Detailed and revealing.",   name:"Nu-Vista Vinyl",     sub:"Musical Fidelity · Valve/solid MC",   vendor:"musical_fidelity",price:2999,cat:"phono"},
        {id:"h_symphony", character:"balanced", brandStory:"Leema's Symphony — fully balanced MC phono stage. Excellent measured performance.",   name:"Symphony",           sub:"Leema · Fully balanced",              vendor:"leema",        price:2995, cat:"phono"},
      ],
      cables:[
        {id:"h_sarum_r",    name:"Sarum T RCA",        sub:"Chord Co. · Interconnect 1m",         vendor:"chord_co",     price:1250, cat:"cables"},
        {id:"h_sarum_s",    name:"Sarum T Speaker",    sub:"Chord Co. · 3m pair reference",       vendor:"chord_co",     price:2800, cat:"cables"},
        {id:"h_fractal_ref",name:"Fractal Speaker Ref",sub:"Townshend · Reference 3m pair",       vendor:"townshend",    price:2495, cat:"cables"},
        {id:"h_music_r",    name:"ChordMusic RCA",     sub:"Chord Co. · Flagship 1m",             vendor:"chord_co",     price:2200, cat:"cables"},
        {id:"h_music_s",    name:"ChordMusic Speaker", sub:"Chord Co. · Flagship 3m pair",        vendor:"chord_co",     price:5800, cat:"cables"},
      ],
      isolation:[
        {id:"h_gaia1",      name:"GAIA I ×8",          sub:"IsoAcoustics · Reference footers (stereo pair)",    vendor:"isoacoustics", price:1160, cat:"isolation", note:"4 footers per speaker × 2 speakers. One set of 4 is not enough for a stereo system."},
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
    isolation:{ speakerFooters:{required:false,recommended:true,item:"Speaker Isolation Footers (×8)",reason:"Party wall bass transmission via floor joists — 4 per speaker × 2 speakers",price:430}, carpetDiscs:{required:false,recommended:true,item:"Anti-Slip Floor Discs",reason:"Decouples spike from floor into party-wall structure",price:45}, phonoPlatform:{required:false,recommended:true,item:"Component Isolation Platform",reason:"Reduces airborne vibration coupling to stylus",price:195}, powerCond:{required:true,recommended:true,item:"Mains Conditioner",reason:"Shared mains ring with other flats — dirty power likely",price:395}, wallTreatment:{required:false,recommended:true,item:"Acoustic Wall Panels",reason:"Reduces flutter echo and lateral reflection",price:0}, graniteBase:{required:false,recommended:false,item:"Granite slab",reason:"Not critical at ground level",price:0} },
    warnings:[ {level:"warn",msg:"Shared party walls on both sides. Bass below 80Hz travels laterally through the masonry structure. Keep volume levels below 85dB after 10pm."}, {level:"info",msg:"Ground floor: no downstairs neighbour transmission risk. Speaker isolation footers are advisory rather than mandatory."} ], riskScore:55 },
  apt_upper: { id:"apt_upper", label:"Apartment", sub:"1st floor or above", isApartment:true, floorRisk:"critical", ceilingRisk:"medium", wallRisk:"high",
    description:"Upper-floor flat. Critical floor transmission risk — structural bass couples directly through the slab to the flat below. Speaker isolation footers are a safety item.",
    isolation:{ speakerFooters:{required:true,recommended:true,item:"Speaker Isolation Footers (×8)",reason:"SAFETY: structural bass transmission to flat below confirmed — 4 per speaker × 2 speakers",price:430}, carpetDiscs:{required:true,recommended:true,item:"Anti-Slip Floor Discs",reason:"Mandatory when using isolation footers on carpeted floors",price:45}, phonoPlatform:{required:true,recommended:true,item:"Component Isolation Platform",reason:"Airborne and structural feedback to stylus at upper floors",price:195}, powerCond:{required:true,recommended:true,item:"Mains Conditioner",reason:"Shared mains with building — dirty power confirmed",price:395}, wallTreatment:{required:false,recommended:true,item:"Acoustic Wall Panels",reason:"Reduces early reflections from parallel walls",price:0}, graniteBase:{required:false,recommended:true,item:"Granite Slab (PSU base)",reason:"Adds mass to decouple PSU transformer vibration from floor",price:25} },
    warnings:[ {level:"critical",msg:"Upper-floor apartment: structural bass below 100Hz transmits directly to the flat below at up to +14dB. Speaker isolation footers are a mandatory safety item."}, {level:"critical",msg:"Mains conditioning is required. Shared building mains introduces high-frequency noise from lifts, LED drivers, and other flats' equipment."}, {level:"warn",msg:"Party walls on shared sides — consider speaker toe-in to direct sound away from the shared wall surface."} ], riskScore:95 },
  detached: { id:"detached", label:"Detached House", sub:"No shared walls or floors", isApartment:false, floorRisk:"none", ceilingRisk:"none", wallRisk:"none",
    description:"No shared structural elements with neighbours. Isolation is about sound quality improvement rather than neighbour compliance.",
    isolation:{ speakerFooters:{required:false,recommended:true,item:"Speaker Isolation Footers (×8)",reason:"Performance: decouples speakers from floor resonance — 4 per speaker × 2 speakers",price:430}, carpetDiscs:{required:false,recommended:false,item:"Anti-Slip Floor Discs",reason:"Optional — use floor spikes on hard floors instead",price:45}, phonoPlatform:{required:false,recommended:true,item:"Component Isolation Platform",reason:"Performance: isolates stylus from airborne feedback",price:195}, powerCond:{required:false,recommended:true,item:"Mains Conditioner",reason:"Mains quality varies — benefits all analogue systems",price:395}, wallTreatment:{required:false,recommended:false,item:"Room treatment",reason:"Based on room measurements",price:0}, graniteBase:{required:false,recommended:false,item:"Granite slab",reason:"Not required",price:0} },
    warnings:[ {level:"info",msg:"Detached house: no neighbour isolation constraints. All isolation recommendations are purely for sonic performance."}, {level:"info",msg:"Focus on room acoustics — first reflection points, bass trapping, and diffusion at the rear wall."} ], riskScore:5 },
  semi_detached: { id:"semi_detached", label:"Semi-Detached", sub:"One shared party wall", isApartment:false, floorRisk:"none", ceilingRisk:"none", wallRisk:"medium",
    description:"One shared party wall with a neighbour. No floor/ceiling risk. Bass transmission is lateral through the party wall only.",
    isolation:{ speakerFooters:{required:false,recommended:true,item:"Speaker Isolation Footers (×8)",reason:"Reduces floor-coupled bass reaching party wall — 4 per speaker × 2 speakers",price:430}, carpetDiscs:{required:false,recommended:false,item:"Anti-Slip Floor Discs",reason:"Advisory only — floor risk is low",price:45}, phonoPlatform:{required:false,recommended:true,item:"Component Isolation Platform",reason:"Performance and low-level vibration control",price:195}, powerCond:{required:false,recommended:true,item:"Mains Conditioner",reason:"Shared mains spur with neighbour possible",price:395}, wallTreatment:{required:false,recommended:true,item:"Wall Absorption Treatment",reason:"Reduces direct bass radiation into the shared wall",price:0}, graniteBase:{required:false,recommended:false,item:"Granite slab",reason:"Not required",price:0} },
    warnings:[ {level:"warn",msg:"One shared party wall. Position speakers to toe away from the shared wall side."}, {level:"info",msg:"No floor or ceiling transmission risk. Neighbour compliance is manageable with reasonable volume levels."} ], riskScore:35 },
};

const MOUNTING = [
  { id:"sideboard", label:"Sideboard",      sub:"Standard furniture",      requireIso:true,  cableDress:false, vibWarn:false, floorSpike:false, granite:false, note:"Isolation platforms mandatory for all components. Component isolation platform under phono stage if stacked." },
  { id:"rack",      label:"Dedicated Rack", sub:"Fraim · Quadraspire etc", requireIso:false, cableDress:true,  vibWarn:false, floorSpike:true,  granite:false, note:"Built-in isolation assumed. Prioritise cable dressing, floor spike coupling, and star-earthing at the rack." },
  { id:"other",     label:"Floor / Custom", sub:"Informal or custom build", requireIso:true,  cableDress:false, vibWarn:true,  floorSpike:false, granite:true,  note:"Vibration Warning active. Place mains conditioner on floor or a 20mm granite slab." },
];

function analyseRoom({ length, width, height, floorTypes=["wood"], wallMaterials=["plasterboard"], sideboardWidth, sideboardMat, sideWallGap, buildingType, currentTier="mid" }) {
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
  // Power conditioning only surfaces as a mandatory auto-item at mid/high tier
  if (iso.powerCond.required && currentTier !== "entry") autoItems.push({ id:"pq_auto", name:iso.powerCond.item, reason:iso.powerCond.reason, price:iso.powerCond.price });
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
  return <span style={{fontSize:9,letterSpacing:".14em",textTransform:"uppercase",padding:"3px 10px",background:col,color:"var(--paper)",fontFamily:"var(--mono)",fontWeight:400}}>{children}</span>;
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
    <div style={{marginBottom:16,paddingBottom:10,borderBottom:"1px solid var(--rule)"}}>
      <span style={{fontSize:9,letterSpacing:".22em",textTransform:"uppercase",color:"var(--ink3)",fontFamily:"var(--mono)"}}>{children}</span>
    </div>
  );
}

const STEPS = [
  { id:"materials", label:"Building",    sub:"Type & Surfaces"},
  { id:"room",      label:"Room",        sub:"Dimensions & Furniture"},
  { id:"genres",    label:"Music",       sub:"Preferences"  },
  { id:"tier",      label:"Brief",       sub:"Requirements" },
  { id:"catalog",   label:"Components",  sub:"Brand picks"  },
  { id:"summary",   label:"Your System", sub:"Review"       },
  { id:"pricing",   label:"Pricing",     sub:"& Negotiation"},
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

// ── Natural language room size lookup ────────────────────────────────────────
const NL_ROOM_SIZES = {
  small:    { dims:{length:3.5,width:3.2,height:2.4} },
  medium:   { dims:{length:5.0,width:4.0,height:2.5} },
  large:    { dims:{length:6.0,width:5.0,height:2.6} },
  openplan: { dims:{length:7.5,width:5.5,height:2.8} },
};

// ── Natural Language Input Component ─────────────────────────────────────────
function NLInput({ onResult, apiKey, localeId }) {
  const [text, setText] = React.useState("");
  const [state, setState] = React.useState("idle"); // idle | loading | done | error
  const [parsed, setParsed] = React.useState(null);
  const loc = LOCALES[localeId] || LOCALES.gb;

  async function handleSubmit() {
    if (!text.trim() || state==="loading") return;
    setState("loading");
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{
          "Content-Type":"application/json",
          "x-api-key": apiKey,
          "anthropic-version":"2023-06-01",
          "anthropic-dangerous-direct-browser-access":"true",
        },
        body: JSON.stringify({
          model:"claude-haiku-4-5-20251001",
          max_tokens:600,
          messages:[{
            role:"user",
            content:`You are parsing a description of a hi-fi listening room and preferences for a system configurator.

Extract the following fields from this description and respond ONLY with a JSON object — no preamble, no markdown, no backticks:

{
  "roomSize": "small|medium|large|openplan",
  "buildingType": "apt_ground|apt_upper|detached|semi_detached",
  "floorType": "carpet|wood|tile",
  "wallType": "solid_brick|plasterboard|glass",
  "budget": number (in ${loc.currency} as an integer, 0 if not mentioned),
  "genres": array of zero or more from ["classical","jazz","rock","electronic","pop_soul","folk","world"],
  "bias": number 0-100 (0=Foundation/source-first, 100=Expression/speaker-first, 50=balanced. Infer from words like 'musical','detail','soundstage','warm','analytical'),
  "tier": "entry|mid|high" (infer from budget: entry <5000, mid 5000-15000, high >15000. Use ${loc.currency}),
  "mounting": "sideboard|rack|other",
  "confidence": "high|medium|low",
  "summary": "one sentence describing what you understood"
}

Rules:
- If a field cannot be determined, use null
- For budget, extract the number only (e.g. "£3,500" → 3500, "$5k" → 5000)
- For genres, match to the closest available option
- For buildingType: flat/apartment = apt_ground or apt_upper (upper if they mention floor/upstairs), house with neighbours = semi_detached, standalone house = detached
- For bias: words like 'detail','resolution','analytical','source' lean toward 0. Words like 'warm','musical','fill the room','soundstage' lean toward 100

Description: "${text}"`
          }]
        })
      });
      const data = await res.json();
      const raw = data.content?.map(c=>c.text||"").join("") || "";
      const clean = raw.replace(/\`\`\`json|\`\`\`/g,"").trim();
      const result = JSON.parse(clean);
      setParsed(result);
      setState("done");
    } catch(e) {
      console.error("NL parse failed:", e);
      setState("error");
    }
  }

  if (state==="done" && parsed) {
    return (
      <div className="fu">
        <div style={{padding:"20px 20px",background:"var(--ink)",marginBottom:12}}>
          <div style={{fontSize:9,color:"rgba(245,242,232,.4)",letterSpacing:".18em",textTransform:"uppercase",fontFamily:"var(--mono)",marginBottom:10}}>Understood · {parsed.confidence} confidence</div>
          <p style={{fontFamily:"var(--serif)",fontSize:14,color:"var(--paper)",lineHeight:1.7,marginBottom:16}}>{parsed.summary}</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:16}}>
            {[
              {l:"Room",    v:parsed.roomSize||"—"},
              {l:"Building",v:(parsed.buildingType||"—").replace("apt_","Flat · ").replace("semi_detached","Semi-detached").replace("detached","Detached")},
              {l:"Budget",  v:parsed.budget>0?`${loc.symbol}${parsed.budget.toLocaleString()}`:"Not specified"},
              {l:"Bias",    v:parsed.bias!=null?(parsed.bias<35?"Foundation":"parsed.bias>65"?"Expression":"Balanced"):"—"},
            ].map(m=>(
              <div key={m.l} style={{padding:"8px 10px",background:"rgba(245,242,232,.06)"}}>
                <div style={{fontSize:8,color:"rgba(245,242,232,.35)",letterSpacing:".12em",textTransform:"uppercase",fontFamily:"var(--mono)",marginBottom:2}}>{m.l}</div>
                <div style={{fontFamily:"var(--serif)",fontSize:13,color:"rgba(245,242,232,.85)",textTransform:"capitalize"}}>{m.v}</div>
              </div>
            ))}
          </div>
          {parsed.genres?.length>0&&(
            <div style={{marginBottom:16}}>
              <div style={{fontSize:8,color:"rgba(245,242,232,.35)",letterSpacing:".12em",textTransform:"uppercase",fontFamily:"var(--mono)",marginBottom:6}}>Genres</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {parsed.genres.map(g=>{
                  const genre = GENRES.find(x=>x.id===g);
                  return genre ? <span key={g} style={{fontSize:11,padding:"3px 10px",background:"rgba(245,242,232,.1)",color:"rgba(245,242,232,.8)",fontFamily:"var(--mono)"}}>{genre.emoji} {genre.label}</span> : null;
                })}
              </div>
            </div>
          )}
          <div style={{display:"flex",gap:10}}>
            <button onClick={()=>onResult(parsed)} style={{flex:1,padding:"14px",background:"var(--amber)",color:"var(--paper)",border:"none",cursor:"pointer",fontFamily:"var(--mono)",fontSize:11,letterSpacing:".16em",textTransform:"uppercase"}}>
              Build this system →
            </button>
            <button onClick={()=>{setState("idle");setParsed(null);setText("");}} style={{padding:"14px 16px",background:"transparent",color:"rgba(245,242,232,.5)",border:"1px solid rgba(245,242,232,.15)",cursor:"pointer",fontFamily:"var(--mono)",fontSize:10}}>
              Edit
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{fontSize:9,color:"var(--ink4)",letterSpacing:".16em",textTransform:"uppercase",fontFamily:"var(--mono)",marginBottom:10}}>Describe your room and what you're looking for</div>
      <textarea
        value={text}
        onChange={e=>setText(e.target.value)}
        placeholder={"e.g. I'm in a first floor flat in a Victorian semi, medium sized living room, hardwood floors throughout. Budget around £3,500. Mainly listen to jazz and folk — want it to feel musical and warm, not clinical. Equipment will sit on an IKEA sideboard."}
        rows={5}
        style={{width:"100%",padding:"14px 16px",fontFamily:"var(--serif)",fontSize:13,color:"var(--ink)",background:"var(--paper)",border:"2px solid var(--ink)",outline:"none",lineHeight:1.65,resize:"vertical",marginBottom:10}}
      />

      {/* Prompt chips — tap to insert a starter sentence */}
      {!text.trim()&&(
        <div style={{marginBottom:12}}>
          <div style={{fontSize:8,color:"var(--ink4)",letterSpacing:".12em",textTransform:"uppercase",fontFamily:"var(--mono)",marginBottom:8}}>Not sure where to start? Try one of these:</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
            {[
              "I'm completely new to hi-fi and have a budget of around £",
              "I want to upgrade my existing turntable setup — currently have a Rega Planar 1 and budget is £",
              "I have a large living room in a detached house and want a serious system, budget around £",
            ].map((prompt,i)=>(
              <button key={i} onClick={()=>setText(prompt)} style={{
                padding:"7px 12px",background:"var(--paper2)",border:"1px solid var(--rule)",
                cursor:"pointer",fontFamily:"var(--serif)",fontSize:11,color:"var(--ink3)",
                textAlign:"left",lineHeight:1.4,transition:"all .15s",
              }}>
                {prompt}<span style={{color:"var(--ink4)"}}>...</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Hint — what to include */}
      {!text.trim()&&(
        <div style={{marginBottom:12,padding:"10px 14px",borderLeft:"2px solid var(--rule)",background:"var(--paper2)"}}>
          <div style={{fontSize:9,color:"var(--ink4)",letterSpacing:".1em",textTransform:"uppercase",fontFamily:"var(--mono)",marginBottom:6}}>Helpful to mention</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:"4px 16px"}}>
            {["Room size","Building type (flat / house)","Floor type","Budget","Music you love","New or upgrading"].map(hint=>(
              <span key={hint} style={{fontSize:10,color:"var(--ink3)",fontFamily:"var(--mono)"}}>· {hint}</span>
            ))}
          </div>
        </div>
      )}

      {state==="error"&&<p style={{fontSize:11,color:"var(--red)",fontFamily:"var(--mono)",marginBottom:8}}>Couldn't parse that — try the step-by-step guide below instead.</p>}
      <button
        onClick={handleSubmit}
        disabled={!text.trim()||state==="loading"}
        style={{
          display:"flex",alignItems:"center",gap:14,
          padding:"18px 28px",width:"100%",maxWidth:360,justifyContent:"space-between",
          background:text.trim()?"var(--ink)":"var(--paper2)",
          color:text.trim()?"var(--paper)":"var(--ink4)",
          border:`1px solid ${text.trim()?"var(--ink)":"var(--rule)"}`,
          cursor:text.trim()?"pointer":"default",
          fontFamily:"var(--mono)",fontSize:11,letterSpacing:".16em",textTransform:"uppercase",
          transition:"all .2s",
        }}
      >
        <span>{state==="loading"?"Reading your room...":"Build my system"}</span>
        {state==="loading"
          ? <svg className="vinyl-turn" width="18" height="18" viewBox="0 0 18 18"><circle cx="9" cy="9" r="8" fill="none" stroke="currentColor" strokeWidth="1.2"/><circle cx="9" cy="9" r="3" fill="none" stroke="currentColor" strokeWidth=".8"/><circle cx="9" cy="9" r="1.2" fill="currentColor"/></svg>
          : <svg width="18" height="12" viewBox="0 0 20 12" fill="none"><path d="M13 1l6 5-6 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><line x1="19" y1="6" x2="1" y2="6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
        }
      </button>
    </div>
  );
}

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
      <button onClick={onNext} style={{background:"var(--ink)",color:"var(--paper)",border:"none",padding:"16px 36px",fontSize:11,letterSpacing:".16em",textTransform:"uppercase",cursor:"pointer",fontFamily:"var(--mono)",display:"flex",alignItems:"center",gap:12,fontWeight:400}}>
        {nextLabel}
        <svg width="16" height="10" viewBox="0 0 16 10" fill="none"><path d="M9 1l6 4-6 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><line x1="15" y1="5" x2="1" y2="5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
      </button>
    </div>
  );
}

function InfoBanner({msg}) {
  return (
    <div style={{padding:"16px 20px",borderLeft:"3px solid var(--ink)",background:"var(--paper2)",marginBottom:20}}>
      <p style={{fontSize:13,color:"var(--ink2)",lineHeight:1.65,fontFamily:"var(--serif)",fontStyle:"italic"}}>{msg}</p>
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

function LandingScreen({ onEnter, onEnterWithNL, localeId, onLocaleChange, apiKey }) {
  const loc = LOCALES[localeId] || LOCALES.gb;
  return (
    <div style={{fontFamily:"var(--serif)",background:"var(--paper)",minHeight:"100vh",color:"var(--ink)",position:"relative",overflow:"hidden"}}>

      {/* Large background vinyl rings — decorative */}
      <div style={{position:"fixed",inset:0,pointerEvents:"none",overflow:"hidden"}}>
        <svg style={{position:"absolute",bottom:"-120px",right:"-120px",opacity:.05}} width="700" height="700" viewBox="0 0 700 700">
          {[320,280,240,200,160,120,80,40].map(r=><circle key={r} cx="350" cy="350" r={r} fill="none" stroke="#111008" strokeWidth="1.5"/>)}
          <circle cx="350" cy="350" r="18" fill="#111008"/>
        </svg>
      </div>

      <div style={{height:4,background:"var(--ink)",width:"100%"}}/>

      <div style={{position:"relative",maxWidth:640,margin:"0 auto",padding:"clamp(32px,6vw,64px) 24px 60px"}}>

        {/* Spinning vinyl + eyebrow */}
        <div className="sl sl1" style={{display:"flex",alignItems:"center",gap:14,marginBottom:32}}>
          <svg width="48" height="48" viewBox="0 0 48 48" className="vinyl-turn" style={{flexShrink:0}}>
            <circle cx="24" cy="24" r="22" fill="#EEE8D8" stroke="#DDD5C0" strokeWidth="1.5"/>
            <circle cx="24" cy="24" r="15" fill="none" stroke="rgba(17,16,8,.06)" strokeWidth="1"/>
            <circle cx="24" cy="24" r="9"  fill="none" stroke="rgba(17,16,8,.06)" strokeWidth="1"/>
            <circle cx="24" cy="24" r="4"  fill="#111008" opacity=".7"/>
            <circle cx="24" cy="24" r="2"  fill="#111008"/>
          </svg>
          <div>
            <div style={{fontSize:10,letterSpacing:".2em",textTransform:"uppercase",color:"var(--amber)",fontFamily:"var(--mono)",lineHeight:1}}>Hi-Fi System Builder</div>
            <div style={{fontSize:9,letterSpacing:".1em",textTransform:"uppercase",color:"var(--ink4)",marginTop:4,fontFamily:"var(--mono)"}}>UK Edition · Beta</div>
          </div>
        </div>

        {/* Hero — big, fast, one read */}
        <div className="sl sl2" style={{marginBottom:40}}>
          <h1 style={{fontFamily:"var(--serif)",fontSize:"clamp(44px,10vw,80px)",fontWeight:400,color:"var(--ink)",lineHeight:.95,letterSpacing:"-.04em",marginBottom:24}}>
            What hi-fi<br/>
            <em style={{color:"var(--amber)",fontStyle:"italic"}}>should</em><br/>
            you buy?
          </h1>
          <p style={{fontSize:"clamp(14px,2vw,17px)",color:"var(--ink3)",lineHeight:1.65,maxWidth:440,fontFamily:"var(--serif)",fontWeight:300}}>
            Tell it your room. Your building. Your budget. It builds a complete, priced system — step by step.
          </p>
        </div>

        {/* ── Two entry points ── */}
        <div className="sl sl3" style={{marginBottom:40}}>

          {/* Option A — Natural language */}
          <NLInput onResult={onEnterWithNL} apiKey={apiKey} localeId={localeId}/>

          <div style={{display:"flex",alignItems:"center",gap:12,margin:"20px 0"}}>
            <div style={{flex:1,height:1,background:"var(--rule)"}}/>
            <span style={{fontSize:9,color:"var(--ink4)",fontFamily:"var(--mono)",letterSpacing:".14em",textTransform:"uppercase"}}>or</span>
            <div style={{flex:1,height:1,background:"var(--rule)"}}/>
          </div>

          {/* Option B — Step by step wizard */}
          <div>
            <button onClick={onEnter} style={{
              display:"flex",alignItems:"center",gap:16,
              padding:"16px 28px",
              background:"transparent",color:"var(--ink)",
              border:"1px solid var(--ink)",cursor:"pointer",
              fontFamily:"var(--mono)",fontSize:11,letterSpacing:".16em",textTransform:"uppercase",
              width:"100%",maxWidth:360,
              justifyContent:"space-between",
            }}>
              <span>Step-by-step guide</span>
              <svg width="18" height="12" viewBox="0 0 20 12" fill="none"><path d="M13 1l6 5-6 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><line x1="19" y1="6" x2="1" y2="6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
            </button>
            <div style={{marginTop:8,fontSize:10,color:"var(--ink4)",letterSpacing:".04em",fontFamily:"var(--mono)"}}>
              New to hi-fi? <span style={{color:"var(--ink2)"}}>Start here.</span> We'll ask you the right questions — no jargon.
            </div>
          </div>
        </div>

        {/* Stats — simple row */}
        <div className="sl sl4" style={{display:"flex",gap:0,marginBottom:48,paddingTop:24,borderTop:"1px solid var(--rule)"}}>
          {[{val:"188",label:"Components"},{val:"25",label:"Brands"},{val:"3",label:"Budget tiers"},{val:"6",label:"Locales"}].map((s,i)=>(
            <div key={i} style={{flex:1,textAlign:"center",borderRight:i<3?"1px solid var(--rule)":"none",padding:"0 8px"}}>
              <div style={{fontFamily:"var(--serif)",fontSize:"clamp(24px,5vw,36px)",fontWeight:400,color:"var(--ink)",lineHeight:1}}>{s.val}</div>
              <div style={{fontSize:8,color:"var(--ink4)",letterSpacing:".12em",textTransform:"uppercase",marginTop:5,fontFamily:"var(--mono)"}}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Locale selector */}
        <div className="sl sl5" style={{marginBottom:32}}>
          <div style={{fontSize:9,color:"var(--ink4)",letterSpacing:".16em",textTransform:"uppercase",marginBottom:10,fontFamily:"var(--mono)"}}>Your location</div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {Object.values(LOCALES).map(l=>(
              <button key={l.id} onClick={()=>onLocaleChange(l.id)} style={{
                display:"flex",alignItems:"center",gap:6,
                padding:"8px 14px",cursor:"pointer",
                background:localeId===l.id?"var(--ink)":"transparent",
                border:`1px solid ${localeId===l.id?"var(--ink)":"var(--rule)"}`,
                fontFamily:"var(--mono)",fontSize:10,letterSpacing:".06em",
                color:localeId===l.id?"var(--paper)":"var(--ink3)",transition:"all .15s",
              }}>
                <span style={{fontSize:15}}>{l.flag}</span>
                <span>{l.label}</span>
              </button>
            ))}
          </div>
          {localeId!=="gb"&&<div style={{marginTop:8,fontSize:9,color:"var(--ink4)",fontFamily:"var(--mono)"}}>Prices converted from UK MSRP — indicative only.</div>}
        </div>

        {/* Links row */}
        <div className="sl sl6" style={{display:"flex",gap:16,alignItems:"center",paddingTop:20,borderTop:"1px solid var(--rule)"}}>
          <a href={TALLY_URL} target="_blank" rel="noopener noreferrer" style={{fontSize:10,color:"var(--ink3)",fontFamily:"var(--mono)",letterSpacing:".1em",textTransform:"uppercase",textDecoration:"none",borderBottom:"1px solid var(--rule)"}}>Feedback</a>
          <a href={TIKTOK_URL} target="_blank" rel="noopener noreferrer" style={{fontSize:10,color:"var(--ink3)",fontFamily:"var(--mono)",letterSpacing:".1em",textTransform:"uppercase",textDecoration:"none",borderBottom:"1px solid var(--rule)"}}>TikTok</a>
          <a href={SUBSTACK_URL} target="_blank" rel="noopener noreferrer" style={{fontSize:10,color:"var(--ink3)",fontFamily:"var(--mono)",letterSpacing:".1em",textTransform:"uppercase",textDecoration:"none",borderBottom:"1px solid var(--rule)"}}>Substack</a>
          <span style={{marginLeft:"auto",fontSize:9,color:"var(--ink4)",fontFamily:"var(--mono)"}}>Beta v0.4</span>
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

  const [hasInteracted, setHasInteracted] = useState(false);

  function toggleFloor(v) { setHasInteracted(true); setFloorTypes(prev => prev.includes(v) ? prev.filter(x=>x!==v) : [...prev, v]); }
  function toggleWall(v)  { setHasInteracted(true); setWallMaterials(prev => prev.includes(v) ? prev.filter(x=>x!==v) : [...prev, v]); }

  const [buildingType, setBuildingType] = useState("apt_upper");
  const [sideboardWidth, setSideboardWidth] = useState(1.2);
  const [sideboardMat, setSideboardMat] = useState("lightweight_wood");
  const [sideWallGap, setSideWallGap] = useState(22);
  const [mounting, setMounting] = useState("sideboard");
  const [tier, setTier] = useState("mid");
  const [bias, setBias] = useState(50); // 0 = Foundation (source-heavy), 100 = Expression (speaker-heavy)
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [openCat, setOpenCat] = useState(null);
  const [livePrices, setLivePrices] = useState({});
  const [showAllCat, setShowAllCat] = useState({});
  const [chainStep, setChainStep] = useState(0);
  const [charFilter, setCharFilter] = useState("all"); // "all" | "warm" | "balanced" | "detailed"
  const [budget, setBudget] = useState(0);
  const [basket, setBasket] = useState(()=>getDefaultBasket("mid"));
  const prevTier = useRef("mid");

  const loc = LOCALES[localeId] || LOCALES.gb;
  const genreAdj = getGenreAdjustments(selectedGenres);
  const selectedTurntable = basket.find(i=>i.cat==="turntable");
  const bundledCart = selectedTurntable ? (BUNDLED_CARTRIDGES[selectedTurntable.id] || null) : null;
  const needsCartridge = selectedTurntable ? REQUIRES_CARTRIDGE.has(selectedTurntable.id) : false;
  const analysis = analyseRoom({ ...room, floorTypes, wallMaterials, sideboardWidth, sideboardMat, sideWallGap, buildingType, currentTier: tier });
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
    setChainStep(0);
  },[tier]);

  useEffect(()=>{
    if(step==="catalog") setChainStep(0);
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
        <StepHeading title="Your Building" sub="Select your building type and surface materials"/>
        <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8,marginBottom:16}}>
          {Object.values(BUILDING_TYPES).map(bt=>{
            const active=buildingType===bt.id;
            const riskCol=bt.riskScore>=80?"var(--red)":bt.riskScore>=50?"var(--amber)":bt.riskScore>=25?"var(--amber)":"var(--green)";
            const BIcon=BICONS[bt.id];
            return (
              <button key={bt.id} onClick={()=>setBuildingType(bt.id)} style={{padding:"14px 12px",textAlign:"left",cursor:"pointer",border:`1px solid ${active?riskCol+"70":"var(--rule)"}`,background:active?`${riskCol}0C`:"var(--paper2)",transition:"all .22s"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                  <BIcon col={active?riskCol:"var(--ink3)"} size={22}/>
                  <div style={{fontSize:7,color:riskCol,background:`${riskCol}18`,border:`1px solid ${riskCol}30`,padding:"1px 5px",letterSpacing:".1em",textTransform:"uppercase"}}>Risk {bt.riskScore}</div>
                </div>
                <div style={{fontFamily:"var(--serif)",fontSize:13,color:active?riskCol:"var(--ink2)",marginBottom:1}}>{(loc.buildingTypes[bt.id]||{label:bt.label}).label}</div>
                <div style={{fontSize:8,color:active?riskCol+"AA":"var(--ink4)",letterSpacing:".06em"}}>{(loc.buildingTypes[bt.id]||{sub:bt.sub}).sub}</div>
              </button>
            );
          })}
        </div>

        {/* Isolation summary — compact, just mandatory items */}
        {analysis.bld&&(()=>{
          const mandatory = Object.values(analysis.iso).filter(s=>s.required&&s.price>0);
          if(mandatory.length===0) return <div style={{padding:"10px 14px",borderLeft:"3px solid var(--green)",background:"rgba(42,80,64,.05)",marginBottom:16,fontSize:11,color:"var(--green)",fontFamily:"var(--mono)",letterSpacing:".08em"}}>✓ No mandatory isolation items for this building type</div>;
          return (
            <div style={{marginBottom:16,padding:"12px 14px",borderLeft:"3px solid var(--red)",background:"rgba(139,32,32,.04)"}}>
              <div style={{fontSize:8,color:"var(--red)",letterSpacing:".16em",textTransform:"uppercase",marginBottom:6,fontFamily:"var(--mono)"}}>Mandatory isolation for this building</div>
              {mandatory.map(s=><div key={s.item} style={{fontSize:11,color:"var(--ink2)",fontFamily:"var(--serif)",marginBottom:2}}>· {s.item} — {s.reason}</div>)}
            </div>
          );
        })()}

        <div style={{height:1,background:"var(--rule)",margin:"16px 0"}}/>

        {/* Floor + Wall in a compact 2-col grid */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
          <div>
            <div style={{fontSize:8,letterSpacing:".16em",textTransform:"uppercase",color:"var(--ink3)",marginBottom:8,fontFamily:"var(--mono)"}}>Floor</div>
            <div style={{display:"flex",flexDirection:"column",gap:0,border:"1px solid var(--rule)"}}>
              {[{value:"carpet",label:"Carpet"},{value:"wood",label:"Hardwood"},{value:"tile",label:"Tile / Stone"}].map((o,i)=>{
                const sel=floorTypes.includes(o.value);
                return <button key={o.value} onClick={()=>toggleFloor(o.value)} style={{padding:"8px 12px",fontSize:10,cursor:"pointer",fontFamily:"var(--mono)",background:sel?"var(--amber)":"transparent",color:sel?"var(--paper)":"var(--ink3)",border:"none",borderTop:i>0?"1px solid var(--rule)":"none",textAlign:"left",transition:"all .15s",display:"flex",justifyContent:"space-between"}}>{o.label}{sel&&<span style={{opacity:.7}}>✓</span>}</button>;
              })}
            </div>
          </div>
          <div>
            <div style={{fontSize:8,letterSpacing:".16em",textTransform:"uppercase",color:"var(--ink3)",marginBottom:8,fontFamily:"var(--mono)"}}>Walls</div>
            <div style={{display:"flex",flexDirection:"column",gap:0,border:"1px solid var(--rule)"}}>
              {loc.wallMaterials.map((o,i)=>{
                const sel=wallMaterials.includes(o.value);
                return <button key={o.value} onClick={()=>toggleWall(o.value)} style={{padding:"8px 12px",fontSize:10,cursor:"pointer",fontFamily:"var(--mono)",background:sel?"var(--amber)":"transparent",color:sel?"var(--paper)":"var(--ink3)",border:"none",borderTop:i>0?"1px solid var(--rule)":"none",textAlign:"left",transition:"all .15s",display:"flex",justifyContent:"space-between"}}>{o.label}{sel&&<span style={{opacity:.7}}>✓</span>}</button>;
              })}
            </div>
          </div>
        </div>

        {hasInteracted && analysis.warnings.filter(w=>w.level==="critical").map((w,i)=><WarningBadge key={i} w={w} SEV={SEV}/>)}
        <NavRow onNext={()=>advance("materials","room")}/>
      </div>
    ),

    room: (()=>{
      // ── Named room size definitions ─────────────────────────────────
      const ROOM_SIZES = [
        { id:"small",     label:"Small",          sub:"Bedroom or study",        desc:"Up to 12 m² · roughly 3×4m", dims:{length:3.5,width:3.2,height:2.4}, tierHint:"entry",   speakerHint:"Standmount only — a floorstander will overwhelm this space." },
        { id:"medium",    label:"Medium",          sub:"Standard living room",    desc:"12–20 m² · roughly 4×5m",    dims:{length:5.0,width:4.0,height:2.5}, tierHint:"mid",     speakerHint:"Standmount or compact floorstander. Good flexibility." },
        { id:"large",     label:"Large",           sub:"Generous living room",    desc:"20–30 m² · roughly 5×6m",    dims:{length:6.0,width:5.0,height:2.6}, tierHint:"mid",     speakerHint:"Floorstander will work well here. Bass can breathe." },
        { id:"openplan",  label:"Open Plan",       sub:"Kitchen-diner or loft",   desc:"30 m²+ · large or irregular", dims:{length:7.5,width:5.5,height:2.8}, tierHint:"high",    speakerHint:"Large floorstander or active monitors. Budget for acoustic treatment." },
      ];

      // ── Mounting options simplified ─────────────────────────────────
      const MOUNT_OPTS = [
        { id:"sideboard", label:"Sideboard",      sub:"On furniture",    icon:<IconSideboard size={28} col="currentColor"/> },
        { id:"rack",      label:"Dedicated Rack", sub:"Hi-fi rack",      icon:<IconRack      size={28} col="currentColor"/> },
        { id:"other",     label:"Custom / Floor", sub:"Other setup",     icon:<IconFloor     size={28} col="currentColor"/> },
      ];

      // ── Photo analysis state ────────────────────────────────────────
      const [photoState, setPhotoState] = React.useState("idle"); // idle | loading | done | error
      const [photoResult, setPhotoResult] = React.useState(null);
      const [photoPreview, setPhotoPreview] = React.useState(null);
      const fileInputRef = React.useRef(null);

      const selectedSize = ROOM_SIZES.find(s => {
        const a = analysis.area;
        if (s.id==="small")    return a <= 12;
        if (s.id==="medium")   return a > 12 && a <= 20;
        if (s.id==="large")    return a > 20 && a <= 30;
        if (s.id==="openplan") return a > 30;
        return false;
      }) || ROOM_SIZES[1];

      // Which named size is currently active based on room state
      const activeSize = ROOM_SIZES.find(s => {
        const a = room.length * room.width;
        if (s.id==="small")    return a <= 12;
        if (s.id==="medium")   return a > 12 && a <= 20;
        if (s.id==="large")    return a > 20 && a <= 30;
        if (s.id==="openplan") return a > 30;
      }) || ROOM_SIZES[1];

      function selectSize(size) {
        setRoom(size.dims);
        if (size.tierHint) setTier(size.tierHint);
      }

      // ── Real-time consequence strip ─────────────────────────────────
      function getConsequences() {
        const consequences = [];
        const a = room.length * room.width;
        if (a <= 12)       consequences.push({ icon:"🔊", text:"Standmount speakers only — floorstanders will overwhelm this space" });
        else if (a <= 20)  consequences.push({ icon:"🔊", text:"Standmount or compact floorstander — good flexibility" });
        else if (a <= 30)  consequences.push({ icon:"🔊", text:"Full floorstander will work well — bass has room to develop" });
        else               consequences.push({ icon:"🔊", text:"Large floorstander or active monitors — consider acoustic treatment" });
        if (sideWallGap < 30) consequences.push({ icon:"⚠️", text:`Only ${sideWallGap}cm to side wall — rear-ported speakers will cause bass boom` });
        if (mounting === "sideboard") consequences.push({ icon:"📐", text:"Isolation platform under turntable strongly recommended on furniture" });
        if (floorTypes.includes("wood") && buildingType === "apt_upper") consequences.push({ icon:"🏠", text:"Hardwood floor + upper flat — speaker isolation footers are essential" });
        return consequences;
      }

      // ── Claude vision photo analysis ───────────────────────────────
      async function analysePhoto(file) {
        setPhotoState("loading");
        try {
          const base64 = await new Promise((res, rej) => {
            const r = new FileReader();
            r.onload = () => res(r.result.split(",")[1]);
            r.onerror = () => rej(new Error("Read failed"));
            r.readAsDataURL(file);
          });
          const preview = await new Promise(res => {
            const r = new FileReader();
            r.onload = () => res(r.result);
            r.readAsDataURL(file);
          });
          setPhotoPreview(preview);

          const response = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": import.meta.env.VITE_ANTHROPIC_KEY,
              "anthropic-version": "2023-06-01",
              "anthropic-dangerous-direct-browser-access": "true",
            },
            body: JSON.stringify({
              model: "claude-haiku-4-5-20251001",
              max_tokens: 1000,
              messages: [{
                role: "user",
                content: [
                  {
                    type: "image",
                    source: { type: "base64", media_type: file.type || "image/jpeg", data: base64 }
                  },
                  {
                    type: "text",
                    text: `You are analysing a photo of a listening room for a hi-fi system configurator. 
                    
Analyse the image and respond ONLY with a JSON object — no preamble, no markdown, no backticks. Example:
{"roomSize":"medium","floorType":"wood","wallType":"plasterboard","sideWallClearance":"normal","mountingSurface":"sideboard","issues":["Large glass window on left wall","Low ceiling"],"confidence":"high","notes":"Standard UK living room. Timber floor throughout. Plasterboard walls. Sideboard on left wall with limited space."}

roomSize: one of "small" / "medium" / "large" / "openplan"
floorType: one of "carpet" / "wood" / "tile"  
wallType: one of "solid_brick" / "plasterboard" / "glass" (dominant material)
sideWallClearance: one of "tight" (under 30cm) / "normal" (30-60cm) / "generous" (over 60cm)
mountingSurface: one of "sideboard" / "rack" / "other"
issues: array of strings — acoustic problems visible in the photo (glass, hard surfaces, parallel walls, low ceiling, etc.). Empty array if none.
confidence: one of "high" / "medium" / "low"
notes: one sentence description of what you see.

Be honest. If the image is too dark, blurry, or unclear, set confidence to "low" and explain in notes.`
                  }
                ]
              }]
            })
          });

          const data = await response.json();
          const text = data.content?.map(c => c.text || "").join("") || "";
          const clean = text.replace(/```json|```/g, "").trim();
          const result = JSON.parse(clean);
          setPhotoResult(result);

          // Auto-apply detected values
          const sizeMap = { small:ROOM_SIZES[0], medium:ROOM_SIZES[1], large:ROOM_SIZES[2], openplan:ROOM_SIZES[3] };
          if (sizeMap[result.roomSize]) selectSize(sizeMap[result.roomSize]);
          if (result.floorType) setFloorTypes([result.floorType]);
          if (result.wallType)  setWallMaterials([result.wallType]);
          if (result.mountingSurface) setMounting(result.mountingSurface);
          if (result.sideWallClearance === "tight") setSideWallGap(20);
          else if (result.sideWallClearance === "generous") setSideWallGap(60);
          else setSideWallGap(40);

          setPhotoState("done");
        } catch (err) {
          console.error("Photo analysis failed:", err);
          setPhotoState("error");
        }
      }

      function handleFileChange(e) {
        const file = e.target.files?.[0];
        if (file) analysePhoto(file);
      }

      const consequences = getConsequences();

      return (
        <div>
          <StepHeading title="Your Room"/>

          {/* ── Photo analysis — FIRST, most prominent ───────────────── */}
          <div style={{marginBottom:28}}>
            <div style={{marginBottom:14}}>
              <div style={{fontFamily:"var(--serif)",fontSize:"clamp(16px,3vw,20px)",color:"var(--ink)",marginBottom:6,lineHeight:1.2}}>Let Claude read your room</div>
              <p style={{fontSize:13,color:"var(--ink3)",fontFamily:"var(--serif)",lineHeight:1.65}}>
                Take a photo of your listening space. Claude will identify the room size, floor, walls, and any acoustic issues — and fill everything in automatically.
              </p>
            </div>

            {photoState === "idle" && (
              <button onClick={()=>fileInputRef.current?.click()} style={{
                width:"100%",padding:"28px 20px",
                border:"2px solid var(--ink)",background:"var(--ink)",
                cursor:"pointer",textAlign:"center",transition:"all .2s",
                display:"flex",alignItems:"center",justifyContent:"center",gap:14,
              }}>
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="1" y="4" width="20" height="15" rx="2" stroke="var(--paper)" strokeWidth="1.5"/><circle cx="11" cy="11.5" r="4" stroke="var(--paper)" strokeWidth="1.5"/><path d="M7 4l1.5-3h5L15 4" stroke="var(--paper)" strokeWidth="1.5" strokeLinejoin="round"/></svg>
                <div style={{textAlign:"left"}}>
                  <div style={{fontSize:13,color:"var(--paper)",fontFamily:"var(--mono)",letterSpacing:".1em",textTransform:"uppercase",marginBottom:2}}>Upload a photo</div>
                  <div style={{fontSize:10,color:"rgba(245,242,232,.55)",fontFamily:"var(--mono)"}}>iPhone camera · JPG · takes 5 seconds</div>
                </div>
              </button>
            )}

            {photoState === "loading" && (
              <div style={{padding:"32px",textAlign:"center",border:"2px solid var(--ink)",background:"var(--ink)"}}>
                <div className="vinyl-turn" style={{width:40,height:40,margin:"0 auto 16px"}}>
                  <svg width="40" height="40" viewBox="0 0 40 40">
                    <circle cx="20" cy="20" r="18" fill="none" stroke="rgba(245,242,232,.2)" strokeWidth="2"/>
                    <circle cx="20" cy="20" r="12" fill="none" stroke="rgba(245,242,232,.2)" strokeWidth="1"/>
                    <circle cx="20" cy="20" r="4" fill="var(--paper)" opacity=".4"/>
                    <circle cx="20" cy="20" r="2" fill="var(--paper)"/>
                  </svg>
                </div>
                <div style={{fontSize:11,color:"var(--paper)",fontFamily:"var(--mono)",letterSpacing:".1em",textTransform:"uppercase"}}>Reading your room...</div>
                <div style={{fontSize:9,color:"rgba(245,242,232,.5)",fontFamily:"var(--mono)",marginTop:6}}>Claude is analysing your photo</div>
              </div>
            )}

            {photoState === "done" && photoResult && (
              <div className="fu">
                {photoPreview && (
                  <div style={{marginBottom:12,position:"relative"}}>
                    <img src={photoPreview} alt="Your room" style={{width:"100%",maxHeight:220,objectFit:"cover",display:"block"}}/>
                    <div style={{position:"absolute",top:8,right:8,background:"var(--green)",color:"var(--paper)",fontSize:9,fontFamily:"var(--mono)",letterSpacing:".1em",textTransform:"uppercase",padding:"4px 10px"}}>✓ Read</div>
                  </div>
                )}
                <div style={{padding:"16px 18px",background:"var(--ink)",marginBottom:12}}>
                  <div style={{fontSize:9,color:"rgba(245,242,232,.5)",letterSpacing:".14em",textTransform:"uppercase",fontFamily:"var(--mono)",marginBottom:8}}>
                    Claude's assessment · {photoResult.confidence} confidence
                  </div>
                  <p style={{fontSize:13,color:"var(--paper)",fontFamily:"var(--serif)",lineHeight:1.65,marginBottom:photoResult.issues?.length>0?12:0}}>{photoResult.notes}</p>
                  {photoResult.issues?.length > 0 && (
                    <div style={{display:"grid",gap:6,paddingTop:10,borderTop:"1px solid rgba(245,242,232,.1)"}}>
                      {photoResult.issues.map((issue,i)=>(
                        <div key={i} style={{fontSize:12,color:"rgba(245,242,232,.7)",fontFamily:"var(--serif)",display:"flex",gap:8,alignItems:"flex-start"}}>
                          <span style={{color:"var(--amber)",flexShrink:0}}>→</span>{issue}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <button onClick={()=>{setPhotoState("idle");setPhotoResult(null);setPhotoPreview(null);}} style={{fontSize:9,color:"var(--ink4)",fontFamily:"var(--mono)",letterSpacing:".1em",textTransform:"uppercase",background:"none",border:"none",cursor:"pointer",textDecoration:"underline"}}>Upload a different photo</button>
              </div>
            )}

            {photoState === "error" && (
              <div style={{padding:"16px 18px",border:"1px solid var(--rule)",background:"var(--paper2)"}}>
                <div style={{fontSize:12,color:"var(--red)",fontFamily:"var(--serif)",marginBottom:6}}>Analysis failed — set the details manually below.</div>
                <div style={{fontSize:10,color:"var(--ink4)",fontFamily:"var(--mono)",lineHeight:1.6,marginBottom:10}}>This can happen on corporate networks, VPNs, or connections with strict security filtering. Your home or phone connection will work fine.</div>
                <button onClick={()=>{setPhotoState("idle");setPhotoPreview(null);}} style={{fontSize:9,color:"var(--ink3)",fontFamily:"var(--mono)",letterSpacing:".1em",textTransform:"uppercase",background:"none",border:"none",cursor:"pointer",textDecoration:"underline"}}>Try again</button>
              </div>
            )}

            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} style={{display:"none"}}/>
          </div>

          <div style={{height:1,background:"var(--rule)",marginBottom:28}}/>

          {/* ── Room size — now secondary, pre-filled by photo if available ── */}
          <div style={{marginBottom:28}}>
            <div style={{fontSize:9,color:"var(--ink4)",letterSpacing:".18em",textTransform:"uppercase",fontFamily:"var(--mono)",marginBottom:6}}>
              {photoState==="done"?"Room size — confirmed from photo, adjust if needed":"How big is your listening room?"}
            </div>
            {photoState!=="done"&&<p style={{fontSize:12,color:"var(--ink4)",fontFamily:"var(--mono)",lineHeight:1.5,marginBottom:14}}>Or skip the photo and select manually:</p>}
            <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8}}>
              {ROOM_SIZES.map(size => {
                const active = activeSize.id === size.id;
                return (
                  <button key={size.id} onClick={()=>selectSize(size)} style={{
                    padding:"20px 18px",textAlign:"left",cursor:"pointer",
                    border:`2px solid ${active?"var(--ink)":"var(--rule)"}`,
                    background:active?"var(--ink)":"var(--paper2)",
                    transition:"all .2s",
                  }}>
                    <div style={{fontFamily:"var(--serif)",fontSize:"clamp(18px,3vw,22px)",color:active?"var(--paper)":"var(--ink)",lineHeight:1,marginBottom:5}}>{size.label}</div>
                    <div style={{fontSize:10,color:active?"rgba(245,242,232,.7)":"var(--ink4)",fontFamily:"var(--mono)",marginBottom:8,letterSpacing:".04em"}}>{size.sub}</div>
                    <div style={{fontSize:9,color:active?"rgba(245,242,232,.5)":"var(--ink4)",fontFamily:"var(--mono)"}}>{size.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Real-time consequences ────────────────────────────────── */}
          {activeSize && (
            <div className="fu" style={{marginBottom:28,padding:"16px 20px",background:"var(--paper2)",borderLeft:"3px solid var(--ink)"}}>
              <div style={{fontSize:9,color:"var(--ink4)",letterSpacing:".16em",textTransform:"uppercase",fontFamily:"var(--mono)",marginBottom:10}}>What this means for your system</div>
              <p style={{fontFamily:"var(--serif)",fontSize:14,color:"var(--ink2)",lineHeight:1.65,marginBottom:consequences.length>1?10:0}}>{activeSize.speakerHint}</p>
              {consequences.length > 0 && (
                <div style={{display:"grid",gap:6,marginTop:8,paddingTop:10,borderTop:"1px solid var(--rule)"}}>
                  {consequences.map((c,i)=>(
                    <div key={i} style={{display:"flex",alignItems:"flex-start",gap:10}}>
                      <span style={{fontSize:14,lineHeight:1,flexShrink:0,marginTop:1}}>{c.icon}</span>
                      <span style={{fontSize:12,color:"var(--ink2)",fontFamily:"var(--serif)",lineHeight:1.5}}>{c.text}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Step 3: Floor + Wall ──────────────────────────────────── */}
          <div style={{marginBottom:24}}>
            <div style={{fontSize:9,color:"var(--ink4)",letterSpacing:".18em",textTransform:"uppercase",fontFamily:"var(--mono)",marginBottom:14}}>
              Surfaces {photoState==="done"?"— auto-filled from photo, adjust if needed":""}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <div>
                <div style={{fontSize:9,color:"var(--ink4)",letterSpacing:".12em",textTransform:"uppercase",fontFamily:"var(--mono)",marginBottom:8}}>Floor</div>
                <div style={{display:"flex",flexDirection:"column",border:"1px solid var(--rule)"}}>
                  {[{value:"carpet",label:"Carpet"},{value:"wood",label:"Hardwood"},{value:"tile",label:"Tile / Stone"}].map((o,i)=>{
                    const sel=floorTypes.includes(o.value);
                    return <button key={o.value} onClick={()=>toggleFloor(o.value)} style={{padding:"12px 14px",fontSize:12,cursor:"pointer",fontFamily:"var(--serif)",background:sel?"var(--ink)":"transparent",color:sel?"var(--paper)":"var(--ink2)",border:"none",borderTop:i>0?"1px solid var(--rule)":"none",textAlign:"left",transition:"all .15s",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      {o.label}
                      {sel&&<svg width="10" height="8" viewBox="0 0 10 8" fill="none"><polyline points="1,4 3.5,6.5 9,1" stroke="var(--paper)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    </button>;
                  })}
                </div>
              </div>
              <div>
                <div style={{fontSize:9,color:"var(--ink4)",letterSpacing:".12em",textTransform:"uppercase",fontFamily:"var(--mono)",marginBottom:8}}>Walls</div>
                <div style={{display:"flex",flexDirection:"column",border:"1px solid var(--rule)"}}>
                  {loc.wallMaterials.map((o,i)=>{
                    const sel=wallMaterials.includes(o.value);
                    return <button key={o.value} onClick={()=>toggleWall(o.value)} style={{padding:"12px 14px",fontSize:12,cursor:"pointer",fontFamily:"var(--serif)",background:sel?"var(--ink)":"transparent",color:sel?"var(--paper)":"var(--ink2)",border:"none",borderTop:i>0?"1px solid var(--rule)":"none",textAlign:"left",transition:"all .15s",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      {o.label}
                      {sel&&<svg width="10" height="8" viewBox="0 0 10 8" fill="none"><polyline points="1,4 3.5,6.5 9,1" stroke="var(--paper)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    </button>;
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* ── Step 4: Mounting ──────────────────────────────────────── */}
          <div style={{marginBottom:24}}>
            <div style={{fontSize:9,color:"var(--ink4)",letterSpacing:".18em",textTransform:"uppercase",fontFamily:"var(--mono)",marginBottom:14}}>Where will your equipment live?</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
              {MOUNT_OPTS.map(m=>{
                const active=mounting===m.id;
                return (
                  <button key={m.id} onClick={()=>setMounting(m.id)} style={{padding:"18px 12px",textAlign:"center",cursor:"pointer",border:`2px solid ${active?"var(--ink)":"var(--rule)"}`,background:active?"var(--ink)":"var(--paper2)",transition:"all .2s"}}>
                    <div style={{marginBottom:10,color:active?"var(--paper)":"var(--ink3)",display:"flex",justifyContent:"center"}}>{m.icon}</div>
                    <div style={{fontSize:13,fontFamily:"var(--serif)",color:active?"var(--paper)":"var(--ink2)",marginBottom:3}}>{m.label}</div>
                    <div style={{fontSize:8,color:active?"rgba(245,242,232,.6)":"var(--ink4)",letterSpacing:".06em",fontFamily:"var(--mono)"}}>{m.sub}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Speaker to side wall ──────────────────────────────────── */}
          <div style={{marginBottom:8}}>
            <div style={{fontSize:9,color:"var(--ink4)",letterSpacing:".18em",textTransform:"uppercase",fontFamily:"var(--mono)",marginBottom:14}}>How much space to the side wall?</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
              {[{id:"tight",label:"Tight",sub:"Under 30cm",val:20,warn:true},{id:"normal",label:"Normal",sub:"30–60cm",val:45,warn:false},{id:"generous",label:"Generous",sub:"Over 60cm",val:75,warn:false}].map(opt=>{
                const active = opt.id==="tight"?sideWallGap<30:opt.id==="normal"?sideWallGap>=30&&sideWallGap<60:sideWallGap>=60;
                return (
                  <button key={opt.id} onClick={()=>setSideWallGap(opt.val)} style={{padding:"16px 12px",textAlign:"center",cursor:"pointer",border:`2px solid ${active?opt.warn?"var(--red)":"var(--ink)":"var(--rule)"}`,background:active?opt.warn?"rgba(139,32,32,.06)":"var(--ink)":"var(--paper2)",transition:"all .2s"}}>
                    <div style={{fontFamily:"var(--serif)",fontSize:16,color:active?opt.warn?"var(--red)":"var(--paper)":"var(--ink2)",marginBottom:3}}>{opt.label}</div>
                    <div style={{fontSize:9,color:active?opt.warn?"var(--red)":"rgba(245,242,232,.6)":"var(--ink4)",fontFamily:"var(--mono)",letterSpacing:".04em"}}>{opt.sub}</div>
                  </button>
                );
              })}
            </div>
            {sideWallGap<30&&(
              <div className="fu" style={{marginTop:10,padding:"10px 14px",borderLeft:"3px solid var(--red)",background:"rgba(139,32,32,.04)"}}>
                <p style={{fontSize:12,color:"var(--red)",fontFamily:"var(--serif)"}}>Tight side wall — avoid rear-ported speakers. Front-ported or sealed cabinet only.</p>
              </div>
            )}
          </div>

          <NavRow onBack={()=>goTo("materials")} onNext={()=>{if(analysis.tierRec)setTier(analysis.tierRec);advance("room","genres");}}/>
        </div>
      );
    })(),

    furniture: null,

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
          <NavRow onBack={()=>goTo("room")} onNext={()=>advance("genres","tier")} nextLabel="Continue to System Brief →"/>
        </div>
      </div>
    ),

    tier: (
      <div>
        <StepHeading title="System Brief"/>
        <div style={{marginBottom:24,padding:"16px 18px",background:"var(--paper2)",border:"1px solid var(--rule)"}}>
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

        {/* ── Foundation vs Expression bias slider ── */}
        <div style={{marginBottom:28,padding:"24px 20px",background:"var(--paper2)",border:"2px solid var(--ink)"}}>
          <div style={{fontSize:9,color:"var(--ink4)",letterSpacing:".2em",textTransform:"uppercase",fontFamily:"var(--mono)",marginBottom:16}}>
            Where do you want to spend your money? — drag to choose
          </div>

          {/* The two poles */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:20}}>
            <div style={{opacity:bias<=50?1:0.45,transition:"opacity .3s"}}>
              <div style={{fontFamily:"var(--serif)",fontSize:"clamp(18px,4vw,24px)",color:bias<50?"var(--ink)":"var(--ink3)",lineHeight:1,marginBottom:6,transition:"color .3s"}}>Foundation</div>
              <p style={{fontSize:11,color:"var(--ink3)",fontFamily:"var(--serif)",lineHeight:1.6,fontStyle:"italic"}}>Invest in the source. The turntable and cartridge retrieve every detail from the groove. Speakers tell you what's there — honestly, accurately.</p>
            </div>
            <div style={{textAlign:"right",opacity:bias>=50?1:0.45,transition:"opacity .3s"}}>
              <div style={{fontFamily:"var(--serif)",fontSize:"clamp(18px,4vw,24px)",color:bias>50?"var(--ink)":"var(--ink3)",lineHeight:1,marginBottom:6,transition:"color .3s"}}>Expression</div>
              <p style={{fontSize:11,color:"var(--ink3)",fontFamily:"var(--serif)",lineHeight:1.6,fontStyle:"italic"}}>Invest in the speakers. Music fills the room with scale and presence. You feel the performance — the source is faithful enough to let it happen.</p>
            </div>
          </div>

          {/* Slider — visually obvious */}
          <div style={{position:"relative",marginBottom:4}}>
            <div style={{fontSize:8,color:"var(--ink4)",fontFamily:"var(--mono)",letterSpacing:".1em",textAlign:"center",marginBottom:8}}>← drag to shift your budget priority →</div>
            <input type="range" min={0} max={100} step={1} value={bias} onChange={e=>setBias(Number(e.target.value))}
              style={{width:"100%",background:`linear-gradient(to right, var(--ink) 0%, var(--ink) ${bias}%, var(--rule) ${bias}%, var(--rule) 100%)`}}/>
            {/* Position labels */}
            <div style={{display:"flex",justifyContent:"space-between",marginTop:6}}>
              <span style={{fontSize:8,color:"var(--ink4)",fontFamily:"var(--mono)",letterSpacing:".1em"}}>All source</span>
              <span style={{fontSize:8,color:"var(--ink4)",fontFamily:"var(--mono)",letterSpacing:".1em"}}>Balanced</span>
              <span style={{fontSize:8,color:"var(--ink4)",fontFamily:"var(--mono)",letterSpacing:".1em"}}>All speakers</span>
            </div>
          </div>

          {/* Dynamic description */}
          <div className="fi" style={{marginTop:16,padding:"14px 16px",background:"var(--paper)",borderLeft:`3px solid ${bias<35?"var(--amber)":bias>65?"var(--amber)":"var(--ink)"}`}}>
            <p style={{fontSize:13,color:"var(--ink2)",fontFamily:"var(--serif)",lineHeight:1.65,fontStyle:"italic"}}>
              {bias < 15
                ? "Strong Foundation bias. Most of your budget goes to the turntable and cartridge. You'll hear every micro-detail the record contains — instruments have texture, space, and body. Your speakers will be honest rather than spectacular."
                : bias < 35
                ? "Foundation lean. Your source will be a genuine step above your speakers — a deliberate choice that rewards careful listening. Upgrade the speakers first when budget allows."
                : bias < 65
                ? "Balanced. Budget splits roughly evenly between source and speakers. The most common approach — no obvious weak link, no obvious strength. A solid platform to build from."
                : bias < 85
                ? "Expression lean. Your speakers will be a step above your source — music has scale and presence in the room. Upgrade the turntable first when budget allows."
                : "Strong Expression bias. Most of your budget goes to the speakers. Music fills your space — you feel the performance. The source is capable and honest, but the speakers are the statement."}
            </p>
            {budget > 0 && (()=>{
              const sourcePct = bias < 50 ? 0.45 - (bias/50)*0.15 : 0.30 - ((bias-50)/50)*0.10;
              const speakerPct = bias < 50 ? 0.25 + (bias/50)*0.05 : 0.30 + ((bias-50)/50)*0.15;
              const sourceBudget = Math.round(budget * sourcePct / 50) * 50;
              const speakerBudget = Math.round(budget * speakerPct / 50) * 50;
              return (
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:12,paddingTop:12,borderTop:"1px solid var(--rule)"}}>
                  {[{l:"Source budget",v:formatPrice(sourceBudget,loc)},{l:"Speaker budget",v:formatPrice(speakerBudget,loc)}].map(m=>(
                    <div key={m.l} style={{textAlign:"center"}}>
                      <div style={{fontSize:8,color:"var(--ink4)",letterSpacing:".12em",textTransform:"uppercase",fontFamily:"var(--mono)",marginBottom:3}}>{m.l}</div>
                      <div style={{fontFamily:"var(--serif)",fontSize:18,color:"var(--amber)"}}>{m.v}</div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>

        <SectionLabel>System Level</SectionLabel>
        {analysis.tierRec&&<InfoBanner msg={`Based on your room (${analysis.area} m²), the ${analysis.tierRec==="entry"?"Entry Level":analysis.tierRec==="mid"?"Mid-Range":"High-End"} system level is a strong match. (${loc.tierRanges[analysis.tierRec]})`}/>}
        {/* Step-up prompt — when budget exceeds current tier ceiling */}
        {budget>0&&tier==="entry"&&budget>5000&&(
          <div style={{marginBottom:16,padding:"14px 16px",borderLeft:"3px solid var(--green)",background:"rgba(42,80,64,.06)"}}>
            <p style={{fontSize:13,color:"var(--ink2)",fontFamily:"var(--serif)",lineHeight:1.65}}>Your budget of {formatPrice(budget,loc)} comfortably covers the <strong>Mid-Range</strong> tier — consider stepping up for significantly better components.</p>
          </div>
        )}
        {budget>0&&tier==="mid"&&budget>15000&&(
          <div style={{marginBottom:16,padding:"14px 16px",borderLeft:"3px solid var(--green)",background:"rgba(42,80,64,.06)"}}>
            <p style={{fontSize:13,color:"var(--ink2)",fontFamily:"var(--serif)",lineHeight:1.65}}>Your budget of {formatPrice(budget,loc)} puts you into <strong>High-End</strong> territory — consider stepping up for reference-level components.</p>
          </div>
        )}
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
            const DESCS={
              entry:"Excellent entry into high-fidelity vinyl replay. All components are purpose-built for music.",
              mid:"The sweet spot for diminishing returns. Components at this level are sonically mature.",
              high:"Reference-level performance. At this level the differences between components are real but increasingly subtle — and increasingly personal. A specialist dealer who knows your ears and your room becomes essential."
            };
            return (
              <button key={t.tier} onClick={()=>setTier(t.tier)} style={{padding:"18px 20px",textAlign:"left",cursor:"pointer",border:`1px solid ${active?t.accent+"60":rec?t.accent+"30":"var(--rule)"}`,background:active?`${t.accent}0E`:"var(--paper2)",transition:"all .25s"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}><span style={{fontFamily:"var(--serif)",fontSize:20,color:active?t.accent:"var(--ink2)"}}>{t.label==="Entry"?"Entry Level":t.label==="Mid"?"Mid-Range":"High-End"}</span>{rec&&<Tag col="#2A5040">Room Match</Tag>}{active&&<Tag col={t.accent}>Selected</Tag>}</div>
                </div>
                <div style={{fontSize:11,color:active?"var(--ink2)":"var(--ink4)",lineHeight:1.6}}>{DESCS[t.tier]}</div>
                {active&&<div style={{marginTop:8,fontSize:10,color:t.accent,letterSpacing:".08em",fontFamily:"var(--mono)"}}>Specific brand recommendations appear in the next step →</div>}
              </button>
            );
          })}
        </div>

        {/* ── High tier dealer advisory ── */}
        {tier==="high"&&(
          <div className="fu" style={{marginTop:4,marginBottom:4,padding:"20px 22px",background:"var(--ink)"}}>
            <div style={{fontSize:9,color:"rgba(245,242,232,.4)",letterSpacing:".2em",textTransform:"uppercase",fontFamily:"var(--mono)",marginBottom:10}}>A note on reference-level systems</div>
            <p style={{fontFamily:"var(--serif)",fontSize:14,color:"var(--paper)",lineHeight:1.75,marginBottom:12}}>
              This tool will give you an excellent starting point. But at the high-end, the right system is deeply personal — your room, your ears, your music, and the synergies between specific components at this level can only truly be assessed through extended listening.
            </p>
            <p style={{fontFamily:"var(--serif)",fontSize:13,color:"rgba(245,242,232,.65)",lineHeight:1.7,fontStyle:"italic"}}>
              A specialist independent dealer — Signals, Cymbiosis, Loud & Clear, Moorgate Acoustics, KJ West One, or similar — will demo components in your price range, sometimes loan equipment home, and bring years of experience matching specific combinations. That relationship is irreplaceable at this level. Use this tool to arrive informed. Use a dealer to arrive at the right system.
            </p>
          </div>
        )}
        <NavRow onBack={()=>goTo("genres")} onNext={()=>advance("tier","catalog")} nextLabel="See Component Recommendations →"/>
      </div>
    ),

    catalog: (()=>{
      // ── Signal chain definition ─────────────────────────────────────────────
      const SIGNAL_CHAIN = ["turntable","cartridge","phono","amplifier","speakers","cables","isolation","power"];
      const chainSteps = SIGNAL_CHAIN.filter(k => tierData.components[k]);

      // ── Auto-skip logic ─────────────────────────────────────────────────────
      function shouldSkip(catKey) {
        if (catKey === "cartridge") {
          // Skip if turntable has bundled cart and user hasn't explicitly chosen one
          const selTT = basket.find(b=>b.cat==="turntable");
          if (selTT && BUNDLED_CARTRIDGES[selTT.id] && !basket.find(b=>b.cat==="cartridge")) return {
            skip: true,
            msg: `Your ${selTT.name} includes the ${BUNDLED_CARTRIDGES[selTT.id].name} cartridge. No separate purchase needed.`
          };
        }
        if (catKey === "phono") {
          const selAmp = basket.find(b=>b.cat==="amplifier");
          if (selAmp && AMPS_WITH_PHONO.has(selAmp.id)) return {
            skip: true,
            msg: `Your ${selAmp.name} has a built-in MM phono stage. No separate phono stage needed.`
          };
        }
        return { skip: false };
      }

      // ── Scored + filtered options for a category ───────────────────────────
      function getScoredOpts(catKey) {
        const rawOpts = tierData.components[catKey] || [];
        const genreScore = (item) => {
          if (catKey==="speakers" && genreAdj.speakers[item.vendor]) return genreAdj.speakers[item.vendor];
          if (catKey==="amplifier" && genreAdj.amps[item.vendor]) return genreAdj.amps[item.vendor];
          return 0;
        };

        // ── Bias score — source components rank higher with Foundation bias, speakers with Expression ──
        const biasScore = (item) => {
          const foundationCats = ["turntable","cartridge","phono"];
          const expressionCats = ["speakers"];
          if (foundationCats.includes(catKey)) {
            // Foundation bias (low bias value) boosts source components
            return Math.round((50 - bias) / 5); // +10 at bias=0, 0 at bias=50, -10 at bias=100
          }
          if (expressionCats.includes(catKey)) {
            // Expression bias (high bias value) boosts speakers
            return Math.round((bias - 50) / 5); // -10 at bias=0, 0 at bias=50, +10 at bias=100
          }
          return 0;
        };

        // ── Budget slice per category based on bias ──
        const budgetOk = (item) => {
          if (!budget || budget === 0) return true;
          // Calculate category budget slice based on bias
          const sourcePct = bias < 50 ? 0.45 - (bias/50)*0.15 : 0.30 - ((bias-50)/50)*0.10;
          const speakerPct = bias < 50 ? 0.25 + (bias/50)*0.05 : 0.30 + ((bias-50)/50)*0.15;
          const slices = { turntable:sourcePct*0.6, cartridge:sourcePct*0.25, phono:sourcePct*0.15, amplifier:0.25, speakers:speakerPct, cables:0.05, isolation:0.05, power:0.03 };
          const slice = slices[catKey] || 0.1;
          const catBudget = budget * slice * 1.3; // 30% tolerance
          return item.price <= catBudget || item.price === 0;
        };
        const selCart = basket.find(b=>b.cat==="cartridge");
        const phonoScore = (item) => {
          if (catKey!=="phono" || !selCart) return 0;
          const cartIsMC = (selCart.sub||"").toLowerCase().includes("moving coil") || (selCart.sub||"").toLowerCase().includes(" mc ");
          const stageMC  = (item.sub||"").toLowerCase().includes(" mc") || (item.note||"").toLowerCase().includes("moving coil");
          const stageMM  = (item.sub||"").toLowerCase().includes(" mm") || (item.note||"").toLowerCase().includes("moving magnet") || item.id==="e_builtin" || item.id==="m_builtin";
          if (cartIsMC && stageMC) return 10;
          if (!cartIsMC && stageMM) return 10;
          return 0;
        };
        let scored = rawOpts
          .filter(budgetOk)
          .filter(item => charFilter === "all" || !item.character || item.character === charFilter)
          .map(item => {
            // Heavy penalty for items over the category budget slice
            const sourcePct = bias < 50 ? 0.45 - (bias/50)*0.15 : 0.30 - ((bias-50)/50)*0.10;
            const speakerPct = bias < 50 ? 0.25 + (bias/50)*0.05 : 0.30 + ((bias-50)/50)*0.15;
            const slices = { turntable:sourcePct*0.6, cartridge:sourcePct*0.25, phono:sourcePct*0.15, amplifier:0.25, speakers:speakerPct, cables:0.05, isolation:0.05, power:0.03 };
            const slice = slices[catKey] || 0.1;
            const catBudget = budget > 0 ? budget * slice : 99999;
            const overBudgetPenalty = (budget > 0 && item.price > catBudget) ? -20 : 0;
            return { item, score: genreScore(item) + phonoScore(item) + biasScore(item) + overBudgetPenalty };
          })
          .sort((a,b) => b.score - a.score);
        if (scored.length === 0) scored = rawOpts.map(item => ({ item, score: 0 }));
        return scored.map(s => s.item);
      }

      const currentCatKey = chainSteps[chainStep] || chainSteps[0];
      const skipInfo = shouldSkip(currentCatKey);
      const scoredOpts = getScoredOpts(currentCatKey);
      const displayOpts = (showAllCat[currentCatKey] ? scoredOpts : scoredOpts.slice(0,3));
      const hasMore = scoredOpts.length > 3;
      const selInCurrent = basket.find(b => (tierData.components[currentCatKey]||[]).some(o=>o.id===b.id));
      const budgetRemaining = budget > 0 ? budget - basketTotal : null;
      const isLastStep = chainStep >= chainSteps.length - 1;

      // Auto-advance when skip fires
      useEffect(() => {
        if (skipInfo.skip) {
          const t = setTimeout(() => {
            if (chainStep < chainSteps.length - 1) setChainStep(s => s + 1);
          }, 2200);
          return () => clearTimeout(t);
        }
      }, [currentCatKey, skipInfo.skip]);

      return (
        <div>
          {/* ── Progress bar across signal chain ─────────────────────────── */}
          <div style={{marginBottom:20}}>
            <div style={{display:"flex",gap:0,marginBottom:8}}>
              {chainSteps.map((k,i) => {
                const done = i < chainStep || basket.find(b=>(tierData.components[k]||[]).some(o=>o.id===b.id));
                const active = i === chainStep;
                const v = basket.find(b=>(tierData.components[k]||[]).some(o=>o.id===b.id));
                const col = v ? (VENDORS[v.vendor]||VENDORS.generic).col : tierData.accent;
                return (
                  <button key={k} onClick={()=>i<chainStep&&setChainStep(i)}
                    style={{flex:1,height:3,background:done?col:active?"var(--rule)":"var(--rule)",opacity:active?1:done?0.9:0.3,border:"none",cursor:i<chainStep?"pointer":"default",transition:"all .3s",marginRight:i<chainSteps.length-1?2:0}}/>
                );
              })}
            </div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:9,color:"var(--ink4)",fontFamily:"var(--mono)",letterSpacing:".12em",textTransform:"uppercase"}}>{chainStep+1} of {chainSteps.length} — {CAT_LABELS[currentCatKey]}</span>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                {basket.length>=3&&(
                  <span style={{fontSize:9,color:synergyMeta(synergy).col,fontFamily:"var(--mono)",letterSpacing:".08em"}}>{synergy} synergy</span>
                )}
                <span style={{fontFamily:"var(--serif)",fontSize:16,color:budget>0&&basketTotal>budget?"#8B2020":"var(--ink)"}}>{basketTotal>0?formatPrice(basketTotal,loc):"—"}</span>
                {budgetRemaining!==null&&<span style={{fontSize:9,color:budgetRemaining<0?"#8B2020":"#2A5040",fontFamily:"var(--mono)"}}>{budgetRemaining<0?`${formatPrice(Math.abs(budgetRemaining),loc)} over`:`${formatPrice(budgetRemaining,loc)} left`}</span>}
              </div>
            </div>
          </div>

          {/* ── Auto-skip banner ─────────────────────────────────────────── */}
          {skipInfo.skip ? (
            <div className="fu" style={{padding:"24px 20px",borderLeft:"3px solid var(--green)",background:"rgba(42,80,64,.06)",marginBottom:20}}>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:8}}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="#2A5040" strokeWidth="1.2"/><polyline points="4.5,8 7,10.5 11.5,5.5" stroke="#2A5040" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <span style={{fontSize:9,color:"var(--green)",letterSpacing:".16em",textTransform:"uppercase",fontFamily:"var(--mono)"}}>Skipping — {CAT_LABELS[currentCatKey]}</span>
              </div>
              <p style={{fontSize:13,color:"var(--ink2)",fontFamily:"var(--serif)",lineHeight:1.7}}>{skipInfo.msg}</p>
              <div style={{marginTop:12,height:2,background:"var(--rule)",position:"relative",overflow:"hidden"}}>
                <div style={{position:"absolute",left:0,top:0,height:"100%",background:"var(--green)",animation:"slideRight 2.2s linear forwards"}}/>
              </div>
              <style>{`@keyframes slideRight{from{width:0}to{width:100%}}`}</style>
            </div>
          ) : (
            <div className="fu">
              {/* ── Category heading ───────────────────────────────────────── */}
              <div style={{marginBottom:20,paddingBottom:16,borderBottom:"1px solid var(--rule)"}}>
                <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
                  <CatIcon cat={currentCatKey} size={18} col={tierData.accent}/>
                  <h2 style={{fontFamily:"var(--serif)",fontSize:"clamp(22px,4vw,28px)",fontWeight:400,color:"var(--ink)",lineHeight:1,letterSpacing:"-.02em"}}>{CAT_LABELS[currentCatKey]}</h2>
                </div>

                {/* ── Character filter tabs ── */}
                <div style={{display:"flex",gap:0,marginBottom:14,border:"1px solid var(--rule)"}}>
                  {[
                    {id:"all",      label:"All"},
                    {id:"warm",     label:"🎷 Warm & Musical"},
                    {id:"balanced", label:"⚖ Balanced"},
                    {id:"detailed", label:"🔬 Detailed"},
                  ].map((c,i)=>{
                    const active = charFilter===c.id;
                    return (
                      <button key={c.id} onClick={()=>setCharFilter(c.id)} style={{
                        flex:1,padding:"8px 4px",fontSize:9,cursor:"pointer",
                        fontFamily:"var(--mono)",letterSpacing:".06em",
                        background:active?"var(--ink)":"transparent",
                        color:active?"var(--paper)":"var(--ink4)",
                        border:"none",borderLeft:i>0?"1px solid var(--rule)":"none",
                        transition:"all .15s",whiteSpace:"nowrap",overflow:"hidden",
                      }}>
                        {c.label}
                      </button>
                    );
                  })}
                </div>

                {/* ── Synergy line — what pairs well with what's already selected ── */}
                {(()=>{
                  const selTT  = basket.find(b=>b.cat==="turntable");
                  const selAmp = basket.find(b=>b.cat==="amplifier");
                  const selSpk = basket.find(b=>b.cat==="speakers");
                  const ttV  = selTT  ? (VENDORS[selTT.vendor]||VENDORS.generic)  : null;
                  const ampV = selAmp ? (VENDORS[selAmp.vendor]||VENDORS.generic) : null;

                  // Synergy suggestions based on what's selected
                  const SYNERGY_HINTS = {
                    amplifier: {
                      rega:     "Rega amplification — Elicit or Aethos — is the natural partner. Exposure and Sugden also work beautifully.",
                      linn:     "Linn's own DSM streaming pre-amps are the natural partner. Naim amplification also has a strong history with Linn sources.",
                      roksan:   "Roksan's own XA-8200R integrates well. Exposure and Audiolab also pair naturally with Roksan sources.",
                      clearaudio:"Musical Fidelity and Chord Electronics pair naturally with Clearaudio's analytical character.",
                    },
                    speakers: {
                      rega:     "Rega's own Kyte speakers are a natural match. Spendor, ProAc and Harbeth all work well with Rega amplification.",
                      naim:     "Naim has a long history with Harbeth, ProAc, and Kudos speakers. Focal also has a close relationship with Naim.",
                      sugden:   "Sugden Class A amplification is legendary with Harbeth — particularly the P3ESR, C30 and 40.3 XD.",
                      exposure: "Exposure works particularly well with Spendor and ProAc speakers — a classic British combination.",
                      linn:     "Linn's own Akubarik and Akudorik active speakers are the natural choice. Kudos Titan series also has a strong Linn connection.",
                    },
                  };

                  let hint = null;
                  if (currentCatKey==="amplifier" && selTT && ttV && SYNERGY_HINTS.amplifier[selTT.vendor]) {
                    hint = `You chose the ${selTT.name}. ${SYNERGY_HINTS.amplifier[selTT.vendor]}`;
                  } else if (currentCatKey==="speakers" && selAmp && ampV && SYNERGY_HINTS.speakers[selAmp.vendor]) {
                    hint = `You chose the ${selAmp.name}. ${SYNERGY_HINTS.speakers[selAmp.vendor]}`;
                  }

                  return hint ? (
                    <div style={{padding:"10px 14px",borderLeft:"3px solid var(--amber)",background:"rgba(196,98,26,.05)",marginBottom:8}}>
                      <p style={{fontSize:12,color:"var(--ink2)",fontFamily:"var(--serif)",lineHeight:1.65,fontStyle:"italic"}}>{hint}</p>
                    </div>
                  ) : null;
                })()}

                {/* Bias context */}
                {currentCatKey==="turntable"&&(
                  <p style={{fontSize:11,color:"var(--ink4)",fontFamily:"var(--mono)",lineHeight:1.6}}>
                    {bias<35?"Foundation bias — picks weighted toward source quality.":bias>65?"Expression bias — calibrated to leave more budget for speakers.":"Balanced — source and speaker budget split evenly."}
                  </p>
                )}
                {currentCatKey==="speakers"&&bias!==50&&(
                  <p style={{fontSize:11,color:"var(--ink4)",fontFamily:"var(--mono)",lineHeight:1.6}}>
                    {bias>65?"Expression bias — these are the statement piece of your system.":"Foundation bias — honest speakers that don't colour the music."}
                  </p>
                )}

                {/* Context sentence based on what's already selected */}
                {currentCatKey==="cartridge"&&basket.find(b=>b.cat==="turntable")&&(
                  <p style={{fontSize:12,color:"var(--ink3)",fontFamily:"var(--serif)",fontStyle:"italic",lineHeight:1.6}}>
                    Your <strong style={{color:"var(--ink2)",fontStyle:"normal"}}>{basket.find(b=>b.cat==="turntable").name}</strong> {REQUIRES_CARTRIDGE.has(basket.find(b=>b.cat==="turntable").id)?"needs a cartridge — choose one below.":"comes without a fitted cartridge — choose one below, or skip if you have one already."}
                  </p>
                )}

                {/* ── FIX: Phono step — Linn Kandid/Krystal compatibility warning ── */}
                {currentCatKey==="phono"&&(()=>{
                  const cart = basket.find(b=>b.cat==="cartridge");
                  const tt = basket.find(b=>b.cat==="turntable");
                  const bundled = tt ? BUNDLED_CARTRIDGES[tt.id] : null;
                  const cartId = cart?.id || (bundled ? `${tt.id}_cart` : null);
                  const isLinnCart = bundled && (tt?.id?.includes("lp12")) && (bundled.type==="MC");
                  const isMC = cart ? ((cart.sub||"").toLowerCase().includes("moving coil")||(cart.sub||"").toLowerCase().includes(" mc ")) : (bundled?.type==="MC");
                  return (
                    <div style={{display:"grid",gap:8}}>
                      {isLinnCart&&(
                        <div style={{padding:"12px 14px",borderLeft:"3px solid var(--amber)",background:"rgba(196,98,26,.06)"}}>
                          <p style={{fontSize:12,color:"var(--ink2)",fontFamily:"var(--serif)",lineHeight:1.65}}>
                            <strong>Linn Kandid / Krystal note:</strong> These cartridges are designed for the Linn Urika II — a phono stage that mounts inside the LP12 itself. Choosing a non-Linn external phono stage is possible but sacrifices the internal mounting advantage and is not recommended by Linn.
                          </p>
                        </div>
                      )}
                      {cart&&<p style={{fontSize:12,color:"var(--ink3)",fontFamily:"var(--serif)",fontStyle:"italic",lineHeight:1.6}}>Your <strong style={{color:"var(--ink2)",fontStyle:"normal"}}>{cart.name}</strong> is a Moving {isMC?"Coil — you need a dedicated MC phono stage.":"Magnet — a built-in MM stage or a dedicated MM stage will work."}</p>}
                      {!cart&&bundled&&<p style={{fontSize:12,color:"var(--ink3)",fontFamily:"var(--serif)",fontStyle:"italic",lineHeight:1.6}}>Your bundled <strong style={{color:"var(--ink2)",fontStyle:"normal"}}>{bundled.name}</strong> is a Moving {bundled.type==="MC"?"Coil — you need a dedicated MC phono stage.":"Magnet — a built-in MM stage will work."}</p>}
                    </div>
                  );
                })()}

                {/* ── FIX: Amplifier step — Naim DIN warning if non-DIN phono selected ── */}
                {currentCatKey==="amplifier"&&(()=>{
                  const selPhono = basket.find(b=>b.cat==="phono");
                  const phonoIsRCA = selPhono && RCA_PHONO_STAGES.has(selPhono.id);
                  return (
                    <div style={{display:"grid",gap:8}}>
                      <p style={{fontSize:12,color:"var(--ink3)",fontFamily:"var(--serif)",fontStyle:"italic",lineHeight:1.6}}>
                        Room is {analysis.area} m² — {analysis.area>25?"80W+ recommended for adequate headroom.":analysis.area<12?"30–50W is sufficient for this space.":"50–80W will give comfortable headroom."}
                      </p>
                      {phonoIsRCA&&(
                        <div style={{padding:"12px 14px",borderLeft:"3px solid var(--amber)",background:"rgba(196,98,26,.06)"}}>
                          <p style={{fontSize:12,color:"var(--ink2)",fontFamily:"var(--serif)",lineHeight:1.65}}>
                            <strong>Naim interconnect note:</strong> Your phono stage uses RCA connectors. Naim amplifiers use DIN sockets — if you choose a Naim amp you will need an RCA-to-DIN adaptor cable. This works but can introduce earth loop issues. A non-Naim amp avoids this.
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* ── FIX: Speakers step — amp power warning ── */}
                {currentCatKey==="speakers"&&(()=>{
                  const selAmp = basket.find(b=>b.cat==="amplifier");
                  const ampW = selAmp ? (AMP_POWER_WATTS[selAmp.id] || 999) : 999;
                  const isClassA = selAmp && (selAmp.sub||"").toLowerCase().includes("class a");
                  return (
                    <div style={{display:"grid",gap:8}}>
                      {selAmp&&(
                        <p style={{fontSize:12,color:"var(--ink3)",fontFamily:"var(--serif)",fontStyle:"italic",lineHeight:1.6}}>
                          Your <strong style={{color:"var(--ink2)",fontStyle:"normal"}}>{selAmp.name}</strong> delivers {ampW}W{isClassA?" Class A — these are real watts, not derated. Sugden Class A amplifiers drive even demanding loads with authority.":""}. {ampW<50?"Best matched with efficient standmounts (88dB+).":ampW<100?"Works well with most standmounts and compact floorstanders.":"Sufficient power for most speakers including ATC passive monitors."}
                        </p>
                      )}
                      {sideWallGap<30&&(
                        <p style={{fontSize:12,color:"var(--red)",fontFamily:"var(--serif)",lineHeight:1.6}}>⚠ Only {sideWallGap}cm from side wall — rear-ported designs will cause bass boom. Front-ported or sealed only.</p>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* ── Options ────────────────────────────────────────────────── */}
              <div style={{display:"grid",gap:10,marginBottom:16}}>
                {displayOpts.map((item,i) => {
                  const on = isSelected(item);
                  const iv = VENDORS[item.vendor] || VENDORS.generic;
                  const matchedGenres = GENRES.filter(g=>selectedGenres.includes(g.id)&&((currentCatKey==="speakers"&&g.speakerWeights[item.vendor])||(currentCatKey==="amplifier"&&g.ampWeights[item.vendor])));
                  const selAmp = basket.find(b=>b.cat==="amplifier");
                  const ampW = selAmp ? (AMP_POWER_WATTS[selAmp.id]||999) : 999;
                  const spkMinW = item.minWatts || 0;
                  const powerMismatch = currentCatKey==="speakers" && spkMinW > 0 && ampW < spkMinW;
                  const livePrice = livePrices[item.id];

                  async function checkLivePrice(e) {
                    e.stopPropagation();
                    if (livePrice?.loading) return;
                    setLivePrices(p=>({...p,[item.id]:{loading:true}}));
                    try {
                      const res = await fetch("https://api.anthropic.com/v1/messages",{
                        method:"POST",
                        headers:{"Content-Type":"application/json","x-api-key":import.meta.env.VITE_ANTHROPIC_KEY,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},
                        body:JSON.stringify({
                          model:"claude-haiku-4-5-20251001",
                          max_tokens:200,
                          tools:[{"type":"web_search_20250305","name":"web_search"}],
                          messages:[{role:"user",content:`What is the current UK retail price of the ${item.name} by ${(VENDORS[item.vendor]||VENDORS.generic).name}? Search for the current price and respond ONLY with a JSON object: {"price": number, "source": "retailer name"}. Price should be in GBP as an integer. If you cannot find it, return {"price": null, "source": null}`}]
                        })
                      });
                      const data = await res.json();
                      const txt = data.content?.map(c=>c.text||"").join("") || "";
                      const clean = txt.replace(/```json|```/g,"").trim();
                      const result = JSON.parse(clean);
                      setLivePrices(p=>({...p,[item.id]:{loading:false,price:result.price,source:result.source,checked:new Date().toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"})}}));
                    } catch(err) {
                      setLivePrices(p=>({...p,[item.id]:{loading:false,error:true}}));
                    }
                  }
                  return (
                    <button key={item.id} onClick={()=>selectComp(currentCatKey,item)}
                      style={{textAlign:"left",cursor:"pointer",padding:0,border:`2px solid ${on?iv.col:"var(--rule)"}`,background:on?`${iv.col}08`:"var(--paper2)",transition:"all .2s",display:"block",width:"100%"}}>
                      <div style={{display:"grid",gridTemplateColumns:"4px 1fr auto",alignItems:"stretch"}}>
                        <div style={{background:on?iv.col:"transparent",transition:"background .2s"}}/>
                        <div style={{padding:"16px 16px 14px"}}>
                          {i===0&&!on&&<div style={{fontSize:8,color:tierData.accent,letterSpacing:".14em",textTransform:"uppercase",fontFamily:"var(--mono)",marginBottom:6}}>★ Top pick for your setup</div>}
                          <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:8,marginBottom:5}}>
                            <div style={{fontFamily:"var(--serif)",fontSize:16,color:"var(--ink)",fontWeight:400,lineHeight:1.2}}>{item.name}</div>
                            {matchedGenres.length>0&&<div style={{display:"flex",gap:3,flexShrink:0,marginTop:2}}>{matchedGenres.slice(0,3).map(g=><span key={g.id} style={{fontSize:16}}>{g.emoji}</span>)}</div>}
                          </div>
                          <div style={{fontSize:10,color:"var(--ink4)",fontFamily:"var(--mono)",marginBottom:8}}>{item.sub}</div>
                          <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                            <span style={{fontSize:8,letterSpacing:".08em",textTransform:"uppercase",padding:"2px 8px",background:`${iv.col}15`,border:`1px solid ${iv.col}35`,color:iv.col,fontFamily:"var(--mono)"}}>{iv.name}</span>
                            {iv.city&&iv.city!=="—"&&<span style={{fontSize:8,color:"var(--ink4)",fontFamily:"var(--mono)"}}>{iv.city}</span>}
                            {item.character&&<span style={{fontSize:8,color:"var(--ink4)",fontFamily:"var(--mono)",padding:"2px 7px",background:"var(--paper2)",border:"1px solid var(--rule)"}}>
                              {item.character==="warm"?"🎷 Warm":item.character==="detailed"?"🔬 Detailed":"⚖ Balanced"}
                            </span>}
                          </div>
                          {item.brandStory&&<p style={{fontSize:11,color:"var(--ink3)",lineHeight:1.6,fontFamily:"var(--serif)",fontStyle:"italic",marginTop:8,paddingTop:8,borderTop:"1px solid var(--rule)"}}>{item.brandStory}</p>}
                          {item.note&&!item.brandStory&&<p style={{fontSize:10,color:"var(--ink3)",lineHeight:1.6,fontFamily:"var(--serif)",fontStyle:"italic",marginTop:8,paddingTop:8,borderTop:"1px solid var(--rule)"}}>{item.note}</p>}
                          {powerMismatch&&(
                            <div style={{marginTop:8,padding:"8px 10px",borderLeft:"3px solid var(--red)",background:"rgba(139,32,32,.05)"}}>
                              <p style={{fontSize:11,color:"var(--red)",fontFamily:"var(--serif)",lineHeight:1.5}}>
                                ⚠ Requires {spkMinW}W+ — your {selAmp.name} delivers {ampW}W. These speakers will be underpowered and may sound compressed at volume.
                              </p>
                            </div>
                          )}
                        </div>
                        <div style={{padding:"16px 16px 16px 0",display:"flex",flexDirection:"column",alignItems:"flex-end",justifyContent:"space-between",flexShrink:0}}>
                          <div style={{textAlign:"right"}}>
                            <div style={{fontFamily:"var(--serif)",fontSize:18,color:on?iv.col:"var(--ink2)",fontWeight:on?400:300}}>{formatPrice(item.price,loc)}</div>
                            {/* Live price */}
                            {livePrice?.loading&&<div style={{fontSize:8,color:"var(--ink4)",fontFamily:"var(--mono)",marginTop:2}}>checking...</div>}
                            {livePrice?.price&&!livePrice.loading&&(
                              <div style={{marginTop:4,textAlign:"right"}}>
                                <div style={{fontSize:11,color:livePrice.price>item.price?"var(--red)":livePrice.price<item.price?"var(--green)":"var(--ink3)",fontFamily:"var(--mono)",fontWeight:400}}>
                                  {loc.symbol}{livePrice.price.toLocaleString()} live
                                </div>
                                <div style={{fontSize:7,color:"var(--ink4)",fontFamily:"var(--mono)"}}>{livePrice.source} · {livePrice.checked}</div>
                              </div>
                            )}
                            {livePrice?.error&&<div style={{fontSize:8,color:"var(--ink4)",fontFamily:"var(--mono)",marginTop:2}}>price unavailable</div>}
                          </div>
                          <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6,marginTop:8}}>
                            {on&&(
                              <div style={{width:22,height:22,background:iv.col,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center"}}>
                                <svg width="11" height="9" viewBox="0 0 10 8" fill="none"><polyline points="1,4 3.5,6.5 9,1" stroke="#F5F0E8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                              </div>
                            )}
                            {!livePrice?.loading&&(
                              <button onClick={checkLivePrice} title="Check current UK price"
                                style={{fontSize:7,color:"var(--ink4)",fontFamily:"var(--mono)",letterSpacing:".08em",textTransform:"uppercase",background:"transparent",border:"1px solid var(--rule)",padding:"3px 7px",cursor:"pointer",whiteSpace:"nowrap",transition:"all .15s"}}>
                                {livePrice?.price?"refresh":"live £"}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {hasMore&&(
                <button onClick={()=>setShowAllCat(s=>({...s,[currentCatKey]:!s[currentCatKey]}))}
                  style={{width:"100%",padding:"10px",background:"transparent",border:"1px dashed var(--rule)",cursor:"pointer",fontSize:9,color:"var(--ink4)",fontFamily:"var(--mono)",letterSpacing:".12em",textTransform:"uppercase",marginBottom:16}}>
                  {showAllCat[currentCatKey]?`▲ Show fewer`:`▼ Show all ${scoredOpts.length} options`}
                </button>
              )}

              {/* ── Previously selected components ─────────────────────────── */}
              {basket.length>0&&(
                <div style={{marginTop:8,padding:"12px 14px",background:"var(--paper2)",border:"1px solid var(--rule)"}}>
                  <div style={{fontSize:8,color:"var(--ink4)",letterSpacing:".14em",textTransform:"uppercase",fontFamily:"var(--mono)",marginBottom:8}}>Your system so far</div>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                    {basket.map(b=>{
                      const bv = VENDORS[b.vendor]||VENDORS.generic;
                      return (
                        <div key={b.id} style={{display:"flex",alignItems:"center",gap:5,padding:"3px 8px",background:`${bv.col}10`,border:`1px solid ${bv.col}35`}}>
                          <CatIcon cat={b.cat} size={9} col={bv.col}/>
                          <span style={{fontSize:8,fontFamily:"var(--mono)",color:bv.col}}>{b.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Navigation ───────────────────────────────────────────────── */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:28,paddingTop:20,borderTop:"1px solid var(--rule)"}}>
            <button onClick={()=>chainStep>0?setChainStep(s=>s-1):goTo("tier")}
              style={{background:"none",border:"none",padding:"10px 0",fontSize:10,letterSpacing:".14em",textTransform:"uppercase",color:"var(--ink4)",cursor:"pointer",fontFamily:"var(--mono)",display:"flex",alignItems:"center",gap:8}}>
              <svg width="14" height="10" viewBox="0 0 14 10" fill="none"><path d="M6 1L1 5l5 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><line x1="1" y1="5" x2="13" y2="5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
              Back
            </button>
            <button
              onClick={()=>isLastStep?advance("catalog","summary"):setChainStep(s=>s+1)}
              style={{background:selInCurrent||skipInfo.skip?"var(--ink)":"var(--paper2)",color:selInCurrent||skipInfo.skip?"var(--paper)":"var(--ink4)",border:`1px solid ${selInCurrent||skipInfo.skip?"var(--ink)":"var(--rule)"}`,padding:"12px 28px",fontSize:10,letterSpacing:".16em",textTransform:"uppercase",cursor:"pointer",fontFamily:"var(--mono)",display:"flex",alignItems:"center",gap:10,transition:"all .2s"}}>
              {isLastStep?"View Summary →":"Next →"}
              <svg width="14" height="10" viewBox="0 0 14 10" fill="none"><path d="M8 1l5 4-5 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><line x1="13" y1="5" x2="1" y2="5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
            </button>
          </div>
        </div>
      );
    })(),

    summary: (()=>{
      const [swapOpen, setSwapOpen] = React.useState(null);
      const SIGNAL_ORDER_SUMMARY = ["turntable","cartridge","phono","amplifier","speakers","cables","isolation","power"];
      const allCats = SIGNAL_ORDER_SUMMARY.filter(k=>tierData.components[k]);
      const selectedByCat=(catKey)=>basket.find(b=>(tierData.components[catKey]||[]).some(o=>o.id===b.id));
      return (
        <div>
          <StepHeading title="Your System"/>
          <div style={{marginBottom:24}}><SystemDiagram basket={basket} autoItems={analysis.autoItems}/></div>
          <div style={{marginBottom:24,padding:"16px 20px",background:"var(--paper2)",border:"1px solid var(--rule)",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:16}}>
            <SynergyRing score={synergy}/>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:9,color:"var(--ink4)",letterSpacing:".12em",textTransform:"uppercase",marginBottom:4,fontFamily:"var(--mono)"}}>System Level</div>
              <div style={{fontFamily:"var(--serif)",fontSize:18,color:tierData.accent}}>{tier==="entry"?"Entry Level":tier==="mid"?"Mid-Range":"High-End"}</div>
              <div style={{fontSize:9,color:"var(--ink4)",marginTop:3,fontFamily:"var(--mono)"}}>{room.length}m × {room.width}m · {analysis.bld?.label}</div>
            </div>
          </div>
          <div style={{marginBottom:24}}>
            <SectionLabel>Selected Components</SectionLabel>
            <div style={{display:"grid",gap:0,border:"1px solid var(--rule)"}}>
              {allCats.map((catKey,ci)=>{
                const sel=selectedByCat(catKey);
                const effectiveSel=sel||(catKey==="cartridge"&&bundledCart?{name:bundledCart.name,sub:"Bundled",cat:"cartridge",vendor:selectedTurntable?.vendor||"generic",price:0,_bundled:true}:null);
                const v=effectiveSel?(VENDORS[effectiveSel.vendor]||VENDORS.generic):null;
                const isOpen=swapOpen===catKey;
                const opts=tierData.components[catKey]||[];
                return (
                  <div key={catKey} style={{borderTop:ci>0?"1px solid var(--rule)":"none"}}>
                    <div style={{display:"grid",gridTemplateColumns:"auto 1fr auto",alignItems:"center",gap:10,padding:"11px 14px",background:isOpen?"var(--paper2)":"transparent"}}>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <CatIcon cat={catKey} size={11} col={effectiveSel?(effectiveSel._bundled?"#2A5040":v.col):"var(--ink4)"}/>
                        <span style={{fontSize:8,color:"var(--ink4)",letterSpacing:".14em",textTransform:"uppercase",fontFamily:"var(--mono)",width:64,flexShrink:0}}>{CAT_LABELS[catKey]}</span>
                      </div>
                      {effectiveSel?(
                        <div style={{display:"flex",alignItems:"center",gap:8,minWidth:0}}>
                          <div style={{width:2,height:20,background:effectiveSel._bundled?"#2A5040":v.col,flexShrink:0}}/>
                          <div style={{minWidth:0}}>
                            <div style={{fontFamily:"var(--serif)",fontSize:13,color:"var(--ink)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{effectiveSel.name}</div>
                            <div style={{fontSize:8,color:effectiveSel._bundled?"#2A5040":v.col,fontFamily:"var(--mono)"}}>{effectiveSel._bundled?"Bundled · included":v.name}</div>
                          </div>
                        </div>
                      ):<div style={{fontSize:11,color:"var(--ink4)",fontStyle:"italic",fontFamily:"var(--serif)"}}>Not selected</div>}
                      <button onClick={()=>setSwapOpen(isOpen?null:catKey)} style={{padding:"5px 10px",border:"1px solid var(--rule)",cursor:"pointer",fontSize:8,letterSpacing:".1em",textTransform:"uppercase",fontFamily:"var(--mono)",background:isOpen?"var(--ink)":"transparent",color:isOpen?"var(--paper)":"var(--ink3)",transition:"all .15s",whiteSpace:"nowrap"}}>{isOpen?"✕":"Swap"}</button>
                    </div>
                    {isOpen&&(
                      <div className="fu" style={{borderTop:"1px solid var(--rule)",background:"var(--paper2)",padding:"10px 14px",maxHeight:280,overflowY:"auto"}}>
                        <div style={{display:"grid",gap:5}}>
                          {opts.map(item=>{
                            const iv=VENDORS[item.vendor]||VENDORS.generic, isSel=basket.some(b=>b.id===item.id);
                            return (
                              <button key={item.id} onClick={()=>{selectComp(catKey,item);setSwapOpen(null);}} style={{display:"grid",gridTemplateColumns:"auto 1fr",alignItems:"center",gap:8,padding:"9px 10px",textAlign:"left",cursor:"pointer",background:isSel?"var(--ink)":"transparent",border:`1px solid ${isSel?"var(--ink)":"var(--rule)"}`,transition:"all .15s"}}>
                                <div style={{width:3,height:28,background:iv.col,borderRadius:1,flexShrink:0}}/>
                                <div>
                                  <div style={{fontFamily:"var(--serif)",fontSize:12,color:isSel?"var(--paper)":"var(--ink)",lineHeight:1.3}}>{item.name}</div>
                                  <div style={{fontSize:8,color:isSel?"rgba(245,240,232,.6)":"var(--ink4)",marginTop:1,fontFamily:"var(--mono)"}}>{iv.name}</div>
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
          {analysis.warnings.filter(w=>w.level==="critical").length>0&&(
            <div style={{marginBottom:20}}><SectionLabel>Critical Constraints</SectionLabel><div style={{display:"grid",gap:7}}>{analysis.warnings.filter(w=>w.level==="critical").map((w,i)=><WarningBadge key={i} w={w} SEV={SEV}/>)}</div></div>
          )}
          <div style={{marginTop:32,padding:"32px 28px",background:"var(--ink)",textAlign:"center"}}>
            <VinylAccent size={40} col="#F5F0E8" opacity={0.15}/>
            <div style={{fontFamily:"var(--serif)",fontSize:"clamp(20px,4vw,28px)",color:"var(--paper)",fontWeight:400,lineHeight:1.2,margin:"16px 0 8px",letterSpacing:"-.01em"}}>Happy with your system?</div>
            <p style={{fontSize:11,color:"var(--ink4)",fontFamily:"var(--mono)",letterSpacing:".08em",marginBottom:24,lineHeight:1.6}}>The next screen shows the full cost — and how to pay less than the asking price.</p>
            <button onClick={()=>advance("summary","pricing")} style={{display:"inline-flex",alignItems:"center",gap:12,padding:"16px 36px",background:"var(--amber)",color:"var(--paper)",border:"none",cursor:"pointer",fontFamily:"var(--mono)",fontSize:11,letterSpacing:".18em",textTransform:"uppercase"}}>
              See the cost →
            </button>
            <div style={{marginTop:12,fontSize:9,color:"var(--ink3)",fontFamily:"var(--mono)",letterSpacing:".08em"}}>or ← go back and swap any component</div>
          </div>
          <NavRow onBack={()=>goTo("catalog")} onNext={()=>advance("summary","pricing")} nextLabel="See the cost →"/>
        </div>
      );
    })(),

    pricing: (()=>{
      const msrpComp=basket.filter(i=>i.price>0).reduce((s,i)=>s+i.price,0);
      const msrpAuto=analysis.autoItems.filter(i=>i.price>0).reduce((s,i)=>s+i.price,0);
      const msrpTotal=msrpComp+msrpAuto;
      const discPct=tier==="high"?0.92:tier==="mid"?0.84:0.88;
      const dealEst=Math.round(msrpTotal*discPct/50)*50;
      const saving=msrpTotal-dealEst;
      const overBy=budget>0?basketTotal-budget:0;
      const budgetSuggestions=(()=>{ if(overBy<=0||budget===0)return []; const suggestions=[]; basket.forEach(selItem=>{ const catKey=selItem.cat; const opts=tierData.components[catKey]||[]; const cheaper=opts.filter(o=>o.id!==selItem.id&&o.price<selItem.price).sort((a,b)=>a.price-b.price)[0]; if(cheaper)suggestions.push({catKey,from:selItem,to:cheaper,saving:selItem.price-cheaper.price}); }); suggestions.sort((a,b)=>b.saving-a.saving); let covered=0; const result=[]; for(const s of suggestions){if(covered>=overBy)break;if(result.length>=3)break;result.push(s);covered+=s.saving;} return result; })();
      return (
        <div>
          <div className="fu" style={{textAlign:"center",padding:"36px 20px 28px",borderBottom:"2px solid var(--ink)",marginBottom:28}}>
            <div style={{fontSize:9,color:"var(--ink4)",letterSpacing:".22em",textTransform:"uppercase",marginBottom:10,fontFamily:"var(--mono)"}}>Full system MSRP</div>
            <div style={{fontFamily:"var(--serif)",fontSize:"clamp(44px,10vw,72px)",fontWeight:400,color:"var(--ink)",lineHeight:1,letterSpacing:"-.03em",marginBottom:8}}>{formatPrice(msrpTotal,loc)}</div>
            <div style={{fontSize:11,color:"var(--ink3)",fontFamily:"var(--serif)",fontStyle:"italic"}}>at full retail price · before negotiation</div>
          </div>
          {overBy>0&&(
            <div className="fu" style={{marginBottom:24,padding:"16px 18px",borderLeft:"3px solid #8B2020",background:"rgba(139,32,32,.04)"}}>
              <div style={{fontSize:9,color:"#8B2020",letterSpacing:".18em",textTransform:"uppercase",marginBottom:6,fontFamily:"var(--mono)"}}>Over your budget by {formatPrice(overBy,loc)}</div>
              <div style={{display:"grid",gap:6}}>
                {budgetSuggestions.length>0?budgetSuggestions.map((s,i)=>(
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
                )):<div style={{fontSize:11,color:"var(--ink3)",fontFamily:"var(--serif)",fontStyle:"italic",padding:"8px 0"}}>No cheaper alternatives in this tier.</div>}
              </div>
            </div>
          )}
          <div style={{marginBottom:28,border:"2px solid var(--ink)",background:"var(--paper2)"}}>
            <div style={{padding:"24px 24px 16px",textAlign:"center",borderBottom:"1px solid var(--rule)"}}>
              <div style={{fontSize:9,color:"var(--ink3)",letterSpacing:".22em",textTransform:"uppercase",marginBottom:6,fontFamily:"var(--mono)"}}>Realistic deal estimate</div>
              <div style={{fontFamily:"var(--serif)",fontSize:"clamp(32px,6vw,48px)",fontWeight:400,color:"var(--green)",lineHeight:1,letterSpacing:"-.02em"}}>{formatPrice(dealEst,loc)}</div>
              <div style={{fontSize:11,color:"var(--ink3)",marginTop:6,fontFamily:"var(--serif)",fontStyle:"italic"}}>what a good dealer will accept</div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:0}}>
              {[{label:"Full MSRP",val:formatPrice(msrpTotal,loc),col:"var(--ink3)",strike:true},{label:"You could save",val:formatPrice(saving,loc),col:"var(--green)",sub:`${Math.round((saving/msrpTotal)*100)}% off`}].map((m,i)=>(
                <div key={m.label} style={{padding:"14px 16px",textAlign:"center",borderLeft:i>0?"1px solid var(--rule)":"none"}}>
                  <div style={{fontSize:8,color:"var(--ink4)",letterSpacing:".14em",textTransform:"uppercase",marginBottom:4,fontFamily:"var(--mono)"}}>{m.label}</div>
                  <div style={{fontFamily:"var(--serif)",fontSize:20,fontWeight:300,color:m.col,textDecoration:m.strike?"line-through":"none"}}>{m.val}</div>
                  {m.sub&&<div style={{fontSize:9,color:m.col,fontFamily:"var(--mono)",marginTop:2}}>{m.sub}</div>}
                </div>
              ))}
            </div>
          </div>
          <NegotiationSlider msrp={msrpTotal} deal={dealEst} accent={tierData.accent} loc={loc}/>
          <div style={{marginBottom:20}}>
            <SectionLabel>Five ways to pay less</SectionLabel>
            <div style={{display:"grid",gap:6}}>
              {loc.negotiationTips.map((g,i)=>(
                <div key={i} style={{display:"grid",gridTemplateColumns:"auto 1fr auto",alignItems:"center",gap:12,padding:"13px 16px",background:i===0?"rgba(42,80,64,.05)":"var(--paper2)",border:`1px solid ${i===0?"var(--green)":"var(--rule)"}`}}>
                  <div style={{fontFamily:"var(--serif)",fontSize:20,color:i===0?"var(--green)":"var(--ink4)",lineHeight:1,minWidth:20,textAlign:"center"}}>{i+1}</div>
                  <span style={{fontSize:12,color:"var(--ink2)",fontFamily:"var(--serif)",lineHeight:1.5}}>{g.tip}</span>
                  <span style={{fontSize:9,color:i===0?"var(--green)":tierData.accent,whiteSpace:"nowrap",letterSpacing:".04em",fontFamily:"var(--mono)",textAlign:"right"}}>{g.saving}</span>
                </div>
              ))}
            </div>
          </div>
          {analysis.autoItems.filter(i=>i.price>0).length>0&&(
            <div style={{marginBottom:20}}>
              <SectionLabel>Mandatory Additions — Room Requirements</SectionLabel>
              <div style={{display:"grid",gap:4}}>
                {analysis.autoItems.filter(i=>i.price>0).map(item=>(
                  <div key={item.id} style={{display:"grid",gridTemplateColumns:"auto 1fr auto",alignItems:"center",gap:12,padding:"11px 14px",background:"rgba(42,143,197,0.04)",border:"1px solid rgba(42,143,197,0.14)"}}>
                    <div style={{width:5,height:5,borderRadius:"50%",background:"var(--blue)",flexShrink:0}}/>
                    <span style={{fontSize:12,color:"var(--ink2)",fontFamily:"var(--serif)"}}>{item.name}</span>
                    <span style={{fontFamily:"var(--serif)",fontSize:14,color:"var(--blue)",minWidth:60,textAlign:"right"}}>{formatPrice(item.price,loc)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {[
            {id:"placement",label:"Placement Diagram",content:(<div><div style={{display:"flex",justifyContent:"center",background:"var(--paper)",border:"1px solid var(--rule)",padding:16,marginBottom:12}}><RoomDiagram length={room.length} width={room.width} separation={analysis.separation} backWall={analysis.backWall} listenPos={analysis.listenPos||3.2} sideWallGap={sideWallGap} accent={tierData.accent}/></div><div style={{display:"flex",justifyContent:"center",gap:24,flexWrap:"wrap"}}>{[{l:"Speaker separation",v:`${analysis.separation}m`},{l:"Back wall",v:`${analysis.backWall}m`},{l:"Listening position",v:`${analysis.listenPos||3.2}m`}].map(m=><div key={m.l} style={{textAlign:"center"}}><div style={{fontSize:9,color:"var(--ink4)",letterSpacing:".1em",textTransform:"uppercase",marginBottom:3}}>{m.l}</div><div style={{fontFamily:"var(--serif)",fontSize:16,color:tierData.accent}}>{m.v}</div></div>)}</div></div>)},
            {id:"wiring",label:"Mains Conditioner — Power Bank Assignment",content:<WiringMap basket={basket}/>},
          ].map(section=>(<CollapsibleSection key={section.id} label={section.label}>{section.content}</CollapsibleSection>))}

          {/* ── Specialist dealer statement — high tier only ── */}
          {tier==="high"&&(
            <div style={{marginBottom:24,padding:"24px 24px",background:"var(--ink)"}}>
              <div style={{fontSize:9,color:"rgba(245,242,232,.4)",letterSpacing:".2em",textTransform:"uppercase",fontFamily:"var(--mono)",marginBottom:12}}>Before you buy</div>
              <p style={{fontFamily:"var(--serif)",fontSize:15,color:"var(--paper)",lineHeight:1.75,marginBottom:14}}>
                At this level, this tool is a starting point — not a finishing line.
              </p>
              <p style={{fontFamily:"var(--serif)",fontSize:13,color:"rgba(245,242,232,.7)",lineHeight:1.75,marginBottom:14}}>
                The differences between reference-level components are real, but they are also subtle, system-dependent, and deeply personal. Room acoustics, listener preference, and the specific synergies between components at this price point cannot be determined from a configuration tool alone.
              </p>
              <p style={{fontFamily:"var(--serif)",fontSize:13,color:"rgba(245,242,232,.7)",lineHeight:1.75,marginBottom:20}}>
                A good specialist independent dealer will demo your shortlist in your price range, discuss your room honestly, and in many cases loan equipment for home demonstration. That experience — and that relationship — is what you are really buying at this level.
              </p>
              <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                {["Signals (Ipswich)","Cymbiosis (Leicester)","Loud & Clear (Edinburgh)","Moorgate Acoustics (Sheffield)","KJ West One (London)","Audio T (nationwide)","Richer Sounds (nationwide)"].map(d=>(
                  <span key={d} style={{fontSize:9,fontFamily:"var(--mono)",color:"rgba(245,242,232,.45)",padding:"4px 10px",border:"1px solid rgba(245,242,232,.12)",letterSpacing:".04em"}}>{d}</span>
                ))}
              </div>
              <div style={{marginTop:14,fontSize:9,color:"rgba(245,242,232,.3)",fontFamily:"var(--mono)",letterSpacing:".06em"}}>
                Arrive at your dealer with this system spec. Use it as a conversation starter, not a final order.
              </div>
            </div>
          )}

          <div style={{marginTop:24,padding:"16px 20px",background:"rgba(42,143,197,.06)",border:"1px solid rgba(42,143,197,.18)",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
            <div>
              <div style={{fontSize:9,color:"var(--blue)",letterSpacing:".18em",textTransform:"uppercase",marginBottom:3}}>Help improve this tool</div>
              <div style={{fontSize:10,color:"var(--ink3)",lineHeight:1.5}}>Two minutes · tells us what to build next</div>
            </div>
            <a href={TALLY_URL} target="_blank" rel="noopener noreferrer" style={{display:"inline-flex",alignItems:"center",gap:8,padding:"10px 20px",background:"rgba(42,143,197,.12)",border:"1px solid rgba(42,143,197,.4)",color:"var(--blue)",fontSize:10,letterSpacing:".12em",textTransform:"uppercase",textDecoration:"none",fontFamily:"var(--mono)",whiteSpace:"nowrap"}}>Give Feedback</a>
          </div>
          <NavRow onBack={()=>goTo("summary")} nextLabel="← Start over" onNext={()=>{setCompleted(new Set());goTo("materials");setShowLanding(true);}}/>
        </div>
      );
    })(),
  };

  if (showLanding) return <LandingScreen
    onEnter={()=>setShowLanding(false)}
    onEnterWithNL={(parsed)=>{
      // Apply parsed NL values to state
      if (parsed.roomSize)    { const s=NL_ROOM_SIZES[parsed.roomSize]; if(s) setRoom(s.dims); }
      if (parsed.buildingType && ["apt_ground","apt_upper","detached","semi_detached"].includes(parsed.buildingType)) setBuildingType(parsed.buildingType);
      if (parsed.floorType)   setFloorTypes([parsed.floorType]);
      if (parsed.wallType)    setWallMaterials([parsed.wallType]);
      if (parsed.budget>0)    setBudget(parsed.budget);
      if (parsed.genres?.length>0) setSelectedGenres(parsed.genres.filter(g=>GENRES.find(x=>x.id===g)));
      if (parsed.bias!=null)  setBias(parsed.bias);
      if (parsed.tier && ["entry","mid","high"].includes(parsed.tier)) setTier(parsed.tier);
      if (parsed.mounting && ["sideboard","rack","other"].includes(parsed.mounting)) setMounting(parsed.mounting);
      setShowLanding(false);
      // Skip straight to catalog
      setCompleted(new Set(["materials","room","genres","tier"]));
      goTo("catalog");
    }}
    localeId={localeId}
    onLocaleChange={setLocaleId}
    apiKey={import.meta.env.VITE_ANTHROPIC_KEY}
  />;

  return (
    <div style={{fontFamily:"var(--mono)",background:"var(--paper)",minHeight:"100vh",color:"var(--ink)"}}>
      {/* ── FIX 4: NO <style> tag here — CSS is injected once by useGlobalStyles() ── */}
      <div style={{height:3,background:"var(--ink)",width:"100%"}}/>
      <div style={{maxWidth:900,margin:"0 auto",padding:isMobile?"0 12px 80px":"0 24px 80px"}}>
        <div className="fu" style={{padding:"28px 0 24px",borderBottom:"1px solid var(--rule)",marginBottom:32}}>
          <div style={{display:"flex",flexDirection:isMobile?"column":"row",justifyContent:"space-between",alignItems:isMobile?"flex-start":"flex-start",flexWrap:"wrap",gap:isMobile?8:16}}>
            <div>
              <div style={{fontSize:9,letterSpacing:".28em",textTransform:"uppercase",color:"var(--ink3)",fontFamily:"var(--mono)",marginBottom:8}}>Hi-Fi System Builder &nbsp;·&nbsp; {loc.flag} {loc.label}</div>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <VinylAccent size={32} opacity={0.18}/>
                <h1 style={{fontFamily:"var(--serif)",fontSize:"clamp(26px,4vw,38px)",fontWeight:400,color:"var(--ink)",lineHeight:1,letterSpacing:"-.03em"}}>Reference System<br/><em style={{fontWeight:300,fontStyle:"italic",color:"var(--amber)"}}>Configurator</em></h1>
              </div>
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
