// Active le mode strict JavaScript pour détecter plus d’erreurs
'use strict';

// Importe une dépendance via require
const AppError = require('../utils/AppError');
// Importe une dépendance via require
const { renderPage } = require('../utils/render');

// Déclare une fonction
function wantsJson(req) {
  // Retourne une valeur ou termine la fonction
  return req.path.startsWith('/api/')
    // Exécute une instruction
    || String(req.get('accept') || '').includes('application/json')
    // Exécute une instruction
    || Boolean(req.xhr);
// Ferme un bloc, objet ou appel
}

// Déclare une fonction
function notFoundHandler(req, res) {
  // Condition: exécute le bloc si la condition est vraie
  if (wantsJson(req)) {
    // Retourne une valeur ou termine la fonction
    return res.status(404).json({ error: 'Ressource introuvable.' });
  // Ferme un bloc, objet ou appel
  }
  // Retourne une valeur ou termine la fonction
  return res.status(404).render('errors/404', {
    // Exécute une instruction
    user: req.session?.user || null,
    // Exécute une instruction
    csrfToken: res.locals.csrfToken || '',
    // Exécute une instruction
    flash: { success: [], error: [], info: [] },
    // Exécute une instruction
    title: 'Page introuvable',
  // Ferme un bloc/appel de fonction
  });
// Ferme un bloc, objet ou appel
}

// Commentaire: ligne de commentaire existante
// eslint-disable-next-line no-unused-vars
// Déclare une fonction
function errorHandler(error, req, res, next) {
  // Déclare une variable
  let status = error.status || error.statusCode || 500;
  // Déclare une variable
  let message = 'Une erreur inattendue est survenue. Veuillez réessayer.';

  // Condition: exécute le bloc si la condition est vraie
  if (error instanceof AppError) {
    // Assigne ou met à jour une valeur
    message = error.message;
  // Ferme un bloc ou objet
  } else if (status >= 400 && status < 500 && error.message && !error.code?.startsWith('ER_')) {
    // Assigne ou met à jour une valeur
    message = error.message;
  // Ferme un bloc ou objet
  } else if (status === 403) {
    // Assigne ou met à jour une valeur
    message = 'Vous n’avez pas accès à cette ressource.';
  // Ferme un bloc, objet ou appel
  }

  // Condition: exécute le bloc si la condition est vraie
  if (error.code === 'ER_DUP_ENTRY') {
    // Assigne ou met à jour une valeur
    status = 409;
    // Assigne ou met à jour une valeur
    message = 'Cette valeur est déjà utilisée.';
  // Ferme un bloc, objet ou appel
  }

  // Condition: exécute le bloc si la condition est vraie
  if (status >= 500) {
    // Exécute une instruction
    console.error('[ERROR]', req.method, req.path, error.message);
  // Ferme un bloc, objet ou appel
  }

  // Condition: exécute le bloc si la condition est vraie
  if (wantsJson(req)) {
    // Retourne une valeur ou termine la fonction
    return res.status(status).json({ error: message });
  // Ferme un bloc, objet ou appel
  }

  // Déclare une variable
  const view = status === 403 ? 'errors/403' : status === 404 ? 'errors/404' : 'errors/500';
  // Retourne une valeur ou termine la fonction
  return res.status(status).render(view, {
    // Exécute une instruction
    user: req.session?.user || null,
    // Exécute une instruction
    csrfToken: res.locals.csrfToken || '',
    // Exécute une instruction
    flash: { success: [], error: [], info: [] },
    // Exécute une instruction
    title: status === 403 ? 'Accès refusé' : 'Erreur serveur',
    // Exécute une instruction
    message,
  // Ferme un bloc/appel de fonction
  });
// Ferme un bloc, objet ou appel
}

// Exporte des fonctions/objets du module
module.exports = { notFoundHandler, errorHandler };
