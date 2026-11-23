// Active le mode strict JavaScript pour détecter plus d’erreurs
'use strict';

// Importe une dépendance via require
const fs = require('node:fs');
// Importe une dépendance via require
const path = require('node:path');
// Importe une dépendance via require
const mysql = require('mysql2/promise');
// Charge un module
require('dotenv').config();

// Déclare une variable
const rootDir = path.join(__dirname, '..');
// Déclare une variable
const dbName = process.env.DB_NAME || 'scolarite';
// Déclare une variable
const dbUser = process.env.DB_USER || 'scolarite_user';
// Déclare une variable
const dbPassword = process.env.DB_PASSWORD || '';
// Déclare une variable
const rootUser = process.env.DB_ROOT_USER || 'root';
// Déclare une variable
const rootPassword = process.env.DB_ROOT_PASSWORD ?? '';

// Déclare une fonction
function assertIdentifier(value, label) {
  // Condition: exécute le bloc si la condition est vraie
  if (!/^[A-Za-z0-9_]+$/.test(value)) {
    // Lève une erreur/exception
    throw new Error(`${label} invalide (caractères autorisés : lettres, chiffres, tiret bas)`);
  // Ferme un bloc, objet ou appel
  }
// Ferme un bloc, objet ou appel
}

// Déclare une fonction
async function main() {
  // Exécute une instruction
  assertIdentifier(dbName, 'DB_NAME');
  // Exécute une instruction
  assertIdentifier(dbUser, 'DB_USER');

  // Déclare une variable
  const schema = fs.readFileSync(path.join(rootDir, 'database', 'schema.sql'), 'utf8');
  // Déclare une variable
  const connection = await mysql.createConnection({
    // Exécute une instruction
    host: process.env.DB_HOST || 'localhost',
    // Exécute une instruction
    port: Number(process.env.DB_PORT || 3306),
    // Exécute une instruction
    user: rootUser,
    // Exécute une instruction
    password: rootPassword,
    // Exécute une instruction
    multipleStatements: true,
  // Ferme un bloc/appel de fonction
  });

  // Début d’un bloc avec gestion d’erreur
  try {
    // Attend le résultat d’une opération asynchrone
    await connection.query(
      // Exécute une instruction
      `CREATE DATABASE IF NOT EXISTS ${connection.escapeId(dbName)} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
    // Ferme un bloc, objet ou appel
    );
    // Condition: exécute le bloc si la condition est vraie
    if (dbUser !== rootUser) {
      // Attend le résultat d’une opération asynchrone
      await connection.query(
        // Exécute une instruction
        `CREATE USER IF NOT EXISTS ${connection.escape(dbUser)}@${connection.escape('%')} IDENTIFIED BY ${connection.escape(dbPassword)}`,
      // Ferme un bloc, objet ou appel
      );
      // Attend le résultat d’une opération asynchrone
      await connection.query(
        // Exécute une instruction
        `GRANT ALL PRIVILEGES ON ${connection.escapeId(dbName)}.* TO ${connection.escape(dbUser)}@${connection.escape('%')}`,
      // Ferme un bloc, objet ou appel
      );
      // Condition: exécute le bloc si la condition est vraie
      if (dbPassword) {
        // Attend le résultat d’une opération asynchrone
        await connection.query(
          // Exécute une instruction
          `ALTER USER ${connection.escape(dbUser)}@${connection.escape('%')} IDENTIFIED BY ${connection.escape(dbPassword)}`,
        // Ferme un bloc, objet ou appel
        );
      // Ferme un bloc, objet ou appel
      }
    // Ferme un bloc, objet ou appel
    }
    // Attend le résultat d’une opération asynchrone
    await connection.query(`USE ${connection.escapeId(dbName)}`);
    // Attend le résultat d’une opération asynchrone
    await connection.query(schema);
    // Exécute une instruction
    console.log(`Base de données ${dbName} initialisée avec succès.`);
  // Ferme un bloc ou objet
  } finally {
    // Attend le résultat d’une opération asynchrone
    await connection.end();
  // Ferme un bloc, objet ou appel
  }
// Ferme un bloc, objet ou appel
}

// Exécute une instruction
main().catch((error) => {
  // Exécute une instruction
  console.error('Échec de l\'initialisation de la base de données :', error.message);
  // Exécute une instruction
  process.exitCode = 1;
// Ferme un bloc/appel de fonction
});
