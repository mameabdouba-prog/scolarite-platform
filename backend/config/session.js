// Active le mode strict JavaScript pour détecter plus d’erreurs
'use strict';

// Importe une dépendance via require
const crypto = require('node:crypto');
// Importe une dépendance via require
const session = require('express-session');

// Déclare une fonction
function resolveSecret() {
  // Condition: exécute le bloc si la condition est vraie
  if (process.env.SESSION_SECRET) return process.env.SESSION_SECRET;
  // Condition: exécute le bloc si la condition est vraie
  if (process.env.NODE_ENV === 'production') {
    // Lève une erreur/exception
    throw new Error('SESSION_SECRET doit être défini en production.');
  // Ferme un bloc, objet ou appel
  }
  // Déclare une variable
  const ephemeral = crypto.randomBytes(32).toString('hex');
  // Exécute une instruction
  console.warn('SESSION_SECRET absent : secret éphémère généré (développement uniquement).');
  // Retourne une valeur ou termine la fonction
  return ephemeral;
// Ferme un bloc, objet ou appel
}

// Déclare une fonction
function isSecureCookie() {
  // Retourne une valeur ou termine la fonction
  return String(process.env.COOKIE_SECURE || 'false') === 'true'
    // Exécute une instruction
    || process.env.NODE_ENV === 'production';
// Ferme un bloc, objet ou appel
}

// Déclare une variable
const storeType = process.env.SESSION_STORE || 'memory';
// Condition: exécute le bloc si la condition est vraie
if (!['memory', 'redis'].includes(storeType)) {
  // Lève une erreur/exception
  throw new Error(`SESSION_STORE inconnu : ${storeType}`);
// Ferme un bloc, objet ou appel
}
// Condition: exécute le bloc si la condition est vraie
if (storeType === 'redis' && !process.env.REDIS_URL) {
  // Lève une erreur/exception
  throw new Error('REDIS_URL doit être défini lorsque SESSION_STORE=redis.');
// Ferme un bloc, objet ou appel
}

// Déclare une variable
const sessionMiddleware = session({
  // Exécute une instruction
  name: 'scolarite.sid',
  // Exécute une instruction
  secret: resolveSecret(),
  // Exécute une instruction
  resave: false,
  // Exécute une instruction
  saveUninitialized: false,
  // Exécute une instruction
  rolling: false,
  // Exécute une instruction
  cookie: {
    // Exécute une instruction
    httpOnly: true,
    // Exécute une instruction
    secure: isSecureCookie(),
    // Exécute une instruction
    sameSite: 'lax',
    // Exécute une instruction
    maxAge: Number(process.env.SESSION_MAX_AGE || 12 * 60 * 60 * 1000),
  // Ferme un bloc ou objet
  },
// Ferme un bloc/appel de fonction
});

// Exporte des fonctions/objets du module
module.exports = { sessionMiddleware, storeType };
