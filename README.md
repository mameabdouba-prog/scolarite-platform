# SCOLARITE - Branche Backend

Cette branche contient la partie **backend** du projet SCOLARITE (gestion des inscriptions universitaires - USSEIN).

## Prérequis

- Node.js 20+ (LTS recommandé)
- npm
- MySQL 8+

## Installation

1. Cloner le dépôt et se placer sur la branche backend :
```bash
git clone https://github.com/mameabdouba-prog/scolarite-platform.git
cd scolarite-platform
git checkout backend
```

2. Installer les dépendances :
```bash
cd backend
npm install
```

3. Configurer l'environnement :
```bash
cp .env.example .env
```
Modifier `backend/.env` avec vos paramètres MySQL et un `SESSION_SECRET` fort.

Variables minimales :
```dotenv
NODE_ENV=development
PORT=3000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=scolarite
DB_USER=scolarite_user
DB_PASSWORD=votre_mot_de_passe
SESSION_SECRET=une_chaine_longue_et_aleatoire
```

4. Initialiser la base de données :
```bash
npm run db:init
```

5. (Optionnel) Charger des données de démonstration :
```bash
# Définir SEED_DEMO_PASSWORD dans .env avant
npm run seed
```

6. Créer le premier administrateur :
```bash
npm run create-admin -- --nom Admin --prenom Systeme --email admin@example.com --password "MotDePasseFort123"
```

## Lancement

```bash
npm run dev   # développement
npm start     # production
```

Application: `http://127.0.0.1:3000`

## Tests

```bash
npm test
```
Utilise `.env.test` et la base `scolarite_test` (recréée à chaque exécution).

## Structure

- `app.js` / `server.js` : bootstrap Express
- `config/` : configuration DB, session, upload, rate limit
- `controllers/` : logique HTTP
- `services/` : logique métier
- `models/` : accès MySQL
- `routes/` : routes par rôle
- `middleware/` : auth, rôles, CSRF, validation, erreurs
- `database/schema.sql` : schéma MySQL
- `scripts/` : init DB, seed, création admin
- `tests/` : tests Jest + Supertest

## Notes

- Le frontend EJS/CSS/JS est dans la branche `frontend`. Le backend sert les vues depuis `../frontend/views` et les assets depuis `../frontend/public` en exécution locale complète; pour travailler uniquement backend, assurez-vous d'avoir aussi le dossier frontend au bon emplacement.
- Ne jamais commiter `.env`, secrets, ou `uploads/`.
