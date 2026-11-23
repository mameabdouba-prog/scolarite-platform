// Active le mode strict JavaScript pour détecter plus d’erreurs
'use strict';

// Importe une dépendance via require
const AppError = require('../utils/AppError');

// Déclare une fonction
function requireRole(...roles) {
  // Retourne une valeur ou termine la fonction
  return (req, res, next) => {
    // Condition: exécute le bloc si la condition est vraie
    if (!req.session?.user) {
      // Exécute une instruction
      req.flash('error', 'Veuillez vous connecter pour accéder à cette page.');
      // Retourne une valeur ou termine la fonction
      return res.redirect('/login');
    // Ferme un bloc, objet ou appel
    }
    // Condition: exécute le bloc si la condition est vraie
    if (!roles.includes(req.session.user.role)) {
      // Retourne une valeur ou termine la fonction
      return next(new AppError('Vous n’avez pas accès à cet espace.', 403, 'FORBIDDEN'));
    // Ferme un bloc, objet ou appel
    }
    // Retourne une valeur ou termine la fonction
    return next();
  // Ferme un bloc, objet ou appel
  };
// Ferme un bloc, objet ou appel
}

// Exporte des fonctions/objets du module
module.exports = { requireRole };
