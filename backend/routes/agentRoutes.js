// Active le mode strict JavaScript pour détecter plus d’erreurs
'use strict';

// Importe une dépendance via require
const express = require('express');
// Importe une dépendance via require
const agentController = require('../controllers/agentController');
// Importe une dépendance via require
const { requireAuth } = require('../middleware/authMiddleware');
// Importe une dépendance via require
const { requireRole } = require('../middleware/roleMiddleware');
// Importe une dépendance via require
const validators = require('../middleware/validators');

// Déclare une variable
const router = express.Router();
// Définit une route ou un middleware Express
router.use(requireAuth, requireRole('AGENT', 'ADMINISTRATEUR'));

// Définit une route ou un middleware Express
router.get('/tableau-de-bord', agentController.dashboard);
// Définit une route ou un middleware Express
router.get('/dossiers', agentController.listDossiers);
// Définit une route ou un middleware Express
router.get('/dossiers/:id', agentController.showDossier);
// Définit une route ou un middleware Express
router.post('/dossiers/:id/traiter', validators.decision, validators.handle, agentController.processDossier);
// Définit une route ou un middleware Express
router.get('/pieces/:id/download', agentController.downloadPiece);
// Définit une route ou un middleware Express
router.get('/dossiers/:id/attestation', agentController.downloadAttestation);
// Définit une route ou un middleware Express
router.get('/historique', agentController.recentActivity);

// Exporte des fonctions/objets du module
module.exports = router;
