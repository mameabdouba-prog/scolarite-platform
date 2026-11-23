// Active le mode strict JavaScript pour détecter plus d’erreurs
'use strict';

// Charge un module
require('dotenv').config();
// Importe une dépendance via require
const mysql = require('mysql2/promise');

// Déclare une variable
const pool = mysql.createPool({
  // Exécute une instruction
  host: process.env.DB_HOST || 'localhost',
  // Exécute une instruction
  port: Number(process.env.DB_PORT || 3306),
  // Exécute une instruction
  user: process.env.DB_USER || 'scolarite_user',
  // Exécute une instruction
  password: process.env.DB_PASSWORD || '',
  // Exécute une instruction
  database: process.env.DB_NAME || 'scolarite',
  // Exécute une instruction
  waitForConnections: true,
  // Exécute une instruction
  connectionLimit: Number(process.env.DB_POOL_LIMIT || 10),
  // Exécute une instruction
  queueLimit: 0,
  // Exécute une instruction
  charset: 'utf8mb4',
  // Exécute une instruction
  timezone: 'Z',
  // Exécute une instruction
  namedPlaceholders: true,
// Ferme un bloc/appel de fonction
});

// Déclare une fonction
async function query(sql, params = {}) {
  // Exécute une instruction
  const [rows] = await pool.execute(sql, params);
  // Retourne une valeur ou termine la fonction
  return rows;
// Ferme un bloc, objet ou appel
}

// Déclare une fonction
async function getConnection() {
  // Retourne une valeur ou termine la fonction
  return pool.getConnection();
// Ferme un bloc, objet ou appel
}

// Déclare une fonction
async function ping() {
  // Déclare une variable
  const connection = await pool.getConnection();
  // Début d’un bloc avec gestion d’erreur
  try {
    // Attend le résultat d’une opération asynchrone
    await connection.ping();
    // Attend le résultat d’une opération asynchrone
    await connection.query('SELECT 1');
    // Retourne une valeur ou termine la fonction
    return true;
  // Ferme un bloc ou objet
  } finally {
    // Exécute une instruction
    connection.release();
  // Ferme un bloc, objet ou appel
  }
// Ferme un bloc, objet ou appel
}

// Déclare une fonction
async function close() {
  // Attend le résultat d’une opération asynchrone
  await pool.end();
// Ferme un bloc, objet ou appel
}

// Exporte des fonctions/objets du module
module.exports = { pool, query, getConnection, ping, close };
