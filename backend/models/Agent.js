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
    'INSERT INTO agents (nom, prenom, email, password) VALUES (:nom, :prenom, :email, :passwordHash)',
    // Ouvre un bloc ou objet
    { nom, prenom, email, passwordHash },
  // Ferme un bloc, objet ou appel
  );
  // Retourne une valeur ou termine la fonction
  return findById(result.insertId);
// Ferme un bloc, objet ou appel
}

// Déclare une fonction
async function findById(id) {
  // Déclare une variable
  const rows = await db.query('SELECT * FROM agents WHERE id = :id', { id });
  // Retourne une valeur ou termine la fonction
  return rows[0] || null;
// Ferme un bloc, objet ou appel
}

// Déclare une fonction
async function findByEmail(email) {
  // Déclare une variable
  const rows = await db.query('SELECT * FROM agents WHERE email = :email', { email });
  // Retourne une valeur ou termine la fonction
  return rows[0] || null;
// Ferme un bloc, objet ou appel
}

// Déclare une fonction
async function listAll() {
  // Retourne une valeur ou termine la fonction
  return db.query(
    // Exécute une instruction
    `SELECT id, nom, prenom, email, actif, created_at
     FROM agents ORDER BY actif DESC, nom ASC, prenom ASC`,
  // Commentaire: contenu de template literal
  );
// Commentaire: suite de commentaire bloc
}

// Commentaire: suite de commentaire bloc
async function setActif(id, actif) {
  // Commentaire: suite de commentaire bloc
  await db.query('UPDATE agents SET actif = :actif WHERE id = :id', { id, actif: actif ? 1 : 0 });
  // Commentaire: suite de commentaire bloc
  return findById(id);
// Commentaire: suite de commentaire bloc
}

// Commentaire: suite de commentaire bloc
async function countAll() {
  // Commentaire: suite de commentaire bloc
  const rows = await db.query('SELECT COUNT(*) AS total FROM agents');
  // Commentaire: suite de commentaire bloc
  return Number(rows[0].total);
// Commentaire: suite de commentaire bloc
}

// Commentaire: suite de commentaire bloc
async function countActifs() {
  // Commentaire: suite de commentaire bloc
  const rows = await db.query('SELECT COUNT(*) AS total FROM agents WHERE actif = 1');
  // Commentaire: suite de commentaire bloc
  return Number(rows[0].total);
// Commentaire: suite de commentaire bloc
}

// Commentaire: suite de commentaire bloc
module.exports = { create, findById, findByEmail, listAll, setActif, countAll, countActifs };
