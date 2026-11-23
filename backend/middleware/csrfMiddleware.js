// Active le mode strict JavaScript pour détecter plus d’erreurs
'use strict';

// Importe une dépendance via require
const crypto = require('node:crypto');
// Importe une dépendance via require
const AppError = require('../utils/AppError');

// Déclare une variable
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

// Déclare une fonction
function csrfProtection(req, res, next) {
  // Condition: exécute le bloc si la condition est vraie
  if (!req.session) return next(new Error('Session indisponible.'));

  // Condition: exécute le bloc si la condition est vraie
  if (!req.session.csrfToken) {
    // Exécute une instruction
    req.session.csrfToken = crypto.randomBytes(32).toString('hex');
  // Ferme un bloc, objet ou appel
  }
  // Déclare une variable
  const token = req.session.csrfToken;
  // Exécute une instruction
  req.csrfToken = () => token;
  // Exécute une instruction
  res.locals.csrfToken = token;

  // Condition: exécute le bloc si la condition est vraie
  if (SAFE_METHODS.has(req.method)) return next();

  // Déclare une variable
  const provided = req.body?._csrf || req.headers['x-csrf-token'] || req.query?._csrf;
  // Condition: exécute le bloc si la condition est vraie
  if (typeof provided !== 'string' || provided.length !== token.length) {
    // Retourne une valeur ou termine la fonction
    return next(new AppError('Jeton de sécurité invalide ou expiré.', 403, 'CSRF_INVALID'));
  // Ferme un bloc, objet ou appel
  }
  // Déclare une variable
  const valid = crypto.timingSafeEqual(Buffer.from(provided), Buffer.from(token));
  // Condition: exécute le bloc si la condition est vraie
  if (!valid) {
    // Retourne une valeur ou termine la fonction
    return next(new AppError('Jeton de sécurité invalide ou expiré.', 403, 'CSRF_INVALID'));
  // Ferme un bloc, objet ou appel
  }
  // Retourne une valeur ou termine la fonction
  return next();
// Ferme un bloc, objet ou appel
}

// Exporte des fonctions/objets du module
module.exports = { csrfProtection };
