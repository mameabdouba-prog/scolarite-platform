// Active le mode strict JavaScript pour détecter plus d’erreurs
'use strict';

// Importe une dépendance via require
const crypto = require('node:crypto');
// Importe une dépendance via require
const db = require('../config/database');

// Déclare une variable
const BASE_SELECT = `SELECT d.*, e.nom AS etudiant_nom, e.prenom AS etudiant_prenom,
  e.numero_etudiant, e.email AS etudiant_email
  FROM dossiers d INNER JOIN etudiants e ON e.id = d.etudiant_id`;

// Commentaire: suite de commentaire bloc
function generateReference() {
  // Commentaire: suite de commentaire bloc
  return `DOS-${new Date().getFullYear()}-${crypto.randomBytes(5).toString('hex').toUpperCase()}`;
// Commentaire: suite de commentaire bloc
}

// Commentaire: suite de commentaire bloc
function buildWhere(filters = {}) {
  // Commentaire: suite de commentaire bloc
  const conditions = [];
  // Commentaire: suite de commentaire bloc
  const values = [];
  // Commentaire: suite de commentaire bloc
  if (filters.etat) { conditions.push('d.etat = ?'); values.push(filters.etat); }
  // Commentaire: suite de commentaire bloc
  if (filters.filiere) { conditions.push('d.filiere = ?'); values.push(filters.filiere); }
  // Commentaire: suite de commentaire bloc
  if (filters.niveau) { conditions.push('d.niveau = ?'); values.push(filters.niveau); }
  // Commentaire: suite de commentaire bloc
  if (filters.annee_universitaire) {
    // Commentaire: suite de commentaire bloc
    conditions.push('d.annee_universitaire = ?');
    // Commentaire: suite de commentaire bloc
    values.push(filters.annee_universitaire);
  // Commentaire: suite de commentaire bloc
  }
  // Commentaire: suite de commentaire bloc
  if (filters.search) {
    // Commentaire: suite de commentaire bloc
    const like = `%${filters.search}%`;
    // Commentaire: suite de commentaire bloc
    conditions.push('(e.nom LIKE ? OR e.prenom LIKE ? OR e.numero_etudiant LIKE ? OR d.reference_dossier LIKE ?)');
    // Commentaire: suite de commentaire bloc
    values.push(like, like, like, like);
  // Commentaire: suite de commentaire bloc
  }
  // Commentaire: suite de commentaire bloc
  return { clause: conditions.length ? ` WHERE ${conditions.join(' AND ')}` : '', values };
// Commentaire: suite de commentaire bloc
}

// Commentaire: suite de commentaire bloc
async function create({ etudiantId, anneeUniversitaire, filiere, niveau }) {
  // Commentaire: suite de commentaire bloc
  const referenceDossier = generateReference();
  // Commentaire: suite de commentaire bloc
  const result = await db.query(
    // Commentaire: suite de commentaire bloc
    `INSERT INTO dossiers (etudiant_id, annee_universitaire, filiere, niveau, etat, reference_dossier, date_soumission)
     VALUES (:etudiantId, :anneeUniversitaire, :filiere, :niveau, 'EN_ATTENTE', :referenceDossier, NOW())`,
    // Commentaire: suite de commentaire bloc
    { etudiantId, anneeUniversitaire, filiere, niveau, referenceDossier },
  // Commentaire: suite de commentaire bloc
  );
  // Commentaire: suite de commentaire bloc
  return findById(result.insertId);
// Commentaire: suite de commentaire bloc
}

// Commentaire: suite de commentaire bloc
async function findById(id) {
  // Commentaire: suite de commentaire bloc
  const rows = await db.query(`${BASE_SELECT} WHERE d.id = :id`, { id });
  // Commentaire: suite de commentaire bloc
  return rows[0] || null;
// Commentaire: suite de commentaire bloc
}

// Commentaire: suite de commentaire bloc
async function findByStudentAndYear(etudiantId, anneeUniversitaire) {
  // Commentaire: suite de commentaire bloc
  const rows = await db.query(
    // Commentaire: suite de commentaire bloc
    `${BASE_SELECT} WHERE d.etudiant_id = :etudiantId AND d.annee_universitaire = :anneeUniversitaire`,
    // Commentaire: suite de commentaire bloc
    { etudiantId, anneeUniversitaire },
  // Commentaire: suite de commentaire bloc
  );
  // Commentaire: suite de commentaire bloc
  return rows[0] || null;
// Commentaire: suite de commentaire bloc
}

// Commentaire: suite de commentaire bloc
async function findLatestForStudent(etudiantId) {
  // Commentaire: suite de commentaire bloc
  const rows = await db.query(
    // Commentaire: suite de commentaire bloc
    `${BASE_SELECT} WHERE d.etudiant_id = :etudiantId ORDER BY d.created_at DESC, d.id DESC LIMIT 1`,
    // Commentaire: suite de commentaire bloc
    { etudiantId },
  // Commentaire: suite de commentaire bloc
  );
  // Commentaire: suite de commentaire bloc
  return rows[0] || null;
// Commentaire: suite de commentaire bloc
}

