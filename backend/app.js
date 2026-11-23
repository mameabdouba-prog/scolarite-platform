// Active le mode strict JavaScript pour détecter plus d’erreurs
'use strict';

// Charge un module
require('dotenv').config();
// Importe une dépendance via require
const path = require('node:path');
// Importe une dépendance via require
const express = require('express');
// Importe une dépendance via require
const helmet = require('helmet');
// Importe une dépendance via require
const flash = require('connect-flash');

// Importe une dépendance via require
const { sessionMiddleware } = require('./config/session');
// Importe une dépendance via require
const { csrfProtection } = require('./middleware/csrfMiddleware');
// Importe une dépendance via require
const { notFoundHandler, errorHandler } = require('./middleware/errorMiddleware');
// Importe une dépendance via require
const { icon } = require('./utils/icons');
// Importe une dépendance via require
const { escapeHtml, formatDate, formatBytes } = require('./utils/helpers');

// Déclare une variable
const app = express();

// Définit une route ou un middleware Express
app.set('view engine', 'ejs');
// Définit une route ou un middleware Express
app.set('views', path.join(__dirname, '..', 'frontend', 'views'));
// Définit une route ou un middleware Express
app.set('trust proxy', String(process.env.TRUST_PROXY || 'false') === 'true' ? 1 : false);

// Définit une route ou un middleware Express
app.use(helmet({
  // Exécute une instruction
  contentSecurityPolicy: {
    // Exécute une instruction
    directives: {
      // Cas par défaut du switch
      defaultSrc: ["'self'"],
      // Exécute une instruction
      scriptSrc: ["'self'"],
      // Exécute une instruction
      styleSrc: ["'self'", "'unsafe-inline'"],
      // Exécute une instruction
      imgSrc: ["'self'", 'data:'],
      // Exécute une instruction
      fontSrc: ["'self'"],
      // Exécute une instruction
      objectSrc: ["'none'"],
      // Exécute une instruction
      frameAncestors: ["'none'"],
      // Exécute une instruction
      baseUri: ["'self'"],
      // Exécute une instruction
      formAction: ["'self'"],
    // Ferme un bloc ou objet
    },
  // Ferme un bloc ou objet
  },
// Ferme un bloc ou objet
}));
// Définit une route ou un middleware Express
app.use(express.urlencoded({ extended: false, limit: '1mb' }));
// Définit une route ou un middleware Express
app.use(express.json({ limit: '1mb' }));
// Définit une route ou un middleware Express
app.use(express.static(path.join(__dirname, '..', 'frontend', 'public'), { maxAge: '1h', etag: true }));
// Définit une route ou un middleware Express
app.use(sessionMiddleware);
// Définit une route ou un middleware Express
app.use(flash());
// Définit une route ou un middleware Express
app.use(csrfProtection);
// Définit une route ou un middleware Express
app.use((req, res, next) => {
  // Exécute une instruction
  res.locals.user = req.session?.user || null;
  // Exécute une instruction
  res.locals.currentPath = req.path;
  // Exécute une instruction
  res.locals.icon = icon;
  // Exécute une instruction
  res.locals.escapeHtml = escapeHtml;
  // Exécute une instruction
  res.locals.formatDate = formatDate;
  // Exécute une instruction
  res.locals.formatBytes = formatBytes;
  // Exécute une instruction
  next();
// Ferme un bloc/appel de fonction
});

// Définit une route ou un middleware Express
app.use(require('./routes/systemRoutes'));
// Définit une route ou un middleware Express
app.use(require('./routes/authRoutes'));
// Définit une route ou un middleware Express
app.use('/etudiant', require('./routes/studentRoutes'));
// Définit une route ou un middleware Express
app.use('/agent', require('./routes/agentRoutes'));
// Définit une route ou un middleware Express
app.use('/admin', require('./routes/adminRoutes'));

// Définit une route ou un middleware Express
app.use(notFoundHandler);
// Définit une route ou un middleware Express
app.use(errorHandler);

// Exporte des fonctions/objets du module
module.exports = app;
