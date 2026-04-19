# Learning+

Plateforme e-learning avec contrôle d'accès par rôle. Tourne sur Windows en double-clic, stocke ses données dans un fichier SQLite local.

## Démarrage rapide sur Windows

**Prérequis** : Node.js LTS installé ([nodejs.org](https://nodejs.org/)).

1. Double-cliquez sur `start.bat`.
2. Au premier lancement, le script installe les dépendances, prépare la base SQLite et compile le projet (quelques minutes).
3. Votre navigateur s'ouvre automatiquement sur http://localhost:3000.

Comptes de démonstration (créés au premier seed) :

| Rôle       | Email                        | Mot de passe    |
|------------|------------------------------|-----------------|
| Admin      | `admin@learning.local`       | `admin123`      |
| Formateur  | `formateur@learning.local`   | `formateur123`  |
| Apprenant  | `apprenant@learning.local`   | `apprenant123`  |

**Pour arrêter** : fermez les deux fenêtres `Learning+ API` et `Learning+ Frontend`, ou double-cliquez sur `stop.bat`.

**Pour reconstruire après une mise à jour du code** : double-cliquez sur `rebuild.bat`, puis `start.bat`.

Toutes les données sont stockées dans `backend/data/learning.db` — sauvegardez ce fichier pour conserver vos utilisateurs et formations.

## Architecture

- **Frontend** : Next.js 14 (App Router) + Tailwind → http://localhost:3000
- **Backend** : NestJS + Prisma + SQLite → http://localhost:4000/api
- **Auth** : JWT (access token en mémoire + refresh token en cookie httpOnly)
- **Autorisation** : deux couches — rôle (`ADMIN` / `FORMATEUR` / `APPRENANT`) et enrollment (l'apprenant ne voit que les formations auxquelles il a été rattaché).

## Modèle de données

- `User` → rôle unique
- `Group` → cohorte facultative (entreprise, classe)
- `Course` → `Module` → `Lesson` (types : VIDEO, TEXT, PDF, IMAGE, QUIZ)
- `Enrollment` → accorde l'accès à un utilisateur **ou** à un groupe, avec expiration facultative
- `Progress`, `Quiz`, `Question`, `QuizAttempt`, `Certificate` — modèles en place, logique métier à compléter.

Schéma complet : `backend/prisma/schema.prisma`.

## Personnaliser le logo

Le logo est chargé depuis `frontend/public/logo.svg` par le composant `frontend/src/components/Logo.tsx`. Remplacez le fichier (SVG, PNG, WebP…) ; si vous changez l'extension, mettez à jour la ligne `src="/logo.svg"` dans `Logo.tsx`.

## Développement

Pour un mode développement avec hot-reload au lieu du mode compilé :

```bat
cd backend && npm run start:dev
cd frontend && npm run dev
```

## Générer un vrai `.exe` autonome (optionnel)

`start.bat` est volontairement simple et suffit pour distribuer le projet. Si vous voulez vraiment un binaire unique packagé, la route recommandée est [`@yao-pkg/pkg`](https://github.com/yao-pkg/pkg) côté backend + Next.js en mode `output: 'standalone'` embarqué. Cela nécessite :

1. D'exécuter le packaging **sur Windows** (pour produire un binaire Windows).
2. De copier manuellement les moteurs natifs de Prisma (`query-engine-windows.exe`) dans le bundle.

Le `start.bat` actuel atteint l'objectif « double-clic et ça tourne » sans cette complexité supplémentaire.

## Implémenté

- Auth (register / login / refresh / logout / me)
- Rôles ADMIN / FORMATEUR / APPRENANT
- CRUD formations / modules / leçons (formateur et admin)
- Gestion des accès (admin) par utilisateur ou par groupe, avec expiration
- Dashboard apprenant : uniquement les formations auxquelles il a accès
- Lecteur de leçon (vidéo, texte, PDF, image)

## Stubs (schéma prêt, UI/logique à compléter)

- Quiz (correction automatique)
- Suivi de progression automatique
- Certificats PDF
- Notifications email / in-app
- Paiement, multi-organisation, streaming vidéo signé
- Recommandations, badges, leaderboard
