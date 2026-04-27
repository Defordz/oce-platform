import { useState, useRef } from "react";
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

const DEFAULT_CONSIGNES = [
  {id:"F-01",code:"F-01",doctype:"cp_fr",category:"FORME",label:"Formule d'ouverture FR",text:"Le Conseil de la Concurrence met à la disposition du public le « résumé de l'opération ». Vérifier l'absence de mots parasites dans le verbe \"met\".",examples:"Incorrect : dsdmet → Correct : met",notes:"Art. 13 loi n°104-12",created:"2026-04-23",version:"1.0"},
  {id:"F-02",code:"F-02",doctype:"cp_fr",category:"FORME",label:"Désignation officielle institution",text:"\"Conseil de la Concurrence\" avec deux majuscules C. Vérifier chaque occurrence dans le document.",examples:"Incorrect : Codsdncurrence → Correct : Concurrence\nIncorrect : conseil de la concurrence → Correct : Conseil de la Concurrence",notes:"Nom officiel",created:"2026-04-23",version:"1.0"},
  {id:"F-03",code:"F-03",doctype:"cp_fr",category:"FORME",label:"Formule de complétude",text:"\"pris pour l'application\" — vérifier l'absence de mots parasites dans \"pour\".",examples:"Incorrect : pdsour → Correct : pour",notes:"Art. 9 décret n°2-14-652",created:"2026-04-23",version:"1.0"},
  {id:"F-08",code:"F-08",doctype:"cp_fr",category:"FORME",label:"Délai observations — tiers intéressés",text:"\"tiers intéressés\" — orthographe sans insertion parasite.",examples:"Incorrect : indstéressés → Correct : intéressés",notes:"Erreur de frappe fréquente",created:"2026-04-23",version:"1.0"},
  {id:"F-12",code:"F-12",doctype:"cp_fr",category:"FORME",label:"Guillemets français obligatoires",text:"Utiliser « … » avec espaces insécables pour toutes les dénominations sociales.",examples:"Incorrect : \"Société X\" → Correct : « Société X »",notes:"Typographie française",created:"2026-04-23",version:"1.0"},
  {id:"D-01",code:"D-01",doctype:"cp_fr",category:"FOND",label:"Prise de contrôle exclusif — formule",text:"\"prise du contrôle exclusif par [acquéreur] de [cible]\" — \"du\" obligatoire.",examples:"Incorrect : prise de le contrôle → Correct : prise du contrôle",notes:"Art. 11 loi n°104-12",created:"2026-04-23",version:"1.0"},
  {id:"D-05",code:"D-05",doctype:"cp_fr",category:"FOND",label:"Cohérence titre / résumé",text:"Ne pas cumuler \"opération de\" et \"projet de\". Choisir l'un ou l'autre.",examples:"Incorrect : opération de projet de concentration → Correct : opération de concentration",notes:"Vérifier systématiquement",created:"2026-04-23",version:"1.0"},
  {id:"D-07",code:"D-07",doctype:"cp_fr",category:"FOND",label:"Droit applicable des sociétés",text:"Préciser \"de droit marocain\" ou \"de droit [pays]\" à la première mention de chaque partie.",examples:"Incorrect : société anonyme → Correct : société anonyme de droit marocain",notes:"Vérifier pour chaque partie",created:"2026-04-23",version:"1.0"},
  {id:"A-01",code:"A-01",doctype:"cp_ar",category:"FORME",label:"الصيغة الافتتاحية",text:"طبقا للمادة 13 من القانون رقم 12.104 المتعلق بحرية الأسعار والمنافسة والمادة 10 من المرسوم التطبيقي رقم 652.14.2 كما تم تغييرهما وتتميمهما، يضع مجلس المنافسة رهن إشارة العموم ملخص العملية.",examples:"الصيغة ثابتة — عدم التعديل",notes:"نص ثابت",created:"2026-04-23",version:"1.0"},
  {id:"A-07",code:"A-07",doctype:"cp_ar",category:"TERMINOLOGIE",label:"الجهة المقتنية",text:"استخدام \"الجهة المقتنية\" وليس \"المستحوذ\" ولا \"المشتري\".",examples:"غير صحيح : المستحوذ → صحيح : الجهة المقتنية",notes:"مصطلح رسمي معتمد",created:"2026-04-23",version:"1.0"},
  {id:"B-02",code:"B-02",doctype:"bilingue",category:"BILINGUE",label:"Qualification FR↔AR",text:"contrôle exclusif ↔ المراقبة الحصرية / contrôle conjoint ↔ المراقبة المشتركة",examples:"FR: contrôle exclusif ↔ AR: المراقبة الحصرية",notes:"Comparer terme à terme",created:"2026-04-23",version:"1.0"},
  {id:"B-03",code:"B-03",doctype:"bilingue",category:"BILINGUE",label:"Chiffres cohérence FR↔AR",text:"Pourcentages, capitaux et numéros RC identiques dans les deux versions.",examples:"FR: 45% ↔ AR: 45 في المائة",notes:"Vérifier arithmétiquement",created:"2026-04-23",version:"1.0"},
];

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
      // Extract text from all w:t tags
      const textMatches = [...docXml.matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/g)];
      const extracted = textMatches.map(m => m[1]).join(" ").replace(/\s+/g, " ").trim();
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
    setPhase("loading"); setLoadStep(0); setStatuses({}); setError("");

    // Animate steps
    for (let i = 0; i < steps.length; i++) {
      setLoadStep(i);
      await sleep(400 + Math.random() * 300);
    }

    const text = fileContent || DEMO_TEXT;
    const activeOpts = Object.entries(opts).filter(([,v]) => v).map(([k]) => k).join(", ");

    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
    if (!apiKey) {
      setError("Clé API manquante. Ajoutez VITE_ANTHROPIC_API_KEY dans les variables d'environnement Vercel.");
      setPhase("idle");
      return;
    }

    const consignesText = consignes
      .filter(c => c.doctype === docType || c.doctype === "bilingue" || c.doctype === "tous")
      .map(c => `[${c.code}] ${c.label}: ${c.text.substring(0,150)}`)
      .join("\n");

    const formeInstructions = opts.forme ? `
CORRECTIONS DE FORME (OBLIGATOIRE - cherche toutes les erreurs suivantes):
- Fautes d'orthographe: mots mal écrits, lettres manquantes ou en trop (ex: "dsd", "pds" insérés dans les mots)
- Mots parasites insérés dans d'autres mots (ex: "dsdmet" → "met", "pdsour" → "pour", "indstéressés" → "intéressés")
- Erreurs de frappe évidentes
- Problèmes de typographie (guillemets, espaces)
- Majuscules manquantes ou incorrectes
` : "";

    const fondInstructions = opts.fond ? `
CORRECTIONS DE FOND (OBLIGATOIRE - cherche toutes les erreurs suivantes):
- Formulations juridiques incorrectes selon la loi n°104-12
- Structure du document non conforme
- Qualifications juridiques erronées (ex: "opération de projet de concentration" → "opération de concentration")
- Références légales incorrectes
- Incohérences dans la désignation des parties
` : "";

    const terminologieInstructions = opts.terminologie ? `
TERMINOLOGIE (cherche les termes non conformes):
${consignesText}
` : "";

    const prompt = `Tu es un expert en correction de documents juridiques du Conseil de la Concurrence marocain.
Tu dois analyser le document et trouver TOUTES les erreurs présentes.

Type de document: ${docType}

${formeInstructions}
${fondInstructions}
${terminologieInstructions}

DOCUMENT À CORRIGER:
${text.substring(0, 6000)}${text.length > 6000 ? "...[tronqué]" : ""}

RÈGLES IMPORTANTES:
- Le champ "original" doit contenir EXACTEMENT le texte tel qu'il apparaît dans le document, mot pour mot
- Le champ "suggested" contient la correction
- Si un mot parasite est inséré dans un mot (ex: "dsdmet"), "original" = "dsdmet" et "suggested" = "met"
- Cherche TOUTES les occurrences de chaque type d'erreur dans tout le document
- Ne pas inventer des erreurs qui n'existent pas

Réponds UNIQUEMENT en JSON valide, sans markdown, sans backticks:
{
  "corrections": [
    {
      "type": "forme|fond|terminologie|bilingue",
      "code": "F-01 ou vide si pas de consigne applicable",
      "original": "texte exact du document avec l'erreur",
      "suggested": "texte corrigé",
      "reason": "explication courte"
    }
  ],
  "synthese": "résumé de l'analyse en 2-3 phrases",
  "score": 7
}`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-opus-4-5",
          max_tokens: 2000,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || `HTTP ${res.status}`);
      }

      const data = await res.json();
      const raw = data.content[0].text.trim().replace(/^```[\s\S]*?\n/,"").replace(/```[\s]*$/,"").trim();
      const parsed = JSON.parse(raw);

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

  // Apply Track Changes across runs in a paragraph
  const applyTrackChangesToPara = (paraXml, corrections, changeId, date) => {
    const RUN_RE = /(<w:r[ >](?:(?!<w:r[ >])[\s\S])*?<\/w:r>)/g;
    let result = paraXml;

    for (const { original, suggested } of corrections) {
      const runMatches = [...result.matchAll(RUN_RE)];
      if (!runMatches.length) continue;

      const texts = runMatches.map(m => {
        const t = m[0].match(/<w:t[^>]*>([^<]*)<\/w:t>/);
        return t ? t[1] : "";
      });
      const combined = texts.join("");
      const pos = combined.indexOf(original);
      if (pos === -1) continue;

      const end = pos + original.length;
      let cum = 0, startRun = null, endRun = null;
      for (let i = 0; i < texts.length; i++) {
        const runEnd = cum + texts[i].length;
        if (startRun === null && runEnd > pos) startRun = i;
        if (runEnd >= end) { endRun = i; break; }
        cum += texts[i].length;
      }
      if (startRun === null || endRun === null) continue;

      // Get formatting from first run
      const firstRunXml = runMatches[startRun][0];
      const rprMatch = firstRunXml.match(/<w:rPr>[\s\S]*?<\/w:rPr>/);
      const rpr = rprMatch ? rprMatch[0] : "";

      // Text before/after match within the spanned runs
      const spanStart = texts.slice(0, startRun).join("").length;
      const spanEnd = texts.slice(0, endRun + 1).join("").length;
      const preText = combined.slice(spanStart, pos);
      const postText = combined.slice(end, spanEnd);

      const preXml = preText ? `<w:r>${rpr}<w:t xml:space="preserve">${escXml(preText)}</w:t></w:r>` : "";
      const postXml = postText ? `<w:r>${rpr}<w:t xml:space="preserve">${escXml(postText)}</w:t></w:r>` : "";
      const delBlock = `<w:del w:id="${changeId[0]++}" w:author="OCE Correction" w:date="${date}"><w:r>${rpr}<w:delText xml:space="preserve">${escXml(original)}</w:delText></w:r></w:del>`;
      const insBlock = `<w:ins w:id="${changeId[0]++}" w:author="OCE Correction" w:date="${date}"><w:r>${rpr}<w:t xml:space="preserve">${escXml(suggested)}</w:t></w:r></w:ins>`;
      const replacement = preXml + delBlock + insBlock + postXml;

      const firstStart = runMatches[startRun].index;
      const lastEnd = runMatches[endRun].index + runMatches[endRun][0].length;
      result = result.slice(0, firstStart) + replacement + result.slice(lastEnd);
    }
    return result;
  };

  const downloadWord = async () => {
    const accepted = corrections.filter((_, i) => statuses[i] !== "rejected");
    if (!accepted.length) { alert("Aucune correction à télécharger."); return; }
    if (!fileBytes) { alert("Veuillez uploader un fichier .docx pour utiliser cette fonctionnalité."); return; }

    try {
      const zip = await JSZip.loadAsync(fileBytes);
      const docXml = await zip.file("word/document.xml").async("string");
      const date = new Date().toISOString().split(".")[0] + "Z";
      const changeId = [100];

      // Process paragraph by paragraph
      const correctionsList = accepted.map(c => ({ original: c.original, suggested: c.suggested }));
      const result = docXml.replace(/(<w:p[ >][\s\S]*?<\/w:p>)/g, (para) =>
        applyTrackChangesToPara(para, correctionsList, changeId, date)
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
    } catch(e) {
      alert("Erreur lors de la génération du fichier : " + e.message);
    }
  };

  return (
    <div style={{display:"flex",flexDirection:"column",height:"100%",overflow:"hidden"}}>
      <PageHeader
        title="Corriger un document"
        sub="Upload · Analyse Claude · Téléchargement Word avec suivi des modifications"
        right={<span style={{fontSize:10,padding:"3px 10px",background:C.cream2,border:`1px solid ${C.border}`,borderRadius:20,color:C.text2,display:"flex",alignItems:"center",gap:5}}><span style={{width:6,height:6,borderRadius:"50%",background:C.green,display:"inline-block"}}/>Fiche v1.0 active</span>}
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
                <span>📥</span> Télécharger Word (.doc) avec corrections
              </button>
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

// ── CONSIGNES ──
function ConsignesPage({consignes, setConsignes}) {
  const [selected, setSelected] = useState(null);
  const [filterType, setFilterType] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [form, setForm] = useState({});
  const [isNew, setIsNew] = useState(false);
  const [saved, setSaved] = useState(false);

  const filtered = consignes.filter(c => (!filterType||c.doctype===filterType) && (!filterCat||c.category===filterCat));
  const selC = selected ? consignes.find(c => c.id===selected) : null;

  const selectC = c => { setSelected(c.id); setForm({...c}); setIsNew(false); setSaved(false); };
  const newC = () => { setSelected(null); setIsNew(true); setSaved(false); setForm({code:"",doctype:"cp_fr",category:"FORME",label:"",text:"",examples:"",notes:"",version:"1.0"}); };

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

  const FInput = ({label, field, ph, area}) => (
    <div>
      <div style={{fontSize:9.5,fontWeight:500,color:C.text2,textTransform:"uppercase",letterSpacing:".05em",marginBottom:4}}>{label}</div>
      {area
        ? <textarea value={form[field]||""} onChange={e => setForm(f => ({...f,[field]:e.target.value}))} placeholder={ph} rows={area} style={{width:"100%",padding:"7px 10px",border:`1px solid ${C.border}`,borderRadius:7,fontFamily:"inherit",fontSize:12,color:C.text,resize:"vertical",lineHeight:1.5}}/>
        : <input value={form[field]||""} onChange={e => setForm(f => ({...f,[field]:e.target.value}))} placeholder={ph} style={{width:"100%",padding:"7px 10px",border:`1px solid ${C.border}`,borderRadius:7,fontFamily:"inherit",fontSize:12,color:C.text}}/>
      }
    </div>
  );

  const FSel = ({label, field, opts}) => (
    <div>
      <div style={{fontSize:9.5,fontWeight:500,color:C.text2,textTransform:"uppercase",letterSpacing:".05em",marginBottom:4}}>{label}</div>
      <select value={form[field]||""} onChange={e => setForm(f => ({...f,[field]:e.target.value}))} style={{width:"100%",padding:"6px 9px",border:`1px solid ${C.border}`,borderRadius:7,fontFamily:"inherit",fontSize:12,color:C.text}}>
        {opts.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </div>
  );

  return (
    <div style={{display:"flex",flexDirection:"column",height:"100%",overflow:"hidden"}}>
      <PageHeader
        title="Fiches de consignes"
        sub={`Règles de correction par type de document — ${consignes.length} consignes`}
        right={<button onClick={newC} style={{padding:"7px 14px",border:"none",borderRadius:7,background:C.navy,color:"#fff",fontSize:12.5,fontWeight:500,cursor:"pointer"}}>+ Nouvelle consigne</button>}
      />
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
              <div key={c.id} onClick={() => selectC(c)} style={{padding:"8px 12px",borderBottom:`1px solid ${C.cream2}`,cursor:"pointer",display:"flex",alignItems:"center",gap:7,background:selected===c.id?"#edf2ff":"#fff",borderLeft:selected===c.id?`3px solid ${C.navy2}`:"3px solid transparent",transition:"all .1s"}}>
                <span style={{fontSize:9.5,fontWeight:600,color:C.text3,minWidth:32,fontFamily:"monospace"}}>{c.code}</span>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:11,fontWeight:500,color:C.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{c.label}</div>
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
                {saved && <span style={{fontSize:10,color:C.green,fontWeight:500}}>✓ Enregistré</span>}
                <button onClick={save} style={{padding:"5px 13px",border:"none",borderRadius:6,background:C.navy,color:"#fff",fontSize:11,fontWeight:500,cursor:"pointer"}}>Enregistrer</button>
                {!isNew && <button onClick={dup} style={{padding:"5px 11px",border:`1px solid ${C.border2}`,borderRadius:6,background:"#fff",fontSize:11,cursor:"pointer",color:C.text2}}>Dupliquer</button>}
                {!isNew && <button onClick={del} style={{padding:"5px 11px",border:"1px solid #f5b7b7",borderRadius:6,background:C.redLight,fontSize:11,cursor:"pointer",color:C.red}}>Supprimer</button>}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:9}}>
                <FInput label="Code" field="code" ph="ex : F-01"/>
                <FSel label="Type de document" field="doctype" opts={[["cp_fr","CP Français"],["cp_ar","بلاغ AR"],["bilingue","Bilingue"],["decision_ar","Décision AR"],["tous","Tous types"]]}/>
                <FSel label="Catégorie" field="category" opts={[["FORME","Forme"],["FOND","Fond"],["TERMINOLOGIE","Terminologie"],["BILINGUE","Bilingue"]]}/>
              </div>
              <FInput label="Intitulé de la consigne" field="label" ph="ex : Formule d'ouverture FR"/>
              <FInput label="Description / règle complète" field="text" ph="Décrire la règle de correction, les formulations correctes, les erreurs à détecter…" area={4}/>
              <FInput label="Exemples (incorrect → correct)" field="examples" ph="Incorrect : xxx → Correct : yyy" area={3}/>
              <FInput label="Notes / source" field="notes" ph="ex : Article 13 loi n°104-12"/>
              {!isNew && <div style={{fontSize:10.5,color:C.text3,paddingTop:8,borderTop:`1px solid ${C.cream2}`}}>Créé le {selC?.created} · Version {selC?.version}</div>}
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
export default function App() {
  const [page, setPage] = useState("correction");
  const [consignes, setConsignes] = useState(DEFAULT_CONSIGNES);
  const [history, setHistory] = useState([]);

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
          {page==="historique"    && <HistoriquePage history={history}/>}
          {page==="dashboard"     && <DashboardPage history={history}/>}
          {page==="consignes"     && <ConsignesPage consignes={consignes} setConsignes={setConsignes}/>}
          {page==="utilisateurs"  && <UtilisateursPage/>}
        </main>
      </div>
    </>
  );
}
