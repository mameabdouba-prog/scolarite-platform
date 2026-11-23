// Active le mode strict JavaScript pour détecter plus d’erreurs
'use strict';

// Importe une dépendance via require
const fs = require('node:fs/promises');
// Importe une dépendance via require
const path = require('node:path');
// Importe une dépendance via require
const dotenv = require('dotenv');

// Déclare une variable
const rootDir = path.join(__dirname, '..');

// Exporte des fonctions/objets du module
module.exports = async function globalTeardown() {
  // Exécute une instruction
  dotenv.config({ path: path.join(rootDir, '.env.test'), override: true });
  // Déclare une variable
  const uploadDir = path.resolve(rootDir, process.env.UPLOAD_DIR || 'uploads/test');
  // Attend le résultat d’une opération asynchrone
  await fs.rm(uploadDir, { recursive: true, force: true });
  // Importe une dépendance via require
  const db = require('../config/database');
  // Attend le résultat d’une opération asynchrone
  await db.close().catch(() => {});
// Ferme un bloc, objet ou appel
};
