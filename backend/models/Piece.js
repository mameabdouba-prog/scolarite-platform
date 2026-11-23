// Active le mode strict JavaScript pour détecter plus d’erreurs
'use strict';

// Importe une dépendance via require
const db = require('../config/database');

// Déclare une fonction
async function create({ dossierId, type, nomOriginal, nomStockage, taille, emplacement }) {
  // Déclare une variable
  const result = await db.query(
    // Exécute une instruction
    `INSERT INTO pieces (dossier_id, type, nom_original, nom_stockage, taille, emplacement)
     VALUES (:dossierId, :type, :nomOriginal, :nomStockage, :taille, :emplacement)`,
    // Commentaire: contenu de template literal
    { dossierId, type, nomOriginal, nomStockage, taille, emplacement },
  // Commentaire: suite de commentaire bloc
  );
  // Commentaire: suite de commentaire bloc
  return findById(result.insertId);
// Commentaire: suite de commentaire bloc
}

// Commentaire: suite de commentaire bloc
async function findById(id) {
  // Commentaire: suite de commentaire bloc
  const rows = await db.query(
    // Commentaire: suite de commentaire bloc
    `SELECT p.*, d.etudiant_id, d.etat AS dossier_etat, d.reference_dossier
     FROM pieces p INNER JOIN dossiers d ON d.id = p.dossier_id WHERE p.id = :id`,
    // Commentaire: suite de commentaire bloc
    { id },
  // Commentaire: suite de commentaire bloc
  );
  // Commentaire: suite de commentaire bloc
  return rows[0] || null;
// Commentaire: suite de commentaire bloc
}

// Commentaire: suite de commentaire bloc
async function listByDossier(dossierId) {
  // Commentaire: suite de commentaire bloc
  return db.query(
    // Commentaire: suite de commentaire bloc
    'SELECT * FROM pieces WHERE dossier_id = :dossierId ORDER BY date_depot ASC, id ASC',
    // Commentaire: suite de commentaire bloc
    { dossierId },
  // Commentaire: suite de commentaire bloc
  );
// Commentaire: suite de commentaire bloc
}

// Commentaire: suite de commentaire bloc
async function deleteById(id) {
  // Commentaire: suite de commentaire bloc
  await db.query('DELETE FROM pieces WHERE id = :id', { id });
// Commentaire: suite de commentaire bloc
}

// Commentaire: suite de commentaire bloc
module.exports = { create, findById, listByDossier, deleteById };
