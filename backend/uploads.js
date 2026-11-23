// Active le mode strict JavaScript pour détecter plus d’erreurs
'use strict';

// Importe une dépendance via require
const path = require('node:path');

// Déclare une variable
const MAX_FILE_SIZE = Number(process.env.MAX_FILE_SIZE || 5 * 1024 * 1024);

// Déclare une variable
const MIME_EXTENSIONS = Object.freeze({
  // Exécute une instruction
  'application/pdf': 'pdf',
  // Exécute une instruction
  'image/jpeg': 'jpg',
  // Exécute une instruction
  'image/jpg': 'jpg',
// Ferme un bloc/appel de fonction
});

// Déclare une variable
const DOCUMENT_TYPES = Object.freeze({
  // Exécute une instruction
  CARTE_IDENTITE: 'Carte d’identité',
  // Exécute une instruction
  RELEVE_NOTES: 'Relevé de notes',
  // Exécute une instruction
  PHOTO_IDENTITE: 'Photo d’identité',
  // Exécute une instruction
  RECUE_PAIEMENT: 'Reçu de paiement',
// Ferme un bloc/appel de fonction
});

// Déclare une fonction
function extensionFor(mimeType) {
  // Retourne une valeur ou termine la fonction
  return MIME_EXTENSIONS[String(mimeType || '').toLowerCase()] || null;
// Ferme un bloc, objet ou appel
}

// Déclare une fonction
function validateFileSignature(buffer, mimeType) {
  // Condition: exécute le bloc si la condition est vraie
  if (!Buffer.isBuffer(buffer)) return false;
  // Condition: exécute le bloc si la condition est vraie
  if (mimeType === 'application/pdf') {
    // Retourne une valeur ou termine la fonction
    return buffer.subarray(0, 5).toString('ascii') === '%PDF-';
  // Ferme un bloc, objet ou appel
  }
  // Condition: exécute le bloc si la condition est vraie
  if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') {
    // Retourne une valeur ou termine la fonction
    return buffer.length > 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  // Ferme un bloc, objet ou appel
  }
  // Retourne une valeur ou termine la fonction
  return false;
// Ferme un bloc, objet ou appel
}

// Déclare une fonction
function safeOriginalName(originalName) {
  // Retourne une valeur ou termine la fonction
  return path.basename(String(originalName || 'document')).replace(/[^\w.\- ()À-ÿ]/g, '_').slice(0, 255);
// Ferme un bloc, objet ou appel
}

// Exporte des fonctions/objets du module
module.exports = { MAX_FILE_SIZE, MIME_EXTENSIONS, DOCUMENT_TYPES, extensionFor, validateFileSignature, safeOriginalName };
