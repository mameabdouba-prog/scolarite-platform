// Active le mode strict JavaScript pour détecter plus d’erreurs
'use strict';

// Importe une dépendance via require
const db = require('../config/database');

// Déclare une fonction
async function withTransaction(callback) {
  // Déclare une variable
  const connection = await db.getConnection();
  // Début d’un bloc avec gestion d’erreur
  try {
    // Attend le résultat d’une opération asynchrone
    await connection.beginTransaction();
    // Déclare une variable
    const result = await callback(connection);
    // Attend le résultat d’une opération asynchrone
    await connection.commit();
    // Retourne une valeur ou termine la fonction
    return result;
  // Ferme un bloc ou objet
  } catch (error) {
    // Attend le résultat d’une opération asynchrone
    await connection.rollback();
    // Lève une erreur/exception
    throw error;
  // Ferme un bloc ou objet
  } finally {
    // Exécute une instruction
    connection.release();
  // Ferme un bloc, objet ou appel
  }
// Ferme un bloc, objet ou appel
}

// Exporte des fonctions/objets du module
module.exports = { withTransaction };
