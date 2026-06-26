import { useState, useRef, useEffect } from "react";
import JSZip from "jszip";

// ── PALETTE ──
const C = {
  navy:"#0f2650", navy2:"#1a3a6e",
  cream:"#f8f6f0", cream2:"#f0ede4", cream3:"#e8e3d8",
  gold:"#b8962e",
  green:"#1a5c2a", greenLight:"#e8f5ec",
  red:"#8b1a1a", redLight:"#fdf0f0",
  amber:"#7a4a00", amberLight:"#fdf5e0",
  purple:"#4a1a6e", purpleLight:"#f0e8f8",
  text:"#1a1a2e", text2:"#4a4a6a", text3:"#8a8aaa",
  border:"#d8d3c8", border2:"#c8c3b8",
};

// Les consignes sont desormais chargees depuis le serveur (/api/consignes).
// Cette liste locale ne sert que de repli si le serveur est injoignable.
const DEFAULT_CONSIGNES = [];

const DEMO_TEXT = `Conformément à l'article 13 de la loi n°104-12 relative à la liberté des prix et de la concurrence et l'article 10 du décret n° 2-14-652 pris pour son application, tels qu'ils ont été modifiés et complétés, le Conseil de la Concurence dsdmet à la disposition du public le « résumé de l'opération » ci-dessous.

Ces informations ont été élaborées par les parties notifiantes, qui en sont seules responsables. Les renseignements inexacts ne préjugent nullement de la position du Conseil de la Codsdncurrence sur l'opération envisagée.

La publication de ce communiqué n'atteste pas de la complétude du dossier prévue à l'article 9 du décret n°2-14-652 pris pdsour l'application de la loi n°104-12.

Noms des entreprises et groupes concernées :
- L'acquéreur : « Société X SA » ;
- La cible : « Société Y SARL ».

Nature de l'opération : Prise du contrôle exclusif.
Secteurs économiques concernés : Marché de la distribution de produits alimentaire.

Délai dans lequel les tiers indstéressés sont invités à faire connaître leurs observations : 10 jours, soit le 27 avril 2026.

RÉSUMÉ NON CONFIDENTIEL DE L'OPÉRATION FOURNI PAR LES PARTIES

Le Conseil de la Concurrence a reçu la notification d'une opération de projet de concentration économique concernant la prise du contrôle exclusif par la Société X SA de la société Y SARL, société anonyme de droit marocain.

Fait à Rabat le 23 avril 2026`;

const TYPE_LABELS = {cp_fr:"CP Français",cp_ar:"بلاغ AR",bilingue:"Bilingue",decision_ar:"Décision AR",tous:"Tous"};
const CAT_BG = {FORME:"#dbeafe",FOND:"#fdf5e0",TERMINOLOGIE:"#e8f5ec",BILINGUE:"#f0e8f8"};
const CAT_FG = {FORME:"#1e40af",FOND:"#7a4a00",TERMINOLOGIE:"#1a5c2a",BILINGUE:"#4a1a6e"};
const TYPE_BORDER = {forme:"#3b82f6",fond:C.gold,terminologie:C.green,bilingue:C.purple};

function Spinner() {
  return <div style={{width:26,height:26,border:`2px solid ${C.cream3}`,borderTopColor:C.navy2,borderRadius:"50%",animation:"spin .7s linear infinite"}}/>;
}

function Badge({t, small}) {
  return <span style={{background:CAT_BG[t]||"#f0f0f0",color:CAT_FG[t]||"#555",padding:small?"2px 5px":"2px 8px",borderRadius:20,fontSize:small?9:10,fontWeight:600,letterSpacing:".03em"}}>{t}</span>;
}

