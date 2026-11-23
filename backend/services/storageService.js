// Active le mode strict JavaScript pour détecter plus d’erreurs
'use strict';

// Importe une dépendance via require
const LocalStorageService = require('./localStorageService');
// Importe une dépendance via require
const S3StorageService = require('./s3StorageService');

// Déclare une variable
const driver = String(process.env.STORAGE_DRIVER || 'local').toLowerCase();

// Déclare une variable
let storage;
// Condition: exécute le bloc si la condition est vraie
if (driver === 'local') {
  // Assigne ou met à jour une valeur
  storage = new LocalStorageService();
// Ferme un bloc ou objet
} else if (driver === 's3') {
  // Assigne ou met à jour une valeur
  storage = new S3StorageService();
// Ferme un bloc ou objet
} else {
  // Lève une erreur/exception
  throw new Error(`STORAGE_DRIVER inconnu : ${driver} (utilisez local ou s3)`);
// Ferme un bloc, objet ou appel
}

// Exporte des fonctions/objets du module
module.exports = storage;
