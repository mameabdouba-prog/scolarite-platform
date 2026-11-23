// Active le mode strict JavaScript pour détecter plus d’erreurs
'use strict';

// Importe une dépendance via require
const bcrypt = require('bcrypt');
// Importe une dépendance via require
const db = require('../config/database');

// Déclare une fonction
async function create({ nom, prenom, email, password }) {
  // Déclare une variable
  const passwordHash = await bcrypt.hash(password, 12);
  // Déclare une variable
  const result = await db.query(
    // Exécute une instruction
    `INSERT INTO administrateurs (nom, prenom, email, password)
     VALUES (:nom, :prenom, :email, :passwordHash)`,
    // Commentaire: contenu de template literal
    { nom, prenom, email, passwordHash },
  // Commentaire: suite de commentaire bloc
  );
  // Commentaire: suite de commentaire bloc
  return findById(result.insertId);
// Commentaire: suite de commentaire bloc
}

// Commentaire: suite de commentaire bloc
async function findById(id) {
  // Commentaire: suite de commentaire bloc
  const rows = await db.query('SELECT * FROM administrateurs WHERE id = :id', { id });
  // Commentaire: suite de commentaire bloc
  return rows[0] || null;
// Commentaire: suite de commentaire bloc
}

// Commentaire: suite de commentaire bloc
async function findByEmail(email) {
  // Commentaire: suite de commentaire bloc
  const rows = await db.query('SELECT * FROM administrateurs WHERE email = :email', { email });
  // Commentaire: suite de commentaire bloc
  return rows[0] || null;
// Commentaire: suite de commentaire bloc
}

// Commentaire: suite de commentaire bloc
module.exports = { create, findById, findByEmail };
