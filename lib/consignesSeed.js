// lib/consignesSeed.js
// Donnees initiales : versees automatiquement dans le store au premier demarrage.
// Copie de reference des consignes en service (export du 21/10/2026, 46 consignes),
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
    "version": "1.1",
    "created": "2026-04-27",
    "code": "D-01",
    "doctype": "cp_fr",
    "category": "FOND",
    "mode": "claude",
    "label": "Nature - contrôle exclusif",
    "text": "Pour contrôle exclusif : dans le tableau « Prise de contrôle exclusif » ; dans le titre et le résumé « prise de contrôle exclusif par [acquéreur] de [cible] ». Toujours « de contrôle », jamais « du contrôle ».",
    "examples": "✗ Prise du contrôle exclusif → ✓ Prise de contrôle exclusif\n✗ Acquisition du contrôle exclusif → ✓ Prise de contrôle exclusif (terme consacré)\n✗ la prise de le contrôle → ✓ la prise de contrôle",
    "notes": "Art. 11 loi n°104-12 - formule consacrée dans tous CP 2025. Regex de sécurité pour 'de le' et 'de contrôle exclusif/conjoint' ; le reste relève du jugement.\n[21/10/2026] Règle inversée à la demande du rapporteur : « prise de contrôle », jamais « prise du contrôle ».",
    "id": "D-01"
  },
  {
    "scope": [
      "tout"
    ],
    "active": true,
    "regex": null,
    "version": "1.1",
    "created": "2026-04-27",
    "code": "D-02",
    "doctype": "cp_fr",
    "category": "FOND",
    "mode": "claude",
    "label": "Nature - contrôle conjoint / JV",
    "text": "Pour contrôle conjoint : « Prise de contrôle conjoint » dans le tableau. Pour JV : « Création d'entreprise commune » (sans article). Dans le résumé : « prise de contrôle conjoint par [acquéreur] de [cible] aux côtés de [associé] ». Toujours « de contrôle », jamais « du contrôle ».",
    "examples": "✗ Prise du contrôle conjoint → ✓ Prise de contrôle conjoint\n✗ Création de l'entreprise commune → ✓ Création d'entreprise commune",
    "notes": "Art. 11 loi n°104-12\n[21/10/2026] « prise de contrôle conjoint », jamais « prise du contrôle ».",
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
    "version": "1.1",
    "created": "2026-04-27",
    "code": "D-06",
    "doctype": "cp_fr",
    "category": "FOND",
    "mode": "claude",
    "label": "Délai d'observations des tiers",
    "text": "Formule obligatoire : « Délai dans lequel les tiers intéressés sont invités à faire connaître leurs observations : 10 jours à partir de la date de publication du présent communiqué, soit le [date limite]. » La date limite correspond à J+10 à compter de la date de publication ; si elle tombe un samedi ou un dimanche, elle est reportée au lundi suivant. Le communiqué étant publié le jeudi, la date limite est le lundi qui suit (exemple : publication le jeudi 1er octobre 2026, date limite le lundi 12 octobre 2026).",
    "examples": "✗ Délai d'observations : 10 jours → ✓ Délai dans lequel les tiers intéressés sont invités à faire connaître leurs observations\n✗ les tiers intéressées → ✓ les tiers intéressés (accord masculin)\n✗ publication jeudi 1er octobre 2026, soit le 11 octobre 2026 (dimanche) → ✓ soit le 12 octobre 2026 (lundi)",
    "notes": "Art. 13 loi n°104-12. Regex pour l'accord ; le tiret et la date J+10 relèvent du jugement.\n[21/10/2026] Règle du report au lundi ajoutée (publication le jeudi, date limite le lundi suivant).",
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
    "regex": null,
    "version": "1.0",
    "created": "2026-04-27",
    "code": "A-04",
    "doctype": "cp_ar",
    "category": "FOND",
    "mode": "claude",
    "label": "طبيعة العملية - مراقبة حصرية",
    "text": "الصياغة المعيارية في الجدول : « تولي المراقبة الحصرية ». في الملخص : « تولي [الجهة المقتنية] المراقبة الحصرية على [الجهة المستهدفة] عبر اقتناء [النسبة]% من رأسمالها وحقوق التصويت المرتبطة به ».",
    "examples": "✗ الاستحواذ الحصري → ✓ تولي المراقبة الحصرية\n✗ السيطرة المطلقة → ✓ المراقبة الحصرية",
    "notes": "المادة 11 من القانون 104.12 - المصطلح المعتمد",
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
    "version": "1.1",
    "created": "2026-04-27",
    "code": "A-06",
    "doctype": "cp_ar",
    "category": "FOND",
    "mode": "claude",
    "label": "الأجل والتاريخ",
    "text": "الصيغة المعيارية : « الأجل المحدد للأغيار المعنيين من أجل إبداء ملاحظاتهم : 10 أيام ابتداء من تاريخ نشر هذا البلاغ، وينتهي هذا الأجل يوم [التاريخ]. » Règle de calcul : J+10 à compter de la date de publication, reporté au lundi suivant si la date tombe un samedi ou un dimanche. Publication le jeudi, fin du délai le lundi qui suit (exemple : نشر يوم الخميس فاتح أكتوبر 2026، ينتهي الأجل يوم الاثنين 12 أكتوبر 2026).",
    "examples": "✗ الأطراف الثالثة → ✓ الأغيار المعنيون (المصطلح المعتمد)\n✗ مدة الاعتراض → ✓ الأجل المحدد للأغيار المعنيين",
    "notes": "المادة 13 من القانون 104.12\n[21/10/2026] Règle du report au lundi ajoutée.",
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
        "find": "(?<!\\.)[ \\u00a0\\u202f\\u2009]+([.،؛])",
        "replace": "$1",
        "flags": "g",
        "label": "espace avant ponctuation supprimée"
      },
      {
        "find": "\\.،",
        "replace": "،",
        "flags": "g",
        "label": "point collé à virgule arabe → virgule"
      }
    ],
    "version": "1.0",
    "created": "2026-07-15",
    "code": "A-13",
    "doctype": "cp_ar",
    "category": "FORME",
    "mode": "regex",
    "label": "Typographie : espaces et points (arabe)",
    "text": "Nettoyage typographique déterministe : supprime l'espace placée avant un point, une virgule arabe « ، » ou un point-virgule « ؛ » ; réduit un point doublé « . . » à un seul point.",
    "examples": "✗ ...JV\" . → ✓ ...JV\".\n✗ رقم 0-1041090 ، → ✓ رقم 0-1041090،\n✗ Autriche. . → ✓ Autriche.",
    "notes": "N'affecte pas « P.O. » ni les virgules d'adresse (espace APRÈS, jamais avant). Le point doublé n'est traité que séparé par une espace, l'ellipse « ... » n'est pas touchée.",
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
        "find": "(?<!\\.)[ \\u00a0\\u202f\\u2009]+([.،؛])",
        "replace": "$1",
        "flags": "g",
        "label": "espace avant ponctuation supprimée"
      },
      {
        "find": "\\.،",
        "replace": "،",
        "flags": "g",
        "label": "point collé à virgule arabe → virgule"
      }
    ],
    "version": "1.0",
    "created": "2026-07-15",
    "code": "DEC-F-04",
    "doctype": "decision_ar",
    "category": "FORME",
    "mode": "regex",
    "label": "Typographie : espaces et points (arabe)",
    "text": "Nettoyage typographique déterministe : supprime l'espace placée avant un point, une virgule arabe « ، » ou un point-virgule « ؛ » ; réduit un point doublé « . . » à un seul point.",
    "examples": "✗ ...JV\" . → ✓ ...JV\".\n✗ رقم 0-1041090 ، → ✓ رقم 0-1041090،\n✗ Autriche. . → ✓ Autriche.",
    "notes": "N'affecte pas « P.O. » ni les virgules d'adresse (espace APRÈS, jamais avant). Le point doublé n'est traité que séparé par une espace, l'ellipse « ... » n'est pas touchée.",
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
  }
];
