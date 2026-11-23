// Active le mode strict JavaScript pour détecter plus d’erreurs
'use strict';

// Importe une dépendance via require
const fs = require('node:fs/promises');
// Importe une dépendance via require
const path = require('node:path');
// Importe une dépendance via require
const crypto = require('node:crypto');
// Importe une dépendance via require
const { extensionFor, validateFileSignature, safeOriginalName } = require('../config/uploads');
// Importe une dépendance via require
const AppError = require('../utils/AppError');

// Déclare une classe
class LocalStorageService {
  // Exécute une instruction
  constructor() {
    // Exécute une instruction
    this.baseDir = path.resolve(process.cwd(), process.env.UPLOAD_DIR || 'uploads');
  // Ferme un bloc, objet ou appel
  }

  // Exécute une instruction
  resolveKey(key) {
    // Déclare une variable
    const normalized = path.normalize(String(key || ''));
    // Condition: exécute le bloc si la condition est vraie
    if (!normalized || normalized.includes('..') || path.isAbsolute(normalized)) {
      // Lève une erreur/exception
      throw new Error('Clé de fichier invalide.');
    // Ferme un bloc, objet ou appel
    }
    // Retourne une valeur ou termine la fonction
    return path.join(this.baseDir, normalized);
  // Ferme un bloc, objet ou appel
  }

  // Exécute une instruction
  async save(file) {
    // Déclare une variable
    const extension = extensionFor(file.mimetype);
    // Condition: exécute le bloc si la condition est vraie
    if (!extension || !validateFileSignature(file.buffer, file.mimetype)) {
      // Lève une erreur/exception
      throw new AppError('Le contenu du fichier ne correspond pas au format déclaré.', 400);
    // Ferme un bloc, objet ou appel
    }
    // Déclare une variable
    const now = new Date();
    // Déclare une variable
    const key = path.posix.join(
      // Exécute une instruction
      String(now.getFullYear()),
      // Exécute une instruction
      String(now.getMonth() + 1).padStart(2, '0'),
      // Exécute une instruction
      `${crypto.randomUUID()}.${extension}`,
    // Ferme un bloc, objet ou appel
    );
    // Déclare une variable
    const destination = this.resolveKey(key);
    // Attend le résultat d’une opération asynchrone
    await fs.mkdir(path.dirname(destination), { recursive: true, mode: 0o700 });
    // Attend le résultat d’une opération asynchrone
    await fs.writeFile(destination, file.buffer, { flag: 'wx', mode: 0o600 });
    // Retourne une valeur ou termine la fonction
    return {
      // Exécute une instruction
      key,
      // Exécute une instruction
      emplacement: `local://${key}`,
      // Exécute une instruction
      nomOriginal: safeOriginalName(file.originalname),
      // Exécute une instruction
      taille: file.size ?? file.buffer.length,
    // Ferme un bloc, objet ou appel
    };
  // Ferme un bloc, objet ou appel
  }

  // Exécute une instruction
  async read(key) {
    // Retourne une valeur ou termine la fonction
    return fs.readFile(this.resolveKey(key));
  // Ferme un bloc, objet ou appel
  }

  // Exécute une instruction
  async delete(key) {
    // Attend le résultat d’une opération asynchrone
    await fs.unlink(this.resolveKey(key)).catch((error) => {
      // Condition: exécute le bloc si la condition est vraie
      if (error.code !== 'ENOENT') throw error;
    // Ferme un bloc/appel de fonction
    });
  // Ferme un bloc, objet ou appel
  }

  // Exécute une instruction
  async getUrl() {
    // Retourne une valeur ou termine la fonction
    return null;
  // Ferme un bloc, objet ou appel
  }
// Ferme un bloc, objet ou appel
}

// Exporte des fonctions/objets du module
module.exports = LocalStorageService;
