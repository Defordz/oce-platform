# Plateforme de Correction OCE
## Conseil de la Concurrence du Maroc

---

## 🚀 Déploiement sur Vercel (sans terminal, drag & drop)

### Étape 1 — Télécharger Node.js (nécessaire pour le build)

1. Aller sur https://nodejs.org
2. Télécharger la version **LTS** (bouton vert à gauche)
3. Installer en suivant les étapes (tout par défaut)
4. Redémarrer l'ordinateur

### Étape 2 — Préparer le projet

1. Dézipper le fichier `oce-platform.zip` sur votre bureau
2. Ouvrir le dossier `oce-platform`
3. Dans la barre d'adresse de l'explorateur, taper `cmd` et appuyer sur Entrée
4. Dans la fenêtre noire (terminal), taper :
   ```
   npm install
   npm run build
   ```
5. Un dossier `dist` apparaît dans `oce-platform` — c'est le site compilé

### Étape 3 — Créer un compte Vercel

1. Aller sur https://vercel.com
2. Cliquer **Sign Up** → **Continue with GitHub** (ou avec email)
3. Valider l'email si demandé

### Étape 4 — Déployer par drag & drop

1. Sur le tableau de bord Vercel, cliquer **Add New → Project**
2. En bas de page : **"Import Third-Party Git Repository"** → ou utiliser
   l'onglet **"Deploy from your computer"** si disponible
3. **Alternative recommandée** : aller sur https://vercel.com/new
4. Glisser-déposer le dossier **`oce-platform`** entier dans la zone de dépôt

   > ⚠️ Si Vercel ne détecte pas le framework automatiquement :
   > - Framework Preset : **Vite**
   > - Build Command : `npm run build`
   > - Output Directory : `dist`

5. Cliquer **Deploy** — attendre ~2 minutes

### Étape 5 — Ajouter la clé API (OBLIGATOIRE)

Sans cette étape, l'analyse Claude ne fonctionnera pas.

1. Dans le projet Vercel, aller dans **Settings → Environment Variables**
2. Cliquer **Add New**
3. Remplir :
   - **Name** : `ANTHROPIC_API_KEY`
   - **Value** : votre clé API (commence par `sk-ant-...`)
   - **Environment** : cocher `Production`, `Preview`, `Development`
4. Cliquer **Save**
5. Aller dans **Deployments** → cliquer les `...` du dernier déploiement → **Redeploy**

### Étape 6 — Accéder à la plateforme

Votre URL : `https://oce-platform-XXXX.vercel.app`

---

## 🔑 Obtenir une clé API Anthropic

1. Aller sur https://console.anthropic.com
2. Créer un compte (email professionnel)
3. **API Keys** → **Create Key**
4. Copier la clé (elle ne s'affiche qu'une fois)
5. Facturation : ~0.003$ par analyse (moins de 1 MAD)

---

## 📁 Structure du projet

```
oce-platform/
├── api/
│   ├── analyze.js      ← Appel Claude (serverless Vercel)
│   └── export.js       ← Génération Word (serverless Vercel)
├── src/
│   ├── main.jsx        ← Point d'entrée React
│   └── App.jsx         ← Application complète
├── index.html          ← Page HTML
├── package.json        ← Dépendances
├── vite.config.js      ← Configuration build
├── vercel.json         ← Configuration Vercel
└── README.md           ← Ce fichier
```

---

## 🔧 Mise à jour des consignes

Les consignes sont modifiables directement dans l'interface :
**Menu → Fiches de consignes → Sélectionner → Modifier → Enregistrer**

Pour une mise à jour permanente (persistance entre sessions), il faudra
ultérieurement connecter une base de données (Vercel KV ou Supabase).

---

## 📞 Support

En cas de problème de déploiement, contacter le responsable technique
ou ouvrir un ticket sur le tableau de bord Vercel.