function Sidebar({page, setPage}) {
  const item = (id, icon, label) => (
    <div onClick={() => setPage(id)} style={{display:"flex",alignItems:"center",gap:9,padding:"8px 14px",cursor:"pointer",borderRadius:6,margin:"1px 7px",background:page===id?"rgba(255,255,255,.13)":"transparent",color:page===id?"#fff":"rgba(255,255,255,.58)",fontSize:12.5,fontWeight:page===id?500:400,transition:"all .15s"}}>
      <span style={{fontSize:14,opacity:page===id?1:.7}}>{icon}</span>{label}
    </div>
  );
  return (
    <aside style={{width:210,background:C.navy,display:"flex",flexDirection:"column",flexShrink:0,minHeight:"100vh"}}>
      <div style={{padding:"22px 18px 14px",borderBottom:"1px solid rgba(255,255,255,.1)"}}>
        <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:9}}>
          <div style={{width:28,height:28,background:"rgba(255,255,255,.15)",borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>⚖️</div>
          <div style={{fontFamily:"Georgia,serif",fontSize:12.5,color:"#fff",lineHeight:1.3,fontWeight:600}}>Conseil de la<br/>Concurrence</div>
        </div>
        <div style={{fontSize:9,color:"rgba(255,255,255,.32)",letterSpacing:".1em",textTransform:"uppercase"}}>Correction OCE v1.0</div>
      </div>
      <div style={{padding:"12px 10px 5px",fontSize:8.5,letterSpacing:".12em",textTransform:"uppercase",color:"rgba(255,255,255,.28)",fontWeight:500}}>Rapporteur</div>
      {item("correction","📝","Corriger un document")}
      {item("comparaison","🔀","Comparaison bilingue")}
      {item("historique","🕐","Historique")}
      <div style={{height:1,background:"rgba(255,255,255,.08)",margin:"7px 14px"}}/>
      <div style={{padding:"12px 10px 5px",fontSize:8.5,letterSpacing:".12em",textTransform:"uppercase",color:"rgba(255,255,255,.28)",fontWeight:500}}>Administrateur</div>
      {item("dashboard","📊","Tableau de bord")}
      {item("consignes","📋","Fiches de consignes")}
      {item("utilisateurs","👥","Utilisateurs")}
      <div style={{marginTop:"auto",padding:14,borderTop:"1px solid rgba(255,255,255,.08)"}}>
        <div style={{display:"flex",alignItems:"center",gap:9}}>
          <div style={{width:28,height:28,borderRadius:"50%",background:C.gold,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:600,color:"#fff"}}>RA</div>
          <div>
            <div style={{fontSize:11.5,color:"rgba(255,255,255,.7)"}}>Rapporteur</div>
            <div style={{fontSize:9.5,color:"rgba(255,255,255,.33)"}}>Concentrations éco.</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function PageHeader({title, sub, right}) {
  return (
    <div style={{padding:"22px 30px 16px",borderBottom:`1px solid ${C.border}`,background:C.cream,flexShrink:0}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div>
          <h1 style={{fontFamily:"Georgia,serif",fontSize:22,fontWeight:600,color:C.navy,margin:0}}>{title}</h1>
          {sub && <p style={{fontSize:12.5,color:C.text2,marginTop:3,margin:"3px 0 0"}}>{sub}</p>}
        </div>
        {right}
      </div>
    </div>
  );
}

function Card({children, style}) {
  return <div style={{background:"#fff",border:`1px solid ${C.border}`,borderRadius:10,padding:"16px 20px",...style}}>{children}</div>;
}

function SLabel({children}) {
  return <div style={{fontSize:9.5,fontWeight:500,color:C.text3,textTransform:"uppercase",letterSpacing:".08em",marginBottom:7}}>{children}</div>;
}

// Recherche tolerante aux espaces : on normalise les blancs (espaces, tabs,
// espaces insecables) tout en gardant le mapping vers le texte brut, pour
// localiser une correction meme si l'espacement differe legerement.
function buildNormMap(s) {
  const isWs = ch => ch === " " || ch === "\t" || ch === "\u00a0" || ch === "\u202f" || ch === "\u2009" || ch === "\f" || ch === "\u000b";
  const isApos = ch => ch === "\u0027" || ch === "\u2019" || ch === "\u02bc" || ch === "\uff07" || ch === "\u2018";
  let norm = "", map = [], i = 0;
  while (i < s.length) {
    if (isWs(s[i])) { norm += " "; map.push(i); i++; while (i < s.length && isWs(s[i])) i++; }
    else if (isApos(s[i])) { norm += "'"; map.push(i); i++; }
    else { norm += s[i]; map.push(i); i++; }
  }
  map.push(s.length);
  return { norm, map };
}
function normSpaces(s) { return s.replace(/[ \t\u00a0\u202f\u2009\f\u000b]+/g, " ").replace(/[\u0027\u2019\u02bc\uff07\u2018]/g, "'"); }

// Diff caractere par caractere (LCS) entre le texte original et la correction.
// Renvoie des "ilots" minimaux : seules les parties reellement modifiees, pour
// que la revision ne barre pas la phrase entiere mais juste le mot touche.
function diffIslands(a, b) {
  const isApos = c => c === "\u0027" || c === "\u2019" || c === "\u02bc" || c === "\uff07" || c === "\u2018";
  const eq = (x, y) => x === y || (isApos(x) && isApos(y));
  const n = a.length, m = b.length;
  const dp = [];
  for (let i = 0; i <= n; i++) dp.push(new Int32Array(m + 1));
  for (let i = n - 1; i >= 0; i--)
    for (let j = m - 1; j >= 0; j--)
      dp[i][j] = eq(a[i], b[j]) ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  let i = 0, j = 0; const ops = [];
  while (i < n && j < m) {
    if (eq(a[i], b[j])) { ops.push([0, a[i]]); i++; j++; }
    else if (dp[i + 1][j] >= dp[i][j + 1]) { ops.push([1, a[i]]); i++; }
    else { ops.push([2, b[j]]); j++; }
  }
  while (i < n) { ops.push([1, a[i]]); i++; }
  while (j < m) { ops.push([2, b[j]]); j++; }
  const islands = []; let cur = null, ai = 0;
  for (const [t, ch] of ops) {
    if (t === 0) { if (cur) { islands.push(cur); cur = null; } ai++; }
    else if (t === 1) { if (!cur) cur = { start: ai, del: "", ins: "" }; cur.del += ch; ai++; }
    else { if (!cur) cur = { start: ai, del: "", ins: "" }; cur.ins += ch; }
  }
  if (cur) islands.push(cur);

  // Coalescer les ilots separes par un court texte identique (evite les marques
  // en miettes du type "soci" + "ete"). Le texte identique du trou est repris des
  // deux cotes (suppression + insertion), ce qui ne change pas le resultat final.
  const GAP = 6;
  const merged = [];
  for (const isl of islands) {
    const last = merged[merged.length - 1];
    if (last) {
      const gapStart = last.start + last.del.length;
      const gap = isl.start - gapStart;
      if (gap >= 0 && gap <= GAP) {
        const gapText = a.slice(gapStart, isl.start);
        last.del += gapText + isl.del;
        last.ins += gapText + isl.ins;
        continue;
      }
    }
    merged.push({ start: isl.start, del: isl.del, ins: isl.ins });
  }
  // Si la phrase est trop remaniee (diff tres fragmente), revenir a un simple
  // remplacement global : une seule marque "ancien -> nouveau", lisible.
  if (merged.length > 8) return [{ start: 0, del: a, ins: b }];
  return merged;
}

// ── CORRECTION PAGE ──
function CorrectionPage({consignes, history, setHistory}) {
  const [docType, setDocType] = useState("cp_fr");
  const [fileName, setFileName] = useState("");
  const [fileContent, setFileContent] = useState("");
  const [fileBytes, setFileBytes] = useState(null);
  const [opts, setOpts] = useState({forme:true, fond:true, terminologie:true, bilingue:false});
  const [phase, setPhase] = useState("idle");
  const [loadStep, setLoadStep] = useState(0);
  const [corrections, setCorrections] = useState([]);
  const [synthese, setSynthese] = useState("");
  const [score, setScore] = useState(null);
  const [statuses, setStatuses] = useState({});
  const [error, setError] = useState("");
  const [notApplied, setNotApplied] = useState([]);
  const fileRef = useRef();

  const handleFile = async f => {
    setFileName(f.name);
    // Read as binary (needed for both text extraction and docx manipulation)
    const arrayBuffer = await f.arrayBuffer();
    setFileBytes(arrayBuffer);
    // Extract plain text from docx using JSZip
    try {
      const zip = await JSZip.loadAsync(arrayBuffer);
      const docXml = await zip.file("word/document.xml").async("string");
      // Extraire le texte PAR PARAGRAPHE pour preserver la structure du document.
      // Coller toutes les lignes bout a bout fabriquait de fausses corrections
      // (mots de deux lignes voisines colles) et des corrections a cheval sur
      // deux paragraphes, impossibles a reappliquer.
      const paras = [...docXml.matchAll(/<w:p\b[\s\S]*?<\/w:p>/g)].map(p => {
        const t = [...p[0].matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/g)].map(m => m[1]).join("");
        return t.replace(/[ \t\u00a0\u202f\u2009]+/g, " ").trim();
      }).filter(t => t.length);
      const extracted = paras.join("\n");
      setFileContent(extracted);
    } catch(e) {
      // Fallback: read as plain text (for .txt files)
      const r = new FileReader();
      r.onload = e2 => setFileContent(e2.target.result);
      r.readAsText(f);
    }
  };

  const steps = ["Lecture du document…","Chargement des consignes…","Analyse forme et fond…","Vérification terminologique…","Génération des corrections…"];
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  const analyze = async () => {
    setPhase("loading"); setLoadStep(0); setStatuses({}); setError(""); setNotApplied([]);

    // Animate steps
    for (let i = 0; i < steps.length; i++) {
      setLoadStep(i);
      await sleep(400 + Math.random() * 300);
    }

    const text = fileContent || DEMO_TEXT;

    try {
      // La cle Anthropic reste cote serveur : on passe par /api/analyze.
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, docType, opts, consignes }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }

      const parsed = await res.json();

      setCorrections(parsed.corrections || []);
      setSynthese(parsed.synthese || "");
      setScore(parsed.score);
      setHistory(h => [{id:Date.now(),file:fileName||"Document démo",type:docType,corrections:(parsed.corrections||[]).length,score:parsed.score,date:new Date().toLocaleDateString("fr-FR"),data:parsed.corrections,synthese:parsed.synthese},...h]);
    } catch (err) {
      setError("Erreur lors de l'analyse : " + err.message);
      setPhase("idle");
      return;
    }
    setPhase("results");
  };

  const setStatus = (i, s) => setStatuses(p => ({...p, [i]: s}));
  const acceptAll = () => { const m = {}; corrections.forEach((_, i) => m[i] = "accepted"); setStatuses(m); };
  const rejectAll = () => { const m = {}; corrections.forEach((_, i) => m[i] = "rejected"); setStatuses(m); };

  const escXml = s => s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");

  const RUN_RE_SRC = "(<w:r[ >](?:(?!<w:r[ >])[\\s\\S])*?<\\/w:r>)";

  // Splice cible : remplace la plage brute [start,end) du paragraphe par une
  // suppression (texte supprime) et/ou une insertion, en preservant la mise en
  // forme et les runs voisins. end==start => insertion pure ; ins vide => suppression pure.
  const spliceRange = (paraXml, combined, start, end, ins, changeId, date) => {
    const RUN_RE = new RegExp(RUN_RE_SRC, "g");
    const runs = [...paraXml.matchAll(RUN_RE)];
    if (!runs.length) return paraXml;
    const texts = runs.map(m => {
      const t = m[0].match(/<w:t[^>]*>([^<]*)<\/w:t>/);
      return t ? t[1] : "";
    });
    let cum = 0, sR = null, eR = null;
    for (let i = 0; i < texts.length; i++) {
      const runEnd = cum + texts[i].length;
      if (sR === null && runEnd > start) sR = i;
      if (sR !== null && runEnd >= end) { eR = i; break; }
      cum += texts[i].length;
    }
    if (sR === null) sR = texts.length - 1;
    if (eR === null) eR = sR;
    if (eR < sR) eR = sR;

    const rprMatch = runs[sR][0].match(/<w:rPr>[\s\S]*?<\/w:rPr>/);
    const rpr = rprMatch ? rprMatch[0] : "";
    const spanStart = texts.slice(0, sR).join("").length;
    const spanEnd = texts.slice(0, eR + 1).join("").length;
    const rawDel = combined.slice(start, end);
    const pre = combined.slice(spanStart, start);
    const post = combined.slice(end, spanEnd);

    let out = "";
    if (pre) out += `<w:r>${rpr}<w:t xml:space="preserve">${escXml(pre)}</w:t></w:r>`;
    if (rawDel) out += `<w:del w:id="${changeId[0]++}" w:author="OCE Correction" w:date="${date}"><w:r>${rpr}<w:delText xml:space="preserve">${escXml(rawDel)}</w:delText></w:r></w:del>`;
    if (ins) out += `<w:ins w:id="${changeId[0]++}" w:author="OCE Correction" w:date="${date}"><w:r>${rpr}<w:t xml:space="preserve">${escXml(ins)}</w:t></w:r></w:ins>`;
    if (post) out += `<w:r>${rpr}<w:t xml:space="preserve">${escXml(post)}</w:t></w:r>`;

    const firstStart = runs[sR].index;
    const lastEnd = runs[eR].index + runs[eR][0].length;
    return paraXml.slice(0, firstStart) + out + paraXml.slice(lastEnd);
  };

  // Applique les corrections a un paragraphe :
  //  1. localise chaque correction (recherche tolerante aux espaces) contre le
  //     texte ORIGINAL du paragraphe et calcule ses marques minimales ;
  //  2. resout les chevauchements au niveau des PLAGES de correction : si deux
  //     corrections visent une zone qui se recoupe, on garde la plus large (pour
  //     eviter d'appliquer deux corrections contradictoires et de dupliquer le
  //     texte). Une correction ecartee mais redondante (ses marques sont deja
  //     couvertes par la correction gardee) est comptee comme appliquee ;
  //  3. applique les marques retenues de la fin vers le debut.
  const applyTrackChangesToPara = (paraXml, corrections, appliedFlags, changeId, date) => {
    const RUN_RE = new RegExp(RUN_RE_SRC, "g");
    const runs0 = [...paraXml.matchAll(RUN_RE)];
    if (!runs0.length) return paraXml;
    const texts0 = runs0.map(m => {
      const t = m[0].match(/<w:t[^>]*>([^<]*)<\/w:t>/);
      return t ? t[1] : "";
    });
    const combined = texts0.join("");
    const { norm, map } = buildNormMap(combined);

    // 1. localiser chaque correction + calculer ses ilots (positions absolues)
    const located = [];
    for (let ci = 0; ci < corrections.length; ci++) {
      const { original, suggested } = corrections[ci];
      if (!original) continue;
      const no = normSpaces(original);
      if (!no.trim()) continue;
      const k = norm.indexOf(no);
      if (k === -1) continue;
      const ps = map[k], pe = map[k + no.length];
      if (ps == null || pe == null) continue;
      const rawO = combined.slice(ps, pe);
      const isls = diffIslands(rawO, suggested).map(isl => {
        const a = ps + isl.start;
        return { a, b: a + isl.del.length, ins: isl.ins };
      });
      located.push({ ci, ps, pe, isls });
    }
    if (!located.length) return paraXml;

    // 2. resoudre les chevauchements de plages : par debut croissant, puis plage
    //    la plus large d'abord ; on garde les plages disjointes.
    located.sort((x, y) => (x.ps - y.ps) || ((y.pe - y.ps) - (x.pe - x.ps)));
    const kept = [];
    for (const c of located) {
      const overlaps = kept.some(k => c.ps < k.pe && c.pe > k.ps);
      if (!overlaps) { kept.push(c); if (appliedFlags) appliedFlags[c.ci] = true; }
      else c.overlapped = true;
    }

    // 3. liste des ilots a appliquer (corrections gardees), dedupliques
    const applyIslands = []; const seen = new Set();
    for (const c of kept) {
      for (const it of c.isls) {
        const key = it.a + "|" + it.b + "|" + it.ins;
        if (seen.has(key)) continue;
        seen.add(key); applyIslands.push(it);
      }
    }
    // corrections ecartees mais COUVERTES -> comptees appliquees ; sinon orange.
    // "couverte" = soit ses marques sont deja posees a l'identique (redondance
    // d'ilots), soit sa zone est entierement incluse dans celle d'une correction
    // gardee : cette derniere reecrit toute la zone, donc appliquer la petite
    // serait redondant ou en conflit. On evite ainsi une fausse alerte orange
    // (ex: petit correctif de guillemet avale par une reecriture de phrase).
    for (const c of located) {
      if (!c.overlapped) continue;
      const islandRedundant = c.isls.length > 0 && c.isls.every(it => seen.has(it.a + "|" + it.b + "|" + it.ins));
      const spanCovered = kept.some(k => k.ps <= c.ps && k.pe >= c.pe);
      if ((islandRedundant || spanCovered) && appliedFlags) appliedFlags[c.ci] = true;
    }

    // 4. appliquer de la fin vers le debut pour garder les positions valides
    let result = paraXml;
    applyIslands.sort((x, y) => y.a - x.a);
    for (const it of applyIslands) {
      result = spliceRange(result, combined, it.a, it.b, it.ins, changeId, date);
    }
    return result;
  };

  const downloadWord = async () => {
    const accepted = corrections.filter((_, i) => statuses[i] !== "rejected");
    if (!accepted.length) { alert("Aucune correction à télécharger."); return; }
    if (!fileBytes) { alert("Veuillez uploader un fichier .docx pour utiliser cette fonctionnalité."); return; }

    try {
      setNotApplied([]);
      const zip = await JSZip.loadAsync(fileBytes);
      const docXml = await zip.file("word/document.xml").async("string");
      const date = new Date().toISOString().split(".")[0] + "Z";
      const changeId = [100];

      // Process paragraph by paragraph
      const correctionsList = accepted.map(c => ({ original: c.original, suggested: c.suggested }));
      const appliedFlags = new Array(correctionsList.length).fill(false);
      const result = docXml.replace(/(<w:p\b[\s\S]*?<\/w:p>)/g, (para) =>
        applyTrackChangesToPara(para, correctionsList, appliedFlags, changeId, date)
      );

      zip.file("word/document.xml", result);
      const blob = await zip.generateAsync({
        type: "blob",
        mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = (fileName||"document").replace(/\.docx$/i, "") + "_corrections.docx";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);

      // Filet de securite : signaler les corrections qui n'ont pas pu etre placees
      const manques = accepted.filter((_, i) => !appliedFlags[i]);
      setNotApplied(manques);
    } catch(e) {
      alert("Erreur lors de la génération du fichier : " + e.message);
    }
  };

  return (
    <div style={{display:"flex",flexDirection:"column",height:"100%",overflow:"hidden"}}>
      <PageHeader
        title="Corriger un document"
        sub="Upload · Analyse Claude · Téléchargement Word avec suivi des modifications"
        right={<span style={{fontSize:10,padding:"3px 10px",background:C.cream2,border:`1px solid ${C.border}`,borderRadius:20,color:C.text2,display:"flex",alignItems:"center",gap:5}}><span style={{width:6,height:6,borderRadius:"50%",background:C.green,display:"inline-block"}}/>{consignes.length} consignes actives</span>}
      />

      {error && <div style={{margin:"12px 30px 0",padding:"10px 14px",background:"#fdf0f0",border:`1px solid #f5b7b7`,borderRadius:8,fontSize:12.5,color:C.red}}>{error}</div>}

      <div style={{flex:1,overflowY:"auto",padding:"20px 30px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,alignItems:"start"}}>
        {/* Gauche */}
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <Card>
            <SLabel>Document à corriger</SLabel>
            <div
              onClick={() => fileRef.current.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
              style={{border:`1.5px dashed ${fileName?C.navy2:C.border2}`,background:fileName?"#edf2ff":C.cream2,borderRadius:8,padding:"22px 16px",textAlign:"center",cursor:"pointer",transition:"all .2s"}}
            >
              <div style={{fontSize:26,marginBottom:7}}>📄</div>
              <div style={{fontSize:12.5,fontWeight:500,color:C.text}}>{fileName || "Déposer le fichier ici"}</div>
              <div style={{fontSize:11,color:C.text3,marginTop:3}}>Word (.docx) ou PDF — FR ou AR</div>
              {!fileName && <div style={{fontSize:10.5,color:C.text3,marginTop:5,fontStyle:"italic"}}>Sans fichier : document de démonstration utilisé</div>}
            </div>
            <input ref={fileRef} type="file" accept=".docx,.pdf,.txt" style={{display:"none"}} onChange={e => handleFile(e.target.files[0])} />
          </Card>

          <Card>
            <SLabel>Type de document</SLabel>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
              {[["cp_fr","Communiqué FR","CP presse français"],["cp_ar","بلاغ AR","البلاغ الصحفي"],["bilingue","Bilingue FR/AR","Vérif. cohérence"],["decision_ar","قرار AR","Décision arabe"]].map(([id,label,sub]) => (
                <div key={id} onClick={() => setDocType(id)} style={{padding:"8px 12px",border:`1px solid ${docType===id?C.navy2:C.border}`,borderRadius:7,cursor:"pointer",background:docType===id?C.navy2:"#fff",color:docType===id?"#fff":C.text,transition:"all .15s"}}>
                  <div style={{fontSize:12,fontWeight:500}}>{label}</div>
                  <div style={{fontSize:10,opacity:.6,marginTop:2}}>{sub}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <SLabel>Options de correction</SLabel>
            {[["forme","Corrections de forme","Orthographe, syntaxe, typographie"],["fond","Corrections de fond","Qualification juridique, structure"],["terminologie","Terminologie consacrée","Termes loi n°104-12"],["bilingue","Cohérence bilingue FR↔AR","Alignement terminologique"]].map(([k,label,sub]) => (
              <div key={k} onClick={() => setOpts(o => ({...o,[k]:!o[k]}))} style={{display:"flex",alignItems:"center",gap:9,padding:"7px 10px",border:`1px solid ${opts[k]?C.navy2:C.border}`,borderRadius:7,cursor:"pointer",background:opts[k]?"#f0f4ff":"#fff",marginBottom:5,transition:"all .15s"}}>
                <div style={{width:15,height:15,border:`1.5px solid ${opts[k]?C.navy2:C.border2}`,borderRadius:4,background:opts[k]?C.navy2:"#fff",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  {opts[k] && <svg width="9" height="7" viewBox="0 0 9 7" fill="none"><path d="M1 3.5L3 5.5L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>}
                </div>
                <div>
                  <div style={{fontSize:12,fontWeight:500,color:C.text}}>{label}</div>
                  <div style={{fontSize:10,color:C.text3,marginTop:1}}>{sub}</div>
                </div>
              </div>
            ))}
            <button onClick={analyze} disabled={phase==="loading"} style={{width:"100%",marginTop:9,padding:"9px",border:"none",borderRadius:7,background:phase==="loading"?"#9ca3af":C.navy,color:"#fff",fontSize:13,fontWeight:500,cursor:phase==="loading"?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:7}}>
              {phase==="loading" ? <><Spinner/><span>Analyse en cours…</span></> : <><span>🔍</span><span>Analyser et corriger</span></>}
            </button>
          </Card>
        </div>

        {/* Droite */}
        <div>
          {phase==="idle" && (
            <Card style={{textAlign:"center",padding:"44px 20px"}}>
              <div style={{fontSize:34,marginBottom:10,opacity:.25}}>📋</div>
              <p style={{fontSize:12.5,color:C.text3,lineHeight:1.6}}>Chargez un document et lancez l'analyse<br/>pour voir les corrections suggérées</p>
            </Card>
          )}

          {phase==="loading" && (
            <Card style={{padding:"36px 20px"}}>
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:14}}>
                <Spinner/>
                <div style={{display:"flex",flexDirection:"column",gap:7,width:"100%",maxWidth:240}}>
                  {steps.map((s,i) => (
                    <div key={i} style={{fontSize:11.5,color:i<loadStep?C.green:i===loadStep?C.navy2:C.text3,display:"flex",alignItems:"center",gap:7,fontWeight:i===loadStep?500:400,transition:"color .3s"}}>
                      <span style={{width:6,height:6,borderRadius:"50%",background:i<loadStep?C.green:i===loadStep?C.navy2:C.cream3,flexShrink:0}}/>
                      {s}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {phase==="results" && (
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <Card>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
                  <div style={{fontSize:13,fontWeight:500,color:C.navy2}}>Résumé de l'analyse</div>
                  <span style={{background:score>=7?C.greenLight:C.amberLight,color:score>=7?C.green:C.amber,padding:"2px 9px",borderRadius:20,fontSize:11,fontWeight:600}}>Score : {score}/10</span>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:7,marginBottom:12}}>
                  {[["Forme",corrections.filter(c=>c.type==="forme").length,"#2563eb"],["Fond",corrections.filter(c=>c.type==="fond").length,C.amber],["Terminol.",corrections.filter(c=>c.type==="terminologie"||c.type==="bilingue").length,C.green],["Score",score+"/10",C.navy]].map(([label,val,color]) => (
                    <div key={label} style={{background:C.cream2,borderRadius:7,padding:"10px 8px",textAlign:"center"}}>
                      <div style={{fontFamily:"Georgia,serif",fontSize:20,fontWeight:600,color}}>{val}</div>
                      <div style={{fontSize:9.5,color:C.text2,marginTop:2,textTransform:"uppercase",letterSpacing:".04em"}}>{label}</div>
                    </div>
                  ))}
                </div>
                <div style={{fontSize:11.5,color:C.text2,lineHeight:1.6,padding:"9px 11px",background:C.cream2,borderRadius:6}}>{synthese}</div>
              </Card>

              <Card>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                  <div style={{fontSize:13,fontWeight:500,color:C.navy2}}>Corrections suggérées ({corrections.length})</div>
                  <div style={{display:"flex",gap:5}}>
                    <button onClick={acceptAll} style={{padding:"4px 9px",borderRadius:5,border:`1px solid ${C.border2}`,background:"#fff",fontSize:10.5,cursor:"pointer",color:C.text2}}>Tout accepter</button>
                    <button onClick={rejectAll} style={{padding:"4px 9px",borderRadius:5,border:`1px solid ${C.border2}`,background:"#fff",fontSize:10.5,cursor:"pointer",color:C.text2}}>Tout rejeter</button>
                  </div>
                </div>
                {corrections.map((c,i) => {
                  const st = statuses[i];
                  const bl = TYPE_BORDER[c.type] || "#aaa";
                  return (
                    <div key={i} style={{padding:"10px 12px",border:`1px solid ${C.border}`,borderLeft:`3px solid ${bl}`,borderRadius:8,marginBottom:6,background:st==="accepted"?C.greenLight:st==="rejected"?C.redLight:"#fff",opacity:st==="rejected"?.4:1,transition:"all .2s"}}>
                      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:5}}>
                        <Badge t={c.type.toUpperCase()} small/>
                        {c.code && <span style={{fontSize:9.5,color:C.text3,fontFamily:"monospace"}}>{c.code}</span>}
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:5,flexWrap:"wrap"}}>
                        <span style={{fontSize:11.5,color:C.red,textDecoration:"line-through",fontStyle:"italic"}}>{c.original}</span>
                        <span style={{fontSize:11,color:C.text3}}>→</span>
                        <span style={{fontSize:11.5,color:C.green,fontWeight:500}}>{c.suggested}</span>
                      </div>
                      <div style={{fontSize:10.5,color:C.text2,marginTop:4,lineHeight:1.5}}>{c.reason}</div>
                      <div style={{display:"flex",gap:5,marginTop:7}}>
                        <button onClick={() => setStatus(i,"accepted")} style={{padding:"3px 9px",borderRadius:5,border:"1px solid #a7d7b7",background:C.greenLight,color:C.green,fontSize:10.5,fontWeight:500,cursor:"pointer"}}>✓ Accepter</button>
                        <button onClick={() => setStatus(i,"rejected")} style={{padding:"3px 9px",borderRadius:5,border:"1px solid #f5b7b7",background:C.redLight,color:C.red,fontSize:10.5,fontWeight:500,cursor:"pointer"}}>✗ Rejeter</button>
                      </div>
                    </div>
                  );
                })}
              </Card>

              <button onClick={downloadWord} style={{width:"100%",padding:"10px",border:"none",borderRadius:7,background:C.navy,color:"#fff",fontSize:13,fontWeight:500,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:7}}>
                <span>📥</span> Télécharger Word (.docx) avec corrections
              </button>

              {notApplied.length > 0 && (
                <Card style={{borderLeft:`3px solid ${C.amber}`,background:C.amberLight}}>
                  <div style={{fontSize:12.5,fontWeight:600,color:C.amber,marginBottom:6}}>⚠️ {notApplied.length} correction(s) non appliquée(s) au fichier Word</div>
                  <div style={{fontSize:11,color:C.text2,marginBottom:8,lineHeight:1.5}}>Ces corrections n'ont pas pu être localisées exactement dans le document et doivent être faites à la main. Toutes les autres ont bien été appliquées dans le fichier téléchargé.</div>
                  {notApplied.map((c,i) => (
                    <div key={i} style={{fontSize:11,padding:"6px 9px",background:"#fff",border:`1px solid ${C.border}`,borderRadius:6,marginBottom:5}}>
                      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
                        {c.code && <span style={{fontFamily:"monospace",color:C.text3,fontSize:9.5}}>{c.code}</span>}
                        {c.reason && <span style={{color:C.text3,fontSize:10}}>{c.reason}</span>}
                      </div>
                      <span style={{color:C.red,textDecoration:"line-through"}}>{c.original}</span>
                      <span style={{color:C.text3,margin:"0 5px"}}>→</span>
                      <span style={{color:C.green,fontWeight:500}}>{c.suggested}</span>
                    </div>
                  ))}
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── HISTORIQUE ──
function HistoriquePage({history}) {
  return (
    <div style={{display:"flex",flexDirection:"column",height:"100%"}}>
      <PageHeader title="Historique" sub="Documents traités dans cette session"/>
      <div style={{padding:"22px 30px",flex:1,overflowY:"auto"}}>
        <Card>
          {history.length === 0 ? (
            <div style={{textAlign:"center",padding:"44px 20px",color:C.text3}}>
              <div style={{fontSize:30,marginBottom:9,opacity:.25}}>🕐</div>
              <p style={{fontSize:12.5}}>Aucune correction effectuée dans cette session</p>
            </div>
          ) : (
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:11.5}}>
              <thead>
                <tr style={{borderBottom:`1px solid ${C.cream3}`}}>
                  {["Document","Type","Corrections","Score","Date"].map(h => <th key={h} style={{padding:"8px 13px",textAlign:"left",fontSize:9.5,fontWeight:500,color:C.text3,textTransform:"uppercase",letterSpacing:".05em"}}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {history.map(h => (
                  <tr key={h.id} style={{borderBottom:`1px solid ${C.cream2}`}}>
                    <td style={{padding:"9px 13px",fontWeight:500}}>{h.file}</td>
                    <td style={{padding:"9px 13px"}}><span style={{background:CAT_BG.FORME,color:CAT_FG.FORME,padding:"1px 7px",borderRadius:20,fontSize:9.5,fontWeight:600}}>{TYPE_LABELS[h.type]||h.type}</span></td>
                    <td style={{padding:"9px 13px"}}>{h.corrections}</td>
                    <td style={{padding:"9px 13px"}}><span style={{background:h.score>=7?C.greenLight:C.amberLight,color:h.score>=7?C.green:C.amber,padding:"2px 7px",borderRadius:20,fontSize:10,fontWeight:600}}>{h.score}/10</span></td>
                    <td style={{padding:"9px 13px",color:C.text3}}>{h.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>
    </div>
  );
}

// ── DASHBOARD ──
function DashboardPage({history}) {
  const total = history.length;
  const totalCorr = history.reduce((s,h) => s+h.corrections, 0);
  const avg = total ? (history.reduce((s,h) => s+h.score, 0)/total).toFixed(1) : "—";
  const freq = {};
  history.forEach(h => h.data?.forEach(c => { const k = c.original.substring(0,26); freq[k] = (freq[k]||0)+1; }));
  const sorted = Object.entries(freq).sort((a,b) => b[1]-a[1]).slice(0,5);
  const maxF = sorted[0]?.[1]||1;
  const types = {};
  history.forEach(h => h.data?.forEach(c => { types[c.type] = (types[c.type]||0)+1; }));
  const typeTotal = Object.values(types).reduce((s,v) => s+v, 0)||1;
  const tc = {forme:"#3b82f6",fond:C.gold,terminologie:C.green,bilingue:C.purple};

  return (
    <div style={{display:"flex",flexDirection:"column",height:"100%"}}>
      <PageHeader title="Tableau de bord" sub="Statistiques et erreurs fréquentes"/>
      <div style={{flex:1,overflowY:"auto",padding:"22px 30px",display:"flex",flexDirection:"column",gap:14}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:11}}>
          {[["📄",total,"Documents traités","#edf2ff"],["✏️",totalCorr,"Corrections totales",C.amberLight],["✅",0,"Acceptées",C.greenLight],["⭐",avg,"Score moyen",C.cream2]].map(([icon,num,label,bg]) => (
            <div key={label} style={{background:"#fff",border:`1px solid ${C.border}`,borderRadius:10,padding:"16px 18px",display:"flex",alignItems:"center",gap:13}}>
              <div style={{width:38,height:38,borderRadius:9,background:bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{icon}</div>
              <div><div style={{fontFamily:"Georgia,serif",fontSize:26,fontWeight:600,color:C.navy,lineHeight:1}}>{num}</div><div style={{fontSize:11.5,color:C.text2,marginTop:2}}>{label}</div></div>
            </div>
          ))}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          <Card>
            <div style={{fontSize:13,fontWeight:500,color:C.navy2,marginBottom:12}}>Erreurs les plus fréquentes</div>
            {sorted.length === 0 ? <div style={{fontSize:12,color:C.text3,textAlign:"center",padding:18}}>Aucune donnée disponible</div> :
              sorted.map(([k,v]) => (
                <div key={k} style={{display:"flex",alignItems:"center",gap:9,padding:"6px 9px",background:C.cream2,borderRadius:5,marginBottom:5,fontSize:11.5}}>
                  <span style={{flex:"0 0 130px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}} title={k}>{k}</span>
                  <div style={{flex:1,height:3,background:C.cream3,borderRadius:2}}><div style={{height:3,background:C.navy2,borderRadius:2,width:`${Math.round(v/maxF*100)}%`}}/></div>
                  <span style={{fontSize:10.5,color:C.text3,minWidth:22,textAlign:"right"}}>{v}×</span>
                </div>
              ))
            }
          </Card>
          <Card>
            <div style={{fontSize:13,fontWeight:500,color:C.navy2,marginBottom:12}}>Répartition par type</div>
            {Object.keys(types).length === 0 ? <div style={{fontSize:12,color:C.text3,textAlign:"center",padding:18}}>Aucune donnée disponible</div> :
              Object.entries(types).map(([t,v]) => (
                <div key={t} style={{display:"flex",alignItems:"center",gap:9,fontSize:11.5,marginBottom:9}}>
                  <div style={{width:9,height:9,borderRadius:2,background:tc[t]||"#aaa",flexShrink:0}}/>
                  <div style={{flex:1}}>{t.charAt(0).toUpperCase()+t.slice(1)}</div>
                  <div style={{minWidth:70}}><div style={{height:3,background:C.cream3,borderRadius:2}}><div style={{height:3,background:tc[t]||"#aaa",borderRadius:2,width:`${Math.round(v/typeTotal*100)}%`}}/></div></div>
                  <div style={{minWidth:22,textAlign:"right",color:C.text3}}>{v}</div>
                </div>
              ))
            }
          </Card>
        </div>
      </div>
    </div>
  );
}

// ── CONSIGNES FORM HELPERS (must be outside ConsignesPage to preserve focus) ──
function FInput({label, field, ph, area, form, setForm}) {
  return (
    <div>
      <div style={{fontSize:9.5,fontWeight:500,color:C.text2,textTransform:"uppercase",letterSpacing:".05em",marginBottom:4}}>{label}</div>
      {area
        ? <textarea value={form[field]||""} onChange={e => setForm(f => ({...f,[field]:e.target.value}))} placeholder={ph} rows={area} style={{width:"100%",padding:"7px 10px",border:`1px solid ${C.border}`,borderRadius:7,fontFamily:"inherit",fontSize:12,color:C.text,resize:"vertical",lineHeight:1.5}}/>
        : <input value={form[field]||""} onChange={e => setForm(f => ({...f,[field]:e.target.value}))} placeholder={ph} style={{width:"100%",padding:"7px 10px",border:`1px solid ${C.border}`,borderRadius:7,fontFamily:"inherit",fontSize:12,color:C.text}}/>
      }
    </div>
  );
}

function FSel({label, field, opts, form, setForm}) {
  return (
    <div>
      <div style={{fontSize:9.5,fontWeight:500,color:C.text2,textTransform:"uppercase",letterSpacing:".05em",marginBottom:4}}>{label}</div>
      <select value={form[field]||""} onChange={e => setForm(f => ({...f,[field]:e.target.value}))} style={{width:"100%",padding:"6px 9px",border:`1px solid ${C.border}`,borderRadius:7,fontFamily:"inherit",fontSize:12,color:C.text}}>
        {opts.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </div>
  );
}

const CODE_PREFIX = {FORME:"F",FOND:"D",TERMINOLOGIE:"T",BILINGUE:"B"};

// ── CONSIGNES ──
function ConsignesPage({consignes, setConsignes, onSaveServer, onReloadServer}) {
  const [selected, setSelected] = useState(null);
  const [filterType, setFilterType] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [form, setForm] = useState({});
  const [isNew, setIsNew] = useState(false);
  const [saved, setSaved] = useState(false);
  const [adminToken, setAdminToken] = useState("");
  const [serverMsg, setServerMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const filtered = consignes.filter(c => (!filterType||c.doctype===filterType) && (!filterCat||c.category===filterCat));
  const selC = selected ? consignes.find(c => c.id===selected) : null;

  const selectC = c => { setSelected(c.id); setForm({...c}); setIsNew(false); setSaved(false); };
  const autoCode = (category, existing) => {
    const prefix = CODE_PREFIX[category] || "X";
    const nums = existing
      .filter(c => c.code && c.code.startsWith(prefix+"-"))
      .map(c => parseInt(c.code.split("-")[1])||0);
    const next = nums.length ? Math.max(...nums)+1 : 1;
    return `${prefix}-${String(next).padStart(2,"0")}`;
  };
  const newC = () => {
    const cat = "FORME";
    const code = autoCode(cat, consignes);
    setSelected(null); setIsNew(true); setSaved(false);
    setForm({code, id:code, doctype:"cp_fr", category:cat, mode:"claude", scope:["tout"], active:true, regex:null, label:"", text:"", examples:"", notes:"", version:"1.0"});
  };

  const save = () => {
    if (!form.code || !form.label || !form.text) return;
    if (isNew) {
      const nc = {...form, id:form.code, created:new Date().toLocaleDateString("fr-FR")};
      setConsignes(c => [...c, nc]);
      setSelected(nc.id); setIsNew(false);
    } else {
      setConsignes(cs => cs.map(c => c.id===selected ? {...c,...form,version:(parseFloat(c.version)+0.1).toFixed(1)} : c));
    }
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  const del = () => {
    if (!selected || !confirm("Supprimer cette consigne ?")) return;
    setConsignes(cs => cs.filter(c => c.id !== selected));
    setSelected(null); setIsNew(false);
  };

  const dup = () => {
    const c = consignes.find(x => x.id===selected); if (!c) return;
    const nc = {...c, id:c.code+"-bis", code:c.code+"-bis", created:new Date().toLocaleDateString("fr-FR"), version:"1.0"};
    setConsignes(cs => [...cs, nc]);
    setSelected(nc.id); setForm({...nc}); setIsNew(false);
  };

  const saveToServer = async () => {
    if (!adminToken) { setServerMsg("Saisissez d'abord le mot de passe administrateur."); return; }
    setBusy(true); setServerMsg("Enregistrement sur le serveur…");
    try {
      const r = await onSaveServer(consignes, adminToken);
      setServerMsg(`✓ Enregistré sur le serveur (${r.count} consignes)`);
      setTimeout(() => setServerMsg(""), 4000);
    } catch (e) {
      setServerMsg("Erreur : " + e.message);
    }
    setBusy(false);
  };

  const reloadFromServer = async () => {
    setBusy(true); setServerMsg("Rechargement depuis le serveur…");
    try {
      await onReloadServer();
      setSelected(null); setIsNew(false);
      setServerMsg("✓ Liste rechargée depuis le serveur");
      setTimeout(() => setServerMsg(""), 3000);
    } catch (e) {
      setServerMsg("Erreur : " + e.message);
    }
    setBusy(false);
  };

  return (
    <div style={{display:"flex",flexDirection:"column",height:"100%",overflow:"hidden"}}>
      <PageHeader
        title="Fiches de consignes"
        sub={`Règles de correction par type de document — ${consignes.length} consignes`}
        right={
          <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap",justifyContent:"flex-end"}}>
            <input
              type="password"
              value={adminToken}
              onChange={e => setAdminToken(e.target.value)}
              placeholder="Mot de passe admin"
              style={{padding:"7px 10px",border:`1px solid ${C.border2}`,borderRadius:7,fontFamily:"inherit",fontSize:12,color:C.text,width:160}}
            />
            <button onClick={saveToServer} disabled={busy} style={{padding:"7px 14px",border:"none",borderRadius:7,background:busy?"#9ca3af":C.green,color:"#fff",fontSize:12.5,fontWeight:500,cursor:busy?"not-allowed":"pointer"}}>
              💾 Enregistrer sur le serveur
            </button>
            <button onClick={reloadFromServer} disabled={busy} style={{padding:"7px 14px",border:`1px solid ${C.border2}`,borderRadius:7,background:"#fff",color:C.text2,fontSize:12.5,fontWeight:500,cursor:busy?"not-allowed":"pointer"}}>
              ↻ Recharger
            </button>
            <button onClick={() => {
              const input = document.createElement("input");
              input.type = "file";
              input.accept = ".json";
              input.onchange = async e => {
                try {
                  const text = await e.target.files[0].text();
                  const data = JSON.parse(text);
                  const fiches = data.consignes || data;
                  if (!Array.isArray(fiches)) throw new Error("Format invalide");
                  if (!window.confirm(`Importer ${fiches.length} fiches depuis le fichier JSON ?\nElles remplaceront la liste actuelle (pensez ensuite à Enregistrer sur le serveur).`)) return;
                  setConsignes(fiches);
                } catch(err) {
                  alert("Erreur : " + err.message);
                }
              };
              input.click();
            }} style={{padding:"7px 14px",border:`1px solid ${C.border2}`,borderRadius:7,background:"#fff",color:C.text2,fontSize:12.5,fontWeight:500,cursor:"pointer"}}>
              📂 Importer JSON
            </button>
            <button onClick={() => {
              const data = JSON.stringify({version:"3.0",source:"OCE Platform",created:new Date().toLocaleDateString("fr-FR"),count:consignes.length,consignes}, null, 2);
              const blob = new Blob([data], {type:"application/json"});
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url; a.download = "fiches_consignes.json"; a.click();
              setTimeout(() => URL.revokeObjectURL(url), 1000);
            }} style={{padding:"7px 14px",border:`1px solid ${C.border2}`,borderRadius:7,background:"#fff",color:C.text2,fontSize:12.5,fontWeight:500,cursor:"pointer"}}>
              💾 Exporter JSON
            </button>
            <button onClick={newC} style={{padding:"7px 14px",border:"none",borderRadius:7,background:C.navy,color:"#fff",fontSize:12.5,fontWeight:500,cursor:"pointer"}}>+ Nouvelle consigne</button>
          </div>
        }
      />
      {serverMsg && <div style={{margin:"10px 30px 0",padding:"8px 14px",background:serverMsg.startsWith("Erreur")?C.redLight:C.greenLight,border:`1px solid ${serverMsg.startsWith("Erreur")?"#f5b7b7":"#a7d7b7"}`,borderRadius:8,fontSize:12.5,color:serverMsg.startsWith("Erreur")?C.red:C.green}}>{serverMsg}</div>}
      <div style={{flex:1,padding:"18px 30px",overflow:"hidden",display:"grid",gridTemplateColumns:"255px 1fr",gap:14}}>
        {/* Liste */}
        <div style={{background:"#fff",border:`1px solid ${C.border}`,borderRadius:10,overflow:"hidden",display:"flex",flexDirection:"column"}}>
          <div style={{padding:"10px 12px",borderBottom:`1px solid ${C.border}`,display:"flex",gap:5}}>
            <select value={filterType} onChange={e => setFilterType(e.target.value)} style={{flex:1,padding:"4px 7px",border:`1px solid ${C.border}`,borderRadius:5,fontSize:10.5,fontFamily:"inherit"}}>
              <option value="">Tous types</option>
              {Object.entries(TYPE_LABELS).filter(([k]) => k!=="tous").map(([v,l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <select value={filterCat} onChange={e => setFilterCat(e.target.value)} style={{flex:1,padding:"4px 7px",border:`1px solid ${C.border}`,borderRadius:5,fontSize:10.5,fontFamily:"inherit"}}>
              <option value="">Toutes</option>
              {["FORME","FOND","TERMINOLOGIE","BILINGUE"].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div style={{overflowY:"auto",flex:1}}>
            {filtered.map(c => (
              <div key={c.id} onClick={() => selectC(c)} style={{padding:"8px 12px",borderBottom:`1px solid ${C.cream2}`,cursor:"pointer",display:"flex",alignItems:"center",gap:7,background:selected===c.id?"#edf2ff":"#fff",borderLeft:selected===c.id?`3px solid ${C.navy2}`:"3px solid transparent",opacity:c.active===false?.5:1,transition:"all .1s"}}>
                <span style={{fontSize:9.5,fontWeight:600,color:C.text3,minWidth:32,fontFamily:"monospace"}}>{c.code}</span>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:11,fontWeight:500,color:C.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{c.label}{c.active===false?" (inactive)":""}</div>
                  <div style={{fontSize:9.5,color:C.text3,marginTop:1}}>{TYPE_LABELS[c.doctype]||c.doctype}</div>
                </div>
                <span style={{background:CAT_BG[c.category]||"#f0f0f0",color:CAT_FG[c.category]||"#555",padding:"1px 5px",borderRadius:20,fontSize:8,fontWeight:600,flexShrink:0}}>{c.category}</span>
              </div>
            ))}
            {filtered.length === 0 && <div style={{padding:18,fontSize:12,color:C.text3,textAlign:"center"}}>Aucune consigne</div>}
          </div>
          <div style={{padding:"7px 12px",borderTop:`1px solid ${C.cream2}`,fontSize:9.5,color:C.text3}}>{filtered.length} consigne{filtered.length>1?"s":""}</div>
        </div>

        {/* Éditeur */}
        <div style={{background:"#fff",border:`1px solid ${C.border}`,borderRadius:10,padding:20,overflowY:"auto",display:"flex",flexDirection:"column",gap:12}}>
          {!selected && !isNew ? (
            <div style={{textAlign:"center",padding:"44px 20px",color:C.text3}}>
              <div style={{fontSize:30,marginBottom:9,opacity:.25}}>📋</div>
              <p style={{fontSize:12.5}}>Sélectionnez une consigne ou créez-en une nouvelle</p>
            </div>
          ) : (
            <>
              <div style={{display:"flex",alignItems:"center",gap:9,paddingBottom:12,borderBottom:`1px solid ${C.cream2}`}}>
                <div style={{flex:1,fontSize:13,fontWeight:500,color:C.navy2}}>{isNew ? "Nouvelle consigne" : `Consigne ${selC?.code}`}</div>
                {!isNew && <span style={{fontSize:9.5,padding:"2px 7px",background:C.cream2,border:`1px solid ${C.border}`,borderRadius:20,color:C.text2}}>v{selC?.version}</span>}
                <label style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:C.text2,cursor:"pointer"}}>
                  <input type="checkbox" checked={form.active!==false} onChange={e => setForm(f => ({...f,active:e.target.checked}))}/>
                  Active
                </label>
                {saved && <span style={{fontSize:10,color:C.green,fontWeight:500}}>✓ Enregistré (local)</span>}
                <button onClick={save} style={{padding:"5px 13px",border:"none",borderRadius:6,background:C.navy,color:"#fff",fontSize:11,fontWeight:500,cursor:"pointer"}}>Appliquer</button>
                {!isNew && <button onClick={dup} style={{padding:"5px 11px",border:`1px solid ${C.border2}`,borderRadius:6,background:"#fff",fontSize:11,cursor:"pointer",color:C.text2}}>Dupliquer</button>}
                {!isNew && <button onClick={del} style={{padding:"5px 11px",border:"1px solid #f5b7b7",borderRadius:6,background:C.redLight,fontSize:11,cursor:"pointer",color:C.red}}>Supprimer</button>}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:9}}>
                <FInput label="Code" field="code" ph="ex : F-01" form={form} setForm={setForm}/>
                <FSel label="Type de document" field="doctype" opts={[["cp_fr","CP Français"],["cp_ar","بلاغ AR"],["bilingue","Bilingue"],["decision_ar","Décision AR"],["tous","Tous types"]]} form={form} setForm={setForm}/>
                <div>
                <div style={{fontSize:9.5,fontWeight:500,color:C.text2,textTransform:"uppercase",letterSpacing:".05em",marginBottom:4}}>Catégorie</div>
                <select value={form.category||""} onChange={e => {
                  const cat = e.target.value;
                  const newCode = isNew ? autoCode(cat, consignes) : form.code;
                  setForm(f => ({...f, category:cat, code:newCode, id:newCode}));
                }} style={{width:"100%",padding:"6px 9px",border:`1px solid ${C.border}`,borderRadius:7,fontFamily:"inherit",fontSize:12,color:C.text}}>
                  {[["FORME","Forme"],["FOND","Fond"],["TERMINOLOGIE","Terminologie"],["BILINGUE","Bilingue"]].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              </div>
              <FInput label="Intitulé de la consigne" field="label" ph="ex : Formule d'ouverture FR" form={form} setForm={setForm}/>
              <FInput label="Description / règle complète" field="text" ph="Décrire la règle de correction, les formulations correctes, les erreurs à détecter…" area={4} form={form} setForm={setForm}/>
              <FInput label="Exemples (incorrect → correct)" field="examples" ph="Incorrect : xxx → Correct : yyy" area={3} form={form} setForm={setForm}/>
              <FInput label="Notes / source" field="notes" ph="ex : Article 13 loi n°104-12" form={form} setForm={setForm}/>
              <div style={{fontSize:10.5,color:C.text3,lineHeight:1.6,padding:"9px 11px",background:C.cream2,borderRadius:6}}>
                Après « Appliquer », cliquez sur « Enregistrer sur le serveur » (en haut) pour rendre vos changements permanents. Sinon ils restent dans cette session seulement.
              </div>
              {!isNew && <div style={{fontSize:10.5,color:C.text3,paddingTop:8,borderTop:`1px solid ${C.cream2}`}}>Créé le {selC?.created} · Version {selC?.version} · Mode {selC?.mode||"claude"}</div>}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── UTILISATEURS ──
function UtilisateursPage() {
  const [users, setUsers] = useState([
    {id:1,name:"Ahmed Rachidi",role:"Rapporteur",docs:12,lastLogin:"23/04/2026",active:true},
    {id:2,name:"Fatima Zahra Idrissi",role:"Rapporteur",docs:8,lastLogin:"22/04/2026",active:true},
    {id:3,name:"Karim Benali",role:"Administrateur",docs:0,lastLogin:"20/04/2026",active:true},
  ]);

  const toggle = id => setUsers(us => us.map(u => u.id===id ? {...u,active:!u.active} : u));
  const add = () => {
    const name = prompt("Nom complet du nouvel utilisateur :");
    if (name) setUsers(us => [...us, {id:Date.now(),name,role:"Rapporteur",docs:0,lastLogin:"—",active:true}]);
  };

  return (
    <div style={{display:"flex",flexDirection:"column",height:"100%"}}>
      <PageHeader
        title="Utilisateurs"
        sub="Rapporteurs et administrateurs de la plateforme"
        right={<button onClick={add} style={{padding:"7px 14px",border:"none",borderRadius:7,background:C.navy,color:"#fff",fontSize:12.5,fontWeight:500,cursor:"pointer"}}>+ Ajouter</button>}
      />
      <div style={{padding:"22px 30px",flex:1,overflowY:"auto"}}>
        <Card>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:11.5}}>
            <thead>
              <tr style={{borderBottom:`1px solid ${C.cream3}`}}>
                {["Nom","Rôle","Documents","Dernière connexion","Statut","Actions"].map(h => <th key={h} style={{padding:"8px 13px",textAlign:"left",fontSize:9.5,fontWeight:500,color:C.text3,textTransform:"uppercase",letterSpacing:".05em"}}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={{borderBottom:`1px solid ${C.cream2}`}}>
                  <td style={{padding:"9px 13px",fontWeight:500}}>{u.name}</td>
                  <td style={{padding:"9px 13px"}}><span style={{background:u.role==="Administrateur"?C.amberLight:"#dbeafe",color:u.role==="Administrateur"?C.amber:"#1e40af",padding:"2px 7px",borderRadius:20,fontSize:9.5,fontWeight:600}}>{u.role}</span></td>
                  <td style={{padding:"9px 13px"}}>{u.docs}</td>
                  <td style={{padding:"9px 13px",color:C.text3}}>{u.lastLogin}</td>
                  <td style={{padding:"9px 13px"}}><span style={{background:u.active?C.greenLight:C.cream2,color:u.active?C.green:C.text3,padding:"2px 7px",borderRadius:20,fontSize:9.5,fontWeight:600}}>{u.active?"Actif":"Inactif"}</span></td>
                  <td style={{padding:"9px 13px"}}>
                    <button onClick={() => toggle(u.id)} style={{padding:"3px 9px",border:`1px solid ${C.border2}`,borderRadius:5,background:"#fff",fontSize:10.5,cursor:"pointer",color:C.text2}}>{u.active?"Désactiver":"Activer"}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}

// ── ROOT ──
function ComparaisonPage({consignes}) {
  const [frName, setFrName] = useState("");
  const [frText, setFrText] = useState("");
  const [arName, setArName] = useState("");
  const [arText, setArText] = useState("");
  const [phase, setPhase] = useState("idle");
  const [discrepancies, setDiscrepancies] = useState([]);
  const [summary, setSummary] = useState("");
  const [error, setError] = useState("");
  const frRef = useRef(null);
  const arRef = useRef(null);

  // Extraction par paragraphe, identique a la page de correction.
  const extractDocx = async f => {
    const ab = await f.arrayBuffer();
    try {
      const zip = await JSZip.loadAsync(ab);
      const docXml = await zip.file("word/document.xml").async("string");
      const paras = [...docXml.matchAll(/<w:p\b[\s\S]*?<\/w:p>/g)].map(p => {
        const t = [...p[0].matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/g)].map(m => m[1]).join("");
        return t.replace(/[ \t\u00a0\u202f\u2009]+/g, " ").trim();
      }).filter(t => t.length);
      return paras.join("\n");
    } catch (e) {
      return await f.text();
    }
  };

  const handleFr = async f => { if (!f) return; setFrName(f.name); setFrText(await extractDocx(f)); };
  const handleAr = async f => { if (!f) return; setArName(f.name); setArText(await extractDocx(f)); };

  const compare = async () => {
    setError("");
    if (!frText || !arText) { setError("Charge les deux fichiers : la version française et la version arabe."); return; }
    setPhase("loading");
    try {
      const res = await fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ textFr: frText, textAr: arText, consignes }),
      });
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || ("HTTP " + res.status)); }
      const d = await res.json();
      setDiscrepancies(d.discrepancies || []);
      setSummary(d.summary || "");
      setPhase("results");
    } catch (err) {
      setError("Erreur lors de la comparaison : " + err.message);
      setPhase("idle");
    }
  };

  const CATB = { chiffre:["#dbeafe","#1e40af"], date:["#fdf5e0","#7a4a00"], qualification:["#f0e8f8","#4a1a6e"], terminologie:["#e8f5ec","#1a5c2a"], autre:["#ece9e0","#5a5a4a"] };
  const CATL = { chiffre:"CHIFFRE", date:"DATE", qualification:"QUALIFICATION", terminologie:"TERMINOLOGIE", autre:"AUTRE" };
  const sevColor = s => s === "haute" ? C.red : s === "basse" ? C.text3 : C.amber;

  const exportReport = () => {
    const esc = s => String(s == null ? "" : s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
    const rows = discrepancies.map(d => `<tr>
      <td class="cat">${esc((CATL[d.category]||d.category||"").toLowerCase())}</td>
      <td>${esc(d.fr)}</td>
      <td dir="auto">${esc(d.ar)}</td>
      <td class="note">${esc(d.note||"")}</td></tr>`).join("");
    const body = discrepancies.length
      ? `<table><thead><tr><th>Type</th><th>Version FR</th><th>Version AR</th><th>Écart</th></tr></thead><tbody>${rows}</tbody></table>`
      : `<p class="ok">Aucun écart détecté : les deux versions sont cohérentes.</p>`;
    const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>Rapport de comparaison bilingue</title>
<style>body{font-family:Georgia,serif;color:#1a1a2e;max-width:900px;margin:24px auto;padding:0 20px}
h1{font-size:20px;color:#0f2650}.meta{font-size:12px;color:#6a6a7a;margin-bottom:16px}
.sum{background:#f0ede4;padding:12px 14px;border-radius:8px;font-size:13px;margin-bottom:18px}
table{width:100%;border-collapse:collapse;font-size:12.5px}th,td{border:1px solid #d8d3c8;padding:7px 9px;text-align:left;vertical-align:top}
th{background:#0f2650;color:#fff;font-weight:600}.cat{font-variant:small-caps;color:#1e40af}.note{color:#4a4a6a}.ok{color:#1a5c2a;font-size:14px}</style></head>
<body><h1>Rapport de comparaison bilingue FR / AR</h1>
<div class="meta">FR : ${esc(frName||"version française")} &nbsp;·&nbsp; AR : ${esc(arName||"version arabe")} &nbsp;·&nbsp; ${discrepancies.length} écart(s)</div>
${summary ? `<div class="sum">${esc(summary)}</div>` : ""}
${body}</body></html>`;
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "comparaison_bilingue.html"; a.click();
    URL.revokeObjectURL(url);
  };

  const dropZone = (name, onFile, ref, label, sub) => (
    <div
      onClick={() => ref.current.click()}
      onDragOver={e => e.preventDefault()}
      onDrop={e => { e.preventDefault(); onFile(e.dataTransfer.files[0]); }}
      style={{border:`1.5px dashed ${name?C.navy2:C.border2}`,background:name?"#edf2ff":C.cream2,borderRadius:8,padding:"18px 14px",textAlign:"center",cursor:"pointer",transition:"all .2s"}}
    >
      <div style={{fontSize:22,marginBottom:5}}>📄</div>
      <div style={{fontSize:12,fontWeight:500,color:C.text}}>{name || label}</div>
      <div style={{fontSize:10.5,color:C.text3,marginTop:3}}>{sub}</div>
      <input ref={ref} type="file" accept=".docx,.txt" style={{display:"none"}} onChange={e => onFile(e.target.files[0])} />
    </div>
  );

  return (
    <div style={{display:"flex",flexDirection:"column",height:"100%",overflow:"hidden"}}>
      <PageHeader
        title="Comparaison bilingue"
        sub="Charger la version FR et la version AR · Rapport des écarts entre les deux"
        right={<span style={{fontSize:10,padding:"3px 10px",background:C.cream2,border:`1px solid ${C.border}`,borderRadius:20,color:C.text2}}>FR ↔ AR</span>}
      />

      {error && <div style={{margin:"12px 30px 0",padding:"10px 14px",background:"#fdf0f0",border:`1px solid #f5b7b7`,borderRadius:8,fontSize:12.5,color:C.red}}>{error}</div>}

      <div style={{flex:1,overflowY:"auto",padding:"20px 30px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,alignItems:"start"}}>
        {/* Gauche : les deux fichiers */}
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <Card>
            <SLabel>Version française</SLabel>
            {dropZone(frName, handleFr, frRef, "Déposer le communiqué FR", "Word (.docx) en français")}
          </Card>
          <Card>
            <SLabel>Version arabe</SLabel>
            {dropZone(arName, handleAr, arRef, "Déposer le communiqué AR", "البلاغ بالعربية (.docx)")}
          </Card>
          <button onClick={compare} disabled={phase==="loading"} style={{width:"100%",padding:"10px",border:"none",borderRadius:7,background:phase==="loading"?"#9ca3af":C.navy,color:"#fff",fontSize:13,fontWeight:500,cursor:phase==="loading"?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:7}}>
            {phase==="loading" ? <><Spinner/><span>Comparaison en cours…</span></> : <><span>🔀</span><span>Comparer les deux versions</span></>}
          </button>
        </div>

        {/* Droite : rapport */}
        <div>
          {phase==="idle" && (
            <Card style={{textAlign:"center",padding:"44px 20px"}}>
              <div style={{fontSize:34,marginBottom:10,opacity:.25}}>🔀</div>
              <p style={{fontSize:12.5,color:C.text3,lineHeight:1.6}}>Chargez les deux versions et lancez la comparaison<br/>pour voir le rapport d'écarts</p>
            </Card>
          )}

          {phase==="loading" && (
            <Card style={{padding:"40px 20px"}}>
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:12}}>
                <Spinner/>
                <div style={{fontSize:12,color:C.text2}}>Comparaison des chiffres, dates et terminologie…</div>
              </div>
            </Card>
          )}

          {phase==="results" && (
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <Card>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                  <div style={{fontSize:13,fontWeight:500,color:C.navy2}}>Cohérence bilingue</div>
                  <span style={{background:discrepancies.length?C.amberLight:C.greenLight,color:discrepancies.length?C.amber:C.green,padding:"2px 9px",borderRadius:20,fontSize:11,fontWeight:600}}>{discrepancies.length} écart(s)</span>
                </div>
                {summary && <div style={{fontSize:11.5,color:C.text2,lineHeight:1.6,padding:"9px 11px",background:C.cream2,borderRadius:6}}>{summary}</div>}
              </Card>

              {discrepancies.length === 0 ? (
                <Card style={{borderLeft:`3px solid ${C.green}`,background:C.greenLight}}>
                  <div style={{fontSize:12.5,fontWeight:600,color:C.green,marginBottom:4}}>✓ Aucun écart détecté</div>
                  <div style={{fontSize:11,color:C.text2,lineHeight:1.5}}>Les deux versions concordent sur les points vérifiés : chiffres, dates, qualification de l'opération et terminologie.</div>
                </Card>
              ) : (
                <Card>
                  <div style={{fontSize:13,fontWeight:500,color:C.navy2,marginBottom:10}}>Écarts relevés ({discrepancies.length})</div>
                  {discrepancies.map((d,i) => {
                    const cb = CATB[d.category] || CATB.autre;
                    return (
                      <div key={i} style={{padding:"10px 12px",border:`1px solid ${C.border}`,borderLeft:`3px solid ${sevColor(d.severity)}`,borderRadius:8,marginBottom:6,background:"#fff"}}>
                        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}>
                          <span style={{fontSize:9,fontWeight:600,letterSpacing:".04em",padding:"2px 7px",borderRadius:4,background:cb[0],color:cb[1]}}>{CATL[d.category]||"AUTRE"}</span>
                          {d.deterministic && <span style={{fontSize:9,color:C.text3}}>vérif. auto</span>}
                          <span style={{marginLeft:"auto",fontSize:9.5,color:sevColor(d.severity)}}>{d.severity||"moyenne"}</span>
                        </div>
                        <div style={{display:"grid",gridTemplateColumns:"26px 1fr",gap:"4px 8px",alignItems:"baseline"}}>
                          <span style={{fontSize:9.5,color:C.text3,fontWeight:600}}>FR</span>
                          <span style={{fontSize:11.5,color:C.text,unicodeBidi:"plaintext"}}>{d.fr}</span>
                          <span style={{fontSize:9.5,color:C.text3,fontWeight:600}}>AR</span>
                          <span style={{fontSize:11.5,color:C.text,unicodeBidi:"plaintext"}}>{d.ar}</span>
                        </div>
                        {d.note && <div style={{fontSize:10.5,color:C.text2,marginTop:6,lineHeight:1.5}}>{d.note}</div>}
                      </div>
                    );
                  })}
                </Card>
              )}

              <button onClick={exportReport} style={{width:"100%",padding:"10px",border:`1px solid ${C.navy2}`,borderRadius:7,background:"#fff",color:C.navy,fontSize:13,fontWeight:500,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:7}}>
                <span>📤</span> Exporter le rapport (.html)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState("correction");
  const [consignes, setConsignes] = useState(DEFAULT_CONSIGNES);
  const [history, setHistory] = useState([]);

  // Charge les consignes depuis le serveur au demarrage (source unique).
  const loadConsignes = async () => {
    const r = await fetch("/api/consignes");
    if (!r.ok) throw new Error("HTTP " + r.status);
    const d = await r.json();
    if (Array.isArray(d.consignes)) setConsignes(d.consignes);
  };

  useEffect(() => {
    loadConsignes().catch(e => console.warn("Consignes : lecture serveur impossible, repli local.", e));
  }, []);

  // Enregistre la liste complete sur le serveur (protege par mot de passe admin).
  const saveConsignesToServer = async (liste, jeton) => {
    const r = await fetch("/api/consignes", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-token": jeton },
      body: JSON.stringify({ consignes: liste }),
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(d.error || ("HTTP " + r.status));
    return d;
  };

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #d8d3c8; border-radius: 2px; }
        input, select, textarea, button { font-family: inherit; }
      `}</style>
      <div style={{display:"flex",height:"100vh",overflow:"hidden",background:C.cream}}>
        <Sidebar page={page} setPage={setPage}/>
        <main style={{flex:1,overflow:"hidden",display:"flex",flexDirection:"column"}}>
          {page==="correction"    && <CorrectionPage consignes={consignes} history={history} setHistory={setHistory}/>}
          {page==="comparaison"   && <ComparaisonPage consignes={consignes}/>}
          {page==="historique"    && <HistoriquePage history={history}/>}
          {page==="dashboard"     && <DashboardPage history={history}/>}
          {page==="consignes"     && <ConsignesPage consignes={consignes} setConsignes={setConsignes} onSaveServer={saveConsignesToServer} onReloadServer={loadConsignes}/>}
          {page==="utilisateurs"  && <UtilisateursPage/>}
        </main>
      </div>
    </>
  );
}
