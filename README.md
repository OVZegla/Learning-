# Learning+

Plateforme e-learning avec contrôle d'accès par rôle. **Aucune installation requise** : double-cliquez sur le lanceur correspondant à votre OS, le script télécharge tout seul Node.js portable au premier lancement.

## Démarrage rapide

### Windows

Double-cliquez sur **`start.bat`**.

- Au premier lancement : télécharge Node.js portable dans `.bin/` (~30 Mo, internet requis), installe les dépendances, prépare la base SQLite, compile.
- Lancements suivants : démarrage immédiat.
- Le navigateur s'ouvre automatiquement sur http://localhost:3000.

Pour arrêter : fermez les deux fenêtres `Learning+ API` et `Learning+ Frontend`, ou double-cliquez sur `stop.bat`.

### macOS

Double-cliquez sur **`start.command`**.

- Au premier lancement : télécharge Node.js portable (Apple Silicon ou Intel détecté automatiquement) dans `.bin/`.
- macOS Gatekeeper peut bloquer l'exécution la première fois : faites alors **clic droit → Ouvrir** sur `start.command`, puis confirmez.
- Si le script n'est pas exécutable : dans Terminal, lancez `chmod +x start.command` une fois.

Pour arrêter : fermez la fenêtre Terminal ou appuyez sur **Ctrl+C**.

### Comptes de démonstration

| Rôle      | Email                         | Mot de passe   |
|-----------|-------------------------------|----------------|
| Admin     | `admin@learning.local`        | `admin123`     |
| Formateur | `formateur@learning.local`    | `formateur123` |
| Apprenant | `apprenant@learning.local`    | `apprenant123` |

Toutes les données sont stockées dans `backend/data/learning.db` — sauvegardez ce fichier pour conserver vos utilisateurs et formations.

Pour reconstruire après un changement de code : double-cliquez sur `rebuild.bat` (Windows) ou supprimez `backend/dist` et `frontend/.next` puis relancez (Mac), puis relancez le script de démarrage.

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
