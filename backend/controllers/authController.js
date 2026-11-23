// Active le mode strict JavaScript pour détecter plus d’erreurs
'use strict';

// Importe une dépendance via require
const authService = require('../services/authService');
// Importe une dépendance via require
const { renderPage } = require('../utils/render');
// Importe une dépendance via require
const { respondWithError } = require('../utils/http');
// Importe une dépendance via require
const { currentAcademicYear } = require('../utils/helpers');
// Importe une dépendance via require
const { FILIERES, NIVEAUX } = require('../config/academic');

// Déclare une fonction
function regenerateSession(req) {
  // Retourne une valeur ou termine la fonction
  return new Promise((resolve, reject) => {
    // Exécute une instruction
    req.session.regenerate((error) => (error ? reject(error) : resolve()));
  // Ferme un bloc/appel de fonction
  });
// Ferme un bloc, objet ou appel
}

// Déclare une fonction
function saveSession(req) {
  // Retourne une valeur ou termine la fonction
  return new Promise((resolve, reject) => {
    // Exécute une instruction
    req.session.save((error) => (error ? reject(error) : resolve()));
  // Ferme un bloc/appel de fonction
  });
// Ferme un bloc, objet ou appel
}

// Déclare une fonction
function destroySession(req) {
  // Retourne une valeur ou termine la fonction
  return new Promise((resolve, reject) => {
    // Exécute une instruction
    req.session.destroy((error) => (error ? reject(error) : resolve()));
  // Ferme un bloc/appel de fonction
  });
// Ferme un bloc, objet ou appel
}

// Déclare une fonction
function showLogin(req, res) {
  // Retourne une valeur ou termine la fonction
  return renderPage(res, 'auth/login', { title: 'Connexion', email: '' });
// Ferme un bloc, objet ou appel
}

// Déclare une fonction
async function login(req, res, next) {
  // Début d’un bloc avec gestion d’erreur
  try {
    // Déclare une variable
    const result = await authService.authenticate(req.body.email, req.body.password);
    // Condition: exécute le bloc si la condition est vraie
    if (!result) {
      // Condition: exécute le bloc si la condition est vraie
      if (String(req.get('accept') || '').includes('application/json')) {
        // Retourne une valeur ou termine la fonction
        return res.status(401).json({ error: 'Identifiants invalides ou compte désactivé.' });
      // Ferme un bloc, objet ou appel
      }
      // Exécute une instruction
      req.flash('error', 'Identifiants invalides ou compte désactivé.');
      // Retourne une valeur ou termine la fonction
      return res.status(401).render('auth/login', {
        // Exécute une instruction
        user: null,
        // Exécute une instruction
        csrfToken: req.csrfToken(),
        // Exécute une instruction
        flash: { success: [], error: [], info: [] },
        // Exécute une instruction
        title: 'Connexion',
        // Exécute une instruction
        email: req.body.email || '',
      // Ferme un bloc/appel de fonction
      });
    // Ferme un bloc, objet ou appel
    }

    // Attend le résultat d’une opération asynchrone
    await regenerateSession(req);
    // Exécute une instruction
    req.session.user = {
      // Exécute une instruction
      id: result.user.id,
      // Exécute une instruction
      role: result.role,
      // Exécute une instruction
      nom: result.user.nom,
      // Exécute une instruction
      prenom: result.user.prenom,
      // Exécute une instruction
      email: result.user.email,
    // Ferme un bloc, objet ou appel
    };
    // Attend le résultat d’une opération asynchrone
    await saveSession(req);
    // Exécute une instruction
    req.flash('success', `Bienvenue ${result.user.prenom} ${result.user.nom}.`);
    // Retourne une valeur ou termine la fonction
    return res.redirect('/dashboard');
  // Ferme un bloc ou objet
  } catch (error) {
    // Retourne une valeur ou termine la fonction
    return next(error);
  // Ferme un bloc, objet ou appel
  }
// Ferme un bloc, objet ou appel
}

