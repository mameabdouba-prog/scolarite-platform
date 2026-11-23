// Active le mode strict JavaScript pour détecter plus d’erreurs
'use strict';

// Importe une dépendance via require
const fs = require('node:fs');
// Importe une dépendance via require
const path = require('node:path');
// Importe une dépendance via require
const dotenv = require('dotenv');
// Importe une dépendance via require
const mysql = require('mysql2/promise');

// Déclare une variable
const rootDir = path.join(__dirname, '..');

// Exporte des fonctions/objets du module
module.exports = async function globalSetup() {
  // Exécute une instruction
  dotenv.config({ path: path.join(rootDir, '.env.test'), override: true });
  // Déclare une variable
  const dbName = process.env.DB_NAME;
  // Condition: exécute le bloc si la condition est vraie
  if (!/^[A-Za-z0-9_]+$/.test(dbName || '')) throw new Error('DB_NAME de test invalide.');

  // Déclare une variable
  const uploadDir = path.resolve(rootDir, process.env.UPLOAD_DIR || 'uploads/test');
  // Attend le résultat d’une opération asynchrone
  await fs.promises.mkdir(uploadDir, { recursive: true });

  // Déclare une variable
  const connection = await mysql.createConnection({
    // Exécute une instruction
    host: process.env.DB_HOST || '127.0.0.1',
    // Exécute une instruction
    port: Number(process.env.DB_PORT || 3306),
    // Exécute une instruction
    user: process.env.DB_ROOT_USER || 'root',
    // Exécute une instruction
    password: process.env.DB_ROOT_PASSWORD ?? '',
    // Exécute une instruction
    multipleStatements: true,
  // Ferme un bloc/appel de fonction
  });

  // Début d’un bloc avec gestion d’erreur
  try {
    // Attend le résultat d’une opération asynchrone
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${connection.escapeId(dbName)} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    // Attend le résultat d’une opération asynchrone
    await connection.query(`USE ${connection.escapeId(dbName)}`);
    // Attend le résultat d’une opération asynchrone
    await connection.query(`SET FOREIGN_KEY_CHECKS = 0;
      DROP TABLE IF EXISTS historique_actions;
      DROP TABLE IF EXISTS pieces;
      DROP TABLE IF EXISTS dossiers;
      DROP TABLE IF EXISTS administrateurs;
      DROP TABLE IF EXISTS agents;
      DROP TABLE IF EXISTS etudiants;
      SET FOREIGN_KEY_CHECKS = 1;`);
    // Commentaire: suite de commentaire bloc
    await connection.query(fs.readFileSync(path.join(rootDir, 'database', 'schema.sql'), 'utf8'));
  // Commentaire: suite de commentaire bloc
  } finally {
    // Commentaire: suite de commentaire bloc
    await connection.end();
  // Commentaire: suite de commentaire bloc
  }
// Commentaire: suite de commentaire bloc
};
