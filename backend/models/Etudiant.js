// Active le mode strict JavaScript pour détecter plus d’erreurs
'use strict';

// Importe une dépendance via require
const bcrypt = require('bcrypt');
// Importe une dépendance via require
const db = require('../config/database');

// Déclare une fonction
async function create({ numeroEtudiant, nom, prenom, email, password, filiere, niveau }) {
  // Déclare une variable
  const passwordHash = await bcrypt.hash(password, 12);
  // Déclare une variable
  const result = await db.query(
    // Exécute une instruction
    `INSERT INTO etudiants (numero_etudiant, nom, prenom, email, password, filiere, niveau)
     VALUES (:numeroEtudiant, :nom, :prenom, :email, :passwordHash, :filiere, :niveau)`,
    // Commentaire: contenu de template literal
    { numeroEtudiant, nom, prenom, email, passwordHash, filiere, niveau },
  // Commentaire: suite de commentaire bloc
  );
  // Commentaire: suite de commentaire bloc
  return findById(result.insertId);
// Commentaire: suite de commentaire bloc
}

// Commentaire: suite de commentaire bloc
async function findById(id) {
  // Commentaire: suite de commentaire bloc
  const rows = await db.query('SELECT * FROM etudiants WHERE id = :id', { id });
  // Commentaire: suite de commentaire bloc
  return rows[0] || null;
// Commentaire: suite de commentaire bloc
}

// Commentaire: suite de commentaire bloc
async function findByEmail(email) {
  // Commentaire: suite de commentaire bloc
  const rows = await db.query('SELECT * FROM etudiants WHERE email = :email', { email });
  // Commentaire: suite de commentaire bloc
  return rows[0] || null;
// Commentaire: suite de commentaire bloc
}

// Commentaire: suite de commentaire bloc
async function findByNumero(numeroEtudiant) {
  // Commentaire: suite de commentaire bloc
  const rows = await db.query(
    // Commentaire: suite de commentaire bloc
    'SELECT * FROM etudiants WHERE numero_etudiant = :numeroEtudiant',
    // Commentaire: suite de commentaire bloc
    { numeroEtudiant },
  // Commentaire: suite de commentaire bloc
  );
  // Commentaire: suite de commentaire bloc
  return rows[0] || null;
// Commentaire: suite de commentaire bloc
}

// Commentaire: suite de commentaire bloc
async function updateProfile(id, { nom, prenom, email, filiere, niveau }) {
  // Commentaire: suite de commentaire bloc
  await db.query(
    // Commentaire: suite de commentaire bloc
    `UPDATE etudiants SET nom = :nom, prenom = :prenom, email = :email,
       filiere = :filiere, niveau = :niveau WHERE id = :id`,
    // Commentaire: suite de commentaire bloc
    { id, nom, prenom, email, filiere, niveau },
  // Commentaire: suite de commentaire bloc
  );
  // Commentaire: suite de commentaire bloc
  return findById(id);
// Commentaire: suite de commentaire bloc
}

// Commentaire: suite de commentaire bloc
async function countAll() {
  // Commentaire: suite de commentaire bloc
  const rows = await db.query('SELECT COUNT(*) AS total FROM etudiants');
  // Commentaire: suite de commentaire bloc
  return Number(rows[0].total);
// Commentaire: suite de commentaire bloc
}

// Commentaire: suite de commentaire bloc
module.exports = { create, findById, findByEmail, findByNumero, updateProfile, countAll };
