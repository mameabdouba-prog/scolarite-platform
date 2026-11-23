// Active le mode strict JavaScript pour détecter plus d’erreurs
'use strict';

// Importe une dépendance via require
const path = require('node:path');
// Importe une dépendance via require
const multer = require('multer');
// Importe une dépendance via require
const AppError = require('../utils/AppError');
// Importe une dépendance via require
const { MAX_FILE_SIZE, extensionFor } = require('../config/uploads');

// Déclare une variable
const upload = multer({
  // Exécute une instruction
  storage: multer.memoryStorage(),
  // Exécute une instruction
  limits: { fileSize: MAX_FILE_SIZE, files: 1 },
  // Exécute une instruction
  fileFilter(req, file, callback) {
    // Déclare une variable
    const expectedExtension = extensionFor(file.mimetype);
    // Déclare une variable
    const actualExtension = path.extname(String(file.originalname || '')).toLowerCase();
    // Condition: exécute le bloc si la condition est vraie
    if (!expectedExtension || actualExtension !== `.${expectedExtension}`) {
      // Retourne une valeur ou termine la fonction
      return callback(new AppError('Seuls les fichiers PDF et JPG/JPEG sont acceptés.', 400, 'INVALID_FILE'));
    // Ferme un bloc, objet ou appel
    }
    // Retourne une valeur ou termine la fonction
    return callback(null, true);
  // Ferme un bloc ou objet
  },
// Ferme un bloc/appel de fonction
});

// Déclare une fonction
function uploadPiece(req, res, next) {
  // Exécute une instruction
  upload.single('piece')(req, res, (error) => {
    // Condition: exécute le bloc si la condition est vraie
    if (!error) return next();
    // Condition: exécute le bloc si la condition est vraie
    if (error.code === 'LIMIT_FILE_SIZE') {
      // Retourne une valeur ou termine la fonction
      return next(new AppError('La taille maximale d’un fichier est de 5 Mo.', 400, 'FILE_TOO_LARGE'));
    // Ferme un bloc, objet ou appel
    }
    // Retourne une valeur ou termine la fonction
    return next(error);
  // Ferme un bloc/appel de fonction
  });
// Ferme un bloc, objet ou appel
}

// Exporte des fonctions/objets du module
module.exports = { uploadPiece };
