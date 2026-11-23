// Active le mode strict JavaScript pour détecter plus d’erreurs
'use strict';

// Importe une dépendance via require
const express = require('express');
// Importe une dépendance via require
const authController = require('../controllers/authController');
// Importe une dépendance via require
const { requireAuth, redirectIfAuthenticated } = require('../middleware/authMiddleware');
// Importe une dépendance via require
const validators = require('../middleware/validators');
// Importe une dépendance via require
const { loginLimiter } = require('../config/rateLimit');

// Déclare une variable
const router = express.Router();

// Définit une route ou un middleware Express
router.get('/login', redirectIfAuthenticated, authController.showLogin);
// Définit une route ou un middleware Express
router.post('/login', loginLimiter, validators.login, validators.handle, authController.login);
// Définit une route ou un middleware Express
router.get('/register', redirectIfAuthenticated, authController.showRegister);
// Définit une route ou un middleware Express
router.post('/register', validators.register, validators.handle, authController.register);
// Définit une route ou un middleware Express
router.post('/logout', requireAuth, authController.logout);
// Définit une route ou un middleware Express
router.get('/dashboard', requireAuth, authController.dashboard);
// Définit une route ou un middleware Express
router.get('/access-denied', authController.accessDenied);

// Exporte des fonctions/objets du module
module.exports = router;
