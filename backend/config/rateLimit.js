// Active le mode strict JavaScript pour détecter plus d’erreurs
'use strict';

// Importe une dépendance via require
const rateLimit = require('express-rate-limit');

// Déclare une variable
const loginLimiter = rateLimit({
  // Exécute une instruction
  windowMs: 15 * 60 * 1000,
  // Exécute une instruction
  max: Number(process.env.LOGIN_RATE_LIMIT || 10),
  // Exécute une instruction
  standardHeaders: 'draft-7',
  // Exécute une instruction
  legacyHeaders: false,
  // Exécute une instruction
  skipSuccessfulRequests: true,
  // Exécute une instruction
  message: 'Tentatives de connexion trop nombreuses. Veuillez réessayer dans 15 minutes.',
// Ferme un bloc/appel de fonction
});

// Exporte des fonctions/objets du module
module.exports = { loginLimiter };
