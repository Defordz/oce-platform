import { useState, useRef } from "react";
import JSZip from "jszip";

// ── PALETTE ──
// ── Palette officielle Conseil de la Concurrence du Maroc ──
const C = {
  // Verts institutionnels (extraits du motif officiel du site)
  navy:"#1A3D29",   navy2:"#22432F",
  // Fonds crème chaud
  cream:"#F9F7F5", cream2:"#F2EEEA", cream3:"#E8E2DC",
  // Accent or (lignes du motif officiel)
  gold:"#C9A84C",
  // Statuts
  green:"#1A3D29", greenLight:"#e8f5ec",
  red:"#8B1A1A",   redLight:"#fdf0f0",
  amber:"#7a4a00", amberLight:"#fdf5e0",
  purple:"#4a1a6e",purpleLight:"#f0e8f8",
  // Textes
  text:"#1A1A2E", text2:"#4a4a6a", text3:"#8a8aaa",
  border:"#D9D2CA", border2:"#C8BFB5",
};

const CONSIGNES_2025 = [
  // FORME
  {id:"F-01",code:"F-01",doctype:"cp_fr",category:"FORME",label:"Formule d'ouverture",text:"Formule canonique : « Conformément à l'article 13 de la loi n°104-12 relative à la liberté des prix et de la concurrence et l'article 10 du décret n° 2-14-652 pris pour son application, tels qu'ils ont été modifiés et complétés, le Conseil de la Concurrence met à la disposition du public le « résumé de l'opération » ci-dessous, contenant les renseignements communiqués par les parties. »",examples:"✗ tels qu'ils sont modifiés → ✓ tels qu'ils ont été modifiés et complétés\n✗ le Conseil de la concurrence → ✓ le Conseil de la Concurrence (C majuscule)\n✗ telle que modifiée → ✓ tels qu'ils ont été modifiés (accord pluriel)",notes:"Art. 13 loi n°104-12 / Art. 10 décret n°2-14-652",created:"2026-04-27",version:"1.0"},
  {id:"F-02",code:"F-02",doctype:"cp_fr",category:"FORME",label:"Responsabilité des parties",text:"Phrase de responsabilité : « Ces informations ont été élaborées par les parties notifiantes, qui en sont seules responsables. Les renseignements inexacts ou dénaturés qui y figureraient ne préjugent nullement de la position du Conseil de la concurrence sur l'opération envisagée. » Si une seule partie : « par la partie notifiante, qui en est seule responsable ».",examples:"✗ qui en est seule responsable (pluriel) → ✓ qui en sont seules responsables\n✗ par la parties notifiantes → ✓ par les parties notifiantes",notes:"Formule standard — vérifier accord singulier/pluriel",created:"2026-04-27",version:"1.0"},
  {id:"F-03",code:"F-03",doctype:"cp_fr",category:"FORME",label:"Clause de complétude du dossier",text:"Clause obligatoire : « La publication de ce communiqué n'atteste pas de la complétude du dossier prévue à l'article 9 du décret n°2-14-652 pris pour l'application de la loi n°104-12 sur la liberté des prix et de la concurrence tels qu'ils ont été modifiés et complétés. »",examples:"✗ pris pour son application → ✓ pris pour l'application de la loi n°104-12\n✗ tels qu'ils sont modifiés → ✓ tels qu'ils ont été modifiés et complétés",notes:"Art. 9 décret n°2-14-652",created:"2026-04-27",version:"1.0"},
  {id:"F-04",code:"F-04",doctype:"cp_fr",category:"FORME",label:"Désignation de l'institution",text:"Toujours « Conseil de la Concurrence » avec deux C majuscules dans le corps du communiqué. Exception tolérée en minuscules dans les références légales (ex: « position du Conseil de la concurrence »). Majuscules obligatoires dans les titres.",examples:"✗ Conseil de la concurrence a reçu → ✓ Conseil de la Concurrence a reçu\n✗ conseil de la Concurrence → ✓ Conseil de la Concurrence",notes:"Dénomination officielle — loi n°20-13",created:"2026-04-27",version:"1.0"},
  {id:"F-05",code:"F-05",doctype:"cp_fr",category:"FORME",label:"Guillemets et typographie",text:"Utiliser les guillemets français « … » avec espaces insécables pour toutes les dénominations sociales, termes juridiques cités et le « résumé de l'opération ». Ne pas utiliser les guillemets droits anglais.",examples:"✗ Société X SA (guillemets droits) → ✓ « Société X SA » (guillemets français)\n✗ le résumé de l'opération → ✓ le « résumé de l'opération »",notes:"Typographie française officielle",created:"2026-04-27",version:"1.0"},
  {id:"F-06",code:"F-06",doctype:"cp_fr",category:"FORME",label:"Structure du titre",text:"Titre standard : « Communiqué du Conseil de la Concurrence relatif au projet de concentration économique concernant [description] ». Variante admise pour JV : « …concernant la création de l'entreprise commune… »",examples:"✗ Communiqué du Conseil de la concurrence relatif à la concentration → ✓ relatif au projet de concentration économique\n✗ Communiqué relatif au projet de concentration relatif à → ✓ supprimer la redondance",notes:"Structure standard CP 2025",created:"2026-04-27",version:"1.0"},
  // FOND
  {id:"D-01",code:"D-01",doctype:"cp_fr",category:"FOND",label:"Nature — contrôle exclusif",text:"Pour contrôle exclusif : dans tableau « Prise du contrôle exclusif » ; dans résumé « prise du contrôle exclusif par [acquéreur] de [cible] ». Jamais « Prise de contrôle exclusif » sans « du ».",examples:"✗ Prise de contrôle exclusif → ✓ Prise du contrôle exclusif\n✗ acquisition du contrôle exclusif → ✓ prise du contrôle exclusif (terme consacré)\n✗ la prise de le contrôle → ✓ la prise du contrôle",notes:"Art. 11 loi n°104-12 — formule consacrée dans tous CP 2025",created:"2026-04-27",version:"1.0"},
  {id:"D-02",code:"D-02",doctype:"cp_fr",category:"FOND",label:"Nature — contrôle conjoint / JV",text:"Pour contrôle conjoint : « Prise du contrôle conjoint » dans tableau. Pour JV : « Création d'entreprise commune » (sans article). Dans résumé : « prise du contrôle conjoint par [acquéreur] de [cible] aux côtés de [associé] ».",examples:"✗ Prise de contrôle conjoint → ✓ Prise du contrôle conjoint\n✗ Création de l'entreprise commune → ✓ Création d'entreprise commune",notes:"Art. 11 loi n°104-12",created:"2026-04-27",version:"1.0"},
  {id:"D-03",code:"D-03",doctype:"cp_fr",category:"FOND",label:"Désignation des parties dans tableau",text:"Dans le tableau utiliser : « L'acquéreur » / « La cible » / « L'acquéreur direct » / « L'acquéreur indirect » / « La société fondatrice n°1/2 » (JV) / « L'entreprise commune » (JV). Toujours suivi de : la société « Nom SA ».",examples:"✗ L'Acquéreur : la société X → ✓ L'acquéreur : la société « X »\n✗ Cible : Y → ✓ La cible : la société « Y »\n✗ Acquéreur direct: X → ✓ L'acquéreur direct : la société « X »",notes:"Structure standard CP 2025",created:"2026-04-27",version:"1.0"},
  {id:"D-04",code:"D-04",doctype:"cp_fr",category:"FOND",label:"Description juridique des sociétés",text:"À la première mention de chaque partie : 1) Forme juridique 2) Droit applicable (« de droit marocain », « de droit français »…) 3) Siège social 4) Numéro RC. Formule : « est une société anonyme de droit marocain, immatriculée au Registre du Commerce de [ville] sous le numéro [X], dont le siège social est situé à [adresse]. »",examples:"✗ société anonyme marocaine → ✓ société anonyme de droit marocain\n✗ dont le siège est à Casablanca → ✓ dont le siège social est situé à [adresse complète], Casablanca",notes:"Usage constant dans tous les CP 2025",created:"2026-04-27",version:"1.0"},
  {id:"D-05",code:"D-05",doctype:"cp_fr",category:"FOND",label:"Formule du résumé non confidentiel",text:"Le résumé commence par : « Le Conseil de la Concurrence a reçu la notification d'une opération de concentration économique concernant… » ou « …d'un projet de concentration économique consistant en… ». Ne pas cumuler « opération de » et « projet de ».",examples:"✗ notification d'une opération de projet de concentration → ✓ notification d'une opération de concentration\n✗ notification d'un projet d'opération → ✓ notification d'un projet de concentration économique",notes:"Structure standard résumé CP 2025",created:"2026-04-27",version:"1.0"},
  {id:"D-06",code:"D-06",doctype:"cp_fr",category:"FOND",label:"Délai d'observations des tiers",text:"Formule obligatoire : « Délai dans lequel les tiers intéressés sont invités à faire connaître leurs observations : - 10 jours à partir de la date de publication du présent communiqué, soit le [date J+10]. »",examples:"✗ Délai d'observations : 10 jours → ✓ Délai dans lequel les tiers intéressés sont invités à faire connaître leurs observations\n✗ les tiers intéressées → ✓ les tiers intéressés (accord masculin)",notes:"Art. 13 loi n°104-12",created:"2026-04-27",version:"1.0"},
  {id:"D-07",code:"D-07",doctype:"cp_fr",category:"FOND",label:"Intitulé du résumé non confidentiel",text:"L'intitulé doit être en majuscules : « RÉSUMÉ NON CONFIDENTIEL DE L'OPÉRATION FOURNI PAR LES PARTIES ». Avec accents. Sans guillemets.",examples:"✗ RESUME NON CONFIDENTIEL DE L'OPERATION → ✓ RÉSUMÉ NON CONFIDENTIEL DE L'OPÉRATION (avec accents)\n✗ Résumé non confidentiel → ✓ RÉSUMÉ NON CONFIDENTIEL (en majuscules)",notes:"Standard typographique — tous CP 2025",created:"2026-04-27",version:"1.0"},
  // ARABE
  {id:"A-01",code:"A-01",doctype:"cp_ar",category:"FORME",label:"الصيغة الافتتاحية",text:"الصيغة الثابتة : « طبقا للمادة 13 من القانون رقم 104.12 المتعلق بحرية الأسعار والمنافسة والمادة 10 من المرسوم التطبيقي رقم 2.14.652 كما تم تغييرهما و تتميمهما، يضع مجلس المنافسة رهن إشارة العموم «ملخص العملية» أدناه والذي يتضمن المعلومات الموجهة من قبل الأطراف. »",examples:"✗ كما تم تعديلهما → ✓ كما تم تغييرهما و تتميمهما\n✗ يضع المجلس → ✓ يضع مجلس المنافسة (بدون أداة التعريف)",notes:"المادة 13 / المرسوم 2.14.652",created:"2026-04-27",version:"1.0"},
  {id:"A-02",code:"A-02",doctype:"cp_ar",category:"FORME",label:"صيغة المسؤولية",text:"الصيغة الثابتة : « وقد تم إعداد هذه المعلومات من قبل الأطراف المبلغة التي تعتبر وحدها المسؤولة عنها، ذلك أن كل المعلومات، الخاطئة أو غير الصحيحة، التي قد تشتمل عليها لا تعبر بتاتا عن موقف مجلس المنافسة حول العملية المرتقبة. »",examples:"✗ من قبل الطرف المبلغ (عند تعدد الأطراف) → ✓ من قبل الأطراف المبلغة",notes:"صيغة قياسية",created:"2026-04-27",version:"1.0"},
  {id:"A-03",code:"A-03",doctype:"cp_ar",category:"FORME",label:"صيغة اكتمال الملف",text:"الصيغة الثابتة : « إن نشر هذا البلاغ لا يفيد بأن ملف التبليغ يعتبر كاملا طبقا لأحكام المادة 9 من المرسوم رقم 2.14.652 الصادر بتطبيق القانون رقم 104.12 المتعلق بحرية الأسعار والمنافسة، كما تم تغييرهما و تتميمهما. »",examples:"✗ البلاغ / الإعلان → ✓ البلاغ (الاستخدام المعياري)",notes:"المادة 9 من المرسوم 2.14.652",created:"2026-04-27",version:"1.0"},
  {id:"A-04",code:"A-04",doctype:"cp_ar",category:"FOND",label:"طبيعة العملية — مراقبة حصرية",text:"الصياغة المعيارية في الجدول : « تولي المراقبة الحصرية ». في الملخص : « تولي [الجهة المقتنية] المراقبة الحصرية على [الجهة المستهدفة] عبر اقتناء [النسبة]% من رأسمالها وحقوق التصويت المرتبطة به ».",examples:"✗ الاستحواذ الحصري → ✓ تولي المراقبة الحصرية\n✗ السيطرة المطلقة → ✓ المراقبة الحصرية",notes:"المادة 11 من القانون 104.12 — المصطلح المعتمد",created:"2026-04-27",version:"1.0"},
  {id:"A-05",code:"A-05",doctype:"cp_ar",category:"FOND",label:"تسمية الأطراف",text:"الجهة المقتنية (لا المستحوذ / لا المشتري). الجهة المستهدفة (لا الشركة المستهدفة). المؤسسة المشتركة لعملية JV. توصل مجلس المنافسة بتبليغ مشروع عملية تركيز اقتصادي (لا استقبل / لا تلقى).",examples:"✗ المستحوذ / المشتري → ✓ الجهة المقتنية\n✗ الشركة المستهدفة → ✓ الجهة المستهدفة\n✗ استقبل المجلس → ✓ توصل مجلس المنافسة بتبليغ",notes:"المصطلحات الرسمية المعتمدة — بلاغات 2025",created:"2026-04-27",version:"1.0"},
  {id:"A-06",code:"A-06",doctype:"cp_ar",category:"FOND",label:"الأجل والتاريخ",text:"الصيغة المعيارية : « الأجل المحدد للأغيار المعنيين من أجل إبداء ملاحظاتهم : - 10 أيام ابتداء من تاريخ نشر هذا البلاغ، وينتهي هذا الأجل يوم [التاريخ]. »",examples:"✗ الأطراف الثالثة → ✓ الأغيار المعنيون (المصطلح المعتمد)\n✗ مدة الاعتراض → ✓ الأجل المحدد للأغيار المعنيين",notes:"المادة 13 من القانون 104.12",created:"2026-04-27",version:"1.0"},
  {id:"A-07",code:"A-07",doctype:"cp_ar",category:"FOND",label:"الوصف القانوني للشركات",text:"عند الإشارة الأولى لكل طرف : 1) الشكل القانوني 2) القانون المنظم (خاضعة للقانون المغربي / الفرنسي...) 3) المقر الاجتماعي 4) رقم السجل التجاري. الصيغة : « هي شركة [الشكل] خاضعة للقانون [الدولة]، يقع مقرها الاجتماعي ب[المدينة]. »",examples:"✗ شركة مغربية → ✓ شركة خاضعة للقانون المغربي",notes:"الاستخدام الثابت في بلاغات 2025",created:"2026-04-27",version:"1.0"},
  // TERMINOLOGIE
  {id:"T-01",code:"T-01",doctype:"bilingue",category:"TERMINOLOGIE",label:"Terminologie contrôle FR↔AR",text:"Correspondances officielles :\ncontrôle exclusif ↔ المراقبة الحصرية\ncontrôle conjoint ↔ المراقبة المشتركة\ncontrôle indirect ↔ المراقبة غير المباشرة\nprise de contrôle ↔ تولي المراقبة\nl'acquéreur ↔ الجهة المقتنية\nla cible ↔ الجهة المستهدفة\nles parties notifiantes ↔ الأطراف المبلغة\nentreprise commune ↔ مشروع مشترك",examples:"Vérifier la cohérence de chaque terme entre les deux versions",notes:"Glossaire officiel Conseil de la Concurrence 2025",created:"2026-04-27",version:"1.0"},
  {id:"T-02",code:"T-02",doctype:"bilingue",category:"TERMINOLOGIE",label:"Formes juridiques FR↔AR",text:"Correspondances officielles :\nsociété anonyme (SA) ↔ شركة مساهمة\nsociété à responsabilité limitée (SARL) ↔ شركة ذات المسؤولية المحدودة\nsociété par actions simplifiée (SAS) ↔ شركة أسهم مبسطة\nde droit marocain ↔ خاضعة للقانون المغربي\nde droit français ↔ خاضعة للقانون الفرنسي\ncapital social ↔ رأس المال الاجتماعي\ndroits de vote ↔ حقوق التصويت\nRegistre du Commerce ↔ السجل التجاري",examples:"Vérifier l'exactitude de la traduction de la forme juridique pour chaque société",notes:"Terminologie juridique standard",created:"2026-04-27",version:"1.0"},
  {id:"T-03",code:"T-03",doctype:"bilingue",category:"TERMINOLOGIE",label:"Formules procédurales FR↔AR",text:"Correspondances officielles :\nnotification ↔ تبليغ\ntiers intéressés ↔ الأغيار المعنيون\nobservations ↔ ملاحظات\ncomplétude du dossier ↔ اكتمال الملف\nrésumé non confidentiel ↔ ملخص غير سري\nsecteurs économiques concernés ↔ القطاعات الاقتصادية المعنية\nsiège social ↔ المقر الاجتماعي\nFait à Rabat, le [date] ↔ حرر في الرباط بتاريخ [التاريخ]",examples:"Vérifier la cohérence des formules procédurales entre les deux versions",notes:"Formules procédurales standard CP 2025",created:"2026-04-27",version:"1.0"},
  // BILINGUE
  {id:"B-01",code:"B-01",doctype:"bilingue",category:"BILINGUE",label:"Cohérence chiffres et pourcentages",text:"Les chiffres (pourcentages, capitaux, numéros RC) doivent être identiques dans FR et AR. Pourcentages : même format. Capital social : même montant. Numéro RC : même numéro et format. Dates : cohérence J+10 entre les deux versions.",examples:"✗ FR : 42,11% / AR : 42% → ✓ FR et AR : 42,11% (identiques)\n✗ FR : RC 181.559 / AR : RC 181559 → ✓ Uniformiser le format",notes:"Vérification croisée systématique",created:"2026-04-27",version:"1.0"},
  {id:"B-02",code:"B-02",doctype:"bilingue",category:"BILINGUE",label:"Cohérence qualification de l'opération",text:"La nature de l'opération doit être identique dans FR et AR. Prise du contrôle exclusif ↔ تولي المراقبة الحصرية. Prise du contrôle conjoint ↔ تولي المراقبة المشتركة. Création d'entreprise commune ↔ إنشاء مشروع مشترك.",examples:"✗ FR : contrôle exclusif / AR : مراقبة مشتركة → ✓ Cohérence obligatoire entre les deux versions",notes:"Cohérence bilingue obligatoire",created:"2026-04-27",version:"1.0"},
  {id:"B-03",code:"B-03",doctype:"bilingue",category:"BILINGUE",label:"Cohérence date de clôture",text:"La date limite des observations doit être la même dans FR et AR, et correspondre à J+10 de la date de publication.",examples:"✗ FR : soit le 13 octobre 2025 / AR : 14 أكتوبر 2025 → ✓ Même date J+10 dans les deux versions",notes:"Art. 13 loi n°104-12 — délai de 10 jours",created:"2026-04-27",version:"1.0"},
];

