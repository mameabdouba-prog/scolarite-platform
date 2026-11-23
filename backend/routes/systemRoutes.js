// Active le mode strict JavaScript pour détecter plus d’erreurs
'use strict';

// Importe une dépendance via require
const express = require('express');
// Importe une dépendance via require
const os = require('node:os');
// Importe une dépendance via require
const db = require('../config/database');

// Déclare une variable
const router = express.Router();

// Définit une route ou un middleware Express
router.get('/', (req, res) => {
  // Condition: exécute le bloc si la condition est vraie
  if (req.session?.user) return res.redirect('/dashboard');
  // Retourne une valeur ou termine la fonction
  return res.redirect('/login');
// Ferme un bloc/appel de fonction
});

// Définit une route ou un middleware Express
router.get('/health', async (req, res) => {
  // Début d’un bloc avec gestion d’erreur
  try {
    // Attend le résultat d’une opération asynchrone
    await db.ping();
    // Retourne une valeur ou termine la fonction
    return res.status(200).json({ status: 'ok', database: 'connected' });
  // Ferme un bloc ou objet
  } catch (error) {
    // Exécute une instruction
    console.error('[HEALTH] Base de données indisponible :', error.message);
    // Retourne une valeur ou termine la fonction
    return res.status(503).json({ status: 'error', database: 'disconnected' });
  // Ferme un bloc, objet ou appel
  }
// Ferme un bloc/appel de fonction
});

// Définit une route ou un middleware Express
router.get('/version', (req, res) => {
  // Retourne une valeur ou termine la fonction
  return res.status(200).json({
    // Exécute une instruction
    version: process.env.APP_VERSION || '1.0.0',
    // Exécute une instruction
    instance: process.env.INSTANCE_NAME || os.hostname(),
    // Exécute une instruction
    timestamp: new Date().toISOString(),
  // Ferme un bloc/appel de fonction
  });
// Ferme un bloc/appel de fonction
});

// Exporte des fonctions/objets du module
module.exports = router;
