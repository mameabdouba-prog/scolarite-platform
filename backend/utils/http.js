// Active le mode strict JavaScript pour détecter plus d’erreurs
'use strict';

// Importe une dépendance via require
const AppError = require('./AppError');

// Déclare une fonction
function wantsJson(req) {
  // Retourne une valeur ou termine la fonction
  return String(req.get('accept') || '').includes('application/json');
// Ferme un bloc, objet ou appel
}

// Déclare une fonction
function respondWithError(req, res, error, fallbackUrl = '/') {
  // Condition: exécute le bloc si la condition est vraie
  if (!(error instanceof AppError)) {
    // Exécute une instruction
    console.error('[ERROR]', req.method, req.path, error.message);
    // Condition: exécute le bloc si la condition est vraie
    if (wantsJson(req)) {
      // Retourne une valeur ou termine la fonction
      return res.status(500).json({ error: 'Une erreur inattendue est survenue.' });
    // Ferme un bloc, objet ou appel
    }
    // Exécute une instruction
    req.flash('error', 'Une erreur inattendue est survenue.');
    // Retourne une valeur ou termine la fonction
    return res.redirect(fallbackUrl);
  // Ferme un bloc, objet ou appel
  }

  // Condition: exécute le bloc si la condition est vraie
  if (wantsJson(req)) {
    // Retourne une valeur ou termine la fonction
    return res.status(error.status).json({ error: error.message, code: error.code });
  // Ferme un bloc, objet ou appel
  }
  // Exécute une instruction
  req.flash('error', error.message);
  // Retourne une valeur ou termine la fonction
  return res.redirect(fallbackUrl);
// Ferme un bloc, objet ou appel
}

// Exporte des fonctions/objets du module
module.exports = { respondWithError };
