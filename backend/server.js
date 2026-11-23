// Active le mode strict JavaScript pour détecter plus d’erreurs
'use strict';

// Charge un module
require('dotenv').config();
// Importe une dépendance via require
const app = require('./app');
// Importe une dépendance via require
const db = require('./config/database');

// Déclare une variable
const port = Number(process.env.PORT || 3000);

// Déclare une variable
const server = app.listen(port, () => {
  // Exécute une instruction
  console.log(`SCOLARITÉ ${process.env.APP_VERSION || '1.0.0'} démarrée sur le port ${port}`);
  // Exécute une instruction
  console.log(`Instance : ${process.env.INSTANCE_NAME || require('node:os').hostname()}`);
// Ferme un bloc/appel de fonction
});

// Déclare une fonction
async function shutdown(signal) {
  // Exécute une instruction
  console.log(`Arrêt demandé (${signal}).`);
  // Exécute une instruction
  server.close(async () => {
    // Début d’un bloc avec gestion d’erreur
    try {
      // Attend le résultat d’une opération asynchrone
      await db.close();
      // Exécute une instruction
      process.exit(0);
    // Ferme un bloc ou objet
    } catch (error) {
      // Exécute une instruction
      console.error('Erreur lors de la fermeture :', error.message);
      // Exécute une instruction
      process.exit(1);
    // Ferme un bloc, objet ou appel
    }
  // Ferme un bloc/appel de fonction
  });
// Ferme un bloc, objet ou appel
}

// Exécute une instruction
process.on('SIGTERM', () => shutdown('SIGTERM'));
// Exécute une instruction
process.on('SIGINT', () => shutdown('SIGINT'));
// Exécute une instruction
process.on('unhandledRejection', (reason) => {
  // Exécute une instruction
  console.error('Promesse rejetée non gérée :', reason);
// Ferme un bloc/appel de fonction
});

// Exporte des fonctions/objets du module
module.exports = server;
