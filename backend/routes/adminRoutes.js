// Active le mode strict JavaScript pour détecter plus d’erreurs
'use strict';

// Importe une dépendance via require
const express = require('express');
// Importe une dépendance via require
const adminController = require('../controllers/adminController');
// Importe une dépendance via require
const { requireAuth } = require('../middleware/authMiddleware');
// Importe une dépendance via require
const { requireRole } = require('../middleware/roleMiddleware');
// Importe une dépendance via require
const validators = require('../middleware/validators');

// Déclare une variable
const router = express.Router();
// Définit une route ou un middleware Express
router.use(requireAuth, requireRole('ADMINISTRATEUR'));

// Définit une route ou un middleware Express
router.get('/tableau-de-bord', adminController.dashboard);
// Définit une route ou un middleware Express
router.get('/agents', adminController.listAgents);
// Définit une route ou un middleware Express
router.get('/agents/nouveau', adminController.showCreateAgent);
// Définit une route ou un middleware Express
router.post('/agents', validators.createAgent, validators.handle, adminController.createAgent);
// Définit une route ou un middleware Express
router.post('/agents/:id/actif', adminController.toggleAgent);

// Exporte des fonctions/objets du module
module.exports = router;
