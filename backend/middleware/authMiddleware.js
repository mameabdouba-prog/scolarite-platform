// Active le mode strict JavaScript pour détecter plus d’erreurs
'use strict';

// Déclare une fonction
function requireAuth(req, res, next) {
  // Condition: exécute le bloc si la condition est vraie
  if (!req.session?.user) {
    // Exécute une instruction
    req.flash('error', 'Veuillez vous connecter pour accéder à cette page.');
    // Retourne une valeur ou termine la fonction
    return res.redirect('/login');
  // Ferme un bloc, objet ou appel
  }
  // Retourne une valeur ou termine la fonction
  return next();
// Ferme un bloc, objet ou appel
}

// Déclare une fonction
function redirectIfAuthenticated(req, res, next) {
  // Condition: exécute le bloc si la condition est vraie
  if (req.session?.user) return res.redirect('/dashboard');
  // Retourne une valeur ou termine la fonction
  return next();
// Ferme un bloc, objet ou appel
}

// Exporte des fonctions/objets du module
module.exports = { requireAuth, redirectIfAuthenticated };
