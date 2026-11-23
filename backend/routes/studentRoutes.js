// Active le mode strict JavaScript pour détecter plus d’erreurs
'use strict';

// Importe une dépendance via require
const express = require('express');
// Importe une dépendance via require
const studentController = require('../controllers/studentController');
// Importe une dépendance via require
const { requireAuth } = require('../middleware/authMiddleware');
// Importe une dépendance via require
const { requireRole } = require('../middleware/roleMiddleware');
// Importe une dépendance via require
const validators = require('../middleware/validators');
// Importe une dépendance via require
const { uploadPiece } = require('../middleware/uploadMiddleware');

// Déclare une variable
const router = express.Router();
// Définit une route ou un middleware Express
router.use(requireAuth, requireRole('ETUDIANT'));

// Définit une route ou un middleware Express
router.get('/tableau-de-bord', studentController.dashboard);
// Définit une route ou un middleware Express
router.get('/profil', studentController.showProfile);
// Définit une route ou un middleware Express
router.post('/profil', validators.profile, validators.handle, studentController.updateProfile);
// Définit une route ou un middleware Express
router.get('/inscription', studentController.showNewDossier);
// Définit une route ou un middleware Express
router.post('/inscription', validators.dossier, validators.handle, studentController.createDossier);
// Définit une route ou un middleware Express
router.get('/dossiers', studentController.listDossiers);
// Définit une route ou un middleware Express
router.get('/dossiers/:id', studentController.showDossier);
// Définit une route ou un middleware Express
router.post('/dossiers/:id/pieces', uploadPiece, validators.uploadPiece, validators.handle, studentController.uploadPiece);
// Définit une route ou un middleware Express
router.get('/pieces/:id/download', studentController.downloadPiece);
// Définit une route ou un middleware Express
router.get('/dossiers/:id/attestation', studentController.downloadAttestation);

// Exporte des fonctions/objets du module
module.exports = router;
