// Active le mode strict JavaScript pour détecter plus d’erreurs
'use strict';

// Importe une dépendance via require
const storage = require('./storageService');
// Importe une dépendance via require
const { generateAttestation } = require('./pdfService');

// Déclare une variable
const CONTENT_TYPES = Object.freeze({
  // Exécute une instruction
  pdf: 'application/pdf',
  // Exécute une instruction
  jpg: 'image/jpeg',
  // Exécute une instruction
  jpeg: 'image/jpeg',
// Ferme un bloc/appel de fonction
});

// Déclare une fonction
function contentTypeForKey(key) {
  // Déclare une variable
  const extension = String(key).split('.').pop().toLowerCase();
  // Retourne une valeur ou termine la fonction
  return CONTENT_TYPES[extension] || 'application/octet-stream';
// Ferme un bloc, objet ou appel
}

// Déclare une fonction
async function sendPiece(res, piece) {
  // Déclare une variable
  const signedUrl = await storage.getUrl(piece.nom_stockage);
  // Condition: exécute le bloc si la condition est vraie
  if (signedUrl) return res.redirect(signedUrl);

  // Déclare une variable
  const buffer = await storage.read(piece.nom_stockage);
  // Exécute une instruction
  res.type(contentTypeForKey(piece.nom_stockage));
  // Exécute une instruction
  res.attachment(piece.nom_original || 'piece-justificative');
  // Retourne une valeur ou termine la fonction
  return res.send(buffer);
// Ferme un bloc, objet ou appel
}

// Déclare une fonction
async function sendAttestation(res, dossier) {
  // Déclare une variable
  const buffer = await generateAttestation(dossier);
  // Exécute une instruction
  res.type('application/pdf');
  // Exécute une instruction
  res.setHeader(
    // Exécute une instruction
    'Content-Disposition',
    // Exécute une instruction
    `attachment; filename="attestation-${dossier.reference_dossier}.pdf"`,
  // Ferme un bloc, objet ou appel
  );
  // Retourne une valeur ou termine la fonction
  return res.send(buffer);
// Ferme un bloc, objet ou appel
}

// Exporte des fonctions/objets du module
module.exports = { sendPiece, sendAttestation };