const DEFAULT_CONSIGNES = CONSIGNES_2025;

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
    <div onClick={() => setPage(id)} style={{display:"flex",alignItems:"center",gap:9,padding:"8px 14px",cursor:"pointer",borderRadius:6,margin:"1px 7px",background:page===id?"rgba(255,255,255,.1)":"transparent",color:page===id?"#fff":"rgba(255,255,255,.55)",borderLeft:page===id?"3px solid "+C.gold:"3px solid transparent",paddingLeft:page===id?"11px":"14px",fontSize:12.5,fontWeight:page===id?500:400,transition:"all .15s"}}>
      <span style={{fontSize:14,opacity:page===id?1:.7}}>{icon}</span>{label}
    </div>
  );
  return (
    <aside style={{width:220,background:C.navy,display:"flex",flexDirection:"column",flexShrink:0,minHeight:"100vh",boxShadow:"2px 0 8px rgba(0,0,0,.15)"}}>
      <div style={{height:4,background:C.gold,flexShrink:0}}/>
      <div style={{padding:"16px 14px 14px",borderBottom:"1px solid rgba(255,255,255,.15)",background:"#fff"}}>
        <img
          src="https://conseil-concurrence.ma/wp-content/uploads/2022/09/Logo-CC-site.png"
          alt="Conseil de la Concurrence"
          style={{width:"100%",maxHeight:52,objectFit:"contain",objectPosition:"left"}}
          onError={e=>{e.target.style.display="none";e.target.nextSibling.style.display="block";}}
        />
        <div style={{display:"none",fontFamily:"Georgia,serif",fontSize:12,color:C.navy,fontWeight:700,lineHeight:1.3}}>Conseil de la<br/>Concurrence</div>
      </div>
      <div style={{padding:"8px 14px 10px",background:C.navy,borderBottom:"1px solid rgba(255,255,255,.1)"}}>
        <div style={{fontSize:9,color:"rgba(255,255,255,.6)",letterSpacing:".1em",textTransform:"uppercase",fontWeight:500}}>Plateforme de Correction OCE</div>
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
          <div style={{width:28,height:28,borderRadius:"50%",background:"rgba(255,255,255,.2)",border:"1px solid rgba(255,255,255,.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:"#fff",letterSpacing:".05em"}}>RA</div>
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
    <div style={{padding:"20px 30px 14px",background:"#fff",flexShrink:0,borderBottom:`2px solid ${C.navy}`}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div>
          <h1 style={{fontFamily:"Georgia,serif",fontSize:21,fontWeight:700,color:C.navy,margin:0,letterSpacing:"-.01em" }}>{title}</h1>
          {sub && <p style={{fontSize:12.5,color:C.text2,marginTop:3,margin:"3px 0 0"}}>{sub}</p>}
        </div>
        {right}
      </div>
    </div>
  );
}

function Card({children, style}) {
  return <div style={{background:"#fff",border:`1px solid ${C.border}`,borderRadius:4,padding:"16px 20px",boxShadow:"0 1px 3px rgba(0,0,0,.06)",...style}}>{children}</div>;
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
  const [regexConsignes, setRegexConsignes] = useState([]);
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
      const extracted = textMatches.map(m => m[1]).join("").replace(/[ \t]+/g, " ").trim();
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

      // Séparer corrections regex_auto et corrections manuelles
      const allCorr = parsed.corrections || [];
      setCorrections(allCorr);
      setRegexConsignes(parsed.regexConsignes || []);
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

  const escXml = s => s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");


  // ── PASSE 2 : Application des corrections regex sur le XML Word ──
  // Chaque consigne avec regex est appliquée directement sur le texte des runs
  // puis encapsulée en w:del/w:ins pour le mode suivi des modifications
  const applyRegexCorrections = (docXml, regexConsignes, date) => {
    if (!regexConsignes || regexConsignes.length === 0) return { xml: docXml, applied: [] };

    let changeId = 100;
    const applied = [];
    let result = docXml;

    // Extraire les runs du XML (hors track changes existants)
    const maskTC = xml => xml
      .replace(/<w:del[ >][\s\S]*?<\/w:del>/g, m => ' '.repeat(m.length))
      .replace(/<w:ins[ >][\s\S]*?<\/w:ins>/g, m => ' '.repeat(m.length));

    const RUN_RE = /<w:r[ >](?:(?!<w:r[ >])[\s\S])*?<\/w:r>/g;

    for (const consigne of regexConsignes) {
      const patterns = Array.isArray(consigne.regex) ? consigne.regex : [consigne.regex];

      for (const pat of patterns) {
        if (!pat || !pat.find) continue;

        try {
          const flags = (pat.flags || 'g').includes('g') ? pat.flags : pat.flags + 'g';
          const regex = new RegExp(pat.find, flags);

          // Travailler sur le XML masqué pour trouver les positions
          const masked = maskTC(result);

          // Extraire tous les runs avec leurs positions
          const runs = [];
          let m;
          const runRe = new RegExp(RUN_RE.source, 'g');
          runRe.lastIndex = 0;
          while ((m = runRe.exec(masked)) !== null) {
            if (!masked.slice(m.index, m.index + 5).trim()) continue;
            const tMatch = m[0].match(/<w:t[^>]*>([^<]*)<\/w:t>/);
            if (tMatch && tMatch[1]) {
              runs.push({
                text: tMatch[1],
                xmlStart: m.index,
                xmlEnd: m.index + m[0].length,
                xml: result.slice(m.index, m.index + m[0].length),
              });
            }
          }

          if (runs.length === 0) continue;

          // Texte concaténé de tous les runs
          const fullText = runs.map(r => r.text).join('');

          // Trouver toutes les correspondances dans le texte concaténé
          const matches = [];
          let match;
          regex.lastIndex = 0;
          while ((match = regex.exec(fullText)) !== null) {
            matches.push({ index: match.index, end: match.index + match[0].length, match });
            if (!flags.includes('g')) break;
          }

          if (matches.length === 0) continue;

          // Pour chaque match, trouver les runs couverts et appliquer
          // Trier en ordre inverse pour ne pas invalider les positions
          matches.reverse();

          for (const { index: matchStart, end: matchEnd, match: matchObj } of matches) {
            // Trouver les runs qui couvrent ce match
            let cum = 0;
            let sIdx = null, eIdx = null;
            for (let i = 0; i < runs.length; i++) {
              const runEnd = cum + runs[i].text.length;
              if (sIdx === null && runEnd > matchStart) sIdx = i;
              if (eIdx === null && runEnd >= matchEnd) { eIdx = i; break; }
              cum += runs[i].text.length;
            }

            if (sIdx === null || eIdx === null) continue;

            // Calculer le texte original et corrigé
            const spanStart = runs.slice(0, sIdx).reduce((s, r) => s + r.text.length, 0);
            const spanEnd   = runs.slice(0, eIdx + 1).reduce((s, r) => s + r.text.length, 0);
            const originalText = fullText.slice(matchStart, matchEnd);

            // Appliquer le remplacement regex
            const correctedText = originalText.replace(new RegExp(pat.find, flags.replace('g','')), pat.replace);

            if (originalText === correctedText) continue;

            const preText  = fullText.slice(spanStart, matchStart);
            const postText = fullText.slice(matchEnd, spanEnd);

            // Récupérer la mise en forme du premier run
            const rprMatch = runs[sIdx].xml.match(/<w:rPr>[\s\S]*?<\/w:rPr>/);
            const rpr = rprMatch ? rprMatch[0] : '';

            // Construire le XML de remplacement avec track changes
            const preXml  = preText  ? `<w:r>${rpr}<w:t xml:space="preserve">${escXml(preText)}</w:t></w:r>`  : '';
            const postXml = postText ? `<w:r>${rpr}<w:t xml:space="preserve">${escXml(postText)}</w:t></w:r>` : '';
            const delXml  = `<w:del w:id="${changeId++}" w:author="OCE Correction" w:date="${date}"><w:r>${rpr}<w:delText xml:space="preserve">${escXml(originalText)}</w:delText></w:r></w:del>`;
            const insXml  = `<w:ins w:id="${changeId++}" w:author="OCE Correction" w:date="${date}"><w:r>${rpr}<w:t xml:space="preserve">${escXml(correctedText)}</w:t></w:r></w:ins>`;
            const replacement = preXml + delXml + insXml + postXml;

            // Appliquer dans le XML réel
            const xmlStart = runs[sIdx].xmlStart;
            const xmlEnd   = runs[eIdx].xmlEnd;
            result = result.slice(0, xmlStart) + replacement + result.slice(xmlEnd);

            applied.push({
              code: consigne.code,
              type: 'regex_auto',
              original: originalText,
              suggested: correctedText,
              reason: pat.label || consigne.label,
            });

            // Recalculer les runs après modification
            break; // Recalculer au prochain passage
          }
        } catch (e) {
          console.warn(`[REGEX] Erreur pour ${consigne.code}:`, e.message);
        }
      }
    }

    return { xml: result, applied };
  };

  // norm() avec normalisation des guillemets définie dans applyAllTrackChanges

  // ── APPLY TRACK CHANGES : approche document-level inverse ──
  // Traite les corrections de la FIN vers le DÉBUT du XML
  // pour éviter que chaque remplacement invalide les positions suivantes
  const applyAllTrackChanges = (docXml, corrections, date) => {
    let changeId = 200;

    // Normalise pour la recherche (espaces insécables, apostrophes, guillemets, etc.)
    const norm = s => s
      .replace(/\u00A0/g, " ")   // espace insécable
      .replace(/\u202F/g, " ")   // espace fine insécable
      .replace(/\u2019/g, "'")  // apostrophe typographique
      .replace(/\u2018/g, "'")  // apostrophe ouvrante
      .replace(/\u201C/g, '"')  // guillemet double ouvrant
      .replace(/\u201D/g, '"')  // guillemet double fermant
      .replace(/\u00AB/g, "<<") // « guillemet français ouvrant
      .replace(/\u00BB/g, ">>") // » guillemet français fermant
      .replace(/ /g, " ")
      .replace(/ /g, " ")
      .replace(/[ \t]+/g, " ")
      .trim();

    // Pour chaque correction, trouver sa position dans le XML
    // puis trier par position décroissante avant d'appliquer
    const toApply = [];

    for (const { original, suggested } of corrections) {
      if (!original || !suggested || original === suggested) continue;

      // Masquer les blocs track changes existants pour éviter de les re-matcher
      const maskTC = xml => xml
        .replace(/<w:del[ >][\s\S]*?<\/w:del>/g, m => ' '.repeat(m.length))
        .replace(/<w:ins[ >][\s\S]*?<\/w:ins>/g, m => ' '.repeat(m.length));
      const maskedXml = maskTC(docXml);

      // Extraire les runs depuis le XML masqué (hors track changes)
      const RUN_RE = /<w:r[ >](?:(?!<w:r[ >])[\s\S])*?<\/w:r>/g;
      const runs = [];
      let m;
      RUN_RE.lastIndex = 0;
      while ((m = RUN_RE.exec(maskedXml)) !== null) {
        if (!maskedXml.slice(m.index, m.index + 5).trim()) continue; // run masqué
        const tMatch = m[0].match(/<w:t[^>]*>([^<]*)<\/w:t>/);
        runs.push({
          xml: docXml.slice(m.index, m.index + m[0].length), // vrai XML
          text: tMatch ? tMatch[1] : "",
          xmlStart: m.index,
          xmlEnd: m.index + m[0].length,
        });
      }

      // Texte complet du document (raw + normalisé)
      const rawFull = runs.map(r => r.text).join("");
      const normFull = norm(rawFull);
      const normOrig = norm(original);

      const normPos = normFull.indexOf(normOrig);
      if (normPos === -1) {
        console.warn("[TC] Non trouvé:", JSON.stringify(original.substring(0, 50)));
        continue;
      }

      // Mapper position normalisée → position raw caractère par caractère
      let rawPos = 0, nPos = 0;
      while (nPos < normPos && rawPos < rawFull.length) {
        const ch = rawFull[rawPos];
        const nch = norm(ch) || " ";
        nPos += nch.length;
        rawPos++;
      }
      const rawStart = rawPos;
      const rawEnd = rawStart + original.length;

      // Identifier les runs couverts — aligner sur frontières de runs
      let cum = 0;
      let startRunIdx = null, endRunIdx = null;
      for (let i = 0; i < runs.length; i++) {
        const runEnd = cum + runs[i].text.length;
        if (startRunIdx === null && runEnd > rawStart) startRunIdx = i;
        if (endRunIdx === null && runEnd >= rawEnd) { endRunIdx = i; break; }
        cum += runs[i].text.length;
      }

      if (startRunIdx === null || endRunIdx === null) {
        console.warn("[TC] Runs non trouvés:", JSON.stringify(original.substring(0, 50)));
        continue;
      }

      // Récupérer la mise en forme du premier run
      const rprMatch = runs[startRunIdx].xml.match(/<w:rPr>[\s\S]*?<\/w:rPr>/);
      const rpr = rprMatch ? rprMatch[0] : "";

      // Aligner sur frontières exactes de runs (pas de preText/postText partiels)
      // On prend l'ensemble des runs couverts et on remplace tout le bloc
      const spanStart = runs.slice(0, startRunIdx).reduce((s, r) => s + r.text.length, 0);
      const spanEnd = runs.slice(0, endRunIdx + 1).reduce((s, r) => s + r.text.length, 0);

      // Si la correspondance est partielle dans un run, étendre aux frontières du run
      // Cela évite de couper un run en plein milieu dans le XML
      const alignedStart = spanStart; // début du premier run couvert
      const alignedEnd = spanEnd;     // fin du dernier run couvert

      const preText = rawFull.slice(alignedStart, rawStart);
      const postText = rawFull.slice(rawEnd, alignedEnd);
      const actualOriginal = rawFull.slice(rawStart, rawEnd);

      // Position dans le XML (pour tri inverse)
      const xmlStart = runs[startRunIdx].xmlStart;
      const xmlEnd = runs[endRunIdx].xmlEnd;

      toApply.push({ xmlStart, xmlEnd, preText, postText, actualOriginal, suggested, rpr });
      console.log(`[TC] ✅ Trouvé: "${actualOriginal.substring(0, 40)}" → "${suggested.substring(0, 40)}"`);
    }

    // Filtrer les corrections qui se chevauchent (garder la première par position)
    toApply.sort((a, b) => a.xmlStart - b.xmlStart);
    const filtered = [];
    let lastEnd = -1;
    for (const item of toApply) {
      if (item.xmlStart >= lastEnd) {
        filtered.push(item);
        lastEnd = item.xmlEnd;
      } else {
        console.warn("[TC] Chevauchement ignoré:", item.actualOriginal?.substring(0, 30));
      }
    }

    // Appliquer dans l'ordre croissant en ajustant l'offset cumulé
    let result = docXml;
    let offset = 0; // décalage cumulé dû aux remplacements précédents
    for (const { xmlStart, xmlEnd, preText, postText, actualOriginal, suggested, rpr } of filtered) {
      const adjStart = xmlStart + offset;
      const adjEnd   = xmlEnd   + offset;
      const preXml  = preText  ? `<w:r>${rpr}<w:t xml:space="preserve">${escXml(preText)}</w:t></w:r>`  : "";
      const postXml = postText ? `<w:r>${rpr}<w:t xml:space="preserve">${escXml(postText)}</w:t></w:r>` : "";
      const delXml  = `<w:del w:id="${changeId++}" w:author="OCE Correction" w:date="${date}"><w:r>${rpr}<w:delText xml:space="preserve">${escXml(actualOriginal)}</w:delText></w:r></w:del>`;
      const insXml  = `<w:ins w:id="${changeId++}" w:author="OCE Correction" w:date="${date}"><w:r>${rpr}<w:t xml:space="preserve">${escXml(suggested)}</w:t></w:r></w:ins>`;
      const replacement = preXml + delXml + insXml + postXml;
      result = result.slice(0, adjStart) + replacement + result.slice(adjEnd);
      offset += replacement.length - (xmlEnd - xmlStart);
    }

    return result;
  };

  // eslint-disable-next-line no-unused-vars
  const applyTrackChangesToPara = (paraXml) => paraXml;

  const downloadWord = async () => {
    const accepted = corrections.filter((_, i) => statuses[i] !== "rejected");
    if (!accepted.length) { alert("Aucune correction à télécharger."); return; }
    if (!fileBytes) { alert("Veuillez uploader un fichier .docx pour utiliser cette fonctionnalité."); return; }

    try {
      const zip = await JSZip.loadAsync(fileBytes);
      const docXml = await zip.file("word/document.xml").async("string");
      const date = new Date().toISOString().split(".")[0] + "Z";

      // PASSE 2A — Appliquer les corrections regex (déterministes)
      const regexResult = applyRegexCorrections(docXml, regexConsignes, date);
      let currentXml = regexResult.xml;

      // PASSE 2B — Appliquer les corrections manuelles (Claude text-match)
      const manualCorrections = accepted
        .filter(c => c.type !== "regex_auto" && c.original && c.suggested);
      const result = applyAllTrackChanges(currentXml, manualCorrections, date);

      console.log("[Passe 2A] Regex appliquées:", regexResult.applied.length);
      console.log("[Passe 2B] Manuelles appliquées:", manualCorrections.length);

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
        sub="Upload · Analyse automatique · Téléchargement Word avec suivi des modifications"
        right={<span style={{fontSize:10,padding:"3px 10px",background:C.cream2,border:`1px solid ${C.border}`,borderRadius:20,color:C.text2,display:"flex",alignItems:"center",gap:5}}><span style={{width:6,height:6,borderRadius:"50%",background:C.green,display:"inline-block"}}/>Fiche de consignes active</span>}
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
function ConsignesPage({consignes, setConsignes, onReload, syncStatus}) {
  const [view, setView] = useState("list"); // "list" | "chat"
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Bonjour ! Décris-moi la consigne que tu veux créer ou modifier. Par exemple : *\"Le nom de société doit toujours être précédé de 'la société' dans le titre\"*" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingConsigne, setPendingConsigne] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [filterType, setFilterType] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const chatEndRef = { current: null };

  const filtered = consignes.filter(c =>
    (!filterType || c.doctype === filterType) &&
    (!filterCat  || c.category === filterCat)
  );


  const sendMessage = async (userMsg) => {
    if (!userMsg.trim()) return;
    const newMessages = [...messages, { role: "user", content: userMsg }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const resp = await fetch("/api/chat-consigne", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          existingCodes: consignes.map(c => c.code),
        }),
      });
      const data = await resp.json();
      const text = data.text || data.error || "Erreur de réponse.";

      // Extraire la consigne du JSON si présente
      const jsonMatch = text.match(/---CONSIGNE---\s*([\s\S]*?)\s*---FIN---/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[1]);
          setPendingConsigne({ ...parsed, id: parsed.code, version: "1.0", created: new Date().toLocaleDateString("fr-FR") });
        } catch(e) { setPendingConsigne(null); }
      }

      setMessages(m => [...m, { role: "assistant", content: text }]);
    } catch(e) {
      setMessages(m => [...m, { role: "assistant", content: "Erreur de connexion : " + e.message }]);
    }
    setLoading(false);
  };

  const integrateConsigne = () => {
    if (!pendingConsigne) return;
    if (editingId) {
      setConsignes(cs => cs.map(c => c.id === editingId ? { ...pendingConsigne, id: editingId } : c));
    } else {
      const exists = consignes.find(c => c.id === pendingConsigne.id);
      if (exists) {
        setConsignes(cs => cs.map(c => c.id === pendingConsigne.id ? pendingConsigne : c));
      } else {
        setConsignes(cs => [...cs, pendingConsigne]);
      }
    }
    setPendingConsigne(null);
    setMessages([{ role: "assistant", content: "✅ Consigne intégrée ! Décris-moi une autre règle ou ferme le chat." }]);
    setEditingId(null);
  };

  const startEdit = (c) => {
    setEditingId(c.id);
    setView("chat");
    setMessages([
      { role: "assistant", content: `Je vais modifier la consigne **${c.code} — ${c.label}**.\n\nActuellement :\n> ${c.text}\n\nQue veux-tu changer ?` }
    ]);
    setPendingConsigne(null);
  };

  const deleteConsigne = (id) => {
    if (!confirm("Supprimer cette consigne ?")) return;
    setConsignes(cs => cs.filter(c => c.id !== id));
  };

  const resetChat = () => {
    setMessages([{ role: "assistant", content: "Décris-moi la consigne que tu veux créer." }]);
    setPendingConsigne(null); setEditingId(null);
  };

  // Render message content (simple markdown-like)
  const renderMsg = (text) => {
    const withoutJson = text.replace(/---CONSIGNE---[\s\S]*?---FIN---/g, "");
    return withoutJson.split("\n").map((line, i) => {
      const bold = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>');
      return <div key={i} style={{marginBottom: line ? 3 : 8}} dangerouslySetInnerHTML={{__html: bold || "&nbsp;"}} />;
    });
  };

  return (
    <div style={{display:"flex",flexDirection:"column",height:"100%",overflow:"hidden"}}>
      <PageHeader
        title="Fiches de consignes"
        sub="Crée et modifie les consignes par conversation"
        right={
          <div style={{display:"flex",gap:8}}>
            <button onClick={onReload} style={{padding:"6px 12px",border:`1px solid ${C.border2}`,borderRadius:7,background:"#fff",fontSize:12,cursor:"pointer",color:C.text2}}>
              🔄 {syncStatus==="loading"?"…":"Sync"}
            </button>
            {view==="list"
              ? <button onClick={()=>{setView("chat");resetChat();}} style={{padding:"7px 16px",border:"none",borderRadius:7,background:C.navy,color:"#fff",fontSize:12.5,fontWeight:500,cursor:"pointer"}}>
                  ✏️ Nouvelle consigne
                </button>
              : <button onClick={()=>setView("list")} style={{padding:"7px 16px",border:`1px solid ${C.border2}`,borderRadius:7,background:"#fff",color:C.text2,fontSize:12.5,cursor:"pointer"}}>
                  ← Liste des consignes
                </button>
            }
          </div>
        }
      />

      {view === "list" && (
        <div style={{flex:1,overflow:"hidden",padding:"16px 28px",display:"grid",gridTemplateColumns:"260px 1fr",gap:14}}>
          {/* Filtres + liste */}
          <div style={{background:"#fff",border:`1px solid ${C.border}`,borderRadius:10,overflow:"hidden",display:"flex",flexDirection:"column"}}>
            <div style={{padding:"9px 11px",borderBottom:`1px solid ${C.border}`,display:"flex",gap:5}}>
              <select value={filterType} onChange={e=>setFilterType(e.target.value)} style={{flex:1,padding:"4px 6px",border:`1px solid ${C.border}`,borderRadius:5,fontSize:10.5,fontFamily:"inherit"}}>
                <option value="">Tous types</option>
                {Object.entries(TYPE_LABELS).filter(([k])=>k!=="tous").map(([v,l])=><option key={v} value={v}>{l}</option>)}
              </select>
              <select value={filterCat} onChange={e=>setFilterCat(e.target.value)} style={{flex:1,padding:"4px 6px",border:`1px solid ${C.border}`,borderRadius:5,fontSize:10.5,fontFamily:"inherit"}}>
                <option value="">Toutes</option>
                {["FORME","FOND","TERMINOLOGIE","BILINGUE"].map(c=><option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div style={{overflowY:"auto",flex:1}}>
              {filtered.map(c=>(
                <div key={c.id} style={{padding:"9px 12px",borderBottom:`1px solid ${C.cream2}`,display:"flex",alignItems:"flex-start",gap:8}}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:2}}>
                      <span style={{fontSize:9.5,fontWeight:600,color:C.text3,fontFamily:"monospace"}}>{c.code}</span>
                      {c.regex && <span style={{fontSize:8,background:"#e8f5ec",color:C.green,padding:"1px 5px",borderRadius:10,fontWeight:600}}>AUTO</span>}
                      <span style={{background:CAT_BG[c.category]||"#f0f0f0",color:CAT_FG[c.category]||"#555",padding:"1px 5px",borderRadius:10,fontSize:8,fontWeight:600}}>{c.category}</span>
                    </div>
                    <div style={{fontSize:11.5,fontWeight:500,color:C.text,lineHeight:1.3}}>{c.label}</div>
                    <div style={{fontSize:10.5,color:C.text3,marginTop:2,lineHeight:1.4}}>{c.text?.substring(0,80)}…</div>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:4,flexShrink:0}}>
                    <button onClick={()=>startEdit(c)} style={{padding:"3px 8px",border:`1px solid ${C.border2}`,borderRadius:5,background:"#fff",fontSize:10,cursor:"pointer",color:C.text2}}>Modifier</button>
                    <button onClick={()=>deleteConsigne(c.id)} style={{padding:"3px 8px",border:"1px solid #f5b7b7",borderRadius:5,background:C.redLight,fontSize:10,cursor:"pointer",color:C.red}}>Supprimer</button>
                  </div>
                </div>
              ))}
              {filtered.length===0 && <div style={{padding:20,fontSize:12,color:C.text3,textAlign:"center"}}>Aucune consigne</div>}
            </div>
            <div style={{padding:"6px 11px",borderTop:`1px solid ${C.cream2}`,fontSize:9.5,color:C.text3}}>{filtered.length} consigne{filtered.length>1?"s":""}</div>
          </div>

          {/* Instructions à droite */}
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <div style={{background:"#fff",border:`1px solid ${C.border}`,borderRadius:10,padding:"20px 24px"}}>
              <div style={{fontSize:14,fontWeight:500,color:C.navy,marginBottom:12}}>Comment créer une consigne</div>
              {[
                ["💬","Clique sur \"Nouvelle consigne\"","Lance le chat de consignes"],
                ["📝","Décris la règle en français","Ex: \"le nom société doit être précédé de la société\""],
                ["⚡","La règle est générée automatiquement","Avec exemples, tests et règle automatique"],
                ["🔄","Demande des modifications","Itère jusqu'au résultat souhaité"],
                ["✅","Valide l'intégration","La consigne est ajoutée à la liste et sauvegardée"],
              ].map(([icon,title,sub],i)=>(
                <div key={i} style={{display:"flex",gap:12,marginBottom:12,alignItems:"flex-start"}}>
                  <div style={{width:32,height:32,borderRadius:8,background:C.cream2,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>{icon}</div>
                  <div>
                    <div style={{fontSize:12.5,fontWeight:500,color:C.text}}>{title}</div>
                    <div style={{fontSize:11.5,color:C.text3,marginTop:1}}>{sub}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{background:C.navy,borderRadius:10,padding:"16px 20px",color:"rgba(255,255,255,.8)",fontSize:12.5,lineHeight:1.7}}>
              <div style={{fontWeight:600,color:"#fff",marginBottom:6}}>💡 Conseil</div>
              Les consignes avec le badge <span style={{background:"#e8f5ec",color:C.green,padding:"1px 6px",borderRadius:10,fontSize:10,fontWeight:600}}>AUTO</span> sont appliquées automatiquement sur le document Word — ce sont les plus fiables.
            </div>
          </div>
        </div>
      )}

      {view === "chat" && (
        <div style={{flex:1,overflow:"hidden",display:"flex",flexDirection:"column",padding:"16px 28px",gap:12}}>
          {editingId && (
            <div style={{padding:"8px 14px",background:C.amberLight,border:`1px solid #d4a853`,borderRadius:8,fontSize:12,color:C.amber,flexShrink:0}}>
              ✏️ Mode modification — consigne <strong>{editingId}</strong>
            </div>
          )}

          {/* Messages */}
          <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column",gap:10,paddingRight:4}}>
            {messages.map((msg, i) => (
              <div key={i} style={{display:"flex",justifyContent:msg.role==="user"?"flex-end":"flex-start"}}>
                <div style={{
                  maxWidth:"82%",padding:"11px 14px",borderRadius:10,fontSize:13,lineHeight:1.6,
                  background:msg.role==="user"?C.navy:"#fff",
                  color:msg.role==="user"?"#fff":C.text,
                  border:msg.role==="user"?"none":`1px solid ${C.border}`,
                  borderBottomRightRadius:msg.role==="user"?2:10,
                  borderBottomLeftRadius:msg.role==="assistant"?2:10,
                }}>
                  {msg.role==="assistant" ? renderMsg(msg.content) : msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{display:"flex",justifyContent:"flex-start"}}>
                <div style={{padding:"11px 16px",borderRadius:10,background:"#fff",border:`1px solid ${C.border}`,display:"flex",gap:5,alignItems:"center"}}>
                  {[0,1,2].map(i=>(
                    <div key={i} style={{width:7,height:7,borderRadius:"50%",background:C.navy2,animation:`bounce .9s ${i*0.15}s infinite`}}/>
                  ))}
                </div>
              </div>
            )}
            <div ref={el=>{if(el)el.scrollIntoView({behavior:"smooth"})}}/>
          </div>

          {/* Consigne en attente */}
          {pendingConsigne && (
            <div style={{background:"#fff",border:`2px solid ${C.green}`,borderRadius:10,padding:"14px 18px",flexShrink:0}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                <div style={{fontSize:13,fontWeight:600,color:C.green}}>✅ Consigne prête à intégrer</div>
                <div style={{display:"flex",gap:7}}>
                  <button onClick={()=>sendMessage("Modifie cette consigne : ")} style={{padding:"6px 12px",border:`1px solid ${C.border2}`,borderRadius:6,background:"#fff",fontSize:11.5,cursor:"pointer",color:C.text2}}>
                    Demander une modification
                  </button>
                  <button onClick={integrateConsigne} style={{padding:"6px 14px",border:"none",borderRadius:6,background:C.green,color:"#fff",fontSize:11.5,fontWeight:600,cursor:"pointer"}}>
                    ✓ Intégrer la consigne
                  </button>
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"auto 1fr",gap:"4px 12px",fontSize:12}}>
                <span style={{color:C.text3,fontWeight:500}}>Code</span><span style={{fontFamily:"monospace",color:C.navy2}}>{pendingConsigne.code}</span>
                <span style={{color:C.text3,fontWeight:500}}>Intitulé</span><span>{pendingConsigne.label}</span>
                <span style={{color:C.text3,fontWeight:500}}>Type</span><span>{TYPE_LABELS[pendingConsigne.doctype]||pendingConsigne.doctype} · {pendingConsigne.category}</span>
                <span style={{color:C.text3,fontWeight:500}}>Règle</span><span style={{fontStyle:"italic"}}>{pendingConsigne.text?.substring(0,120)}…</span>
                {pendingConsigne.regex && <><span style={{color:C.text3,fontWeight:500}}>Auto</span><span style={{background:"#e8f5ec",color:C.green,padding:"1px 7px",borderRadius:10,fontSize:10,fontWeight:600,display:"inline-block"}}>Correction automatique active</span></>}
              </div>
            </div>
          )}

          {/* Input */}
          <div style={{display:"flex",gap:8,flexShrink:0}}>
            <input
              value={input} onChange={e=>setInput(e.target.value)}
              onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey&&!loading){e.preventDefault();sendMessage(input);}}}
              placeholder="Décris la règle ou demande une modification… (Entrée pour envoyer)"
              disabled={loading}
              style={{flex:1,padding:"11px 14px",border:`1px solid ${C.border2}`,borderRadius:8,fontFamily:"inherit",fontSize:13,color:C.text,outline:"none"}}
            />
            <button onClick={()=>sendMessage(input)} disabled={loading||!input.trim()}
              style={{padding:"11px 20px",border:"none",borderRadius:8,background:loading||!input.trim()?"#9ca3af":C.navy,color:"#fff",fontSize:13,fontWeight:500,cursor:loading||!input.trim()?"not-allowed":"pointer",flexShrink:0}}>
              Envoyer
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%,80%,100%{transform:translateY(0)}
          40%{transform:translateY(-6px)}
        }
      `}</style>
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

// ── ROOT ──
export default function App() {
  const [page, setPage] = useState("correction");
  const [history, setHistory] = useState([]);
  const [consignes, setConsignes] = useState(DEFAULT_CONSIGNES);
  const [consignesSha, setConsignesSha] = useState(null);
  const [syncStatus, setSyncStatus] = useState("loading");
  const [syncMessage, setSyncMessage] = useState("");

  // Charger les consignes depuis GitHub au démarrage
  const loadConsignes = async () => {
    setSyncStatus("loading");
    try {
      const res = await fetch("/api/get-consignes");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setConsignes(data.consignes);
      setConsignesSha(data.sha);
      setSyncStatus("idle");
    } catch (err) {
      console.warn("Chargement hors-ligne:", err);
      setSyncStatus("error");
      setSyncMessage("Hors-ligne — modifications non persistées");
    }
  };

  // Utiliser useEffect pour le chargement initial
  


  // Chargement initial au montage du composant
  useState(() => { loadConsignes(); return null; });

  const saveConsignes = async (newConsignes, currentSha) => {
    const sha = currentSha || consignesSha;
    if (!sha) { setSyncStatus("error"); setSyncMessage("SHA manquant — rechargez"); return; }
    setSyncStatus("saving");
    try {
      const res = await fetch("/api/save-consignes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ consignes: newConsignes, sha }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setConsignesSha(data.newSha);
      setSyncStatus("saved");
      setSyncMessage(`✓ Sauvegardé · commit ${data.commit.substring(0,7)}`);
      setTimeout(() => setSyncStatus("idle"), 4000);
    } catch (err) {
      setSyncStatus("error");
      setSyncMessage("Erreur de sauvegarde");
    }
  };

  const setConsignesWithSave = (updater) => {
    setConsignes(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      saveConsignes(next);
      return next;
    });
  };

  const syncColors = { loading:"#b8962e", saving:"#b8962e", saved:"#1a5c2a", error:"#8b1a1a", idle:null };
  const syncIcons  = { loading:"⏳", saving:"💾", saved:"✓", error:"⚠️", idle:null };

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
      <div style={{display:"flex",height:"100vh",overflow:"hidden",background:"#f8f6f0"}}>
        <div style={{display:"flex",flexDirection:"column",width:210,background:"#0f2650",flexShrink:0}}>
          <Sidebar page={page} setPage={setPage}/>
          {syncStatus !== "idle" && (
            <div style={{padding:"7px 14px",background:"rgba(0,0,0,.25)",borderTop:"1px solid rgba(255,255,255,.08)",display:"flex",alignItems:"center",gap:7,marginTop:"auto"}}>
              <span style={{fontSize:12}}>{syncIcons[syncStatus]}</span>
              <span style={{fontSize:10,color:syncColors[syncStatus]||"#8a8aaa",lineHeight:1.3,flex:1}}>{syncMessage||syncStatus}</span>
            </div>
          )}
        </div>
        <main style={{flex:1,overflow:"hidden",display:"flex",flexDirection:"column"}}>
          {page==="correction"   && <CorrectionPage consignes={consignes} history={history} setHistory={setHistory}/>}
          {page==="historique"   && <HistoriquePage history={history}/>}
          {page==="dashboard"    && <DashboardPage history={history}/>}
          {page==="consignes"    && <ConsignesPage consignes={consignes} setConsignes={setConsignesWithSave} onReload={loadConsignes} syncStatus={syncStatus}/>}
          {page==="utilisateurs" && <UtilisateursPage/>}
        </main>
      </div>
    </>
  );
}
