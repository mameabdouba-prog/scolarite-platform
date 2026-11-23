// Active le mode strict JavaScript pour détecter plus d’erreurs
'use strict';

// Importe une dépendance via require
const { currentAcademicYear } = require('./helpers');

// Déclare une fonction
function renderPage(res, view, locals = {}) {
  // Déclare une variable
  const req = res.req;
  // Retourne une valeur ou termine la fonction
  return res.render(view, {
    // Exécute une instruction
    user: req.session?.user || null,
    // Exécute une instruction
    csrfToken: typeof req.csrfToken === 'function' ? req.csrfToken() : '',
    // Exécute une instruction
    flash: {
      // Exécute une instruction
      success: req.flash?.('success') || [],
      // Exécute une instruction
      error: req.flash?.('error') || [],
      // Exécute une instruction
      info: req.flash?.('info') || [],
    // Ferme un bloc ou objet
    },
    // Exécute une instruction
    currentYear: currentAcademicYear(),
    // Exécute une instruction
    etatLabels: {
      // Exécute une instruction
      EN_ATTENTE: 'En attente',
      // Exécute une instruction
      VALIDE: 'Validé',
      // Exécute une instruction
      REJETE: 'Rejeté',
      // Exécute une instruction
      SANS_DOSSIER: 'Aucun dossier',
    // Ferme un bloc ou objet
    },
    // Exécute une instruction
    ...locals,
  // Ferme un bloc/appel de fonction
  });
// Ferme un bloc, objet ou appel
}

// Exporte des fonctions/objets du module
module.exports = { renderPage };
