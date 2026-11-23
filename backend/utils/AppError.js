// Active le mode strict JavaScript pour détecter plus d’erreurs
'use strict';

// Déclare une classe
class AppError extends Error {
  // Exécute une instruction
  constructor(message, status = 400, code = null) {
    // Exécute une instruction
    super(message);
    // Exécute une instruction
    this.name = 'AppError';
    // Exécute une instruction
    this.status = status;
    // Exécute une instruction
    this.code = code;
  // Ferme un bloc, objet ou appel
  }
// Ferme un bloc, objet ou appel
}

// Exporte des fonctions/objets du module
module.exports = AppError;
