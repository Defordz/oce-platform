// lib/consignesSeed.js
// Donnees initiales : versees automatiquement dans le store au premier demarrage.
// Source unique generee en phase 1 (34 consignes, schema mode/scope/active).

export default [
  {
    "scope": [
      "tout"
    ],
    "active": true,
    "regex": null,
    "version": "3.0",
    "created": "2026-06-23",
    "code": "F-01",
    "doctype": "cp_fr",
    "category": "FORME",
    "mode": "claude",
    "label": "Formule d'ouverture",
    "text": "Formule canonique conforme a l'article 13 de la loi n°104-12 et l'article 10 du decret n°2-14-652, tels qu'ils ont ete modifies et completes : le Conseil met a la disposition du public le « resume de l'operation ».",
    "examples": "tels qu'ils sont modifies -> tels qu'ils ont ete modifies et completes",
    "notes": "Art. 13 loi n°104-12 / Art. 10 decret n°2-14-652",
    "id": "F-01"
  },
  {
    "scope": [
      "tout"
    ],
    "active": true,
    "regex": null,
    "version": "3.0",
    "created": "2026-06-23",
    "code": "F-02",
    "doctype": "cp_fr",
    "category": "FORME",
    "mode": "claude",
    "label": "Responsabilite des parties",
    "text": "Phrase de responsabilite. Accorder singulier/pluriel selon le nombre de parties notifiantes : 'qui en sont seules responsables' (pluriel) ou 'qui en est seule responsable' (singulier).",
    "examples": "qui en est seule responsable (alors que plusieurs parties) -> qui en sont seules responsables",
    "notes": "Verifier l'accord",
    "id": "F-02"
  },
  {
    "scope": [
      "tout"
    ],
    "active": true,
    "regex": null,
    "version": "3.0",
    "created": "2026-06-23",
    "code": "F-03",
    "doctype": "cp_fr",
    "category": "FORME",
    "mode": "claude",
    "label": "Clause de completude du dossier",
    "text": "Clause obligatoire : la publication n'atteste pas de la completude du dossier prevue a l'article 9 du decret n°2-14-652.",
    "examples": "pris pour son application -> pris pour l'application de la loi n°104-12",
    "notes": "Art. 9 decret n°2-14-652",
    "id": "F-03"
  },
  {
    "scope": [
      "tout"
    ],
    "active": false,
    "regex": null,
    "version": "3.0",
    "created": "2026-06-23",
    "code": "F-04",
    "doctype": "cp_fr",
    "category": "FORME",
    "mode": "claude",
    "label": "Designation de l'institution (majuscule)",
    "text": "REGLE MODIFIEE RECEMMENT. A reconfigurer avec le libelle courant avant reactivation. Ne pas appliquer tant que la nouvelle regle de capitalisation n'est pas fixee.",
    "examples": "(a definir selon la regle a jour)",
    "notes": "Inactive : libelle a confirmer par l'administrateur",
    "id": "F-04"
  },
  {
    "scope": [
      "tout"
    ],
    "active": true,
    "regex": [
      {
        "find": "«([^\\s«»])",
        "replace": "« $1",
        "flags": "g",
        "label": "espace apres «"
      },
      {
        "find": "([^\\s«»])»",
        "replace": "$1 »",
        "flags": "g",
        "label": "espace avant »"
      }
    ],
    "version": "3.0",
    "created": "2026-06-23",
    "code": "F-05",
    "doctype": "cp_fr",
    "category": "FORME",
    "mode": "regex",
    "label": "Guillemets francais, espaces insecables",
    "text": "Les guillemets francais doivent etre suivis/precedes d'une espace : « X ».",
    "examples": "«Societe X» -> « Societe X »",
    "notes": "Typographie francaise. Fusion de l'ancien F-12.",
    "id": "F-05"
  },
  {
    "scope": [
      "tout"
    ],
    "active": true,
    "regex": null,
    "version": "3.0",
    "created": "2026-06-23",
    "code": "F-06",
    "doctype": "cp_fr",
    "category": "FORME",
    "mode": "claude",
    "label": "Structure du titre",
    "text": "Titre standard : « Communique du Conseil de la Concurrence relatif au projet de concentration economique concernant [...] ». Eviter les redondances.",
    "examples": "relatif au projet de concentration relatif a -> supprimer la redondance",
    "notes": "Structure standard",
    "id": "F-06"
  },
  {
    "scope": [
      "titre",
      "resume"
    ],
    "active": true,
    "regex": null,
    "version": "3.0",
    "created": "2026-06-23",
    "code": "F-07",
    "doctype": "cp_fr",
    "category": "FORME",
    "mode": "claude",
    "label": "Mention 'la societe' devant les denominations",
    "text": "Dans le TITRE et le RESUME, tout nom de societe entre guillemets doit etre precede de 'la societe'. NE PAS appliquer dans les rubriques (L'acquereur, La cible, etc.). Regle de jugement (le perimetre titre/resume ne peut pas etre garanti par une regex seule).",
    "examples": "prise du controle conjoint par « XXXX » -> par la societe « XXXX »",
    "notes": "Fusion et dedoublonnage des anciens F-13 et F-14, qui s'appliquaient deux fois au meme passage et hors perimetre. Traite par Claude pour respecter le scope.",
    "id": "F-07"
  },
  {
    "scope": [
      "tout"
    ],
    "active": true,
    "regex": [
      {
        "find": "entreprises et groupes concern[eé]es",
        "replace": "entreprises et groupes concernés",
        "flags": "gi",
        "label": "accord masculin pluriel"
      }
    ],
    "version": "3.0",
    "created": "2026-06-23",
    "code": "F-08",
    "doctype": "cp_fr",
    "category": "FORME",
    "mode": "regex",
    "label": "Accord 'entreprises et groupes concernes'",
    "text": "'entreprises et groupes concernes' au masculin pluriel (accord avec 'groupes').",
    "examples": "entreprises et groupes concernees -> entreprises et groupes concernes",
    "notes": "Accord grammatical",
    "id": "F-08"
  },
  {
    "scope": [
      "tout"
    ],
    "active": true,
    "regex": [
      {
        "find": "prise de le contrôle",
        "replace": "prise du contrôle",
        "flags": "gi",
        "label": "de le -> du"
      },
      {
        "find": "([Pp])rise de (contrôle (?:exclusif|conjoint))",
        "replace": "$1rise du $2",
        "flags": "g",
        "label": "de controle exclusif/conjoint -> du"
      }
    ],
    "version": "3.0",
    "created": "2026-06-23",
    "code": "D-01",
    "doctype": "cp_fr",
    "category": "FOND",
    "mode": "regex",
    "label": "Prise du controle exclusif/conjoint — 'du'",
    "text": "Forme consacree 'prise du controle exclusif/conjoint' (jamais 'de controle' ni 'de le controle').",
    "examples": "Prise de controle exclusif -> Prise du controle exclusif ; prise de le controle -> prise du controle",
    "notes": "Art. 11 loi n°104-12. Verifier aussi 'controle conjoint' (Claude) pour les cas hors patron.",
    "id": "D-01"
  },
  {
    "scope": [
      "tout"
    ],
    "active": true,
    "regex": null,
    "version": "3.0",
    "created": "2026-06-23",
    "code": "D-02",
    "doctype": "cp_fr",
    "category": "FOND",
    "mode": "claude",
    "label": "Controle conjoint / entreprise commune",
    "text": "'Prise du controle conjoint' ; pour une JV 'Creation d'entreprise commune' (sans article).",
    "examples": "Creation de l'entreprise commune -> Creation d'entreprise commune",
    "notes": "Art. 11 loi n°104-12",
    "id": "D-02"
  },
  {
    "scope": [
      "tout"
    ],
    "active": true,
    "regex": null,
    "version": "3.0",
    "created": "2026-06-23",
    "code": "D-03",
    "doctype": "cp_fr",
    "category": "FOND",
    "mode": "claude",
    "label": "Designation des parties dans le tableau",
    "text": "Employer L'acquereur / La cible / L'acquereur direct / indirect / La societe fondatrice n°1/2 / L'entreprise commune, toujours suivi de : la societe « Nom ».",
    "examples": "Cible : Y -> La cible : la societe « Y »",
    "notes": "Structure standard",
    "id": "D-03"
  },
  {
    "scope": [
      "tout"
    ],
    "active": true,
    "regex": null,
    "version": "3.0",
    "created": "2026-06-23",
    "code": "D-04",
    "doctype": "cp_fr",
    "category": "FOND",
    "mode": "claude",
    "label": "Description juridique des societes (droit applicable)",
    "text": "A la premiere mention : forme juridique, droit applicable ('de droit marocain'/'de droit [pays]'), siege social, numero RC.",
    "examples": "societe anonyme au capital -> societe anonyme de droit marocain au capital",
    "notes": "Detection par jugement uniquement (ancien D-07 regex:null).",
    "id": "D-04"
  },
  {
    "scope": [
      "tout"
    ],
    "active": true,
    "regex": [
      {
        "find": "opération de projet de concentration",
        "replace": "opération de concentration",
        "flags": "gi",
        "label": "cumul operation/projet"
      }
    ],
    "version": "3.0",
    "created": "2026-06-23",
    "code": "D-05",
    "doctype": "cp_fr",
    "category": "FOND",
    "mode": "regex",
    "label": "Formule du resume — ne pas cumuler 'operation de' et 'projet de'",
    "text": "Le resume commence par 'a recu la notification d'une operation de concentration...' ou '...d'un projet de concentration...'. Ne pas cumuler.",
    "examples": "operation de projet de concentration -> operation de concentration",
    "notes": "Structure standard du resume",
    "id": "D-05"
  },
  {
    "scope": [
      "tout"
    ],
    "active": true,
    "regex": [
      {
        "find": "tiers intéressées",
        "replace": "tiers intéressés",
        "flags": "gi",
        "label": "accord masculin"
      }
    ],
    "version": "3.0",
    "created": "2026-06-23",
    "code": "D-06",
    "doctype": "cp_fr",
    "category": "FOND",
    "mode": "claude",
    "label": "Delai d'observations des tiers",
    "text": "Formule : 'Delai dans lequel les tiers interesses sont invites a faire connaitre leurs observations : - 10 jours a partir de la date de publication..., soit le [J+10].' Tiret obligatoire devant '10 jours'. Une regex corrige l'accord 'tiers interesses'.",
    "examples": "les tiers interessees -> les tiers interesses",
    "notes": "Art. 13 loi n°104-12. Le tiret et la date J+10 sont verifies par Claude.",
    "id": "D-06"
  },
  {
    "scope": [
      "tout"
    ],
    "active": true,
    "regex": null,
    "version": "3.0",
    "created": "2026-06-23",
    "code": "D-07",
    "doctype": "cp_fr",
    "category": "FOND",
    "mode": "claude",
    "label": "Intitule du resume en majuscules accentuees",
    "text": "Intitule : « RESUME NON CONFIDENTIEL DE L'OPERATION FOURNI PAR LES PARTIES » (en majuscules, avec accents).",
    "examples": "RESUME NON CONFIDENTIEL DE L'OPERATION -> RÉSUMÉ NON CONFIDENTIEL DE L'OPÉRATION",
    "notes": "Standard typographique",
    "id": "D-07"
  },
  {
    "scope": [
      "tout"
    ],
    "active": true,
    "regex": null,
    "version": "3.0",
    "created": "2026-06-23",
    "code": "F-15",
    "doctype": "cp_fr",
    "category": "FORME",
    "mode": "claude",
    "label": "Concordance de genre grammatical",
    "text": "Accords de genre entre determinant, nom et participe : 'la societe... notifiee' (fem.), 'le groupe... notifie' (masc.), 'l'operation... autorisee' (fem.). Jugement requis (l'ancienne regex produisait des faux positifs).",
    "examples": "la societe X a ete notifie -> la societe X a ete notifiee",
    "notes": "Ancien F-15 reclasse en jugement (regex trop fragile).",
    "id": "F-15"
  },
  {
    "scope": [
      "tout"
    ],
    "active": true,
    "regex": null,
    "version": "3.0",
    "created": "2026-06-23",
    "code": "A-01",
    "doctype": "cp_ar",
    "category": "FORME",
    "mode": "claude",
    "label": "الصيغة الافتتاحية",
    "text": "الصيغة الثابتة طبقا للمادة 13 من القانون رقم 104.12 والمادة 10 من المرسوم رقم 2.14.652، كما تم تغييرهما وتتميمهما. يضع مجلس المنافسة رهن إشارة العموم «ملخص العملية».",
    "examples": "كما تم تعديلهما -> كما تم تغييرهما وتتميمهما",
    "notes": "المادة 13 / المرسوم 2.14.652. أرقام القانون والمرسوم تُصحَّح آليا (A-08، A-09).",
    "id": "A-01"
  },
  {
    "scope": [
      "tout"
    ],
    "active": true,
    "regex": null,
    "version": "3.0",
    "created": "2026-06-23",
    "code": "A-02",
    "doctype": "cp_ar",
    "category": "FORME",
    "mode": "claude",
    "label": "صيغة المسؤولية",
    "text": "الصيغة الثابتة : أُعدّت المعلومات من قبل الأطراف المبلغة التي تعتبر وحدها المسؤولة عنها.",
    "examples": "من قبل الطرف المبلغ (عند تعدد الأطراف) -> من قبل الأطراف المبلغة",
    "notes": "صيغة قياسية",
    "id": "A-02"
  },
  {
    "scope": [
      "tout"
    ],
    "active": true,
    "regex": null,
    "version": "3.0",
    "created": "2026-06-23",
    "code": "A-03",
    "doctype": "cp_ar",
    "category": "FORME",
    "mode": "claude",
    "label": "صيغة اكتمال الملف",
    "text": "الصيغة الثابتة : نشر هذا البلاغ لا يفيد باكتمال الملف طبقا للمادة 9 من المرسوم رقم 2.14.652.",
    "examples": "الإعلان -> البلاغ",
    "notes": "المادة 9 من المرسوم 2.14.652",
    "id": "A-03"
  },
  {
    "scope": [
      "tout"
    ],
    "active": true,
    "regex": [
      {
        "find": "\"([^\"]+)\"",
        "replace": "«$1»",
        "flags": "g",
        "label": "مزدوجات مستقيمة -> «»"
      }
    ],
    "version": "3.0",
    "created": "2026-06-23",
    "code": "A-08",
    "doctype": "cp_ar",
    "category": "FORME",
    "mode": "regex",
    "label": "علامات التنصيص — مزدوجات لاتينية إلى مزدوجات عربية",
    "text": "استبدال علامات التنصيص المستقيمة بالمزدوجات « » (دون فراغات داخلية في النص العربي).",
    "examples": "\"ملخص العملية\" -> «ملخص العملية»",
    "notes": "جديدة. تصحيح آلي للمزدوجات.",
    "id": "A-08"
  },
  {
    "scope": [
      "tout"
    ],
    "active": true,
    "regex": [
      {
        "find": "12\\.104",
        "replace": "104.12",
        "flags": "g",
        "label": "12.104 -> 104.12"
      }
    ],
    "version": "3.0",
    "created": "2026-06-23",
    "code": "A-09",
    "doctype": "cp_ar",
    "category": "FORME",
    "mode": "regex",
    "label": "رقم القانون 104.12",
    "text": "رقم القانون هو 104.12 (لا 12.104).",
    "examples": "القانون رقم 12.104 -> القانون رقم 104.12",
    "notes": "جديدة. الشكل المعتمد 104.12.",
    "id": "A-09"
  },
  {
    "scope": [
      "tout"
    ],
    "active": true,
    "regex": [
      {
        "find": "652\\.14\\.2",
        "replace": "2.14.652",
        "flags": "g",
        "label": "652.14.2 -> 2.14.652"
      }
    ],
    "version": "3.0",
    "created": "2026-06-23",
    "code": "A-10",
    "doctype": "cp_ar",
    "category": "FORME",
    "mode": "regex",
    "label": "رقم المرسوم 2.14.652",
    "text": "رقم المرسوم التطبيقي هو 2.14.652 (لا 652.14.2). يجب أن يكون الشكل موحدا في كامل الوثيقة.",
    "examples": "المرسوم رقم 652.14.2 -> المرسوم رقم 2.14.652",
    "notes": "جديدة. الشكل المعتمد 2.14.652 (يطابق المرسوم 2-14-652).",
    "id": "A-10"
  },
  {
    "scope": [
      "tout"
    ],
    "active": true,
    "regex": null,
    "version": "3.0",
    "created": "2026-06-23",
    "code": "A-04",
    "doctype": "cp_ar",
    "category": "FOND",
    "mode": "claude",
    "label": "طبيعة العملية — مراقبة حصرية",
    "text": "الصياغة المعتمدة في الجدول : «تولي المراقبة الحصرية» ؛ وفي الملخص : «تولي [الجهة المقتنية] المراقبة الحصرية على [الجهة المستهدفة]».",
    "examples": "الاستحواذ الحصري -> تولي المراقبة الحصرية",
    "notes": "المادة 11 من القانون 104.12",
    "id": "A-04"
  },
  {
    "scope": [
      "tout"
    ],
    "active": true,
    "regex": [
      {
        "find": "المستحوذ",
        "replace": "الجهة المقتنية",
        "flags": "g",
        "label": "المستحوذ -> الجهة المقتنية"
      },
      {
        "find": "الشركة المستهدفة",
        "replace": "الجهة المستهدفة",
        "flags": "g",
        "label": "الشركة المستهدفة -> الجهة المستهدفة"
      }
    ],
    "version": "3.0",
    "created": "2026-06-23",
    "code": "A-05",
    "doctype": "cp_ar",
    "category": "FOND",
    "mode": "regex",
    "label": "تسمية الأطراف",
    "text": "الجهة المقتنية (لا المستحوذ). الجهة المستهدفة (لا الشركة المستهدفة). الصيغ الأخرى (توصل... بتبليغ بدل استقبل/تلقى) تُعالَج بالجهة الحاكمة.",
    "examples": "المستحوذ -> الجهة المقتنية ؛ الشركة المستهدفة -> الجهة المستهدفة",
    "notes": "المصطلحات الرسمية. 'المشتري' و'استقبل/تلقى' تُترَك لتقدير Claude لتجنب الإيجابيات الخاطئة.",
    "id": "A-05"
  },
  {
    "scope": [
      "tout"
    ],
    "active": true,
    "regex": null,
    "version": "3.0",
    "created": "2026-06-23",
    "code": "A-06",
    "doctype": "cp_ar",
    "category": "FOND",
    "mode": "claude",
    "label": "الأجل والتاريخ",
    "text": "الصيغة : «الأجل المحدد للأغيار المعنيين لإبداء ملاحظاتهم : - 10 أيام ابتداء من تاريخ النشر، وينتهي يوم [التاريخ]».",
    "examples": "الأطراف الثالثة -> الأغيار المعنيون",
    "notes": "المادة 13 من القانون 104.12. تناسق التاريخ J+10 يُتحقَّق منه عبر Claude.",
    "id": "A-06"
  },
  {
    "scope": [
      "tout"
    ],
    "active": true,
    "regex": null,
    "version": "3.0",
    "created": "2026-06-23",
    "code": "A-07",
    "doctype": "cp_ar",
    "category": "FOND",
    "mode": "claude",
    "label": "الوصف القانوني للشركات",
    "text": "عند الإشارة الأولى : الشكل القانوني، القانون المنظم (خاضعة للقانون المغربي/...)، المقر الاجتماعي، رقم السجل التجاري.",
    "examples": "شركة مغربية -> شركة خاضعة للقانون المغربي",
    "notes": "الاستخدام الثابت",
    "id": "A-07"
  },
  {
    "scope": [
      "tout"
    ],
    "active": true,
    "regex": [
      {
        "find": "\\bMadamme\\b",
        "replace": "Madame",
        "flags": "g",
        "label": "Madamme -> Madame"
      }
    ],
    "version": "3.0",
    "created": "2026-06-23",
    "code": "G-01",
    "doctype": "tous",
    "category": "FORME",
    "mode": "regex",
    "label": "Madame — orthographe",
    "text": "'Madame' sans double lettre.",
    "examples": "Madamme -> Madame",
    "notes": "Faute de frappe frequente",
    "id": "G-01"
  },
  {
    "scope": [
      "tout"
    ],
    "active": true,
    "regex": [
      {
        "find": "\\best une physique\\b",
        "replace": "est une personne physique",
        "flags": "gi",
        "label": "mot manquant"
      }
    ],
    "version": "3.0",
    "created": "2026-06-23",
    "code": "G-02",
    "doctype": "tous",
    "category": "FORME",
    "mode": "regex",
    "label": "Personne physique — formulation",
    "text": "Ecrire 'est une personne physique' et non 'est une physique'.",
    "examples": "est une physique -> est une personne physique",
    "notes": "Mot manquant frequent",
    "id": "G-02"
  },
  {
    "scope": [
      "tout"
    ],
    "active": true,
    "regex": null,
    "version": "3.0",
    "created": "2026-06-23",
    "code": "B-01",
    "doctype": "bilingue",
    "category": "BILINGUE",
    "mode": "compare",
    "label": "Coherence chiffres et pourcentages",
    "text": "Pourcentages, capitaux, numeros RC et dates identiques entre FR et AR. Verification deterministe possible par extraction et comparaison des nombres.",
    "examples": "FR 42,11% / AR 42% -> incoherence a signaler",
    "notes": "Verification croisee. Partie chiffres = deterministe.",
    "id": "B-01"
  },
  {
    "scope": [
      "tout"
    ],
    "active": true,
    "regex": null,
    "version": "3.0",
    "created": "2026-06-23",
    "code": "B-02",
    "doctype": "bilingue",
    "category": "BILINGUE",
    "mode": "compare",
    "label": "Coherence qualification de l'operation",
    "text": "Nature de l'operation identique FR/AR. Prise du controle exclusif <-> تولي المراقبة الحصرية ; conjoint <-> المشتركة ; entreprise commune <-> مشروع مشترك.",
    "examples": "FR controle exclusif / AR مراقبة مشتركة -> incoherence",
    "notes": "Jugement bilingue.",
    "id": "B-02"
  },
  {
    "scope": [
      "tout"
    ],
    "active": true,
    "regex": null,
    "version": "3.0",
    "created": "2026-06-23",
    "code": "B-03",
    "doctype": "bilingue",
    "category": "BILINGUE",
    "mode": "compare",
    "label": "Coherence date de cloture (J+10)",
    "text": "Date limite des observations identique FR/AR et egale a J+10 de la publication. Verifiable de facon deterministe.",
    "examples": "FR 13 octobre / AR 14 اكتوبر -> incoherence",
    "notes": "Art. 13 loi n°104-12.",
    "id": "B-03"
  },
  {
    "scope": [
      "tout"
    ],
    "active": true,
    "regex": null,
    "version": "3.0",
    "created": "2026-06-23",
    "code": "T-01",
    "doctype": "bilingue",
    "category": "TERMINOLOGIE",
    "mode": "compare",
    "label": "Terminologie controle FR<->AR",
    "text": "controle exclusif<->المراقبة الحصرية ; controle conjoint<->المراقبة المشتركة ; l'acquereur<->الجهة المقتنية ; la cible<->الجهة المستهدفة ; parties notifiantes<->الأطراف المبلغة.",
    "examples": "Verifier chaque terme entre les deux versions",
    "notes": "Glossaire officiel.",
    "id": "T-01"
  },
  {
    "scope": [
      "tout"
    ],
    "active": true,
    "regex": null,
    "version": "3.0",
    "created": "2026-06-23",
    "code": "T-02",
    "doctype": "bilingue",
    "category": "TERMINOLOGIE",
    "mode": "compare",
    "label": "Formes juridiques FR<->AR",
    "text": "SA<->شركة مساهمة ; SARL<->شركة ذات المسؤولية المحدودة ; SAS<->شركة أسهم مبسطة ; de droit marocain<->خاضعة للقانون المغربي.",
    "examples": "Verifier la forme juridique de chaque societe",
    "notes": "Terminologie juridique standard.",
    "id": "T-02"
  },
  {
    "scope": [
      "tout"
    ],
    "active": true,
    "regex": null,
    "version": "3.0",
    "created": "2026-06-23",
    "code": "T-03",
    "doctype": "bilingue",
    "category": "TERMINOLOGIE",
    "mode": "compare",
    "label": "Formules procedurales FR<->AR",
    "text": "notification<->تبليغ ; tiers interesses<->الأغيار المعنيون ; resume non confidentiel<->ملخص غير سري ; siege social<->المقر الاجتماعي ; Fait a Rabat le<->حرر في الرباط بتاريخ.",
    "examples": "Verifier la coherence des formules procedurales",
    "notes": "Formules procedurales standard.",
    "id": "T-03"
  }
];
