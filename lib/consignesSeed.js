// lib/consignesSeed.js
// Donnees initiales : versees automatiquement dans le store au premier demarrage.
// Copie de reference des consignes en service (v6 du 03/11/2026 : 46 consignes des communiques
// et decisions, 34 consignes des lettres),
// mise a jour avec les corrections demandees par le rapporteur.

export default [
  {
    "scope": [
      "tout"
    ],
    "active": true,
    "regex": null,
    "version": "1.0",
    "created": "2026-04-27",
    "code": "F-01",
    "doctype": "cp_fr",
    "category": "FORME",
    "mode": "claude",
    "label": "Formule d'ouverture",
    "text": "Formule canonique : « Conformément à l'article 13 de la loi n°104-12 relative à la liberté des prix et de la concurrence et l'article 10 du décret n° 2-14-652 pris pour son application, tels qu'ils ont été modifiés et complétés, le Conseil de la concurrence met à la disposition du public le « résumé de l'opération » ci-dessous, contenant les renseignements communiqués par les parties. »",
    "examples": "✗ tels qu'ils sont modifiés → ✓ tels qu'ils ont été modifiés et complétés\n✗ le Conseil de la Concurrence → ✓ le Conseil de la concurrence (C majuscule à Conseil seulement)\n✗ telle que modifiée → ✓ tels qu'ils ont été modifiés (accord pluriel)",
    "notes": "Art. 13 loi n°104-12 / Art. 10 décret n°2-14-652",
    "id": "F-01"
  },
  {
    "scope": [
      "tout"
    ],
    "active": true,
    "regex": null,
    "version": "1.0",
    "created": "2026-04-27",
    "code": "F-02",
    "doctype": "cp_fr",
    "category": "FORME",
    "mode": "claude",
    "label": "Responsabilité des parties",
    "text": "Phrase de responsabilité : « Ces informations ont été élaborées par les parties notifiantes, qui en sont seules responsables. Les renseignements inexacts ou dénaturés qui y figureraient ne préjugent nullement de la position du Conseil de la concurrence sur l'opération envisagée. » Si une seule partie : « par la partie notifiante, qui en est seule responsable ».",
    "examples": "✗ qui en est seule responsable (pluriel) → ✓ qui en sont seules responsables\n✗ par la parties notifiantes → ✓ par les parties notifiantes",
    "notes": "Formule standard - vérifier accord singulier/pluriel",
    "id": "F-02"
  },
  {
    "scope": [
      "tout"
    ],
    "active": true,
    "regex": null,
    "version": "1.0",
    "created": "2026-04-27",
    "code": "F-03",
    "doctype": "cp_fr",
    "category": "FORME",
    "mode": "claude",
    "label": "Clause de complétude du dossier",
    "text": "Clause obligatoire : « La publication de ce communiqué n'atteste pas de la complétude du dossier prévue à l'article 9 du décret n°2-14-652 pris pour l'application de la loi n°104-12 sur la liberté des prix et de la concurrence tels qu'ils ont été modifiés et complétés. »",
    "examples": "✗ pris pour son application → ✓ pris pour l'application de la loi n°104-12\n✗ tels qu'ils sont modifiés → ✓ tels qu'ils ont été modifiés et complétés",
    "notes": "Art. 9 décret n°2-14-652",
    "id": "F-03"
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
        "label": "espace après «"
      },
      {
        "find": "([^\\s«»])»",
        "replace": "$1 »",
        "flags": "g",
        "label": "espace avant »"
      }
    ],
    "version": "1.0",
    "created": "2026-04-27",
    "code": "F-05",
    "doctype": "cp_fr",
    "category": "FORME",
    "mode": "regex",
    "label": "Guillemets et typographie",
    "text": "Utiliser les guillemets français « … » avec espaces insécables pour toutes les dénominations sociales, termes juridiques cités et le « résumé de l'opération ». Ne pas utiliser les guillemets droits anglais.",
    "examples": "✗ Société X SA (guillemets droits) → ✓ « Société X SA » (guillemets français)\n✗ le résumé de l'opération → ✓ le « résumé de l'opération »",
    "notes": "Typographie française officielle. Regex pour les espaces ; le reste relève du jugement.",
    "id": "F-05"
  },
  {
    "scope": [
      "tout"
    ],
    "active": true,
    "regex": null,
    "version": "1.0",
    "created": "2026-04-27",
    "code": "F-06",
    "doctype": "cp_fr",
    "category": "FORME",
    "mode": "claude",
    "label": "Structure du titre",
    "text": "Titre standard : « Communiqué du Conseil de la concurrence relatif au projet de concentration économique concernant [description] ». Variante admise pour JV : « …concernant la création de l'entreprise commune… »",
    "examples": "✗ Communiqué du Conseil de la concurrence relatif à la concentration → ✓ relatif au projet de concentration économique\n✗ Communiqué relatif au projet de concentration relatif à → ✓ supprimer la redondance",
    "notes": "Structure standard CP 2025",
    "id": "F-06"
  },
  {
    "scope": [
      "titre"
    ],
    "active": true,
    "regex": null,
    "version": "1.1",
    "created": "2026-06-26",
    "code": "F-07",
    "doctype": "cp_fr",
    "category": "FORME",
    "mode": "claude",
    "label": "Mention 'la société' devant les dénominations",
    "text": "Dans le TITRE, tout nom de société entre guillemets doit être précédé de « la société ». NE PAS appliquer dans le RÉSUMÉ NON CONFIDENTIEL : les descriptions y commencent par « X » est une société…, et ajouter « la société » produirait « La société X est une société… ». NE PAS appliquer non plus dans les rubriques du tableau (L'acquéreur, La cible, etc.), régies par D-03.",
    "examples": "TITRE : prise de contrôle conjoint par « XXXX » → par la société « XXXX »\nRÉSUMÉ (ne pas modifier) : « ABB Ltd » est une société à responsabilité limitée → inchangé",
    "notes": "AJOUT. Fusion et dédoublonnage des anciens F-13 et F-14 du fichier consignes.json, qui s'appliquaient deux fois au même passage et hors périmètre.\n[21/10/2026] Périmètre réduit au titre : plus d'ajout de « la société » dans le résumé non confidentiel.",
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
    "version": "1.0",
    "created": "2026-06-26",
    "code": "F-08",
    "doctype": "cp_fr",
    "category": "FORME",
    "mode": "regex",
    "label": "Accord 'entreprises et groupes concernés'",
    "text": "'entreprises et groupes concernés' au masculin pluriel (accord avec 'groupes').",
    "examples": "entreprises et groupes concernées → entreprises et groupes concernés",
    "notes": "AJOUT. Accord grammatical (règle générale de l'ancien consignes.json).",
    "id": "F-08"
  },
  {
    "scope": [
      "tout"
    ],
    "active": true,
    "regex": null,
    "version": "1.0",
    "created": "2026-06-26",
    "code": "F-15",
    "doctype": "cp_fr",
    "category": "FORME",
    "mode": "claude",
    "label": "Concordance de genre grammatical",
    "text": "Accords de genre entre déterminant, nom et participe : 'la société... notifiée' (fém.), 'le groupe... notifié' (masc.), 'l'opération... autorisée' (fém.).",
    "examples": "la société X a été notifié → la société X a été notifiée",
    "notes": "AJOUT. Ancien F-15 du fichier consignes.json, reclassé en jugement (regex trop fragile).",
    "id": "F-15"
  },
  {
    "scope": [
      "tout"
    ],
    "active": true,
    "regex": [
      {
        "find": "([Pp])rise de le (contrôle)",
        "replace": "$1rise de $2",
        "flags": "g",
        "label": "de le contrôle -> de contrôle"
      },
      {
        "find": "([Pp])rise du (contrôle (?:exclusif|conjoint))",
        "replace": "$1rise de $2",
        "flags": "g",
        "label": "du contrôle -> de contrôle"
      },
      {
        "find": "Acquisition du (contrôle (?:exclusif|conjoint))",
        "replace": "Prise de $1",
        "flags": "g",
        "label": "Acquisition du contrôle -> Prise de contrôle"
      },
      {
        "find": "(?<![lLdD]['’])\\bacquisition du (contrôle (?:exclusif|conjoint))",
        "replace": "prise de $1",
        "flags": "g",
        "label": "acquisition du contrôle -> prise de contrôle"
      }
    ],
    "version": "1.2",
    "created": "2026-04-27",
    "code": "D-01",
    "doctype": "cp_fr",
    "category": "FOND",
    "mode": "claude",
    "label": "Nature - contrôle exclusif",
    "text": "Pour contrôle exclusif : dans le tableau « Prise de contrôle exclusif ». Dans le titre et le résumé, l'ordre des parties est libre : « prise de contrôle exclusif de [cible] par [acquéreur] » ou « prise de contrôle exclusif par [acquéreur] de [cible] ». Conserver l'ordre retenu dans le texte, ne JAMAIS l'inverser (l'inversion peut rendre ambigu un renvoi tel que « par l'intermédiaire de sa filiale »). Toujours « de contrôle », jamais « du contrôle ».",
    "examples": "✗ Prise du contrôle exclusif → ✓ Prise de contrôle exclusif\n✗ Acquisition du contrôle exclusif → ✓ Prise de contrôle exclusif (terme consacré)\n✗ la prise de le contrôle → ✓ la prise de contrôle\n✓ la prise de contrôle exclusif de la société « Y » par la société « X », par l'intermédiaire de sa filiale → inchangé (ne pas inverser les parties)",
    "notes": "Art. 11 loi n°104-12 - formule consacrée dans tous CP 2025. Regex de sécurité pour 'de le' et 'de contrôle exclusif/conjoint' ; le reste relève du jugement.\n[21/10/2026] Règle inversée à la demande du rapporteur : « prise de contrôle », jamais « prise du contrôle ».\n[21/10/2026] Ordre des parties libre (cible puis acquéreur, ou l'inverse) ; interdiction d'inverser l'ordre retenu.",
    "id": "D-01"
  },
  {
    "scope": [
      "tout"
    ],
    "active": true,
    "regex": null,
    "version": "1.2",
    "created": "2026-04-27",
    "code": "D-02",
    "doctype": "cp_fr",
    "category": "FOND",
    "mode": "claude",
    "label": "Nature - contrôle conjoint / JV",
    "text": "Pour contrôle conjoint : « Prise de contrôle conjoint » dans le tableau. Pour JV : « Création d'entreprise commune » (sans article). Dans le titre et le résumé, l'ordre des parties est libre : « prise de contrôle conjoint de [cible] par [acquéreur] aux côtés de [associé] » ou « prise de contrôle conjoint par [acquéreur] de [cible] aux côtés de [associé] ». Conserver l'ordre retenu dans le texte, ne JAMAIS l'inverser. Toujours « de contrôle », jamais « du contrôle ».",
    "examples": "✗ Prise du contrôle conjoint → ✓ Prise de contrôle conjoint\n✗ Création de l'entreprise commune → ✓ Création d'entreprise commune",
    "notes": "Art. 11 loi n°104-12\n[21/10/2026] « prise de contrôle conjoint », jamais « prise du contrôle ».\n[21/10/2026] Ordre des parties libre ; interdiction d'inverser l'ordre retenu.",
    "id": "D-02"
  },
  {
    "scope": [
      "tout"
    ],
    "active": true,
    "regex": null,
    "version": "1.0",
    "created": "2026-04-27",
    "code": "D-03",
    "doctype": "cp_fr",
    "category": "FOND",
    "mode": "claude",
    "label": "Désignation des parties dans tableau",
    "text": "Dans le tableau utiliser : « L'acquéreur » / « La cible » / « L'acquéreur direct » / « L'acquéreur indirect » / « La société fondatrice n°1/2 » (JV) / « L'entreprise commune » (JV). Toujours suivi de : la société « Nom SA ».",
    "examples": "✗ L'Acquéreur : la société X → ✓ L'acquéreur : la société « X »\n✗ Cible : Y → ✓ La cible : la société « Y »\n✗ Acquéreur direct: X → ✓ L'acquéreur direct : la société « X »",
    "notes": "Structure standard CP 2025",
    "id": "D-03"
  },
  {
    "scope": [
      "tout"
    ],
    "active": true,
    "regex": null,
    "version": "1.0",
    "created": "2026-04-27",
    "code": "D-04",
    "doctype": "cp_fr",
    "category": "FOND",
    "mode": "claude",
    "label": "Description juridique des sociétés",
    "text": "À la première mention de chaque partie : 1) Forme juridique 2) Droit applicable (« de droit marocain », « de droit français »…) 3) Siège social 4) Numéro RC. Formule : « est une société anonyme de droit marocain, immatriculée au Registre du Commerce de [ville] sous le numéro [X], dont le siège social est situé à [adresse]. »",
    "examples": "✗ société anonyme marocaine → ✓ société anonyme de droit marocain\n✗ dont le siège est à Casablanca → ✓ dont le siège social est situé à [adresse complète], Casablanca",
    "notes": "Usage constant dans tous les CP 2025",
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
    "version": "1.0",
    "created": "2026-04-27",
    "code": "D-05",
    "doctype": "cp_fr",
    "category": "FOND",
    "mode": "claude",
    "label": "Formule du résumé non confidentiel",
    "text": "Le résumé commence par : « Le Conseil de la concurrence a reçu la notification d'une opération de concentration économique concernant… » ou « …d'un projet de concentration économique consistant en… ». Ne pas cumuler « opération de » et « projet de ».",
    "examples": "✗ notification d'une opération de projet de concentration → ✓ notification d'une opération de concentration\n✗ notification d'un projet d'opération → ✓ notification d'un projet de concentration économique",
    "notes": "Structure standard résumé CP 2025. Regex de sécurité pour le cumul ; le reste relève du jugement.",
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
    "version": "1.2",
    "created": "2026-04-27",
    "code": "D-06",
    "doctype": "cp_fr",
    "category": "FOND",
    "mode": "claude",
    "label": "Délai d'observations des tiers",
    "text": "Formule obligatoire : « Délai dans lequel les tiers intéressés sont invités à faire connaître leurs observations : 10 jours à partir de la date de publication du présent communiqué, soit le [date limite]. » La date limite correspond à J+10 à compter de la date de publication ; si elle tombe un samedi ou un dimanche, elle est reportée au lundi suivant. Le communiqué étant publié le jeudi, la date limite est le lundi qui suit (exemple : publication le jeudi 1er octobre 2026, date limite le lundi 12 octobre 2026). Format de la date : jour sur deux chiffres (« 02 novembre 2026 »), sauf le premier du mois (« 1er octobre 2026 »). Une date juste n'est pas réécrite.",
    "examples": "✗ Délai d'observations : 10 jours → ✓ Délai dans lequel les tiers intéressés sont invités à faire connaître leurs observations\n✗ les tiers intéressées → ✓ les tiers intéressés (accord masculin)\n✗ publication jeudi 1er octobre 2026, soit le 11 octobre 2026 (dimanche) → ✓ soit le 12 octobre 2026 (lundi)",
    "notes": "Art. 13 loi n°104-12. Regex pour l'accord ; le tiret et la date J+10 relèvent du jugement.\n[21/10/2026] Règle du report au lundi ajoutée (publication le jeudi, date limite le lundi suivant).\n[21/10/2026] Jour sur deux chiffres (02), « 1er » pour le premier du mois.",
    "id": "D-06"
  },
  {
    "scope": [
      "tout"
    ],
    "active": true,
    "regex": null,
    "version": "1.0",
    "created": "2026-04-27",
    "code": "D-07",
    "doctype": "cp_fr",
    "category": "FOND",
    "mode": "claude",
    "label": "Intitulé du résumé non confidentiel",
    "text": "L'intitulé doit être en majuscules : « RÉSUMÉ NON CONFIDENTIEL DE L'OPÉRATION FOURNI PAR LES PARTIES ». Avec accents. Sans guillemets.",
    "examples": "✗ RESUME NON CONFIDENTIEL DE L'OPERATION → ✓ RÉSUMÉ NON CONFIDENTIEL DE L'OPÉRATION (avec accents)\n✗ Résumé non confidentiel → ✓ RÉSUMÉ NON CONFIDENTIEL (en majuscules)",
    "notes": "Standard typographique - tous CP 2025",
    "id": "D-07"
  },
  {
    "scope": [
      "tout"
    ],
    "active": true,
    "regex": null,
    "version": "1.0",
    "created": "2026-04-27",
    "code": "A-01",
    "doctype": "cp_ar",
    "category": "FORME",
    "mode": "claude",
    "label": "الصيغة الافتتاحية",
    "text": "الصيغة الثابتة : « طبقا للمادة 13 من القانون رقم 104.12 المتعلق بحرية الأسعار والمنافسة والمادة 10 من المرسوم التطبيقي رقم 2.14.652 كما تم تغييرهما و تتميمهما، يضع مجلس المنافسة رهن إشارة العموم «ملخص العملية» أدناه والذي يتضمن المعلومات الموجهة من قبل الأطراف. »",
    "examples": "✗ كما تم تعديلهما → ✓ كما تم تغييرهما و تتميمهما\n✗ يضع المجلس → ✓ يضع مجلس المنافسة (بدون أداة التعريف)",
    "notes": "المادة 13 / المرسوم 2.14.652",
    "id": "A-01"
  },
  {
    "scope": [
      "tout"
    ],
    "active": true,
    "regex": null,
    "version": "1.0",
    "created": "2026-04-27",
    "code": "A-02",
    "doctype": "cp_ar",
    "category": "FORME",
    "mode": "claude",
    "label": "صيغة المسؤولية",
    "text": "الصيغة الثابتة : « وقد تم إعداد هذه المعلومات من قبل الأطراف المبلغة التي تعتبر وحدها المسؤولة عنها، ذلك أن كل المعلومات، الخاطئة أو غير الصحيحة، التي قد تشتمل عليها لا تعبر بتاتا عن موقف مجلس المنافسة حول العملية المرتقبة. »",
    "examples": "✗ من قبل الطرف المبلغ (عند تعدد الأطراف) → ✓ من قبل الأطراف المبلغة",
    "notes": "صيغة قياسية",
    "id": "A-02"
  },
  {
    "scope": [
      "tout"
    ],
    "active": true,
    "regex": null,
    "version": "1.0",
    "created": "2026-04-27",
    "code": "A-03",
    "doctype": "cp_ar",
    "category": "FORME",
    "mode": "claude",
    "label": "صيغة اكتمال الملف",
    "text": "الصيغة الثابتة : « إن نشر هذا البلاغ لا يفيد بأن ملف التبليغ يعتبر كاملا طبقا لأحكام المادة 9 من المرسوم رقم 2.14.652 الصادر بتطبيق القانون رقم 104.12 المتعلق بحرية الأسعار والمنافسة، كما تم تغييرهما و تتميمهما. »",
    "examples": "✗ البلاغ / الإعلان → ✓ البلاغ (الاستخدام المعياري)",
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
        "find": "(المراقبة (?:الحصرية|المشتركة)) على ال([\\u0621-\\u064A]\\S*)",
        "replace": "$1 لل$2",
        "flags": "g",
        "label": "المراقبة … على الشركة → المراقبة … للشركة"
      },
      {
        "find": "(المراقبة (?:الحصرية|المشتركة)) على (?!ال)([\\u0621-\\u064A]\\S*)",
        "replace": "$1 ل$2",
        "flags": "g",
        "label": "المراقبة … على شركة → المراقبة … لشركة"
      },
      {
        "find": "(المراقبة (?:الحصرية|المشتركة)) على ([^\\s\\u0621-\\u064A]\\S*)",
        "replace": "$1 لـ$2",
        "flags": "g",
        "label": "المراقبة … على \"Y\" → المراقبة … لـ\"Y\""
      }
    ],
    "version": "1.1",
    "created": "2026-04-27",
    "code": "A-04",
    "doctype": "cp_ar",
    "category": "FOND",
    "mode": "claude",
    "label": "طبيعة العملية - مراقبة حصرية",
    "text": "الصياغة المعيارية في الجدول : « تولي المراقبة الحصرية ». في العنوان وفي الملخص : « تولي شركة [الجهة المقتنية] المراقبة الحصرية لشركة [الجهة المستهدفة] »، متبوعة عند الاقتضاء بـ « عبر اقتناء [النسبة]% من رأسمالها وحقوق التصويت المرتبطة به ». تستعمل اللام (« لشركة ») وليس « على شركة ». Règle : « المراقبة الحصرية / المشتركة لشركة … », jamais « على شركة … ».",
    "examples": "✗ الاستحواذ الحصري → ✓ تولي المراقبة الحصرية\n✗ السيطرة المطلقة → ✓ المراقبة الحصرية\n✗ تولي شركة \"X\" المراقبة الحصرية على شركة \"Y\" → ✓ تولي شركة \"X\" المراقبة الحصرية لشركة \"Y\"",
    "notes": "المادة 11 من القانون 104.12 - المصطلح المعتمد\n[21/10/2026] « المراقبة الحصرية لشركة » (et non « على شركة »), à la demande du rapporteur ; règle automatique ajoutée, étendue par analogie à « المراقبة المشتركة ».",
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
    "version": "1.0",
    "created": "2026-04-27",
    "code": "A-05",
    "doctype": "cp_ar",
    "category": "FOND",
    "mode": "regex",
    "label": "تسمية الأطراف",
    "text": "الجهة المقتنية (لا المستحوذ / لا المشتري). الجهة المستهدفة (لا الشركة المستهدفة). المؤسسة المشتركة لعملية JV. توصل مجلس المنافسة بتبليغ مشروع عملية تركيز اقتصادي (لا استقبل / لا تلقى).",
    "examples": "✗ المستحوذ / المشتري → ✓ الجهة المقتنية\n✗ الشركة المستهدفة → ✓ الجهة المستهدفة\n✗ استقبل المجلس → ✓ توصل مجلس المنافسة بتبليغ",
    "notes": "المصطلحات الرسمية المعتمدة - بلاغات 2025. 'المشتري' و'استقبل/تلقى' تُترك لتقدير Claude لتجنب الإيجابيات الخاطئة.",
    "id": "A-05"
  },
  {
    "scope": [
      "tout"
    ],
    "active": true,
    "regex": null,
    "version": "1.2",
    "created": "2026-04-27",
    "code": "A-06",
    "doctype": "cp_ar",
    "category": "FOND",
    "mode": "claude",
    "label": "الأجل والتاريخ",
    "text": "الصيغة المعيارية : « الأجل المحدد للأغيار المعنيين من أجل إبداء ملاحظاتهم : 10 أيام ابتداء من تاريخ نشر هذا البلاغ، وينتهي هذا الأجل يوم [التاريخ]. » Règle de calcul : J+10 à compter de la date de publication, reporté au lundi suivant si la date tombe un samedi ou un dimanche. Publication le jeudi, fin du délai le lundi qui suit (exemple : نشر يوم الخميس فاتح أكتوبر 2026، ينتهي الأجل يوم الاثنين 12 أكتوبر 2026). Format de la date : jour sur deux chiffres (« 02 نونبر 2026 »), sauf le premier du mois (« فاتح أكتوبر 2026 »). Une date juste n'est pas réécrite.",
    "examples": "✗ الأطراف الثالثة → ✓ الأغيار المعنيون (المصطلح المعتمد)\n✗ مدة الاعتراض → ✓ الأجل المحدد للأغيار المعنيين",
    "notes": "المادة 13 من القانون 104.12\n[21/10/2026] Règle du report au lundi ajoutée.\n[21/10/2026] Jour sur deux chiffres (02), « فاتح » pour le premier du mois.",
    "id": "A-06"
  },
  {
    "scope": [
      "tout"
    ],
    "active": true,
    "regex": null,
    "version": "1.0",
    "created": "2026-04-27",
    "code": "A-07",
    "doctype": "cp_ar",
    "category": "FOND",
    "mode": "claude",
    "label": "الوصف القانوني للشركات",
    "text": "عند الإشارة الأولى لكل طرف : 1) الشكل القانوني 2) القانون المنظم (خاضعة للقانون المغربي / الفرنسي...) 3) المقر الاجتماعي 4) رقم السجل التجاري. الصيغة : « هي شركة [الشكل] خاضعة للقانون [الدولة]، يقع مقرها الاجتماعي ب[المدينة]. »",
    "examples": "✗ شركة مغربية → ✓ شركة خاضعة للقانون المغربي",
    "notes": "الاستخدام الثابت في بلاغات 2025",
    "id": "A-07"
  },
  {
    "scope": [
      "tout"
    ],
    "active": false,
    "regex": [
      {
        "find": "\"([^\"]+)\"",
        "replace": "«$1»",
        "flags": "g",
        "label": "مزدوجات مستقيمة -> «»"
      }
    ],
    "version": "1.0",
    "created": "2026-06-26",
    "code": "A-08",
    "doctype": "cp_ar",
    "category": "FORME",
    "mode": "regex",
    "label": "علامات التنصيص - مزدوجات لاتينية إلى مزدوجات عربية",
    "text": "استبدال علامات التنصيص المستقيمة بالمزدوجات « » (دون فراغات داخلية في النص العربي).",
    "examples": "\"ملخص العملية\" → «ملخص العملية»",
    "notes": "AJOUT (جديدة). تصحيح آلي للمزدوجات. [DÉSACTIVÉE : contredit la convention actuelle des guillemets droits, cf. A-11.]",
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
    "version": "1.0",
    "created": "2026-06-26",
    "code": "A-09",
    "doctype": "cp_ar",
    "category": "FORME",
    "mode": "regex",
    "label": "رقم القانون 104.12",
    "text": "رقم القانون هو 104.12 (لا 12.104).",
    "examples": "القانون رقم 12.104 → القانون رقم 104.12",
    "notes": "AJOUT (جديدة). الشكل المعتمد 104.12.",
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
    "version": "1.0",
    "created": "2026-06-26",
    "code": "A-10",
    "doctype": "cp_ar",
    "category": "FORME",
    "mode": "regex",
    "label": "رقم المرسوم 2.14.652",
    "text": "رقم المرسوم التطبيقي هو 2.14.652 (لا 652.14.2). يجب أن يكون الشكل موحدا في كامل الوثيقة.",
    "examples": "المرسوم رقم 652.14.2 → المرسوم رقم 2.14.652",
    "notes": "AJOUT (جديدة). الشكل المعتمد 2.14.652 (يطابق المرسوم 2-14-652).",
    "id": "A-10"
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
    "version": "1.0",
    "created": "2026-06-26",
    "code": "G-01",
    "doctype": "tous",
    "category": "FORME",
    "mode": "regex",
    "label": "Madame - orthographe",
    "text": "'Madame' sans double lettre.",
    "examples": "Madamme → Madame",
    "notes": "AJOUT. Faute de frappe fréquente (règle générale de l'ancien consignes.json).",
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
    "version": "1.0",
    "created": "2026-06-26",
    "code": "G-02",
    "doctype": "tous",
    "category": "FORME",
    "mode": "regex",
    "label": "Personne physique - formulation",
    "text": "Écrire 'est une personne physique' et non 'est une physique'.",
    "examples": "est une physique → est une personne physique",
    "notes": "AJOUT. Mot manquant fréquent (règle générale de l'ancien consignes.json).",
    "id": "G-02"
  },
  {
    "scope": [
      "tout"
    ],
    "active": true,
    "regex": null,
    "version": "1.1",
    "created": "2026-04-27",
    "code": "T-01",
    "doctype": "bilingue",
    "category": "TERMINOLOGIE",
    "mode": "compare",
    "label": "Terminologie contrôle FR↔AR",
    "text": "Correspondances officielles :\ncontrôle exclusif ↔ المراقبة الحصرية\ncontrôle conjoint ↔ المراقبة المشتركة\ncontrôle indirect ↔ المراقبة غير المباشرة\nprise de contrôle ↔ تولي المراقبة\nl'acquéreur ↔ الجهة المقتنية\nla cible ↔ الجهة المستهدفة\nles parties notifiantes ↔ الأطراف المبلغة\nentreprise commune ↔ منشأة مشتركة",
    "examples": "Vérifier la cohérence de chaque terme entre les deux versions",
    "notes": "Glossaire officiel Conseil de la concurrence 2025",
    "id": "T-01"
  },
  {
    "scope": [
      "tout"
    ],
    "active": true,
    "regex": null,
    "version": "1.1",
    "created": "2026-04-27",
    "code": "T-02",
    "doctype": "bilingue",
    "category": "TERMINOLOGIE",
    "mode": "compare",
    "label": "Formes juridiques FR↔AR",
    "text": "Correspondances officielles :\nsociété anonyme (SA) ↔ شركة مساهمة\nsociété à responsabilité limitée (SARL) ↔ شركة ذات مسؤولية محدودة\nsociété par actions simplifiée (SAS) ↔ شركة أسهم مبسطة\nde droit marocain ↔ خاضعة للقانون المغربي\nde droit français ↔ خاضعة للقانون الفرنسي\ncapital social ↔ رأس المال الاجتماعي\ndroits de vote ↔ حقوق التصويت\nRegistre du Commerce ↔ السجل التجاري",
    "examples": "Vérifier l'exactitude de la traduction de la forme juridique pour chaque société",
    "notes": "Terminologie juridique standard",
    "id": "T-02"
  },
  {
    "scope": [
      "tout"
    ],
    "active": true,
    "regex": null,
    "version": "1.0",
    "created": "2026-04-27",
    "code": "T-03",
    "doctype": "bilingue",
    "category": "TERMINOLOGIE",
    "mode": "compare",
    "label": "Formules procédurales FR↔AR",
    "text": "Correspondances officielles :\nnotification ↔ تبليغ\ntiers intéressés ↔ الأغيار المعنيون\nobservations ↔ ملاحظات\ncomplétude du dossier ↔ اكتمال الملف\nrésumé non confidentiel ↔ ملخص غير سري\nsecteurs économiques concernés ↔ القطاعات الاقتصادية المعنية\nsiège social ↔ المقر الاجتماعي\nFait à Rabat, le [date] ↔ حرر في الرباط بتاريخ [التاريخ]",
    "examples": "Vérifier la cohérence des formules procédurales entre les deux versions",
    "notes": "Formules procédurales standard CP 2025",
    "id": "T-03"
  },
  {
    "scope": [
      "tout"
    ],
    "active": true,
    "regex": null,
    "version": "1.0",
    "created": "2026-04-27",
    "code": "B-01",
    "doctype": "bilingue",
    "category": "BILINGUE",
    "mode": "compare",
    "label": "Cohérence chiffres et pourcentages",
    "text": "Les chiffres (pourcentages, capitaux, numéros RC) doivent être identiques dans FR et AR. Pourcentages : même format. Capital social : même montant. Numéro RC : même numéro et format. Dates : cohérence J+10 entre les deux versions.",
    "examples": "✗ FR : 42,11% / AR : 42% → ✓ FR et AR : 42,11% (identiques)\n✗ FR : RC 181.559 / AR : RC 181559 → ✓ Uniformiser le format",
    "notes": "Vérification croisée systématique",
    "id": "B-01"
  },
  {
    "scope": [
      "tout"
    ],
    "active": true,
    "regex": null,
    "version": "1.2",
    "created": "2026-04-27",
    "code": "B-02",
    "doctype": "bilingue",
    "category": "BILINGUE",
    "mode": "compare",
    "label": "Cohérence qualification de l'opération",
    "text": "La nature de l'opération doit être identique dans FR et AR. Prise de contrôle exclusif ↔ تولي المراقبة الحصرية. Prise de contrôle conjoint ↔ تولي المراقبة المشتركة. Création d'entreprise commune ↔ إحداث منشأة مشتركة.",
    "examples": "✗ FR : contrôle exclusif / AR : مراقبة مشتركة → ✓ Cohérence obligatoire entre les deux versions",
    "notes": "Cohérence bilingue obligatoire\n[21/10/2026] Alignement sur « prise de contrôle ».",
    "id": "B-02"
  },
  {
    "scope": [
      "tout"
    ],
    "active": true,
    "regex": null,
    "version": "1.1",
    "created": "2026-04-27",
    "code": "B-03",
    "doctype": "bilingue",
    "category": "BILINGUE",
    "mode": "compare",
    "label": "Cohérence date de clôture",
    "text": "La date limite des observations doit être la même dans FR et AR. Elle correspond à J+10 à compter de la date de publication, reportée au lundi suivant si elle tombe un samedi ou un dimanche (publication le jeudi : date limite le lundi qui suit).",
    "examples": "✗ FR : soit le 13 octobre 2025 / AR : 14 أكتوبر 2025 → ✓ Même date dans les deux versions\n✗ publication jeudi 1er octobre 2026, clôture 11 octobre 2026 (dimanche) → ✓ clôture lundi 12 octobre 2026",
    "notes": "Art. 13 loi n°104-12 - délai de 10 jours\n[21/10/2026] Règle du report au lundi ajoutée.",
    "id": "B-03"
  },
  {
    "code": "F-16",
    "id": "F-16",
    "doctype": "cp_fr",
    "category": "FORME",
    "mode": "regex",
    "scope": [
      "tout"
    ],
    "active": true,
    "regex": [
      {
        "find": "\\b[Cc]onseil de la [Cc]oncurrence\\b",
        "replace": "Conseil de la concurrence",
        "flags": "g",
        "label": "Conseil de la concurrence (C minuscule à concurrence)"
      }
    ],
    "label": "Désignation de l'institution",
    "text": "Toujours « Conseil de la concurrence » : « Conseil » prend une majuscule, « concurrence » n'en prend pas.",
    "examples": "✗ Conseil de la Concurrence a reçu → ✓ Conseil de la concurrence a reçu\n✗ conseil de la Concurrence → ✓ Conseil de la concurrence",
    "notes": "Dénomination officielle - loi n°20-13. Réactivée avec le libellé d'origine ; ajuster si la règle de majuscule a changé.\n[21/10/2026] Passée en correction automatique (aucune interprétation nécessaire).",
    "version": "1.1",
    "created": "26/06/2026"
  },
  {
    "scope": [
      "tout"
    ],
    "active": true,
    "regex": [
      {
        "find": "et,?\\s+ce,?\\s+à\\s+travers",
        "replace": "et ce, à travers",
        "flags": "g",
        "label": "virgule après « ce » (et ce, à travers)"
      }
    ],
    "version": "1.0",
    "created": "2026-06-27",
    "code": "F-17",
    "doctype": "cp_fr",
    "category": "FORME",
    "mode": "regex",
    "label": "Ponctuation de « et ce, »",
    "text": "La locution « et ce » qui introduit un complement se ponctue « et ce, » : la virgule se place APRES « ce », jamais apres « et ». Corrige « et, ce à travers » ou « et ce à travers » en « et ce, à travers ».",
    "examples": "✗ et ses filiales directes et indirectes et, ce à travers → ✓ et ses filiales directes et indirectes et ce, à travers\n✗ et ce à travers le rachat → ✓ et ce, à travers le rachat",
    "notes": "Motif ancre sur « a travers » pour eviter tout faux positif (ne touche pas a « et ce que/qui/dont »).",
    "id": "F-17"
  },
  {
    "scope": [
      "tout"
    ],
    "active": true,
    "regex": [
      {
        "find": "القانون رقم\\s*12[.\\-]104",
        "replace": "القانون رقم 104.12",
        "flags": "g",
        "label": "loi prix et concurrence : 104.12"
      },
      {
        "find": "القانون رقم\\s*13[.\\-]20",
        "replace": "القانون رقم 20.13",
        "flags": "g",
        "label": "loi Conseil de la concurrence : 20.13"
      }
    ],
    "version": "1.0",
    "created": "2026-06-28",
    "code": "DEC-F-01",
    "doctype": "decision_ar",
    "category": "FORME",
    "mode": "regex",
    "label": "Numéros de loi (104.12 et 20.13)",
    "text": "Dans les décisions, la loi sur la liberté des prix et la concurrence s'écrit « القانون رقم 104.12 » et la loi sur le Conseil de la concurrence « القانون رقم 20.13 ». Corrige les formes inversées « 12.104 », « 12-104 », « 13.20 » et « 13-20 » lorsqu'elles suivent « القانون رقم ».",
    "examples": "✗ القانون رقم 12.104 → ✓ القانون رقم 104.12\n✗ القانون رقم 13.20 → ✓ القانون رقم 20.13",
    "notes": "Ancré sur « القانون رقم » pour ne corriger que les references legales (les decrets 2.14.652 / 2.15.109 et dahirs 1.14.116/117 ne sont pas touches).",
    "id": "DEC-F-01"
  },
  {
    "scope": [
      "tout"
    ],
    "active": true,
    "regex": null,
    "version": "1.0",
    "created": "2026-06-28",
    "code": "DEC-T-01",
    "doctype": "decision_ar",
    "category": "TERMINOLOGIE",
    "mode": "claude",
    "label": "Qualification de l'opération - termes consacrés",
    "text": "المصطلحات المعتمدة لتكييف العملية حسب المعجم الرسمي لمجلس المنافسة. عند استعمال مصطلح غير معتمد لوصف طبيعة العملية، اقترح المصطلح المكرس دون فرضه ودون تحديد نوع العملية الذي يبقى من اختصاص المقررين : المراقبة الحصرية ؛ المراقبة المشتركة ؛ الإدماج عن طريق الضم ؛ إحداث منشأة مشتركة مع معيار الكيان الاقتصادي المستقل ؛ اقتناء الأصول ؛ الاستثناء المنصوص عليه في الفقرة الثانية من المادة 14 مع الترخيص بصفة استثنائية.",
    "examples": "✗ الاستحواذ الحصري → ✓ تولي المراقبة الحصرية\n✗ مشروع مشترك → ✓ منشأة مشتركة\n✗ اندماج عن طريق الضم → ✓ الإدماج عن طريق الضم",
    "notes": "المعجم الرسمي لمجلس المنافسة - وضع الاقتراح فقط، دون فرض ولا تحديد لنوع العملية",
    "id": "DEC-T-01"
  },
  {
    "scope": [
      "tout"
    ],
    "active": true,
    "regex": [
      {
        "find": "A cet effet",
        "replace": "À cet effet",
        "flags": "g",
        "label": "accent sur À (à cet effet)"
      },
      {
        "find": "A cette fin",
        "replace": "À cette fin",
        "flags": "g",
        "label": "accent sur À (à cette fin)"
      },
      {
        "find": "A ce titre",
        "replace": "À ce titre",
        "flags": "g",
        "label": "accent sur À (à ce titre)"
      },
      {
        "find": "A défaut",
        "replace": "À défaut",
        "flags": "g",
        "label": "accent sur À (à défaut)"
      },
      {
        "find": "A compter",
        "replace": "À compter",
        "flags": "g",
        "label": "accent sur À (à compter)"
      },
      {
        "find": "A partir",
        "replace": "À partir",
        "flags": "g",
        "label": "accent sur À (à partir)"
      },
      {
        "find": "A savoir",
        "replace": "À savoir",
        "flags": "g",
        "label": "accent sur À (à savoir)"
      }
    ],
    "version": "1.0",
    "created": "2026-07-15",
    "code": "F-18",
    "doctype": "cp_fr",
    "category": "FORME",
    "mode": "regex",
    "label": "Accent sur « À » en tête (à cet effet, à ce titre…)",
    "text": "La préposition « à » prend l'accent même en capitale. Corrige « A » majuscule sans accent devant les locutions figées : à cet effet, à cette fin, à ce titre, à défaut, à compter, à partir, à savoir.",
    "examples": "✗ A cet effet, le groupe apportera → ✓ À cet effet, le groupe apportera\n✗ A compter de la date → ✓ À compter de la date",
    "notes": "Sensible à la casse : ne touche que le « A » majuscule, jamais le « à » déjà correct. Locutions figées uniquement, pas de « A » isolé générique.",
    "id": "F-18"
  },
  {
    "scope": [
      "tout"
    ],
    "active": false,
    "regex": [
      {
        "find": "«[ \\t\\u00a0\\u202f\\u2009]*([^«»]*?)[ \\t\\u00a0\\u202f\\u2009]*»",
        "replace": "\"$1\"",
        "flags": "g",
        "label": "guillemets droits pour les dénominations (arabe)"
      }
    ],
    "version": "1.1",
    "created": "2026-07-15",
    "code": "A-11",
    "doctype": "cp_ar",
    "category": "FORME",
    "mode": "regex",
    "label": "Guillemets droits des dénominations (arabe)",
    "text": "Dans les documents en arabe, les dénominations et les termes cités se mettent entre guillemets droits (\") identiques des deux côtés, et non entre guillemets français « ». Convertit chaque paire « … » en \"…\", en supprimant les espaces intérieures.",
    "examples": "✗ « Romsons Group Private Limited » → ✓ \"Romsons Group Private Limited\"\n✗ «Khanna» → ✓ \"Khanna\"",
    "notes": "Règle déterministe. Périmètre : toutes les paires « », noms d'entreprises comme termes cités, espaces intérieures retirées. Un « sans » n'est pas touché.\n[21/10/2026] Désactivée : pas de modification des guillemets dans les communiqués arabes.",
    "id": "A-11"
  },
  {
    "scope": [
      "tout"
    ],
    "active": true,
    "regex": [
      {
        "find": "«[ \\t\\u00a0\\u202f\\u2009]*([^«»]*?)[ \\t\\u00a0\\u202f\\u2009]*»",
        "replace": "\"$1\"",
        "flags": "g",
        "label": "guillemets droits pour les dénominations (arabe)"
      }
    ],
    "version": "1.0",
    "created": "2026-07-15",
    "code": "DEC-F-02",
    "doctype": "decision_ar",
    "category": "FORME",
    "mode": "regex",
    "label": "Guillemets droits des dénominations (arabe)",
    "text": "Dans les documents en arabe, les dénominations et les termes cités se mettent entre guillemets droits (\") identiques des deux côtés, et non entre guillemets français « ». Convertit chaque paire « … » en \"…\", en supprimant les espaces intérieures.",
    "examples": "✗ « Romsons Group Private Limited » → ✓ \"Romsons Group Private Limited\"\n✗ «Khanna» → ✓ \"Khanna\"",
    "notes": "Règle déterministe. Périmètre : toutes les paires « », noms d'entreprises comme termes cités, espaces intérieures retirées. Un « sans » n'est pas touché.",
    "id": "DEC-F-02"
  },
  {
    "scope": [
      "tout"
    ],
    "active": true,
    "regex": [
      {
        "find": "ذات مسؤولية محدودة",
        "replace": "ذات المسؤولية المحدودة",
        "flags": "g",
        "label": "SARL avec article (ذات المسؤولية المحدودة)"
      }
    ],
    "version": "1.1",
    "created": "2026-07-15",
    "code": "A-12",
    "doctype": "cp_ar",
    "category": "FORME",
    "mode": "regex",
    "label": "Forme SARL avec article (arabe)",
    "text": "Selon l'usage du Conseil, la forme « société à responsabilité limitée » s'écrit avec l'article : « شركة ذات المسؤولية المحدودة ». Harmonise la forme sans article « ذات مسؤولية محدودة » vers « ذات المسؤولية المحدودة ».",
    "examples": "✗ شركة ذات مسؤولية محدودة → ✓ شركة ذات المسؤولية المحدودة",
    "notes": "Règle déterministe, ancrée sur « ذات » suivi des deux mots définis. S'applique aussi bien à « شركة ذات… » qu'à « الشركة ذات… ».\n[21/10/2026] Règle inversée : on conserve l'article « ال » (ذات المسؤولية المحدودة), usage du Conseil.",
    "id": "A-12"
  },
  {
    "scope": [
      "tout"
    ],
    "active": true,
    "regex": [
      {
        "find": "ذات مسؤولية محدودة",
        "replace": "ذات المسؤولية المحدودة",
        "flags": "g",
        "label": "SARL avec article (ذات المسؤولية المحدودة)"
      }
    ],
    "version": "1.1",
    "created": "2026-07-15",
    "code": "DEC-F-03",
    "doctype": "decision_ar",
    "category": "FORME",
    "mode": "regex",
    "label": "Forme SARL avec article (arabe)",
    "text": "Selon l'usage du Conseil, la forme « société à responsabilité limitée » s'écrit avec l'article : « شركة ذات المسؤولية المحدودة ». Harmonise la forme sans article « ذات مسؤولية محدودة » vers « ذات المسؤولية المحدودة ».",
    "examples": "✗ شركة ذات مسؤولية محدودة → ✓ شركة ذات المسؤولية المحدودة",
    "notes": "Règle déterministe, ancrée sur « ذات » suivi des deux mots définis. S'applique aussi bien à « شركة ذات… » qu'à « الشركة ذات… ».\n[21/10/2026] Règle inversée : on conserve l'article « ال » (ذات المسؤولية المحدودة), usage du Conseil.",
    "id": "DEC-F-03"
  },
  {
    "scope": [
      "tout"
    ],
    "active": true,
    "regex": [
      {
        "find": "\\.[ \\u00a0\\u202f\\u2009]+\\.",
        "replace": ".",
        "flags": "g",
        "label": "point doublé réduit"
      },
      {
        "find": "(?<!\\.)[ \\u00a0\\u202f\\u2009]+([.،؛])(?![0-9\\u0660-\\u0669])",
        "replace": "$1",
        "flags": "g",
        "label": "espace avant ponctuation supprimée"
      },
      {
        "find": "\\.،",
        "replace": "،",
        "flags": "g",
        "label": "point collé à virgule arabe → virgule"
      },
      {
        "find": "(رقم)\\.[ \\u00a0\\u202f\\u2009]+([0-9\\u0660-\\u0669]+)(?=\\s|$)",
        "replace": "$1 $2.",
        "flags": "g",
        "label": "point collé à « رقم » déplacé après le numéro"
      },
      {
        "find": "([ \\u00a0\\u202f\\u2009])\\.([0-9\\u0660-\\u0669]+)(?=\\s|$)",
        "replace": "$1$2.",
        "flags": "g",
        "label": "point placé devant un numéro déplacé après"
      }
    ],
    "version": "1.1",
    "created": "2026-07-15",
    "code": "A-13",
    "doctype": "cp_ar",
    "category": "FORME",
    "mode": "regex",
    "label": "Typographie : espaces et points (arabe)",
    "text": "Nettoyage typographique déterministe : supprime l'espace placée avant un point, une virgule arabe « ، » ou un point-virgule « ؛ » ; réduit un point doublé « . . » à un seul point. Un point placé par erreur devant un numéro (« رقم .29277 » ou « رقم. 29277 ») est déplacé après le numéro (« رقم 29277. »).",
    "examples": "✗ ...JV\" . → ✓ ...JV\".\n✗ رقم 0-1041090 ، → ✓ رقم 0-1041090،\n✗ Autriche. . → ✓ Autriche.\n✗ تحت رقم .29277 وهي → ✓ تحت رقم 29277. وهي",
    "notes": "N'affecte pas « P.O. » ni les virgules d'adresse (espace APRÈS, jamais avant). Le point doublé n'est traité que séparé par une espace, l'ellipse « ... » n'est pas touchée.\n[21/10/2026] Point mal placé devant un numéro : déplacé après le numéro au lieu d'être collé au mot précédent.",
    "id": "A-13"
  },
  {
    "scope": [
      "tout"
    ],
    "active": true,
    "regex": [
      {
        "find": "\\.[ \\u00a0\\u202f\\u2009]+\\.",
        "replace": ".",
        "flags": "g",
        "label": "point doublé réduit"
      },
      {
        "find": "(?<!\\.)[ \\u00a0\\u202f\\u2009]+([.،؛])(?![0-9\\u0660-\\u0669])",
        "replace": "$1",
        "flags": "g",
        "label": "espace avant ponctuation supprimée"
      },
      {
        "find": "\\.،",
        "replace": "،",
        "flags": "g",
        "label": "point collé à virgule arabe → virgule"
      },
      {
        "find": "(رقم)\\.[ \\u00a0\\u202f\\u2009]+([0-9\\u0660-\\u0669]+)(?=\\s|$)",
        "replace": "$1 $2.",
        "flags": "g",
        "label": "point collé à « رقم » déplacé après le numéro"
      },
      {
        "find": "([ \\u00a0\\u202f\\u2009])\\.([0-9\\u0660-\\u0669]+)(?=\\s|$)",
        "replace": "$1$2.",
        "flags": "g",
        "label": "point placé devant un numéro déplacé après"
      }
    ],
    "version": "1.1",
    "created": "2026-07-15",
    "code": "DEC-F-04",
    "doctype": "decision_ar",
    "category": "FORME",
    "mode": "regex",
    "label": "Typographie : espaces et points (arabe)",
    "text": "Nettoyage typographique déterministe : supprime l'espace placée avant un point, une virgule arabe « ، » ou un point-virgule « ؛ » ; réduit un point doublé « . . » à un seul point. Un point placé par erreur devant un numéro (« رقم .29277 » ou « رقم. 29277 ») est déplacé après le numéro (« رقم 29277. »).",
    "examples": "✗ ...JV\" . → ✓ ...JV\".\n✗ رقم 0-1041090 ، → ✓ رقم 0-1041090،\n✗ Autriche. . → ✓ Autriche.\n✗ تحت رقم .29277 وهي → ✓ تحت رقم 29277. وهي",
    "notes": "N'affecte pas « P.O. » ni les virgules d'adresse (espace APRÈS, jamais avant). Le point doublé n'est traité que séparé par une espace, l'ellipse « ... » n'est pas touchée.\n[21/10/2026] Point mal placé devant un numéro : déplacé après le numéro au lieu d'être collé au mot précédent.",
    "id": "DEC-F-04"
  },
  {
    "scope": [
      "tout"
    ],
    "active": true,
    "regex": [
      {
        "find": "([,،\\-–(]\\s{0,3})(?<![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])République d['’]Afrique du Sud(?![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])",
        "replace": "$1جمهورية جنوب إفريقيا",
        "flags": "g",
        "label": "pays : جمهورية جنوب إفريقيا"
      },
      {
        "find": "([,،\\-–(]\\s{0,3})(?<![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])Afrique du Sud(?![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])",
        "replace": "$1جنوب إفريقيا",
        "flags": "g",
        "label": "pays : جنوب إفريقيا"
      },
      {
        "find": "([,،\\-–(]\\s{0,3})(?<![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])États-Unis d['’]Amérique(?![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])",
        "replace": "$1الولايات المتحدة الأمريكية",
        "flags": "g",
        "label": "pays : الولايات المتحدة الأمريكية"
      },
      {
        "find": "([,،\\-–(]\\s{0,3})(?<![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])États-Unis(?![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])",
        "replace": "$1الولايات المتحدة الأمريكية",
        "flags": "g",
        "label": "pays : الولايات المتحدة الأمريكية"
      },
      {
        "find": "([,،\\-–(]\\s{0,3})(?<![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])Royaume-Uni(?![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])",
        "replace": "$1المملكة المتحدة",
        "flags": "g",
        "label": "pays : المملكة المتحدة"
      },
      {
        "find": "([,،\\-–(]\\s{0,3})(?<![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])Corée du Sud(?![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])",
        "replace": "$1كوريا الجنوبية",
        "flags": "g",
        "label": "pays : كوريا الجنوبية"
      },
      {
        "find": "([,،\\-–(]\\s{0,3})(?<![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])Émirats arabes unis(?![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])",
        "replace": "$1الإمارات العربية المتحدة",
        "flags": "g",
        "label": "pays : الإمارات العربية المتحدة"
      },
      {
        "find": "([,،\\-–(]\\s{0,3})(?<![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])Arabie saoudite(?![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])",
        "replace": "$1المملكة العربية السعودية",
        "flags": "g",
        "label": "pays : المملكة العربية السعودية"
      },
      {
        "find": "([,،\\-–(]\\s{0,3})(?<![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])Pays-Bas(?![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])",
        "replace": "$1هولندا",
        "flags": "g",
        "label": "pays : هولندا"
      },
      {
        "find": "([,،\\-–(]\\s{0,3})(?<![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])France(?![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])",
        "replace": "$1فرنسا",
        "flags": "g",
        "label": "pays : فرنسا"
      },
      {
        "find": "([,،\\-–(]\\s{0,3})(?<![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])Allemagne(?![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])",
        "replace": "$1ألمانيا",
        "flags": "g",
        "label": "pays : ألمانيا"
      },
      {
        "find": "([,،\\-–(]\\s{0,3})(?<![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])Espagne(?![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])",
        "replace": "$1إسبانيا",
        "flags": "g",
        "label": "pays : إسبانيا"
      },
      {
        "find": "([,،\\-–(]\\s{0,3})(?<![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])Italie(?![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])",
        "replace": "$1إيطاليا",
        "flags": "g",
        "label": "pays : إيطاليا"
      },
      {
        "find": "([,،\\-–(]\\s{0,3})(?<![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])Portugal(?![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])",
        "replace": "$1البرتغال",
        "flags": "g",
        "label": "pays : البرتغال"
      },
      {
        "find": "([,،\\-–(]\\s{0,3})(?<![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])Belgique(?![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])",
        "replace": "$1بلجيكا",
        "flags": "g",
        "label": "pays : بلجيكا"
      },
      {
        "find": "([,،\\-–(]\\s{0,3})(?<![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])Luxembourg(?![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])",
        "replace": "$1لوكسمبورغ",
        "flags": "g",
        "label": "pays : لوكسمبورغ"
      },
      {
        "find": "([,،\\-–(]\\s{0,3})(?<![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])Suisse(?![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])",
        "replace": "$1سويسرا",
        "flags": "g",
        "label": "pays : سويسرا"
      },
      {
        "find": "([,،\\-–(]\\s{0,3})(?<![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])Autriche(?![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])",
        "replace": "$1النمسا",
        "flags": "g",
        "label": "pays : النمسا"
      },
      {
        "find": "([,،\\-–(]\\s{0,3})(?<![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])Irlande(?![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])",
        "replace": "$1إيرلندا",
        "flags": "g",
        "label": "pays : إيرلندا"
      },
      {
        "find": "([,،\\-–(]\\s{0,3})(?<![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])Finlande(?![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])",
        "replace": "$1فنلندا",
        "flags": "g",
        "label": "pays : فنلندا"
      },
      {
        "find": "([,،\\-–(]\\s{0,3})(?<![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])Suède(?![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])",
        "replace": "$1السويد",
        "flags": "g",
        "label": "pays : السويد"
      },
      {
        "find": "([,،\\-–(]\\s{0,3})(?<![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])Norvège(?![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])",
        "replace": "$1النرويج",
        "flags": "g",
        "label": "pays : النرويج"
      },
      {
        "find": "([,،\\-–(]\\s{0,3})(?<![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])Danemark(?![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])",
        "replace": "$1الدنمارك",
        "flags": "g",
        "label": "pays : الدنمارك"
      },
      {
        "find": "([,،\\-–(]\\s{0,3})(?<![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])Grèce(?![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])",
        "replace": "$1اليونان",
        "flags": "g",
        "label": "pays : اليونان"
      },
      {
        "find": "([,،\\-–(]\\s{0,3})(?<![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])Pologne(?![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])",
        "replace": "$1بولندا",
        "flags": "g",
        "label": "pays : بولندا"
      },
      {
        "find": "([,،\\-–(]\\s{0,3})(?<![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])Russie(?![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])",
        "replace": "$1روسيا",
        "flags": "g",
        "label": "pays : روسيا"
      },
      {
        "find": "([,،\\-–(]\\s{0,3})(?<![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])Turquie(?![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])",
        "replace": "$1تركيا",
        "flags": "g",
        "label": "pays : تركيا"
      },
      {
        "find": "([,،\\-–(]\\s{0,3})(?<![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])Canada(?![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])",
        "replace": "$1كندا",
        "flags": "g",
        "label": "pays : كندا"
      },
      {
        "find": "([,،\\-–(]\\s{0,3})(?<![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])Brésil(?![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])",
        "replace": "$1البرازيل",
        "flags": "g",
        "label": "pays : البرازيل"
      },
      {
        "find": "([,،\\-–(]\\s{0,3})(?<![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])Mexique(?![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])",
        "replace": "$1المكسيك",
        "flags": "g",
        "label": "pays : المكسيك"
      },
      {
        "find": "([,،\\-–(]\\s{0,3})(?<![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])Argentine(?![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])",
        "replace": "$1الأرجنتين",
        "flags": "g",
        "label": "pays : الأرجنتين"
      },
      {
        "find": "([,،\\-–(]\\s{0,3})(?<![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])Chine(?![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])",
        "replace": "$1الصين",
        "flags": "g",
        "label": "pays : الصين"
      },
      {
        "find": "([,،\\-–(]\\s{0,3})(?<![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])Japon(?![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])",
        "replace": "$1اليابان",
        "flags": "g",
        "label": "pays : اليابان"
      },
      {
        "find": "([,،\\-–(]\\s{0,3})(?<![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])Inde(?![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])",
        "replace": "$1الهند",
        "flags": "g",
        "label": "pays : الهند"
      },
      {
        "find": "([,،\\-–(]\\s{0,3})(?<![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])Singapour(?![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])",
        "replace": "$1سنغافورة",
        "flags": "g",
        "label": "pays : سنغافورة"
      },
      {
        "find": "([,،\\-–(]\\s{0,3})(?<![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])Qatar(?![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])",
        "replace": "$1قطر",
        "flags": "g",
        "label": "pays : قطر"
      },
      {
        "find": "([,،\\-–(]\\s{0,3})(?<![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])Liban(?![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])",
        "replace": "$1لبنان",
        "flags": "g",
        "label": "pays : لبنان"
      },
      {
        "find": "([,،\\-–(]\\s{0,3})(?<![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])Jordanie(?![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])",
        "replace": "$1الأردن",
        "flags": "g",
        "label": "pays : الأردن"
      },
      {
        "find": "([,،\\-–(]\\s{0,3})(?<![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])Maroc(?![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])",
        "replace": "$1المغرب",
        "flags": "g",
        "label": "pays : المغرب"
      },
      {
        "find": "([,،\\-–(]\\s{0,3})(?<![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])Tunisie(?![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])",
        "replace": "$1تونس",
        "flags": "g",
        "label": "pays : تونس"
      },
      {
        "find": "([,،\\-–(]\\s{0,3})(?<![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])Algérie(?![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])",
        "replace": "$1الجزائر",
        "flags": "g",
        "label": "pays : الجزائر"
      },
      {
        "find": "([,،\\-–(]\\s{0,3})(?<![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])Égypte(?![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])",
        "replace": "$1مصر",
        "flags": "g",
        "label": "pays : مصر"
      },
      {
        "find": "([,،\\-–(]\\s{0,3})(?<![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])Libye(?![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])",
        "replace": "$1ليبيا",
        "flags": "g",
        "label": "pays : ليبيا"
      },
      {
        "find": "([,،\\-–(]\\s{0,3})(?<![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])Mauritanie(?![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])",
        "replace": "$1موريتانيا",
        "flags": "g",
        "label": "pays : موريتانيا"
      },
      {
        "find": "([,،\\-–(]\\s{0,3})(?<![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])Sénégal(?![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])",
        "replace": "$1السنغال",
        "flags": "g",
        "label": "pays : السنغال"
      },
      {
        "find": "([,،\\-–(]\\s{0,3})(?<![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])Nigéria(?![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])",
        "replace": "$1نيجيريا",
        "flags": "g",
        "label": "pays : نيجيريا"
      }
    ],
    "version": "1.1",
    "created": "2026-07-15",
    "code": "A-14",
    "doctype": "cp_ar",
    "category": "TERMINOLOGIE",
    "mode": "regex",
    "label": "Noms de pays en arabe (adresses)",
    "text": "Dans un document arabe, le nom du pays figurant à la FIN D'UNE ADRESSE s'écrit en arabe (ou dans la langue d'origine du pays), même si le reste de l'adresse demeure en caractères latins. La conversion ne s'applique qu'après une virgule, un tiret ou une parenthèse (séparateurs d'adresse), jamais à l'intérieur d'une dénomination sociale.",
    "examples": "✗ 23 street, États-Unis → ✓ 23 street, الولايات المتحدة الأمريكية\nNom de société (ne pas modifier) : \"Sistemas Avanzados de Tecnologia Maroc\" → inchangé",
    "notes": "Table extensible. Ancrée sur les frontières de mot (pas de correspondance à l'intérieur d'un autre mot). N'inclut que des formes vérifiées ; d'autres pays à ajouter au besoin.\n[21/10/2026] Conversion limitée aux adresses (après « , » « ، » « - » ou « ( ») : ne touche plus les noms de sociétés.",
    "id": "A-14"
  },
  {
    "scope": [
      "tout"
    ],
    "active": true,
    "regex": [
      {
        "find": "([,،\\-–(]\\s{0,3})(?<![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])République d['’]Afrique du Sud(?![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])",
        "replace": "$1جمهورية جنوب إفريقيا",
        "flags": "g",
        "label": "pays : جمهورية جنوب إفريقيا"
      },
      {
        "find": "([,،\\-–(]\\s{0,3})(?<![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])Afrique du Sud(?![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])",
        "replace": "$1جنوب إفريقيا",
        "flags": "g",
        "label": "pays : جنوب إفريقيا"
      },
      {
        "find": "([,،\\-–(]\\s{0,3})(?<![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])États-Unis d['’]Amérique(?![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])",
        "replace": "$1الولايات المتحدة الأمريكية",
        "flags": "g",
        "label": "pays : الولايات المتحدة الأمريكية"
      },
      {
        "find": "([,،\\-–(]\\s{0,3})(?<![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])États-Unis(?![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])",
        "replace": "$1الولايات المتحدة الأمريكية",
        "flags": "g",
        "label": "pays : الولايات المتحدة الأمريكية"
      },
      {
        "find": "([,،\\-–(]\\s{0,3})(?<![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])Royaume-Uni(?![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])",
        "replace": "$1المملكة المتحدة",
        "flags": "g",
        "label": "pays : المملكة المتحدة"
      },
      {
        "find": "([,،\\-–(]\\s{0,3})(?<![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])Corée du Sud(?![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])",
        "replace": "$1كوريا الجنوبية",
        "flags": "g",
        "label": "pays : كوريا الجنوبية"
      },
      {
        "find": "([,،\\-–(]\\s{0,3})(?<![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])Émirats arabes unis(?![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])",
        "replace": "$1الإمارات العربية المتحدة",
        "flags": "g",
        "label": "pays : الإمارات العربية المتحدة"
      },
      {
        "find": "([,،\\-–(]\\s{0,3})(?<![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])Arabie saoudite(?![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])",
        "replace": "$1المملكة العربية السعودية",
        "flags": "g",
        "label": "pays : المملكة العربية السعودية"
      },
      {
        "find": "([,،\\-–(]\\s{0,3})(?<![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])Pays-Bas(?![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])",
        "replace": "$1هولندا",
        "flags": "g",
        "label": "pays : هولندا"
      },
      {
        "find": "([,،\\-–(]\\s{0,3})(?<![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])France(?![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])",
        "replace": "$1فرنسا",
        "flags": "g",
        "label": "pays : فرنسا"
      },
      {
        "find": "([,،\\-–(]\\s{0,3})(?<![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])Allemagne(?![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])",
        "replace": "$1ألمانيا",
        "flags": "g",
        "label": "pays : ألمانيا"
      },
      {
        "find": "([,،\\-–(]\\s{0,3})(?<![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])Espagne(?![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])",
        "replace": "$1إسبانيا",
        "flags": "g",
        "label": "pays : إسبانيا"
      },
      {
        "find": "([,،\\-–(]\\s{0,3})(?<![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])Italie(?![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])",
        "replace": "$1إيطاليا",
        "flags": "g",
        "label": "pays : إيطاليا"
      },
      {
        "find": "([,،\\-–(]\\s{0,3})(?<![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])Portugal(?![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])",
        "replace": "$1البرتغال",
        "flags": "g",
        "label": "pays : البرتغال"
      },
      {
        "find": "([,،\\-–(]\\s{0,3})(?<![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])Belgique(?![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])",
        "replace": "$1بلجيكا",
        "flags": "g",
        "label": "pays : بلجيكا"
      },
      {
        "find": "([,،\\-–(]\\s{0,3})(?<![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])Luxembourg(?![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])",
        "replace": "$1لوكسمبورغ",
        "flags": "g",
        "label": "pays : لوكسمبورغ"
      },
      {
        "find": "([,،\\-–(]\\s{0,3})(?<![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])Suisse(?![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])",
        "replace": "$1سويسرا",
        "flags": "g",
        "label": "pays : سويسرا"
      },
      {
        "find": "([,،\\-–(]\\s{0,3})(?<![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])Autriche(?![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])",
        "replace": "$1النمسا",
        "flags": "g",
        "label": "pays : النمسا"
      },
      {
        "find": "([,،\\-–(]\\s{0,3})(?<![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])Irlande(?![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])",
        "replace": "$1إيرلندا",
        "flags": "g",
        "label": "pays : إيرلندا"
      },
      {
        "find": "([,،\\-–(]\\s{0,3})(?<![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])Finlande(?![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])",
        "replace": "$1فنلندا",
        "flags": "g",
        "label": "pays : فنلندا"
      },
      {
        "find": "([,،\\-–(]\\s{0,3})(?<![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])Suède(?![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])",
        "replace": "$1السويد",
        "flags": "g",
        "label": "pays : السويد"
      },
      {
        "find": "([,،\\-–(]\\s{0,3})(?<![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])Norvège(?![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])",
        "replace": "$1النرويج",
        "flags": "g",
        "label": "pays : النرويج"
      },
      {
        "find": "([,،\\-–(]\\s{0,3})(?<![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])Danemark(?![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])",
        "replace": "$1الدنمارك",
        "flags": "g",
        "label": "pays : الدنمارك"
      },
      {
        "find": "([,،\\-–(]\\s{0,3})(?<![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])Grèce(?![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])",
        "replace": "$1اليونان",
        "flags": "g",
        "label": "pays : اليونان"
      },
      {
        "find": "([,،\\-–(]\\s{0,3})(?<![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])Pologne(?![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])",
        "replace": "$1بولندا",
        "flags": "g",
        "label": "pays : بولندا"
      },
      {
        "find": "([,،\\-–(]\\s{0,3})(?<![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])Russie(?![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])",
        "replace": "$1روسيا",
        "flags": "g",
        "label": "pays : روسيا"
      },
      {
        "find": "([,،\\-–(]\\s{0,3})(?<![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])Turquie(?![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])",
        "replace": "$1تركيا",
        "flags": "g",
        "label": "pays : تركيا"
      },
      {
        "find": "([,،\\-–(]\\s{0,3})(?<![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])Canada(?![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])",
        "replace": "$1كندا",
        "flags": "g",
        "label": "pays : كندا"
      },
      {
        "find": "([,،\\-–(]\\s{0,3})(?<![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])Brésil(?![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])",
        "replace": "$1البرازيل",
        "flags": "g",
        "label": "pays : البرازيل"
      },
      {
        "find": "([,،\\-–(]\\s{0,3})(?<![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])Mexique(?![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])",
        "replace": "$1المكسيك",
        "flags": "g",
        "label": "pays : المكسيك"
      },
      {
        "find": "([,،\\-–(]\\s{0,3})(?<![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])Argentine(?![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])",
        "replace": "$1الأرجنتين",
        "flags": "g",
        "label": "pays : الأرجنتين"
      },
      {
        "find": "([,،\\-–(]\\s{0,3})(?<![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])Chine(?![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])",
        "replace": "$1الصين",
        "flags": "g",
        "label": "pays : الصين"
      },
      {
        "find": "([,،\\-–(]\\s{0,3})(?<![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])Japon(?![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])",
        "replace": "$1اليابان",
        "flags": "g",
        "label": "pays : اليابان"
      },
      {
        "find": "([,،\\-–(]\\s{0,3})(?<![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])Inde(?![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])",
        "replace": "$1الهند",
        "flags": "g",
        "label": "pays : الهند"
      },
      {
        "find": "([,،\\-–(]\\s{0,3})(?<![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])Singapour(?![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])",
        "replace": "$1سنغافورة",
        "flags": "g",
        "label": "pays : سنغافورة"
      },
      {
        "find": "([,،\\-–(]\\s{0,3})(?<![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])Qatar(?![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])",
        "replace": "$1قطر",
        "flags": "g",
        "label": "pays : قطر"
      },
      {
        "find": "([,،\\-–(]\\s{0,3})(?<![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])Liban(?![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])",
        "replace": "$1لبنان",
        "flags": "g",
        "label": "pays : لبنان"
      },
      {
        "find": "([,،\\-–(]\\s{0,3})(?<![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])Jordanie(?![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])",
        "replace": "$1الأردن",
        "flags": "g",
        "label": "pays : الأردن"
      },
      {
        "find": "([,،\\-–(]\\s{0,3})(?<![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])Maroc(?![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])",
        "replace": "$1المغرب",
        "flags": "g",
        "label": "pays : المغرب"
      },
      {
        "find": "([,،\\-–(]\\s{0,3})(?<![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])Tunisie(?![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])",
        "replace": "$1تونس",
        "flags": "g",
        "label": "pays : تونس"
      },
      {
        "find": "([,،\\-–(]\\s{0,3})(?<![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])Algérie(?![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])",
        "replace": "$1الجزائر",
        "flags": "g",
        "label": "pays : الجزائر"
      },
      {
        "find": "([,،\\-–(]\\s{0,3})(?<![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])Égypte(?![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])",
        "replace": "$1مصر",
        "flags": "g",
        "label": "pays : مصر"
      },
      {
        "find": "([,،\\-–(]\\s{0,3})(?<![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])Libye(?![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])",
        "replace": "$1ليبيا",
        "flags": "g",
        "label": "pays : ليبيا"
      },
      {
        "find": "([,،\\-–(]\\s{0,3})(?<![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])Mauritanie(?![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])",
        "replace": "$1موريتانيا",
        "flags": "g",
        "label": "pays : موريتانيا"
      },
      {
        "find": "([,،\\-–(]\\s{0,3})(?<![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])Sénégal(?![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])",
        "replace": "$1السنغال",
        "flags": "g",
        "label": "pays : السنغال"
      },
      {
        "find": "([,،\\-–(]\\s{0,3})(?<![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])Nigéria(?![A-Za-zÀ-ÿ'\\u2019\\u2018\\u02bc\\-])",
        "replace": "$1نيجيريا",
        "flags": "g",
        "label": "pays : نيجيريا"
      }
    ],
    "version": "1.1",
    "created": "2026-07-15",
    "code": "DEC-F-05",
    "doctype": "decision_ar",
    "category": "TERMINOLOGIE",
    "mode": "regex",
    "label": "Noms de pays en arabe (adresses)",
    "text": "Dans un document arabe, le nom du pays figurant à la FIN D'UNE ADRESSE s'écrit en arabe (ou dans la langue d'origine du pays), même si le reste de l'adresse demeure en caractères latins. La conversion ne s'applique qu'après une virgule, un tiret ou une parenthèse (séparateurs d'adresse), jamais à l'intérieur d'une dénomination sociale.",
    "examples": "✗ 23 street, États-Unis → ✓ 23 street, الولايات المتحدة الأمريكية\nNom de société (ne pas modifier) : \"Sistemas Avanzados de Tecnologia Maroc\" → inchangé",
    "notes": "Table extensible. Ancrée sur les frontières de mot (pas de correspondance à l'intérieur d'un autre mot). N'inclut que des formes vérifiées ; d'autres pays à ajouter au besoin.\n[21/10/2026] Conversion limitée aux adresses (après « , » « ، » « - » ou « ( ») : ne touche plus les noms de sociétés.",
    "id": "DEC-F-05"
  },
  {
    "scope": [
      "tout"
    ],
    "active": true,
    "regex": null,
    "version": "0.2",
    "created": "2026-11-02",
    "code": "LA-01",
    "doctype": "lettre_ar",
    "category": "FORME",
    "mode": "claude",
    "label": "Bloc destinataire",
    "text": "Le destinataire est désigné par sa qualité exacte, puis l'entité : « السيد المدير العام لشركة \"X\" », « السيد الرئيس المدير العام لشركة \"X\" » (SA), « السيد مسير شركة \"X\" » (SARL), « السيد مندوب الحكومة لدى مجلس المنافسة ». Pour un ministre, la ligne « الفاضل المحترم » (« الفاضلة المحترمة » pour une ministre) PRÉCÈDE la qualité ; ne jamais ajouter « المحترم » APRÈS la qualité dans l'en-tête. Cette ligne et la clôture sont corrigées automatiquement (LG-09). Le titre doit être grammaticalement complet (article défini).",
    "examples": "✗ السيدة وزيرة الاقتصاد والمالية المحترمة → ✓ الفاضلة المحترمة / السيدة وزيرة …\n✗ السيد مدير مديرية العامة للضرائب → ✓ السيد المدير العام للضرائب",
    "notes": "[03/11/2026] Ligne « الفاضل(ة) المحترم(ة) » avant la qualité du ministre, jamais « المحترم » après.",
    "id": "LA-01"
  },
  {
    "scope": [
      "tout"
    ],
    "active": true,
    "regex": [
      {
        "find": "^(?<w>[ \\t]*)(?<v>[ء-ؿف-ي][ء-ي ]{0,25}[ء-ؿف-ي])[ \\t]*-(?=[ \\t‎‏]*$)",
        "replace": "$<w>- $<v> -",
        "flags": "gm",
        "label": "Tiret manquant avant la ville"
      }
    ],
    "version": "0.1",
    "created": "2026-11-02",
    "code": "LA-02",
    "doctype": "lettre_ar",
    "category": "FORME",
    "mode": "regex",
    "label": "Ville du destinataire entre tirets",
    "text": "La ville figure seule sur sa ligne, entre deux tirets : « - الرباط - ».",
    "examples": "✗ الرباط - → ✓ - الرباط -\n✗ أولاد تايمة - → ✓ - أولاد تايمة -",
    "notes": "",
    "id": "LA-02"
  },
  {
    "scope": [
      "tout"
    ],
    "active": true,
    "regex": [
      {
        "find": "^(?<w>[ \\t]*)-[ \\t]*(?<v>[ء-ؿف-ي][ء-ي ]{0,25}[ء-ؿف-ي])[ \\t]*-(?=[ \\t‎‏]*$)",
        "replace": "$<w>- $<v> -",
        "flags": "gm",
        "label": "Tirets espacés autour de la ville"
      }
    ],
    "version": "0.1",
    "created": "2026-11-02",
    "code": "LA-03",
    "doctype": "lettre_ar",
    "category": "FORME",
    "mode": "regex",
    "label": "Ville : tirets espacés",
    "text": "Forme unique « - المدينة - » : un tiret, une espace, la ville, une espace, un tiret.",
    "examples": "-الرباط- → - الرباط -",
    "notes": "À trancher : « - الرباط - » (7 lettres) ou « -الرباط- » (6 lettres) ; 3 lettres en forme mixte ou incomplète.\n[03/11/2026] Forme « - الرباط - » retenue (point 1).",
    "id": "LA-03"
  },
  {
    "scope": [
      "tout"
    ],
    "active": true,
    "regex": null,
    "version": "0.1",
    "created": "2026-11-02",
    "code": "LA-04",
    "doctype": "lettre_ar",
    "category": "FORME",
    "mode": "claude",
    "label": "Rubriques الموضوع / المرجع / المرفقات",
    "text": "« الموضوع : » est obligatoire. « المرجع : » est obligatoire dès que le corps renvoie à un courrier « المشار إليها أعلاه » / « المشار إليها في المرجع أعلاه », et doit être rempli (nature, numéro ou date du courrier). « المرفقات : N » est obligatoire dès que le corps annonce une pièce jointe (« وتجدون رفقته / طيه نسخة… », « أوافي سيادتكم، رفقته، بـ… ») ; N correspond au nombre de pièces annoncées. À l'inverse, signaler « المرفقات » sans pièce annoncée.",
    "examples": "✗ corps : « تبعا لرسالتكم المشار إليها أعلاه » sans ligne « المرجع » → ajouter « المرجع : رسالتكم بتاريخ … »\n✗ « وتجدون رفقته نسخة من بلاغ المجلس » sans « المرفقات : 1 »",
    "notes": "",
    "id": "LA-04"
  },
  {
    "scope": [
      "tout"
    ],
    "active": true,
    "regex": [
      {
        "find": "(?<p>سلام تام بوجود مولانا ال)[اإ](?<s>مام)(?=[ \\t‎‏]*$)",
        "replace": "$<p>إ$<s>،",
        "flags": "gm",
        "label": "Virgule (et hamza) de la formule d'ouverture"
      },
      {
        "find": "مولانا الامام(?=،)",
        "replace": "مولانا الإمام",
        "flags": "g",
        "label": "Hamza : الإمام"
      }
    ],
    "version": "0.1",
    "created": "2026-11-02",
    "code": "LA-05",
    "doctype": "lettre_ar",
    "category": "FORME",
    "mode": "regex",
    "label": "Formule « سلام تام بوجود مولانا الإمام، »",
    "text": "Formule d'ouverture exacte, centrée : « سلام تام بوجود مولانا الإمام، » (hamza sur الإمام, virgule finale).",
    "examples": "✗ مولانا الامام → ✓ مولانا الإمام\n✗ سلام تام بوجود مولانا الإمام → ✓ سلام تام بوجود مولانا الإمام،",
    "notes": "",
    "id": "LA-05"
  },
  {
    "scope": [
      "tout"
    ],
    "active": true,
    "regex": [
      {
        "find": "(?<![ء-ي])(?<p>[وف]?)ن(?<v>رجو|طلب|لتمس)(?![ء-ي])",
        "replace": "$<p>أ$<v>",
        "flags": "g",
        "label": "Première personne du singulier (أرجو، أطلب، ألتمس)"
      }
    ],
    "version": "0.2",
    "created": "2026-11-02",
    "code": "LA-06",
    "doctype": "lettre_ar",
    "category": "FORME",
    "mode": "claude",
    "label": "Ouverture « وبعد، » et première personne",
    "text": "Le corps commence par « وبعد، ». Le signataire s'exprime à la première personne du singulier (« يشرفني أن أحيط سيادتكم علما »، « أطلب »، « أرجو »، « رسالاتي »), jamais « نطلب » / « نرجو ».",
    "examples": "✗ وفي هذا الإطار، نطلب منكم موافاته الأمانة العامة → ✓ وفي هذا الإطار، أطلب منكم موافاة الأمانة العامة",
    "notes": "[03/11/2026] « نرجو / نطلب / نلتمس » ramenés automatiquement au singulier (lettre MEF du 03/11).",
    "id": "LA-06"
  },
  {
    "scope": [
      "tout"
    ],
    "active": true,
    "regex": [
      {
        "find": "(?<=وتفضلوا[^\\n]{0,80})فائق[\\s‎‏]+(?:عبارات[\\s‎‏]+)?(?:الاحترام[\\s‎‏]+والتقدير|التقدير[\\s‎‏]+والاحترام)(?:[\\s‎‏]+والسلام)?(?=[\\s‎‏]*\\.)",
        "replace": "فائق عبارات التقدير والاحترام والسلام",
        "flags": "g",
        "label": "Formule de clôture normalisée"
      }
    ],
    "version": "0.1",
    "created": "2026-11-02",
    "code": "LA-07",
    "doctype": "lettre_ar",
    "category": "FORME",
    "mode": "regex",
    "label": "Formule de clôture selon le destinataire",
    "text": "Ministre : « وتفضلوا، السيد الوزير المحترم، بقبول فائق عبارات التقدير والاحترام والسلام. » (« السيدة الوزيرة المحترمة »). Responsable d'administration ou d'établissement public, Commissaire du Gouvernement : « وتفضلوا، السيد [الصفة]، بقبول فائق عبارات التقدير والاحترام والسلام. » (pour le Commissaire du Gouvernement, « وتفضلوا بقبول فائق عبارات التقدير والاحترام والسلام. »). Entreprise, personne physique, association : « مع أزكى التحيات والسلام. ». La qualité citée dans la clôture reprend celle du destinataire (même titre, même genre). Une lettre adressée à un établissement public se clôt par « وتفضلوا… », jamais par « مع أزكى التحيات ».",
    "examples": "✗ destinataire « المدير العام للضرائب », clôture « السيد المدير » → ✓ « السيد المدير العام »\n✗ … بقبول فائق التقدير والاحترام → ✓ … بقبول فائق عبارات التقدير والاحترام والسلام",
    "notes": "À trancher : ordre « التقدير والاحترام » (5 lettres) ou « الاحترام والتقدير » (2) ; « والسلام » final systématique ? ; formule pour les établissements publics (agence : « مع أزكى التحيات », Office des changes et DGI : « وتفضلوا… »).\n[03/11/2026] Clôture « فائق عبارات التقدير والاحترام والسلام » ; établissements publics : « وتفضلوا… » (points 4 et 5). La correspondance destinataire / formule reste vérifiée par le modèle via LG-09.",
    "id": "LA-07"
  },
  {
    "scope": [
      "tout"
    ],
    "active": true,
    "regex": [
      {
        "find": "القانون[\\s‎‏]+(?:رقم[\\s‎‏]+)?(?:13\\s*[-.]\\s*20|20\\s*[-/]\\s*13)(?![0-9])",
        "replace": "القانون رقم 20.13",
        "flags": "g",
        "label": "Loi 20.13"
      },
      {
        "find": "القانون[\\s‎‏]+(?:رقم[\\s‎‏]+)?(?:12\\s*[-.]\\s*104|104\\s*[-/]\\s*12|104\\s+\\.\\s*12|104\\s*\\.\\s+12)(?![0-9])(?<a>[ء-ؿف-ي])",
        "replace": "القانون رقم 104.12 $<a>",
        "flags": "g",
        "label": "Loi 104.12"
      },
      {
        "find": "القانون[\\s‎‏]+(?:رقم[\\s‎‏]+)?(?:12\\s*[-.]\\s*104|104\\s*[-/]\\s*12|104\\s+\\.\\s*12|104\\s*\\.\\s+12)(?![0-9]|[ء-ؿف-ي])",
        "replace": "القانون رقم 104.12",
        "flags": "g",
        "label": "Loi 104.12"
      },
      {
        "find": "القانون[\\s‎‏]+(?=(?:20\\.13|104\\.12)(?![0-9]))",
        "replace": "القانون رقم ",
        "flags": "g",
        "label": "« رقم » avant le numéro de la loi"
      }
    ],
    "version": "0.1",
    "created": "2026-11-02",
    "code": "LA-08",
    "doctype": "lettre_ar",
    "category": "FOND",
    "mode": "regex",
    "label": "Numéros des lois 20.13 et 104.12",
    "text": "« القانون رقم 20.13 المتعلق بمجلس المنافسة » et « القانون رقم 104.12 المتعلق بحرية الأسعار والمنافسة » : numéro avec point, dans cet ordre, précédé de « رقم ».",
    "examples": "✗ القانون رقم 13-20 → ✓ القانون رقم 20.13\n✗ القانون رقم 12-104 → ✓ القانون رقم 104.12\n✗ القانون 104.12 → ✓ القانون رقم 104.12",
    "notes": "",
    "id": "LA-08"
  },
  {
    "scope": [
      "tout"
    ],
    "active": true,
    "regex": [
      {
        "find": "كما تم تتميمه(?<d>ما)? وتغييره(?:ما)?",
        "replace": "كما تم تغييره$<d> وتتميمه$<d>",
        "flags": "g",
        "label": "Ordre تغيير puis تتميم"
      },
      {
        "find": "كما تم تغييره(?<d>ما)?\\s+تتميمه(?:ما)?",
        "replace": "كما تم تغييره$<d> وتتميمه$<d>",
        "flags": "g",
        "label": "« و » manquant"
      }
    ],
    "version": "0.1",
    "created": "2026-11-02",
    "code": "LA-09",
    "doctype": "lettre_ar",
    "category": "FOND",
    "mode": "regex",
    "label": "Formule « كما تم تغييره وتتميمه »",
    "text": "Après la citation d'une loi : « كما تم تغييره وتتميمه » ; après deux lois : « كما تم تغييرهما وتتميمهما ». Toujours « تغيير » puis « تتميم », reliés par « و ». Jamais « تغييرها وتتميمها » (accord avec القانون, masculin).",
    "examples": "✗ كما تم تتميمهما وتغييرهما → ✓ كما تم تغييرهما وتتميمهما\n✗ كما تم تغييره تتميمه → ✓ كما تم تغييره وتتميمه\n✗ (deux lois citées) كما تم تغييرها وتتميمها → ✓ كما تم تغييرهما وتتميمهما",
    "notes": "L'accord singulier / duel (« تغييره » ou « تغييرهما ») dépend du nombre de lois citées : laissé au jugement du modèle.",
    "id": "LA-09"
  },
  {
    "scope": [
      "tout"
    ],
    "active": true,
    "regex": null,
    "version": "0.1",
    "created": "2026-11-02",
    "code": "LA-10",
    "doctype": "lettre_ar",
    "category": "FOND",
    "mode": "claude",
    "label": "Fondement juridique : articles des modèles",
    "text": "Signaler, sans corriger, un numéro d'article manifestement erroné ou sans rapport avec l'objet de la lettre (ex. « المادتين 2 و6 » au lieu de « المادتين 2 و16 »). Les articles cités par les modèles du Conseil sont conservés tels quels : avis d'initiative (المادة 4 من القانون رقم 20.13) ; audition ou demande d'informations (المادتان 2 و16 من القانون رقم 20.13، et le cas échéant المادة 74 من القانون رقم 104.12 pour une administration ou une personne publique) ; recevabilité (المادة 26 من القانون رقم 104.12 والمادة 28 من النظام الداخلي) ; injonction sous astreinte (المادة 40 من القانون رقم 104.12) ; incompétence (المادتان 2 و3 من القانون رقم 20.13 والمواد 6 و7 و8 من القانون رقم 104.12). Ne JAMAIS proposer d'ajouter ou de remplacer un article (par exemple les art. 29 ou 73 de la loi 104.12).",
    "examples": "Avis : « طبقا لمقتضيات المادة 4 من القانون رقم 20.13 … اتخذ المجلس … المبادرة للإدلاء برأي »",
    "notes": "À confirmer par le rapporteur : correspondances tirées du lot 1 uniquement.\n[03/11/2026] Articles des modèles conservés, aucun ajout (points 9, 15 et 16).",
    "id": "LA-10"
  },
  {
    "scope": [
      "tout"
    ],
    "active": true,
    "regex": [
      {
        "find": "(?<q>(?:ال)?قرار(?:ه|ها|كم)?(?:\\s+(?:المجلس|مجلس المنافسة))?)\\s*(?:(?:عدد|رقم)\\s*)?(?<n>[0-9]+)\\s*/\\s*ق\\s*/\\s*(?<y>[0-9]{4})",
        "replace": "$<q> عدد $<n>/ق/$<y>",
        "flags": "g",
        "label": "Format de la référence de décision"
      }
    ],
    "version": "0.1",
    "created": "2026-11-02",
    "code": "LA-11",
    "doctype": "lettre_ar",
    "category": "FORME",
    "mode": "regex",
    "label": "Référence d'une décision « عدد NN/ق/AAAA »",
    "text": "Une décision du Conseil est citée « قرار المجلس عدد NN/ق/AAAA الصادر بتاريخ … » : « عدد » présent, suivi d'une espace, aucune espace autour des barres obliques.",
    "examples": "✗ قراره عدد30 /ق/2026 → ✓ قراره عدد 30/ق/2026\n✗ بمقتضى قراره 82/ق/2026 → ✓ بمقتضى قراره عدد 82/ق/2026",
    "notes": "",
    "id": "LA-11"
  },
  {
    "scope": [
      "tout"
    ],
    "active": true,
    "regex": [
      {
        "find": "(?<m>يناير|فبراير|مارس|أبريل|ماي|يونيو|يوليوز|غشت|شتنبر|أكتوبر|نونبر|دجنبر)(?<y>[0-9]{4})",
        "replace": "$<m> $<y>",
        "flags": "g",
        "label": "Espace entre le mois et l'année"
      },
      {
        "find": "(?<d>[0-9]{1,2})(?<m>يناير|فبراير|مارس|أبريل|ماي|يونيو|يوليوز|غشت|شتنبر|أكتوبر|نونبر|دجنبر)",
        "replace": "$<d> $<m>",
        "flags": "g",
        "label": "Espace entre le jour et le mois"
      },
      {
        "find": "(?<![ء-ي])سبتمبر(?![ء-ي])",
        "replace": "شتنبر",
        "flags": "g",
        "label": "Mois : شتنبر"
      },
      {
        "find": "(?<![ء-ي])نوفمبر(?![ء-ي])",
        "replace": "نونبر",
        "flags": "g",
        "label": "Mois : نونبر"
      },
      {
        "find": "(?<![ء-ي])ديسمبر(?![ء-ي])",
        "replace": "دجنبر",
        "flags": "g",
        "label": "Mois : دجنبر"
      },
      {
        "find": "(?<![ء-ي])أغسطس(?![ء-ي])",
        "replace": "غشت",
        "flags": "g",
        "label": "Mois : غشت"
      },
      {
        "find": "(?<![ء-ي])يوليو(?![ء-يز])",
        "replace": "يوليوز",
        "flags": "g",
        "label": "Mois : يوليوز"
      },
      {
        "find": "(?<![ء-ي])مايو(?![ء-ي])",
        "replace": "ماي",
        "flags": "g",
        "label": "Mois : ماي"
      },
      {
        "find": "(?<![0-9٠-٩])1(?=[\\s‎‏]*(?:يناير|فبراير|مارس|أبريل|ماي|يونيو|يوليوز|غشت|شتنبر|أكتوبر|نونبر|دجنبر))",
        "replace": "فاتح",
        "flags": "g",
        "label": "فاتح pour le premier du mois"
      },
      {
        "find": "(?<![0-9٠-٩])(?<d>[2-9])(?=[\\s‎‏]*(?:يناير|فبراير|مارس|أبريل|ماي|يونيو|يوليوز|غشت|شتنبر|أكتوبر|نونبر|دجنبر))",
        "replace": "0$<d>",
        "flags": "g",
        "label": "Jour sur deux chiffres"
      }
    ],
    "version": "0.1",
    "created": "2026-11-02",
    "code": "LA-12",
    "doctype": "lettre_ar",
    "category": "FORME",
    "mode": "regex",
    "label": "Dates : espaces et noms marocains des mois",
    "text": "Jour, mois et année séparés par une espace ; mois selon l'usage marocain (يناير، فبراير، مارس، أبريل، ماي، يونيو، يوليوز، غشت، شتنبر، أكتوبر، نونبر، دجنبر) ; « فاتح » pour le premier du mois. Jour sur deux chiffres (« 09 شتنبر 2024 »).",
    "examples": "✗ 24 نونبر2025 → ✓ 24 نونبر 2025\n✗ 21 يناير2026 → ✓ 21 يناير 2026\n✗ سبتمبر → ✓ شتنبر",
    "notes": "À trancher : jour sur deux chiffres (« 09 شتنبر 2024 », « 08 أكتوبر 2026 ») ou non (« 9 فبراير 2025 ») ; les deux formes coexistent dans le lot.\n[03/11/2026] Jour sur deux chiffres et « فاتح » retenus (point 6).",
    "id": "LA-12"
  },
  {
    "scope": [
      "tout"
    ],
    "active": true,
    "regex": [
      {
        "find": "(?<![ء-ي])على(?=[\\s‎‏]+الساعة)",
        "replace": "في",
        "flags": "g",
        "label": "في الساعة"
      },
      {
        "find": "الساعة الحادية عشر(?![ء-ي])",
        "replace": "الساعة الحادية عشرة",
        "flags": "g",
        "label": "الحادية عشرة"
      },
      {
        "find": "(?<h>الساعة\\s+\\S+)\\s+و(?:ال)?نصف\\s+زوالا",
        "replace": "$<h> والنصف بعد الزوال",
        "flags": "g",
        "label": "والنصف بعد الزوال"
      },
      {
        "find": "(?<h>الساعة\\s+\\S+)\\s+ونصف(?!\\s+زوالا)",
        "replace": "$<h> والنصف",
        "flags": "g",
        "label": "والنصف"
      },
      {
        "find": "(?<h>الساعة\\s+\\S+(?:\\s+والنصف)?)\\s+زوالا",
        "replace": "$<h> بعد الزوال",
        "flags": "g",
        "label": "بعد الزوال"
      }
    ],
    "version": "0.1",
    "created": "2026-11-02",
    "code": "LA-13",
    "doctype": "lettre_ar",
    "category": "FORME",
    "mode": "regex",
    "label": "Heure de l'audition",
    "text": "« في الساعة العاشرة صباحا », « في الساعة الثانية والنصف بعد الزوال » : « الحادية عشرة » (féminin), « والنصف » (avec article), « بعد الزوال » (et non « زوالا »).",
    "examples": "✗ الساعة الحادية عشر صباحا → ✓ الساعة الحادية عشرة صباحا\n✗ الساعة الثانية ونصف زوالا → ✓ الساعة الثانية والنصف بعد الزوال",
    "notes": "À trancher : « على الساعة » (5 lettres) ou « في الساعة » (6 lettres).\n[03/11/2026] « في الساعة » retenu (point 3).",
    "id": "LA-13"
  },
  {
    "scope": [
      "tout"
    ],
    "active": true,
    "regex": [
      {
        "find": "(?<p>بمقر[\\s‎‏]+(?:مجلس[\\s‎‏]+المنافسة|المجلس))[\\s‎‏]*الكائن[\\s‎‏]+(?:ب)?(?:زاوية|تقاطع)[\\s‎‏]+شارع(?:ي)?[\\s‎‏]+الزيتون[\\s‎‏]+و(?:شارع[\\s‎‏]+)?محمد[\\s‎‏]+اليزيدي[\\s‎‏]*[،,]?[\\s‎‏]*(?:ب)?حي[\\s‎‏]+الرياض[\\s‎‏]*[،,\\-–]?[\\s‎‏]*(?:ب)?الرباط",
        "replace": "$<p> الكائن بزاوية شارع الزيتون وشارع محمد اليزيدي، حي الرياض، الرباط",
        "flags": "g",
        "label": "Adresse du siège : forme unique"
      },
      {
        "find": "الكائن[\\s‎‏]+(?=(?:زاوية|تقاطع)[\\s‎‏]+)",
        "replace": "الكائن ب",
        "flags": "g",
        "label": "Préposition ب avant زاوية / تقاطع"
      }
    ],
    "version": "0.2",
    "created": "2026-11-02",
    "code": "LA-14",
    "doctype": "lettre_ar",
    "category": "FORME",
    "mode": "regex",
    "label": "Adresse du siège du Conseil",
    "text": "Forme unique de l'adresse du siège : « بمقر مجلس المنافسة الكائن بزاوية شارع الزيتون وشارع محمد اليزيدي، حي الرياض، الرباط » (« بمقر المجلس » admis).",
    "examples": "✗ بمقر المجلس الكائن بتقاطع شارعي الزيتون ومحمد اليزيدي، بحي الرياض بالرباط → ✓ بمقر المجلس الكائن بزاوية شارع الزيتون وشارع محمد اليزيدي، حي الرياض، الرباط\n✗ الكائن زاوية شارع الزيتون → ✓ الكائن بزاوية شارع الزيتون",
    "notes": "Six formes dans le lot. À trancher, par exemple : « بمقر مجلس المنافسة الكائن بزاوية شارع الزيتون وشارع محمد اليزيدي، حي الرياض، الرباط ». Une fois la forme choisie, une règle automatique alignera toutes les variantes.\n[03/11/2026] Adresse unique retenue (point 2).\n[03/11/2026] Forme « حي الرياض-الرباط » (tiret) ramenée à la forme unique.",
    "id": "LA-14"
  },
  {
    "scope": [
      "tout"
    ],
    "active": true,
    "regex": [
      {
        "find": "secr[ée]tariat[._-]?g[ée]n[ée]ral@conseil[-_.]?concurrence\\.(?:ma|org|com)",
        "replace": "secretariat.general@conseil-concurrence.ma",
        "flags": "g",
        "label": "Adresse électronique du Secrétariat général"
      },
      {
        "find": "(?<e>conseil-concurrence\\.ma)[ \\t]+(?<p>[،,])",
        "replace": "$<e>$<p>",
        "flags": "g",
        "label": "Pas d'espace avant la virgule"
      },
      {
        "find": "موافاته الأمانة",
        "replace": "موافاة الأمانة",
        "flags": "g",
        "label": "موافاة الأمانة العامة"
      },
      {
        "find": "(?<![ء-ي])كما لذلك،",
        "replace": "وتبعا لذلك،",
        "flags": "g",
        "label": "وتبعا لذلك"
      },
      {
        "find": "(?<![ء-ي])(?<p>[بل]?)موافاتنا(?![ء-ي])",
        "replace": "$<p>موافاة الأمانة العامة للمجلس",
        "flags": "g",
        "label": "موافاة الأمانة العامة للمجلس"
      }
    ],
    "version": "0.2",
    "created": "2026-11-02",
    "code": "LA-15",
    "doctype": "lettre_ar",
    "category": "FORME",
    "mode": "regex",
    "label": "Adresse électronique et formule de transmission",
    "text": "Adresse exacte « secretariat.general@conseil-concurrence.ma », séparée du texte arabe par une espace, sans espace avant la virgule. Formule : « موافاة الأمانة العامة للمجلس … بواسطة البريد الإلكتروني … ».",
    "examples": "✗ conseil-concurrence.maبالمعطيات → ✓ conseil-concurrence.ma بالمعطيات\n✗ نطلب منكم موافاته الأمانة العامة → ✓ … موافاة الأمانة العامة\n✗ كما لذلك، أرجو → ✓ وتبعا لذلك، أرجو",
    "notes": "[03/11/2026] « موافاتنا » → « موافاة الأمانة العامة للمجلس ».",
    "id": "LA-15"
  },
  {
    "scope": [
      "tout"
    ],
    "active": true,
    "regex": [
      {
        "find": "(?<a>[ء-ؿف-ي])(?<l>[A-Za-z])",
        "replace": "$<a> $<l>",
        "flags": "g",
        "label": "Espace entre arabe et latin"
      },
      {
        "find": "(?<l>[A-Za-z])(?<a>[ء-ؿف-ي])",
        "replace": "$<l> $<a>",
        "flags": "g",
        "label": "Espace entre latin et arabe"
      },
      {
        "find": "(?<d>[0-9])(?<a>[ء-ؿف-ي])",
        "replace": "$<d> $<a>",
        "flags": "g",
        "label": "Espace après un nombre"
      },
      {
        "find": "(?<![ء-ي])(?<k>عدد|رقم)(?<n>[0-9])",
        "replace": "$<k> $<n>",
        "flags": "g",
        "label": "Espace après عدد / رقم"
      }
    ],
    "version": "0.1",
    "created": "2026-11-02",
    "code": "LA-16",
    "doctype": "lettre_ar",
    "category": "FORME",
    "mode": "regex",
    "label": "Espaces entre arabe, latin et chiffres",
    "text": "Une espace sépare un mot arabe d'un mot en caractères latins, et un nombre du mot arabe qui le suit. « عدد » et « رقم » sont suivis d'une espace.",
    "examples": "✗ شركةDMAT FX → ✓ شركة DMAT FX\n✗ 104المتعلق → ✓ 104 المتعلق",
    "notes": "",
    "id": "LA-16"
  },
  {
    "scope": [
      "tout"
    ],
    "active": true,
    "regex": [
      {
        "find": "\\.[ \\t]*؛",
        "replace": "؛",
        "flags": "g",
        "label": "Double ponctuation .؛"
      },
      {
        "find": "(?<=\\S)[ \\t]+(?<p>[؛،])",
        "replace": "$<p>",
        "flags": "g",
        "label": "Pas d'espace avant ؛ / ،"
      }
    ],
    "version": "0.1",
    "created": "2026-11-02",
    "code": "LA-17",
    "doctype": "lettre_ar",
    "category": "FORME",
    "mode": "regex",
    "label": "Ponctuation des énumérations",
    "text": "Chaque point d'une énumération se termine par « ؛ », le dernier par « . ». Jamais « .؛ », jamais d'espace avant « ؛ » ou « ، ».",
    "examples": "✗ … كجهات جباية).؛ → ✓ … كجهات جباية)؛\n✗ «Agenz SA» ؛ → ✓ «Agenz SA»؛",
    "notes": "",
    "id": "LA-17"
  },
  {
    "scope": [
      "tout"
    ],
    "active": true,
    "regex": [
      {
        "find": "(?<=[ء-ؿف-ي])ـ+(?=[ء-ؿف-ي])",
        "replace": "",
        "flags": "g",
        "label": "Tatweel supprimé"
      }
    ],
    "version": "0.1",
    "created": "2026-11-02",
    "code": "LA-18",
    "doctype": "lettre_ar",
    "category": "FORME",
    "mode": "regex",
    "label": "Tatweel (ـ) d'étirement",
    "text": "Supprimer les tatweel ajoutés pour étirer les mots (« العـروض », « لحـــضــور جـــلـــــسة ») ; la justification est assurée par la mise en page. Le « لـ » devant un nom entre guillemets ou en caractères latins est conservé.",
    "examples": "✗ وسيتضمــن جدول أعمــال → ✓ وسيتضمن جدول أعمال",
    "notes": "À trancher : le tatweel peut être volontaire pour la justification.\n[03/11/2026] Suppression retenue (point 8).",
    "id": "LA-18"
  },
  {
    "scope": [
      "tout"
    ],
    "active": true,
    "regex": [
      {
        "find": "(?<![ء-ي])(?<b>ب?مقتض)ي(?![ء-ي])",
        "replace": "$<b>ى",
        "flags": "g",
        "label": "بمقتضى"
      },
      {
        "find": "(?<![ء-ي])(?<p>(?:ب|ل|و)?)الاخير(?<s>ة|ين|ون)?(?![ء-ي])",
        "replace": "$<p>الأخير$<s>",
        "flags": "g",
        "label": "الأخيرة"
      }
    ],
    "version": "0.1",
    "created": "2026-11-02",
    "code": "LA-19",
    "doctype": "lettre_ar",
    "category": "FORME",
    "mode": "regex",
    "label": "Orthographe : formes fréquentes",
    "text": "Formes relevées dans le lot : « بمقتضى » (alif maqsura), « الأخيرة » (hamza), « المديرية العامة » (article).",
    "examples": "✗ بمقتضي قراره → ✓ بمقتضى قراره\n✗ هذه الاخيرة → ✓ هذه الأخيرة",
    "notes": "",
    "id": "LA-19"
  },
  {
    "scope": [
      "tout"
    ],
    "active": true,
    "regex": null,
    "version": "0.1",
    "created": "2026-11-02",
    "code": "LA-20",
    "doctype": "lettre_ar",
    "category": "FOND",
    "mode": "claude",
    "label": "Cohérence interne (copier-coller)",
    "text": "Le corps reprend exactement l'entité destinataire (nom, genre, nombre) : « ممثل عن [الجهة] », « جامعتكم / هيأتكم / وزارتكم / شركتكم ». Aucun reliquat d'une autre lettre (autre destinataire, autre date, autre objet). Les dates d'audition et de réponse, l'objet et le fondement sont cohérents entre eux.",
    "examples": "✗ بانتداب ممثل عن رئيس الهيئة الوطنية → ✓ بانتداب ممثل عن الهيئة الوطنية",
    "notes": "",
    "id": "LA-20"
  },
  {
    "scope": [
      "tout"
    ],
    "active": true,
    "regex": null,
    "version": "0.1",
    "created": "2026-11-02",
    "code": "LA-21",
    "doctype": "lettre_ar",
    "category": "FORME",
    "mode": "claude",
    "label": "Dénominations entre guillemets",
    "text": "Les dénominations sociales en caractères latins sont entre guillemets, en paires complètes, sans espace parasite à l'intérieur ; la forme juridique fait partie de la dénomination (SA, SARL, SARLAU, SAS).",
    "examples": "✗ شركة Robinson\" \"BidCo SAS → ✓ شركة \"Robinson BidCo SAS\"\n✗ \" PROMAGRI SA \" → ✓ \"PROMAGRI SA\"",
    "notes": "À trancher : style unique « » ou \" \" dans les lettres arabes ? (le lot emploie les deux).\n[03/11/2026] Style des guillemets laissé à l'auteur (point 7).",
    "id": "LA-21"
  },
  {
    "scope": [
      "tout"
    ],
    "active": true,
    "regex": [
      {
        "find": "(?<=(?:1er|\\b[0-9]{1,2})\\s)Janvier\\b",
        "replace": "janvier",
        "flags": "g",
        "label": "Janvier → janvier"
      },
      {
        "find": "(?<=(?:1er|\\b[0-9]{1,2})\\s)Février\\b",
        "replace": "février",
        "flags": "g",
        "label": "Février → février"
      },
      {
        "find": "(?<=(?:1er|\\b[0-9]{1,2})\\s)Mars\\b",
        "replace": "mars",
        "flags": "g",
        "label": "Mars → mars"
      },
      {
        "find": "(?<=(?:1er|\\b[0-9]{1,2})\\s)Avril\\b",
        "replace": "avril",
        "flags": "g",
        "label": "Avril → avril"
      },
      {
        "find": "(?<=(?:1er|\\b[0-9]{1,2})\\s)Mai\\b",
        "replace": "mai",
        "flags": "g",
        "label": "Mai → mai"
      },
      {
        "find": "(?<=(?:1er|\\b[0-9]{1,2})\\s)Juin\\b",
        "replace": "juin",
        "flags": "g",
        "label": "Juin → juin"
      },
      {
        "find": "(?<=(?:1er|\\b[0-9]{1,2})\\s)Juillet\\b",
        "replace": "juillet",
        "flags": "g",
        "label": "Juillet → juillet"
      },
      {
        "find": "(?<=(?:1er|\\b[0-9]{1,2})\\s)Août\\b",
        "replace": "août",
        "flags": "g",
        "label": "Août → août"
      },
      {
        "find": "(?<=(?:1er|\\b[0-9]{1,2})\\s)Septembre\\b",
        "replace": "septembre",
        "flags": "g",
        "label": "Septembre → septembre"
      },
      {
        "find": "(?<=(?:1er|\\b[0-9]{1,2})\\s)Octobre\\b",
        "replace": "octobre",
        "flags": "g",
        "label": "Octobre → octobre"
      },
      {
        "find": "(?<=(?:1er|\\b[0-9]{1,2})\\s)Novembre\\b",
        "replace": "novembre",
        "flags": "g",
        "label": "Novembre → novembre"
      },
      {
        "find": "(?<=(?:1er|\\b[0-9]{1,2})\\s)Décembre\\b",
        "replace": "décembre",
        "flags": "g",
        "label": "Décembre → décembre"
      },
      {
        "find": "(?<![0-9])1(?=\\s+(?:janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\\b)",
        "replace": "1er",
        "flags": "gi",
        "label": "1er du mois"
      },
      {
        "find": "(?<![0-9])(?<d>[2-9])(?=\\s+(?:janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\\b)",
        "replace": "0$<d>",
        "flags": "gi",
        "label": "Jour sur deux chiffres"
      }
    ],
    "version": "0.1",
    "created": "2026-11-02",
    "code": "LF-01",
    "doctype": "lettre_fr",
    "category": "FORME",
    "mode": "regex",
    "label": "Dates : mois en minuscules, jour sur deux chiffres",
    "text": "Les noms de mois s'écrivent en minuscules ; le jour sur deux chiffres (« le 04 septembre 2026 »), « 1er » pour le premier du mois.",
    "examples": "✗ le 20 Novembre 2023 → ✓ le 20 novembre 2023",
    "notes": "[03/11/2026] Jour sur deux chiffres et « 1er » retenus (point 6).",
    "id": "LF-01"
  },
  {
    "scope": [
      "tout"
    ],
    "active": true,
    "regex": [
      {
        "find": "\\b[Ll]oi\\s+(?:n°\\s*|no\\s+|numéro\\s+)?(?<n>104-12|20-13)\\b",
        "replace": "loi n° $<n>",
        "flags": "g",
        "label": "loi n°"
      },
      {
        "find": "\\b(?<l>[Ll]oi\\s+n°\\s*)12-104\\b",
        "replace": "loi n° 104-12",
        "flags": "g",
        "label": "104-12"
      },
      {
        "find": "\\b(?<l>[Ll]oi\\s+n°\\s*)13-20\\b",
        "replace": "loi n° 20-13",
        "flags": "g",
        "label": "20-13"
      }
    ],
    "version": "0.1",
    "created": "2026-11-02",
    "code": "LF-02",
    "doctype": "lettre_fr",
    "category": "FOND",
    "mode": "regex",
    "label": "Références légales",
    "text": "« loi n° 104-12 relative à la liberté des prix et de la concurrence, telle que modifiée et complétée », « loi n° 20-13 relative au Conseil de la concurrence », « décret n° 2-14-652 ». « loi » en minuscule, « n° » obligatoire.",
    "examples": "✗ la Loi 104-12 → ✓ la loi n° 104-12",
    "notes": "« telle que modifiée et complétée » laissé au modèle (dépend de la phrase).",
    "id": "LF-02"
  },
  {
    "scope": [
      "tout"
    ],
    "active": true,
    "regex": [
      {
        "find": "\\b[Cc]onseil de la [Cc]oncurrence\\b",
        "replace": "Conseil de la concurrence",
        "flags": "g",
        "label": "Conseil de la concurrence"
      }
    ],
    "version": "0.1",
    "created": "2026-11-02",
    "code": "LF-03",
    "doctype": "lettre_fr",
    "category": "FORME",
    "mode": "regex",
    "label": "Conseil de la concurrence",
    "text": "Toujours « Conseil de la concurrence » : majuscule à Conseil, minuscule à concurrence.",
    "examples": "✗ Conseil de la Concurrence → ✓ Conseil de la concurrence",
    "notes": "",
    "id": "LF-03"
  },
  {
    "scope": [
      "tout"
    ],
    "active": true,
    "regex": [
      {
        "find": "(?<a>[lL])[\\'’]acquisition du (?<c>contrôle (?:exclusif|conjoint))",
        "replace": "$<a>a prise de $<c>",
        "flags": "g",
        "label": "la prise de contrôle"
      },
      {
        "find": "(?<![lLdD][\\'’])\\bacquisition du (?<c>contrôle (?:exclusif|conjoint))",
        "replace": "prise de $<c>",
        "flags": "g",
        "label": "prise de contrôle"
      },
      {
        "find": "\\bAcquisition du (?<c>contrôle (?:exclusif|conjoint))",
        "replace": "Prise de $<c>",
        "flags": "g",
        "label": "Prise de contrôle"
      },
      {
        "find": "\\b(?<p>[Pp])rise du (?<c>contrôle (?:exclusif|conjoint))",
        "replace": "$<p>rise de $<c>",
        "flags": "g",
        "label": "prise de contrôle"
      }
    ],
    "version": "0.1",
    "created": "2026-11-02",
    "code": "LF-04",
    "doctype": "lettre_fr",
    "category": "TERMINOLOGIE",
    "mode": "regex",
    "label": "Prise de contrôle",
    "text": "Terme consacré : « prise de contrôle exclusif / conjoint », jamais « acquisition du contrôle » ni « prise du contrôle ».",
    "examples": "✗ l'acquisition du contrôle exclusif → ✓ la prise de contrôle exclusif",
    "notes": "",
    "id": "LF-04"
  },
  {
    "scope": [
      "tout"
    ],
    "active": true,
    "regex": [
      {
        "find": "\\bA(?<s>\\s+l[\\'’]attention\\b)",
        "replace": "À$<s>",
        "flags": "g",
        "label": "À l'attention"
      },
      {
        "find": "\\(Ci-après",
        "replace": "(ci-après",
        "flags": "g",
        "label": "ci-après"
      }
    ],
    "version": "0.1",
    "created": "2026-11-02",
    "code": "LF-05",
    "doctype": "lettre_fr",
    "category": "FORME",
    "mode": "regex",
    "label": "Typographie : À, ci-après",
    "text": "« À l'attention de » (accent sur la capitale) ; « (ci-après « … ») » en minuscule.",
    "examples": "✗ A l'attention de → ✓ À l'attention de\n✗ (Ci-après « la cible ») → ✓ (ci-après « la cible »)",
    "notes": "",
    "id": "LF-05"
  },
  {
    "scope": [
      "tout"
    ],
    "active": true,
    "regex": null,
    "version": "0.1",
    "created": "2026-11-02",
    "code": "LF-06",
    "doctype": "lettre_fr",
    "category": "FORME",
    "mode": "claude",
    "label": "Appel, objet, référence et clôture",
    "text": "Bloc destinataire : « À l'attention de Maître X », cabinet, « - Ville - » sur des lignes distinctes. « Objet : » obligatoire ; « Référence : » dès qu'il est répondu à un courrier, sans répétition (« … en date du … enregistrée » une seule fois). L'appel (« Maître, », « Madame la Ministre, ») est repris à l'identique dans la clôture : « Veuillez agréer, Maître, l'expression de mes salutations distinguées. ».",
    "examples": "✗ … sous le numéro 0231/2026 en date du 4 septembre 2026 enregistrée. → ✓ … sous le numéro 0231/2026 en date du 4 septembre 2026.",
    "notes": "",
    "id": "LF-06"
  },
  {
    "scope": [
      "tout"
    ],
    "active": true,
    "regex": null,
    "version": "0.1",
    "created": "2026-11-02",
    "code": "LF-07",
    "doctype": "lettre_fr",
    "category": "FOND",
    "mode": "claude",
    "label": "Cohérence interne",
    "text": "Une même appellation tout au long de la lettre (« services d'instruction et d'enquête » : forme unique), dénominations exactes des entités citées, montants et dates cohérents, aucune contradiction (« n'a pas été notifiée … et ce conformément aux dispositions » → « en méconnaissance des dispositions »).",
    "examples": "✗ services d'instruction et d'enquête / … et d'enquêtes → forme unique",
    "notes": "",
    "id": "LF-07"
  },
  {
    "scope": [
      "tout"
    ],
    "active": true,
    "regex": null,
    "version": "0.1",
    "created": "2026-11-03",
    "code": "LG-01",
    "doctype": "lettres",
    "category": "FORME",
    "mode": "claude",
    "label": "Style administratif",
    "text": "Registre administratif soutenu ; phrases courtes ; aucun terme dialectal ; aucune redondance ; un même terme pour une même chose d'un bout à l'autre de la lettre.",
    "examples": "✗ تقديم مفصل للسوقين المذكورتين مرفوق بمعطيات → ✓ … مرفقا بمعطيات",
    "notes": "[03/11/2026] Règle commune ajoutée le 2 novembre.",
    "id": "LG-01"
  },
  {
    "scope": [
      "tout"
    ],
    "active": true,
    "regex": null,
    "version": "0.1",
    "created": "2026-11-03",
    "code": "LG-02",
    "doctype": "lettres",
    "category": "FOND",
    "mode": "claude",
    "label": "Logique et enchaînement",
    "text": "Ordre attendu : contexte (saisine, avis, notification, courrier reçu), fondement juridique, demande, modalités (date, heure, lieu ou visioconférence, délai, adresse électronique), clôture. Chaque paragraphe fait une seule chose ; les connecteurs (في هذا الإطار، تبعا لذلك، وعليه، وفي الختام / dans ce cadre, en conséquence) relient réellement ce qui précède à ce qui suit.",
    "examples": "✗ « كما لذلك، أرجو … » (aucun lien logique) → ✓ « وتبعا لذلك، أرجو … »",
    "notes": "[03/11/2026] Règle commune ajoutée le 2 novembre.",
    "id": "LG-02"
  },
  {
    "scope": [
      "tout"
    ],
    "active": true,
    "regex": null,
    "version": "0.1",
    "created": "2026-11-03",
    "code": "LG-03",
    "doctype": "lettres",
    "category": "FOND",
    "mode": "claude",
    "label": "Références juridiques exactes",
    "text": "Chaque article cité existe et correspond à l'objet : loi 20.13, art. 2 (pouvoir décisionnel et consultatif), art. 3 (saisine), art. 4 (saisine d'office, avis d'initiative), art. 16 (services d'instruction) ; loi 104.12, art. 6 à 8 (pratiques anticoncurrentielles), art. 26 (recevabilité), art. 40 (astreintes), art. 74 (accès aux documents des personnes publiques) ; décret 2.14.652, art. 18 (convocation au moins une semaine avant l'audition) ; règlement intérieur, art. 28 (commission permanente). Signaler un numéro voisin du bon ; ne jamais ajouter d'article absent du modèle.",
    "examples": "✗ « طبقا لأحكام المادتين 2 و6 من القانون رقم 20.13 » dans une convocation → ✓ « المادتين 2 و16 »",
    "notes": "[03/11/2026] Règle commune ajoutée le 2 novembre.",
    "id": "LG-03"
  },
  {
    "scope": [
      "tout"
    ],
    "active": true,
    "regex": null,
    "version": "0.1",
    "created": "2026-11-03",
    "code": "LG-04",
    "doctype": "lettres",
    "category": "TERMINOLOGIE",
    "mode": "claude",
    "label": "Dénominations et qualités",
    "text": "Dénomination exacte des entités et qualité exacte du destinataire, identiques dans l'en-tête, le corps et la clôture. La forme officielle est vérifiée en ligne par une passe séparée : ne corriger ici que les erreurs manifestes dans le texte (article manquant, accord, incohérence entre deux mentions).",
    "examples": "✗ السيد مدير مديرية العامة للضرائب → ✓ السيد المدير العام للضرائب ; ✗ ممثل عن رئيس الهيئة الوطنية → ✓ ممثل عن الهيئة الوطنية",
    "notes": "[03/11/2026] Règle commune ajoutée le 2 novembre.",
    "id": "LG-04"
  },
  {
    "scope": [
      "tout"
    ],
    "active": true,
    "regex": null,
    "version": "0.1",
    "created": "2026-11-03",
    "code": "LG-05",
    "doctype": "lettres",
    "category": "FOND",
    "mode": "claude",
    "label": "Références du courrier",
    "text": "La ligne « المرجع » / « Référence » indique la nature, la date et, s'il existe, le numéro du courrier ; elle n'est jamais répétée ni contradictoire avec le corps. Une lettre répond à un courrier reçu avant elle ; les courriers, décisions et réunions cités sont présentés comme antérieurs. (Les dates elles-mêmes sont contrôlées automatiquement.)",
    "examples": "✗ « Votre lettre enregistrée … en date du 4 septembre 2026 enregistrée. » → ✓ « … en date du 04 septembre 2026. »",
    "notes": "[03/11/2026] Règle commune ajoutée le 2 novembre.",
    "id": "LG-05"
  },
  {
    "scope": [
      "tout"
    ],
    "active": true,
    "regex": null,
    "version": "0.1",
    "created": "2026-11-03",
    "code": "LG-09",
    "doctype": "lettres",
    "category": "FORME",
    "mode": "claude",
    "label": "Formules par destinataire",
    "text": "En-tête, ouverture et clôture correspondent à la catégorie du destinataire : ministre (« الفاضل المحترم / الفاضلة المحترمة » + « السيد وزير / السيدة وزيرة … » ; clôture « وتفضلوا، السيد الوزير المحترم، … ») ; Commissaire du Gouvernement (« السيد مندوب الحكومة لدى مجلس المنافسة » ; « وتفضلوا بقبول … ») ; responsable d'administration ou d'établissement public (« السيد [الصفة] » ; « وتفضلوا، السيد [الصفة]، … ») ; dirigeant d'entreprise (« السيد الرئيس المدير العام / المدير العام / مسير شركة \"X\" » ; « مع أزكى التحيات والسلام. ») ; association (« السيد رئيس … » ; « مع أزكى التحيات والسلام. ») ; personne physique (« السيد [الاسم] » ; « مع أزكى التحيات والسلام. ») ; avocat en français (« À l'attention de Maître X » ; « Maître, » ; « Veuillez agréer, Maître, l'expression de mes salutations distinguées. »). Toutes les lettres arabes ouvrent par « سلام تام بوجود مولانا الإمام، » puis « وبعد، ».",
    "examples": "✗ lettre au directeur général d'une agence publique close par « مع أزكى التحيات والسلام » → ✓ « وتفضلوا، السيد المدير العام، بقبول فائق عبارات التقدير والاحترام والسلام. »",
    "notes": "[03/11/2026] Règle commune ajoutée le 2 novembre.",
    "id": "LG-09"
  }
];