// Commentaire: suite de commentaire bloc
async function list(filters = {}, limit = 10, offset = 0) {
  // Commentaire: suite de commentaire bloc
  const { clause, values } = buildWhere(filters);
  // Commentaire: suite de commentaire bloc
  const sql = `${BASE_SELECT}${clause} ORDER BY d.created_at DESC, d.id DESC LIMIT ? OFFSET ?`;
  // Commentaire: suite de commentaire bloc
  const [rows] = await db.pool.execute(sql, [...values, limit, offset]);
  // Commentaire: suite de commentaire bloc
  return rows;
// Commentaire: suite de commentaire bloc
}

// Commentaire: suite de commentaire bloc
async function count(filters = {}) {
  // Commentaire: suite de commentaire bloc
  const { clause, values } = buildWhere(filters);
  // Commentaire: suite de commentaire bloc
  const sql = `SELECT COUNT(*) AS total FROM dossiers d
    INNER JOIN etudiants e ON e.id = d.etudiant_id${clause}`;
  // Commentaire: suite de commentaire bloc
  const [rows] = await db.pool.execute(sql, values);
  // Commentaire: suite de commentaire bloc
  return Number(rows[0].total);
// Commentaire: suite de commentaire bloc
}

// Commentaire: suite de commentaire bloc
async function updateDecision(id, { etat, commentaire }) {
  // Commentaire: suite de commentaire bloc
  await db.query(
    // Commentaire: suite de commentaire bloc
    `UPDATE dossiers SET etat = :etat, commentaire = :commentaire,
       date_traitement = NOW() WHERE id = :id`,
    // Commentaire: suite de commentaire bloc
    { id, etat, commentaire: commentaire || null },
  // Commentaire: suite de commentaire bloc
  );
  // Commentaire: suite de commentaire bloc
  return findById(id);
// Commentaire: suite de commentaire bloc
}

// Commentaire: suite de commentaire bloc
async function countByEtat() {
  // Commentaire: suite de commentaire bloc
  const rows = await db.query('SELECT etat, COUNT(*) AS total FROM dossiers GROUP BY etat');
  // Commentaire: suite de commentaire bloc
  return rows;
// Commentaire: suite de commentaire bloc
}

// Commentaire: suite de commentaire bloc
async function countByFiliere() {
  // Commentaire: suite de commentaire bloc
  const rows = await db.query(
    // Commentaire: suite de commentaire bloc
    'SELECT filiere, COUNT(*) AS total FROM dossiers GROUP BY filiere ORDER BY total DESC',
  // Commentaire: suite de commentaire bloc
  );
  // Commentaire: suite de commentaire bloc
  return rows;
// Commentaire: suite de commentaire bloc
}

// Commentaire: suite de commentaire bloc
async function countByNiveau() {
  // Commentaire: suite de commentaire bloc
  const rows = await db.query(
    // Commentaire: suite de commentaire bloc
    'SELECT niveau, COUNT(*) AS total FROM dossiers GROUP BY niveau ORDER BY niveau ASC',
  // Commentaire: suite de commentaire bloc
  );
  // Commentaire: suite de commentaire bloc
  return rows;
// Commentaire: suite de commentaire bloc
}

// Commentaire: suite de commentaire bloc
async function countByAnnee() {
  // Commentaire: suite de commentaire bloc
  const rows = await db.query(
    // Commentaire: suite de commentaire bloc
    'SELECT annee_universitaire, COUNT(*) AS total FROM dossiers GROUP BY annee_universitaire ORDER BY annee_universitaire DESC',
  // Commentaire: suite de commentaire bloc
  );
  // Commentaire: suite de commentaire bloc
  return rows;
// Commentaire: suite de commentaire bloc
}

// Commentaire: suite de commentaire bloc
async function distinctFilters() {
  // Commentaire: suite de commentaire bloc
  const [filieres, niveaux] = await Promise.all([
    // Commentaire: suite de commentaire bloc
    db.query('SELECT DISTINCT filiere FROM dossiers ORDER BY filiere'),
    // Commentaire: suite de commentaire bloc
    db.query('SELECT DISTINCT niveau FROM dossiers ORDER BY niveau'),
  // Commentaire: suite de commentaire bloc
  ]);
  // Commentaire: suite de commentaire bloc
  return {
    // Commentaire: suite de commentaire bloc
    filieres: filieres.map((row) => row.filiere),
    // Commentaire: suite de commentaire bloc
    niveaux: niveaux.map((row) => row.niveau),
  // Commentaire: suite de commentaire bloc
  };
// Commentaire: suite de commentaire bloc
}

// Commentaire: suite de commentaire bloc
module.exports = {
  // Commentaire: suite de commentaire bloc
  generateReference,
  // Commentaire: suite de commentaire bloc
  create,
  // Commentaire: suite de commentaire bloc
  findById,
  // Commentaire: suite de commentaire bloc
  findByStudentAndYear,
  // Commentaire: suite de commentaire bloc
  findLatestForStudent,
  // Commentaire: suite de commentaire bloc
  list,
  // Commentaire: suite de commentaire bloc
  count,
  // Commentaire: suite de commentaire bloc
  updateDecision,
  // Commentaire: suite de commentaire bloc
  countByEtat,
  // Commentaire: suite de commentaire bloc
  countByFiliere,
  // Commentaire: suite de commentaire bloc
  countByNiveau,
  // Commentaire: suite de commentaire bloc
  countByAnnee,
  // Commentaire: suite de commentaire bloc
  distinctFilters,
// Commentaire: suite de commentaire bloc
};