// Déclare une fonction
function showRegister(req, res) {
  // Retourne une valeur ou termine la fonction
  return renderPage(res, 'auth/register', {
    // Exécute une instruction
    title: 'Créer un compte étudiant',
    // Exécute une instruction
    values: { anneeUniversitaire: currentAcademicYear() },
    // Exécute une instruction
    filieres: FILIERES,
    // Exécute une instruction
    niveaux: NIVEAUX,
  // Ferme un bloc/appel de fonction
  });
// Ferme un bloc, objet ou appel
}

// Déclare une fonction
async function register(req, res, next) {
  // Début d’un bloc avec gestion d’erreur
  try {
    // Attend le résultat d’une opération asynchrone
    await authService.registerStudent(req.body);
    // Exécute une instruction
    req.flash('success', 'Votre compte a été créé. Vous pouvez vous connecter.');
    // Retourne une valeur ou termine la fonction
    return res.redirect('/login');
  // Ferme un bloc ou objet
  } catch (error) {
    // Condition: exécute le bloc si la condition est vraie
    if (error.name === 'AppError') {
      // Condition: exécute le bloc si la condition est vraie
      if (String(req.get('accept') || '').includes('application/json')) {
        // Retourne une valeur ou termine la fonction
        return res.status(error.status).json({ error: error.message, code: error.code });
      // Ferme un bloc, objet ou appel
      }
      // Retourne une valeur ou termine la fonction
      return res.status(error.status).render('auth/register', {
        // Exécute une instruction
        user: null,
        // Exécute une instruction
        csrfToken: req.csrfToken(),
        // Exécute une instruction
        flash: { success: [], error: [{ message: error.message }], info: [] },
        // Exécute une instruction
        title: 'Créer un compte étudiant',
        // Exécute une instruction
        values: { ...req.body, password: '' },
        // Exécute une instruction
        filieres: FILIERES,
        // Exécute une instruction
        niveaux: NIVEAUX,
      // Ferme un bloc/appel de fonction
      });
    // Ferme un bloc, objet ou appel
    }
    // Retourne une valeur ou termine la fonction
    return next(error);
  // Ferme un bloc, objet ou appel
  }
// Ferme un bloc, objet ou appel
}

// Déclare une fonction
async function logout(req, res, next) {
  // Début d’un bloc avec gestion d’erreur
  try {
    // Attend le résultat d’une opération asynchrone
    await destroySession(req);
    // Retourne une valeur ou termine la fonction
    return res.redirect('/login');
  // Ferme un bloc ou objet
  } catch (error) {
    // Retourne une valeur ou termine la fonction
    return next(error);
  // Ferme un bloc, objet ou appel
  }
// Ferme un bloc, objet ou appel
}

// Déclare une fonction
function dashboard(req, res) {
  // Déclare une variable
  const role = req.session.user.role;
  // Condition: exécute le bloc si la condition est vraie
  if (role === 'ETUDIANT') return res.redirect('/etudiant/tableau-de-bord');
  // Condition: exécute le bloc si la condition est vraie
  if (role === 'AGENT') return res.redirect('/agent/tableau-de-bord');
  // Retourne une valeur ou termine la fonction
  return res.redirect('/admin/tableau-de-bord');
// Ferme un bloc, objet ou appel
}

// Déclare une fonction
function accessDenied(req, res) {
  // Retourne une valeur ou termine la fonction
  return renderPage(res, 'errors/403', { title: 'Accès refusé' });
// Ferme un bloc, objet ou appel
}

// Exporte des fonctions/objets du module
module.exports = {
  // Exécute une instruction
  showLogin,
  // Exécute une instruction
  login,
  // Exécute une instruction
  showRegister,
  // Exécute une instruction
  register,
  // Exécute une instruction
  logout,
  // Exécute une instruction
  dashboard,
  // Exécute une instruction
  accessDenied,
// Ferme un bloc, objet ou appel
};
