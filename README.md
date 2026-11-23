# SCOLARITE - Branche Frontend

Cette branche contient la partie **frontend** du projet SCOLARITE (vues EJS, CSS, JS, assets).

## Contenu

- `views/` : templates EJS (auth, étudiant, agent, admin, erreurs, partials)
- `public/` : CSS, JS natif, images, polices, icônes Phosphor

## Utilisation avec le backend

Le frontend est servi par le backend Express. Pour exécuter l'application complète :

1. Cloner le dépôt et récupérer les deux branches/dossiers nécessaires :
```bash
git clone https://github.com/mameabdouba-prog/scolarite-platform.git
cd scolarite-platform
```

2. Option A - exécution locale complète (recommandée) :
```bash
# récupérer backend aussi
git fetch origin backend frontend
git checkout main
# ou travailler dans deux worktrees/dossiers
```

La structure attendue par le backend :
```text
Scolarite/
  backend/    # code Express/API
  frontend/   # vues et assets
```

3. Installer et lancer le backend :
```bash
cd backend
npm install
cp .env.example .env
# configurer .env et MySQL
npm run db:init
npm run dev
```

4. Ouvrir `http://127.0.0.1:3000`.

## Développement frontend

- Modifier les vues dans `frontend/views/`
- Modifier les styles dans `frontend/public/css/style.css`
- Modifier le JS client dans `frontend/public/js/app.js`
- Le backend recharge les vues EJS; pour CSS/JS, rafraîchir le navigateur.

## Convention

- Garder les classes/CSS cohérents avec la charte existante.
- Ne pas mettre de secrets dans le frontend.
- Les logos/images sont dans `frontend/public/images/`.
