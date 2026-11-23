// Active le mode strict JavaScript pour détecter plus d’erreurs
'use strict';

// Déclare une variable
const FILIERES = Object.freeze([
  // Exécute une instruction
  'Informatique',
  // Exécute une instruction
  'Gestion',
  // Exécute une instruction
  'Droit',
  // Exécute une instruction
  'Lettres et Sciences Humaines',
  // Exécute une instruction
  'Sciences Economiques',
  // Exécute une instruction
  'Communication',
// Exécute une instruction
]);

// Déclare une variable
const NIVEAUX = Object.freeze(['L1', 'L2', 'L3', 'M1', 'M2']);

// Déclare une variable
const ETATS = Object.freeze(['EN_ATTENTE', 'VALIDE', 'REJETE']);

// Déclare une fonction
function isValidAcademicYear(value) {
  // Déclare une variable
  const match = /^(\d{4})-(\d{4})$/.exec(String(value || ''));
  // Retourne une valeur ou termine la fonction
  return Boolean(match && Number(match[2]) === Number(match[1]) + 1);
// Ferme un bloc, objet ou appel
}

// Exporte des fonctions/objets du module
module.exports = { FILIERES, NIVEAUX, ETATS, isValidAcademicYear };
