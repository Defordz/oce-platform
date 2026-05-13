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

  const escXml = s => s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // ── NORMALISATION : rend les caractères spéciaux comparables ──
  // Transforme espaces insécables, apostrophes typographiques, guillemets
  // en leurs équivalents simples pour permettre la recherche de texte
  const norm = s => s
    .replace(/ /g, " ")    // espace insécable → espace
    .replace(/ /g, " ")    // espace fine insécable → espace
    .replace(/’/g, "'")    // apostrophe typographique ' → '
    .replace(/‘/g, "'")    // apostrophe ouvrante ' → '
    .replace(/“/g, '"')    // guillemet anglais ouvrant
    .replace(/”/g, '"')    // guillemet anglais fermant
    .replace(/«/g, "«") // garder « tel quel
    .replace(/»/g, "»") // garder » tel quel
    .replace(/[ 	]+/g, " ")    // espaces multiples → un seul
    .trim();

  // ── APPLY TRACK CHANGES : approche document-level ──
  // Au lieu de travailler paragraphe par paragraphe (qui rate les textes
  // fragmentés entre plusieurs <w:r>), on travaille sur le XML complet
  // du document en une seule passe.
  const applyAllTrackChanges = (docXml, corrections, date) => {
    let result = docXml;
    let changeId = 200;

    for (const { original, suggested } of corrections) {
      if (!original || !suggested || original === suggested) continue;

      // Extraire tous les runs du document sous forme de [{xml, text, start, end}]
      const RUN_RE = /<w:r[ >](?:(?!<w:r[ >])[\s\S])*?<\/w:r>/g;
      const runs = [];
      let m;
      RUN_RE.lastIndex = 0;
      while ((m = RUN_RE.exec(result)) !== null) {
        const tMatch = m[0].match(/<w:t[^>]*>([^<]*)<\/w:t>/);
        runs.push({
          xml: m[0],
          text: tMatch ? tMatch[1] : "",
          start: m.index,
          end: m.index + m[0].length,
        });
      }

      // Reconstruire le texte complet normalisé pour la recherche
      const rawFull = runs.map(r => r.text).join("");
      const normFull = norm(rawFull);
      const normOrig = norm(original);

      const normPos = normFull.indexOf(normOrig);
      if (normPos === -1) {
        console.warn("[TC] Non trouvé:", JSON.stringify(original.substring(0, 60)));
        continue;
      }

      // Mapper la position normalisée → position dans rawFull
      // On fait correspondre caractère par caractère
      let rawPos = 0, nPos = 0;
      while (nPos < normPos && rawPos < rawFull.length) {
        const rawChar = rawFull[rawPos];
        const normChar = norm(rawChar);
        nPos += normChar.length;
        rawPos++;
      }
      // rawPos est maintenant ~ la position de début dans rawFull
      const rawStart = rawPos;
      const rawEnd = rawStart + original.length;

      // Trouver quels runs sont concernés
      let cum = 0;
      let startRunIdx = null, endRunIdx = null;
      for (let i = 0; i < runs.length; i++) {
        const runEnd = cum + runs[i].text.length;
        if (startRunIdx === null && runEnd > rawStart) startRunIdx = i;
        if (endRunIdx === null && runEnd >= rawEnd) { endRunIdx = i; break; }
        cum += runs[i].text.length;
      }

      if (startRunIdx === null || endRunIdx === null) {
        console.warn("[TC] Runs non trouvés pour:", JSON.stringify(original.substring(0, 60)));
        continue;
      }

      // Récupérer la mise en forme du premier run concerné
      const firstRun = runs[startRunIdx];
      const rprMatch = firstRun.xml.match(/<w:rPr>[\s\S]*?<\/w:rPr>/);
      const rpr = rprMatch ? rprMatch[0] : "";

      // Texte exact dans le document (avec les vrais caractères, pas normalisés)
      const spanStart = runs.slice(0, startRunIdx).reduce((s, r) => s + r.text.length, 0);
      const spanEnd = runs.slice(0, endRunIdx + 1).reduce((s, r) => s + r.text.length, 0);
      const preText = rawFull.slice(spanStart, rawStart);
      const postText = rawFull.slice(rawEnd, spanEnd);
      const actualOriginal = rawFull.slice(rawStart, rawEnd);

      // Construire les blocs XML de track change
      const preXml  = preText  ? \`<w:r>\${rpr}<w:t xml:space="preserve">\${escXml(preText)}</w:t></w:r>\`  : "";
      const postXml = postText ? \`<w:r>\${rpr}<w:t xml:space="preserve">\${escXml(postText)}</w:t></w:r>\` : "";
      const delXml  = \`<w:del w:id="\${changeId++}" w:author="OCE Correction" w:date="\${date}"><w:r>\${rpr}<w:delText xml:space="preserve">\${escXml(actualOriginal)}</w:delText></w:r></w:del>\`;
      const insXml  = \`<w:ins w:id="\${changeId++}" w:author="OCE Correction" w:date="\${date}"><w:r>\${rpr}<w:t xml:space="preserve">\${escXml(suggested)}</w:t></w:r></w:ins>\`;

      const replacement = preXml + delXml + insXml + postXml;

      // Remplacer dans le XML complet du document
      const xmlStart = runs[startRunIdx].start;
      const xmlEnd   = runs[endRunIdx].end;
      result = result.slice(0, xmlStart) + replacement + result.slice(xmlEnd);

      console.log(\`[TC] ✅ "\${actualOriginal.substring(0,40)}" → "\${suggested.substring(0,40)}"\`);
    }
    return result;
  };

  // Ancienne fonction gardée pour compatibilité (non utilisée)
  const applyTrackChangesToPara = (paraXml, corrections, changeId, date) => paraXml;

  const downloadWord = async () => {
    const accepted = corrections.filter((_, i) => statuses[i] !== "rejected");
    if (!accepted.length) { alert("Aucune correction à télécharger."); return; }
    if (!fileBytes) { alert("Veuillez uploader un fichier .docx pour utiliser cette fonctionnalité."); return; }

    try {
      const zip = await JSZip.loadAsync(fileBytes);
      const docXml = await zip.file("word/document.xml").async("string");
      const date = new Date().toISOString().split(".")[0] + "Z";

      const correctionsList = accepted.map(c => ({ original: c.original, suggested: c.suggested }));
      const result = applyAllTrackChanges(docXml, correctionsList, date);

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
    setForm({code, id:code, doctype:"cp_fr", category:cat, label:"", text:"", examples:"", notes:"", version:"1.0"});
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



  return (
    <div style={{display:"flex",flexDirection:"column",height:"100%",overflow:"hidden"}}>
      <PageHeader
        title="Fiches de consignes"
        sub={`Règles de correction par type de document — ${consignes.length} consignes`}
        right={
          <div style={{display:"flex",gap:8}}>
            <button onClick={() => {
              if(window.confirm(`Importer les ${CONSIGNES_2025.length} fiches officielles 2025 ? Les consignes existantes seront remplacées.`)) {
                setConsignes(CONSIGNES_2025.map(c => ({...c, created: new Date().toLocaleDateString("fr-FR")})));
              }
            }} style={{padding:"7px 14px",border:`1px solid ${C.gold}`,borderRadius:7,background:"#fdf5e0",color:C.amber,fontSize:12.5,fontWeight:500,cursor:"pointer"}}>
              ⬇ Fiches 2025
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
                  if (!window.confirm(`Importer ${fiches.length} fiches depuis le fichier JSON ?\nLes consignes existantes seront remplacées.`)) return;
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
              const data = JSON.stringify({version:"1.0",source:"OCE Platform",created:new Date().toLocaleDateString("fr-FR"),count:consignes.length,consignes}, null, 2);
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
  const [history, setHistory] = useState([]);

  // ── PERSISTANCE localStorage ──
  // Charge les consignes sauvegardées, sinon utilise les consignes par défaut
  const [consignes, setConsignes] = useState(() => {
    try {
      const saved = localStorage.getItem("oce_consignes");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn("Erreur lecture localStorage:", e);
    }
    return DEFAULT_CONSIGNES;
  });

  // Sauvegarde automatique à chaque modification des consignes
  const setConsignesWithSave = (updater) => {
    setConsignes(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      try {
        localStorage.setItem("oce_consignes", JSON.stringify(next));
      } catch (e) {
        console.warn("Erreur écriture localStorage:", e);
      }
      return next;
    });
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
          {page==="historique"    && <HistoriquePage history={history}/>}
          {page==="dashboard"     && <DashboardPage history={history}/>}
          {page==="consignes"     && <ConsignesPage consignes={consignes} setConsignes={setConsignesWithSave}/>}
          {page==="utilisateurs"  && <UtilisateursPage/>}
        </main>
      </div>
    </>
  );
}
